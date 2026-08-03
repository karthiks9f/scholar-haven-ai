CREATE OR REPLACE FUNCTION public.seed_starter_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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

REVOKE ALL ON FUNCTION public.seed_starter_schedule() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_starter_schedule() FROM anon;
GRANT EXECUTE ON FUNCTION public.seed_starter_schedule() TO authenticated;