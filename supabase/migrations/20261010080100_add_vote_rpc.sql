-- Add a secure RPC function to handle voting atomically
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
                SET likes = likes + 1, dislikes = dislikes - 1
                WHERE id = p_transaction_id;
            ELSE
                UPDATE public.transactions
                SET likes = likes - 1, dislikes = dislikes + 1
                WHERE id = p_transaction_id;
            END IF;

            RETURN '{"status": "vote_changed"}';
        END IF;
    ELSE
        -- New vote
        INSERT INTO public.transaction_votes (transaction_id, ip_address, vote_type)
        VALUES (p_transaction_id, p_ip_address, p_vote_type);

        IF p_vote_type = 'LIKE' THEN
            UPDATE public.transactions
            SET likes = likes + 1
            WHERE id = p_transaction_id;
        ELSE
            UPDATE public.transactions
            SET dislikes = dislikes + 1
            WHERE id = p_transaction_id;
        END IF;

        RETURN '{"status": "vote_added"}';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
