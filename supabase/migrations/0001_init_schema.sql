-- ============================================================================
-- 0001_init_schema.sql
-- SkillBridge MVP — core schema + Row Level Security policies.
-- Applied via `supabase db push` / `supabase migration up`.
-- See docs/SECURITY.md and docs/MVP_BUILD_PROMPT.md (sections 9-11) for
-- the rationale behind every table and role boundary.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users not null,
  role         text check (role in ('student','employer','admin')) not null,
  full_name    text,
  avatar_url   text,
  bio          text,
  phone        text,
  location     text,
  created_at   timestamp with time zone default now(),
  updated_at   timestamp with time zone default now()
);

create table if not exists public.student_profiles (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid references public.profiles on delete cascade,
  university           text,
  major                text,
  graduation_year      int,
  education_level      text,
  profile_completion   int default 0 check (profile_completion between 0 and 100)
);

create table if not exists public.employer_profiles (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references public.profiles on delete cascade,
  company_id   uuid references public.companies on delete set null,
  position     text,
  verified     boolean default false
);

create table if not exists public.companies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  logo_url        text,
  description     text,
  industry        text,
  website        text,
  location        text,
  employee_count  int,
  verified        boolean default false,
  created_at      timestamp with time zone default now()
);

create table if not exists public.skills (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists public.student_skills (
  student_id uuid references public.student_profiles on delete cascade,
  skill_id   uuid references public.skills on delete cascade,
  primary key (student_id, skill_id)
);

create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.student_profiles on delete cascade,
  title         text,
  company       text,
  description   text,
  start_date    date,
  end_date      date
);

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid references public.student_profiles on delete cascade,
  title         text,
  description   text,
  technologies  text[],
  url           text
);

create table if not exists public.opportunities (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references public.companies,
  created_by    uuid references auth.users,
  title         text not null,
  description   text,
  type          text,
  location      text,
  work_type     text,
  compensation  text,
  duration      text,
  deadline      date,
  status        text default 'open' check (status in ('open','closed','draft')),
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

create table if not exists public.opportunity_skills (
  opportunity_id uuid references public.opportunities on delete cascade,
  skill_id       uuid references public.skills on delete cascade,
  primary key (opportunity_id, skill_id)
);

create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities,
  student_id    uuid references public.student_profiles,
  cover_message text,
  status        text default 'submitted' check (status in ('submitted','reviewing','shortlisted','accepted','rejected')),
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now(),
  -- Prevent a student from applying twice to the same opportunity.
  constraint applications_one_per_opportunity unique (opportunity_id, student_id)
);

create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users,
  type          text,
  title         text,
  message       text,
  read          boolean default false,
  created_at    timestamp with time zone default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (performance + uniqueness guarantees the spec calls out)
-- ---------------------------------------------------------------------------
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists opportunities_company_idx on public.opportunities (company_id);
create index if not exists opportunities_status_idx on public.opportunities (status);
create index if not exists applications_opportunity_idx on public.applications (opportunity_id);
create index if not exists applications_student_idx on public.applications (student_id);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read);
create index if not exists student_skills_skill_idx on public.student_skills (skill_id);
create index if not exists opportunity_skills_skill_idx on public.opportunity_skills (skill_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — the real authorization guarantee. The app can have
-- bugs; the DB will not let a user touch another user's rows.
-- ---------------------------------------------------------------------------

-- Helper: current user's role from the profiles table (source of truth).
create or replace function public.current_role()
returns text
language sql stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

-- profiles: self-service read/update; admin full.
alter table public.profiles enable row level security;
create policy "profiles: self read"
  on public.profiles for select using (user_id = auth.uid());
create policy "profiles: self update"
  on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles: admin full"
  on public.profiles for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- student_profiles
alter table public.student_profiles enable row level security;
create policy "student_profiles: owner" on public.student_profiles for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "student_profiles: admin full" on public.student_profiles for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- employer_profiles
alter table public.employer_profiles enable row level security;
create policy "employer_profiles: owner" on public.employer_profiles for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()))
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "employer_profiles: admin full" on public.employer_profiles for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- companies: public read verified; owner write; admin full.
alter table public.companies enable row level security;
create policy "companies: public read verified" on public.companies for select
  using (verified = true or id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "companies: owner write" on public.companies for all
  using (id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ))
  with check (id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "companies: admin full" on public.companies for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- opportunities: public read open; owner (employer) write; admin full.
alter table public.opportunities enable row level security;
create policy "opportunities: public read open" on public.opportunities for select
  using (status = 'open' or company_id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "opportunities: owner write" on public.opportunities for all
  using (company_id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ))
  with check (company_id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "opportunities: admin full" on public.opportunities for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- student_skills: owner write, read all.
alter table public.student_skills enable row level security;
create policy "student_skills: owner write" on public.student_skills for all
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ))
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "student_skills: read all" on public.student_skills for select using (true);

-- experiences
alter table public.experiences enable row level security;
create policy "experiences: owner" on public.experiences for all
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ))
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "experiences: admin full" on public.experiences for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- projects
alter table public.projects enable row level security;
create policy "projects: owner" on public.projects for all
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ))
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "projects: admin full" on public.projects for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- opportunity_skills: read all; owner write via opportunity.
alter table public.opportunity_skills enable row level security;
create policy "opportunity_skills: read all" on public.opportunity_skills for select using (true);
create policy "opportunity_skills: owner write" on public.opportunity_skills for all
  using (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ))
  with check (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));

-- applications: student sees their own; employer sees their opp's; status-update
--   restricted to employer on their own opportunity.
alter table public.applications enable row level security;
create policy "applications: student sees own" on public.applications for select
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "applications: student insert own" on public.applications for insert
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "applications: employer reads own opps" on public.applications for select
  using (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "applications: employer updates own opps" on public.applications for update
  using (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ))
  with check (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));
create policy "applications: admin full" on public.applications for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- skills: read all.
alter table public.skills enable row level security;
create policy "skills: read all" on public.skills for select using (true);

-- notifications: owner + admin full.
alter table public.notifications enable row level security;
create policy "notifications: owner" on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "notifications: admin full" on public.notifications for all
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Storage buckets (avatars + certificates) — private by default.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false),
       ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "avatars: owner read" on storage.objects for select
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner write" on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
