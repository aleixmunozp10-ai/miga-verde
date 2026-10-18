const flavors=['matcha','cacao','vainilla'];
const hero=document.querySelector('.hero'),section=document.querySelector('.flavor-section');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active=0,busy=true,wheelLatched=false,wheelTimer,touchY=null,touchX=0,scrollFrame,bag=[];
const layers={};
for(const type of ['bg','deco','cookie']){
 const parent=document.querySelector(type==='bg'?'.backgrounds':type==='deco'?'.decorations':'.cookies');
 layers[type]=flavors.map((flavor,i)=>{const img=new Image();img.src=`./assets/${type}-${flavor}.webp`;img.alt='';img.draggable=false;img.className=`${type==='bg'?'background':type}${i===0?' is-active':''}`;parent.append(img);return img;});
}
const cards=flavors.map((flavor,i)=>{const b=document.createElement('button');b.className='card';b.setAttribute('aria-pressed',String(i===0));b.setAttribute('aria-label',`Seleccionar ${flavor}`);b.innerHTML=`<img src="./assets/cookie-${flavor}.webp" alt="Galleta de ${flavor}"><span class="card-label">${flavor.toUpperCase()}</span><span class="dot" aria-hidden="true"></span>`;b.addEventListener('click',()=>change(i));document.querySelector('.cards').append(b);return b;});
function lock(value){busy=value;hero.classList.toggle('transitioning',value);hero.setAttribute('aria-busy',String(value));document.querySelectorAll('header button,.buy,.card').forEach(b=>b.disabled=value);}
function inHero(){return scrollY<=section.offsetTop+section.offsetHeight-innerHeight+2;}
function position(){return section.offsetTop+active*innerHeight;}
function syncScroll(){window.scrollTo({top:position(),behavior:'instant'});}
function animate(el,frames,duration=900){return el.animate(frames,{duration,easing:'cubic-bezier(.45,0,.55,1)',fill:'both'});}
async function change(index,moveScroll=true){
 if(busy||index===active||index<0||index>2||document.querySelector('dialog[open]'))return;
 lock(true);const previous=active;active=index;hero.dataset.flavor=flavors[index];if(moveScroll)syncScroll();
 cards.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 const animations=[];
 for(const type of ['bg','deco','cookie']){
 const old=layers[type][previous],next=layers[type][index];old.classList.remove('is-active');next.classList.add('is-active');
 let out=[{opacity:1},{opacity:0}],incoming=[{opacity:0},{opacity:1}];
 if(!reduced.matches&&type==='cookie'){out=[{opacity:1,transform:'translateX(0) rotate(0deg)'},{opacity:0,transform:'translateX(65vw) rotate(120deg)'}];incoming=[{opacity:0,transform:'translateX(-65vw) rotate(-120deg)'},{opacity:1,transform:'translateX(0) rotate(0deg)'}];}
 if(!reduced.matches&&type==='deco'){out=[{opacity:1,transform:'scale(1)',filter:'blur(0px)'},{opacity:0,transform:'scale(.9)',filter:'blur(4px)'}];incoming=[{opacity:0,transform:'scale(1.1)',filter:'blur(3px)'},{opacity:1,transform:'scale(1)',filter:'blur(0px)'}];}
 animations.push(animate(old,out),animate(next,incoming));
 }
 const title=document.querySelector('h1');const titleOut=animate(title,reduced.matches?[{opacity:1},{opacity:0}]:[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],180);
 await titleOut.finished;titleOut.cancel();document.querySelector('#flavor-title').textContent=flavors[index].toUpperCase();
 const titleIn=animate(title,reduced.matches?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],300);
 await Promise.all(animations.map(a=>a.finished));animations.forEach(a=>a.cancel());titleIn.cancel();lock(false);
}
window.addEventListener('wheel',e=>{if(document.querySelector('dialog[open]'))return;if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!inHero())return;if(!busy&&active===2&&e.deltaY>0)return;e.preventDefault();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheelLatched=false,180);if(busy||wheelLatched||Math.abs(e.deltaY)<8)return;wheelLatched=true;change(active+Math.sign(e.deltaY));},{passive:false});
hero.addEventListener('touchstart',e=>{if(e.touches.length===1){touchY=e.touches[0].clientY;touchX=e.touches[0].clientX;}},{passive:true});
hero.addEventListener('touchmove',e=>{if(touchY!==null&&!(active===2&&!busy&&touchY>e.touches[0].clientY))e.preventDefault();},{passive:false});
hero.addEventListener('touchend',e=>{if(touchY===null)return;const dy=touchY-e.changedTouches[0].clientY,dx=touchX-e.changedTouches[0].clientX;touchY=null;if(active===2&&!busy&&dy>35){window.scrollTo({top:section.offsetTop+section.offsetHeight,behavior:reduced.matches?'instant':'smooth'});return;}if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(dx))change(active+Math.sign(dy));});
hero.addEventListener('touchcancel',()=>touchY=null);
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||!inHero()||['INPUT','TEXTAREA','SELECT','SUMMARY'].includes(document.activeElement.tagName))return;if(!busy&&active===2&&['ArrowDown','PageDown','End',' '].includes(e.key))return;if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)&&!['BUTTON','A'].includes(document.activeElement.tagName)){e.preventDefault();change(e.key==='Home'?0:e.key==='End'?2:active+(['ArrowUp','PageUp'].includes(e.key)?-1:1));}});
window.addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{if(!inHero())return;if(busy){if(Math.abs(scrollY-position())>2)syncScroll();return;}const i=Math.max(0,Math.min(2,Math.round((scrollY-section.offsetTop)/innerHeight)));if(i!==active)change(i,false);});},{passive:true});
window.addEventListener('resize',()=>{if(!busy&&inHero())syncScroll();});
hero.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='mouse')return;hero.style.setProperty('--mx',`${(e.clientX/innerWidth-.5)*10}px`);hero.style.setProperty('--my',`${(e.clientY/innerHeight-.5)*8}px`);});
hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--mx','0px');hero.style.setProperty('--my','0px');});
hero.addEventListener('click',e=>{if(busy){e.preventDefault();e.stopImmediatePropagation();}},true);
const dialog=document.querySelector('dialog');function show(title,content){dialog.querySelector('h2').textContent=title;dialog.querySelector('.dialog-content').innerHTML=content;dialog.showModal();}
document.querySelectorAll('.close,.close-bottom').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
function showBag(){show('Tu bolsa',bag.length?`<p>${bag.map(x=>'Beso de '+x).join('<br>')}</p><p>Esta es una muestra de la tienda. Los pedidos y pagos todavía no están disponibles.</p>`:'<p>Tu bolsa está vacía. Elige tu sabor y añade un beso.</p>');}
document.querySelector('.buy').addEventListener('click',()=>{bag.push(flavors[active]);const count=document.querySelector('.bag-count');count.hidden=false;count.textContent=bag.length;document.querySelector('.announcement').textContent=`Beso de ${flavors[active]} añadido a la bolsa`;showBag();});
document.querySelectorAll('.bag,.order-button').forEach(b=>b.addEventListener('click',showBag));
function goToSection(id){if(busy)return;if(id==='inicio'){window.scrollTo({top:0,behavior:'instant'});change(0,false);return;}document.getElementById(id)?.scrollIntoView({behavior:reduced.matches||inHero()?'instant':'smooth'});}
document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>goToSection(b.dataset.info)));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goToSection(a.hash.slice(1));}));
lock(true);Promise.all(Object.values(layers).flat().map(img=>img.decode())).then(()=>{document.querySelector('.loading').classList.add('loaded');document.querySelector('.loading').setAttribute('aria-hidden','true');lock(false);syncScroll();}).catch(()=>{document.querySelector('.loading small').textContent='No se han podido cargar las imágenes. Recarga para intentarlo de nuevo.';});
