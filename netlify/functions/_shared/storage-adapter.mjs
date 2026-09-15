import { getStore } from '@netlify/blobs';

const DATA_STORE_NAME = 'extra-joss-spg-data';
const RECEIPT_STORE_NAME = 'extra-joss-spg-receipts';
const CANDIDATE_FILE_STORE_NAME = 'extra-joss-spg-candidate-files';
const SUPABASE_KV_TABLE = 'app_kv_store';
const SUPABASE_RECEIPT_BUCKET = 'reporting-nota';
const SUPABASE_CANDIDATE_BUCKET = 'spg-cv';

function cleanBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function supabaseConfiguration() {
  const url = cleanBaseUrl(process.env.SUPABASE_URL || process.env.EXTRA_JOSS_SUPABASE_URL);
  const serviceKey = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXTRA_JOSS_SUPABASE_SECRET_KEY || process.env.EXTRA_JOSS_SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, serviceKey, enabled: Boolean(url && serviceKey) };
}

function encodeStoragePath(path = '') {
  return String(path || '').split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

function dataUrlBytes(dataUrl = '') {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) throw new Error('Isi file tidak valid.');
  return { mimeType: match[1].toLowerCase(), bytes: Buffer.from(match[2], 'base64') };
}

async function responseMessage(response) {
  const body = await response.text().catch(() => '');
  try {
    const parsed = JSON.parse(body);
    return parsed.message || parsed.error || parsed.msg || body;
  } catch {
    return body || `HTTP ${response.status}`;
  }
}

