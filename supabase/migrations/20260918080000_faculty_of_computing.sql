-- ============================================================
-- Faculty of Computing — UNIJOS Campus News Seed Data
-- Adds computing-focused events, news, and announcements
-- ============================================================

-- ── EVENTS ──────────────────────────────────────────────────

INSERT INTO public.events (title, description, category, venue, starts_at, ends_at, capacity, status, created_at) VALUES

-- Tech / Computing core
(
  'FACULTY OF COMPUTING TECH & INNOVATION DAY 2026',
  'The premier annual showcase of student and faculty projects from the Faculty of Computing. Featuring live demos of final-year software projects, AI/ML prototypes, mobile apps, and cybersecurity research. Open to all UNIJOS students, industry professionals, and invited guests.',
  'TECH',
  'ICT Building Auditorium, Faculty of Computing, Bauchi Road Campus',
  now() + interval '4 days' + interval '10 hours',
  now() + interval '4 days' + interval '17 hours',
  400,
  'published',
  now() - interval '2 days'
),
(
  'NATIONAL HACKATHON — UNIJOS COMPUTING CHAPTER',
  'A 24-hour hackathon hosted by the Faculty of Computing. Students form teams of 2–4 and build solutions for real challenges in healthcare, agriculture, education, and urban mobility in Nigeria. Winners earn cash prizes and mentorship from industry sponsors.',
  'TECH',
  'Computer Science Labs Complex, Faculty of Computing, Bauchi Road Campus',
  now() + interval '10 days' + interval '8 hours',
  now() + interval '11 days' + interval '8 hours',
  200,
  'published',
  now() - interval '1 day'
),
(
  'CYBERSECURITY AWARENESS WORKSHOP — DIGITAL DEFENCE 101',
  'Faculty of Computing presents a practical cybersecurity workshop covering ethical hacking fundamentals, social engineering, phishing defence, and secure coding practices. Hands-on lab exercises included. Ideal for all CS and IT students.',
  'WORKSHOP',
  'Computer Lab 3, Faculty of Computing, Bauchi Road Campus',
  now() + interval '6 days' + interval '10 hours',
  now() + interval '6 days' + interval '14 hours',
  80,
  'published',
  now() - interval '3 days'
),
(
  'ARTIFICIAL INTELLIGENCE & MACHINE LEARNING SYMPOSIUM',
  'A full-day academic symposium bringing together researchers, postgraduate students, and industry practitioners to present and discuss advances in AI, deep learning, NLP, and computer vision. Keynote by Dr. Yusuf Haruna, Head of CS Department, UNIJOS.',
  'RESEARCH',
  'Faculty of Computing Seminar Room, Bauchi Road Campus',
  now() + interval '14 days' + interval '9 hours',
  now() + interval '14 days' + interval '16 hours',
  150,
  'published',
  now()
),
(
  'OPEN SOURCE SUMMIT — BUILD FOR NIGERIA',
  'A collaborative event celebrating open-source development. Students contribute to real open-source repositories, attend talks on Git workflows, Linux, and developer tools, and connect with maintainers of prominent African tech projects.',
  'TECH',
  'ICT Building, Room 201, Faculty of Computing, Bauchi Road Campus',
  now() + interval '18 days' + interval '10 hours',
  now() + interval '18 days' + interval '15 hours',
  120,
  'published',
  now()
),
(
  'WEB DEVELOPMENT BOOTCAMP — REACT & NODE.JS',
  'A 2-day intensive bootcamp for beginners and intermediate developers. Topics: modern JavaScript, React fundamentals, REST APIs with Node.js and Express, and deploying full-stack apps. Organised by the UNIJOS Computing Students Association (CSA).',
  'WORKSHOP',
  'Computer Lab 1 & 2, Faculty of Computing, Bauchi Road Campus',
  now() + interval '7 days' + interval '8 hours',
  now() + interval '8 days' + interval '17 hours',
  60,
  'published',
  now() - interval '5 days'
),
(
  'DATABASE SYSTEMS MASTERCLASS — SQL TO NoSQL',
  'Department of Information Technology intensive session on relational database design, query optimisation, and introduction to NoSQL paradigms (MongoDB, Redis). Facilitated by faculty staff and a guest lecturer from industry.',
  'WORKSHOP',
  'IT Department Lab, Faculty of Computing, Bauchi Road Campus',
  now() + interval '9 days' + interval '10 hours',
  now() + interval '9 days' + interval '13 hours',
  90,
  'published',
  now() - interval '2 days'
),
(
  'COMPUTING CAREER FAIR — MEET TECH COMPANIES',
  'Dedicated tech career fair for computing students. Recruiters from fintech, telecommunications, software consultancies, and federal government agencies will attend. Internship and graduate roles available. Bring your CV and portfolio.',
  'CAREER',
  'Faculty of Computing Lobby & Exhibition Area, Bauchi Road Campus',
  now() + interval '22 days' + interval '9 hours',
  now() + interval '22 days' + interval '15 hours',
  500,
  'published',
  now()
),
(
  'INTRODUCTION TO CLOUD COMPUTING — AWS & AZURE',
  'A beginner-friendly session introducing cloud fundamentals: virtual machines, object storage, serverless functions, and cloud pricing models. AWS and Microsoft representatives will join virtually. Organised by Cloud Computing Club, UNIJOS.',
  'TECH',
  'Computer Lab 4, Faculty of Computing, Bauchi Road Campus',
  now() + interval '5 days' + interval '14 hours',
  now() + interval '5 days' + interval '17 hours',
  100,
  'published',
  now() - interval '1 day'
),
(
  'FINAL YEAR PROJECT DEFENCE — COMPUTER SCIENCE 2026',
  'Public defence of final-year projects by graduating Computer Science students. Projects span AI, mobile development, networking, and software engineering. Faculty, postgraduate students, and industry guests are invited to attend and engage.',
  'ACADEMIC',
  'Faculty of Computing Auditorium, Bauchi Road Campus',
  now() + interval '2 days' + interval '8 hours',
  now() + interval '2 days' + interval '17 hours',
  250,
  'published',
  now() - interval '4 days'
),
(
  'MOBILE APP DEVELOPMENT CHALLENGE — APP JAM 2026',
  'Build and present a functional mobile application within 8 hours. Teams of 2–3 students compete across two tracks: Android (Kotlin/Java) and Cross-Platform (Flutter/React Native). Judged on UI design, functionality, and innovation.',
  'TECH',
  'ICT Building Auditorium, Faculty of Computing, Bauchi Road Campus',
  now() + interval '16 days' + interval '8 hours',
  now() + interval '16 days' + interval '18 hours',
  180,
  'published',
  now() - interval '1 day'
),
(
  'NETWORK INFRASTRUCTURE WORKSHOP — CISCO ACADEMY',
  'UNIJOS Cisco Networking Academy presents a workshop on LAN/WAN design, routing protocols (OSPF, BGP), and network security fundamentals. Participants earn Cisco Academy completion certificates.',
  'WORKSHOP',
  'Networking Lab, Department of Computer Engineering, Bauchi Road Campus',
  now() + interval '20 days' + interval '9 hours',
  now() + interval '20 days' + interval '14 hours',
  70,
  'published',
  now()
);


