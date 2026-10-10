-- Create replies table for threaded comments
CREATE TABLE IF NOT EXISTS public.replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    author_handle TEXT NOT NULL,
    author_avatar TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access on replies" ON public.replies FOR SELECT USING (true);

-- Allow authenticated users to insert replies
CREATE POLICY "Authenticated users can insert replies" ON public.replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