export function createStorageAdapter({ variant = 'clean' } = {}) {
  const supabase = supabaseConfiguration();
  const dataStore = () => getStore({ name: DATA_STORE_NAME, consistency: 'strong' });
  const receiptStore = () => getStore({ name: RECEIPT_STORE_NAME, consistency: 'strong' });
  const candidateFileStore = () => getStore({ name: CANDIDATE_FILE_STORE_NAME, consistency: 'strong' });

  async function supabaseRequest(path, options = {}) {
    if (!supabase.enabled) throw new Error('Supabase belum diaktifkan pada environment Netlify.');
    const response = await fetch(`${supabase.url}${path}`, {
      ...options,
      headers: {
        apikey: supabase.serviceKey,
        authorization: `Bearer ${supabase.serviceKey}`,
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      const error = new Error(`Supabase belum dapat memproses data: ${await responseMessage(response)}`);
      error.status = response.status;
      throw error;
    }
    return response;
  }

  async function getSupabaseRow(key) {
    const query = `/rest/v1/${SUPABASE_KV_TABLE}?key=eq.${encodeURIComponent(key)}&select=key,value,text_value,updated_at&limit=1`;
    const response = await supabaseRequest(query, { headers: { accept: 'application/json' } });
    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] || null : null;
  }

  async function setSupabaseRow(key, values, { onlyIfNew = false } = {}) {
    const prefer = onlyIfNew
      ? 'resolution=ignore-duplicates,return=minimal'
      : 'resolution=merge-duplicates,return=minimal';
    await supabaseRequest(`/rest/v1/${SUPABASE_KV_TABLE}?on_conflict=key`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', prefer },
      body: JSON.stringify({ key, ...values, updated_at: new Date().toISOString() })
    });
  }

  async function getJson(key, options = {}) {
    if (options.legacy || !supabase.enabled) {
      return await dataStore().get(key, { type: 'json', consistency: 'strong' });
    }
    return (await getSupabaseRow(key))?.value ?? null;
  }

  async function setJson(key, value, options = {}) {
    if (options.legacy || !supabase.enabled) {
      return await dataStore().setJSON(key, value, options.onlyIfNew ? { onlyIfNew: true } : undefined);
    }
    return await setSupabaseRow(key, { value, text_value: null }, options);
  }

  async function setJsonLegacy(key, value, options = {}) {
    return await dataStore().setJSON(key, value, options.onlyIfNew ? { onlyIfNew: true } : undefined);
  }

  async function getText(key, options = {}) {
    if (options.legacy || !supabase.enabled) {
      return await dataStore().get(key, { type: 'text', consistency: 'strong' });
    }
    const row = await getSupabaseRow(key);
    return row?.text_value ?? (typeof row?.value === 'string' ? row.value : null);
  }

  async function setText(key, value, options = {}) {
    if (options.legacy || !supabase.enabled) {
      return await dataStore().set(key, String(value), options.onlyIfNew ? { onlyIfNew: true } : undefined);
    }
    return await setSupabaseRow(key, { value: null, text_value: String(value) }, options);
  }

  async function saveReceipt(key, dataUrl, requestedMimeType = '') {
    if (!supabase.enabled) {
      await receiptStore().set(key, dataUrl);
      return { storage: 'netlify-blobs', path: key };
    }
    const { mimeType, bytes } = dataUrlBytes(dataUrl);
    const contentType = String(requestedMimeType || mimeType).toLowerCase();
    const path = `${variant}/${key}`;
    await supabaseRequest(`/storage/v1/object/${SUPABASE_RECEIPT_BUCKET}/${encodeStoragePath(path)}`, {
      method: 'POST',
      headers: { 'content-type': contentType, 'x-upsert': 'true' },
      body: bytes
    });
    return { storage: 'supabase-storage', path };
  }

  async function loadReceipt(key, requestedMimeType = '') {
    if (!supabase.enabled) {
      return await receiptStore().get(key, { type: 'text', consistency: 'strong' });
    }
    const path = `${variant}/${key}`;
    const response = await supabaseRequest(`/storage/v1/object/${SUPABASE_RECEIPT_BUCKET}/${encodeStoragePath(path)}`);
    const mimeType = String(response.headers.get('content-type') || requestedMimeType || 'application/octet-stream').split(';')[0];
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  }

  async function legacyReceipt(key) {
    return await receiptStore().get(key, { type: 'text', consistency: 'strong' });
  }

  async function saveCandidateFile(key, dataUrl, requestedMimeType = '') {
    if (!supabase.enabled) {
      await candidateFileStore().set(key, dataUrl);
      return { storage: 'netlify-blobs', path: key };
    }
    const { mimeType, bytes } = dataUrlBytes(dataUrl);
    const contentType = String(requestedMimeType || mimeType).toLowerCase();
    const path = `${variant}/${key}`;
    await supabaseRequest(`/storage/v1/object/${SUPABASE_CANDIDATE_BUCKET}/${encodeStoragePath(path)}`, {
      method: 'POST',
      headers: { 'content-type': contentType, 'x-upsert': 'true' },
      body: bytes
    });
    return { storage: 'supabase-storage', path };
  }

  async function loadCandidateFile(key, requestedMimeType = '') {
    if (!supabase.enabled) {
      return await candidateFileStore().get(key, { type: 'text', consistency: 'strong' });
    }
    const path = `${variant}/${key}`;
    const response = await supabaseRequest(`/storage/v1/object/${SUPABASE_CANDIDATE_BUCKET}/${encodeStoragePath(path)}`);
    const mimeType = String(response.headers.get('content-type') || requestedMimeType || 'application/octet-stream').split(';')[0];
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  }

  async function legacyCandidateFile(key) {
    return await candidateFileStore().get(key, { type: 'text', consistency: 'strong' });
  }

  async function ping() {
    const startedAt = Date.now();
    if (supabase.enabled) await getSupabaseRow('__healthcheck__');
    else await dataStore().get('__healthcheck__', { type: 'text', consistency: 'strong' });
    return { ok: true, latencyMs: Date.now() - startedAt, mode: supabase.enabled ? 'supabase' : 'netlify-blobs' };
  }

  return {
    mode: supabase.enabled ? 'supabase' : 'netlify-blobs',
    supabaseConfigured: supabase.enabled,
    receiptStorage: supabase.enabled ? 'supabase-storage-private' : 'netlify-blobs',
    getJson,
    setJson,
    setJsonLegacy,
    getText,
    setText,
    saveReceipt,
    loadReceipt,
    legacyReceipt,
    saveCandidateFile,
    loadCandidateFile,
    legacyCandidateFile,
    ping
  };
}
