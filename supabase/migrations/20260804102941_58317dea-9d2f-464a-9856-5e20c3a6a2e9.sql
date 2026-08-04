DELETE FROM public.resource_links
WHERE title IN (
  'Unit 4 Notes Folder','Revolutions Flashcards','AP Euro Course Guide',
  'Khan Academy Trig Unit','Identities Flashcards',
  'Genetics Practice Set','Biology Interactives','Cell Division Lab Report',
  'Hamlet Annotations','Essay Rubric & Syllabus','Discussion Board',
  'Color Theory Reference','Studio Syllabus','Portfolio Drive',
  'Homework Portal','Project Submissions'
);

INSERT INTO public.resource_links (user_id, class_id, title, url, category)
SELECT c.user_id, c.id, t.title, t.url, t.category
FROM public.classes c
JOIN (VALUES
  (1, 'Language Notes Folder', 'https://drive.google.com', 'Google Drive'),
  (1, 'Vocabulary Flashcards', 'https://quizlet.com', 'Quizlet'),
  (1, 'Grammar Workbook', 'https://www.instructure.com/canvas', 'Canvas'),
  (2, 'Khan Academy Algebra', 'https://www.khanacademy.org/math/algebra', 'Other'),
  (2, 'Maths Homework Portal', 'https://www.instructure.com/canvas', 'Canvas'),
  (2, 'Formula Flashcards', 'https://quizlet.com', 'Quizlet'),
  (3, 'Lab Records Folder', 'https://drive.google.com', 'Google Drive'),
  (3, 'Physics & Chem Practice', 'https://quizlet.com', 'Quizlet'),
  (3, 'Science Simulations', 'https://phet.colorado.edu', 'Other'),
  (4, 'Map Work Folder', 'https://drive.google.com', 'Google Drive'),
  (4, 'History Timeline Cards', 'https://quizlet.com', 'Quizlet'),
  (4, 'Civics Course Syllabus', 'https://drive.google.com', 'Syllabus'),
  (5, 'Class GitHub Repo', 'https://github.com', 'Other'),
  (5, 'Python Docs', 'https://docs.python.org/3/', 'Other'),
  (5, 'Coding Project Submissions', 'https://www.instructure.com/canvas', 'Canvas'),
  (6, 'Essay Drafts Folder', 'https://drive.google.com', 'Google Drive'),
  (6, 'Literature Flashcards', 'https://quizlet.com', 'Quizlet'),
  (6, 'Writing Guide', 'https://owl.purdue.edu/owl/general_writing/index.html', 'Syllabus')
) AS t(period, title, url, category) ON t.period = c.period
WHERE NOT EXISTS (
  SELECT 1 FROM public.resource_links r
  WHERE r.class_id = c.id AND r.title = t.title
);