-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Stores user roles & profile data, linked to Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('participant', 'judge', 'organizer')) DEFAULT 'participant',
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. EVENTS TABLE
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  organizer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS TABLE (For Realtime Broadcasts)
CREATE TABLE public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAMS TABLE
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  looking_for_members BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEAM MEMBERS TABLE
CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_team TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 7. SUBMISSIONS TABLE
CREATE TABLE public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  repo_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCORES TABLE (Interactive Judging & Live Leaderboard)
CREATE TABLE public.scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, judge_id)
);

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- 10. BASIC RLS POLICIES (Allow Read Access to Authenticated Users)
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Public read scores" ON public.scores FOR SELECT USING (true);

-- Allow Insert / Update based on roles (organizer broadcast, judge score, etc.)
CREATE POLICY "Organizers manage announcements" ON public.announcements 
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'organizer'));

CREATE POLICY "Judges manage scores" ON public.scores 
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'judge'));

-- 11. ENABLE REALTIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
