-- Website Extra Joss SPG v23 - normalized Supabase/Postgres schema
-- Legacy ZIP password fields and open RLS policies are intentionally not carried forward.
create extension if not exists pgcrypto;

create table roles (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text);
insert into roles (code,name,description) values
  ('ADMIN','Admin','Mengelola akun, keamanan, dan pengaturan sistem.'),
  ('TL','Team Leader','Mengelola data operasional dan Reporting SPG.'),
  ('SCO','SCO','Melihat dan mengekspor data area tugas.'),
  ('MS','MS','Melihat dan mengekspor data area tugas.'),
  ('AM','Area Manager','Melihat dan mengekspor data area tugas.'),
  ('SPG','SPG','Mencatat outlet dan melihat data miliknya sendiri.')
on conflict (code) do update set name=excluded.name,description=excluded.description;
create table permissions (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, module text not null, action text not null);
create table role_permissions (role_id uuid references roles(id) on delete cascade, permission_id uuid references permissions(id) on delete cascade, primary key(role_id, permission_id));
create table users (id uuid primary key references auth.users(id) on delete cascade, code text unique, full_name text not null, nickname text, email text unique, phone text, role_id uuid references roles(id), status text not null default 'active', join_date date, resign_date date, off_day text, supervisor_user_id uuid references users(id), replacement_of_user_id uuid references users(id), replaced_by_user_id uuid references users(id), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table projects (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, brand text, type text, region text, start_date date, end_date date, status text not null default 'active', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table areas (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), code text not null, name text not null, region text, city text, province text, cluster text, quota_manpower integer not null default 0 check(quota_manpower>=0), status text not null default 'active', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,code));
create table organization_assignments (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), user_id uuid not null references users(id), org_role_type text not null, area_id uuid references areas(id), start_date date not null, end_date date, status text not null default 'active');
create table outlets (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), area_id uuid not null references areas(id), code text not null, name text not null, address text, latitude numeric(10,7), longitude numeric(10,7), kecamatan text, kelurahan text, category text, channel_type text, priority_level text, outlet_status text not null default 'active', owner_name text, owner_contact text, notes text, last_visit_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,code));
create table outlet_status_logs (id uuid primary key default gen_random_uuid(), outlet_id uuid not null references outlets(id), status text not null, changed_by_user_id uuid references users(id), notes text, created_at timestamptz not null default now());

create table manpower_assignments (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), outlet_id uuid references outlets(id), effective_start date not null, effective_end date, assignment_type text not null, status text not null default 'active', notes text);
create table manpower_roster_history (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), action_type text not null, reference_user_id uuid references users(id), notes text, created_at timestamptz not null default now());

