import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const clone=value=>JSON.parse(JSON.stringify(value));
export const COLLECTIONS=['users','areas','outlets','placementLocations','spgAssignments','routes','workShifts','offlineQueue','reportingLocks','reportingProfiles','reportingDaily','stockLedgers','coachingRecords','picaRecords','spgCandidates','activityLog','sessions','notifications','trash','changeLog'];
const TL_MUTABLE_OPERATIONAL=['outlets','placementLocations','spgAssignments','reportingProfiles','reportingDaily','stockLedgers','coachingRecords','picaRecords','spgCandidates'];
const SPG_CORRECTION_MS=30*60*1000;
const SECRET_KEYS=new Set(['password','passwordHash','mfaSecret','supabaseServiceKey','photo','receiptData','notaData']);

const iso=now=>new Date(now).toISOString();
const id=(prefix,now=Date.now())=>`${prefix}-${now}-${randomBytes(4).toString('hex')}`;

export function hashPassword(password){
  const salt=randomBytes(16).toString('hex');
  const hash=scryptSync(String(password),salt,64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password,encoded=''){
  const [kind,salt,expected]=String(encoded).split('$');
  if(kind!=='scrypt'||!salt||!expected)return false;
  const actual=scryptSync(String(password),salt,64);
  const target=Buffer.from(expected,'hex');
  return actual.length===target.length&&timingSafeEqual(actual,target);
}

const b64=value=>Buffer.from(value).toString('base64url');
export function signSession(payload,secret){
  const body=b64(JSON.stringify(payload));
  const signature=createHmac('sha256',secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}
export function verifySession(token,secret){
  try{
    const [body,signature]=String(token||'').split('.');
    if(!body||!signature)return null;
    const expected=createHmac('sha256',secret).update(body).digest();
    const received=Buffer.from(signature,'base64url');
    if(expected.length!==received.length||!timingSafeEqual(expected,received))return null;
    const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
    return Number(payload.exp||0)>Date.now()?payload:null;
  }catch{return null;}
}
export const createSecret=()=>randomBytes(48).toString('base64url');

function decodeBase32(value=''){
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits='';
  for(const char of String(value).toUpperCase().replace(/[^A-Z2-7]/g,'')){
    const index=alphabet.indexOf(char);if(index<0)continue;
    bits+=index.toString(2).padStart(5,'0');
  }
  const bytes=[];
  for(let offset=0;offset+8<=bits.length;offset+=8)bytes.push(Number.parseInt(bits.slice(offset,offset+8),2));
  return Buffer.from(bytes);
}
export function totpCode(secret,now=Date.now(),stepSeconds=30,digits=6){
  const counter=Math.floor(now/1000/stepSeconds);
  const buffer=Buffer.alloc(8);buffer.writeBigUInt64BE(BigInt(counter));
  const digest=createHmac('sha1',decodeBase32(secret)).update(buffer).digest();
  const offset=digest[digest.length-1]&15;
  const code=(digest.readUInt32BE(offset)&0x7fffffff)%(10**digits);
  return String(code).padStart(digits,'0');
}
export function verifyTotp(secret,code,now=Date.now()){
  const input=String(code||'').replace(/\D/g,'');
  if(!secret||input.length!==6)return false;
  return [-1,0,1].some(window=>{
    const expected=Buffer.from(totpCode(secret,now+window*30000));
    const received=Buffer.from(input);
    return expected.length===received.length&&timingSafeEqual(expected,received);
  });
}

function defaultSecurity(data){
  const security=data.settings?.systemControl?.security||{};
  security.routeRetentionDays=[60,90].includes(Number(security.routeRetentionDays))?Number(security.routeRetentionDays):90;
  security.sessionMinutes=Math.max(30,Math.min(1440,Number(security.sessionMinutes||480)));
  return security;
}
const cleanAreaName=value=>String(value||'').replace(/\s*[•-]\s*FOKUS\s*$/i,'').trim();
function remapAreaKeyedObject(source={}){
  return Object.fromEntries(Object.entries(source||{}).map(([key,value])=>[cleanAreaName(key)||key,value]));
}
export function normalizeStoredData(source={}){
  const data=clone(source||{});
  COLLECTIONS.forEach(key=>{if(!Array.isArray(data[key]))data[key]=[];});
  data.settings=data.settings||{};
  data.settings.hargaPerPcs=Math.max(0,Number(data.settings.hargaPerPcs||4000));
  data.areas=data.areas.map((area,index)=>{
    const raw=String(area?.name||area?.area||`Area ${index+1}`);
    const name=cleanAreaName(raw)||`Area ${index+1}`;
    const {pricePerCan,price_per_can,...rest}=area||{};
    return {...rest,id:area?.id||`area-${index+1}`,name,city:area?.city||name,target:Math.max(0,Number(area?.target||0))};
  });
  const areaNames=new Set(data.areas.map(area=>area.name));
  data.users=data.users.map(user=>{
    const areas=Array.isArray(user?.areas)?[...new Set(user.areas.map(cleanAreaName).filter(Boolean))]:[];
    const area=cleanAreaName(user?.area);
    return {...user,areas,area:area||user?.area||''};
  });
  const areaCollections=['outlets','placementLocations','spgAssignments','routes','workShifts','reportingProfiles','reportingDaily','stockLedgers','coachingRecords','picaRecords','spgCandidates'];
  areaCollections.forEach(key=>{data[key]=data[key].map(row=>row&&typeof row==='object'?{...row,area:cleanAreaName(row.area)||row.area||''}:row);});
  data.reportingConfig=data.reportingConfig||{};
  data.reportingConfig.defaultSellingPrice=data.settings.hargaPerPcs;
  data.reportingConfig.focusAreas=Array.isArray(data.reportingConfig.focusAreas)
    ? [...new Set(data.reportingConfig.focusAreas.map(cleanAreaName).filter(value=>areaNames.has(value)))]
    : [];
  ['quotaByArea','expenseByArea','scoByArea'].forEach(key=>{data.reportingConfig[key]=remapAreaKeyedObject(data.reportingConfig[key]);});
  data.settings.systemControl=data.settings.systemControl||{};
  data.settings.systemControl.security=defaultSecurity(data);
  data.revision=Math.max(1,Number(data.revision||1));
  return data;
}
export async function prepareSeed(seed){
  const data=normalizeStoredData(seed||{});
  data.users=data.users.map(user=>{
    const next={...user};
    if(next.password){next.passwordHash=hashPassword(next.password);delete next.password;}
    next.mustChangePassword=false;
    next.mfaEnabled=Boolean(next.mfaEnabled&&next.mfaSecret);
    next.failedLoginCount=Math.max(0,Number(next.failedLoginCount||0));
    next.blockedUntil=next.blockedUntil||'';
    return next;
  });
  data.revision=1;
  data.updatedAt=new Date().toISOString();
  return pruneExpiredRoutes(data);
}

function sanitizeValue(value,key=''){
  if(SECRET_KEYS.has(key))return key==='photo'?'[foto]':'[rahasia]';
  if(Array.isArray(value))return value.slice(0,30).map(item=>sanitizeValue(item));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([name])=>!SECRET_KEYS.has(name)).map(([name,item])=>[name,sanitizeValue(item,name)]));
  if(typeof value==='string'&&value.length>300)return `${value.slice(0,297)}...`;
  return value;
}
function stripSecrets(data){
  const safe=clone(data);
  safe.users=(safe.users||[]).map(({password,passwordHash,mfaSecret,...user})=>user);
  safe.reportingDaily=(safe.reportingDaily||[]).map(({receiptData,notaData,...row})=>row);
  safe.trash=(safe.trash||[]).map(item=>({...item,record:sanitizeValue(item.record)}));
  safe.changeLog=(safe.changeLog||[]).map(item=>({...item,before:sanitizeValue(item.before),after:sanitizeValue(item.after)}));
  if(safe.settings)delete safe.settings.supabaseServiceKey;
  return safe;
}
function userAreas(user){
  if(user.role==='ADMIN'||user.allAreas)return null;
  return [...new Set([...(user.areas||[]),user.area].filter(Boolean))];
}
function filterArea(rows,areas){return !areas?rows:(rows||[]).filter(row=>areas.includes(row.area||row.name));}
function notificationForUser(row,user){
  if(row.userId&&row.userId!==user.id)return false;
  if(Array.isArray(row.roles)&&row.roles.length&&!row.roles.includes(user.role))return false;
  if(row.area&&!user.allAreas&&!(userAreas(user)||[]).includes(row.area))return false;
  return true;
}
function withoutTracking(safe){return {...safe,routes:[],workShifts:[],offlineQueue:[]};}
export function scopeData(source,user){
  const data=pruneExpiredRoutes(source),safe=stripSecrets(data),role=String(user.role||'').toUpperCase(),areas=userAreas(user);
  safe.notifications=(safe.notifications||[]).filter(row=>notificationForUser(row,user));
  if(role==='ADMIN'){
    return {...safe,outlets:[],placementLocations:[],spgAssignments:[],routes:[],workShifts:[],offlineQueue:[],reportingLocks:[],reportingProfiles:[],reportingDaily:[],stockLedgers:[],coachingRecords:[],picaRecords:[],spgCandidates:[]};
  }
  if(role==='TL')return {...safe,sessions:[],trash:[],activityLog:[],changeLog:(safe.changeLog||[]).filter(row=>row.scope==='operational')};
  if(['SCO','MS','AM'].includes(role)){
    const profileIds=new Set(filterArea(safe.reportingProfiles,areas).map(row=>row.id));
    const areaAllowed=row=>!areas||areas.includes(row.area||row.name);
    return withoutTracking({...safe,sessions:[],trash:[],activityLog:[],changeLog:[],users:(safe.users||[]).filter(row=>row.id===user.id||row.role==='SPG'&&areaAllowed(row)),areas:filterArea(safe.areas,areas),outlets:filterArea(safe.outlets,areas),placementLocations:filterArea(safe.placementLocations,areas),spgAssignments:filterArea(safe.spgAssignments,areas),reportingLocks:(safe.reportingLocks||[]).filter(row=>row.area==='Semua'||areaAllowed(row)),reportingProfiles:filterArea(safe.reportingProfiles,areas),reportingDaily:(safe.reportingDaily||[]).filter(row=>areaAllowed(row)&&(!row.profileId||profileIds.has(row.profileId))),stockLedgers:filterArea(safe.stockLedgers,areas),coachingRecords:filterArea(safe.coachingRecords,areas),picaRecords:filterArea(safe.picaRecords,areas),spgCandidates:[]});
  }
  const own=row=>row.userId===user.id||row.markedById===user.id||row.userName===user.name||row.markedBy===user.name;
  return {...safe,sessions:[],trash:[],activityLog:[],changeLog:[],users:(safe.users||[]).filter(row=>row.id===user.id),areas:filterArea(safe.areas,areas),outlets:(safe.outlets||[]).filter(own),placementLocations:filterArea(safe.placementLocations,areas),spgAssignments:(safe.spgAssignments||[]).filter(own),routes:[],workShifts:[],offlineQueue:[],reportingLocks:[],reportingProfiles:[],reportingDaily:[],stockLedgers:[],coachingRecords:[],picaRecords:[],spgCandidates:[]};
}

