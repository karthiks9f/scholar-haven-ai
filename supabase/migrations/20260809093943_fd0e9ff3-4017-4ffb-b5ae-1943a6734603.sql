CREATE TABLE public.revision_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  topic TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  grade TEXT NOT NULL DEFAULT '9th Grade',
  content TEXT NOT NULL DEFAULT '',
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.revision_sheets TO authenticated;
GRANT ALL ON public.revision_sheets TO service_role;

ALTER TABLE public.revision_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage their own revision sheets"
  ON public.revision_sheets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER revision_sheets_touch
  BEFORE UPDATE ON public.revision_sheets
  FOR EACH ROW EXECUTE FUNCTION public.touch_student_profile();

CREATE INDEX revision_sheets_user_created_idx ON public.revision_sheets (user_id, created_at DESC);