create table attendance_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), attendance_date date not null, status text not null, check_in_time timestamptz, check_out_time timestamptz, check_in_lat numeric(10,7), check_in_lng numeric(10,7), check_out_lat numeric(10,7), check_out_lng numeric(10,7), photo_url text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,user_id,attendance_date));
create table daily_reports (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), outlet_id uuid not null references outlets(id), report_date date not null, stock_awal integer not null default 0, selling_pcs integer not null default 0, stock_akhir integer not null default 0, value numeric(18,2) not null default 0, sampling_cup integer not null default 0, insight text, status_outlet text, status_visit text, documentation_url text, remarks text, source_type text not null default 'digital', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,user_id,outlet_id,report_date));
create table daily_report_audits (id uuid primary key default gen_random_uuid(), daily_report_id uuid not null references daily_reports(id) on delete cascade, audit_status text not null, anomaly_flags_json jsonb not null default '[]', reviewed_by_user_id uuid references users(id), reviewed_at timestamptz, notes text);
create table selling_snapshots (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), snapshot_date date not null, actual_pcs integer not null, actual_value numeric(18,2) not null, total_carton numeric(18,2) not null, avg_day numeric(18,2) not null, hk integer not null, created_at timestamptz not null default now());
create table stock_validation_periods (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), area_id uuid not null references areas(id), month_key text not null, tl_user_id uuid references users(id), sco_user_id uuid references users(id), area_manager_user_id uuid references users(id), status text not null default 'draft', approved_at timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,area_id,month_key));
create table stock_validation_rows (id uuid primary key default gen_random_uuid(), period_id uuid not null references stock_validation_periods(id) on delete cascade, outlet_id uuid references outlets(id), user_id uuid references users(id), kecamatan text, gromin_name text not null, spg_name text, stock_awal_can integer not null default 0, po_tambahan_can integer not null default 0, sellout_w1 integer not null default 0, sellout_w2 integer not null default 0, sellout_w3 integer not null default 0, sellout_w4 integer not null default 0, sellout_w5 integer not null default 0, stock_actual_can integer generated always as (stock_awal_can + po_tambahan_can - sellout_w1 - sellout_w2 - sellout_w3 - sellout_w4 - sellout_w5) stored, validation_status text not null default 'Belum Validasi', auto_from_reporting boolean not null default true, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table nota_records (
  id uuid primary key default gen_random_uuid(),
  daily_report_id uuid not null unique references daily_reports(id) on delete cascade,
  user_id uuid not null references users(id),
  project_id uuid not null references projects(id),
  area_id uuid not null references areas(id),
  outlet_id uuid not null references outlets(id),
  uploaded_by_user_id uuid not null references users(id),
  report_date date not null,
  upload_date timestamptz not null default now(),
  file_path text not null unique,
  original_file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size_bytes integer not null check (file_size_bytes > 0 and file_size_bytes <= 2097152),
  note_number text,
  nominal numeric(18,2),
  qty_can integer,
  status text not null default 'UPLOADED',
  duplicate_group_key text,
  ocr_json jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table nota_audits (id uuid primary key default gen_random_uuid(), nota_record_id uuid not null references nota_records(id) on delete cascade, matched_daily_report_id uuid references daily_reports(id), audit_status text not null, mismatch_reason text, audited_by_user_id uuid references users(id), audited_at timestamptz, notes text);
create table spg_candidates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  area_id uuid not null references areas(id),
  full_name text not null,
  phone text not null,
  status text not null default 'Kandidat Baru' check (status in ('Kandidat Baru','Jadwal Interview','Sudah Interview','Jadwal Training','Sudah Training','Siap Join','Sudah Join','Gagal Join','Menghilang')),
  interview_at timestamptz,
  training_at timestamptz,
  join_date date,
  cv_file_path text unique,
  cv_original_name text,
  cv_mime_type text,
  cv_size_bytes integer check (cv_size_bytes is null or (cv_size_bytes > 0 and cv_size_bytes <= 6291456)),
  notes text,
  created_by_user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table sampling_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), outlet_id uuid references outlets(id), sampling_date date not null, cup_count integer not null default 0, can_used integer not null default 0, respondent_count integer not null default 0, response_summary text, status text not null default 'submitted', documentation_url text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table route_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), started_at timestamptz not null, ended_at timestamptz, status text not null, ai_enabled boolean not null default true, voice_enabled boolean not null default false, total_distance_m numeric(18,2) default 0, total_duration_s integer default 0, notes text);
create table route_points (id bigint generated always as identity primary key, session_id uuid not null references route_sessions(id) on delete cascade, recorded_at timestamptz not null, latitude numeric(10,7) not null, longitude numeric(10,7) not null, accuracy_m numeric(10,2), speed numeric(10,2), heading numeric(10,2), snapped_segment_key text);
create table route_segment_coverages (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), segment_key text not null, coverage_date date not null, coverage_type text, overlap_count integer not null default 0, created_at timestamptz not null default now());
create table outlet_visits (id uuid primary key default gen_random_uuid(), session_id uuid references route_sessions(id), outlet_id uuid not null references outlets(id), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), visit_date date not null, visit_status text not null, visit_start_at timestamptz, visit_end_at timestamptz, visit_duration_s integer, distance_from_outlet_m numeric(10,2), notes text, created_at timestamptz not null default now());
create table ai_events (id uuid primary key default gen_random_uuid(), session_id uuid references route_sessions(id), user_id uuid not null references users(id), event_type text not null, event_level text, message text not null, confidence_score numeric(5,4), context_json jsonb, created_at timestamptz not null default now());
create table warning_logs (id uuid primary key default gen_random_uuid(), session_id uuid references route_sessions(id), user_id uuid not null references users(id), warning_type text not null, severity text not null, message text not null, confidence_score numeric(5,4), context_json jsonb, created_at timestamptz not null default now());

