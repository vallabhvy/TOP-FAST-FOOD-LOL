-- Enable Realtime for all tables
-- This ensures that frontend subscriptions via supabase.channel() actually receive events

-- First, ensure the tables exist in the publication
BEGIN;
    -- Try to add brands
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brands') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE brands;
        END IF;
    END $$;

    -- Try to add transactions
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'transactions') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
        END IF;
    END $$;

    -- Try to add replies
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'replies') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE replies;
        END IF;
    END $$;
COMMIT;
