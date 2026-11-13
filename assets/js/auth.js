(()=>{
'use strict';
const c=()=>window.trainingSupabase;
const CACHE='s4u-training-management-context-v1';
function clear(){try{sessionStorage.removeItem(CACHE)}catch{}}
function authFailure(error,data){
 const status=error?.context?.status||error?.status||data?.status;
 return status===401||status===403;
}
async function invoke(slug,body={}){
 let {data,error}=await c().functions.invoke(slug,{body});
 // Never repeat successful mutations or retry a 500. Only an explicit
 // expired/unauthorized access token warrants a single authenticated retry.
 if(authFailure(error,data)&&((error?.context?.status||error?.status||data?.status)===401)){
   const refreshed=await c().auth.refreshSession();
   if(!refreshed.error&&refreshed.data?.session?.access_token){
     ({data,error}=await c().functions.invoke(slug,{body}));
   }
 }
 if(error||data?.error)throw new Error(data?.error||error?.message||'Request failed.');
 return data;
}
async function loadGuard(){
 if(window.TrainingPortalGuard)return window.TrainingPortalGuard;
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='assets/js/management-portal-guard.js?v=20261021-training-guard';
  script.onload=resolve;
  script.onerror=()=>reject(new Error('Training portal security module failed to load'));
  document.head.append(script);
 });
 if(!window.TrainingPortalGuard)throw new Error('Training portal guard unavailable');
 return window.TrainingPortalGuard;
}
async function requireAuth(){
 // Run session retrieval and portal-handoff validation concurrently.
 // Both checks are still mandatory; no local token grants access.
 const guardPromise=loadGuard().then(guard=>guard.validate());
 const sessionPromise=c().auth.getSession();
 const [valid,sessionResult]=await Promise.all([guardPromise,sessionPromise]);
 if(!valid)return null;
 const {data,error}=sessionResult;
 if(error)throw error;
 if(!data?.session?.access_token){
  location.replace('https://enterprise.screenings4u.com/portal-selector.html?portal=training');
  return null;
 }
 const state=await invoke(window.TRAINING_PORTAL_CONFIG.contextFunction,{action:'context'});
 window.TRAINING_AUTH_STATE={...state,session:data.session};
 return window.TRAINING_AUTH_STATE;
}
async function signOut(reason='manual'){
 clear();
 try{await c().auth.signOut({scope:'local'})}catch{}
 location.replace('https://enterprise.screenings4u.com/portal-selector.html'+(reason&&reason!=='manual'?'?reason='+encodeURIComponent(reason):''));
}
window.TrainingAuth=Object.freeze({requireAuth,signOut,invoke,clear});
})();