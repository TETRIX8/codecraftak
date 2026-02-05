-- Add nickname change tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_nickname_change timestamp with time zone DEFAULT NULL;

-- Add daily games count tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_games_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_game_date date DEFAULT NULL;

-- Create a point_transactions table for audit trail and preventing manipulation
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount integer NOT NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('game_bet', 'game_win', 'game_refund', 'review_reward', 'review_penalty', 'admin_adjustment')),
    reference_id uuid DEFAULT NULL, -- game_id or solution_id
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    description text
);

-- Enable RLS on point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.point_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only system can insert transactions (via edge functions/triggers)
CREATE POLICY "System can insert transactions"
ON public.point_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.point_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log point changes
CREATE OR REPLACE FUNCTION public.log_point_transaction(
    _user_id uuid,
    _amount integer,
    _type text,
    _reference_id uuid DEFAULT NULL,
    _description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _balance_before integer;
    _balance_after integer;
BEGIN
    -- Get current balance
    SELECT review_balance INTO _balance_before
    FROM profiles WHERE id = _user_id;
    
    _balance_after := COALESCE(_balance_before, 0) + _amount;
    
    -- Log transaction
    INSERT INTO point_transactions (user_id, amount, transaction_type, reference_id, balance_before, balance_after, description)
    VALUES (_user_id, _amount, _type, _reference_id, COALESCE(_balance_before, 0), _balance_after, _description);
    
    -- Update balance
    UPDATE profiles SET review_balance = _balance_after WHERE id = _user_id;
END;
$$;

-- Create function to validate and deduct game bet
CREATE OR REPLACE FUNCTION public.deduct_game_bet(
    _user_id uuid,
    _bet_amount integer,
    _game_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _current_balance integer;
    _daily_count integer;
    _last_date date;
BEGIN
    -- Get current balance and daily count
    SELECT review_balance, daily_games_count, last_game_date 
    INTO _current_balance, _daily_count, _last_date
    FROM profiles WHERE id = _user_id FOR UPDATE;
    
    -- Check balance
    IF COALESCE(_current_balance, 0) < _bet_amount THEN
        RETURN false;
    END IF;
    
    -- Check/reset daily count
    IF _last_date IS NULL OR _last_date < CURRENT_DATE THEN
        _daily_count := 0;
    END IF;
    
    -- Check daily limit (5 games per day)
    IF _daily_count >= 5 THEN
        RETURN false;
    END IF;
    
    -- Log transaction
    PERFORM log_point_transaction(_user_id, -_bet_amount, 'game_bet', _game_id, 'Ставка на игру');
    
    -- Update daily count
    UPDATE profiles 
    SET daily_games_count = _daily_count + 1, 
        last_game_date = CURRENT_DATE 
    WHERE id = _user_id;
    
    RETURN true;
END;
$$;

-- Create function to award game winner
CREATE OR REPLACE FUNCTION public.award_game_winner(
    _winner_id uuid,
    _game_id uuid,
    _win_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM log_point_transaction(_winner_id, _win_amount, 'game_win', _game_id, 'Выигрыш в игре');
END;
$$;

-- Create function to refund game bet
CREATE OR REPLACE FUNCTION public.refund_game_bet(
    _user_id uuid,
    _game_id uuid,
    _bet_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM log_point_transaction(_user_id, _bet_amount, 'game_refund', _game_id, 'Возврат ставки');
END;
$$;