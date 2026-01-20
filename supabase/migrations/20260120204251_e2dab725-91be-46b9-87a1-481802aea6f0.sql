-- Allow non-participant users to join a waiting game by claiming the opponent slot
-- This fixes the current RLS deadlock where opponent_id is NULL, so the invited user can't UPDATE the game.

DO $$
BEGIN
  -- Ensure RLS is enabled (safe if already enabled)
  EXECUTE 'ALTER TABLE public.games ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN undefined_table THEN
    -- Table must already exist in this project; if not, do nothing.
    NULL;
END $$;

-- Recreate policy idempotently
DROP POLICY IF EXISTS "Users can join waiting games" ON public.games;

CREATE POLICY "Users can join waiting games"
ON public.games
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND status = 'waiting'
  AND opponent_id IS NULL
  AND creator_id <> auth.uid()
)
WITH CHECK (
  status = 'playing'
  AND opponent_id = auth.uid()
  AND winner_id IS NULL
);
