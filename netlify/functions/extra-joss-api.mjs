import seed from './_shared/seed.mjs';
import { createStorageAdapter } from './_shared/storage-adapter.mjs';
import {
  accountIsLocked, appendRoutePoint, createAnnouncement, createChangeLogEntry, createSecret,
  markAllNotificationsRead, markNotificationRead, mergeClientData, moveUserToTrash,
  normalizeStoredData, prepareSeed, registerLoginFailure, registerLoginSuccess,
  restoreTrashItem, reviewReceiptRecord, revokeSession, revokeUserSessions, scopeData,
  signSession, toggleReportingLock, touchSession, verifyPassword, verifySession, verifyTotp
} from './_shared/core.mjs';

const VARIANT=seed.seedMode==='demo'?'demo':'clean';
const DATA_KEY=`shared-data-v22-${VARIANT}`;
const LEGACY_DATA_KEY=`shared-data-v18-${VARIANT}`;
const SECRET_KEY='session-secret-v22';
const LEGACY_SECRET_KEY='session-secret-v18';
const BACKUP_INDEX_KEY=`backup-index-v22-${VARIANT}`;
const storage=createStorageAdapter({variant:VARIANT});
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','content-type':'application/json; charset=utf-8'}});

async function loadData(){
  let data=await storage.getJson(DATA_KEY);
  if(data)return normalizeStoredData(data);

  // First activation of Supabase: import the CURRENT production dataset from
  // Netlify Blobs v22, never the older v18 snapshot. This is a one-time bootstrap
  // and uses onlyIfNew so an existing Supabase dataset is never overwritten here.
  if(storage.supabaseConfigured){
    const currentNetlify=await storage.getJson(DATA_KEY,{legacy:true}).catch(()=>null);
    if(currentNetlify){
      const imported=normalizeStoredData(currentNetlify);
      imported.settings=imported.settings||{};
      imported.settings.dataVariant=VARIANT;
      imported.settings.storageMigration={
        source:'netlify-blobs-v22',
        target:'supabase',
        mode:'bootstrap-current-production',
        migratedAt:new Date().toISOString()
      };
      await storage.setJson(DATA_KEY,imported,{onlyIfNew:true});
      data=await storage.getJson(DATA_KEY)||imported;
      return normalizeStoredData(data);
    }
  }

  // Fallback for genuinely empty storage: preserve the previous seed/legacy behavior.
  const legacy=await storage.getJson(LEGACY_DATA_KEY,{legacy:true});
  const initial=legacy?normalizeStoredData(legacy):await prepareSeed(seed);
  initial.settings=initial.settings||{};
  initial.settings.dataVariant=VARIANT;
  initial.settings.storageMigration={source:legacy?'netlify-blobs-v18':'seed-v22',target:storage.mode,migratedAt:new Date().toISOString()};
  await storage.setJson(DATA_KEY,initial,{onlyIfNew:true});
  data=await storage.getJson(DATA_KEY)||initial;
  return normalizeStoredData(data);
}
async function saveData(data){await storage.setJson(DATA_KEY,normalizeStoredData(data));}
async function sessionSecret(){
  let secret=await storage.getText(SECRET_KEY);
  if(secret)return secret;
  secret=await storage.getText(LEGACY_SECRET_KEY,{legacy:true})||createSecret();
  await storage.setText(SECRET_KEY,secret,{onlyIfNew:true});
  return await storage.getText(SECRET_KEY)||secret;
}
function bump(data,user,now=Date.now()){
  data.revision=Number(data.revision||0)+1;data.updatedAt=new Date(now).toISOString();
  data.updatedBy={id:user?.id||'',name:user?.name||'Sistem',role:user?.role||'SYSTEM'};
  return data;
}
async function sessionContext(request,data){
  const token=String(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  const signed=verifySession(token,await sessionSecret());
  if(!signed?.sid)return null;
  const touched=touchSession(data,signed.sid);
  if(!touched.session||touched.session.userId!==signed.sub)return null;
  const user=(touched.data.users||[]).find(item=>item.id===signed.sub&&item.status!=='Nonaktif');
  if(!user)return null;
  return {user,session:touched.session,data:touched.data};
}
async function backupIndex(){return await storage.getJson(BACKUP_INDEX_KEY)||[];}
async function writeBackupIndex(rows){await storage.setJson(BACKUP_INDEX_KEY,rows.slice(0,45));}
async function createBackup(data,actor='Sistem',kind='manual',now=Date.now()){
  const index=await backupIndex(),day=new Date(now).toISOString().slice(0,10);
  if(kind==='otomatis'&&index.some(item=>item.kind==='otomatis'&&item.day===day))return index.find(item=>item.kind==='otomatis'&&item.day===day)||index[0]||null;
  const key=`backup-v22-${VARIANT}-${new Date(now).toISOString().replace(/[:.]/g,'-')}`;
  await storage.setJson(key,normalizeStoredData(data));
  const row={key,day,kind,createdAt:new Date(now).toISOString(),createdBy:actor,revision:Number(data.revision||1),users:(data.users||[]).length,outlets:(data.outlets||[]).length,reports:(data.reportingDaily||[]).length,receipts:(data.reportingDaily||[]).filter(item=>item.receiptId).length};
  await writeBackupIndex([row,...index]);return row;
}
async function beforeMutation(data,user){await createBackup(data,user?.name||'Sistem','otomatis');}
function requireAdmin(user){if(user.role!=='ADMIN'){const error=new Error('Fitur ini hanya dapat digunakan Admin.');error.status=403;throw error;}}
function requireTl(user,message='Fitur ini hanya dapat digunakan TL.'){if(user.role!=='TL'){const error=new Error(message);error.status=403;throw error;}}

async function systemHealth(data){
  const started=Date.now();let connection={ok:false,mode:storage.mode,latencyMs:0,error:''};
  try{connection=await storage.ping();}catch(error){connection={ok:false,mode:storage.mode,latencyMs:Date.now()-started,error:error?.message||'Penyimpanan tidak merespons.'};}
  const backups=await backupIndex().catch(()=>[]),now=Date.now();
  const activeSessions=(data.sessions||[]).filter(row=>row.active!==false&&Number(new Date(row.expiresAt||0))>now);
  const receiptRows=(data.reportingDaily||[]).filter(row=>row.receiptId);
  const statusCount=status=>receiptRows.filter(row=>(row.receiptStatus||'Belum Diperiksa')===status).length;
  return {
    ok:connection.ok,version:'23.0.0',storage:storage.mode,receiptStorage:storage.receiptStorage,
    supabaseConfigured:storage.supabaseConfigured,latencyMs:connection.latencyMs,error:connection.error||'',
    dataVariant:VARIANT,revision:Number(data.revision||1),updatedAt:data.updatedAt||'',updatedBy:data.updatedBy||null,
    counts:{accounts:(data.users||[]).length,activeAccounts:(data.users||[]).filter(row=>row.status!=='Nonaktif').length,activeSessions:activeSessions.length,lockedAccounts:(data.users||[]).filter(row=>accountIsLocked(row)).length,reports:(data.reportingDaily||[]).length,receipts:receiptRows.length,pendingReceipts:statusCount('Belum Diperiksa'),receiptIssues:statusCount('Perlu Perbaikan')+statusCount('Ditolak')},
    backup:{latest:backups[0]||null,total:backups.length},migration:data.settings?.storageMigration||null
  };
}

export default async function handler(request){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{allow:'GET, POST, OPTIONS'}});
  try{
    const url=new URL(request.url),action=url.searchParams.get('action')||'';
    let data=await loadData();
    if(request.method==='GET'&&action==='health')return json({ok:true,dynamic:true,storage:storage.mode,version:'23.0.0',supabaseConfigured:storage.supabaseConfigured,dataVariant:VARIANT});
    if(request.method==='POST'&&action==='login'){
      const body=await request.json().catch(()=>({})),email=String(body.email||'').trim().toLowerCase();
      let user=(data.users||[]).find(item=>String(item.email||'').toLowerCase()===email&&item.status!=='Nonaktif');
      const device=String(request.headers.get('user-agent')||'Perangkat tidak diketahui').slice(0,160);
      if(user&&accountIsLocked(user))return json({ok:false,error:`Akun dikunci sementara sampai ${new Date(user.blockedUntil).toLocaleString('id-ID')}. Hubungi Admin bila perlu dibuka lebih cepat.`},423);
      if(!user||!verifyPassword(body.password,user.passwordHash)){
        if(user){const failed=registerLoginFailure(data,email,device);data=failed.data;await saveData(data);if(failed.locked)return json({ok:false,error:`Terlalu banyak percobaan. Akun dikunci ${failed.minutes} menit.`},423);}
        return json({ok:false,error:'Email atau password salah.'},401);
      }
      if(user.mfaEnabled){
        if(!body.verificationCode)return json({ok:false,mfaRequired:true,error:'Masukkan 6 angka verifikasi dari aplikasi Authenticator.'},428);
        if(!verifyTotp(user.mfaSecret,body.verificationCode)){
          const failed=registerLoginFailure(data,email,device);data=failed.data;await saveData(data);
          return json({ok:false,mfaRequired:true,error:'Kode verifikasi tidak sesuai atau sudah kedaluwarsa.'},401);
        }
      }
      const success=registerLoginSuccess(data,user.id,device);data=success.data;user=success.user;await saveData(data);
      const exp=Number(new Date(success.session.expiresAt)),token=signSession({sub:user.id,role:user.role,sid:success.session.id,exp},await sessionSecret());
      return json({ok:true,token,sessionId:success.session.id,user:scopeData({users:[user]},user).users[0],data:scopeData(data,user),revision:data.revision||1});
    }

    const context=await sessionContext(request,data);
    if(!context)return json({ok:false,error:'Sesi login berakhir atau sudah dikeluarkan. Silakan masuk kembali.'},401);
    ({data}=context);const {user,session}=context;

    if(request.method==='GET'&&action==='data')return json({ok:true,data:scopeData(data,user),revision:data.revision||1,sessionId:session.id});
    if(request.method==='GET'&&action==='system-health'){requireAdmin(user);return json({ok:true,health:await systemHealth(data)});}
    if(request.method==='POST'&&action==='logout'){
      data=bump(revokeSession(data,session.id,user),user);await saveData(data);return json({ok:true});
    }
    if(request.method==='POST'&&action==='logout-all'){
      const body=await request.json().catch(()=>({})),target=user.role==='ADMIN'&&body.userId?String(body.userId):user.id;
      data=bump(revokeUserSessions(data,target,user,'',Date.now()),user);await saveData(data);return json({ok:true});
    }
    if(request.method==='POST'&&action==='revoke-session'){
      requireAdmin(user);const body=await request.json().catch(()=>({}));
      data=bump(revokeSession(data,String(body.sessionId||''),user),user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='mark-notification-read'){
      const body=await request.json().catch(()=>({}));data=markNotificationRead(data,String(body.notificationId||''),user.id);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='mark-all-notifications-read'){
      data=markAllNotificationsRead(data,user);await saveData(data);return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='announcement'){
      requireAdmin(user);const body=await request.json().catch(()=>({}));await beforeMutation(data,user);
      data=bump(createAnnouncement(data,body,user),user);await saveData(data);return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='toggle-period-lock'){
      requireTl(user,'Penguncian periode hanya dapat dilakukan TL.');const body=await request.json().catch(()=>({}));await beforeMutation(data,user);
      const result=toggleReportingLock(data,body,user);data=bump(result.data,user);await saveData(data);
      return json({ok:true,locked:result.locked,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='review-receipt'){
      requireTl(user,'Pemeriksaan nota hanya dapat dilakukan TL.');const body=await request.json().catch(()=>({}));await beforeMutation(data,user);
      data=bump(reviewReceiptRecord(data,body,user),user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='mfa-config'){
      requireAdmin(user);const body=await request.json().catch(()=>({})),target=data.users.find(row=>row.id===body.userId);
      if(!target||!['ADMIN','TL'].includes(target.role))return json({ok:false,error:'Verifikasi tambahan hanya tersedia untuk Admin dan TL.'},400);
      await beforeMutation(data,user);const before={mfaEnabled:Boolean(target.mfaEnabled)};
      if(body.enabled){const secret=String(body.secret||'').replace(/[^A-Z2-7]/gi,'').toUpperCase();if(secret.length<16)return json({ok:false,error:'Kunci verifikasi belum valid.'},400);target.mfaSecret=secret;target.mfaEnabled=true;}
      else{target.mfaEnabled=false;delete target.mfaSecret;}
      data=createChangeLogEntry(data,{collection:'users',recordId:target.id,action:'MFA',actor:user,scope:'admin',before,after:{mfaEnabled:target.mfaEnabled}});
      data=bump(revokeUserSessions(data,target.id,user,session.id),user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='trash-user'){
      requireAdmin(user);const body=await request.json().catch(()=>({}));if(body.userId===user.id)return json({ok:false,error:'Akun yang sedang dipakai tidak dapat dipindahkan ke sampah.'},400);
      await beforeMutation(data,user);data=bump(moveUserToTrash(data,String(body.userId||''),user),user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='restore-trash'){
      requireAdmin(user);const body=await request.json().catch(()=>({}));await beforeMutation(data,user);
      data=bump(restoreTrashItem(data,String(body.trashId||''),user),user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='GET'&&action==='backups'){requireAdmin(user);return json({ok:true,backups:await backupIndex()});}
    if(request.method==='POST'&&action==='create-backup'){
      requireAdmin(user);const backup=await createBackup(data,user.name,'manual');return json({ok:true,backup,backups:await backupIndex()});
    }
    if(request.method==='POST'&&action==='restore-backup'){
      requireAdmin(user);const body=await request.json().catch(()=>({})),index=await backupIndex(),row=index.find(item=>item.key===body.key);
      if(!row)return json({ok:false,error:'Cadangan tidak ditemukan.'},404);
      const restored=await storage.getJson(row.key);if(!restored)return json({ok:false,error:'Isi cadangan tidak ditemukan.'},404);
      await beforeMutation(data,user);const sessions=data.sessions;
      data=normalizeStoredData(restored);data.sessions=sessions;data=bump(data,user);await saveData(data);
      return json({ok:true,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='migrate-storage'){
      requireAdmin(user);const body=await request.json().catch(()=>({}));
      if(!storage.supabaseConfigured)return json({ok:false,error:'Supabase belum dihubungkan pada pengaturan environment Netlify.'},409);
      if(body.confirm!=='PINDAHKAN')return json({ok:false,error:'Ketik PINDAHKAN untuk menjalankan pemindahan data.'},400);

      // IMPORTANT: migrate the current production dataset (v22) from Netlify Blobs.
      // Create a rollback copy in Netlify Blobs before writing to Supabase.
      const currentNetlify=await storage.getJson(DATA_KEY,{legacy:true}).catch(()=>null);
      if(!currentNetlify)return json({ok:false,error:'Data Netlify v22 saat ini tidak ditemukan.'},404);
      const rollbackKey=`pre-supabase-${DATA_KEY}-${new Date().toISOString().replace(/[:.]/g,'-')}`;
      const legacyStoreBackup=await storage.getJson(DATA_KEY,{legacy:true}).catch(()=>null);
      const dataStoreBackup=legacyStoreBackup?normalizeStoredData(legacyStoreBackup):null;
      if(!dataStoreBackup)return json({ok:false,error:'Cadangan sumber Netlify gagal dibaca.'},500);
      await storage.setJsonLegacy(rollbackKey,dataStoreBackup,{onlyIfNew:true});
      await createBackup(data,user.name,'manual');

      const sessions=data.sessions;
      data=normalizeStoredData(dataStoreBackup);data.sessions=sessions;data.settings=data.settings||{};
      data.settings.storageMigration={
        source:'netlify-blobs-v22',
        target:'supabase',
        mode:'explicit-production-migration',
        migratedAt:new Date().toISOString(),
        migratedBy:user.name,
        sourceKey:DATA_KEY,
        rollbackKey
      };
      data=bump(data,user);await saveData(data);

      let receipts=0,receiptFailures=0;
      for(const row of data.reportingDaily||[]){
        if(!row.receiptId)continue;
        const sourceKey=`receipt-v22-${VARIANT}-${row.receiptId}`;
        let legacyFile=await storage.legacyReceipt(sourceKey).catch(()=>null);
        if(!legacyFile) legacyFile=await storage.legacyReceipt(`receipt-v21-${seed.seedMode}-${row.receiptId}`).catch(()=>null);
        if(legacyFile){
          try{await storage.saveReceipt(sourceKey,legacyFile,row.receiptType||'');receipts+=1;}
          catch{receiptFailures+=1;}
        }
      }

      let candidateFiles=0,candidateFileFailures=0;
      for(const row of data.spgCandidates||[]){
        const fileId=String(row.cvId||'').trim();
        if(!fileId)continue;
        const sourceKey=`candidate-v23-${VARIANT}-${fileId}`;
        const legacyFile=await storage.legacyCandidateFile(sourceKey).catch(()=>null);
        if(legacyFile){
          try{await storage.saveCandidateFile(sourceKey,legacyFile,row.cvType||'');candidateFiles+=1;}
          catch{candidateFileFailures+=1;}
        }
      }

      return json({ok:true,migrated:true,source:'netlify-blobs-v22',receipts,receiptFailures,candidateFiles,candidateFileFailures,rollbackKey,data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='sync-to-supabase'){
      if(!['ADMIN','TL'].includes(user.role))return json({ok:false,error:'Sinkronisasi Supabase hanya dapat dilakukan Admin atau TL.'},403);
      if(!storage.supabaseConfigured)return json({ok:false,error:'Supabase belum aktif. Admin perlu memasang SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY pada Environment variables Netlify.'},409);
      await createBackup(data,user.name,'manual');
      const before=data.settings?.lastSupabaseSync||null;
      data.settings=data.settings||{};
      data.settings.lastSupabaseSync={at:new Date().toISOString(),by:user.name,role:user.role,revision:Number(data.revision||1)};
      data=createChangeLogEntry(data,{collection:'settings',recordId:'supabase-sync',action:'SINKRONKAN',actor:user,scope:user.role==='ADMIN'?'admin':'operational',before,after:data.settings.lastSupabaseSync});
      data=bump(data,user);await saveData(data);
      return json({ok:true,syncedAt:data.settings.lastSupabaseSync.at,storage:storage.mode,health:await systemHealth(data),data:scopeData(data,user),revision:data.revision});
    }
    if(request.method==='POST'&&action==='route-point'){
      const body=await request.json().catch(()=>({})),next=appendRoutePoint(data,body,user);await saveData(next);
      return json({ok:true,stored:true,revision:next.revision||data.revision||1});
    }
    if(request.method==='POST'&&action==='upload-receipt'){
      requireTl(user,'Upload nota hanya dapat dilakukan TL.');
      const body=await request.json().catch(()=>({})),dataUrl=String(body.dataUrl||''),mimeType=String(body.mimeType||'').toLowerCase(),allowedTypes=['image/jpeg','image/png','image/webp','application/pdf'];
      if(!allowedTypes.includes(mimeType)||!dataUrl.startsWith(`data:${mimeType};base64,`))return json({ok:false,error:'Nota harus berupa JPG, PNG, WEBP, atau PDF.'},400);
      if(dataUrl.length>2_800_000)return json({ok:false,error:'Ukuran nota terlalu besar. Gunakan file di bawah 2 MB.'},413);
      const receiptId=`nota-${Date.now()}-${Math.random().toString(16).slice(2,10)}`,fileName=String(body.fileName||'nota').replace(/[\r\n]/g,' ').slice(0,140),key=`receipt-v22-${VARIANT}-${receiptId}`;
      const saved=await storage.saveReceipt(key,dataUrl,mimeType);
      return json({ok:true,receipt:{id:receiptId,fileName,mimeType,size:Math.max(0,Number(body.size||0)),uploadedAt:new Date().toISOString(),uploadedBy:user.name,status:'Belum Diperiksa',storage:saved.storage}});
    }
    if(request.method==='GET'&&action==='receipt-file'){
      if(!['TL','SCO','MS','AM'].includes(user.role))return json({ok:false,error:'Nota hanya dapat dilihat TL, SCO, MS, atau AM.'},403);
      const receiptId=String(url.searchParams.get('receiptId')||''),scoped=scopeData(data,user),record=(scoped.reportingDaily||[]).find(row=>row.receiptId===receiptId);
      if(!record)return json({ok:false,error:'Nota tidak ditemukan atau berada di luar area tugas.'},404);
      let dataUrl=await storage.loadReceipt(`receipt-v22-${VARIANT}-${receiptId}`,record.receiptType||'').catch(()=>null);
      if(!dataUrl)dataUrl=await storage.legacyReceipt(`receipt-v21-${seed.seedMode}-${receiptId}`).catch(()=>null);
      if(!dataUrl)return json({ok:false,error:'File nota tidak ditemukan.'},404);
      return json({ok:true,dataUrl,fileName:record.receiptName||'nota',mimeType:record.receiptType||''});
    }
    if(request.method==='POST'&&action==='upload-candidate-cv'){
      requireTl(user,'Upload CV kandidat hanya dapat dilakukan TL.');
      const body=await request.json().catch(()=>({})),dataUrl=String(body.dataUrl||''),mimeType=String(body.mimeType||'').toLowerCase(),allowedTypes=['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if(!allowedTypes.includes(mimeType)||!dataUrl.startsWith(`data:${mimeType};base64,`))return json({ok:false,error:'CV harus berupa PDF, JPG, PNG, WEBP, DOC, atau DOCX.'},400);
      if(dataUrl.length>8_500_000)return json({ok:false,error:'Ukuran CV terlalu besar. Gunakan file di bawah 6 MB.'},413);
      const fileId=`cv-${Date.now()}-${Math.random().toString(16).slice(2,10)}`,fileName=String(body.fileName||'cv').replace(/[\r\n]/g,' ').slice(0,140),key=`candidate-v23-${VARIANT}-${fileId}`;
      const saved=await storage.saveCandidateFile(key,dataUrl,mimeType);
      return json({ok:true,file:{id:fileId,fileName,mimeType,size:Math.max(0,Number(body.size||0)),uploadedAt:new Date().toISOString(),uploadedBy:user.name,storage:saved.storage}});
    }
    if(request.method==='GET'&&action==='candidate-cv-file'){
      requireTl(user,'CV kandidat hanya dapat dilihat TL.');
      const fileId=String(url.searchParams.get('fileId')||''),record=(data.spgCandidates||[]).find(row=>row.cvId===fileId);
      if(!record)return json({ok:false,error:'CV kandidat tidak ditemukan.'},404);
      const dataUrl=await storage.loadCandidateFile(`candidate-v23-${VARIANT}-${fileId}`,record.cvType||'').catch(()=>null);
      if(!dataUrl)return json({ok:false,error:'File CV tidak ditemukan pada penyimpanan.'},404);
      return json({ok:true,dataUrl,fileName:record.cvName||`CV ${record.name||'Kandidat'}`,mimeType:record.cvType||''});
    }
    if(request.method==='POST'&&action==='data'){
      const body=await request.json().catch(()=>({}));
      if(Number(body.baseRevision||0)!==Number(data.revision||1))return json({ok:false,error:'Data sudah berubah di perangkat lain. Muat ulang halaman sebelum menyimpan kembali.',revision:data.revision||1},409);
      await beforeMutation(data,user);const next=await mergeClientData(data,body.data||{},user);await saveData(next);
      return json({ok:true,revision:next.revision,data:scopeData(next,user)});
    }
    return json({ok:false,error:'Permintaan tidak dikenali.'},404);
  }catch(error){
    console.error('extra-joss-api',error);
    return json({ok:false,error:error?.message||'Server belum dapat memproses data.'},Number(error?.status||500));
  }
}
