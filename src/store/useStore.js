import { create } from 'zustand';

// Initial Mock Data
const MOCK_USERS = [
  { id: '1', email: 'participant@test.com', role: 'participant', name: 'Alice (Participant)' },
  { id: '2', email: 'judge@test.com', role: 'judge', name: 'Bob (Judge)' },
  { id: '3', email: 'organizer@test.com', role: 'organizer', name: 'Charlie (Organizer)' },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: '1', title: 'Welcome to Abhiyantri Hackathon!', content: 'Registration is now open. Hackathon starts in 1 hour.', created_at: new Date().toISOString() },
];

const INITIAL_TEAMS = [
  { id: '1', name: 'Team Alpha', lookingForMembers: true, members: ['1'] },
  { id: '2', name: 'Team Beta', lookingForMembers: false, members: [] },
];

const INITIAL_SUBMISSIONS = [
  { id: '1', team_id: '1', project_name: 'Smart City App', description: 'An app to optimize traffic flow.' },
  { id: '2', team_id: '2', project_name: 'Eco-Tracker', description: 'Tracks carbon footprint using IoT.' },
];

export const useStore = create((set, get) => ({
  // Session State
  user: null,
  login: (email, role) => {
    // Simple mock login
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      set({ user: existingUser });
    } else {
      // Create new mock user on the fly
      const newUser = { id: Math.random().toString(), email, role, name: email.split('@')[0] };
      set({ user: newUser });
    }
  },
  logout: () => set({ user: null }),

  // Mock DB State
  announcements: INITIAL_ANNOUNCEMENTS,
  addAnnouncement: (title, content) => set((state) => ({
    announcements: [
      { id: Math.random().toString(), title, content, created_at: new Date().toISOString() },
      ...state.announcements
    ]
  })),

  teams: INITIAL_TEAMS,
  submissions: INITIAL_SUBMISSIONS,
  scores: [],

  addScore: (submission_id, score, feedback) => set((state) => ({
    scores: [
      ...state.scores,
      { id: Math.random().toString(), submission_id, judge_id: state.user?.id, score, feedback }
    ]
  }))
}));