function activity(data,type,summary,actor,role='',at=new Date().toISOString()){
  data.activityLog=[{id:id('activity'),at,type,summary,actor,role},...(data.activityLog||[])].slice(0,500);
}
function notify(data,{userId='',roles=[],area='',title,message,type='info',link='',now=Date.now()}){
  data.notifications=[{id:id('notice',now),userId,roles,area,title,message,type,link,createdAt:iso(now),readBy:[]},...(data.notifications||[])].slice(0,1000);
}
function change(data,{collection,recordId='',action='UBAH',actor,scope='operational',before=null,after=null,now=Date.now()}){
  data.changeLog=[{id:id('change',now),at:iso(now),collection,recordId,action,actor:{id:actor?.id||'',name:actor?.name||'',role:actor?.role||''},scope,before:sanitizeValue(before),after:sanitizeValue(after)},...(data.changeLog||[])].slice(0,1000);
}
export function registerLoginFailure(source,email,device='Perangkat tidak diketahui',now=Date.now()){
  const data=normalizeStoredData(source),user=(data.users||[]).find(item=>String(item.email||'').toLowerCase()===String(email||'').toLowerCase());
  if(!user)return {data,user:null,locked:false};
  const security=defaultSecurity(data),limit=Math.max(3,Math.min(10,Number(security.maxLoginAttempts||5))),minutes=Math.max(5,Math.min(60,Number(security.accountLockMinutes||15)));
  user.failedLoginCount=Math.max(0,Number(user.failedLoginCount||0))+1;
  let locked=false;
  if(user.failedLoginCount>=limit){
    user.failedLoginCount=0;user.blockedUntil=iso(now+minutes*60*1000);locked=true;
    notify(data,{roles:['ADMIN'],title:'Akun terkunci',message:`Akun ${user.name} dikunci sementara setelah beberapa kali gagal login dari ${device}.`,type:'warning',link:'dashboard',now});
  }
  activity(data,locked?'AKUN_TERKUNCI':'LOGIN_GAGAL',locked?`Akun ${user.name} dikunci ${minutes} menit.`:`Percobaan login gagal untuk ${user.name}.`,device,user.role,iso(now));
  return {data,user,locked,minutes};
}
export function registerLoginSuccess(source,userId,device='Perangkat tidak diketahui',now=Date.now()){
  const data=normalizeStoredData(source),user=(data.users||[]).find(item=>item.id===userId);if(!user)return {data,user:null,session:null};
  const previous=(data.sessions||[]).filter(row=>row.userId===user.id&&row.active!==false&&Number(new Date(row.expiresAt||0))>now);
  const knownDevice=previous.some(row=>row.device===device);
  const minutes=defaultSecurity(data).sessionMinutes;
  const session={id:id('session',now),userId:user.id,userName:user.name,role:user.role,device,createdAt:iso(now),lastSeenAt:iso(now),expiresAt:iso(now+minutes*60*1000),active:true};
  data.sessions=[session,...(data.sessions||[]).map(row=>Number(new Date(row.expiresAt||0))<=now?{...row,active:false}:row)].slice(0,500);
  if(previous.length&&!knownDevice)notify(data,{userId:user.id,title:'Login dari perangkat baru',message:`Akun ${user.name} masuk melalui ${device}. Jika bukan Anda, segera keluarkan perangkat tersebut.`,type:'warning',link:user.role==='ADMIN'?'setting':'',now});
  user.failedLoginCount=0;user.blockedUntil='';user.lastLoginAt=iso(now);user.lastLoginDevice=device;
  activity(data,'LOGIN_BERHASIL',`${user.name} berhasil masuk.`,user.name,user.role,user.lastLoginAt);
  return {data,user,session};
}
export function touchSession(source,sessionId,now=Date.now()){
  const data=normalizeStoredData(source),session=data.sessions.find(row=>row.id===sessionId&&row.active!==false&&Number(new Date(row.expiresAt||0))>now);
  if(!session)return {data,session:null};
  session.lastSeenAt=iso(now);return {data,session};
}
export function revokeSession(source,sessionId,actor,now=Date.now()){
  const data=normalizeStoredData(source),session=data.sessions.find(row=>row.id===sessionId);
  if(!session)return data;
  session.active=false;session.revokedAt=iso(now);session.revokedBy=actor?.name||'Admin';
  activity(data,'SESI_DIKELUARKAN',`Sesi ${session.userName||session.userId} dikeluarkan dari ${session.device}.`,actor?.name||'Admin',actor?.role||'ADMIN',iso(now));
  change(data,{collection:'sessions',recordId:session.id,action:'KELUARKAN',actor,scope:'admin',before:{active:true,device:session.device},after:{active:false,device:session.device},now});
  return data;
}
export function revokeUserSessions(source,userId,actor,exceptSessionId='',now=Date.now()){
  let data=normalizeStoredData(source);
  for(const session of data.sessions.filter(row=>row.userId===userId&&row.active!==false&&row.id!==exceptSessionId))data=revokeSession(data,session.id,actor,now);
  return data;
}
export function markNotificationRead(source,notificationId,userId){
  const data=normalizeStoredData(source),row=data.notifications.find(item=>item.id===notificationId);
  if(row&&!(row.readBy||[]).includes(userId))row.readBy=[...(row.readBy||[]),userId];
  return data;
}
export function markAllNotificationsRead(source,user){
  const data=normalizeStoredData(source);
  for(const row of data.notifications||[]){
    if(notificationForUser(row,user)&&!(row.readBy||[]).includes(user.id))row.readBy=[...(row.readBy||[]),user.id];
  }
  return data;
}
export function createAnnouncement(source,payload,actor,now=Date.now()){
  const data=normalizeStoredData(source);
  notify(data,{roles:Array.isArray(payload.roles)?payload.roles:[],area:String(payload.area||''),title:String(payload.title||'Pemberitahuan').slice(0,100),message:String(payload.message||'').slice(0,600),type:String(payload.type||'info'),now});
  activity(data,'NOTIFIKASI_DIBUAT',`Notifikasi “${String(payload.title||'Pemberitahuan').slice(0,100)}” dibuat.`,actor.name,actor.role,iso(now));
  return data;
}
export function moveUserToTrash(source,userId,actor,now=Date.now()){
  const data=normalizeStoredData(source),index=data.users.findIndex(row=>row.id===userId);
  if(index<0)return data;
  const [record]=data.users.splice(index,1);
  data.sessions=data.sessions.map(row=>row.userId===userId?{...row,active:false,revokedAt:iso(now),revokedBy:actor.name}:row);
  data.trash=[{id:id('trash',now),kind:'user',recordId:record.id,label:record.name,record,deletedAt:iso(now),deletedBy:actor.name},...(data.trash||[])].slice(0,300);
  change(data,{collection:'users',recordId:record.id,action:'PINDAH_KE_SAMPAH',actor,scope:'admin',before:record,after:null,now});
  return data;
}
export function restoreTrashItem(source,trashId,actor,now=Date.now()){
  const data=normalizeStoredData(source),index=data.trash.findIndex(row=>row.id===trashId);
  if(index<0)return data;
  const [item]=data.trash.splice(index,1);
  if(item.kind==='user'&&!data.users.some(row=>row.id===item.record.id))data.users.push(item.record);
  change(data,{collection:item.kind==='user'?'users':item.kind,recordId:item.recordId,action:'PULIHKAN',actor,scope:'admin',before:null,after:item.record,now});
  return data;
}