create table kpi_parameter_sets (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), name text not null, target_harian_pcs integer not null, target_bulanan_pcs integer not null, target_karton numeric(18,2), pcs_per_carton integer not null default 24, ratio_target numeric(8,4) not null, salary_basis_hk integer not null, price_per_can_default numeric(18,2) not null, zona_ratio_json jsonb not null, zona_target_json jsonb not null, active_flag boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create unique index uq_active_kpi_project on kpi_parameter_sets(project_id) where active_flag=true;
create table wip_snapshots (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), period_start date not null, period_end date not null, snapshot_type text not null, generated_by_user_id uuid references users(id), metadata_json jsonb, created_at timestamptz not null default now());
create table wip_snapshot_rows (id uuid primary key default gen_random_uuid(), snapshot_id uuid not null references wip_snapshots(id) on delete cascade, area_id uuid not null references areas(id), user_id uuid not null references users(id), outlet_ref_text text, w1 integer,hk_w1 integer,avg_w1 numeric(18,2),w2 integer,hk_w2 integer,avg_w2 numeric(18,2),w3 integer,hk_w3 integer,avg_w3 numeric(18,2),total_kaleng integer,hk integer,target_mtd integer,acv_mtd numeric(8,4),target_month integer,acv_month numeric(8,4),total_value numeric(18,2),avg_day numeric(18,2),estimasi_gaji numeric(18,2),ratio numeric(8,4),zona_ratio text,sisa_karton numeric(18,2),need_day numeric(18,2),gap_selling numeric(18,2),gap_qty numeric(18,2),status_target text, unique(snapshot_id,user_id,area_id));
create table closing_snapshots (id uuid primary key default gen_random_uuid(), project_id uuid not null references projects(id), month_key text not null, generated_by_user_id uuid references users(id), summary_json jsonb not null, created_at timestamptz not null default now(), unique(project_id,month_key));

