(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingBillingPages.init();
}catch(e){
 console.error('[Training Billing]',e);
 const mount=document.getElementById('tmPage');
 if(mount)mount.innerHTML=`<div class="tm-banner error"><strong>Unable to open this Training management page.</strong><div>${window.TrainingShell?.esc?.(e?.message||String(e))||String(e)}</div></div>`;
}
})();