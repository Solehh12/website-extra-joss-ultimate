(function(){
  const API='/.netlify/functions/extra-joss-api',TOKEN_KEY='extra_joss_server_session_v22',SESSION_KEY='extra_joss_server_session_id_v22';
  let token=localStorage.getItem(TOKEN_KEY)||'',sessionId=localStorage.getItem(SESSION_KEY)||'',revision=0;
  async function request(action,options={}){
    const query=new URLSearchParams({action});Object.entries(options.query||{}).forEach(([key,value])=>query.set(key,String(value)));
    const response=await fetch(`${API}?${query.toString()}`,{
      method:options.method||'GET',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},
      body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'
    });
    const result=await response.json().catch(()=>({ok:false,error:'Jawaban server tidak dapat dibaca.'}));
    if(!response.ok||result.ok===false){if(response.status===401&&!result.mfaRequired)clear();const error=new Error(result.error||`Server menjawab ${response.status}.`);error.status=response.status;error.revision=result.revision;error.mfaRequired=Boolean(result.mfaRequired);throw error;}
    if(result.revision)revision=Number(result.revision);return result;
  }
  async function health(){return request('health');}
  async function login(email,password,verificationCode=''){const result=await request('login',{method:'POST',body:{email,password,verificationCode}});token=result.token||'';sessionId=result.sessionId||'';if(token)localStorage.setItem(TOKEN_KEY,token);if(sessionId)localStorage.setItem(SESSION_KEY,sessionId);return result;}
  async function pull(){return request('data');}
  async function push(data){return request('data',{method:'POST',body:{data,baseRevision:revision}});}
  async function routePoint(point){return request('route-point',{method:'POST',body:point});}
  async function uploadReceipt(payload){return request('upload-receipt',{method:'POST',body:payload});}
  async function receiptFile(receiptId){return request('receipt-file',{query:{receiptId}});}
  async function uploadCandidateCv(payload){return request('upload-candidate-cv',{method:'POST',body:payload});}
  async function candidateCvFile(fileId){return request('candidate-cv-file',{query:{fileId}});}
  async function logout(){try{return await request('logout',{method:'POST'});}finally{clear();}}
  async function logoutAll(userId=''){const result=await request('logout-all',{method:'POST',body:userId?{userId}:{}});if(!userId)clear();return result;}
  async function revokeSession(targetSessionId){return request('revoke-session',{method:'POST',body:{sessionId:targetSessionId}});}
  async function markNotificationRead(notificationId){return request('mark-notification-read',{method:'POST',body:{notificationId}});}
  async function markAllNotificationsRead(){return request('mark-all-notifications-read',{method:'POST'});}
  async function systemHealth(){return request('system-health');}
  async function togglePeriodLock(payload){return request('toggle-period-lock',{method:'POST',body:payload});}
  async function reviewReceipt(payload){return request('review-receipt',{method:'POST',body:payload});}
  async function migrateStorage(confirm=''){return request('migrate-storage',{method:'POST',body:{confirm}});}
  async function syncToSupabase(){return request('sync-to-supabase',{method:'POST'});}
  async function announcement(payload){return request('announcement',{method:'POST',body:payload});}
  async function configureMfa(userId,enabled,secret=''){return request('mfa-config',{method:'POST',body:{userId,enabled,secret}});}
  async function trashUser(userId){return request('trash-user',{method:'POST',body:{userId}});}
  async function restoreTrash(trashId){return request('restore-trash',{method:'POST',body:{trashId}});}
  async function backups(){return request('backups');}
  async function createBackup(){return request('create-backup',{method:'POST'});}
  async function restoreBackup(key){return request('restore-backup',{method:'POST',body:{key}});}
  function clear(){token='';sessionId='';revision=0;localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(SESSION_KEY);}
  function hasToken(){return Boolean(token);}
  function isNetlify(){return location.protocol==='https:'&&/netlify\.app$|websiteextrajoss/i.test(location.hostname)||location.pathname.includes('/.netlify/');}
  window.ExtraJossBackend={health,systemHealth,login,pull,push,routePoint,uploadReceipt,receiptFile,uploadCandidateCv,candidateCvFile,logout,logoutAll,revokeSession,markNotificationRead,markAllNotificationsRead,togglePeriodLock,reviewReceipt,migrateStorage,syncToSupabase,announcement,configureMfa,trashUser,restoreTrash,backups,createBackup,restoreBackup,clear,hasToken,isNetlify,getRevision:()=>revision,getSessionId:()=>sessionId};
})();