-- ── NEWS ─────────────────────────────────────────────────────

INSERT INTO public.news (title, slug, excerpt, body, category, read_minutes, published, published_at, created_at) VALUES

(
  'FACULTY OF COMPUTING LAUNCHES NEW B.SC. SOFTWARE ENGINEERING PROGRAMME',
  'faculty-computing-bsc-software-engineering-2026',
  'The University of Jos Faculty of Computing has received NUC accreditation for a new B.Sc. Software Engineering programme, welcoming its first cohort in the 2026/2027 academic session.',
  'The University of Jos Faculty of Computing has officially launched its B.Sc. Software Engineering programme following accreditation by the National Universities Commission (NUC).\n\nThe programme, designed to meet the growing demand for software professionals in Nigeria, combines rigorous theoretical foundations with practical software development training. Curriculum highlights include algorithms and data structures, object-oriented design, distributed systems, AI fundamentals, and a two-semester industry internship.\n\n"Software engineering is the backbone of the digital economy," said the Dean of Computing during the launch ceremony at the Bauchi Road Campus. "This programme equips graduates to compete globally while solving Nigeria''s specific technology challenges."\n\nThe first cohort of 120 students has already commenced lectures. Admission into subsequent sessions will be through the Joint Admissions and Matriculation Board (JAMB) process.\n\nThe Faculty of Computing now offers Computer Science, Information Technology, Cyber Security, and Software Engineering at the undergraduate level.',
  'TECH',
  4,
  true,
  now() - interval '6 days',
  now() - interval '6 days'
),
(
  'UNIJOS COMPUTING STUDENTS WIN NATIONAL TECHNOVATION CHALLENGE',
  'unijos-computing-students-technovation-win',
  'A team of four students from the Faculty of Computing has won the 2026 National Technovation Challenge, presenting an AI-powered crop disease detection app for smallholder farmers.',
  'Four students from the UNIJOS Faculty of Computing have brought national recognition to the University of Jos by winning the 2026 National Technovation Challenge held in Abuja.\n\nTeam CropSight — comprising Fatima Musa, Emmanuel Dajur, Grace Ayuba, and Ibrahim Sule — built an AI-powered mobile application that identifies crop diseases in Plateau State farms using a smartphone camera and a custom-trained convolutional neural network.\n\nThe application, developed over 14 weeks under the supervision of Dr. Blessing Onah of the Computer Science Department, achieved 91% accuracy on a dataset of 8,000 labelled crop images.\n\n"We wanted to solve a real problem people around us face every day," said team lead Fatima Musa. "Most farmers in Jos cannot afford agronomists, but everyone has a smartphone."\n\nThe winning team receives a ₦2 million prize, mentorship from a Lagos-based tech accelerator, and a slot at the Pan-African Technovation Finals in Nairobi.\n\nThe Faculty of Computing has committed to supporting the team in commercialising the application.',
  'TECH',
  5,
  true,
  now() - interval '3 days',
  now() - interval '3 days'
),
(
  'NEW STATE-OF-THE-ART ICT BUILDING OPENS AT BAUCHI ROAD CAMPUS',
  'new-ict-building-opens-bauchi-road-campus',
  'UNIJOS inaugurates a brand-new five-storey ICT Building, housing advanced computer labs, a cybersecurity research centre, and a 200-seat auditorium for the Faculty of Computing.',
  'The University of Jos has commissioned a brand-new five-storey ICT Building at the Bauchi Road Campus, significantly expanding the infrastructure available to the Faculty of Computing.\n\nThe facility, built with TETFund support and a partnership from a technology industry donor, houses:\n\n• Four advanced computer laboratories with 400 high-performance workstations\n• A dedicated Cybersecurity Research Centre with isolated network environments\n• A Networking Academy Lab with Cisco-certified equipment\n• A 200-seat auditorium with dual projection systems\n• Faculty offices, seminar rooms, and collaboration spaces\n\nVice-Chancellor Professor Tanko Ishaya presided over the commissioning ceremony, describing the building as "a statement of UNIJOS commitment to producing world-class computing professionals."\n\nThe building is already operational, with Faculty of Computing lectures, lab practicals, and student activities running at full capacity.',
  'TECH',
  3,
  true,
  now() - interval '10 days',
  now() - interval '10 days'
),
(
  'UNIJOS CYBERSECURITY RESEARCH TEAM PUBLISHES IN INTERNATIONAL JOURNAL',
  'unijos-cybersecurity-research-international-publication',
  'Researchers from the UNIJOS Department of Cyber Security have published findings on IoT network intrusion detection in the prestigious IEEE Transactions on Information Forensics and Security.',
  'A research team from the University of Jos Department of Cyber Security has achieved a milestone publication in the IEEE Transactions on Information Forensics and Security, one of the most respected journals in the field.\n\nThe paper, titled "Adaptive Ensemble Learning for Lightweight IoT Intrusion Detection in Resource-Constrained Environments," proposes a novel approach to detecting network attacks on Internet of Things devices common in smart buildings and hospitals.\n\nLead researcher Dr. Amina Suleiman, with co-authors from the Departments of Computer Science and Electrical Engineering, developed an ensemble machine learning model that achieves high detection rates while running on devices with as little as 256 MB of RAM.\n\n"Nigeria is rapidly adopting IoT in healthcare and smart city infrastructure," Dr. Suleiman explained. "The security of these systems cannot be an afterthought."\n\nThe research was conducted at the Faculty of Computing Cybersecurity Research Centre and supported by a National Information Technology Development Agency (NITDA) research grant.\n\nThis publication places UNIJOS among a small group of Nigerian universities with active research output in cybersecurity.',
  'RESEARCH',
  6,
  true,
  now() - interval '14 days',
  now() - interval '14 days'
),
(
  'COMPUTING STUDENTS ASSOCIATION LAUNCHES FREE CODING BOOTCAMP FOR SECONDARY SCHOOLS',
  'csa-free-coding-bootcamp-secondary-schools',
  'The UNIJOS Computing Students Association is offering free web and app development training to JSS3–SS3 students from public secondary schools around Jos, bridging the digital skills gap.',
  'The Computing Students Association (CSA) of the University of Jos has launched its annual outreach initiative, offering free coding bootcamps to secondary school students in Plateau State.\n\nThis year''s programme, themed "Code the Future," targets JS3 and SS1–SS3 students from six public secondary schools in Jos North and Jos South local government areas.\n\nVolunteer student instructors teach HTML, CSS, JavaScript basics, and Scratch programming across ten Saturday sessions held at the Faculty of Computing computer labs.\n\n"There''s a huge talent pool in Plateau State secondary schools that never gets exposed to technology," said CSA President Chidera Obi. "We want to change that pipeline from within our own community."\n\nLast year''s programme produced three students who went on to win prizes at a state-level ICT competition. This year, 150 secondary school students have enrolled.\n\nThe initiative is supported by the Faculty of Computing Dean''s office and a small grant from a Jos-based fintech company.',
  'TECH',
  4,
  true,
  now() - interval '7 days',
  now() - interval '7 days'
),
(
  'FACULTY OF COMPUTING PARTNERS WITH NIGERIAN TECH STARTUPS FOR INTERNSHIP PROGRAMME',
  'faculty-computing-startup-internship-programme',
  'UNIJOS Faculty of Computing signs MOUs with eight Nigerian tech startups to provide structured internship placements for 300-level and 400-level students starting January 2027.',
  'The Faculty of Computing at the University of Jos has formalised partnerships with eight Nigerian technology startups through the signing of Memoranda of Understanding (MOUs), creating guaranteed internship pathways for undergraduate students.\n\nThe partnering companies span fintech, healthtech, edtech, and enterprise software sectors. Students in their third and fourth years of Computer Science, Information Technology, Cyber Security, and Software Engineering programmes will be eligible to apply.\n\nEach placement runs for 3–6 months and includes a structured learning plan, supervision from both company mentors and faculty supervisors, and a monthly stipend.\n\n"Our students have been winning hackathons nationally but then struggling to convert that into employment," said the Head of the Computer Science Department. "These partnerships create a direct bridge."\n\nApplications for the January 2027 cohort open through the faculty office. Priority will be given to students with strong academic standing and documented project portfolios.',
  'TECH',
  4,
  true,
  now() - interval '4 days',
  now() - interval '4 days'
);


