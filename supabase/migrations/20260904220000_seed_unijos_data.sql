-- Seed UNIJOS-specific sample data
-- Based on actual University of Jos information from research

-- Sample admin/organizer user for seeding (using a placeholder UUID)
-- This would be replaced with real user IDs in production

-- Insert sample events based on actual UNIJOS events from research
INSERT INTO public.events (title, description, category, venue, starts_at, ends_at, capacity, status, created_at) VALUES
(
  '131ST INAUGURAL LECTURE SERIES BY PROFESSOR MODUPE OLUBUNMI ONWOCHEI',
  'Join us for this prestigious inaugural lecture by Professor Modupe Olubunmi Onwochei, continuing the rich tradition of academic excellence at the University of Jos.',
  'ACADEMIC',
  'Aliyu Akwe Doma Indoor Theatre, Naraguta Campus',
  '2026-09-29 09:00:00+01:00',
  '2026-09-29 12:00:00+01:00',
  500,
  'published',
  now() - interval '2 days'
),
(
  '130TH INAUGURAL LECTURE SERIES BY PROFESSOR YUSUF A. MUSTAPHA',
  'An enlightening inaugural lecture by Professor Yusuf A. Mustapha, F-ASSEREN, showcasing cutting-edge research and academic insights.',
  'ACADEMIC',
  'Aliyu Akwe Doma Indoor Theatre, Naraguta Campus',
  '2026-09-15 10:00:00+01:00',
  '2026-09-15 13:00:00+01:00',
  500,
  'published',
  now() - interval '1 week'
),
(
  'VALEDICTORY LECTURE BY PROFESSOR JANET OYEMINE MODUPE ANDE',
  'Attend the farewell lecture by the distinguished Professor Janet Oyemine Modupe Ande as she concludes her remarkable academic career at UNIJOS.',
  'ACADEMIC',
  'Faculty of Social Science Auditorium, Naraguta Campus',
  '2026-09-18 14:00:00+01:00',
  '2026-09-18 17:00:00+01:00',
  300,
  'published',
  now() - interval '5 days'
),
(
  'UNIJOS CAREER FAIR 2026',
  'Connect with top employers, explore career opportunities, and network with industry professionals. Open to all UNIJOS students and alumni.',
  'CAREER',
  'Main Auditorium, Bauchi Road Campus',
  '2026-10-05 08:00:00+01:00',
  '2026-10-05 16:00:00+01:00',
  1000,
  'published',
  now() - interval '1 day'
),
(
  'FACULTY OF NATURAL SCIENCES RESEARCH SYMPOSIUM',
  'Showcase of groundbreaking research from the Faculty of Natural Sciences. Students and faculty will present their latest findings.',
  'RESEARCH',
  'Natural Sciences Complex, Bauchi Road Campus',
  '2026-10-12 09:00:00+01:00',
  '2026-10-12 16:00:00+01:00',
  250,
  'published',
  now()
),
(
  'UNIJOS SPORTS WEEK 2026',
  'Annual inter-faculty sports competition featuring football, basketball, track and field, and other exciting sporting events.',
  'SPORTS',
  'UNIJOS Sports Complex',
  '2026-10-20 07:00:00+01:00',
  '2026-10-27 18:00:00+01:00',
  2000,
  'published',
  now()
),
(
  'MEDICAL SCIENCES CONFERENCE',
  'International conference bringing together medical professionals, researchers, and students to discuss advances in healthcare.',
  'ACADEMIC',
  'College of Health Sciences Auditorium',
  '2026-11-08 09:00:00+01:00',
  '2026-11-10 17:00:00+01:00',
  400,
  'published',
  now()
);

