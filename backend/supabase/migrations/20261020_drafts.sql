-- Safe migration for the draft workspace. Existing rows and tables are preserved.
create table if not exists public.drafts (
  draft_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  title text not null default '',
  subtitle text not null default '',
  status text not null default 'draft',
  form_schema jsonb,
  form_fields jsonb not null default '{}'::jsonb,
  required_documents_status jsonb not null default '{}'::jsonb,
  completion jsonb not null default '{}'::jsonb,
  source_url text not null default '',
  schema_source text not null default 'manual',
  capture_meta jsonb not null default '{}'::jsonb,
  last_saved timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.drafts add column if not exists subtitle text not null default '';
alter table public.drafts add column if not exists status text not null default 'draft';
alter table public.drafts add column if not exists form_schema jsonb;
alter table public.drafts add column if not exists form_fields jsonb not null default '{}'::jsonb;
alter table public.drafts add column if not exists required_documents_status jsonb not null default '{}'::jsonb;
alter table public.drafts add column if not exists completion jsonb not null default '{}'::jsonb;
alter table public.drafts add column if not exists source_url text not null default '';
alter table public.drafts add column if not exists schema_source text not null default 'manual';
alter table public.drafts add column if not exists capture_meta jsonb not null default '{}'::jsonb;
alter table public.drafts add column if not exists last_saved timestamptz not null default now();
alter table public.drafts add column if not exists created_at timestamptz not null default now();

create index if not exists drafts_user_idx on public.drafts(user_id);
grant all privileges on public.drafts to service_role;
