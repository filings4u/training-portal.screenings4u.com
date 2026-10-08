(async()=>{
'use strict';
try{
 const state=await window.TrainingAuth.requireAuth();
 if(!state)return;
 window.TrainingShell.render(state);
 window.TrainingSecurity.init();
 await window.TrainingGroupSeatPages.init();
}catch(e){console.error('[Training Group Seats]',e);const m=document.getElementById('tmPage');if(m)m.innerHTML=`<div class="tm-banner error"><strong>Unable to open Group Seat Management.</strong><div>${window.TrainingShell.esc(e?.message||String(e))}</div></div>`;}
})();
