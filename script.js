const pages=[...document.querySelectorAll('.page')],links=[...document.querySelectorAll('[data-page]')],toast=document.getElementById('toast'),modal=document.getElementById('modal');
function showPage(id){const p=document.getElementById(id);if(!p)return;pages.forEach(x=>x.classList.toggle('active',x===p));document.querySelectorAll('.side-link').forEach(x=>x.classList.toggle('active',x.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'})}
links.forEach(x=>x.addEventListener('click',()=>showPage(x.dataset.page)));
function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),2600)}
document.getElementById('play').onclick=()=>modal.classList.add('show');
document.getElementById('connect').onclick=()=>modal.classList.add('show');
document.getElementById('close').onclick=()=>modal.classList.remove('show');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
document.querySelectorAll('.server-choice').forEach(b=>b.onclick=()=>{modal.classList.remove('show');notify('Запит на підключення до сервера відправлено')});
document.getElementById('bell').onclick=()=>notify('У тебе 3 нових повідомлення');
document.getElementById('settings').onclick=()=>notify('Налаштування відкриються у наступній версії');
document.getElementById('allNews').onclick=()=>notify('Показано всі останні новини');
document.getElementById('discordBtn')?.addEventListener('click',()=>notify('Discord-посилання можна додати у script.js'));
document.getElementById('supportBtn')?.addEventListener('click',()=>notify('Звернення до підтримки створено'));
let players=245;
setInterval(()=>{players=245+Math.floor(Math.random()*8);document.getElementById('online').textContent=players+' / 1000';document.getElementById('statusPlayers').textContent=players+' з 1000 гравців'},6000);