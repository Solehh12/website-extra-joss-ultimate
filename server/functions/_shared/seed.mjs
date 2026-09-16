const areas = [
  ['a-1','Banjarmasin',2880,'#2563eb'],
  ['a-2','Balikpapan',2400,'#16a34a'],
  ['a-3','Samarinda',2400,'#f59e0b'],
  ['a-4','Palangkaraya',2200,'#8b5cf6'],
  ['a-5','Makassar',2880,'#db2777'],
  ['a-6','Manado',2880,'#06b6d4']
].map(([id,name,target,color])=>({id,name,city:name,target,color}));

export default {
  seedMode:'clean',
  users:[{id:'u-admin-1',role:'ADMIN',name:'Admin',email:'admin@webmapsspg.local',password:'admin123',phone:'',area:'All Area',areas:[],allAreas:true,status:'Aktif'}],
  areas,
  outlets:[],placementLocations:[],spgAssignments:[],routes:[],workShifts:[],offlineQueue:[],reportingLocks:[],
  reportingProfiles:[],reportingDaily:[],stockLedgers:[],coachingRecords:[],picaRecords:[],spgCandidates:[],
  reportingConfig:{focusAreas:[]},
  settings:{appName:'Website Extra Joss SPG',targetHarian:96,hargaPerPcs:4000,pcsPerKarton:24,mapDefaultLat:-3.3194,mapDefaultLng:114.5908,mapDefaultZoom:12,deployMode:true,dataVariant:'clean',auditLog:[],systemVersions:[]}
};
