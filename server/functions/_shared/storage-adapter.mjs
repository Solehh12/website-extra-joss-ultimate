const SUPABASE_KV_TABLE = 'app_kv_store';
const SUPABASE_RECEIPT_BUCKET = 'reporting-nota';
const SUPABASE_CANDIDATE_BUCKET = 'spg-cv';

function cleanBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function supabaseConfiguration() {
  const url = cleanBaseUrl(process.env.SUPABASE_URL || process.env.EXTRA_JOSS_SUPABASE_URL);
  const serviceKey = String(
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.EXTRA_JOSS_SUPABASE_SECRET_KEY ||
    process.env.EXTRA_JOSS_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();
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

  async function supabaseRequest(path, options = {}) {
    if (!supabase.enabled) {
      const error = new Error('Supabase belum dikonfigurasi. Tambahkan SUPABASE_URL dan SUPABASE_SECRET_KEY di Vercel Environment Variables.');
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }

    const target = `${supabase.url}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(target, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          apikey: supabase.serviceKey,
          authorization: `Bearer ${supabase.serviceKey}`,
          ...(options.headers || {})
        }
      });
    } catch (error) {
      const wrapped = new Error(error?.message || 'Gagal menghubungi Supabase.');
      wrapped.code = error?.code || error?.cause?.code || '';
      wrapped.causeCode = error?.cause?.code || '';
      wrapped.causeMessage = error?.cause?.message || '';
      wrapped.target = target;
      wrapped.name = error?.name || wrapped.name;
      throw wrapped;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      const error = new Error(`Supabase error ${response.status}: ${await responseMessage(response)}`);
      error.status = response.status;
      error.target = target;
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

  async function getJson(key) {
    return (await getSupabaseRow(key))?.value ?? null;
  }

  async function setJson(key, value, options = {}) {
    return await setSupabaseRow(key, { value, text_value: null }, options);
  }

  async function setJsonLegacy(key, value, options = {}) {
    return await setJson(key, value, options);
  }

  async function getText(key) {
    const row = await getSupabaseRow(key);
    return row?.text_value ?? (typeof row?.value === 'string' ? row.value : null);
  }

  async function setText(key, value, options = {}) {
    return await setSupabaseRow(key, { value: null, text_value: String(value) }, options);
  }

  async function saveReceipt(key, dataUrl, requestedMimeType = '') {
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
    const path = `${variant}/${key}`;
    const response = await supabaseRequest(`/storage/v1/object/${SUPABASE_RECEIPT_BUCKET}/${encodeStoragePath(path)}`);
    const mimeType = String(response.headers.get('content-type') || requestedMimeType || 'application/octet-stream').split(';')[0];
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  }

  async function legacyReceipt() { return null; }

  async function saveCandidateFile(key, dataUrl, requestedMimeType = '') {
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
    const path = `${variant}/${key}`;
    const response = await supabaseRequest(`/storage/v1/object/${SUPABASE_CANDIDATE_BUCKET}/${encodeStoragePath(path)}`);
    const mimeType = String(response.headers.get('content-type') || requestedMimeType || 'application/octet-stream').split(';')[0];
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  }

  async function legacyCandidateFile() { return null; }

  async function ping() {
    const startedAt = Date.now();
    await supabaseRequest(`/rest/v1/${SUPABASE_KV_TABLE}?select=key&limit=1`, { headers: { accept: 'application/json' } });
    return { ok: true, latencyMs: Date.now() - startedAt, mode: 'supabase' };
  }

  return {
    mode: 'supabase',
    supabaseConfigured: supabase.enabled,
    receiptStorage: 'supabase-storage-private',
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
