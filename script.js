import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const pages=[...document.querySelectorAll('.page')],links=[...document.querySelectorAll('[data-page]')];
const toast=document.getElementById('toast'),modal=document.getElementById('modal'),authModal=document.getElementById('authModal');
const supabaseReady=SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_PROJECT');
const supabase=supabaseReady ? createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
let currentUser=null, currentProfile=null;

function showPage(id){const p=document.getElementById(id);if(!p)return;pages.forEach(x=>x.classList.toggle('active',x===p));document.querySelectorAll('.side-link').forEach(x=>x.classList.toggle('active',x.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'})}
links.forEach(x=>x.addEventListener('click',()=>showPage(x.dataset.page)));
function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),2600)}
function openAuth(){authModal.classList.add('show');authModal.setAttribute('aria-hidden','false');document.getElementById('authConfigHint').textContent=supabaseReady?'Обери Google або Discord. Дані акаунта збережуться на сервері.':'Потрібно один раз підключити Supabase — інструкція є у supabase-config.js та SETUP-AUTH.md.'}
function closeAuth(){authModal.classList.remove('show');authModal.setAttribute('aria-hidden','true')}

function money(v){return '$ '+Number(v||0).toLocaleString('uk-UA')}
function setText(id,v){const el=document.getElementById(id);if(el)el.textContent=v}
function applyProfile(p,user){
  currentProfile=p; currentUser=user;
  const meta=user?.user_metadata||{}, name=p?.username || meta.full_name || meta.name || meta.user_name || user?.email?.split('@')[0] || 'BossRudenko';
  const pid=p?.player_id ? '#'+p.player_id : '#601';
  const balance=p?.balance ?? 125000, coins=p?.coins ?? 1250, level=p?.level ?? 3, xp=p?.xp ?? 124, premium=p?.premium ?? true;
  setText('topUsername',name); setText('topUserMeta',user?.email||'Акаунт підключено');
  setText('profileNameText',name); setText('profileIdText','ID: '+pid);
  setText('balanceText',money(balance)); setText('coinsText',Number(coins).toLocaleString('uk-UA'));
  setText('levelText',level); setText('xpText',xp+' / 300 XP');
  const xpBar=document.getElementById('xpBar'); if(xpBar)xpBar.style.width=Math.min(100,(xp/300)*100)+'%';
  const badge=document.getElementById('profileBadge'); if(badge)badge.style.display=premium?'inline-flex':'none';
  setText('detailName',name); setText('detailMeta','ID: '+pid+(premium?' · Premium':''));
  const db=document.getElementById('detailBalance'); if(db)db.innerHTML=money(balance)+'<small>Баланс</small>';
  const dc=document.getElementById('detailCoins'); if(dc)dc.innerHTML=Number(coins).toLocaleString('uk-UA')+'<small>Premium Coins</small>';
  const dl=document.getElementById('detailLevel'); if(dl)dl.innerHTML=level+'<small>Рівень</small>';
  setText('detailXp',xp+' / 300 XP');
  document.getElementById('userChip')?.classList.add('authenticated');
  document.getElementById('logoutBtn').hidden=false;
  document.getElementById('authTitle').textContent='Акаунт BOSS RP';
  document.getElementById('authSubtitle').textContent='Твій прогрес синхронізується з акаунтом і доступний на інших пристроях.';
}
function resetDemo(){
  currentUser=null; currentProfile=null;
  applyProfile({username:'BossRudenko',player_id:601,balance:125000,coins:1250,level:3,xp:124,premium:true},null);
  document.getElementById('userChip')?.classList.remove('authenticated');
  document.getElementById('logoutBtn').hidden=true;
  document.getElementById('authTitle').textContent='Увійти в BOSS RP';
  document.getElementById('authSubtitle').textContent='Збережи профіль, баланс, рівень та статистику на всіх своїх пристроях.';
}
async function loadProfile(user){
  if(!supabase){resetDemo();return}
  const {data,error}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
  if(error){console.error(error);notify('Не вдалося завантажити профіль');return}
  if(data)applyProfile(data,user); else notify('Профіль ще створюється. Онови сторінку через секунду.');
}
async function login(provider){
  if(!supabase){openAuth();notify('Спочатку підключи Supabase');return}
  const {error}=await supabase.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin+window.location.pathname}});
  if(error)notify('Помилка входу: '+error.message);
}
async function logout(){
  if(supabase)await supabase.auth.signOut();
  closeAuth();resetDemo();notify('Ти вийшов з акаунта');
}

document.getElementById('play').onclick=()=>modal.classList.add('show');
document.getElementById('connect').onclick=()=>modal.classList.add('show');
document.getElementById('close').onclick=()=>modal.classList.remove('show');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
document.querySelectorAll('.server-choice').forEach(b=>b.onclick=()=>{modal.classList.remove('show');notify('Запит на підключення до сервера відправлено')});
document.getElementById('bell').onclick=()=>notify(currentUser?'У тебе 3 нових повідомлення':'Увійди, щоб переглядати персональні повідомлення');
document.getElementById('settings').onclick=()=>notify('Налаштування акаунта доступні після входу');
document.getElementById('allNews').onclick=()=>notify('Показано всі останні новини');
document.getElementById('discordBtn')?.addEventListener('click',()=>notify('Додай Discord-посилання адміністратора у script.js'));
document.getElementById('supportBtn')?.addEventListener('click',()=>notify('Звернення до підтримки створено'));
document.getElementById('userChip').onclick=()=>currentUser?showPage('profile'):openAuth();
document.getElementById('authClose').onclick=closeAuth;
authModal.addEventListener('click',e=>{if(e.target===authModal)closeAuth()});
document.getElementById('googleLogin').onclick=()=>login('google');
document.getElementById('discordLogin').onclick=()=>login('discord');
document.getElementById('logoutBtn').onclick=logout;

let players=245;
setInterval(()=>{players=245+Math.floor(Math.random()*8);setText('online',players+' / 1000');setText('statusPlayers',players+' з 1000 гравців')},6000);

resetDemo();
if(supabase){
  supabase.auth.onAuthStateChange((event,session)=>{
    if(session?.user) setTimeout(()=>loadProfile(session.user),0);
    else if(event==='SIGNED_OUT') resetDemo();
  });
  supabase.auth.getSession().then(({data})=>{if(data.session)loadProfile(data.session.user)});
}else{
  document.getElementById('authConfigHint').textContent='Supabase ще не підключено. Відкрий SETUP-AUTH.md та виконай налаштування один раз.';
}