-- ── ANNOUNCEMENTS ────────────────────────────────────────────

INSERT INTO public.announcements (title, body, priority, faculty, published, publish_at, created_at) VALUES

(
  'FACULTY OF COMPUTING — YEAR 2 & 3 CONTINUOUS ASSESSMENT SCHEDULE',
  'All Year 2 and Year 3 students in Computer Science, Information Technology, Cyber Security, and Software Engineering are to collect their Continuous Assessment timetables from the Faculty office. CA tests commence Monday next week. Attendance is compulsory.',
  'IMPORTANT',
  'Faculty of Computing',
  true,
  now() - interval '1 day',
  now() - interval '1 day'
),
(
  'COMPUTING STUDENTS: GITHUB EDUCATION PACK NOW AVAILABLE',
  'The Faculty of Computing has arranged access to the GitHub Education Pack for all registered students. This provides free access to GitHub Copilot, GitHub Pro, Heroku, DigitalOcean credits, JetBrains IDEs, and more. Collect your activation code from the ICT Building ground floor office with your valid student ID.',
  'NORMAL',
  'Faculty of Computing',
  true,
  now() - interval '2 days',
  now() - interval '2 days'
),
(
  'URGENT: COMPUTER LABS MAINTENANCE — LAB 2 & 3 CLOSED THIS WEEK',
  'Computer Labs 2 and 3 at the ICT Building will be closed from Monday to Wednesday for hardware upgrades. Students with scheduled practicals in these labs should report to Lab 1 or Lab 4. Timetables will be updated on the faculty notice board.',
  'URGENT',
  'Faculty of Computing',
  true,
  now() - interval '12 hours',
  now() - interval '12 hours'
),
(
  'FINAL YEAR PROJECT TOPIC SUBMISSION DEADLINE — COMPUTING',
  'All 400-level students in the Faculty of Computing must submit their approved final year project topics and supervisor agreements to the Departmental Coordinators by the end of this week. No extensions will be granted.',
  'URGENT',
  'Faculty of Computing',
  true,
  now() - interval '3 days',
  now() - interval '3 days'
),
(
  'FACULTY OF COMPUTING — NEW DEAN APPOINTMENT',
  'The University of Jos Senate is pleased to announce the appointment of Professor Ngozi Adaora Eze as the new Dean of the Faculty of Computing. Prof. Eze brings 22 years of experience in distributed systems research and has previously served as Head of the Computer Science Department.',
  'IMPORTANT',
  'Faculty of Computing',
  true,
  now() - interval '5 days',
  now() - interval '5 days'
),
(
  'CISCO NETACAD REGISTRATION — SEMESTER 1, 2026/2027',
  'Registration is open for the Cisco Networking Academy courses offered through the Faculty of Computing: CCNA Introduction to Networks, Cybersecurity Essentials, and Python Essentials. Courses run online with weekly lab sessions on campus. Register at the IT Department office, ICT Building Room 102.',
  'NORMAL',
  'Faculty of Computing',
  true,
  now() - interval '8 days',
  now() - interval '8 days'
);
