import seed from '../server/functions/_shared/seed.mjs';
import { createStorageAdapter } from '../server/functions/_shared/storage-adapter.mjs';
import { normalizeStoredData } from '../server/functions/_shared/core.mjs';

const VARIANT = seed.seedMode === 'demo' ? 'demo' : 'clean';
const DATA_KEY = `shared-data-v22-${VARIANT}`;
const BACKUP_INDEX_KEY = `backup-index-v22-${VARIANT}`;
const storage = createStorageAdapter({ variant: VARIANT });

function unauthorized() {
  return Response.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
}

export default async function handler(request) {
  try {
    const cronSecret = String(process.env.CRON_SECRET || '').trim();
    if (cronSecret) {
      const auth = request.headers.get('authorization') || '';
      if (auth !== `Bearer ${cronSecret}`) return unauthorized();
    }

    const data = await storage.getJson(DATA_KEY);
    if (!data) return Response.json({ ok: true, skipped: true, reason: 'Data belum tersedia.' });

    const index = await storage.getJson(BACKUP_INDEX_KEY) || [];
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    if (index.some(row => row.kind === 'otomatis' && row.day === day)) {
      return Response.json({ ok: true, skipped: true, reason: 'Cadangan hari ini sudah ada.' });
    }

    const normalized = normalizeStoredData(data);
    const key = `backup-v22-${VARIANT}-${now.toISOString().replace(/[:.]/g, '-')}`;
    await storage.setJson(key, normalized);
    const row = {
      key,
      day,
      kind: 'otomatis',
      createdAt: now.toISOString(),
      createdBy: 'Vercel Cron',
      revision: Number(normalized.revision || 1),
      users: (normalized.users || []).length,
      outlets: (normalized.outlets || []).length,
      reports: (normalized.reportingDaily || []).length,
      receipts: (normalized.reportingDaily || []).filter(item => item.receiptId).length
    };
    await storage.setJson(BACKUP_INDEX_KEY, [row, ...index].slice(0, 45));
    return Response.json({ ok: true, backup: row, storage: storage.mode });
  } catch (error) {
    console.error('extra-joss-daily-backup', error);
    return Response.json({ ok: false, error: error?.message || 'Cadangan otomatis gagal.' }, { status: 500 });
  }
}
