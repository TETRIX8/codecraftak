-- Fix log_point_transaction to skip review_balance update for badge_reward
CREATE OR REPLACE FUNCTION public.log_point_transaction(_user_id uuid, _amount integer, _type text, _reference_id uuid DEFAULT NULL::uuid, _description text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
    _balance_before integer;
    _balance_after integer;
BEGIN
    -- Get current balance
    SELECT review_balance INTO _balance_before
    FROM profiles WHERE id = _user_id;
    
    -- For badge rewards, don't modify review_balance
    IF _type = 'badge_reward' THEN
        _balance_after := COALESCE(_balance_before, 0);
    ELSE
        _balance_after := COALESCE(_balance_before, 0) + _amount;
    END IF;
    
    -- Log transaction
    INSERT INTO point_transactions (user_id, amount, transaction_type, reference_id, balance_before, balance_after, description)
    VALUES (_user_id, _amount, _type, _reference_id, COALESCE(_balance_before, 0), _balance_after, _description);
    
    -- Update balance only for non-badge transactions
    IF _type != 'badge_reward' THEN
        UPDATE profiles SET review_balance = _balance_after WHERE id = _user_id;
    END IF;
END;
$$;

-- Fix already incorrectly awarded badge points: subtract them from review_balance
UPDATE profiles p
SET review_balance = GREATEST(
    p.review_balance - COALESCE((
        SELECT SUM(pt.amount) 
        FROM point_transactions pt 
        WHERE pt.user_id = p.id AND pt.transaction_type = 'badge_reward'
    ), 0),
    0
)
WHERE EXISTS (
    SELECT 1 FROM point_transactions pt 
    WHERE pt.user_id = p.id AND pt.transaction_type = 'badge_reward'
);