export function accountIsLocked(user,now=Date.now()){return Number(new Date(user?.blockedUntil||0))>now;}
async function mergeUsers(current,incoming,allowedRoles=null){
  const previous=current||[],rows=Array.isArray(incoming)?incoming:[];
  const byId=new Map(previous.map(user=>[user.id,user]));
  const incomingIds=new Set();
  for(const row of rows){
    const existing=byId.get(row.id)||(previous.find(user=>user.email===row.email));
    const existingRole=String(existing?.role||'').toUpperCase();
    const role=String(row.role||existing?.role||'SPG').toUpperCase();
    if(allowedRoles&&((existing&&!allowedRoles.includes(existingRole))||!allowedRoles.includes(role)))continue;
    const next={...(existing||{}),...row,role,mustChangePassword:false};
    if(row.password)next.passwordHash=hashPassword(row.password);
    if(!['ADMIN','TL'].includes(role)){next.mfaEnabled=false;delete next.mfaSecret;}
    delete next.password;
    byId.set(next.id,next);incomingIds.add(next.id);
  }
  if(allowedRoles)return [...byId.values()];
  return [...byId.values()].filter(user=>incomingIds.has(user.id));
}
function mergeSpgOutlets(current,incoming,user,now=Date.now()){
  const own=row=>row.userId===user.id||row.markedById===user.id||row.userName===user.name||row.markedBy===user.name;
  const areas=userAreas(user);
  const result=(current||[]).map(clone),index=new Map(result.map((row,position)=>[row.id,position]));
  for(const row of Array.isArray(incoming)?incoming:[]){
    if(!own(row,user))continue;
    if(areas&&!areas.includes(row.area)){const error=new Error('SPG hanya dapat mencatat outlet pada area tugasnya.');error.status=403;throw error;}
    const position=index.get(row.id);
    if(position===undefined){result.push({...clone(row),markedById:user.id,markedBy:user.name});index.set(row.id,result.length-1);continue;}
    const existing=result[position],editable=['name','tanda','sold','phone','notes','customFields'];
    if(!own(existing,user)){const error=new Error('SPG hanya dapat memperbaiki data miliknya sendiri.');error.status=403;throw error;}
    const changed=editable.some(key=>JSON.stringify(existing[key]??null)!==JSON.stringify(row[key]??null));
    if(changed&&now-new Date(existing.markedAt||0).getTime()>SPG_CORRECTION_MS){const error=new Error('Waktu perbaikan data SPG sudah berakhir. Hubungi TL.');error.status=403;throw error;}
    const updates={};for(const key of editable)if(Object.prototype.hasOwnProperty.call(row,key))updates[key]=clone(row[key]);
    result[position]={...existing,...updates,markedById:user.id,markedBy:user.name};
  }
  return result;
}
function logCollectionChanges(data,before,after,key,actor,scope='operational',now=Date.now()){
  const previous=new Map((before||[]).map(row=>[row.id,row])),next=new Map((after||[]).map(row=>[row.id,row]));
  for(const [recordId,row] of next){
    const old=previous.get(recordId);
    if(!old)change(data,{collection:key,recordId,action:'TAMBAH',actor,scope,before:null,after:row,now});
    else if(JSON.stringify(old)!==JSON.stringify(row))change(data,{collection:key,recordId,action:'UBAH',actor,scope,before:old,after:row,now});
  }
  for(const [recordId,row] of previous)if(!next.has(recordId))change(data,{collection:key,recordId,action:'HAPUS',actor,scope,before:row,after:null,now});
}
function reportingPeriod(value=''){return String(value||'').slice(0,7);}
function reportingLockMatches(lock,row){
  if(!lock||!row||reportingPeriod(lock.period)!==reportingPeriod(row.date))return false;
  const area=String(lock.area||'Semua'),spg=String(lock.spg||'Semua');
  return (area==='Semua'||area===String(row.area||''))
    &&(spg==='Semua'||spg===String(row.profileId||'')||spg===String(row.spg||''));
}
function assertReportingDailyUnlocked(source,incoming){
  const locks=source.reportingLocks||[];
  if(!locks.length)return;
  const before=new Map((source.reportingDaily||[]).map(row=>[row.id,row]));
  const after=new Map((incoming||[]).map(row=>[row.id,row]));
  const recordIds=new Set([...before.keys(),...after.keys()]);
  for(const recordId of recordIds){
    const previous=before.get(recordId),next=after.get(recordId);
    if(JSON.stringify(previous??null)===JSON.stringify(next??null))continue;
    const row=next||previous,lock=locks.find(item=>reportingLockMatches(item,row));
    if(lock){
      const error=new Error(`Periode ${lock.period} sudah dikunci. Buka kunci terlebih dahulu jika data perlu diperbaiki.`);
      error.status=423;throw error;
    }
  }
}
export function toggleReportingLock(source,payload,user,now=Date.now()){
  if(String(user?.role||'').toUpperCase()!=='TL'){
    const error=new Error('Penguncian periode hanya dapat dilakukan oleh TL.');error.status=403;throw error;
  }
  const data=normalizeStoredData(source),period=String(payload?.period||'').slice(0,7),area=String(payload?.area||'Semua'),spg=String(payload?.spg||'Semua');
  if(!/^\d{4}-\d{2}$/.test(period)){
    const error=new Error('Pilih periode laporan yang benar.');error.status=400;throw error;
  }
  const index=data.reportingLocks.findIndex(row=>String(row.period)===period&&String(row.area||'Semua')===area&&String(row.spg||'Semua')===spg);
  let locked=false;
  if(index>=0){
    const [removed]=data.reportingLocks.splice(index,1);
    change(data,{collection:'reportingLocks',recordId:removed.id,action:'BUKA_KUNCI',actor:user,scope:'operational',before:removed,after:null,now});
  }else{
    const row={id:id('lock',now),period,area,spg,lockedAt:iso(now),lockedBy:user.name,lockedById:user.id};
    data.reportingLocks.unshift(row);locked=true;
    change(data,{collection:'reportingLocks',recordId:row.id,action:'KUNCI',actor:user,scope:'operational',before:null,after:row,now});
  }
  const scopeText=`${period} • ${area}${spg!=='Semua'?` • ${spg}`:''}`;
  activity(data,locked?'PERIODE_DIKUNCI':'PERIODE_DIBUKA',`${locked?'Mengunci':'Membuka kunci'} laporan ${scopeText}.`,user.name,user.role,iso(now));
  notify(data,{roles:['SCO','MS','AM'],area:area==='Semua'?'':area,title:locked?'Periode laporan dikunci':'Periode laporan dibuka',message:`${scopeText} ${locked?'sudah dikunci':'dapat diperbarui kembali'} oleh ${user.name}.`,type:locked?'approval':'info',link:'reportingSpg',now});
  return {data,locked};
}
export function reviewReceiptRecord(source,payload,user,now=Date.now()){
  if(String(user?.role||'').toUpperCase()!=='TL'){
    const error=new Error('Pemeriksaan nota hanya dapat dilakukan oleh TL.');error.status=403;throw error;
  }
  const data=normalizeStoredData(source),row=data.reportingDaily.find(item=>item.id===payload?.reportId||item.receiptId&&item.receiptId===payload?.receiptId);
  if(!row){const error=new Error('Data nota tidak ditemukan.');error.status=404;throw error;}
  const statuses=['Belum Diperiksa','Sesuai','Perlu Perbaikan','Ditolak'],status=String(payload?.status||'');
  if(!statuses.includes(status)){const error=new Error('Status pemeriksaan nota tidak valid.');error.status=400;throw error;}
  const before=clone(row);
  row.receiptStatus=status;row.receiptReviewNote=String(payload?.note||'').trim().slice(0,500);row.receiptReviewedAt=iso(now);row.receiptReviewedBy=user.name;row.receiptReviewedById=user.id;
  change(data,{collection:'reportingDaily',recordId:row.id,action:'PERIKSA_NOTA',actor:user,scope:'operational',before,after:row,now});
  activity(data,'NOTA_DIPERIKSA',`Nota ${row.spg||row.profileId||row.id} ditandai “${status}”.`,user.name,user.role,iso(now));
  notify(data,{roles:['SCO','MS','AM'],area:row.area||'',title:'Status nota diperbarui',message:`Nota ${row.spg||'SPG'} tanggal ${row.date||'-'}: ${status}.`,type:status==='Sesuai'?'success':'warning',link:'receiptRecap',now});
  return data;
}
function addPlacementNotifications(data,before,after,now=Date.now()){
  const previous=new Map((before||[]).map(row=>[row.id,row]));
  for(const row of after||[]){
    const old=previous.get(row.id);
    if(old&&JSON.stringify([old.date,old.locationId,old.area])===JSON.stringify([row.date,row.locationId,row.area]))continue;
    const location=(data.placementLocations||[]).find(item=>item.id===row.locationId);
    notify(data,{userId:row.userId,title:'Penempatan SPG diperbarui',message:`${row.date}: ${location?.name||'Lokasi tugas'} — ${location?.address||row.area||'alamat belum diisi'}.`,type:'placement',link:'spgHome',now});
  }
}
export async function mergeClientData(current,payload,user,now=Date.now()){
  const source=normalizeStoredData(current),next=clone(source),role=String(user.role||'').toUpperCase();
  if(role==='ADMIN'){
    next.users=await mergeUsers(source.users,payload.users);
    if(Array.isArray(payload.areas)){
      next.areas=normalizeStoredData({...source,areas:payload.areas}).areas;
      logCollectionChanges(next,source.areas,next.areas,'areas',user,'admin',now);
    }
    next.settings={...(source.settings||{}),...(payload.settings||{}),dataVariant:source.settings?.dataVariant||source.seedMode||'clean'};
    const byActivity=new Map([...(payload.activityLog||[]),...(source.activityLog||[])].map(item=>[item.id||`${item.at}|${item.summary}`,item]));
    next.activityLog=[...byActivity.values()].sort((a,b)=>String(b.at||'').localeCompare(String(a.at||''))).slice(0,500);
    logCollectionChanges(next,source.users,next.users,'users',user,'admin',now);
    if(JSON.stringify(source.settings)!==JSON.stringify(next.settings))change(next,{collection:'settings',recordId:'system',action:'UBAH',actor:user,scope:'admin',before:source.settings,after:next.settings,now});
  }else if(role==='TL'){
    if(Array.isArray(payload.reportingDaily))assertReportingDailyUnlocked(source,payload.reportingDaily);
    for(const key of TL_MUTABLE_OPERATIONAL)if(Array.isArray(payload[key])){
      next[key]=key==='reportingDaily'
        ? payload[key].map(({receiptData,notaData,...row})=>clone(row))
        : clone(payload[key]);
      logCollectionChanges(next,source[key],next[key],key,user,'operational',now);
    }
    next.users=await mergeUsers(source.users,payload.users,['SPG']);
    next.settings={...(source.settings||{}),systemControl:clone(payload.settings?.systemControl||source.settings?.systemControl||{}),auditLog:clone(payload.settings?.auditLog||source.settings?.auditLog||[]),systemVersions:clone(payload.settings?.systemVersions||source.settings?.systemVersions||[]),dataVariant:source.settings?.dataVariant||source.seedMode||'clean'};
    next.reportingConfig=clone(payload.reportingConfig||source.reportingConfig||{});
    next.reportingConfig.defaultSellingPrice=source.settings.hargaPerPcs;
    addPlacementNotifications(next,source.spgAssignments,next.spgAssignments,now);
    logCollectionChanges(next,source.users,next.users,'users',user,'operational',now);
  }else if(role==='SPG'){
    next.outlets=mergeSpgOutlets(source.outlets,payload.outlets,user,now);
    logCollectionChanges(next,source.outlets,next.outlets,'outlets',user,'operational',now);
  }else{
    const error=new Error('Akun monitoring hanya dapat melihat dan mengekspor data.');error.status=403;throw error;
  }
  COLLECTIONS.forEach(key=>{if(!Array.isArray(next[key]))next[key]=[];});
  next.revision=Number(source.revision||0)+1;next.updatedAt=iso(now);next.updatedBy={id:user.id,name:user.name,role:user.role};
  return pruneExpiredRoutes(next,now);
}

