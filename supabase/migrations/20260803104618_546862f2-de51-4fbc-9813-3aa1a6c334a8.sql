CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  period INTEGER NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage their own classes" ON public.classes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.resource_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resource_links TO authenticated;
GRANT ALL ON public.resource_links TO service_role;
ALTER TABLE public.resource_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage their own links" ON public.resource_links FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_classes_user ON public.classes(user_id, period);
CREATE INDEX idx_links_class ON public.resource_links(class_id);

CREATE OR REPLACE FUNCTION public.seed_starter_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  cid UUID;
  rec RECORD;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.classes WHERE user_id = uid) THEN
    RETURN;
  END IF;

  FOR rec IN
    SELECT * FROM (VALUES
      (1, 'AP European History', 'Ms. Karen Whitfield', 'k.whitfield@northridgehs.edu', 'Room 212'),
      (2, 'Pre-Calculus', 'Mr. Daniel Okafor', 'd.okafor@northridgehs.edu', 'Room 108'),
      (3, 'Biology', 'Dr. Aisha Ramesh', 'a.ramesh@northridgehs.edu', 'Lab 3'),
      (4, 'English Literature', 'Mrs. Elena Vasquez', 'e.vasquez@northridgehs.edu', 'Room 305'),
      (5, 'Computer Science', 'Mr. Jonas Lindqvist', 'j.lindqvist@northridgehs.edu', 'Room 141'),
      (6, 'Art & Design', 'Ms. Priya Chandra', 'p.chandra@northridgehs.edu', 'Studio B')
    ) AS t(period, subject, teacher, teacher_email, room)
  LOOP
    INSERT INTO public.classes (user_id, period, subject, teacher, teacher_email, room)
    VALUES (uid, rec.period, rec.subject, rec.teacher, rec.teacher_email, rec.room)
    RETURNING id INTO cid;

    IF rec.period = 1 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Unit 4 Notes Folder', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Revolutions Flashcards', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'AP Euro Course Guide', 'https://apstudents.collegeboard.org/courses/ap-european-history', 'Syllabus');
    ELSIF rec.period = 2 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Khan Academy Trig Unit', 'https://www.khanacademy.org/math/trigonometry', 'Other'),
        (uid, cid, 'Homework Portal', 'https://www.instructure.com/canvas', 'Canvas'),
        (uid, cid, 'Identities Flashcards', 'https://quizlet.com', 'Quizlet');
    ELSIF rec.period = 3 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Cell Division Lab Report', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Genetics Practice Set', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'Biology Interactives', 'https://learn.genetics.utah.edu', 'Other');
    ELSIF rec.period = 4 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Hamlet Annotations', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Essay Rubric & Syllabus', 'https://owl.purdue.edu/owl/general_writing/index.html', 'Syllabus'),
        (uid, cid, 'Discussion Board', 'https://www.instructure.com/canvas', 'Canvas');
    ELSIF rec.period = 5 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Class GitHub Repo', 'https://github.com', 'Other'),
        (uid, cid, 'Python Docs', 'https://docs.python.org/3/', 'Other'),
        (uid, cid, 'Project Submissions', 'https://www.instructure.com/canvas', 'Canvas');
    ELSE
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Portfolio Drive', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Color Theory Reference', 'https://color.adobe.com', 'Other'),
        (uid, cid, 'Studio Syllabus', 'https://www.moma.org/learn', 'Syllabus');
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_starter_schedule() TO authenticated;