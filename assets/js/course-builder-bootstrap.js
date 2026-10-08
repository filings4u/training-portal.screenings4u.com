(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingCourseBuilder.init();
}catch(e){console.error('[Training Course Builder]',e);document.body.innerHTML=`<main class="tm-page"><div class="tm-banner error"><strong>Unable to open Course Builder.</strong><div>${window.TrainingShell?.esc?window.TrainingShell.esc(e?.message||String(e)):String(e)}</div><div style="margin-top:12px"><a class="tm-btn primary" href="courses.html">Return to Courses</a></div></div></main>`}
})();
