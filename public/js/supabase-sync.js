(function () {
  const TABLES = {
    users: 'web_maps_spg_users',
    areas: 'web_maps_spg_areas',
    outlets: 'web_maps_spg_outlets',
    settings: 'web_maps_spg_settings',
    routes: 'web_maps_spg_routes',
    reporting: 'web_maps_spg_reporting'
  };

  function normalizeUrl(url) {
    return String(url || '').trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/g, '');
  }
  function getConfig(settings) {
    const supabaseUrl = normalizeUrl(settings?.supabaseUrl);
    const supabaseAnonKey = String(settings?.supabaseAnonKey || '').trim();
    if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase URL dan Anon Key belum diisi di menu Pengaturan.');
    if (!/^https:\/\/[^\s]+\.supabase\.co$/i.test(supabaseUrl)) throw new Error('Supabase URL harus seperti https://nama-project.supabase.co tanpa /rest/v1/.');
    if (supabaseAnonKey.length < 20) throw new Error('Supabase Anon Key terlalu pendek. Gunakan publishable key atau legacy anon public key.');
    return { supabaseUrl, supabaseAnonKey };
  }
  function headers(config, prefer) {
    const base = { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}`, 'Content-Type': 'application/json' };
    if (prefer) base.Prefer = prefer;
    return base;
  }
  async function request(config, table, options = {}) {
    const { method = 'GET', query = '', body, prefer } = options;
    const endpoint = `${config.supabaseUrl}/rest/v1/${table}${query}`;
    let response;
    try { response = await fetch(endpoint, { method, headers: headers(config, prefer), body: body ? JSON.stringify(body) : undefined }); }
    catch { throw new Error('Gagal koneksi ke Supabase. Pastikan internet aktif, URL benar, dan website dibuka lewat http://localhost atau Netlify.'); }
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (text.includes('column') || text.includes('schema cache')) throw new Error(`Supabase error ${response.status}: kolom database belum sesuai. Jalankan ulang supabase/schema.sql versi terbaru di SQL Editor. Detail: ${text}`);
      throw new Error(`Supabase error ${response.status}: ${text || response.statusText}`);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  function cleanOutlet(o) {
    return {
      id: o.id,
      name: o.name,
      area: o.area,
      tanda: o.tanda || o.status || 'Outlet baru',
      sold: Number(o.sold || 0),
      phone: o.phone || '',
      lat: Number(o.lat || 0),
      lng: Number(o.lng || 0),
      address: o.address || '',
      photo: o.photo || '',
      marked_by: o.markedBy || o.marked_by || '',
      marked_by_id: o.markedById || o.marked_by_id || '',
      marked_at: o.markedAt || o.marked_at || new Date().toISOString(),
      notes: o.notes || '',
      verification_status: o.verificationStatus || o.verification_status || 'Menunggu Cek',
      verification_note: o.verificationNote || o.verification_note || '',
      location_accuracy: Number(o.accuracy || o.location_accuracy || 0),
      duplicate_warning: o.duplicateWarning || o.duplicate_warning || '',
      tl_note: o.tlNote || o.tl_note || ''
    };
  }
  function cleanUser(user) {
    return {
      id:user.id,
      role:String(user.role||'SPG').toUpperCase(),
      name:user.name||'',
      email:String(user.email||'').toLowerCase(),
      password:user.password||'',
      phone:user.phone||'',
      area:user.allAreas?'All Area':(user.area||user.areas?.[0]||''),
      areas:Array.isArray(user.areas)?user.areas:[],
      all_areas:Boolean(user.allAreas),
      must_change_password:Boolean(user.mustChangePassword),
      status:user.status||'Aktif',
      created_by:user.createdBy||''
    };
  }
  function normalizeUser(user) {
    return {
      ...user,
      role:String(user.role||'SPG').toUpperCase(),
      areas:Array.isArray(user.areas)?user.areas:[],
      allAreas:Boolean(user.all_areas),
      mustChangePassword:Boolean(user.must_change_password),
      createdAt:user.created_at||'',
      createdBy:user.created_by||''
    };
  }
  function normalizeOutlet(o) {
    return {
      id: o.id,
      name: o.name,
      area: o.area,
      tanda: o.tanda || o.status || 'Outlet baru',
      sold: Number(o.sold || 0),
      phone: o.phone || '',
      lat: Number(o.lat || 0),
      lng: Number(o.lng || 0),
      address: o.address || '',
      photo: o.photo || '',
      markedBy: o.marked_by || o.markedBy || o.spg || '',
      markedById: o.marked_by_id || o.markedById || '',
      markedAt: o.marked_at || o.markedAt || new Date().toISOString(),
      notes: o.notes || '',
      verificationStatus: o.verification_status || o.verificationStatus || 'Menunggu Cek',
      verificationNote: o.verification_note || o.verificationNote || '',
      accuracy: Number(o.location_accuracy || o.accuracy || 0),
      duplicateWarning: o.duplicate_warning || o.duplicateWarning || '',
      tlNote: o.tl_note || o.tlNote || ''
    };
  }

  function cleanRoute(r) {
    return {
      id: r.id,
      user_id: r.userId || r.user_id || '',
      user_name: r.userName || r.user_name || '',
      area: r.area || '',
      route_date: r.date || r.route_date || new Date().toISOString().slice(0,10),
      started_at: r.startedAt || r.started_at || new Date().toISOString(),
      ended_at: r.endedAt || r.ended_at || null,
      status: r.status || 'Aktif',
      total_distance_m: Number(r.totalDistanceM || r.total_distance_m || 0),
      points: Array.isArray(r.points) ? r.points : []
    };
  }
  function normalizeRoute(r) {
    return {
      id: r.id,
      userId: r.user_id || r.userId || '',
      userName: r.user_name || r.userName || '',
      area: r.area || '',
      date: r.route_date || r.date || String(r.started_at || r.startedAt || '').slice(0,10),
      startedAt: r.started_at || r.startedAt || new Date().toISOString(),
      endedAt: r.ended_at || r.endedAt || '',
      status: r.status || 'Aktif',
      totalDistanceM: Number(r.total_distance_m || r.totalDistanceM || 0),
      points: Array.isArray(r.points) ? r.points : []
    };
  }

  async function pushAll(data) {
    const config = getConfig(data.settings);
    await upsert(config, TABLES.users, (data.users || []).map(cleanUser));
    await upsert(config, TABLES.areas, (data.areas || []).map(x => ({ ...x })));
    await upsert(config, TABLES.outlets, (data.outlets || []).map(cleanOutlet));
    await upsert(config, TABLES.routes, (data.routes || []).map(cleanRoute));
    await upsert(config, TABLES.settings, [{ id: 'main', value: data.settings }]);
    await upsert(config, TABLES.reporting, [{
      id: 'main',
      value: {
        reportingConfig: data.reportingConfig || {},
        reportingProfiles: data.reportingProfiles || [],
        reportingDaily: data.reportingDaily || [],
        stockLedgers: data.stockLedgers || [],
        coachingRecords: data.coachingRecords || [],
        picaRecords: data.picaRecords || []
      },
      updated_at: new Date().toISOString()
    }]);
    return true;
  }
  async function pullAll(data) {
    const config = getConfig(data.settings);
    const [users, areas, outlets, routes, settings, reporting] = await Promise.all([
      select(config, TABLES.users), select(config, TABLES.areas), select(config, TABLES.outlets), select(config, TABLES.routes), select(config, TABLES.settings), select(config, TABLES.reporting)
    ]);
    const reportingValue = reporting.find(x => x.id === 'main')?.value || {};
    return {
      ...data,
      users: users.length ? users.map(normalizeUser) : data.users,
      areas: areas.length ? areas : data.areas,
      outlets: outlets.length ? outlets.map(normalizeOutlet) : data.outlets,
      routes: routes.length ? routes.map(normalizeRoute) : (data.routes || []),
      settings: settings.find(x => x.id === 'main')?.value || data.settings,
      reportingConfig: reportingValue.reportingConfig || data.reportingConfig,
      reportingProfiles: reportingValue.reportingProfiles || data.reportingProfiles,
      reportingDaily: reportingValue.reportingDaily || data.reportingDaily,
      stockLedgers: reportingValue.stockLedgers || data.stockLedgers,
      coachingRecords: reportingValue.coachingRecords || data.coachingRecords,
      picaRecords: reportingValue.picaRecords || data.picaRecords
    };
  }
  async function upsert(config, table, rows) {
    if (!rows.length) return;
    const chunkSize = 150;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await request(config, table, { method: 'POST', query: '?on_conflict=id', body: rows.slice(i, i + chunkSize), prefer: 'resolution=merge-duplicates,return=minimal' });
    }
  }
  async function select(config, table) {
    const data = await request(config, table, { method: 'GET', query: '?select=*' });
    return data || [];
  }
  window.WebMapsSpgSupabase = { pushAll, pullAll, getConfig, TABLES };
})();
