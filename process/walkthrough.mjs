import {routes,language} from './content.mjs';

const root=document.querySelector('.flow-shell'), section=root.closest('section');
const find=selector=>root.querySelector(selector);
const stage=find('.flow-stage'),poster=find('.flow-poster'),pins=find('.flow-pins'),steps=find('.flow-steps');
const film=find('.flow-film');
const detail=find('.flow-panel'),motionPref=matchMedia('(prefers-reduced-motion: reduce)');
const icons={
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10m-5-17 9 5"/>',
  map:'<path d="m3 5 6-2 6 2 6-2v15l-6 2-6-2-6 2zM9 3v15m6-13v15"/>',
  left:'<path d="M7 5 3 9l4 4M3 9h10c4 0 7 2 7 5s-3 5-8 5"/>',
  right:'<path d="m17 5 4 4-4 4m4-4H11c-4 0-7 2-7 5s3 5 8 5"/>',
  plus:'<path d="M5 12h14m-7-7v14"/>',minus:'<path d="M5 12h14"/>',
  pause:'<path d="M8 5v14m8-14v14" stroke-width="3"/>',play:'<path d="m7 4 12 8-12 8z"/>'
};
function icon(key){return '<svg class="flow-icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[key]+'</svg>';}
let mode='launch',id=null,angle=0,zoom=1,model,started=false,onScreen=false,pinData,projected=[];
let playing=!motionPref.matches, fallback=false, filmKey='', filmFailed=false;
let transitionLayer;
const copy=()=>language[document.documentElement.lang]||language.en;
const route=()=>routes[mode];
const stageNum=i=>String(i+1).padStart(2,'0');
const viewKey=()=>id||mode;
function cropPoster(){
  const w=stage.clientWidth,h=stage.clientHeight,ratio=800/570;
  const pw=Math.min(w,h*ratio),ph=pw/ratio;
  return {w,h,pw,ph};
}
function placePins(points){
  projected=points;
  const {w,h,pw,ph}=cropPoster();
  for(const pin of pins.children){
    const point=points.find(p=>p.id===pin.dataset.station);
    pin.hidden=!point||!!id;
    if(!point)continue;
    const x=model?point.x:((w-pw)/2+point.x*pw)/w;
    const y=model?point.y:((h-ph)/2+point.y*ph)/h;
    const left=(x*100).toFixed(2)+'%',top=(y*100).toFixed(2)+'%';
    if(pin.style.left!==left)pin.style.left=left;
    if(pin.style.top!==top)pin.style.top=top;
  }
}
function updateFilm(){
  const key=viewKey();
  const eligible=fallback&&key!=='source'&&angle===0&&!filmFailed;
  const show=eligible&&(playing||filmKey===key&&film.currentTime>0);
  film.hidden=!show;
  if(!show||!onScreen||document.hidden||!playing){film.pause();return;}
  if(filmKey!==key){
    filmKey=key;film.src=new URL('./views/'+key+'.mp4',import.meta.url).href;
    film.poster=poster.src;
  }
  film.style.transform='scale('+zoom+')';
  const request=film.play();
  request?.catch(err=>{if(err.name!=='AbortError'&&filmKey===key){film.hidden=true;}});
}
film.addEventListener('error',()=>{filmFailed=true;film.hidden=true;renderText();});
function stageTransition(next){
  transitionLayer?.remove();transitionLayer=null;
  if(!fallback||!playing||motionPref.matches||!onScreen||document.hidden||!stage.animate||id===next)return;
  const old=poster.cloneNode();old.removeAttribute('alt');old.setAttribute('aria-hidden','true');old.className='flow-dissolve';
  old.draggable=false;stage.append(old);transitionLayer=old;
  const pin=projected.find(p=>p.id===next);
  if(!id&&pin){
    const {w,h,pw,ph}=cropPoster();
    const x=(w-pw)/2+pin.x*pw,y=(h-ph)/2+pin.y*ph;
    old.style.transformOrigin=x+'px '+y+'px';
  }
  const effect=old.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale('+(next?1.36:.88)+')'}],{duration:480,easing:'ease-in-out',fill:'forwards'});
  effect.onfinish=()=>{old.remove();if(transitionLayer===old)transitionLayer=null;};
}
function posterView(){
  poster.src=new URL('./views/'+viewKey()+'-'+angle+'.webp',import.meta.url).href;
  poster.style.transform='scale('+zoom+')';
  if(!model)placePins(zoom===1?(pinData?.[mode]?.[angle]||[]):[]);
  updateFilm();
}
function routeControls(){
  steps.replaceChildren();pins.replaceChildren();steps.style.setProperty('--count',route().length);
  for(const [i,key] of route().entries()){
    const btn=document.createElement('button');btn.type='button';btn.className='flow-step';btn.dataset.station=key;
    btn.setAttribute('aria-controls',detail.id);
    const num=document.createElement('span');num.className='flow-index';num.textContent=stageNum(i);num.setAttribute('aria-hidden','true');
    btn.append(num,document.createElement('span'));btn.addEventListener('click',()=>select(key,true));steps.append(btn);
    const pin=document.createElement('button');pin.type='button';pin.hidden=true;pin.dataset.station=key;pin.className='flow-pin';
    pin.textContent=i+1;pin.setAttribute('aria-controls',detail.id);pin.addEventListener('click',()=>select(key));pins.append(pin);
  }
}
function write(el,value){if(el.textContent!==value)el.textContent=value;}
function renderText(){
  const c=copy(),index=route().indexOf(id),data=id?c[id].slice(1):c[mode+'Intro'];
  for(const el of root.querySelectorAll('[data-text]'))write(el,c[el.dataset.text]);
  for(const el of root.querySelectorAll('[data-label]'))el.setAttribute('aria-label',c[el.dataset.label]);
  for(const el of root.querySelectorAll('[data-tool]')){
    const key=el.dataset.tool==='motion'?(playing?'pause':'play'):el.dataset.tool;
    el.setAttribute('aria-label',c[key]);el.title=c[key];
  }
  for(const el of root.querySelectorAll('[data-mode]'))el.setAttribute('aria-pressed',String(mode===el.dataset.mode));
  [...steps.children].forEach((el,i)=>{
    const key=el.dataset.station;write(el.lastElementChild,c[key][0]);el.setAttribute('aria-pressed',String(key===id));
    pins.children[i].setAttribute('aria-label',c.stage+' '+(i+1)+' · '+c[key][0]);pins.children[i].title=c[key][0];
  });
  find('[data-slot="stamp"]').textContent=id?c[id][0]:c.overview;
  write(find('[data-slot="kicker"]'),c[mode]+' · '+(id?c.stage+' '+(index+1)+' '+c.of+' '+route().length:route().length+' '+c.stages));
  for(const [i,name] of ['title','copy','input','output'].entries())write(find('[data-slot="'+name+'"]'),data[i]);
  find('[data-slot="from"]').textContent=id?c.receives:c.starts;
  find('[data-slot="to"]').textContent=id?c.yields:c.ends;
  find('[data-action="overview"]').hidden=!id;
  find('[data-action="prev"]').hidden=index<1;
  find('[data-action="next"]').textContent=!id?c.start:index===route().length-1?c.back:c.next;
  find('.flow-art').hidden=id!=='pack';
  find('.flow-art img').alt=c.artAlt;
  poster.alt=id?data[0]+'. '+data[1]:data[0]+'. '+route().map(key=>c[key][0]).join(' · ');
  find('[data-slot="hint"]').textContent=model?c.drag:c.still;
  const motion=find('[data-tool="motion"]');motion.hidden=!model&&(!fallback||id==='source'||angle!==0||filmFailed);motion.innerHTML=icon(playing?'pause':'play');
}
function reveal(){
  if(!matchMedia('(max-width:720px)').matches)return;
  const bounds=stage.getBoundingClientRect();
  if(bounds.top<-65||bounds.bottom<130)find('.flow-view').scrollIntoView({block:'start',behavior:motionPref.matches?'instant':'smooth'});
}
function select(key,revealView=false){
  if(key!==null&&!route().includes(key))return;
  stageTransition(key);id=key;angle=0;zoom=1;posterView();model?.select(mode,id);
  if(id)placePins([]);
  renderText();if(revealView)reveal();
}
function turn(step){
  if(model){model.orbit(step*Math.PI/6);return;}
  angle=(angle+step+12)%12;posterView();renderText();
}
function magnify(factor){
  if(model){model.zoomBy(factor);return;}
  zoom=Math.max(.85,Math.min(1.85,zoom*factor));posterView();
}
for(const el of root.querySelectorAll('[data-icon]'))el.innerHTML=icon(el.dataset.icon);
for(const el of root.querySelectorAll('[data-mode]'))el.addEventListener('click',()=>{
  if(mode===el.dataset.mode)return;mode=el.dataset.mode;routeControls();select(null);
});
find('[data-action="overview"]').addEventListener('click',()=>{
  select(null);find('[data-action="next"]').focus({preventScroll:true});
});
find('[data-action="next"]').addEventListener('click',()=>select(route()[route().indexOf(id)+1]||null,true));
find('[data-action="prev"]').addEventListener('click',()=>{
  select(route()[route().indexOf(id)-1]||null,true);
  if(find('[data-action="prev"]').hidden)find('[data-action="next"]').focus({preventScroll:true});
});
find('[data-tool="rotateLeft"]').addEventListener('click',()=>turn(-1));
find('[data-tool="rotateRight"]').addEventListener('click',()=>turn(1));
find('[data-tool="zoomIn"]').addEventListener('click',()=>magnify(1.18));
find('[data-tool="zoomOut"]').addEventListener('click',()=>magnify(1/1.18));
find('[data-tool="motion"]').addEventListener('click',()=>{playing=!playing;model?.setMotion(playing);updateFilm();renderText();});
motionPref.addEventListener('change',()=>{playing=!motionPref.matches;model?.setMotion(playing);updateFilm();renderText();});
let touch;
poster.addEventListener('dragstart',e=>e.preventDefault());
poster.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0){touch={x:e.clientX,id:e.pointerId};poster.setPointerCapture(e.pointerId);}});
poster.addEventListener('pointermove',e=>{
  if(touch?.id!==e.pointerId||model)return;
  const dx=e.clientX-touch.x;if(Math.abs(dx)>=26){turn(dx<0?1:-1);touch.x=e.clientX;}
});
for(const event of ['pointerup','pointercancel'])poster.addEventListener(event,()=>{touch=null;});
function updateVisibility(){model?.setVisible(onScreen&&!document.hidden);updateFilm();}
async function start(){
  if(started)return;started=true;
  try{
    const {mount}=await import('./scene.mjs');
    model=await mount(stage,{choose:select,project:placePins,lost(){
      model=null;fallback=true;root.dataset.live='false';posterView();renderText();
    }});
    root.dataset.live='true';model.setMotion(playing);model.select(mode,id,true);updateVisibility();renderText();
  }catch{fallback=true;root.dataset.live='false';posterView();renderText();}
}
routeControls();select(null);root.dataset.ready='true';find('.flow-fallback-copy').hidden=true;
new MutationObserver(renderText).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
new ResizeObserver(()=>{if(!model)placePins(projected);}).observe(stage);
document.addEventListener('visibilitychange',updateVisibility);
fetch(new URL('./views/pins.json',import.meta.url)).then(r=>r.json()).then(data=>{pinData=data;if(!model)posterView();}).catch(()=>{});
if('IntersectionObserver' in window){
  const pre=new IntersectionObserver(([e])=>{if(e.isIntersecting){pre.disconnect();start();}},{rootMargin:'240px'});pre.observe(stage);
  new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;updateVisibility();}).observe(stage);
}else{onScreen=true;start();}
