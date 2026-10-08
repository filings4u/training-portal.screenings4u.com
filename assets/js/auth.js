(()=>{
'use strict';
const c=()=>window.trainingSupabase;
const CACHE='s4u-training-management-context-v1';
function clear(){try{sessionStorage.removeItem(CACHE)}catch{}}
async function invoke(slug,body={}){
  let {data,error}=await c().functions.invoke(slug,{body});
  if(error||data?.error){
    const r=await c().auth.refreshSession();
    if(!r.error&&r.data?.session?.access_token){({data,error}=await c().functions.invoke(slug,{body}));}
  }
  if(error||data?.error)throw new Error(data?.error||error?.message||'Request failed.');
  return data;
}
async function requireAuth(){
  if(!window.TrainingPortalGuard||!(await window.TrainingPortalGuard.validate()))return null;
  const {data,error}=await c().auth.getSession();
  if(error)throw error;
  if(!data?.session?.access_token){location.replace('https://enterprise.screenings4u.com/portal-selector.html?portal=training');return null;}
  const state=await invoke(window.TRAINING_PORTAL_CONFIG.contextFunction,{action:'context'});
  window.TRAINING_AUTH_STATE={...state,session:data.session};
  try{sessionStorage.setItem(CACHE,JSON.stringify({savedAt:Date.now(),state:window.TRAINING_AUTH_STATE}))}catch{}
  return window.TRAINING_AUTH_STATE;
}
async function signOut(reason='manual'){
  clear();
  try{await c().auth.signOut({scope:'local'})}catch{}
  location.replace('login.html'+(reason&&reason!=='manual'?`?reason=${encodeURIComponent(reason)}`:''));
}
window.TrainingAuth=Object.freeze({requireAuth,signOut,invoke,clear});
})();
