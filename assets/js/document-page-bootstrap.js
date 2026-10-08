(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingDocumentPages.init();
}catch(e){console.error('[Training Documents]',e);const m=document.getElementById('tmPage');if(m)m.innerHTML=`<div class="tm-banner error"><strong>Unable to open Document Management.</strong><div>${window.TrainingShell.esc(e?.message||String(e))}</div></div>`;}
})();
