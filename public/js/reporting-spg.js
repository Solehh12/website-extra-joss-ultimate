(function () {
  const MONITOR_FILTER_KEY='extra_joss_reporting_filters_v18';
  const AREA_ORDER = ['Banjarmasin', 'Palangkaraya', 'Balikpapan', 'Samarinda', 'Makassar', 'Manado'];
  let ACTIVE_FOCUS_AREAS = [];
  const TABS = [
    ['reporting', '📝', 'Reporting'],
    ['spg', '👥', 'Data SPG'],
    ['zona', '🚦', 'Zona SPG & Area'],
    ['sampling', '🥤', 'Sampling'],
    ['summary', '🧠', 'Rangkuman']
  ];
  const ATTENDANCE = ['HADIR', 'OFF', 'IZIN', 'SAKIT', 'ALPHA'];
  const DEFAULT_CONFIG = {
    tlName: 'SOLEHUDIN',
    areaManagerName: 'AREA MANAGER',
    defaultPeriod: '2026-07',
    targetDailyCan: 120,
    targetSamplingCup: 50,
    pcsPerCarton: 24,
    defaultSellingPrice: 6000,
    ratioCommitment: 0.28,
    scoByArea: {
      Banjarmasin: 'NANDRA',
      Samarinda: 'ADHA',
      Balikpapan: 'ADHA',
      Palangkaraya: 'LINDA',
      Manado: 'VALEN',
      Makassar: 'JHON'
    },
    expenseByArea: {
      Manado: 168544,
      Makassar: 181002,
      Samarinda: 174683,
      Balikpapan: 169791,
      Banjarmasin: 169760,
      Palangkaraya: 169791
    },
    quotaByArea: {
      Banjarmasin: 4,
      Palangkaraya: 2,
      Balikpapan: 2,
      Samarinda: 2,
      Makassar: 2,
      Manado: 2
    },
    focusAreas: []
  };

  const ui = {
    tab: 'reporting',
    period: '2026-07',
    area: 'Semua',
    spg: 'Semua',
    dailyPage: 1,
    dailyPageSize: 10,
    stockPeriod: '2026-07',
    stockArea: 'Banjarmasin',
    currentRole: '',
    editingDailyId: '',
    editingStockId: '',
    editingCoachingId: '',
    editingPicaId: '',
    editingProfileId: '',
    monitorAttention: 'Semua',
    exportAttention: '',
    exportPeriodStart: '',
    exportPeriodEnd: '',
    receiptDraft: null,
    receiptPage: 1,
    receiptPageSize: 10,
    receiptDateStart: '',
    receiptDateEnd: '',
    receiptArea: 'Semua',
    receiptSpg: 'Semua',
    receiptStatus: 'Semua',
    restoredForUser: ''
  };

  function enabledTabs(ctx) {
    const flags = ctx?.data?.settings?.systemControl?.reportingTabs || {};
    const tabs = TABS.filter(([key]) => flags[key] !== false);
    const safeTabs = tabs.length ? tabs : [TABS[0]];
    if (!safeTabs.some(([key]) => key === ui.tab)) ui.tab = safeTabs[0][0];
    return safeTabs;
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function n(value) {
    if (typeof value === 'string') value = value.replace(/[^0-9,.-]/g, '').replace(/,/g, '');
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function round(value, digits = 0) {
    const factor = Math.pow(10, digits);
    return Math.round((n(value) + Number.EPSILON) * factor) / factor;
  }
  function norm(value) { return String(value || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function periodOf(date) { return String(date || '').slice(0, 7); }
  function weekIndex(date) {
    const day = Number(String(date || '').slice(8, 10));
    if (!day || day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    if (day <= 28) return 3;
    return 4;
  }
  function monthLabel(period) {
    const [year, month] = String(period || '').split('-').map(Number);
    if (!year || !month) return String(period || '-').toUpperCase();
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1)).toUpperCase();
  }
  function periodRange(start,end,limit=24) {
    let [startYear,startMonth]=String(start||'').split('-').map(Number),[endYear,endMonth]=String(end||'').split('-').map(Number);
    if(!startYear||!startMonth||!endYear||!endMonth)return [];
    let startIndex=startYear*12+startMonth-1,endIndex=endYear*12+endMonth-1;
    if(startIndex>endIndex)[startIndex,endIndex]=[endIndex,startIndex];
    const rows=[];for(let index=startIndex;index<=endIndex&&rows.length<limit;index++){rows.push(`${Math.floor(index/12)}-${String(index%12+1).padStart(2,'0')}`);}return rows;
  }
  function areaSort(a, b) {
    const ai = AREA_ORDER.indexOf(a);
    const bi = AREA_ORDER.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || String(a).localeCompare(String(b));
  }
  function safeSheetName(value) { return String(value || 'Sheet').replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31); }
  function excelColumn(index) {
    let value = index + 1;
    let result = '';
    while (value) {
      value--;
      result = String.fromCharCode(65 + (value % 26)) + result;
      value = Math.floor(value / 26);
    }
    return result;
  }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }
  function isFocusAreaName(area) { return ACTIVE_FOCUS_AREAS.includes(String(area || '').trim()); }
  function isFocus(area) { return ui.currentRole === 'TL' && isFocusAreaName(area); }
  function isTl(ctx) { return String(ctx?.user?.role || '').toUpperCase() === 'TL'; }
  function isMonitor(ctx) { return ['SCO','MS','AM'].includes(String(ctx?.user?.role || '').toUpperCase()); }
  function isFocusFor(ctx, area) { return isTl(ctx) && isFocusAreaName(area); }
  function restoreMonitorFilters(ctx){
    if(!isMonitor(ctx)||ui.restoredForUser===ctx.user?.id)return;
    ui.restoredForUser=ctx.user?.id||'monitor';
    try{const saved=JSON.parse(localStorage.getItem(MONITOR_FILTER_KEY)||'{}')?.[ui.restoredForUser]||{};if(saved.period)ui.period=saved.period;if(saved.area)ui.area=saved.area;if(saved.spg)ui.spg=saved.spg;if(saved.exportPeriodStart)ui.exportPeriodStart=saved.exportPeriodStart;if(saved.exportPeriodEnd)ui.exportPeriodEnd=saved.exportPeriodEnd;if(['Semua','Perlu Perhatian'].includes(saved.attention))ui.monitorAttention=saved.attention;}catch{}
    ui.exportPeriodStart=ui.exportPeriodStart||ui.period;ui.exportPeriodEnd=ui.exportPeriodEnd||ui.period;
  }
  function saveMonitorFilters(ctx){
    if(!isMonitor(ctx))return;
    try{const all=JSON.parse(localStorage.getItem(MONITOR_FILTER_KEY)||'{}');all[ctx.user?.id||'monitor']={period:ui.period,area:ui.area,spg:ui.spg,attention:ui.monitorAttention,exportPeriodStart:ui.exportPeriodStart||ui.period,exportPeriodEnd:ui.exportPeriodEnd||ui.period};localStorage.setItem(MONITOR_FILTER_KEY,JSON.stringify(all));}catch{}
  }
  function rememberRole(ctx) { ui.currentRole = String(ctx?.user?.role || '').toUpperCase();ACTIVE_FOCUS_AREAS=Array.isArray(ctx?.data?.reportingConfig?.focusAreas)?ctx.data.reportingConfig.focusAreas.slice():[];restoreMonitorFilters(ctx); }
  function ratioZone(value) {
    const ratio = n(value);
    if (!ratio) return { label: 'Belum ada value', color: 'gray' };
    if (ratio <= .35) return { label: 'Hijau', color: 'green' };
    if (ratio <= .40) return { label: 'Kuning', color: 'yellow' };
    return { label: 'Merah', color: 'red' };
  }
  function achievementZone(value) {
    const achievement = n(value);
    if (achievement >= .80) return { label: 'On Track', color: 'green' };
    if (achievement >= .60) return { label: 'Perlu Dorongan', color: 'yellow' };
    return { label: 'Prioritas', color: 'red' };
  }
  function badge(label, color) { return `<span class="badge ${color || 'gray'}">${label}</span>`; }

  function seedProfiles() {
    return [
      { id:'rspg-bjm-nurul', area:'Banjarmasin', spg:'Nurul Agatha Pratiwi', outlet:'Farez Barokah', district:'Banjarmasin Utara', joinDate:'2026-07-01', status:'Aktif', targetHK:26, targetMonth:3240 },
      { id:'rspg-bjm-herlisa', area:'Banjarmasin', spg:'Herlisa', outlet:'Yeyen / Ibak', district:'Banjarmasin Tengah', joinDate:'2025-12-02', status:'Aktif', targetHK:26, targetMonth:3240 },
      { id:'rspg-bjm-khoirunisa', area:'Banjarmasin', spg:'Khoirunisa', outlet:'H. Salim', district:'Banjarmasin Selatan', joinDate:'2026-05-04', status:'Aktif', targetHK:26, targetMonth:3240 },
      { id:'rspg-bjm-vacant', area:'Banjarmasin', spg:'VACANT - TOKO RAHMAH', outlet:'Toko Rahmah', district:'Banjarmasin Timur', joinDate:'', status:'Vacant', targetHK:26, targetMonth:3240, lostManDays:0, commitmentDate:'', notes:'Posisi vacant dari referensi Daily Report SPG.' },
      { id:'rspg-plk-fani', area:'Palangkaraya', spg:'Fani Febriani', outlet:'Toko Tanjung', district:'Pahandut', joinDate:'2025-12-27', status:'Aktif', targetHK:26, targetMonth:3240 },
      { id:'rspg-plk-siska', area:'Palangkaraya', spg:'Siska', outlet:'Toko H Fathur', district:'Jekan Raya', joinDate:'2026-04-08', status:'Aktif', targetHK:26, targetMonth:3240 },
      { id:'rspg-bpp-rami', area:'Balikpapan', spg:'Rami Arsita', outlet:'Toko Perdana', district:'Balikpapan Kota', joinDate:'2026-06-01', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-bpp-grace', area:'Balikpapan', spg:'Grace Glory Cahyani B.', outlet:'Toko Perdana', district:'Balikpapan Kota', joinDate:'2026-07-01', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-smd-fitriani', area:'Samarinda', spg:'Fitriani', outlet:'Toko Alam Subur', district:'Samarinda Ulu', joinDate:'2026-02-07', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-smd-desi', area:'Samarinda', spg:'Desi Susanti', outlet:'Toko Surya Indah', district:'Samarinda Kota', joinDate:'2026-02-20', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-mks-amelia', area:'Makassar', spg:'Amelia Hakim', outlet:'Kariwisi Jaya', district:'Panakkukang', joinDate:'2026-02-04', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-mks-nadira', area:'Makassar', spg:'ST Nadira', outlet:'Bintang Terang', district:'Rappocini', joinDate:'2026-06-01', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-mdo-dea', area:'Manado', spg:'Deasinta Yolanda Pusoh', outlet:'Kasih Setia / Bintang Harapan', district:'Wanea', joinDate:'2026-06-27', status:'Aktif', targetHK:26, targetMonth:2880 },
      { id:'rspg-mdo-regina', area:'Manado', spg:'Regina Putri Pakaya', outlet:'Lovely Jaya', district:'Tikala', joinDate:'2026-06-23', status:'Aktif', targetHK:26, targetMonth:2880 }
    ];
  }

  function distributeHK(total) {
    const base = Math.floor(n(total) / 4);
    const result = [base, base, base, base];
    let rest = n(total) - base * 4;
    for (let i = 0; i < result.length && rest > 0; i++, rest--) result[i]++;
    return result;
  }
  function seedDailyReports() {
    const specs = [
      ['rspg-bjm-nurul', [288,216,432,672], 22, 9648000],
      ['rspg-bjm-khoirunisa', [744,696,792,720], 22, 17424000],
      ['rspg-bjm-herlisa', [600,576,504,408], 23, 12528000],
      ['rspg-plk-fani', [299,379,1440,552], 23, 16235000],
      ['rspg-plk-siska', [552,466,364,754], 22, 12303000],
      ['rspg-bpp-rami', [288,384,432,360], 25, 8928000],
      ['rspg-bpp-grace', [264,408,456,384], 26, 8832000],
      ['rspg-smd-fitriani', [384,432,456,408], 25, 9504000],
      ['rspg-smd-desi', [408,456,480,480], 25, 10836000],
      ['rspg-mks-amelia', [260,290,310,287], 26, 6459000],
      ['rspg-mks-nadira', [180,210,220,172], 26, 4388500],
      ['rspg-mdo-dea', [150,180,197,180], 26, 4204500],
      ['rspg-mdo-regina', [180,192,210,204], 26, 4716000]
    ];
    const profiles = seedProfiles();
    const dates = ['2026-07-04', '2026-07-11', '2026-07-18', '2026-07-25'];
    const rows = [];
    specs.forEach(([profileId, sellingByWeek, totalHK, totalValue]) => {
      const profile = profiles.find(item => item.id === profileId);
      const hkByWeek = distributeHK(totalHK);
      let valueUsed = 0;
      sellingByWeek.forEach((selling, index) => {
        const value = index === sellingByWeek.length - 1
          ? totalValue - valueUsed
          : Math.round(totalValue * selling / sellingByWeek.reduce((sum, current) => sum + current, 0));
        valueUsed += value;
        rows.push({
          id: `rpt-${profileId}-w${index + 1}`,
          date: dates[index],
          area: profile.area,
          profileId,
          spg: profile.spg,
          district: profile.district,
          gromin: profile.outlet,
          attendance: 'HADIR',
          hk: hkByWeek[index],
          selling,
          value,
          poAdditional: 0,
          samplingCup: Math.round(selling * .32),
          notes: 'Data demo/referensi dari workbook TL Solehudin; dapat diedit atau dihapus.',
          source: 'RECOVERED_REFERENCE'
        });
      });
    });
    return rows;
  }

  function seedStockLedgers() {
    return [
      { id:'stock-bjm-nurul', period:'2026-07', area:'Banjarmasin', district:'Banjarmasin Utara', gromin:'Farez Barokah', spg:'Nurul Agatha Pratiwi', profileId:'rspg-bjm-nurul', openingStock:4000, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi' },
      { id:'stock-bjm-khoirunisa', period:'2026-07', area:'Banjarmasin', district:'Banjarmasin Selatan', gromin:'H. Salim', spg:'Khoirunisa', profileId:'rspg-bjm-khoirunisa', openingStock:4200, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi' },
      { id:'stock-bjm-herlisa', period:'2026-07', area:'Banjarmasin', district:'Banjarmasin Tengah', gromin:'Yeyen / Ibak', spg:'Herlisa', profileId:'rspg-bjm-herlisa', openingStock:3600, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi' },
      { id:'stock-smd-fitriani', period:'2026-07', area:'Samarinda', district:'', gromin:'GROSIR TOKO ALAM SUBUR', spg:'FITRIANI', profileId:'rspg-smd-fitriani', openingStock:3048, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi' },
      { id:'stock-smd-desi', period:'2026-07', area:'Samarinda', district:'', gromin:'TOKO SURYA INDAH', spg:'DESI SUSANTI', profileId:'rspg-smd-desi', openingStock:2458, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi' },
      { id:'stock-smd-bunga', period:'2026-07', area:'Samarinda', district:'', gromin:'TOKO BUNGA RAYA', spg:'', openingStock:2448, poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-bpp-rami', period:'2026-07', area:'Balikpapan', district:'', gromin:'TOKO PERDANA', spg:'RAMI ARSITA', profileId:'rspg-bpp-rami', openingStock:3600, poAdditional:12000, baselineWeeks:[216,366,480,384,120], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-bpp-grace', period:'2026-07', area:'Balikpapan', district:'', gromin:'TOKO PERDANA', spg:'GRACE GLORY CAHYANI B.', profileId:'rspg-bpp-grace', openingStock:3600, poAdditional:12000, baselineWeeks:[168,264,528,384,120], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-fani-09', period:'2026-07', area:'Palangkaraya', district:'', gromin:'GROSIR TOKO 09', spg:'FANI FEBRIANI', profileId:'rspg-plk-fani', openingStock:2058, poAdditional:0, baselineWeeks:[83,187,0,0,0], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-fani-nouval', period:'2026-07', area:'Palangkaraya', district:'', gromin:'TOKO NOUVAL', spg:'FANI FEBRIANI', profileId:'rspg-plk-fani', openingStock:1320, poAdditional:0, baselineWeeks:[0,0,0,0,48], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-fani-tanjung', period:'2026-07', area:'Palangkaraya', district:'Pahandut', gromin:'TOKO TANJUNG', spg:'FANI FEBRIANI', profileId:'rspg-plk-fani', openingStock:2352, poAdditional:0, baselineWeeks:[216,192,1440,696,312], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-siska-wulan', period:'2026-07', area:'Palangkaraya', district:'', gromin:'GROSIR TOKO WULAN', spg:'SISKA', profileId:'rspg-plk-siska', openingStock:2835, poAdditional:0, baselineWeeks:[168,226,52,538,192], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-siska-fathur', period:'2026-07', area:'Palangkaraya', district:'Jekan Raya', gromin:'TOKO H FATHUR', spg:'SISKA', profileId:'rspg-plk-siska', openingStock:72, poAdditional:4152, baselineWeeks:[384,240,312,336,0], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-plk-siska-tanjung', period:'2026-07', area:'Palangkaraya', district:'Pahandut', gromin:'TOKO TANJUNG', spg:'SISKA', profileId:'rspg-plk-siska', openingStock:2352, poAdditional:2296, baselineWeeks:[0,0,0,0,240], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-mdo-regina', period:'2026-07', area:'Manado', district:'Tikala', gromin:'TOKO LOVELY JAYA', spg:'REGINA PUTRI PAKAYA', profileId:'rspg-mdo-regina', openingStock:31, poAdditional:1920, baselineWeeks:[165,216,222,222,90], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-mdo-dea', period:'2026-07', area:'Manado', district:'Wanea', gromin:'TOKO BINTANG HARAPAN', spg:'DEASINTA YOLANDA PUSOH', profileId:'rspg-mdo-dea', openingStock:111, poAdditional:240, baselineWeeks:[150,156,143,119,58], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-mks-amelia', period:'2026-07', area:'Makassar', district:'Panakkukang', gromin:'TOKO KARIWISI JAYA', spg:'AMELIA HAKIM', profileId:'rspg-mks-amelia', openingStock:989, poAdditional:8100, baselineWeeks:[232,273,290,260,92], autoFromReporting:false, validation:'Belum Validasi' },
      { id:'stock-mks-nadira', period:'2026-07', area:'Makassar', district:'Rappocini', gromin:'TOKO BINTANG TERANG', spg:'ST NADIRA', profileId:'rspg-mks-nadira', openingStock:624, poAdditional:2400, baselineWeeks:[99,282,150,201,50], autoFromReporting:false, validation:'Belum Validasi' }
    ];
  }

  function seedCoaching() {
    return [
      { id:'coach-khoirunisa-jul', date:'2026-07-15', area:'Banjarmasin', profileId:'rspg-bjm-khoirunisa', spg:'Khoirunisa', beforeAvg:84, afterAvg:96, topic:'Selling skill & product knowledge', action:'Role play opening, probing kebutuhan, dan closing; review harian.', status:'Selesai', notes:'Referensi pola COACHING WEEKLY.' },
      { id:'coach-herlisa-jul', date:'2026-07-15', area:'Banjarmasin', profileId:'rspg-bjm-herlisa', spg:'Herlisa', beforeAvg:78, afterAvg:96, topic:'Direct selling & area spreading', action:'Perluas titik sampling dan evaluasi traffic per jam.', status:'Selesai', notes:'Referensi pola before vs after.' }
    ];
  }

  function seedPica() {
    return [
      { id:'pica-bjm-traffic', area:'Banjarmasin', profileId:'rspg-bjm-nurul', spg:'Nurul Agatha Pratiwi', problem:'Traffic outlet belum stabil', identification:'Penjualan dan sampling terkonsentrasi pada jam tertentu.', corrective:'Susun ulang jam spreading dan titik prioritas.', action:'TL review traffic, SPG jalankan PJP baru, SCO bantu alternatif outlet.', dueDate:'2026-08-20', pic:'SPG, SCO NANDRA, TL SOLEHUDIN', status:'In Process' },
      { id:'pica-plk-stock', area:'Palangkaraya', profileId:'rspg-plk-siska', spg:'Siska', problem:'Stock antar-outlet tidak seimbang', identification:'Buffer stock tinggi di satu toko dan rendah di toko lain.', corrective:'Validasi fisik dan redistribusi stock.', action:'Cek stock aktual, cocokkan PO, lalu konfirmasi melalui Cek Stock.', dueDate:'2026-08-18', pic:'SPG SISKA, SCO LINDA, TL SOLEHUDIN', status:'Open' }
    ];
  }

  function normalizeConfig(value) {
    const config = Object.assign({}, clone(DEFAULT_CONFIG), value || {});
    config.scoByArea = Object.assign({}, DEFAULT_CONFIG.scoByArea, value?.scoByArea || {});
    config.expenseByArea = Object.assign({}, DEFAULT_CONFIG.expenseByArea, value?.expenseByArea || {});
    config.quotaByArea = Object.assign({}, DEFAULT_CONFIG.quotaByArea, value?.quotaByArea || {});
    return config;
  }
  function normalizeData(data) {
    data.reportingConfig = normalizeConfig(data.reportingConfig);
    const shouldSeedDemo = data.seedMode !== 'clean' && data.demoReportingInitialized !== true;
    if (!Array.isArray(data.reportingProfiles)) data.reportingProfiles = [];
    if (!Array.isArray(data.reportingDaily)) data.reportingDaily = [];
    if (!Array.isArray(data.stockLedgers)) data.stockLedgers = [];
    if (!Array.isArray(data.coachingRecords)) data.coachingRecords = [];
    if (!Array.isArray(data.picaRecords)) data.picaRecords = [];
    if (!Array.isArray(data.reportingLocks)) data.reportingLocks = [];
    if (shouldSeedDemo) {
      if (!data.reportingProfiles.length) data.reportingProfiles = seedProfiles();
      if (!data.reportingDaily.length) data.reportingDaily = seedDailyReports();
      if (!data.stockLedgers.length) data.stockLedgers = seedStockLedgers();
      if (!data.coachingRecords.length) data.coachingRecords = seedCoaching();
      if (!data.picaRecords.length) data.picaRecords = seedPica();
      data.demoReportingInitialized = true;
    }
    data.reportingProfiles = data.reportingProfiles.map(profile => Object.assign({
      id: uid('rspg'), area:'Banjarmasin', spg:'SPG', outlet:'', district:'', joinDate:'', status:'Aktif', targetHK:26, targetMonth:3240,
      resignDate:'', resignReason:'', lostManDays:0, commitmentDate:'', notes:''
    }, profile));
    data.reportingDaily = data.reportingDaily.map(record => Object.assign({
      id:uid('rpt'), date:'2026-07-01', area:'Banjarmasin', profileId:'', spg:'', district:'', gromin:'', attendance:'HADIR', hk:1,
      selling:0, value:0, poAdditional:0, samplingCup:0, notes:'', source:'MANUAL',locationId:'',receiptId:'',receiptName:'',receiptType:'',receiptSize:0,receiptUploadedAt:'',receiptData:'',receiptStatus:'Belum Diperiksa',receiptReviewNote:'',receiptReviewedAt:'',receiptReviewedBy:''
    }, record));
    data.stockLedgers = data.stockLedgers.map(record => Object.assign({
      id:uid('stock'), period:'2026-07', area:'Banjarmasin', district:'', gromin:'', spg:'', profileId:'', openingStock:0,
      poAdditional:0, baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi', notes:''
    }, record, { baselineWeeks: Array.from({length:5}, (_, index) => n(record.baselineWeeks?.[index])) }));
    ui.period = ui.period || data.reportingConfig.defaultPeriod;
    ui.stockPeriod = ui.stockPeriod || data.reportingConfig.defaultPeriod;
    return data;
  }

  function lockMatches(lock, period, area, spg) {
    if (!lock || lock.period !== period) return false;
    const areaMatch = lock.area === 'Semua' || (area !== 'Semua' && lock.area === area);
    const spgMatch = lock.spg === 'Semua' || (spg !== 'Semua' && lock.spg === spg);
    return areaMatch && spgMatch;
  }
  function activeReportLock(ctx, period = ui.period, area = ui.area, spg = ui.spg) {
    return (ctx.data.reportingLocks || []).find(lock => lockMatches(lock, period, area, spg));
  }
  function exactReportLock(ctx, period = ui.period, area = ui.area, spg = ui.spg) {
    return (ctx.data.reportingLocks || []).find(lock => lock.period === period && lock.area === area && lock.spg === spg);
  }
  function isRecordLocked(ctx, record) {
    return Boolean(activeReportLock(ctx, periodOf(record?.date), record?.area || 'Semua', record?.profileId || record?.spg || 'Semua'));
  }
  function needsAttention(row) {
    return n(row.hk) === 0 || n(row.selling) === 0 || n(row.achievementMonth) < 0.8 || String(row.achievementZone?.color || '') === 'red';
  }
  function attentionReason(row) {
    const reasons=[];
    if(n(row.hk)===0)reasons.push('HK belum tercatat');
    if(n(row.selling)===0)reasons.push('selling masih 0');
    if(n(row.achievementMonth)<0.8)reasons.push(`pencapaian ${pct(row.achievementMonth,1)}`);
    if(String(row.achievementZone?.color||'')==='red')reasons.push('status merah');
    return [...new Set(reasons)].join(' • ')||'Perlu diperiksa';
  }
  function reportApprovalCard(ctx) {
    if (!isTl(ctx) && !isMonitor(ctx)) return '';
    const locked = activeReportLock(ctx);
    const exact = exactReportLock(ctx);
    const scope = `${ui.area === 'Semua' ? 'semua area' : ui.area} • ${ui.spg === 'Semua' ? 'semua SPG' : 'SPG terpilih'}`;
    const stamp = locked?.lockedAt ? formatDate(String(locked.lockedAt).slice(0,10)) : '';
    return `<div class="card report-approval-card ${locked ? 'is-locked' : ''}">
      <div><span class="badge ${locked ? 'green' : 'yellow'}">${locked ? 'LAPORAN DISETUJUI' : 'MENUNGGU PERSETUJUAN'}</span><h3>${locked ? 'Data periode ini sudah dikunci.' : isMonitor(ctx) ? 'Menunggu pemeriksaan dan persetujuan TL.' : 'Periksa lalu kunci laporan.'}</h3><p>${ctx.escapeHtml(monthLabel(ui.period))} • ${ctx.escapeHtml(scope)}${stamp ? ` • ${ctx.escapeHtml(stamp)}` : ''}</p></div>
      ${isTl(ctx) && (!locked || exact) ? `<button class="btn ${exact ? 'soft' : 'primary'}" id="toggleReportLockBtn">${exact ? 'Buka Kunci' : 'Setujui & Kunci'}</button>` : ''}
    </div>`;
  }

  function config(ctx) { return normalizeConfig(ctx.data.reportingConfig); }
  function allowedAreas(ctx) {
    const configured = Array.isArray(ctx.allowedAreas) ? ctx.allowedAreas.filter(Boolean) : [];
    if (!configured.length) return AREA_ORDER.slice();
    return AREA_ORDER.filter(area => configured.includes(area)).concat(configured.filter(area => !AREA_ORDER.includes(area)));
  }
  function areaAllowed(ctx, area) { return allowedAreas(ctx).includes(area); }
  function profiles(ctx, area = 'Semua') {
    return (ctx.data.reportingProfiles || []).filter(profile => areaAllowed(ctx, profile.area) && (area === 'Semua' || profile.area === area))
      .slice().sort((a,b) => areaSort(a.area,b.area) || String(a.spg).localeCompare(String(b.spg)));
  }
  function placementLocations(ctx,area='Semua') {
    return (ctx.placementLocations||ctx.data.placementLocations||[]).filter(row=>row.status!=='Nonaktif'&&areaAllowed(ctx,row.area)&&(area==='Semua'||row.area===area)).slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
  }
  function locationForReport(ctx,record={},profile=null) {
    const rows=placementLocations(ctx,record.area||profile?.area||'Semua');
    return rows.find(row=>row.id===record.locationId)||rows.find(row=>norm(row.name)===norm(record.gromin||profile?.outlet))||null;
  }
  function locationOptions(ctx,area,selectedId='',fallbackName='') {
    const rows=placementLocations(ctx,area),known=rows.some(row=>row.id===selectedId),legacy=!known&&fallbackName;
    return `<option value="">Pilih grosir/toko</option>${legacy?`<option value="" selected>${htmlEscape(fallbackName)} (belum terhubung)</option>`:''}${rows.map(row=>`<option value="${htmlEscape(row.id)}" ${row.id===selectedId?'selected':''}>${htmlEscape(row.name)} — ${htmlEscape(row.district||'Kecamatan belum diisi')}</option>`).join('')}`;
  }
  function receiptPreviewHtml(ctx,receipt={}) {
    const has=Boolean(receipt.receiptId||receipt.receiptData||receipt.id||receipt.dataUrl),name=receipt.receiptName||receipt.fileName||'Nota belum dipilih',type=receipt.receiptType||receipt.mimeType||'';
    if(!has)return '<div class="receipt-upload-preview empty"><span>🧾</span><div><b>Belum ada nota</b><small>Pilih foto atau PDF nota.</small></div></div>';
    return `<div class="receipt-upload-preview"><span>${type==='application/pdf'?'📄':'🖼️'}</span><div><b>${htmlEscape(name)}</b><small>${type==='application/pdf'?'PDF':'Gambar nota'}${receipt.receiptSize||receipt.size?` • ${Math.max(1,Math.round(n(receipt.receiptSize||receipt.size)/1024))} KB`:''}</small></div></div>`;
  }
  function dailyRows(ctx, period = ui.period, area = ui.area, spg = 'Semua') {
    return (ctx.data.reportingDaily || []).filter(record => {
      const periodMatch = !period || periodOf(record.date) === period;
      const areaMatch = area === 'Semua' || record.area === area;
      const spgMatch = spg === 'Semua' || record.profileId === spg || norm(record.spg) === norm(spg);
      return areaAllowed(ctx, record.area) && periodMatch && areaMatch && spgMatch;
    });
  }
  function sameOutlet(left,right) {
    const a=norm(left),b=norm(right);
    return !a||!b||a===b||a.includes(b)||b.includes(a);
  }
  function matchDailyToLedger(record, ledger) {
    if (ledger.profileId && record.profileId) return ledger.profileId === record.profileId && sameOutlet(record.gromin,ledger.gromin);
    if (ledger.spg && norm(record.spg) !== norm(ledger.spg)) return false;
    return !ledger.gromin || !record.gromin || norm(record.gromin) === norm(ledger.gromin);
  }
  function stockRows(ctx, period = ui.stockPeriod, area = ui.stockArea) {
    return (ctx.data.stockLedgers || []).filter(row => areaAllowed(ctx, row.area) && row.period === period && (area === 'Semua' || row.area === area)).map(ledger => {
      const linked = dailyRows(ctx, period, ledger.area).filter(record => matchDailyToLedger(record, ledger));
      const reportWeeks = [0,0,0,0,0];
      linked.forEach(record => { reportWeeks[weekIndex(record.date)] += n(record.selling); });
      const hasReporting = reportWeeks.some(Boolean);
      const weeks = ledger.autoFromReporting && hasReporting ? reportWeeks : Array.from({length:5}, (_, index) => n(ledger.baselineWeeks?.[index]));
      const reportPo = ledger.autoFromReporting ? linked.reduce((sum, record) => sum + n(record.poAdditional), 0) : 0;
      const po = n(ledger.poAdditional) + reportPo;
      const actual = n(ledger.openingStock) + po - weeks.reduce((sum, value) => sum + value, 0);
      return Object.assign({}, ledger, { weeks, po, actual, linkedCount: linked.length, sourceLabel: ledger.autoFromReporting && hasReporting ? 'Otomatis dari Reporting SPG' : 'Nilai stock/template' });
    }).sort((a,b) => areaSort(a.area,b.area) || String(a.spg).localeCompare(String(b.spg)) || String(a.gromin).localeCompare(String(b.gromin)));
  }

  function aggregateSpg(ctx, period = ui.period, area = ui.area, spg = 'Semua') {
    const cfg = config(ctx);
    const periodProfiles = profiles(ctx, area).filter(profile => spg === 'Semua' || profile.id === spg || norm(profile.spg) === norm(spg));
    const records = dailyRows(ctx, period, area, spg);
    const seen = new Set(periodProfiles.map(profile => profile.id));
    records.forEach(record => {
      if (!seen.has(record.profileId || `name:${record.area}:${record.spg}`)) {
        periodProfiles.push({ id:record.profileId || `name:${record.area}:${record.spg}`, area:record.area, spg:record.spg, outlet:record.gromin, district:record.district, status:'Aktif', targetHK:26, targetMonth:record.area === 'Banjarmasin' || record.area === 'Palangkaraya' ? 3240 : 2880 });
      }
    });
    return periodProfiles.map(profile => {
      const linked = records.filter(record => record.profileId === profile.id || (!record.profileId && record.area === profile.area && norm(record.spg) === norm(profile.spg)));
      const weekly = Array.from({length:5}, () => ({ selling:0, hk:0, value:0, sampling:0 }));
      linked.forEach(record => {
        const index = weekIndex(record.date);
        weekly[index].selling += n(record.selling);
        weekly[index].hk += n(record.hk);
        weekly[index].value += n(record.value);
        weekly[index].sampling += n(record.samplingCup);
      });
      const hk = linked.reduce((sum, record) => sum + n(record.hk), 0);
      const selling = linked.reduce((sum, record) => sum + n(record.selling), 0);
      const value = linked.reduce((sum, record) => sum + n(record.value), 0);
      const sampling = linked.reduce((sum, record) => sum + n(record.samplingCup), 0);
      const targetByHK = hk * n(cfg.targetDailyCan);
      const targetMonth = n(profile.targetMonth || 3240);
      const targetHK = n(profile.targetHK || 26);
      const expenseRate = n(cfg.expenseByArea[profile.area]);
      const expenseActual = expenseRate * hk;
      const ratio = value > 0 ? expenseActual / value : 0;
      const avg = hk > 0 ? selling / hk : 0;
      const achievementHK = targetByHK > 0 ? selling / targetByHK : 0;
      const achievementMonth = targetMonth > 0 ? selling / targetMonth : 0;
      const remainingHK = Math.max(targetHK - hk, 0);
      const gapCan = Math.max(targetMonth - selling, 0);
      const gapCanPerDay = remainingHK > 0 ? gapCan / remainingHK : gapCan;
      const targetValue = cfg.ratioCommitment > 0 ? expenseActual / cfg.ratioCommitment : 0;
      const needsValue = Math.max(targetValue - value, 0);
      const samplingTarget = hk * cfg.targetSamplingCup;
      return {
        profile, id:profile.id, area:profile.area, spg:profile.spg, outlet:profile.outlet, district:profile.district, status:profile.status,
        linked, weekly, hk, targetHK, targetByHK, selling, value, sampling, targetMonth, achievementHK, achievementMonth, avg,
        expenseRate, expenseActual, ratio, remainingHK, gapCan, gapCanPerDay, gapCartonPerDay:gapCanPerDay / cfg.pcsPerCarton,
        targetValue, needsValue, target80:targetMonth * .8, remaining80:Math.max(targetMonth * .8 - selling, 0), samplingTarget,
        samplingAchievement:samplingTarget > 0 ? sampling / samplingTarget : 0,
        ratioZone:ratioZone(ratio), achievementZone:achievementZone(achievementMonth)
      };
    }).sort((a,b) => areaSort(a.area,b.area) || b.selling - a.selling || String(a.spg).localeCompare(String(b.spg)));
  }

  function aggregateArea(ctx, period = ui.period, area = ui.area, spg = 'Semua') {
    const spgs = aggregateSpg(ctx, period, area, spg);
    const groups = new Map();
    spgs.forEach(row => {
      if (!groups.has(row.area)) groups.set(row.area, []);
      groups.get(row.area).push(row);
    });
    return Array.from(groups, ([areaName, rows]) => {
      const active = rows.filter(row => String(row.status).toLowerCase() !== 'vacant');
      const hk = rows.reduce((sum,row) => sum + row.hk, 0);
      const selling = rows.reduce((sum,row) => sum + row.selling, 0);
      const value = rows.reduce((sum,row) => sum + row.value, 0);
      const expenseActual = rows.reduce((sum,row) => sum + row.expenseActual, 0);
      const targetMonth = rows.reduce((sum,row) => sum + row.targetMonth, 0);
      const quota = n(config(ctx).quotaByArea[areaName] || rows.length);
      const actual = active.length;
      return {
        area:areaName, rows, active:actual, quota, vacant:Math.max(quota - actual, rows.filter(row => String(row.status).toLowerCase() === 'vacant').length),
        hk, selling, value, expenseActual, avg:hk ? selling/hk : 0, ratio:value ? expenseActual/value : 0,
        targetMonth, achievement:targetMonth ? selling/targetMonth : 0
      };
    }).sort((a,b) => areaSort(a.area,b.area));
  }

  function pct(value, digits = 0) { return `${round(n(value) * 100, digits)}%`; }
  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { day:'2-digit', month:'short', year:'numeric' }).format(date);
  }
  function areaOptions(ctx, selected, includeAll = true) {
    return `${includeAll ? `<option value="Semua" ${selected === 'Semua' ? 'selected' : ''}>Semua Area Diizinkan</option>` : ''}${allowedAreas(ctx).map(area => `<option value="${area}" ${selected === area ? 'selected' : ''}>${area}${isFocusFor(ctx,area) ? ' • FOKUS' : ''}</option>`).join('')}`;
  }
  function profileOptions(ctx, selected, area = 'Semua', includeVacant = false) {
    return profiles(ctx, area).filter(profile => includeVacant || String(profile.status).toLowerCase() !== 'vacant')
      .map(profile => `<option value="${ctx.escapeAttr(profile.id)}" ${selected === profile.id ? 'selected' : ''}>${ctx.escapeHtml(profile.spg)} — ${ctx.escapeHtml(profile.area)}</option>`).join('');
  }
  function reportingFilter(ctx, actions = '') {
    const monitor=isMonitor(ctx);
    if (monitor && (ui.area === 'Semua' || !areaAllowed(ctx,ui.area))) ui.area=allowedAreas(ctx)[0]||'Banjarmasin';
    if (!monitor && ui.area !== 'Semua' && !areaAllowed(ctx, ui.area)) ui.area = 'Semua';
    const availableProfiles = profiles(ctx, ui.area).filter(profile => String(profile.status).toLowerCase() !== 'vacant');
    if (ui.spg !== 'Semua' && !availableProfiles.some(profile => profile.id === ui.spg)) ui.spg = 'Semua';
    return `<div class="card report-filter-card"><div class="report-filter-row">
      <div class="field"><label>Periode laporan</label><input type="month" id="reportPeriodFilter" value="${ctx.escapeAttr(ui.period)}"></div>
      <div class="field"><label>Area</label><select id="reportAreaFilter">${areaOptions(ctx, ui.area, !monitor)}</select></div>
      <div class="field"><label>SPG</label><select id="reportSpgFilter"><option value="Semua">Semua SPG</option>${availableProfiles.map(profile => `<option value="${ctx.escapeAttr(profile.id)}" ${ui.spg === profile.id ? 'selected' : ''}>${ctx.escapeHtml(profile.spg)} — ${ctx.escapeHtml(profile.area)}</option>`).join('')}</select></div>
      <div class="btn-row">${actions}</div>
    </div></div>`;
  }
  function monitorExportRangeControls(prefix='monitor',compact=false) {
    ui.exportPeriodStart=ui.exportPeriodStart||ui.period;ui.exportPeriodEnd=ui.exportPeriodEnd||ui.period;
    return `<div class="monitor-export-range ${compact?'compact':''}"><label>Dari bulan<input type="month" id="${prefix}ExportStart" value="${ui.exportPeriodStart}"></label><label>Sampai bulan<input type="month" id="${prefix}ExportEnd" value="${ui.exportPeriodEnd}"></label><div class="btn-row"><button class="btn soft" id="${prefix}ExportExcelBtn">📥 Excel WIP</button><button class="btn dark" id="${prefix}ExportPdfBtn">🖨️ PDF</button></div></div>`;
  }
  function bindMonitorExportRange(ctx,prefix='monitor') {
    const update=()=>{const start=document.getElementById(`${prefix}ExportStart`)?.value||ui.period,end=document.getElementById(`${prefix}ExportEnd`)?.value||ui.period;ui.exportPeriodStart=start;ui.exportPeriodEnd=end;saveMonitorFilters(ctx);};
    document.getElementById(`${prefix}ExportStart`)?.addEventListener('change',update);document.getElementById(`${prefix}ExportEnd`)?.addEventListener('change',update);
    document.getElementById(`${prefix}ExportExcelBtn`)?.addEventListener('click',async()=>{update();ui.exportAttention=ui.monitorAttention;try{await exportReportingExcel(ctx,false);}finally{ui.exportAttention='';}});
    document.getElementById(`${prefix}ExportPdfBtn`)?.addEventListener('click',()=>{update();ui.exportAttention=ui.monitorAttention;try{exportReportingPdf(ctx);}finally{ui.exportAttention='';}});
  }

  function focusAreaCards(ctx) {
    if (!isTl(ctx)) return '';
    const areas = aggregateArea(ctx, ui.period, 'Semua');
    const focus = ACTIVE_FOCUS_AREAS.filter(areaName=>areaAllowed(ctx,areaName));
    if (!focus.length) return '';
    return `<div class="focus-area-grid">${focus.map(areaName => {
      const row = areas.find(item => item.area === areaName) || { area:areaName, selling:0, value:0, avg:0, ratio:0, achievement:0, vacant:0 };
      return `<article class="focus-area-card">
        <div class="btn-row" style="justify-content:space-between"><div><h3>${areaName}</h3><small>Homebase & fokus TL Solehudin</small></div>${badge(row.ratio ? ratioZone(row.ratio).label : 'Belum ada data', row.ratio ? ratioZone(row.ratio).color : 'gray')}</div>
        <div class="focus-kpis">
          <span>SELLING<b>${ctx.number(row.selling)}</b></span>
          <span>AVG / HK<b>${round(row.avg,1)}</b></span>
          <span>ACH MONTH<b>${pct(row.achievement,1)}</b></span>
          <span>RATIO<b>${pct(row.ratio,1)}</b></span>
        </div>
      </article>`;
    }).join('')}</div>`;
  }

  function reportKpi(ctx, label, value, note, icon) {
    return `<div class="card kpi"><div><small>${label}</small><div class="num">${value}</div><small>${note}</small></div><div class="kpi-icon">${icon}</div></div>`;
  }

  function reportingSnapshot(ctx, period = ui.period, area = ui.area, spg = ui.spg) {
    const rows = aggregateSpg(ctx, period, area, spg).filter(row => String(row.status).toLowerCase() !== 'vacant');
    const areas = aggregateArea(ctx, period, area, spg);
    const totals = rows.reduce((acc, row) => {
      acc.hk += row.hk;
      acc.selling += row.selling;
      acc.value += row.value;
      acc.expense += row.expenseActual;
      acc.target += row.targetMonth;
      acc.sampling += row.sampling;
      return acc;
    }, { hk:0, selling:0, value:0, expense:0, target:0, sampling:0 });
    totals.avg = totals.hk ? totals.selling / totals.hk : 0;
    totals.achievement = totals.target ? totals.selling / totals.target : 0;
    totals.ratio = totals.value ? totals.expense / totals.value : 0;
    return { rows, areas, totals };
  }

  function renderReportingOverview(ctx) {
    const { rows, areas, totals } = reportingSnapshot(ctx);
    const selected = ui.spg === 'Semua' ? 'Semua SPG' : (profiles(ctx).find(profile => profile.id === ui.spg)?.spg || 'SPG terpilih');
    const monitor=isMonitor(ctx);
    const weekly=Array.from({length:5},(_,index)=>({label:`Minggu ${index+1}`,value:rows.reduce((sum,row)=>sum+n(row.weekly[index]?.selling),0)}));
    return `<section class="reporting-overview" aria-label="Statistik reporting sesuai filter">
      <div class="reporting-overview-head"><div><h3>${monitor?'Statistik Mingguan SPG':'Statistik Sesuai Filter'}</h3><small>${ctx.escapeHtml(monthLabel(ui.period))} • ${ctx.escapeHtml(ui.area === 'Semua' ? 'Semua Area' : ui.area)} • ${ctx.escapeHtml(selected)}</small></div>${badge(`${rows.length} SPG`, rows.length ? 'blue' : 'gray')}</div>
      <div class="reporting-stat-grid">
        ${reportKpi(ctx, 'Actual HK', ctx.number(totals.hk), 'seluruh hasil filter', '🗓️')}
        ${reportKpi(ctx, 'Selling', ctx.number(totals.selling), `${round(totals.avg,1)} can/HK`, '🥫')}
        ${reportKpi(ctx, 'Achievement', pct(totals.achievement,1), 'actual ÷ target bulanan', '🎯')}
        ${reportKpi(ctx, 'Value', ctx.money(totals.value), 'nilai penjualan', '💰')}
        ${reportKpi(ctx, 'Ratio', pct(totals.ratio,1), ratioZone(totals.ratio).label, '⚖️')}
        ${reportKpi(ctx, 'Sampling', ctx.number(totals.sampling), 'cup tercatat', '🥤')}
      </div>
      <div class="reporting-stat-charts">
        <div class="card"><h3>${monitor?'Selling per Minggu':'Selling per Area'}</h3><small>${monitor?'Perkembangan setiap minggu pada area terpilih.':'Angka mengikuti periode, area, dan SPG yang dipilih.'}</small><div class="hbar-list">${horizontalBarRows((monitor?weekly:areas.map(row => ({ label:row.area, value:row.selling, color:isFocusFor(ctx,row.area)?'green':'' }))), value => ctx.number(value))}</div></div>
        ${monitor?`<div class="card"><h3>Status Pencapaian SPG</h3><small>Jumlah SPG menurut warna pencapaian pada filter.</small><div class="stat-list">${['green','blue','yellow','red'].map(color=>{const label={green:'Target tercapai',blue:'Sangat baik',yellow:'Perlu didorong',red:'Perlu perhatian'}[color];return `<div class="stat-line"><span>${label}</span>${badge(`${rows.filter(row=>row.achievementZone?.color===color).length} SPG`,color)}</div>`;}).join('')}</div></div>`:`<div class="card"><h3>AVG per SPG</h3><small>Lima SPG dengan rata-rata selling/HK tertinggi pada filter.</small><div class="hbar-list">${horizontalBarRows(rows.slice().sort((a,b)=>b.avg-a.avg).slice(0,5).map(row => ({ label:row.spg, value:row.avg, color:isFocusFor(ctx,row.area)?'yellow':'' })), value => round(value,1))}</div></div>`}
      </div>
    </section>`;
  }

  function monitorWeeklyRows(ctx,area,period=ui.period) {
    return aggregateSpg(ctx,period,area,'Semua').filter(row=>String(row.status).toLowerCase()!=='vacant');
  }

  function renderMonitorDashboard(ctx,area) {
    rememberRole(ctx);
    const selected=areaAllowed(ctx,area)?area:(allowedAreas(ctx)[0]||'Banjarmasin');
    ui.area=selected;ui.spg='Semua';
    const period=ui.period||config(ctx).defaultPeriod;
    ui.period=period;saveMonitorFilters(ctx);
    const allRows=monitorWeeklyRows(ctx,selected,period),attention=allRows.filter(needsAttention);
    const rows=ui.monitorAttention==='Perlu Perhatian'?attention:allRows;
    const totals=rows.reduce((acc,row)=>{acc.hk+=row.hk;acc.selling+=row.selling;acc.value+=row.value;acc.target+=row.targetMonth;acc.sampling+=row.sampling;row.weekly.forEach((week,index)=>{acc.weekly[index]+=n(week.selling);});return acc;},{hk:0,selling:0,value:0,target:0,sampling:0,weekly:[0,0,0,0,0]});
    const avg=totals.hk?totals.selling/totals.hk:0,achievement=totals.target?totals.selling/totals.target:0,currentWeek=Math.max(0,totals.weekly.map((value,index)=>value>0?index:-1).reduce((a,b)=>Math.max(a,b),-1)),previousWeek=Math.max(0,currentWeek-1),currentTotal=totals.weekly[currentWeek]||0,previousTotal=currentWeek?totals.weekly[previousWeek]||0:0,weekDelta=currentWeek?currentTotal-previousTotal:currentTotal;
    const detailRows=rows.map(row=>{const status=row.achievementZone||achievementZone(row.achievementMonth);return `<tr><td><b>${ctx.escapeHtml(row.spg)}</b><small class="table-subline">${ctx.escapeHtml(row.outlet||'-')}</small></td><td>${ctx.number(row.hk)}</td>${row.weekly.map(week=>`<td>${ctx.number(week.selling)}</td>`).join('')}<td><b>${ctx.number(row.selling)}</b></td><td>${round(row.avg,1)}</td><td>${pct(row.achievementMonth,1)}</td><td>${ctx.number(row.sampling)}</td><td>${badge(status.label,status.color)}</td></tr>`;}).join('');
    const comparisonRows=rows.map(row=>{const current=n(row.weekly[currentWeek]?.selling),previous=currentWeek?n(row.weekly[previousWeek]?.selling):0,delta=current-previous,color=delta>0?'green':delta<0?'red':'gray';return `<tr><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.number(previous)}</td><td>${ctx.number(current)}</td><td>${badge(`${delta>0?'+':''}${ctx.number(delta)}`,color)}</td><td>${badge(delta>0?'Naik':delta<0?'Turun':'Tetap',color)}</td></tr>`;}).join('');
    const top=allRows.slice().sort((a,b)=>b.avg-a.avg)[0],bestWeek=totals.weekly.reduce((best,value,index)=>value>best.value?{index,value}:best,{index:0,value:-1});
    return `<section class="monitor-weekly-dashboard" aria-label="Dashboard mingguan SPG">
      <div class="card monitor-dashboard-head"><div><span class="badge blue">RINGKASAN EKSEKUTIF • ${ctx.escapeHtml(selected.toUpperCase())}</span><h2>Perkembangan mingguan setiap SPG.</h2><p>${ctx.escapeHtml(monthLabel(period))} • data hanya dari area yang sedang dipilih.</p></div><div class="monitor-head-actions"><label>Fokus data<select id="monitorAttentionFilter"><option value="Semua" ${ui.monitorAttention==='Semua'?'selected':''}>Semua SPG</option><option value="Perlu Perhatian" ${ui.monitorAttention==='Perlu Perhatian'?'selected':''}>Perlu Perhatian</option></select></label>${monitorExportRangeControls('monitorDashboard',true)}</div></div>
      <div class="card executive-summary-card"><h3>Kesimpulan cepat</h3><div class="executive-summary-grid"><div><span>SPG perlu perhatian</span><b>${ctx.number(attention.length)}</b><small>dari ${ctx.number(allRows.length)} SPG</small></div><div><span>SPG rata-rata terbaik</span><b>${ctx.escapeHtml(top?.spg||'-')}</b><small>${top?`${round(top.avg,1)} can/HK`:'belum ada data'}</small></div><div><span>Perubahan minggu</span><b>${weekDelta>0?'+':''}${ctx.number(weekDelta)} can</b><small>W${previousWeek+1} ke W${currentWeek+1}</small></div><div><span>Minggu terkuat</span><b>Minggu ${bestWeek.index+1}</b><small>${ctx.number(Math.max(0,bestWeek.value))} can</small></div></div></div>
      ${reportApprovalCard(ctx)}
      <div class="reporting-stat-grid monitor-stat-grid">${reportKpi(ctx,ui.monitorAttention==='Perlu Perhatian'?'Perlu Perhatian':'SPG Aktif',ctx.number(rows.length),ui.monitorAttention==='Perlu Perhatian'?`dari ${allRows.length} SPG`:selected,'👥')}${reportKpi(ctx,'Actual HK',ctx.number(totals.hk),'periode berjalan','🗓️')}${reportKpi(ctx,'Selling',ctx.number(totals.selling),`${round(avg,1)} can/HK`,'🥫')}${reportKpi(ctx,'Achievement',pct(achievement,1),'terhadap target bulanan','🎯')}${reportKpi(ctx,'Nilai',ctx.money(totals.value),'penjualan tercatat','💰')}${reportKpi(ctx,'Sampling',ctx.number(totals.sampling),'cup tercatat','🥤')}</div>
      <div class="reporting-stat-charts monitor-chart-grid"><div class="card"><h3>Total Selling per Minggu</h3><small>Lihat naik-turun hasil area dari Minggu 1 sampai Minggu 5.</small><div class="hbar-list">${horizontalBarRows(totals.weekly.map((value,index)=>({label:`Minggu ${index+1}`,value})),value=>ctx.number(value))}</div></div><div class="card"><h3>Perbandingan Mingguan per SPG</h3><small>Perubahan dari W${previousWeek+1} ke W${currentWeek+1}. Informasi AVG tetap tersedia pada tabel rincian.</small><div class="table-wrap"><table class="report-table compact-report-table"><thead><tr><th>SPG</th><th>W${previousWeek+1}</th><th>W${currentWeek+1}</th><th>Selisih</th><th>Arah</th></tr></thead><tbody>${comparisonRows||'<tr><td colspan="5">Belum ada data mingguan.</td></tr>'}</tbody></table></div></div></div>
      <div class="card attention-list-card"><div class="daily-table-toolbar"><div><h3>SPG yang Perlu Perhatian</h3><small>Alasan dibuat dari HK, selling, pencapaian, dan status WIP.</small></div>${badge(`${attention.length} SPG`,attention.length?'yellow':'green')}</div>${attention.length?`<div class="attention-row-list">${attention.map(row=>`<div><span>⚠️</span><p><b>${ctx.escapeHtml(row.spg)}</b><small>${ctx.escapeHtml(attentionReason(row))}</small></p><strong>${pct(row.achievementMonth,1)}</strong></div>`).join('')}</div>`:'<div class="empty-state-report"><b>Tidak ada SPG yang masuk daftar perhatian.</b>Terus pantau hasil minggu berikutnya.</div>'}</div>
      <div class="card monitor-detail-card"><div class="daily-table-toolbar"><div><h3>Rincian Mingguan per SPG</h3><small>Angka W1–W5, total, rata-rata, pencapaian, sampling, dan status.</small></div>${badge(`${rows.length} SPG`,'blue')}</div><div class="table-wrap" style="margin-top:14px"><table class="report-table monitor-weekly-table"><thead><tr>${['Nama SPG','HK','W1','W2','W3','W4','W5','Selling','AVG/HK','Achievement','Sampling','Status'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${detailRows||'<tr><td colspan="12"><div class="empty-state-report"><b>Tidak ada data pada pilihan ini.</b>Ubah pilihan fokus untuk melihat data lainnya.</div></td></tr>'}</tbody><tfoot><tr><td>TOTAL TAMPILAN</td><td>${ctx.number(totals.hk)}</td>${totals.weekly.map(value=>`<td>${ctx.number(value)}</td>`).join('')}<td>${ctx.number(totals.selling)}</td><td>${round(avg,1)}</td><td>${pct(achievement,1)}</td><td>${ctx.number(totals.sampling)}</td><td></td></tr></tfoot></table></div></div>
    </section>`;
  }

  function bindMonitorDashboard(ctx,area) {
    const selected=areaAllowed(ctx,area)?area:(allowedAreas(ctx)[0]||'Banjarmasin');
    ui.area=selected;ui.spg='Semua';
    document.getElementById('monitorAttentionFilter')?.addEventListener('change',event=>{ui.monitorAttention=event.target.value||'Semua';saveMonitorFilters(ctx);ctx.renderPage();});
    bindMonitorExportRange(ctx,'monitorDashboard');
  }

  function renderDashboardStats(ctx) {
    rememberRole(ctx);
    const period = config(ctx).defaultPeriod || ui.period;
    const { rows, areas, totals } = reportingSnapshot(ctx, period, 'Semua', 'Semua');
    return `<section class="dashboard-reporting-stats">
      <div class="card dashboard-reporting-head"><div><span class="badge blue">STATISTIK REPORTING SPG</span><h2>Pencapaian harian dalam satu tampilan.</h2><p>Semua angka di bawah berasal dari input Reporting SPG periode ${ctx.escapeHtml(monthLabel(period))}.</p></div><button class="btn primary" data-page-jump="reportingSpg">Buka Reporting SPG</button></div>
      <div class="reporting-stat-grid dashboard-reporting-kpis">
        ${reportKpi(ctx, 'SPG Aktif', ctx.number(rows.length), 'memiliki profil reporting', '👥')}
        ${reportKpi(ctx, 'Actual HK', ctx.number(totals.hk), 'periode berjalan', '🗓️')}
        ${reportKpi(ctx, 'Selling', ctx.number(totals.selling), `${round(totals.avg,1)} can/HK`, '🥫')}
        ${reportKpi(ctx, 'Achievement', pct(totals.achievement,1), 'terhadap target', '🎯')}
        ${reportKpi(ctx, 'Value', ctx.money(totals.value), 'nilai penjualan', '💰')}
        ${reportKpi(ctx, 'Ratio', pct(totals.ratio,1), ratioZone(totals.ratio).label, '⚖️')}
      </div>
      <div class="reporting-stat-charts">
        <div class="card"><h3>Selling Reporting per Area</h3><small>Bukan data outlet—langsung dari input Reporting SPG.</small><div class="hbar-list">${horizontalBarRows(areas.map(row => ({ label:row.area, value:row.selling, color:isFocusFor(ctx,row.area)?'green':'' })), value => ctx.number(value))}</div></div>
        <div class="card"><h3>Top 5 AVG SPG</h3><small>Rata-rata selling per HK.</small><div class="hbar-list">${horizontalBarRows(rows.slice().sort((a,b)=>b.avg-a.avg).slice(0,5).map(row => ({ label:row.spg, value:row.avg, color:isFocusFor(ctx,row.area)?'yellow':'' })), value => round(value,1))}</div></div>
      </div>
    </section>`;
  }

  function renderStockPage(ctx) {
    rememberRole(ctx);
    const permittedAreas = allowedAreas(ctx);
    if (!permittedAreas.includes(ui.stockArea)) ui.stockArea = permittedAreas[0] || 'Banjarmasin';
    const cfg = config(ctx);
    const rows = stockRows(ctx, ui.stockPeriod, ui.stockArea);
    const totals = rows.reduce((acc, row) => {
      acc.opening += n(row.openingStock); acc.po += n(row.po); acc.actual += n(row.actual);
      row.weeks.forEach((value,index) => { acc.weeks[index] += n(value); });
      return acc;
    }, { opening:0, po:0, actual:0, weeks:[0,0,0,0,0] });
    const valid = rows.filter(row => row.validation === 'Sesuai').length;
    const edited = ctx.data.stockLedgers.find(item => item.id === ui.editingStockId);
    const form = edited || {
      period:ui.stockPeriod, area:ui.stockArea, district:'', gromin:'', spg:'', profileId:'', openingStock:0, poAdditional:0,
      baselineWeeks:[0,0,0,0,0], autoFromReporting:true, validation:'Belum Validasi', notes:''
    };
    const formProfile = form.profileId || profiles(ctx, form.area).find(profile => norm(profile.spg) === norm(form.spg))?.id || '';
    const blankRows = Math.max(0, 12 - rows.length);
    return `<div class="reporting-shell">
      ${ctx.pageHead('Cek Stock', 'Statistik dan keterangan stok seluruh stokis yang pernah dipegang SPG per periode.', `
        <button class="btn soft" id="exportStockAreaBtn">Export Excel</button>
        <button class="btn dark" id="exportStockPdfBtn">Export PDF</button>`)}
      <div class="card reporting-hero"><span class="badge">CEK STOCK</span><h2>Stok seluruh stokis dalam tampilan ringkas.</h2><p>Stock actual dihitung dari stok awal ditambah PO, lalu dikurangi sellout W1–W5.</p></div>
      <div class="card report-filter-card"><div class="report-filter-row">
        <div class="field"><label>Periode</label><input type="month" id="stockPeriodFilter" value="${ctx.escapeAttr(ui.stockPeriod)}"></div>
        <div class="field"><label>Area</label><select id="stockAreaFilter">${areaOptions(ctx, ui.stockArea, false)}</select></div>
        <div class="btn-row"><button class="btn ghost" id="newStockRowBtn">+ Tambah Baris Stock</button></div>
      </div></div>
      <div class="grid cols-4">
        ${reportKpi(ctx, 'Stock Awal', ctx.number(totals.opening), monthLabel(ui.stockPeriod), '📦')}
        ${reportKpi(ctx, 'PO Tambahan', ctx.number(totals.po), 'manual + Reporting SPG', '🚚')}
        ${reportKpi(ctx, 'Total Sellout', ctx.number(totals.weeks.reduce((a,b)=>a+b,0)), 'W1 sampai W5', '📈')}
        ${reportKpi(ctx, 'Sudah Valid', `${valid}/${rows.length}`, 'status outlet = Sesuai', '✅')}
      </div>
      <div class="card"><h3>Stock Actual per Stokis</h3><div class="hbar-list">${horizontalBarRows(rows.map(row=>({label:`${row.gromin||'-'} • ${row.spg||'-'}`,value:Math.max(0,row.actual),color:row.actual<1?'red':row.validation==='Sesuai'?'green':'yellow'})),value=>ctx.number(value))}</div></div>
      <div class="card" id="stockFormCard">
        <div class="btn-row" style="justify-content:space-between"><div><h3>${edited ? 'Edit Baris Stock' : 'Tambah Baris Stock'}</h3><small>Aktifkan sinkron Reporting SPG agar sellout W1–W5 terisi otomatis.</small></div>${edited ? '<button class="btn ghost" id="cancelStockEditBtn">Batal Edit</button>' : ''}</div>
        <div class="reporting-form-grid" style="margin-top:16px">
          <div class="field"><label>Periode</label><input type="month" id="stockFormPeriod" value="${ctx.escapeAttr(form.period || ui.stockPeriod)}"></div>
          <div class="field"><label>Area</label><select id="stockFormArea">${areaOptions(ctx, form.area || ui.stockArea, false)}</select></div>
          <div class="field"><label>Nama SPG</label><select id="stockFormProfile"><option value="">Pilih / isi manual</option>${profileOptions(ctx, formProfile, 'Semua', true)}</select></div>
          <div class="field"><label>Nama SPG manual</label><input id="stockFormSpg" value="${ctx.escapeAttr(form.spg || '')}" placeholder="Nama SPG / vacant"></div>
          <div class="field"><label>Nama Kecamatan</label><input id="stockFormDistrict" value="${ctx.escapeAttr(form.district || '')}" placeholder="Kecamatan"></div>
          <div class="field"><label>Nama Gromin</label><input id="stockFormGromin" value="${ctx.escapeAttr(form.gromin || '')}" placeholder="Grosir / outlet"></div>
          <div class="field"><label>Stock Awal Bulan (CAN)</label><input type="number" min="0" id="stockFormOpening" value="${n(form.openingStock)}"></div>
          <div class="field"><label>PO Tambahan Manual (CAN)</label><input type="number" min="0" id="stockFormPo" value="${n(form.poAdditional)}"></div>
          ${Array.from({length:5}, (_,index) => `<div class="field"><label>SELLOUT W${index+1} manual</label><input type="number" min="0" id="stockFormW${index+1}" value="${n(form.baselineWeeks?.[index])}"></div>`).join('')}
          <div class="field"><label>Validasi Outlet</label><select id="stockFormValidation">${['Belum Validasi','Sesuai','Selisih','Perlu Cek Ulang'].map(value => `<option ${form.validation === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
          <div class="field span-2"><label>Catatan</label><input id="stockFormNotes" value="${ctx.escapeAttr(form.notes || '')}" placeholder="Opsional"></div>
          <label class="remember-line span-2"><input type="checkbox" id="stockFormAuto" ${form.autoFromReporting !== false ? 'checked' : ''}><span>Sinkron W1–W5 dan PO dari Reporting SPG</span></label>
          <div class="reporting-form-actions"><button class="btn primary" id="saveStockRowBtn">💾 ${edited ? 'Simpan Perubahan' : 'Tambah Baris'}</button></div>
        </div>
      </div>
      <div class="source-note"><span>ℹ️</span><div><strong>Keterangan stok.</strong> W1–W5 menunjukkan sellout mingguan. Status validasi membantu menandai stok yang sesuai, selisih, atau perlu dicek ulang.</div></div>
      <div class="card stock-sheet-card">
        <div class="stock-sheet-meta">
          <div><small>Nama Area</small><b>${ctx.escapeHtml(ui.stockArea.toUpperCase())}</b></div>
          <div><small>Nama MS/SCO</small><b>${ctx.escapeHtml(cfg.scoByArea[ui.stockArea] || '-')}</b></div>
          <div><small>Periode</small><b>${ctx.escapeHtml(monthLabel(ui.stockPeriod))}</b></div>
        </div>
        <div class="stock-table-wrap"><table class="stock-table"><thead><tr>
          ${['No.','Nama Kecamatan','Nama Gromin','Nama SPG','Stock Awal Bulan (CAN)','PO TAMBAHAN OUTLET (CAN)','SELLOUT W1','SELLOUT W2','SELLOUT W3','SELLOUT W4','SELLOUT W5','Stock Actual Saat Ini (CAN)','VALIDASI OUTLET','Aksi'].map(label => `<th>${label}</th>`).join('')}
        </tr></thead><tbody>
          ${rows.map((row,index) => `<tr>
            <td>${index+1}</td><td>${ctx.escapeHtml(row.district || '-')}</td><td>${ctx.escapeHtml(row.gromin || '-')}</td><td><b>${ctx.escapeHtml(row.spg || '-')}</b><small class="stock-auto">${row.autoFromReporting && row.linkedCount ? '⚡ ' + row.sourceLabel : row.sourceLabel}</small></td>
            <td>${ctx.number(row.openingStock)}</td><td>${ctx.number(row.po)}</td>${row.weeks.map(value => `<td>${ctx.number(value)}</td>`).join('')}
            <td class="${row.actual < 0 ? 'metric-negative' : 'metric-positive'}">${ctx.number(row.actual)}</td>
            <td><select class="stock-validation-select" data-stock-validation="${ctx.escapeAttr(row.id)}">${['Belum Validasi','Sesuai','Selisih','Perlu Cek Ulang'].map(value => `<option ${row.validation === value ? 'selected' : ''}>${value}</option>`).join('')}</select></td>
            <td><div class="compact-actions"><button class="btn mini soft" data-edit-stock="${ctx.escapeAttr(row.id)}">Edit</button><button class="btn mini red" data-delete-stock="${ctx.escapeAttr(row.id)}">Hapus</button></div></td>
          </tr>`).join('')}
          ${Array.from({length:blankRows}, (_,index) => `<tr class="blank-row"><td>${rows.length+index+1}</td>${Array.from({length:13}, () => '<td></td>').join('')}</tr>`).join('')}
        </tbody><tfoot><tr><td colspan="4">TOTAL</td><td>${ctx.number(totals.opening)}</td><td>${ctx.number(totals.po)}</td>${totals.weeks.map(value => `<td>${ctx.number(value)}</td>`).join('')}<td>${ctx.number(totals.actual)}</td><td colspan="2"></td></tr></tfoot></table></div>
        <div class="stock-note"><b>NOTE :</b> 1. AM / MS sudah mengecek dan memvalidasi stock akhir gromin sudah sesuai dengan data terlampir.</div>
        <div class="stock-signatures">
          <div class="stock-signature"><b>Dibuat Oleh,</b><div class="signature-space"></div><div class="signature-name">${ctx.escapeHtml(cfg.tlName)}</div><small>TL</small></div>
          <div class="stock-signature"><b>Diperiksa Oleh,</b><div class="signature-space"></div><div class="signature-name">${ctx.escapeHtml(cfg.scoByArea[ui.stockArea] || '-')}</div><small>MS/SCO</small></div>
          <div class="stock-signature"><b>Disetujui Oleh,</b><div class="signature-space"></div><div class="signature-name">${ctx.escapeHtml(cfg.areaManagerName)}</div><small>Area Manager</small></div>
        </div>
      </div>
    </div>`;
  }

  function renderReportingPage(ctx) {
    rememberRole(ctx);
    const monitor=isMonitor(ctx);
    if(monitor&&(ui.area==='Semua'||!areaAllowed(ctx,ui.area)))ui.area=allowedAreas(ctx)[0]||'Banjarmasin';
    const tabs = enabledTabs(ctx);
    const actions = monitor?'':`<button class="btn soft" id="exportReportingAreaBtn">📥 Excel Sesuai Tampilan</button><button class="btn primary" id="exportReportingAllBtn">📚 Excel Semua Area</button><button class="btn ghost" id="exportReportingPdfBtn">🖨️ PDF Ringkasan</button>`;
    return `<div class="reporting-shell">
      ${ctx.pageHead('Reporting SPG', 'Statistik dan laporan ringkas berdasarkan periode, area, dan nama SPG.', '')}
      <div class="card reporting-hero"><span class="badge">REPORTING SPG</span><h2>Data penting dalam satu tampilan.</h2><p>Pilih periode, area, atau SPG untuk melihat statistik dan mengekspor laporan yang sama dengan tampilan.</p></div>
      ${focusAreaCards(ctx)}
      ${reportingFilter(ctx, actions)}
      ${monitor?`<div class="card monitor-export-card"><div><h3>Export WIP beberapa bulan</h3><small>Hanya memuat SPG dari ${ctx.escapeHtml(ui.area)}. Pilih bulan awal dan akhir.</small></div>${monitorExportRangeControls('monitorReporting')}</div>`:''}
      ${reportApprovalCard(ctx)}
      ${renderReportingOverview(ctx)}
      <nav class="reporting-tabs" aria-label="Submenu Reporting SPG">${tabs.map(([key,icon,label]) => `<button class="${ui.tab === key ? 'active' : ''}" data-report-tab="${key}">${icon} ${label}</button>`).join('')}</nav>
      <section>${renderReportingTab(ctx)}</section>
    </div>`;
  }

  function renderReportingTab(ctx) {
    if (ui.tab === 'coaching') return renderCoaching(ctx);
    if (ui.tab === 'pica') return renderPica(ctx);
    if (ui.tab === 'spg') return renderProfiles(ctx);
    if (ui.tab === 'wip') return renderWip(ctx);
    if (ui.tab === 'zona') return renderZones(ctx);
    if (ui.tab === 'sampling') return renderSampling(ctx);
    if (ui.tab === 'summary') return renderSummary(ctx);
    return renderDailyReporting(ctx);
  }

  function dailyPaginationHtml(page, totalPages) {
    if (totalPages <= 1) return '';
    const visible = [];
    for (let number = 1; number <= totalPages; number++) {
      if (number === 1 || number === totalPages || Math.abs(number - page) <= 1) visible.push(number);
    }
    let previous = 0;
    const numbered = visible.map(number => {
      const gap = previous && number - previous > 1 ? '<span class="pagination-gap">…</span>' : '';
      previous = number;
      return `${gap}<button class="${number === page ? 'active' : ''}" data-daily-page="${number}" aria-label="Halaman ${number}">${number}</button>`;
    }).join('');
    return `<nav class="report-pagination" aria-label="Pagination Data Input">
      <button data-daily-page="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''}>← Sebelumnya</button>
      <div>${numbered}</div>
      <button data-daily-page="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''}>Berikutnya →</button>
    </nav>`;
  }

  function renderDailyReporting(ctx) {
    const cfg = config(ctx);
    const rows = dailyRows(ctx, ui.period, ui.area, ui.spg).slice().sort((a,b) => String(b.date).localeCompare(String(a.date)) || String(a.spg).localeCompare(String(b.spg)));
    const edited = ctx.data.reportingDaily.find(item => item.id === ui.editingDailyId);
    const filterProfile = ui.spg === 'Semua' ? null : profiles(ctx).find(profile => profile.id === ui.spg);
    const defaultArea = edited?.area || filterProfile?.area || (ui.area === 'Semua' ? 'Banjarmasin' : ui.area);
    const defaultProfile = edited?.profileId || filterProfile?.id || profiles(ctx, defaultArea).find(profile => String(profile.status).toLowerCase() !== 'vacant')?.id || '';
    const selectedProfile = profiles(ctx).find(profile => profile.id === defaultProfile);
    const form = edited || { date:`${ui.period}-01`, area:defaultArea, profileId:defaultProfile, spg:selectedProfile?.spg || '', district:selectedProfile?.district || '', gromin:selectedProfile?.outlet || '', attendance:'HADIR', hk:1, selling:0, value:0, poAdditional:0, stockOpening:'', samplingCup:0, notes:'' };
    const selectedLocation=locationForReport(ctx,form,selectedProfile),selectedLocationId=form.locationId||selectedLocation?.id||'';
    const receiptForForm=ui.receiptDraft||form;
    const totals = rows.reduce((acc,row) => { acc.hk += n(row.hk); acc.selling += n(row.selling); acc.value += n(row.value); acc.po += n(row.poAdditional); acc.sampling += n(row.samplingCup); return acc; }, {hk:0,selling:0,value:0,po:0,sampling:0});
    ui.dailyPageSize = [10,20,50].includes(n(ui.dailyPageSize)) ? n(ui.dailyPageSize) : 10;
    const totalPages = Math.max(1, Math.ceil(rows.length / ui.dailyPageSize));
    ui.dailyPage = Math.max(1, Math.min(totalPages, n(ui.dailyPage) || 1));
    const start = (ui.dailyPage - 1) * ui.dailyPageSize;
    const pageRows = rows.slice(start, start + ui.dailyPageSize);
    const end = Math.min(start + pageRows.length, rows.length);
    const canEdit=ctx.canEdit!==false&&!activeReportLock(ctx);
    const customFormFields=canEdit&&ctx.renderCustomFields?ctx.renderCustomFields('reporting',form.customFields||{},'reportingDaily'):'';
    const actionHeader=canEdit?'<th>Aksi</th>':'';
    return `<div class="reporting-shell">
      <div class="grid cols-4">
        ${reportKpi(ctx, 'Actual HK', ctx.number(totals.hk), monthLabel(ui.period), '🗓️')}
        ${reportKpi(ctx, 'Selling', ctx.number(totals.selling), `${round(totals.hk ? totals.selling/totals.hk : 0,1)} can/HK`, '🥫')}
        ${reportKpi(ctx, 'Value', ctx.money(totals.value), 'input dapat diedit', '💰')}
        ${reportKpi(ctx, 'PO Tambahan', ctx.number(totals.po), 'otomatis ke Cek Stock', '🚚')}
      </div>
      ${canEdit?`<div class="card">
        <div class="btn-row" style="justify-content:space-between"><div><h3>${edited ? 'Edit Input Reporting' : 'Input Reporting SPG'}</h3><small>Boleh input harian (HK = 1) atau rangkuman beberapa hari/minggu.</small></div>${edited ? '<button class="btn ghost" id="cancelDailyEditBtn">Batal Edit</button>' : ''}</div>
        <div class="reporting-form-grid" style="margin-top:16px">
          <div class="field"><label>Tanggal</label><input type="date" id="dailyDate" value="${ctx.escapeAttr(form.date)}"></div>
          <div class="field"><label>Area</label><select id="dailyArea">${areaOptions(ctx, form.area, false)}</select></div>
          <div class="field"><label>Nama SPG</label><select id="dailyProfile"><option value="">Pilih SPG</option>${profileOptions(ctx, form.profileId, 'Semua', true)}</select></div>
          <div class="field"><label>Status Absensi</label><select id="dailyAttendance">${ATTENDANCE.map(value => `<option ${form.attendance === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
          <div class="field"><label>Jumlah HK</label><input type="number" min="0" step="1" id="dailyHK" value="${n(form.hk)}"></div>
          <div class="field"><label>Selling (CAN)</label><input type="number" min="0" id="dailySelling" value="${n(form.selling)}"></div>
          <div class="field"><label>Value (Rp)</label><input type="number" min="0" id="dailyValue" value="${n(form.value)}" data-default-price="${n(cfg.defaultSellingPrice)}"></div>
          <div class="field"><label>PO Tambahan Outlet (CAN)</label><input type="number" min="0" id="dailyPo" value="${n(form.poAdditional)}"></div>
          <div class="field"><label>Stock Awal Bulan (opsional)</label><input type="number" min="0" id="dailyOpeningStock" value="${form.stockOpening === '' || form.stockOpening == null ? '' : n(form.stockOpening)}" placeholder="Isi sekali di awal bulan"></div>
          <div class="field"><label>Sampling (cup)</label><input type="number" min="0" id="dailySampling" value="${n(form.samplingCup)}"></div>
          <div class="field"><label>Grosir / Toko</label><select id="dailyLocation">${locationOptions(ctx,form.area,selectedLocationId,form.gromin||selectedProfile?.outlet||'')}</select><small>Daftar berasal dari Master Lokasi Penempatan.</small></div>
          <div class="field"><label>Nama Kecamatan</label><input id="dailyDistrict" readonly value="${ctx.escapeAttr(selectedLocation?.district || form.district || '')}" placeholder="Terisi otomatis setelah toko dipilih"></div>
          <input type="hidden" id="dailyGromin" value="${ctx.escapeAttr(selectedLocation?.name || form.gromin || selectedProfile?.outlet || '')}">
          <div class="field span-2"><label>Upload Nota (opsional)</label><input type="file" id="dailyReceipt" accept="image/jpeg,image/png,image/webp,application/pdf"><small>Foto dikecilkan otomatis. PDF maksimal 2 MB.</small><div class="receipt-upload-progress" id="receiptUploadProgress" hidden><span></span><small>Menyiapkan nota…</small></div>${receiptPreviewHtml(ctx,receiptForForm)}</div>
          <div class="field span-4"><label>Catatan / Insight Lapangan</label><textarea id="dailyNotes" placeholder="Catatan stock, traffic, aktivitas, atau kebutuhan follow-up">${ctx.escapeHtml(form.notes || '')}</textarea></div>
          ${customFormFields}
          <div class="reporting-form-actions"><button class="btn primary" id="saveDailyReportBtn">💾 ${edited ? 'Simpan Perubahan' : 'Simpan Reporting'}</button></div>
        </div>
      </div>
      <div class="source-note"><span>⚙️</span><div><strong>Otomatis setelah disimpan:</strong> WIP, achievement, avg/HK, expense, ratio, zona, sampling, rangkuman, serta Cek Stock pada gromin yang sama akan diperbarui.</div></div>`:''}
      <div class="card"><div class="daily-table-toolbar"><div><h3>Data Input ${ctx.escapeHtml(monthLabel(ui.period))}</h3><small>${rows.length ? `Menampilkan ${start + 1}–${end} dari ${rows.length} baris` : 'Belum ada baris'} • Total di bawah memakai seluruh hasil filter.</small></div><label>Tampilkan <select id="dailyPageSize">${[10,20,50].map(size => `<option value="${size}" ${ui.dailyPageSize === size ? 'selected' : ''}>${size} baris</option>`).join('')}</select></label></div>
        <div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Tanggal','Area','Nama SPG','Grosir / Toko','Absensi','HK','Selling','Value','PO','Sampling','Nota','Catatan'].map(label=>`<th>${label}</th>`).join('')}${actionHeader}</tr></thead><tbody>
          ${pageRows.length ? pageRows.map(row => `<tr class="${isFocus(row.area) ? 'focus-row' : ''}"><td>${formatDate(row.date)}</td><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.escapeHtml(row.gromin || '-')}</td><td>${badge(ctx.escapeHtml(row.attendance), row.attendance === 'HADIR' ? 'green' : row.attendance === 'OFF' ? 'gray' : row.attendance === 'ALPHA' ? 'red' : 'yellow')}</td><td>${ctx.number(row.hk)}</td><td>${ctx.number(row.selling)}</td><td>${ctx.money(row.value)}</td><td>${ctx.number(row.poAdditional)}</td><td>${ctx.number(row.samplingCup)}</td><td>${row.receiptId||row.receiptData?`<button class="btn mini soft" data-open-receipt="${ctx.escapeAttr(row.id)}">Lihat Nota</button>`:'-'}</td><td class="wrap">${ctx.escapeHtml([row.notes,ctx.customFieldSummary?.('reporting',row.customFields)].filter(Boolean).join(' • ')||'-')}</td>${canEdit?`<td><div class="compact-actions"><button class="btn mini soft" data-edit-daily="${ctx.escapeAttr(row.id)}">Edit</button><button class="btn mini red" data-delete-daily="${ctx.escapeAttr(row.id)}">Hapus</button></div></td>`:''}</tr>`).join('') : `<tr><td colspan="${canEdit?13:12}"><div class="empty-state-report"><b>Belum ada data pada filter ini.</b>${canEdit?'Gunakan form di atas untuk memulai reporting.':'Data akan tampil setelah TL memasukkan reporting.'}</div></td></tr>`}
        </tbody><tfoot><tr><td colspan="5">TOTAL</td><td>${ctx.number(totals.hk)}</td><td>${ctx.number(totals.selling)}</td><td>${ctx.money(totals.value)}</td><td>${ctx.number(totals.po)}</td><td>${ctx.number(totals.sampling)}</td><td colspan="${canEdit?3:2}"></td></tr></tfoot></table></div>
        ${dailyPaginationHtml(ui.dailyPage, totalPages)}
      </div>
    </div>`;
  }

  function receiptFilterDefaults(ctx) {
    const period=ui.period||config(ctx).defaultPeriod||new Date().toISOString().slice(0,7),[year,month]=period.split('-').map(Number),lastDay=new Date(year,month,0).getDate();
    ui.receiptDateStart=ui.receiptDateStart||`${period}-01`;ui.receiptDateEnd=ui.receiptDateEnd||`${period}-${String(lastDay).padStart(2,'0')}`;
    const permitted=allowedAreas(ctx);if(isMonitor(ctx)&&(ui.receiptArea==='Semua'||!permitted.includes(ui.receiptArea)))ui.receiptArea=permitted[0]||'';
    if(ui.receiptArea!=='Semua'&&!permitted.includes(ui.receiptArea))ui.receiptArea=isMonitor(ctx)?(permitted[0]||''):'Semua';
  }
  function receiptRows(ctx) {
    receiptFilterDefaults(ctx);
    return (ctx.data.reportingDaily||[]).filter(row=>areaAllowed(ctx,row.area)&&(row.receiptId||row.receiptData)&&(ui.receiptArea==='Semua'||row.area===ui.receiptArea)&&(ui.receiptSpg==='Semua'||norm(row.spg)===norm(ui.receiptSpg))&&(ui.receiptStatus==='Semua'||(row.receiptStatus||'Belum Diperiksa')===ui.receiptStatus)&&(!ui.receiptDateStart||row.date>=ui.receiptDateStart)&&(!ui.receiptDateEnd||row.date<=ui.receiptDateEnd)).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.spg).localeCompare(String(b.spg)));
  }
  function receiptPaginationHtml(page,totalPages,total,start,end) {
    const numbers=[];for(let index=1;index<=totalPages;index++)if(index===1||index===totalPages||Math.abs(index-page)<=1)numbers.push(index);
    let previous=0,buttons=numbers.map(index=>{const gap=previous&&index-previous>1?'<span class="pagination-gap">…</span>':'';previous=index;return `${gap}<button class="${index===page?'active':''}" data-receipt-page="${index}">${index}</button>`;}).join('');
    return `<div class="receipt-pagination"><small>${total?`Menampilkan ${start+1}–${end} dari ${total} nota`:'Belum ada nota'}</small><nav class="report-pagination" aria-label="Navigasi halaman nota"><button data-receipt-page="${Math.max(1,page-1)}" ${page===1?'disabled':''}>← Sebelumnya</button><div>${buttons}</div><button data-receipt-page="${Math.min(totalPages,page+1)}" ${page===totalPages?'disabled':''}>Berikutnya →</button></nav></div>`;
  }
  function renderReceiptPage(ctx) {
    rememberRole(ctx);receiptFilterDefaults(ctx);
    const rows=receiptRows(ctx),pageSize=[10,20,50].includes(n(ui.receiptPageSize))?n(ui.receiptPageSize):10,totalPages=Math.max(1,Math.ceil(rows.length/pageSize));ui.receiptPage=Math.max(1,Math.min(totalPages,n(ui.receiptPage)||1));const start=(ui.receiptPage-1)*pageSize,pageRows=rows.slice(start,start+pageSize),end=Math.min(start+pageRows.length,rows.length),spgs=[...new Set((ctx.data.reportingDaily||[]).filter(row=>areaAllowed(ctx,row.area)&&(ui.receiptArea==='Semua'||row.area===ui.receiptArea)).map(row=>row.spg).filter(Boolean))].sort(),areaOptionsList=isMonitor(ctx)?allowedAreas(ctx):['Semua',...allowedAreas(ctx)],statusColor=status=>status==='Sesuai'?'green':status==='Belum Diperiksa'?'yellow':status==='Ditolak'?'red':'purple',pending=rows.filter(row=>(row.receiptStatus||'Belum Diperiksa')==='Belum Diperiksa').length,approved=rows.filter(row=>row.receiptStatus==='Sesuai').length,issues=rows.filter(row=>['Perlu Perbaikan','Ditolak'].includes(row.receiptStatus)).length;
    return `<div class="reporting-shell receipt-recap-page">
      ${ctx.pageHead('Rekap Nota','Lihat nota Reporting SPG berdasarkan tanggal, area, dan nama SPG. Data hanya tampil sesuai area akun.','<button class="btn dark" id="exportReceiptPdfBtn">Export PDF</button>')}
      <div class="grid cols-4">${reportKpi(ctx,'Jumlah Nota',ctx.number(rows.length),'sesuai filter','🧾')}${reportKpi(ctx,'Belum Diperiksa',ctx.number(pending),'menunggu TL','⏳')}${reportKpi(ctx,'Sesuai',ctx.number(approved),'sudah diperiksa','✅')}${reportKpi(ctx,'Perlu Tindak Lanjut',ctx.number(issues),'perbaikan atau ditolak','⚠️')}</div>
      <div class="card filter-card receipt-filter-card"><div class="form receipt-filter-grid"><div class="field"><label>Dari Tanggal</label><input type="date" id="receiptDateStart" value="${ctx.escapeAttr(ui.receiptDateStart)}"></div><div class="field"><label>Sampai Tanggal</label><input type="date" id="receiptDateEnd" value="${ctx.escapeAttr(ui.receiptDateEnd)}"></div><div class="field"><label>Area</label><select id="receiptAreaFilter">${areaOptionsList.map(area=>`<option value="${ctx.escapeAttr(area)}" ${area===ui.receiptArea?'selected':''}>${ctx.escapeHtml(area)}</option>`).join('')}</select></div><div class="field"><label>SPG</label><select id="receiptSpgFilter"><option value="Semua">Semua SPG</option>${spgs.map(spg=>`<option value="${ctx.escapeAttr(spg)}" ${spg===ui.receiptSpg?'selected':''}>${ctx.escapeHtml(spg)}</option>`).join('')}</select></div><div class="field"><label>Status Nota</label><select id="receiptStatusFilter">${['Semua','Belum Diperiksa','Sesuai','Perlu Perbaikan','Ditolak'].map(status=>`<option ${status===ui.receiptStatus?'selected':''}>${status}</option>`).join('')}</select></div></div></div>
      <div class="card receipt-list-card"><div class="daily-table-toolbar"><div><h3>Nota per SPG dan Tanggal</h3><small>TL mengunggah dan memeriksa nota. SCO, MS, dan AM melihat hasilnya sesuai area.</small></div><label>Tampilkan <select id="receiptPageSize">${[10,20,50].map(size=>`<option value="${size}" ${size===pageSize?'selected':''}>${size} baris</option>`).join('')}</select></label></div><div class="table-wrap"><table class="report-table receipt-status-table"><thead><tr>${['Tanggal','SPG','Area','Grosir / Toko','Kecamatan','Selling','Value','File Nota','Status','Catatan TL','Aksi'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${pageRows.length?pageRows.map(row=>{const status=row.receiptStatus||'Belum Diperiksa';return `<tr><td>${formatDate(row.date)}</td><td><b>${ctx.escapeHtml(row.spg||'-')}</b></td><td>${ctx.escapeHtml(row.area||'-')}</td><td>${ctx.escapeHtml(row.gromin||'-')}</td><td>${ctx.escapeHtml(row.district||'-')}</td><td>${ctx.number(row.selling)}</td><td>${ctx.money(row.value)}</td><td><span class="receipt-file-name">${String(row.receiptType||'').includes('pdf')?'📄':'🖼️'} ${ctx.escapeHtml(row.receiptName||'Nota')}</span></td><td>${badge(status,statusColor(status))}${row.receiptReviewedAt?`<small class="table-subline">${ctx.escapeHtml(row.receiptReviewedBy||'TL')} • ${formatDate(String(row.receiptReviewedAt).slice(0,10))}</small>`:''}</td><td class="wrap">${ctx.escapeHtml(row.receiptReviewNote||'-')}</td><td><div class="compact-actions"><button class="btn soft mini" data-open-receipt="${ctx.escapeAttr(row.id)}">Lihat</button>${isTl(ctx)?`<button class="btn primary mini" data-review-receipt="${ctx.escapeAttr(row.id)}">Periksa</button>`:''}</div></td></tr>`;}).join(''):`<tr><td colspan="11"><div class="empty-state-report"><b>Belum ada nota pada filter ini.</b>Nota akan tampil setelah TL mengunggahnya pada Reporting SPG.</div></td></tr>`}</tbody></table></div>${receiptPaginationHtml(ui.receiptPage,totalPages,rows.length,start,end)}</div>
    </div>`;
  }
  function receiptImageForPdf(file={}){
    const dataUrl=String(file.dataUrl||''),mime=String(file.mimeType||dataUrl.match(/^data:([^;]+)/)?.[1]||'');if(!dataUrl||!mime.startsWith('image/'))return Promise.resolve({...file,pdfImage:'',pdfFormat:''});if(mime.includes('jpeg')||mime.includes('jpg'))return Promise.resolve({...file,pdfImage:dataUrl,pdfFormat:'JPEG'});if(mime.includes('png'))return Promise.resolve({...file,pdfImage:dataUrl,pdfFormat:'PNG'});
    return new Promise(resolve=>{const image=new Image();image.onload=()=>{try{const max=1400,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve({...file,pdfImage:canvas.toDataURL('image/jpeg',.82),pdfFormat:'JPEG'});}catch{resolve({...file,pdfImage:'',pdfFormat:''});}};image.onerror=()=>resolve({...file,pdfImage:'',pdfFormat:''});image.src=dataUrl;});
  }
  async function exportReceiptPdf(ctx) {
    const rows=receiptRows(ctx),jspdf=window.jspdf;if(!rows.length)return ctx.toast('Belum ada nota pada filter ini.');if(!jspdf?.jsPDF)return ctx.toast('Pembuat PDF belum termuat.');
    ctx.toast('Menyiapkan PDF dan foto nota…');
    const receiptFiles=await Promise.all(rows.map(async row=>{try{return await receiptImageForPdf(await ctx.getReceiptData?.(row)||{});}catch{return {};}}));
    const doc=new jspdf.jsPDF({orientation:'landscape',format:'a3'}),area=ui.receiptArea==='Semua'?'Semua Area':ui.receiptArea,width=doc.internal.pageSize.getWidth();doc.setFillColor(15,42,76);doc.rect(0,0,width,31,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('REKAP NOTA REPORTING SPG',14,13);doc.setFontSize(9);doc.text(`${area} • ${formatDate(ui.receiptDateStart)} s.d. ${formatDate(ui.receiptDateEnd)} • ${ui.receiptSpg==='Semua'?'Semua SPG':ui.receiptSpg}`,14,22);doc.setTextColor(15,23,42);
    doc.autoTable({startY:38,theme:'grid',head:[['No.','Tanggal','SPG','Area','Grosir / Toko','Kecamatan','Selling','Value','Foto Nota','Status','Catatan TL']],body:rows.map((row,index)=>[index+1,formatDate(row.date),row.spg||'-',row.area||'-',row.gromin||'-',row.district||'-',ctx.number(row.selling),ctx.money(row.value),receiptFiles[index]?.pdfImage?'Foto terlampir':row.receiptName||'Tidak ada',row.receiptStatus||'Belum Diperiksa',row.receiptReviewNote||'-']),styles:{fontSize:7.6,cellPadding:2.2,lineWidth:.18,lineColor:[71,85,105],overflow:'linebreak',valign:'middle',minCellHeight:29},headStyles:{fillColor:[31,78,120],textColor:[255,255,255],fontStyle:'bold',lineWidth:.25,lineColor:[51,65,85],minCellHeight:11},alternateRowStyles:{fillColor:[248,250,252]},columnStyles:{0:{cellWidth:9},1:{cellWidth:21},2:{cellWidth:27},3:{cellWidth:24},4:{cellWidth:36},5:{cellWidth:31},6:{cellWidth:16},7:{cellWidth:28},8:{cellWidth:40,halign:'center'},9:{cellWidth:25},10:{cellWidth:42}},didDrawCell:data=>{if(data.section!=='body'||data.column.index!==8)return;const file=receiptFiles[data.row.index]||{},dataUrl=String(file.pdfImage||'');if(!dataUrl)return;try{const padding=2,maxWidth=data.cell.width-padding*2,maxHeight=data.cell.height-padding*2,props=doc.getImageProperties(dataUrl),ratio=Math.min(maxWidth/props.width,maxHeight/props.height),drawWidth=props.width*ratio,drawHeight=props.height*ratio,x=data.cell.x+(data.cell.width-drawWidth)/2,y=data.cell.y+(data.cell.height-drawHeight)/2;doc.addImage(dataUrl,file.pdfFormat||'JPEG',x,y,drawWidth,drawHeight,undefined,'FAST');}catch{}}});
    const pages=doc.internal.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(`Website Extra Joss SPG • ${ctx.user?.name||ctx.user?.role||'Pengguna'} • ${area} • Halaman ${page}/${pages}`,14,doc.internal.pageSize.getHeight()-7);}doc.save(`REKAP NOTA ${area.toUpperCase()} ${ui.receiptDateStart} - ${ui.receiptDateEnd}.pdf`.replace(/[\\/:*?"<>|]/g,'-'));ctx.toast('PDF Rekap Nota berhasil dibuat lengkap dengan foto yang tersedia.');
  }
  function bindReceiptPage(ctx) {
    const rerenderFilter=()=>{ui.receiptPage=1;ctx.renderPage();};
    document.getElementById('receiptDateStart')?.addEventListener('change',event=>{ui.receiptDateStart=event.target.value;rerenderFilter();});document.getElementById('receiptDateEnd')?.addEventListener('change',event=>{ui.receiptDateEnd=event.target.value;rerenderFilter();});document.getElementById('receiptAreaFilter')?.addEventListener('change',event=>{ui.receiptArea=event.target.value;ui.receiptSpg='Semua';rerenderFilter();});document.getElementById('receiptSpgFilter')?.addEventListener('change',event=>{ui.receiptSpg=event.target.value;rerenderFilter();});document.getElementById('receiptStatusFilter')?.addEventListener('change',event=>{ui.receiptStatus=event.target.value||'Semua';rerenderFilter();});document.getElementById('receiptPageSize')?.addEventListener('change',event=>{ui.receiptPageSize=n(event.target.value)||10;rerenderFilter();});document.querySelectorAll('[data-receipt-page]').forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;ui.receiptPage=n(button.dataset.receiptPage)||1;ctx.renderPage();}));document.querySelectorAll('[data-open-receipt]').forEach(button=>button.addEventListener('click',()=>{const row=(ctx.data.reportingDaily||[]).find(item=>item.id===button.dataset.openReceipt);if(row)ctx.openReceipt?.(row);}));document.querySelectorAll('[data-review-receipt]').forEach(button=>button.addEventListener('click',()=>{const row=(ctx.data.reportingDaily||[]).find(item=>item.id===button.dataset.reviewReceipt);if(row)ctx.reviewReceipt?.(row);}));document.getElementById('exportReceiptPdfBtn')?.addEventListener('click',()=>exportReceiptPdf(ctx));
  }

  function renderCoaching(ctx) {
    const rows = (ctx.data.coachingRecords || []).filter(row => areaAllowed(ctx,row.area) && periodOf(row.date) === ui.period && (ui.area === 'Semua' || row.area === ui.area) && (ui.spg === 'Semua' || row.profileId === ui.spg)).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const edited = ctx.data.coachingRecords.find(item => item.id === ui.editingCoachingId);
    const defaultArea = (edited?.area && areaAllowed(ctx,edited.area)) ? edited.area : (ui.area === 'Semua' ? (allowedAreas(ctx)[0]||'Banjarmasin') : ui.area);
    const defaultProfile = edited?.profileId || profiles(ctx, defaultArea).find(profile => String(profile.status).toLowerCase() !== 'vacant')?.id || '';
    const form = edited || { date:`${ui.period}-15`, area:defaultArea, profileId:defaultProfile, beforeAvg:0, afterAvg:0, topic:'', action:'', status:'Open', notes:'' };
    const before = rows.length ? rows.reduce((sum,row)=>sum+n(row.beforeAvg),0)/rows.length : 0;
    const after = rows.length ? rows.reduce((sum,row)=>sum+n(row.afterAvg),0)/rows.length : 0;
    const improvement = before ? (after-before)/before : 0;
    return `<div class="reporting-shell">
      <div class="grid cols-3">
        ${reportKpi(ctx, 'AVG Before', round(before,1), `${rows.length} sesi`, '↙️')}
        ${reportKpi(ctx, 'AVG After', round(after,1), 'hasil follow-up', '↗️')}
        ${reportKpi(ctx, 'Improvement', pct(improvement,1), after >= before ? 'tren membaik' : 'perlu follow-up', '🎯')}
      </div>
      <div class="card"><div class="btn-row" style="justify-content:space-between"><div><h3>${edited ? 'Edit Coaching' : 'Input Coaching'}</h3><small>Catat before vs after, fokus pembinaan, action, dan status tindak lanjut.</small></div>${edited ? '<button class="btn ghost" id="cancelCoachingEditBtn">Batal Edit</button>' : ''}</div>
        <div class="reporting-form-grid" style="margin-top:16px">
          <div class="field"><label>Tanggal Coaching</label><input type="date" id="coachDate" value="${ctx.escapeAttr(form.date)}"></div>
          <div class="field"><label>Area</label><select id="coachArea">${areaOptions(ctx, form.area, false)}</select></div>
          <div class="field"><label>Nama SPG</label><select id="coachProfile">${profileOptions(ctx, form.profileId, 'Semua', false)}</select></div>
          <div class="field"><label>Status</label><select id="coachStatus">${['Open','Follow-up','Selesai'].map(value=>`<option ${form.status===value?'selected':''}>${value}</option>`).join('')}</select></div>
          <div class="field"><label>AVG Before</label><input type="number" min="0" step="0.01" id="coachBefore" value="${n(form.beforeAvg)}"></div>
          <div class="field"><label>AVG After</label><input type="number" min="0" step="0.01" id="coachAfter" value="${n(form.afterAvg)}"></div>
          <div class="field span-2"><label>Topik / Alasan Coaching</label><input id="coachTopic" value="${ctx.escapeAttr(form.topic || '')}" placeholder="Selling skill, product knowledge, traffic..."></div>
          <div class="field span-2"><label>Action / Follow-up</label><textarea id="coachAction">${ctx.escapeHtml(form.action || '')}</textarea></div>
          <div class="field span-2"><label>Catatan</label><textarea id="coachNotes">${ctx.escapeHtml(form.notes || '')}</textarea></div>
          <div class="reporting-form-actions"><button class="btn primary" id="saveCoachingBtn">💾 ${edited ? 'Simpan Perubahan' : 'Simpan Coaching'}</button></div>
        </div>
      </div>
      <div class="analytics-grid">
        <div class="card"><h3>Before vs After</h3><small>Perbandingan rata-rata seluruh coaching pada filter.</small><div class="hbar-list">
          ${horizontalBarRows([{label:'AVG BEFORE',value:before,color:'yellow'},{label:'AVG AFTER',value:after,color:'green'}], value=>round(value,1))}
        </div></div>
        <div class="card"><h3>Insight Coaching</h3><div class="insight-list" style="margin-top:14px">
          ${insight('📈','Perubahan rata-rata', rows.length ? `${round(after-before,1)} can/HK setelah coaching (${pct(improvement,1)}).` : 'Belum ada coaching pada periode ini.')}
          ${insight('⏱️','Follow-up terbuka', `${rows.filter(row=>row.status!=='Selesai').length} sesi masih membutuhkan tindak lanjut.`)}
          ${ui.currentRole === 'TL' ? insight('🏠','Area fokus', ACTIVE_FOCUS_AREAS.length?`${ACTIVE_FOCUS_AREAS.join(', ')} diprioritaskan dalam review mingguan TL.`:'Belum ada area fokus. Pilih dari Pengaturan TL.') : insight('📌','Tindak lanjut', 'Gunakan hasil grafik untuk menentukan area yang perlu diperiksa lebih dulu.')}
        </div></div>
      </div>
      <div class="card"><h3>Riwayat Coaching</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Tanggal','Area','Nama SPG','Topik','AVG Before','AVG After','Improvement','Action','Status','Aksi'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>
        ${rows.length ? rows.map(row => { const change = n(row.beforeAvg) ? (n(row.afterAvg)-n(row.beforeAvg))/n(row.beforeAvg) : 0; return `<tr class="${isFocus(row.area)?'focus-row':''}"><td>${formatDate(row.date)}</td><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td class="wrap">${ctx.escapeHtml(row.topic || '-')}</td><td>${round(row.beforeAvg,1)}</td><td>${round(row.afterAvg,1)}</td><td class="${change>=0?'metric-positive':'metric-negative'}">${pct(change,1)}</td><td class="wrap">${ctx.escapeHtml(row.action || '-')}</td><td>${badge(ctx.escapeHtml(row.status), row.status==='Selesai'?'green':row.status==='Follow-up'?'yellow':'gray')}</td><td><div class="compact-actions"><button class="btn mini soft" data-edit-coaching="${ctx.escapeAttr(row.id)}">Edit</button><button class="btn mini red" data-delete-coaching="${ctx.escapeAttr(row.id)}">Hapus</button></div></td></tr>`; }).join('') : '<tr><td colspan="10"><div class="empty-state-report"><b>Belum ada coaching pada periode ini.</b>Catat sesi baru melalui form di atas.</div></td></tr>'}
      </tbody></table></div></div>
    </div>`;
  }

  function renderPica(ctx) {
    const rows = (ctx.data.picaRecords || []).filter(row => areaAllowed(ctx,row.area) && (ui.area === 'Semua' || row.area === ui.area) && (ui.spg === 'Semua' || row.profileId === ui.spg)).slice().sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
    const edited = ctx.data.picaRecords.find(item => item.id === ui.editingPicaId);
    const defaultArea = (edited?.area && areaAllowed(ctx,edited.area)) ? edited.area : (ui.area === 'Semua' ? (allowedAreas(ctx)[0]||'Banjarmasin') : ui.area);
    const defaultProfile = edited?.profileId || profiles(ctx, defaultArea).find(profile => String(profile.status).toLowerCase() !== 'vacant')?.id || '';
    const form = edited || { area:defaultArea, profileId:defaultProfile, problem:'', identification:'', corrective:'', action:'', dueDate:`${ui.period}-28`, pic:`SPG, SCO ${config(ctx).scoByArea[defaultArea] || ''}, TL SOLEHUDIN`, status:'Open' };
    return `<div class="reporting-shell">
      <div class="grid cols-4">
        ${reportKpi(ctx, 'Total PICA', ctx.number(rows.length), 'sesuai filter area', '🧩')}
        ${reportKpi(ctx, 'Open', ctx.number(rows.filter(row=>row.status==='Open').length), 'belum dimulai', '🔴')}
        ${reportKpi(ctx, 'In Process', ctx.number(rows.filter(row=>row.status==='In Process').length), 'sedang berjalan', '🟡')}
        ${reportKpi(ctx, 'Done', ctx.number(rows.filter(row=>row.status==='Done').length), 'sudah selesai', '🟢')}
      </div>
      <div class="card"><div class="btn-row" style="justify-content:space-between"><div><h3>${edited?'Edit PICA':'Input PICA'}</h3><small>Problem, identifikasi, corrective, action, due date, PIC, dan status mengikuti struktur workbook.</small></div>${edited?'<button class="btn ghost" id="cancelPicaEditBtn">Batal Edit</button>':''}</div>
        <div class="reporting-form-grid" style="margin-top:16px">
          <div class="field"><label>Area</label><select id="picaArea">${areaOptions(ctx, form.area,false)}</select></div>
          <div class="field"><label>Nama SPG</label><select id="picaProfile"><option value="">Umum / Semua SPG</option>${profileOptions(ctx,form.profileId,'Semua',true)}</select></div>
          <div class="field"><label>Due Date</label><input type="date" id="picaDueDate" value="${ctx.escapeAttr(form.dueDate||'')}"></div>
          <div class="field"><label>Status</label><select id="picaStatus">${['Open','In Process','Done','Overdue'].map(value=>`<option ${form.status===value?'selected':''}>${value}</option>`).join('')}</select></div>
          <div class="field span-2"><label>Problem</label><textarea id="picaProblem">${ctx.escapeHtml(form.problem||'')}</textarea></div>
          <div class="field span-2"><label>Identifikasi / Root Cause</label><textarea id="picaIdentification">${ctx.escapeHtml(form.identification||'')}</textarea></div>
          <div class="field span-2"><label>Corrective</label><textarea id="picaCorrective">${ctx.escapeHtml(form.corrective||'')}</textarea></div>
          <div class="field span-2"><label>Action</label><textarea id="picaAction">${ctx.escapeHtml(form.action||'')}</textarea></div>
          <div class="field span-4"><label>PIC</label><input id="picaPic" value="${ctx.escapeAttr(form.pic||'')}"></div>
          <div class="reporting-form-actions"><button class="btn primary" id="savePicaBtn">💾 ${edited?'Simpan Perubahan':'Simpan PICA'}</button></div>
        </div>
      </div>
      <div class="card"><h3>Daftar PICA</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Area','Nama SPG','Problem','Identifikasi','Corrective','Action','Due Date','PIC','Status','Aksi'].map(label=>`<th class="${['Problem','Identifikasi','Corrective','Action','PIC'].includes(label)?'wrap':''}">${label}</th>`).join('')}</tr></thead><tbody>
        ${rows.length ? rows.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td>${ctx.escapeHtml(row.area)}</td><td>${ctx.escapeHtml(row.spg||'Semua SPG')}</td><td class="wrap">${ctx.escapeHtml(row.problem)}</td><td class="wrap">${ctx.escapeHtml(row.identification)}</td><td class="wrap">${ctx.escapeHtml(row.corrective)}</td><td class="wrap">${ctx.escapeHtml(row.action)}</td><td>${formatDate(row.dueDate)}</td><td class="wrap">${ctx.escapeHtml(row.pic||'-')}</td><td>${badge(ctx.escapeHtml(row.status),row.status==='Done'?'green':row.status==='In Process'?'yellow':row.status==='Overdue'?'red':'gray')}</td><td><div class="compact-actions"><button class="btn mini soft" data-edit-pica="${ctx.escapeAttr(row.id)}">Edit</button><button class="btn mini red" data-delete-pica="${ctx.escapeAttr(row.id)}">Hapus</button></div></td></tr>`).join('') : '<tr><td colspan="10"><div class="empty-state-report"><b>Belum ada PICA.</b>Tambahkan problem dan action melalui form.</div></td></tr>'}
      </tbody></table></div></div>
    </div>`;
  }

  function renderProfiles(ctx) {
    const rows = profiles(ctx, ui.area).filter(profile => ui.spg === 'Semua' || profile.id === ui.spg);
    const areas = aggregateArea(ctx, ui.period, ui.area, ui.spg);
    const edited = ctx.data.reportingProfiles.find(item=>item.id===ui.editingProfileId);
    const defaultArea = edited?.area || (ui.area==='Semua'?'Banjarmasin':ui.area);
    const form = edited || { area:defaultArea,spg:'',outlet:'',district:'',joinDate:'',status:'Aktif',targetHK:26,targetMonth:defaultArea==='Banjarmasin'||defaultArea==='Palangkaraya'?3240:2880,resignDate:'',resignReason:'',lostManDays:0,commitmentDate:'',notes:'' };
    const totalQuota = areas.reduce((sum,row)=>sum+row.quota,0);
    const totalActual = areas.reduce((sum,row)=>sum+row.active,0);
    if(isMonitor(ctx))return `<div class="reporting-shell">
      <div class="grid cols-3">${reportKpi(ctx,'SPG Tercatat',ctx.number(rows.length),ui.area,'👥')}${reportKpi(ctx,'SPG Aktif',ctx.number(rows.filter(row=>row.status==='Aktif').length),'siap bertugas','✅')}${reportKpi(ctx,'Posisi Vacant',ctx.number(rows.filter(row=>String(row.status).toLowerCase()==='vacant').length),'perlu perhatian','🪑')}</div>
      <div class="card"><div class="daily-table-toolbar"><div><h3>Data SPG ${ctx.escapeHtml(ui.area)}</h3><small>Daftar sederhana untuk dilihat dan diekspor melalui tombol di atas.</small></div>${badge(`${rows.length} data`,'blue')}</div><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Nama SPG / Posisi','Toko / Gromin','Kecamatan','Status','Joint Date','Target HK','Target Bulanan'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.escapeHtml(row.outlet||'-')}</td><td>${ctx.escapeHtml(row.district||'-')}</td><td>${badge(ctx.escapeHtml(row.status),row.status==='Aktif'?'green':row.status==='Vacant'?'yellow':'red')}</td><td>${formatDate(row.joinDate)}</td><td>${ctx.number(row.targetHK)}</td><td>${ctx.number(row.targetMonth)}</td></tr>`).join(''):'<tr><td colspan="7"><div class="empty-state-report">Belum ada Data SPG pada area ini.</div></td></tr>'}</tbody></table></div></div>
    </div>`;
    return `<div class="reporting-shell">
      <div class="grid cols-4">
        ${reportKpi(ctx,'Quota',ctx.number(totalQuota),'kebutuhan SPG','🎯')}
        ${reportKpi(ctx,'Actual Aktif',ctx.number(totalActual),'SPG aktif','👥')}
        ${reportKpi(ctx,'Vacant',ctx.number(areas.reduce((sum,row)=>sum+row.vacant,0)),'perlu fulfillment','🪑')}
        ${reportKpi(ctx,'ACV Fulfill',pct(totalQuota?totalActual/totalQuota:0,0),'actual ÷ quota','✅')}
      </div>
      <div class="card"><h3>Fulfillment per Area</h3><div class="table-wrap" style="margin-top:14px"><table><thead><tr>${['Area','Quota','Actual','Vacant','ACV Fulfill','Status'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${areas.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td><b>${ctx.escapeHtml(row.area)}</b></td><td>${row.quota}</td><td>${row.active}</td><td>${row.vacant}</td><td>${pct(row.quota?row.active/row.quota:0,0)}</td><td>${badge(row.vacant?'Perlu Fulfill':'Fullfill',row.vacant?'yellow':'green')}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="card reporting-profile-editor"><div class="btn-row" style="justify-content:space-between"><div><h3>Data SPG</h3><small>Perubahan akun dilakukan melalui Admin.</small></div></div>
        <div class="reporting-form-grid" style="margin-top:16px">
          <div class="field"><label>Area</label><select id="profileArea">${areaOptions(ctx, form.area,false)}</select></div>
          <div class="field"><label>Nama SPG / Posisi</label><input id="profileName" value="${ctx.escapeAttr(form.spg||'')}" placeholder="Nama atau VACANT - Nama Toko"></div>
          <div class="field"><label>Nama Toko / Gromin</label><input id="profileOutlet" value="${ctx.escapeAttr(form.outlet||'')}"></div>
          <div class="field"><label>Kecamatan</label><input id="profileDistrict" value="${ctx.escapeAttr(form.district||'')}"></div>
          <div class="field"><label>Joint Date</label><input type="date" id="profileJoinDate" value="${ctx.escapeAttr(form.joinDate||'')}"></div>
          <div class="field"><label>Status</label><select id="profileStatus">${['Aktif','Vacant','Resign','Nonaktif'].map(value=>`<option ${form.status===value?'selected':''}>${value}</option>`).join('')}</select></div>
          <div class="field"><label>Target HK</label><input type="number" min="0" id="profileTargetHK" value="${n(form.targetHK||26)}"></div>
          <div class="field"><label>Target Bulanan (CAN)</label><input type="number" min="0" id="profileTargetMonth" value="${n(form.targetMonth)}"></div>
          <div class="field"><label>Tanggal Resign</label><input type="date" id="profileResignDate" value="${ctx.escapeAttr(form.resignDate||'')}"></div>
          <div class="field"><label>Alasan Resign</label><input id="profileResignReason" value="${ctx.escapeAttr(form.resignReason||'')}"></div>
          <div class="field"><label>Lost Man Day</label><input type="number" min="0" id="profileLostDays" value="${n(form.lostManDays)}"></div>
          <div class="field"><label>Tanggal Komitmen</label><input type="date" id="profileCommitmentDate" value="${ctx.escapeAttr(form.commitmentDate||'')}"></div>
          <div class="field span-4"><label>Keterangan</label><textarea id="profileNotes">${ctx.escapeHtml(form.notes||'')}</textarea></div>
          <div class="reporting-form-actions"><button class="btn primary" id="saveProfileBtn">💾 ${edited?'Simpan Perubahan':'Tambah Data SPG'}</button></div>
        </div>
      </div>
      <div class="card"><h3>Roster SPG</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Area','Nama SPG / Posisi','Toko / Gromin','Kecamatan','Joint Date','Status','Target HK','Target Month','Tanggal Resign','Alasan','Lost Man Day','Komitmen','Keterangan','Aksi'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.escapeHtml(row.outlet||'-')}</td><td>${ctx.escapeHtml(row.district||'-')}</td><td>${formatDate(row.joinDate)}</td><td>${badge(ctx.escapeHtml(row.status),row.status==='Aktif'?'green':row.status==='Vacant'?'yellow':'red')}</td><td>${ctx.number(row.targetHK)}</td><td>${ctx.number(row.targetMonth)}</td><td>${formatDate(row.resignDate)}</td><td>${ctx.escapeHtml(row.resignReason||'-')}</td><td>${ctx.number(row.lostManDays)}</td><td>${formatDate(row.commitmentDate)}</td><td class="wrap">${ctx.escapeHtml(row.notes||'-')}</td><td><div class="compact-actions"><button class="btn mini soft" data-edit-profile="${ctx.escapeAttr(row.id)}">Edit</button><button class="btn mini red" data-delete-profile="${ctx.escapeAttr(row.id)}">Hapus</button></div></td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  }

  function renderWip(ctx) {
    const cfg = config(ctx);
    const rows = aggregateSpg(ctx, ui.period, ui.area, ui.spg);
    const activeRows = rows.filter(row=>String(row.status).toLowerCase()!=='vacant');
    const totals = activeRows.reduce((acc,row)=>{ acc.hk+=row.hk; acc.selling+=row.selling; acc.value+=row.value; acc.expense+=row.expenseActual; acc.target+=row.targetMonth; return acc; },{hk:0,selling:0,value:0,expense:0,target:0});
    const avg = totals.hk?totals.selling/totals.hk:0;
    const ratio = totals.value?totals.expense/totals.value:0;
    return `<div class="reporting-shell">
      <div class="grid cols-4">
        ${reportKpi(ctx,'Total Selling',ctx.number(totals.selling),monthLabel(ui.period),'🥫')}
        ${reportKpi(ctx,'AVG / HK',round(avg,1),`${ctx.number(totals.hk)} HK`,'📊')}
        ${reportKpi(ctx,'Achievement',pct(totals.target?totals.selling/totals.target:0,1),'vs target month','🎯')}
        ${reportKpi(ctx,'Ratio',pct(ratio,1),`komitmen ${pct(cfg.ratioCommitment,0)}`,'⚖️')}
      </div>
      <div class="source-note"><span>📐</span><div><strong>Rumus WIP aktif:</strong> Target by HK = HK × ${ctx.number(cfg.targetDailyCan)} can. Expense aktual = HK × expense area. Ratio = expense aktual ÷ selling value. Gap karton/hari = sisa target ÷ sisa HK ÷ ${cfg.pcsPerCarton}.</div></div>
      <div class="card"><div class="btn-row" style="justify-content:space-between"><div><h3>WIP ${ctx.escapeHtml(monthLabel(ui.period))}</h3><small>Total dan average per week otomatis dari Reporting SPG. Export memakai workbook DAILY REPORT SPG JULI 2026_SOLEH.</small></div><button class="btn soft" id="exportWipBtn">📥 Export WIP Sesuai Template</button></div>
        <div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>
          ${['Area','Nama SPG','Target HK','Actual HK','ACH HK','W1','W2','W3','W4','W5','AVG W1','AVG W2','AVG W3','AVG W4','AVG W5','Target by HK','Actual MTD','ACH MTD','Target Month','ACH Month','Value','AVG/Day','Expense/HK','Expense Actual','Ratio','Zona Ratio','Gap Karton/Day','Gap CAN/Day','Target Value','Needs Value','Target 80%','Sisa ke 80%','Target 100%','Sisa ke 100%','Status Target'].map(label=>`<th>${label}</th>`).join('')}
        </tr></thead><tbody>
          ${rows.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td><b>${ctx.escapeHtml(row.area)}</b></td><td><b>${ctx.escapeHtml(row.spg)}</b><small>${ctx.escapeHtml(row.outlet||'')}</small></td><td>${ctx.number(row.targetHK)}</td><td>${ctx.number(row.hk)}</td><td>${pct(row.targetHK?row.hk/row.targetHK:0,0)}</td>
            ${row.weekly.map(week=>`<td>${ctx.number(week.selling)}</td>`).join('')}${row.weekly.map(week=>`<td>${round(week.hk?week.selling/week.hk:0,1)}</td>`).join('')}
            <td>${ctx.number(row.targetByHK)}</td><td>${ctx.number(row.selling)}</td><td>${pct(row.achievementHK,1)}</td><td>${ctx.number(row.targetMonth)}</td><td>${pct(row.achievementMonth,1)}</td><td>${ctx.money(row.value)}</td><td>${round(row.avg,1)}</td><td>${ctx.money(row.expenseRate)}</td><td>${ctx.money(row.expenseActual)}</td><td>${pct(row.ratio,1)}</td><td>${badge(row.ratioZone.label,row.ratioZone.color)}</td><td>${round(row.gapCartonPerDay,2)}</td><td>${round(row.gapCanPerDay,1)}</td><td>${ctx.money(row.targetValue)}</td><td>${ctx.money(row.needsValue)}</td><td>${ctx.number(row.target80)}</td><td>${ctx.number(row.remaining80)}</td><td>${ctx.number(row.targetMonth)}</td><td>${ctx.number(row.gapCan)}</td><td>${badge(row.achievementZone.label,row.achievementZone.color)}</td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="3">GRAND TOTAL</td><td>${ctx.number(totals.hk)}</td><td colspan="11"></td><td>${ctx.number(totals.selling)}</td><td>${pct(totals.hk?totals.selling/(totals.hk*cfg.targetDailyCan):0,1)}</td><td>${ctx.number(totals.target)}</td><td>${pct(totals.target?totals.selling/totals.target:0,1)}</td><td>${ctx.money(totals.value)}</td><td>${round(avg,1)}</td><td></td><td>${ctx.money(totals.expense)}</td><td>${pct(ratio,1)}</td><td>${badge(ratioZone(ratio).label,ratioZone(ratio).color)}</td><td colspan="10"></td></tr></tfoot></table></div>
      </div>
    </div>`;
  }

  function renderZones(ctx) {
    const spgs = aggregateSpg(ctx,ui.period,ui.area,ui.spg).filter(row=>String(row.status).toLowerCase()!=='vacant');
    const areas = aggregateArea(ctx,ui.period,ui.area,ui.spg);
    return `<div class="reporting-shell">
      <div class="card"><div class="btn-row" style="justify-content:space-between"><div><h3>Aturan Zona</h3><small>Diambil dari sheet ZONA SPG dan referensi ratio.</small></div><div class="zone-legend">${badge('Ratio Hijau ≤ 35%','green')}${badge('Kuning 36–40%','yellow')}${badge('Merah > 40%','red')}${badge('Target Hijau ≥ 80%','green')}${badge('Kuning 60–79%','yellow')}${badge('Merah < 60%','red')}</div></div></div>
      <div class="analytics-grid">
        <div class="card"><h3>Ratio by Area</h3><small>Semakin rendah semakin efisien.</small><div class="hbar-list">${horizontalBarRows(areas.map(row=>({label:row.area,value:row.ratio,color:ratioZone(row.ratio).color})),value=>pct(value,1),1)}</div></div>
        <div class="card"><h3>Achievement by Area</h3><small>Target minimal zona hijau 80%.</small><div class="hbar-list">${horizontalBarRows(areas.map(row=>({label:row.area,value:row.achievement,color:achievementZone(row.achievement).color})),value=>pct(value,1),1)}</div></div>
      </div>
      <div class="card"><h3>Zona per SPG</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Area','Nama SPG','HK','Selling','AVG/Day','Value','Expense Actual','Ratio','Zona Ratio','Achievement Month','Zona Target','Sisa CAN','Kebutuhan CAN/HK','Prioritas TL'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${spgs.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${row.hk}</td><td>${ctx.number(row.selling)}</td><td>${round(row.avg,1)}</td><td>${ctx.money(row.value)}</td><td>${ctx.money(row.expenseActual)}</td><td>${pct(row.ratio,1)}</td><td>${badge(row.ratioZone.label,row.ratioZone.color)}</td><td>${pct(row.achievementMonth,1)}</td><td>${badge(row.achievementZone.label,row.achievementZone.color)}</td><td>${ctx.number(row.gapCan)}</td><td>${round(row.gapCanPerDay,1)}</td><td>${badge(isFocus(row.area)&&row.achievementZone.color!=='green'?'Fokus Utama':row.achievementZone.color==='red'?'Coaching + PICA':'Monitor',isFocus(row.area)&&row.achievementZone.color!=='green'?'purple':row.achievementZone.color)}</td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  }

  function renderSampling(ctx) {
    const cfg = config(ctx);
    const summaries = aggregateSpg(ctx,ui.period,ui.area,ui.spg).filter(row=>String(row.status).toLowerCase()!=='vacant');
    const records = dailyRows(ctx,ui.period,ui.area,ui.spg).filter(row=>n(row.samplingCup)>0).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const defaultArea = ui.area==='Semua'?'Banjarmasin':ui.area;
    const defaultProfile = profiles(ctx,defaultArea).find(profile=>String(profile.status).toLowerCase()!=='vacant')?.id||'';
    const totalActual=summaries.reduce((sum,row)=>sum+row.sampling,0), totalTarget=summaries.reduce((sum,row)=>sum+row.samplingTarget,0);
    return `<div class="reporting-shell">
      <div class="grid cols-4">
        ${reportKpi(ctx,'Target Sampling',ctx.number(totalTarget),`${cfg.targetSamplingCup} cup/HK/SPG`,'🎯')}
        ${reportKpi(ctx,'Actual Sampling',ctx.number(totalActual),'cup tercatat','🥤')}
        ${reportKpi(ctx,'ACV Sampling',pct(totalTarget?totalActual/totalTarget:0,1),'actual ÷ target','📈')}
        ${reportKpi(ctx,'Gap Kaleng',round(Math.max(totalTarget-totalActual,0)/3,1),'konversi 1 can = 3 cup','🥫')}
      </div>
      ${ctx.canEdit!==false?`<div class="card"><h3>Quick Input Sampling</h3><small>Jika tanggal/SPG sudah ada di Reporting, nilai sampling akan diperbarui pada baris yang sama.</small><div class="reporting-form-grid" style="margin-top:16px">
        <div class="field"><label>Tanggal</label><input type="date" id="samplingDate" value="${ctx.escapeAttr(`${ui.period}-01`)}"></div>
        <div class="field"><label>Area</label><select id="samplingArea">${areaOptions(ctx, defaultArea,false)}</select></div>
        <div class="field"><label>Nama SPG</label><select id="samplingProfile">${profileOptions(ctx,defaultProfile,'Semua',false)}</select></div>
        <div class="field"><label>Jumlah HK</label><input type="number" min="0" id="samplingHK" value="1"></div>
        <div class="field"><label>Actual Sampling (cup)</label><input type="number" min="0" id="samplingCup" value="0"></div>
        <div class="field span-2"><label>Catatan</label><input id="samplingNotes" placeholder="Lokasi, aktivitas, atau catatan sampling"></div>
        <div class="reporting-form-actions"><button class="btn primary" id="saveSamplingBtn">💾 Simpan Sampling</button></div>
      </div></div>`:''}
      <div class="analytics-grid"><div class="card"><h3>ACV Sampling per SPG</h3><div class="hbar-list">${horizontalBarRows(summaries.map(row=>({label:row.spg,value:row.samplingAchievement,color:achievementZone(row.samplingAchievement).color})).slice(0,12),value=>pct(value,1),1)}</div></div>
        <div class="card"><h3>Aturan Perhitungan</h3><div class="insight-list" style="margin-top:14px">${insight('🎯','Target MTD',`Actual HK × ${cfg.targetSamplingCup} cup.`)}${insight('🥫','Konversi produk','1 can = 3 cup apabila perlu menghitung kebutuhan kaleng.')}${insight('🧾','Validasi angka','Keterangan “sampling habis” tanpa angka tidak dihitung sebagai actual.')}</div></div></div>
      <div class="card"><h3>Rangkuman Sampling per SPG</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Area','Nama SPG','HK','Target MTD','Actual Sampling','ACV MTD','Gap Cup','Gap Kaleng','Status'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${summaries.map(row=>{const gap=Math.max(row.samplingTarget-row.sampling,0);return `<tr class="${isFocus(row.area)?'focus-row':''}"><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.number(row.hk)}</td><td>${ctx.number(row.samplingTarget)}</td><td>${ctx.number(row.sampling)}</td><td>${pct(row.samplingAchievement,1)}</td><td>${ctx.number(gap)}</td><td>${round(gap/3,1)}</td><td>${badge(row.samplingAchievement>=1?'Tercapai':row.samplingAchievement>=.8?'Hampir':'Gap',row.samplingAchievement>=1?'green':row.samplingAchievement>=.8?'yellow':'red')}</td></tr>`}).join('')}</tbody></table></div></div>
      <div class="card"><h3>Log Sampling</h3><div class="table-wrap" style="margin-top:14px"><table><thead><tr>${['Tanggal','Area','SPG','HK','Sampling Cup','Catatan'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${records.length?records.map(row=>`<tr><td>${formatDate(row.date)}</td><td>${ctx.escapeHtml(row.area)}</td><td>${ctx.escapeHtml(row.spg)}</td><td>${ctx.number(row.hk)}</td><td>${ctx.number(row.samplingCup)}</td><td>${ctx.escapeHtml(row.notes||'-')}</td></tr>`).join(''):'<tr><td colspan="6"><div class="empty-state-report">Belum ada log sampling pada filter ini.</div></td></tr>'}</tbody></table></div></div>
    </div>`;
  }

  function renderSummary(ctx) {
    const spgs=aggregateSpg(ctx,ui.period,ui.area,ui.spg).filter(row=>String(row.status).toLowerCase()!=='vacant');
    const areas=aggregateArea(ctx,ui.period,ui.area,ui.spg);
    const topAvg=spgs.slice().sort((a,b)=>b.avg-a.avg).slice(0,3), bottomAvg=spgs.slice().sort((a,b)=>a.avg-b.avg).slice(0,3);
    const ratioRows=spgs.filter(row=>row.ratio>0), topRatio=ratioRows.slice().sort((a,b)=>a.ratio-b.ratio).slice(0,3), bottomRatio=ratioRows.slice().sort((a,b)=>b.ratio-a.ratio).slice(0,3);
    const alerts=buildInsights(spgs,areas);
    const showFocus = isTl(ctx);
    const areaHeaders = ['Area','Quota','Actual','Vacant','HK','Selling','AVG/Day','Target Month','Achievement','Value','Expense Actual','Ratio','Zona Ratio',...(showFocus ? ['Fokus'] : [])];
    return `<div class="reporting-shell">
      <div class="analytics-grid">
        <div class="card"><h3>Selling by Area</h3><small>Total actual CAN.</small><div class="hbar-list">${horizontalBarRows(areas.map(row=>({label:row.area,value:row.selling,color:isFocus(row.area)?'green':''})),value=>ctx.number(value))}</div></div>
        <div class="card"><h3>AVG by Area</h3><small>Selling ÷ actual HK.</small><div class="hbar-list">${horizontalBarRows(areas.slice().sort((a,b)=>b.avg-a.avg).map(row=>({label:row.area,value:row.avg,color:isFocus(row.area)?'yellow':''})),value=>round(value,1))}</div></div>
        <div class="card"><h3>Ratio by Coverage Area</h3><small>Expense aktual ÷ selling value. Lebih rendah lebih baik.</small><div class="hbar-list">${horizontalBarRows(areas.map(row=>({label:row.area,value:row.ratio,color:ratioZone(row.ratio).color})),value=>pct(value,1),1)}</div></div>
        <div class="card"><h3>Achievement by Area</h3><small>Actual month ÷ target month.</small><div class="hbar-list">${horizontalBarRows(areas.map(row=>({label:row.area,value:row.achievement,color:achievementZone(row.achievement).color})),value=>pct(value,1),1)}</div></div>
      </div>
      <div class="analytics-grid">
        ${rankingCard('Top 3 AVG',topAvg,row=>round(row.avg,1),ctx)}
        ${rankingCard('Bottom 3 AVG',bottomAvg,row=>round(row.avg,1),ctx)}
        ${rankingCard('Top 3 Ratio (Paling Efisien)',topRatio,row=>pct(row.ratio,1),ctx)}
        ${rankingCard('Bottom 3 Ratio (Perlu Review)',bottomRatio,row=>pct(row.ratio,1),ctx)}
      </div>
      <div class="card"><div class="btn-row" style="justify-content:space-between"><div><h3>${showFocus ? 'Analisa TL Solehudin' : 'Ringkasan Kinerja'}</h3><small>${showFocus ? 'Prioritas dari pencapaian, rasio, posisi kosong, dan area fokus.' : 'Prioritas dari pencapaian, rasio, dan posisi kosong.'}</small></div>${badge(`${alerts.filter(item=>item.level==='red').length} prioritas tinggi`,alerts.some(item=>item.level==='red')?'red':'green')}</div><div class="insight-list" style="margin-top:14px">${alerts.map(item=>insight(item.icon,item.title,item.text)).join('')}</div></div>
      <div class="card"><h3>Rangkuman per Area</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${areaHeaders.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${areas.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td><b>${ctx.escapeHtml(row.area)}</b></td><td>${row.quota}</td><td>${row.active}</td><td>${row.vacant}</td><td>${ctx.number(row.hk)}</td><td>${ctx.number(row.selling)}</td><td>${round(row.avg,1)}</td><td>${ctx.number(row.targetMonth)}</td><td>${pct(row.achievement,1)}</td><td>${ctx.money(row.value)}</td><td>${ctx.money(row.expenseActual)}</td><td>${pct(row.ratio,1)}</td><td>${badge(ratioZone(row.ratio).label,ratioZone(row.ratio).color)}</td>${showFocus ? `<td>${isFocus(row.area)?badge('Homebase / Fokus','purple'):badge('Coverage','gray')}</td>` : ''}</tr>`).join('')}</tbody></table></div></div>
      <div class="card"><h3>Rangkuman per SPG</h3><div class="table-wrap" style="margin-top:14px"><table class="report-table"><thead><tr>${['Area','SPG','Toko','HK','Selling','AVG/Day','Target Month','Achievement','Value','Expense Actual','Ratio','Zona Ratio','Sampling ACV','Status Target'].map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>${spgs.map(row=>`<tr class="${isFocus(row.area)?'focus-row':''}"><td>${ctx.escapeHtml(row.area)}</td><td><b>${ctx.escapeHtml(row.spg)}</b></td><td>${ctx.escapeHtml(row.outlet||'-')}</td><td>${row.hk}</td><td>${ctx.number(row.selling)}</td><td>${round(row.avg,1)}</td><td>${ctx.number(row.targetMonth)}</td><td>${pct(row.achievementMonth,1)}</td><td>${ctx.money(row.value)}</td><td>${ctx.money(row.expenseActual)}</td><td>${pct(row.ratio,1)}</td><td>${badge(row.ratioZone.label,row.ratioZone.color)}</td><td>${pct(row.samplingAchievement,1)}</td><td>${badge(row.achievementZone.label,row.achievementZone.color)}</td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  }

  function htmlEscape(value) { return String(value??'').replace(/[&<>"']/g,char=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char])); }
  function horizontalBarRows(items, formatter, fixedMax) {
    if (!items.length) return '<div class="empty-state-report">Belum ada data.</div>';
    const max=Math.max(n(fixedMax),...items.map(item=>n(item.value)),1);
    return items.map(item=>`<div class="hbar-row"><span title="${htmlEscape(item.label)}">${htmlEscape(item.label)}</span><div class="hbar-track"><div class="hbar-fill ${item.color||''}" style="width:${Math.max(1,Math.min(100,n(item.value)/max*100))}%"></div></div><b>${htmlEscape(formatter(item.value))}</b></div>`).join('');
  }
  function insight(icon,title,text) { return `<div class="insight-card"><span>${icon}</span><div><b>${htmlEscape(title)}</b><p>${htmlEscape(text)}</p></div></div>`; }
  function rankingCard(title,rows,formatter,ctx) {
    return `<div class="card"><h3>${ctx.escapeHtml(title)}</h3><div class="hbar-list">${horizontalBarRows(rows.map(row=>({label:row.spg,value:title.includes('Ratio')?row.ratio:row.avg,color:isFocus(row.area)?'yellow':''})),value=>title.includes('Ratio')?pct(value,1):round(value,1))}</div></div>`;
  }
  function buildInsights(spgs,areas) {
    const result=[];
    if (ui.currentRole === 'TL') {
      ACTIVE_FOCUS_AREAS.forEach(areaName=>{
        const area=areas.find(item=>item.area===areaName);
        if (!area) return;
        result.push({icon:'🏠',level:area.achievement<.8?'red':'green',title:`Fokus ${areaName}`,text:`Achievement ${pct(area.achievement,1)}, AVG ${round(area.avg,1)} can/HK, ratio ${pct(area.ratio,1)}, vacant ${area.vacant}.`});
      });
    }
    const low=spgs.slice().sort((a,b)=>a.achievementMonth-b.achievementMonth)[0];
    if (low) result.push({icon:'🎯',level:'red',title:'Prioritas achievement',text:`${low.spg} (${low.area}) memiliki achievement ${pct(low.achievementMonth,1)} dan membutuhkan ${round(low.gapCanPerDay,1)} can per sisa HK.`});
    const highRatio=spgs.filter(row=>row.ratio>0).sort((a,b)=>b.ratio-a.ratio)[0];
    if (highRatio) result.push({icon:'⚖️',level:highRatio.ratio>.4?'red':'yellow',title:'Review ratio',text:`${highRatio.spg} (${highRatio.area}) berada di ratio ${pct(highRatio.ratio,1)}; target komitmen 28%.`});
    const best=spgs.slice().sort((a,b)=>b.avg-a.avg)[0];
    if (best) result.push({icon:'🏆',level:'green',title:'Best practice',text:`${best.spg} (${best.area}) memiliki AVG tertinggi ${round(best.avg,1)} can/HK; pola aktivitasnya layak direplikasi.`});
    return result;
  }

  function value(id) { return document.getElementById(id)?.value ?? ''; }
  function checked(id) { return Boolean(document.getElementById(id)?.checked); }
  function editable(ctx) {
    if (ctx.canEdit !== false) return true;
    ctx.toast('Akun monitoring hanya dapat melihat dan mengekspor data. Perubahan dilakukan TL.');
    return false;
  }
  function selectedProfile(ctx,id) { return (ctx.data.reportingProfiles||[]).find(profile=>profile.id===id); }
  function rerender(ctx) { ctx.save(); ctx.renderPage(); }
  function setProfileFields(ctx,profileId,prefix) {
    const profile=selectedProfile(ctx,profileId);
    if (!profile) return;
    const mappings = prefix==='daily'
      ? [['dailyArea','area']]
      : prefix==='stock'
        ? [['stockFormArea','area'],['stockFormDistrict','district'],['stockFormGromin','outlet'],['stockFormSpg','spg']]
        : prefix==='coach'
          ? [['coachArea','area']]
          : prefix==='pica'
            ? [['picaArea','area']]
            : [['samplingArea','area']];
    mappings.forEach(([elementId,key])=>{ const element=document.getElementById(elementId); if(element) element.value=profile[key]||''; });
    if(prefix==='daily')updateDailyLocationFields(ctx,profile.area,'',profile.outlet);
  }

  function updateDailyLocationFields(ctx,area,selectedId='',fallbackName='') {
    const select=document.getElementById('dailyLocation'),district=document.getElementById('dailyDistrict'),gromin=document.getElementById('dailyGromin');if(!select)return;
    const rows=placementLocations(ctx,area),fallback=rows.find(row=>norm(row.name)===norm(fallbackName)),wanted=selectedId||fallback?.id||'';
    select.innerHTML=locationOptions(ctx,area,wanted,fallbackName);
    if(wanted)select.value=wanted;
    const location=rows.find(row=>row.id===select.value);
    if(district)district.value=location?.district||'';if(gromin)gromin.value=location?.name||fallbackName||'';
  }
  function chooseDailyLocation(ctx,locationId) {
    const location=placementLocations(ctx).find(row=>row.id===locationId),district=document.getElementById('dailyDistrict'),gromin=document.getElementById('dailyGromin');
    if(district)district.value=location?.district||'';if(gromin)gromin.value=location?.name||'';
  }
  function fileDataUrl(file) {
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('File nota tidak dapat dibaca.'));reader.readAsDataURL(file);});
  }
  async function prepareReceiptFile(file) {
    if(!file)throw new Error('Pilih file nota lebih dulu.');
    const allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(!allowed.includes(file.type))throw new Error('Nota harus berupa JPG, PNG, WEBP, atau PDF.');
    if(file.type==='application/pdf'){
      if(file.size>2*1024*1024)throw new Error('PDF nota maksimal 2 MB.');
      return {fileName:file.name,mimeType:file.type,size:file.size,dataUrl:await fileDataUrl(file)};
    }
    const source=await fileDataUrl(file),image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Gambar nota tidak dapat dibaca.'));img.src=source;});
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection,weak=Boolean(connection?.saveData||['slow-2g','2g','3g'].includes(connection?.effectiveType)),max=weak?1000:1400,scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    let quality=weak?0.62:0.78,dataUrl=canvas.toDataURL('image/jpeg',quality);while(dataUrl.length*.75>700000&&quality>0.42){quality-=0.08;dataUrl=canvas.toDataURL('image/jpeg',quality);}
    const baseName=String(file.name||'nota').replace(/\.[^.]+$/,'');return {fileName:`${baseName}.jpg`,mimeType:'image/jpeg',size:Math.round(dataUrl.length*.75),dataUrl};
  }
  async function handleReceiptSelection(ctx,event) {
    const file=event.target.files?.[0];if(!file)return;
    const progress=document.getElementById('receiptUploadProgress'),setProgress=(value,label)=>{if(!progress)return;progress.hidden=false;progress.style.setProperty('--receipt-progress',`${value}%`);progress.querySelector('small').textContent=label;};
    try{setProgress(20,'Membaca file…');ctx.toast('Menyiapkan nota…');await new Promise(resolve=>setTimeout(resolve,20));setProgress(55,'Mengecilkan ukuran foto…');ui.receiptDraft=await prepareReceiptFile(file);setProgress(100,'Nota siap diunggah saat laporan disimpan.');const current=document.querySelector('.receipt-upload-preview');if(current)current.outerHTML=receiptPreviewHtml(ctx,ui.receiptDraft);ctx.toast('Nota siap disimpan bersama Reporting.');}
    catch(error){ui.receiptDraft=null;event.target.value='';if(progress)progress.hidden=true;ctx.toast(error.message);}
  }

  async function saveDaily(ctx) {
    if (!editable(ctx)) return;
    const profile=selectedProfile(ctx,value('dailyProfile'));
    const date=value('dailyDate'), area=value('dailyArea')||profile?.area, spg=profile?.spg||'',location=placementLocations(ctx,area).find(row=>row.id===value('dailyLocation'));
    if (!date||!area||!profile) return ctx.toast('Tanggal, area, dan nama SPG wajib diisi.');
    if(!location)return ctx.toast('Pilih grosir/toko dari Master Lokasi Penempatan. Kecamatan akan terisi otomatis.');
    if (isRecordLocked(ctx,{date,area,profileId:profile.id,spg})) return ctx.toast('Laporan ini sudah disetujui dan dikunci. Buka kunci lebih dahulu untuk mengubahnya.');
    const selling=n(value('dailySelling'));
    const recordId=ui.editingDailyId||uid('rpt'),existing=ui.editingDailyId?ctx.data.reportingDaily.find(item=>item.id===ui.editingDailyId):null;
    let receipt={id:existing?.receiptId||'',fileName:existing?.receiptName||'',mimeType:existing?.receiptType||'',size:n(existing?.receiptSize),uploadedAt:existing?.receiptUploadedAt||'',dataUrl:existing?.receiptData||'',status:existing?.receiptStatus||'Belum Diperiksa'};
    if(ui.receiptDraft?.dataUrl){
      const button=document.getElementById('saveDailyReportBtn');if(button){button.disabled=true;button.textContent='Mengunggah nota…';}
      try{const progress=document.getElementById('receiptUploadProgress');if(progress){progress.hidden=false;progress.style.setProperty('--receipt-progress','75%');progress.querySelector('small').textContent='Mengirim nota ke penyimpanan…';}receipt=await ctx.uploadReceiptData({...ui.receiptDraft,reportId:recordId,area,profileId:profile.id,spg});if(progress){progress.style.setProperty('--receipt-progress','100%');progress.querySelector('small').textContent='Nota berhasil dikirim.';}}
      catch(error){if(button){button.disabled=false;button.textContent=ui.editingDailyId?'💾 Simpan Perubahan':'💾 Simpan Reporting';}return ctx.toast('Nota belum berhasil diunggah: '+error.message);}
    }
    const record={
      id:recordId,date,area,profileId:profile.id,spg,locationId:location.id,district:location.district||'',gromin:location.name,
      attendance:value('dailyAttendance')||'HADIR',hk:n(value('dailyHK')),selling,
      value:value('dailyValue')===''?selling*n(config(ctx).defaultSellingPrice):n(value('dailyValue')),
      poAdditional:n(value('dailyPo')),stockOpening:value('dailyOpeningStock')===''?'':n(value('dailyOpeningStock')),
      samplingCup:n(value('dailySampling')),notes:value('dailyNotes').trim(),customFields:ctx.readCustomFields?.('reporting','reportingDaily')||{},source:'MANUAL',
      receiptId:receipt?.id||'',receiptName:receipt?.fileName||'',receiptType:receipt?.mimeType||'',receiptSize:n(receipt?.size),receiptUploadedAt:receipt?.uploadedAt||'',receiptData:receipt?.dataUrl||'',receiptStatus:ui.receiptDraft?.dataUrl?'Belum Diperiksa':(existing?.receiptStatus||receipt?.status||'Belum Diperiksa'),receiptReviewNote:ui.receiptDraft?.dataUrl?'':(existing?.receiptReviewNote||''),receiptReviewedAt:ui.receiptDraft?.dataUrl?'':(existing?.receiptReviewedAt||''),receiptReviewedBy:ui.receiptDraft?.dataUrl?'':(existing?.receiptReviewedBy||''),updatedAt:new Date().toISOString()
    };
    if (ui.editingDailyId) {
      const index=ctx.data.reportingDaily.findIndex(item=>item.id===ui.editingDailyId);
      if(index>=0) ctx.data.reportingDaily[index]=Object.assign({},ctx.data.reportingDaily[index],record);
    } else ctx.data.reportingDaily.push(record);
    let ledger=ctx.data.stockLedgers.find(item=>item.period===periodOf(date)&&item.area===area&&item.profileId===profile.id&&sameOutlet(item.gromin,record.gromin));
    if(!ledger){
      ledger={id:uid('stock'),period:periodOf(date),area,district:record.district,gromin:record.gromin||profile.outlet,spg,profileId:profile.id,openingStock:record.stockOpening===''?0:record.stockOpening,poAdditional:0,baselineWeeks:[0,0,0,0,0],autoFromReporting:true,validation:'Belum Validasi',notes:'Dibuat otomatis dari Reporting SPG.'};
      ctx.data.stockLedgers.push(ledger);
    } else {
      ledger.district=record.district||ledger.district;
      ledger.spg=spg;
      ledger.gromin=record.gromin||ledger.gromin;
      if(record.stockOpening!=='') ledger.openingStock=record.stockOpening;
    }
    ui.editingDailyId='';ui.receiptDraft=null;
    ctx.toast('Reporting tersimpan. WIP, ratio, sampling, dan Cek Stock sudah diperbarui.');
    rerender(ctx);
  }

  function saveStock(ctx) {
    if (!editable(ctx)) return;
    const profile=selectedProfile(ctx,value('stockFormProfile'));
    const period=value('stockFormPeriod'),area=value('stockFormArea'),spg=value('stockFormSpg').trim()||profile?.spg||'',gromin=value('stockFormGromin').trim()||profile?.outlet||'';
    if(!period||!area||!gromin) return ctx.toast('Periode, area, dan Nama Gromin wajib diisi.');
    const row={
      id:ui.editingStockId||uid('stock'),period,area,district:value('stockFormDistrict').trim(),gromin,spg,profileId:profile?.id||'',
      openingStock:n(value('stockFormOpening')),poAdditional:n(value('stockFormPo')),
      baselineWeeks:Array.from({length:5},(_,index)=>n(value(`stockFormW${index+1}`))),
      autoFromReporting:checked('stockFormAuto'),validation:value('stockFormValidation')||'Belum Validasi',notes:value('stockFormNotes').trim(),updatedAt:new Date().toISOString()
    };
    if(ui.editingStockId){const index=ctx.data.stockLedgers.findIndex(item=>item.id===ui.editingStockId);if(index>=0)ctx.data.stockLedgers[index]=Object.assign({},ctx.data.stockLedgers[index],row);}else ctx.data.stockLedgers.push(row);
    ui.stockPeriod=period;ui.stockArea=area;ui.editingStockId='';ctx.toast('Baris stock tersimpan.');rerender(ctx);
  }

  function saveCoaching(ctx) {
    if (!editable(ctx)) return;
    const profile=selectedProfile(ctx,value('coachProfile'));
    if(!profile||!value('coachDate')) return ctx.toast('Tanggal dan nama SPG wajib diisi.');
    const row={id:ui.editingCoachingId||uid('coach'),date:value('coachDate'),area:value('coachArea')||profile.area,profileId:profile.id,spg:profile.spg,beforeAvg:n(value('coachBefore')),afterAvg:n(value('coachAfter')),topic:value('coachTopic').trim(),action:value('coachAction').trim(),status:value('coachStatus')||'Open',notes:value('coachNotes').trim(),updatedAt:new Date().toISOString()};
    if(ui.editingCoachingId){const index=ctx.data.coachingRecords.findIndex(item=>item.id===ui.editingCoachingId);if(index>=0)ctx.data.coachingRecords[index]=Object.assign({},ctx.data.coachingRecords[index],row);}else ctx.data.coachingRecords.push(row);
    ui.editingCoachingId='';ctx.toast('Coaching tersimpan.');rerender(ctx);
  }

  function savePica(ctx) {
    if (!editable(ctx)) return;
    const profile=selectedProfile(ctx,value('picaProfile'));
    if(!value('picaProblem').trim()||!value('picaAction').trim()) return ctx.toast('Problem dan action wajib diisi.');
    const row={id:ui.editingPicaId||uid('pica'),area:value('picaArea')||profile?.area||'Banjarmasin',profileId:profile?.id||'',spg:profile?.spg||'',problem:value('picaProblem').trim(),identification:value('picaIdentification').trim(),corrective:value('picaCorrective').trim(),action:value('picaAction').trim(),dueDate:value('picaDueDate'),pic:value('picaPic').trim(),status:value('picaStatus')||'Open',updatedAt:new Date().toISOString()};
    if(ui.editingPicaId){const index=ctx.data.picaRecords.findIndex(item=>item.id===ui.editingPicaId);if(index>=0)ctx.data.picaRecords[index]=Object.assign({},ctx.data.picaRecords[index],row);}else ctx.data.picaRecords.push(row);
    ui.editingPicaId='';ctx.toast('PICA tersimpan.');rerender(ctx);
  }

  function saveProfile(ctx) {
    if (!editable(ctx)) return;
    const area=value('profileArea'),spg=value('profileName').trim();
    if(!area||!spg) return ctx.toast('Area dan nama SPG/posisi wajib diisi.');
    const row={id:ui.editingProfileId||uid('rspg'),area,spg,outlet:value('profileOutlet').trim(),district:value('profileDistrict').trim(),joinDate:value('profileJoinDate'),status:value('profileStatus')||'Aktif',targetHK:n(value('profileTargetHK')),targetMonth:n(value('profileTargetMonth')),resignDate:value('profileResignDate'),resignReason:value('profileResignReason').trim(),lostManDays:n(value('profileLostDays')),commitmentDate:value('profileCommitmentDate'),notes:value('profileNotes').trim(),updatedAt:new Date().toISOString()};
    if(ui.editingProfileId){const index=ctx.data.reportingProfiles.findIndex(item=>item.id===ui.editingProfileId);if(index>=0)ctx.data.reportingProfiles[index]=Object.assign({},ctx.data.reportingProfiles[index],row);}else ctx.data.reportingProfiles.push(row);
    ui.editingProfileId='';ctx.toast('Data SPG / vacant tersimpan.');rerender(ctx);
  }

  function saveSampling(ctx) {
    if (!editable(ctx)) return;
    const profile=selectedProfile(ctx,value('samplingProfile')),date=value('samplingDate');
    if(!profile||!date) return ctx.toast('Tanggal dan nama SPG wajib diisi.');
    if (isRecordLocked(ctx,{date,area:profile.area,profileId:profile.id,spg:profile.spg})) return ctx.toast('Laporan ini sudah disetujui dan dikunci. Buka kunci lebih dahulu untuk mengubahnya.');
    let record=ctx.data.reportingDaily.find(item=>item.date===date&&item.profileId===profile.id);
    if(record){record.samplingCup=n(value('samplingCup'));record.hk=Math.max(n(record.hk),n(value('samplingHK')));record.notes=[record.notes,value('samplingNotes').trim()].filter(Boolean).join(' • ');record.updatedAt=new Date().toISOString();}
    else ctx.data.reportingDaily.push({id:uid('rpt'),date,area:profile.area,profileId:profile.id,spg:profile.spg,district:profile.district,gromin:profile.outlet,attendance:'HADIR',hk:n(value('samplingHK')),selling:0,value:0,poAdditional:0,samplingCup:n(value('samplingCup')),notes:value('samplingNotes').trim(),source:'SAMPLING_QUICK_INPUT'});
    ctx.toast('Sampling tersimpan dan rangkuman diperbarui.');rerender(ctx);
  }

  function confirmDelete(ctx,collection,id,label) {
    if (!editable(ctx)) return;
    if (collection==='reportingDaily') {
      const record=(ctx.data.reportingDaily||[]).find(item=>item.id===id);
      if (record&&isRecordLocked(ctx,record)) return ctx.toast('Laporan ini sudah dikunci dan tidak dapat dihapus.');
    }
    if(!confirm(`Hapus ${label} ini?`)) return;
    ctx.data[collection]=ctx.data[collection].filter(item=>item.id!==id);ctx.save();ctx.toast(`${label} dihapus.`);ctx.renderPage();
  }

  function bind(ctx) {
    if(isMonitor(ctx))bindMonitorExportRange(ctx,'monitorReporting');
    document.getElementById('toggleReportLockBtn')?.addEventListener('click',async()=>{
      if(!isTl(ctx))return;
      const button=document.getElementById('toggleReportLockBtn'),wasLocked=Boolean(exactReportLock(ctx));button.disabled=true;button.textContent='Menyimpan…';
      try{const locked=await ctx.togglePeriodLock?.({period:ui.period,area:ui.area,spg:ui.spg});ctx.toast(locked?'Laporan sudah disetujui dan dikunci.':'Kunci laporan sudah dibuka.');ctx.renderPage();}
      catch(error){button.disabled=false;button.textContent=wasLocked?'Buka Kunci':'Setujui & Kunci';ctx.toast(error.message||'Status kunci belum tersimpan.');}
    });
    document.querySelectorAll('[data-report-tab]').forEach(button=>button.addEventListener('click',()=>{ui.tab=button.dataset.reportTab;ctx.renderPage();}));
    document.getElementById('reportPeriodFilter')?.addEventListener('change',event=>{ui.period=event.target.value||config(ctx).defaultPeriod;ui.dailyPage=1;saveMonitorFilters(ctx);ctx.renderPage();});
    document.getElementById('reportAreaFilter')?.addEventListener('change',event=>{ui.area=event.target.value||'Semua';ui.spg='Semua';ui.dailyPage=1;saveMonitorFilters(ctx);ctx.renderPage();});
    document.getElementById('reportSpgFilter')?.addEventListener('change',event=>{ui.spg=event.target.value||'Semua';ui.dailyPage=1;saveMonitorFilters(ctx);ctx.renderPage();});
    document.getElementById('dailyPageSize')?.addEventListener('change',event=>{ui.dailyPageSize=n(event.target.value)||10;ui.dailyPage=1;ctx.renderPage();});
    document.querySelectorAll('[data-daily-page]').forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;ui.dailyPage=n(button.dataset.dailyPage)||1;ctx.renderPage();}));
    document.getElementById('stockPeriodFilter')?.addEventListener('change',event=>{ui.stockPeriod=event.target.value||config(ctx).defaultPeriod;ui.editingStockId='';ctx.renderPage();});
    document.getElementById('stockAreaFilter')?.addEventListener('change',event=>{ui.stockArea=event.target.value||'Banjarmasin';ui.editingStockId='';ctx.renderPage();});
    document.getElementById('newStockRowBtn')?.addEventListener('click',()=>{ui.editingStockId='';document.getElementById('stockFormCard')?.scrollIntoView({behavior:'smooth'});});

    document.getElementById('dailyProfile')?.addEventListener('change',event=>setProfileFields(ctx,event.target.value,'daily'));
    document.getElementById('dailyArea')?.addEventListener('change',event=>updateDailyLocationFields(ctx,event.target.value));
    document.getElementById('dailyLocation')?.addEventListener('change',event=>chooseDailyLocation(ctx,event.target.value));
    document.getElementById('dailyReceipt')?.addEventListener('change',event=>handleReceiptSelection(ctx,event));
    document.getElementById('stockFormProfile')?.addEventListener('change',event=>setProfileFields(ctx,event.target.value,'stock'));
    document.getElementById('coachProfile')?.addEventListener('change',event=>setProfileFields(ctx,event.target.value,'coach'));
    document.getElementById('picaProfile')?.addEventListener('change',event=>setProfileFields(ctx,event.target.value,'pica'));
    document.getElementById('samplingProfile')?.addEventListener('change',event=>setProfileFields(ctx,event.target.value,'sampling'));
    const sellingInput=document.getElementById('dailySelling'),valueInput=document.getElementById('dailyValue');
    if(sellingInput&&valueInput){valueInput.addEventListener('input',()=>{valueInput.dataset.manual='1';});sellingInput.addEventListener('input',()=>{if(!valueInput.dataset.manual&&!ui.editingDailyId)valueInput.value=n(sellingInput.value)*n(config(ctx).defaultSellingPrice);});}

    document.getElementById('saveDailyReportBtn')?.addEventListener('click',()=>saveDaily(ctx));
    document.getElementById('saveStockRowBtn')?.addEventListener('click',()=>saveStock(ctx));
    document.getElementById('saveCoachingBtn')?.addEventListener('click',()=>saveCoaching(ctx));
    document.getElementById('savePicaBtn')?.addEventListener('click',()=>savePica(ctx));
    document.getElementById('saveProfileBtn')?.addEventListener('click',()=>saveProfile(ctx));
    document.getElementById('saveSamplingBtn')?.addEventListener('click',()=>saveSampling(ctx));
    document.getElementById('cancelDailyEditBtn')?.addEventListener('click',()=>{ui.editingDailyId='';ui.receiptDraft=null;ctx.renderPage();});
    document.getElementById('cancelStockEditBtn')?.addEventListener('click',()=>{ui.editingStockId='';ctx.renderPage();});
    document.getElementById('cancelCoachingEditBtn')?.addEventListener('click',()=>{ui.editingCoachingId='';ctx.renderPage();});
    document.getElementById('cancelPicaEditBtn')?.addEventListener('click',()=>{ui.editingPicaId='';ctx.renderPage();});
    document.getElementById('cancelProfileEditBtn')?.addEventListener('click',()=>{ui.editingProfileId='';ctx.renderPage();});

    document.querySelectorAll('[data-edit-daily]').forEach(button=>button.addEventListener('click',()=>{const record=(ctx.data.reportingDaily||[]).find(item=>item.id===button.dataset.editDaily);if(record&&isRecordLocked(ctx,record))return ctx.toast('Laporan ini sudah dikunci.');ui.receiptDraft=null;ui.editingDailyId=button.dataset.editDaily;ctx.renderPage();setTimeout(()=>document.getElementById('dailyDate')?.scrollIntoView({behavior:'smooth'}),30);}));
    document.querySelectorAll('[data-open-receipt]').forEach(button=>button.addEventListener('click',()=>{const record=(ctx.data.reportingDaily||[]).find(item=>item.id===button.dataset.openReceipt);if(record)ctx.openReceipt?.(record);}));
    document.querySelectorAll('[data-delete-daily]').forEach(button=>button.addEventListener('click',()=>confirmDelete(ctx,'reportingDaily',button.dataset.deleteDaily,'reporting')));
    document.querySelectorAll('[data-edit-stock]').forEach(button=>button.addEventListener('click',()=>{ui.editingStockId=button.dataset.editStock;ctx.renderPage();setTimeout(()=>document.getElementById('stockFormCard')?.scrollIntoView({behavior:'smooth'}),30);}));
    document.querySelectorAll('[data-delete-stock]').forEach(button=>button.addEventListener('click',()=>confirmDelete(ctx,'stockLedgers',button.dataset.deleteStock,'baris stock')));
    document.querySelectorAll('[data-edit-coaching]').forEach(button=>button.addEventListener('click',()=>{ui.editingCoachingId=button.dataset.editCoaching;ctx.renderPage();}));
    document.querySelectorAll('[data-delete-coaching]').forEach(button=>button.addEventListener('click',()=>confirmDelete(ctx,'coachingRecords',button.dataset.deleteCoaching,'coaching')));
    document.querySelectorAll('[data-edit-pica]').forEach(button=>button.addEventListener('click',()=>{ui.editingPicaId=button.dataset.editPica;ctx.renderPage();}));
    document.querySelectorAll('[data-delete-pica]').forEach(button=>button.addEventListener('click',()=>confirmDelete(ctx,'picaRecords',button.dataset.deletePica,'PICA')));
    document.querySelectorAll('[data-edit-profile]').forEach(button=>button.addEventListener('click',()=>{ui.editingProfileId=button.dataset.editProfile;ctx.renderPage();}));
    document.querySelectorAll('[data-delete-profile]').forEach(button=>button.addEventListener('click',()=>confirmDelete(ctx,'reportingProfiles',button.dataset.deleteProfile,'data SPG')));
    document.querySelectorAll('[data-stock-validation]').forEach(select=>select.addEventListener('change',()=>{if(!editable(ctx))return;const row=ctx.data.stockLedgers.find(item=>item.id===select.dataset.stockValidation);if(row){row.validation=select.value;ctx.save();ctx.toast('Status validasi stock diperbarui.');}}));

    document.getElementById('exportStockAreaBtn')?.addEventListener('click',()=>exportStockExcel(ctx,false));
    document.getElementById('exportStockAllBtn')?.addEventListener('click',()=>exportStockExcel(ctx,true));
    document.getElementById('exportStockPdfBtn')?.addEventListener('click',()=>exportStockPdf(ctx));
    document.getElementById('exportReportingAreaBtn')?.addEventListener('click',()=>exportReportingExcel(ctx,false));
    document.getElementById('exportReportingAllBtn')?.addEventListener('click',()=>exportReportingExcel(ctx,true));
    document.getElementById('exportWipBtn')?.addEventListener('click',()=>exportReportingExcel(ctx,false));
    document.getElementById('exportReportingPdfBtn')?.addEventListener('click',()=>exportReportingPdf(ctx));
  }

  function stockSheet(ctx,area,period) {
    const cfg=config(ctx), rows=stockRows(ctx,period,area), tableRows=Array.from({length:12},(_,index)=>rows[index]||null);
    const aoa=[
      ['NAMA AREA','',`: ${area.toUpperCase()}`],
      ['NAMA MS/SCO','',`: ${(cfg.scoByArea[area]||'').toUpperCase()}`],
      ['PERIODE','',`: ${monthLabel(period)}`],
      ['', '', '', '', '', '', 'TGL 1 - 7','TGL 8 - 14','TGL 15 - 21','TGL 22 - 28','TGL 29 - 31','', 'TTD & STEMPEL'],
      ['No.','Nama Kecamatan','Nama Gromin','Nama SPG','Stock Awal Bulan(CAN)','PO TAMBAHAN OUTLET (CAN)','SELLOUT W1','SELLOUT W2','SELLOUT W3','SELLOUT W4','SELLOUT W5','Stock Actual Saat Ini (CAN)','VALIDASI OUTLET']
    ];
    tableRows.forEach((row,index)=>aoa.push(row ? [index+1,row.district||'',row.gromin||'',row.spg||'',n(row.openingStock),n(row.po),...row.weeks.map(n),n(row.actual),row.validation||'Belum Validasi'] : [index+1,'','','','','','','','','','','','']));
    aoa.push(['TOTAL','','','','','','','','','','','','']);
    aoa.push(['NOTE :','', '1. AM / MS sudah mengecek dan memvalidasi stock akhir gromin sudah sesuai dengan data terlampir']);
    aoa.push([],[]);
    aoa.push(['','','','','','','Dibuat Oleh,','','Diperiksa Oleh,','','Disetujui Oleh,','','']);
    aoa.push([],[],[],[],[]);
    aoa.push(['','','','','','',cfg.tlName,'',cfg.scoByArea[area]||'','',cfg.areaManagerName,'','']);
    aoa.push(['','','','','','','TL','','MS/SCO','','Area Manager','','']);
    const ws=XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols']=[{wch:5},{wch:23},{wch:30},{wch:27},{wch:18},{wch:23},{wch:17},{wch:17},{wch:17},{wch:17},{wch:17},{wch:23},{wch:22}];
    ws['!rows']=[{hpt:22},{hpt:22},{hpt:22},{hpt:20},{hpt:44},...Array.from({length:12},()=>({hpt:30})),{hpt:28},{hpt:26},{hpt:10},{hpt:10},{hpt:24},{hpt:22},{hpt:22},{hpt:22},{hpt:22},{hpt:22},{hpt:22},{hpt:26},{hpt:24}];
    ws['!merges']=[
      {s:{r:0,c:0},e:{r:0,c:1}},{s:{r:0,c:2},e:{r:0,c:4}},
      {s:{r:1,c:0},e:{r:1,c:1}},{s:{r:1,c:2},e:{r:1,c:4}},
      {s:{r:2,c:0},e:{r:2,c:1}},{s:{r:2,c:2},e:{r:2,c:4}},
      {s:{r:17,c:0},e:{r:17,c:3}},{s:{r:18,c:0},e:{r:18,c:1}},{s:{r:18,c:2},e:{r:18,c:12}},
      {s:{r:21,c:6},e:{r:21,c:7}},{s:{r:21,c:8},e:{r:21,c:9}},{s:{r:21,c:10},e:{r:21,c:11}},
      {s:{r:22,c:6},e:{r:26,c:7}},{s:{r:22,c:8},e:{r:26,c:9}},{s:{r:22,c:10},e:{r:26,c:11}},
      {s:{r:27,c:6},e:{r:27,c:7}},{s:{r:27,c:8},e:{r:27,c:9}},{s:{r:27,c:10},e:{r:27,c:11}},
      {s:{r:28,c:6},e:{r:28,c:7}},{s:{r:28,c:8},e:{r:28,c:9}},{s:{r:28,c:10},e:{r:28,c:11}}
    ];
    const thin={style:'thin',color:{rgb:'334155'}}, border={top:thin,bottom:thin,left:thin,right:thin};
    const center={horizontal:'center',vertical:'center',wrapText:true};
    const headerStyle={fill:{fgColor:{rgb:'00DDE6'}},font:{bold:true,color:{rgb:'082F49'}},alignment:center,border};
    for(let row=0;row<29;row++)for(let col=0;col<13;col++){
      const address=`${excelColumn(col)}${row+1}`;
      if(!ws[address])ws[address]={t:'s',v:''};
      if(row===4)ws[address].s=headerStyle;
      else if(row>=5&&row<=17)ws[address].s={alignment:col>=4?center:{vertical:'center',wrapText:true},border};
      else if(row===3)ws[address].s={font:{bold:true,size:9},alignment:center};
      else if(row<=2)ws[address].s={font:{bold:true},alignment:{vertical:'center'}};
    }
    ws.M4.s={fill:{fgColor:{rgb:'FFF200'}},font:{bold:true,color:{rgb:'365314'}},alignment:center,border};
    for(let index=0;index<12;index++){
      const excelRow=index+6;
      const row=tableRows[index];
      ws[`L${excelRow}`]={t:'n',f:`E${excelRow}+F${excelRow}-SUM(G${excelRow}:K${excelRow})`,v:row?n(row.actual):0,s:{alignment:center,border,numFmt:'#,##0'}};
      ['E','F','G','H','I','J','K'].forEach(column=>{if(ws[`${column}${excelRow}`])ws[`${column}${excelRow}`].z='#,##0';});
    }
    for(let col=4;col<=11;col++){
      const column=excelColumn(col),address=`${column}18`;
      ws[address]={t:'n',f:`SUM(${column}6:${column}17)`,v:rows.reduce((sum,row)=>sum+(col===4?n(row.openingStock):col===5?n(row.po):col<=10?n(row.weeks[col-6]):n(row.actual)),0),s:{font:{bold:true},alignment:center,border,numFmt:'#,##0'}};
    }
    for(let col=0;col<13;col++){const address=`${excelColumn(col)}18`;if(!ws[address])ws[address]={t:'s',v:''};ws[address].s=Object.assign({},ws[address].s||{},{font:{bold:true},alignment:center,border});}
    [[21,6,11],[22,6,11],[27,6,11],[28,6,11]].forEach(([row,start,end])=>{for(let col=start;col<=end;col++){const address=`${excelColumn(col)}${row+1}`;if(!ws[address])ws[address]={t:'s',v:''};ws[address].s={font:{bold:true,size:10},alignment:center,border};}});
    ws['!autofilter']={ref:'A5:M17'};
    ws['!pageSetup']={orientation:'landscape',fitToWidth:1,fitToHeight:1,paperSize:9};
    ws['!margins']={left:.2,right:.2,top:.35,bottom:.35,header:.1,footer:.1};
    return ws;
  }

  function addExcelJsStockSheet(workbook,ctx,area,period) {
    const cfg=config(ctx),rows=stockRows(ctx,period,area),sheet=workbook.addWorksheet(area,{
      properties:{defaultRowHeight:21},views:[{state:'frozen',ySplit:5}],
      pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:1,horizontalCentered:true,verticalCentered:false,margins:{left:.2,right:.2,top:.25,bottom:.25,header:.1,footer:.1}}
    });
    const widths=[5,23,30,27,18,23,17,17,17,17,17,23,22];
    widths.forEach((width,index)=>{sheet.getColumn(index+1).width=width;});
    sheet.mergeCells('A1:B1');sheet.mergeCells('C1:E1');sheet.mergeCells('A2:B2');sheet.mergeCells('C2:E2');sheet.mergeCells('A3:B3');sheet.mergeCells('C3:E3');
    sheet.getCell('A1').value='NAMA AREA';sheet.getCell('C1').value=`: ${area.toUpperCase()}`;
    sheet.getCell('A2').value='NAMA MS/SCO';sheet.getCell('C2').value=`: ${(cfg.scoByArea[area]||'').toUpperCase()}`;
    sheet.getCell('A3').value='PERIODE';sheet.getCell('C3').value=`: ${monthLabel(period)}`;
    ['A1','C1','A2','C2','A3','C3'].forEach(address=>{sheet.getCell(address).font={bold:true,size:11};sheet.getCell(address).alignment={vertical:'middle'};});
    ['G4','H4','I4','J4','K4'].forEach((address,index)=>{sheet.getCell(address).value=['TGL 1 - 7','TGL 8 - 14','TGL 15 - 21','TGL 22 - 28','TGL 29 - 31'][index];sheet.getCell(address).font={bold:true,size:9};sheet.getCell(address).alignment={horizontal:'center',vertical:'middle'};});
    sheet.getCell('M4').value='TTD & STEMPEL';sheet.getCell('M4').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFF00'}};sheet.getCell('M4').font={bold:true,size:9,color:{argb:'FF365314'}};sheet.getCell('M4').alignment={horizontal:'center',vertical:'middle'};
    const headers=['No.','Nama Kecamatan','Nama Gromin','Nama SPG','Stock Awal Bulan(CAN)','PO TAMBAHAN OUTLET (CAN)','SELLOUT W1','SELLOUT W2','SELLOUT W3','SELLOUT W4','SELLOUT W5','Stock Actual Saat Ini (CAN)','VALIDASI OUTLET'];
    sheet.getRow(5).values=headers;sheet.getRow(5).height=44;
    const thin={style:'thin',color:{argb:'FF334155'}};
    sheet.getRow(5).eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF00DDE6'}};cell.font={bold:true,size:10,color:{argb:'FF082F49'}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border={top:thin,left:thin,bottom:thin,right:thin};});
    for(let index=0;index<12;index++){
      const rowNumber=index+6,row=rows[index],excelRow=sheet.getRow(rowNumber);excelRow.height=30;
      excelRow.values=row?[index+1,row.district||'',row.gromin||'',row.spg||'',n(row.openingStock),n(row.po),...row.weeks.map(n),{formula:`E${rowNumber}+F${rowNumber}-SUM(G${rowNumber}:K${rowNumber})`,result:n(row.actual)},row.validation||'Belum Validasi']:[index+1,'','','','','','','','','','','',''];
      excelRow.eachCell({includeEmpty:true},(cell,column)=>{cell.border={top:thin,left:thin,bottom:thin,right:thin};cell.alignment={horizontal:column===1||column>=5?'center':'left',vertical:'middle',wrapText:true};if(column>=5&&column<=12)cell.numFmt='#,##0';});
    }
    sheet.mergeCells('A18:D18');sheet.getCell('A18').value='TOTAL';
    for(let column=5;column<=12;column++){const letter=excelColumn(column-1),result=rows.reduce((sum,row)=>sum+(column===5?n(row.openingStock):column===6?n(row.po):column<=11?n(row.weeks[column-7]):n(row.actual)),0);sheet.getCell(`${letter}18`).value={formula:`SUM(${letter}6:${letter}17)`,result};sheet.getCell(`${letter}18`).numFmt='#,##0';}
    sheet.getRow(18).height=28;sheet.getRow(18).eachCell({includeEmpty:true},cell=>{cell.font={bold:true};cell.alignment={horizontal:'center',vertical:'middle'};cell.border={top:thin,left:thin,bottom:thin,right:thin};});
    sheet.mergeCells('A19:B19');sheet.mergeCells('C19:M19');sheet.getCell('A19').value='NOTE :';sheet.getCell('C19').value='1. AM / MS sudah mengecek dan memvalidasi stock akhir gromin sudah sesuai dengan data terlampir';sheet.getCell('A19').font={bold:true,size:9};sheet.getCell('C19').font={bold:true,size:9};sheet.getRow(19).height=24;
    sheet.mergeCells('G22:H22');sheet.mergeCells('I22:J22');sheet.mergeCells('K22:L22');
    sheet.mergeCells('G23:H27');sheet.mergeCells('I23:J27');sheet.mergeCells('K23:L27');
    sheet.mergeCells('G28:H28');sheet.mergeCells('I28:J28');sheet.mergeCells('K28:L28');
    sheet.mergeCells('G29:H29');sheet.mergeCells('I29:J29');sheet.mergeCells('K29:L29');
    [['G22','Dibuat Oleh,'],['I22','Diperiksa Oleh,'],['K22','Disetujui Oleh,'],['G28',cfg.tlName],['I28',cfg.scoByArea[area]||''],['K28',cfg.areaManagerName],['G29','TL'],['I29','MS/SCO'],['K29','Area Manager']].forEach(([address,text])=>{const cell=sheet.getCell(address);cell.value=text;cell.font={bold:true,size:10};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};});
    ['G22:H29','I22:J29','K22:L29'].forEach(range=>{sheet.getRange?.(range);});
    for(let row=22;row<=29;row++)for(let column=7;column<=12;column++)sheet.getCell(row,column).border={top:thin,left:thin,bottom:thin,right:thin};
    for(let row=23;row<=27;row++)sheet.getRow(row).height=20;sheet.getRow(28).height=24;sheet.getRow(29).height=22;
    sheet.autoFilter={from:'A5',to:'M17'};sheet.pageSetup.printArea='A1:M29';sheet.pageSetup.printTitlesRow='1:5';
    sheet.headerFooter.oddFooter='&LWebsite Extra Joss SPG&C&P / &N&R'+monthLabel(period);
    return sheet;
  }

  async function buildStockWorkbookBuffer(ctx,allAreas) {
    if(!window.ExcelJS)throw new Error('ExcelJS belum termuat.');
    const workbook=new ExcelJS.Workbook(),cfg=config(ctx);workbook.creator=cfg.tlName;workbook.company='Website Extra Joss SPG';workbook.title='VALIDASI STOCK ALL AREA';workbook.subject=`Periode ${monthLabel(ui.stockPeriod)}`;workbook.created=new Date();workbook.modified=new Date();
    const targetAreas=allAreas?allowedAreas(ctx):[ui.stockArea];targetAreas.forEach(area=>addExcelJsStockSheet(workbook,ctx,area,ui.stockPeriod));
    return workbook.xlsx.writeBuffer();
  }

  function downloadBuffer(buffer,filename) {
    const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  async function exportStockExcel(ctx,allAreas) {
    try{
      if(window.ExcelJS){const buffer=await buildStockWorkbookBuffer(ctx,allAreas);downloadBuffer(buffer,`VALIDASI STOCK ${allAreas?'ALL AREA':ui.stockArea.toUpperCase()}_${ui.stockPeriod}.xlsx`);ctx.toast('Excel Cek Stock berhasil dibuat dengan styling, formula, dan tabel tanda tangan.');return;}
      if(!window.XLSX)throw new Error('Library Excel belum termuat.');
      const workbook=XLSX.utils.book_new(),targetAreas=allAreas?allowedAreas(ctx):[ui.stockArea];targetAreas.forEach(area=>XLSX.utils.book_append_sheet(workbook,stockSheet(ctx,area,ui.stockPeriod),safeSheetName(area)));XLSX.writeFile(workbook,`VALIDASI STOCK ${allAreas?'ALL AREA':ui.stockArea.toUpperCase()}_${ui.stockPeriod}.xlsx`,{cellStyles:true});ctx.toast('Excel Cek Stock berhasil dibuat.');
    }catch(error){ctx.toast('Gagal membuat Excel Cek Stock: '+error.message);}
  }
  function exportStockPdf(ctx){
    try{if(!window.jspdf?.jsPDF)throw new Error('Library PDF belum termuat.');const {jsPDF}=window.jspdf,rows=stockRows(ctx,ui.stockPeriod,ui.stockArea),doc=new jsPDF({orientation:'landscape'});doc.setFontSize(17);doc.text('CEK STOCK SPG',14,15);doc.setFontSize(9);doc.text(`${ui.stockArea} • ${monthLabel(ui.stockPeriod)} • Solehudin`,14,22);doc.autoTable({startY:28,head:[['Stokis','SPG','Stok Awal','PO','W1','W2','W3','W4','W5','Stok Actual','Keterangan']],body:rows.map(row=>[row.gromin||'-',row.spg||'-',row.openingStock,row.po,...row.weeks,row.actual,row.validation||'-']),styles:{fontSize:7},headStyles:{fillColor:[24,42,76]}});doc.save(`CEK STOCK ${ui.stockArea.toUpperCase()}_${ui.stockPeriod}.pdf`);ctx.toast('PDF Cek Stock berhasil dibuat.');}catch(error){ctx.toast('Gagal membuat PDF: '+error.message);}
  }

  function addJsonSheet(workbook,name,rows,width=20) {
    const data=rows.length?rows:[{Keterangan:'Belum ada data pada filter ini'}];
    const ws=XLSX.utils.json_to_sheet(data);
    const headers=Object.keys(data[0]||{});
    ws['!cols']=headers.map(header=>({wch:Math.min(38,Math.max(width,String(header).length+3,...data.slice(0,100).map(row=>String(row[header]??'').length+2)))}));
    const thin={style:'thin',color:{rgb:'CBD5E1'}};
    headers.forEach((_,index)=>{const cell=ws[`${excelColumn(index)}1`];if(cell)cell.s={fill:{fgColor:{rgb:'B4C7E7'}},font:{bold:true,color:{rgb:'0F172A'}},alignment:{horizontal:'center',vertical:'center',wrapText:true},border:{top:thin,bottom:thin,left:thin,right:thin}};});
    ws['!autofilter']={ref:`A1:${excelColumn(Math.max(0,headers.length-1))}${Math.max(1,data.length+1)}`};
    XLSX.utils.book_append_sheet(workbook,ws,safeSheetName(name));
  }

  const REPORT_TEMPLATE_PATH = 'templates/DAILY REPORT SPG JULI 2026_SOLEH.xlsx';
  const DAILY_TEMPLATE_LAYOUT = [
    { area:'Banjarmasin', areaRow:1, nameRow:2, headingRow:3, startRow:4, endRow:34, columns:['S','X','AC','AH'], summaryRows:[5,6,7,8], totalRow:9 },
    { area:'Samarinda', areaRow:37, nameRow:38, headingRow:39, startRow:40, endRow:70, columns:['S','X'], summaryRows:[40,41], totalRow:42 },
    { area:'Balikpapan', areaRow:37, nameRow:38, headingRow:39, startRow:40, endRow:70, columns:['AC','AH'], summaryRows:[26,27], totalRow:28 },
    { area:'Palangkaraya', areaRow:80, nameRow:81, headingRow:82, startRow:83, endRow:113, columns:['S','X'], summaryRows:[33,34], totalRow:35 },
    { area:'Manado', areaRow:80, nameRow:81, headingRow:82, startRow:83, endRow:113, columns:['AC','AH'], summaryRows:[86,87], totalRow:88 },
    { area:'Makassar', areaRow:116, nameRow:117, headingRow:118, startRow:119, endRow:149, columns:['S','X','AC','AH'], summaryRows:[122,123], totalRow:124 }
  ];
  const WIP_TEMPLATE_LAYOUT = {
    Banjarmasin:{rows:[6,7,8,9],total:10}, Balikpapan:{rows:[11,12],total:13}, Palangkaraya:{rows:[14,15],total:16},
    Samarinda:{rows:[17,18],total:19}, Makassar:{rows:[20,21],total:22}, Manado:{rows:[23,24],total:25}
  };

  function excelCell(sheet,row,column) {
    const cell=sheet.getCell(row,column);
    return cell.isMerged ? cell.master : cell;
  }
  function setExcelValue(sheet,row,column,value) { excelCell(sheet,row,column).value=value; }
  function clearExcelRange(sheet,rowStart,columnStart,rowEnd,columnEnd) {
    const seen=new Set();
    for(let row=rowStart;row<=rowEnd;row++)for(let column=columnStart;column<=columnEnd;column++){
      const cell=excelCell(sheet,row,column);if(seen.has(cell.address))continue;seen.add(cell.address);cell.value=null;
    }
  }
  function setExcelFormula(sheet,address,formula,result) {
    const cell=sheet.getCell(address);cell.value={formula,result:Number.isFinite(Number(result))?Number(result):0};
  }
  function setExcelNumberFormat(cell,format) {
    cell.style=Object.assign({},cell.style||{},{numFmt:format});
  }
  function excelDate(value) {
    if(!value)return null;const date=new Date(`${String(value).slice(0,10)}T00:00:00`);return Number.isNaN(date.getTime())?String(value):date;
  }
  function dateLabel(value) {
    if(!value)return '';
    const date=excelDate(value);if(!(date instanceof Date))return String(value);
    return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(date);
  }
  function daysInPeriod(period) {
    const [year,month]=String(period||'').split('-').map(Number);return year&&month?new Date(year,month,0).getDate():31;
  }
  function periodDate(period,day) {
    const [year,month]=String(period||'').split('-').map(Number);return new Date(year||2026,(month||7)-1,day);
  }
  function templateProfiles(ctx,area,include,scopeSpg='Semua') {
    if(!include)return [];
    return (ctx.data.reportingProfiles||[]).filter(profile=>profile.area===area&&String(profile.status).toLowerCase()!=='vacant'&&(scopeSpg==='Semua'||profile.id===scopeSpg||norm(profile.spg)===norm(scopeSpg)));
  }
  function templateWipRow(wip,profile) {
    return wip.find(row=>row.id===profile?.id)||wip.find(row=>row.area===profile?.area&&norm(row.spg)===norm(profile?.spg));
  }
  function dailyForProfile(ctx,profile,period) {
    return dailyRows(ctx,period,profile.area).filter(record=>record.profileId===profile.id||(!record.profileId&&norm(record.spg)===norm(profile.spg)));
  }
  function aggregateDailyDate(records,dateKey) {
    const rows=records.filter(record=>String(record.date).slice(0,10)===dateKey);
    if(!rows.length)return null;
    const absent=rows.find(row=>row.attendance&&row.attendance!=='HADIR');
    return { status:absent?absent.attendance:rows.reduce((sum,row)=>sum+n(row.hk),0)||1, selling:rows.reduce((sum,row)=>sum+n(row.selling),0), value:rows.reduce((sum,row)=>sum+n(row.value),0), sampling:rows.reduce((sum,row)=>sum+n(row.samplingCup),0) };
  }
  function wipTotals(rows) {
    return rows.reduce((total,row)=>{total.hk+=n(row?.hk);total.targetHK+=n(row?.targetHK);total.targetByHK+=n(row?.targetByHK);total.selling+=n(row?.selling);total.targetMonth+=n(row?.targetMonth);total.value+=n(row?.value);total.expense+=n(row?.expenseActual);for(let i=0;i<5;i++){total.weekly[i].selling+=n(row?.weekly?.[i]?.selling);total.weekly[i].hk+=n(row?.weekly?.[i]?.hk);}return total;},{hk:0,targetHK:0,targetByHK:0,selling:0,targetMonth:0,value:0,expense:0,weekly:Array.from({length:5},()=>({selling:0,hk:0}))});
  }
  function fillDailyTemplateSheet(sheet,ctx,scopeArea,scopeSpg,wip,allowedProfileIds=null) {
    const cfg=config(ctx),dayCount=daysInPeriod(ui.period),included=area=>scopeArea==='Semua'||scopeArea===area;
    for(const layout of DAILY_TEMPLATE_LAYOUT){
      const areaProfiles=templateProfiles(ctx,layout.area,included(layout.area),scopeSpg).filter(profile=>!allowedProfileIds||allowedProfileIds.has(profile.id)).slice(0,layout.columns.length);
      for(let slot=0;slot<layout.columns.length;slot++){
        const startColumn=sheet.getColumn(layout.columns[slot]).number,profile=areaProfiles[slot];
        clearExcelRange(sheet,layout.startRow,startColumn,layout.endRow,startColumn+3);
        setExcelValue(sheet,layout.nameRow,startColumn,profile?`${String(profile.spg||'').toUpperCase()}${profile.joinDate?` (JOINT DATE ${dateLabel(profile.joinDate).toUpperCase()})`:''}`:'');
        const records=profile?dailyForProfile(ctx,profile,ui.period):[];
        for(let index=0;index<=layout.endRow-layout.startRow;index++){
          const row=layout.startRow+index,day=index+1;
          if(day>dayCount){setExcelValue(sheet,row,startColumn,null);continue;}
          const date=periodDate(ui.period,day),key=`${ui.period}-${String(day).padStart(2,'0')}`,entry=profile?aggregateDailyDate(records,key):null;
          setExcelValue(sheet,row,startColumn,date);setExcelNumberFormat(sheet.getCell(row,startColumn),'d-mmm');
          setExcelValue(sheet,row,startColumn+1,entry?.status??'');setExcelValue(sheet,row,startColumn+2,entry?.selling??'');setExcelValue(sheet,row,startColumn+3,entry?.value??'');
        }
      }
      setExcelValue(sheet,layout.areaRow,sheet.getColumn(layout.columns[0]).number,included(layout.area)?`AREA ${layout.area.toUpperCase()}`:'');

      const summaryWip=[];
      for(let index=0;index<layout.summaryRows.length;index++){
        const rowNumber=layout.summaryRows[index],profile=areaProfiles[index],columnLabel=layout.columns[index],startColumn=sheet.getColumn(columnLabel).number;
        clearExcelRange(sheet,rowNumber,1,rowNumber,15);
        if(!profile)continue;
        const data=templateWipRow(wip,profile)||{hk:0,targetHK:n(profile.targetHK),targetByHK:0,selling:0,targetMonth:n(profile.targetMonth),achievementHK:0,achievementMonth:0,value:0,avg:0};summaryWip.push(data);
        setExcelValue(sheet,rowNumber,1,n(cfg.quotaByArea[layout.area]||areaProfiles.length));setExcelValue(sheet,rowNumber,2,layout.area);setExcelValue(sheet,rowNumber,3,profile.outlet||'');setExcelValue(sheet,rowNumber,5,profile.spg||'');setExcelValue(sheet,rowNumber,6,dateLabel(profile.joinDate));
        const statusColumn=excelColumn(startColumn),sellingColumn=excelColumn(startColumn+1),valueColumn=excelColumn(startColumn+2);
        setExcelFormula(sheet,`G${rowNumber}`,`SUM(${statusColumn}${layout.startRow}:${statusColumn}${layout.endRow})`,data.hk);
        setExcelFormula(sheet,`H${rowNumber}`,`G${rowNumber}*${n(cfg.targetDailyCan)}`,data.targetByHK);
        setExcelFormula(sheet,`I${rowNumber}`,`SUM(${sellingColumn}${layout.startRow}:${sellingColumn}${layout.endRow})`,data.selling);
        setExcelFormula(sheet,`J${rowNumber}`,`IFERROR(I${rowNumber}/H${rowNumber},0)`,data.achievementHK);
        setExcelValue(sheet,rowNumber,11,data.targetMonth);setExcelFormula(sheet,`L${rowNumber}`,`I${rowNumber}`,data.selling);setExcelFormula(sheet,`M${rowNumber}`,`IFERROR(L${rowNumber}/K${rowNumber},0)`,data.achievementMonth);
        setExcelFormula(sheet,`N${rowNumber}`,`SUM(${valueColumn}${layout.startRow}:${valueColumn}${layout.endRow})`,data.value);setExcelFormula(sheet,`O${rowNumber}`,`IFERROR(L${rowNumber}/G${rowNumber},0)`,data.avg);
      }
      clearExcelRange(sheet,layout.totalRow,1,layout.totalRow,15);
      if(summaryWip.length){
        const total=wipTotals(summaryWip),start=layout.summaryRows[0],end=layout.summaryRows[summaryWip.length-1];setExcelValue(sheet,layout.totalRow,1,`TOTAL ${layout.area.toUpperCase()}`);
        for(const column of ['G','H','I','K','L','N']){const property={G:'hk',H:'targetByHK',I:'selling',K:'targetMonth',L:'selling',N:'value'}[column];setExcelFormula(sheet,`${column}${layout.totalRow}`,`SUM(${column}${start}:${column}${end})`,total[property]);}
        setExcelFormula(sheet,`J${layout.totalRow}`,`IFERROR(I${layout.totalRow}/H${layout.totalRow},0)`,total.targetByHK?total.selling/total.targetByHK:0);setExcelFormula(sheet,`M${layout.totalRow}`,`IFERROR(L${layout.totalRow}/K${layout.totalRow},0)`,total.targetMonth?total.selling/total.targetMonth:0);setExcelFormula(sheet,`O${layout.totalRow}`,`IFERROR(I${layout.totalRow}/G${layout.totalRow},0)`,total.hk?total.selling/total.hk:0);
      }
    }
  }
  function fillWipTemplateSheet(sheet,ctx,scopeArea,wip) {
    const included=area=>scopeArea==='Semua'||scopeArea===area;
    clearExcelRange(sheet,6,39,149,61);clearExcelRange(sheet,1,62,149,87);
    const selected=[];
    for(const area of AREA_ORDER){
      const layout=WIP_TEMPLATE_LAYOUT[area],rows=wip.filter(row=>row.area===area&&included(area)&&String(row.status).toLowerCase()!=='vacant').slice(0,layout.rows.length);selected.push(...rows);
      layout.rows.forEach((rowNumber,index)=>{
        const row=rows[index];if(!row)return;
        const values=[row.area,row.spg,row.targetHK,row.hk,row.targetHK?row.hk/row.targetHK:0,...row.weekly.slice(0,4).map(week=>week.selling),...row.weekly.slice(0,4).map(week=>week.hk?week.selling/week.hk:0),row.targetMonth,row.selling,row.achievementMonth,row.value,row.avg,row.ratio,row.expenseActual,row.expenseRate,row.gapCartonPerDay,excelDate(row.profile?.joinDate)];
        values.forEach((value,index)=>setExcelValue(sheet,rowNumber,39+index,value));setExcelNumberFormat(sheet.getCell(rowNumber,42),'0%');setExcelNumberFormat(sheet.getCell(rowNumber,54),'0%');setExcelNumberFormat(sheet.getCell(rowNumber,57),'0%');setExcelNumberFormat(sheet.getCell(rowNumber,61),'d-mmm-yy');
      });
      if(rows.length){
        const total=wipTotals(rows),rowNumber=layout.total,values=[`GRAND TOTAL ${area.toUpperCase()}`,'',total.targetHK,total.hk,total.targetHK?total.hk/total.targetHK:0,...total.weekly.slice(0,4).map(week=>week.selling),...total.weekly.slice(0,4).map(week=>week.hk?week.selling/week.hk:0),total.targetMonth,total.selling,total.targetMonth?total.selling/total.targetMonth:0,total.value,total.hk?total.selling/total.hk:0,total.value?total.expense/total.value:0,total.expense,'',''];values.forEach((value,index)=>setExcelValue(sheet,rowNumber,39+index,value));
      }
    }
    const grand=wipTotals(selected);if(selected.length){const values=['GRAND TOTAL COVER','',grand.targetHK,grand.hk,grand.targetHK?grand.hk/grand.targetHK:0,...grand.weekly.slice(0,4).map(week=>week.selling),...grand.weekly.slice(0,4).map(week=>week.hk?week.selling/week.hk:0),grand.targetMonth,grand.selling,grand.targetMonth?grand.selling/grand.targetMonth:0,grand.value,grand.hk?grand.selling/grand.hk:0,grand.value?grand.expense/grand.value:0,grand.expense,'',''];values.forEach((value,index)=>setExcelValue(sheet,26,39+index,value));}
    sheet.getCell('AM3').value=`WIP DI BULAN ${monthLabel(ui.period)}`;
    sheet.views=[{state:'frozen',xSplit:0,ySplit:3}];
    sheet.pageSetup=Object.assign({},sheet.pageSetup||{},{orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printArea:'A1:BI149'});
  }
  function copyTemplateRowStyle(sheet,sourceRow,targetRow,startColumn,endColumn) {
    sheet.getRow(targetRow).height=sheet.getRow(sourceRow).height;
    for(let column=startColumn;column<=endColumn;column++){const source=sheet.getCell(sourceRow,column),target=sheet.getCell(targetRow,column);target.style=JSON.parse(JSON.stringify(source.style||{}));}
  }
  function zoneFill(cell,label) {
    const text=String(label||'').toLowerCase(),color=text.includes('hijau')||text.includes('track')?'00B050':text.includes('kuning')||text.includes('dorongan')?'FFD966':'FF0000',style=cell.style||{};cell.style=Object.assign({},style,{fill:{type:'pattern',pattern:'solid',fgColor:{argb:`FF${color}`}},font:Object.assign({},style.font||{},{bold:true,color:{argb:color==='FFD966'?'FF7C2D12':'FFFFFFFF'}}),alignment:Object.assign({},style.alignment||{},{horizontal:'center'})});
  }
  function fillSheet1(sheet,ctx,wip) {
    const cfg=config(ctx),active=wip.filter(row=>String(row.status).toLowerCase()!=='vacant').slice(0,29);clearExcelRange(sheet,17,5,45,22);clearExcelRange(sheet,52,21,70,33);
    active.forEach((row,index)=>{const rowNumber=17+index;if(rowNumber>26)copyTemplateRowStyle(sheet,17,rowNumber,5,22);const hkDiff=row.hk-row.targetHK,status=hkDiff<0?'Kurang HK':hkDiff===0?'Full HK':'Over HK',achievementLabel=row.achievementMonth>=.8?'Hijau':row.achievementMonth>=.6?'Kuning':'Merah';const values=[row.area,row.spg,row.outlet||'',dateLabel(row.profile?.joinDate),row.hk,status,hkDiff,row.selling,row.selling/cfg.pcsPerCarton,row.achievementHK,row.targetMonth,row.achievementMonth,achievementLabel,row.avg,row.value,row.ratio,row.ratioZone.label,0];values.forEach((value,col)=>setExcelValue(sheet,rowNumber,5+col,value));['N','P','T'].forEach(column=>setExcelNumberFormat(sheet.getCell(`${column}${rowNumber}`),'0.0%'));zoneFill(sheet.getCell(`Q${rowNumber}`),achievementLabel);zoneFill(sheet.getCell(`U${rowNumber}`),row.ratioZone.label);
      const uniqueDates=new Set(row.linked.map(item=>String(item.date).slice(0,10))),missing=Math.max(Math.min(row.targetHK,daysInPeriod(ui.period))-uniqueDates.size,0),metricRow=52+index;if(metricRow>61)copyTemplateRowStyle(sheet,52,metricRow,21,33);const metrics=[row.targetByHK,row.gapCan/cfg.pcsPerCarton,row.gapCan,row.expenseRate,row.expenseActual,row.value,row.sampling,0,row.achievementMonth>=1?'Eligible Bonus':'Belum Eligible','-',row.selling,uniqueDates.size,missing];metrics.forEach((value,col)=>setExcelValue(sheet,metricRow,21+col,value));
    });
  }
  function fillZoneSheet(sheet,ctx,wip) {
    const cfg=config(ctx),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant').slice(0,13);clearExcelRange(sheet,32,1,44,11);setExcelValue(sheet,30,1,`ZONA SEMUA AREA BULAN ${monthLabel(ui.period).toUpperCase()}`);
    rows.forEach((row,index)=>{const rowNumber=32+index,remaining=row.gapCan<=0?'Tercapai':row.gapCan/cfg.pcsPerCarton;const values=[row.area,row.spg,row.hk,row.selling,row.value,row.selling/cfg.pcsPerCarton,row.achievementMonth,remaining,row.ratio,row.ratioZone.label,row.gapCan<=0?'Tercapai':'Belum tercapai'];values.forEach((value,col)=>setExcelValue(sheet,rowNumber,1+col,value));setExcelNumberFormat(sheet.getCell(`G${rowNumber}`),'0%');setExcelNumberFormat(sheet.getCell(`I${rowNumber}`),'0%');zoneFill(sheet.getCell(`J${rowNumber}`),row.ratioZone.label);});
  }
  function fillCoachingSheet(sheet,ctx,scopeArea,wip) {
    const records=(ctx.data.coachingRecords||[]).filter(row=>areaAllowed(ctx,row.area)&&(scopeArea==='Semua'||row.area===scopeArea)).slice(0,30);clearExcelRange(sheet,6,1,40,18);setExcelValue(sheet,1,1,`COACHING ${monthLabel(ui.period)}`);
    records.forEach((record,index)=>{const rowNumber=6+index;if(rowNumber>7)copyTemplateRowStyle(sheet,7,rowNumber,1,18);const report=wip.find(row=>row.id===record.profileId)||wip.find(row=>row.area===record.area&&norm(row.spg)===norm(record.spg)),before=n(record.beforeAvg),after=n(record.afterAvg);[index+1,record.area,record.spg,report?.hk||0,before*4,report?.sampling||0,0,before,before,before,before,before,before,after,after,after,after,after].forEach((value,col)=>setExcelValue(sheet,rowNumber,1+col,value));});
    const first=records[0];if(first?.date){const base=excelDate(first.date);for(let i=0;i<4;i++){const beforeDate=new Date(base);beforeDate.setDate(base.getDate()-(4-i));const afterDate=new Date(base);afterDate.setDate(base.getDate()+i+1);setExcelValue(sheet,5,9+i,beforeDate);setExcelValue(sheet,5,14+i,afterDate);setExcelNumberFormat(sheet.getCell(5,9+i),'d-mmm');setExcelNumberFormat(sheet.getCell(5,14+i),'d-mmm');}}
  }
  function fillSamplingSheet(sheet,ctx,scopeArea,wip) {
    const cfg=config(ctx),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant').slice(0,16),dayCount=daysInPeriod(ui.period),[year,month]=ui.period.split('-').map(Number);clearExcelRange(sheet,3,2,34,38);setExcelValue(sheet,1,8,monthLabel(ui.period).toUpperCase());setExcelValue(sheet,3,1,cfg.tlName);
    for(let day=1;day<=31;day++){setExcelValue(sheet,2,7+day,day<=dayCount?day:'');}
    rows.forEach((row,index)=>{const rowNumber=3+index*2;[year,new Intl.DateTimeFormat('id-ID',{month:'long'}).format(new Date(year,month-1,1)),row.spg,row.outlet||'',row.area,'Sampling'].forEach((value,col)=>setExcelValue(sheet,rowNumber,2+col,value));for(let day=1;day<=dayCount;day++){const key=`${ui.period}-${String(day).padStart(2,'0')}`,entry=aggregateDailyDate(row.linked,key);setExcelValue(sheet,rowNumber,7+day,entry?.sampling||'');}});
  }
  function fillPicaSheet(sheet,ctx,scopeArea) {
    const records=(ctx.data.picaRecords||[]).filter(row=>areaAllowed(ctx,row.area)&&(scopeArea==='Semua'||row.area===scopeArea)).slice(0,21);clearExcelRange(sheet,72,1,92,8);setExcelValue(sheet,71,1,`PICA ${monthLabel(ui.period).toUpperCase()}`);
    records.forEach((record,index)=>{const rowNumber=72+index;[record.area,record.problem,record.identification,record.corrective,record.action,dateLabel(record.dueDate)||record.dueDate,record.pic,record.status].forEach((value,col)=>setExcelValue(sheet,rowNumber,1+col,value));});
  }
  const EXPORT_THEME={navy:'1F4E78',lightBlue:'D9EAF7',yellow:'FFF200',green:'C6EFCE',greenText:'006100',red:'FFC7CE',redText:'9C0006',amber:'FFEB9C',amberText:'9C6500',gray:'E7E6E6',white:'FFFFFF',line:'44546A'};
  function exportBorder(){const side={style:'thin',color:{argb:`FF${EXPORT_THEME.line}`}};return{top:side,left:side,bottom:side,right:side};}
  function styleExportTitle(sheet,address,title){sheet.mergeCells(address);const cell=sheet.getCell(address.split(':')[0]);cell.value=title;cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${EXPORT_THEME.navy}`}};cell.font={bold:true,size:14,color:{argb:`FF${EXPORT_THEME.white}`}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border=exportBorder();sheet.getRow(cell.row).height=28;}
  function styleExportHeader(sheet,rowNumber,headers){const row=sheet.getRow(rowNumber);row.values=headers;row.height=34;headers.forEach((_,index)=>{const cell=row.getCell(index+1);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${EXPORT_THEME.yellow}`}};cell.font={bold:true,size:9,color:{argb:'FF000000'}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border=exportBorder();});}
  function styleExportRows(sheet,startRow,endRow,columnCount){for(let row=startRow;row<=endRow;row++){sheet.getRow(row).height=Math.max(sheet.getRow(row).height||0,22);for(let column=1;column<=columnCount;column++){const cell=sheet.getCell(row,column);cell.border=exportBorder();cell.alignment={horizontal:typeof cell.value==='number'?'center':'left',vertical:'middle',wrapText:true};}}}
  function styleExportTotal(sheet,rowNumber,columnCount){for(let column=1;column<=columnCount;column++){const cell=sheet.getCell(rowNumber,column);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${EXPORT_THEME.lightBlue}`}};cell.font={bold:true};cell.border=exportBorder();cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};}}
  function setExportWidths(sheet,widths){widths.forEach((width,index)=>{sheet.getColumn(index+1).width=width;});}
  function addCleanSheet(workbook,name,options={}){const sheet=workbook.addWorksheet(name,{views:[{state:'frozen',ySplit:options.freezeRows||3}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,horizontalCentered:true,margins:{left:.2,right:.2,top:.35,bottom:.35,header:.1,footer:.1}}});sheet.properties.defaultRowHeight=21;sheet.showGridLines=false;return sheet;}
  function reportingAsOfDay(ctx,scopeArea,scopeSpg,period=ui.period){const days=dailyRows(ctx,period,scopeArea,scopeSpg).map(row=>Number(String(row.date||'').slice(8,10))).filter(Boolean);return days.length?Math.max(...days):0;}
  function calendarCutoffDay(period){const current=new Date().toISOString().slice(0,7);if(period<current)return daysInPeriod(period);if(period>current)return 0;return Math.min(new Date().getDate(),daysInPeriod(period));}
  function dailyExportEntry(data,dateKey){
    const rows=(data?.linked||[]).filter(record=>String(record.date||'').slice(0,10)===dateKey),hk=rows.reduce((sum,row)=>sum+n(row.hk),0),absent=rows.find(row=>String(row.attendance||'').toUpperCase()&&String(row.attendance||'').toUpperCase()!=='HADIR');
    return {hasData:rows.length>0,status:absent?.attendance||(hk>0?'HADIR':rows[0]?.attendance||'BELUM ADA DATA'),hk,selling:rows.reduce((sum,row)=>sum+n(row.selling),0),value:rows.reduce((sum,row)=>sum+n(row.value),0),sampling:rows.reduce((sum,row)=>sum+n(row.samplingCup),0),po:rows.reduce((sum,row)=>sum+n(row.poAdditional),0),gromin:[...new Set(rows.map(row=>row.gromin).filter(Boolean))].join(', ')||data?.outlet||'',district:[...new Set(rows.map(row=>row.district).filter(Boolean))].join(', ')||data?.district||'',notes:[...new Set(rows.map(row=>row.notes).filter(Boolean))].join(' • ')};
  }
  function detailedWipHeaders(){return ['AREA','NAMA SPG','TOKO / GROMIN','TARGET HK','ACTUAL HK','ACH HK','W1','W2','W3','W4','W5','AVG W1','AVG W2','AVG W3','AVG W4','AVG W5','TARGET BULAN (CAN)','ACTUAL BULAN (CAN)','ACH BULAN','SELLING VALUE','AVG / HK','RATIO','BIAYA ACTUAL HK','BIAYA / HK','SISA CAN 100%','SISA KARTON 100%','KARTON / HARI','TARGET VALUE','NEEDS VALUE','GAP RATIO','KOMITMEN RATIO','SAMPLING','TARGET SAMPLING','ACH SAMPLING','JOINT DATE'];}
  function detailedWipValues(data,cfg){const remainingCan=Math.max(data.targetMonth-data.selling,0),weeklyAvg=data.weekly.map(week=>week.hk?week.selling/week.hk:0);return [data.area,data.spg,data.outlet||'',data.targetHK,data.hk,data.targetHK?data.hk/data.targetHK:0,...data.weekly.map(week=>week.selling),...weeklyAvg,data.targetMonth,data.selling,data.achievementMonth,data.value,data.avg,data.ratio,data.expenseActual,data.expenseRate,remainingCan,remainingCan/n(cfg.pcsPerCarton||24),data.gapCartonPerDay,data.targetValue,data.needsValue,data.ratio-n(cfg.ratioCommitment),cfg.ratioCommitment,data.sampling,data.samplingTarget,data.samplingAchievement,excelDate(data.profile?.joinDate)];}
  function addDailyWipSheet(workbook,ctx,wip,scopeArea,scopeSpg,period=ui.period){
    const cfg=config(ctx),headers=detailedWipHeaders(),lastColumn=excelColumn(headers.length-1),sheet=addCleanSheet(workbook,'Daily Report & WIP',{freezeRows:4});sheet.pageSetup.paperSize=8;sheet.pageSetup.fitToWidth=2;sheet.pageSetup.fitToHeight=0;
    styleExportTitle(sheet,`A1:${lastColumn}1`,`DAILY REPORT & WORK IN PROGRESS SPG • ${monthLabel(period)}`);sheet.mergeCells(`A2:${lastColumn}2`);sheet.getCell('A2').value=`Area: ${scopeArea==='Semua'?'Semua Area':scopeArea} • SPG: ${scopeSpg==='Semua'?'Semua SPG':scopeSpg} • 1 karton = ${n(cfg.pcsPerCarton||24)} kaleng`;sheet.getCell('A2').alignment={horizontal:'center',vertical:'middle',wrapText:true};styleExportHeader(sheet,4,headers);setExportWidths(sheet,[17,27,28,11,11,11,9,9,9,9,9,10,10,10,10,10,16,17,12,18,12,11,18,15,16,18,15,18,18,12,17,12,16,14,14]);
    wip.forEach((data,index)=>{const row=5+index;sheet.getRow(row).values=detailedWipValues(data,cfg);[6,19,22,30,31,34].forEach(column=>sheet.getCell(row,column).numFmt='0.0%');[20,23,24,28,29].forEach(column=>sheet.getCell(row,column).numFmt='"Rp" #,##0');[12,13,14,15,16,21,26,27].forEach(column=>sheet.getCell(row,column).numFmt='0.00');sheet.getCell(row,35).numFmt='d-mmm-yy';statusFill(sheet.getCell(row,19),data.achievementMonth>=1?'TARGET TERCAPAI':data.achievementZone.label);statusFill(sheet.getCell(row,22),data.ratioZone.label);});
    const totalRow=5+wip.length,total=wipTotals(wip),remainingCan=Math.max(total.targetMonth-total.selling,0),remainingHK=Math.max(total.targetHK-total.hk,0),totalSampling=wip.reduce((sum,row)=>sum+n(row.sampling),0),totalSamplingTarget=wip.reduce((sum,row)=>sum+n(row.samplingTarget),0),targetValue=wip.reduce((sum,row)=>sum+n(row.targetValue),0),needsValue=wip.reduce((sum,row)=>sum+n(row.needsValue),0),ratio=total.value?total.expense/total.value:0;sheet.getRow(totalRow).values=['GRAND TOTAL','','',total.targetHK,total.hk,total.targetHK?total.hk/total.targetHK:0,...total.weekly.map(week=>week.selling),...total.weekly.map(week=>week.hk?week.selling/week.hk:0),total.targetMonth,total.selling,total.targetMonth?total.selling/total.targetMonth:0,total.value,total.hk?total.selling/total.hk:0,ratio,total.expense,'',remainingCan,remainingCan/n(cfg.pcsPerCarton||24),remainingHK?remainingCan/n(cfg.pcsPerCarton||24)/remainingHK:remainingCan/n(cfg.pcsPerCarton||24),targetValue,needsValue,ratio-n(cfg.ratioCommitment),cfg.ratioCommitment,totalSampling,totalSamplingTarget,totalSamplingTarget?totalSampling/totalSamplingTarget:0,''];[6,19,22,30,31,34].forEach(column=>sheet.getCell(totalRow,column).numFmt='0.0%');[20,23,24,28,29].forEach(column=>sheet.getCell(totalRow,column).numFmt='"Rp" #,##0');styleExportRows(sheet,5,totalRow,headers.length);styleExportTotal(sheet,totalRow,headers.length);
    const dailyTitle=totalRow+3,dailyHeader=dailyTitle+2,dailyHeaders=['TANGGAL','HARI','AREA','NAMA SPG','TOKO / GROMIN','KECAMATAN','STATUS','HK','SELLING (CAN)','VALUE','SAMPLING (CUP)','PO TAMBAHAN (CAN)','CATATAN'];styleExportTitle(sheet,`A${dailyTitle}:M${dailyTitle}`,`DATA HARIAN LENGKAP 1–${daysInPeriod(period)} ${monthLabel(period).toUpperCase()}`);sheet.mergeCells(`A${dailyTitle+1}:M${dailyTitle+1}`);sheet.getCell(dailyTitle+1,1).value='Setiap SPG selalu mempunyai baris untuk seluruh tanggal. Tanggal tanpa laporan ditandai BELUM ADA DATA.';sheet.getCell(dailyTitle+1,1).alignment={horizontal:'center',vertical:'middle',wrapText:true};styleExportHeader(sheet,dailyHeader,dailyHeaders);
    let rowNumber=dailyHeader+1;wip.forEach(data=>{for(let day=1;day<=daysInPeriod(period);day++){const key=`${period}-${String(day).padStart(2,'0')}`,date=periodDate(period,day),entry=dailyExportEntry(data,key);sheet.getRow(rowNumber).values=[date,new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(date),data.area,data.spg,entry.gromin,entry.district,entry.hasData?entry.status:'BELUM ADA DATA',entry.hk,entry.selling,entry.value,entry.sampling,entry.po,entry.notes||''];sheet.getCell(rowNumber,1).numFmt='d-mmm-yy';sheet.getCell(rowNumber,10).numFmt='"Rp" #,##0';statusFill(sheet.getCell(rowNumber,7),entry.hasData?entry.status:'BELUM ADA DATA');rowNumber++;}});
    const dailyLast=Math.max(dailyHeader+1,rowNumber-1);if(!wip.length){sheet.mergeCells(`A${dailyHeader+1}:M${dailyHeader+1}`);sheet.getCell(dailyHeader+1,1).value='Belum ada SPG pada filter ini.';}styleExportRows(sheet,dailyHeader+1,dailyLast,13);sheet.autoFilter={from:`A${dailyHeader}`,to:`M${dailyLast}`};sheet.pageSetup.printArea=`A1:${lastColumn}${dailyLast}`;sheet.pageSetup.printTitlesRow='1:4';sheet.headerFooter.oddFooter=`&LWebsite Extra Joss SPG&C&P / &N&R${monthLabel(period)}`;return sheet;
  }
  function statusFill(cell,status){const text=String(status||'').toLowerCase();let fill=EXPORT_THEME.gray,font='666666';if(text.includes('tercapai')||text==='kerja'||text.includes('hijau')||text==='done'||text==='selesai'){fill=EXPORT_THEME.green;font=EXPORT_THEME.greenText;}else if(text.includes('kurang')||text.includes('merah')||text.includes('overdue')){fill=EXPORT_THEME.red;font=EXPORT_THEME.redText;}else if(text.includes('kuning')||text.includes('process')||text.includes('follow')){fill=EXPORT_THEME.amber;font=EXPORT_THEME.amberText;}cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${fill}`}};cell.font=Object.assign({},cell.font||{},{bold:true,color:{argb:`FF${font}`}});cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};}
  function addHkSheet(workbook,ctx,wip,scopeArea,scopeSpg,options={}){
    const period=options.period||ui.period,name=options.name||'HK',sheet=addCleanSheet(workbook,name,{freezeRows:4}),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant'),dayCount=daysInPeriod(period),asOf=Math.max(reportingAsOfDay(ctx,scopeArea,scopeSpg,period),calendarCutoffDay(period)),dayColumns=Array.from({length:dayCount},(_,index)=>index+1),projectedColumn=6+dayCount,gapColumn=projectedColumn+1,statusColumn=gapColumn+1,lastColumn=excelColumn(statusColumn-1),planEndLetter=excelColumn(5+dayCount-1);
    styleExportTitle(sheet,`A1:${lastColumn}1`,`PLANNING HK SPG ${monthLabel(period)} • POSISI 1-${asOf||0}`);sheet.mergeCells(`A2:${lastColumn}2`);sheet.getCell('A2').value='Hari Minggu disamakan sebagai OFF. Hari yang sudah lewat tanpa laporan ditandai BELUM ADA DATA; hari tersisa direncanakan KERJA sampai target HK tercapai.';sheet.getCell('A2').alignment={horizontal:'center',vertical:'middle',wrapText:true};sheet.getCell('A2').font={italic:true,color:{argb:'FF44546A'}};
    const headers=['AREA','SPG',`HK ACTUAL 1-${asOf||0}`,'TARGET HK','SISA HK',...dayColumns.map(day=>periodDate(period,day)),'PROYEKSI HK','GAP HK','STATUS'];styleExportHeader(sheet,4,headers);dayColumns.forEach((day,index)=>{sheet.getCell(4,6+index).numFmt='d-mmm';});setExportWidths(sheet,[18,28,13,12,12,...dayColumns.map(()=>11),14,11,24]);
    rows.forEach((data,index)=>{const rowNumber=5+index,remaining=Math.max(data.targetHK-data.hk,0);let planned=0;const plans=dayColumns.map(day=>{const key=`${period}-${String(day).padStart(2,'0')}`,entry=dailyExportEntry(data,key),date=periodDate(period,day);if(entry.hasData)return entry.hk>0?'KERJA':String(entry.status||'TIDAK HK').toUpperCase();if(date.getDay()===0)return'OFF';if(day<=asOf)return'BELUM ADA DATA';if(planned<remaining){planned++;return'KERJA';}return'OFF TARGET';}),projected=data.hk+planned,gap=Math.max(data.targetHK-projected,0),status=data.hk>=data.targetHK?`TARGET ${data.targetHK} HK TERCAPAI`:gap===0?'PROYEKSI TARGET TERCAPAI':`PROYEKSI KURANG ${gap} HK`,projectionFormula=`C${rowNumber}+COUNTIF(F${rowNumber}:${planEndLetter}${rowNumber},"KERJA")-COUNTIF(F${rowNumber}:${excelColumn(5+asOf-1)}${rowNumber},"KERJA")`;sheet.getRow(rowNumber).values=[data.area,data.spg,data.hk,data.targetHK,{formula:`MAX(D${rowNumber}-C${rowNumber},0)`,result:remaining},...plans,{formula:asOf>0?projectionFormula:`C${rowNumber}+COUNTIF(F${rowNumber}:${planEndLetter}${rowNumber},"KERJA")`,result:projected},{formula:`MAX(D${rowNumber}-${excelColumn(projectedColumn-1)}${rowNumber},0)`,result:gap},status];plans.forEach((plan,planIndex)=>statusFill(sheet.getCell(rowNumber,6+planIndex),plan));statusFill(sheet.getCell(rowNumber,statusColumn),status);});
    const totalRow=5+rows.length,totals=rows.reduce((acc,row)=>{acc.hk+=row.hk;acc.target+=row.targetHK;return acc;},{hk:0,target:0});sheet.getCell(totalRow,1).value='TOTAL';sheet.mergeCells(totalRow,1,totalRow,2);sheet.getCell(totalRow,3).value={formula:`SUM(C5:C${Math.max(5,totalRow-1)})`,result:totals.hk};sheet.getCell(totalRow,4).value={formula:`SUM(D5:D${Math.max(5,totalRow-1)})`,result:totals.target};sheet.getCell(totalRow,5).value={formula:`SUM(E5:E${Math.max(5,totalRow-1)})`,result:Math.max(totals.target-totals.hk,0)};styleExportRows(sheet,5,totalRow,statusColumn);styleExportTotal(sheet,totalRow,statusColumn);sheet.autoFilter={from:'A4',to:`${lastColumn}${Math.max(4,totalRow-1)}`};sheet.pageSetup.paperSize=8;sheet.pageSetup.fitToWidth=2;sheet.pageSetup.printArea=`A1:${lastColumn}${totalRow}`;sheet.headerFooter.oddFooter=`&LWebsite Extra Joss SPG&C&P / &N&R${monthLabel(period)}`;return sheet;
  }
  function addZoneSheet(workbook,ctx,wip,options={}){
    const period=options.period||ui.period,name=options.name||'ZONA SPG',sheet=addCleanSheet(workbook,name,{freezeRows:3}),cfg=config(ctx),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant'),headers=['AREA','SPG','TOKO / GROMIN','HK ACTUAL','TARGET HK','ACH HK','SELLING ACTUAL','TARGET BULAN','ACH BULAN','AVG / HK','VALUE','BIAYA ACTUAL','BIAYA / HK','RATIO','KOMITMEN RATIO','GAP RATIO','SISA CAN 100%','SISA KARTON 100%','KARTON / HARI','SAMPLING','TARGET SAMPLING','ACH SAMPLING','ZONA RATIO','ZONA TARGET','STATUS / PRIORITAS'],lastColumn=excelColumn(headers.length-1);styleExportTitle(sheet,`A1:${lastColumn}1`,`ZONA SPG ${monthLabel(period)}`);sheet.mergeCells(`A2:${lastColumn}2`);sheet.getCell('A2').value='Detail pencapaian, biaya, ratio, kebutuhan menuju 100%, sampling, serta prioritas tindak lanjut.';sheet.getCell('A2').alignment={horizontal:'center',vertical:'middle'};styleExportHeader(sheet,3,headers);setExportWidths(sheet,[18,27,27,11,11,12,15,15,12,12,18,18,14,12,17,12,16,18,15,13,17,14,14,14,25]);
    rows.forEach((data,index)=>{const row=4+index,remaining=Math.max(data.targetMonth-data.selling,0),priority=data.achievementMonth>=1?'TARGET TERCAPAI':data.achievementMonth<.6?'PRIORITAS UTAMA':data.achievementMonth<.8?'PERLU DORONGAN':'PANTAU';sheet.getRow(row).values=[data.area,data.spg,data.outlet||'',data.hk,data.targetHK,data.targetHK?data.hk/data.targetHK:0,data.selling,data.targetMonth,data.achievementMonth,data.avg,data.value,data.expenseActual,data.expenseRate,data.ratio,cfg.ratioCommitment,data.ratio-cfg.ratioCommitment,remaining,remaining/n(cfg.pcsPerCarton||24),data.gapCartonPerDay,data.sampling,data.samplingTarget,data.samplingAchievement,data.ratioZone.label,data.achievementZone.label,priority];[6,9,14,15,16,22].forEach(column=>sheet.getCell(row,column).numFmt='0.0%');[11,12,13].forEach(column=>sheet.getCell(row,column).numFmt='"Rp" #,##0');[10,18,19].forEach(column=>sheet.getCell(row,column).numFmt='0.00');statusFill(sheet.getCell(row,23),data.ratioZone.label);statusFill(sheet.getCell(row,24),data.achievementZone.label);statusFill(sheet.getCell(row,25),priority);});
    const totalRow=4+rows.length,total=wipTotals(rows),ratio=total.value?total.expense/total.value:0,totalSampling=rows.reduce((sum,row)=>sum+n(row.sampling),0),totalSamplingTarget=rows.reduce((sum,row)=>sum+n(row.samplingTarget),0),remaining=Math.max(total.targetMonth-total.selling,0);sheet.getRow(totalRow).values=['GRAND TOTAL','','',total.hk,total.targetHK,total.targetHK?total.hk/total.targetHK:0,total.selling,total.targetMonth,total.targetMonth?total.selling/total.targetMonth:0,total.hk?total.selling/total.hk:0,total.value,total.expense,'',ratio,cfg.ratioCommitment,ratio-cfg.ratioCommitment,remaining,remaining/n(cfg.pcsPerCarton||24),'',totalSampling,totalSamplingTarget,totalSamplingTarget?totalSampling/totalSamplingTarget:0,ratioZone(ratio).label,'',''];[6,9,14,15,16,22].forEach(column=>sheet.getCell(totalRow,column).numFmt='0.0%');[11,12,13].forEach(column=>sheet.getCell(totalRow,column).numFmt='"Rp" #,##0');statusFill(sheet.getCell(totalRow,23),ratioZone(ratio).label);styleExportRows(sheet,4,totalRow,headers.length);styleExportTotal(sheet,totalRow,headers.length);sheet.autoFilter={from:'A3',to:`${lastColumn}${Math.max(3,totalRow-1)}`};sheet.pageSetup.paperSize=8;sheet.pageSetup.fitToWidth=2;sheet.pageSetup.printArea=`A1:${lastColumn}${totalRow}`;return sheet;
  }
  function addCoachingSheet(workbook,ctx,wip,scopeArea,scopeSpg){
    const sheet=addCleanSheet(workbook,'COACHING',{freezeRows:3}),records=(ctx.data.coachingRecords||[]).filter(row=>areaAllowed(ctx,row.area)&&periodOf(row.date)===ui.period&&(scopeArea==='Semua'||row.area===scopeArea)&&(scopeSpg==='Semua'||row.profileId===scopeSpg));styleExportTitle(sheet,'A1:K1',`COACHING ${monthLabel(ui.period)}`);styleExportHeader(sheet,3,['NO','TANGGAL','AREA','NAMA SPG','ACTUAL HK','AVG BEFORE','AVG AFTER','IMPROVEMENT','TOPIK','ACTION / FOLLOW-UP','STATUS']);setExportWidths(sheet,[6,14,18,26,11,13,13,14,28,42,14]);
    records.forEach((record,index)=>{const row=4+index,report=wip.find(item=>item.id===record.profileId),before=n(record.beforeAvg),after=n(record.afterAvg),improvement=before?(after-before)/before:0;sheet.getRow(row).values=[index+1,excelDate(record.date),record.area,record.spg,report?.hk||0,before,after,improvement,record.topic||'',record.action||'',record.status||'Open'];sheet.getCell(row,2).numFmt='d-mmm-yy';sheet.getCell(row,8).numFmt='0.0%';statusFill(sheet.getCell(row,11),record.status);});
    const lastRow=Math.max(4,3+records.length);if(!records.length){sheet.mergeCells('A4:K4');sheet.getCell('A4').value='Belum ada coaching pada filter ini.';sheet.getCell('A4').alignment={horizontal:'center'};}styleExportRows(sheet,4,lastRow,11);sheet.autoFilter={from:'A3',to:`K${Math.max(3,3+records.length)}`};sheet.pageSetup.printArea=`A1:K${lastRow}`;return sheet;
  }
  function addStatisticsSheet(workbook,ctx,wip,scopeArea,scopeSpg){
    const sheet=addCleanSheet(workbook,'STATISTIK',{freezeRows:3}),areas=aggregateArea(ctx,ui.period,scopeArea,scopeSpg),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant'),total=wipTotals(rows);styleExportTitle(sheet,'A1:J1',`STATISTIK REPORTING SPG ${monthLabel(ui.period)}`);styleExportHeader(sheet,3,['AREA','SPG AKTIF','ACTUAL HK','SELLING','AVG / HK','TARGET MONTH','ACHIEVEMENT','VALUE','EXPENSE ACTUAL','RATIO']);setExportWidths(sheet,[19,12,12,14,12,16,14,18,18,12]);
    areas.forEach((data,index)=>{const row=4+index;sheet.getRow(row).values=[data.area,data.active,data.hk,data.selling,data.avg,data.targetMonth,data.achievement,data.value,data.expenseActual,data.ratio];sheet.getCell(row,5).numFmt='0.0';sheet.getCell(row,7).numFmt='0.0%';sheet.getCell(row,8).numFmt='"Rp" #,##0';sheet.getCell(row,9).numFmt='"Rp" #,##0';sheet.getCell(row,10).numFmt='0.0%';});
    const areaTotalRow=4+areas.length;sheet.getRow(areaTotalRow).values=['GRAND TOTAL',rows.length,total.hk,total.selling,total.hk?total.selling/total.hk:0,total.targetMonth,total.targetMonth?total.selling/total.targetMonth:0,total.value,total.expense,total.value?total.expense/total.value:0];sheet.getCell(areaTotalRow,5).numFmt='0.0';[7,10].forEach(column=>sheet.getCell(areaTotalRow,column).numFmt='0.0%');[8,9].forEach(column=>sheet.getCell(areaTotalRow,column).numFmt='"Rp" #,##0');styleExportRows(sheet,4,areaTotalRow,10);styleExportTotal(sheet,areaTotalRow,10);
    const rankingTitle=areaTotalRow+2;sheet.mergeCells(rankingTitle,1,rankingTitle,10);sheet.getCell(rankingTitle,1).value='RANKING SPG';sheet.getCell(rankingTitle,1).fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${EXPORT_THEME.navy}`}};sheet.getCell(rankingTitle,1).font={bold:true,color:{argb:`FF${EXPORT_THEME.white}`}};sheet.getCell(rankingTitle,1).alignment={horizontal:'center'};styleExportHeader(sheet,rankingTitle+1,['RANK','AREA','SPG','HK','SELLING','AVG / HK','ACHIEVEMENT','VALUE','RATIO','ZONA']);
    rows.slice().sort((a,b)=>b.avg-a.avg).forEach((data,index)=>{const row=rankingTitle+2+index;sheet.getRow(row).values=[index+1,data.area,data.spg,data.hk,data.selling,data.avg,data.achievementMonth,data.value,data.ratio,data.ratioZone.label];sheet.getCell(row,6).numFmt='0.0';sheet.getCell(row,7).numFmt='0.0%';sheet.getCell(row,8).numFmt='"Rp" #,##0';sheet.getCell(row,9).numFmt='0.0%';statusFill(sheet.getCell(row,10),data.ratioZone.label);});const lastRow=Math.max(rankingTitle+2,rankingTitle+1+rows.length);styleExportRows(sheet,rankingTitle+2,lastRow,10);sheet.pageSetup.printArea=`A1:J${lastRow}`;return sheet;
  }
  function addSamplingSheet(workbook,ctx,wip){
    const sheet=addCleanSheet(workbook,'SAMPLING',{freezeRows:3}),cfg=config(ctx),rows=wip.filter(row=>String(row.status).toLowerCase()!=='vacant'),[year,month]=ui.period.split('-').map(Number),monthName=new Intl.DateTimeFormat('id-ID',{month:'long'}).format(new Date(year,month-1,1)),headers=['TEAM LEADER','TAHUN','BULAN','NAMA SPG','NAMA TOKO','AREA','ITEM TYPE',...Array.from({length:31},(_,index)=>index+1),'TOTAL CUP'];styleExportTitle(sheet,'A1:AM1',`SAMPLING ${monthLabel(ui.period)}`);styleExportHeader(sheet,3,headers);setExportWidths(sheet,[18,9,12,25,28,17,14,...Array.from({length:31},()=>5),12]);
    rows.forEach((data,index)=>{const row=4+index;sheet.getRow(row).values=[cfg.tlName,year,monthName,data.spg,data.outlet||'',data.area,'Sampling',...Array.from({length:31},(_,dayIndex)=>{const day=dayIndex+1;if(day>daysInPeriod(ui.period))return null;const entry=aggregateDailyDate(data.linked,`${ui.period}-${String(day).padStart(2,'0')}`);return entry?.sampling||null;}),{formula:`SUM(H${row}:AL${row})`,result:data.sampling}];});
    const totalRow=4+rows.length;sheet.mergeCells(totalRow,1,totalRow,7);sheet.getCell(totalRow,1).value='TOTAL';for(let column=8;column<=39;column++){const letter=excelColumn(column-1),result=column===39?rows.reduce((sum,row)=>sum+row.sampling,0):rows.reduce((sum,data)=>{const day=column-7,entry=aggregateDailyDate(data.linked,`${ui.period}-${String(day).padStart(2,'0')}`);return sum+n(entry?.sampling);},0);sheet.getCell(totalRow,column).value={formula:`SUM(${letter}4:${letter}${Math.max(4,totalRow-1)})`,result};}styleExportRows(sheet,4,totalRow,39);styleExportTotal(sheet,totalRow,39);sheet.autoFilter={from:'A3',to:`AM${Math.max(3,totalRow-1)}`};sheet.pageSetup.printArea=`A1:AM${totalRow}`;return sheet;
  }
  function addPicaSheet(workbook,ctx,scopeArea,scopeSpg){
    const sheet=addCleanSheet(workbook,'PICA',{freezeRows:3}),records=(ctx.data.picaRecords||[]).filter(row=>areaAllowed(ctx,row.area)&&(scopeArea==='Semua'||row.area===scopeArea)&&(scopeSpg==='Semua'||row.profileId===scopeSpg));styleExportTitle(sheet,'A1:J1',`PICA ${monthLabel(ui.period)}`);styleExportHeader(sheet,3,['NO','AREA','NAMA SPG','PROBLEM','IDENTIFIKASI / ROOT CAUSE','CORRECTIVE','ACTION','DUE DATE','PIC','STATUS']);setExportWidths(sheet,[6,17,25,34,38,34,38,14,30,14]);records.forEach((record,index)=>{const row=4+index;sheet.getRow(row).values=[index+1,record.area,record.spg||'Semua SPG',record.problem||'',record.identification||'',record.corrective||'',record.action||'',excelDate(record.dueDate),record.pic||'',record.status||'Open'];sheet.getCell(row,8).numFmt='d-mmm-yy';statusFill(sheet.getCell(row,10),record.status);});const lastRow=Math.max(4,3+records.length);if(!records.length){sheet.mergeCells('A4:J4');sheet.getCell('A4').value='Belum ada PICA pada filter ini.';sheet.getCell('A4').alignment={horizontal:'center'};}styleExportRows(sheet,4,lastRow,10);sheet.autoFilter={from:'A3',to:`J${Math.max(3,3+records.length)}`};sheet.pageSetup.printArea=`A1:J${lastRow}`;return sheet;
  }
  function rebuildSupplementalSheets(workbook,ctx,wip,scopeArea,scopeSpg){workbook.worksheets.filter(sheet=>sheet.name!=='Daily Report & WIP').forEach(sheet=>workbook.removeWorksheet(sheet.id));addHkSheet(workbook,ctx,wip,scopeArea,scopeSpg);addZoneSheet(workbook,ctx,wip);addStatisticsSheet(workbook,ctx,wip,scopeArea,scopeSpg);addSamplingSheet(workbook,ctx,wip);}
  function reportingFilename(ctx,scopeArea,scopeSpg='Semua') {
    const options=ctx.data.settings?.systemControl?.reportingExcel||{},prefix=String(options.filePrefix||'DAILY REPORT SPG').trim(),reporter=String(options.reporterName||'SOLEH').trim(),areaSuffix=scopeArea==='Semua'?'':`_${scopeArea.toUpperCase()}`,profile=scopeSpg==='Semua'?null:profiles(ctx).find(item=>item.id===scopeSpg||norm(item.spg)===norm(scopeSpg)),spgSuffix=profile?`_${String(profile.spg).toUpperCase()}`:'';return `${prefix} ${monthLabel(ui.period)}_${reporter}${areaSuffix}${spgSuffix}.xlsx`.replace(/[\\/:*?"<>|]/g,'-');
  }
  async function buildReportingTemplateBuffer(ctx,allAreas,templateBuffer) {
    if(!window.ExcelJS)throw new Error('Pembuat Excel belum termuat.');
    const workbook=new ExcelJS.Workbook(),safeAllAreas=Boolean(allAreas&&!isMonitor(ctx)),scopeArea=safeAllAreas?'Semua':ui.area,scopeSpg=safeAllAreas?'Semua':ui.spg;let wip=aggregateSpg(ctx,ui.period,scopeArea,scopeSpg).filter(row=>String(row.status).toLowerCase()!=='vacant');if(ui.exportAttention==='Perlu Perhatian')wip=wip.filter(needsAttention);
    addDailyWipSheet(workbook,ctx,wip,scopeArea,scopeSpg,ui.period);rebuildSupplementalSheets(workbook,ctx,wip,scopeArea,scopeSpg);
    const cfg=config(ctx);workbook.creator=cfg.tlName;workbook.lastModifiedBy=ctx.user?.name||cfg.tlName;workbook.company='Website Extra Joss SPG';workbook.title=reportingFilename(ctx,scopeArea,scopeSpg).replace(/\.xlsx$/i,'');workbook.subject=`Daily Report & WIP ${monthLabel(ui.period)} • ${scopeArea} • ${scopeSpg==='Semua'?'Semua SPG':'SPG terpilih'}`;workbook.modified=new Date();workbook.calcProperties.fullCalcOnLoad=true;workbook.calcProperties.forceFullCalc=true;workbook.views=[{activeTab:0}];
    return workbook.xlsx.writeBuffer();
  }
  function monitorExportArea(ctx) {
    const permitted=allowedAreas(ctx);return permitted.includes(ui.area)?ui.area:(permitted[0]||'Banjarmasin');
  }
  function monitorExportPeriods() {
    const periods=periodRange(ui.exportPeriodStart||ui.period,ui.exportPeriodEnd||ui.period,24);return periods.length?periods:[ui.period];
  }
  function shortMonthLabel(period) {
    const [year,month]=String(period||'').split('-').map(Number);if(!year||!month)return String(period||'PERIODE');
    return `${new Intl.DateTimeFormat('id-ID',{month:'short'}).format(new Date(year,month-1,1)).replace('.','').toUpperCase()} ${year}`;
  }
  function monitorRowsForPeriod(ctx,period,area) {
    let rows=aggregateSpg(ctx,period,area,'Semua').filter(row=>String(row.status).toLowerCase()!=='vacant'&&row.area===area);
    if(ui.exportAttention==='Perlu Perhatian')rows=rows.filter(needsAttention);return rows;
  }
  function addMonitorSummarySheet(workbook,ctx,periods,area) {
    const cfg=config(ctx),sheet=addCleanSheet(workbook,'RINGKASAN',{freezeRows:4}),headers=['PERIODE','AREA','NAMA SPG','HK','SELLING','TARGET BULAN','ACHIEVEMENT','VALUE','AVG / HK','RATIO','SAMPLING','SISA CAN 100%','SISA KARTON 100%'];
    styleExportTitle(sheet,`A1:${excelColumn(headers.length-1)}1`,`RINGKASAN WIP SPG AREA ${area.toUpperCase()}`);sheet.mergeCells(`A2:${excelColumn(headers.length-1)}2`);sheet.getCell('A2').value=`Periode ${monthLabel(periods[0])}${periods.length>1?` sampai ${monthLabel(periods.at(-1))}`:''} • 1 karton = ${n(cfg.pcsPerCarton)} kaleng`;sheet.getCell('A2').alignment={horizontal:'center',vertical:'middle',wrapText:true};sheet.getCell('A2').font={italic:true,color:{argb:'FF44546A'}};styleExportHeader(sheet,4,headers);setExportWidths(sheet,[16,17,28,10,13,15,14,18,12,12,12,16,18]);
    const data=[];periods.forEach(period=>monitorRowsForPeriod(ctx,period,area).forEach(row=>data.push({period,row})));
    data.forEach(({period,row},index)=>{const line=5+index,remaining=Math.max(row.targetMonth-row.selling,0);sheet.getRow(line).values=[monthLabel(period),row.area,row.spg,row.hk,row.selling,row.targetMonth,row.achievementMonth,row.value,row.avg,row.ratio,row.sampling,remaining,remaining/n(cfg.pcsPerCarton||24)];[7,10].forEach(column=>sheet.getCell(line,column).numFmt='0.0%');sheet.getCell(line,8).numFmt='"Rp" #,##0';sheet.getCell(line,9).numFmt='0.0';sheet.getCell(line,13).numFmt='0.00';});
    const last=Math.max(5,4+data.length);if(!data.length){sheet.mergeCells(`A5:${excelColumn(headers.length-1)}5`);sheet.getCell('A5').value='Belum ada data pada area dan periode ini.';sheet.getCell('A5').alignment={horizontal:'center'};}styleExportRows(sheet,5,last,headers.length);sheet.autoFilter={from:'A4',to:`${excelColumn(headers.length-1)}${Math.max(4,4+data.length)}`};sheet.pageSetup.printArea=`A1:${excelColumn(headers.length-1)}${last}`;return sheet;
  }
  function addMonitorWipSheet(workbook,ctx,period,area) {
    const cfg=config(ctx),headers=['AREA','NAMA SPG','TOKO / GROMIN','TARGET HK','ACTUAL HK','ACH HK','W1','W2','W3','W4','W5','AVG W1','AVG W2','AVG W3','AVG W4','AVG W5','TARGET BULAN (CAN)','ACTUAL BULAN (CAN)','ACH BULAN','SELLING VALUE','AVG / HK','RATIO','BIAYA ACTUAL HK','BIAYA / HK','SISA CAN 100%','SISA KARTON 100%','KARTON / HARI','TARGET VALUE','NEEDS VALUE','GAP RATIO','KOMITMEN RATIO','SAMPLING','TARGET SAMPLING','ACH SAMPLING','JOINT DATE'],sheet=addCleanSheet(workbook,safeSheetName(`WIP ${shortMonthLabel(period)}`),{freezeRows:4}),rows=monitorRowsForPeriod(ctx,period,area),lastColumn=excelColumn(headers.length-1);sheet.pageSetup.paperSize=8;sheet.pageSetup.fitToWidth=2;sheet.pageSetup.fitToHeight=1;sheet.pageSetup.printTitlesRow='1:4';
    const title=`WORK IN PROGRESS SPG AREA ${area.toUpperCase()} • ${monthLabel(period)}`,subtitle=`Detail pencapaian, rasio, dan kebutuhan menuju 100% • 1 karton = ${n(cfg.pcsPerCarton)} kaleng`,continuationSubtitle=`Lanjutan detail WIP • 1 karton = ${n(cfg.pcsPerCarton)} kaleng`;styleExportTitle(sheet,'A1:S1',title);styleExportTitle(sheet,'T1:AI1',`${title} • LANJUTAN`);sheet.mergeCells('A2:S2');sheet.getCell('A2').value=subtitle;sheet.mergeCells('T2:AI2');sheet.getCell('T2').value=continuationSubtitle;['A2','T2'].forEach(address=>{sheet.getCell(address).alignment={horizontal:'center',vertical:'middle',wrapText:true};sheet.getCell(address).font={italic:true,color:{argb:'FF44546A'}};});styleExportHeader(sheet,4,headers);setExportWidths(sheet,[17,28,28,11,11,11,9,9,9,9,9,10,10,10,10,10,16,17,12,18,12,11,18,15,16,18,15,18,18,12,17,12,16,14,14]);
    rows.forEach((row,index)=>{const line=5+index,remainingCan=Math.max(row.targetMonth-row.selling,0),remainingCarton=remainingCan/n(cfg.pcsPerCarton||24),weeklyAvg=row.weekly.map(week=>week.hk?week.selling/week.hk:0),gapRatio=row.ratio-n(cfg.ratioCommitment);sheet.getRow(line).values=[row.area,row.spg,row.outlet||'',row.targetHK,row.hk,row.targetHK?row.hk/row.targetHK:0,...row.weekly.map(week=>week.selling),...weeklyAvg,row.targetMonth,row.selling,row.achievementMonth,row.value,row.avg,row.ratio,row.expenseActual,row.expenseRate,remainingCan,remainingCarton,row.gapCartonPerDay,row.targetValue,row.needsValue,gapRatio,cfg.ratioCommitment,row.sampling,row.samplingTarget,row.samplingAchievement,excelDate(row.profile?.joinDate)];[6,19,22,30,31,34].forEach(column=>sheet.getCell(line,column).numFmt='0.0%');[20,23,24,28,29].forEach(column=>sheet.getCell(line,column).numFmt='"Rp" #,##0');[12,13,14,15,16,21,26,27].forEach(column=>sheet.getCell(line,column).numFmt='0.00');sheet.getCell(line,35).numFmt='d-mmm-yy';statusFill(sheet.getCell(line,19),row.achievementMonth>=1?'TARGET TERCAPAI':row.achievementZone.label);statusFill(sheet.getCell(line,22),row.ratioZone.label);});
    const totalRow=5+rows.length,total=wipTotals(rows),remainingCan=Math.max(total.targetMonth-total.selling,0),remainingCarton=remainingCan/n(cfg.pcsPerCarton||24),totalSampling=rows.reduce((sum,row)=>sum+n(row.sampling),0),totalSamplingTarget=rows.reduce((sum,row)=>sum+n(row.samplingTarget),0),totalTargetValue=rows.reduce((sum,row)=>sum+n(row.targetValue),0),totalNeedsValue=rows.reduce((sum,row)=>sum+n(row.needsValue),0),totalRemainingHK=Math.max(total.targetHK-total.hk,0);
    sheet.getRow(totalRow).values=[`TOTAL ${area.toUpperCase()}`,'','',total.targetHK,total.hk,total.targetHK?total.hk/total.targetHK:0,...total.weekly.map(week=>week.selling),...total.weekly.map(week=>week.hk?week.selling/week.hk:0),total.targetMonth,total.selling,total.targetMonth?total.selling/total.targetMonth:0,total.value,total.hk?total.selling/total.hk:0,total.value?total.expense/total.value:0,total.expense,'',remainingCan,remainingCarton,totalRemainingHK?remainingCarton/totalRemainingHK:remainingCarton,totalTargetValue,totalNeedsValue,(total.value?total.expense/total.value:0)-n(cfg.ratioCommitment),cfg.ratioCommitment,totalSampling,totalSamplingTarget,totalSamplingTarget?totalSampling/totalSamplingTarget:0,''];[6,19,22,30,31,34].forEach(column=>sheet.getCell(totalRow,column).numFmt='0.0%');[20,23,24,28,29].forEach(column=>sheet.getCell(totalRow,column).numFmt='"Rp" #,##0');[12,13,14,15,16,21,26,27].forEach(column=>sheet.getCell(totalRow,column).numFmt='0.00');styleExportRows(sheet,5,totalRow,headers.length);styleExportTotal(sheet,totalRow,headers.length);sheet.autoFilter={from:'A4',to:`${lastColumn}${Math.max(4,totalRow-1)}`};sheet.pageSetup.printArea=`A1:${lastColumn}${totalRow}`;sheet.headerFooter.oddFooter=`&LWebsite Extra Joss SPG&C&P / &N&R${monthLabel(period)}`;return sheet;
  }
  function addMonitorDailySheet(workbook,ctx,period,area) {
    const headers=['TANGGAL','HARI','NAMA SPG','TOKO / GROMIN','KECAMATAN','STATUS','HK','SELLING (CAN)','VALUE','SAMPLING (CUP)','PO TAMBAHAN (CAN)','CATATAN'],sheet=addCleanSheet(workbook,safeSheetName(`HARIAN ${shortMonthLabel(period)}`),{freezeRows:4}),spgRows=monitorRowsForPeriod(ctx,period,area),rows=[];spgRows.forEach(data=>{for(let day=1;day<=daysInPeriod(period);day++){const key=`${period}-${String(day).padStart(2,'0')}`,entry=dailyExportEntry(data,key),date=periodDate(period,day);rows.push({date,spg:data.spg,entry});}});const lastColumn=excelColumn(headers.length-1);
    styleExportTitle(sheet,`A1:${lastColumn}1`,`DAILY REPORT SPG AREA ${area.toUpperCase()} • ${monthLabel(period)}`);sheet.mergeCells(`A2:${lastColumn}2`);sheet.getCell('A2').value=`Tanggal 1–${daysInPeriod(period)} selalu ditampilkan untuk setiap SPG. Tanggal tanpa laporan ditandai BELUM ADA DATA.`;sheet.getCell('A2').alignment={horizontal:'center',vertical:'middle'};styleExportHeader(sheet,4,headers);setExportWidths(sheet,[14,13,27,28,25,18,9,14,18,15,18,38]);
    rows.forEach((item,index)=>{const line=5+index,{date,spg,entry}=item;sheet.getRow(line).values=[date,new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(date),spg,entry.gromin,entry.district,entry.hasData?entry.status:'BELUM ADA DATA',entry.hk,entry.selling,entry.value,entry.sampling,entry.po,entry.notes||''];sheet.getCell(line,1).numFmt='d-mmm-yy';sheet.getCell(line,9).numFmt='"Rp" #,##0';statusFill(sheet.getCell(line,6),entry.hasData?entry.status:'BELUM ADA DATA');});
    const last=Math.max(5,4+rows.length);if(!rows.length){sheet.mergeCells(`A5:${lastColumn}5`);sheet.getCell('A5').value='Belum ada SPG pada area dan periode ini.';sheet.getCell('A5').alignment={horizontal:'center'};}styleExportRows(sheet,5,last,headers.length);sheet.autoFilter={from:'A4',to:`${lastColumn}${Math.max(4,4+rows.length)}`};sheet.pageSetup.printArea=`A1:${lastColumn}${last}`;return sheet;
  }
  function monitorReportingFilename(ctx,periods=monitorExportPeriods(),area=monitorExportArea(ctx),extension='xlsx') {
    const range=periods.length===1?shortMonthLabel(periods[0]):`${shortMonthLabel(periods[0])}-${shortMonthLabel(periods.at(-1))}`;return `WIP SPG AREA ${area.toUpperCase()} ${range}.${extension}`.replace(/[\\/:*?"<>|]/g,'-');
  }
  async function buildMonitorWorkbookBuffer(ctx,periods=monitorExportPeriods()) {
    if(!window.ExcelJS)throw new Error('Pembuat Excel belum termuat.');const area=monitorExportArea(ctx),safePeriods=periods.length?periods:[ui.period],workbook=new ExcelJS.Workbook(),cfg=config(ctx);workbook.creator=ctx.user?.name||cfg.tlName;workbook.lastModifiedBy=ctx.user?.name||cfg.tlName;workbook.company='Website Extra Joss SPG';workbook.title=monitorReportingFilename(ctx,safePeriods,area).replace(/\.xlsx$/i,'');workbook.subject=`WIP SPG ${area} • ${monthLabel(safePeriods[0])}${safePeriods.length>1?` sampai ${monthLabel(safePeriods.at(-1))}`:''}`;workbook.created=new Date();workbook.modified=new Date();addMonitorSummarySheet(workbook,ctx,safePeriods,area);safePeriods.forEach(period=>{const rows=monitorRowsForPeriod(ctx,period,area);addMonitorWipSheet(workbook,ctx,period,area);addMonitorDailySheet(workbook,ctx,period,area);addHkSheet(workbook,ctx,rows,area,'Semua',{period,name:safeSheetName(`HK ${shortMonthLabel(period)}`)});addZoneSheet(workbook,ctx,rows,{period,name:safeSheetName(`ZONA ${shortMonthLabel(period)}`)});});workbook.views=[{activeTab:0}];return workbook.xlsx.writeBuffer();
  }
  async function exportReportingExcel(ctx,allAreas) {
    if(isMonitor(ctx)){
      const periods=monitorExportPeriods(),area=monitorExportArea(ctx);try{ctx.toast(`Menyiapkan WIP ${area} untuk ${periods.length} bulan…`);const buffer=await buildMonitorWorkbookBuffer(ctx,periods);downloadBuffer(buffer,monitorReportingFilename(ctx,periods,area));ctx.toast(`Excel WIP ${area} berhasil dibuat. Tidak ada data area lain di dalam file.`);}catch(error){ctx.toast('Excel belum berhasil dibuat: '+error.message);}return;
    }
    const safeAllAreas=Boolean(allAreas&&!isMonitor(ctx));
    const scopeArea=safeAllAreas?'Semua':ui.area,scopeSpg=safeAllAreas?'Semua':ui.spg;
    try{ctx.toast('Menyiapkan Excel sesuai filter tabel…');const buffer=await buildReportingTemplateBuffer(ctx,safeAllAreas);downloadBuffer(buffer,reportingFilename(ctx,scopeArea,scopeSpg));ctx.toast('Excel berhasil dibuat. Data, total, area, dan SPG sudah sama dengan filter layar.');}
    catch(error){ctx.toast('Excel belum berhasil dibuat: '+error.message);}
  }

  function pdfReportHeader(doc,title,subtitle){const width=doc.internal.pageSize.getWidth();doc.setFillColor(15,42,76);doc.rect(0,0,width,31,'F');doc.setTextColor(255,255,255);doc.setFontSize(17);doc.text(title,14,13);doc.setFontSize(9);doc.text(subtitle,14,22);doc.setTextColor(15,23,42);}
  function appendDetailedPeriodPdf(doc,ctx,period,area,spgs,nextPage){
    const cfg=config(ctx),scopeSpg='Semua',baseStyle={theme:'grid',styles:{fontSize:6.2,cellPadding:1.7,lineWidth:.16,lineColor:[71,85,105],overflow:'linebreak',valign:'middle'},headStyles:{fillColor:[31,78,120],textColor:[255,255,255],fontStyle:'bold',halign:'center',lineWidth:.22,lineColor:[51,65,85]},alternateRowStyles:{fillColor:[248,250,252]}};
    nextPage();pdfReportHeader(doc,`WORK IN PROGRESS SPG • ${area.toUpperCase()}`,`${monthLabel(period)} • detail target, aktual, ratio, kebutuhan 100%, dan sampling`);doc.autoTable({...baseStyle,startY:38,head:[['SPG','Toko','HK','Target HK','W1','W2','W3','W4','W5','Selling','Target','Ach.','AVG/HK','Value','Ratio','Sisa CAN','Sisa Karton','Karton/Hari','Sampling','Target Sampling','Ach. Sampling','Zona']],body:spgs.map(row=>{const remaining=Math.max(row.targetMonth-row.selling,0);return[row.spg,row.outlet||'-',row.hk,row.targetHK,...row.weekly.map(week=>ctx.number(week.selling)),ctx.number(row.selling),ctx.number(row.targetMonth),pct(row.achievementMonth,1),round(row.avg,1),ctx.money(row.value),pct(row.ratio,1),ctx.number(remaining),round(remaining/n(cfg.pcsPerCarton||24),2),round(row.gapCartonPerDay,2),ctx.number(row.sampling),ctx.number(row.samplingTarget),pct(row.samplingAchievement,1),`${row.ratioZone.label} / ${row.achievementZone.label}`];})});
    nextPage();pdfReportHeader(doc,`DAILY REPORT SPG • ${area.toUpperCase()}`,`${monthLabel(period)} • seluruh tanggal 1–${daysInPeriod(period)} ditampilkan untuk setiap SPG`);const daily=[];spgs.forEach(data=>{for(let day=1;day<=daysInPeriod(period);day++){const key=`${period}-${String(day).padStart(2,'0')}`,entry=dailyExportEntry(data,key);daily.push([formatDate(key),data.spg,entry.gromin||'-',entry.district||'-',entry.hasData?entry.status:'BELUM ADA DATA',entry.hk,ctx.number(entry.selling),ctx.money(entry.value),ctx.number(entry.sampling),ctx.number(entry.po),entry.notes||'-']);}});doc.autoTable({...baseStyle,startY:38,styles:{...baseStyle.styles,fontSize:6.7,cellPadding:1.8},head:[['Tanggal','SPG','Toko / Gromin','Kecamatan','Status','HK','Selling','Value','Sampling','PO Tambahan','Catatan']],body:daily,columnStyles:{0:{cellWidth:25},1:{cellWidth:34},2:{cellWidth:44},3:{cellWidth:35},10:{cellWidth:60}}});
    nextPage();pdfReportHeader(doc,`PLANNING HK SPG • ${area.toUpperCase()}`,`${monthLabel(period)} • K=Kerja, O=Off, B=Belum ada data, I=Izin/Sakit/Alpha`);const cutoff=Math.max(reportingAsOfDay(ctx,area,scopeSpg,period),calendarCutoffDay(period)),dayHeaders=Array.from({length:daysInPeriod(period)},(_,index)=>String(index+1));const hkRows=spgs.map(data=>{let planned=0;const remaining=Math.max(data.targetHK-data.hk,0),codes=dayHeaders.map((_,index)=>{const day=index+1,key=`${period}-${String(day).padStart(2,'0')}`,entry=dailyExportEntry(data,key),date=periodDate(period,day);if(entry.hasData)return entry.hk>0?'K':'I';if(date.getDay()===0)return'O';if(day<=cutoff)return'B';if(planned<remaining){planned++;return'K';}return'O';}),projected=data.hk+planned;return[data.spg,data.hk,data.targetHK,...codes,projected,Math.max(data.targetHK-projected,0),projected>=data.targetHK?'TERCAPAI':'KURANG'];});doc.autoTable({...baseStyle,startY:38,styles:{...baseStyle.styles,fontSize:5.2,cellPadding:1.1,halign:'center'},head:[['SPG','Aktual','Target',...dayHeaders,'Proyeksi','Gap','Status']],body:hkRows,columnStyles:{0:{cellWidth:36}}});
    nextPage();pdfReportHeader(doc,`ZONA SPG • ${area.toUpperCase()}`,`${monthLabel(period)} • detail pencapaian, biaya, ratio, sisa target, dan prioritas`);doc.autoTable({...baseStyle,startY:38,head:[['SPG','HK','Target HK','Ach HK','Selling','Target Bulan','Ach Bulan','AVG/HK','Value','Biaya','Ratio','Komitmen','Gap Ratio','Sisa CAN','Sisa Karton','Karton/Hari','Sampling','Ach Sampling','Zona Ratio','Zona Target']],body:spgs.map(row=>{const remaining=Math.max(row.targetMonth-row.selling,0);return[row.spg,row.hk,row.targetHK,pct(row.targetHK?row.hk/row.targetHK:0,1),ctx.number(row.selling),ctx.number(row.targetMonth),pct(row.achievementMonth,1),round(row.avg,1),ctx.money(row.value),ctx.money(row.expenseActual),pct(row.ratio,1),pct(cfg.ratioCommitment,1),pct(row.ratio-cfg.ratioCommitment,1),ctx.number(remaining),round(remaining/n(cfg.pcsPerCarton||24),2),round(row.gapCartonPerDay,2),ctx.number(row.sampling),pct(row.samplingAchievement,1),row.ratioZone.label,row.achievementZone.label];})});
  }
  function exportReportingPdf(ctx) {
    rememberRole(ctx);const jspdf=window.jspdf;if(!jspdf?.jsPDF)return ctx.toast('Library PDF belum termuat. Muat ulang halaman lalu coba lagi.');const doc=new jspdf.jsPDF({orientation:'landscape',format:'a3'});let used=false;const nextPage=()=>{if(used)doc.addPage('a3','landscape');else used=true;};
    let filename='';if(isMonitor(ctx)){const area=monitorExportArea(ctx),periods=monitorExportPeriods();periods.forEach(period=>appendDetailedPeriodPdf(doc,ctx,period,area,monitorRowsForPeriod(ctx,period,area),nextPage));filename=monitorReportingFilename(ctx,periods,area,'pdf');}else{const area=ui.area;let spgs=aggregateSpg(ctx,ui.period,area,ui.spg).filter(row=>String(row.status).toLowerCase()!=='vacant');if(ui.exportAttention==='Perlu Perhatian')spgs=spgs.filter(needsAttention);appendDetailedPeriodPdf(doc,ctx,ui.period,area,spgs,nextPage);filename=`REPORTING SPG_${area==='Semua'?'ALL AREA':area.toUpperCase()}_${ui.period}.pdf`;}
    const pages=doc.internal.getNumberOfPages();for(let page=1;page<=pages;page++){doc.setPage(page);doc.setFontSize(7);doc.setTextColor(100,116,139);doc.text(`Website Extra Joss SPG • ${ctx.user?.name||ctx.user?.role||'Pengguna'} • Halaman ${page}/${pages}`,14,doc.internal.pageSize.getHeight()-7);}doc.save(filename.replace(/[\\/:*?"<>|]/g,'-'));ctx.toast('PDF Reporting SPG berhasil dibuat lengkap dengan tabel bergaris.');
  }

  function setView(next={}) {
    if(next.tab&&TABS.some(([key])=>key===next.tab))ui.tab=next.tab;
    if(next.period)ui.period=next.period;
    if(next.area)ui.area=next.area;
    if(next.spg)ui.spg=next.spg;
    if(next.dailyPage)ui.dailyPage=Math.max(1,n(next.dailyPage));
    if(next.dailyPageSize)ui.dailyPageSize=[10,20,50].includes(n(next.dailyPageSize))?n(next.dailyPageSize):10;
    if(next.stockPeriod)ui.stockPeriod=next.stockPeriod;
    if(next.stockArea)ui.stockArea=next.stockArea;
    if(next.monitorAttention)ui.monitorAttention=['Semua','Perlu Perhatian'].includes(next.monitorAttention)?next.monitorAttention:'Semua';
    if(next.exportPeriodStart)ui.exportPeriodStart=next.exportPeriodStart;
    if(next.exportPeriodEnd)ui.exportPeriodEnd=next.exportPeriodEnd;
  }
  window.ReportingSPG={normalizeData,renderStockPage,renderReportingPage,renderReceiptPage,renderDashboardStats,renderMonitorDashboard,reportingSnapshot,bind,bindReceiptPage,bindMonitorDashboard,exportStockExcel,exportReportingExcel,exportReportingPdf,exportReceiptPdf,buildStockWorkbookBuffer,buildReportingTemplateBuffer,buildMonitorWorkbookBuffer,monitorReportingFilename,periodRange,reportingFilename,setView};
})();
