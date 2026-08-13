-- ============================================================================
-- SkillBridge — Target-state Row Level Security (RLS) policies
-- ============================================================================
-- Apply this via the Supabase SQL editor (or a migration) once the schema in
-- docs/MVP_BUILD_PROMPT.md exists. RLS is the REAL guarantee that a student
-- can only touch their own data and an employer only their own company's data
-- — even if application code has a bug.
--
-- CRITICAL RULES:
--   * Never disable RLS on a table that holds user data.
--   * The service_role key BYPASSES RLS. Only use it in trusted server scripts,
--     never in the browser.
--   * Every policy uses auth.uid() — the authenticated user's ID from Supabase
--     Auth. We never trust a role sent from the client.
--
-- NOTE: This file is "target state". Table/column names follow the MVP spec.
-- Adjust if your actual migration names differ.
-- ============================================================================

-- Helper: current user's role, read from the profiles table (source of truth).
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: self read"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "profiles: self update"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "profiles: admin full"
  on public.profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- student_profiles  (linked to profiles)
-- ---------------------------------------------------------------------------
alter table public.student_profiles enable row level security;

create policy "student_profiles: owner read"
  on public.student_profiles for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "student_profiles: owner write"
  on public.student_profiles for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "student_profiles: admin full"
  on public.student_profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- employer_profiles  (linked to profiles)
-- ---------------------------------------------------------------------------
alter table public.employer_profiles enable row level security;

create policy "employer_profiles: owner read"
  on public.employer_profiles for select
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "employer_profiles: owner write"
  on public.employer_profiles for all
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

create policy "employer_profiles: admin full"
  on public.employer_profiles for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- companies  (employer manages their own; everyone can read verified ones)
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;

create policy "companies: public read verified"
  on public.companies for select
  using (verified = true or exists (
    select 1 from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where ep.company_id = companies.id and p.user_id = auth.uid()
  ));

create policy "companies: owner write"
  on public.companies for all
  using (
    id in (
      select ep.company_id from public.employer_profiles ep
      join public.profiles p on p.id = ep.profile_id
      where p.user_id = auth.uid()
    )
  )
  with check (
    id in (
      select ep.company_id from public.employer_profiles ep
      join public.profiles p on p.id = ep.profile_id
      where p.user_id = auth.uid()
    )
  );

create policy "companies: admin full"
  on public.companies for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- opportunities  (employer manages their own; public can read open ones)
-- ---------------------------------------------------------------------------
alter table public.opportunities enable row level security;

create policy "opportunities: public read open"
  on public.opportunities for select
  using (status = 'open' or company_id in (
    select ep.company_id from public.employer_profiles ep
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));

create policy "opportunities: owner write"
  on public.opportunities for all
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

create policy "opportunities: admin full"
  on public.opportunities for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- applications  (student sees/owns their own; employer sees those on their
--                opportunities; admin all)
-- ---------------------------------------------------------------------------
alter table public.applications enable row level security;

create policy "applications: student own"
  on public.applications for select
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "applications: student create"
  on public.applications for insert
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));

create policy "applications: employer on own opportunity"
  on public.applications for select
  using (opportunity_id in (
    select o.id from public.opportunities o
    join public.employer_profiles ep on ep.company_id = o.company_id
    join public.profiles p on p.id = ep.profile_id
    where p.user_id = auth.uid()
  ));

create policy "applications: employer update status"
  on public.applications for update
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

create policy "applications: admin full"
  on public.applications for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- experiences / projects / student_skills  (owned by the student)
-- ---------------------------------------------------------------------------
alter table public.experiences enable row level security;
create policy "experiences: owner"
  on public.experiences for all
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ))
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "experiences: admin full"
  on public.experiences for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

alter table public.projects enable row level security;
create policy "projects: owner"
  on public.projects for all
  using (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ))
  with check (student_id in (
    select id from public.student_profiles
    where profile_id in (select id from public.profiles where user_id = auth.uid())
  ));
create policy "projects: admin full"
  on public.projects for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- skills / opportunity_skills / notifications  (read-mostly / owner-write)
-- ---------------------------------------------------------------------------
alter table public.skills enable row level security;
create policy "skills: read all"
  on public.skills for select using (true);

alter table public.opportunity_skills enable row level security;
create policy "opportunity_skills: read all"
  on public.opportunity_skills for select using (true);
create policy "opportunity_skills: owner write"
  on public.opportunity_skills for all
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

alter table public.notifications enable row level security;
create policy "notifications: owner"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "notifications: admin full"
  on public.notifications for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Storage: profile photos & certificates buckets
-- ---------------------------------------------------------------------------
-- Create buckets (run once). Set them PRIVATE; objects are addressed by UUID.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false),
       ('certificates', 'certificates', false)
on conflict (id) do nothing;

-- Avatar objects: owner can read/write their own folder; admins full.
create policy "avatars: owner read"
  on storage.objects for select
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner write"
  on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
