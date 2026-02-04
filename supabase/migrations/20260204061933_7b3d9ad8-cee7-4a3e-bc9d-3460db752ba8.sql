-- Allow creating additional game types in public.games
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.games'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%game_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.games DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.games
  ADD CONSTRAINT games_game_type_check
  CHECK (game_type IN (
    'tic-tac-toe',
    'rock-paper-scissors',
    'battleship',
    'russian-roulette',
    'quiz'
  ));
