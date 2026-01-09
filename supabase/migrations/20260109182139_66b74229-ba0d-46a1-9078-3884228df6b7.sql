-- Create function for updated_at if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create games table for multiplayer games
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL CHECK (game_type IN ('tic-tac-toe', 'quiz', 'rock-paper-scissors')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_state JSONB DEFAULT '{}',
  current_turn UUID,
  bet_amount INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Policies for games
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Participants can update games"
  ON public.games FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

CREATE POLICY "Creator can delete waiting games"
  ON public.games FOR DELETE
  USING (auth.uid() = creator_id AND status = 'waiting');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;

-- Create trigger for updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();