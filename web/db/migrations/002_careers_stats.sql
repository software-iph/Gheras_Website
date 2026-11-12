-- Careers (jobs, applications, settings) and cookie-free visitor statistics.

-- Small key/value settings that change live, outside the content draft (e.g. careers on/off).
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Open and closed positions, managed in the dashboard. Text fields are {"en": "...", "ar": "..."}.
create table jobs (
  id uuid primary key,
  title jsonb not null,
  department jsonb not null default '{"en":"","ar":""}'::jsonb,
  location jsonb not null default '{"en":"","ar":""}'::jsonb,
  employment text not null default 'full-time' check (employment in ('full-time', 'part-time', 'contract', 'internship')),
  description jsonb not null default '{"en":"","ar":""}'::jsonb,
  -- 'form': apply on the site (CV upload); 'link': send people to apply_url.
  apply_mode text not null default 'form' check (apply_mode in ('form', 'link')),
  apply_url text,
  status text not null default 'open' check (status in ('open', 'closed')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_status_sort_idx on jobs (status, sort, created_at desc);

-- Applications sent through the site. The CV file lives in <UPLOADS_DIR>/cvs/ (never served publicly).
create table job_applications (
  id uuid primary key,
  job_id uuid references jobs (id) on delete set null,
  -- Job title at the time of applying (kept if the job is later deleted); null = general application.
  job_title text,
  name text not null,
  email text not null,
  phone text,
  link text,
  message text not null default '',
  cv_name text,
  cv_original text,
  cv_type text,
  cv_size integer,
  page_lang text not null check (page_lang in ('en', 'ar')),
  status text not null default 'new' check (status in ('new', 'reviewing', 'shortlisted', 'rejected', 'archived')),
  read boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index job_applications_created_idx on job_applications (created_at desc);

-- One row per page view. `visitor` is a daily-rotating anonymous hash (no IP or cookie is stored),
-- so the same person counts once per day.
create table page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day date not null,
  visitor text not null,
  path text not null,
  lang text not null,
  source text not null,
  referrer_host text,
  device text not null check (device in ('desktop', 'mobile', 'tablet'))
);
create index page_views_day_idx on page_views (day);
create index page_views_day_visitor_idx on page_views (day, visitor);
