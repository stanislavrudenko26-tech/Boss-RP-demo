const pages=[...document.querySelectorAll('.page')],links=[...document.querySelectorAll('[data-page]')],toast=document.getElementById('toast'),modal=document.getElementById('modal');
function showPage(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));document.querySelectorAll('.side-link').forEach(x=>x.classList.toggle('active',x.dataset.page===id));window.scrollTo({top:0,behavior:'smooth'})}
links.forEach(x=>x.addEventListener('click',()=>{const id=x.dataset.page;if(document.getElementById(id))showPage(id)});
function notify(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
document.getElementById('play').onclick=()=>modal.classList.add('show');document.getElementById('connect').onclick=()=>modal.classList.add('show');document.getElementById('close').onclick=()=>modal.classList.remove('show');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('show')});
document.querySelectorAll('.server-choice').forEach(b=>b.onclick=()=>{modal.classList.remove('show');notify('Запит на підключення до сервера відправлено')});
document.getElementById('bell').onclick=()=>notify('У тебе 3 нових повідомлення');
document.getElementById('settings').onclick=()=>notify('Налаштування профілю відкриються у наступній версії');
document.getElementById('discordBtn')?.addEventListener('click',()=>notify('Discord-посилання буде додано'));
document.getElementById('supportBtn')?.addEventListener('click',()=>notify('Звернення створено'));
setInterval(()=>{const n=245+Math.floor(Math.random()*8);document.getElementById('online').textContent=n+' / 1000';document.getElementById('online')?.setAttribute('title','Оновлено щойно')},8000);