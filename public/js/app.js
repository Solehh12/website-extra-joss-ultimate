(function () {
  const KEY_DATA = 'web_maps_spg_data_v6_clean_responsive';
  const KEY_USER = 'web_maps_spg_user_v3';
  const KEY_REMEMBER = 'web_maps_spg_remember_login_v1';
  const KEY_SAVED_ACCOUNTS = 'web_maps_spg_saved_accounts_v1';
  const KEY_ADMIN_TEMP_PASSWORDS = 'extra_joss_admin_temp_passwords_v22';
  const KEY_SESSION_PASSWORD = 'extra_joss_session_password_v22';
  const KEY_LOGIN_ATTEMPTS = 'web_maps_spg_login_attempts_v1';
  const KEY_SPG_DRAFT = 'web_maps_spg_outlet_draft_v2';
  const KEY_SPG_BEGINNER = 'web_maps_spg_beginner_seen_v1';
  const KEY_MONITOR_FILTERS = 'extra_joss_monitor_filters_v18';
  const KEY_THEME = 'extra_joss_theme_v20';
  const tandaOptions = ['Outlet baru', 'Sudah dikunjungi', 'Potensial', 'Tutup', 'Menolak'];
  const dateOptions = ['Semua', 'Hari ini', 'Kemarin', '7 hari terakhir', 'Bulan ini'];
  const quickFilterOptions = ['Semua', 'Tanpa foto', 'Tanpa no telp', 'Terjual 0', 'Potensi double', 'GPS kurang akurat'];
  const exportTemplates = ['Lengkap', 'Ringkas', 'Per SPG', 'Per Area', 'Dengan Foto', 'Tanpa Foto', 'Data Mentah'];
  const duplicateRadiusM = 50;
  const SPG_CORRECTION_MINUTES = 30;
  const routeColors = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#db2777'];
  const MANAGEMENT_ROLES = ['ADMIN', 'TL', 'SCO', 'MS', 'AM'];
  const ACCOUNT_ROLE_CATALOG = [
    { key:'ADMIN', label:'Admin', short:'Admin', description:'Khusus mengelola seluruh akun pengguna dan keamanan login.' },
    { key:'TL', label:'Team Leader', short:'TL', description:'Mengelola tim, input, pemeriksaan, coaching, WIP, stock, dan laporan.' },
    { key:'SCO', label:'SCO', short:'SCO', description:'Melihat pencapaian mingguan, laporan, SPG, dan outlet pada area yang ditugaskan.' },
    { key:'MS', label:'MS', short:'MS', description:'Melihat pencapaian mingguan, laporan, SPG, dan outlet pada area yang ditugaskan.' },
    { key:'AM', label:'Area Manager', short:'AM', description:'Melihat pencapaian mingguan, laporan, SPG, dan outlet pada area yang ditugaskan.' },
    { key:'SPG', label:'SPG', short:'SPG', description:'Mengisi aktivitas lapangan dan hanya melihat data miliknya sendiri.' }
  ];
  const ADMIN_MENU_CATALOG = [
    { key:'dashboard', label:'Dashboard', icon:'📊', description:'Ringkasan kegiatan dan hasil utama.' },
    { key:'stockCheck', label:'Cek Stock', icon:'📦', description:'Pencatatan dan pemeriksaan stok per area.' },
    { key:'reportingSpg', label:'Reporting SPG', icon:'🧾', description:'Daily report, WIP, HK, zona, statistik, sampling, dan export.' },
    { key:'receiptRecap', label:'Rekap Nota', icon:'🧾', description:'Nota Reporting SPG per tanggal dan per SPG.' },
    { key:'spg', label:'Data SPG', icon:'👥', description:'Akun, penempatan, target, dan status SPG.' },
    { key:'screeningTraining', label:'Screening & Training', icon:'🎓', description:'Kandidat SPG dari interview sampai hasil join.' },
    { key:'accounts', label:'Manajemen Akun', icon:'🔐', description:'Buat dan atur akun TL, SCO, MS, AM, dan SPG.', locked:true },
    { key:'outlet', label:'Data Outlet', icon:'🏪', description:'Daftar dan pemeriksaan data outlet.' },
    { key:'locationMaster', label:'Master Lokasi Penempatan', icon:'📌', description:'Lokasi acuan kerja SPG.' },
    { key:'dailyPlacement', label:'Penempatan SPG Harian', icon:'🗓️', description:'Jadwal SPG dan lokasi kerja hariannya.' },
    { key:'issues', label:'Outlet Bermasalah', icon:'⚠️', description:'Data yang perlu dicek atau ditindaklanjuti.' },
    { key:'map', label:'Maps Admin', icon:'🗺️', description:'Titik outlet dan area pada peta.' },
    { key:'routeMonitor', label:'Monitoring Jalan SPG', icon:'🛰️', description:'Perjalanan SPG dan kesesuaian lokasi kerja.' },
    { key:'followUp', label:'Tindak Lanjut', icon:'🧭', description:'Satu tempat untuk data yang perlu diperiksa TL.' },
    { key:'export', label:'Export Data', icon:'📤', description:'Laporan outlet dalam Excel atau PDF.' },
    { key:'guide', label:'Panduan', icon:'📘', description:'Petunjuk kerja yang mudah dipahami.' },
    { key:'setting', label:'Pengaturan', icon:'⚙️', description:'Pusat pengaturan sistem.', locked:true }
  ];
  const SPG_MENU_CATALOG = [
    { key:'spgHome', label:'Beranda', icon:'🏠', description:'Ringkasan pekerjaan SPG.', locked:true },
    { key:'spgAdd', label:'Tambah Outlet', icon:'📍', description:'Menandai outlet dan hasil kunjungan.' },
    { key:'spgOutlets', label:'Daftar Outlet', icon:'📋', description:'Riwayat outlet yang sudah ditandai.' },
    { key:'spgProgress', label:'Progress Saya', icon:'📈', description:'Pencapaian selling, HK, sampling, value, ratio, dan sisa target.' },
    { key:'guide', label:'Panduan', icon:'📘', description:'Petunjuk kerja SPG yang sederhana.', locked:true },
    { key:'spgProfile', label:'Profil', icon:'👤', description:'Data akun dan area SPG.' }
  ];
  const REPORTING_TAB_CATALOG = [
    { key:'reporting', label:'Reporting', description:'Hasil kerja dan kehadiran harian.' },
    { key:'spg', label:'Data SPG', description:'Daftar ringkas SPG dan area.' },
    { key:'zona', label:'Zona SPG & Area', description:'Warna pencapaian dan rasio biaya.' },
    { key:'sampling', label:'Sampling', description:'Target, hasil, dan selisih sampling.' },
    { key:'summary', label:'Rangkuman', description:'Ringkasan keputusan untuk TL.' }
  ];
  const OPERATIONS_PAGES = new Set(['dashboard','reportingSpg','receiptRecap','spg','outlet','guide']);
  const ADMIN_ALLOWED_PAGES = new Set(['dashboard','accounts','setting','guide']);
  const TL_ALLOWED_PAGES = new Set([
    'dashboard','stockCheck','reportingSpg','receiptRecap','spg','screeningTraining','outlet','locationMaster','dailyPlacement',
    'issues','map','routeMonitor','followUp','export','guide','setting'
  ]);
  const MONITOR_ALLOWED_PAGES = new Set(OPERATIONS_PAGES);

  let state = {
    data: loadData(),
    user: loadUser(),
    page: 'dashboard',
    search: '',
    map: null,
    spgMap: null,
    mapMode: 'detail',
    showLabels: false,
    pickMarker: null,
    selectedPoint: null,
    selectedPhoto: '',
    filters: { area: 'Semua', spg: 'Semua', tanda: 'Semua', date: 'Semua', quick: 'Semua' },
    exportTemplate: 'Lengkap',
    spgDateFilter: 'Semua',
    spgProgressPeriod: '',
    monitorAreaFilter: '',
    monitorOutletPage: 1,
    monitorOutletPageSize: 10,
    outletDrillArea: '',
    outletDrillSpg: '',
    routeAreaFilter: 'Semua',
    routeLocationStatusFilter: 'Semua',
    accountRoleFilter: 'Semua',
    accountAreaFilter: 'Semua',
    accountStatusFilter: 'Semua',
    assignmentDate: today(),
    placementPickerMap: null,
    placementPickerMarker: null,
    placementPickerPoint: null,
    placementSyncing: false,
    settingsTab: 'general',
    followUpCategory: 'Semua',
    followUpArea: 'Semua',
    followUpSpg: 'Semua',
    candidateStatusFilter: 'Semua',
    candidateAreaFilter: 'Semua',
    candidatePage: 1,
    candidatePageSize: 10,
    editingCandidateId: '',
    candidateCvDraft: null,
    serverBackups: [],
    systemHealth: null,
    deepLinkHandled: false
  };

  let currentLoginPassword = '';

  const icons = {
    dashboard: '📊', stock: '📦', reporting: '🧾', spg: '👥', outlet: '🏪', location: '📌', placement: '🗓️', map: '🗺️', monitor: '🛰️', export: '📤', setting: '⚙️', guide: '📘', ai: '🤖', logout: '↩️', list: '📋', profile: '👤', home: '🏠', add: '📍'
  };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function formatDate(value) { try { return new Date(`${String(value).slice(0,10)}T00:00:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}); } catch { return String(value||'-'); } }
  function nowIso() { return new Date().toISOString(); }
  function number(n) { return new Intl.NumberFormat('id-ID').format(Number(n || 0)); }
  function money(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n || 0)); }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); }
  function escapeAttr(s) { return escapeHtml(s).replace(/`/g, '&#96;'); }
  function val(id) { return document.getElementById(id)?.value || ''; }
  function themePreference() {
    const saved = localStorage.getItem(KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  }
  function applyTheme(theme, persist = true) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = safeTheme;
    document.documentElement.style.colorScheme = safeTheme;
    if (persist) localStorage.setItem(KEY_THEME, safeTheme);
    return safeTheme;
  }
  function themeToggleHtml(extraClass = '') {
    const current = document.documentElement.dataset.theme || themePreference();
    const dark = current === 'dark';
    return `<button class="theme-toggle ${escapeAttr(extraClass)}" id="themeToggleBtn" type="button" aria-label="Gunakan tema ${dark?'terang':'gelap'}" title="Gunakan tema ${dark?'terang':'gelap'}"><span aria-hidden="true">${dark?'☀️':'🌙'}</span><span class="theme-toggle-label">${dark?'Terang':'Gelap'}</span></button>`;
  }
  function bindThemeToggle() {
    const button = document.getElementById('themeToggleBtn');
    if (!button) return;
    button.addEventListener('click', () => {
      const next = (document.documentElement.dataset.theme || themePreference()) === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      button.setAttribute('aria-label', `Gunakan tema ${next === 'dark' ? 'terang' : 'gelap'}`);
      button.setAttribute('title', `Gunakan tema ${next === 'dark' ? 'terang' : 'gelap'}`);
      button.innerHTML = `<span aria-hidden="true">${next === 'dark' ? '☀️' : '🌙'}</span><span class="theme-toggle-label">${next === 'dark' ? 'Terang' : 'Gelap'}</span>`;
    });
  }
  let cloudSaveTimer=null;
  function save() {
    localStorage.setItem(KEY_DATA, JSON.stringify(state.data));
    scheduleSharedSave();
  }
  function scheduleSharedSave(delay=900) {
    const backend=window.ExtraJossBackend;
    if(!backend?.hasToken?.()||!navigator.onLine)return;
    if(cloudSaveTimer)clearTimeout(cloudSaveTimer);
    cloudSaveTimer=setTimeout(async()=>{
      cloudSaveTimer=null;
      try{
        await flushRoutePointQueue();
        await backend.push(state.data);state.sharedSaveError='';
        (state.data.users||[]).forEach(user=>{delete user.password;delete user.passwordHash;});
        state.data.offlineQueue=(state.data.offlineQueue||[]).filter(item=>item.type==='route-point');
        localStorage.setItem(KEY_DATA,JSON.stringify(state.data));
      }
      catch(error){state.sharedSaveError=error.message||'Data belum tersimpan ke server.';if(error.status===409)toast('Data berubah di perangkat lain. Muat ulang halaman sebelum menyimpan kembali.');}
    },delay);
  }
  function useSharedServer(){
    return Boolean(window.ExtraJossBackend&&/^https?:$/.test(location.protocol)&&!['localhost','127.0.0.1'].includes(location.hostname));
  }
  function saveUser() { localStorage.setItem(KEY_USER, JSON.stringify(state.user)); }
  function loadUser() {
    try {
      const user = JSON.parse(localStorage.getItem(KEY_USER) || 'null');
      if(user?.sessionExpiresAt&&Date.now()>Number(user.sessionExpiresAt)){localStorage.removeItem(KEY_USER);return null;}
      return user ? normalizeUser(user) : null;
    } catch { return null; }
  }
  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY_DATA) || 'null');
      if (saved?.settings?.appName) return normalizeData(saved);
    } catch {}
    const seed = normalizeData(clone(window.WEB_MAPS_SPG_SEED));
    localStorage.setItem(KEY_DATA, JSON.stringify(seed));
    return seed;
  }
  function cleanAreaDisplayName(value='') { return String(value||'').replace(/\s*[•-]\s*FOKUS\s*$/i,'').trim(); }
  function normalizeAreaReferences(data){
    const keys=['reportingProfiles','reportingDaily','stockLedgers','coachingRecords','picaRecords','spgCandidates','workShifts'];
    keys.forEach(key=>{if(Array.isArray(data[key]))data[key]=data[key].map(row=>row&&typeof row==='object'?{...row,area:cleanAreaDisplayName(row.area)||row.area||''}:row);});
    const reporting=data.reportingConfig||{};
    ['quotaByArea','expenseByArea','scoByArea'].forEach(key=>{reporting[key]=Object.fromEntries(Object.entries(reporting[key]||{}).map(([area,value])=>[cleanAreaDisplayName(area)||area,value]));});
  }
  function normalizeData(data) {
    data.users = Array.isArray(data.users) ? data.users.map(normalizeUser) : [];
    const adminEmail = 'admin@webmapsspg.local';
    const legacyAdmin = data.users.find(user=>user.email===adminEmail);
    if (legacyAdmin) Object.assign(legacyAdmin,{id:legacyAdmin.id||'u-admin-1',role:'ADMIN',name:'Admin',email:adminEmail,allAreas:true,areas:[],area:'All Area',status:'Aktif'});
    else data.users.unshift(normalizeUser({id:'u-admin-1',role:'ADMIN',name:'Admin',email:adminEmail,password:'admin123',allAreas:true,area:'All Area',status:'Aktif'}));
    data.seedMode = data.seedMode === 'demo' ? 'demo' : 'clean';
    data.settings = data.settings || {};
    data.areas = Array.isArray(data.areas) ? data.areas.map((a, idx) => ({
      id: a.id || uid('a'),
      name: cleanAreaDisplayName(a.name || a.area) || `Area ${idx + 1}`,
      city: a.city || cleanAreaDisplayName(a.name || a.area) || `Area ${idx + 1}`,
      target: Number(a.target || 0),
      color: a.color || routeColors[idx % routeColors.length]
    })) : [];
    const areaNames=data.areas.map(area=>area.name);
    data.users=data.users.map(user=>{
      if(!['SCO','MS','AM'].includes(user.role))return user;
      const selected=[...(Array.isArray(user.areas)?user.areas:[]),user.area].filter(area=>areaNames.includes(area));
      const assigned=[...new Set(selected)];
      const safe=assigned.length?assigned:(areaNames[0]?[areaNames[0]]:[]);
      return normalizeUser({...user,allAreas:false,areas:safe,area:safe[0]||''});
    });
    data.outlets = Array.isArray(data.outlets) ? data.outlets.map((o) => normalizeOutlet(o)) : [];
    data.spgCandidates = Array.isArray(data.spgCandidates) ? data.spgCandidates : [];
    data.reportingConfig = data.reportingConfig || {};
    data.settings.hargaPerPcs=Math.max(0,Number(data.settings.hargaPerPcs||4000));
    data.reportingConfig.defaultSellingPrice=data.settings.hargaPerPcs;
    data.reportingConfig.focusAreas = Array.isArray(data.reportingConfig.focusAreas) ? [...new Set(data.reportingConfig.focusAreas.map(cleanAreaDisplayName).filter(name=>data.areas.some(area=>area.name===name)))] : [];
    normalizeAreaReferences(data);
    data.settings.dataVariant = data.settings.dataVariant === 'demo' || data.seedMode === 'demo' ? 'demo' : 'clean';
    if(!data.settings.appName||['TL SPG Command Center AI','TL SPG Command Center','WEB MAPS SPG'].includes(data.settings.appName))data.settings.appName='Website Extra Joss SPG';
    data.settings.systemControl = normalizeSystemControl(data.settings.systemControl);
    data.settings.auditLog = Array.isArray(data.settings.auditLog) ? data.settings.auditLog.slice(0, 80) : [];
    data.settings.systemVersions = Array.isArray(data.settings.systemVersions) ? data.settings.systemVersions.slice(0, 10) : [];
    data.activityLog = Array.isArray(data.activityLog) ? data.activityLog.slice(0, 300) : [];
    data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
    data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
    data.trash = Array.isArray(data.trash) ? data.trash : [];
    data.changeLog = Array.isArray(data.changeLog) ? data.changeLog.slice(0, 1000) : [];
    data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
    data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
    data.trash = Array.isArray(data.trash) ? data.trash : [];
    data.changeLog = Array.isArray(data.changeLog) ? data.changeLog.slice(0, 1000) : [];
    return data;
  }
  function defaultSystemControl() {
    return {
      adminFeatures: Object.fromEntries(ADMIN_MENU_CATALOG.map(item => [item.key, true])),
      adminMenuOrder: ADMIN_MENU_CATALOG.map(item => item.key),
      spgFeatures: Object.fromEntries(SPG_MENU_CATALOG.map(item => [item.key, true])),
      reportingTabs: Object.fromEntries(REPORTING_TAB_CATALOG.map(item => [item.key, true])),
      fieldRules: {
        requireOutletGps: true,
        requireOutletPhoto: true,
        enableOfflineDraft: true,
        enableRouteTracking: true,
        showTargetProgress: true,
        showReportHistory: true
      },
      reportingExcel: {
        templateMode: 'soleh-july-2026',
        filePrefix: 'DAILY REPORT SPG',
        reporterName: 'SOLEH',
        keepAllSheets: true
      },
      security: {
        minPasswordLength: 8,
        maxLoginAttempts: 5,
        sessionMinutes: 480,
        allowSavedAccounts: true,
        requirePasswordChange: false,
        accountLockMinutes: 15,
        locationNoticeRequired: true,
        trackingViewerRoles: ['TL'],
        routeRetentionDays: 90,
        mfaRoles: ['ADMIN','TL']
      },
      locationStatus: {
        insideLabel: 'Sesuai Lokasi',
        nearbyLabel: 'Di Sekitar Lokasi',
        outsideLabel: 'Di Luar Lokasi',
        noGpsLabel: 'Belum Ada GPS',
        insideMeters: 100,
        nearbyMeters: 500
      },
      contentOverrides: {
        siteName: 'Website Extra Joss SPG',
        loginTitle: 'Website Extra Joss SPG',
        loginSubtitle: 'Pantau pencapaian, laporan, outlet, dan aktivitas SPG dalam satu tempat.',
        dashboardSubtitle: 'Pantau hasil SPG sesuai area dan periode.',
        helpName: 'Solehudin - Team Leader',
        helpPhone: '087805435987',
        footerText: '© 2026 Solehudin. Seluruh hak cipta dilindungi.'
      },
      menuLabels: {},
      customFeatures: [],
      customFields: []
    };
  }
  function normalizeSystemControl(value) {
    const base = defaultSystemControl();
    const input = value || {};
    const knownOrder = ADMIN_MENU_CATALOG.map(item => item.key);
    const savedOrder = Array.isArray(input.adminMenuOrder) ? input.adminMenuOrder.filter(key => knownOrder.includes(key)) : [];
    return {
      adminFeatures: Object.assign({}, base.adminFeatures, input.adminFeatures || {}),
      adminMenuOrder: [...new Set([...savedOrder, ...knownOrder])],
      spgFeatures: Object.assign({}, base.spgFeatures, input.spgFeatures || {}),
      reportingTabs: Object.assign({}, base.reportingTabs, input.reportingTabs || {}),
      fieldRules: Object.assign({}, base.fieldRules, input.fieldRules || {}),
      reportingExcel: Object.assign({}, base.reportingExcel, input.reportingExcel || {}),
      locationStatus: Object.assign({}, base.locationStatus, input.locationStatus || {}),
      contentOverrides: Object.assign({}, base.contentOverrides, input.contentOverrides || {}),
      menuLabels: Object.assign({}, base.menuLabels, input.menuLabels || {}),
      customFeatures: Array.isArray(input.customFeatures) ? input.customFeatures.map(item=>({
        id:String(item.id||uid('feature')),label:String(item.label||'Fitur Baru'),icon:String(item.icon||'🧩'),
        description:String(item.description||''),content:String(item.content||''),active:item.active!==false,
        roles:Array.isArray(item.roles)&&item.roles.length?[...new Set(item.roles.map(role=>String(role).toUpperCase()).filter(role=>ACCOUNT_ROLE_CATALOG.some(item=>item.key===role)))]:['TL']
      })) : [],
      customFields: Array.isArray(input.customFields) ? input.customFields.map(item=>({
        id:String(item.id||uid('field')),location:['outlet','spg','reporting'].includes(item.location)?item.location:'outlet',
        label:String(item.label||'Field Baru'),type:['text','number','date','select','textarea'].includes(item.type)?item.type:'text',
        placeholder:String(item.placeholder||''),options:Array.isArray(item.options)?item.options.map(String):String(item.options||'').split(',').map(value=>value.trim()).filter(Boolean),
        required:Boolean(item.required),active:item.active!==false
      })) : [],
      security: Object.assign({}, base.security, input.security || {}, {
        requirePasswordChange:false,
        locationNoticeRequired:true,
        trackingViewerRoles:['TL']
      })
    };
  }
  function systemControl() {
    state.data.settings.systemControl = normalizeSystemControl(state.data.settings.systemControl);
    return state.data.settings.systemControl;
  }
  function contentSetting(key, fallback = '') { return String(systemControl().contentOverrides?.[key] || fallback); }
  function menuCopy(item) {
    const custom=systemControl().menuLabels?.[item.key]||{};
    return Object.assign({},item,{label:String(custom.label||item.label),description:String(custom.description||item.description||'')});
  }
  function customFeaturesFor(user = state.user) {
    const role=String(user?.role||'').toUpperCase();
    return systemControl().customFeatures.filter(item=>item.active!==false&&item.roles.includes(role));
  }
  function customFeatureByKey(key) { return systemControl().customFeatures.find(item=>`custom-${item.id}`===key); }
  function customFeatureAllowed(key,user=state.user) { const item=customFeatureByKey(key);return Boolean(item&&item.active!==false&&item.roles.includes(String(user?.role||'').toUpperCase())); }
  function customFieldsFor(location) { return systemControl().customFields.filter(item=>item.active!==false&&item.location===location); }
  function featureEnabled(key, role = isAdmin() ? 'admin' : 'spg') {
    const catalog = role === 'admin' ? ADMIN_MENU_CATALOG : SPG_MENU_CATALOG;
    const item = catalog.find(entry => entry.key === key);
    if (item?.locked || key === 'logout') return true;
    const flags = role === 'admin' ? systemControl().adminFeatures : systemControl().spgFeatures;
    return flags[key] !== false;
  }
  function adminPageAllowed(key) {
    if (canManageAccounts()) return ADMIN_ALLOWED_PAGES.has(key);
    if (canManageSystem()) return TL_ALLOWED_PAGES.has(key);
    return isMonitorRole() && MONITOR_ALLOWED_PAGES.has(key);
  }
  function securitySettings() {
    const security = systemControl().security;
    security.minPasswordLength = Math.max(8, Math.min(32, Number(security.minPasswordLength || 8)));
    security.maxLoginAttempts = Math.max(3, Math.min(10, Number(security.maxLoginAttempts || 5)));
    security.sessionMinutes = Math.max(30, Math.min(1440, Number(security.sessionMinutes || 480)));
    security.accountLockMinutes = Math.max(5, Math.min(60, Number(security.accountLockMinutes || 15)));
    security.routeRetentionDays = [60,90].includes(Number(security.routeRetentionDays)) ? Number(security.routeRetentionDays) : 90;
    security.requirePasswordChange = false;
    security.locationNoticeRequired = true;
    security.trackingViewerRoles = ['TL'];
    security.mfaRoles = ['ADMIN','TL'];
    return security;
  }
  function minimumPasswordLength() { return securitySettings().minPasswordLength; }
  function fieldRules() { return systemControl().fieldRules; }
  function locationStatusSettings() {
    const rules=systemControl().locationStatus;
    rules.insideLabel=String(rules.insideLabel||'Sesuai Lokasi').trim()||'Sesuai Lokasi';
    rules.nearbyLabel=String(rules.nearbyLabel||'Di Sekitar Lokasi').trim()||'Di Sekitar Lokasi';
    rules.outsideLabel=String(rules.outsideLabel||'Di Luar Lokasi').trim()||'Di Luar Lokasi';
    rules.noGpsLabel=String(rules.noGpsLabel||'Belum Ada GPS').trim()||'Belum Ada GPS';
    rules.insideMeters=Math.max(20,Math.min(2000,Number(rules.insideMeters||100)));
    rules.nearbyMeters=Math.max(rules.insideMeters+10,Math.min(10000,Number(rules.nearbyMeters||500)));
    return rules;
  }
  function rememberSettingChange(summary) {
    const actor = state.user?.name || 'Pengguna';
    state.data.settings.auditLog = [{ at:nowIso(), actor, summary }, ...(state.data.settings.auditLog || [])].slice(0, 80);
    rememberActivity('PERUBAHAN', summary, actor);
  }
  function rememberActivity(type, summary, actor = state.user?.name || 'Pengguna') {
    state.data.activityLog = [{ id:uid('activity'), at:nowIso(), type, actor, role:state.user?.role || '', summary }, ...(state.data.activityLog || [])].slice(0, 300);
  }
  function settingsVersionSnapshot(label = 'Sebelum perubahan') {
    const settings = clone(state.data.settings || {});
    delete settings.auditLog;
    delete settings.systemVersions;
    return {
      id: uid('settings-version'), at: nowIso(), actor: state.user?.name || 'Admin', label,
      settings, reportingConfig: clone(state.data.reportingConfig || {}), areas: clone(state.data.areas || [])
    };
  }
  function saveSettingsVersion(label) {
    state.data.settings.systemVersions = [settingsVersionSnapshot(label), ...(state.data.settings.systemVersions || [])].slice(0, 10);
  }
  function restoreSettingsVersion(id = '') {
    const versions = state.data.settings.systemVersions || [];
    const previous = id ? versions.find(item => item.id === id) : versions[0];
    if (!previous) return toast('Belum ada versi pengaturan sebelumnya.');
    if (!confirm(`Kembalikan pengaturan ke versi ${formatDateTime(previous.at)}?`)) return;
    const current = settingsVersionSnapshot('Sebelum pengaturan dikembalikan');
    const auditLog = state.data.settings.auditLog || [];
    state.data.settings = Object.assign({}, clone(previous.settings || {}), {
      auditLog,
      systemVersions: [current, ...versions.filter(item => item.id !== previous.id)].slice(0, 10)
    });
    state.data.reportingConfig = clone(previous.reportingConfig || {});
    state.data.areas = clone(previous.areas || state.data.areas || []);
    state.data = normalizeData(state.data);
    rememberSettingChange(`Pengaturan dikembalikan ke versi ${formatDateTime(previous.at)}.`);
    save(); toast('Pengaturan versi sebelumnya sudah dipulihkan.'); render();
  }
  function normalizeOutlet(o) {
    const rawLat=o.lat??o.latitude,rawLng=o.lng??o.longitude,parsedLat=rawLat===null||rawLat===undefined||rawLat===''?NaN:Number(rawLat),parsedLng=rawLng===null||rawLng===undefined||rawLng===''?NaN:Number(rawLng);
    return {
      id: o.id || uid('o'),
      name: o.name || o.outlet || 'Outlet tanpa nama',
      area: cleanAreaDisplayName(o.area) || 'Banjarmasin',
      tanda: o.tanda || o.status || 'Outlet baru',
      sold: Number(o.sold ?? o.selling ?? 0),
      phone: o.phone || o.owner_phone || '',
      lat: Number.isFinite(parsedLat)?parsedLat:undefined,
      lng: Number.isFinite(parsedLng)?parsedLng:undefined,
      address: o.address || '',
      photo: o.photo || o.photo_url || '',
      markedBy: o.markedBy || o.marked_by || o.spg || 'Belum diketahui',
      markedById: o.markedById || o.marked_by_id || '',
      markedAt: o.markedAt || o.marked_at || nowIso(),
      notes: o.notes || '',
      verificationStatus: o.verificationStatus || o.verification_status || 'Menunggu Cek',
      verificationNote: o.verificationNote || o.verification_note || '',
      accuracy: Number(o.accuracy || o.location_accuracy || 0),
      duplicateWarning: o.duplicateWarning || o.duplicate_warning || '',
      tlNote: o.tlNote || o.tl_note || '',
      correctedAt: o.correctedAt || o.corrected_at || '',
      correctedById: o.correctedById || o.corrected_by_id || '',
      customFields: o.customFields && typeof o.customFields === 'object' ? o.customFields : {}
    };
  }

  function normalizeUser(user = {}) {
    const role = ACCOUNT_ROLE_CATALOG.some(item => item.key === String(user.role || '').toUpperCase())
      ? String(user.role).toUpperCase()
      : 'SPG';
    const legacyAll = ['all area', 'semua area'].includes(String(user.area || '').trim().toLowerCase());
    const areaList = Array.isArray(user.areas)
      ? user.areas.map(cleanAreaDisplayName).filter(Boolean)
      : (!legacyAll && user.area ? [cleanAreaDisplayName(user.area)] : []);
    const monitorRole=['SCO','MS','AM'].includes(role);
    const allAreas = role === 'ADMIN' || (!monitorRole && Boolean(user.allAreas || legacyAll));
    return Object.assign({}, user, {
      role,
      name: String(user.name || '').trim(),
      email: String(user.email || '').trim().toLowerCase(),
      phone: String(user.phone || ''),
      status: user.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif',
      allAreas,
      areas: allAreas ? [] : [...new Set(areaList)],
      area: allAreas ? 'All Area' : (areaList[0] || ''),
      mustChangePassword: false,
      failedLoginCount: Math.max(0, Number(user.failedLoginCount || 0)),
      blockedUntil: user.blockedUntil || '',
      lastLoginAt: user.lastLoginAt || '',
      lastLoginDevice: user.lastLoginDevice || '',
      createdAt: user.createdAt || '',
      createdBy: user.createdBy || ''
    });
  }
  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }

  function isAdmin() { return MANAGEMENT_ROLES.includes(String(state.user?.role || '').toUpperCase()); }
  function canManageSystem() { return String(state.user?.role || '').toUpperCase() === 'TL'; }
  function canManageAccounts() { return String(state.user?.role || '').toUpperCase() === 'ADMIN'; }
  function canManageSettings() { return ['ADMIN','TL'].includes(String(state.user?.role || '').toUpperCase()); }
  function isMonitorRole() { return ['SCO', 'MS', 'AM'].includes(String(state.user?.role || '').toUpperCase()); }
  function roleInfo(role) { return ACCOUNT_ROLE_CATALOG.find(item => item.key === String(role || '').toUpperCase()) || ACCOUNT_ROLE_CATALOG.at(-1); }
  function roleLabel(role) { return roleInfo(role).short; }
  function displayUserName(user = state.user) {
    if (!user) return '';
    const role = String(user.role || '').toUpperCase();
    if (role === 'ADMIN') return user.name || 'Admin';
    if (['TL','SCO','MS','AM'].includes(role)) return `${user.name || role} / ${roleLabel(role)}`;
    return user.name || 'SPG';
  }
  function userHasAllAreas(user = state.user) {
    const role=String(user?.role||'').toUpperCase();
    if(['SCO','MS','AM'].includes(role))return false;
    return Boolean(user?.allAreas||role==='ADMIN');
  }
  function userAreaScope(user = state.user) {
    if (!user) return [];
    if (userHasAllAreas(user)) return areas().map(area => area.name);
    const list = Array.isArray(user.areas) && user.areas.length ? user.areas : (user.area ? [user.area] : []);
    return [...new Set(list.filter(Boolean))];
  }
  function monitorSelectedArea() {
    const allowed=userAreaScope();
    if(!state.monitorAreaFilter){try{state.monitorAreaFilter=JSON.parse(localStorage.getItem(KEY_MONITOR_FILTERS)||'{}')?.[state.user?.id||'monitor']?.area||'';}catch{}}
    if(!allowed.includes(state.monitorAreaFilter))state.monitorAreaFilter=allowed[0]||'';
    return state.monitorAreaFilter;
  }
  function monitorAreaPicker() {
    const allowed=userAreaScope(),selected=monitorSelectedArea();
    if(!allowed.length)return '<div class="notice warning"><b>Area belum ditentukan.</b><small>Hubungi Admin untuk memilih area akun ini.</small></div>';
    return `<div class="card monitor-area-picker"><div><span class="settings-kicker">Area yang dipantau</span><h3>${escapeHtml(selected)}</h3><small>Dashboard, outlet, laporan, dan Data SPG mengikuti area ini.</small></div>${allowed.length>1?`<label class="field"><span>Pilih area</span><select id="monitorAreaFilter">${allowed.map(area=>`<option ${area===selected?'selected':''}>${escapeHtml(area)}</option>`).join('')}</select></label>`:`<span class="badge blue">Area akun</span>`}</div>`;
  }
  function canAccessArea(areaName, user = state.user) {
    if (!user || userHasAllAreas(user)) return true;
    return userAreaScope(user).includes(areaName);
  }
  function accountScopeLabel(user) {
    if (userHasAllAreas(user)) return 'Semua Area';
    return userAreaScope(user).join(', ') || 'Belum ditentukan';
  }
  function scopedByArea(rows, key = 'area') {
    if (!isAdmin() || userHasAllAreas()) return rows;
    return rows.filter(row => canAccessArea(row?.[key]));
  }
  function spgList() {
    const rows = state.data.users.filter(u => u.role === 'SPG');
    return isAdmin() ? scopedByArea(rows) : rows;
  }
  function areas() { return state.data.areas || []; }
  function areaPrice(areaName) {
    return Number(state.data.settings.hargaPerPcs ?? 4000);
  }
  function outletValue(o) { return Number(o?.sold || 0) * areaPrice(o?.area); }
  function outlets() { return (state.data.outlets || []).map(normalizeOutlet); }
  function ownOutlets() { return outlets().filter(o => o.markedById === state.user?.id || o.markedBy === state.user?.name); }
  function visibleOutlets() {
    let rows = isAdmin() ? scopedByArea(outlets()) : ownOutlets();
    if (state.filters.area !== 'Semua') rows = rows.filter(o => o.area === state.filters.area);
    if (state.filters.spg !== 'Semua') rows = rows.filter(o => o.markedBy === state.filters.spg);
    if (state.filters.tanda !== 'Semua') rows = rows.filter(o => o.tanda === state.filters.tanda);
    rows = applyDateFilter(rows);
    rows = applyQuickFilter(rows);
    rows = smartSearchRows(rows, state.search);
    return rows;
  }
  function metrics(rows = outlets()) {
    const todayCount = rows.filter(o => String(o.markedAt || '').slice(0, 10) === today()).length;
    const sold = rows.reduce((s, o) => s + Number(o.sold || 0), 0);
    const value = rows.reduce((s, o) => s + outletValue(o), 0);
    return {
      outlets: rows.length,
      sold,
      value,
      todayCount,
      spgs: new Set(rows.map(o => o.markedBy).filter(Boolean)).size,
      potential: rows.filter(o => o.tanda === 'Potensial').length,
      issue: rows.filter(o => ['Tutup', 'Menolak'].includes(o.tanda)).length,
      visited: rows.filter(o => o.tanda === 'Sudah dikunjungi').length,
      duplicate: duplicateCandidates(rows).length,
      withPhoto: rows.filter(o => o.photo).length
    };
  }

  function potentialLevel(o) {
    const sold = Number(o?.sold || 0);
    if (sold >= 24) return { label: 'Potensial Tinggi', color: 'green', note: 'Terjual minimal 24 kaleng' };
    if (sold >= 6) return { label: 'Potensial Sedang', color: 'yellow', note: 'Terjual 6–23 kaleng' };
    return { label: 'Potensial Rendah', color: 'gray', note: 'Terjual 0–5 kaleng' };
  }
  function potentialGroups(rows = outlets()) {
    return {
      high: rows.filter(o => Number(o.sold || 0) >= 24),
      medium: rows.filter(o => Number(o.sold || 0) >= 6 && Number(o.sold || 0) < 24),
      low: rows.filter(o => Number(o.sold || 0) < 6)
    };
  }
  function coverageRows(rows = outlets()) {
    const list = areas().map(a => {
      const areaRows = rows.filter(o => o.area === a.name);
      const outletCount = areaRows.length;
      const sold = areaRows.reduce((sum,o)=>sum+Number(o.sold||0),0);
      let status = 'Minim titik'; let color = 'red'; let advice = 'Tambah titik outlet di area ini.';
      if (outletCount >= 8) { status = 'Coverage kuat'; color = 'green'; advice = 'Area sudah cukup padat, lanjut jaga kualitas data.'; }
      else if (outletCount >= 4) { status = 'Coverage sedang'; color = 'yellow'; advice = 'Masih bisa ditambah beberapa titik outlet.'; }
      return { area:a.name, city:a.city||a.name, outlet: outletCount, sold, value: areaRows.reduce((sum,o)=>sum+outletValue(o),0), status, color, advice };
    });
    return list.sort((a,b)=>a.outlet-b.outlet || b.sold-a.sold);
  }
  function workflowSection() {
    const steps = [
      ['1','SPG menandai outlet','SPG buka maps, pilih titik outlet, isi nama, tanda outlet, area, kaleng terjual, dan foto.'],
      ['2','Data otomatis masuk dashboard','Outlet yang ditandai langsung masuk ke Data Outlet, Maps Admin, grafik, dan ringkasan TL.'],
      ['3','TL membaca keputusan','TL melihat area minim titik, outlet potensial, outlet bermasalah, dan SPG paling aktif.'],
      ['4','Export laporan','TL export Excel/PDF berdasarkan filter area, SPG, tanda outlet, dan tanggal.'],
      ['5','Siap database','Saat sudah online, data tinggal disambungkan ke Supabase agar aman dan bisa dipakai banyak device.']
    ];
    return `<div class="workflow-grid">${steps.map(s => `<div class="workflow-card"><b>${s[0]}</b><h4>${escapeHtml(s[1])}</h4><p>${escapeHtml(s[2])}</p></div>`).join('')}</div>`;
  }
  function decisionCenter(rows = outlets()) {
    const m = metrics(rows);
    const topSpg = bySpg(rows)[0];
    const topArea = byArea(rows).sort((a,b)=>b.sold-a.sold)[0];
    const lowCoverage = coverageRows(rows).find(x => x.outlet > 0) || coverageRows(rows)[0];
    const bestOutlet = topSellingOutlets(rows, 1)[0];
    const pg = potentialGroups(rows);
    return `<div class="decision-grid">
      ${decisionItem('Hari ini sudah ada berapa titik?', `${number(m.todayCount)} outlet`, 'Cek aktivitas penandaan terbaru dari SPG.', 'blue')}
      ${decisionItem('Area mana paling aktif?', topArea ? `${topArea.area}` : '-', topArea ? `${number(topArea.sold)} kaleng terjual` : 'Belum ada data.', 'green')}
      ${decisionItem('Area mana perlu didorong?', lowCoverage ? `${lowCoverage.area}` : '-', lowCoverage ? `${number(lowCoverage.outlet)} titik • ${lowCoverage.status}` : 'Belum ada area.', lowCoverage?.color || 'yellow')}
      ${decisionItem('SPG paling aktif?', topSpg ? topSpg.spg : '-', topSpg ? `${number(topSpg.outlet)} outlet • ${number(topSpg.sold)} kaleng` : 'Belum ada data.', 'purple')}
      ${decisionItem('Outlet paling potensial?', bestOutlet ? bestOutlet.name : '-', bestOutlet ? `${number(bestOutlet.sold)} kaleng • ${bestOutlet.area}` : 'Belum ada data.', 'green')}
      ${decisionItem('Outlet potensial tinggi?', `${number(pg.high.length)} outlet`, 'Terjual minimal 24 kaleng.', 'green')}
    </div>`;
  }
  function decisionItem(title, value, note, color='blue') {
    return `<div class="decision-item"><span class="badge ${color}">${escapeHtml(title)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></div>`;
  }
  function coverageSection(rows = outlets()) {
    const list = coverageRows(rows);
    return `<div class="coverage-list">${list.map(x => `<div class="coverage-row"><div><b>${escapeHtml(x.area)}</b><small>${escapeHtml(x.city)} • ${number(x.outlet)} outlet • ${number(x.sold)} kaleng</small></div><span class="badge ${x.color}">${escapeHtml(x.status)}</span><p>${escapeHtml(x.advice)}</p></div>`).join('')}</div>`;
  }
  function potentialSection(rows = outlets()) {
    const groups = potentialGroups(rows);
    return `<div class="potential-grid">
      <div class="potential-card green"><b>${number(groups.high.length)}</b><span>Potensial Tinggi</span><small>Terjual ≥ 24 kaleng</small></div>
      <div class="potential-card yellow"><b>${number(groups.medium.length)}</b><span>Potensial Sedang</span><small>Terjual 6–23 kaleng</small></div>
      <div class="potential-card gray"><b>${number(groups.low.length)}</b><span>Potensial Rendah</span><small>Terjual 0–5 kaleng</small></div>
    </div><div style="margin-top:14px">${topOutletList(rows)}</div>`;
  }
  function databasePrepSection() {
    const checks = [
      ['Akun tersimpan bersama', 'Akun yang dibuat Admin dapat dipakai dari perangkat lain'],
      ['Batas akses aktif', 'SCO/MS/AM hanya melihat area tugas; SPG hanya data miliknya'],
      ['Password dilindungi', 'Password tidak disimpan sebagai tulisan biasa di penyimpanan bersama'],
      ['Export tetap dari web', 'Excel/PDF mengikuti data dan filter yang sedang tampil'],
      ['Cadangan tetap tersedia', 'Backup JSON dapat disimpan sebagai cadangan tambahan']
    ];
    return `<div class="db-prep"><div class="notice good"><b>Data bersama sudah aktif.</b><small>Perubahan dikirim otomatis saat internet tersedia. Tidak perlu menekan tombol sinkronisasi.</small></div><div class="stat-list">${checks.map(c => statLine(c[0], c[1], 'blue')).join('')}</div></div>`;
  }
  function byArea(rows = outlets()) {
    return areas().map(a => {
      const list = rows.filter(o => o.area === a.name);
      return { area: a.name, outlet: list.length, sold: list.reduce((s,o)=>s+Number(o.sold||0),0), value: list.reduce((s,o)=>s+outletValue(o),0), pricePerCan: areaPrice(a.name), today: list.filter(o => String(o.markedAt || '').slice(0, 10) === today()).length };
    }).filter(x => x.outlet || isAdmin());
  }
  function bySpg(rows = outlets()) {
    const names = [...new Set(rows.map(o => o.markedBy).filter(Boolean))];
    return names.map(name => {
      const list = rows.filter(o => o.markedBy === name);
      const user = spgList().find(s => s.name === name);
      return { spg: name, area: user?.area || list[0]?.area || '-', outlet: list.length, sold: list.reduce((s,o)=>s+Number(o.sold||0),0), value: list.reduce((s,o)=>s+outletValue(o),0), today: list.filter(o => String(o.markedAt || '').slice(0, 10) === today()).length };
    }).sort((a,b) => b.sold - a.sold || b.outlet - a.outlet);
  }

  function applyDateFilter(rows) {
    const mode = state.filters.date || 'Semua';
    if (mode === 'Semua') return rows;
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayStart = startOfDay(now);
    return rows.filter(o => {
      const d = new Date(o.markedAt || 0);
      if (Number.isNaN(d.getTime())) return false;
      if (mode === 'Hari ini') return d >= todayStart;
      if (mode === 'Kemarin') {
        const y0 = new Date(todayStart); y0.setDate(y0.getDate() - 1);
        return d >= y0 && d < todayStart;
      }
      if (mode === '7 hari terakhir') {
        const d7 = new Date(todayStart); d7.setDate(d7.getDate() - 6);
        return d >= d7;
      }
      if (mode === 'Bulan ini') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  }

  function applyQuickFilter(rows) {
    const mode = state.filters.quick || 'Semua';
    if (mode === 'Semua') return rows;
    if (mode === 'Tanpa foto') return rows.filter(o => !o.photo);
    if (mode === 'Tanpa no telp') return rows.filter(o => !String(o.phone || '').trim());
    if (mode === 'Terjual 0') return rows.filter(o => Number(o.sold || 0) === 0);
    if (mode === 'Potensi double') return rows.filter(o => o.duplicateWarning || findNearbyDuplicates(o, outlets()).length);
    if (mode === 'GPS kurang akurat') return rows.filter(o => Number(o.accuracy || 0) > 100);
    return rows;
  }
  function smartSearchRows(rows, raw) {
    const q = String(raw || '').trim().toLowerCase();
    if (!q) return rows;
    const tokens = q.split(/\s+/).filter(Boolean);
    return rows.filter(o => tokens.every(t => {
      if (t.startsWith('area:')) return o.area.toLowerCase().includes(t.slice(5));
      if (t.startsWith('spg:')) return o.markedBy.toLowerCase().includes(t.slice(4));
      if (t.startsWith('tanda:')) return o.tanda.toLowerCase().includes(t.slice(6));
      if (t === 'double') return !!o.duplicateWarning || findNearbyDuplicates(o, outlets()).length > 0;
      if (t === 'gps') return Number(o.accuracy || 0) > 100;
      if (t === 'foto:no' || t === 'tanpafoto') return !o.photo;
      if (t === 'foto:ada') return !!o.photo;
      if (t === 'telp:no' || t === 'tanpatelp') return !String(o.phone || '').trim();
      if (t === 'telp:ada') return !!String(o.phone || '').trim();
      const soldCompare = t.match(/^terjual([<>=]+)(\d+)$/);
      if (soldCompare) {
        const v = Number(o.sold || 0), n = Number(soldCompare[2]);
        if (soldCompare[1] === '>') return v > n;
        if (soldCompare[1] === '>=') return v >= n;
        if (soldCompare[1] === '<') return v < n;
        if (soldCompare[1] === '<=') return v <= n;
        return v === n;
      }
      return [o.name, o.area, o.tanda, o.phone, o.markedBy, o.address, o.notes, o.tlNote, String(o.sold || '')]
        .some(v => String(v || '').toLowerCase().includes(t));
    }));
  }
  function dataHealthMetrics(rows = outlets()) {
    const total = Math.max(1, rows.length);
    const m = metrics(rows);
    const noPhone = rows.filter(o => !String(o.phone || '').trim()).length;
    const zeroSold = rows.filter(o => Number(o.sold || 0) === 0).length;
    const badGps = rows.filter(o => Number(o.accuracy || 0) > 100).length;
    const dup = duplicateCandidates(rows).length;
    const score = Math.max(0, Math.round(100 - ((m.outlets - m.withPhoto) * 20 + dup * 18 + badGps * 12 + zeroSold * 5 + noPhone * 2) / total));
    return {
      total: rows.length,
      score,
      photoPct: Math.round(m.withPhoto / total * 100),
      phonePct: Math.round((rows.length - noPhone) / total * 100),
      duplicate: dup,
      badGps,
      noPhone,
      zeroSold
    };
  }
  function healthDashboard(rows = outlets()) {
    const h = dataHealthMetrics(rows);
    const color = h.score >= 85 ? 'green' : h.score >= 65 ? 'yellow' : 'red';
    return `<div class="health-wrap"><div class="health-score ${color}"><b>${h.score}</b><span>Skor Kesehatan Data</span></div><div class="stat-list">
      ${statLine('Foto lengkap', h.photoPct + '%', h.photoPct >= 90 ? 'green' : 'yellow')}
      ${statLine('No telp terisi', h.phonePct + '%', h.phonePct >= 50 ? 'green' : 'gray')}
      ${statLine('Potensi double', h.duplicate, h.duplicate ? 'red' : 'green')}
      ${statLine('GPS kurang akurat', h.badGps, h.badGps ? 'yellow' : 'green')}
      ${statLine('Outlet terjual 0', h.zeroSold, h.zeroSold ? 'yellow' : 'green')}
    </div></div>`;
  }
  function aiSummaryText(rows = outlets()) {
    const m = metrics(rows); const h = dataHealthMetrics(rows); const top = bySpg(rows)[0]; const best = topSellingOutlets(rows, 1)[0];
    const parts = [];
    parts.push(`Pada filter ini terdapat ${number(m.outlets)} outlet yang ditandai oleh ${number(m.spgs)} SPG dengan total ${number(m.sold)} kaleng terjual dan estimasi nilai ${money(m.value)}.`);
    if (top) parts.push(`SPG paling aktif adalah ${top.spg} dengan ${number(top.outlet)} outlet dan ${number(top.sold)} kaleng.`);
    if (best) parts.push(`Outlet dengan penjualan tertinggi adalah ${best.name} di area ${best.area} dengan ${number(best.sold)} kaleng.`);
    parts.push(`Kesehatan data berada di skor ${h.score}/100, dengan ${number(h.duplicate)} potensi double dan ${number(h.badGps)} titik GPS kurang akurat.`);
    if (h.noPhone) parts.push(`${number(h.noPhone)} outlet belum memiliki nomor telepon, sehingga bisa dilengkapi jika dibutuhkan untuk follow up.`);
    return parts.join(' ');
  }
  function selectedExportTemplate() { return state.exportTemplate || 'Lengkap'; }
  function getExportRows() {
    let rows = visibleOutlets().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt));
    const t = selectedExportTemplate();
    if (t === 'Dengan Foto') rows = rows.filter(o => o.photo);
    if (t === 'Tanpa Foto') rows = rows.filter(o => !o.photo);
    return rows;
  }
  function safeSheetName(name) { return String(name || 'Sheet').replace(/[\/?*\[\]:]/g, ' ').slice(0, 31) || 'Sheet'; }
  function mapLinksRows(rows) { return rows.map((o,i) => ({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy, Latitude:o.lat, Longitude:o.lng, Link_Google_Maps:googleUrl(o.lat,o.lng) })); }
  function dateColor(dateText) {
    const keys = [...new Set(outlets().map(o => dateOnly(o.markedAt)).filter(Boolean).sort())];
    const colors = ['#2563eb','#16a34a','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#db2777','#0f172a'];
    const idx = Math.max(0, keys.indexOf(dateText));
    return colors[idx % colors.length];
  }

  function distanceMeters(aLat, aLng, bLat, bLng) {
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(Number(bLat) - Number(aLat));
    const dLng = toRad(Number(bLng) - Number(aLng));
    const la1 = toRad(Number(aLat));
    const la2 = toRad(Number(bLat));
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  }
  function hasCoordinatePoint(item={}) {
    const lat=item.lat??item.latitude,lng=item.lng??item.longitude;
    return lat!==null&&lat!==undefined&&lat!==''&&lng!==null&&lng!==undefined&&lng!==''&&Number.isFinite(Number(lat))&&Number.isFinite(Number(lng));
  }
  function simpleName(s) { return String(s || '').toLowerCase().replace(/\b(toko|tk|warung|wr|grosir|pt|cv)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function nameSimilarity(a, b) {
    const A = new Set(simpleName(a).split(' ').filter(Boolean));
    const B = new Set(simpleName(b).split(' ').filter(Boolean));
    if (!A.size || !B.size) return 0;
    const inter = [...A].filter(x => B.has(x)).length;
    return inter / Math.max(A.size, B.size);
  }
  function findNearbyDuplicates(candidate, rows = outlets()) {
    return rows
      .filter(o => o.id !== candidate.id && hasCoordinatePoint(o))
      .map(o => ({ outlet: o, distance: distanceMeters(candidate.lat, candidate.lng, o.lat, o.lng), sim: nameSimilarity(candidate.name, o.name) }))
      .filter(x => x.distance <= duplicateRadiusM || (x.distance <= 120 && x.sim >= .55))
      .sort((a,b) => a.distance - b.distance);
  }
  function duplicateCandidates(rows = outlets()) {
    const result = [];
    rows.forEach(o => {
      const near = findNearbyDuplicates(o, rows).filter(x => String(x.outlet.id) < String(o.id));
      if (near.length) result.push({ outlet: o, near: near[0].outlet, distance: near[0].distance });
    });
    return result;
  }
  function dateOnly(v) { try { return new Date(v).toISOString().slice(0, 10); } catch { return ''; } }
  function todaysPathText(rows) {
    const count = rows.filter(o => dateOnly(o.markedAt) === today()).length;
    return count ? `${count} outlet ditandai hari ini. Jalur hari ini sudah muncul sebagai garis warna di maps.` : 'Belum ada outlet yang ditandai hari ini.';
  }
  function todayOutlets(rows = outlets()) { return rows.filter(o => dateOnly(o.markedAt) === today()); }
  function photoMissingCount(rows = outlets()) { return rows.filter(o => !o.photo).length; }
  function spgDailySummaryHtml(rows = ownOutlets()) {
    const t = todayOutlets(rows);
    const sold = t.reduce((sum,o)=>sum+Number(o.sold||0),0);
    const withPhoto = t.filter(o=>o.photo).length;
    const missing = t.length - withPhoto;
    const target=Math.max(0,Number(state.data.settings.targetHarian||96)),progress=target?Math.min(100,Math.round(sold/target*100)):0;
    const progressHtml=fieldRules().showTargetProgress?`<div class="spg-target-progress"><div><span>Kemajuan target harian</span><b>${number(sold)} / ${number(target)} kaleng</b></div><div><i style="width:${progress}%"></i></div><small>${progress}% tercapai</small></div>`:'';
    return `<div class="daily-summary-card"><div><span class="badge green">Ringkasan hari ini</span><h3>Kamu sudah menandai ${number(t.length)} outlet hari ini.</h3><p>Total kaleng terjual: <b>${number(sold)}</b>. Foto lengkap: <b>${number(withPhoto)}/${number(t.length)}</b>.</p>${missing ? `<small class="text-red">Ada ${number(missing)} outlet belum punya foto. Lengkapi jika memungkinkan.</small>` : '<small class="text-green">Data foto hari ini terlihat aman.</small>'}${progressHtml}</div><div class="daily-summary-icon">📍</div></div>`;
  }
  function spgDateFilteredRows(rows = ownOutlets()) {
    const prev = state.filters.date;
    state.filters.date = state.spgDateFilter || 'Semua';
    const result = applyDateFilter(rows);
    state.filters.date = prev;
    return result;
  }
  function topSpgTodayHtml() {
    const todayRows = todayOutlets(outlets());
    const list = bySpg(todayRows).sort((a,b)=>b.outlet-a.outlet || b.sold-a.sold).slice(0,5);
    if (!list.length) return '<div class="empty">Belum ada SPG yang menandai outlet hari ini.</div>';
    return `<div class="ranking-list compact-ranking">${list.map((x,i)=>`<div class="ranking-row"><b>#${i+1}</b><span>${escapeHtml(x.spg)}<small>${escapeHtml(x.area)} • hari ini</small></span><strong>${number(x.outlet)} outlet / ${number(x.sold)} kaleng</strong></div>`).join('')}</div>`;
  }
  function problemOutlets(rows = outlets()) { return rows.filter(o => ['Tutup','Menolak'].includes(o.tanda) || Number(o.accuracy || 0) > 100 || !!o.duplicateWarning); }
  function topSellingOutlets(rows = outlets(), limit = 10) { return rows.slice().sort((a,b)=>Number(b.sold||0)-Number(a.sold||0)).slice(0, limit); }
  function revisitRecommendations(rows = outlets()) {
    return rows.filter(o => o.tanda === 'Potensial' || Number(o.sold || 0) >= 18 || ['Tutup','Menolak'].includes(o.tanda))
      .sort((a,b) => Number(b.sold || 0) - Number(a.sold || 0));
  }
  function timelineRows(rows = outlets(), limit = 30) { return rows.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0, limit); }
  function spgSummaryCards(rows = outlets()) {
    const list = bySpg(rows);
    if (!list.length) return '<div class="empty">Belum ada data SPG.</div>';
    return `<div class="spg-summary-grid">${list.map(x => {
      const userRows = rows.filter(o => o.markedBy === x.spg);
      const mm = metrics(userRows);
      return `<div class="spg-summary-card"><div class="avatar small-avatar">${escapeHtml(x.spg.slice(0,1))}</div><div><h4>${escapeHtml(x.spg)}</h4><small>${escapeHtml(x.area)}</small></div><div class="spg-mini-kpis"><span>Outlet <b>${number(mm.outlets)}</b></span><span>Terjual <b>${number(mm.sold)}</b></span><span>Foto <b>${number(mm.withPhoto)}/${number(mm.outlets)}</b></span><span>Double <b>${number(mm.duplicate)}</b></span></div></div>`;
    }).join('')}</div>`;
  }
  function timelineList(rows) {
    const list = timelineRows(rows, 50);
    if (!list.length) return '<div class="empty">Belum ada aktivitas outlet.</div>';
    return `<div class="timeline-list">${list.map(o => `<div class="timeline-item"><div class="dot ${tandaColor(o.tanda)}"></div><div><b>${formatDateTime(o.markedAt)}</b><p>${escapeHtml(o.markedBy)} menandai <b>${escapeHtml(o.name)}</b> di ${escapeHtml(o.area)} • ${number(o.sold)} kaleng • ${escapeHtml(o.tanda)}</p>${o.tlNote ? `<small>Catatan TL: ${escapeHtml(o.tlNote)}</small>` : ''}</div></div>`).join('')}</div>`;
  }
  function recommendationsList(rows) {
    const rec = revisitRecommendations(rows).slice(0, 12);
    if (!rec.length) return '<div class="empty">Belum ada outlet yang perlu kunjungan ulang.</div>';
    return `<div class="stat-list">${rec.map(o => {
      const reason = o.tanda === 'Potensial' ? 'Outlet potensial' : Number(o.sold || 0) >= 18 ? `Terjual tinggi (${number(o.sold)} kaleng)` : ['Tutup','Menolak'].includes(o.tanda) ? `Perlu dicek ulang: ${o.tanda}` : 'Perlu revisi data';
      return statLine(`${o.name} — ${o.markedBy}`, reason, ['Tutup','Menolak'].includes(o.tanda) ? 'red' : Number(o.sold||0) >= 18 ? 'green' : 'yellow');
    }).join('')}</div>`;
  }
  function topOutletList(rows) {
    const top = topSellingOutlets(rows, 10);
    if (!top.length) return '<div class="empty">Belum ada data outlet.</div>';
    return `<div class="ranking-list">${top.map((o,i)=>`<div class="ranking-row"><b>#${i+1}</b><span>${escapeHtml(o.name)}<small>${escapeHtml(o.area)} • ${escapeHtml(o.markedBy)}</small></span><strong>${number(o.sold)} kaleng</strong></div>`).join('')}</div>`;
  }
  function dataFreshnessHtml() {
    const updated=state.data.updatedAt?formatDateTime(state.data.updatedAt):'Belum ada data';
    const online=navigator.onLine,connected=Boolean(window.ExtraJossBackend?.hasToken?.());
    return `<div class="data-freshness ${online&&connected?'online':'local'}" title="Terakhir diperbarui ${escapeAttr(updated)}"><span></span><small>${online&&connected?'Data bersama':'Data perangkat'}<b>${escapeHtml(updated)}</b></small></div>`;
  }
  function userNotifications() {
    const id=state.user?.id;
    return (state.data.notifications||[]).slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||''))).filter(item=>{
      if(item.userId&&item.userId!==id)return false;
      if(Array.isArray(item.roles)&&item.roles.length&&!item.roles.includes(state.user?.role))return false;
      return true;
    });
  }
  function unreadNotifications(){return userNotifications().filter(item=>!(item.readBy||[]).includes(state.user?.id));}
  function notificationBellHtml(){
    const count=unreadNotifications().length;
    return `<button class="notification-bell" id="notificationBellBtn" type="button" aria-label="Notifikasi" title="Notifikasi"><span>🔔</span>${count?`<b>${count>99?'99+':number(count)}</b>`:''}</button>`;
  }
  function applyBackendResult(result){
    if(result?.data)state.data=normalizeData(result.data);
    localStorage.setItem(KEY_DATA,JSON.stringify(state.data));
  }
  function openNotificationsModal(){
    const rows=userNotifications();
    const body=rows.length?`<div class="notification-list">${rows.map(item=>{const read=(item.readBy||[]).includes(state.user.id);return `<article class="notification-item ${read?'read':'unread'}"><span>${item.type==='warning'?'⚠️':item.type==='placement'?'📍':'🔔'}</span><div><b>${escapeHtml(item.title||'Pemberitahuan')}</b><p>${escapeHtml(item.message||'')}</p><small>${escapeHtml(formatDateTime(item.createdAt))}</small></div><div class="btn-row compact-actions">${!read?`<button class="btn soft mini" data-read-notification="${escapeAttr(item.id)}">Tandai dibaca</button>`:''}${item.link?`<button class="btn primary mini" data-notification-link="${escapeAttr(item.link)}">Buka</button>`:''}</div></article>`}).join('')}</div>`:'<div class="empty">Belum ada notifikasi.</div>';
    modalShell('Notifikasi',`${number(unreadNotifications().length)} belum dibaca.`,body,`${unreadNotifications().length?'<button class="btn soft" id="readAllNotificationsBtn">Tandai Semua Dibaca</button>':''}<button class="btn red" id="logoutAllDevicesBtn">Keluar dari Semua Perangkat</button><button class="btn ghost" data-modal-close>Tutup</button>`,()=>{
      document.querySelectorAll('[data-read-notification]').forEach(button=>button.addEventListener('click',async()=>{
        try{const result=await window.ExtraJossBackend?.markNotificationRead?.(button.dataset.readNotification);applyBackendResult(result);closeModal();openNotificationsModal();}
        catch(error){toast(error.message||'Notifikasi belum dapat diperbarui.');}
      }));
      document.querySelectorAll('[data-notification-link]').forEach(button=>button.addEventListener('click',()=>{const page=button.dataset.notificationLink;closeModal();goPage(page);}));
      document.getElementById('readAllNotificationsBtn')?.addEventListener('click',async()=>{
        try{
          if(window.ExtraJossBackend?.markAllNotificationsRead){const result=await window.ExtraJossBackend.markAllNotificationsRead();applyBackendResult(result);}
          else for(const row of userNotifications())if(!(row.readBy||[]).includes(state.user.id))row.readBy=[...(row.readBy||[]),state.user.id];
          closeModal();render();openNotificationsModal();
        }catch(error){toast(error.message||'Notifikasi belum dapat diperbarui.');}
      });
      document.getElementById('logoutAllDevicesBtn')?.addEventListener('click',async()=>{
        if(!confirm('Keluarkan akun ini dari semua perangkat? Anda perlu login kembali.'))return;
        try{await window.ExtraJossBackend?.logoutAll?.();}catch{}finally{state.user=null;localStorage.removeItem(KEY_USER);cleanupMaps();closeModal();renderLogin();}
      });
    });
  }


  function render() {
    if (!state.user) return renderLogin();
    const app = document.getElementById('app');
    const menu = getMenu();
    document.title=state.data.settings.appName||contentSetting('siteName','Website Extra Joss SPG');
    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="brand"><div class="logo brand-product-logo"><img src="assets/brand/extra-joss-icon.png" alt="Extra Joss Ultimate"></div><div><b>${escapeHtml(state.data.settings.appName || contentSetting('siteName','Website Extra Joss SPG'))}</b><small>${isAdmin() ? `${escapeHtml(roleLabel(state.user.role))} • ${escapeHtml(accountScopeLabel(state.user))}` : `Selamat datang, ${escapeHtml(state.user.name || 'SPG')}`}</small></div></div>
          <nav class="menu" aria-label="Menu utama">${menu.map(m => `<button type="button" class="${state.page===m.key?'active':''}" data-page="${escapeAttr(m.key)}" aria-label="${escapeAttr(m.label)}"><span class="menu-icon" aria-hidden="true">${escapeHtml(m.icon)}</span><span class="menu-label">${escapeHtml(m.label)}</span></button>`).join('')}</nav>
          ${isAdmin() ? '' : `<div class="side-note"><b>Selamat datang ${escapeHtml(state.user.name || 'SPG')}</b><small>Gunakan menu di atas untuk mencatat kegiatan outlet.</small></div>`}
        </aside>
        <main class="main">
          <header class="topbar">
            <div class="search"><span>🔎</span><input id="globalSearch" placeholder="Cari outlet, area, SPG, tanda..." value="${escapeAttr(state.search)}" /></div>
            <div class="btn-row topbar-actions">${dataFreshnessHtml()}${canManageSystem() ? '<button class="btn soft" id="refreshSharedDataBtn">↻ Perbarui Data</button>' : ''}${themeToggleHtml()}${notificationBellHtml()}<div class="user-chip"><div class="avatar">${escapeHtml((state.user.name || 'U').slice(0,1).toUpperCase())}</div><small>${escapeHtml(displayUserName())}</small></div></div>
          </header>
          <section class="content" id="content"></section>
          <footer class="app-footer">${escapeHtml(contentSetting('footerText','© 2026 Solehudin. Seluruh hak cipta dilindungi.'))}</footer>
        </main>
      </div>`;
    document.querySelector('.menu')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;
      e.preventDefault();
      goPage(btn.dataset.page);
    });
    if (window.matchMedia?.('(max-width: 900px)')?.matches) requestAnimationFrame(() => {
      document.querySelector('.menu button.active')?.scrollIntoView({block:'nearest',inline:'center'});
    });
    document.getElementById('globalSearch').addEventListener('input', (e) => {
      state.search = e.target.value;
      if (state.page === 'outlet') state.monitorOutletPage = 1;
      renderPage();
    });
    bindThemeToggle();
    document.getElementById('notificationBellBtn')?.addEventListener('click',openNotificationsModal);
    document.getElementById('refreshSharedDataBtn')?.addEventListener('click', async () => {
      if(!window.ExtraJossBackend?.hasToken?.())return toast('Data bersama belum tersambung. Muat ulang halaman lalu login kembali.');
      try{const result=await window.ExtraJossBackend.pull();state.data=normalizeData(result.data||{});localStorage.setItem(KEY_DATA,JSON.stringify(state.data));toast('Data terbaru sudah tampil.');render();}
      catch(error){toast('Data belum dapat diperbarui: '+error.message);}
    });
    renderPage();
  }
  function goPage(pageKey) {
    if (pageKey === 'logout') return logout();
    if (!pageKey) return;
    const adminPages = ADMIN_MENU_CATALOG.map(item => item.key);
    const spgPages = SPG_MENU_CATALOG.map(item => item.key);
    const customAllowed=customFeatureAllowed(pageKey);
    if (isAdmin() && !customAllowed && (!adminPages.includes(pageKey) || !featureEnabled(pageKey, 'admin') || !adminPageAllowed(pageKey))) {
      toast('Menu tersebut sedang dinonaktifkan di Pengaturan.');
      pageKey = firstEnabledPage('admin');
    }
    if (!isAdmin() && !customAllowed && (!spgPages.includes(pageKey) || !featureEnabled(pageKey, 'spg'))) {
      toast('Menu tersebut sedang tidak dipakai. Hubungi Admin/TL jika diperlukan.');
      pageKey = firstEnabledPage('spg');
    }
    state.page = pageKey;
    state.selectedPhoto = '';
    cleanupMaps();
    render();
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }), 0);
  }
  function firstEnabledPage(role) {
    const catalog = role === 'admin' ? ADMIN_MENU_CATALOG : SPG_MENU_CATALOG;
    return catalog.find(item => featureEnabled(item.key, role) && (role !== 'admin' || adminPageAllowed(item.key)))?.key || (role === 'admin' ? 'dashboard' : 'spgHome');
  }
  function getMenu() {
    const custom=customFeaturesFor().map(item=>({key:`custom-${item.id}`,label:item.label,icon:item.icon||'🧩',description:item.description||''}));
    if (isAdmin()) {
      const byKey = Object.fromEntries(ADMIN_MENU_CATALOG.map(item => [item.key, menuCopy(item)]));
      const ordered = systemControl().adminMenuOrder.map(key => byKey[key]).filter(Boolean);
      return [...ordered.filter(item => featureEnabled(item.key, 'admin') && adminPageAllowed(item.key)),...custom, { key:'logout', label:'Logout', icon:icons.logout }];
    }
    return [...SPG_MENU_CATALOG.map(menuCopy).filter(item => featureEnabled(item.key, 'spg')),...custom, { key:'logout', label:'Logout', icon:icons.logout }];
  }
  function renderPage() {
    if (state.page === 'logout') return logout();
    const content = document.getElementById('content');
    const pages = { dashboard: simpleOperationsDashboard, stockCheck: stockCheckPage, reportingSpg: reportingSpgPage, receiptRecap: receiptRecapPage, spg:()=>canManageSystem()?adminSpg():simpleSpgPage(), screeningTraining: screeningTrainingPage, accounts: adminAccounts, outlet: simpleOutletPage, locationMaster: adminLocationMaster, dailyPlacement: adminDailyPlacement, issues: adminIssues, map: adminMap, routeMonitor: routeMonitorPage, followUp: tlFollowUpPage, export: adminExport, guide: guidePage, setting: adminSettings, spgHome, spgAdd, spgOutlets, spgProgress, spgProfile };
    const adminPages = ADMIN_MENU_CATALOG.map(item => item.key);
    const spgPages = SPG_MENU_CATALOG.map(item => item.key);
    const customAllowed=customFeatureAllowed(state.page);
    if (isAdmin() && !customAllowed && (!adminPages.includes(state.page) || !featureEnabled(state.page, 'admin') || !adminPageAllowed(state.page))) state.page = firstEnabledPage('admin');
    if (!isAdmin() && !customAllowed && (!spgPages.includes(state.page) || !featureEnabled(state.page, 'spg'))) state.page = firstEnabledPage('spg');
    content.innerHTML = customFeatureAllowed(state.page)?customFeaturePage(customFeatureByKey(state.page)):(pages[state.page] || (isAdmin() ? adminDashboard : spgHome))();
    bindPage();
    handleCandidateCvDeepLink();
  }
  function reportingContext() {
    return { data:state.data, user:state.user, number, money, escapeHtml, escapeAttr, today, pageHead, save, renderPage, render, toast, canEdit:canManageSystem(), allowedAreas:userAreaScope(), placementLocations:placementLocations(), uploadReceiptData:uploadReportingReceiptData, getReceiptData:getReportingReceiptData, openReceipt:openReportingReceipt, reviewReceipt:openReceiptReviewModal, togglePeriodLock:toggleReportingPeriodLock, renderCustomFields:renderCustomFieldInputs, readCustomFields:readCustomFieldValues, customFieldSummary };
  }
  function stockCheckPage() {
    if (!window.ReportingSPG) return '<div class="card"><h3>Modul Cek Stock belum termuat.</h3></div>';
    return `<div class="${canManageSystem() ? '' : 'monitor-readonly'}">${isMonitorRole() ? monitoringModeNotice() : ''}${window.ReportingSPG.renderStockPage(reportingContext())}</div>`;
  }
  function reportingSpgPage() {
    if (!window.ReportingSPG) return '<div class="card"><h3>Modul Reporting SPG belum termuat.</h3></div>';
    return `<div class="${canManageSystem() ? '' : 'monitor-readonly'}">${isMonitorRole() ? monitoringModeNotice() : ''}${window.ReportingSPG.renderReportingPage(reportingContext())}</div>`;
  }
  function receiptRecapPage() {
    if(!window.ReportingSPG?.renderReceiptPage)return '<div class="card"><h3>Modul Rekap Nota belum termuat.</h3></div>';
    return `<div class="${canManageSystem()?'':'monitor-readonly'}">${isMonitorRole()?monitoringModeNotice():''}${window.ReportingSPG.renderReceiptPage(reportingContext())}</div>`;
  }
  const CANDIDATE_STATUSES=['Kandidat Baru','Jadwal Interview','Sudah Interview','Jadwal Training','Sudah Training','Siap Join','Sudah Join','Gagal Join','Menghilang'];
  function candidateRows(){
    let rows=(state.data.spgCandidates||[]).slice();
    if(state.candidateAreaFilter!=='Semua')rows=rows.filter(row=>row.area===state.candidateAreaFilter);
    if(state.candidateStatusFilter!=='Semua')rows=rows.filter(row=>row.status===state.candidateStatusFilter);
    const query=state.search.trim().toLowerCase();if(query)rows=rows.filter(row=>[row.name,row.phone,row.area,row.status,row.notes].some(value=>String(value||'').toLowerCase().includes(query)));
    return rows.sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  }
  function candidateStatusColor(status){return status==='Sudah Join'?'green':['Gagal Join','Menghilang'].includes(status)?'red':['Jadwal Interview','Jadwal Training','Siap Join'].includes(status)?'yellow':['Sudah Interview','Sudah Training'].includes(status)?'blue':'gray';}
  function candidateTimeline(row){return [row.interviewDate&&`Interview ${formatDate(row.interviewDate)}`,row.trainingDate&&`Training ${formatDate(row.trainingDate)}`,row.joinDate&&`Join ${formatDate(row.joinDate)}`].filter(Boolean).join(' • ')||'Belum ada jadwal';}
  function candidatePagination(page,totalPages,total,start,end){return `<div class="receipt-pagination"><small>${total?`Menampilkan ${start+1}–${end} dari ${total} kandidat`:'Belum ada kandidat'}</small><nav class="report-pagination"><button data-candidate-page="${Math.max(1,page-1)}" ${page===1?'disabled':''}>← Sebelumnya</button><div>${Array.from({length:totalPages},(_,index)=>index+1).filter(index=>index===1||index===totalPages||Math.abs(index-page)<=1).map(index=>`<button class="${index===page?'active':''}" data-candidate-page="${index}">${index}</button>`).join('')}</div><button data-candidate-page="${Math.min(totalPages,page+1)}" ${page===totalPages?'disabled':''}>Berikutnya →</button></nav></div>`;}
  function screeningTrainingPage(){
    if(!canManageSystem())return '<div class="card"><h3>Menu ini hanya tersedia untuk TL.</h3></div>';
    const rows=candidateRows(),size=[10,20,50].includes(Number(state.candidatePageSize))?Number(state.candidatePageSize):10,pages=Math.max(1,Math.ceil(rows.length/size));state.candidatePage=Math.min(Math.max(1,state.candidatePage),pages);const start=(state.candidatePage-1)*size,pageRows=rows.slice(start,start+size),editing=(state.data.spgCandidates||[]).find(row=>row.id===state.editingCandidateId)||{},counts={interview:(state.data.spgCandidates||[]).filter(row=>['Jadwal Interview','Sudah Interview'].includes(row.status)).length,training:(state.data.spgCandidates||[]).filter(row=>['Jadwal Training','Sudah Training'].includes(row.status)).length,join:(state.data.spgCandidates||[]).filter(row=>row.status==='Sudah Join').length,follow:(state.data.spgCandidates||[]).filter(row=>['Kandidat Baru','Siap Join'].includes(row.status)).length};
    const cv=state.candidateCvDraft||editing.cvId&&{id:editing.cvId,fileName:editing.cvName,mimeType:editing.cvType,size:editing.cvSize};
    return `${pageHead('Screening & Training SPG','Catat kandidat dari interview, training, sampai hasil join.',`<button class="btn dark" id="exportCandidatePdfBtn">Export PDF</button>`)}
      <div class="grid cols-4">${kpiCard('Interview',number(counts.interview),'dijadwalkan / selesai','🗣️')}${kpiCard('Training',number(counts.training),'dijadwalkan / selesai','🎓')}${kpiCard('Sudah Join',number(counts.join),'bergabung','✅')}${kpiCard('Perlu Follow-up',number(counts.follow),'kandidat aktif','⏳')}</div>
      <div class="card" style="margin-top:18px"><div class="daily-table-toolbar"><div><h3>${editing.id?'Edit Kandidat':'Tambah Kandidat'}</h3><small>Jadwal dapat diubah kapan saja. CV tersimpan privat.</small></div>${editing.id?'<button class="btn soft" id="cancelCandidateEditBtn">Batal Edit</button>':''}</div><div class="form three" style="margin-top:14px">${field('Nama Kandidat','candidateName','text','Nama lengkap',editing.name||'')}${field('Nomor Telepon','candidatePhone','text','08xxxxxxxxxx',editing.phone||'')}<div class="field"><label>Area</label><select id="candidateArea">${areaOptions(editing.area||areas()[0]?.name)}</select></div><div class="field"><label>Status</label><select id="candidateStatus">${CANDIDATE_STATUSES.map(status=>`<option ${status===(editing.status||'Kandidat Baru')?'selected':''}>${status}</option>`).join('')}</select></div>${field('Jadwal Interview','candidateInterviewDate','datetime-local','',String(editing.interviewDate||'').slice(0,16))}${field('Jadwal Training','candidateTrainingDate','datetime-local','',String(editing.trainingDate||'').slice(0,16))}${field('Tanggal Join','candidateJoinDate','date','',String(editing.joinDate||'').slice(0,10))}<div class="field"><label>Upload CV</label><input type="file" id="candidateCvInput" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"><small>${cv?`CV siap: ${escapeHtml(cv.fileName||'CV kandidat')}`:'PDF/JPG/PNG/WEBP/DOC/DOCX, maksimal 6 MB'}</small></div><div class="field span-3"><label>Catatan Follow-up</label><textarea id="candidateNotes" placeholder="Hasil interview, kesiapan training, alasan gagal join, atau catatan lain">${escapeHtml(editing.notes||'')}</textarea></div><div class="btn-row span-3"><button class="btn primary" id="saveCandidateBtn">${editing.id?'Simpan Perubahan':'Simpan Kandidat'}</button></div></div></div>
      <div class="card" style="margin-top:18px"><div class="form three"><div class="field"><label>Filter Area</label><select id="candidateAreaFilter"><option>Semua</option>${areas().map(area=>`<option ${area.name===state.candidateAreaFilter?'selected':''}>${escapeHtml(area.name)}</option>`).join('')}</select></div><div class="field"><label>Filter Status</label><select id="candidateStatusFilter"><option>Semua</option>${CANDIDATE_STATUSES.map(status=>`<option ${status===state.candidateStatusFilter?'selected':''}>${status}</option>`).join('')}</select></div><div class="field"><label>Tampilkan</label><select id="candidatePageSize">${[10,20,50].map(value=>`<option value="${value}" ${value===size?'selected':''}>${value} baris</option>`).join('')}</select></div></div><div class="table-wrap"><table class="responsive-data-table"><thead><tr>${['Nama','Telepon','Area','Status','Jadwal & Hasil','CV','Catatan','Aksi'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${pageRows.length?pageRows.map(row=>`<tr><td><b>${escapeHtml(row.name)}</b></td><td>${escapeHtml(row.phone||'-')}</td><td>${escapeHtml(row.area||'-')}</td><td>${badge(row.status||'Kandidat Baru',candidateStatusColor(row.status))}</td><td>${escapeHtml(candidateTimeline(row))}</td><td>${row.cvId?`<button class="btn soft mini" data-open-candidate-cv="${escapeAttr(row.cvId)}">Buka CV</button>`:'-'}</td><td>${escapeHtml(row.notes||'-')}</td><td><div class="compact-actions"><button class="btn soft mini" data-edit-candidate="${escapeAttr(row.id)}">Edit</button><button class="btn red mini" data-delete-candidate="${escapeAttr(row.id)}">Hapus</button></div></td></tr>`).join(''):'<tr><td colspan="8"><div class="empty">Belum ada kandidat pada filter ini.</div></td></tr>'}</tbody></table></div>${candidatePagination(state.candidatePage,pages,rows.length,start,Math.min(start+pageRows.length,rows.length))}</div>`;
  }
  function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('File tidak dapat dibaca.'));reader.readAsDataURL(file);});}
  async function uploadCandidateCv(file){if(!file)return null;if(file.size>6*1024*1024)throw new Error('CV maksimal 6 MB.');if(!window.ExtraJossBackend?.hasToken?.())throw new Error('CV hanya dapat diunggah saat website tersambung ke server.');const dataUrl=await fileToDataUrl(file),result=await window.ExtraJossBackend.uploadCandidateCv({fileName:file.name,mimeType:file.type,size:file.size,dataUrl});return result.file;}
  async function openCandidateCv(fileId){const win=window.open('','_blank');if(!win)return toast('Izinkan popup untuk membuka CV.');try{win.document.title='Membuka CV…';win.document.body.innerHTML='<p style="font:16px system-ui;padding:24px">Membuka CV kandidat…</p>';const result=await window.ExtraJossBackend.candidateCvFile(fileId);if(String(result.mimeType||'').includes('pdf')||String(result.mimeType||'').startsWith('image/')){win.location.href=result.dataUrl;}else{const link=document.createElement('a');link.href=result.dataUrl;link.download=result.fileName||'CV Kandidat';link.click();win.close();}}catch(error){win.close();toast(error.message||'CV belum dapat dibuka.');}}
  function candidateCvLink(fileId){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('candidateCv',fileId);return url.toString();}
  function handleCandidateCvDeepLink(){if(state.deepLinkHandled||!canManageSystem())return;const fileId=new URLSearchParams(location.search).get('candidateCv');if(!fileId)return;state.deepLinkHandled=true;setTimeout(()=>openCandidateCv(fileId),100);}
  function exportCandidatePdf(){const rows=candidateRows(),jspdf=window.jspdf;if(!rows.length)return toast('Belum ada kandidat untuk diekspor.');if(!jspdf?.jsPDF)return toast('Pembuat PDF belum termuat.');const doc=new jspdf.jsPDF({orientation:'landscape',format:'a4'});doc.setFillColor(15,42,76);doc.rect(0,0,doc.internal.pageSize.getWidth(),28,'F');doc.setTextColor(255,255,255);doc.setFontSize(17);doc.text('SCREENING & TRAINING SPG',14,13);doc.setFontSize(9);doc.text(`Website Extra Joss SPG • dibuat ${new Date().toLocaleString('id-ID')}`,14,21);doc.setTextColor(15,23,42);doc.autoTable({startY:35,theme:'grid',head:[['No.','Nama','Telepon','Area','Status','Interview','Training','Join','CV','Catatan']],body:rows.map((row,index)=>[index+1,row.name,row.phone||'-',row.area||'-',row.status||'Kandidat Baru',row.interviewDate?formatDateTime(row.interviewDate):'-',row.trainingDate?formatDateTime(row.trainingDate):'-',row.joinDate?formatDate(row.joinDate):'-',row.cvId?'Buka CV':'-',row.notes||'-']),styles:{fontSize:7.2,cellPadding:2,lineWidth:.18,lineColor:[71,85,105],overflow:'linebreak',valign:'middle'},headStyles:{fillColor:[31,78,120],textColor:[255,255,255]},columnStyles:{0:{cellWidth:9},1:{cellWidth:30},8:{cellWidth:20},9:{cellWidth:48}},didDrawCell:data=>{if(data.section==='body'&&data.column.index===8){const row=rows[data.row.index];if(row?.cvId){doc.setTextColor(37,99,235);doc.link(data.cell.x,data.cell.y,data.cell.width,data.cell.height,{url:candidateCvLink(row.cvId)});}}}});const pages=doc.internal.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(`CV dibuka melalui link aman setelah login TL • Halaman ${page}/${pages}`,14,doc.internal.pageSize.getHeight()-7);}doc.save(`SCREENING TRAINING SPG ${today()}.pdf`);toast('PDF Screening & Training berhasil dibuat.');}
  function bindScreeningTraining(){
    document.getElementById('candidateCvInput')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{toast('Mengunggah CV…');state.candidateCvDraft=await uploadCandidateCv(file);toast('CV berhasil diunggah. Tekan Simpan Kandidat.');}catch(error){event.target.value='';toast(error.message);}});
    document.getElementById('saveCandidateBtn')?.addEventListener('click',()=>{const name=val('candidateName').trim(),phone=val('candidatePhone').trim(),area=val('candidateArea'),status=val('candidateStatus');if(!name||!phone||!area)return toast('Nama, nomor telepon, dan area wajib diisi.');const existing=(state.data.spgCandidates||[]).find(row=>row.id===state.editingCandidateId),cv=state.candidateCvDraft;const row={...(existing||{}),id:existing?.id||uid('candidate'),name,phone,area,status,interviewDate:val('candidateInterviewDate'),trainingDate:val('candidateTrainingDate'),joinDate:val('candidateJoinDate'),notes:val('candidateNotes').trim(),updatedAt:nowIso(),createdAt:existing?.createdAt||nowIso(),createdBy:existing?.createdBy||state.user.name};if(cv)Object.assign(row,{cvId:cv.id,cvName:cv.fileName,cvType:cv.mimeType,cvSize:cv.size,cvUploadedAt:cv.uploadedAt});if(existing)Object.assign(existing,row);else state.data.spgCandidates.push(row);state.editingCandidateId='';state.candidateCvDraft=null;save();toast(existing?'Kandidat berhasil diperbarui.':'Kandidat berhasil ditambahkan.');renderPage();});
    document.getElementById('cancelCandidateEditBtn')?.addEventListener('click',()=>{state.editingCandidateId='';state.candidateCvDraft=null;renderPage();});
    ['candidateAreaFilter','candidateStatusFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',event=>{state[id]=event.target.value;state.candidatePage=1;renderPage();}));document.getElementById('candidatePageSize')?.addEventListener('change',event=>{state.candidatePageSize=Number(event.target.value)||10;state.candidatePage=1;renderPage();});document.querySelectorAll('[data-candidate-page]').forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;state.candidatePage=Number(button.dataset.candidatePage)||1;renderPage();}));document.querySelectorAll('[data-edit-candidate]').forEach(button=>button.addEventListener('click',()=>{state.editingCandidateId=button.dataset.editCandidate;state.candidateCvDraft=null;renderPage();}));document.querySelectorAll('[data-delete-candidate]').forEach(button=>button.addEventListener('click',()=>{const row=state.data.spgCandidates.find(item=>item.id===button.dataset.deleteCandidate);if(row&&confirm(`Hapus kandidat ${row.name}?`)){state.data.spgCandidates=state.data.spgCandidates.filter(item=>item.id!==row.id);save();renderPage();}}));document.querySelectorAll('[data-open-candidate-cv]').forEach(button=>button.addEventListener('click',()=>openCandidateCv(button.dataset.openCandidateCv)));document.getElementById('exportCandidatePdfBtn')?.addEventListener('click',exportCandidatePdf);
  }
  async function uploadReportingReceiptData(payload={}) {
    if(useSharedServer()&&window.ExtraJossBackend?.hasToken?.())return (await window.ExtraJossBackend.uploadReceipt(payload)).receipt;
    return {id:payload.receiptId||uid('nota'),fileName:payload.fileName||'nota',mimeType:payload.mimeType||'image/jpeg',size:Number(payload.size||0),uploadedAt:nowIso(),uploadedBy:state.user?.name||'TL',status:'Belum Diperiksa',dataUrl:payload.dataUrl||''};
  }
  async function toggleReportingPeriodLock(payload={}){
    if(state.user?.role!=='TL')throw new Error('Penguncian periode hanya dapat dilakukan TL.');
    if(useSharedServer()&&window.ExtraJossBackend?.hasToken?.()){
      const result=await window.ExtraJossBackend.togglePeriodLock(payload);applyBackendResult(result);return result.locked;
    }
    const period=String(payload.period||'').slice(0,7),area=payload.area||'Semua',spg=payload.spg||'Semua';
    const index=(state.data.reportingLocks||[]).findIndex(row=>row.period===period&&(row.area||'Semua')===area&&(row.spg||'Semua')===spg);
    if(index>=0){state.data.reportingLocks.splice(index,1);save();return false;}
    state.data.reportingLocks.unshift({id:uid('lock'),period,area,spg,lockedAt:nowIso(),lockedBy:state.user.name,lockedById:state.user.id});save();return true;
  }
  function openReceiptReviewModal(record={}){
    if(state.user?.role!=='TL')return;
    const current=record.receiptStatus||'Belum Diperiksa';
    modalShell('Periksa Nota',`${escapeHtml(record.spg||'-')} • ${escapeHtml(formatDate(record.date||''))} • ${escapeHtml(record.gromin||'-')}`,`<div class="form modal-form"><div class="field"><label>Status Nota</label><select id="receiptReviewStatus">${['Belum Diperiksa','Sesuai','Perlu Perbaikan','Ditolak'].map(status=>`<option ${status===current?'selected':''}>${escapeHtml(status)}</option>`).join('')}</select></div><div class="field"><label>Catatan Pemeriksaan</label><textarea id="receiptReviewNote" placeholder="Tulis alasan singkat bila perlu">${escapeHtml(record.receiptReviewNote||'')}</textarea></div><div class="notice info"><b>Nota tetap diunggah oleh TL.</b><small>SCO, MS, dan AM dapat melihat status serta catatan ini sesuai area tugas.</small></div></div>`,'<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveReceiptReviewBtn">Simpan Pemeriksaan</button>',()=>{
      document.getElementById('saveReceiptReviewBtn')?.addEventListener('click',async()=>{
        const status=val('receiptReviewStatus'),note=val('receiptReviewNote').trim(),button=document.getElementById('saveReceiptReviewBtn');button.disabled=true;button.textContent='Menyimpan…';
        try{
          if(useSharedServer()&&window.ExtraJossBackend?.hasToken?.()){const result=await window.ExtraJossBackend.reviewReceipt({reportId:record.id,receiptId:record.receiptId,status,note});applyBackendResult(result);}
          else{const row=(state.data.reportingDaily||[]).find(item=>item.id===record.id);if(row){row.receiptStatus=status;row.receiptReviewNote=note;row.receiptReviewedAt=nowIso();row.receiptReviewedBy=state.user.name;}save();}
          closeModal();toast('Pemeriksaan nota tersimpan.');renderPage();
        }catch(error){button.disabled=false;button.textContent='Simpan Pemeriksaan';toast(error.message||'Pemeriksaan nota belum tersimpan.');}
      });
    });
  }
  function dataUrlBlobUrl(dataUrl) {
    const [header,body]=String(dataUrl||'').split(','),mime=(header.match(/^data:([^;]+)/)||[])[1]||'application/octet-stream',binary=atob(body||''),bytes=new Uint8Array(binary.length);
    for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes],{type:mime}));
  }
  async function getReportingReceiptData(record={}) {
    if(record.receiptData)return {dataUrl:record.receiptData,mimeType:record.receiptType||String(record.receiptData.match(/^data:([^;]+)/)?.[1]||''),fileName:record.receiptName||'Nota'};
    if(record.receiptId&&window.ExtraJossBackend?.hasToken?.())return window.ExtraJossBackend.receiptFile(record.receiptId);
    return {dataUrl:'',mimeType:record.receiptType||'',fileName:record.receiptName||'Nota'};
  }
  async function openReportingReceipt(record={}) {
    try{
      toast('Membuka nota…');
      const receipt=await getReportingReceiptData(record),dataUrl=receipt.dataUrl||'';
      if(!dataUrl)return toast('File nota tidak ditemukan.');
      const mime=receipt.mimeType||record.receiptType||String(dataUrl.match(/^data:([^;]+)/)?.[1]||''),name=receipt.fileName||record.receiptName||'Nota Reporting';
      if(mime.startsWith('image/')){
        modalShell('Nota Reporting',`${escapeHtml(record.spg||'-')} • ${escapeHtml(formatDate(record.date||''))} • ${escapeHtml(record.gromin||'-')}`,`<div class="receipt-viewer"><img src="${escapeAttr(dataUrl)}" alt="${escapeAttr(name)}"><small>${escapeHtml(name)}</small></div>`,'<button class="btn ghost" data-modal-close>Tutup</button><button class="btn primary" id="openReceiptOriginalBtn">Buka Ukuran Asli</button>',()=>document.getElementById('openReceiptOriginalBtn')?.addEventListener('click',()=>{const url=dataUrlBlobUrl(dataUrl);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);}));
      }else{
        modalShell('Nota PDF',`${escapeHtml(record.spg||'-')} • ${escapeHtml(formatDate(record.date||''))}`,`<div class="receipt-pdf-card"><span>📄</span><b>${escapeHtml(name)}</b><small>Tekan tombol di bawah untuk membuka nota PDF.</small></div>`,'<button class="btn ghost" data-modal-close>Tutup</button><button class="btn primary" id="openReceiptOriginalBtn">Buka PDF</button>',()=>document.getElementById('openReceiptOriginalBtn')?.addEventListener('click',()=>{const url=dataUrlBlobUrl(dataUrl);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);}));
      }
    }catch(error){toast('Nota belum dapat dibuka: '+error.message);}
  }
  function monitoringModeNotice() {
    return `<div class="notice info monitoring-mode-notice"><b>Akses lihat saja</b><small>Anda dapat melihat dan mengekspor data area tugas. Perubahan data operasional dilakukan oleh TL.</small></div>`;
  }
  function pageHead(title, desc, action = '') { return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div><div class="btn-row">${action}</div></div>`; }
  function kpiCard(label, value, note, icon) { return `<div class="card kpi"><div><small>${label}</small><div class="num">${value}</div><small>${note}</small></div><div class="kpi-icon">${icon}</div></div>`; }
  function customFeaturePage(item) {
    if(!item)return '<div class="empty">Fitur tidak ditemukan.</div>';
    const paragraphs=String(item.content||'Konten fitur ini belum diisi oleh Admin.').split(/\n+/).filter(Boolean).map(text=>`<p>${escapeHtml(text)}</p>`).join('');
    return `${pageHead(`${escapeHtml(item.icon||'🧩')} ${escapeHtml(item.label)}`,escapeHtml(item.description||'Fitur tambahan dari Admin.'))}<div class="card custom-feature-page">${paragraphs}</div>`;
  }

  function tlFollowUpToday() {
    const date=today();
    const scopedOutlets=scopedByArea(outlets());
    const problem=problemOutlets(scopedOutlets);
    const duplicate=duplicateCandidates(scopedOutlets);
    const pica=(state.data.picaRecords||[]).filter(row=>canAccessArea(row.area)&&!['done','selesai','closed'].includes(String(row.status||'').toLowerCase()));
    const routes=allRoutes().filter(route=>route.date===date&&canAccessArea(route.area));
    const quietRoutes=routes.filter(route=>(route.points||[]).length<2);
    const items=[
      {label:'Outlet perlu diperiksa',value:problem.length,note:'tutup, menolak, GPS, atau data bermasalah',page:'followUp',color:problem.length?'red':'green'},
      {label:'Potensi data ganda',value:duplicate.length,note:'lokasi dekat atau nama mirip',page:'followUp',color:duplicate.length?'yellow':'green'},
      {label:'PICA belum selesai',value:pica.length,note:'masih perlu tindak lanjut',page:'followUp',color:pica.length?'yellow':'green'},
      {label:'Jalur belum bergerak',value:quietRoutes.length,note:'kurang dari 2 titik hari ini',page:'followUp',color:quietRoutes.length?'yellow':'green'}
    ];
    return `<section class="card follow-up-card"><div class="daily-table-toolbar"><div><span class="badge yellow">PERLU DITINDAKLANJUTI HARI INI</span><h3>Prioritas kerja TL</h3><small>Klik bagian yang perlu diperiksa.</small></div><span class="badge ${items.some(item=>item.value)?'red':'green'}">${items.reduce((sum,item)=>sum+item.value,0)} catatan</span></div><div class="follow-up-list">${items.map(item=>`<button data-page-jump="${item.page}"><span class="follow-up-dot ${item.color}"></span><span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.note)}</small></span><strong>${number(item.value)}</strong></button>`).join('')}</div></section>`;
  }

  function tlFollowUpRows(){
    const rows=scopedByArea(outlets()),result=[];
    problemOutlets(rows).forEach(outlet=>result.push({category:'Outlet bermasalah',name:outlet.name,area:outlet.area,spg:outlet.markedBy,date:dateOnly(outlet.markedAt),detail:`${outlet.tanda||'Perlu dicek'}${Number(outlet.accuracy||0)>100?' • GPS kurang akurat':''}`}));
    rows.filter(outlet=>!outlet.photo).forEach(outlet=>result.push({category:'Foto kurang',name:outlet.name,area:outlet.area,spg:outlet.markedBy,date:dateOnly(outlet.markedAt),detail:'Foto outlet belum tersedia'}));
    duplicateCandidates(rows).forEach(item=>result.push({category:'Data ganda',name:item.outlet.name,area:item.outlet.area,spg:item.outlet.markedBy,date:dateOnly(item.outlet.markedAt),detail:`Mirip ${item.near.name} • jarak ${Math.round(item.distance)} m`}));
    (state.data.picaRecords||[]).filter(row=>canAccessArea(row.area)&&!['done','selesai','closed'].includes(String(row.status||'').toLowerCase())).forEach(row=>result.push({category:'PICA terbuka',name:row.outletName||row.title||row.problem||'PICA',area:row.area||'-',spg:row.spgName||row.owner||'-',date:row.date||row.dueDate||'-',detail:row.action||row.problem||row.notes||'Belum selesai'}));
    const date=today(),assignments=spgAssignments().filter(row=>row.date===date&&canAccessArea(row.area));
    assignments.forEach(assignment=>{
      const route=allRoutes().find(row=>row.date===date&&(row.userId===assignment.userId||row.userName===assignment.userName));
      const location=locationById(assignment.locationId);
      if(!route||(route.points||[]).length===0)result.push({category:'GPS tidak tersedia',name:location?.name||'Lokasi tugas',area:assignment.area,spg:assignment.userName,date,detail:'Belum ada titik GPS hari ini'});
      else{
        const distance=routePlacementDistance(route),status=placementDistanceStatus(distance);
        if(status.code==='outside')result.push({category:'SPG di luar lokasi tugas',name:location?.name||'Lokasi tugas',area:assignment.area,spg:assignment.userName,date,detail:`Posisi terakhir berjarak ${formatMeters(distance)} dari toko tugas`});
      }
    });
    return result;
  }
  function filteredTlFollowUpRows(){
    return tlFollowUpRows().filter(row=>(state.followUpCategory==='Semua'||row.category===state.followUpCategory)&&(state.followUpArea==='Semua'||row.area===state.followUpArea)&&(state.followUpSpg==='Semua'||row.spg===state.followUpSpg));
  }
  function tlFollowUpPage(){
    if(state.user?.role!=='TL')return '<div class="notice warning"><b>Menu ini khusus TL.</b></div>';
    const all=tlFollowUpRows(),rows=filteredTlFollowUpRows(),categories=['Semua',...new Set(all.map(row=>row.category))],spgs=['Semua',...new Set(all.map(row=>row.spg).filter(Boolean))];
    return `${pageHead('Tindak Lanjut','Semua data yang perlu diperiksa TL disatukan di halaman ini.','<button class="btn primary" data-simple-export="excel" data-export-kind="followUp">Export Excel</button><button class="btn dark" data-simple-export="pdf" data-export-kind="followUp">Export PDF</button>')}
      <div class="grid cols-4">${kpiCard('Total Catatan',number(all.length),'semua jenis','🧭')}${kpiCard('Foto Kurang',number(all.filter(row=>row.category==='Foto kurang').length),'perlu dilengkapi','📷')}${kpiCard('PICA Terbuka',number(all.filter(row=>row.category==='PICA terbuka').length),'belum selesai','📝')}${kpiCard('Di Luar Tugas',number(all.filter(row=>row.category==='SPG di luar lokasi tugas').length),'berdasarkan toko tugas','📡')}</div>
      <div class="card filter-card" style="margin-top:18px"><div class="form three">${selectField('Jenis Catatan','followUpCategory',categories,state.followUpCategory)}${selectField('Area','followUpArea',['Semua',...areas().filter(area=>canAccessArea(area.name)).map(area=>area.name)],state.followUpArea)}${selectField('SPG','followUpSpg',spgs,state.followUpSpg)}</div></div>
      <div class="card" style="margin-top:18px"><div class="daily-table-toolbar"><div><h3>Daftar yang perlu diperiksa</h3><small>${number(rows.length)} catatan sesuai filter.</small></div></div>${rows.length?table(['Jenis','Tanggal','Area','SPG','Toko/Data','Keterangan'],rows.map(row=>[badge(row.category,row.category.includes('luar')||row.category.includes('bermasalah')?'red':row.category.includes('PICA')||row.category.includes('Foto')?'yellow':'blue'),escapeHtml(row.date||'-'),escapeHtml(row.area||'-'),escapeHtml(row.spg||'-'),`<b>${escapeHtml(row.name||'-')}</b>`,escapeHtml(row.detail||'-')])):'<div class="empty">Tidak ada catatan pada filter ini.</div>'}</div>`;
  }

  function adminDashboard() {
    const rows = scopedByArea(outlets()); const m = metrics(rows); const pg = potentialGroups(rows);
    return `
      ${pageHead('Dashboard TL', 'Pusat keputusan TL: lihat alur kerja, aktivitas outlet, cakupan area, outlet potensial, grafik, dan data siap export.')}
      <div class="card hero-workflow"><div><span class="badge blue">Alur kerja utama</span><h2>SPG tandai outlet → TL cek maps/grafik → Export laporan → Siap database</h2><p class="muted">Fokus aplikasi ini tetap sederhana: titik outlet, data outlet, maps coverage, estimasi nilai, dan laporan Excel/PDF.</p></div>${workflowSection()}</div>
      ${window.ReportingSPG?.renderDashboardStats ? window.ReportingSPG.renderDashboardStats(reportingContext()) : ''}
      <div class="grid cols-4" style="margin-top:18px">
        ${kpiCard('Total Outlet Ditandai', number(m.outlets), 'semua SPG', '📍')}
        ${kpiCard('Kaleng Terjual', number(m.sold), 'total dari outlet', '📦')}
        ${kpiCard('Estimasi Nilai', money(m.value), 'harga mengikuti area', '💰')}
        ${kpiCard('SPG Aktif Menandai', number(m.spgs), 'berdasarkan outlet', '👥')}
      </div>
      <div class="grid cols-4" style="margin-top:18px">
        ${kpiCard('Outlet Bermasalah', number(m.issue), 'tutup/menolak', '⚠️')}
        ${kpiCard('Potensi Double', number(m.duplicate), 'radius dekat/nama mirip', '🔁')}
        ${kpiCard('Potensial Tinggi', number(pg.high.length), 'terjual ≥ 24 kaleng', '⭐')}
        ${kpiCard('Outlet Ada Foto', number(m.withPhoto), 'bukti outlet', '📷')}
      </div>
      <div class="card" style="margin-top:18px"><h3>Pusat Keputusan TL</h3><small>Jawaban cepat untuk menentukan area mana yang perlu didorong dan outlet mana yang layak difollow up.</small>${decisionCenter(rows)}</div>
      <div class="card" style="margin-top:18px"><h3>SPG paling aktif hari ini</h3><small>Ranking harian berdasarkan outlet yang ditandai hari ini.</small>${topSpgTodayHtml()}</div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Peta Coverage Area</h3><small>Hijau = coverage kuat, kuning = sedang, merah = masih minim titik outlet.</small>${coverageSection(rows)}</div>
        <div class="card"><h3>Outlet Potensial Otomatis</h3><small>Dihitung dari kaleng terjual. Tinggi jika terjual minimal 24 kaleng.</small>${potentialSection(rows)}</div>
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Kaleng terjual per area</h3><small>Diambil dari field Terjual/Kaleng pada outlet.</small>${barChart(byArea(rows).map(x => ({ label: x.area, value: x.sold })))}</div>
        <div class="card"><h3>Outlet per SPG</h3><small>Ranking SPG berdasarkan titik outlet.</small>${barChart(bySpg(rows).map(x => ({ label: x.spg, value: x.outlet })))}</div>
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Dashboard Kesehatan Data</h3><small>Kualitas data outlet sebelum export: foto, GPS, potensi double, nomor telepon, dan outlet terjual 0.</small>${healthDashboard(rows)}</div>
        <div class="card"><h3>Ringkasan Laporan</h3><p class="ai-summary">${escapeHtml(aiSummaryText(rows))}</p></div>
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Status tanda outlet</h3><div class="stat-list">${tandaOptions.map(t => statLine(t, rows.filter(o => o.tanda === t).length, tandaColor(t))).join('')}</div></div>
        <div class="card"><h3>Catatan Maps</h3>${adminInsights(rows).map(i => aiItem(i.tag, i.text, i.color)).join('')}</div>
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Ringkasan otomatis per SPG</h3><small>Outlet, kaleng terjual, foto lengkap, dan potensi double per SPG.</small>${spgSummaryCards(rows)}</div>
        <div class="card"><h3>Rekomendasi kunjungan ulang</h3>${recommendationsList(rows)}</div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Outlet terbaru</h3>${outletTable(rows.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0,8))}</div>`;
  }
  function simpleOperationsDashboard(){
    window.ReportingSPG?.normalizeData?.(state.data);
    if(canManageAccounts())return adminSystemDashboard();
    if(isMonitorRole()){
      const selectedArea=monitorSelectedArea();
      window.ReportingSPG?.setView?.({area:selectedArea,spg:'Semua'});
      const detailed=window.ReportingSPG?.renderMonitorDashboard?.(reportingContext(),selectedArea)||'<div class="notice info"><b>Statistik mingguan sedang disiapkan.</b><small>Buka Reporting SPG lalu muat ulang halaman.</small></div>';
      return `${pageHead(`Dashboard ${escapeHtml(roleLabel(state.user.role))}`,escapeHtml(contentSetting('dashboardSubtitle','Pantau hasil SPG sesuai area dan periode.')))}${monitorAreaPicker()}${detailed}`;
    }
    const rows=scopedByArea(outlets()),m=metrics(rows),areaRows=byArea(rows);
    const reportingStats=window.ReportingSPG?.renderDashboardStats?.(reportingContext()) || '<div class="notice info"><b>Statistik sedang disiapkan.</b><small>Buka Reporting SPG lalu muat ulang halaman jika angka belum tampil.</small></div>';
    const outletSummary=areaRows.length
      ? `<div class="card" style="margin-top:18px"><div class="daily-table-toolbar"><div><h3>Ringkasan Data Lapangan</h3><small>Daftar ringkas ini menggantikan grafik yang mengulang informasi Reporting.</small></div><button class="btn soft mini" data-page-jump="outlet">Lihat Outlet</button></div>${table(['Area','Outlet','Kaleng dari Outlet','SPG'],areaRows.map(row=>[escapeHtml(row.area),number(row.outlet),number(row.sold),number(new Set(scopedByArea(outlets()).filter(item=>item.area===row.area).map(item=>item.markedBy)).size)]))}</div>`
      : '<div class="notice info" style="margin-top:18px"><b>Belum ada data outlet.</b><small>Statistik Reporting SPG tetap menjadi tampilan utama.</small></div>';
    return `${pageHead(`Dashboard ${escapeHtml(roleLabel(state.user.role))}`,'Ringkasan pencapaian dan aktivitas SPG.')}
      ${reportingStats}
      ${tlFollowUpToday()}
      <div class="grid cols-4" style="margin-top:18px">${kpiCard('Outlet',number(m.outlets),'seluruh area akses','🏪')}${kpiCard('Kaleng Terjual',number(m.sold),'total tercatat','📦')}${kpiCard('SPG Aktif',number(spgList().filter(user=>user.status==='Aktif').length),'sesuai cakupan area','👥')}${kpiCard('Area',number(areaRows.length),'memiliki data','🗺️')}</div>
      ${outletSummary}`;
  }
  function adminSystemDashboard(){
    const health=state.systemHealth||{},counts=health.counts||{},users=state.data.users||[],now=Date.now();
    const activeSessions=(state.data.sessions||[]).filter(row=>row.active!==false&&Number(new Date(row.expiresAt||0))>now);
    const locked=users.filter(user=>Number(new Date(user.blockedUntil||0))>now),latestBackup=health.backup?.latest||(state.serverBackups||[])[0];
    const roleRows=ACCOUNT_ROLE_CATALOG.map(role=>{const rows=users.filter(user=>user.role===role.key);return [role.label,number(rows.length),number(rows.filter(user=>user.status==='Aktif').length),number(rows.filter(user=>user.status==='Nonaktif').length)];});
    const storageLabel=health.storage==='supabase'?'Supabase':health.storage==='netlify-blobs'?'Netlify Blobs':'Sedang diperiksa';
    return `${pageHead('Dashboard Admin','Ringkasan akun, keamanan, cadangan, dan kondisi website dalam satu tempat.','<button class="btn primary" id="refreshAdminDashboardBtn">Periksa Sekarang</button>')}
      <div class="grid cols-4 admin-health-kpis">${kpiCard('Akun Aktif',number(counts.activeAccounts??users.filter(user=>user.status==='Aktif').length),'semua peran','👥')}${kpiCard('Perangkat Login',number(counts.activeSessions??activeSessions.length),'sesi aktif','📱')}${kpiCard('Akun Terkunci',number(counts.lockedAccounts??locked.length),'perlu diperiksa','🔒')}${kpiCard('Nota Belum Diperiksa',number(counts.pendingReceipts??0),'dikerjakan TL','🧾')}</div>
      <div class="grid cols-2" style="margin-top:18px"><div class="card"><div class="daily-table-toolbar"><div><h3>Ringkasan Akun</h3><small>Jumlah pengguna menurut peran dan status.</small></div><button class="btn soft mini" data-admin-dashboard-tab="accounts">Kelola Akun</button></div>${table(['Peran','Total','Aktif','Nonaktif'],roleRows)}</div>
      <div class="card"><div class="daily-table-toolbar"><div><h3>Kondisi Sistem</h3><small>Pemeriksaan penyimpanan dan pembaruan terakhir.</small></div><button class="btn soft mini" data-admin-dashboard-tab="status">Buka Status</button></div><div class="stat-list">${statLine('Penyimpanan',storageLabel,health.ok?'green':'yellow')}${statLine('Waktu Respons',health.latencyMs!==undefined?`${number(health.latencyMs)} ms`:'Belum diperiksa',health.ok?'green':'gray')}${statLine('Versi Sistem',health.version||'23.0.0','blue')}${statLine('Data Terakhir',health.updatedAt?formatDateTime(health.updatedAt):state.data.updatedAt?formatDateTime(state.data.updatedAt):'Belum ada','blue')}</div></div></div>
      <div class="grid cols-2" style="margin-top:18px"><div class="card"><div class="daily-table-toolbar"><div><h3>Cadangan Data</h3><small>Cadangan harian juga berjalan melalui jadwal server.</small></div><button class="btn soft mini" data-admin-dashboard-tab="backup">Buka Cadangan</button></div>${latestBackup?`<div class="backup-highlight"><span>💾</span><div><b>${escapeHtml(formatDateTime(latestBackup.createdAt))}</b><small>${escapeHtml(latestBackup.kind||'cadangan')} • versi ${number(latestBackup.revision||0)} • ${number(latestBackup.reports||0)} laporan</small></div></div>`:'<div class="empty">Belum ada cadangan server yang tercatat.</div>'}</div>
      <div class="card"><div class="daily-table-toolbar"><div><h3>Peringatan Keamanan</h3><small>Masalah login dan perangkat yang perlu diperiksa.</small></div><button class="btn soft mini" data-admin-dashboard-tab="sessions">Buka Perangkat</button></div><div class="stat-list">${statLine('Login aktif',number(counts.activeSessions??activeSessions.length),'green')}${statLine('Akun terkunci',number(counts.lockedAccounts??locked.length),(counts.lockedAccounts??locked.length)?'red':'green')}${statLine('Masalah nota',number(counts.receiptIssues??0),(counts.receiptIssues??0)?'yellow':'green')}${statLine('Notifikasi belum dibaca',number(unreadNotifications().length),unreadNotifications().length?'yellow':'green')}</div></div></div>`;
  }
  async function refreshAdminSystemDashboard(force=false){
    if(!canManageAccounts()||!window.ExtraJossBackend?.hasToken?.())return;
    if(state.systemHealth&&!force)return;
    try{
      const [healthResult,backupResult]=await Promise.all([window.ExtraJossBackend.systemHealth(),window.ExtraJossBackend.backups()]);
      state.systemHealth=healthResult.health||null;state.serverBackups=backupResult.backups||[];
      if(state.page==='dashboard')renderPage();
    }catch(error){if(force)toast(error.message||'Status sistem belum dapat diperiksa.');}
  }
  function bindAdminSystemDashboard(){
    document.getElementById('refreshAdminDashboardBtn')?.addEventListener('click',()=>refreshAdminSystemDashboard(true));
    document.querySelectorAll('[data-admin-dashboard-tab]').forEach(button=>button.addEventListener('click',()=>{const target=button.dataset.adminDashboardTab;if(target==='accounts')return goPage('accounts');state.settingsTab=target;goPage('setting');}));
    refreshAdminSystemDashboard(false);
  }
  function adminSpg() {
    const rows = filterGeneric(spgList(), ['name','email','area','status','phone']);
    const canEdit = canManageSystem();
    return `
      ${pageHead('Data SPG', 'TL dapat menambah dan memperbarui data SPG. Role lain hanya dapat melihat sesuai area.', canEdit ? '<button class="btn primary" id="saveSpgBtn">+ Simpan SPG</button>' : '')}
      <div class="grid cols-2">
        ${canEdit ? `<div class="card"><h3>Tambah akun SPG cepat</h3><div class="form two">
          ${field('Nama SPG', 'spgName', 'text', 'Contoh: Seri Rahmi')}
          ${field('Email Login', 'spgEmail', 'email', 'contoh@demo.local')}
          ${passwordField('Password Sementara', 'spgPassword', `Minimal ${minimumPasswordLength()} karakter`)}
          ${selectField('Area', 'spgArea', areas().map(a => a.name))}
          ${field('Nomor HP', 'spgPhone', 'text', '08xxxxxxxxxx')}
          ${selectField('Status', 'spgStatus', ['Aktif','Nonaktif'])}
          ${renderCustomFieldInputs('spg',{},'spgCreate')}
        </div></div>` : monitoringModeNotice()}
        <div class="card"><h3>Hak akses SPG</h3><p class="muted">SPG hanya melihat dan mengisi data miliknya. Pembuatan data SPG hanya dilakukan oleh TL.</p><hr><div class="stat-list">${statLine('Total SPG', rows.length, 'blue')}${statLine('Area aktif', new Set(rows.map(s=>s.area)).size, 'green')}${statLine('Outlet ditandai', scopedByArea(outlets()).length, 'purple')}</div></div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Daftar SPG</h3>${table(['Nama','Email','Area','HP','Status','Outlet Ditandai',...(canEdit?['Aksi']:[])], rows.map(u => [u.name, u.email, u.area, u.phone || '-', badge(u.status, u.status === 'Aktif' ? 'green' : 'gray'), scopedByArea(outlets()).filter(o => o.markedById === u.id || o.markedBy === u.name).length, ...(canEdit?[`<div class="btn-row compact-actions"><button class="btn soft mini" data-edit-user="${u.id}">Edit</button><button class="btn red mini" data-delete-user="${u.id}">Hapus</button></div>`]:[])]))}</div>`;
  }

  function simpleExportButtons(kind) {
    return `<button class="btn primary" data-simple-export="excel" data-export-kind="${kind}">Export Excel</button><button class="btn dark" data-simple-export="pdf" data-export-kind="${kind}">Export PDF</button>`;
  }
  function simpleSpgPage() {
    const selectedArea=isMonitorRole()?monitorSelectedArea():'';
    const rows = filterGeneric(spgList().filter(user=>!selectedArea||user.area===selectedArea), ['name','email','area','status','phone']);
    return `${pageHead('Data SPG','Daftar ringkas SPG dan area penempatannya.',simpleExportButtons('spg'))}${isMonitorRole()?monitorAreaPicker():''}
      <div class="grid cols-3">${kpiCard('Total SPG',number(rows.length),'sesuai area akun','👥')}${kpiCard('SPG Aktif',number(rows.filter(row=>row.status==='Aktif').length),'siap bertugas','✅')}${kpiCard('Area',number(new Set(rows.map(row=>row.area)).size),'area yang tampil','🗺️')}</div>
      <div class="card" style="margin-top:18px"><h3>Daftar SPG</h3>${table(['Nama','Area','Status','Nomor HP'],rows.map(user=>[`${escapeHtml(user.name)}${customFieldSummary('spg',user.customFields)?`<small class="custom-field-summary">${escapeHtml(customFieldSummary('spg',user.customFields))}</small>`:''}`,escapeHtml(user.area||'-'),badge(user.status,user.status==='Aktif'?'green':'gray'),escapeHtml(user.phone||'-')]))}</div>`;
  }
  function outletReferenceInfo(outlet) {
    const date=dateOnly(outlet.markedAt),assignment=assignmentFor(outlet.markedById,outlet.markedBy,date);
    let location=assignment&&locationById(assignment.locationId),kind=location?'Penempatan pada tanggal tersebut':'';
    const hasPoint=hasCoordinatePoint(outlet);
    if(!location&&hasPoint){
      const candidates=placementLocations().filter(item=>item.area===outlet.area&&hasCoordinatePoint(item));
      location=candidates.map(item=>({item,distance:distanceMeters(outlet.lat,outlet.lng,item.lat,item.lng)})).sort((a,b)=>a.distance-b.distance)[0]?.item||null;
      if(location)kind='Lokasi acuan terdekat';
    }
    const distance=location&&hasPoint?distanceMeters(outlet.lat,outlet.lng,location.lat,location.lng):null;
    return {location,kind,distance};
  }
  function dataOutletBaseRows() {
    let rows=scopedByArea(outlets());
    if(isMonitorRole())rows=rows.filter(outlet=>outlet.area===monitorSelectedArea());
    if(state.search.trim())rows=smartSearchRows(rows,state.search);
    return rows;
  }
  function dataOutletSelection(rows=dataOutletBaseRows()) {
    const permittedAreas=[...new Set(rows.map(outlet=>outlet.area).filter(Boolean))];
    if(isMonitorRole())state.outletDrillArea=monitorSelectedArea();
    else if(state.outletDrillArea&&!canAccessArea(state.outletDrillArea))state.outletDrillArea='';
    const area=state.outletDrillArea||'',areaRows=area?rows.filter(outlet=>outlet.area===area):rows;
    const spgNames=[...new Set(areaRows.map(outlet=>outlet.markedBy).filter(Boolean))];
    if(state.outletDrillSpg&&!spgNames.includes(state.outletDrillSpg))state.outletDrillSpg='';
    const spg=state.outletDrillSpg||'',detailRows=(spg?areaRows.filter(outlet=>outlet.markedBy===spg):areaRows).slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt));
    return {rows,permittedAreas,area,areaRows,spg,spgNames,detailRows};
  }
  function outletBreadcrumb(area,spg) {
    const parts=[`<button class="outlet-crumb ${!area?'active':''}" data-outlet-back-areas>Area</button>`];
    if(area)parts.push(`<span>›</span><button class="outlet-crumb ${!spg?'active':''}" data-outlet-back-spg>${escapeHtml(area)}</button>`);
    if(spg)parts.push(`<span>›</span><span class="outlet-crumb active">${escapeHtml(spg)}</span>`);
    return `<nav class="outlet-breadcrumb" aria-label="Posisi Data Outlet">${parts.join('')}</nav>`;
  }
  function outletAreaSummary(rows) {
    const accessible=areas().filter(area=>canAccessArea(area.name));
    return accessible.map(area=>{
      const items=rows.filter(outlet=>outlet.area===area.name),spgs=new Set(items.map(outlet=>outlet.markedBy).filter(Boolean));
      return [escapeHtml(area.name),number(spgs.size),number(items.length),number(items.reduce((sum,item)=>sum+Number(item.sold||0),0)),money(items.reduce((sum,item)=>sum+outletValue(item),0)),`<button class="btn primary mini" data-outlet-area="${escapeAttr(area.name)}">Lihat SPG</button>`];
    });
  }
  function outletSpgSummary(areaRows) {
    const users=new Map(spgList().filter(user=>user.area===state.outletDrillArea).map(user=>[user.name,user])),known=new Map();
    areaRows.forEach(outlet=>{if(outlet.markedBy&&!known.has(outlet.markedBy))known.set(outlet.markedBy,users.get(outlet.markedBy)||{name:outlet.markedBy,phone:'',status:'Tidak ditemukan'});});
    return [...known.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(user=>{
      const items=areaRows.filter(outlet=>outlet.markedBy===user.name),latest=items.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt))[0];
      return [`<b>${escapeHtml(user.name)}</b>${user.phone?`<small class="table-subline">${escapeHtml(user.phone)}</small>`:''}`,badge(user.status||'Aktif',(user.status||'Aktif')==='Aktif'?'green':'gray'),number(items.length),number(items.reduce((sum,item)=>sum+Number(item.sold||0),0)),latest?escapeHtml(formatDateTime(latest.markedAt)):'-',`<button class="btn primary mini" data-outlet-spg="${escapeAttr(user.name)}">Lihat Outlet</button>`];
    });
  }
  function outletDetailTable(rows) {
    const pageSize=[10,20,50].includes(Number(state.monitorOutletPageSize))?Number(state.monitorOutletPageSize):10,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));
    state.monitorOutletPage=Math.min(Math.max(1,Number(state.monitorOutletPage)||1),totalPages);
    const start=(state.monitorOutletPage-1)*pageSize,pageRows=rows.slice(start,start+pageSize),headers=['Foto','Outlet & Tanggal','Tanda','Kaleng','Alamat','Koordinat & GPS','Lokasi Acuan','Jarak','Maps','Aksi'];
    const body=pageRows.map(outlet=>{
      const reference=outletReferenceInfo(outlet),hasPoint=hasCoordinatePoint(outlet),coordinates=hasPoint?`${Number(outlet.lat).toFixed(6)}, ${Number(outlet.lng).toFixed(6)}`:'Tidak tersedia';
      const manage=canManageSystem()?`<button class="btn soft mini" data-edit-outlet="${escapeAttr(outlet.id)}">Edit</button><button class="btn yellow mini" data-note-outlet="${escapeAttr(outlet.id)}">Catatan</button><button class="btn red mini" data-delete-outlet="${escapeAttr(outlet.id)}">Hapus</button>`:'';
      return [photoThumb(outlet.photo),`<b>${escapeHtml(outlet.name)}</b><small class="table-subline">${escapeHtml(formatDateTime(outlet.markedAt))}</small>`,badge(outlet.tanda,tandaColor(outlet.tanda)),`${number(outlet.sold)}<small class="table-subline">${money(outletValue(outlet))}</small>`,escapeHtml(outlet.address||'Alamat belum diisi'),`<span class="coordinate-text">${escapeHtml(coordinates)}</span><small class="table-subline">Akurasi ${outlet.accuracy?`±${number(Math.round(outlet.accuracy))} m`:'belum tersedia'}</small>`,reference.location?`<b>${escapeHtml(reference.location.name)}</b><small class="table-subline">${escapeHtml(reference.kind)}</small>`:'Belum ada lokasi acuan',reference.distance===null?'-':`<b>${formatMeters(reference.distance)}</b>`,hasPoint?`<a class="btn soft mini" target="_blank" rel="noopener" href="${googleDirectionUrl(outlet.lat,outlet.lng)}">Buka Maps</a>`:'<span class="badge gray">GPS tidak tersedia</span>',`<div class="compact-actions"><button class="btn primary mini" data-view-outlet="${escapeAttr(outlet.id)}">Detail</button>${manage}</div>`];
    });
    return `${table(headers,body)}${outletPageNavigation(rows.length,state.monitorOutletPage,pageSize)}`;
  }
  function simpleOutletPage() {
    const selection=dataOutletSelection(),{rows,area,areaRows,spg,detailRows}=selection,scopeRows=spg?detailRows:area?areaRows:rows,scopeLabel=spg?`${area} • ${spg}`:area||'Semua area akses';
    const areaView=!area&&!isMonitorRole(),spgView=Boolean(area&&!spg),detailView=Boolean(area&&spg),profile=spgList().find(user=>user.name===spg&&user.area===area),wa=String(profile?.phone||'').replace(/\D/g,'').replace(/^0/,'62');
    const detailActions=detailView?`<div class="btn-row outlet-detail-actions">${profile&&canManageSystem()?`<button class="btn soft" data-edit-user="${escapeAttr(profile.id)}">Kelola SPG</button>`:''}${wa?`<a class="btn green" target="_blank" rel="noopener" href="https://wa.me/${escapeAttr(wa)}">Hubungi SPG</a>`:''}</div>`:'';
    const body=areaView
      ? `<div class="card outlet-list-card"><div class="daily-table-toolbar"><div><h3>Pilih Area</h3><small>Buka area untuk melihat SPG, lalu buka SPG untuk melihat seluruh outlet yang ditandai.</small></div><span class="badge blue">${number(areas().filter(item=>canAccessArea(item.name)).length)} area</span></div>${table(['Area','SPG Penanda','Jumlah Outlet','Kaleng Terjual','Estimasi Nilai','Aksi'],outletAreaSummary(rows))}</div>`
      : spgView
        ? `<div class="card outlet-list-card"><div class="daily-table-toolbar"><div><h3>SPG di ${escapeHtml(area)}</h3><small>Pilih SPG untuk melihat urutan outlet, titik, koordinat, dan jaraknya.</small></div><span class="badge blue">${number(new Set(areaRows.map(item=>item.markedBy).filter(Boolean)).size)} SPG</span></div>${table(['SPG','Status','Outlet','Kaleng Terjual','Tanda Terakhir','Aksi'],outletSpgSummary(areaRows))}</div>`
        : `<div class="card outlet-list-card"><div class="daily-table-toolbar"><div><h3>Outlet yang ditandai ${escapeHtml(spg)}</h3><small>Urutan terbaru. Jarak dihitung dari penempatan pada tanggal tersebut atau lokasi acuan terdekat.</small></div>${detailActions}</div>${outletDetailTable(detailRows)}</div>`;
    return `${pageHead('Data Outlet','Data bertingkat dari area, SPG, sampai outlet yang ditandai di lapangan.',simpleExportButtons('outlet'))}${isMonitorRole()?monitorAreaPicker():''}
      ${outletBreadcrumb(area,spg)}
      <div class="grid cols-4 outlet-kpi-grid">${kpiCard('Outlet',number(scopeRows.length),scopeLabel,'🏪')}${kpiCard('SPG Penanda',number(new Set(scopeRows.map(item=>item.markedBy).filter(Boolean)).size),'sesuai tampilan','👥')}${kpiCard('Kaleng Terjual',number(scopeRows.reduce((sum,item)=>sum+Number(item.sold||0),0)),'sesuai tampilan','📦')}${kpiCard('Ada GPS',number(scopeRows.filter(hasCoordinatePoint).length),'titik tersedia','📍')}</div>
      ${body}`;
  }

  function outletPageNavigation(totalRows, currentPage, pageSize) {
    if (!totalRows) return '';
    const totalPages=Math.max(1,Math.ceil(totalRows/pageSize));
    const page=Math.min(Math.max(1,currentPage),totalPages);
    const first=(page-1)*pageSize+1,last=Math.min(page*pageSize,totalRows);
    const pageNumbers=[];
    for(let candidate=Math.max(1,page-2);candidate<=Math.min(totalPages,page+2);candidate++)pageNumbers.push(candidate);
    if(!pageNumbers.includes(1))pageNumbers.unshift(1);
    if(!pageNumbers.includes(totalPages))pageNumbers.push(totalPages);
    const buttons=pageNumbers.map((value,index)=>{
      const previous=pageNumbers[index-1];
      const gap=previous&&value-previous>1?'<span class="pagination-gap" aria-hidden="true">…</span>':'';
      return `${gap}<button type="button" class="${value===page?'active':''}" data-monitor-outlet-page="${value}" aria-label="Halaman ${value}" ${value===page?'aria-current="page"':''}>${value}</button>`;
    }).join('');
    return `<div class="report-pagination outlet-pagination"><small>Menampilkan ${number(first)}–${number(last)} dari ${number(totalRows)} outlet</small><div class="pagination-controls"><button type="button" data-monitor-outlet-page="${page-1}" ${page===1?'disabled':''} aria-label="Halaman sebelumnya">‹</button>${buttons}<button type="button" data-monitor-outlet-page="${page+1}" ${page===totalPages?'disabled':''} aria-label="Halaman berikutnya">›</button></div><label class="outlet-page-size">Baris <select id="monitorOutletPageSize"><option value="10" ${pageSize===10?'selected':''}>10</option><option value="20" ${pageSize===20?'selected':''}>20</option><option value="50" ${pageSize===50?'selected':''}>50</option></select></label></div>`;
  }

  function accountAreaFields(prefix, user = {}) {
    const selected = new Set(Array.isArray(user.areas) ? user.areas : (user.area && user.area !== 'All Area' ? [user.area] : []));
    const restrictedRole=['SPG','SCO','MS','AM'].includes(String(user.role||'').toUpperCase());
    const all = !restrictedRole&&Boolean(user.allAreas || user.role === 'ADMIN');
    const canChooseAll = userHasAllAreas()&&!restrictedRole;
    const availableAreas = areas().filter(area=>canAccessArea(area.name));
    return `<div class="field span-2 account-area-field"><label>Cakupan Area</label><label class="account-all-area ${canChooseAll?'':'disabled'}"><input type="checkbox" id="${prefix}AllAreas" ${all?'checked':''} ${canChooseAll?'':'disabled'}> <span>Semua Area</span></label><div class="account-area-grid">${availableAreas.map(area=>`<label><input type="checkbox" data-account-area="${prefix}" value="${escapeAttr(area.name)}" ${selected.has(area.name)?'checked':''} ${all?'disabled':''}> <span>${escapeHtml(area.name)}</span></label>`).join('')}</div><small>Pilih satu atau beberapa area. SPG hanya boleh mempunyai satu area.</small></div>`;
  }
  function creatableAccountRoles() {
    return ACCOUNT_ROLE_CATALOG.filter(role=>state.user?.role==='ADMIN'||role.key!=='ADMIN');
  }
  function managerCanSeeAccount(user) {
    if (userHasAllAreas() || user.id === state.user?.id) return true;
    if (userHasAllAreas(user)) return false;
    return userAreaScope(user).some(area=>canAccessArea(area));
  }
  function accountRows() {
    const query = String(state.search || '').trim().toLowerCase();
    return state.data.users.map(normalizeUser).filter(user => {
      if (!managerCanSeeAccount(user)) return false;
      const roleOk = state.accountRoleFilter === 'Semua' || user.role === state.accountRoleFilter;
      const areaOk = state.accountAreaFilter === 'Semua' || userHasAllAreas(user) || userAreaScope(user).includes(state.accountAreaFilter);
      const statusOk = state.accountStatusFilter === 'Semua' || user.status === state.accountStatusFilter;
      const searchOk = !query || [user.name,user.email,user.phone,user.role,accountScopeLabel(user)].join(' ').toLowerCase().includes(query);
      return roleOk && areaOk && statusOk && searchOk;
    }).sort((a,b)=>ACCOUNT_ROLE_CATALOG.findIndex(item=>item.key===a.role)-ACCOUNT_ROLE_CATALOG.findIndex(item=>item.key===b.role)||a.name.localeCompare(b.name));
  }
  function isAccountLocked(user) { return Number(new Date(user?.blockedUntil || 0)) > Date.now(); }
  function accountSecurityHtml(user) {
    if(isAccountLocked(user))return `${badge('Terkunci','red')}<small class="table-subline">sampai ${escapeHtml(formatDateTime(user.blockedUntil))}</small>`;
    if(user.lastLoginAt)return `${badge(user.mfaEnabled?'Verifikasi aktif':'Aman',user.mfaEnabled?'blue':'green')}<small class="table-subline">login ${escapeHtml(formatDateTime(user.lastLoginAt))}</small>`;
    if(user.mfaEnabled)return badge('Verifikasi aktif','blue');
    return badge('Belum pernah login','gray');
  }
  function temporaryPasswordMap() {
    try {
      const now=Date.now(),rows=JSON.parse(localStorage.getItem(KEY_ADMIN_TEMP_PASSWORDS)||'{}'),fresh={};
      Object.entries(rows||{}).forEach(([email,row])=>{if(row?.password&&now-Number(row.savedAt||0)<24*60*60*1000)fresh[email]=row;});
      if(JSON.stringify(fresh)!==JSON.stringify(rows||{}))localStorage.setItem(KEY_ADMIN_TEMP_PASSWORDS,JSON.stringify(fresh));
      return fresh;
    } catch { return {}; }
  }
  function rememberTemporaryPassword(email,password) {
    if(!email||!password)return;
    const rows=temporaryPasswordMap();rows[String(email).toLowerCase()]={password:String(password),savedAt:Date.now()};
    localStorage.setItem(KEY_ADMIN_TEMP_PASSWORDS,JSON.stringify(rows));
  }
  function knownPasswordForEmail(email) {
    const key=String(email||'').toLowerCase();
    if(key===String(state.user?.email||'').toLowerCase()){
      const sessionPassword=currentLoginPassword||sessionStorage.getItem(KEY_SESSION_PASSWORD)||'';if(sessionPassword)return sessionPassword;
    }
    const temporary=temporaryPasswordMap()[key]?.password;if(temporary)return temporary;
    try{const remembered=JSON.parse(localStorage.getItem(KEY_REMEMBER)||'null');if(String(remembered?.email||'').toLowerCase()===key&&remembered?.password)return remembered.password;}catch{}
    return savedAccounts().find(item=>String(item.email||'').toLowerCase()===key)?.password||'';
  }
  function knownPasswordHtml(user,compact=true) {
    const password=knownPasswordForEmail(user?.email),safeId=`known-password-${String(user?.id||user?.email||'account').replace(/[^a-zA-Z0-9_-]/g,'')}`;
    if(!password)return `<div class="password-availability"><span class="badge gray">Terenkripsi</span><small>Tidak dapat dibaca kembali</small></div>`;
    return `<div class="known-password ${compact?'compact':''}"><div class="password-control"><input id="${escapeAttr(safeId)}" type="password" readonly value="${escapeAttr(password)}" aria-label="Password tersimpan"><button type="button" class="password-toggle" data-toggle-password="${escapeAttr(safeId)}" aria-label="Tampilkan password" title="Tampilkan password">👁️</button></div><button type="button" class="btn soft mini" data-copy-known-password="${escapeAttr(user.email)}">Salin</button><small>Hanya tersedia di perangkat ini</small></div>`;
  }
  async function copyKnownPassword(email) {
    const password=knownPasswordForEmail(email);if(!password)return toast('Password tidak tersimpan pada perangkat ini. Buat password baru dari menu Kelola.');
    try{await navigator.clipboard.writeText(password);toast('Password disalin.');}
    catch{const input=document.createElement('textarea');input.value=password;document.body.appendChild(input);input.select();document.execCommand('copy');input.remove();toast('Password disalin.');}
  }
  function bindKnownPasswordActions(scope=document) {
    scope.querySelectorAll?.('[data-copy-known-password]').forEach(button=>button.addEventListener('click',()=>copyKnownPassword(button.dataset.copyKnownPassword)));
  }
  function showTemporaryPasswordModal(user,password) {
    const safeUser=user||{};rememberTemporaryPassword(safeUser.email,password);
    modalShell('Password Siap Diberikan',`Password sementara untuk ${escapeHtml(safeUser.name||safeUser.email)} hanya ditampilkan pada perangkat ini selama 24 jam.`,`<div class="form modal-form"><div class="notice warning"><b>Simpan atau kirim sekarang.</b><small>Setelah data masuk ke server, password hanya disimpan sebagai kode terenkripsi dan tidak dapat dibaca kembali.</small></div>${knownPasswordHtml(safeUser,false)}</div>`,'<button class="btn primary" data-modal-close>Selesai</button>',()=>{bindPasswordVisibility(document.querySelector('.modal-card')||document);bindKnownPasswordActions(document.querySelector('.modal-card')||document);});
  }
  function manageAccountModal(id) {
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(!managerCanSeeAccount(user)||(user.role==='ADMIN'&&state.user?.role!=='ADMIN'))return toast('Akun ini hanya dapat dikelola Administrator.');
    const actions=[
      `<button class="btn soft" id="manageEditAccountBtn">Edit Data</button>`,
      `<button class="btn yellow" id="manageResetAccountBtn">Buat Password Baru</button>`,
      ['ADMIN','TL'].includes(user.role)?`<button class="btn blue" id="manageMfaAccountBtn">${user.mfaEnabled?'Matikan Verifikasi':'Aktifkan Verifikasi'}</button>`:'',
      isAccountLocked(user)?'<button class="btn green" id="manageUnlockAccountBtn">Buka Kunci Login</button>':'',
      `<button class="btn ${user.status==='Aktif'?'red':'green'}" id="manageToggleAccountBtn">${user.status==='Aktif'?'Nonaktifkan':'Aktifkan'} Akun</button>`,
      user.id!==state.user?.id?'<button class="btn red" id="manageTrashAccountBtn">Pindahkan ke Sampah</button>':''
    ].filter(Boolean).join('');
    modalShell('Kelola Akun',`${escapeHtml(user.name)} • ${escapeHtml(roleLabel(user.role))} • ${escapeHtml(accountScopeLabel(user))}`,`<div class="form modal-form"><div class="field"><label>Password yang diketahui perangkat ini</label>${knownPasswordHtml(user,false)}</div><div class="account-manage-actions">${actions}</div></div>`,'<button class="btn ghost" data-modal-close>Tutup</button>',()=>{
      const next=fn=>{closeModal();setTimeout(fn,30);};
      bindPasswordVisibility(document.querySelector('.modal-card')||document);bindKnownPasswordActions(document.querySelector('.modal-card')||document);
      document.getElementById('manageEditAccountBtn')?.addEventListener('click',()=>next(()=>editAccountModal(id)));
      document.getElementById('manageResetAccountBtn')?.addEventListener('click',()=>next(()=>resetAccountPasswordModal(id)));
      document.getElementById('manageMfaAccountBtn')?.addEventListener('click',()=>next(()=>configureAccountMfa(id)));
      document.getElementById('manageUnlockAccountBtn')?.addEventListener('click',()=>next(()=>unlockAccount(id)));
      document.getElementById('manageToggleAccountBtn')?.addEventListener('click',()=>next(()=>toggleAccountStatus(id)));
      document.getElementById('manageTrashAccountBtn')?.addEventListener('click',()=>next(()=>trashAccount(id)));
    });
  }
  function adminAccounts() {
    const rows = accountRows();
    const managedUsers = state.data.users.map(normalizeUser).filter(managerCanSeeAccount);
    const counts = Object.fromEntries(ACCOUNT_ROLE_CATALOG.map(role=>[role.key,managedUsers.filter(user=>user.role===role.key).length]));
    return `
      ${pageHead('Manajemen Akun', 'Buat dan atur akun Admin/TL, SCO, MS, Area Manager, serta SPG dari satu menu.', '<button class="btn primary" id="saveAccountBtn">+ Buat Akun</button>')}
      <div class="notice warning account-security-note"><b>Password lama tetap dilindungi.</b><small>Password yang baru dibuat atau dipakai login dapat dilihat pada perangkat ini. Password server yang sudah terenkripsi harus dibuat ulang jika tidak lagi tersimpan.</small></div>
      <div class="grid cols-4 account-role-stats" style="margin-top:18px">
        ${kpiCard('Admin', number(counts.ADMIN||0), 'akun dan keamanan', '🛡️')}
        ${kpiCard('Team Leader', number(counts.TL||0), 'operasional tim', '👤')}
        ${kpiCard('SCO / MS', number((counts.SCO||0)+(counts.MS||0)), 'monitoring area', '🔎')}
        ${kpiCard('Area Manager', number(counts.AM||0), 'monitoring area', '✅')}
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><span class="settings-kicker">Akun baru</span><h3>Buat akun dan cakupan area</h3><div class="form two">
          ${field('Nama Lengkap','accountName','text','Contoh: Nandra')}
          ${field('Email Login','accountEmail','email','nama@perusahaan.com')}
          <div class="field"><label>Peran</label><select id="accountRole">${creatableAccountRoles().map(role=>`<option value="${role.key}" ${role.key==='SCO'?'selected':''}>${escapeHtml(role.label)}</option>`).join('')}</select></div>
          ${passwordField('Password Sementara','accountPassword',`Minimal ${minimumPasswordLength()} karakter`)}
          ${field('Nomor HP','accountPhone','text','08xxxxxxxxxx')}
          ${selectField('Status','accountStatus',['Aktif','Nonaktif'],'Aktif')}
          ${accountAreaFields('account',{role:'SCO',areas:[]})}
        </div><div class="reporting-form-actions"><button class="btn primary" id="saveAccountBtn2">Buat Akun</button></div></div>
        <div class="card"><span class="settings-kicker">Hak akses</span><h3>Apa yang dapat dilihat setiap akun?</h3><div class="account-role-list">${ACCOUNT_ROLE_CATALOG.map(role=>`<div><span class="role-badge role-${role.key.toLowerCase()}">${escapeHtml(role.short)}</span><p><b>${escapeHtml(role.label)}</b><small>${escapeHtml(role.description)}</small></p></div>`).join('')}</div></div>
      </div>
      <div class="card filter-card account-filter-card" style="margin-top:18px"><div class="form three">
        ${selectField('Filter Peran','accountRoleFilter',['Semua',...ACCOUNT_ROLE_CATALOG.map(role=>role.key)],state.accountRoleFilter)}
        ${selectField('Filter Area','accountAreaFilter',['Semua',...areas().map(area=>area.name)],state.accountAreaFilter)}
        ${selectField('Filter Status','accountStatusFilter',['Semua','Aktif','Nonaktif'],state.accountStatusFilter)}
      </div></div>
      <div class="card" style="margin-top:18px"><div class="btn-row" style="justify-content:space-between"><div><h3>Daftar Akun</h3><small>${number(rows.length)} akun sesuai filter. Gunakan satu tombol Kelola agar tabel tetap ringkas.</small></div></div>${table(['Nama','Peran','Cakupan Area','Email','Password','Status','Keamanan','Aksi'],rows.map(user=>[
        `<b>${escapeHtml(user.name)}</b>`,
        `<span class="role-badge role-${user.role.toLowerCase()}">${escapeHtml(roleLabel(user.role))}</span>`,
        escapeHtml(accountScopeLabel(user)),
        escapeHtml(user.email),
        knownPasswordHtml(user),
        badge(user.status,user.status==='Aktif'?'green':'gray'),
        accountSecurityHtml(user),
        `<button class="btn soft mini account-manage-button" data-manage-account="${escapeAttr(user.id)}">Kelola</button>`
      ]))}</div>`;
  }
  function adminOutlets() {
    const rows = visibleOutlets().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt));
    return `
      ${pageHead('Data Outlet Ditandai', 'Semua outlet yang dibuat/ditandai SPG. Admin bisa filter per area, SPG, atau tanda outlet.', '<button class="btn primary" data-page-jump="map">Buka Maps Admin</button>')}
      ${filterBox()}
      <div class="grid cols-4" style="margin:18px 0">${kpiCard('Outlet', number(rows.length), 'hasil filter', '📍')}${kpiCard('Kaleng Terjual', number(metrics(rows).sold), 'hasil filter', '📦')}${kpiCard('Estimasi Nilai', money(metrics(rows).value), 'harga per area', '💰')}${kpiCard('SPG', number(metrics(rows).spgs), 'pada filter', '👥')}</div>
      <div class="grid cols-2" style="margin-bottom:18px"><div class="card"><h3>Outlet Potensial</h3>${potentialSection(rows)}</div><div class="card"><h3>Peta Coverage Area</h3>${coverageSection(rows)}</div></div>
      <div class="card"><h3>Data outlet</h3>${outletTable(rows)}</div>
      <div class="card" style="margin-top:18px"><h3>Potensi outlet double</h3><small>Otomatis cek outlet yang berdekatan atau nama mirip.</small>${duplicateTable(rows)}</div>`;
  }
  function adminIssues() {
    const rows = problemOutlets(visibleOutlets()).sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt));
    return `
      ${pageHead('Outlet Bermasalah', 'Outlet yang perlu ditindaklanjuti: toko tutup, menolak, potensi double, atau GPS kurang akurat.')}
      ${filterBox()}
      <div class="grid cols-3" style="margin:18px 0">
        ${kpiCard('Total Bermasalah', number(rows.length), 'hasil filter', '⚠️')}
        ${kpiCard('Potensi Double', number(duplicateCandidates(rows).length), 'butuh cek nama/lokasi', '🔁')}
        ${kpiCard('GPS Kurang Akurat', number(rows.filter(o=>Number(o.accuracy||0)>100).length), 'di atas 100 meter', '📡')}
      </div>
      <div class="grid cols-2">
        <div class="card"><h3>Rekomendasi tindak lanjut</h3>${recommendationsList(rows)}</div>
        <div class="card"><h3>Timeline outlet bermasalah</h3>${timelineList(rows)}</div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Daftar outlet bermasalah</h3>${outletTable(rows)}</div>`;
  }

  function adminMap() {
    return `
      ${pageHead('Maps Admin', 'TL melihat titik outlet dan jalur SPG sesuai area kerja.', '<button class="btn soft" id="toggleMapModeBtn">Tampilan: Detail</button><button class="btn soft" id="toggleLabelsBtn">Nama Outlet: Tidak</button><button class="btn primary" id="fitMapBtn">Tampilkan Semua</button>')}
      ${filterBox()}
      <div class="map-shell admin-map-shell" style="margin-top:18px">
        <div class="map-panel"><h3>Legenda Maps</h3><small>Warna marker berdasarkan tanda outlet. Garis warna menunjukkan jalur berdasarkan tanggal. Lingkaran transparan menunjukkan heatmap/area yang sering ditandai.</small><div class="stat-list" style="margin-top:12px">${tandaOptions.map(t => legend(t, tandaColor(t))).join('')}</div><hr><h3>Peta Coverage Area</h3>${coverageSection(visibleOutlets())}<hr><h3>Jalur SPG</h3><div id="routeLegend"></div></div>
        <div class="map-box"><div id="map"></div></div>
        <div class="map-panel"><h3>Ringkasan Maps</h3><small>Catatan otomatis berdasarkan outlet yang ditandai.</small><div id="aiMapList"></div></div>
      </div>`;
  }
  function adminExport() {
    const rows = getExportRows();
    return `
      ${pageHead('Export Data Outlet', 'Export data outlet yang sudah ditandai. Bisa pilih template: ringkas, lengkap, per SPG, per area, dengan foto, tanpa foto, atau data mentah.', '<button class="btn primary" id="exportExcelBtn">Export Excel</button><button class="btn dark" id="exportPdfBtn">Export PDF</button><button class="btn green" id="printReportBtn">Cetak</button>')}
      ${filterBox()}
      <div class="grid cols-3" style="margin:18px 0">
        <div class="card"><h3>Template Export</h3><p class="muted">Pilih format laporan sebelum export.</p>${selectField('Jenis Template', 'exportTemplateSelect', exportTemplates, selectedExportTemplate())}<div class="template-pills">${exportTemplates.map(t=>`<button class="btn ${selectedExportTemplate()===t?'primary':'soft'} mini" data-template="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('')}</div></div>
        <div class="card"><h3>Export Data</h3><p class="muted">Excel/PDF mengikuti filter yang dipilih dan menyertakan link Google Maps.</p><div class="btn-row"><button class="btn primary" id="exportExcelBtn2">Download Excel</button><button class="btn dark" id="exportPdfBtn2">Download PDF</button></div></div>
        <div class="card"><h3>Backup / Restore</h3><p class="muted">Aman sebelum database. Backup JSON bisa dipakai pindah laptop atau simpan arsip.</p><input type="file" id="restoreJsonInput" accept=".json" /><div class="btn-row" style="margin-top:10px"><button class="btn soft" id="exportJsonBtn">Backup JSON</button><button class="btn yellow" id="restoreJsonBtn">Restore JSON</button></div></div>
      </div>
      <div class="grid cols-3" style="margin-bottom:18px">
        <div class="card"><h3>Import Excel/CSV</h3><p class="muted">Import outlet lama dengan validasi kolom wajib, koordinat, area, SPG, dan potensi double.</p><input type="file" id="importExcelInput" accept=".xlsx,.xls,.csv" /><button class="btn green" id="importExcelBtn" style="margin-top:10px">Import dengan Validasi</button></div>
        <div class="card"><h3>Kesehatan Data</h3>${healthDashboard(rows)}</div>
        <div class="card"><h3>Ringkasan Siap Laporan</h3><p class="ai-summary">${escapeHtml(aiSummaryText(rows))}</p></div>
      </div>
      <div class="card"><h3>Preview hasil filter/export</h3>${outletTable(rows)}</div>`;
  }
  function adminSettings() {
    if (canManageAccounts()) return advancedAdminSettings();
    const control = systemControl();
    const reporting = state.data.reportingConfig || {};
    const tabs = [
      ['general','⚙️','Umum & Laporan'],
      ['menus','🧭','Menu TL'],
      ['spg','📱','Pengaturan SPG'],
      ['location','📍','Status Lokasi'],
      ['areas','🗺️','Area & Tim'],
      ['storage','☁️','Penyimpanan'],
      ['history','🕘','Riwayat']
    ];
    return `
      ${pageHead('Pengaturan Sistem', 'Atur menu, laporan, cara kerja SPG, area, dan penyimpanan dari satu tempat.', '<button class="btn primary" id="saveSettingsBtn">Simpan Pengaturan</button>')}
      <div class="settings-status card"><div><span class="badge green">Sistem aktif</span><h3>Perubahan tersimpan di perangkat ini dan ikut saat data disinkronkan.</h3><p class="muted">Pengaturan dan Logout selalu tersedia supaya TL tidak kehilangan akses.</p></div><div class="settings-status-count"><b>${ADMIN_MENU_CATALOG.filter(item=>featureEnabled(item.key,'admin')).length}</b><span>menu TL aktif</span></div></div>
      <nav class="settings-tabs" aria-label="Bagian Pengaturan">${tabs.map(([key,icon,label])=>`<button class="${state.settingsTab===key?'active':''}" data-settings-tab="${key}">${icon} ${label}</button>`).join('')}</nav>
      ${state.settingsTab === 'menus' ? settingsAdminMenus(control) : state.settingsTab === 'spg' ? settingsSpg(control) : state.settingsTab === 'location' ? settingsLocationStatus() : state.settingsTab === 'areas' ? settingsAreas(reporting) : state.settingsTab === 'storage' ? settingsStorage() : state.settingsTab === 'history' ? settingsHistory() : settingsGeneral(reporting, control)}
      <div class="notice good settings-save-hint"><b>Setelah mengubah pilihan, tekan “Simpan Pengaturan”.</b><small>Menu dan aturan kerja akan langsung mengikuti pilihan terbaru.</small></div>`;
  }
  function advancedAdminSettings() {
    const security=securitySettings();
    const allowedTabs=['appearance','areas','features','fields','security','access','sessions','trash','notifications','status','backup','history'];
    if(!allowedTabs.includes(state.settingsTab))state.settingsTab='appearance';
    const tabs=[['appearance','🎨','Tampilan & Teks'],['areas','🗺️','Area & Harga'],['features','🧩','Fitur & Menu'],['fields','🧾','Field Tambahan'],['security','🔐','Akun & Keamanan'],['access','🛡️','Hak Akses'],['sessions','📱','Perangkat & Sesi'],['trash','🗑️','Sampah & Pemulihan'],['notifications','🔔','Notifikasi'],['status','🩺','Status Website'],['backup','💾','Cadangan Data'],['history','🕘','Riwayat']];
    const activeUsers=state.data.users.filter(user=>user.status==='Aktif').length;
    const content=state.settingsTab==='appearance'?advancedAppearanceSettings()
      :state.settingsTab==='areas'?advancedAreaSettings()
      :state.settingsTab==='features'?advancedFeatureSettings()
      :state.settingsTab==='fields'?advancedFieldSettings()
      :state.settingsTab==='access'?advancedAccessSettings()
      :state.settingsTab==='sessions'?advancedSessionsSettings()
      :state.settingsTab==='trash'?advancedTrashSettings()
      :state.settingsTab==='notifications'?advancedNotificationsSettings()
      :state.settingsTab==='status'?advancedSystemStatus()
      :state.settingsTab==='backup'?advancedBackupSettings()
      :state.settingsTab==='history'?settingsHistory()
      :advancedSecuritySettings(security);
    const hasPrevious=(state.data.settings.systemVersions||[]).length>0;
    return `${pageHead('Pengaturan Admin','Ubah tampilan, teks, menu, fitur, field, keamanan, dan cadangan tanpa membuka source.',`<button class="btn soft" id="previewSettingsBtn">Pratinjau Perubahan</button><button class="btn yellow" id="restorePreviousSettingsBtn" ${hasPrevious?'':'disabled'}>Kembalikan Versi Sebelumnya</button><button class="btn primary" id="saveSettingsBtn">Simpan Semua Perubahan</button>`)}
      <div class="settings-status card"><div><span class="badge green">Perlindungan aktif</span><h3>Admin mengatur akun tanpa membuka data operasional SPG.</h3><p class="muted">Pengaturan tersimpan bersama dan berlaku pada perangkat lain setelah data diperbarui.</p></div><div class="settings-status-count"><b>${number(activeUsers)}</b><span>akun aktif</span></div></div>
      <nav class="settings-tabs" aria-label="Bagian Pengaturan Admin">${tabs.map(([key,icon,label])=>`<button class="${state.settingsTab===key?'active':''}" data-settings-tab="${key}">${icon} ${label}</button>`).join('')}</nav>
      ${content}
      <div class="notice good settings-save-hint"><b>Tekan “Simpan Semua Perubahan” setelah mengubah pilihan.</b><small>Perubahan dikirim ke data bersama dan berlaku untuk pengguna yang sesuai.</small></div>`;
  }
  function advancedAppearanceSettings() {
    const content=systemControl().contentOverrides;
    return `<div class="settings-layout"><div class="card span-2"><span class="settings-kicker">Identitas website</span><h3>Nama dan teks utama</h3><p class="muted">Semua bagian ini dapat diubah tanpa membuka source.</p><div class="form two">
      ${field('Nama Website','settingAppName','text','Website Extra Joss SPG',state.data.settings.appName||content.siteName)}
      ${field('Judul Halaman Login','settingLoginTitle','text','Website Extra Joss SPG',content.loginTitle)}
      <div class="field span-2"><label>Narasi Login</label><textarea id="settingLoginSubtitle">${escapeHtml(content.loginSubtitle)}</textarea></div>
      <div class="field span-2"><label>Narasi Dashboard Monitoring</label><textarea id="settingDashboardSubtitle">${escapeHtml(content.dashboardSubtitle)}</textarea></div>
      ${field('Nama Kontak Bantuan','settingHelpName','text','Solehudin - Team Leader',content.helpName)}
      ${field('Nomor WhatsApp Bantuan','settingHelpPhone','text','087805435987',content.helpPhone)}
      <div class="field span-2"><label>Teks Copyright</label><input id="settingFooterText" value="${escapeAttr(content.footerText)}"></div>
    </div></div><div class="card span-2"><span class="settings-kicker">Pratinjau singkat</span><h3>${escapeHtml(state.data.settings.appName||content.siteName)}</h3><p>${escapeHtml(content.loginSubtitle)}</p><small>${escapeHtml(content.footerText)}</small></div></div>`;
  }
  function advancedAreaSettings() {
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Harga global</span><h3>Harga Default per Kaleng</h3><p class="muted">Satu harga dipakai untuk seluruh area, dashboard, laporan, Excel, dan PDF. Hanya Admin yang dapat mengubah angka ini.</p><div class="form">${field('Harga Default per Kaleng','settingHarga','number','4000',state.data.settings.hargaPerPcs||4000)}${field('PCS per Karton','settingPcsKarton','number','24',state.data.settings.pcsPerKarton||24)}</div></div>
      <div class="card"><span class="settings-kicker">Tambah area</span><h3>Area operasional baru</h3><div class="form">${field('Nama Area','newAreaName','text','Contoh: Pontianak')}${field('Target Area','newAreaTarget','number','2400')}<button class="btn primary" id="addAreaBtn">+ Tambah Area</button></div><div class="notice info"><b>Tidak ada harga per area.</b><small>Semua area otomatis memakai Harga Default per Kaleng.</small></div></div>
      <div class="card span-2"><span class="settings-kicker">Daftar area</span><h3>Ubah nama, kota, atau target</h3><div class="area-setting-grid">${areas().map(area=>`<div class="area-setting-card"><div class="area-setting-head"><b>${escapeHtml(area.name)}</b><span style="background:${escapeAttr(area.color)}"></span></div><div class="stat-list">${statLine('Kota',area.city||area.name,'blue')}${statLine('Target Area',number(area.target||0),'green')}</div><div class="btn-row"><button class="btn soft mini" data-edit-area="${escapeAttr(area.id)}">Edit Area</button><button class="btn red mini" data-delete-area="${escapeAttr(area.id)}">Hapus</button></div></div>`).join('')}</div></div></div>`;
  }
  function advancedFeatureSettings() {
    const control=systemControl();
    return `<div class="settings-layout"><div class="card span-2"><span class="settings-kicker">Menu bawaan</span><h3>Ubah nama, keterangan, atau tampilannya</h3><p class="muted">Menu penting tetap dikunci agar Admin tidak kehilangan akses.</p><div class="admin-builder-list">${ADMIN_MENU_CATALOG.map(item=>{const copy=menuCopy(item);return `<div class="admin-builder-row"><div class="builder-icon">${escapeHtml(item.icon)}</div><div class="builder-fields"><input data-menu-label-key="${escapeAttr(item.key)}" data-menu-copy="label" value="${escapeAttr(copy.label)}" aria-label="Nama menu ${escapeAttr(item.label)}"><input data-menu-label-key="${escapeAttr(item.key)}" data-menu-copy="description" value="${escapeAttr(copy.description)}" aria-label="Keterangan menu ${escapeAttr(item.label)}"></div>${settingToggle('Tampil',item.key,featureEnabled(item.key,'admin'),'Aktifkan atau sembunyikan menu ini.','admin',item.locked)}</div>`}).join('')}</div></div>
      <div class="card"><span class="settings-kicker">Tambah fitur</span><h3>Fitur informasi baru</h3><div class="form">${field('Nama Fitur','newFeatureLabel','text','Contoh: Pengumuman Tim')}${field('Ikon','newFeatureIcon','text','📣')}<div class="field"><label>Keterangan</label><input id="newFeatureDescription" placeholder="Keterangan singkat"></div><div class="field"><label>Isi Halaman</label><textarea id="newFeatureContent" placeholder="Tulis isi halaman fitur"></textarea></div><div class="field"><label>Tampil untuk</label><div class="role-check-grid">${ACCOUNT_ROLE_CATALOG.map(role=>`<label><input type="checkbox" data-new-feature-role value="${role.key}" ${role.key==='TL'?'checked':''}> ${escapeHtml(role.short)}</label>`).join('')}</div></div><button class="btn primary" id="addCustomFeatureBtn">+ Tambah Fitur</button></div></div>
      <div class="card"><span class="settings-kicker">Fitur tambahan</span><h3>Edit atau hapus fitur</h3><div class="custom-setting-list">${control.customFeatures.length?control.customFeatures.map(item=>`<div class="custom-setting-card" data-custom-feature-id="${escapeAttr(item.id)}"><div class="form two"><input data-custom-feature-prop="label" value="${escapeAttr(item.label)}"><input data-custom-feature-prop="icon" value="${escapeAttr(item.icon)}"><input class="span-2" data-custom-feature-prop="description" value="${escapeAttr(item.description)}"><textarea class="span-2" data-custom-feature-prop="content">${escapeHtml(item.content)}</textarea></div><div class="role-check-grid">${ACCOUNT_ROLE_CATALOG.map(role=>`<label><input type="checkbox" data-custom-feature-role="${role.key}" ${item.roles.includes(role.key)?'checked':''}> ${escapeHtml(role.short)}</label>`).join('')}</div><div class="btn-row"><label class="remember-line"><input type="checkbox" data-custom-feature-prop="active" ${item.active!==false?'checked':''}> Aktif</label><button class="btn red mini" data-delete-custom-feature="${escapeAttr(item.id)}">Hapus</button></div></div>`).join(''):'<div class="empty">Belum ada fitur tambahan.</div>'}</div></div></div>`;
  }
  function advancedFieldSettings() {
    const control=systemControl();
    const locationLabel={outlet:'Form Outlet',spg:'Data SPG',reporting:'Reporting SPG'};
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Tambah field</span><h3>Kolom isian baru</h3><p class="muted">Field baru langsung muncul pada bagian yang dipilih.</p><div class="form"><div class="field"><label>Lokasi Field</label><select id="newFieldLocation"><option value="outlet">Form Outlet</option><option value="spg">Data SPG</option><option value="reporting">Reporting SPG</option></select></div>${field('Nama Field','newFieldLabel','text','Contoh: Nama Distributor')}<div class="field"><label>Jenis Isian</label><select id="newFieldType"><option value="text">Teks singkat</option><option value="number">Angka</option><option value="date">Tanggal</option><option value="select">Daftar pilihan</option><option value="textarea">Catatan panjang</option></select></div>${field('Petunjuk Singkat','newFieldPlaceholder','text','Contoh isian')}<div class="field"><label>Pilihan (khusus daftar pilihan)</label><input id="newFieldOptions" placeholder="Ya, Tidak, Belum tahu"></div><label class="remember-line"><input type="checkbox" id="newFieldRequired"> Wajib diisi</label><button class="btn primary" id="addCustomFieldBtn">+ Tambah Field</button></div></div>
      <div class="card span-2"><span class="settings-kicker">Field aktif</span><h3>Edit, matikan, atau hapus field</h3><div class="custom-setting-list">${control.customFields.length?control.customFields.map(item=>`<div class="custom-setting-card" data-custom-field-id="${escapeAttr(item.id)}"><div class="form three"><select data-custom-field-prop="location">${Object.entries(locationLabel).map(([key,label])=>`<option value="${key}" ${item.location===key?'selected':''}>${label}</option>`).join('')}</select><input data-custom-field-prop="label" value="${escapeAttr(item.label)}"><select data-custom-field-prop="type">${['text','number','date','select','textarea'].map(type=>`<option ${item.type===type?'selected':''}>${type}</option>`).join('')}</select><input data-custom-field-prop="placeholder" value="${escapeAttr(item.placeholder)}" placeholder="Petunjuk singkat"><input data-custom-field-prop="options" value="${escapeAttr(item.options.join(', '))}" placeholder="Pilihan dipisah koma"></div><div class="btn-row"><label class="remember-line"><input type="checkbox" data-custom-field-prop="required" ${item.required?'checked':''}> Wajib</label><label class="remember-line"><input type="checkbox" data-custom-field-prop="active" ${item.active!==false?'checked':''}> Aktif</label><button class="btn red mini" data-delete-custom-field="${escapeAttr(item.id)}">Hapus</button></div></div>`).join(''):'<div class="empty">Belum ada field tambahan.</div>'}</div></div></div>`;
  }
  function advancedSecuritySettings(security) {
    return `<div class="settings-layout">
      <div class="card"><span class="settings-kicker">Password</span><h3>Aturan password akun</h3><p class="muted">Gunakan angka yang cukup kuat tetapi tetap mudah dijalankan tim.</p><div class="form">
        ${field('Minimal Panjang Password','settingMinPasswordLength','number','8',security.minPasswordLength)}
        ${field('Batas Salah Login','settingMaxLoginAttempts','number','5',security.maxLoginAttempts)}
        ${field('Lama Akun Dikunci (menit)','settingAccountLockMinutes','number','15',security.accountLockMinutes)}
        ${field('Lama Login Aktif (menit)','settingSessionMinutes','number','480',security.sessionMinutes)}
        <div class="field"><label>Simpan Jalur GPS</label><select id="settingRouteRetentionDays"><option value="60" ${security.routeRetentionDays===60?'selected':''}>60 hari</option><option value="90" ${security.routeRetentionDays===90?'selected':''}>90 hari</option></select><small>Jalur rinci yang lebih lama akan dihapus otomatis.</small></div>
      </div></div>
      <div class="card"><span class="settings-kicker">Login</span><h3>Cara akun masuk</h3><div class="menu-control-list">
        ${settingToggle('Izinkan akun tersimpan','allowSavedAccounts',security.allowSavedAccounts,'Email dan password dapat dipilih kembali pada perangkat yang sama.','security')}
        ${settingToggle('Pemberitahuan penggunaan lokasi','locationNoticeRequired',true,'SPG diberi penjelasan singkat saat lokasi digunakan.','security',true)}
      </div></div>
      <div class="card span-2"><span class="settings-kicker">Saran keamanan</span><h3>Langkah sederhana yang perlu dilakukan</h3><div class="stat-list">${statLine('1. Ubah password Admin','Lakukan secara berkala','blue')}${statLine('2. Nonaktifkan akun lama','Akun langsung tidak dapat login','yellow')}${statLine('3. Periksa riwayat','Lihat perubahan akun dan pengaturan','green')}</div></div>
      <div class="card span-2"><span class="settings-kicker">Verifikasi tambahan</span><h3>Authenticator untuk Admin dan TL</h3><p class="muted">Aktifkan dari tombol “Verifikasi” pada Manajemen Akun. Setelah aktif, login meminta 6 angka dari aplikasi Authenticator.</p><div class="notice info"><b>Tidak wajib untuk akun lain.</b><small>Verifikasi tambahan hanya tersedia untuk Admin dan TL karena keduanya mempunyai akses pengelolaan.</small></div></div>
    </div>`;
  }
  function advancedAccessSettings() {
    const rows=[
      ['Admin','Manajemen akun dan pengaturan keamanan'],
      ['TL','Seluruh menu operasional, Data SPG, laporan, maps, export, dan pengaturan'],
      ['SCO / MS / AM','Dashboard mingguan, reporting, data ringkas, outlet per area, export, dan panduan'],
      ['SPG','Beranda, tambah outlet, daftar outlet, panduan, dan profil']
    ];
    return `<div class="settings-layout"><div class="card span-2"><span class="settings-kicker">Batas menu</span><h3>Siapa dapat melihat apa?</h3><p class="muted">Batas ini sudah dikunci agar menu penting tidak tertukar antarjabatan.</p>${table(['Pengguna','Menu yang tersedia'],rows.map(row=>row.map(escapeHtml)))}</div>
      <div class="card"><span class="settings-kicker">Monitoring</span><h3>Pelacakan perjalanan</h3><p class="muted">Rincian perjalanan hanya dapat dibuka oleh TL. Penggunaan lokasi tetap meminta izin perangkat dan dijelaskan singkat kepada SPG.</p></div>
      <div class="card"><span class="settings-kicker">Fokus Area</span><h3>${escapeHtml((state.data.reportingConfig?.focusAreas||[]).join(', ')||'Belum dipilih TL')}</h3><p class="muted">TL memilih area fokus dari Pengaturan TL. Role lain selalu melihat nama area biasa.</p></div></div>`;
  }
  function advancedSessionsSettings(){
    const now=Date.now(),current=window.ExtraJossBackend?.getSessionId?.()||'';
    const rows=(state.data.sessions||[]).slice().sort((a,b)=>String(b.lastSeenAt||b.createdAt||'').localeCompare(String(a.lastSeenAt||a.createdAt||'')));
    const active=rows.filter(row=>row.active!==false&&Number(new Date(row.expiresAt||0))>now);
    return `<div class="settings-layout"><div class="card span-2"><div class="daily-table-toolbar"><div><span class="settings-kicker">Perangkat & Sesi</span><h3>Perangkat yang sedang login</h3><small>Admin dapat mengeluarkan satu perangkat atau semua perangkat milik satu akun.</small></div><span class="badge blue">${number(active.length)} aktif</span></div>${rows.length?table(['Akun','Peran','Perangkat','Login','Terakhir Aktif','Status','Aksi'],rows.map(row=>[escapeHtml(row.userName||row.userId),escapeHtml(row.role||'-'),`${escapeHtml(row.device||'-')}${row.id===current?'<small class="table-subline">Perangkat ini</small>':''}`,escapeHtml(formatDateTime(row.createdAt)),escapeHtml(formatDateTime(row.lastSeenAt)),badge(row.active!==false&&Number(new Date(row.expiresAt||0))>now?'Aktif':'Berakhir',row.active!==false&&Number(new Date(row.expiresAt||0))>now?'green':'gray'),row.active!==false&&Number(new Date(row.expiresAt||0))>now?`<div class="btn-row compact-actions"><button class="btn red mini" data-revoke-session="${escapeAttr(row.id)}">Keluarkan</button><button class="btn yellow mini" data-logout-user-devices="${escapeAttr(row.userId)}">Keluarkan Semua</button></div>`:'-'])):'<div class="empty">Belum ada catatan perangkat.</div>'}</div></div>`;
  }
  function advancedTrashSettings(){
    const rows=state.data.trash||[];
    return `<div class="settings-layout"><div class="card span-2"><div class="daily-table-toolbar"><div><span class="settings-kicker">Sampah & Pemulihan</span><h3>Data yang dapat dipulihkan</h3><small>Akun yang dipindahkan ke sampah tidak dapat login sampai dipulihkan.</small></div><span class="badge gray">${number(rows.length)} item</span></div>${rows.length?table(['Jenis','Nama','Dihapus','Oleh','Aksi'],rows.map(row=>[escapeHtml(row.kind==='user'?'Akun':row.kind),escapeHtml(row.label||row.recordId),escapeHtml(formatDateTime(row.deletedAt)),escapeHtml(row.deletedBy||'-'),`<button class="btn green mini" data-restore-trash="${escapeAttr(row.id)}">Pulihkan</button>`])):'<div class="empty">Sampah masih kosong.</div>'}</div></div>`;
  }
  function advancedNotificationsSettings(){
    const rows=(state.data.notifications||[]).slice(0,50);
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Notifikasi baru</span><h3>Kirim pemberitahuan</h3><div class="form">${field('Judul','adminNoticeTitle','text','Contoh: Jadwal diperbarui')}<div class="field"><label>Isi</label><textarea id="adminNoticeMessage" placeholder="Tulis pemberitahuan singkat"></textarea></div><div class="field"><label>Ditujukan untuk</label><select id="adminNoticeRole"><option value="">Semua pengguna</option>${ACCOUNT_ROLE_CATALOG.map(role=>`<option value="${role.key}">${escapeHtml(role.label)}</option>`).join('')}</select></div>${selectField('Area (opsional)','adminNoticeArea',['',...areas().map(area=>area.name)],'')}<button class="btn primary" id="sendAdminNoticeBtn">Kirim Notifikasi</button></div></div><div class="card"><span class="settings-kicker">Cara kerja</span><h3>Lonceng semua pengguna</h3><p class="muted">Pemberitahuan tampil pada ikon lonceng. Penempatan SPG dan login perangkat baru dibuat otomatis.</p><div class="stat-list">${statLine('Notifikasi tersimpan',number(rows.length),'blue')}${statLine('Peringatan perangkat baru',number(rows.filter(row=>row.type==='warning').length),'yellow')}${statLine('Notifikasi penempatan',number(rows.filter(row=>row.type==='placement').length),'green')}</div></div><div class="card span-2"><h3>Notifikasi terbaru</h3>${rows.length?table(['Waktu','Judul','Isi','Tujuan'],rows.map(row=>[escapeHtml(formatDateTime(row.createdAt)),escapeHtml(row.title),escapeHtml(row.message),escapeHtml(row.userId?`Akun ${row.userId}`:row.roles?.length?row.roles.join(', '):row.area||'Semua pengguna')])):'<div class="empty">Belum ada notifikasi.</div>'}</div></div>`;
  }
  function advancedSystemStatus() {
    const health=state.systemHealth||{},counts=health.counts||{},connected=Boolean(window.ExtraJossBackend?.hasToken?.()),storageLabel=health.storage==='supabase'?'Supabase':health.storage==='netlify-blobs'?'Netlify Blobs':'Belum diperiksa';
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Kondisi website</span><h3>Status layanan</h3><div class="stat-list">${statLine('Sambungan akun',connected?'Tersambung':'Belum tersambung',connected?'green':'yellow')}${statLine('Internet',navigator.onLine?'Online':'Offline',navigator.onLine?'green':'yellow')}${statLine('Penyimpanan',storageLabel,health.ok?'green':'yellow')}${statLine('Waktu respons',health.latencyMs!==undefined?`${number(health.latencyMs)} ms`:'Belum diperiksa',health.ok?'green':'gray')}${statLine('Versi',health.version||'23.0.0','blue')}</div><button class="btn primary" id="checkWebsiteStatusBtn" style="margin-top:14px">Periksa Sekarang</button></div>
      <div class="card"><span class="settings-kicker">Ringkasan keamanan</span><h3>Akun dan sesi</h3><div class="stat-list">${statLine('Akun aktif',number(counts.activeAccounts??state.data.users.filter(user=>user.status==='Aktif').length),'green')}${statLine('Akun terkunci',number(counts.lockedAccounts??0),(counts.lockedAccounts??0)?'red':'green')}${statLine('Perangkat login',number(counts.activeSessions??0),'blue')}${statLine('Nota menunggu',number(counts.pendingReceipts??0),(counts.pendingReceipts??0)?'yellow':'green')}</div><div class="btn-row" style="margin-top:14px"><button class="btn soft" id="refreshSharedStorageBtn">Perbarui Data</button><button class="btn green" id="downloadSharedBackupBtn">Unduh Cadangan</button></div></div>
      <div class="card span-2"><span class="settings-kicker">Database Produksi</span><h3>${health.supabaseConfigured?'Supabase sudah aktif':'Supabase belum dihubungkan'}</h3><p class="muted">Penyimpanan produksi memakai tabel server dan ruang nota privat. Kunci layanan hanya disimpan pada environment Netlify, bukan di browser.</p><div class="notice ${health.supabaseConfigured?'good':'warning'}"><b>${health.supabaseConfigured?'Data utama diarahkan ke Supabase.':'Lengkapi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Netlify.'}</b><small>${health.migration?.migratedAt?`Pemindahan terakhir: ${escapeHtml(formatDateTime(health.migration.migratedAt))}.`:'Panduan pemasangan tersedia di paket final.'}</small></div>${health.supabaseConfigured?'<button class="btn yellow" id="migrateStorageBtn" style="margin-top:14px">Pindahkan Ulang Data Netlify Lama</button>':''}</div>
      <div class="card span-2"><span class="settings-kicker">Cadangan terakhir</span><h3>${health.backup?.latest?escapeHtml(formatDateTime(health.backup.latest.createdAt)):'Belum ada catatan cadangan'}</h3><p class="muted">Cadangan otomatis dijalankan setiap hari dan juga dibuat sebelum perubahan penting.</p></div></div>`;
  }
  function advancedBackupSettings() {
    const serverRows=state.serverBackups||[];
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Cadangan otomatis</span><h3>Jadwal harian aktif</h3><p class="muted">Netlify menjalankan cadangan sekali sehari. Sistem juga membuat cadangan pengaman sebelum perubahan penting.</p><div class="stat-list">${statLine('Jadwal','Setiap hari','green')}${statLine('Simpan maksimal','45 cadangan','blue')}</div><button class="btn primary" id="createServerBackupBtn">Buat Cadangan Sekarang</button><button class="btn soft" id="loadServerBackupsBtn">Muat Daftar</button></div>
      <div class="card"><span class="settings-kicker">Pulihkan</span><h3>Gunakan file cadangan</h3><p class="muted">Pilih file cadangan yang sebelumnya dibuat dari website ini.</p><input type="file" id="adminRestoreJsonInput" accept=".json"><button class="btn yellow" id="adminRestoreJsonBtn" style="margin-top:12px">Pulihkan Data</button></div>
      <div class="card span-2"><div class="btn-row" style="justify-content:space-between"><div><h3>Daftar cadangan server</h3><small>Cadangan terbaru ditampilkan paling atas.</small></div><button class="btn green" id="adminBackupJsonBtn">Unduh Cadangan JSON</button></div>${serverRows.length?table(['Waktu','Jenis','Pembuat','Versi','Isi','Aksi'],serverRows.map(row=>[escapeHtml(formatDateTime(row.createdAt)),escapeHtml(row.kind),escapeHtml(row.createdBy),number(row.revision),`${number(row.users)} akun • ${number(row.outlets)} outlet`,`<button class="btn yellow mini" data-restore-server-backup="${escapeAttr(row.key)}">Pulihkan</button>`])):'<div class="empty">Tekan “Muat Daftar” untuk melihat cadangan server.</div>'}</div><div class="card span-2"><div class="notice warning"><b>Sebelum memulihkan data</b><small>Pastikan cadangan yang dipilih benar. Sistem tetap membuat satu cadangan pengaman sebelum pemulihan.</small></div></div></div>`;
  }
  function settingToggle(label, key, checked, description, group, locked = false) {
    return `<label class="setting-switch-row ${locked?'locked':''}"><span class="setting-switch-copy"><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span><span class="setting-switch"><input type="checkbox" data-setting-group="${group}" data-setting-key="${escapeAttr(key)}" ${checked?'checked':''} ${locked?'disabled':''}><i></i></span>${locked?'<em>Selalu aktif</em>':''}</label>`;
  }
  function settingsGeneral(reporting, control) {
    const ratioPercent = Math.round(Number(reporting.ratioCommitment ?? .28) * 100);
    return `<div class="settings-layout">
      <div class="card"><span class="settings-kicker">Angka operasional</span><h3>Target dasar laporan</h3><p class="muted">Harga per kaleng hanya dapat diubah oleh Admin.</p><div class="form two">
        ${field('Target Harian Outlet','settingTargetHarian','number','96',state.data.settings.targetHarian)}
        ${field('PCS per Karton','settingPcsKarton','number','24',state.data.settings.pcsPerKarton)}
        <div class="field span-2"><label>Harga per Kaleng</label><div class="readonly-setting">${money(state.data.settings.hargaPerPcs||4000)} • diatur Admin</div></div>
      </div></div>
      <div class="card"><span class="settings-kicker">Reporting SPG</span><h3>Target dan penanggung jawab</h3><p class="muted">Angka ini dipakai untuk Daily Report, WIP, zona, sampling, dan ekspor Excel.</p><div class="form two">
        ${field('Nama Team Leader','settingTlName','text','SOLEHUDIN',reporting.tlName||'SOLEHUDIN')}
        ${field('Nama Area Manager','settingAreaManager','text','AREA MANAGER',reporting.areaManagerName||'AREA MANAGER')}
        ${field('Periode Laporan Default','settingReportPeriod','month','2026-07',reporting.defaultPeriod||'2026-07')}
        ${field('Target Selling per HK','settingReportDailyTarget','number','120',reporting.targetDailyCan??120)}
        ${field('Target Sampling per HK','settingSamplingTarget','number','50',reporting.targetSamplingCup??50)}
        ${field('Batas Rasio Biaya (%)','settingRatioCommitment','number','28',ratioPercent)}
      </div></div>
      <div class="card span-2"><span class="settings-kicker">Format Excel</span><h3>Daily Report & WIP yang bersih</h3><div class="template-match-box"><div><b>5 sheet terpilih</b><small>Daily Report & WIP, HK, ZONA SPG, STATISTIK, dan SAMPLING. COACHING serta PICA tidak disertakan.</small></div><span class="badge green">Format v23</span></div><div class="form two" style="margin-top:14px">${field('Awalan Nama File','settingExcelPrefix','text','DAILY REPORT SPG',control.reportingExcel.filePrefix||'DAILY REPORT SPG')}${field('Nama pada File','settingExcelReporter','text','SOLEH',control.reportingExcel.reporterName||'SOLEH')}<div class="field span-2"><label>Cara Export</label><div class="readonly-setting">Membuat workbook baru dari data pada periode dan area yang dipilih</div></div></div></div>
    </div>`;
  }
  function settingsAdminMenus(control) {
    const byKey = Object.fromEntries(ADMIN_MENU_CATALOG.map(item=>[item.key,item]));
    const ordered = control.adminMenuOrder.map(key=>byKey[key]).filter(Boolean);
    return `<div class="settings-layout"><div class="card span-2"><span class="settings-kicker">Menu utama TL</span><h3>Tampilkan dan urutkan menu TL</h3><p class="muted">TL dapat mengatur menu operasional untuk mengelola SPG. Tombol naik/turun mengubah urutan di sidebar TL.</p><div class="menu-control-list">${ordered.map((item,index)=>`<div class="menu-control-row"><div class="menu-order-actions"><button class="btn mini soft" data-menu-move="up" data-menu-key="${item.key}" ${index===0?'disabled':''}>↑</button><button class="btn mini soft" data-menu-move="down" data-menu-key="${item.key}" ${index===ordered.length-1?'disabled':''}>↓</button></div>${settingToggle(`${item.icon} ${item.label}`,item.key,featureEnabled(item.key,'admin'),item.description,'admin',item.locked)}</div>`).join('')}</div></div>
      <div class="card span-2"><span class="settings-kicker">Submenu Reporting SPG</span><h3>Pilih bagian laporan yang digunakan</h3><p class="muted">Minimal satu bagian harus aktif. Daily Report dan WIP memakai template Excel yang sama.</p><div class="setting-switch-grid">${REPORTING_TAB_CATALOG.map(item=>settingToggle(item.label,item.key,control.reportingTabs[item.key]!==false,item.description,'reporting')).join('')}</div></div></div>`;
  }
  function settingsLocationStatus() {
    const rules=locationStatusSettings();
    return `<div class="settings-layout"><div class="card span-2"><span class="settings-kicker">Status lokasi SPG</span><h3>Atur nama status dan batas jarak</h3><p class="muted">Jarak selalu dihitung dari posisi terakhir SPG ke toko atau grosir penempatan pada hari itu.</p><div class="form two">
      ${field('Nama Status Sesuai','settingLocationInsideLabel','text','Sesuai Lokasi',rules.insideLabel)}
      ${field('Batas Sesuai (meter)','settingLocationInsideMeters','number','100',rules.insideMeters)}
      ${field('Nama Status Sekitar','settingLocationNearbyLabel','text','Di Sekitar Lokasi',rules.nearbyLabel)}
      ${field('Batas Sekitar (meter)','settingLocationNearbyMeters','number','500',rules.nearbyMeters)}
      ${field('Nama Status Di Luar','settingLocationOutsideLabel','text','Di Luar Lokasi',rules.outsideLabel)}
      ${field('Nama Status Tanpa GPS','settingLocationNoGpsLabel','text','Belum Ada GPS',rules.noGpsLabel)}
    </div></div><div class="card"><span class="settings-kicker">Contoh aturan</span><h3>Cara status ditentukan</h3><div class="stat-list">${statLine(rules.insideLabel,`0–${number(rules.insideMeters)} meter`,'green')}${statLine(rules.nearbyLabel,`${number(rules.insideMeters+1)}–${number(rules.nearbyMeters)} meter`,'yellow')}${statLine(rules.outsideLabel,`lebih dari ${number(rules.nearbyMeters)} meter`,'red')}${statLine(rules.noGpsLabel,'belum ada posisi terbaru','gray')}</div></div><div class="card"><span class="settings-kicker">Catatan</span><h3>Acuan tetap toko tugas</h3><p class="muted">Pengaturan ini tidak memakai alamat rumah. Perubahan langsung digunakan pada Monitoring Jalan SPG dan Tindak Lanjut.</p></div></div>`;
  }
  function settingsSpg(control) {
    const rules = control.fieldRules;
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Menu akun SPG</span><h3>Pilih menu yang terlihat oleh SPG</h3><div class="menu-control-list">${SPG_MENU_CATALOG.map(item=>settingToggle(`${item.icon} ${item.label}`,item.key,featureEnabled(item.key,'spg'),item.description,'spg',item.locked)).join('')}</div></div>
      <div class="card"><span class="settings-kicker">Aturan kerja lapangan</span><h3>Data yang wajib dan bantuan kerja</h3><div class="menu-control-list">
        ${settingToggle('GPS outlet wajib','requireOutletGps',rules.requireOutletGps,'SPG harus memilih titik lokasi sebelum menyimpan outlet.','rules')}
        ${settingToggle('Foto outlet wajib','requireOutletPhoto',rules.requireOutletPhoto,'SPG harus menambahkan foto sebagai bukti kunjungan.','rules')}
        ${settingToggle('Simpan form sementara','enableOfflineDraft',rules.enableOfflineDraft,'Isian tetap tersimpan bila halaman tertutup atau sinyal terputus.','rules')}
        ${settingToggle('Gunakan lokasi saat bekerja','enableRouteTracking',rules.enableRouteTracking,'Lokasi dipakai selama aplikasi terbuka setelah SPG memberi izin lokasi.','rules')}
        ${settingToggle('Tampilkan kemajuan target','showTargetProgress',rules.showTargetProgress,'SPG dapat melihat posisi target hariannya.','rules')}
        ${settingToggle('Tampilkan hasil outlet terbaru','showReportHistory',rules.showReportHistory,'SPG dapat melihat kembali hasil outlet yang baru disimpan.','rules')}
      </div></div></div>`;
  }
  function settingsAreas(reporting) {
    const focus=new Set(reporting.focusAreas||[]);
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Area Fokus TL</span><h3>Pilih area yang diprioritaskan</h3><p class="muted">Tanda FOKUS hanya tampil untuk TL. Nama area asli tidak berubah.</p><div class="focus-choice-grid">${areas().map(area=>`<label class="setting-switch-row"><span class="setting-switch-copy"><b>${escapeHtml(area.name)}</b><small>${focus.has(area.name)?'Sedang menjadi fokus TL':'Area biasa'}</small></span><span class="setting-switch"><input type="checkbox" data-focus-area="${escapeAttr(area.name)}" ${focus.has(area.name)?'checked':''}><i></i></span></label>`).join('')}</div></div>
      <div class="card"><span class="settings-kicker">Hak pengelolaan</span><h3>Nama area dikelola Admin</h3><p class="muted">TL dapat memilih fokus, jumlah SPG, biaya per HK, dan penanggung jawab. Penambahan atau penghapusan area dilakukan Admin.</p><div class="notice info"><b>Harga per kaleng bersifat global.</b><small>Nilainya hanya dapat diubah oleh Admin.</small></div></div>
      <div class="card span-2"><h3>Target tim per area</h3><div class="area-setting-grid">${areas().map(a=>`<div class="area-setting-card"><div class="area-setting-head"><b>${escapeHtml(a.name)}${focus.has(a.name)?' • FOKUS':''}</b><span style="background:${escapeAttr(a.color)}"></span></div><div class="form two"><div class="field"><label>Target Area</label><div class="readonly-setting">${number(a.target||0)}</div></div><div class="field"><label>Jumlah SPG</label><input type="number" data-area-setting="quota" data-area-name="${escapeAttr(a.name)}" value="${Number(reporting.quotaByArea?.[a.name]??0)}"></div><div class="field"><label>Biaya per HK</label><input type="number" data-area-setting="expense" data-area-name="${escapeAttr(a.name)}" value="${Number(reporting.expenseByArea?.[a.name]??0)}"></div><div class="field"><label>Nama SCO/MS</label><input data-area-setting="sco" data-area-name="${escapeAttr(a.name)}" value="${escapeAttr(reporting.scoByArea?.[a.name]||'')}"></div></div></div>`).join('')}</div></div></div>`;
  }
  function settingsStorage() {
    const connected=Boolean(window.ExtraJossBackend?.hasToken?.());
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Data bersama</span><h3>Status penyimpanan website</h3><p class="muted">Data operasional disimpan di server.</p><div class="stat-list">${statLine('Status',connected?'Tersambung':'Belum tersambung',connected?'green':'yellow')}${statLine('Internet',navigator.onLine?'Online':'Offline',navigator.onLine?'green':'yellow')}${statLine('Versi data',number(window.ExtraJossBackend?.getRevision?.()||state.data.revision||0),'blue')}</div><div class="btn-row" style="margin-top:14px"><button class="btn green" id="refreshSharedStorageBtn">Perbarui Data</button><button class="btn primary" id="syncSupabaseNowBtn">Kirim ke Supabase Sekarang</button><button class="btn soft" id="downloadSharedBackupBtn">Unduh Cadangan</button></div><small class="table-subline">Tombol Supabase akan memberi tahu dengan jelas bila environment Netlify belum dipasang.</small>${state.sharedSaveError?`<div class="notice warning"><b>Perubahan belum terkirim.</b><small>${escapeHtml(state.sharedSaveError)}</small></div>`:''}</div>
      <div class="card"><span class="settings-kicker">Keamanan data</span><h3>Sebelum mengganti perangkat</h3><div class="stat-list">${statLine('1. Pastikan online','Tunggu sampai perubahan terkirim','blue')}${statLine('2. Buat cadangan','Tekan Unduh Cadangan','green')}${statLine('3. Login kembali','Gunakan akun yang sama di perangkat baru','yellow')}</div>${state.data.seedMode==='demo'?'<hr><button class="btn red" id="resetDemoBtn">Reset Data Contoh Lokal</button><p class="muted">Hanya untuk paket data contoh dan selalu meminta konfirmasi.</p>':''}</div>
      <div class="card span-2"><h3>Bagian data yang ikut disimpan</h3>${databasePrepSection()}</div></div>`;
  }
  function settingsHistory() {
    const logs = state.data.settings.auditLog || [];
    const activity=(state.data.activityLog||[]).slice(0,100);
    const versions=state.data.settings.systemVersions||[];
    const changes=(state.data.changeLog||[]).slice(0,100);
    return `<div class="settings-layout"><div class="card"><span class="settings-kicker">Catatan perubahan</span><h3>Siapa mengubah pengaturan dan kapan</h3><p class="muted">Riwayat ini membantu mengingat perubahan penting.</p><div class="settings-history">${logs.length?logs.map(item=>`<div><span>⚙️</span><p><b>${escapeHtml(item.summary)}</b><small>${escapeHtml(item.actor)} • ${formatDateTime(item.at)}</small></p></div>`).join(''):'<div class="empty">Belum ada perubahan pengaturan.</div>'}</div></div>
      ${canManageAccounts()?`<div class="card"><span class="settings-kicker">Aktivitas akun</span><h3>Login, kunci akun, dan perubahan penting</h3><p class="muted">Admin dapat memeriksa aktivitas terbaru tanpa melihat password.</p><div class="settings-history">${activity.length?activity.map(item=>`<div><span>${item.type==='LOGIN_BERHASIL'?'✅':item.type==='LOGIN_GAGAL'?'⚠️':item.type==='AKUN_TERKUNCI'?'🔒':'📝'}</span><p><b>${escapeHtml(item.summary||item.type)}</b><small>${escapeHtml(item.actor||'-')} • ${formatDateTime(item.at)}</small></p></div>`).join(''):'<div class="empty">Belum ada aktivitas akun.</div>'}</div></div><div class="card span-2"><span class="settings-kicker">Sebelum dan sesudah</span><h3>Riwayat perubahan data</h3><p class="muted">Nilai rahasia dan isi foto tidak pernah ditampilkan pada riwayat.</p>${changes.length?table(['Waktu','Bagian','Aksi','Oleh','Sebelum','Sesudah'],changes.map(item=>[escapeHtml(formatDateTime(item.at)),escapeHtml(item.collection||'-'),badge(item.action||'UBAH',item.action==='HAPUS'?'red':item.action==='TAMBAH'?'green':'blue'),escapeHtml(item.actor?.name||'-'),`<code>${escapeHtml(JSON.stringify(item.before??'-').slice(0,180))}</code>`,`<code>${escapeHtml(JSON.stringify(item.after??'-').slice(0,180))}</code>`])):'<div class="empty">Belum ada perubahan data.</div>'}</div><div class="card span-2"><span class="settings-kicker">Versi sebelumnya</span><h3>Pengaturan yang bisa dikembalikan</h3><p class="muted">Pilih versi bila perubahan terbaru tidak sesuai.</p><div class="settings-history settings-version-list">${versions.length?versions.map(item=>`<div><span>↩️</span><p><b>${escapeHtml(item.label||'Versi pengaturan')}</b><small>${escapeHtml(item.actor||'Admin')} • ${formatDateTime(item.at)}</small></p><button class="btn soft mini" data-restore-settings-version="${escapeAttr(item.id)}">Gunakan Versi Ini</button></div>`).join(''):'<div class="empty">Belum ada versi sebelumnya.</div>'}</div></div>`:''}</div>`;
  }
  function previewSettingsChanges() {
    const rows=[...document.querySelectorAll('#content input, #content select, #content textarea')].filter(input=>{
      if(!input.id && !input.dataset.menuLabelKey && !input.dataset.customFeatureProp && !input.dataset.customFieldProp)return false;
      return !['file','button','submit'].includes(input.type);
    }).slice(0,60).map(input=>{
      const fieldBox=input.closest('.field,.admin-builder-row,.custom-setting-card,.setting-switch-row');
      const label=fieldBox?.querySelector('label,.setting-switch-copy b')?.textContent?.trim()||input.getAttribute('aria-label')||input.id||'Pengaturan';
      const value=input.type==='checkbox'?(input.checked?'Aktif':'Tidak aktif'):input.type==='password'?'••••••••':String(input.value||'-');
      return [label,value];
    });
    modalShell('Pratinjau Perubahan','Ini hanya pratinjau. Pengaturan belum disimpan.',rows.length?table(['Bagian','Nilai yang dipilih'],rows.map(([label,value])=>[escapeHtml(label),escapeHtml(value)])):'<div class="empty">Belum ada pilihan yang dapat dipratinjau pada bagian ini.</div>','<button class="btn ghost" data-modal-close>Tutup</button><button class="btn primary" id="saveFromPreviewBtn">Simpan Sekarang</button>',()=>{
      document.getElementById('saveFromPreviewBtn')?.addEventListener('click',()=>{closeModal();document.getElementById('saveSettingsBtn')?.click();});
    });
  }

  function spgHome() {
    const rows = ownOutlets(); const m = metrics(rows);
    return `
      ${pageHead('Beranda SPG', 'Akun kamu fokus untuk menandai outlet di maps. Semua titik outlet yang kamu buat akan terlihat oleh Admin/TL.')}
      <div class="grid cols-4">
        ${kpiCard('Outlet Kamu', number(m.outlets), state.user.area, '📍')}
        ${kpiCard('Kaleng Terjual', number(m.sold), 'dari outlet kamu', '📦')}
        ${kpiCard('Ditandai Hari Ini', number(m.todayCount), today(), '🗓️')}
        ${kpiCard('Bermasalah', number(m.issue), 'tutup/menolak', '⚠️')}
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Jalur yang pernah kamu lewati</h3><p class="muted">${todaysPathText(rows)} Garis di maps menghubungkan outlet berdasarkan urutan tanggal/jam kamu menandai.</p><button class="btn primary" data-page-jump="spgAdd">Buka Maps & Tambah Outlet</button></div>
        <div class="card"><h3>Outlet terbaru kamu</h3>${outletCards(rows.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0,3))}</div>
      </div>`;
  }

  function spgAdd() {
    const rules = fieldRules();
    return `
      ${pageHead('Tambah Outlet dari Maps', 'Pilih titik, isi hasil kunjungan, periksa checklist, lalu simpan.', '<button class="btn soft" id="toggleMapModeBtn">Mode: Detail</button><button class="btn soft" id="toggleLabelsBtn">Label Outlet: Off</button><button class="btn primary" id="saveSpgOutletBtn">Simpan Outlet</button>')}
      <div class="spg-map-layout">
        <div class="map-box big"><div id="spgMap"></div></div>
        <div class="card"><h3>Form outlet</h3><div class="form">
          <div class="btn-row"><button class="btn soft" id="locateMeBtn">📍 Gunakan Lokasi Saya</button><button class="btn ghost" id="clearPointBtn">Reset Titik</button></div>
          <div class="point-preview" id="spgPointText">Koordinat belum dipilih. Klik peta atau pilih lokasi saya.</div>
          ${field('Nama Outlet *', 'spgOutletName', 'text', 'Contoh: Toko Berkah')}
          ${selectField('Tanda Outlet *', 'spgOutletTanda', tandaOptions)}
          ${selectField('Area *', 'spgOutletArea', areas().map(a => a.name), state.user.area)}
          ${field('Terjual / Kaleng *', 'spgOutletSold', 'number', 'Contoh: 12')}
          ${field('No Telp Outlet/Konsumen (Opsional)', 'spgOutletPhone', 'text', '08xxxxxxxxxx')}
          <div id="duplicateWarningBox"></div>
          <div id="accuracyWarningBox"></div>
          <div class="field"><label>Foto Outlet ${rules.requireOutletPhoto?'*':'(Disarankan)'}</label><input id="spgOutletPhoto" type="file" accept="image/*" capture="environment" /><small class="muted">${rules.requireOutletPhoto?'Foto wajib sesuai aturan Admin/TL.':'Foto tidak wajib, tetapi membantu TL memeriksa kunjungan.'} Sistem akan memperkecil ukuran foto agar tetap ringan.</small></div>
          <div id="photoPreview" class="photo-preview empty-photo">Belum ada foto</div>
          <div class="field"><label>Catatan</label><textarea id="spgOutletNotes" placeholder="Catatan singkat jika perlu"></textarea></div>
          <button class="btn primary" id="saveSpgOutletBtn2">Simpan Outlet</button>
        </div></div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Outlet kamu yang sudah ditandai</h3>${outletTable(ownOutlets().slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0,10), false)}</div>`;
  }
  function spgOutlets() {
    let rows = filterGeneric(spgDateFilteredRows(ownOutlets()), ['name','area','tanda','phone','notes']);
    rows = rows.sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt));
    return `${pageHead('Daftar Outlet Kamu', 'Hanya outlet yang kamu tandai yang tampil di akun SPG kamu.', '<button class="btn primary" data-page-jump="spgAdd">+ Tandai Outlet</button>')}
      <div class="card filter-card"><h3>Filter cepat</h3><div class="quick-date-row">${dateOptions.map(d=>`<button class="btn ${state.spgDateFilter===d?'primary':'soft'} mini" data-spg-date="${escapeAttr(d)}">${escapeHtml(d)}</button>`).join('')}</div></div>
      <div class="grid cols-3" style="margin:18px 0">${kpiCard('Outlet pada filter', number(rows.length), state.spgDateFilter, '📍')}${kpiCard('Kaleng terjual', number(rows.reduce((s,o)=>s+Number(o.sold||0),0)), 'hasil filter', '📦')}${kpiCard('Foto lengkap', number(rows.filter(o=>o.photo).length)+'/'+number(rows.length), 'hasil filter', '📷')}</div>
      <div class="card">${outletCards(rows)}</div>`;
  }
  function spgProfile() {
    const password=knownPasswordForEmail(state.user?.email);
    const passwordBlock=password?`<div class="profile-password-card"><div><b>Password akun</b><small>Ditampilkan karena password ini masih dikenal perangkat yang sedang dipakai.</small></div>${knownPasswordHtml(state.user,false)}</div>`:`<div class="notice info"><b>Password tersimpan sebagai kode aman.</b><small>Password lama tidak dapat dibaca kembali. Jika lupa, hubungi Admin atau TL untuk membuat password baru.</small></div>`;
    return `${pageHead('Profil SPG', 'Data akun dikelola oleh TL.')}<div class="card"><div class="stat-list">${statLine('Nama', state.user.name, 'blue')}${statLine('Email', state.user.email, 'gray')}${statLine('Area', state.user.area, 'green')}${statLine('Outlet ditandai', ownOutlets().length, 'purple')}</div>${passwordBlock}</div>`;
  }

  function spgReportingProfile() {
    const userName=simpleName(state.user?.name),area=state.user?.area;
    return (state.data.reportingProfiles||[]).find(profile=>profile.userId===state.user?.id)
      ||(state.data.reportingProfiles||[]).find(profile=>profile.area===area&&simpleName(profile.spg)===userName)
      ||(state.data.reportingProfiles||[]).find(profile=>simpleName(profile.spg)===userName)
      ||null;
  }
  function spgReportingPeriods(profile) {
    const name=simpleName(profile?.spg||state.user?.name),area=profile?.area||state.user?.area;
    const periods=(state.data.reportingDaily||[]).filter(row=>row.area===area&&(profile?.id?row.profileId===profile.id:simpleName(row.spg)===name)).map(row=>String(row.date||'').slice(0,7)).filter(period=>/^\d{4}-\d{2}$/.test(period));
    const fallback=String(state.data.reportingConfig?.defaultPeriod||today().slice(0,7));
    return [...new Set([...periods,fallback])].sort().reverse();
  }
  function spgProgressBar(label,actual,target,note='') {
    const safeTarget=Math.max(0,Number(target||0)),safeActual=Math.max(0,Number(actual||0)),percent=safeTarget?Math.round(safeActual/safeTarget*1000)/10:0,width=Math.max(0,Math.min(100,percent));
    return `<div class="spg-progress-row"><div><b>${escapeHtml(label)}</b><span>${number(safeActual)} / ${number(safeTarget)}</span></div><div class="spg-progress-track"><i style="width:${width}%"></i></div><small>${number(percent)}%${note?` • ${escapeHtml(note)}`:''}</small></div>`;
  }
  function spgProgress() {
    window.ReportingSPG?.normalizeData?.(state.data);
    const profile=spgReportingProfile(),periods=spgReportingPeriods(profile);
    if(!state.spgProgressPeriod||!periods.includes(state.spgProgressPeriod))state.spgProgressPeriod=periods[0]||today().slice(0,7);
    const period=state.spgProgressPeriod,area=profile?.area||state.user?.area||'Semua',selector=profile?.id||state.user?.name||'Semua';
    const snapshot=window.ReportingSPG?.reportingSnapshot?.(reportingContext(),period,area,selector),row=snapshot?.rows?.find(item=>item.id===profile?.id||simpleName(item.spg)===simpleName(state.user?.name))||snapshot?.rows?.[0];
    const cfg=state.data.reportingConfig||{},pcsPerCarton=Math.max(1,Number(cfg.pcsPerCarton||24)),targetDaily=Math.max(1,Number(cfg.targetDailyCan||120));
    const hk=Number(row?.hk||0),targetHK=Number(row?.targetHK||profile?.targetHK||26),selling=Number(row?.selling||0),targetMonth=Number(row?.targetMonth||profile?.targetMonth||0),sampling=Number(row?.sampling||0),samplingTarget=Number(row?.samplingTarget||hk*Number(cfg.targetSamplingCup||50)),value=Number(row?.value||0),ratio=Number(row?.ratio||0),avg=Number(row?.avg||0),remainingCan=Math.max(targetMonth-selling,0),remainingCarton=remainingCan/pcsPerCarton;
    const weekly=Array.from({length:5},(_,index)=>Number(row?.weekly?.[index]?.selling||0)),weeklyMax=Math.max(1,...weekly);
    const emptyNotice=!profile?'<div class="notice warning"><b>Profil Reporting belum terhubung.</b><small>Minta TL menyamakan nama dan area pada Data SPG dengan akun ini.</small></div>':'';
    return `${pageHead('Progress Saya','Pencapaian ini berasal dari Reporting yang diisi oleh TL.')}
      <div class="card spg-progress-filter"><div><span class="badge blue">DATA REPORTING TL</span><h3>${escapeHtml(profile?.spg||state.user?.name||'SPG')}</h3><small>${escapeHtml(area)} • hanya dapat dilihat</small></div><label>Periode<select id="spgProgressPeriod">${periods.map(item=>`<option value="${escapeAttr(item)}" ${item===period?'selected':''}>${escapeHtml(new Date(`${item}-01T00:00:00`).toLocaleDateString('id-ID',{month:'long',year:'numeric'}))}</option>`).join('')}</select></label></div>
      ${emptyNotice}
      <div class="grid cols-4 spg-progress-kpis">${kpiCard('Selling',number(selling),`${number(targetMonth)} target bulanan`,'🥫')}${kpiCard('Pencapaian',targetMonth?`${number(Math.round(selling/targetMonth*1000)/10)}%`:'0%','menuju 100%','🎯')}${kpiCard('Value',money(value),'nilai penjualan','💰')}${kpiCard('Sisa ke 100%',`${number(Math.round(remainingCarton*100)/100)} karton`,`${number(remainingCan)} kaleng`,'📦')}</div>
      <div class="grid cols-2 spg-progress-layout" style="margin-top:18px"><div class="card"><h3>Kemajuan Target</h3><small>Batang penuh berarti target 100% sudah tercapai.</small><div class="spg-progress-list">${spgProgressBar('Selling',selling,targetMonth,`${number(Math.round(remainingCarton*100)/100)} karton lagi`)}${spgProgressBar('Hari Kerja (HK)',hk,targetHK,`${number(Math.max(targetHK-hk,0))} HK lagi`)}${spgProgressBar('Sampling',sampling,samplingTarget,`${number(Math.max(samplingTarget-sampling,0))} cup lagi`)}</div></div>
      <div class="card"><h3>Selling per Minggu</h3><small>W1 sampai W5 pada periode yang dipilih.</small><div class="spg-week-chart">${weekly.map((value,index)=>`<div><span>W${index+1}</span><i><b style="width:${Math.max(2,Math.round(value/weeklyMax*100))}%"></b></i><strong>${number(value)}</strong></div>`).join('')}</div></div></div>
      <div class="card spg-progress-detail" style="margin-top:18px"><h3>Rincian Pencapaian</h3><div class="table-wrap"><table><thead><tr><th>Ukuran</th><th>Hasil</th><th>Target</th><th>Pencapaian</th><th>Keterangan</th></tr></thead><tbody>
        <tr><td>Selling</td><td>${number(selling)} kaleng</td><td>${number(targetMonth)} kaleng</td><td>${targetMonth?number(Math.round(selling/targetMonth*1000)/10):0}%</td><td>${remainingCan?`${number(remainingCan)} kaleng / ${number(Math.round(remainingCarton*100)/100)} karton lagi`:'Target 100% tercapai'}</td></tr>
        <tr><td>HK</td><td>${number(hk)}</td><td>${number(targetHK)}</td><td>${targetHK?number(Math.round(hk/targetHK*1000)/10):0}%</td><td>Target per HK ${number(targetDaily)} kaleng</td></tr>
        <tr><td>Sampling</td><td>${number(sampling)} cup</td><td>${number(samplingTarget)} cup</td><td>${samplingTarget?number(Math.round(sampling/samplingTarget*1000)/10):0}%</td><td>${number(Math.max(samplingTarget-sampling,0))} cup lagi</td></tr>
        <tr><td>Rata-rata</td><td>${number(Math.round(avg*10)/10)} kaleng/HK</td><td>${number(targetDaily)} kaleng/HK</td><td>${targetDaily?number(Math.round(avg/targetDaily*1000)/10):0}%</td><td>Rata-rata selling per HK</td></tr>
        <tr><td>Ratio</td><td>${number(Math.round(ratio*1000)/10)}%</td><td>${number(Math.round(Number(cfg.ratioCommitment||0.28)*1000)/10)}%</td><td colspan="2">${escapeHtml(row?.ratioZone?.label||'Belum ada value')}</td></tr>
        <tr><td>Value</td><td>${money(value)}</td><td>${money(row?.targetValue||0)}</td><td colspan="2">Nilai penjualan yang tercatat oleh TL</td></tr>
      </tbody></table></div></div>`;
  }

  function guidePage() {
    return isAdmin() ? simpleOperationsGuide() : spgGuidePage();
  }
  function simpleOperationsGuide() {
    const role=String(state.user?.role||'').toUpperCase();
    if(role==='ADMIN') return `${pageHead('Panduan Admin','Panduan singkat pengelolaan akun, area, harga, dan pengaturan website.')}${guideTopic('🔐','Manajemen Akun','Admin khusus mengelola akun pengguna.',[['1','Buat akun','Isi nama, email, peran, password, dan cakupan area.'],['2','Edit akun','Ubah nama, email, password, peran, area, atau status akun.'],['3','Verifikasi tambahan','Aktifkan Authenticator untuk akun Admin atau TL.'],['4','Sampah','Pindahkan akun yang tidak dipakai lalu pulihkan jika diperlukan.']],true)}${guideTopic('🗺️','Area & Harga Global','Admin menambah area dan menentukan satu harga untuk seluruh area.',[['1','Buka Pengaturan → Area & Harga','Bagian ini hanya tersedia untuk Admin.'],['2','Atur Harga Default per Kaleng','Harga ini dipakai seluruh area, laporan, Excel, dan PDF.'],['3','Tambah area','Isi nama dan target area. Tidak ada harga khusus per area.'],['4','Simpan','Tekan Simpan Semua Perubahan.']])}${guideTopic('📱','Perangkat, Notifikasi, dan Cadangan','Gunakan tiga bagian ini untuk menjaga akses dan data.',[['1','Perangkat & Sesi','Lihat perangkat login, keluarkan satu perangkat, atau keluarkan semua.'],['2','Notifikasi','Kirim pemberitahuan yang akan muncul pada ikon lonceng pengguna.'],['3','Cadangan Data','Buat cadangan server, lihat daftar, atau pulihkan data.'],['4','Riwayat','Periksa nilai sebelum dan sesudah data diubah.']])}${guideTopic('⚙️','Pengaturan Tanpa Coding','Ubah tampilan dan isi website langsung dari halaman Pengaturan.',[['1','Tampilan & Teks','Ubah nama website, narasi login, bantuan, dan copyright.'],['2','Fitur & Menu','Ubah nama menu, sembunyikan menu, atau tambah halaman informasi.'],['3','Field Tambahan','Tambah kolom baru pada Outlet, Data SPG, atau Reporting.'],['4','Simpan perubahan','Tekan Simpan Semua Perubahan.'],['5','Buat cadangan','Unduh cadangan sebelum perubahan besar.']])}${supportCard()}`;
    return `${pageHead(`Panduan ${escapeHtml(roleLabel(role))}`,'Petunjuk kerja singkat dan mudah dipahami.')}
      <div class="guide-topic-grid">
      ${role==='TL'?guideTopic('📦','Cek Stock','Lihat statistik dan stok semua stokis yang pernah dipegang SPG per tanggal.',[['1','Pilih periode dan area','Sesuaikan tanggal atau bulan yang ingin diperiksa.'],['2','Baca grafik dan keterangan','Perhatikan stok awal, penjualan, PO, sisa stok, dan status validasi.'],['3','Export laporan','Gunakan Excel atau PDF untuk menyimpan hasil.']],true):''}
      ${guideTopic('📊','Dashboard Mingguan','Lihat hasil setiap SPG dari Minggu 1 sampai Minggu 5.',[['1','Pilih area','Pilih satu area yang ditugaskan.'],['2','Baca angka utama','Lihat HK, selling, achievement, nilai, dan sampling.'],['3','Periksa rincian SPG','Bandingkan W1 sampai W5 dan lihat status yang perlu perhatian.']],true)}
      ${guideTopic('🧾','Reporting SPG','Gunakan laporan, HK, zona, statistik, sampling, nota, dan export.',[['1','Pilih filter','Pilih periode, area, atau satu SPG.'],['2','Periksa statistik','Akun monitoring hanya melihat data dan tidak dapat mengubahnya.'],['3','Pilih rentang bulan','Tentukan bulan awal dan bulan akhir bila ingin mengambil beberapa bulan.'],['4','Export','Excel berisi WIP, seluruh tanggal 1–31, HK, zona, statistik, dan sampling. PDF berisi WIP, harian, HK, dan zona dengan garis tabel.']])}
      ${guideTopic('👥','Data SPG','Lihat nama SPG, area, status, dan nomor HP.',[['1','Cari data','Gunakan pencarian di bagian atas.'],['2','Export','Unduh Excel atau PDF jika diperlukan.']])}
      ${guideTopic('🏪','Data Outlet','Buka data secara bertingkat dari area, SPG, lalu outlet yang ditandai.',[['1','Buka area','Pilih area untuk melihat SPG yang sudah menandai outlet.'],['2','Buka SPG','Pilih SPG untuk melihat nama toko, kaleng, alamat, koordinat, lokasi acuan, dan jarak.'],['3','Lihat atau Maps','Tekan Detail untuk data lengkap atau Maps untuk membuka titik outlet. TL juga dapat Edit, memberi Catatan, atau Hapus data yang salah.'],['4','Export','Excel dan PDF mengikuti cakupan yang sedang dibuka: seluruh area akses, satu area, atau satu SPG.']])}
      ${role==='TL'?guideTopic('🛰️','Monitoring Jalan SPG','Lihat perjalanan SPG dan kesesuaian lokasi tugas.',[['1','Pilih tanggal dan area','Sesuaikan data yang ingin dipantau.'],['2','Periksa perjalanan','Lihat posisi terakhir, jarak, dan jumlah titik GPS.'],['3','Export','Unduh Excel atau PDF.']]):''}
      ${role==='TL'?guideTopic('🎓','Screening & Training SPG','Catat calon SPG dari kandidat baru sampai hasil join.',[['1','Tambah kandidat','Isi nama, nomor telepon, area, status, jadwal, dan catatan.'],['2','Upload CV','Pilih CV lalu simpan kandidat. CV hanya dapat dibuka setelah login TL.'],['3','Perbarui status','Bedakan interview, training, siap join, sudah join, gagal join, atau menghilang.'],['4','Export PDF','PDF merangkum seluruh kandidat dan menyediakan link aman untuk membuka CV.']]):''}
      ${role==='TL'?guideTopic('🧭','Tindak Lanjut, Penempatan, dan Status Lokasi','Periksa masalah, jadwal, serta aturan jarak dari satu tempat.',[['1','Buka Tindak Lanjut','Lihat outlet bermasalah, foto kurang, data ganda, PICA, GPS, dan posisi di luar toko tugas.'],['2','Gunakan filter','Pilih jenis catatan, area, atau SPG.'],['3','Cek Penempatan Harian','Klik tanggal pada tampilan 7 hari. Dua SPG pada satu toko diperbolehkan; bentrok hanya bila satu SPG memiliki lebih dari satu jadwal pada tanggal sama.'],['4','Atur Status Lokasi','Buka Pengaturan → Status Lokasi untuk mengubah nama status dan batas meter. Acuannya selalu toko penempatan.'],['5','Pilih Area Fokus','Buka Pengaturan TL lalu centang area yang ingin diprioritaskan. Label FOKUS hanya terlihat oleh TL.'],['6','Kirim ke Supabase','Buka Pengaturan → Penyimpanan Data lalu tekan Kirim ke Supabase Sekarang.']]):guideTopic('🔎','Ringkasan Eksekutif','Dashboard menyimpan pilihan terakhir dan menunjukkan keputusan cepat.',[['1','Pilihan tersimpan','Periode, area, SPG, dan fokus perhatian kembali otomatis saat akun dibuka lagi.'],['2','Baca kesimpulan','Lihat SPG yang perlu perhatian, rata-rata terbaik, dan minggu terkuat.'],['3','Gunakan ikon lonceng','Buka pemberitahuan terbaru tanpa menu tambahan.']])}</div>${supportCard()}`;
  }
  function supportCard(){const name=contentSetting('helpName','Solehudin - Team Leader'),phone=contentSetting('helpPhone','087805435987'),wa=String(phone).replace(/\D/g,'').replace(/^0/,'62');return `<div class="card guide-support"><h3>Ada data bermasalah atau salah?</h3><p>Hubungi <b>${escapeHtml(phone)} — ${escapeHtml(name)}</b>.</p><a class="btn green" href="https://wa.me/${escapeAttr(wa)}?text=Halo%20Pak%20Solehudin%2C%20saya%20ingin%20melaporkan%20data%20Website%20Extra%20Joss%20SPG%20yang%20bermasalah." target="_blank" rel="noopener">Hubungi melalui WhatsApp</a></div>`;}
  function locationPrivacyNotice(){
    return `<div class="notice info location-privacy-notice"><b>Lokasi wajib diaktifkan</b><small>Aktifkan lokasi saat mencatat outlet dan selama perjalanan kerja. Tekan “Izinkan” ketika perangkat meminta akses. Rincian perjalanan hanya dapat dilihat oleh TL.</small></div>`;
  }
  function adminGuidePage() {
    const activeAdmin = getMenu().filter(item=>item.key!=='logout');
    const activeTabs = REPORTING_TAB_CATALOG.filter(item=>systemControl().reportingTabs[item.key]!==false);
    return `
      ${pageHead('Panduan TL', 'Petunjuk kerja lengkap dengan bahasa sederhana. Pilih pekerjaan yang ingin dilakukan, lalu ikuti urutannya.')}
      <div class="guide-hero card"><div><span class="badge blue">Alur utama</span><h2>Siapkan tim → terima laporan → periksa hasil → tindak lanjuti → export Excel</h2><p class="muted">Panduan ini mengikuti menu yang sedang aktif. Jika sebuah menu tidak terlihat, cek Pengaturan Sistem.</p></div><div class="guide-system-chip"><b>${activeAdmin.length}</b><span>menu aktif</span></div></div>
      <div class="guide-topic-grid">
        ${guideTopic('🚀','Mulai kerja awal bulan','Siapkan target, tim, lokasi, dan format laporan sebelum aktivitas dimulai.',[
          ['1','Buka Pengaturan → Umum & Laporan','Periksa periode, target selling per HK, target sampling, harga, dan nama penanggung jawab.'],
          ['2','Buka Manajemen Akun','Buat akun SCO, MS, AM, TL, atau SPG lalu tentukan area yang boleh dipantau.'],
          ['3','Buka Pengaturan TL','Periksa target, area fokus, aturan lokasi, dan penyimpanan data. Harga dasar hanya diatur Admin.'],
          ['4','Buka Data SPG','Pastikan nama, status aktif/vacant, toko, area, joint date, dan target sudah benar.'],
          ['5','Buka Master Lokasi Penempatan','Pastikan lokasi kerja yang akan dipilih TL sudah tersedia.']
        ],true)}
        ${guideTopic('🗓️','Operasional harian','Urutan pengecekan yang disarankan setiap hari.',[
          ['1','Cek Penempatan SPG Harian','Pastikan SPG berada di toko atau grosir yang benar.'],
          ['2','Cek Reporting SPG → Reporting Harian','Periksa tanggal, kehadiran, HK, selling, value, PO tambahan, dan sampling.'],
          ['3','Cek Maps Admin dan Monitoring Jalur','Bandingkan titik outlet, jalur, dan lokasi penempatan.'],
          ['4','Cek Outlet Bermasalah','Tindak lanjuti foto kosong, GPS jauh, nama ganda, toko tutup, atau toko menolak.']
        ])}
        ${guideTopic('📊','Membaca WIP','Gunakan WIP untuk melihat siapa yang perlu didorong lebih cepat.',[
          ['1','Pilih periode dan area','Gunakan “Semua” untuk seluruh area atau pilih satu area.'],
          ['2','Lihat Achievement dan Average','Bandingkan actual dengan target. Average menunjukkan hasil rata-rata per hari kerja.'],
          ['3','Lihat Zona Target dan Zona Ratio','Merah berarti perlu perhatian, kuning perlu dipantau, hijau berada pada arah yang baik.'],
          ['4','Buka Tindak Lanjut','Periksa outlet bermasalah, foto kurang, data ganda, GPS, dan catatan yang belum selesai.']
        ])}
        ${guideTopic('📥','Export Daily Report & WIP','Kedua export memakai susunan yang sama dengan file DAILY REPORT SPG JULI 2026_SOLEH.',[
          ['1','Buka Reporting SPG','Pilih bulan dan area yang akan dikirim.'],
          ['2','Tekan Export Filter atau Export Semua Area','Export Filter mengikuti area pilihan; Export Semua Area memasukkan seluruh area.'],
          ['3','Tunggu pesan berhasil','Sistem membuat file baru berisi Daily Report & WIP, HK, Zona SPG, Statistik, dan Sampling.'],
          ['4','Buka file Excel dan periksa angka','Pastikan periode, nama SPG, HK, selling, value, dan total sudah sesuai sebelum dikirim.']
        ])}
        ${guideTopic('⚙️','Mengatur menu dan aturan','Semua kontrol utama tersedia di Pengaturan Sistem.',[
          ['1','Menu TL','Aktifkan, nonaktifkan, atau ubah urutan menu operasional TL.'],
          ['2','Manajemen Akun','Atur role, status, reset password, dan cakupan area pengguna.'],
          ['3','Submenu Reporting','Pilih bagian laporan yang digunakan tanpa menghapus datanya.'],
          ['4','Pengaturan SPG','Atur menu SPG, kewajiban GPS/foto, draft, jalur, target, dan riwayat.'],
          ['5','Riwayat','Lihat siapa yang terakhir mengubah pengaturan dan waktunya.']
        ])}
        ${guideTopic('🧯','Jika ada kendala','Langkah cepat sebelum meminta bantuan.',[
          ['Laporan kosong','Periksa bulan, area, nama SPG, dan pastikan data sudah disimpan.'],
          ['Excel tidak terunduh','Muat ulang halaman, pastikan internet aktif, lalu coba kembali dari Reporting SPG.'],
          ['Menu hilang','Buka Pengaturan → Menu TL lalu aktifkan kembali.'],
          ['Data berbeda','Bandingkan input harian, filter periode, dan WIP. Jangan ubah angka hanya agar total terlihat sama.']
        ])}
      </div>
      <div class="guide-reference-grid"><div class="card"><h3>Menu TL yang sedang aktif</h3>${table(['Menu','Gunanya'],activeAdmin.map(item=>[`${item.icon} ${item.label}`,ADMIN_MENU_CATALOG.find(entry=>entry.key===item.key)?.description||'Menu operasional.']))}</div><div class="card"><h3>Bagian Reporting yang sedang aktif</h3><div class="stat-list">${activeTabs.map(item=>statLine(item.label,item.description,'blue')).join('')}</div></div></div>
      <div class="card guide-glossary"><h3>Arti istilah laporan</h3><div class="glossary-grid">${[['HK','Jumlah hari kerja yang dihitung.'],['WIP','Posisi pencapaian selama bulan masih berjalan.'],['Actual','Hasil yang benar-benar sudah tercatat.'],['Achievement','Persentase actual dibanding target.'],['Average','Rata-rata hasil per hari kerja.'],['Ratio','Perbandingan biaya kerja dengan nilai penjualan.'],['Zona','Warna cepat untuk menentukan prioritas.'],['PICA','Daftar masalah, penyebab, tindakan, penanggung jawab, dan batas waktu.']].map(([term,text])=>`<div><b>${term}</b><p>${text}</p></div>`).join('')}</div></div>
    `;
  }
  function guideTopic(icon, title, intro, steps, open = false) {
    return `<details class="guide-topic card" ${open?'open':''}><summary><span>${icon}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(intro)}</p></div><i>⌄</i></summary><div class="guide-step-list">${steps.map(([number,label,text])=>`<div><b>${escapeHtml(number)}</b><p><strong>${escapeHtml(label)}</strong><small>${escapeHtml(text)}</small></p></div>`).join('')}</div></details>`;
  }
  function spgGuidePage() {
    const rules = fieldRules();
    const activeMenus = SPG_MENU_CATALOG.filter(item=>featureEnabled(item.key,'spg'));
    return `
      ${pageHead('Panduan SPG', 'Petunjuk harian yang singkat. Ikuti dari atas ke bawah supaya data mudah diperiksa TL.')}
      <div class="guide-hero card"><div><span class="badge green">Alur SPG</span><h2>Cek penempatan → datang ke lokasi → isi hasil → periksa kembali → simpan</h2><p class="muted">Kamu hanya melihat data milikmu. Admin/TL dapat melihat hasil seluruh tim.</p></div></div>
      <div class="guide-topic-grid">
        ${guideTopic('🌅','Sebelum mulai','Pastikan pekerjaan hari ini sudah jelas.',[['1','Cek Notifikasi Penempatan','Lihat tanggal, toko, area, alamat, lalu tekan Petunjuk Arah bila diperlukan.'],['2','Aktifkan lokasi','Lokasi wajib aktif. Tekan Izinkan agar kunjungan dan perjalanan dapat dicatat selama aplikasi aktif.'],['3','Periksa lonceng','Buka ikon lonceng untuk membaca pemberitahuan baru.']],true)}
        ${guideTopic('📍','Menandai outlet','Isi data sesuai kondisi sebenarnya.',[['1','Tekan Tambah Outlet','Pilih lokasi saya atau klik titik yang benar pada peta.'],['2','Isi nama dan tanda outlet','Gunakan nama toko yang jelas dan pilih status yang sesuai.'],['3','Isi jumlah terjual','Jika belum ada penjualan, isi 0—jangan dibiarkan kosong.'],['4','Tambahkan bukti','Foto outlet '+(rules.requireOutletPhoto?'wajib pada pengaturan saat ini.':'tidak wajib, tetapi tetap disarankan.')],['5','Periksa checklist','Pastikan bagian wajib sudah hijau lalu tekan Simpan Outlet.']])}
        ${guideTopic('🧾','Mengisi laporan','Gunakan angka dari pekerjaan yang benar-benar dilakukan.',[['1','Pilih tanggal yang benar','Jangan memasukkan hasil hari lain ke tanggal hari ini.'],['2','Isi kehadiran dan HK','Pilih Hadir, Off, Izin, Sakit, atau Alpha sesuai kondisi.'],['3','Isi selling, value, PO, dan sampling','Gunakan bukti/nota yang tersedia dan periksa kembali angkanya.'],['4','Tulis catatan bila perlu','Jelaskan kendala toko, stok, cuaca, atau tindak lanjut dengan singkat.']])}
        ${guideTopic('✅','Sebelum pulang','Pastikan pekerjaan hari ini tidak tertinggal.',[['1','Buka Daftar Outlet','Periksa outlet hari ini, foto, jumlah terjual, dan titiknya.'],['2','Periksa foto','Website mengecilkan foto otomatis supaya lebih cepat dikirim saat jaringan lemah.'],['3','Laporkan kendala ke TL','Tekan Laporkan Kendala pada Beranda. Toko, tanggal, alamat, dan petunjuk toko akan terisi pada pesan WhatsApp.']])}
        ${guideTopic('📈','Progress Saya','Lihat pencapaian yang berasal dari Reporting yang diisi TL.',[['1','Pilih bulan','Buka Progress Saya lalu pilih periode yang ingin dilihat.'],['2','Periksa target','Lihat selling, HK, sampling, value, ratio, dan hasil W1 sampai W5.'],['3','Lihat sisa 100%','Periksa berapa kaleng dan karton lagi menuju target. Angka ini hanya dapat dilihat.']])}
      </div>
      <div class="grid cols-2" style="margin-top:18px">
        <div class="card"><h3>Menu SPG yang sedang aktif</h3>${table(['Menu','Gunanya'],activeMenus.map(item=>[`${item.icon} ${item.label}`,item.description]))}</div>
        <div class="card"><h3>Butuh bantuan?</h3><p class="muted">Jika data toko, penempatan, atau hasil kerja bermasalah, gunakan tombol Laporkan Kendala pada Beranda agar pesan ke TL sudah terisi otomatis.</p><div class="notice info"><b>Solehudin — Team Leader</b><small>WhatsApp 087805435987</small></div></div>
      </div>
      ${locationPrivacyNotice()}
      <div class="card" style="margin-top:18px"><h3>Aturan yang sedang berlaku</h3><div class="stat-list">${statLine('GPS outlet',rules.requireOutletGps?'Wajib':'Tidak wajib',rules.requireOutletGps?'red':'gray')}${statLine('Foto outlet',rules.requireOutletPhoto?'Wajib':'Disarankan',rules.requireOutletPhoto?'red':'yellow')}${statLine('Simpan form sementara',rules.enableOfflineDraft?'Aktif':'Tidak aktif',rules.enableOfflineDraft?'green':'gray')}${statLine('Penggunaan lokasi',rules.enableRouteTracking?'Aktif setelah izin perangkat':'Tidak aktif',rules.enableRouteTracking?'green':'gray')}</div></div>
    `;
  }
  function guideCard(num, title, text) {
    return `<div class="card guide-card"><div class="guide-num">${escapeHtml(num)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`;
  }
  function bindGuidePage() {
    document.querySelectorAll('[data-ai-question]').forEach(b => b.addEventListener('click', () => {
      const input = document.getElementById('spgAiQuestion'); if (input) input.value = b.dataset.aiQuestion;
      showSpgAiAnswer(b.dataset.aiQuestion);
    }));
    document.getElementById('askSpgAiBtn')?.addEventListener('click', () => showSpgAiAnswer(val('spgAiQuestion')));
    document.getElementById('spgAiQuestion')?.addEventListener('keydown', e => { if (e.key === 'Enter') showSpgAiAnswer(val('spgAiQuestion')); });
  }
  function showSpgAiAnswer(q) {
    const box = document.getElementById('spgAiAnswer'); if (!box) return;
    box.innerHTML = answerSpgAi(q);
  }
  function answerSpgAi(q) {
    const text = String(q || '').toLowerCase().trim();
    if (!text) return 'Tulis pertanyaan dulu. Contoh: cara tambah outlet.';
    if (text.includes('tambah') || text.includes('outlet')) return '<b>Cara tambah outlet:</b><br>1. Buka menu Tambah Outlet.<br>2. Tekan + Tandai Outlet Sekarang atau Gunakan Lokasi Saya.<br>3. Isi nama outlet, tanda outlet, area, dan kaleng terjual.<br>4. Pastikan checklist wajib sudah hijau.<br>5. Tekan Simpan Outlet.';
    if (text.includes('maps') || text.includes('peta') || text.includes('muncul')) return '<b>Kalau maps tidak muncul:</b><br>1. Pastikan internet aktif.<br>2. Tunggu beberapa detik.<br>3. Refresh halaman.<br>4. Izinkan lokasi jika diminta browser.<br>5. Kalau masih lambat, coba pindah sinyal/WiFi.';
    if (text.includes('lokasi') || text.includes('gps')) return '<b>Soal lokasi/GPS:</b><br>Tekan Gunakan Lokasi Saya dan pilih Izinkan. Kalau titik kurang pas, kamu boleh klik langsung titik outlet di peta.';
    if (text.includes('kaleng') || text.includes('terjual') || text.includes('jual')) return '<b>Kaleng terjual:</b><br>Isi jumlah kaleng yang benar-benar terjual di outlet itu. Kalau belum ada penjualan, isi angka 0.';
    if (text.includes('foto')) return `<b>Foto outlet:</b><br>${fieldRules().requireOutletPhoto?'Foto wajib sesuai pengaturan Admin/TL.':'Foto saat ini tidak wajib, tetapi tetap disarankan.'} Ambil foto depan outlet yang jelas dan tidak buram.`;
    if (text.includes('simpan') || text.includes('checklist')) return `<b>Jika tidak bisa simpan:</b><br>Cek checklist di form. Nama outlet, tanda outlet, area, dan kaleng terjual wajib terisi.${fieldRules().requireOutletGps?' Lokasi/GPS juga wajib dipilih.':''}${fieldRules().requireOutletPhoto?' Foto outlet juga wajib diunggah.':''}`;
    return 'Saya belum menemukan jawaban khusus. Coba tanyakan dengan kata sederhana seperti: “cara tambah outlet”, “maps tidak muncul”, “GPS”, “foto outlet”, atau “kaleng terjual”.';
  }

  function bindPage() {
    bindPasswordVisibility(document.getElementById('content') || document);
    bindKnownPasswordActions(document.getElementById('content') || document);
    document.querySelectorAll('[data-page-jump]').forEach(b => b.addEventListener('click', () => goPage(b.dataset.pageJump)));
    document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('change', (e) => { state.filters[e.target.dataset.filter] = e.target.value; cleanupMaps(); renderPage(); }));
    document.getElementById('monitorAreaFilter')?.addEventListener('change',event=>{
      state.monitorAreaFilter=event.target.value;state.filters.area=event.target.value;state.routeAreaFilter=event.target.value;
      state.monitorOutletPage=1;state.outletDrillArea=event.target.value;state.outletDrillSpg='';
      try{const all=JSON.parse(localStorage.getItem(KEY_MONITOR_FILTERS)||'{}');all[state.user?.id||'monitor']={...(all[state.user?.id||'monitor']||{}),area:event.target.value};localStorage.setItem(KEY_MONITOR_FILTERS,JSON.stringify(all));}catch{}
      window.ReportingSPG?.setView?.({area:event.target.value,spg:'Semua'});cleanupMaps();renderPage();
    });
    document.querySelectorAll('[data-monitor-outlet-page]').forEach(button=>button.addEventListener('click',()=>{
      if(button.disabled)return;
      state.monitorOutletPage=Math.max(1,Number(button.dataset.monitorOutletPage)||1);
      renderPage();
      document.querySelector('.outlet-list-card')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    document.getElementById('monitorOutletPageSize')?.addEventListener('change',event=>{
      state.monitorOutletPageSize=Number(event.target.value)||10;
      state.monitorOutletPage=1;
      renderPage();
    });
    document.querySelectorAll('[data-outlet-area]').forEach(button=>button.addEventListener('click',()=>{
      state.outletDrillArea=button.dataset.outletArea||'';state.outletDrillSpg='';state.monitorOutletPage=1;renderPage();
    }));
    document.querySelectorAll('[data-outlet-spg]').forEach(button=>button.addEventListener('click',()=>{
      state.outletDrillSpg=button.dataset.outletSpg||'';state.monitorOutletPage=1;renderPage();
    }));
    document.querySelectorAll('[data-outlet-back-areas]').forEach(button=>button.addEventListener('click',()=>{
      if(isMonitorRole())return;state.outletDrillArea='';state.outletDrillSpg='';state.monitorOutletPage=1;renderPage();
    }));
    document.querySelectorAll('[data-outlet-back-spg]').forEach(button=>button.addEventListener('click',()=>{
      state.outletDrillSpg='';state.monitorOutletPage=1;renderPage();
    }));
    ['followUpCategory','followUpArea','followUpSpg'].forEach(id=>document.getElementById(id)?.addEventListener('change',event=>{state[id]=event.target.value;renderPage();}));
    if (state.page === 'spg') bindSpgForm();
    if (state.page === 'screeningTraining') bindScreeningTraining();
    if (state.page === 'accounts') bindAccountManagement();
    if (state.page === 'locationMaster') bindLocationMaster();
    if (state.page === 'dailyPlacement') bindDailyPlacement();
    if (state.page === 'map') bindAdminMap();
    if (state.page === 'routeMonitor') bindRouteMonitor();
    if ((state.page === 'stockCheck' || state.page === 'reportingSpg') && window.ReportingSPG) window.ReportingSPG.bind(reportingContext(), state.page);
    if (state.page === 'receiptRecap' && window.ReportingSPG?.bindReceiptPage) window.ReportingSPG.bindReceiptPage(reportingContext());
    if(state.page==='dashboard'&&isMonitorRole()&&window.ReportingSPG?.bindMonitorDashboard)window.ReportingSPG.bindMonitorDashboard(reportingContext(),monitorSelectedArea());
    if(state.page==='dashboard'&&canManageAccounts())bindAdminSystemDashboard();
    if (state.page === 'export') bindExport();
    if (state.page === 'setting') bindSettings();
    if (state.page === 'guide') bindGuidePage();
    bindSimpleExports();
    if (state.page === 'spgHome') bindSpgHome();
    if (state.page === 'spgProgress') document.getElementById('spgProgressPeriod')?.addEventListener('change',event=>{state.spgProgressPeriod=event.target.value;renderPage();});
    if (state.page === 'spgAdd') bindSpgAddMap();
    bindDeleteButtons();
    document.querySelectorAll('[data-view-outlet]').forEach(button=>button.addEventListener('click',()=>viewOutletDetailModal(button.dataset.viewOutlet)));
    document.querySelectorAll('[data-spg-edit-outlet]').forEach(button=>button.addEventListener('click',()=>spgCorrectionModal(button.dataset.spgEditOutlet)));
    document.querySelectorAll('[data-spg-date]').forEach(b => b.addEventListener('click', () => { state.spgDateFilter = b.dataset.spgDate; renderPage(); }));
    document.getElementById('hideBeginnerGuideBtn')?.addEventListener('click', () => { localStorage.setItem(KEY_SPG_BEGINNER + '_' + (state.user?.id || 'guest'), '1'); renderPage(); });
  }
  function simpleExportRows(kind) {
    const monitorArea=isMonitorRole()?monitorSelectedArea():'';
    if (kind==='spg') return spgList().filter(user=>!monitorArea||user.area===monitorArea).map(user=>({Nama:user.name,Area:user.area||'-',Status:user.status,Nomor_HP:user.phone||'-'}));
    if (kind==='outlet') return outletExportDataset().detail;
    if(kind==='followUp')return filteredTlFollowUpRows().map(row=>({Jenis:row.category,Tanggal:row.date,Area:row.area,SPG:row.spg,Toko_atau_Data:row.name,Keterangan:row.detail}));
    return [];
  }
  function outletExportDataset() {
    const selection=dataOutletSelection(),rows=(selection.spg?selection.detailRows:selection.area?selection.areaRows:selection.rows).slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)),scope=selection.spg?`${selection.area} - ${selection.spg}`:selection.area||'Semua Area Akses';
    const detail=rows.map((outlet,index)=>{const reference=outletReferenceInfo(outlet),hasPoint=hasCoordinatePoint(outlet);return {No:index+1,Area:outlet.area,SPG:outlet.markedBy||'-',Tanggal:formatDateTime(outlet.markedAt),Nama_Outlet:outlet.name,Tanda:outlet.tanda,Kaleng_Terjual:Number(outlet.sold||0),Estimasi_Nilai:Number(outletValue(outlet)),Alamat:outlet.address||'-',Latitude:hasPoint?Number(outlet.lat):'',Longitude:hasPoint?Number(outlet.lng):'',Akurasi_GPS_Meter:Number(outlet.accuracy||0)||'',Lokasi_Acuan:reference.location?.name||'-',Jenis_Acuan:reference.kind||'-',Jarak_Meter:reference.distance===null?'':Math.round(reference.distance),Jarak:reference.distance===null?'-':formatMeters(reference.distance),No_Telepon:outlet.phone||'-',Ada_Foto:outlet.photo?'Ya':'Tidak',Maps:hasPoint?googleDirectionUrl(outlet.lat,outlet.lng):'',Catatan_SPG:outlet.notes||'-',Catatan_TL:outlet.tlNote||'-'};});
    const areaSummary=Object.values(groupBy(rows,row=>row.area)).map(items=>({Area:items[0].area,Jumlah_SPG:new Set(items.map(item=>item.markedBy).filter(Boolean)).size,Jumlah_Outlet:items.length,Kaleng_Terjual:items.reduce((sum,item)=>sum+Number(item.sold||0),0),Estimasi_Nilai:items.reduce((sum,item)=>sum+outletValue(item),0)})).sort((a,b)=>a.Area.localeCompare(b.Area));
    const spgSummary=Object.values(groupBy(rows,row=>`${row.area}|${row.markedBy}`)).map(items=>({Area:items[0].area,SPG:items[0].markedBy||'-',Jumlah_Outlet:items.length,Kaleng_Terjual:items.reduce((sum,item)=>sum+Number(item.sold||0),0),Tanda_Terakhir:formatDateTime(items.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt))[0].markedAt)})).sort((a,b)=>a.Area.localeCompare(b.Area)||a.SPG.localeCompare(b.SPG));
    return {scope,rows,detail,areaSummary,spgSummary};
  }
  function styleOutletExcelHeader(row) {
    row.height=30;row.eachCell(cell=>{cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4E78'}};cell.alignment={vertical:'middle',horizontal:'center',wrapText:true};cell.border={top:{style:'thin',color:{argb:'FF334155'}},left:{style:'thin',color:{argb:'FF334155'}},bottom:{style:'thin',color:{argb:'FF334155'}},right:{style:'thin',color:{argb:'FF334155'}}};});
  }
  function styleOutletExcelRows(sheet,start,end,columnCount) {
    for(let rowIndex=start;rowIndex<=end;rowIndex++){const row=sheet.getRow(rowIndex);row.alignment={vertical:'top',wrapText:true};if(rowIndex%2===0)row.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF8FAFC'}};for(let column=1;column<=columnCount;column++)row.getCell(column).border={top:{style:'thin',color:{argb:'FFCBD5E1'}},left:{style:'thin',color:{argb:'FFCBD5E1'}},bottom:{style:'thin',color:{argb:'FFCBD5E1'}},right:{style:'thin',color:{argb:'FFCBD5E1'}}};}
  }
  async function buildOutletWorkbookBuffer() {
    if(!window.ExcelJS)throw new Error('Pembuat Excel belum termuat.');const data=outletExportDataset(),workbook=new ExcelJS.Workbook();workbook.creator=state.user?.name||'Website Extra Joss SPG';workbook.company='Website Extra Joss SPG';workbook.title=`Data Outlet ${data.scope}`;workbook.created=new Date();
    const summary=workbook.addWorksheet('Ringkasan',{views:[{state:'frozen',ySplit:4}]});summary.mergeCells('A1:E1');summary.getCell('A1').value='RINGKASAN DATA OUTLET';summary.getCell('A1').font={bold:true,size:16,color:{argb:'FFFFFFFF'}};summary.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0F2A4C'}};summary.getCell('A1').alignment={horizontal:'center',vertical:'middle'};summary.getRow(1).height=34;summary.mergeCells('A2:E2');summary.getCell('A2').value=`Cakupan: ${data.scope} • Dibuat ${new Date().toLocaleString('id-ID')}`;summary.getCell('A2').alignment={horizontal:'center'};
    summary.getRow(4).values=['Area','Jumlah SPG','Jumlah Outlet','Kaleng Terjual','Estimasi Nilai'];styleOutletExcelHeader(summary.getRow(4));data.areaSummary.forEach((item,index)=>{const row=summary.getRow(5+index);row.values=[item.Area,item.Jumlah_SPG,item.Jumlah_Outlet,item.Kaleng_Terjual,item.Estimasi_Nilai];row.getCell(5).numFmt='"Rp" #,##0';});styleOutletExcelRows(summary,5,4+data.areaSummary.length,5);let spgStart=7+data.areaSummary.length;summary.getRow(spgStart).values=['Area','SPG','Jumlah Outlet','Kaleng Terjual','Tanda Terakhir'];styleOutletExcelHeader(summary.getRow(spgStart));data.spgSummary.forEach((item,index)=>{summary.getRow(spgStart+1+index).values=[item.Area,item.SPG,item.Jumlah_Outlet,item.Kaleng_Terjual,item.Tanda_Terakhir];});styleOutletExcelRows(summary,spgStart+1,spgStart+data.spgSummary.length,5);summary.columns=[{width:24},{width:28},{width:17},{width:18},{width:22}];summary.pageSetup={orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.5,bottom:.5,header:.2,footer:.2}};
    const headers=['No','Area','SPG','Tanggal','Nama Outlet','Tanda','Kaleng Terjual','Estimasi Nilai','Alamat','Latitude','Longitude','Akurasi GPS (m)','Lokasi Acuan','Jenis Acuan','Jarak (m)','Jarak','No Telepon','Ada Foto','Maps','Catatan SPG','Catatan TL'],detail=workbook.addWorksheet('Detail Outlet',{views:[{state:'frozen',ySplit:4}]});detail.mergeCells('A1:U1');detail.getCell('A1').value='DETAIL OUTLET YANG DITANDAI SPG';detail.getCell('A1').font={bold:true,size:16,color:{argb:'FFFFFFFF'}};detail.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0F2A4C'}};detail.getCell('A1').alignment={horizontal:'center',vertical:'middle'};detail.getRow(1).height=34;detail.mergeCells('A2:U2');detail.getCell('A2').value=`Cakupan: ${data.scope} • Data mengikuti tampilan Data Outlet`;detail.getCell('A2').alignment={horizontal:'center'};detail.getRow(4).values=headers;styleOutletExcelHeader(detail.getRow(4));
    data.detail.forEach((item,index)=>{const row=detail.getRow(5+index);row.values=[item.No,item.Area,item.SPG,item.Tanggal,item.Nama_Outlet,item.Tanda,item.Kaleng_Terjual,item.Estimasi_Nilai,item.Alamat,item.Latitude,item.Longitude,item.Akurasi_GPS_Meter,item.Lokasi_Acuan,item.Jenis_Acuan,item.Jarak_Meter,item.Jarak,item.No_Telepon,item.Ada_Foto,item.Maps?{text:'Buka Maps',hyperlink:item.Maps}:'GPS tidak tersedia',item.Catatan_SPG,item.Catatan_TL];row.getCell(8).numFmt='"Rp" #,##0';row.getCell(10).numFmt='0.0000000';row.getCell(11).numFmt='0.0000000';if(item.Maps)row.getCell(19).font={color:{argb:'FF2563EB'},underline:true};});styleOutletExcelRows(detail,5,4+data.detail.length,headers.length);detail.autoFilter={from:'A4',to:`U${Math.max(4,4+data.detail.length)}`};detail.columns=[8,18,25,23,30,20,16,20,46,16,16,18,28,26,15,15,18,12,18,35,35].map(width=>({width}));detail.pageSetup={orientation:'landscape',paperSize:8,fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.2,right:.2,top:.5,bottom:.5,header:.2,footer:.2}};detail.pageSetup.printArea=`A1:U${Math.max(5,4+data.detail.length)}`;
    return workbook.xlsx.writeBuffer();
  }
  async function exportOutletExcel() {
    const data=outletExportDataset();if(!data.detail.length)return toast('Belum ada outlet untuk diexport.');try{toast('Menyiapkan Excel Data Outlet…');const buffer=await buildOutletWorkbookBuffer();download(`DATA OUTLET - ${data.scope}.xlsx`.replace(/[\\/:*?"<>|]/g,'-'),buffer,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');toast('Excel Data Outlet berhasil dibuat tanpa formula tersembunyi.');}catch(error){toast(`Excel belum berhasil dibuat: ${error.message}`);}
  }
  function exportOutletPdf() {
    const data=outletExportDataset();if(!data.detail.length)return toast('Belum ada outlet untuk diexport.');if(!window.jspdf?.jsPDF)return toast('Pembuat PDF belum termuat.');const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',format:'a3'}),width=doc.internal.pageSize.getWidth();doc.setFillColor(15,42,76);doc.rect(0,0,width,31,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('DATA OUTLET YANG DITANDAI SPG',14,13);doc.setFontSize(9);doc.text(`${data.scope} • ${data.detail.length} outlet • ${new Date().toLocaleString('id-ID')}`,14,22);doc.setTextColor(15,23,42);
    const body=data.detail.map(item=>[item.No,item.Area,item.Tanggal,item.SPG,item.Nama_Outlet,item.Tanda,item.Kaleng_Terjual,item.Alamat,item.Latitude!==''?`${item.Latitude}, ${item.Longitude}`:'-',item.Akurasi_GPS_Meter||'-',item.Lokasi_Acuan,item.Jarak,item.No_Telepon,item.Maps?'Buka Maps':'GPS tidak tersedia',[item.Catatan_SPG!=='-'?`SPG: ${item.Catatan_SPG}`:'',item.Catatan_TL!=='-'?`TL: ${item.Catatan_TL}`:''].filter(Boolean).join('\n')||'-']);doc.autoTable({startY:38,theme:'grid',head:[['No','Area','Tanggal','SPG','Outlet','Tanda','Kaleng','Alamat','Koordinat','GPS (m)','Lokasi Acuan','Jarak','Telepon','Maps','Catatan']],body,styles:{fontSize:6.2,cellPadding:1.55,lineWidth:.16,lineColor:[71,85,105],overflow:'linebreak',valign:'middle'},headStyles:{fillColor:[31,78,120],textColor:[255,255,255],fontStyle:'bold',lineWidth:.22,lineColor:[51,65,85]},alternateRowStyles:{fillColor:[248,250,252]},columnStyles:{0:{cellWidth:8},1:{cellWidth:23},2:{cellWidth:21},3:{cellWidth:25},4:{cellWidth:31},5:{cellWidth:20},6:{cellWidth:13},7:{cellWidth:48},8:{cellWidth:34},9:{cellWidth:13},10:{cellWidth:30},11:{cellWidth:17},12:{cellWidth:23},13:{cellWidth:19,halign:'center'},14:{cellWidth:37}},didDrawCell:cell=>{if(cell.section==='body'&&cell.column.index===13){const link=data.detail[cell.row.index]?.Maps;if(link)doc.link(cell.cell.x,cell.cell.y,cell.cell.width,cell.cell.height,{url:link});}}});const pages=doc.internal.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(`Website Extra Joss SPG • ${data.scope} • Halaman ${page}/${pages}`,14,doc.internal.pageSize.getHeight()-7);}doc.save(`DATA OUTLET - ${data.scope}.pdf`.replace(/[\\/:*?"<>|]/g,'-'));toast('PDF Data Outlet berhasil dibuat dengan tabel bergaris dan tautan Maps.');
  }
  function bindSimpleExports() {
    document.querySelectorAll('[data-simple-export]').forEach(button=>button.addEventListener('click',async()=>{
      const kind=button.dataset.exportKind, format=button.dataset.simpleExport, rows=simpleExportRows(kind);
      if(!rows.length)return toast('Belum ada data untuk diexport.');
      if(kind==='outlet'){if(format==='excel')await exportOutletExcel();else exportOutletPdf();return;}
      const title=kind==='spg'?'DATA SPG':kind==='followUp'?'TINDAK LANJUT TL':'DATA OUTLET PER AREA';
      if(format==='excel' && window.XLSX){const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=Object.keys(rows[0]).map(key=>({wch:Math.max(14,key.length+4)}));XLSX.utils.book_append_sheet(wb,ws,title.slice(0,31));XLSX.writeFile(wb,`${title}.xlsx`);return toast('Excel berhasil dibuat.');}
      if(format==='pdf' && window.jspdf?.jsPDF){const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape'}),headers=Object.keys(rows[0]),body=rows.map(row=>headers.map(key=>row[key]));doc.setFontSize(16);doc.text(title,14,16);doc.setFontSize(9);doc.text(`Dibuat ${new Date().toLocaleString('id-ID')} • Solehudin`,14,23);doc.autoTable({startY:29,theme:'grid',head:[headers.map(key=>key.replaceAll('_',' '))],body,styles:{fontSize:8,cellPadding:2.5,lineWidth:.15,lineColor:[100,116,139],overflow:'linebreak'},headStyles:{fillColor:[24,42,76],textColor:[255,255,255],lineWidth:.2,lineColor:[51,65,85]},alternateRowStyles:{fillColor:[247,249,252]}});doc.save(`${title}.pdf`);return toast('PDF berhasil dibuat.');}
      toast('Fitur export belum termuat. Muat ulang halaman lalu coba lagi.');
    }));
  }
  function bindMapControls() {
    const modeBtn = document.getElementById('toggleMapModeBtn');
    if (modeBtn) {
      modeBtn.textContent = `Mode: ${state.mapMode === 'detail' ? 'Detail' : 'Bersih'}`;
      modeBtn.addEventListener('click', () => { state.mapMode = state.mapMode === 'detail' ? 'clean' : 'detail'; cleanupMaps(); renderPage(); });
    }
    const labelBtn = document.getElementById('toggleLabelsBtn');
    if (labelBtn) {
      labelBtn.textContent = `Nama Outlet: ${state.showLabels ? 'Tampil' : 'Sembunyi'}`;
      labelBtn.addEventListener('click', () => { state.showLabels = !state.showLabels; cleanupMaps(); renderPage(); });
    }
  }
  function bindSpgForm() {
    const btn = document.getElementById('saveSpgBtn'); if (!btn) return;
    btn.addEventListener('click', () => {
      const name = val('spgName').trim(); const email = val('spgEmail').trim().toLowerCase();
      if (!name || !email) return toast('Nama SPG dan email wajib diisi.');
      if (state.data.users.some(u => u.email.toLowerCase() === email)) return toast('Email sudah dipakai.');
      const password = val('spgPassword');
      if (password.length < minimumPasswordLength()) return toast(`Password sementara minimal ${minimumPasswordLength()} karakter.`);
      const customFields=readCustomFieldValues('spg','spgCreate');if(customFields===null)return;
      const user=normalizeUser({ id: uid('u-spg'), role:'SPG', name, email, password, phone: val('spgPhone'), area: val('spgArea'), areas:[val('spgArea')], allAreas:false, status: val('spgStatus') || 'Aktif', customFields, mustChangePassword:false, createdAt:nowIso(), createdBy:state.user.name });
      state.data.users.push(user);rememberTemporaryPassword(email,password);
      save(); toast('SPG berhasil ditambahkan.'); render();setTimeout(()=>showTemporaryPasswordModal(user,password),50);
    });
  }

  function checkedAccountAreas(prefix) {
    return [...document.querySelectorAll(`[data-account-area="${prefix}"]:checked`)].map(input=>input.value).filter(Boolean);
  }
  function syncAccountAreaControls(prefix, roleId = '') {
    const all = document.getElementById(`${prefix}AllAreas`);
    const role = roleId ? val(roleId) : '';
    if (all && role === 'ADMIN') all.checked = true;
    if (all && ['SPG','SCO','MS','AM'].includes(role)) {all.checked = false;all.disabled=true;}
    else if(all)all.disabled=!userHasAllAreas();
    document.querySelectorAll(`[data-account-area="${prefix}"]`).forEach(input=>{ input.disabled = Boolean(all?.checked); });
  }
  function accountScopeFromForm(prefix, role) {
    const restrictedRole=['SPG','SCO','MS','AM'].includes(role);
    const all = role === 'ADMIN' || (!restrictedRole&&Boolean(document.getElementById(`${prefix}AllAreas`)?.checked));
    if (all && !userHasAllAreas()) {
      toast('Cakupan Semua Area hanya dapat diberikan oleh akun yang memiliki akses semua area.');
      return null;
    }
    const selected = all ? [] : checkedAccountAreas(prefix);
    if (role === 'SPG' && (all || selected.length !== 1)) {
      toast('Akun SPG harus mempunyai tepat satu area.');
      return null;
    }
    if (!all && !selected.length) {
      toast('Pilih minimal satu area atau aktifkan Semua Area.');
      return null;
    }
    return { allAreas:all, areas:selected, area:all?'All Area':selected[0] };
  }
  function createAccount() {
    const name=val('accountName').trim(),email=val('accountEmail').trim().toLowerCase(),role=val('accountRole'),password=val('accountPassword');
    if(!name||!email||!role)return toast('Nama, email, dan peran wajib diisi.');
    if(!/^\S+@\S+\.\S+$/.test(email))return toast('Format email belum benar.');
    if(state.data.users.some(user=>String(user.email||'').toLowerCase()===email))return toast('Email sudah dipakai akun lain.');
    if(password.length<minimumPasswordLength())return toast(`Password sementara minimal ${minimumPasswordLength()} karakter.`);
    const scope=accountScopeFromForm('account',role);if(!scope)return;
    const user=normalizeUser({id:uid(`u-${role.toLowerCase()}`),role,name,email,password,phone:val('accountPhone'),status:val('accountStatus')||'Aktif',...scope,mustChangePassword:false,createdAt:nowIso(),createdBy:state.user.name});
    state.data.users.push(user);rememberTemporaryPassword(email,password);
    rememberSettingChange(`Akun ${roleLabel(role)} ${name} dibuat dengan cakupan ${scope.allAreas?'Semua Area':scope.areas.join(', ')}.`);
    save();toast(`Akun ${roleLabel(role)} berhasil dibuat.`);render();setTimeout(()=>showTemporaryPasswordModal(user,password),50);
  }
  function bindAccountManagement() {
    syncAccountAreaControls('account','accountRole');
    document.getElementById('accountRole')?.addEventListener('change',()=>syncAccountAreaControls('account','accountRole'));
    document.getElementById('accountAllAreas')?.addEventListener('change',()=>syncAccountAreaControls('account','accountRole'));
    document.getElementById('saveAccountBtn')?.addEventListener('click',()=>document.getElementById('accountName')?.scrollIntoView({behavior:'smooth'}));
    document.getElementById('saveAccountBtn2')?.addEventListener('click',createAccount);
    ['Role','Area','Status'].forEach(key=>document.getElementById(`account${key}Filter`)?.addEventListener('change',event=>{state[`account${key}Filter`]=event.target.value;renderPage();}));
    bindKnownPasswordActions(document.getElementById('content')||document);
    document.querySelectorAll('[data-manage-account]').forEach(button=>button.addEventListener('click',()=>manageAccountModal(button.dataset.manageAccount)));
  }
  function randomBase32(length=32){
    const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',bytes=new Uint8Array(length);crypto.getRandomValues(bytes);
    return [...bytes].map(value=>alphabet[value%alphabet.length]).join('');
  }
  function configureAccountMfa(id){
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(user.mfaEnabled){
      if(!confirm(`Matikan verifikasi tambahan untuk ${user.name}?`))return;
      window.ExtraJossBackend?.configureMfa?.(user.id,false,'').then(result=>{applyBackendResult(result);toast('Verifikasi tambahan dimatikan.');render();}).catch(error=>toast(error.message));return;
    }
    const secret=randomBase32(),issuer=encodeURIComponent('Website Extra Joss SPG'),account=encodeURIComponent(user.email),uri=`otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
    modalShell('Aktifkan Verifikasi Tambahan',`Pasang untuk ${escapeHtml(user.name)} memakai aplikasi Authenticator.`,`<div class="form modal-form"><div class="notice info"><b>1. Buka aplikasi Authenticator</b><small>Tambahkan akun secara manual lalu pilih jenis “berdasarkan waktu”.</small></div><div class="field"><label>Kunci Rahasia</label><input id="mfaSecretPreview" readonly value="${escapeAttr(secret)}"><small>Salin tanpa spasi dan simpan di tempat aman sampai pengaturan selesai.</small></div><div class="field"><label>Alamat penyiapan (opsional)</label><textarea readonly>${escapeHtml(uri)}</textarea></div><div class="notice warning"><b>2. Setelah disimpan di Authenticator</b><small>Tekan tombol aktifkan. Login berikutnya akan meminta 6 angka.</small></div></div>`,'<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="activateMfaBtn">Aktifkan Verifikasi</button>',()=>{
      document.getElementById('activateMfaBtn')?.addEventListener('click',async()=>{try{const result=await window.ExtraJossBackend?.configureMfa?.(user.id,true,secret);applyBackendResult(result);closeModal();toast('Verifikasi tambahan aktif.');render();}catch(error){toast(error.message);}});
    });
  }
  async function trashAccount(id){
    const user=state.data.users.find(item=>item.id===id);if(!user||id===state.user?.id)return;
    if(!confirm(`Pindahkan akun ${user.name} ke Sampah? Akun langsung keluar dari semua perangkat.`))return;
    try{const result=await window.ExtraJossBackend?.trashUser?.(id);applyBackendResult(result);toast('Akun dipindahkan ke Sampah dan dapat dipulihkan.');render();}catch(error){toast(error.message||'Akun belum dapat dipindahkan.');}
  }
  function editAccountModal(id) {
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(!managerCanSeeAccount(user)|| (user.role==='ADMIN'&&state.user?.role!=='ADMIN'))return toast('Akun ini hanya dapat dikelola Administrator.');
    modalShell('Edit Akun',`Atur profil, peran, status, dan cakupan area ${escapeHtml(user.name)}.`,`<div class="form two modal-form">
      ${field('Nama Lengkap','modalAccountName','text','Nama lengkap',user.name)}
      ${field('Email Login','modalAccountEmail','email','nama@perusahaan.com',user.email)}
      <div class="field"><label>Peran</label><select id="modalAccountRole">${creatableAccountRoles().map(role=>`<option value="${role.key}" ${user.role===role.key?'selected':''}>${escapeHtml(role.label)}</option>`).join('')}</select></div>
      ${field('Nomor HP','modalAccountPhone','text','08xxxxxxxxxx',user.phone||'')}
      ${selectField('Status','modalAccountStatus',['Aktif','Nonaktif'],user.status)}
      ${passwordField('Password Baru (opsional)','modalAccountNewPassword',`Minimal ${minimumPasswordLength()} karakter`)}
      ${accountAreaFields('modalAccount',user)}
    </div>`, '<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveAccountModalBtn">Simpan Akun</button>',()=>{
      syncAccountAreaControls('modalAccount','modalAccountRole');
      bindPasswordVisibility(document.querySelector('.modal-card') || document);
      document.getElementById('modalAccountRole')?.addEventListener('change',()=>syncAccountAreaControls('modalAccount','modalAccountRole'));
      document.getElementById('modalAccountAllAreas')?.addEventListener('change',()=>syncAccountAreaControls('modalAccount','modalAccountRole'));
      document.getElementById('saveAccountModalBtn')?.addEventListener('click',()=>{
        const name=val('modalAccountName').trim(),email=val('modalAccountEmail').trim().toLowerCase(),role=val('modalAccountRole'),status=val('modalAccountStatus'),newPassword=val('modalAccountNewPassword');
        if(!name||!email)return toast('Nama dan email wajib diisi.');
        if(newPassword&&newPassword.length<minimumPasswordLength())return toast(`Password baru minimal ${minimumPasswordLength()} karakter.`);
        if(state.data.users.some(item=>item.id!==id&&String(item.email||'').toLowerCase()===email))return toast('Email sudah dipakai akun lain.');
        if(id===state.user.id&&(!MANAGEMENT_ROLES.includes(role)||status==='Nonaktif'))return toast('Akun yang sedang dipakai tidak boleh dinonaktifkan atau diubah menjadi SPG.');
        const scope=accountScopeFromForm('modalAccount',role);if(!scope)return;
        Object.assign(user,normalizeUser({...user,name,email,role,status,phone:val('modalAccountPhone'),...scope,...(newPassword?{password:newPassword,mustChangePassword:false}:{})}));
        if(id===state.user.id){state.user=normalizeUser(user);saveUser();}
        if(newPassword)rememberTemporaryPassword(email,newPassword);
        rememberSettingChange(`Akun ${name} diperbarui.`);save();closeModal();toast('Akun berhasil diperbarui.');render();
        if(newPassword)setTimeout(()=>showTemporaryPasswordModal(user,newPassword),50);
      });
    });
  }
  function resetAccountPasswordModal(id) {
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(!managerCanSeeAccount(user)|| (user.role==='ADMIN'&&state.user?.role!=='ADMIN'))return toast('Akun ini hanya dapat dikelola Administrator.');
    modalShell('Reset Password',`Buat password sementara baru untuk ${escapeHtml(user.name)}. Password lama tidak ditampilkan.`,`<div class="form modal-form">${passwordField('Password Sementara Baru','modalAccountPassword',`Minimal ${minimumPasswordLength()} karakter`)}<div class="modal-note">Berikan password sementara hanya kepada pemilik akun.</div></div>`,'<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveAccountPasswordBtn">Simpan Password</button>',()=>{
      bindPasswordVisibility(document.querySelector('.modal-card') || document);
      document.getElementById('saveAccountPasswordBtn')?.addEventListener('click',()=>{
        const password=val('modalAccountPassword');if(password.length<minimumPasswordLength())return toast(`Password minimal ${minimumPasswordLength()} karakter.`);
        user.password=password;user.mustChangePassword=false;user.failedLoginCount=0;user.blockedUntil='';rememberTemporaryPassword(user.email,password);rememberSettingChange(`Password akun ${user.name} direset.`);save();closeModal();toast('Password baru berhasil disimpan.');render();setTimeout(()=>showTemporaryPasswordModal(user,password),50);
      });
    });
  }
  function toggleAccountStatus(id) {
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(!managerCanSeeAccount(user)|| (user.role==='ADMIN'&&state.user?.role!=='ADMIN'))return toast('Akun ini hanya dapat dikelola Administrator.');
    if(id===state.user.id)return toast('Akun yang sedang dipakai tidak dapat dinonaktifkan.');
    const next=user.status==='Aktif'?'Nonaktif':'Aktif';
    if(!confirm(`${next==='Aktif'?'Aktifkan':'Nonaktifkan'} akun ${user.name}?`))return;
    user.status=next;rememberSettingChange(`Akun ${user.name} ${next.toLowerCase()}.`);save();toast(`Akun berhasil ${next==='Aktif'?'diaktifkan':'dinonaktifkan'}.`);render();
  }
  function unlockAccount(id) {
    const user=state.data.users.find(item=>item.id===id);if(!user)return;
    if(!managerCanSeeAccount(user)||(user.role==='ADMIN'&&state.user?.role!=='ADMIN'))return toast('Akun ini hanya dapat dikelola Administrator.');
    user.failedLoginCount=0;user.blockedUntil='';rememberSettingChange(`Kunci akun ${user.name} dibuka.`);save();toast('Akun dapat digunakan kembali.');render();
  }
  function bindAdminMap() {
    setTimeout(() => initAdminMap(), 80);
    bindMapControls();
    document.getElementById('fitMapBtn')?.addEventListener('click', () => fitMap(state.map, visibleOutlets()));
  }
  function bindSpgAddMap() {
    setTimeout(() => initSpgMap(), 80);
    bindMapControls();
    document.getElementById('locateMeBtn')?.addEventListener('click', useMyLocation);
    document.getElementById('clearPointBtn')?.addEventListener('click', () => { state.selectedPoint = null; state.pickMarker?.remove(); state.pickMarker = null; updatePointPreview(); });
    document.getElementById('spgOutletPhoto')?.addEventListener('change', readPhoto);
    document.getElementById('spgOutletName')?.addEventListener('input', updateDuplicatePreview);
    document.getElementById('saveSpgOutletBtn')?.addEventListener('click', saveSpgOutlet);
    document.getElementById('saveSpgOutletBtn2')?.addEventListener('click', saveSpgOutlet);
  }
  function bindExport() {
    document.getElementById('exportExcelBtn')?.addEventListener('click', exportExcel);
    document.getElementById('exportExcelBtn2')?.addEventListener('click', exportExcel);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportPdf);
    document.getElementById('exportPdfBtn2')?.addEventListener('click', exportPdf);
    document.getElementById('exportJsonBtn')?.addEventListener('click', exportJson);
    document.getElementById('restoreJsonBtn')?.addEventListener('click', restoreJson);
    document.getElementById('printReportBtn')?.addEventListener('click', printFieldReport);
    document.getElementById('importExcelBtn')?.addEventListener('click', importExcel);
    document.getElementById('exportTemplateSelect')?.addEventListener('change', (e) => { state.exportTemplate = e.target.value; renderPage(); });
    document.querySelectorAll('[data-template]').forEach(b => b.addEventListener('click', () => { state.exportTemplate = b.dataset.template; renderPage(); }));
  }
  function bindSettings() {
    document.querySelectorAll('[data-settings-tab]').forEach(button => button.addEventListener('click', () => {
      state.settingsTab = button.dataset.settingsTab || 'general';
      renderPage();
    }));
    document.querySelectorAll('[data-revoke-session]').forEach(button=>button.addEventListener('click',async()=>{
      if(!confirm('Keluarkan perangkat ini? Akun pada perangkat tersebut harus login kembali.'))return;
      try{const target=button.dataset.revokeSession,result=await window.ExtraJossBackend.revokeSession(target);if(target===window.ExtraJossBackend.getSessionId?.()){window.ExtraJossBackend.clear();state.user=null;localStorage.removeItem(KEY_USER);return renderLogin();}applyBackendResult(result);toast('Perangkat berhasil dikeluarkan.');renderPage();}catch(error){toast(error.message);}
    }));
    document.querySelectorAll('[data-logout-user-devices]').forEach(button=>button.addEventListener('click',async()=>{
      if(!confirm('Keluarkan akun ini dari semua perangkat?'))return;
      try{await window.ExtraJossBackend.logoutAll(button.dataset.logoutUserDevices);toast('Semua sesi akun berhasil dikeluarkan.');if(button.dataset.logoutUserDevices===state.user?.id){window.ExtraJossBackend.clear();state.user=null;localStorage.removeItem(KEY_USER);return renderLogin();}const result=await window.ExtraJossBackend.pull();applyBackendResult(result);renderPage();}catch(error){toast(error.message);}
    }));
    document.querySelectorAll('[data-restore-trash]').forEach(button=>button.addEventListener('click',async()=>{
      if(!confirm('Pulihkan data ini?'))return;try{const result=await window.ExtraJossBackend.restoreTrash(button.dataset.restoreTrash);applyBackendResult(result);toast('Data berhasil dipulihkan.');renderPage();}catch(error){toast(error.message);}
    }));
    document.getElementById('sendAdminNoticeBtn')?.addEventListener('click',async()=>{
      const title=val('adminNoticeTitle').trim(),message=val('adminNoticeMessage').trim(),role=val('adminNoticeRole'),area=val('adminNoticeArea');if(!title||!message)return toast('Judul dan isi notifikasi wajib diisi.');
      try{const result=await window.ExtraJossBackend.announcement({title,message,roles:role?[role]:[],area});applyBackendResult(result);toast('Notifikasi berhasil dikirim.');renderPage();}catch(error){toast(error.message);}
    });
    const loadBackups=async()=>{try{const result=await window.ExtraJossBackend.backups();state.serverBackups=result.backups||[];renderPage();}catch(error){toast(error.message);}};
    document.getElementById('loadServerBackupsBtn')?.addEventListener('click',loadBackups);
    document.getElementById('createServerBackupBtn')?.addEventListener('click',async()=>{try{const result=await window.ExtraJossBackend.createBackup();state.serverBackups=result.backups||[];toast('Cadangan server berhasil dibuat.');renderPage();}catch(error){toast(error.message);}});
    document.querySelectorAll('[data-restore-server-backup]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('Pulihkan cadangan server ini?'))return;try{const result=await window.ExtraJossBackend.restoreBackup(button.dataset.restoreServerBackup);applyBackendResult(result);toast('Cadangan server berhasil dipulihkan.');render();}catch(error){toast(error.message);}}));
    document.querySelectorAll('[data-menu-move]').forEach(button => button.addEventListener('click', () => {
      const order = systemControl().adminMenuOrder;
      const index = order.indexOf(button.dataset.menuKey);
      const nextIndex = button.dataset.menuMove === 'up' ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;
      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      rememberSettingChange(`Urutan menu ${button.dataset.menuKey} diubah.`);
      save(); render();
    }));
    document.getElementById('previewSettingsBtn')?.addEventListener('click',previewSettingsChanges);
    document.getElementById('restorePreviousSettingsBtn')?.addEventListener('click',()=>restoreSettingsVersion());
    document.querySelectorAll('[data-restore-settings-version]').forEach(button=>button.addEventListener('click',()=>restoreSettingsVersion(button.dataset.restoreSettingsVersion)));
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      saveSettingsVersion(`Sebelum pengaturan ${state.settingsTab} disimpan`);
      const control = systemControl();
      const report = state.data.reportingConfig ||= {};
      const updateText = (id, target, key, fallback = '') => { const input=document.getElementById(id); if(input) target[key]=input.value.trim()||fallback; };
      const updateNumber = (id, target, key, fallback = 0) => { const input=document.getElementById(id); if(input) target[key]=Number(input.value||fallback); };
      updateText('settingAppName',state.data.settings,'appName','Website Extra Joss SPG');
      updateNumber('settingTargetHarian',state.data.settings,'targetHarian',96);
      updateNumber('settingHarga',state.data.settings,'hargaPerPcs',4000);
      updateNumber('settingPcsKarton',state.data.settings,'pcsPerKarton',24);
      if(document.getElementById('settingPcsKarton'))report.pcsPerCarton=Math.max(1,Number(state.data.settings.pcsPerKarton||24));
      updateText('settingTlName',report,'tlName','SOLEHUDIN');
      updateText('settingAreaManager',report,'areaManagerName','AREA MANAGER');
      updateText('settingReportPeriod',report,'defaultPeriod','2026-07');
      updateNumber('settingReportDailyTarget',report,'targetDailyCan',120);
      updateNumber('settingSamplingTarget',report,'targetSamplingCup',50);
      report.defaultSellingPrice=Math.max(0,Number(state.data.settings.hargaPerPcs||4000));
      const ratioInput=document.getElementById('settingRatioCommitment'); if(ratioInput)report.ratioCommitment=Math.max(0,Number(ratioInput.value||28))/100;
      updateText('settingExcelPrefix',control.reportingExcel,'filePrefix','DAILY REPORT SPG');
      updateText('settingExcelReporter',control.reportingExcel,'reporterName','SOLEH');
      updateNumber('settingMinPasswordLength',control.security,'minPasswordLength',8);
      updateNumber('settingMaxLoginAttempts',control.security,'maxLoginAttempts',5);
      updateNumber('settingAccountLockMinutes',control.security,'accountLockMinutes',15);
      updateNumber('settingSessionMinutes',control.security,'sessionMinutes',480);
      updateNumber('settingRouteRetentionDays',control.security,'routeRetentionDays',90);
      updateText('settingLocationInsideLabel',control.locationStatus,'insideLabel','Sesuai Lokasi');
      updateText('settingLocationNearbyLabel',control.locationStatus,'nearbyLabel','Di Sekitar Lokasi');
      updateText('settingLocationOutsideLabel',control.locationStatus,'outsideLabel','Di Luar Lokasi');
      updateText('settingLocationNoGpsLabel',control.locationStatus,'noGpsLabel','Belum Ada GPS');
      updateNumber('settingLocationInsideMeters',control.locationStatus,'insideMeters',100);
      updateNumber('settingLocationNearbyMeters',control.locationStatus,'nearbyMeters',500);

      updateText('settingLoginTitle',control.contentOverrides,'loginTitle','Website Extra Joss SPG');
      updateText('settingLoginSubtitle',control.contentOverrides,'loginSubtitle','Pantau pencapaian, laporan, outlet, dan aktivitas SPG dalam satu tempat.');
      updateText('settingDashboardSubtitle',control.contentOverrides,'dashboardSubtitle','Pantau hasil SPG sesuai area dan periode.');
      updateText('settingHelpName',control.contentOverrides,'helpName','Solehudin - Team Leader');
      updateText('settingHelpPhone',control.contentOverrides,'helpPhone','087805435987');
      updateText('settingFooterText',control.contentOverrides,'footerText','© 2026 Solehudin. Seluruh hak cipta dilindungi.');
      control.contentOverrides.siteName=state.data.settings.appName;

      document.querySelectorAll('[data-menu-label-key]').forEach(input=>{
        const key=input.dataset.menuLabelKey,prop=input.dataset.menuCopy;
        control.menuLabels[key] ||= {};
        control.menuLabels[key][prop]=input.value.trim();
      });
      control.customFeatures=control.customFeatures.map(item=>{
        const card=document.querySelector(`[data-custom-feature-id="${CSS.escape(item.id)}"]`);if(!card)return item;
        const read=prop=>card.querySelector(`[data-custom-feature-prop="${prop}"]`);
        const roles=[...card.querySelectorAll('[data-custom-feature-role]:checked')].map(input=>input.dataset.customFeatureRole);
        return {...item,label:read('label')?.value.trim()||'Fitur Baru',icon:read('icon')?.value.trim()||'🧩',description:read('description')?.value.trim()||'',content:read('content')?.value.trim()||'',active:Boolean(read('active')?.checked),roles:roles.length?roles:['TL']};
      });
      control.customFields=control.customFields.map(item=>{
        const card=document.querySelector(`[data-custom-field-id="${CSS.escape(item.id)}"]`);if(!card)return item;
        const read=prop=>card.querySelector(`[data-custom-field-prop="${prop}"]`);
        return {...item,location:read('location')?.value||'outlet',label:read('label')?.value.trim()||'Field Baru',type:read('type')?.value||'text',placeholder:read('placeholder')?.value.trim()||'',options:String(read('options')?.value||'').split(',').map(value=>value.trim()).filter(Boolean),required:Boolean(read('required')?.checked),active:Boolean(read('active')?.checked)};
      });

      document.querySelectorAll('[data-setting-group]').forEach(input => {
        const group=input.dataset.settingGroup,key=input.dataset.settingKey;
        if(group==='admin')control.adminFeatures[key]=input.checked;
        if(group==='spg')control.spgFeatures[key]=input.checked;
        if(group==='reporting')control.reportingTabs[key]=input.checked;
        if(group==='rules')control.fieldRules[key]=input.checked;
        if(group==='security'&&key!=='locationNoticeRequired')control.security[key]=input.checked;
      });
      const focusInputs=[...document.querySelectorAll('[data-focus-area]')];
      if(focusInputs.length)report.focusAreas=focusInputs.filter(input=>input.checked).map(input=>input.dataset.focusArea);
      if (!Object.values(control.reportingTabs).some(Boolean)) return toast('Aktifkan minimal satu submenu Reporting SPG.');

      report.quotaByArea ||= {}; report.expenseByArea ||= {}; report.scoByArea ||= {};
      document.querySelectorAll('[data-area-setting]').forEach(input => {
        const type=input.dataset.areaSetting;
        if(type==='target'){
          const area=areas().find(item=>item.id===input.dataset.areaId); if(!area)return;
          area.target=Number(input.value||0);
        }
        if(type==='quota')report.quotaByArea[input.dataset.areaName]=Number(input.value||0);
        if(type==='expense')report.expenseByArea[input.dataset.areaName]=Number(input.value||0);
        if(type==='sco')report.scoByArea[input.dataset.areaName]=input.value.trim();
      });
      if(!control.security.allowSavedAccounts){localStorage.removeItem(KEY_SAVED_ACCOUNTS);localStorage.removeItem(KEY_REMEMBER);}
      securitySettings();
      locationStatusSettings();
      rememberSettingChange(`Pengaturan ${state.settingsTab === 'general' ? 'umum dan laporan' : state.settingsTab === 'menus' ? 'menu TL' : state.settingsTab === 'spg' ? 'akun SPG' : state.settingsTab === 'location' ? 'status lokasi SPG' : state.settingsTab === 'areas' ? 'area dan tim' : state.settingsTab === 'storage' ? 'penyimpanan' : state.settingsTab === 'security' ? 'keamanan akun' : state.settingsTab === 'access' ? 'hak akses' : state.settingsTab === 'backup' ? 'cadangan data' : 'sistem'} disimpan.`);
      save(); toast('Pengaturan berhasil disimpan dan langsung diterapkan.'); render();
    });
    document.getElementById('addCustomFeatureBtn')?.addEventListener('click',()=>{
      const label=val('newFeatureLabel').trim(),roles=[...document.querySelectorAll('[data-new-feature-role]:checked')].map(input=>input.value);
      if(!label)return toast('Nama fitur wajib diisi.');
      if(!roles.length)return toast('Pilih minimal satu pengguna untuk fitur ini.');
      saveSettingsVersion(`Sebelum fitur ${label} ditambahkan`);
      const control=systemControl();control.customFeatures.push({id:uid('feature'),label,icon:val('newFeatureIcon').trim()||'🧩',description:val('newFeatureDescription').trim(),content:val('newFeatureContent').trim(),roles,active:true});
      rememberSettingChange(`Fitur ${label} ditambahkan tanpa coding.`);save();toast('Fitur baru berhasil ditambahkan.');renderPage();
    });
    document.querySelectorAll('[data-delete-custom-feature]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.deleteCustomFeature,item=systemControl().customFeatures.find(entry=>entry.id===id);if(!item)return;
      if(!confirm(`Hapus fitur ${item.label}?`))return;
      saveSettingsVersion(`Sebelum fitur ${item.label} dihapus`);
      systemControl().customFeatures=systemControl().customFeatures.filter(entry=>entry.id!==id);rememberSettingChange(`Fitur ${item.label} dihapus.`);save();toast('Fitur berhasil dihapus.');renderPage();
    }));
    document.getElementById('addCustomFieldBtn')?.addEventListener('click',()=>{
      const label=val('newFieldLabel').trim();if(!label)return toast('Nama field wajib diisi.');
      const type=val('newFieldType')||'text',options=val('newFieldOptions').split(',').map(value=>value.trim()).filter(Boolean);
      if(type==='select'&&!options.length)return toast('Isi minimal satu pilihan untuk field jenis select.');
      saveSettingsVersion(`Sebelum field ${label} ditambahkan`);
      const control=systemControl();control.customFields.push({id:uid('field'),location:val('newFieldLocation')||'outlet',label,type,placeholder:val('newFieldPlaceholder').trim(),options,required:Boolean(document.getElementById('newFieldRequired')?.checked),active:true});
      rememberSettingChange(`Field ${label} ditambahkan tanpa coding.`);save();toast('Field baru berhasil ditambahkan.');renderPage();
    });
    document.querySelectorAll('[data-delete-custom-field]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.deleteCustomField,item=systemControl().customFields.find(entry=>entry.id===id);if(!item)return;
      if(!confirm(`Hapus field ${item.label}? Data lama pada field ini tidak akan ditampilkan.`))return;
      saveSettingsVersion(`Sebelum field ${item.label} dihapus`);
      systemControl().customFields=systemControl().customFields.filter(entry=>entry.id!==id);rememberSettingChange(`Field ${item.label} dihapus.`);save();toast('Field berhasil dihapus.');renderPage();
    }));
    document.getElementById('adminBackupJsonBtn')?.addEventListener('click',exportJson);
    document.getElementById('adminRestoreJsonBtn')?.addEventListener('click',()=>document.getElementById('adminRestoreJsonInput')?.click());
    document.getElementById('adminRestoreJsonInput')?.addEventListener('change',event=>{
      const file=event.target.files?.[0];if(!file)return;
      const reader=new FileReader();reader.onload=()=>{
        try{
          const restored=normalizeData(JSON.parse(reader.result));
          if(!confirm('Pulihkan data dari file ini? Data pada perangkat akan diganti.'))return;
          state.data=restored;save();toast('Data cadangan berhasil dipulihkan.');render();
        }catch{toast('File cadangan tidak dapat dibaca.');}
      };reader.readAsText(file);
    });
    document.getElementById('addAreaBtn')?.addEventListener('click', () => {
      const name = val('newAreaName').trim(); if (!name) return toast('Nama area wajib diisi.');
      if (areas().some(a => a.name.toLowerCase() === name.toLowerCase())) return toast('Area sudah ada.');
      state.data.areas.push({ id: uid('a'), name, city: name, target: Number(val('newAreaTarget') || 0), color: routeColors[state.data.areas.length % routeColors.length] });
      const report=state.data.reportingConfig||={}; report.quotaByArea||={}; report.expenseByArea||={}; report.scoByArea||={}; report.quotaByArea[name]=0; report.expenseByArea[name]=0; report.scoByArea[name]='';
      rememberSettingChange(`Area ${name} ditambahkan.`); save(); toast('Area berhasil ditambahkan.'); render();
    });
    document.getElementById('resetDemoBtn')?.addEventListener('click', () => {
      if (!confirm('Reset data lokal ke data demo baru? Data lokal yang belum diupload akan hilang.')) return;
      localStorage.removeItem(KEY_DATA); state.data = loadData(); save(); toast('Data demo berhasil direset.'); render();
    });
    document.getElementById('refreshSharedStorageBtn')?.addEventListener('click', async () => {
      if(!window.ExtraJossBackend?.hasToken?.())return toast('Data bersama belum tersambung. Login kembali lalu coba lagi.');
      try{const result=await window.ExtraJossBackend.pull();state.data=normalizeData(result.data||{});localStorage.setItem(KEY_DATA,JSON.stringify(state.data));toast('Data terbaru sudah tampil.');render();}
      catch(error){toast('Data belum dapat diperbarui: '+error.message);}
    });
    document.getElementById('downloadSharedBackupBtn')?.addEventListener('click',exportJson);
    document.getElementById('syncSupabaseNowBtn')?.addEventListener('click',async()=>{
      if(!window.ExtraJossBackend?.hasToken?.())return toast('Login server belum aktif. Muat ulang lalu login kembali.');
      const button=document.getElementById('syncSupabaseNowBtn');if(button){button.disabled=true;button.textContent='Mengirim…';}
      try{const result=await window.ExtraJossBackend.syncToSupabase();applyBackendResult(result);toast(`Data berhasil dikirim ke Supabase pada ${formatDateTime(result.syncedAt)}.`);renderPage();}
      catch(error){toast(error.message||'Data belum dapat dikirim ke Supabase.');if(button){button.disabled=false;button.textContent='Kirim ke Supabase Sekarang';}}
    });
    document.getElementById('checkWebsiteStatusBtn')?.addEventListener('click',async()=>{
      if(!window.ExtraJossBackend?.systemHealth)return toast('Pemeriksaan website belum tersedia.');
      try{const result=await window.ExtraJossBackend.systemHealth();state.systemHealth=result.health||null;toast(state.systemHealth?.ok?'Pemeriksaan selesai. Layanan merespons dengan baik.':'Pemeriksaan selesai dengan catatan.');renderPage();}
      catch(error){state.systemHealth={ok:false,error:error.message};toast('Status website belum dapat dipastikan: '+error.message);renderPage();}
    });
    document.getElementById('migrateStorageBtn')?.addEventListener('click',async()=>{
      if(!confirm('Pindahkan ulang data lama dari Netlify ke Supabase? Sistem membuat cadangan terlebih dahulu.'))return;
      const confirmation=prompt('Ketik PINDAHKAN untuk melanjutkan:','');if(confirmation!=='PINDAHKAN')return toast('Pemindahan dibatalkan.');
      try{const result=await window.ExtraJossBackend.migrateStorage(confirmation);applyBackendResult(result);toast(`Pemindahan selesai. ${number(result.receipts||0)} file nota ikut dipindahkan.`);state.systemHealth=null;renderPage();}
      catch(error){toast(error.message||'Data belum dapat dipindahkan.');}
    });
  }
  function bindDeleteButtons() {
    if (!canManageSystem() && !canManageAccounts()) return;
    document.querySelectorAll('[data-edit-user]').forEach(b => b.addEventListener('click', () => editUserModal(b.dataset.editUser)));
    document.querySelectorAll('[data-delete-user]').forEach(b => b.addEventListener('click', () => { if(confirm('Hapus SPG ini?')) { state.data.users = state.data.users.filter(u => u.id !== b.dataset.deleteUser); save(); render(); } }));
    document.querySelectorAll('[data-delete-outlet]').forEach(b => b.addEventListener('click', () => { if(confirm('Hapus outlet ini?')) { state.data.outlets = state.data.outlets.filter(o => o.id !== b.dataset.deleteOutlet); save(); render(); } }));
    document.querySelectorAll('[data-edit-outlet]').forEach(b => b.addEventListener('click', () => editOutletModal(b.dataset.editOutlet)));
    document.querySelectorAll('[data-note-outlet]').forEach(b => b.addEventListener('click', () => addTlNoteModal(b.dataset.noteOutlet)));
    document.querySelectorAll('[data-edit-area]').forEach(b => b.addEventListener('click', () => editAreaModal(b.dataset.editArea)));
    document.querySelectorAll('[data-delete-area]').forEach(b => b.addEventListener('click', () => { if(confirm('Hapus area ini?')) { state.data.areas = state.data.areas.filter(a => a.id !== b.dataset.deleteArea); save(); render(); } }));
  }

  function modalShell(title, subtitle, body, footer, onBind) {
    document.querySelector('.modal-backdrop')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><h2>${title}</h2><p>${subtitle || ''}</p></div>
          <button class="modal-x" data-modal-close>×</button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">${footer || '<button class="btn ghost" data-modal-close>Batal</button>'}</div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') || e.target.closest('[data-modal-close]')) closeModal();
    });
    document.addEventListener('keydown', modalEscClose);
    if (typeof onBind === 'function') onBind(overlay);
  }
  function modalEscClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() {
    document.querySelector('.modal-backdrop')?.remove();
    document.removeEventListener('keydown', modalEscClose);
  }
  function areaOptions(selected) {
    return areas().map(a => `<option value="${escapeAttr(a.name)}" ${a.name === selected ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('');
  }
  function editAreaModal(id) {
    const a = state.data.areas.find(x => x.id === id);
    if (!a) return;
    const oldName = a.name;
    modalShell(
      'Edit Area',
      'Ubah nama, kota, atau target area. Harga per kaleng tetap mengikuti angka global yang diatur Admin.',
      `<div class="form two modal-form">
        ${field('Nama Area', 'modalAreaName', 'text', 'Contoh: Banjarmasin', a.name)}
        ${field('Kota', 'modalAreaCity', 'text', 'Contoh: Banjarmasin', a.city || a.name)}
        ${field('Target Area', 'modalAreaTarget', 'number', '2400', a.target || 0)}
        <div class="field"><label>Harga per Kaleng</label><div class="readonly-setting">${money(state.data.settings.hargaPerPcs||4000)} • harga global</div></div>
        <div class="modal-note" style="grid-column:1/-1">Jika nama area diganti, data SPG dan outlet yang memakai area lama ikut menyesuaikan.</div>
      </div>`,
      '<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveAreaModalBtn">Simpan Perubahan</button>',
      () => {
        document.getElementById('saveAreaModalBtn')?.addEventListener('click', () => {
          const cleanName = val('modalAreaName').trim() || a.name;
          if (cleanName.toLowerCase() !== oldName.toLowerCase() && areas().some(x => x.id !== id && x.name.toLowerCase() === cleanName.toLowerCase())) return toast('Nama area sudah dipakai.');
          a.name = cleanName;
          a.city = val('modalAreaCity').trim() || cleanName;
          a.target = Number(val('modalAreaTarget') || 0);
          state.data.users.forEach(u => { if (u.area === oldName) u.area = cleanName; });
          state.data.outlets.forEach(o => { if (o.area === oldName) o.area = cleanName; });
          save(); closeModal(); toast('Area berhasil diedit.'); render();
        });
      }
    );
  }
  function editUserModal(id) {
    const u = state.data.users.find(x => x.id === id);
    if (!u) return;
    const oldName = u.name;
    modalShell(
      'Edit Akun SPG',
      'Ubah nama, email, area, nomor HP, status, atau password SPG dari satu form.',
      `<div class="form two modal-form">
        ${field('Nama SPG', 'modalUserName', 'text', 'Nama SPG', u.name)}
        ${field('Email Login', 'modalUserEmail', 'email', 'email@demo.local', u.email)}
        ${passwordField('Password Baru (opsional)', 'modalUserPassword', `Minimal ${minimumPasswordLength()} karakter`)}
        <div class="field"><label>Area</label><select id="modalUserArea">${areaOptions(u.area)}</select></div>
        ${field('Nomor HP', 'modalUserPhone', 'text', '08xxxxxxxxxx', u.phone || '')}
        <div class="field"><label>Status</label><select id="modalUserStatus"><option ${u.status === 'Aktif' ? 'selected' : ''}>Aktif</option><option ${u.status !== 'Aktif' ? 'selected' : ''}>Nonaktif</option></select></div>
        ${renderCustomFieldInputs('spg',u.customFields||{},'spgEdit')}
      </div>`,
      '<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveUserModalBtn">Simpan SPG</button>',
      () => {
        bindPasswordVisibility(document.querySelector('.modal-card') || document);
        document.getElementById('saveUserModalBtn')?.addEventListener('click', () => {
          const name = val('modalUserName').trim();
          const email = val('modalUserEmail').trim().toLowerCase();
          const newPassword = val('modalUserPassword');
          if (!name || !email) return toast('Nama dan email SPG wajib diisi.');
          if (newPassword && newPassword.length < minimumPasswordLength()) return toast(`Password baru minimal ${minimumPasswordLength()} karakter.`);
          if (state.data.users.some(x => x.id !== id && x.email?.toLowerCase() === email)) return toast('Email sudah dipakai.');
          const customFields=readCustomFieldValues('spg','spgEdit');if(customFields===null)return;
          Object.assign(u, { name, email, ...(newPassword?{password:newPassword,mustChangePassword:false}:{}), area: val('modalUserArea'), areas:[val('modalUserArea')], allAreas:false, phone: val('modalUserPhone'), status: val('modalUserStatus'), customFields });
          state.data.outlets.forEach(o => { if (o.markedById === id || o.markedBy === oldName) { o.markedBy = name; o.markedById = id; } });
          save(); closeModal(); toast('Data SPG berhasil diedit.'); render();
        });
      }
    );
  }
  function viewOutletDetailModal(id) {
    const o=outlets().find(item=>item.id===id);if(!o||!canAccessArea(o.area))return;
    const reference=outletReferenceInfo(o),hasPoint=hasCoordinatePoint(o),coordinates=hasPoint?`${Number(o.lat).toFixed(7)}, ${Number(o.lng).toFixed(7)}`:'Belum tersedia';
    modalShell(
      'Detail Outlet',
      `${escapeHtml(o.area)} • ditandai ${escapeHtml(o.markedBy||'SPG')}`,
      `<div class="outlet-detail-modal">${o.photo?`<div class="outlet-detail-photo"><img src="${o.photo}" alt="Foto ${escapeAttr(o.name)}"></div>`:'<div class="outlet-detail-photo empty"><span>🏪</span><small>Foto belum tersedia</small></div>'}<div class="outlet-detail-info"><h3>${escapeHtml(o.name)}</h3><div class="stat-list">${statLine('Tanggal',formatDateTime(o.markedAt),'blue')}${statLine('Tanda',o.tanda,tandaColor(o.tanda))}${statLine('Kaleng terjual',`${number(o.sold)} kaleng`,'green')}${statLine('Estimasi nilai',money(outletValue(o)),'yellow')}${statLine('Alamat',o.address||'Belum diisi','blue')}${statLine('Koordinat',coordinates,'purple')}${statLine('Akurasi GPS',o.accuracy?`±${number(Math.round(o.accuracy))} m`:'Belum tersedia',o.accuracy&&o.accuracy<=100?'green':'gray')}${statLine('Lokasi acuan',reference.location?.name||'Belum tersedia','blue')}${statLine('Jarak dari acuan',reference.distance===null?'-':formatMeters(reference.distance),reference.distance!==null&&reference.distance<=100?'green':'yellow')}${o.phone?statLine('Nomor telepon',o.phone,'purple'):''}${o.notes?statLine('Catatan SPG',o.notes,'gray'):''}${o.tlNote?statLine('Catatan TL',o.tlNote,'blue'):''}${o.duplicateWarning?statLine('Potensi ganda',o.duplicateWarning,'red'):''}</div>${customFieldSummary('outlet',o.customFields)}</div></div>`,
      `${hasPoint?`<a class="btn primary" target="_blank" rel="noopener" href="${googleDirectionUrl(o.lat,o.lng)}">Buka Maps</a>`:''}<button class="btn ghost" data-modal-close>Tutup</button>`
    );
  }
  function addTlNoteModal(id) {
    const o = state.data.outlets.find(x => x.id === id);
    if (!o) return;
    modalShell(
      'Catatan TL',
      `Outlet: ${escapeHtml(o.name)} — ${escapeHtml(o.area)}`,
      `<div class="form modal-form"><div class="field"><label>Catatan TL</label><textarea id="modalTlNote" placeholder="Contoh: outlet potensial, cek ulang sore hari">${escapeHtml(o.tlNote || '')}</textarea></div></div>`,
      '<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveNoteModalBtn">Simpan Catatan</button>',
      () => document.getElementById('saveNoteModalBtn')?.addEventListener('click', () => {
        o.tlNote = val('modalTlNote').trim();
        save(); closeModal(); toast('Catatan TL berhasil disimpan.'); renderPage();
      })
    );
  }
  function editOutletModal(id) {
    const o = state.data.outlets.find(x => x.id === id);
    if (!o) return;
    modalShell(
      'Edit Outlet',
      'Ubah data outlet tanpa prompt bawaan browser. Estimasi nilai akan mengikuti harga area.',
      `<div class="form two modal-form">
        ${field('Nama Outlet', 'modalOutletName', 'text', 'Nama outlet', o.name)}
        <div class="field"><label>Area</label><select id="modalOutletArea">${areaOptions(o.area)}</select></div>
        <div class="field"><label>Tanda Outlet</label><select id="modalOutletTanda">${tandaOptions.map(t => `<option value="${escapeAttr(t)}" ${t === o.tanda ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}</select></div>
        ${field('Terjual / Kaleng', 'modalOutletSold', 'number', '0', o.sold || 0)}
        ${field('No Telp Outlet/Konsumen', 'modalOutletPhone', 'text', '08xxxxxxxxxx', o.phone || '')}
        ${field('Latitude', 'modalOutletLat', 'number', '-3.3194', o.lat)}
        ${field('Longitude', 'modalOutletLng', 'number', '114.5908', o.lng)}
        ${renderCustomFieldInputs('outlet',o.customFields||{},'outletEdit')}
        <div class="field"><label>Catatan</label><textarea id="modalOutletNotes" placeholder="Catatan outlet">${escapeHtml(o.notes || '')}</textarea></div>
      </div>`,
      '<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveOutletModalBtn">Simpan Outlet</button>',
      () => {
        document.getElementById('saveOutletModalBtn')?.addEventListener('click', () => {
          const name = val('modalOutletName').trim();
          if (!name) return toast('Nama outlet wajib diisi.');
          const customFields=readCustomFieldValues('outlet','outletEdit');if(customFields===null)return;
          Object.assign(o, normalizeOutlet({
            ...o,
            name,
            area: val('modalOutletArea') || o.area,
            tanda: val('modalOutletTanda') || o.tanda,
            sold: Number(val('modalOutletSold') || 0),
            phone: val('modalOutletPhone').trim(),
            lat: Number(val('modalOutletLat') || o.lat),
            lng: Number(val('modalOutletLng') || o.lng),
            notes: val('modalOutletNotes').trim(),
            customFields
          }));
          const near = findNearbyDuplicates(o).filter(x => x.outlet.id !== o.id);
          o.duplicateWarning = near.length ? `Dekat dengan ${near[0].outlet.name} (${Math.round(near[0].distance)} m)` : '';
          save(); closeModal(); toast('Outlet berhasil diedit.'); renderPage();
        });
      }
    );
  }
  function saveSpgOutlet() {
    const name = val('spgOutletName').trim();
    const tanda = val('spgOutletTanda');
    const area = val('spgOutletArea');
    const soldRaw = val('spgOutletSold');
    if (!state.selectedPoint) return toast('Koordinat wajib dipilih. Klik peta atau pilih lokasi saya.');
    if (!name) return toast('Nama outlet wajib diisi.');
    if (!tanda) return toast('Tanda outlet wajib dipilih.');
    if (!area) return toast('Area wajib dipilih.');
    if (soldRaw === '' || Number(soldRaw) < 0) return toast('Terjual/Kaleng wajib diisi minimal 0.');
    if (!state.selectedPhoto) return toast('Foto outlet wajib diupload. Ambil foto outlet terlebih dahulu.');
    const draft = { id:'draft', name, lat: state.selectedPoint.lat, lng: state.selectedPoint.lng };
    const near = findNearbyDuplicates(draft, outlets());
    const outlet = normalizeOutlet({
      id: uid('o'), name, area, tanda, sold: Number(soldRaw), phone: val('spgOutletPhone').trim(),
      lat: state.selectedPoint.lat, lng: state.selectedPoint.lng, photo: state.selectedPhoto || '',
      markedBy: state.user.name, markedById: state.user.id, markedAt: nowIso(), notes: val('spgOutletNotes').trim(), accuracy: state.selectedPoint.accuracy || 0, duplicateWarning: near.length ? near.map(x => `${x.outlet.name} (${Math.round(x.distance)} m)`).join('; ') : ''
    });
    state.data.outlets.push(outlet); save(); toast('Outlet berhasil ditandai dan disimpan.'); state.selectedPhoto = ''; state.selectedPoint = null; render();
  }

  function filterBox() {
    return `<div class="card filter-card"><div class="form six">
      ${selectField('Filter Area', 'filterArea', ['Semua', ...areas().map(a=>a.name)], state.filters.area, 'area')}
      ${selectField('Filter SPG', 'filterSpg', ['Semua', ...spgList().map(s=>s.name)], state.filters.spg, 'spg')}
      ${selectField('Filter Tanda Outlet', 'filterTanda', ['Semua', ...tandaOptions], state.filters.tanda, 'tanda')}
      ${selectField('Filter Tanggal', 'filterDate', dateOptions, state.filters.date, 'date')}
      ${selectField('Filter Cepat', 'filterQuick', quickFilterOptions, state.filters.quick, 'quick')}
    </div><small class="muted smart-help">Tips pencarian pintar: ketik <b>area:banjarmasin</b>, <b>spg:seri</b>, <b>terjual&gt;10</b>, <b>double</b>, <b>gps</b>, <b>foto:no</b>, atau <b>telp:no</b>.</small></div>`;
  }
  function field(label, id, type='text', placeholder='', value='') { return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" placeholder="${escapeAttr(placeholder)}" value="${escapeAttr(value)}" /></div>`; }
  function passwordField(label,id,placeholder='',value='') {
    const autocomplete=id==='loginPassword'?'current-password':'new-password';
    return `<div class="field"><label>${escapeHtml(label)}</label><div class="password-control"><input id="${escapeAttr(id)}" type="password" placeholder="${escapeAttr(placeholder)}" value="${escapeAttr(value)}" autocomplete="${autocomplete}"><button type="button" class="password-toggle" data-toggle-password="${escapeAttr(id)}" aria-label="Tampilkan password" title="Tampilkan password">👁️</button></div></div>`;
  }
  function bindPasswordVisibility(scope=document) {
    scope.querySelectorAll?.('[data-toggle-password]').forEach(button=>button.addEventListener('click',()=>{
      const input=document.getElementById(button.dataset.togglePassword);if(!input)return;
      const showing=input.type==='text';input.type=showing?'password':'text';
      button.textContent=showing?'👁️':'🙈';button.setAttribute('aria-label',showing?'Tampilkan password':'Sembunyikan password');button.title=button.getAttribute('aria-label');
    }));
  }
  function selectField(label, id, options, selected='', filterKey='') { return `<div class="field"><label>${label}</label><select id="${id}" ${filterKey ? `data-filter="${filterKey}"` : ''}>${options.map(o => `<option value="${escapeAttr(o)}" ${String(o)===String(selected)?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></div>`; }
  function customFieldInputId(location,id,prefix='custom') { return `${prefix}-${location}-${String(id).replace(/[^a-zA-Z0-9_-]/g,'')}`; }
  function renderCustomFieldInputs(location,values={},prefix='custom') {
    const fields=customFieldsFor(location);
    if(!fields.length)return '';
    return fields.map(item=>{
      const id=customFieldInputId(location,item.id,prefix),value=values?.[item.id]??'',label=`${escapeHtml(item.label)}${item.required?' *':''}`;
      if(item.type==='textarea')return `<div class="field span-2 custom-runtime-field"><label>${label}</label><textarea id="${id}" placeholder="${escapeAttr(item.placeholder)}">${escapeHtml(value)}</textarea></div>`;
      if(item.type==='select')return `<div class="field custom-runtime-field"><label>${label}</label><select id="${id}"><option value="">Pilih</option>${item.options.map(option=>`<option value="${escapeAttr(option)}" ${String(option)===String(value)?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></div>`;
      return `<div class="field custom-runtime-field"><label>${label}</label><input id="${id}" type="${item.type}" placeholder="${escapeAttr(item.placeholder)}" value="${escapeAttr(value)}"></div>`;
    }).join('');
  }
  function readCustomFieldValues(location,prefix='custom') {
    const result={};
    for(const item of customFieldsFor(location)){
      const input=document.getElementById(customFieldInputId(location,item.id,prefix));
      const value=String(input?.value??'').trim();
      if(item.required&&!value){toast(`${item.label} wajib diisi.`);return null;}
      result[item.id]=item.type==='number'&&value!==''?Number(value):value;
    }
    return result;
  }
  function customFieldSummary(location,values={}) {
    const rows=customFieldsFor(location).map(item=>({label:item.label,value:values?.[item.id]})).filter(item=>item.value!==''&&item.value!==undefined&&item.value!==null);
    return rows.length?`<div class="custom-field-summary">${rows.map(item=>`<span><b>${escapeHtml(item.label)}:</b> ${escapeHtml(item.value)}</span>`).join('')}</div>`:'';
  }
  function badge(text, color='blue') { return `<span class="badge ${color}">${escapeHtml(text)}</span>`; }
  function tandaColor(t) {
    return t === 'Sudah dikunjungi' ? 'green' : t === 'Potensial' ? 'yellow' : ['Tutup','Menolak'].includes(t) ? 'red' : t === 'Outlet baru' ? 'blue' : 'purple';
  }
  function statLine(label, value, color='blue') { return `<div class="stat-line"><span>${escapeHtml(label)}</span><b class="badge ${color}">${escapeHtml(value)}</b></div>`; }
  function legend(label, color) { return `<div class="stat-line"><span><span class="badge ${color}">${escapeHtml(label)}</span></span><b>${escapeHtml(label)}</b></div>`; }
  function aiItem(tag, text, color='blue') { return `<div class="ai-item"><div class="top"><span class="badge ${color}">${escapeHtml(tag)}</span><small>Otomatis</small></div><p>${escapeHtml(text)}</p></div>`; }
  function table(headers, rows) { if (!rows.length) return '<div class="empty">Belum ada data.</div>'; return `<div class="table-wrap"><table class="responsive-data-table"><thead><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,index)=>`<td data-label="${escapeAttr(headers[index]||'Data')}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
  function duplicateTable(rows) {
    const dups = duplicateCandidates(rows);
    if (!dups.length) return '<div class="empty">Belum ada potensi outlet double pada filter ini.</div>';
    return table(['Outlet 1','Outlet 2','Jarak','Area','SPG','Aksi'], dups.map(d => [
      escapeHtml(d.outlet.name),
      escapeHtml(d.near.name),
      `${Math.round(d.distance)} m`,
      escapeHtml(d.outlet.area),
      `${escapeHtml(d.outlet.markedBy)} / ${escapeHtml(d.near.markedBy)}`,
      `<button class="btn soft mini" data-note-outlet="${d.outlet.id}">Catatan TL</button>`
    ]));
  }

  function outletTable(rows, showAdmin = true) {
    showAdmin = showAdmin && canManageSystem();
    if (!rows.length) return '<div class="empty">Belum ada outlet.</div>';
    const headers = showAdmin ? ['Foto','Outlet','Area','Tanda','Terjual','SPG','Ditandai','Akurasi','No Telp','Maps','Aksi'] : ['Foto','Outlet','Area','Tanda','Terjual','Ditandai','Akurasi','No Telp','Maps'];
    const body = rows.map(o => {
      const adminActions = `<div class="btn-row compact-actions"><button class="btn soft mini" data-note-outlet="${o.id}">Catatan TL</button><button class="btn soft mini" data-edit-outlet="${o.id}">Edit</button><button class="btn red mini" data-delete-outlet="${o.id}">Hapus</button></div>`;
      const base = [
        photoThumb(o.photo),
        `${escapeHtml(o.name)}${customFieldSummary('outlet',o.customFields)?`<br><small class="custom-field-summary">${escapeHtml(customFieldSummary('outlet',o.customFields))}</small>`:''}${o.duplicateWarning ? `<br><small class="text-red">⚠️ ${escapeHtml(o.duplicateWarning)}</small>` : ''}${o.tlNote ? `<br><small class="text-blue">📝 TL: ${escapeHtml(o.tlNote)}</small>` : ''}`,
        escapeHtml(o.area),
        `<div class="tanda-stack">${badge(o.tanda, tandaColor(o.tanda))}${badge(potentialLevel(o).label, potentialLevel(o).color)}</div>`,
        `${number(o.sold)}<br><small>${money(outletValue(o))}</small>`,
        ...(showAdmin ? [escapeHtml(o.markedBy)] : []),
        formatDateTime(o.markedAt),
        o.accuracy ? `±${Math.round(o.accuracy)} m` : '-',
        escapeHtml(o.phone || '-'),
        `<a class="btn soft mini" target="_blank" href="${googleDirectionUrl(o.lat,o.lng)}">Buka Arah</a>`
      ];
      if (showAdmin) base.push(adminActions);
      return base;
    });
    return table(headers, body);
  }

  function outletCards(rows) {
    if (!rows.length) return '<div class="empty">Belum ada outlet untuk ditampilkan.</div>';
    return `<div class="grid cols-3">${rows.map(o => {
      const correction=canSpgCorrectOutlet(o)?`<button class="btn yellow" data-spg-edit-outlet="${escapeAttr(o.id)}">Perbaiki • ${number(correctionMinutesLeft(o))} menit</button>`:'';
      return `<div class="card outlet-card"><div class="outlet-photo">${o.photo ? `<img src="${o.photo}" alt="Foto ${escapeAttr(o.name)}" />` : '<span>🏪</span>'}</div><div class="btn-row" style="justify-content:space-between"><h3>${escapeHtml(o.name)}</h3>${badge(o.tanda, tandaColor(o.tanda))}</div>${customFieldSummary('outlet',o.customFields)?`<p class="custom-field-summary">${escapeHtml(customFieldSummary('outlet',o.customFields))}</p>`:''}<div class="stat-list">${statLine('Area', o.area, 'blue')}${statLine('Terjual', number(o.sold) + ' kaleng', 'green')}${statLine('Nilai', money(outletValue(o)), 'yellow')}${statLine('Ditandai', formatDateTime(o.markedAt), 'gray')}${o.correctedAt?statLine('Terakhir diperbaiki',formatDateTime(o.correctedAt),'blue'):''}${o.accuracy ? statLine('Akurasi GPS', '±' + Math.round(o.accuracy) + ' m', o.accuracy > 100 ? 'red' : 'green') : ''}${o.duplicateWarning ? statLine('Potensi Double', 'Ada', 'red') : ''}${o.phone ? statLine('No Telp', o.phone, 'purple') : ''}${o.tlNote ? statLine('Catatan TL', o.tlNote, 'blue') : ''}</div><div class="btn-row" style="margin-top:12px"><a class="btn primary" target="_blank" rel="noopener" href="${googleDirectionUrl(o.lat,o.lng)}">Buka Arah</a>${correction}</div></div>`;
    }).join('')}</div>`;
  }
  function spgCorrectionModal(id) {
    const outlet=ownOutlets().find(item=>item.id===id);if(!outlet)return;
    const left=correctionMinutesLeft(outlet);
    if(!canSpgCorrectOutlet(outlet))return toast(`Waktu perbaikan ${SPG_CORRECTION_MINUTES} menit sudah berakhir. Hubungi TL bila data masih salah.`);
    modalShell('Perbaiki data outlet',`Sisa waktu perbaikan sekitar ${number(left)} menit. Titik lokasi dan foto tetap memakai data awal.`,`<div class="form modal-form">${field('Nama Outlet','spgCorrectionName','text','Nama outlet',outlet.name)}${selectField('Tanda Outlet','spgCorrectionTanda',tandaOptions,outlet.tanda)}${field('Terjual / Kaleng','spgCorrectionSold','number','0',outlet.sold)}${field('Nomor HP (opsional)','spgCorrectionPhone','text','08xxxxxxxxxx',outlet.phone||'')}<div class="field"><label>Catatan</label><textarea id="spgCorrectionNotes">${escapeHtml(outlet.notes||'')}</textarea></div></div>`,'<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="saveSpgCorrectionBtn">Simpan Perbaikan</button>',()=>{
      document.getElementById('saveSpgCorrectionBtn')?.addEventListener('click',()=>{
        if(!canSpgCorrectOutlet(outlet))return toast('Waktu perbaikan sudah berakhir.');
        const name=val('spgCorrectionName').trim(),sold=Number(val('spgCorrectionSold'));
        if(!name)return toast('Nama outlet wajib diisi.');
        if(!Number.isFinite(sold)||sold<0)return toast('Kaleng terjual minimal 0.');
        Object.assign(outlet,{name,tanda:val('spgCorrectionTanda')||outlet.tanda,sold,phone:val('spgCorrectionPhone').trim(),notes:val('spgCorrectionNotes').trim(),correctedAt:nowIso(),correctedById:state.user.id});
        queueOfflineAction('outlet-correction',outlet.id);save();closeModal();toast('Perbaikan berhasil disimpan.');render();
      });
    });
  }
  function photoThumb(src) { return src ? `<img class="thumb" src="${src}" alt="Foto outlet" />` : '<span class="thumb empty-thumb">-</span>'; }
  function filterGeneric(rows, keys) { const q = state.search.toLowerCase().trim(); if (!q) return rows; return rows.filter(row => keys.some(k => String(row[k] ?? '').toLowerCase().includes(q))); }
  function groupBy(rows, fn) { return rows.reduce((acc, item) => { const key = fn(item); (acc[key] ||= []).push(item); return acc; }, {}); }
  function googleUrl(lat, lng) { return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`; }
  function googleDirectionUrl(lat, lng) { return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`; }
  function formatDateTime(v) { if (!v) return '-'; try { return new Date(v).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' }); } catch { return String(v); } }
  function adminInsights(rows) {
    const m = metrics(rows); const topSpg = bySpg(rows)[0]; const topArea = byArea(rows).sort((a,b)=>b.sold-a.sold)[0];
    const dup = duplicateCandidates(rows);
    const lowArea = byArea(rows).filter(x => x.outlet > 0).sort((a,b)=>a.outlet-b.outlet)[0];
    const bestOutlet = rows.slice().sort((a,b)=>Number(b.sold||0)-Number(a.sold||0))[0];
    const badGps = rows.filter(o => Number(o.accuracy || 0) > 100).length;
    return [
      { tag:'coverage', color:'blue', text:`Ada ${number(m.outlets)} outlet pada filter ini. ${number(m.todayCount)} outlet ditandai hari ini.` },
      { tag:'terjual', color:'green', text: topArea ? `Area dengan kaleng terjual tertinggi: ${topArea.area} (${number(topArea.sold)} kaleng).` : 'Belum ada data terjual.' },
      { tag:'SPG aktif', color:'purple', text: topSpg ? `${topSpg.spg} paling aktif dengan ${topSpg.outlet} outlet dan ${number(topSpg.sold)} kaleng.` : 'Belum ada SPG yang menandai outlet.' },
      { tag:'kualitas data', color:m.withPhoto === m.outlets ? 'green' : 'yellow', text: m.withPhoto === m.outlets ? 'Semua outlet pada filter ini sudah memiliki foto.' : `${m.outlets - m.withPhoto} outlet belum memiliki foto.` },
      { tag:'anti double', color:dup.length ? 'red' : 'green', text: dup.length ? `Ada ${dup.length} potensi outlet double. Cek tabel Potensi Outlet Double.` : 'Belum ada potensi outlet double pada filter ini.' },
      { tag:'GPS', color:badGps ? 'yellow' : 'green', text: badGps ? `${badGps} outlet punya akurasi GPS di atas 100 meter.` : 'Akurasi GPS outlet terlihat aman.' },
      { tag:'peluang area', color:'blue', text: lowArea ? `Area ${lowArea.area} masih paling sedikit titik outlet (${lowArea.outlet}). Bisa diprioritaskan untuk coverage.` : 'Belum cukup data area untuk rekomendasi.' },
      { tag:'top outlet', color:'green', text: bestOutlet ? `Outlet dengan terjual tertinggi: ${bestOutlet.name} (${number(bestOutlet.sold)} kaleng).` : 'Belum ada outlet dengan penjualan.' }
    ];
  }

  function barChart(items) {
    const max = Math.max(1, ...items.map(i => Number(i.value || 0)));
    return `<div class="chart">${items.map(i => `<div class="bar" style="height:${Math.max(8, Number(i.value || 0) / max * 100)}%"><b>${number(i.value)}</b><span>${escapeHtml(i.label)}</span></div>`).join('')}</div>`;
  }



  // STABLE FIX: fungsi maps dan helper yang sempat hilang pada build sebelumnya.
  // Tanpa fungsi ini, menu tidak berpindah karena goPage() memanggil cleanupMaps().
  function cleanupMaps() {
    try { if (state.map && typeof state.map.remove === 'function') state.map.remove(); } catch (e) {}
    try { if (state.spgMap && typeof state.spgMap.remove === 'function') state.spgMap.remove(); } catch (e) {}
    try { if (state.placementPickerMap && typeof state.placementPickerMap.remove === 'function') state.placementPickerMap.remove(); } catch (e) {}
    state.map = null;
    state.spgMap = null;
    state.placementPickerMap = null;
    state.placementPickerMarker = null;
    state.pickMarker = null;
  }

  function leafletReady() {
    return typeof window.L !== 'undefined' && typeof L.map === 'function';
  }

  function markerIconFor(tanda, label='') {
    const color = tandaColor(tanda || 'Outlet baru');
    const short = String(label || tanda || 'O').slice(0, 1).toUpperCase();
    if (!leafletReady()) return null;
    return L.divIcon({
      className: '',
      html: `<div class="marker-pin marker-${color}"><span>${escapeHtml(short)}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30]
    });
  }

  function addPopup(map, marker, o, admin = true) {
    marker.bindPopup(`<div class="popup-card">
      ${o.photo ? `<img src="${o.photo}" alt="Foto outlet">` : ''}
      <div class="popup-title">${escapeHtml(o.name)}</div>
      <div class="popup-grid">
        <span>${escapeHtml(o.area)} • ${escapeHtml(o.tanda)}</span>
        <span>Terjual: <b>${number(o.sold)} kaleng</b></span>
        <span>Nilai: <b>${money(outletValue(o))}</b></span>
        ${admin ? `<span>SPG: <b>${escapeHtml(o.markedBy)}</b></span>` : ''}
        <span>Ditandai: ${formatDateTime(o.markedAt)}</span>
        ${o.phone ? `<span>No Telp: ${escapeHtml(o.phone)}</span>` : ''}
      </div>
      <a class="popup-link" target="_blank" href="${googleDirectionUrl(o.lat,o.lng)}">Buka Arah</a>
    </div>`);
  }

  function fitMap(map, rows = []) {
    if (!map || !leafletReady()) return;
    const valid = rows.filter(hasCoordinatePoint);
    if (!valid.length) {
      map.setView([-3.3194, 114.5908], 12);
      return;
    }
    const bounds = L.latLngBounds(valid.map(o => [Number(o.lat), Number(o.lng)]));
    map.fitBounds(bounds.pad(0.18), { maxZoom: 16, animate: false });
  }

  function drawRoute(map, rows, color = '#2563eb') {
    if (!map || !leafletReady()) return;
    const valid = rows
      .filter(hasCoordinatePoint)
      .sort((a, b) => new Date(a.markedAt) - new Date(b.markedAt));
    if (valid.length < 2) return;
    L.polyline(valid.map(o => [Number(o.lat), Number(o.lng)]), {
      color,
      weight: 4,
      opacity: 0.72,
      dashArray: state.mapMode === 'clean' ? '0' : '8 8'
    }).addTo(map);
  }

  function initAdminMap() {
    const el = document.getElementById('map');
    if (!el) return;
    if (!leafletReady()) {
      el.innerHTML = '<div class="empty">Maps belum termuat. Pastikan internet aktif untuk Leaflet/OpenStreetMap.</div>';
      return;
    }
    try { if (state.map) state.map.remove(); } catch (e) {}
    state.map = L.map(el, { zoomControl: true }).setView([-3.3194, 114.5908], 12);
    addFastTileLayer(state.map);
    const rows = visibleOutlets();
    rows.forEach(o => {
      if (!hasCoordinatePoint(o)) return;
      const marker = L.marker([Number(o.lat), Number(o.lng)], { icon: markerIconFor(o.tanda, o.name) }).addTo(state.map);
      addPopup(state.map, marker, o, true);
      if (state.showLabels) {
        L.marker([Number(o.lat), Number(o.lng)], {
          icon: L.divIcon({ className: 'outlet-label', html: escapeHtml(o.name), iconSize: null })
        }).addTo(state.map);
      }
      if (state.mapMode === 'detail') {
        L.circle([Number(o.lat), Number(o.lng)], { radius: 55, color: dateColor(dateOnly(o.markedAt)), fillOpacity: 0.08, weight: 1 }).addTo(state.map);
      }
    });
    const byName = groupBy(rows, o => o.markedBy || 'SPG');
    const routeLegend = document.getElementById('routeLegend');
    if (routeLegend) routeLegend.innerHTML = '';
    Object.entries(byName).forEach(([name, list], idx) => {
      const color = routeColors[idx % routeColors.length];
      drawRoute(state.map, list, color);
      if (routeLegend) routeLegend.innerHTML += `<div class="route-line"><span style="background:${color}"></span><b>${escapeHtml(name)}</b><small>${number(list.length)} outlet</small></div>`;
    });
    const aiList = document.getElementById('aiMapList');
    if (aiList) aiList.innerHTML = adminInsights(rows).map(i => aiItem(i.tag, i.text, i.color)).join('');
    fitMap(state.map, rows);
    setTimeout(() => state.map?.invalidateSize?.(), 120);
  }

  function initSpgMap() {
    const el = document.getElementById('spgMap');
    if (!el) return;
    if (!leafletReady()) {
      el.innerHTML = '<div class="empty">Maps belum termuat. Pastikan internet aktif untuk Leaflet/OpenStreetMap.</div>';
      return;
    }
    try { if (state.spgMap) state.spgMap.remove(); } catch (e) {}
    const rows = ownOutlets();
    state.spgMap = L.map(el, { zoomControl: true }).setView([-3.3194, 114.5908], 13);
    addFastTileLayer(state.spgMap);
    rows.forEach(o => {
      if (!hasCoordinatePoint(o)) return;
      const marker = L.marker([Number(o.lat), Number(o.lng)], { icon: markerIconFor(o.tanda, o.name) }).addTo(state.spgMap);
      addPopup(state.spgMap, marker, o, false);
      if (state.showLabels) L.marker([Number(o.lat), Number(o.lng)], { icon: L.divIcon({ className: 'outlet-label', html: escapeHtml(o.name), iconSize: null }) }).addTo(state.spgMap);
    });
    const byDate = groupBy(rows, o => dateOnly(o.markedAt) || 'Tanggal');
    Object.entries(byDate).forEach(([date, list]) => drawRoute(state.spgMap, list, dateColor(date)));
    state.spgMap.on('click', (e) => setSelectedPoint(e.latlng.lat, e.latlng.lng, 0));
    if (state.selectedPoint) addPickMarker();
    fitMap(state.spgMap, rows);
    updatePointPreview();
    setTimeout(() => state.spgMap?.invalidateSize?.(), 120);
  }

  function addPickMarker() {
    if (!state.spgMap || !leafletReady() || !state.selectedPoint) return;
    try { state.pickMarker?.remove?.(); } catch(e) {}
    state.pickMarker = L.marker([state.selectedPoint.lat, state.selectedPoint.lng], {
      icon: L.divIcon({ className: '', html: '<div class="pick-pin">+</div>', iconSize: [34,34], iconAnchor: [17,17] })
    }).addTo(state.spgMap);
  }

  function setSelectedPoint(lat, lng, accuracy = 0) {
    state.selectedPoint = { lat: Number(lat), lng: Number(lng), accuracy: Number(accuracy || 0) };
    addPickMarker();
    updatePointPreview();
    updateDuplicatePreview();
  }

  function updatePointPreview() {
    const box = document.getElementById('spgPointText');
    if (!box) return;
    if (!state.selectedPoint) {
      box.textContent = 'Koordinat belum dipilih. Klik peta atau pilih lokasi saya.';
      return;
    }
    box.textContent = `Titik dipilih: ${state.selectedPoint.lat.toFixed(6)}, ${state.selectedPoint.lng.toFixed(6)}${state.selectedPoint.accuracy ? ` • akurasi ±${Math.round(state.selectedPoint.accuracy)} m` : ''}`;
    const accBox = document.getElementById('accuracyWarningBox');
    if (accBox) accBox.innerHTML = state.selectedPoint.accuracy > 100 ? '<div class="notice warn"><b>GPS kurang akurat.</b><small>Coba tunggu beberapa detik atau aktifkan mode lokasi akurat.</small></div>' : '';
  }

  function updateDuplicatePreview() {
    const box = document.getElementById('duplicateWarningBox');
    if (!box) return;
    const name = val('spgOutletName').trim();
    if (!state.selectedPoint || !name) { box.innerHTML = ''; return; }
    const draft = { id: 'draft', name, lat: state.selectedPoint.lat, lng: state.selectedPoint.lng };
    const near = findNearbyDuplicates(draft, outlets());
    box.innerHTML = near.length ? `<div class="notice warn"><b>Potensi outlet double.</b><small>Dekat/mirip dengan: ${escapeHtml(near.slice(0,3).map(x => `${x.outlet.name} (${Math.round(x.distance)} m)`).join(', '))}</small></div>` : '';
  }

  function useMyLocation() {
    if (!navigator.geolocation) return toast('Browser tidak mendukung lokasi/GPS. Klik titik di maps saja.');
    toast('Mengambil lokasi kamu...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        setSelectedPoint(latitude, longitude, accuracy);
        state.spgMap?.setView?.([latitude, longitude], 17);
        toast('Lokasi berhasil diambil.');
      },
      () => toast('Gagal mengambil lokasi. Izinkan akses lokasi atau klik titik di maps.'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  function readPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('File harus berupa gambar/foto.');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
        const weak=Boolean(connection?.saveData||['slow-2g','2g','3g'].includes(connection?.effectiveType));
        const max = weak ? 800 : 1100;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let quality=weak?0.58:0.74,dataUrl=canvas.toDataURL('image/jpeg',quality);
        while(dataUrl.length*0.75>480000&&quality>0.42){quality-=0.08;dataUrl=canvas.toDataURL('image/jpeg',quality);}
        state.selectedPhoto = dataUrl;
        const preview = document.getElementById('photoPreview');
        const beforeKb=Math.max(1,Math.round(file.size/1024)),afterKb=Math.max(1,Math.round(dataUrl.length*0.75/1024));
        if (preview) preview.innerHTML = `<img src="${state.selectedPhoto}" alt="Preview foto outlet"><small>Foto dikecilkan ${number(beforeKb)} KB → ${number(afterKb)} KB${weak?' • mode jaringan lemah':''}</small>`;
        updateValidationChecklist();
        saveSpgDraft();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function importExcel() {
    if (!window.XLSX) return toast('Library Excel belum termuat. Pastikan internet aktif.');
    const file = document.getElementById('importExcelInput')?.files?.[0];
    if (!file) return toast('Pilih file Excel/CSV terlebih dahulu.');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        let added = 0, skipped = 0;
        rows.forEach(r => {
          const name = r['Nama Outlet'] || r['Outlet'] || r['name'];
          const area = r['Area'] || r['area'];
          const spg = r['SPG'] || r['Nama SPG'] || r['markedBy'] || state.user.name;
          const lat = Number(r['Latitude'] || r['Lat'] || r['lat']);
          const lng = Number(r['Longitude'] || r['Lng'] || r['lng']);
          if (!name || !area || !Number.isFinite(lat) || !Number.isFinite(lng)) { skipped++; return; }
          const user = spgList().find(u => u.name.toLowerCase() === String(spg).toLowerCase());
          const outlet = normalizeOutlet({
            id: uid('o'), name, area, tanda: r['Tanda Outlet'] || r['Tanda'] || 'Outlet baru', sold: Number(r['Terjual'] || r['Terjual/Kaleng'] || 0),
            phone: r['No Telp'] || r['Phone'] || '', lat, lng, markedBy: user?.name || spg, markedById: user?.id || '', markedAt: r['Tanggal'] || nowIso(), notes: r['Catatan'] || '', accuracy: Number(r['Akurasi'] || 0)
          });
          const near = findNearbyDuplicates(outlet, outlets());
          outlet.duplicateWarning = near.length ? `Dekat dengan ${near[0].outlet.name} (${Math.round(near[0].distance)} m)` : '';
          state.data.outlets.push(outlet); added++;
        });
        save(); toast(`Import selesai: ${added} data masuk, ${skipped} dilewati.`); render();
      } catch (err) { toast('Gagal import: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  }

  function exportExcel() {
    if (!window.XLSX) return toast('Library Excel belum termuat. Pastikan internet aktif.');
    const rows = getExportRows();
    const wb = XLSX.utils.book_new();
    const m = metrics(rows);
    const h = dataHealthMetrics(rows);
    const narasi = aiSummaryText(rows);
    const template = selectedExportTemplate();
    const detailRows = rows.map(o => ({
      Outlet:o.name, Area:o.area, Harga_Per_Kaleng:areaPrice(o.area), Tanda_Outlet:o.tanda, Terjual_Kaleng:o.sold, Estimasi_Nilai:outletValue(o), SPG_Penanda:o.markedBy,
      Tanggal_Tanda:formatDateTime(o.markedAt),       Akurasi_GPS_Meter:o.accuracy || '', Potensi_Double:o.duplicateWarning || '', No_Telp:o.phone, Latitude:o.lat, Longitude:o.lng,
      Google_Maps:googleUrl(o.lat,o.lng), Catatan:o.notes, Catatan_TL:o.tlNote || '', Ada_Foto:o.photo ? 'Ya' : 'Tidak'
    }));
    addSheet(wb, 'Cover', [
      ['WEBSITE EXTRA JOSS SPG - LAPORAN OUTLET'], ['Template', template], ['Generated At', new Date().toLocaleString('id-ID')],
      ['Dibuat Oleh', state.user.name], ['Filter Area', state.filters.area], ['Filter SPG', state.filters.spg], ['Filter Tanda', state.filters.tanda], ['Filter Tanggal', state.filters.date], ['Filter Cepat', state.filters.quick], [], ['Ringkasan'], [narasi]
    ]);
    addSheet(wb, 'Ringkasan KPI', [
      ['KPI','Nilai'], ['Total Outlet', rows.length], ['Total Kaleng Terjual', m.sold], ['Estimasi Nilai', m.value], ['Ditandai Hari Ini', m.todayCount], ['Jumlah SPG', m.spgs], ['Potensi Double', m.duplicate], ['Outlet Ada Foto', m.withPhoto], ['Skor Kesehatan Data', h.score], ['Foto Lengkap %', h.photoPct + '%'], ['No Telp Terisi %', h.phonePct + '%']
    ]);
    if (template === 'Data Mentah') {
      addSheet(wb, 'Data Mentah', detailRows);
    } else if (template === 'Ringkas') {
      addSheet(wb, 'Summary Area', byArea(rows).map(x => ({ Area:x.area, Outlet:x.outlet, Harga_Per_Kaleng:x.pricePerCan, Terjual_Kaleng:x.sold, Estimasi_Nilai:x.value, Ditandai_Hari_Ini:x.today })));
      addSheet(wb, 'Summary SPG', bySpg(rows).map((x,i) => ({ Ranking:i+1, SPG:x.spg, Area:x.area, Outlet:x.outlet, Terjual_Kaleng:x.sold, Estimasi_Nilai:x.value, Ditandai_Hari_Ini:x.today })));
      addSheet(wb, 'Coverage Area', coverageRows(rows).map(x => ({ Area:x.area, Outlet:x.outlet, Terjual_Kaleng:x.sold, Status_Coverage:x.status, Saran:x.advice })));
      addSheet(wb, 'Outlet Potensial', rows.map(o => ({ Outlet:o.name, Area:o.area, SPG:o.markedBy, Terjual_Kaleng:o.sold, Kategori_Potensi:potentialLevel(o).label })));
      addSheet(wb, 'Link Google Maps', mapLinksRows(rows));
    } else if (template === 'Per SPG') {
      bySpg(rows).forEach(x => addSheet(wb, safeSheetName('SPG ' + x.spg), detailRows.filter(r => r.SPG_Penanda === x.spg)));
      addSheet(wb, 'Summary SPG', bySpg(rows));
    } else if (template === 'Per Area') {
      byArea(rows).forEach(x => addSheet(wb, safeSheetName('Area ' + x.area), detailRows.filter(r => r.Area === x.area)));
      addSheet(wb, 'Summary Area', byArea(rows));
    } else {
      addSheet(wb, 'Data Outlet', detailRows);
      addSheet(wb, 'Summary Area', byArea(rows).map(x => ({ Area:x.area, Outlet:x.outlet, Harga_Per_Kaleng:x.pricePerCan, Terjual_Kaleng:x.sold, Estimasi_Nilai:x.value, Ditandai_Hari_Ini:x.today })));
      addSheet(wb, 'Summary SPG', bySpg(rows).map((x,i) => ({ Ranking:i+1, SPG:x.spg, Area:x.area, Outlet:x.outlet, Terjual_Kaleng:x.sold, Estimasi_Nilai:x.value, Ditandai_Hari_Ini:x.today })));
      addSheet(wb, 'Kesehatan Data', [['Metrik','Nilai'], ['Skor', h.score], ['Foto Lengkap %', h.photoPct + '%'], ['No Telp Terisi %', h.phonePct + '%'], ['Potensi Double', h.duplicate], ['GPS Kurang Akurat', h.badGps], ['Tanpa No Telp', h.noPhone], ['Terjual 0', h.zeroSold]]);
      addSheet(wb, 'Link Google Maps', mapLinksRows(rows));
      addSheet(wb, 'Coverage Area', coverageRows(rows).map(x => ({ Area:x.area, Kota:x.city, Outlet:x.outlet, Terjual_Kaleng:x.sold, Estimasi_Nilai:x.value, Status_Coverage:x.status, Saran:x.advice })));
      addSheet(wb, 'Outlet Potensial', rows.map(o => ({ Outlet:o.name, Area:o.area, SPG:o.markedBy, Terjual_Kaleng:o.sold, Estimasi_Nilai:outletValue(o), Kategori_Potensi:potentialLevel(o).label, Alasan:potentialLevel(o).note })));
      addSheet(wb, 'Tanda Outlet', tandaOptions.map(t => ({ Tanda:t, Jumlah:rows.filter(o=>o.tanda===t).length, Terjual_Kaleng:rows.filter(o=>o.tanda===t).reduce((a,o)=>a+Number(o.sold||0),0) })));
      addSheet(wb, 'Potensi Double', duplicateCandidates(rows).map(d => ({ Outlet_1:d.outlet.name, Outlet_2:d.near.name, Jarak_Meter:Math.round(d.distance), Area:d.outlet.area, SPG_1:d.outlet.markedBy, SPG_2:d.near.markedBy, Status:'Perlu dicek' })));
      addSheet(wb, 'Tanpa Foto', rows.filter(o=>!o.photo).map((o,i)=>({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy })));
      addSheet(wb, 'Tanpa No Telp', rows.filter(o=>!String(o.phone||'').trim()).map((o,i)=>({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy })));
      addSheet(wb, 'Terjual 0', rows.filter(o=>Number(o.sold||0)===0).map((o,i)=>({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy })));
      addSheet(wb, 'Timeline Aktivitas', timelineRows(rows, 200).map((o,i) => ({ No:i+1, Waktu:formatDateTime(o.markedAt), SPG:o.markedBy, Outlet:o.name, Area:o.area, Tanda:o.tanda, Terjual_Kaleng:o.sold, Catatan_TL:o.tlNote || '' })));
      addSheet(wb, 'Outlet Bermasalah', problemOutlets(rows).map((o,i) => ({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy, Masalah:o.tanda, Akurasi:o.accuracy, Potensi_Double:o.duplicateWarning || '', Catatan_TL:o.tlNote || '' })));
      addSheet(wb, 'Ranking Outlet', topSellingOutlets(rows, 50).map((o,i) => ({ Ranking:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy, Terjual_Kaleng:o.sold, Tanda:o.tanda })));
      addSheet(wb, 'Kunjungan Ulang', revisitRecommendations(rows).map((o,i) => ({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy, Terjual_Kaleng:o.sold, Tanda:o.tanda, Alasan:o.tanda === 'Potensial' ? 'Outlet potensial' : Number(o.sold||0) >= 18 ? 'Terjual tinggi' : ['Tutup','Menolak'].includes(o.tanda) ? 'Perlu dicek ulang' : 'Perlu ditinjau', Catatan_TL:o.tlNote || '' })));
      addSheet(wb, 'Catatan TL', rows.filter(o=>o.tlNote).map((o,i) => ({ No:i+1, Outlet:o.name, Area:o.area, SPG:o.markedBy, Catatan_TL:o.tlNote,  })));
      addSheet(wb, 'Data SPG', spgList().map(u => ({ Nama:u.name, Email:u.email, Area:u.area, HP:u.phone, Status:u.status, Outlet_Ditandai:outlets().filter(o => o.markedById === u.id || o.markedBy === u.name).length })));
    }
    XLSX.writeFile(wb, `WEB_MAPS_SPG_CLEAN_${template.replace(/\s+/g,'_')}_${today()}.xlsx`);
  }
  function addSheet(wb, name, data) {
    const ws = Array.isArray(data[0]) ? XLSX.utils.aoa_to_sheet(data) : XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Array.from({ length: 18 }, () => ({ wch: 24 }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  function exportPdf() {
    const jspdf = window.jspdf; if (!jspdf?.jsPDF) return toast('Library PDF belum termuat. Pastikan internet aktif.');
    const rows = getExportRows();
    const m = metrics(rows); const h = dataHealthMetrics(rows); const template = selectedExportTemplate();
    const doc = new jspdf.jsPDF({ orientation:'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, pageW, 42, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(22); doc.text('WEBSITE EXTRA JOSS SPG', 14, 18);
    doc.setFontSize(13); doc.text(`Laporan Outlet Ditandai SPG - ${template}`, 14, 29);
    doc.setTextColor(15,23,42); doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')} | By: ${state.user.name}`, 14, 50);
    doc.text(`Filter: Area ${state.filters.area} | SPG ${state.filters.spg} | Tanda ${state.filters.tanda} | Tanggal ${state.filters.date} | Cepat ${state.filters.quick}`, 14, 57);
    doc.autoTable({ startY: 66, theme:'grid', head: [['Ringkasan','Nilai']], body: [
      ['Total Outlet', rows.length], ['Kaleng Terjual', number(m.sold)], ['Estimasi Nilai', money(m.value)], ['Ditandai Hari Ini', m.todayCount], ['Jumlah SPG', m.spgs], ['Potensi Double', m.duplicate], ['Outlet Ada Foto', m.withPhoto], ['Skor Kesehatan Data', h.score + '/100']
    ], styles:{ fontSize:9 }, headStyles:{ fillColor:[15,23,42] } });
    doc.setFontSize(10); doc.text(doc.splitTextToSize(aiSummaryText(rows), pageW - 28), 14, doc.lastAutoTable.finalY + 10);
    doc.autoTable({ startY: doc.lastAutoTable.finalY + 28, head: [['Rank','SPG','Area','Outlet','Terjual','Hari Ini']], body: bySpg(rows).slice(0,10).map((x,i)=>[i+1,x.spg,x.area,x.outlet,number(x.sold),x.today]), styles:{ fontSize:8 }, headStyles:{ fillColor:[37,99,235] } });
    if (template !== 'Ringkas') {
      doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head: [['Area','Outlet','Terjual','Nilai','Status Coverage','Saran']], body: coverageRows(rows).map(x=>[x.area, x.outlet, number(x.sold), money(x.value), x.status, x.advice]), styles:{ fontSize:8 }, headStyles:{ fillColor:[14,116,144] } });
      doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head: [['Rank','Outlet Terlaris','Area','SPG','Terjual','Potensi']], body: topSellingOutlets(rows,10).map((o,i)=>[i+1,o.name,o.area,o.markedBy,number(o.sold),potentialLevel(o).label]), styles:{ fontSize:8 }, headStyles:{ fillColor:[22,163,74] } });
      doc.autoTable({ startY: doc.lastAutoTable.finalY + 10, head: [['Kunjungan Ulang','Area','SPG','Alasan','Catatan TL']], body: revisitRecommendations(rows).slice(0,10).map(o=>[o.name,o.area,o.markedBy,o.tanda === 'Potensial' ? 'Outlet potensial' : Number(o.sold||0) >= 18 ? 'Terjual tinggi' : ['Tutup','Menolak'].includes(o.tanda) ? 'Perlu dicek ulang' : 'Perlu ditinjau', o.tlNote || '-']), styles:{ fontSize:8 }, headStyles:{ fillColor:[245,158,11] } });
    }
    doc.addPage('landscape');
    doc.setFontSize(16); doc.text('Detail Outlet dan Link Google Maps', 14, 16);
    doc.autoTable({ startY: 24, head: [['Outlet','Area','Harga','Tanda','Terjual','Nilai','SPG','Ditandai','No Telp','Google Maps']], body: rows.map(o => [o.name, o.area, money(areaPrice(o.area)), o.tanda, o.sold, money(outletValue(o)), o.markedBy, formatDateTime(o.markedAt), o.phone || '-', googleUrl(o.lat,o.lng)]), styles:{ fontSize:6.8, cellWidth:'wrap' }, headStyles:{ fillColor:[15,23,42] }, columnStyles: { 8: { cellWidth: 70 } } });
    if (template === 'Dengan Foto' || template === 'Lengkap') {
      const photos = rows.filter(o => o.photo).slice(0, 12);
      if (photos.length) {
        doc.addPage('landscape');
        doc.setFontSize(16); doc.text('Lampiran Foto Outlet', 14, 16);
        let x = 14, y = 26;
        photos.forEach((o, idx) => {
          try { doc.addImage(o.photo, 'JPEG', x, y, 54, 36); } catch {}
          doc.setFontSize(7); doc.text(doc.splitTextToSize(`${o.name} - ${o.markedBy}`, 54), x, y + 42);
          x += 68;
          if ((idx + 1) % 4 === 0) { x = 14; y += 58; }
        });
      }
    }
    doc.save(`WEB_MAPS_SPG_CLEAN_${template.replace(/\s+/g,'_')}_${today()}.pdf`);
  }

  function exportJson() { download(`WEB_MAPS_SPG_BACKUP_${today()}.json`, JSON.stringify(state.data, null, 2), 'application/json'); }
  function restoreJson() {
    const file = document.getElementById('restoreJsonInput')?.files?.[0];
    if (!file) return toast('Pilih file backup JSON terlebih dahulu.');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = normalizeData(JSON.parse(reader.result));
        if (!data.users?.length || !data.areas?.length) return toast('File cadangan tidak sesuai format Website Extra Joss SPG.');
        if (!confirm('Restore akan mengganti data lokal saat ini. Lanjutkan?')) return;
        state.data = data; save(); toast('Restore JSON berhasil.'); render();
      } catch (e) { toast('Gagal restore JSON: ' + e.message); }
    };
    reader.readAsText(file);
  }
  function printFieldReport() {
    const rows = getExportRows();
    const html = `<html><head><title>Laporan Lapangan Website Extra Joss SPG</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{margin:0 0 6px}.meta{color:#64748b;margin-bottom:18px}.summary{border:1px solid #cbd5e1;border-radius:14px;padding:14px;margin:14px 0;background:#f8fafc}table{width:100%;border-collapse:collapse;margin-top:14px}th,td{border:1px solid #cbd5e1;padding:8px;font-size:12px;text-align:left}th{background:#eff6ff}img{width:70px;height:50px;object-fit:cover;border-radius:8px}.badge{font-weight:bold}</style></head><body><h1>Website Extra Joss SPG - Laporan Lapangan</h1><div class="meta">Generated: ${new Date().toLocaleString('id-ID')} | Admin: ${escapeHtml(state.user.name)} | Filter: Area ${escapeHtml(state.filters.area)}, SPG ${escapeHtml(state.filters.spg)}, Tanggal ${escapeHtml(state.filters.date)}</div><div class="summary"><b>Ringkasan Otomatis</b><p>${escapeHtml(aiSummaryText(rows))}</p></div><table><thead><tr><th>Foto</th><th>Outlet</th><th>Area</th><th>SPG</th><th>Tanda</th><th>Terjual</th><th>Nilai</th><th>Ditandai</th><th>Maps</th><th>Catatan TL</th></tr></thead><tbody>${rows.map(o=>`<tr><td>${o.photo?`<img src="${o.photo}">`:'-'}</td><td>${escapeHtml(o.name)}</td><td>${escapeHtml(o.area)}</td><td>${escapeHtml(o.markedBy)}</td><td>${escapeHtml(o.tanda)}</td><td>${number(o.sold)}</td><td>${money(outletValue(o))}</td><td>${formatDateTime(o.markedAt)}</td><td>${googleUrl(o.lat,o.lng)}</td><td>${escapeHtml(o.tlNote||'')}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return toast('Popup print diblokir browser. Izinkan popup untuk website ini.');
    w.document.write(html); w.document.close();
  }
  function download(filename, text, type) { const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

  function savedAccounts() {
    if(!securitySettings().allowSavedAccounts)return [];
    try { return JSON.parse(localStorage.getItem(KEY_SAVED_ACCOUNTS) || '[]').filter(item=>item?.email && item?.password).slice(0,8); }
    catch { return []; }
  }
  function rememberAccount(email, password) {
    if(!securitySettings().allowSavedAccounts)return;
    const user = state.data.users.find(item=>String(item.email||'').toLowerCase()===email);
    const next = [{email,password,name:user?.name||email,role:user?.role||''}, ...savedAccounts().filter(item=>item.email!==email)].slice(0,8);
    localStorage.setItem(KEY_SAVED_ACCOUNTS, JSON.stringify(next));
  }
  function loginAttemptInfo(email) {
    try{return JSON.parse(localStorage.getItem(KEY_LOGIN_ATTEMPTS)||'{}')[email]||{count:0,blockedUntil:0};}catch{return {count:0,blockedUntil:0};}
  }
  function recordFailedLogin(email) {
    let all={};try{all=JSON.parse(localStorage.getItem(KEY_LOGIN_ATTEMPTS)||'{}');}catch{}
    const current=all[email]||{count:0,blockedUntil:0};current.count=Number(current.count||0)+1;
    if(current.count>=securitySettings().maxLoginAttempts){current.blockedUntil=Date.now()+5*60*1000;current.count=0;}
    all[email]=current;localStorage.setItem(KEY_LOGIN_ATTEMPTS,JSON.stringify(all));return current;
  }
  function clearFailedLogin(email) {
    try{const all=JSON.parse(localStorage.getItem(KEY_LOGIN_ATTEMPTS)||'{}');delete all[email];localStorage.setItem(KEY_LOGIN_ATTEMPTS,JSON.stringify(all));}catch{}
  }

  function renderLogin() {
    const app = document.getElementById('app');
    let remembered = null;
    try { remembered = JSON.parse(localStorage.getItem(KEY_REMEMBER) || 'null'); } catch {}
    const savedEmail = remembered?.email || '';
    const savedPass = remembered?.password || '';
    const checked = remembered ? 'checked' : '';
    const accounts = savedAccounts();
    const allowSaved=securitySettings().allowSavedAccounts;
    const siteName=state.data.settings.appName||contentSetting('siteName','Website Extra Joss SPG'),loginTitle=contentSetting('loginTitle',siteName),loginSubtitle=contentSetting('loginSubtitle','Pantau pencapaian, laporan, outlet, dan aktivitas SPG dalam satu tempat.'),footer=contentSetting('footerText','© 2026 Solehudin. Seluruh hak cipta dilindungi.');
    document.title=siteName;
    app.innerHTML = `<div class="login-page branded-login"><div class="login-theme-control">${themeToggleHtml('login-theme-toggle')}</div><section class="login-hero"><div class="login-brand-row"><img src="assets/brand/extra-joss-logo.png" alt="Extra Joss Ultimate" class="login-logo-mark"></div><h1>${escapeHtml(loginTitle)}</h1><p>${escapeHtml(loginSubtitle)}</p><div class="hero-brand-showcase"><div class="hero-product"><img src="assets/brand/extra-joss-can.jpg" alt="Extra Joss Ultimate Can"></div></div></section><section class="login-card branded-login-card"><div class="login-card-logo"><img src="assets/brand/extra-joss-product.jpg" alt="Extra Joss Ultimate"></div><h2>Masuk ke ${escapeHtml(siteName)}</h2><p>Masuk dengan akun Anda.</p>${accounts.length?`<div class="saved-login-list"><small>Akun tersimpan</small>${accounts.map((item,index)=>`<button type="button" class="saved-login-item" data-saved-login="${index}"><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.role||'Pengguna')} • ${escapeHtml(item.email)}</span></button>`).join('')}</div>`:''}<div class="form"><div class="field"><label>Email</label><input id="loginEmail" placeholder="Email akun" value="${escapeAttr(savedEmail)}" autocomplete="username" /></div>${passwordField('Password','loginPassword','Password',savedPass)}${allowSaved?`<label class="remember-line"><input type="checkbox" id="rememberLogin" ${checked}> <span>Simpan akun di perangkat ini</span></label>`:''}<button class="btn dark" id="loginBtn">Login</button></div></section><footer class="app-footer login-footer">${escapeHtml(footer)}</footer></div>`;
    bindPasswordVisibility(app);
    bindThemeToggle();
    document.getElementById('loginBtn').addEventListener('click', () => login());
    document.querySelectorAll('[data-saved-login]').forEach(button=>button.addEventListener('click',()=>{
      const item=accounts[Number(button.dataset.savedLogin)]; if(!item)return;
      document.getElementById('loginEmail').value=item.email; document.getElementById('loginPassword').value=item.password; if(document.getElementById('rememberLogin'))document.getElementById('rememberLogin').checked=true; login();
    }));
    ['loginEmail','loginPassword'].forEach(id => document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); }));
  }
  function finishSuccessfulLogin(user,email,password){
    clearFailedLogin(email);
    currentLoginPassword=password;sessionStorage.setItem(KEY_SESSION_PASSWORD,password);
    if (securitySettings().allowSavedAccounts&&document.getElementById('rememberLogin')?.checked) { localStorage.setItem(KEY_REMEMBER, JSON.stringify({ email, password })); rememberAccount(email,password); }
    else localStorage.removeItem(KEY_REMEMBER);
    state.user=normalizeUser({...user,sessionExpiresAt:Date.now()+securitySettings().sessionMinutes*60*1000});state.page=MANAGEMENT_ROLES.includes(state.user.role)?'dashboard':'spgHome';saveUser();render();
  }
  function promptVerificationCode(email,password){
    modalShell('Verifikasi Tambahan','Masukkan 6 angka dari aplikasi Authenticator.','<div class="form modal-form"><div class="field"><label>Kode Verifikasi</label><input id="loginVerificationCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"></div><div class="notice info"><b>Kode berganti setiap beberapa detik.</b><small>Jika kode hampir berganti, tunggu kode berikutnya lalu coba kembali.</small></div></div>','<button class="btn ghost" data-modal-close>Batal</button><button class="btn primary" id="verifyLoginBtn">Verifikasi & Masuk</button>',()=>{
      const submit=async()=>{const code=val('loginVerificationCode').replace(/\D/g,'');if(code.length!==6)return toast('Masukkan 6 angka verifikasi.');const button=document.getElementById('verifyLoginBtn');if(button){button.disabled=true;button.textContent='Memeriksa…';}try{const result=await window.ExtraJossBackend.login(email,password,code);state.data=normalizeData(result.data||{});localStorage.setItem(KEY_DATA,JSON.stringify(state.data));closeModal();finishSuccessfulLogin(normalizeUser(result.user||{}),email,password);}catch(error){toast(error.message);if(button){button.disabled=false;button.textContent='Verifikasi & Masuk';}}};
      document.getElementById('verifyLoginBtn')?.addEventListener('click',submit);document.getElementById('loginVerificationCode')?.addEventListener('keydown',event=>{if(event.key==='Enter')submit();});setTimeout(()=>document.getElementById('loginVerificationCode')?.focus(),50);
    });
  }
  async function login() {
    const email = val('loginEmail').trim().toLowerCase(); const password = val('loginPassword');
    const attempt=loginAttemptInfo(email);if(Number(attempt.blockedUntil||0)>Date.now())return toast('Login ditunda 5 menit karena terlalu banyak percobaan.');
    let user=null;
    if(useSharedServer()){
      const button=document.getElementById('loginBtn');if(button){button.disabled=true;button.textContent='Menghubungkan akun…';}
      try{
        const result=await window.ExtraJossBackend.login(email,password);
        state.data=normalizeData(result.data||{});
        user=normalizeUser(result.user||{});
        localStorage.setItem(KEY_DATA,JSON.stringify(state.data));
      }catch(error){
        if(button){button.disabled=false;button.textContent='Login';}
        if(error.mfaRequired)return promptVerificationCode(email,password);
        recordFailedLogin(email);toast(`Login server belum berhasil: ${error.message}`);
        return;
      }
    }else{
      user = state.data.users.find(u => u.email.toLowerCase() === email && u.password === password && u.status !== 'Nonaktif');
      if (!user) {const failed=recordFailedLogin(email);return toast(failed.blockedUntil>Date.now()?'Login ditunda 5 menit karena terlalu banyak percobaan.':'Login gagal. Cek email dan password.');}
    }
    finishSuccessfulLogin(user,email,password);
  }
  async function logout() {
    if(state.routeWatchId&&navigator.geolocation)navigator.geolocation.clearWatch(state.routeWatchId);state.routeWatchId=null;
    try{if(window.ExtraJossBackend?.hasToken?.())await window.ExtraJossBackend.logout();}catch{}finally{currentLoginPassword='';sessionStorage.removeItem(KEY_SESSION_PASSWORD);state.user=null;localStorage.removeItem(KEY_USER);window.ExtraJossBackend?.clear?.();state.page='dashboard';cleanupMaps();renderLogin();}
  }

  // Global navigation handler dibuat di capture phase agar menu tetap bisa diklik stabil
  // walaupun halaman sedang render ulang, tabel panjang, atau dibuka lewat file/localhost.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-page]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    goPage(btn.dataset.page);
  }, true);
  window.webMapsSpgGoPage = goPage;


  // ROUTE TRACKING UPGRADE: rekam jalur otomatis SPG, jalur pernah dilewati, playback admin, cluster marker, area boundary, dan validasi form.
  // Catatan: Browser tetap akan meminta izin lokasi. Setelah izin diberikan, jalur akan tersimpan otomatis di localStorage selama tab web terbuka.
  function normalizeData(data) {
    data.users = Array.isArray(data.users) ? data.users.map(normalizeUser) : [];
    const adminEmail = 'admin@webmapsspg.local';
    const legacyAdmin = data.users.find(user=>user.email===adminEmail);
    if (legacyAdmin) Object.assign(legacyAdmin,{id:legacyAdmin.id||'u-admin-1',role:'ADMIN',name:'Admin',email:adminEmail,allAreas:true,areas:[],area:'All Area',status:'Aktif'});
    else data.users.unshift(normalizeUser({id:'u-admin-1',role:'ADMIN',name:'Admin',email:adminEmail,password:'admin123',allAreas:true,area:'All Area',status:'Aktif'}));
    data.seedMode = data.seedMode === 'demo' ? 'demo' : 'clean';
    data.settings = data.settings || {};
    data.areas = Array.isArray(data.areas) ? data.areas.map((a, idx) => ({
      id: a.id || uid('a'),
      name: cleanAreaDisplayName(a.name || a.area) || `Area ${idx + 1}`,
      city: a.city || cleanAreaDisplayName(a.name || a.area) || `Area ${idx + 1}`,
      target: Number(a.target || 0),
      color: a.color || routeColors[idx % routeColors.length]
    })) : [];
    const areaNames=data.areas.map(area=>area.name);
    data.users=data.users.map(user=>{
      if(!['SCO','MS','AM'].includes(user.role))return user;
      const selected=[...(Array.isArray(user.areas)?user.areas:[]),user.area].filter(area=>areaNames.includes(area));
      const assigned=[...new Set(selected)];
      const safe=assigned.length?assigned:(areaNames[0]?[areaNames[0]]:[]);
      return normalizeUser({...user,allAreas:false,areas:safe,area:safe[0]||''});
    });
    data.outlets = Array.isArray(data.outlets) ? data.outlets.map((o) => normalizeOutlet(o)) : [];
    data.placementLocations = Array.isArray(data.placementLocations) ? data.placementLocations.map(normalizePlacementLocation) : clone(window.WEB_MAPS_SPG_SEED?.placementLocations || []).map(normalizePlacementLocation);
    data.spgAssignments = Array.isArray(data.spgAssignments) ? data.spgAssignments.map(normalizeAssignment) : clone(window.WEB_MAPS_SPG_SEED?.spgAssignments || []).map(normalizeAssignment);
    data.routes = Array.isArray(data.routes) ? data.routes.map(normalizeRoute) : [];
    // Supaya demo langsung terlihat, buat jalur contoh dari data outlet lama bila routes masih kosong.
    if (!data.routes.length && data.outlets.length) data.routes = routesFromOutlets(data.outlets);
    data.spgCandidates = Array.isArray(data.spgCandidates) ? data.spgCandidates : [];
    data.reportingConfig = data.reportingConfig || {};
    data.settings.hargaPerPcs=Math.max(0,Number(data.settings.hargaPerPcs||4000));
    data.reportingConfig.defaultSellingPrice=data.settings.hargaPerPcs;
    data.reportingConfig.focusAreas = Array.isArray(data.reportingConfig.focusAreas) ? [...new Set(data.reportingConfig.focusAreas.map(cleanAreaDisplayName).filter(name=>data.areas.some(area=>area.name===name)))] : [];
    normalizeAreaReferences(data);
    data.workShifts = Array.isArray(data.workShifts) ? data.workShifts.map(shift => ({
      id:shift.id || uid('shift'), userId:shift.userId || '', userName:shift.userName || '', area:shift.area || '', date:shift.date || dateOnly(shift.startedAt || nowIso()),
      startedAt:shift.startedAt || nowIso(), endedAt:shift.endedAt || '', status:shift.status === 'Selesai' ? 'Selesai' : 'Aktif', startLocation:shift.startLocation || null, endLocation:shift.endLocation || null
    })) : [];
    data.offlineQueue = Array.isArray(data.offlineQueue) ? data.offlineQueue.slice(-200) : [];
    data.reportingLocks = Array.isArray(data.reportingLocks) ? data.reportingLocks.slice(0, 200) : [];
    data.settings.dataVariant = data.settings.dataVariant === 'demo' || data.seedMode === 'demo' ? 'demo' : 'clean';
    if(!data.settings.appName||['TL SPG Command Center AI','TL SPG Command Center','WEB MAPS SPG'].includes(data.settings.appName))data.settings.appName='Website Extra Joss SPG';
    data.settings.systemControl = normalizeSystemControl(data.settings.systemControl);
    data.settings.auditLog = Array.isArray(data.settings.auditLog) ? data.settings.auditLog.slice(0, 80) : [];
    data.settings.systemVersions = Array.isArray(data.settings.systemVersions) ? data.settings.systemVersions.slice(0, 10) : [];
    data.activityLog = Array.isArray(data.activityLog) ? data.activityLog.slice(0, 300) : [];
    if (window.ReportingSPG) window.ReportingSPG.normalizeData(data);
    return data;
  }

  function normalizePlacementLocation(location) {
    return {
      id: location.id || uid('loc'),
      name: location.name || 'Lokasi tanpa nama',
      area: cleanAreaDisplayName(location.area) || 'Banjarmasin',
      district: location.district || location.kecamatan || '',
      address: location.address || '',
      lat: Number(location.lat ?? location.latitude ?? -3.3194),
      lng: Number(location.lng ?? location.longitude ?? 114.5908),
      status: location.status || 'Aktif',
      notes: location.notes || '',
      createdAt: location.createdAt || location.created_at || nowIso(),
      updatedAt: location.updatedAt || location.updated_at || nowIso()
    };
  }

  function normalizeAssignment(assignment) {
    return {
      id: assignment.id || uid('asg'),
      date: assignment.date || assignment.assignment_date || today(),
      userId: assignment.userId || assignment.user_id || '',
      userName: assignment.userName || assignment.user_name || 'SPG',
      area: cleanAreaDisplayName(assignment.area) || '',
      locationId: assignment.locationId || assignment.location_id || '',
      status: assignment.status || 'Ditempatkan',
      assignedBy: assignment.assignedBy || assignment.assigned_by || 'TL/Admin',
      createdAt: assignment.createdAt || assignment.created_at || nowIso(),
      updatedAt: assignment.updatedAt || assignment.updated_at || nowIso()
    };
  }

  function placementLocations() {
    state.data.placementLocations = Array.isArray(state.data.placementLocations) ? state.data.placementLocations.map(normalizePlacementLocation) : [];
    return state.data.placementLocations;
  }

  function spgAssignments() {
    state.data.spgAssignments = Array.isArray(state.data.spgAssignments) ? state.data.spgAssignments.map(normalizeAssignment) : [];
    return state.data.spgAssignments;
  }

  function locationById(id) { return placementLocations().find(location => location.id === id); }
  function assignmentFor(userId, userName, date) {
    return spgAssignments().find(assignment => assignment.date === date && (assignment.userId === userId || assignment.userName === userName));
  }

  async function placementApi(action, payload = {}) {
    const response = await fetch('/api/placement-data', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-webmaps-role': state.user?.role || '' },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Data belum berhasil disimpan.');
    return result;
  }

  function mergeCloudRoutes(routePoints) {
    const grouped = groupBy(Array.isArray(routePoints) ? routePoints : [], point => point.route_key || `${point.user_id}|${dateOnly(point.recorded_at)}`);
    const cloudRoutes = Object.entries(grouped).map(([routeKey, points]) => {
      const first = points[0] || {};
      return normalizeRoute({
        id: `cloud-${routeKey}`,
        userId: first.user_id,
        userName: first.user_name,
        area: first.area,
        date: String(routeKey).split('|').pop() || dateOnly(first.recorded_at),
        startedAt: first.recorded_at,
        status: 'Aktif',
        points: points.map(point => ({ lat: point.latitude, lng: point.longitude, at: point.recorded_at, accuracy: point.accuracy }))
      });
    });
    cloudRoutes.forEach(cloudRoute => {
      const index = allRoutes().findIndex(route => route.userId === cloudRoute.userId && route.date === cloudRoute.date);
      if (index >= 0) {
        const mergedPoints = [...allRoutes()[index].points, ...cloudRoute.points];
        const unique = new Map(mergedPoints.map(point => [`${point.at}|${point.lat}|${point.lng}`, point]));
        allRoutes()[index].points = [...unique.values()].sort((a,b) => new Date(a.at)-new Date(b.at));
      } else state.data.routes.push(cloudRoute);
    });
  }

  async function refreshPlacementData(options = {}) {
    if (state.placementSyncing) return;
    state.placementSyncing = true;
    try {
      const response = await fetch('/api/placement-data', { cache: 'no-store' });
      if (!response.ok) throw new Error('Server penempatan belum siap.');
      const result = await response.json();
      state.data.placementLocations = (result.locations || []).map(normalizePlacementLocation);
      state.data.spgAssignments = (result.assignments || []).map(normalizeAssignment);
      mergeCloudRoutes(result.routePoints || []);
      save();
      if (options.render) renderPage();
    } catch (error) {
      if (options.notify) toast(error.message || 'Data online belum dapat diperbarui. Data lokal tetap bisa dipakai.');
    } finally {
      state.placementSyncing = false;
    }
  }

  function normalizeRoute(r) {
    return {
      id: r.id || uid('r'),
      userId: r.userId || r.user_id || '',
      userName: r.userName || r.user_name || r.spg || 'SPG',
      area: cleanAreaDisplayName(r.area) || '',
      date: r.date || dateOnly(r.startedAt || r.started_at || nowIso()),
      startedAt: r.startedAt || r.started_at || nowIso(),
      endedAt: r.endedAt || r.ended_at || '',
      status: r.status || 'Aktif',
      totalDistanceM: Number(r.totalDistanceM || r.total_distance_m || 0),
      points: Array.isArray(r.points) ? r.points.map(pt => ({ lat:Number(pt.lat), lng:Number(pt.lng), at:pt.at || pt.recorded_at || nowIso(), accuracy:Number(pt.accuracy || pt.accuracy_m || 0) })).filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lng)) : []
    };
  }

  function routesFromOutlets(rows) {
    const groups = groupBy(rows, o => `${o.markedById || o.markedBy}|${dateOnly(o.markedAt)}`);
    return Object.entries(groups).map(([key, list]) => {
      const sorted = list.slice().sort((a,b)=>new Date(a.markedAt)-new Date(b.markedAt));
      const first = sorted[0] || {};
      return normalizeRoute({
        id: uid('r-demo'),
        userId: first.markedById || '',
        userName: first.markedBy || 'SPG',
        area: first.area || '',
        date: dateOnly(first.markedAt),
        startedAt: first.markedAt,
        endedAt: sorted[sorted.length-1]?.markedAt || '',
        status: 'Demo',
        points: sorted.map(o => ({ lat:o.lat, lng:o.lng, at:o.markedAt, accuracy:o.accuracy || 0 }))
      });
    });
  }

  function allRoutes() {
    state.data.routes = Array.isArray(state.data.routes) ? state.data.routes.map(normalizeRoute) : [];
    return state.data.routes;
  }
  function ownRoutes() { return allRoutes().filter(r => r.userId === state.user?.id || r.userName === state.user?.name); }
  function routeDateMode() { return state.routeDateMode || 'Hari ini'; }
  function routeSpgFilter() { return state.routeSpgFilter || 'Semua'; }
  function setRouteDefaults() {
    if (!state.routeDateMode) state.routeDateMode = 'Hari ini';
    if (!state.routeSpgFilter) state.routeSpgFilter = 'Semua';
    if (state.showRouteOverlay === undefined) state.showRouteOverlay = true;
    if (state.clusterMarkers === undefined) state.clusterMarkers = true;
    if (state.showAreaBoundary === undefined) state.showAreaBoundary = true;
  }
  function filteredRoutes() {
    setRouteDefaults();
    let routes = isAdmin() ? allRoutes() : ownRoutes();
    if (isAdmin()) routes = scopedByArea(routes);
    if (isAdmin() && routeSpgFilter() !== 'Semua') routes = routes.filter(r => r.userName === routeSpgFilter());
    if (isAdmin() && state.routeAreaFilter && state.routeAreaFilter !== 'Semua') routes = routes.filter(r => r.area === state.routeAreaFilter);
    routes = filterRoutesByDate(routes, routeDateMode());
    return routes;
  }

  function assignmentsByRouteFilter() {
    let rows = isAdmin() ? scopedByArea(spgAssignments()) : spgAssignments();
    if (routeSpgFilter() !== 'Semua') rows = rows.filter(row => row.userName === routeSpgFilter());
    if (state.routeAreaFilter && state.routeAreaFilter !== 'Semua') rows = rows.filter(row => row.area === state.routeAreaFilter);
    return filterRoutesByDate(rows.map(row => ({ ...row, startedAt: `${row.date}T00:00:00` })), routeDateMode());
  }

  function monitoringRoutes() {
    const routes = filteredRoutes().slice();
    assignmentsByRouteFilter().forEach(assignment => {
      if (routes.some(route => route.date === assignment.date && (route.userId === assignment.userId || route.userName === assignment.userName))) return;
      routes.push(normalizeRoute({
        id:`assignment-${assignment.id}`,
        userId:assignment.userId,
        userName:assignment.userName,
        area:assignment.area,
        date:assignment.date,
        startedAt:`${assignment.date}T00:00:00`,
        status:'Belum ada GPS',
        points:[]
      }));
    });
    const statusFilter=state.routeLocationStatusFilter||'Semua';
    return statusFilter==='Semua'?routes:routes.filter(route=>{const status=placementDistanceStatus(routePlacementDistance(route));return status.label===statusFilter||status.code===statusFilter;});
  }

  function routeAssignment(route) { return assignmentFor(route.userId, route.userName, route.date); }
  function routePlacementDistance(route) {
    const assignment = routeAssignment(route), location = assignment && locationById(assignment.locationId);
    const points = (route.points || []).slice().sort((a,b)=>new Date(a.at)-new Date(b.at));
    const last = points[points.length - 1];
    if (!location || !last) return null;
    return Math.round(distanceMeters(last.lat, last.lng, location.lat, location.lng));
  }
  function placementDistanceStatus(distance) {
    const rules=locationStatusSettings();
    if (distance === null || distance === undefined) return { code:'noGps', label:rules.noGpsLabel, color:'gray' };
    if (distance <= rules.insideMeters) return { code:'inside', label:rules.insideLabel, color:'green' };
    if (distance <= rules.nearbyMeters) return { code:'nearby', label:rules.nearbyLabel, color:'yellow' };
    return { code:'outside', label:rules.outsideLabel, color:'red' };
  }
  function filterRoutesByDate(routes, mode) {
    if (!mode || mode === 'Semua') return routes;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    return routes.filter(r => {
      const d = new Date(r.date || r.startedAt || 0);
      if (Number.isNaN(d.getTime())) return false;
      if (mode === 'Hari ini') return d >= todayStart;
      if (mode === 'Kemarin') return d >= yesterdayStart && d < todayStart;
      if (mode === 'Minggu ini' || mode === '7 hari terakhir') return d >= weekStart;
      if (mode === 'Bulan ini') return d >= monthStart;
      return true;
    });
  }
  function routeAgeColor(dateText) {
    const d = new Date(dateText || 0);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const y = new Date(start); y.setDate(y.getDate()-1);
    const w = new Date(start); w.setDate(w.getDate()-6);
    if (!Number.isNaN(d.getTime())) {
      if (d >= start) return '#2563eb';       // Biru = hari ini
      if (d >= y && d < start) return '#16a34a'; // Hijau = kemarin
      if (d >= w) return '#8b5cf6';           // Ungu = minggu ini
    }
    return '#64748b';                         // Abu-abu = data lama
  }
  function routeColorLabel(dateText) {
    const c = routeAgeColor(dateText);
    if (c === '#2563eb') return 'Hari ini';
    if (c === '#16a34a') return 'Kemarin';
    if (c === '#8b5cf6') return 'Minggu ini';
    return 'Data lama';
  }
  function routeDistance(points) {
    let total = 0;
    for (let i=1;i<points.length;i++) total += distanceMeters(points[i-1].lat, points[i-1].lng, points[i].lat, points[i].lng);
    return Math.round(total);
  }
  function routeSummary(routes = filteredRoutes()) {
    const pts = routes.reduce((s,r)=>s + (r.points?.length || 0), 0);
    const dist = routes.reduce((s,r)=>s + routeDistance(r.points || []), 0);
    const active = routes.filter(r => r.status === 'Aktif').length;
    return { routes: routes.length, points: pts, distance: dist, active };
  }
  function formatMeters(m) { return Number(m || 0) >= 1000 ? `${(Number(m)/1000).toFixed(2)} km` : `${number(Math.round(Number(m||0)))} m`; }
  function queueOfflineAction(type,recordId,payload=null,force=false) {
    if(navigator.onLine&&!force)return;
    state.data.offlineQueue=Array.isArray(state.data.offlineQueue)?state.data.offlineQueue:[];
    state.data.offlineQueue.push({id:uid('queue'),type,recordId,userId:state.user?.id||'',createdAt:nowIso(),...(payload?{payload}: {})});
    state.data.offlineQueue=state.data.offlineQueue.slice(-200);
  }
  async function flushRoutePointQueue() {
    const backend=window.ExtraJossBackend,queue=state.data.offlineQueue||[];
    if(!navigator.onLine||!backend?.hasToken?.()||!backend?.routePoint)return;
    const keep=[];
    for(const item of queue){
      if(item.type!=='route-point'){keep.push(item);continue;}
      try{await backend.routePoint(item.payload||{});}catch{keep.push(item);}
    }
    state.data.offlineQueue=keep;localStorage.setItem(KEY_DATA,JSON.stringify(state.data));
  }
  function bindSpgHome() {
    if(fieldRules().enableRouteTracking)setTimeout(startAutoRouteTracking,120);
    document.getElementById('spgRefreshDataBtn')?.addEventListener('click',async()=>{
      try{const result=await window.ExtraJossBackend.pull();state.data=normalizeData(result.data||{});localStorage.setItem(KEY_DATA,JSON.stringify(state.data));toast('Data terbaru sudah tampil.');render();}
      catch(error){toast('Data belum dapat diperbarui: '+error.message);}
    });
    document.getElementById('reportSpgIssueBtn')?.addEventListener('click',openSpgIssueModal);
  }
  function currentRoute() {
    if (!state.user || state.user.role !== 'SPG') return null;
    const d = today();
    let r = allRoutes().find(x => x.userId === state.user.id && x.date === d && x.status === 'Aktif');
    if (!r) {
      r = normalizeRoute({ id: uid('r'), userId: state.user.id, userName: state.user.name, area: state.user.area, date: d, startedAt: nowIso(), status: 'Aktif', points: [] });
      state.data.routes.push(r); save();
    }
    return r;
  }
  function startAutoRouteTracking() {
    if (!state.user || state.user.role !== 'SPG' || state.routeWatchId || !navigator.geolocation) return;
    try {
      state.routeWatchId = navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const r = currentRoute(); if (!r) return;
        const last = r.points[r.points.length - 1];
        const moved = !last || distanceMeters(last.lat, last.lng, latitude, longitude) >= 12;
        const waited = !last || (new Date() - new Date(last.at)) >= 15000;
        // Simpan jika berpindah minimal 12 meter atau sudah 15 detik. Ini menjaga data tidak terlalu berat.
        if (moved || waited) {
          r.points.push({ lat:Number(latitude), lng:Number(longitude), at:nowIso(), accuracy:Number(accuracy || 0) });
          r.totalDistanceM = routeDistance(r.points);
          const payload={date:r.date,recordedAt:r.points[r.points.length-1].at,lat:Number(latitude),lng:Number(longitude),accuracy:Number(accuracy||0)};
          localStorage.setItem(KEY_DATA,JSON.stringify(state.data));
          if(navigator.onLine&&window.ExtraJossBackend?.hasToken?.()&&window.ExtraJossBackend?.routePoint){window.ExtraJossBackend.routePoint(payload).catch(()=>{queueOfflineAction('route-point',r.id,payload,true);localStorage.setItem(KEY_DATA,JSON.stringify(state.data));});}
          else {queueOfflineAction('route-point',r.id,payload,true);localStorage.setItem(KEY_DATA,JSON.stringify(state.data));}
          updateTrackingStatus();
          // Riwayat perjalanan hanya ditampilkan kepada TL. Peta SPG tidak
          // menggambar ulang seluruh riwayat agar tetap ringan di HP.
        }
      }, err => {
        state.routeError = err?.message || 'GPS belum diizinkan.';
        updateTrackingStatus();
      }, { enableHighAccuracy:true, maximumAge:8000, timeout:20000 });
      state.routeError = '';
      updateTrackingStatus();
    } catch (e) { state.routeError = e.message; updateTrackingStatus(); }
  }
  function stopAutoRouteTracking() {
    if (!state.user || state.user.role !== 'SPG') return;
    if (state.routeWatchId && navigator.geolocation) navigator.geolocation.clearWatch(state.routeWatchId);
    state.routeWatchId = null;
    const r = allRoutes().find(x => x.userId === state.user?.id && x.date === today() && x.status === 'Aktif'); if (r) { r.status = 'Selesai'; r.endedAt = nowIso(); r.totalDistanceM = routeDistance(r.points); save(); }
    updateTrackingStatus();
  }
  function updateTrackingStatus() {
    const box = document.getElementById('routeTrackingStatus');
    if (!box || state.user?.role !== 'SPG') return;
    const r = currentRoute(); const sum = routeSummary(ownRoutes().filter(x => x.date === today()));
    const gps = state.routeWatchId ? 'Aktif merekam' : 'Menunggu izin GPS';
    const secureWarn = (!window.isSecureContext && location.hostname !== 'localhost') ? '<div class="notice warn"><b>GPS butuh HTTPS/localhost.</b><small>Untuk deploy, buka dari Netlify HTTPS agar rekam jalur bisa aktif.</small></div>' : '';
    const error = state.routeError ? `<div class="notice warn"><b>GPS belum aktif.</b><small>${escapeHtml(state.routeError)}. Izinkan lokasi di browser agar jalur otomatis terekam.</small></div>` : '';
    box.innerHTML = `${secureWarn}${error}<div class="route-status-card"><div><b>${gps}</b><small>Selama tab web tidak ditutup, posisi disimpan otomatis dan dikirim ke data bersama saat online.</small></div><span class="badge blue">${number(sum.points)} titik</span><span class="badge purple">${formatMeters(sum.distance)}</span></div>`;
  }
  function autoSaveInfo() {
    return `<div class="notice good"><b>Simpan saat offline aktif.</b><small>Jika sinyal terputus, perubahan ditahan di perangkat lalu dikirim ke data bersama saat internet kembali.</small></div>`;
  }
  function routeLegendBlock() {
    return `<div class="route-color-legend"><div><span style="background:#2563eb"></span>Biru = Hari ini</div><div><span style="background:#16a34a"></span>Hijau = Kemarin</div><div><span style="background:#8b5cf6"></span>Ungu = Minggu ini</div><div><span style="background:#64748b"></span>Abu-abu = Data lama</div></div>`;
  }
  function routeControlsHtml() {
    const dateModes = ['Hari ini','Kemarin','Minggu ini','Bulan ini','Semua'];
    const monitor=isMonitorRole(),selectedArea=monitor?monitorSelectedArea():(state.routeAreaFilter||'Semua');
    if(monitor)state.routeAreaFilter=selectedArea;
    const permittedAreas=areas().filter(area=>canAccessArea(area.name)).map(area=>area.name);
    const spgNames=spgList().filter(spg=>selectedArea==='Semua'||spg.area===selectedArea).map(spg=>spg.name);
    const locationRules=locationStatusSettings(),statusOptions=['Semua',locationRules.insideLabel,locationRules.nearbyLabel,locationRules.outsideLabel,locationRules.noGpsLabel];
    if(!statusOptions.includes(state.routeLocationStatusFilter))state.routeLocationStatusFilter='Semua';
    return `<div class="route-controls"><h3>Jalur pernah dilewati</h3><small>Pilih periode untuk melihat jalur GPS yang terekam.</small><div class="form">
      ${selectField('Periode Jalur', 'routeDateMode', dateModes, routeDateMode())}
      ${selectField('Area', 'routeAreaMode', monitor?permittedAreas:['Semua',...permittedAreas], selectedArea)}
      ${selectField('SPG', 'routeSpgMode', ['Semua', ...spgNames], routeSpgFilter())}
      ${selectField('Status Posisi','routeLocationStatusMode',statusOptions,state.routeLocationStatusFilter||'Semua')}
      <label class="toggle-line"><input type="checkbox" id="toggleRouteOverlay" ${state.showRouteOverlay !== false ? 'checked' : ''}> Tampilkan jalur di maps</label>
      <label class="toggle-line"><input type="checkbox" id="toggleAreaBoundary" ${state.showAreaBoundary !== false ? 'checked' : ''}> Tampilkan batas area</label>
      <button class="btn primary" id="playbackRouteBtn">▶ Playback Jalur</button>
    </div>${routeLegendBlock()}<div id="routeStatsBox"></div></div>`;
  }
  function updateRouteStatsBox() {
    const box = document.getElementById('routeStatsBox'); if (!box) return;
    const routes = monitoringRoutes(); const s = routeSummary(routes);
    const top = routes.slice().sort((a,b)=>routeDistance(b.points)-routeDistance(a.points))[0];
    box.innerHTML = `<div class="stat-list route-stat-list">
      ${statLine('Jalur', number(s.routes), 'blue')}
      ${statLine('Titik GPS', number(s.points), 'purple')}
      ${statLine('Estimasi jarak', formatMeters(s.distance), 'green')}
      ${top ? statLine('Jalur terpanjang', `${top.userName} • ${formatMeters(routeDistance(top.points))}`, 'yellow') : ''}
    </div>`;
  }
  function bindRouteControls() {
    document.getElementById('routeDateMode')?.addEventListener('change', e => { state.routeDateMode = e.target.value; cleanupMaps(); renderPage(); });
    document.getElementById('routeAreaMode')?.addEventListener('change', e => { state.routeAreaFilter = e.target.value; cleanupMaps(); renderPage(); });
    document.getElementById('routeSpgMode')?.addEventListener('change', e => { state.routeSpgFilter = e.target.value; cleanupMaps(); renderPage(); });
    document.getElementById('routeLocationStatusMode')?.addEventListener('change',e=>{state.routeLocationStatusFilter=e.target.value;cleanupMaps();renderPage();});
    document.getElementById('toggleRouteOverlay')?.addEventListener('change', e => { state.showRouteOverlay = e.target.checked; cleanupMaps(); renderPage(); });
    document.getElementById('toggleClusterMarkers')?.addEventListener('change', e => { state.clusterMarkers = e.target.checked; cleanupMaps(); renderPage(); });
    document.getElementById('toggleAreaBoundary')?.addEventListener('change', e => { state.showAreaBoundary = e.target.checked; cleanupMaps(); renderPage(); });
    document.getElementById('playbackRouteBtn')?.addEventListener('click', () => playbackRoutes());
    updateRouteStatsBox();
  }
  function routePointsForMap(routes = filteredRoutes()) {
    return routes.flatMap(r => (r.points || []).map(p => ({...p, route:r})));
  }
  function drawRouteLayers(map, routes, admin=false) {
    if (!map || !leafletReady()) return;
    // Semua route layer diberi class pane default; redraw halaman akan bersih via cleanupMaps. Untuk update live, biarkan layer lama tidak bertambah terlalu banyak dengan render map hanya saat initial.
    routes.forEach(r => {
      const pts = (r.points || []).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng)).sort((a,b)=>new Date(a.at)-new Date(b.at));
      if (pts.length < 2) return;
      const color = routeAgeColor(r.date || pts[0].at);
      L.polyline(pts.map(p => [p.lat, p.lng]), { color, weight: admin ? 5 : 4, opacity: .72, dashArray: '', lineCap:'round', lineJoin:'round' }).addTo(map).bindPopup(`<b>${escapeHtml(r.userName)}</b><br>${escapeHtml(routeColorLabel(r.date))}<br>${formatMeters(routeDistance(pts))}<br>${number(pts.length)} titik GPS`);
      if (state.mapMode === 'detail') {
        const start = pts[0], end = pts[pts.length-1];
        L.circleMarker([start.lat,start.lng], { radius:5, color, fillColor:color, fillOpacity:.9 }).addTo(map).bindTooltip('Mulai jalur');
        L.circleMarker([end.lat,end.lng], { radius:6, color:'#0f172a', fillColor:color, fillOpacity:.95 }).addTo(map).bindTooltip('Titik terakhir');
      }
    });
  }
  function playbackRoutes() {
    if (!state.map || !leafletReady()) return toast('Maps belum siap.');
    const pts = routePointsForMap(filteredRoutes()).sort((a,b)=>new Date(a.at)-new Date(b.at));
    if (!pts.length) return toast('Belum ada titik jalur pada filter ini.');
    let idx = 0;
    const marker = L.marker([pts[0].lat, pts[0].lng], { icon: L.divIcon({ className:'', html:'<div class="play-marker">▶</div>', iconSize:[34,34], iconAnchor:[17,17] }) }).addTo(state.map);
    state.map.setView([pts[0].lat, pts[0].lng], Math.max(state.map.getZoom(), 15));
    const timer = setInterval(() => {
      idx++;
      if (idx >= pts.length) { clearInterval(timer); marker.bindPopup('Playback selesai').openPopup(); return; }
      marker.setLatLng([pts[idx].lat, pts[idx].lng]);
      if (idx % 5 === 0) state.map.panTo([pts[idx].lat, pts[idx].lng]);
    }, 650);
    toast(`Playback ${number(pts.length)} titik GPS dimulai.`);
  }
  function drawAreaBoundaries(map) {
    if (!map || !leafletReady() || state.showAreaBoundary === false) return;
    const presets = {
      Banjarmasin: [[-3.36,114.54],[-3.36,114.66],[-3.27,114.66],[-3.27,114.54]],
      Balikpapan: [[-1.33,116.78],[-1.33,116.91],[-1.20,116.91],[-1.20,116.78]],
      Samarinda: [[-0.56,117.08],[-0.56,117.20],[-0.44,117.20],[-0.44,117.08]],
      Palangkaraya: [[-2.27,113.84],[-2.27,114.00],[-2.12,114.00],[-2.12,113.84]]
    };
    areas().forEach((a, idx) => {
      const poly = presets[a.name] || null;
      if (!poly) return;
      const color = a.color || routeColors[idx % routeColors.length];
      L.polygon(poly, { color, weight:2, fillColor:color, fillOpacity:.05, dashArray:'6 8' }).addTo(map).bindTooltip(`Area ${a.name}`);
    });
  }
  function drawClustersOrMarkers(map, rows, admin=false) {
    if (!map || !leafletReady()) return;
    const valid = rows.filter(hasCoordinatePoint);
    if (state.clusterMarkers === false || valid.length < 12) {
      valid.forEach(o => addOutletMarker(map, o, admin));
      return;
    }
    const grid = groupBy(valid, o => `${Math.round(Number(o.lat)*120)}|${Math.round(Number(o.lng)*120)}`);
    Object.values(grid).forEach(group => {
      if (group.length === 1) return addOutletMarker(map, group[0], admin);
      const lat = group.reduce((s,o)=>s+Number(o.lat),0)/group.length;
      const lng = group.reduce((s,o)=>s+Number(o.lng),0)/group.length;
      const sold = group.reduce((s,o)=>s+Number(o.sold||0),0);
      const icon = L.divIcon({ className:'', html:`<div class="cluster-pin"><b>${group.length}</b><small>${number(sold)}</small></div>`, iconSize:[48,48], iconAnchor:[24,24] });
      const marker = L.marker([lat,lng], { icon }).addTo(map);
      marker.bindPopup(`<b>${group.length} outlet di sekitar sini</b><br>${number(sold)} kaleng terjual<br><hr>${group.slice(0,8).map(o=>`${escapeHtml(o.name)} • ${escapeHtml(o.markedBy)}`).join('<br>')}`);
    });
  }
  function addOutletMarker(map, o, admin=false) {
    const marker = L.marker([Number(o.lat), Number(o.lng)], { icon: markerIconFor(o.tanda, o.name) }).addTo(map);
    addPopup(map, marker, o, admin);
    if (state.showLabels) L.marker([Number(o.lat), Number(o.lng)], { icon: L.divIcon({ className: 'outlet-label', html: escapeHtml(o.name), iconSize: null }) }).addTo(map);
    if (state.mapMode === 'detail') L.circle([Number(o.lat), Number(o.lng)], { radius: 55, color: routeAgeColor(dateOnly(o.markedAt)), fillOpacity: 0.08, weight: 1 }).addTo(map);
  }
  function areaCenter(areaName) {
    const centers = {
      Banjarmasin: [-3.3194,114.5908], Balikpapan: [-1.2675,116.8289], Samarinda: [-0.5022,117.1536], Palangkaraya: [-2.2096,113.9167]
    };
    return centers[areaName] || [Number(state.data.settings.mapDefaultLat || -3.3194), Number(state.data.settings.mapDefaultLng || 114.5908)];
  }
  function mapLoading(el) {
    el.innerHTML = '<div class="map-loading fast-map-loading"><div class="spinner"></div><b>Menyiapkan maps...</b><small>Jika peta belum tampil, cek internet. Maps memakai tile ringan seperti DPWCC Sponsor.</small></div>';
  }
  function addFastTileLayer(map) {
    if (!map || !window.L) return null;
    const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      maxNativeZoom: 19,
      minZoom: 4,
      attribution: '&copy; OpenStreetMap contributors',
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 1,
      detectRetina: false,
      errorTileUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"></svg>')
    }).addTo(map);
    layer.on('tileerror', () => { state.mapTileError = true; });
    layer.on('load', () => requestAnimationFrame(() => map.invalidateSize(false)));
    return layer;
  }

  function spgTodayTasksHtml(rows=ownOutlets()) {
    const assignment=assignmentFor(state.user?.id,state.user?.name,today());
    const location=assignment&&locationById(assignment.locationId);
    const todayRows=todayOutlets(rows),missingPhoto=todayRows.filter(outlet=>!outlet.photo).length;
    const target=Math.max(0,Number(state.data.settings.targetHarian||96));
    const sold=todayRows.reduce((sum,outlet)=>sum+Number(outlet.sold||0),0);
    return `<section class="card spg-today-card"><div class="daily-table-toolbar"><div><span class="badge blue">NOTIFIKASI PENEMPATAN • TUGAS HARI INI</span><h3>${location?escapeHtml(location.name):'Penempatan belum tersedia'}</h3><small><b>Tanggal:</b> ${escapeHtml(formatDate(today()))}${location?` • <b>Area:</b> ${escapeHtml(assignment.area)}`:''}</small><p>${location?`<b>Alamat:</b> ${escapeHtml(location.address||'Alamat belum diisi')}`:'Hubungi TL bila lokasi kerja belum ditentukan.'}</p></div><div class="btn-row">${location?`<a class="btn soft" target="_blank" rel="noopener" href="${googleDirectionUrl(location.lat,location.lng)}">Petunjuk Arah</a>`:''}<button class="btn primary" id="reportSpgIssueBtn">Laporkan Kendala</button></div></div><div class="spg-task-grid"><div><span>Outlet dicatat</span><b>${number(todayRows.length)}</b></div><div><span>Kaleng terjual</span><b>${number(sold)} / ${number(target)}</b></div><div><span>Foto belum lengkap</span><b class="${missingPhoto?'text-red':'text-green'}">${number(missingPhoto)}</b></div></div></section>`;
  }
  function openSpgIssueModal(){
    const assignment=assignmentFor(state.user?.id,state.user?.name,today()),location=assignment&&locationById(assignment.locationId);
    modalShell('Laporkan Kendala ke TL','Keterangan toko sudah diisi otomatis. Pilih masalah lalu kirim melalui WhatsApp.',`<div class="form modal-form"><div class="notice info"><b>${escapeHtml(location?.name||'Penempatan belum tersedia')}</b><small>${escapeHtml(location?.address||assignment?.area||'Alamat belum diisi')} • ${escapeHtml(formatDate(today()))}</small></div><div class="field"><label>Jenis Masalah</label><select id="spgIssueType"><option>Stok</option><option>Toko tutup</option><option>Penolakan outlet</option><option>Foto sulit dikirim</option><option>GPS bermasalah</option><option>Jadwal atau penempatan</option><option>Lainnya</option></select></div><div class="field"><label>Keterangan</label><textarea id="spgIssueNotes" placeholder="Tulis singkat masalah yang perlu dibantu"></textarea></div></div>`,'<button class="btn ghost" data-modal-close>Batal</button><button class="btn green" id="sendSpgIssueWhatsappBtn">Buka WhatsApp TL</button>',()=>{
      document.getElementById('sendSpgIssueWhatsappBtn')?.addEventListener('click',()=>{
        const phone=String(contentSetting('helpPhone','087805435987')).replace(/\D/g,'').replace(/^0/,'62');
        const maps=location?googleUrl(location.lat,location.lng):'-';
        const message=[`Halo ${contentSetting('helpName','Solehudin - Team Leader')},`,`Saya ${state.user?.name||'SPG'} ingin melaporkan kendala.`,`Tanggal: ${formatDate(today())}`,`Toko: ${location?.name||'Belum ada penempatan'}`,`Area: ${assignment?.area||state.user?.area||'-'}`,`Alamat: ${location?.address||'-'}`,`Masalah: ${val('spgIssueType')}`,`Keterangan: ${val('spgIssueNotes').trim()||'-'}`,`Petunjuk toko: ${maps}`].join('\n');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,'_blank','noopener');
      });
    });
  }
  function spgDataStatusHtml() {
    const pending=(state.data.offlineQueue||[]).filter(item=>item.userId===state.user?.id).length;
    const online=navigator.onLine,connected=Boolean(window.ExtraJossBackend?.hasToken?.());
    const label=!online?'Menunggu internet':state.sharedSaveError?'Belum terkirim':connected?'Tersimpan bersama':'Tersimpan di perangkat';
    const color=!online||state.sharedSaveError?'yellow':connected?'green':'blue';
    const updated=state.data.updatedAt?formatDateTime(state.data.updatedAt):'baru saja';
    return `<section class="card spg-sync-card"><div><span class="badge ${color}">${escapeHtml(label)}</span><h3>Status penyimpanan</h3><p>${online?'Internet aktif.':'Internet sedang terputus.'} ${pending?`${number(pending)} perubahan menunggu dikirim.`:'Tidak ada perubahan yang tertinggal.'}</p><small>Terakhir diperbarui: ${escapeHtml(updated)}</small></div><button class="btn soft" id="spgRefreshDataBtn" ${connected&&online?'':'disabled'}>Perbarui</button></section>`;
  }
  function correctionMinutesLeft(outlet) {
    const age=Date.now()-new Date(outlet?.markedAt||0).getTime();
    return Math.max(0,Math.ceil(SPG_CORRECTION_MINUTES-age/60000));
  }
  function canSpgCorrectOutlet(outlet) {
    return state.user?.role==='SPG'&&(outlet.markedById===state.user.id||outlet.markedBy===state.user.name)&&correctionMinutesLeft(outlet)>0;
  }

  function spgHome() {
    const rows = ownOutlets(); const m = metrics(rows); const todayRows = todayOutlets(rows); const rules=fieldRules();
    return `
      ${pageHead('Beranda SPG', 'Lihat penempatan hari ini, catat outlet, dan laporkan kendala dengan mudah.', '<button class="btn primary big-action" data-page-jump="spgAdd">+ Tandai Outlet Sekarang</button>')}
      ${locationPrivacyNotice()}
      ${spgTodayTasksHtml(rows)}
      ${spgDataStatusHtml()}
      ${beginnerGuideHtml()}
      ${spgDailySummaryHtml(rows)}
      <div class="grid cols-4" style="margin-top:18px">
        ${kpiCard('Outlet Kamu', number(m.outlets), state.user.area, '📍')}
        ${kpiCard('Kaleng Terjual', number(m.sold), 'dari outlet kamu', '📦')}
        ${kpiCard('Ditandai Hari Ini', number(todayRows.length), 'outlet hari ini', '🗓️')}
        ${kpiCard('Foto Hari Ini', `${number(todayRows.filter(o=>o.photo).length)}/${number(todayRows.length)}`, 'bukti outlet', '📷')}
      </div>
      ${rules.showReportHistory?`<div class="card" style="margin-top:18px"><h3>Outlet terbaru kamu</h3>${outletCards(rows.slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0,3))}</div>`:''}`;
  }

  function spgAdd() {
    const rules=fieldRules();
    return `
      ${pageHead('Tambah Outlet dari Maps', `${rules.requireOutletGps?'Pilih titik GPS yang benar.':'Titik GPS tidak wajib, tetapi tetap disarankan.'} ${rules.enableOfflineDraft?'Form tersimpan sementara saat kamu mengetik.':'Form tidak disimpan sementara.'}`, '<button class="btn soft" id="toggleLabelsBtn">Nama Outlet: Sembunyi</button><button class="btn primary" id="saveSpgOutletBtn">Simpan Outlet</button>')}
      ${locationPrivacyNotice()}
      ${beginnerGuideHtml()}
      <div class="spg-map-layout upgraded-map-layout">
        <div class="map-left-stack">
          <div class="quick-add-card card"><h3>Tambah Outlet Cepat</h3><p class="muted">Tekan tombol ini. Sistem ambil lokasi kamu, lalu kamu tinggal isi form outlet.</p><button class="btn primary big-action" id="quickAddOutletBtn">+ Tandai Outlet Sekarang</button></div>
          <div class="map-box big improved-map"><div id="spgMap"></div></div>
        </div>
        <div class="card"><h3>Form outlet</h3><div class="form">
          <div class="btn-row"><button class="btn soft" id="locateMeBtn">📍 Gunakan Lokasi Saya</button><button class="btn ghost" id="clearPointBtn">Reset Titik</button>${rules.enableOfflineDraft?'<button class="btn yellow" id="clearDraftBtn">Hapus Draft</button>':''}</div>
          <div class="point-preview" id="spgPointText">Koordinat belum dipilih. Klik peta atau pilih lokasi saya.</div>
          <div class="autosave-line"><span>${rules.enableOfflineDraft?'Simpan sementara aktif':'Simpan sementara tidak aktif'}</span><small id="autosaveHint">${rules.enableOfflineDraft?'Form akan tersimpan otomatis saat kamu mengetik.':'Simpan outlet sebelum meninggalkan halaman.'}</small></div>
          <h4>Checklist sebelum simpan</h4>
          <div id="validationChecklist" class="validation-list"></div>
          ${field('Nama Outlet *', 'spgOutletName', 'text', 'Contoh: Toko Berkah')}
          ${selectField('Tanda Outlet *', 'spgOutletTanda', tandaOptions)}
          ${selectField('Area *', 'spgOutletArea', areas().map(a => a.name), state.user.area)}
          ${field('Terjual / Kaleng *', 'spgOutletSold', 'number', 'Contoh: 12')}
          <div id="duplicateWarningBox"></div>
          <div id="accuracyWarningBox"></div>
          <div class="field"><label>Foto Outlet ${rules.requireOutletPhoto?'*':'(Disarankan)'}</label><input id="spgOutletPhoto" type="file" accept="image/*" capture="environment" /><small class="muted">${rules.requireOutletPhoto?'Foto wajib sesuai aturan Admin/TL.':'Foto tidak wajib, tetapi membantu TL memeriksa kunjungan.'} Ukuran foto diperkecil otomatis, terutama saat jaringan lemah.</small></div>
          <div id="photoPreview" class="photo-preview empty-photo">Belum ada foto</div>
          ${renderCustomFieldInputs('outlet',{},'outletCreate')}
          <details class="optional-fields"><summary>Isian tambahan (opsional)</summary><div class="form optional-fields-body">${field('No Telp Outlet/Konsumen', 'spgOutletPhone', 'text', '08xxxxxxxxxx')}<div class="field"><label>Catatan</label><textarea id="spgOutletNotes" placeholder="Catatan singkat jika perlu"></textarea></div></div></details>
          <button class="btn primary" id="saveSpgOutletBtn2">Simpan Outlet</button>
        </div></div>
      </div>
      ${rules.showReportHistory?`<div class="card" style="margin-top:18px"><h3>Outlet kamu yang sudah ditandai</h3>${outletTable(ownOutlets().slice().sort((a,b)=>new Date(b.markedAt)-new Date(a.markedAt)).slice(0,10), false)}</div>`:''}`;
  }

  function locationSelectOptions(selectedId = '') {
    const rows = placementLocations().filter(location => location.status === 'Aktif');
    return `<select id="assignmentLocation">${rows.map(location => `<option value="${escapeAttr(location.id)}" ${location.id === selectedId ? 'selected' : ''}>${escapeHtml(location.name)} — ${escapeHtml(location.area)}</option>`).join('')}</select>`;
  }

  function adminLocationMaster() {
    const rows = placementLocations().slice().sort((a,b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name));
    return `
      ${pageHead('Master Lokasi Penempatan', 'Tambahkan grosir/toko yang menjadi lokasi stay SPG. Koordinat ini menjadi titik acuan jarak pada Monitoring Jalur SPG.', '<button class="btn primary" id="savePlacementLocationBtn">+ Simpan Lokasi</button>')}
      <div class="grid placement-master-grid">
        <div class="card"><h3>Data grosir/toko</h3><p class="muted">Isi nama, area, alamat, lalu pilih titik pada peta atau masukkan koordinat.</p><div class="form two">
          ${field('Nama Grosir/Toko *', 'placementLocationName', 'text', 'Contoh: Toko Yudi')}
          ${selectField('Area *', 'placementLocationArea', areas().map(area => area.name), 'Banjarmasin')}
          ${field('Kecamatan *', 'placementLocationDistrict', 'text', 'Contoh: Banjarmasin Utara')}
          <div class="field placement-full"><label>Alamat</label><textarea id="placementLocationAddress" placeholder="Alamat lengkap grosir/toko"></textarea></div>
          ${field('Latitude *', 'placementLocationLat', 'number', '-3.3037015')}
          ${field('Longitude *', 'placementLocationLng', 'number', '114.5873061')}
          <div class="field placement-full"><label>Catatan</label><textarea id="placementLocationNotes" placeholder="Patokan lokasi atau catatan untuk TL"></textarea></div>
        </div><div class="btn-row" style="margin-top:12px"><button class="btn soft" id="useYudiCoordinateBtn">Pakai contoh Toko Yudi</button><button class="btn ghost" id="openLocationPreviewBtn">Buka titik di Google Maps</button></div></div>
        <div class="card placement-map-card"><div class="btn-row" style="justify-content:space-between"><div><h3>Pilih titik lokasi</h3><small>Klik peta untuk mengisi koordinat secara otomatis.</small></div><span class="badge blue">Acuan TL</span></div><div class="placement-picker-map"><div id="placementLocationMap"></div></div><div id="placementCoordinateSummary" class="point-preview">Belum ada titik yang dipilih.</div></div>
      </div>
      <div class="grid cols-3" style="margin-top:18px">${kpiCard('Total Lokasi', number(rows.length), 'grosir/toko tersimpan', '📌')}${kpiCard('Area Terisi', number(new Set(rows.map(row=>row.area)).size), 'area memiliki lokasi', '🗺️')}${kpiCard('Lokasi Aktif', number(rows.filter(row=>row.status==='Aktif').length), 'siap dipilih', '✅')}</div>
      <div class="card" style="margin-top:18px"><h3>Daftar lokasi penempatan</h3><small>Lokasi ini akan muncul sebagai pilihan saat TL membuat penempatan SPG harian dan Reporting.</small>${rows.length ? table(['Grosir/Toko','Area','Kecamatan','Alamat','Koordinat','Status','Maps','Aksi'], rows.map(location => [
        `<b>${escapeHtml(location.name)}</b>`, escapeHtml(location.area), escapeHtml(location.district || '-'), escapeHtml(location.address || '-'), `${Number(location.lat).toFixed(6)}, ${Number(location.lng).toFixed(6)}`, badge(location.status, location.status === 'Aktif' ? 'green' : 'gray'), `<a target="_blank" href="${googleUrl(location.lat,location.lng)}">Buka Maps</a>`, `<div class="btn-row compact-actions"><button class="btn soft mini" data-edit-placement-location="${location.id}">Edit</button><button class="btn red mini" data-delete-placement-location="${location.id}">Hapus</button></div>`
      ])) : '<div class="empty">Belum ada lokasi penempatan.</div>'}</div>`;
  }

  function adminDailyPlacement() {
    const date = state.assignmentDate || today();
    const rows = spgAssignments().filter(assignment => assignment.date === date).sort((a,b)=>a.area.localeCompare(b.area) || a.userName.localeCompare(b.userName));
    const availableLocations = placementLocations().filter(location => location.status === 'Aktif');
    const base=new Date(`${date}T00:00:00`),week=Array.from({length:7},(_,index)=>{const day=new Date(base);day.setDate(day.getDate()+index-3);const key=day.toISOString().slice(0,10);return {key,label:day.toLocaleDateString('id-ID',{weekday:'short',day:'2-digit',month:'short'}),count:spgAssignments().filter(row=>row.date===key).length};});
    const conflicts=Object.values(groupBy(rows,row=>row.userId||row.userName)).filter(group=>group.length>1);
    const teams=Object.fromEntries(Object.entries(groupBy(rows,row=>row.locationId)).map(([key,group])=>[key,group.length]));
    return `
      ${pageHead('Penempatan SPG Harian', 'Pilih SPG dan grosir/toko tempat mereka stay pada tanggal tertentu. Daftar lokasi berasal dari Master Lokasi Penempatan.', '<button class="btn primary" id="saveDailyPlacementBtn">Simpan Penempatan</button>')}
      <div class="grid cols-2">
        <div class="card"><h3>Tentukan penempatan</h3><div class="form">
          ${field('Tanggal Penempatan *', 'assignmentDateInput', 'date', '', date)}
          <div class="field"><label>SPG *</label><select id="assignmentSpg">${spgList().filter(spg=>spg.status==='Aktif').map(spg=>`<option value="${escapeAttr(spg.id)}">${escapeHtml(spg.name)} — ${escapeHtml(spg.area)}</option>`).join('')}</select></div>
          <div class="field"><label>Grosir/Toko *</label>${locationSelectOptions()}</div>
          <div id="assignmentLocationInfo" class="assignment-location-info"></div>
          <button class="btn primary" id="saveDailyPlacementBtn2" ${availableLocations.length ? '' : 'disabled'}>Simpan Penempatan SPG</button>
        </div></div>
        <div class="card"><h3>Alur penggunaan</h3><div class="stat-list">${statLine('1. Master lokasi', 'TL menyimpan grosir/toko dan koordinatnya.', 'blue')}${statLine('2. Pilih penempatan', 'TL memilih tanggal, SPG, dan lokasi stay.', 'purple')}${statLine('3. Monitoring jarak', 'Posisi GPS dibandingkan dengan titik lokasi tugas.', 'green')}${statLine('4. Export per area', 'Laporan monitoring dapat diunduh dalam PDF.', 'yellow')}</div></div>
      </div>
      <div class="card placement-week-card" style="margin-top:18px"><div class="daily-table-toolbar"><div><h3>Penempatan 7 Hari</h3><small>Klik tanggal untuk melihat jadwal. Dua SPG di satu outlet diperbolehkan dan ditandai sebagai tim.</small></div>${conflicts.length?badge(`${conflicts.length} jadwal SPG bentrok`,'red'):badge('Tidak ada jadwal SPG bentrok','green')}</div><div class="placement-week-grid">${week.map(day=>`<button class="${day.key===date?'active':''}" data-placement-date="${day.key}"><span>${escapeHtml(day.label)}</span><b>${number(day.count)} SPG</b></button>`).join('')}</div>${conflicts.length?`<div class="notice warning"><b>Jadwal perlu dicek</b><small>${escapeHtml(conflicts.map(group=>`${group[0].userName} memiliki ${group.length} penempatan pada ${date}`).join('; '))}. Penempatan beberapa SPG pada toko yang sama bukan bentrok.</small></div>`:''}</div>
      <div class="grid cols-3" style="margin-top:18px">${kpiCard('SPG Ditempatkan', number(rows.length), date, '👥')}${kpiCard('Lokasi Digunakan', number(new Set(rows.map(row=>row.locationId)).size), 'pada tanggal dipilih', '🏪')}${kpiCard('Belum Ditempatkan', number(Math.max(0, spgList().filter(spg=>spg.status==='Aktif').length - rows.length)), 'SPG aktif', '⏳')}</div>
      <div class="card" style="margin-top:18px"><div class="btn-row" style="justify-content:space-between"><div><h3>Daftar penempatan ${escapeHtml(date)}</h3><small>Tabel terpisah untuk melihat SPG hari ini ditempatkan di mana.</small></div><button class="btn soft" data-page-jump="routeMonitor">Buka Monitoring Jalur SPG</button></div>${rows.length ? table(['Tanggal','SPG','Area','Grosir/Toko','Alamat','Status','Aksi'], rows.map(assignment => {
        const location = locationById(assignment.locationId);
        const teamCount=teams[assignment.locationId]||1;
        return [assignment.date, `<b>${escapeHtml(assignment.userName)}</b>`, escapeHtml(assignment.area), `${escapeHtml(location?.name || 'Lokasi tidak ditemukan')}${teamCount>1?`<small class="table-subline">Tim ${teamCount} SPG • diizinkan</small>`:''}`, escapeHtml(location?.address || '-'), badge(assignment.status, 'green'), `<button class="btn red mini" data-delete-daily-assignment="${assignment.id}">Hapus</button>`];
      })) : '<div class="empty">Belum ada penempatan SPG pada tanggal ini.</div>'}</div>`;
  }

  function setPlacementPickerPoint(lat, lng) {
    state.placementPickerPoint = { lat:Number(lat), lng:Number(lng) };
    const latInput = document.getElementById('placementLocationLat');
    const lngInput = document.getElementById('placementLocationLng');
    if (latInput) latInput.value = Number(lat).toFixed(7);
    if (lngInput) lngInput.value = Number(lng).toFixed(7);
    if (state.placementPickerMap && window.L) {
      try { state.placementPickerMarker?.remove(); } catch {}
      state.placementPickerMarker = L.marker([Number(lat), Number(lng)]).addTo(state.placementPickerMap).bindPopup('Titik lokasi penempatan').openPopup();
      state.placementPickerMap.setView([Number(lat), Number(lng)], 16);
    }
    const summary = document.getElementById('placementCoordinateSummary');
    if (summary) summary.innerHTML = `<b>Koordinat dipilih:</b> ${Number(lat).toFixed(7)}, ${Number(lng).toFixed(7)}`;
  }

  function initPlacementLocationMap() {
    const el = document.getElementById('placementLocationMap');
    if (!el || !leafletReady()) return;
    try { state.placementPickerMap?.remove(); } catch {}
    const center = state.placementPickerPoint ? [state.placementPickerPoint.lat, state.placementPickerPoint.lng] : areaCenter(val('placementLocationArea') || 'Banjarmasin');
    state.placementPickerMap = L.map(el, { zoomControl:true, preferCanvas:true, zoomAnimation:false, fadeAnimation:false }).setView(center, 14);
    addFastTileLayer(state.placementPickerMap);
    state.placementPickerMap.on('click', event => setPlacementPickerPoint(event.latlng.lat, event.latlng.lng));
    if (state.placementPickerPoint) setPlacementPickerPoint(state.placementPickerPoint.lat, state.placementPickerPoint.lng);
    requestAnimationFrame(() => state.placementPickerMap?.invalidateSize?.(false));
  }

  function fillPlacementLocationForm(location) {
    state.editingPlacementLocationId = location.id;
    const values = { placementLocationName:location.name, placementLocationArea:location.area, placementLocationDistrict:location.district, placementLocationAddress:location.address, placementLocationLat:location.lat, placementLocationLng:location.lng, placementLocationNotes:location.notes };
    Object.entries(values).forEach(([id,value]) => { const input=document.getElementById(id); if (input) input.value=value; });
    setPlacementPickerPoint(location.lat, location.lng);
    document.getElementById('placementLocationName')?.focus();
  }

  function bindLocationMaster() {
    setTimeout(initPlacementLocationMap, 40);
    document.getElementById('useYudiCoordinateBtn')?.addEventListener('click', () => {
      const name = document.getElementById('placementLocationName'); if (name && !name.value) name.value = 'Toko Yudi';
      const district = document.getElementById('placementLocationDistrict'); if (district && !district.value) district.value = 'Banjarmasin Utara';
      const address = document.getElementById('placementLocationAddress'); if (address && !address.value) address.value = 'Jl. Antasan Kecil Timur, Sungai Miai, Kec. Banjarmasin Utara, Kota Banjarmasin, Kalimantan Selatan 70123';
      setPlacementPickerPoint(-3.3037015, 114.5873061);
    });
    document.getElementById('openLocationPreviewBtn')?.addEventListener('click', () => {
      const lat=Number(val('placementLocationLat')), lng=Number(val('placementLocationLng'));
      if (!Number.isFinite(lat)||!Number.isFinite(lng)) return toast('Isi koordinat lebih dulu.');
      window.open(googleUrl(lat,lng), '_blank');
    });
    const saveLocation = async () => {
      const name=val('placementLocationName').trim(), area=val('placementLocationArea'), district=val('placementLocationDistrict').trim(), lat=Number(val('placementLocationLat')), lng=Number(val('placementLocationLng'));
      if (!name || !area || !district || !Number.isFinite(lat) || !Number.isFinite(lng)) return toast('Nama, area, kecamatan, latitude, dan longitude wajib diisi.');
      const id = state.editingPlacementLocationId || uid('loc');
      const record = normalizePlacementLocation({ id, name, area, district, address:val('placementLocationAddress').trim(), lat, lng, notes:val('placementLocationNotes').trim(), status:'Aktif' });
      const index=placementLocations().findIndex(location=>location.id===id); if(index>=0) state.data.placementLocations[index]=record; else state.data.placementLocations.push(record);
      save(); toast('Lokasi penempatan berhasil disimpan.');
      try { await placementApi('upsert_location', record); } catch(error) { toast(error.message); }
      state.editingPlacementLocationId=''; state.placementPickerPoint=null; renderPage();
    };
    document.getElementById('savePlacementLocationBtn')?.addEventListener('click', saveLocation);
    document.querySelectorAll('[data-edit-placement-location]').forEach(button=>button.addEventListener('click',()=>fillPlacementLocationForm(locationById(button.dataset.editPlacementLocation))));
    document.querySelectorAll('[data-delete-placement-location]').forEach(button=>button.addEventListener('click',async()=>{
      const id=button.dataset.deletePlacementLocation; if(!confirm('Hapus lokasi penempatan ini? Penempatan terkait juga akan dihapus.')) return;
      state.data.placementLocations=placementLocations().filter(location=>location.id!==id); state.data.spgAssignments=spgAssignments().filter(assignment=>assignment.locationId!==id); save();
      try { await placementApi('delete_location',{id}); toast('Lokasi berhasil dihapus.'); } catch(error){ toast(error.message); } renderPage();
    }));
  }

  function updateAssignmentLocationInfo() {
    const location=locationById(val('assignmentLocation')); const box=document.getElementById('assignmentLocationInfo'); if(!box)return;
    box.innerHTML=location ? `<b>${escapeHtml(location.name)}</b><small>${escapeHtml(location.address || '-')}</small><a target="_blank" href="${googleUrl(location.lat,location.lng)}">Lihat koordinat di Maps</a>` : '<small>Tambahkan lokasi pada menu Master Lokasi Penempatan terlebih dahulu.</small>';
  }

  function bindDailyPlacement() {
    document.getElementById('assignmentDateInput')?.addEventListener('change',event=>{state.assignmentDate=event.target.value||today();renderPage();});
    document.querySelectorAll('[data-placement-date]').forEach(button=>button.addEventListener('click',()=>{state.assignmentDate=button.dataset.placementDate||today();renderPage();}));
    document.getElementById('assignmentLocation')?.addEventListener('change',updateAssignmentLocationInfo); updateAssignmentLocationInfo();
    const saveAssignment=async()=>{
      const date=val('assignmentDateInput'), user=spgList().find(spg=>spg.id===val('assignmentSpg')), location=locationById(val('assignmentLocation'));
      if(!date||!user||!location)return toast('Tanggal, SPG, dan grosir/toko wajib dipilih.');
      const existing=assignmentFor(user.id,user.name,date);
      const record=normalizeAssignment({id:existing?.id||uid('asg'),date,userId:user.id,userName:user.name,area:location.area,locationId:location.id,status:'Ditempatkan',assignedBy:state.user.name});
      if(existing) state.data.spgAssignments[spgAssignments().findIndex(item=>item.id===existing.id)]=record; else state.data.spgAssignments.push(record);
      save(); toast(`${user.name} ditempatkan di ${location.name}.`);
      try { await placementApi('upsert_assignment',record); } catch(error){ toast(error.message); } state.assignmentDate=date; renderPage();
    };
    document.getElementById('saveDailyPlacementBtn')?.addEventListener('click',saveAssignment);
    document.getElementById('saveDailyPlacementBtn2')?.addEventListener('click',saveAssignment);
    document.querySelectorAll('[data-delete-daily-assignment]').forEach(button=>button.addEventListener('click',async()=>{
      const id=button.dataset.deleteDailyAssignment; if(!confirm('Hapus penempatan SPG ini?'))return;
      state.data.spgAssignments=spgAssignments().filter(assignment=>assignment.id!==id);save();
      try{await placementApi('delete_assignment',{id});toast('Penempatan berhasil dihapus.');}catch(error){toast(error.message);}renderPage();
    }));
  }

  function adminMap() {
    return `
      ${pageHead('Maps Admin', 'TL melihat titik outlet, jalur SPG, area yang belum dilewati, dan batas area.', '<button class="btn soft" id="toggleMapModeBtn">Tampilan: Detail</button><button class="btn soft" id="toggleLabelsBtn">Label Outlet: Off</button><button class="btn primary" id="fitMapBtn">Tampilkan Semua</button>')}
      ${filterBox()}
      <div class="map-shell admin-map-shell" style="margin-top:18px">
        <div class="map-panel"><h3>Legenda Maps</h3><small>Marker menunjukkan outlet. Garis menunjukkan jalur GPS yang pernah dilewati.</small><div class="stat-list" style="margin-top:12px">${tandaOptions.map(t => legend(t, tandaColor(t))).join('')}</div><hr>${routeControlsHtml()}<hr><h3>Coverage & Area Minim</h3>${coverageSection(visibleOutlets())}</div>
        <div class="map-box improved-map"><div id="map"></div></div>
        <div class="map-panel"><h3>Ringkasan Maps</h3><small>Catatan otomatis berdasarkan outlet dan jalur GPS.</small><div id="aiMapList"></div><hr><h3>Area belum dilewati</h3><div id="areaGapList"></div></div>
      </div>`;
  }

  function routeMonitorPage() {
    if(isMonitorRole())state.routeAreaFilter=monitorSelectedArea();
    const routes = monitoringRoutes();
    const rules=locationStatusSettings();
    const statusCounts=routes.reduce((acc,route)=>{const code=placementDistanceStatus(routePlacementDistance(route)).code;acc[code]=(acc[code]||0)+1;return acc;},{});
    return `
      ${pageHead('Monitoring Jalan SPG', 'Lihat perjalanan SPG dan kesesuaiannya dengan lokasi tugas.', '<button class="btn soft" id="refreshRouteMonitorBtn">Perbarui</button><button class="btn primary" id="exportRouteExcelBtn">Export Excel</button><button class="btn dark" id="exportRoutePdfBtn">Export PDF</button>')}
      ${isMonitorRole()?monitorAreaPicker():''}
      <div class="grid cols-4 route-location-kpis">${kpiCard(rules.insideLabel,number(statusCounts.inside||0),`maksimal ${number(rules.insideMeters)} meter`,'✅')}${kpiCard(rules.nearbyLabel,number(statusCounts.nearby||0),`${number(rules.insideMeters+1)}–${number(rules.nearbyMeters)} meter`,'🟡')}${kpiCard(rules.outsideLabel,number(statusCounts.outside||0),`lebih dari ${number(rules.nearbyMeters)} meter`,'⚠️')}${kpiCard(rules.noGpsLabel,number(statusCounts.noGps||0),'belum ada titik terbaru','📡')}</div>
      <div class="map-shell admin-map-shell" style="margin-top:18px">
        <div class="map-panel"><h3>Filter Perjalanan</h3><small>Pilih periode, area, dan nama SPG yang ingin dipantau.</small><div style="margin-top:12px">${routeControlsHtml()}</div></div>
        <div class="map-box improved-map"><div id="map"></div></div>
        <div class="map-panel"><h3>Posisi & Lokasi Tugas</h3><small>Jarak dihitung dari posisi GPS terakhir ke grosir/toko penempatan.</small>${routeJourneyListHtml(routes)}</div>
      </div>
      <div class="card" style="margin-top:18px"><h3>Ringkasan Monitoring Penempatan</h3>${routeMonitoringTable(routes)}</div>`;
  }

  function routeJourneyListHtml(routes) {
    const latest = routes.map(r => {
      const points = (r.points || []).slice().sort((a,b) => new Date(a.at)-new Date(b.at));
      return { route:r, point:points[points.length-1] };
    }).sort((a,b) => new Date(b.point?.at || b.route.date)-new Date(a.point?.at || a.route.date)).slice(0,8);
    if (!latest.length) return '<div class="empty">Belum ada penempatan atau titik perjalanan pada filter ini.</div>';
    return `<div class="stat-list route-stat-list">${latest.map(x => {
      const assignment=routeAssignment(x.route), location=assignment && locationById(assignment.locationId), distance=routePlacementDistance(x.route), status=placementDistanceStatus(distance);
      return statLine(`${x.route.userName} • ${location?.name || 'Belum ditempatkan'}`, `${x.point ? formatDateTime(x.point.at) : 'Belum ada GPS'} • ${distance === null ? 'jarak belum tersedia' : formatMeters(distance)}`, status.color);
    }).join('')}</div>`;
  }

  function routeMonitoringTable(routes) {
    const rows = routes.slice().sort((a,b) => new Date(b.startedAt)-new Date(a.startedAt));
    if (!rows.length) return '<div class="empty">Belum ada perjalanan SPG pada periode ini.</div>';
    return `<div class="table-wrap"><table><thead><tr><th>SPG</th><th>Area</th><th>Tanggal</th><th>Lokasi Penempatan</th><th>Posisi Terakhir</th><th>Jarak dari Lokasi</th><th>Status Jarak</th><th>Titik GPS</th><th>Total Jalur</th><th>Maps</th></tr></thead><tbody>${rows.map(r => {
      const pts = (r.points || []).slice().sort((a,b)=>new Date(a.at)-new Date(b.at));
      const last = pts[pts.length-1];
      const assignment=routeAssignment(r), location=assignment && locationById(assignment.locationId), distance=routePlacementDistance(r), status=placementDistanceStatus(distance);
      return `<tr><td><b>${escapeHtml(r.userName)}</b></td><td>${escapeHtml(r.area || '-')}</td><td>${escapeHtml(r.date || '-')}</td><td>${location ? `<b>${escapeHtml(location.name)}</b><br><small>${escapeHtml(location.address || '')}</small>` : '<span class="badge red">Belum ditempatkan</span>'}</td><td>${last ? formatDateTime(last.at) : '-'}</td><td><b>${distance === null ? '-' : formatMeters(distance)}</b></td><td><span class="badge ${status.color}">${status.label}</span></td><td>${number(pts.length)}</td><td>${formatMeters(routeDistance(pts))}</td><td>${last ? `<a target="_blank" href="${googleUrl(last.lat,last.lng)}">Posisi SPG</a>` : '-'}${location ? `<br><a target="_blank" href="${googleUrl(location.lat,location.lng)}">Lokasi tugas</a>` : ''}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function monitorPointsForMap(routes) {
    const routePoints = routePointsForMap(routes);
    const placementPoints = routes.flatMap(route => {
      const assignment=routeAssignment(route), location=assignment && locationById(assignment.locationId);
      return location ? [{ lat:location.lat, lng:location.lng }] : [];
    });
    return [...routePoints, ...placementPoints];
  }

  function drawPlacementReferences(map, routes) {
    if (!map || !leafletReady()) return;
    const rules=locationStatusSettings();
    const seen = new Set();
    routes.forEach(route => {
      const assignment=routeAssignment(route), location=assignment && locationById(assignment.locationId);
      if (!location) return;
      const key=`${route.userId}|${route.date}|${location.id}`; if(seen.has(key))return; seen.add(key);
      const icon=L.divIcon({className:'',html:'<div class="placement-map-pin">🏪</div>',iconSize:[38,38],iconAnchor:[19,34]});
      L.marker([location.lat,location.lng],{icon}).addTo(map).bindPopup(`<b>${escapeHtml(location.name)}</b><br>Lokasi tugas ${escapeHtml(route.userName)}<br>${escapeHtml(location.address || '')}`);
      L.circle([location.lat,location.lng],{radius:rules.insideMeters,color:'#16a34a',fillColor:'#22c55e',fillOpacity:.08,weight:2,dashArray:'5 6'}).addTo(map).bindTooltip(`Radius ${escapeHtml(rules.insideLabel)} ${number(rules.insideMeters)} meter`);
      const points=(route.points||[]).slice().sort((a,b)=>new Date(a.at)-new Date(b.at)); const last=points[points.length-1];
      if(last){const distance=routePlacementDistance(route), status=placementDistanceStatus(distance);L.polyline([[location.lat,location.lng],[last.lat,last.lng]],{color:status.color==='green'?'#16a34a':status.color==='yellow'?'#f59e0b':'#ef4444',weight:3,opacity:.8,dashArray:'8 8'}).addTo(map).bindTooltip(`${route.userName}: ${formatMeters(distance)}`);}
    });
  }

  function exportRouteMonitoringPdf() {
    const jspdf=window.jspdf; if(!jspdf?.jsPDF)return toast('Library PDF belum termuat. Pastikan internet aktif.');
    const routes=monitoringRoutes().slice().sort((a,b)=>a.area.localeCompare(b.area)||a.userName.localeCompare(b.userName));
    if(!routes.length)return toast('Belum ada data monitoring untuk diekspor.');
    const areaLabel=state.routeAreaFilter&&state.routeAreaFilter!=='Semua'?state.routeAreaFilter:'Semua Area';
    const doc=new jspdf.jsPDF({orientation:'landscape'}), pageW=doc.internal.pageSize.getWidth();
    doc.setFillColor(15,23,42);doc.rect(0,0,pageW,40,'F');doc.setTextColor(255,255,255);doc.setFontSize(20);doc.text('MONITORING PENEMPATAN & JALUR SPG',14,17);doc.setFontSize(11);doc.text(`${areaLabel} • ${routeDateMode()} • dibuat ${new Date().toLocaleString('id-ID')}`,14,29);
    doc.setTextColor(15,23,42);doc.autoTable({startY:48,head:[['SPG','Area','Tanggal','Grosir/Toko','Posisi Terakhir','Jarak dari Lokasi','Status','Titik GPS','Total Jalur']],body:routes.map(route=>{
      const assignment=routeAssignment(route),location=assignment&&locationById(assignment.locationId),points=(route.points||[]).slice().sort((a,b)=>new Date(a.at)-new Date(b.at)),last=points[points.length-1],distance=routePlacementDistance(route),status=placementDistanceStatus(distance);
      return [route.userName,route.area,route.date,location?.name||'Belum ditempatkan',last?formatDateTime(last.at):'-',distance===null?'-':formatMeters(distance),status.label,number(points.length),formatMeters(routeDistance(points))];
    }),styles:{fontSize:8,cellPadding:3},headStyles:{fillColor:[37,99,235]},alternateRowStyles:{fillColor:[245,248,252]}});
    const pageCount=doc.internal.getNumberOfPages();for(let page=1;page<=pageCount;page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(`Website Extra Joss SPG • ${state.user.name} • Halaman ${page}/${pageCount}`,14,doc.internal.pageSize.getHeight()-8);}
    doc.save(`MONITORING_SPG_${areaLabel.replace(/\s+/g,'_')}_${today()}.pdf`);
  }
  function exportRouteMonitoringExcel() {
    const rows=monitoringRoutes().map(route=>{const points=(route.points||[]).slice().sort((a,b)=>new Date(a.at)-new Date(b.at)),last=points.at(-1),assignment=routeAssignment(route),location=assignment&&locationById(assignment.locationId),distance=routePlacementDistance(route);return {SPG:route.userName,Area:route.area,Tanggal:route.date,Lokasi_Tugas:location?.name||'-',Posisi_Terakhir:last?formatDateTime(last.at):'-',Jarak:distance===null?'-':formatMeters(distance),Jumlah_Titik:points.length,Total_Jalan:formatMeters(routeDistance(points))};});
    if(!rows.length)return toast('Belum ada data perjalanan untuk diexport.');
    const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);ws['!cols']=[20,16,14,24,22,16,14,16].map(wch=>({wch}));XLSX.utils.book_append_sheet(wb,ws,'Monitoring Jalan');XLSX.writeFile(wb,'MONITORING JALAN SPG.xlsx');toast('Excel Monitoring Jalan berhasil dibuat.');
  }

  function bindRouteMonitor() {
    setTimeout(() => initRouteMonitorMap(), 40);
    bindRouteControls();
    document.getElementById('fitRouteMapBtn')?.addEventListener('click', () => fitMap(state.map, monitorPointsForMap(monitoringRoutes())));
    document.getElementById('exportRoutePdfBtn')?.addEventListener('click', exportRouteMonitoringPdf);
    document.getElementById('exportRouteExcelBtn')?.addEventListener('click', exportRouteMonitoringExcel);
    document.getElementById('refreshRouteMonitorBtn')?.addEventListener('click', async () => { await refreshPlacementData({notify:true}); cleanupMaps(); renderPage(); toast('Data monitoring sudah diperbarui.'); });
  }

  function initRouteMonitorMap() {
    const el = document.getElementById('map'); if (!el) return;
    if (!leafletReady()) { el.innerHTML = '<div class="empty">Peta belum termuat. Periksa sambungan internet lalu muat ulang halaman.</div>'; return; }
    try { if (state.map) state.map.remove(); } catch (e) {}
    const routes = monitoringRoutes();
    const points = monitorPointsForMap(routes);
    state.map = L.map(el, { zoomControl:true, preferCanvas:true, zoomAnimation:false, fadeAnimation:false, markerZoomAnimation:false }).setView([-3.3194,114.5908], 12);
    addFastTileLayer(state.map);
    drawAreaBoundaries(state.map);
    drawRouteLayers(state.map, routes, true);
    drawPlacementReferences(state.map, routes);
    fitMap(state.map, points);
    updateRouteStatsBox();
    requestAnimationFrame(() => state.map?.invalidateSize?.(false));
  }

  function bindAdminMap() {
    setTimeout(() => initAdminMap(), 80);
    bindMapControls(); bindRouteControls();
    document.getElementById('fitMapBtn')?.addEventListener('click', () => fitMap(state.map, visibleOutlets()));
  }
  function spgDraftKey() { return `${KEY_SPG_DRAFT}_${state.user?.id || 'guest'}`; }
  function loadSpgDraft() { try { return JSON.parse(localStorage.getItem(spgDraftKey()) || 'null'); } catch { return null; } }
  function saveSpgDraft() {
    if (!state.user || isAdmin() || !fieldRules().enableOfflineDraft) return;
    const draft = {
      point: state.selectedPoint,
      photo: state.selectedPhoto || '',
      name: val('spgOutletName'),
      tanda: val('spgOutletTanda'),
      area: val('spgOutletArea'),
      sold: val('spgOutletSold'),
      phone: val('spgOutletPhone'),
      notes: val('spgOutletNotes'),
      savedAt: nowIso()
    };
    localStorage.setItem(spgDraftKey(), JSON.stringify(draft));
    const hint = document.getElementById('autosaveHint');
    if (hint) hint.textContent = 'Tersimpan otomatis ' + new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
  }
  function clearSpgDraft() { localStorage.removeItem(spgDraftKey()); }
  function restoreSpgDraft() {
    if (!fieldRules().enableOfflineDraft) return;
    const draft = loadSpgDraft();
    if (!draft) return;
    const map = { spgOutletName:'name', spgOutletTanda:'tanda', spgOutletArea:'area', spgOutletSold:'sold', spgOutletPhone:'phone', spgOutletNotes:'notes' };
    Object.entries(map).forEach(([id,key]) => { const el = document.getElementById(id); if (el && draft[key] !== undefined) el.value = draft[key]; });
    if (draft.point) state.selectedPoint = draft.point;
    if (draft.photo) {
      state.selectedPhoto = draft.photo;
      const preview = document.getElementById('photoPreview');
      if (preview) preview.innerHTML = `<img src="${state.selectedPhoto}" alt="Preview foto outlet">`;
    }
    updatePointPreview(); updateDuplicatePreview(); updateValidationChecklist(); addPickMarker();
    const hint = document.getElementById('autosaveHint');
    if (hint) hint.textContent = 'Draft lama berhasil dikembalikan.';
  }
  function bindDraftAutosave() {
    if (!fieldRules().enableOfflineDraft) return;
    ['spgOutletName','spgOutletTanda','spgOutletArea','spgOutletSold','spgOutletPhone','spgOutletNotes'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      ['input','change'].forEach(ev => el.addEventListener(ev, () => { updateDuplicatePreview(); updateValidationChecklist(); saveSpgDraft(); }));
    });
  }
  function showOutletSuccessModal(outlet) {
    modalShell(
      'Outlet berhasil disimpan ✅',
      'Data outlet sudah masuk ke daftar outlet kamu dan bisa dilihat Admin/TL.',
      `<div class="success-outlet-box"><h3>${escapeHtml(outlet.name)}</h3><div class="stat-list">${statLine('Area', outlet.area, 'blue')}${statLine('Tanda outlet', outlet.tanda, tandaColor(outlet.tanda))}${statLine('Terjual', number(outlet.sold) + ' kaleng', 'green')}${statLine('Estimasi nilai', money(outletValue(outlet)), 'yellow')}</div></div>`,
      '<button class="btn ghost" data-modal-close>Tutup</button><button class="btn soft" id="successListBtn">Lihat Daftar Outlet Saya</button><button class="btn primary" id="successAddBtn">+ Tandai Outlet Lagi</button>',
      () => {
        document.getElementById('successAddBtn')?.addEventListener('click', () => { closeModal(); goPage('spgAdd'); });
        document.getElementById('successListBtn')?.addEventListener('click', () => { closeModal(); goPage('spgOutlets'); });
      }
    );
  }
  function beginnerGuideHtml() {
    const seen = localStorage.getItem(KEY_SPG_BEGINNER + '_' + (state.user?.id || 'guest'));
    if (seen) return '';
    return `<div class="card beginner-card"><div><span class="badge yellow">Mode SPG Pemula</span><h3>Cara paling mudah menandai outlet</h3><ol><li>Tekan <b>+ Tandai Outlet Sekarang</b>.</li><li>${fieldRules().requireOutletGps?'Izinkan lokasi/GPS dan pastikan titiknya benar.':'Pilih titik outlet bila lokasi tersedia.'}</li><li>Isi nama outlet, tanda outlet, area, dan kaleng terjual.</li><li>${fieldRules().requireOutletPhoto?'Tambahkan foto outlet yang jelas.':'Tambahkan foto outlet bila ada.'}</li><li>Tekan <b>Simpan Outlet</b>.</li></ol></div><button class="btn soft" id="hideBeginnerGuideBtn">Saya sudah paham</button></div>`;
  }

  function bindSpgAddMap() {
    setTimeout(() => { initSpgMap(); if(fieldRules().enableRouteTracking)startAutoRouteTracking(); restoreSpgDraft(); updateValidationChecklist(); }, 80);
    bindMapControls(); bindRouteControls();
    document.getElementById('locateMeBtn')?.addEventListener('click', useMyLocation);
    document.getElementById('quickAddOutletBtn')?.addEventListener('click', () => { useMyLocation(); setTimeout(() => document.getElementById('spgOutletName')?.focus(), 400); toast('Tambah Outlet Cepat aktif. Isi nama outlet lalu simpan.'); });
    document.getElementById('clearPointBtn')?.addEventListener('click', () => { state.selectedPoint = null; state.pickMarker?.remove(); state.pickMarker = null; updatePointPreview(); updateValidationChecklist(); saveSpgDraft(); });
    document.getElementById('clearDraftBtn')?.addEventListener('click', () => { clearSpgDraft(); state.selectedPoint = null; state.selectedPhoto = ''; renderPage(); toast('Draft form sudah dibersihkan.'); });
    document.getElementById('hideBeginnerGuideBtn')?.addEventListener('click', () => { localStorage.setItem(KEY_SPG_BEGINNER + '_' + (state.user?.id || 'guest'), '1'); renderPage(); });
    document.getElementById('spgOutletPhoto')?.addEventListener('change', readPhoto);
    bindDraftAutosave();
    document.getElementById('saveSpgOutletBtn')?.addEventListener('click', saveSpgOutlet);
    document.getElementById('saveSpgOutletBtn2')?.addEventListener('click', saveSpgOutlet);
  }
  function updateValidationChecklist() {
    const box = document.getElementById('validationChecklist');
    const rules = fieldRules();
    const checks = [
      ['Lokasi/titik outlet sudah dipilih', !!state.selectedPoint || !rules.requireOutletGps, rules.requireOutletGps?'wajib':'tidak wajib'],
      ['Nama outlet sudah diisi', !!val('spgOutletName').trim()],
      ['Tanda outlet sudah dipilih', !!val('spgOutletTanda')],
      ['Area sudah dipilih', !!val('spgOutletArea')],
      ['Kaleng terjual sudah diisi', val('spgOutletSold') !== '' && Number(val('spgOutletSold')) >= 0],
      ['Foto outlet', !!state.selectedPhoto || !rules.requireOutletPhoto, rules.requireOutletPhoto?'wajib':'disarankan']
    ];
    if (box) box.innerHTML = checks.map(c => `<span class="check ${c[1]?'ok':'bad'}">${c[1]?'✓':'!'} ${escapeHtml(c[0])}${c[2]?` <small>(${escapeHtml(c[2])})</small>`:''}</span>`).join('');
    const requiredOk = checks.every(c => c[1]);
    ['saveSpgOutletBtn','saveSpgOutletBtn2'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) { btn.disabled = !requiredOk; btn.title = requiredOk ? 'Simpan outlet' : 'Lengkapi data wajib dulu'; }
    });
  }
  function setSelectedPoint(lat, lng, accuracy = 0) {
    state.selectedPoint = { lat: Number(lat), lng: Number(lng), accuracy: Number(accuracy || 0) };
    addPickMarker(); updatePointPreview(); updateDuplicatePreview(); updateValidationChecklist(); saveSpgDraft();
  }
  function saveSpgOutlet() {
    const name = val('spgOutletName').trim(); const tanda = val('spgOutletTanda'); const area = val('spgOutletArea'); const soldRaw = val('spgOutletSold');
    const rules = fieldRules();
    if (rules.requireOutletGps && !state.selectedPoint) return toast('Lokasi wajib dipilih sesuai pengaturan Admin/TL.');
    if (!name) return toast('Nama outlet wajib diisi.');
    if (!tanda) return toast('Tanda outlet wajib dipilih.');
    if (!area) return toast('Area wajib dipilih.');
    if (soldRaw === '' || Number(soldRaw) < 0) return toast('Terjual/Kaleng wajib diisi minimal 0.');
    if (rules.requireOutletPhoto && !state.selectedPhoto) return toast('Foto outlet wajib diunggah sesuai pengaturan Admin/TL.');
    const customFields=readCustomFieldValues('outlet','outletCreate');if(customFields===null)return;
    const fallbackPoint = areaCenter(area); const point = state.selectedPoint || { lat:fallbackPoint[0], lng:fallbackPoint[1], accuracy:0 };
    const draft = { id:'draft', name, lat: point.lat, lng: point.lng };
    const near = findNearbyDuplicates(draft, outlets());
    const outlet = normalizeOutlet({
      id: uid('o'), name, area, tanda, sold: Number(soldRaw), phone: val('spgOutletPhone').trim(),
      lat: point.lat, lng: point.lng, photo: state.selectedPhoto || '',
      markedBy: state.user.name, markedById: state.user.id, markedAt: nowIso(), notes: val('spgOutletNotes').trim(), accuracy: point.accuracy || 0, customFields,
      duplicateWarning: near.length ? near.map(x => `${x.outlet.name} (${Math.round(x.distance)} m)`).join('; ') : ''
    });
    state.data.outlets.push(outlet);
    queueOfflineAction('outlet',outlet.id);
    // Tambahkan titik outlet ke jalur hari ini juga, agar titik outlet dan jalur GPS tetap nyambung meski GPS jarang update.
    const r = currentRoute();
    if (r) { r.points.push({ lat:outlet.lat, lng:outlet.lng, at:outlet.markedAt, accuracy:outlet.accuracy || 0 }); r.totalDistanceM = routeDistance(r.points); }
    save();
    clearSpgDraft();
    toast('Outlet berhasil ditandai dan disimpan.');
    state.selectedPhoto = '';
    state.selectedPoint = null;
    render();
    setTimeout(() => showOutletSuccessModal(outlet), 60);
  }

  function initAdminMap() {
    const el = document.getElementById('map'); if (!el) return;
    if (!leafletReady()) { el.innerHTML = '<div class="empty">Maps belum termuat. Pastikan internet aktif untuk Leaflet/OpenStreetMap.</div>'; return; }
    mapLoading(el); try { if (state.map) state.map.remove(); } catch (e) {}
    const rows = visibleOutlets(); const routes = filteredRoutes();
    setTimeout(() => {
      el.innerHTML = '';
      state.map = L.map(el, { zoomControl: true, preferCanvas:true }).setView([Number(state.data.settings.mapDefaultLat || -3.3194), Number(state.data.settings.mapDefaultLng || 114.5908)], 12);
      addFastTileLayer(state.map);
      drawAreaBoundaries(state.map);
      drawClustersOrMarkers(state.map, rows, true);
    if (state.showRouteOverlay !== false) drawRouteLayers(state.map, routes, true);
      const aiList = document.getElementById('aiMapList'); if (aiList) aiList.innerHTML = [...adminInsights(rows), ...routeInsights(rows, routes)].map(i => aiItem(i.tag, i.text, i.color)).join('');
      const gap = document.getElementById('areaGapList'); if (gap) gap.innerHTML = areaGapListHtml(rows, routes);
      fitMap(state.map, rows.length ? rows : routePointsForMap(routes));
      [80, 250, 700, 1200].forEach(ms => setTimeout(() => state.map?.invalidateSize?.(), ms));
      updateRouteStatsBox();
    }, 30);
  }
  function initSpgMap() {
    const el = document.getElementById('spgMap'); if (!el) return;
    if (!leafletReady()) { el.innerHTML = '<div class="empty">Peta belum termuat. Periksa sambungan internet lalu muat ulang halaman.</div>'; return; }
    try { if (state.spgMap) state.spgMap.remove(); } catch (e) {}
    const rows = ownOutlets();
    const center = rows[0] ? [Number(rows[0].lat), Number(rows[0].lng)] : areaCenter(state.user.area);
    requestAnimationFrame(() => {
      el.innerHTML = '';
      state.spgMap = L.map(el, { zoomControl:true, preferCanvas:true, zoomAnimation:false, fadeAnimation:false, markerZoomAnimation:false }).setView(center, rows.length ? 14 : 13);
      addFastTileLayer(state.spgMap);
      drawClustersOrMarkers(state.spgMap, rows, false);
      state.spgMap.on('click', (e) => setSelectedPoint(e.latlng.lat, e.latlng.lng, 0));
      if (state.selectedPoint) addPickMarker();
      if (rows.length) fitMap(state.spgMap, rows);
      updatePointPreview();
      requestAnimationFrame(() => state.spgMap?.invalidateSize?.(false));
    });
  }
  function routeInsights(rows, routes) {
    const s = routeSummary(routes); const gaps = areaGaps(rows, routes).filter(x=>x.level !== 'Aman');
    return [
      { tag:'jalur GPS', color:s.points ? 'green' : 'yellow', text:s.points ? `${number(s.points)} titik GPS terekam dengan estimasi jarak ${formatMeters(s.distance)}.` : 'Belum ada titik GPS pada filter jalur.' },
      { tag:'area belum dilewati', color:gaps.length ? 'yellow' : 'green', text:gaps.length ? `${gaps.length} area masih minim titik/jalur. Prioritaskan ${gaps[0].area}.` : 'Coverage area terlihat aman pada filter ini.' }
    ];
  }
  function areaGaps(rows, routes) {
    return areas().map(a => {
      const outletCount = rows.filter(o => o.area === a.name).length;
      const routeCount = routes.filter(r => r.area === a.name || spgList().some(u => u.name === r.userName && u.area === a.name)).reduce((s,r)=>s+(r.points?.length||0),0);
      let level = 'Aman', color='green', note='Area sudah memiliki titik outlet/jalur.';
      if (outletCount < 2 && routeCount < 6) { level='Minim'; color='red'; note='Masih perlu ditambah titik outlet dan jalur SPG.'; }
      else if (outletCount < 5) { level='Perlu ditambah'; color='yellow'; note='Sudah ada titik, tapi coverage belum kuat.'; }
      return { area:a.name, outletCount, routeCount, level, color, note };
    });
  }
  function areaGapListHtml(rows, routes) {
    const gaps = areaGaps(rows, routes);
    return `<div class="stat-list">${gaps.map(g => statLine(`${g.area} • ${g.level}`, `${number(g.outletCount)} outlet • ${number(g.routeCount)} titik GPS`, g.color)).join('')}</div>`;
  }


  // Jalankan rekam jalur otomatis untuk akun SPG setelah login.
  setInterval(() => {
    try { if (state.user?.role === 'SPG' && fieldRules().enableRouteTracking && !state.routeWatchId) startAutoRouteTracking(); } catch (e) {}
  }, 3500);
  setInterval(()=>{
    try{if(state.user?.sessionExpiresAt&&Date.now()>Number(state.user.sessionExpiresAt)){toast('Waktu login berakhir. Silakan masuk kembali.');logout();}}catch{}
  },30000);
  window.addEventListener('online',()=>{flushRoutePointQueue().finally(()=>scheduleSharedSave(80));if(state.page==='spgHome')renderPage();});
  window.addEventListener('offline',()=>{if(state.page==='spgHome')renderPage();});


  async function bootstrap() {
    applyTheme(themePreference(), false);
    if(useSharedServer()){
      if(state.user&&!window.ExtraJossBackend?.hasToken?.()){
        state.user=null;localStorage.removeItem(KEY_USER);
      }else if(state.user){
        try{
          const localData=clone(state.data),pending=(localData.offlineQueue||[]).filter(item=>item.userId===state.user.id);
          const result=await window.ExtraJossBackend.pull();
          state.data=normalizeData(result.data||{});
          if(state.user.role==='SPG'&&pending.length){
            const pendingIds=new Set(pending.map(item=>item.recordId));
            const pendingOutlets=(localData.outlets||[]).filter(item=>pendingIds.has(item.id));
            const byId=new Map((state.data.outlets||[]).map(item=>[item.id,item]));pendingOutlets.forEach(item=>byId.set(item.id,item));
            state.data.outlets=[...byId.values()];state.data.routes=localData.routes||[];state.data.offlineQueue=pending;
            flushRoutePointQueue().finally(()=>scheduleSharedSave(120));
          }
          const current=(state.data.users||[]).find(user=>user.id===state.user.id);
          if(current)state.user=normalizeUser({...state.user,...current});
          localStorage.setItem(KEY_DATA,JSON.stringify(state.data));saveUser();
        }catch(error){if(error?.status===401){state.user=null;localStorage.removeItem(KEY_USER);window.ExtraJossBackend?.clear?.();}else state.sharedSaveError='Internet belum tersedia. Data lokal tetap dapat digunakan.';}
      }
    }
    if(!useSharedServer())await refreshPlacementData();
    render();
  }

  bootstrap();
})();
