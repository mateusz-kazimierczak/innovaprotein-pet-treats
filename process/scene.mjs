import * as T from './vendor/three-r170.mjs';
import { buildStation } from './stations.mjs';
import { group, box, cyl, mesh, mat, batch } from './model-kit.mjs';
import { preparePouch } from './pouch.mjs';

const layouts={
  launch:{source:[-3.12,-2.56],checks:[3.12,-2.56],pack:[3.12,2.56],retail:[-3.12,2.56]},
  future:{rear:[-5.52,-2.56],dry:[0,-2.56],checks:[5.52,-2.56],pack:[3.12,2.56],retail:[-3.12,2.56]}
};
const poses={
  overview:[.32,.66],source:[.32,.44],checks:[.27,.40],pack:[.18,.31],
  retail:[.24,.41],rear:[.18,.73],dry:[.30,.39]
};
const ease=t=>t*t*(3-2*t);
const clamp=T.MathUtils.clamp;
const mix=T.MathUtils.lerp;
const TAU=Math.PI*2;
function connectors(parent,layout){
  const g=group(parent),fixed=group(g),beads=[];
  const points=Object.values(layout);
  for(let i=1;i<points.length;i++){
    const [ax,az]=points[i-1],[bx,bz]=points[i];
    const dx=bx-ax,dz=bz-az;
    const edge=Math.min(2.39/Math.abs(dx),1.87/Math.abs(dz));
    const a=new T.Vector3(ax+dx*edge,-.028,az+dz*edge);
    const b=new T.Vector3(bx-dx*edge,-.028,bz-dz*edge);
    const dir=b.clone().sub(a),length=dir.length();
    const bridge=group(fixed,(a.x+b.x)/2,-.06,(a.z+b.z)/2);
    bridge.rotation.y=-Math.atan2(dir.z,dir.x);
    box(bridge,'forest',0,0,0,length+.09,.10,.46,.04);
    for(const side of [-1,1])box(bridge,'brass',0,.048,side*.216,length,.028,.035,.013);
    for(const side of [-1,1])box(bridge,'ivory',length*.11,.067,side*.055,.18,.015,.035,.006).rotation.y=side*.53;
    const dot=cyl(g,'honey',0,.018,0,.068,.038,.068,16);
    beads.push({a,b,dot});
  }
  batch(fixed);return {g,move(t){beads.forEach(({a,b,dot},i)=>{dot.position.lerpVectors(a,b,(t*.39+i*.21)%1);dot.position.y=.022;});}};
}
function contactMap(){
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const ctx=cv.getContext('2d'),gradient=ctx.createRadialGradient(64,64,3,64,64,64);
  gradient.addColorStop(0,'rgba(75,65,42,.30)');gradient.addColorStop(.65,'rgba(75,65,42,.14)');gradient.addColorStop(1,'rgba(75,65,42,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const map=new T.CanvasTexture(cv);
  return new T.MeshBasicMaterial({map,transparent:true,depthWrite:false});
}
export async function mount(view,{choose=()=>{},project=()=>{},lost=()=>{}}={}) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');
  const options={antialias:true,alpha:false,powerPreference:'low-power'};
  const context=canvas.getContext('webgl2',options);
  if(!context)throw Error('WebGL 2 unavailable');
  const renderer=new T.WebGLRenderer({...options,canvas,context});
  try {
    // The truck livery uses the same images as the header. Wait for the external files
    // when a visitor lands directly on the walkthrough on a cold cache.
    const brandImages = document.querySelectorAll('header .official-mark, header .official-wordmark');
    await Promise.all([preparePouch(), ...Array.from(brandImages, img => img.decode().catch(() => {}))]);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  canvas.setAttribute('aria-hidden','true');canvas.dataset.renderer='webgl';
  view.prepend(canvas);
  const scene=new T.Scene(),world=group(scene),camera=new T.OrthographicCamera(-5,5,4,-4,.1,110);
  scene.background=new T.Color('#e9e5d7');
  scene.add(new T.HemisphereLight('#fbfdff','#d0cbbc',1.62));
  const key=new T.DirectionalLight('#fff6e9',1.88);key.position.set(-6,13,6);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-13,right:13,top:11,bottom:-11,far:45});
  key.shadow.normalBias=.018;key.shadow.bias=-.00016;scene.add(key);
  const fill=new T.DirectionalLight('#e8f3ff',.67);fill.position.set(7,5,-7);scene.add(fill);
  const floor=mesh(scene,new T.PlaneGeometry(300,300),mat('#d7dbd2'),0,-.262,0);
  floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const shadow=contactMap(),stations={};
  for(const id of Object.keys(poses).filter(k=>k!=='overview')){
    const entry=buildStation(world,id);stations[id]=entry;entry.pivot.userData.id=id;
    const halo=mesh(entry.pivot,new T.PlaneGeometry(6.7,5.25),shadow,0,-.251,0);
    halo.rotation.x=-Math.PI/2;halo.castShadow=false;halo.receiveShadow=false;
  }
  const routes=Object.fromEntries(Object.entries(layouts).map(([k,v])=>[k,connectors(world,v)]));
  const eye=new T.Vector3(),aim=new T.Vector3(),point=new T.Vector3();
  let mode='launch',selected=null,width=0,height=0,yaw=poses.overview[0],pitch=poses.overview[1],span=8,zoom=1;
  let travel=null,playing=true,visible=false,raf=0,last=0,elapsed=0,needsPins=true,dead=false,drag=null,initialized=false;
  const scale={};
  function applyLayout(){
    const layout=layouts[mode];
    for(const [id,{pivot}] of Object.entries(stations)){
      pivot.visible=id in layout;
      if(pivot.visible)pivot.position.set(layout[id][0],0,layout[id][1]);
    }
  }
  function modelBounds(id,angle,elevation){
    // Frame the projected model bounds at the actual viewport aspect, including portrait.
    const layout=layouts[mode],targets=id?[id]:Object.keys(layout);
    const xs=targets.map(k=>layout[k][0]),zs=targets.map(k=>layout[k][1]);
    const center=new T.Vector3((Math.min(...xs)+Math.max(...xs))/2,id?1.05:.71,(Math.min(...zs)+Math.max(...zs))/2);
    const right=new T.Vector3(Math.cos(angle),0,-Math.sin(angle));
    const up=new T.Vector3(-Math.sin(angle)*Math.sin(elevation),Math.cos(elevation),-Math.cos(angle)*Math.sin(elevation));
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(const k of targets){
      const [x,z]=layout[k];
      // In the rearing close-up, fit the tray to the viewport. The overview still fits the full rack.
      const tray = id === 'rear';
      const extentX = tray ? [-1.44, 1.60] : [-2.45, 2.45];
      const extentZ = tray ? [-.02, 1.55] : [-1.91, 1.91];
      const extentY = tray ? [.43, 1.32] : [-.26, 2.57];
      for(const dx of extentX)for(const dz of extentZ)for(const y of extentY){
        const offset=new T.Vector3(x+dx,y,z+dz).sub(center);
        const px=right.dot(offset),py=up.dot(offset);
        minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);
      }
    }
    center.addScaledVector(right,(minX+maxX)/2).addScaledVector(up,(minY+maxY)/2);
    const framing=id?1.13:1.045;
    return {aim:center,span:Math.max(maxY-minY,(maxX-minX)*height/Math.max(1,width))*framing};
  }
  function pose(){
    const [y,p]=poses[selected||'overview'],bounds=modelBounds(selected,y,p);
    return {yaw:y,pitch:p,aim:bounds.aim,span:bounds.span/zoom};
  }
  function setVisibility(progress=1){
    for(const [id,{pivot}] of Object.entries(stations)){
      const inLayout=id in layouts[mode],goal=(!selected||id===selected)?1:0;
      const val=travel?mix(travel.scales[id]??0,goal,ease(Math.min(1,progress*1.28))):goal;
      scale[id]=val;pivot.visible=inLayout&&val>.006;pivot.scale.setScalar(Math.max(.001,val));
    }
    for(const [id,route] of Object.entries(routes))route.g.visible=id===mode&&!selected;
  }
  function draw(reproject=true){
    if(!width||!height||dead)return;
    const aspect=width/height;
    camera.left=-span*aspect/2;camera.right=-camera.left;camera.top=span/2;camera.bottom=-camera.top;
    eye.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
    camera.position.copy(aim).addScaledVector(eye,35);camera.lookAt(aim);camera.updateProjectionMatrix();camera.updateMatrixWorld();
    renderer.render(scene,camera);
    if(!reproject&&!needsPins)return;
    needsPins=false;
    if(!selected){
      const pins=[];
      for(const [id,[x,z]] of Object.entries(layouts[mode])){
        point.set(x-1.79,.20,z+1.43).project(camera);
        pins.push({id,x:(point.x+1)/2,y:(1-point.y)/2});
      }
      project(pins);
    }else project([]);
  }
  function schedule(){if(visible&&!dead&&!raf)raf=requestAnimationFrame(frame);}
  function frame(stamp){
    raf=0;if(!visible||dead)return;
    if(!travel&&last&&stamp-last<32){schedule();return;}
    const movingCamera=Boolean(travel);
    const dt=last?(stamp-last)/1000:0;last=stamp;
    if(playing)elapsed+=dt;
    if(travel){
      travel.t=reducedMotion.matches?travel.duration:travel.t+dt;const progress=Math.min(1,travel.t/travel.duration),v=ease(progress);
      yaw=mix(travel.yaw,travel.to.yaw,v);pitch=mix(travel.pitch,travel.to.pitch,v);
      span=mix(travel.span,travel.to.span,v);aim.lerpVectors(travel.aim,travel.to.aim,v);
      setVisibility(progress);if(progress===1)travel=null;
    }
    for(const s of Object.values(stations))if(s.pivot.visible)s.animate?.(elapsed);
    routes[mode].move(elapsed);draw(movingCamera);
    if(playing||travel)schedule();else last=0;
  }
  function settle(){
    const dest=pose();aim.copy(dest.aim);span=dest.span;yaw=dest.yaw;pitch=dest.pitch;
    travel=null;setVisibility();if(visible)draw();
  }
  function select(nextMode,id,instant=false){
    const modeChanged=mode!==nextMode;needsPins=true;mode=nextMode;selected=id;zoom=1;applyLayout();
    if(!initialized||instant||!playing||reducedMotion.matches||!visible||modeChanged){initialized=true;settle();}
    else{
      const dest=pose();
      dest.yaw=yaw+Math.atan2(Math.sin(dest.yaw-yaw),Math.cos(dest.yaw-yaw));
      travel={yaw,pitch,span,aim:aim.clone(),scales:{...scale},t:0,duration:.92,to:dest};setVisibility(0);
    }
    schedule();
  }
  function resize(){
    const w=view.clientWidth,h=view.clientHeight;if(!w||!h||w===width&&h===height)return;
    width=w;height=h;renderer.setSize(w,h,false);
    if(travel){
      travel.to=pose();travel.to.yaw=travel.yaw+Math.atan2(Math.sin(travel.to.yaw-travel.yaw),Math.cos(travel.to.yaw-travel.yaw));
    }else{const fit=modelBounds(selected,yaw,pitch);span=fit.span/zoom;aim.copy(fit.aim);}
    if(visible)draw();schedule();
  }
  function orbit(dx,dy=0){
    if(travel){travel=null;setVisibility();}
    yaw+=dx;pitch=clamp(pitch+dy,.19,1.17);
    const fit=modelBounds(selected,yaw,pitch);aim.copy(fit.aim);span=fit.span/zoom;if(visible)draw();
  }
  function setMotion(on){
    playing=on;if(!on&&travel)settle();if(!on)last=0;schedule();
  }
  function setVisible(on){
    visible=on;last=0;
    if(on)schedule();else{cancelAnimationFrame(raf);raf=0;}
  }
  const rc=new T.Raycaster();
  canvas.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(drag?.id!==e.pointerId)return;
    if(Math.abs(e.clientX-drag.originX)+Math.abs(e.clientY-drag.originY)>6)drag.moved=true;
    if(drag.moved)orbit((drag.x-e.clientX)*.009,(e.clientY-drag.y)*.003);
    drag.x=e.clientX;drag.y=e.clientY;
  });
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('pointerup',e=>{
    if(drag?.id!==e.pointerId)return;
    const click=!drag.moved;drag=null;if(!click||selected)return;
    const b=canvas.getBoundingClientRect();
    rc.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2),camera);
    for(const hit of rc.intersectObjects(Object.values(stations).filter(s=>s.pivot.visible).map(s=>s.pivot),true)){
      let n=hit.object;while(n&&!n.userData.id)n=n.parent;
      if(n){choose(n.userData.id);break;}
    }
  });
  const ro=new ResizeObserver(resize);ro.observe(view);
  canvas.addEventListener('webglcontextlost',()=>{dead=true;setVisible(false);ro.disconnect();canvas.remove();lost();},{once:true});
  applyLayout();resize();select(mode,null,true);
  return {select,setVisible,setMotion,orbit,zoomBy(factor){zoom=clamp(zoom*factor,.85,1.85);orbit(0);}};
}
