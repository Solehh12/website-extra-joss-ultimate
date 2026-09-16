# Website Extra Joss SPG — Vercel + Supabase

## Arsitektur
- Frontend statis: `public/` di Vercel
- API server: Vercel Node.js Function di `/api/extra-joss-api`
- Database: Supabase Postgres melalui server-side REST API
- File privat: Supabase Storage (`reporting-nota`, `spg-cv`)
- Data utama aplikasi: `public.app_kv_store`, key `shared-data-v22-clean`

## Environment Variables Vercel
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Secret key hanya digunakan server-side. Jangan masukkan ke frontend atau repository.

## Deploy
Import repository ke Vercel, pilih preset `Other`, build command `npm run build`, output directory `public`, dan Node.js 22+.

## Health check
`/api/extra-joss-api?action=health`

Expected response:
```json
{"ok":true,"storage":"supabase","supabaseConfigured":true}
```

## Initial data
Run `supabase/schema.sql`, then run `supabase/import_current_backup.sql` once. The import uses `ON CONFLICT DO NOTHING` so it will not overwrite an existing primary dataset row.

## Important scaling note
This release keeps the existing application state model in one JSONB row so the current application behavior stays compatible. It does not claim that one JSONB row is an ideal design for hundreds of thousands of records. For that scale, the application should migrate high-volume collections (outlets, daily placements, reports, routes, audit events) to dedicated relational tables with indexes, pagination, and incremental writes.
