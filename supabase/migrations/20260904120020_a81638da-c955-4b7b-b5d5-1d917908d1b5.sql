-- ROLES
create type public.app_role as enum ('student','organizer','admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  matric_no text,
  faculty text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'organizer') or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create policy "own roles read" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'GENERAL',
  venue text not null default 'CAMPUS',
  image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer not null default 100,
  status text not null default 'published',
  organizer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "published events public" on public.events for select using (status = 'published');
create policy "organizers read own events" on public.events for select to authenticated
  using (organizer_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "organizers create events" on public.events for insert to authenticated
  with check (organizer_id = auth.uid() and (public.has_role(auth.uid(),'organizer') or public.has_role(auth.uid(),'admin')));
create policy "organizers update own events" on public.events for update to authenticated
  using (organizer_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "organizers delete own events" on public.events for delete to authenticated
  using (organizer_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- REGISTRATIONS
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'registered',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
grant select, insert, update, delete on public.registrations to authenticated;
grant all on public.registrations to service_role;
alter table public.registrations enable row level security;
create policy "own registrations read" on public.registrations for select to authenticated
  using (user_id = auth.uid()
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid()));
create policy "own registrations insert" on public.registrations for insert to authenticated with check (user_id = auth.uid());
create policy "own registrations update" on public.registrations for update to authenticated
  using (user_id = auth.uid()
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid()));
create policy "own registrations delete" on public.registrations for delete to authenticated using (user_id = auth.uid());

-- NEWS
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  image_url text,
  category text not null default 'CAMPUS',
  read_minutes integer not null default 4,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.news to anon;
grant select, insert, update, delete on public.news to authenticated;
grant all on public.news to service_role;
alter table public.news enable row level security;
create policy "published news public" on public.news for select using (published = true);
create policy "admins manage news" on public.news for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ANNOUNCEMENTS
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  priority text not null default 'NORMAL',
  faculty text,
  published boolean not null default true,
  publish_at timestamptz not null default now(),
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.announcements to anon;
grant select, insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "published announcements public" on public.announcements for select
  using (published = true and publish_at <= now());
create policy "staff manage announcements" on public.announcements for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'organizer'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'organizer'));

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  kind text not null default 'INFO',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = auth.uid());
create policy "insert notifications" on public.notifications for insert to authenticated with check (true);

-- timestamps
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- new user bootstrap
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, matric_no, faculty)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'matric_no', new.raw_user_meta_data->>'faculty')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::app_role, 'student'))
  on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- capacity-safe registration
create or replace function public.register_for_event(p_event_id uuid)
returns public.registrations language plpgsql security definer set search_path = public as $$
declare v_event public.events; v_count integer; v_reg public.registrations; v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select * into v_event from public.events where id = p_event_id for update;
  if v_event.id is null then raise exception 'Event not found'; end if;
  if v_event.status <> 'published' then raise exception 'Event is not open for registration'; end if;
  select count(*) into v_count from public.registrations where event_id = p_event_id and status = 'registered';
  if v_count >= v_event.capacity then raise exception 'Event is full'; end if;
  insert into public.registrations (event_id, user_id, status) values (p_event_id, v_uid, 'registered')
  on conflict (event_id, user_id) do update set status = 'registered'
  returning * into v_reg;
  insert into public.notifications (user_id, title, body, kind, link)
  values (v_uid, 'Registration confirmed', v_event.title || ' — ' || to_char(v_event.starts_at,'Mon DD, HH24:MI'), 'REGISTRATION', '/events/' || p_event_id);
  return v_reg;
end $$;
grant execute on function public.register_for_event(uuid) to authenticated;

create or replace function public.set_attendance(p_registration_id uuid, p_checked_in boolean)
returns public.registrations language plpgsql security definer set search_path = public as $$
declare v_reg public.registrations; v_owner uuid;
begin
  select * into v_reg from public.registrations where id = p_registration_id;
  if v_reg.id is null then raise exception 'Registration not found'; end if;
  select organizer_id into v_owner from public.events where id = v_reg.event_id;
  if not (v_owner = auth.uid() or public.has_role(auth.uid(),'admin')) then raise exception 'Not allowed'; end if;
  update public.registrations set checked_in_at = case when p_checked_in then now() else null end
  where id = p_registration_id returning * into v_reg;
  return v_reg;
end $$;
grant execute on function public.set_attendance(uuid, boolean) to authenticated;

