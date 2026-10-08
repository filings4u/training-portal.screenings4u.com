(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingCertificatePages.init();
}catch(e){console.error('[Training Certificate Management]',e);const m=document.getElementById('tmPage');if(m)m.innerHTML=`<div class="tm-banner error"><strong>Unable to open Certificate Management.</strong><div>${window.TrainingShell.esc(e?.message||String(e))}</div></div>`;}
})();
