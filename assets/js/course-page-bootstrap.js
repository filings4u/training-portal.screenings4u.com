(async()=>{try{const state=await window.TrainingAuth.requireTrainingAccess();window.TrainingShell.render(state);await window.TrainingCoursePages.init()}catch(e){console.error(e)}})();