-- notify registrants when an event changes
create or replace function public.notify_event_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    insert into public.notifications (user_id, title, body, kind, link)
    select user_id, 'Event cancelled', new.title, 'CANCELLED', '/events/' || new.id
    from public.registrations where event_id = new.id and status = 'registered';
  elsif new.starts_at <> old.starts_at then
    insert into public.notifications (user_id, title, body, kind, link)
    select user_id, 'Event time changed', new.title || ': ' || to_char(old.starts_at,'HH24:MI') || ' → ' || to_char(new.starts_at,'HH24:MI'), 'UPDATE', '/events/' || new.id
    from public.registrations where event_id = new.id and status = 'registered';
  end if;
  return new;
end $$;
create trigger events_notify after update on public.events for each row execute function public.notify_event_change();

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.announcements;

-- SEED DATA FOR UNIVERSITY OF JOS (UNIJOS)
insert into public.events (title, description, category, venue, starts_at, ends_at, capacity, image_url) values
('132nd Inaugural Lecture Series','Join Professor Adamu Mohammed Yakubu for the 132nd Inaugural Lecture Series at UNIJOS. This academic milestone celebrates research excellence and scholarly achievements within the University of Jos community.','ACADEMIC','Aliyu Akwe Doma Indoor Theatre, Naraguta Campus', now() + interval '5 days' + interval '10 hours', now() + interval '5 days' + interval '12 hours', 450, '/images/unijos-theatre.jpg'),
('UNIJOS 2027 Post-UTME Screening','Prospective students for the 2027/2028 academic session are invited to participate in the Post-UTME screening exercise across all faculties at the University of Jos.','ADMISSIONS','Various Faculties, Naraguta & Bauchi Road Campuses', now() + interval '8 days' + interval '8 hours', now() + interval '8 days' + interval '16 hours', 5000, '/images/unijos-campus.jpg'),
('Faculty of Natural Sciences Research Symposium','Annual research presentation by postgraduate students and faculty members from the Faculty of Natural Sciences. Showcasing groundbreaking research across Physics, Chemistry, Biology, Geology, and Mathematics departments.','RESEARCH','Faculty of Natural Sciences Auditorium, Bauchi Road Campus', now() + interval '12 days' + interval '9 hours', now() + interval '12 days' + interval '15 hours', 200, '/images/unijos-science.jpg'),
('UNIJOS Inter-Faculty Sports Competition','The annual inter-faculty sports competition featuring football, basketball, athletics, and other sporting events. Representing the competitive spirit of UNIJOS students across all faculties.','SPORTS','UNIJOS Sports Complex, Naraguta Campus', now() + interval '15 days' + interval '14 hours', now() + interval '17 days' + interval '18 hours', 3000, '/images/unijos-sports.jpg'),
('Medical Students Clinical Skills Workshop','Intensive workshop for medical students from the College of Health Sciences focusing on clinical examination techniques and patient care skills.','WORKSHOP','College of Health Sciences, Bauchi Road Campus', now() + interval '3 days' + interval '13 hours', now() + interval '3 days' + interval '17 hours', 150, '/images/unijos-medical.jpg'),
('UNIJOS Alumni Homecoming 2027','Annual homecoming event for University of Jos alumni featuring networking sessions, campus tours, and celebration of UNIJOS achievements. All graduates welcome to reconnect with their alma mater.','ALUMNI','Senate Building & Various Venues, Naraguta Campus', now() + interval '21 days' + interval '10 hours', now() + interval '21 days' + interval '17 hours', 1200, '/images/unijos-alumni.jpg');

