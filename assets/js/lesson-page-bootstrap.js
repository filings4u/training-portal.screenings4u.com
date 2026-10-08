(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity?.init?.();
 await window.TrainingLessonPages.init();
}catch(e){
 console.error('[Training Lessons]',e);
 document.body.innerHTML=`<main class="tm-page"><div class="tm-banner error"><strong>Unable to open Lesson Management.</strong><div>${String(e?.message||e)}</div><div style="margin-top:12px"><a class="tm-btn primary" href="login.html">Return to Login</a></div></div></main>`;
}
})();
