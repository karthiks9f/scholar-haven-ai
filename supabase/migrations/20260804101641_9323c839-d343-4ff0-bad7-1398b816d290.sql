ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS second_language TEXT NOT NULL DEFAULT 'Kannada';

ALTER TABLE public.student_profiles
  DROP CONSTRAINT IF EXISTS student_profiles_second_language_check;
ALTER TABLE public.student_profiles
  ADD CONSTRAINT student_profiles_second_language_check
  CHECK (second_language IN ('Kannada', 'Sanskrit', 'Hindi'));

CREATE OR REPLACE FUNCTION public.seed_starter_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
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
      (1, '2nd Language', 'Mrs. Shobha Rao', 's.rao@vidyanagarhs.edu', 'Room 204'),
      (2, 'Mathematics', 'Mr. Daniel Okafor', 'd.okafor@vidyanagarhs.edu', 'Room 108'),
      (3, 'Science', 'Dr. Aisha Ramesh', 'a.ramesh@vidyanagarhs.edu', 'Lab 3'),
      (4, 'Social Science', 'Ms. Karen Whitfield', 'k.whitfield@vidyanagarhs.edu', 'Room 212'),
      (5, 'Computer Science', 'Mr. Jonas Lindqvist', 'j.lindqvist@vidyanagarhs.edu', 'Room 141'),
      (6, 'English', 'Mrs. Elena Vasquez', 'e.vasquez@vidyanagarhs.edu', 'Room 305')
    ) AS t(period, subject, teacher, teacher_email, room)
  LOOP
    INSERT INTO public.classes (user_id, period, subject, teacher, teacher_email, room)
    VALUES (uid, rec.period, rec.subject, rec.teacher, rec.teacher_email, rec.room)
    RETURNING id INTO cid;

    IF rec.period = 1 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Language Notes Folder', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Vocabulary Flashcards', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'Grammar Workbook', 'https://www.instructure.com/canvas', 'Canvas');
    ELSIF rec.period = 2 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Khan Academy Algebra', 'https://www.khanacademy.org/math/algebra', 'Other'),
        (uid, cid, 'Homework Portal', 'https://www.instructure.com/canvas', 'Canvas'),
        (uid, cid, 'Formula Flashcards', 'https://quizlet.com', 'Quizlet');
    ELSIF rec.period = 3 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Lab Records Folder', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Physics & Chem Practice', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'Science Simulations', 'https://phet.colorado.edu', 'Other');
    ELSIF rec.period = 4 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Map Work Folder', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'History Timeline Cards', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'Course Syllabus', 'https://drive.google.com', 'Syllabus');
    ELSIF rec.period = 5 THEN
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Class GitHub Repo', 'https://github.com', 'Other'),
        (uid, cid, 'Python Docs', 'https://docs.python.org/3/', 'Other'),
        (uid, cid, 'Project Submissions', 'https://www.instructure.com/canvas', 'Canvas');
    ELSE
      INSERT INTO public.resource_links (user_id, class_id, title, url, category) VALUES
        (uid, cid, 'Essay Drafts Folder', 'https://drive.google.com', 'Google Drive'),
        (uid, cid, 'Literature Flashcards', 'https://quizlet.com', 'Quizlet'),
        (uid, cid, 'Writing Guide', 'https://owl.purdue.edu/owl/general_writing/index.html', 'Syllabus');
    END IF;
  END LOOP;
END;
$fn$;

UPDATE public.classes SET subject = '2nd Language', teacher = 'Mrs. Shobha Rao', teacher_email = 's.rao@vidyanagarhs.edu', room = 'Room 204' WHERE period = 1;
UPDATE public.classes SET subject = 'Mathematics' WHERE period = 2;
UPDATE public.classes SET subject = 'Science' WHERE period = 3;
UPDATE public.classes SET subject = 'Social Science', teacher = 'Ms. Karen Whitfield', teacher_email = 'k.whitfield@vidyanagarhs.edu', room = 'Room 212' WHERE period = 4;
UPDATE public.classes SET subject = 'Computer Science' WHERE period = 5;
UPDATE public.classes SET subject = 'English', teacher = 'Mrs. Elena Vasquez', teacher_email = 'e.vasquez@vidyanagarhs.edu', room = 'Room 305' WHERE period = 6;