insert into public.news (title, slug, excerpt, body, category, read_minutes, image_url) values
('UNIJOS Receives NUC Approval for New Programmes','unijos-nuc-new-programmes','The University of Jos has received National Universities Commission approval for five new undergraduate and postgraduate programmes across multiple faculties.','The National Universities Commission (NUC) has granted the University of Jos approval to commence five new academic programmes for the 2027/2028 academic session.\n\nThe approved programmes include a Bachelor of Science in Renewable Energy Engineering, Master of Arts in Peace and Conflict Studies, and three postgraduate diploma programmes.\n\n\"This approval reflects UNIJOS commitment to meeting the evolving educational needs of Nigeria and the global community,\" said the Vice-Chancellor during the announcement at the Senate Building.\n\nThe new programmes will be hosted across the Faculty of Engineering, Faculty of Social Sciences, and the Institute of Education.','ACADEMICS',4,'/images/unijos-senate.jpg'),
('Record Enrolment for 2026/2027 Academic Session','record-enrolment-2026-2027','The University of Jos has recorded its highest ever student enrolment with over 42,000 students across undergraduate and postgraduate programmes.','The University of Jos has achieved a milestone with record student enrolment for the 2026/2027 academic session.\n\nWith over 42,000 students now registered across all programmes, UNIJOS continues to be one of Nigeria''s most sought-after institutions of higher learning.\n\nThe increase spans all twelve faculties, with the highest growth recorded in the Faculties of Natural Sciences, Engineering, and Management Sciences.\n\n\"This growth reflects the confidence students and parents have in the quality of education provided at UNIJOS,\" noted the Registrar during the orientation ceremony.','UNIVERSITY',3,'/images/unijos-students.jpg'),
('UNIJOS Partners with Plateau State Government on Agricultural Innovation','unijos-plateau-agriculture-partnership','New partnership aims to boost agricultural productivity in Plateau State through research collaboration and technology transfer from UNIJOS Faculty of Agriculture.','The University of Jos has entered into a strategic partnership with the Plateau State Government to enhance agricultural productivity through research and innovation.\n\nThe Faculty of Agriculture will lead the initiative, focusing on crop improvement, livestock management, and sustainable farming practices suited to Plateau State''s unique climate and topography.\n\nThe partnership includes establishment of demonstration farms and extension services to support local farmers across the state.\n\n\"This collaboration exemplifies UNIJOS commitment to community service and practical application of academic research,\" said the Dean of Agriculture.','RESEARCH',5,'/images/unijos-agriculture.jpg'),
('New Digital Library Opens at Naraguta Campus','digital-library-naraguta-opening','State-of-the-art digital library facility officially opened, providing 24/7 access to electronic resources and modern study spaces for UNIJOS students and faculty.','The University of Jos has officially opened its new digital library at the Naraguta Campus, marking a significant milestone in the institution''s digital transformation.\n\nThe facility features over 500 computer workstations, collaborative study spaces, and access to international academic databases and electronic journals.\n\nOperating 24 hours daily during academic sessions, the digital library aims to support research and learning across all disciplines offered at UNIJOS.\n\nThe project was funded through TETFund intervention and represents a major investment in modern educational infrastructure.','FACILITIES',4,'/images/unijos-library.jpg'),
('UNIJOS Medical College Graduates Pass MDCN Exams with Excellence','medical-graduates-mdcn-success','University of Jos medical graduates achieve 98% pass rate in Medical and Dental Council of Nigeria licensing examinations, maintaining UNIJOS reputation for medical education excellence.','Graduates from the University of Jos College of Health Sciences have achieved remarkable success in the Medical and Dental Council of Nigeria (MDCN) licensing examinations.\n\nWith a 98% pass rate, UNIJOS medical graduates continue to demonstrate the quality of medical education provided at the institution.\n\nThe College of Health Sciences, located at the Bauchi Road Campus, has consistently produced competent medical professionals who serve across Nigeria and internationally.\n\n\"These results reflect our commitment to excellence in medical education and training,\" stated the Provost of the College of Health Sciences.','MEDICAL',3,'/images/unijos-medical-college.jpg');

insert into public.announcements (title, body, priority, faculty) values
('2027/2028 Academic Session Registration Commences','All returning students are to complete their registration for the 2027/2028 academic session through the UNIJOS student portal. Payment of fees must be completed before course registration. Contact your faculty offices for assistance.','IMPORTANT','ALL FACULTIES'),
('Senate Building Renovation - Alternative Routes','The Senate Building at Naraguta Campus will undergo renovation works for the next two months. Students and staff should use alternative routes through the Faculty of Arts or Faculty of Social Sciences. Administrative services remain operational.','NORMAL','ALL FACULTIES'),
('Faculty of Natural Sciences Seminar Series Resumes','The weekly seminar series by the Faculty of Natural Sciences resumes this Thursday at the Faculty Auditorium, Bauchi Road Campus. This week: "Climate Change Research in the Jos Plateau" by Prof. Ibrahim Mustapha.','NORMAL','FACULTY OF NATURAL SCIENCES'),
('Final Year Project Submission Deadline','All final year students across faculties must submit their project reports by the stipulated deadline. Late submissions will not be accepted. Contact your departmental coordinators for clarification.','URGENT','ALL FACULTIES'),
('UNIJOS 50th Anniversary Celebration Planning','The University of Jos approaches its 50th anniversary in 2025. All faculties, departments, and student bodies are invited to contribute to the celebration planning committee. Contact the Vice-Chancellor''s office.','IMPORTANT','ALL FACULTIES');