export function pruneExpiredRoutes(source,now=Date.now()){
  const data=normalizeStoredData(source),days=defaultSecurity(data).routeRetentionDays,cutoff=now-days*86400000;
  data.routes=(data.routes||[]).filter(route=>Number(new Date(route.date||route.updatedAt||route.startedAt||0))>=cutoff);
  return data;
}
export function appendRoutePoint(source,payload,user){
  if(String(user?.role||'').toUpperCase()!=='SPG'){const error=new Error('Titik perjalanan hanya dapat dikirim oleh akun SPG.');error.status=403;throw error;}
  const lat=Number(payload?.lat),lng=Number(payload?.lng),accuracy=Math.max(0,Number(payload?.accuracy||0));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){const error=new Error('Titik lokasi tidak valid.');error.status=400;throw error;}
  const data=pruneExpiredRoutes(source),at=payload.recordedAt||new Date().toISOString(),date=String(payload.date||at).slice(0,10);
  let route=data.routes.find(item=>item.userId===user.id&&item.date===date);
  if(!route){route={id:`route-${user.id}-${date}`,userId:user.id,userName:user.name,area:user.area||'',date,startedAt:at,endedAt:'',status:'Aktif',totalDistanceM:0,points:[]};data.routes.push(route);}
  route.points=Array.isArray(route.points)?route.points:[];
  const last=route.points[route.points.length-1],duplicate=last&&String(last.at)===String(at)&&Number(last.lat)===lat&&Number(last.lng)===lng;
  if(!duplicate)route.points.push({lat,lng,accuracy,at});
  route.points=route.points.slice(-5000);route.updatedAt=at;data.updatedAt=at;
  return data;
}

export function createChangeLogEntry(source,details){const data=normalizeStoredData(source);change(data,details);return data;}
