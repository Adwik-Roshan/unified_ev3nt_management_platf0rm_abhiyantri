import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const INITIAL_ANNOUNCEMENTS = [
  { id: '1', title: 'Welcome to Abhiyantri Hackathon!', content: 'Registration is now open. Hackathon starts soon.', created_at: new Date().toISOString() },
];

const INITIAL_TEAMS = [
  { id: '1', name: 'Team Alpha', looking_for_members: true, members_count: 1 },
  { id: '2', name: 'Team Beta', looking_for_members: false, members_count: 3 },
];

const INITIAL_SUBMISSIONS = [
  { id: '1', team_id: '1', project_name: 'Smart City App', description: 'An app to optimize traffic flow using AI.' },
  { id: '2', team_id: '2', project_name: 'Eco-Tracker', description: 'Tracks personal carbon footprint using IoT sensors.' },
];

export const useStore = create((set, get) => ({
  user: null,
  loading: false,

  // Initialize session and listeners
  initSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({
          user: profile || { id: session.user.id, email: session.user.email, role: 'participant', name: session.user.email.split('@')[0] }
        });
      }
    } catch (e) {
      console.log('Session init fallback:', e.message);
    }
  },

  login: async (email, role, password = 'password123') => {
    set({ loading: true });
    try {
      // 1. Try real Supabase SignIn
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      // If user doesn't exist, auto signup for convenience
      if (error && error.message.includes('Invalid login credentials')) {
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: email.split('@')[0], role }
          }
        });
        data = signUpRes.data;
        error = signUpRes.error;
      }

      if (!error && data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: profile || { id: data.user.id, email, role, name: email.split('@')[0] },
          loading: false
        });
        return;
      }
    } catch (err) {
      console.warn('Supabase Auth error, using local state:', err);
    }

    // Local fallback for offline/development testing
    const mockUser = { id: Math.random().toString(), email, role, name: email.split('@')[0] };
    set({ user: mockUser, loading: false });
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Signout error:', e.message);
    }
    set({ user: null });
  },

  // Database collections
  announcements: INITIAL_ANNOUNCEMENTS,
  teams: INITIAL_TEAMS,
  submissions: INITIAL_SUBMISSIONS,
  scores: [],

  // Realtime Subscriptions Setup
  subscribeRealtime: () => {
    try {
      // Fetch initial announcements
      supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        if (data && data.length > 0) set({ announcements: data });
      });

      // Fetch initial scores
      supabase.from('scores').select('*').then(({ data }) => {
        if (data && data.length > 0) set({ scores: data });
      });

      // Listen for Live Announcements
      const channelAnnouncements = supabase
        .channel('announcements_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
          set(state => ({ announcements: [payload.new, ...state.announcements] }));
        })
        .subscribe();

      // Listen for Live Scores
      const channelScores = supabase
        .channel('scores_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, payload => {
          set(state => ({ scores: [...state.scores, payload.new] }));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channelAnnouncements);
        supabase.removeChannel(channelScores);
      };
    } catch (e) {
      console.log('Realtime setup warning:', e.message);
    }
  },

  addAnnouncement: async (title, content) => {
    const newAnn = { id: Math.random().toString(), title, content, created_at: new Date().toISOString() };
    set(state => ({ announcements: [newAnn, ...state.announcements] }));

    try {
      await supabase.from('announcements').insert([{ title, content }]);
    } catch (e) {
      console.log('Supabase insert announcement error:', e.message);
    }
  },

  addScore: async (submission_id, score, feedback) => {
    const user = get().user;
    const newScore = { id: Math.random().toString(), submission_id, judge_id: user?.id, score, feedback };
    set(state => ({ scores: [...state.scores, newScore] }));

    try {
      await supabase.from('scores').insert([{ submission_id, judge_id: user?.id, score: Number(score), feedback }]);
    } catch (e) {
      console.log('Supabase insert score error:', e.message);
    }
  }
}));
