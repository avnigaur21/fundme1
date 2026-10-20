-- Older deployments stored only a numeric percentage. The draft API now stores
-- { progress, completed_fields, missing_fields }. Preserve existing percentages.
begin;

do $$
declare
  completion_type text;
begin
  select data_type into completion_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'drafts'
    and column_name = 'completion';

  if completion_type in ('numeric', 'integer', 'bigint', 'smallint',
                         'real', 'double precision') then
    alter table public.drafts alter column completion drop default;
    alter table public.drafts alter column completion type jsonb
      using jsonb_build_object(
        'progress', coalesce(completion, 0),
        'completed_fields', '[]'::jsonb,
        'missing_fields', '[]'::jsonb
      );
  elsif completion_type is distinct from 'jsonb' then
    raise exception 'Unexpected drafts.completion type: %', completion_type;
  end if;
end $$;

alter table public.drafts alter column completion
  set default '{"progress":0,"completed_fields":[],"missing_fields":[]}'::jsonb;

notify pgrst, 'reload schema';
commit;