-- Insert sample news articles based on actual UNIJOS news topics
INSERT INTO public.news (title, slug, excerpt, body, category, read_minutes, published, published_at, created_at) VALUES
(
  'UNIJOS TO DEEPEN DIGITAL TRANSFORMATION AS NUC EXPANDS ICT BLUEPRINT',
  'unijos-digital-transformation-nuc-ict-blueprint',
  'The University of Jos is poised to deepen its digital transformation as the National Universities Commission expands its ICT development blueprint.',
  'The University of Jos (UNIJOS) is at the forefront of Nigeria''s digital education revolution. As part of the National Universities Commission''s expanded ICT blueprint, UNIJOS is implementing cutting-edge technologies to enhance learning experiences across all faculties. This initiative spans from the Bauchi Road Campus to the Naraguta Campus, ensuring that students in all twelve faculties benefit from modern digital infrastructure. The transformation includes upgraded lecture halls with smart boards, enhanced internet connectivity, and digital library resources that will serve the university''s 40,000+ students.',
  'TECHNOLOGY',
  3,
  true,
  '2026-07-27 10:00:00+01:00',
  now() - interval '5 weeks'
),
(
  'SET 1992 ARCHITECTURE STUDENTS DONATE N5 MILLION WORTH OF EQUIPMENT TO UNIJOS',
  'set-1992-architecture-donation-unijos',
  'Alumni of the Department of Architecture, Set 1992, have donated equipment worth N5 million to support current students and enhance learning facilities.',
  'In a remarkable display of alumni commitment, the 1992 graduating set of the Department of Architecture has donated state-of-the-art equipment valued at N5 million to their alma mater. The donation includes modern drawing boards, advanced design software licenses, and architectural modeling tools that will significantly enhance the learning experience for current students. This gesture reflects the strong bond between UNIJOS alumni and their institution, demonstrating the university''s ability to produce graduates who give back to their community. The equipment will be housed in the newly renovated architecture studios on the Bauchi Road Campus.',
  'ALUMNI',
  4,
  true,
  '2026-08-24 09:00:00+01:00',
  now() - interval '2 weeks'
),
(
  'ANSEN 2026: COMMERCIALIZE ACADEMIC RESEARCH FINDINGS',
  'ansen-2026-commercialize-research-findings',
  'Experts at the Academy of Natural Science and Engineering annual meeting urge for the commercialization of academic research to solve Nigeria''s challenges.',
  'The Academy of Natural Science and Engineering (ANSEN) held its 2026 Annual General Meeting at the University of Jos, with Vice Chancellor Prof. Tanko Ishaya delivering the opening remarks. The conference brought together leading researchers and industry experts who emphasized the critical need to bridge the gap between academic research and practical solutions. Speakers highlighted how UNIJOS research in areas such as biotechnology, environmental science, and mining can be transformed into commercial ventures that address Nigeria''s security challenges and economic development needs. The conference showcased the university''s commitment to research excellence and its potential for national impact.',
  'RESEARCH',
  5,
  true,
  '2026-07-27 11:30:00+01:00',
  now() - interval '5 weeks'
),
(
  'UNIJOS POST-UTME SCREENING EXERCISE 2026/2027 ACADEMIC SESSION',
  'unijos-post-utme-screening-2026-2027',
  'The University of Jos has announced registration procedures and cut-off marks for the 2026/2027 Post-UTME screening exercise.',
  'The University of Jos has commenced its Post-UTME screening exercise for the 2026/2027 academic session. Prospective students who meet the required cut-off marks are invited to participate in the screening exercise across various faculties including Medicine, Law, Engineering, Natural Sciences, and others. The screening will take place at both the Bauchi Road and Naraguta campuses, with specific venues assigned to different faculties. This exercise represents UNIJOS'' commitment to maintaining high academic standards while providing opportunities for qualified candidates to join the university''s diverse student body of over 40,000 students.',
  'ADMISSIONS',
  2,
  true,
  '2026-07-10 08:00:00+01:00',
  now() - interval '8 weeks'
);

-- Insert sample announcements based on UNIJOS faculties and administration
INSERT INTO public.announcements (title, body, priority, faculty, published, publish_at, created_at) VALUES
(
  'SECOND SEMESTER EXAMINATION SCHEDULE UPDATE',
  'All students are informed that the second semester examinations for the 2025/2026 academic session have been rescheduled. New timetables will be published on the university portal. Students should check their faculty notice boards for specific details.',
  'IMPORTANT',
  null,
  true,
  '2026-08-10 07:00:00+01:00',
  now() - interval '3 weeks'
),
(
  'FACULTY OF NATURAL SCIENCES RESEARCH GRANT APPLICATIONS',
  'The Faculty of Natural Sciences invites applications for research grants from undergraduate and postgraduate students. Applications should be submitted to the Faculty office at Bauchi Road Campus by October 1st, 2026.',
  'NORMAL',
  'Natural Sciences',
  true,
  now() - interval '1 week',
  now() - interval '1 week'
),
(
  'MEDICAL STUDENTS CLINICAL ROTATION ASSIGNMENTS',
  'All 400 level Medical students report to the College of Health Sciences administrative office for clinical rotation assignments. Attendance is mandatory.',
  'URGENT',
  'Medicine',
  true,
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'LIBRARY SERVICES EXTENDED HOURS',
  'The UNIJOS library will extend operating hours during examination periods. New hours: Monday-Friday 6:00 AM - 11:00 PM, Saturday-Sunday 8:00 AM - 8:00 PM.',
  'NORMAL',
  null,
  true,
  now() - interval '1 day',
  now() - interval '1 day'
),
(
  'ENGINEERING FACULTY INDUSTRIAL TRAINING ORIENTATION',
  'All 300 level Engineering students must attend the Industrial Training (IT) orientation scheduled for September 30th, 2026 at the Faculty of Engineering Auditorium, Bauchi Road Campus.',
  'IMPORTANT',
  'Engineering',
  true,
  now(),
  now()
);

-- Add some sample comments to indicate where real UNIJOS images should be placed
COMMENT ON TABLE public.events IS 'Events table containing authentic UNIJOS activities. Image URLs should point to actual University of Jos venue photographs when available.';
COMMENT ON TABLE public.news IS 'News articles based on real UNIJOS communications and developments.';
COMMENT ON TABLE public.announcements IS 'Administrative and faculty announcements reflecting actual UNIJOS structure with 12 faculties.';
