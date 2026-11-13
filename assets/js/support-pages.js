(()=>{
'use strict';
const $=s=>document.querySelector(s),esc=v=>window.TrainingShell.esc(v),qs=new URLSearchParams(location.search),id=qs.get('id'),kind=qs.get('kind')==='chat'?'chat':'ticket';
const invoke=(payload={})=>window.TrainingAuth.invoke('training-support-management',payload);
const dt=v=>v?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(v)):'—';
function head(t,d,a=''){return `<div class="tm-page-head"><div><span class="tm-kicker">WORKFORCE TRAINING BY SCREENINGS4U</span><h1>${esc(t)}</h1><p>${esc(d)}</p></div>${a?`<div class="tm-actions">${a}</div>`:''}</div>`}
function badge(v){const s=String(v||'').toLowerCase();return `<span class="tm-badge ${['resolved','closed'].includes(s)?'ok':['open','in_progress','waiting'].includes(s)?'warn':['urgent'].includes(s)?'bad':''}">${esc(v||'—')}</span>`}
function table(h,r,e='No records found.'){return `<div class="tm-table-wrap"><table class="tm-table"><thead><tr>${h.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${r||`<tr><td colspan="${h.length}" class="tm-empty">${esc(e)}</td></tr>`}</tbody></table></div>`}
function toast(m,t='success'){let x=$('.tm-toast');if(!x){x=document.createElement('div');x.className='tm-toast';document.body.appendChild(x)}x.className='tm-toast '+t;x.textContent=m;requestAnimationFrame(()=>x.classList.add('show'));clearTimeout(window.__supToast);window.__supToast=setTimeout(()=>x.classList.remove('show'),3200)}
function dialog(title,msg,label='Continue'){return new Promise(resolve=>{const w=document.createElement('div');w.className='tm-dialog-backdrop';w.innerHTML=`<section class="tm-dialog" role="dialog" aria-modal="true"><div class="tm-dialog-brand"><img src="https://elpbnytpciqnbexiaebp.supabase.co/storage/v1/object/public/enterprise_branding/workforce-training2.png" alt="Workforce Training"></div><div class="tm-dialog-body"><h2>${esc(title)}</h2><p>${esc(msg)}</p><div class="tm-dialog-actions"><button class="tm-btn" data-c>Cancel</button><button class="tm-btn primary" data-o>${esc(label)}</button></div></div></section>`;document.body.appendChild(w);w.querySelector('[data-c]').onclick=()=>{w.remove();resolve(false)};w.querySelector('[data-o]').onclick=()=>{w.remove();resolve(true)}})}
const person=(p,t)=>p?.display_name||[p?.first_name,p?.last_name].filter(Boolean).join(' ')||t?.requester_name||t?.requester_email||'Learner';
async function list(){const d=await invoke({action:'list'}),pm=new Map((d.profiles||[]).map(p=>[p.id,p]));const rows=[...(d.tickets||[]).map(t=>({...t,kind:'ticket'})),...(d.threads||[]).map(t=>({...t,kind:'chat'}))].sort((a,b)=>new Date(b.last_message_at||0)-new Date(a.last_message_at||0));$('#tmPage').innerHTML=head('Support','Manage Training support tickets and keep every reply on the original ticket.',`<a class="tm-btn primary" href="support-ticket-create.html">Create Ticket</a>`)+`<div class="tm-searchbar"><input id="q" placeholder="Search ticket, learner, email, subject, status"></div><section class="tm-card">${table(['Type','Learner','Subject','Priority','Status','Last activity','Action'],rows.map(t=>{const p=pm.get(t.customer_user_id);return `<tr data-search="${esc(((t.ticket_number||'')+' '+person(p,t)+' '+(t.requester_email||'')+' '+(t.subject||'')+' '+(t.status||'')).toLowerCase())}"><td><strong>${t.kind==='chat'?'Message':esc(t.ticket_number||'Ticket')}</strong></td><td>${esc(person(p,t))}<small>${esc(t.requester_email||p?.email||'')}</small></td><td>${esc(t.subject||'—')}</td><td>${badge(t.priority)}</td><td>${badge(t.status)}</td><td>${dt(t.last_message_at||t.updated_at||t.created_at)}</td><td><a class="tm-btn" href="support-ticket.html?id=${encodeURIComponent(t.id)}&kind=${t.kind==='chat'?'chat':'ticket'}">Manage</a></td></tr>`}).join(''),'No Training support tickets found.')}</section>`;$('#q').oninput=()=>{const q=$('#q').value.toLowerCase().trim();document.querySelectorAll('tbody tr[data-search]').forEach(r=>r.hidden=!!(q&&!r.dataset.search.includes(q)))};}
async function detail(){
 if(!id){location.replace('support.html');return}
 const chat=kind==='chat';
 const d=await invoke({action:chat?'get_chat':'get',id});
 const t=chat?d.thread:d.ticket,p=d.profile,msg=d.messages||[];
 const learner=person(p,t),subject=t.subject||'Training Support',ref=t.ticket_number||'';
 const fullLabel=chat?'Conversation':'Support Ticket';
 const sorted=[...msg].sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0));
 const messageHtml=sorted.map(m=>{
  const note=!!m.is_internal_note,staff=note||['admin','staff','agent'].includes(String(m.sender_type||'').toLowerCase());
  const label=note?'Internal Note':staff?'Workforce Training':learner;
  const initials=note?'IN':staff?'WT':learner.split(/\\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const attachments=Array.isArray(m.attachments)?m.attachments:Array.isArray(m.metadata?.attachments)?m.metadata.attachments:[];
  const links=attachments.filter(x=>/^https:\/\//i.test(String(x.url||''))).map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">'+esc(x.name||'Attachment')+'</a>').join('');
  return '<article class="wt-ticket-message '+(note?'is-internal':staff?'is-staff':'is-learner')+'"><div class="wt-ticket-avatar" aria-hidden="true">'+esc(initials)+'</div><div class="wt-ticket-message-body"><div class="wt-ticket-message-top"><strong>'+esc(label)+'</strong>'+(note?'<span class="wt-ticket-note-label">Staff only</span>':'')+'<time>'+esc(dt(m.created_at))+'</time></div><p>'+esc(m.body||'')+'</p>'+(links?'<div class="wt-ticket-files">'+links+'</div>':'')+'</div></article>';
 }).join('');
 const status=String(t.status||'open').toLowerCase();
 const ticketLabel=ref||fullLabel;
 $('#tmPage').innerHTML=
 '<div class="wt-ticket-workspace">'+
 '<div class="wt-ticket-toolbar"><a class="wt-ticket-back" href="support.html">Back to Support</a><span class="wt-ticket-context">'+esc(ticketLabel)+'</span></div>'+
 '<div class="wt-ticket-layout">'+
 '<section class="wt-ticket-main">'+
 '<div class="wt-ticket-heading"><div><div class="wt-ticket-heading-row"><span class="wt-ticket-heading-kicker">'+esc(fullLabel)+'</span>'+badge(status)+'</div><h1>'+esc(subject)+'</h1><p>Conversation with <strong>'+esc(learner)+'</strong> · '+sorted.length+' message'+(sorted.length===1?'':'s')+'</p></div><span class="wt-ticket-reference">'+esc(ref||'Training Support')+'</span></div>'+
 '<div class="wt-ticket-history" id="wtTicketHistory"><div class="wt-ticket-history-label">Conversation history</div>'+ (messageHtml||'<div class="wt-ticket-no-messages">No messages yet. You can start the conversation below.</div>')+'</div>'+
 '<div class="wt-ticket-composer"><div class="wt-ticket-composer-heading"><strong>Compose a response</strong><span>Visible to the learner and sent by Workforce Training.</span></div>'+
 '<form id="reply"><label for="replyBody" class="wt-ticket-input-label">Reply to '+esc(learner)+'</label><textarea id="replyBody" rows="4" maxlength="5000" required placeholder="Write your message to the learner..."></textarea><div class="wt-ticket-compose-actions"><small>Replies are saved to this conversation. Email delivery is tracked separately.</small><button class="tm-btn primary" type="submit">Send Reply</button></div></form>'+
 (chat?'':'<details class="wt-ticket-note-panel"><summary>Add a private staff note</summary><form id="note"><label for="noteBody" class="wt-ticket-input-label">Internal note — not shared with the learner</label><textarea id="noteBody" rows="3" maxlength="5000" required placeholder="Add context for your training team..."></textarea><div class="wt-ticket-compose-actions"><small>Only training management staff can view internal notes.</small><button class="tm-btn" type="submit">Save Internal Note</button></div></form></details>')+
 '</div></section>'+
 '<aside class="wt-ticket-aside"><section class="wt-ticket-detail-card"><div class="wt-ticket-detail-head"><h2>'+ (chat?'Conversation Details':'Ticket Management')+'</h2><p>Manage this conversation and learner.</p></div><div class="wt-ticket-detail-body">'+
 '<div class="wt-ticket-person"><div class="wt-ticket-person-avatar" aria-hidden="true">'+esc(learner.split(/\\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase())+'</div><div><small>LEARNER</small><strong>'+esc(learner)+'</strong>'+(p?.email||t.requester_email?'<a href="mailto:'+esc(p?.email||t.requester_email)+'">'+esc(p?.email||t.requester_email)+'</a>':'')+'</div></div>'+
 (chat?'<div class="wt-ticket-detail-line"><span>Conversation status</span>'+badge(status)+'</div>':
 '<form id="meta" class="wt-ticket-settings"><div class="tm-field"><label for="status">Status</label><select id="status">'+['open','in_progress','waiting','resolved','closed'].map(x=>'<option value="'+x+'" '+(t.status===x?'selected':'')+'>'+x.replace('_',' ')+'</option>').join('')+'</select></div><div class="tm-field"><label for="priority">Priority</label><select id="priority">'+['low','normal','high','urgent'].map(x=>'<option value="'+x+'" '+(t.priority===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="tm-field"><label for="category">Category</label><input id="category" value="'+esc(t.category||'training')+'"></div><button class="tm-btn primary" type="submit">Save Ticket Changes</button></form>')+
 '</div></section></aside></div></div>';
 const reply=$('#reply');
 reply.onsubmit=async e=>{
  e.preventDefault();const body=$('#replyBody').value.trim();if(!body)return;
  const btn=reply.querySelector('[type="submit"]');btn.disabled=true;btn.textContent='Sending…';
  try{
   const response=await invoke(chat?{action:'reply_chat',thread_id:id,body}:{action:'reply',ticket_id:id,body});
   toast(response.email_delivery?.sent===false?'Reply saved. Email notification needs attention.':'Reply sent to learner.');
   await detail();$('#wtTicketHistory')?.lastElementChild?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }catch(x){toast(x.message||String(x),'error');btn.disabled=false;btn.textContent='Send Reply'}
 };
 if(!chat)$('#note').onsubmit=async e=>{
  e.preventDefault();const body=$('#noteBody').value.trim();if(!body)return;
  const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;
  try{await invoke({action:'note',ticket_id:id,body});toast('Internal note saved.');await detail()}catch(x){toast(x.message||String(x),'error');btn.disabled=false}
 };
 if(!chat)$('#meta').onsubmit=async e=>{
  e.preventDefault();const btn=e.currentTarget.querySelector('[type="submit"]');
  const nextStatus=$('#status').value;
  if(nextStatus==='closed'&&t.status!=='closed'&&!await dialog('Close support ticket?','You can reopen this ticket later.','Close Ticket'))return;
  btn.disabled=true;
  try{await invoke({action:'update',ticket_id:id,status:nextStatus,priority:$('#priority').value,category:$('#category').value});toast('Ticket updated.');await detail()}catch(x){toast(x.message||String(x),'error');btn.disabled=false}
 };
}

async function create(){const d=await window.TrainingAuth.invoke(window.TRAINING_PORTAL_CONFIG.readFunction,{action:'learners'}),profiles=d.profiles||[];$('#tmPage').innerHTML=head('Create Support Ticket','Open a Training support ticket for an existing learner. The conversation remains on this ticket.',`<a class="tm-btn" href="support.html">Back to Support</a>`)+`<section class="tm-card"><div class="tm-card-body"><form id="create" class="tm-form-grid"><div class="tm-field full"><label>Learner</label><select id="learner" required><option value="">Select learner</option>${profiles.map(p=>`<option value="${esc(p.id)}">${esc(person(p))} — ${esc(p.email||'')}</option>`).join('')}</select></div><div class="tm-field full"><label>Subject</label><input id="subject" required></div><div class="tm-field"><label>Priority</label><select id="priority"><option>normal</option><option>low</option><option>high</option><option>urgent</option></select></div><div class="tm-field"><label>Category</label><input id="category" value="training"></div><div class="tm-field full"><label>Initial message</label><textarea id="body" rows="8" required></textarea></div><div class="tm-actions full"><button class="tm-btn primary" type="submit">Create Ticket</button></div></form></div></section>`;$('#create').onsubmit=async e=>{e.preventDefault();try{const x=await invoke({action:'create',customer_user_id:$('#learner').value,subject:$('#subject').value,body:$('#body').value,priority:$('#priority').value,category:$('#category').value});location.href='support-ticket.html?id='+encodeURIComponent(x.ticket.id)}catch(x){toast(x.message||String(x),'error')}};}
async function settings(){ $('#tmPage').innerHTML=head('Support Settings','Training support routing and management rules.',`<a class="tm-btn" href="support.html">Back to Support</a>`)+`<div class="tm-grid"><section class="tm-card half"><div class="tm-card-head"><h2>Internal Routing</h2></div><div class="tm-card-body tm-stack"><p><strong>Internal/admin email:</strong> hello@screenings4u.com</p><p><strong>Customer sender:</strong> notifications@screenings4u.com</p><p><strong>Management portal:</strong> training-portal.screenings4u.com</p></div></section><section class="tm-card half"><div class="tm-card-head"><h2>Conversation Rule</h2></div><div class="tm-card-body"><p>Replies append to the existing ticket until the ticket is closed. Creating a reply never creates a second support ticket.</p></div></section></div>`;}
async function init(){const p=(location.pathname.split('/').pop()||'support.html').toLowerCase();if(p==='support.html')return list();if(p==='support-ticket.html')return detail();if(p==='support-ticket-create.html')return create();if(p==='support-settings.html')return settings();return list()}
window.TrainingSupportPages=Object.freeze({init});
})();
