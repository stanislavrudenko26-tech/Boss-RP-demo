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
  setText('statHours',p?.played_hours ?? 184);
  setText('statJobs',p?.jobs_completed ?? 326);
  setText('statVehicles',p?.vehicles ?? 7);
  setText('statProperties',p?.properties ?? 3);
  setText('statReputation',Number(p?.reputation ?? 1284).toLocaleString('uk-UA'));
  const avatarUrl=p?.avatar_url || meta.avatar_url;
  if(avatarUrl){
    document.querySelectorAll('.mini-avatar,.avatar-big,.avatar-xl').forEach(el=>{
      el.style.backgroundImage='url("'+avatarUrl.replace(/"/g,'')+'")';
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
      const art=el.querySelector('.avatar-art'); if(art)art.style.display='none';
    });
  }  document.getElementById('userChip')?.classList.add('authenticated');
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


/* BOSS RP enhanced interactions */
const vehicleData=[
  {name:'Boss GT-R',type:'Спорткар',garage:'#01',fuel:86,status:'Готовий',price:'$2 450 000'},
  {name:'BMW M5',type:'Преміум',garage:'#02',fuel:63,status:'Готовий',price:'$1 850 000'},
  {name:'Mercedes AMG',type:'Бізнес',garage:'#03',fuel:91,status:'Готовий',price:'$2 100 000'},
  {name:'Nissan Skyline',type:'Спорт',garage:'#04',fuel:44,status:'Потребує пального',price:'$1 250 000'},
  {name:'Range Rover',type:'SUV',garage:'#05',fuel:72,status:'Готовий',price:'$1 690 000'},
  {name:'Toyota Camry',type:'Седан',garage:'#06',fuel:58,status:'Готовий',price:'$650 000'}
];
const jobsData=[
  ['Таксист','Перевезення гравців','$ 2 500 / зміна','12 / 20 XP'],
  ['Механік','Ремонт та тюнінг','$ 3 200 / зміна','8 / 20 XP'],
  ['Далекобійник','Міжміські доставки','$ 5 800 / зміна','17 / 30 XP'],
  ['Поліцейський','Захист міста','$ 6 500 / зміна','24 / 40 XP'],
  ['Медик','Допомога гравцям','$ 5 900 / зміна','19 / 30 XP'],
  ['Курʼєр','Швидкі доставки','$ 2 100 / зміна','9 / 15 XP']
];
function renderGarage(query=''){
  const grid=document.getElementById('vehicleGrid'); if(!grid)return;
  const q=query.toLowerCase().trim();
  const list=vehicleData.filter(v=>(v.name+' '+v.type+' '+v.garage).toLowerCase().includes(q));
  if(!list.length){grid.innerHTML='<div class="empty-state">Автомобілів за цим запитом не знайдено.</div>';return}
  grid.innerHTML=list.map((v,i)=>`<article class="vehicle-card"><div class="vehicle-art"><svg><use href="#i-car"/></svg></div><span class="tag">${v.type}</span><h3>${v.name}</h3><p>${v.garage} · Паливо ${v.fuel}% · ${v.status}</p><div class="progress-line"><i style="width:${v.fuel}%"></i></div><div class="action-row"><button class="action-btn primary vehicle-open" data-index="${vehicleData.indexOf(v)}">Керувати</button><span class="card-price">${v.price}</span></div></article>`).join('');
  grid.querySelectorAll('.vehicle-open').forEach(b=>b.onclick=()=>openVehicle(vehicleData[Number(b.dataset.index)]));
}
function openVehicle(v){
  const m=document.getElementById('modal'); if(!m)return;
  const box=m.querySelector('.modal-box');
  box.classList.add('wide');
  box.innerHTML=`<button class="close" id="closeVehicle">×</button><span>ГАРАЖ · ${v.garage}</span><h2>${v.name}</h2><div class="vehicle-modal-art"><svg><use href="#i-car"/></svg></div><p class="account-meta">${v.type} · Паливо ${v.fuel}% · ${v.status}</p><div class="action-row"><button class="action-btn primary" id="spawnVehicle">Викликати авто</button><button class="action-btn" id="fuelVehicle">Заправити</button></div>`;
  m.classList.add('show');
  document.getElementById('closeVehicle').onclick=()=>{m.classList.remove('show');location.reload()};
  document.getElementById('spawnVehicle').onclick=()=>notify(v.name+' викликано до точки спавну');
  document.getElementById('fuelVehicle').onclick=()=>notify('Автомобіль відправлено на заправку');
}
function renderJobs(){
  const page=document.getElementById('jobs'); if(!page)return;
  const grid=page.querySelector('.job-grid'); if(!grid)return;
  grid.innerHTML=jobsData.map((j,i)=>`<article class="job-card"><span class="tag">РОБОТА #${String(i+1).padStart(2,'0')}</span><h3>${j[0]}</h3><p>${j[1]}</p><b class="card-price">${j[2]}</b><p>Прогрес: ${j[3]}</p><div class="progress-line"><i style="width:${45+i*7}%"></i></div><button class="action-btn primary start-job" data-job="${j[0]}">Почати роботу</button></article>`).join('');
  grid.querySelectorAll('.start-job').forEach(b=>b.onclick=()=>notify('Роботу «'+b.dataset.job+'» активовано'));
}
function upgradeShop(){
  const page=document.getElementById('shop'); if(!page)return;
  const old=page.querySelector('.cards'); if(!old)return;
  old.className='shop-grid';
  old.innerHTML=[
    ['Premium Gold','30 днів Premium','450 Coins'],
    ['Premium VIP','90 днів Premium','1 100 Coins'],
    ['2 000 Coins','Premium валюта','$ 199'],
    ['5 000 Coins','Premium валюта','$ 449'],
    ['Зміна імені','Один раз','150 Coins'],
    ['VIP номер','Ексклюзивний номер','300 Coins']
  ].map((x,i)=>`<article class="shop-card"><span class="tag">SHOP #${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p><b class="card-price">${x[2]}</b><div class="action-row"><button class="action-btn primary buy-item" data-item="${x[0]}">Придбати</button></div></article>`).join('');
  page.querySelectorAll('.buy-item').forEach(b=>b.onclick=()=>notify('Покупка «'+b.dataset.item+'» підготовлена до підтвердження'));
}
function enhanceProfile(){
  const name=document.getElementById('profileHeroName');
  const meta=document.getElementById('profileHeroMeta');
  if(name)name.textContent=currentProfile?.username||currentUser?.user_metadata?.full_name||'BossRudenko';
  if(meta)meta.textContent=currentUser?(currentUser.email+' · ID #'+(currentProfile?.player_id||'—')):'Увійди, щоб синхронізувати прогрес';
  setText('profileStatus',currentUser?'ONLINE':'OFFLINE');
  if(currentProfile){
    setText('kpiBalance',money(currentProfile.balance));
    setText('kpiCoins',Number(currentProfile.coins||0).toLocaleString('uk-UA'));
    setText('kpiLevel',currentProfile.level||0);
    setText('kpiRep',Number(currentProfile.reputation||0).toLocaleString('uk-UA'));
  }
}
function restoreSettings(){
  const compact=localStorage.getItem('bossrp_compact')==='1';
  const motion=localStorage.getItem('bossrp_motion')!=='0';
  document.body.classList.toggle('compact-ui',compact);
  document.body.classList.toggle('no-motion',!motion);
  const c=document.getElementById('compactToggle'),m=document.getElementById('motionToggle');
  if(c)c.checked=compact;if(m)m.checked=motion;
}
function bindEnhancements(){
  renderGarage();renderJobs();upgradeShop();enhanceProfile();restoreSettings();
  document.getElementById('garageSearch')?.addEventListener('input',e=>renderGarage(e.target.value));
  document.getElementById('profileAuthAction')?.addEventListener('click',()=>currentUser?openAuth():openAuth());
  document.getElementById('profileRefresh')?.addEventListener('click',async()=>{if(currentUser&&supabase){await loadProfile(currentUser);enhanceProfile();notify('Профіль оновлено')}else notify('Увійди в акаунт для оновлення')});
  document.getElementById('noticeClose')?.addEventListener('click',()=>document.getElementById('noticePanel').classList.remove('show'));
  document.getElementById('settingsClose')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.remove('show'));
  document.getElementById('compactToggle')?.addEventListener('change',e=>{localStorage.setItem('bossrp_compact',e.target.checked?'1':'0');document.body.classList.toggle('compact-ui',e.target.checked)});
  document.getElementById('motionToggle')?.addEventListener('change',e=>{localStorage.setItem('bossrp_motion',e.target.checked?'1':'0');document.body.classList.toggle('no-motion',!e.target.checked)});
  document.getElementById('refreshToggle')?.addEventListener('change',e=>localStorage.setItem('bossrp_refresh',e.target.checked?'1':'0'));
  document.getElementById('bell')?.addEventListener('click',e=>{e.stopPropagation();document.getElementById('settingsPanel')?.classList.remove('show');document.getElementById('noticePanel')?.classList.toggle('show')});
  document.getElementById('settings')?.addEventListener('click',e=>{e.stopPropagation();document.getElementById('noticePanel')?.classList.remove('show');document.getElementById('settingsPanel')?.classList.toggle('show')});
  document.addEventListener('click',e=>{if(!e.target.closest('#noticePanel')&&!e.target.closest('#bell'))document.getElementById('noticePanel')?.classList.remove('show');if(!e.target.closest('#settingsPanel')&&!e.target.closest('#settings'))document.getElementById('settingsPanel')?.classList.remove('show')});
}
const oldApplyProfile=applyProfile;
applyProfile=function(p,user){oldApplyProfile(p,user);enhanceProfile()};
setTimeout(bindEnhancements,50);
