CREATE OR REPLACE FUNCTION vote_transaction(
    p_transaction_id TEXT,
    p_ip_address TEXT,
    p_vote_type TEXT
)
RETURNS JSON AS $$
DECLARE
    v_existing_vote TEXT;
BEGIN
    -- Check if vote exists
    SELECT vote_type INTO v_existing_vote
    FROM public.transaction_votes
    WHERE transaction_id = p_transaction_id AND ip_address = p_ip_address;

    IF FOUND THEN
        IF v_existing_vote = p_vote_type THEN
            -- Same vote, do nothing
            RETURN '{"status": "already_voted"}';
        ELSE
            -- Change vote
            UPDATE public.transaction_votes
            SET vote_type = p_vote_type
            WHERE transaction_id = p_transaction_id AND ip_address = p_ip_address;

            IF p_vote_type = 'LIKE' THEN
                UPDATE public.transactions
                SET likes = COALESCE(likes, 0) + 1, dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0)
                WHERE id = p_transaction_id::UUID;
            ELSE
                UPDATE public.transactions
                SET likes = GREATEST(COALESCE(likes, 0) - 1, 0), dislikes = COALESCE(dislikes, 0) + 1
                WHERE id = p_transaction_id::UUID;
            END IF;

            RETURN '{"status": "vote_changed"}';
        END IF;
    ELSE
        -- New vote
        INSERT INTO public.transaction_votes (transaction_id, ip_address, vote_type)
        VALUES (p_transaction_id, p_ip_address, p_vote_type);

        IF p_vote_type = 'LIKE' THEN
            UPDATE public.transactions
            SET likes = COALESCE(likes, 0) + 1
            WHERE id = p_transaction_id::UUID;
        ELSE
            UPDATE public.transactions
            SET dislikes = COALESCE(dislikes, 0) + 1
            WHERE id = p_transaction_id::UUID;
        END IF;

        RETURN '{"status": "vote_added"}';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
