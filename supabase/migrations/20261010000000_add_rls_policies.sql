-- 1. Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Attempt to enable RLS on comments if it exists (fails gracefully if not)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'comments') THEN
        EXECUTE 'ALTER TABLE comments ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- 2. Create Public Read Access Policies
CREATE POLICY "Public read access on brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access on transactions" ON transactions FOR SELECT USING (true);

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'comments') THEN
        EXECUTE 'CREATE POLICY "Public read access on comments" ON comments FOR SELECT USING (true)';
    END IF;
END $$;
