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
 // The same server-side handoff validation as management-portal-guard.js,
 // inlined to avoid downloading a second JS file after page startup.
 const KEY='s4u-management-entry-training-v1';
 const redirect=(reason)=>{
  try{sessionStorage.removeItem(KEY)}catch{}
  location.replace('https://enterprise.screenings4u.com/portal-selector.html?reason='+encodeURIComponent(reason||'selector_required')+'&portal=training');
 };
 const guard={
  validate:async()=>{
   let token;
   try{token=sessionStorage.getItem(KEY)}catch{}
   if(!token){redirect('selector_required');return false}
   if(!c()){redirect('portal_client_unavailable');return false}
   const {data,error}=await c().functions.invoke('management-portal-handoff',{
     body:{action:'validate',portal_session_token:token,portal_code:'training',host:location.host.toLowerCase()}
   });
   if(error||!data?.valid){
    try{await c().auth.signOut({scope:'local'})}catch{}
    redirect(data?.error||error?.message||'portal_session_invalid');
    return false;
   }
   window.TRAINING_MANAGEMENT_ENTRY=data;
   return true;
  },
  clear:()=>{try{sessionStorage.removeItem(KEY)}catch{}},
  key:KEY,
  portal:'training'
 };
 window.TrainingPortalGuard=Object.freeze(guard);
 return window.TrainingPortalGuard;
}
async function requireAuth(){
 // Run session retrieval and portal-handoff validation concurrently.
 // Both checks are still mandatory; no local token grants access.
 const guardPromise=loadGuard().then(guard=>guard.validate());
 const contextPromise=c().auth.getSession().then(async ({data,error})=>{
  if(error)throw error;
  if(!data?.session?.access_token)return null;
  // The context endpoint independently validates the JWT and active staff access.
  // This call may run alongside (never replace) the portal handoff check.
  const context=await invoke(window.TRAINING_PORTAL_CONFIG.contextFunction,{action:'context'});
  return {...context,session:data.session};
 });
 const [valid,context]=await Promise.all([guardPromise,contextPromise]);
 if(!valid)return null;
 if(!context){
  location.replace('https://enterprise.screenings4u.com/portal-selector.html?portal=training');
  return null;
 }
 const state=context;
 window.TRAINING_AUTH_STATE=state;
 return window.TRAINING_AUTH_STATE;
}
async function signOut(reason='manual'){
 clear();
 try{await c().auth.signOut({scope:'local'})}catch{}
 location.replace('https://enterprise.screenings4u.com/portal-selector.html'+(reason&&reason!=='manual'?'?reason='+encodeURIComponent(reason):''));
}
window.TrainingAuth=Object.freeze({requireAuth,signOut,invoke,clear});
})();