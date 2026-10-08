(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingInstructorPages.init();
}catch(e){
 console.error('[Training Instructors]',e);
 const mount=document.getElementById('tmPage');
 if(mount)mount.innerHTML=`<div class="tm-banner error"><strong>Unable to open this Training management page.</strong><div>${window.TrainingShell?.esc?.(e?.message||String(e))||String(e)}</div></div>`;
}
})();
