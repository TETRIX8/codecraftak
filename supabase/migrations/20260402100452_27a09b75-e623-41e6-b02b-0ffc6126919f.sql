ALTER TABLE public.point_transactions DROP CONSTRAINT IF EXISTS point_transactions_transaction_type_check;

ALTER TABLE public.point_transactions
ADD CONSTRAINT point_transactions_transaction_type_check
CHECK (
  transaction_type = ANY (
    ARRAY[
      'game_bet'::text,
      'game_win'::text,
      'game_refund'::text,
      'review_reward'::text,
      'review_penalty'::text,
      'admin_adjustment'::text,
      'badge_reward'::text
    ]
  )
);