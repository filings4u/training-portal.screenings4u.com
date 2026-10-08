(()=>{
'use strict';
const config=Object.freeze({
  portalName:'Screenings4u Learning Center Management',
  portalHost:'training-portal.screenings4u.com',
  managedWebsite:'https://training.screenings4u.com',
  managedLms:'https://lms.screenings4u.com',
  supabaseUrl:'https://elpbnytpciqnbexiaebp.supabase.co',
  supabaseAnonKey:'sb_publishable_xVI6Mjkk1bNVMGHZCPuK6w_8FSHKdkC',
  contextFunction:'training-management-context',
  readFunction:'training-management-read',
  courseFunction:'training-course-management',
  lessonFunction:'training-lesson-management',
  quizFunction:'training-quiz-management',
  assessmentFunction:'training-assessment-management',
  certificateFunction:'lms-admin-certificates',
  productFunction:'training-product-management',
  organizationFunction:'training-organization-management',
  managementFunction:'screenings4u-training-management',
  storageKey:'s4u-training-management-session'
});
window.TRAINING_PORTAL_CONFIG=config;
if(window.supabase?.createClient){
  window.trainingSupabase=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.sessionStorage,storageKey:config.storageKey}});
}else console.error('[Training Management] Supabase JS unavailable.');
})();