create table coaching_records (id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id), project_id uuid not null references projects(id), area_id uuid not null references areas(id), coaching_date date not null, reason_category text not null, summary text, next_action text, due_date date, follow_up_status text, notes text, created_by_user_id uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table pica_records (id uuid primary key default gen_random_uuid(), user_id uuid references users(id), area_id uuid references areas(id), project_id uuid not null references projects(id), problem text not null, category text, root_cause text, action_plan text not null, owner_user_id uuid references users(id), due_date date, status text not null, progress_note text, created_by_user_id uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table issue_records (id uuid primary key default gen_random_uuid(), user_id uuid references users(id), area_id uuid references areas(id), outlet_id uuid references outlets(id), project_id uuid not null references projects(id), issue_date date not null, category text not null, severity text, description text, linked_pica_id uuid references pica_records(id), status text not null, created_by_user_id uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table knowledge_notes (id uuid primary key default gen_random_uuid(), project_id uuid references projects(id), area_id uuid references areas(id), outlet_id uuid references outlets(id), user_id uuid references users(id), note_type text not null, title text not null, content text not null, tags_json jsonb, created_by_user_id uuid references users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table export_templates (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, module_name text not null, format_type text not null, sheet_config_json jsonb not null, column_config_json jsonb not null, style_config_json jsonb not null, active_flag boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table export_jobs (id uuid primary key default gen_random_uuid(), template_id uuid not null references export_templates(id), requested_by_user_id uuid not null references users(id), filters_json jsonb not null, status text not null, file_url text, started_at timestamptz, finished_at timestamptz, error_message text, created_at timestamptz not null default now());
create table export_job_logs (id bigint generated always as identity primary key, export_job_id uuid not null references export_jobs(id) on delete cascade, log_level text not null, message text not null, created_at timestamptz not null default now());
create table audit_logs (id bigint generated always as identity primary key, actor_user_id uuid references users(id), module_name text not null, action_name text not null, target_table text, target_id text, payload_json jsonb, created_at timestamptz not null default now());
create table menu_registry (id uuid primary key default gen_random_uuid(), code text not null unique, label text not null, route text not null, parent_code text, icon text, order_no integer not null default 0, role_visibility_json jsonb not null default '[]', feature_flag text, active_flag boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create index idx_org_assignment_scope on organization_assignments(project_id,area_id,user_id,status);
create index idx_manpower_scope on manpower_assignments(project_id,area_id,user_id,status);
create index idx_attendance_scope on attendance_records(project_id,area_id,attendance_date desc,status);
create index idx_attendance_user_date on attendance_records(user_id,attendance_date desc);
create index idx_daily_scope on daily_reports(project_id,area_id,report_date desc);
create index idx_daily_user_date on daily_reports(user_id,report_date desc);
create index idx_stock_validation_period_scope on stock_validation_periods(project_id,area_id,month_key desc,status);
create index idx_stock_validation_row_period on stock_validation_rows(period_id,user_id,outlet_id);
create index idx_nota_scope on nota_records(project_id,area_id,report_date desc,status);
create index idx_nota_user_date on nota_records(user_id,report_date desc);
create index idx_nota_duplicate on nota_records(duplicate_group_key) where duplicate_group_key is not null;
create index idx_spg_candidates_scope on spg_candidates(project_id,area_id,status,updated_at desc);
create index idx_sampling_scope on sampling_records(project_id,area_id,sampling_date desc);
create index idx_route_session_user_time on route_sessions(user_id,started_at desc);
create index idx_route_point_session_time on route_points(session_id,recorded_at);
create index idx_visit_scope on outlet_visits(project_id,area_id,visit_date desc,visit_status);
create index idx_wip_scope on wip_snapshots(project_id,period_start,period_end);
create index idx_closing_scope on closing_snapshots(project_id,month_key desc);
create index idx_issue_scope on issue_records(project_id,status,issue_date desc);
create index idx_export_jobs_template on export_jobs(template_id,status,created_at desc);
create index idx_audit_logs_actor on audit_logs(actor_user_id,created_at desc);

-- Helper hak akses produksi disimpan di schema private (tidak diekspos Data API).
-- Semua keputusan memakai auth.uid(), bukan role dari browser.
create schema if not exists private;

create or replace function private.current_role_code()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select upper(r.code)
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = (select auth.uid()) and u.status = 'active'
  limit 1
$$;

create or replace function private.can_access_project_area(p_project_id uuid, p_area_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when private.current_role_code() = 'ADMIN' then true
    else exists (
      select 1
      from public.organization_assignments oa
      where oa.user_id = (select auth.uid())
        and oa.project_id = p_project_id
        and oa.status = 'active'
        and (oa.end_date is null or oa.end_date >= current_date)
        and (oa.area_id is null or oa.area_id = p_area_id)
    )
  end
$$;

revoke all on function private.current_role_code() from public;
revoke all on function private.can_access_project_area(uuid,uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.current_role_code() to authenticated;
grant execute on function private.can_access_project_area(uuid,uuid) to authenticated;

-- SPG hanya melihat data miliknya. TL dapat mengelola laporan pada area tugas.
-- SCO, MS, dan AM hanya membaca data pada area tugas.
alter table attendance_records enable row level security;
alter table daily_reports enable row level security;
alter table stock_validation_periods enable row level security;
alter table stock_validation_rows enable row level security;
alter table nota_records enable row level security;
alter table spg_candidates enable row level security;
alter table sampling_records enable row level security;
alter table route_sessions enable row level security;
alter table route_points enable row level security;
alter table outlet_visits enable row level security;
alter table knowledge_notes enable row level security;
alter table export_jobs enable row level security;

revoke all on attendance_records,daily_reports,stock_validation_periods,stock_validation_rows,nota_records,spg_candidates,sampling_records,route_sessions,route_points,outlet_visits,knowledge_notes,export_jobs from anon;
revoke all on daily_reports,nota_records from authenticated;
grant select,insert,update,delete on daily_reports to authenticated;
grant select,insert,update,delete on nota_records to authenticated;
grant select,insert,update,delete on spg_candidates to authenticated;

drop policy if exists daily_reports_read_scope on daily_reports;
create policy daily_reports_read_scope on daily_reports
for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    (select private.current_role_code()) in ('ADMIN','TL','SCO','MS','AM')
    and (select private.can_access_project_area(project_id,area_id))
  )
);

drop policy if exists daily_reports_tl_insert on daily_reports;
create policy daily_reports_tl_insert on daily_reports
for insert to authenticated
with check (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists daily_reports_tl_update on daily_reports;
create policy daily_reports_tl_update on daily_reports
for update to authenticated
using (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
)
with check (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists daily_reports_tl_delete on daily_reports;
create policy daily_reports_tl_delete on daily_reports
for delete to authenticated
using (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists nota_records_read_scope on nota_records;
create policy nota_records_read_scope on nota_records
for select to authenticated
using (
  (select private.current_role_code()) in ('ADMIN','TL','SCO','MS','AM')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists nota_records_tl_insert on nota_records;
create policy nota_records_tl_insert on nota_records
for insert to authenticated
with check (
  (select private.current_role_code()) in ('ADMIN','TL')
  and uploaded_by_user_id = (select auth.uid())
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists nota_records_tl_update on nota_records;
create policy nota_records_tl_update on nota_records
for update to authenticated
using (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
)
with check (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists nota_records_tl_delete on nota_records;
create policy nota_records_tl_delete on nota_records
for delete to authenticated
using (
  (select private.current_role_code()) in ('ADMIN','TL')
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists spg_candidates_tl_read on spg_candidates;
create policy spg_candidates_tl_read on spg_candidates
for select to authenticated
using (
  (select private.current_role_code()) = 'TL'
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists spg_candidates_tl_insert on spg_candidates;
create policy spg_candidates_tl_insert on spg_candidates
for insert to authenticated
with check (
  (select private.current_role_code()) = 'TL'
  and created_by_user_id = (select auth.uid())
  and (select private.can_access_project_area(project_id,area_id))
);

drop policy if exists spg_candidates_tl_update on spg_candidates;
create policy spg_candidates_tl_update on spg_candidates
for update to authenticated
using ((select private.current_role_code()) = 'TL' and (select private.can_access_project_area(project_id,area_id)))
with check ((select private.current_role_code()) = 'TL' and (select private.can_access_project_area(project_id,area_id)));

drop policy if exists spg_candidates_tl_delete on spg_candidates;
create policy spg_candidates_tl_delete on spg_candidates
for delete to authenticated
using ((select private.current_role_code()) = 'TL' and (select private.can_access_project_area(project_id,area_id)));

-- Bucket nota tidak publik. Path: project_id/area_id/daily_report_id/nama-file.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'reporting-nota',
  'reporting-nota',
  false,
  2097152,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists reporting_nota_read_scope on storage.objects;
create policy reporting_nota_read_scope on storage.objects
for select to authenticated
using (
  bucket_id = 'reporting-nota'
  and exists (
    select 1 from public.nota_records n
    where n.file_path = name
      and (select private.current_role_code()) in ('ADMIN','TL','SCO','MS','AM')
      and (select private.can_access_project_area(n.project_id,n.area_id))
  )
);

drop policy if exists reporting_nota_tl_insert on storage.objects;
create policy reporting_nota_tl_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'reporting-nota'
  and (select private.current_role_code()) in ('ADMIN','TL')
  and exists (
    select 1 from public.areas a
    where a.project_id::text = (storage.foldername(name))[1]
      and a.id::text = (storage.foldername(name))[2]
      and (select private.can_access_project_area(a.project_id,a.id))
  )
);

drop policy if exists reporting_nota_tl_update on storage.objects;
create policy reporting_nota_tl_update on storage.objects
for update to authenticated
using (
  bucket_id = 'reporting-nota'
  and (select private.current_role_code()) in ('ADMIN','TL')
  and exists (
    select 1 from public.nota_records n
    where n.file_path = name
      and (select private.can_access_project_area(n.project_id,n.area_id))
  )
)
with check (bucket_id = 'reporting-nota');

drop policy if exists reporting_nota_tl_delete on storage.objects;
create policy reporting_nota_tl_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'reporting-nota'
  and (select private.current_role_code()) in ('ADMIN','TL')
  and exists (
    select 1 from public.nota_records n
    where n.file_path = name
      and (select private.can_access_project_area(n.project_id,n.area_id))
  )
);

-- CV kandidat hanya dibaca melalui Netlify Function setelah login TL.
-- Tidak ada policy browser untuk bucket ini; service_role pada server yang mengaksesnya.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'spg-cv',
  'spg-cv',
  false,
  6291456,
  array['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Penyimpanan keadaan aplikasi v23.
-- Hanya Netlify Function yang memakai service-role key yang boleh membaca/menulis tabel ini.
-- Kunci service-role tidak pernah dikirim ke browser.
create table if not exists public.app_kv_store (
  key text primary key,
  value jsonb,
  text_value text,
  updated_at timestamptz not null default now()
);

alter table public.app_kv_store enable row level security;
revoke all on table public.app_kv_store from anon, authenticated;
grant all on table public.app_kv_store to service_role;

create index if not exists app_kv_store_updated_at_idx on public.app_kv_store(updated_at desc);
