-- GHERAS website + dashboard — initial schema (handoff README → Data model).
-- Everything lives in this one PostgreSQL database: content, history, users, inquiries and image files.

-- One working draft: the full content JSON. The row is locked (SELECT … FOR UPDATE) while a save is applied.
create table cms_draft (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- Change log: draft saves (diff only) and immutable published versions (diff + snapshot).
create table cms_revisions (
  seq bigint generated always as identity primary key,
  id uuid not null unique,
  version integer unique,
  status text not null check (status in ('draft', 'published')),
  author text not null,
  created_at timestamptz not null default now(),
  note text not null default '',
  summary jsonb not null,
  diff jsonb not null default '[]'::jsonb,
  snapshot jsonb,
  check ((status = 'published') = (version is not null and snapshot is not null))
);

-- v1: a single Administrator. Roles 'editor' | 'inquiries' | 'reviewer' come later.
create table admin_users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  password_hash text not null,
  two_factor boolean not null default false,
  totp_secret text,
  pending_totp_secret text,
  last_totp_step bigint not null default -1,
  session_version integer not null default 1,
  created_at timestamptz not null default now()
);

-- Contact-form submissions.
create table inquiries (
  id uuid primary key,
  name text not null,
  organisation text not null default '',
  email text not null,
  phone text,
  type text not null check (type in ('Investment', 'Partnership', 'Supply', 'Careers', 'Other')),
  message text not null,
  page_lang text not null check (page_lang in ('en', 'ar')),
  status text not null default 'new' check (status in ('new', 'replied', 'archived')),
  read boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index inquiries_created_at_idx on inquiries (created_at desc);

-- Uploaded photos (JPG/WebP). The files live in the `image-uploads` folder on the server;
-- the database keeps their URL and details. next/image resizes and caches them.
create table media_files (
  name text primary key,
  url text not null unique,
  original_name text not null,
  content_type text not null check (content_type in ('image/jpeg', 'image/webp')),
  size integer not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);
