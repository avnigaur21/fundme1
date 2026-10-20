-- FundMe baseline schema.
-- Run this once in Supabase SQL Editor using the service role/admin context.
-- The Node backend uses SUPABASE_KEY (service_role), so RLS is disabled here
-- intentionally; add authenticated policies if the browser accesses Supabase
-- directly in the future.

create table if not exists public.users (
  user_id text primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'founder',
  avatar text,
  designation text,
  phone text,
  notifications jsonb not null default '{}'::jsonb,
  billing_email text,
  gstin text,
  created_at timestamptz not null default now()
);

create table if not exists public.founder_profiles (
  founder_id text primary key,
  user_id text not null unique references public.users(user_id) on delete cascade,
  startup_name text not null default '',
  sector text not null default '',
  stage text not null default '',
  startup_overview text not null default '',
  website text not null default '',
  application_email text not null default '',
  problem_statement text not null default '',
  solution_summary text not null default '',
  target_customers text not null default '',
  business_model text not null default '',
  team_size integer not null default 0,
  founded text not null default '',
  incorporation text not null default '',
  dpiit text not null default '',
  location text not null default '',
  revenue text not null default '',
  traction_summary text not null default '',
  documents jsonb not null default '{}'::jsonb,
  profile_completion jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funding_opportunities (
  opportunity_id text primary key,
  title text not null,
  provider text not null default '',
  description text not null default '',
  eligibility text not null default '',
  benefits jsonb not null default '[]'::jsonb,
  timeline text not null default '',
  about text not null default '',
  type text not null default 'Grant',
  amount text not null default '',
  deadline text not null default 'Rolling',
  location text not null default 'India',
  sector text not null default 'All Sectors',
  stage text not null default '',
  link text not null default '',
  external_apply_url text not null default '',
  slug text not null default '',
  raw_scraped_text text not null default '',
  formatted_details jsonb,
  generated_application_schema jsonb,
  credibility_source text not null default '',
  saved boolean not null default false,
  match_score integer not null default 0,
  scraped_at timestamptz,
  first_seen_at timestamptz,
  last_seen_at timestamptz
);

create table if not exists public.business_opportunities (like public.funding_opportunities including defaults);

create table if not exists public.saved_opportunities (
  saved_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  saved_date date not null default current_date,
  unique (user_id, opportunity_id)
);

create table if not exists public.applications (
  application_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  status text not null default 'Applied',
  timeline jsonb not null default '[]'::jsonb,
  stage_details jsonb not null default '{}'::jsonb,
  next_step text,
  feedback text,
  ai_insights jsonb not null default '[]'::jsonb,
  submitted_at date,
  deadline text,
  follow_up_date text,
  priority text not null default 'Medium',
  owner text not null default '',
  portal_status text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.drafts (
  draft_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  title text not null default '',
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

create table if not exists public.documents (
  document_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  application_id text,
  doc_type text not null default 'other',
  filename text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.extension_sessions (
  session_id text primary key,
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  external_url text not null,
  hostname text not null default '',
  root_domain text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_scores (
  user_id text not null references public.users(user_id) on delete cascade,
  opportunity_id text not null,
  profile_signature text not null,
  score integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  scored_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index if not exists founder_profiles_user_id_idx on public.founder_profiles(user_id);
create index if not exists saved_opportunities_user_idx on public.saved_opportunities(user_id);
create index if not exists applications_user_idx on public.applications(user_id);
create index if not exists drafts_user_idx on public.drafts(user_id);
create index if not exists match_scores_signature_idx on public.match_scores(user_id, profile_signature);
create index if not exists funding_opportunities_last_seen_idx on public.funding_opportunities(last_seen_at desc);
create index if not exists business_opportunities_last_seen_idx on public.business_opportunities(last_seen_at desc);

-- The backend uses the server-side service_role key. These grants resolve the
-- permission-denied errors that otherwise surface during login/profile saves.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
