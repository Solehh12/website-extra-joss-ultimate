import seed from './_shared/seed.mjs';
import { createStorageAdapter } from './_shared/storage-adapter.mjs';
import { normalizeStoredData } from './_shared/core.mjs';

export const config={schedule:'@daily'};

const VARIANT=seed.seedMode==='demo'?'demo':'clean';
const DATA_KEY=`shared-data-v22-${VARIANT}`;
const BACKUP_INDEX_KEY=`backup-index-v22-${VARIANT}`;
const storage=createStorageAdapter({variant:VARIANT});

export default async function dailyBackup(){
  try{
    const data=await storage.getJson(DATA_KEY);
    if(!data)return Response.json({ok:true,skipped:true,reason:'Data belum tersedia.'});
    const index=await storage.getJson(BACKUP_INDEX_KEY)||[],now=new Date(),day=now.toISOString().slice(0,10);
    if(index.some(row=>row.kind==='otomatis'&&row.day===day))return Response.json({ok:true,skipped:true,reason:'Cadangan hari ini sudah ada.'});
    const normalized=normalizeStoredData(data),key=`backup-v22-${VARIANT}-${now.toISOString().replace(/[:.]/g,'-')}`;
    await storage.setJson(key,normalized);
    const row={key,day,kind:'otomatis',createdAt:now.toISOString(),createdBy:'Jadwal harian',revision:Number(normalized.revision||1),users:(normalized.users||[]).length,outlets:(normalized.outlets||[]).length,reports:(normalized.reportingDaily||[]).length,receipts:(normalized.reportingDaily||[]).filter(item=>item.receiptId).length};
    await storage.setJson(BACKUP_INDEX_KEY,[row,...index].slice(0,45));
    return Response.json({ok:true,backup:row,storage:storage.mode});
  }catch(error){
    console.error('extra-joss-daily-backup',error);
    return Response.json({ok:false,error:error?.message||'Cadangan otomatis gagal.'},{status:500});
  }
}
