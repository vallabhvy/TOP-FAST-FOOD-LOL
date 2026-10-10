-- Migration to add voting (likes/dislikes) to transactions

-- Add likes/dislikes columns to existing transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislikes INT DEFAULT 0;

-- Create a table to track IP-based voting securely
CREATE TABLE IF NOT EXISTS public.transaction_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transaction_id, ip_address)
);

-- Enable RLS on the new table
ALTER TABLE public.transaction_votes ENABLE ROW LEVEL SECURITY;

-- No public policies needed. We use the Service Role Key in the Next.js API route to enforce logic securely.
