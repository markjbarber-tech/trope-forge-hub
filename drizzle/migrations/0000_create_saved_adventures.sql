CREATE TABLE public.saved_adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  title text NOT NULL,
  elements jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_path text NOT NULL,
  delete_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.saved_adventures TO service_role;
ALTER TABLE public.saved_adventures ENABLE ROW LEVEL SECURITY;