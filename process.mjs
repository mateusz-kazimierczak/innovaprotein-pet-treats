import * as T from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

export function mount(view, choose) {
  const scene = new T.Scene();
  scene.background = new T.Color('#dce8cf');
  scene.fog = new T.Fog('#dce8cf',36,65);
  const renderer = new T.WebGLRenderer({antialias:true, alpha:false, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden','true');
  view.prepend(canvas);
  const cam = new T.OrthographicCamera(-10,10,4,-4,.1,100);
  const sky = new T.HemisphereLight('#fff9e9','#839581',2.05);
  const sun = new T.DirectionalLight('#fff4d8',2.4); sun.position.set(-6,10,7);
  scene.add(sky,sun);
  const stage = new T.Group();scene.add(stage);
  const colors={leaf:'#7c9d66',green:'#295544',lime:'#badc81',paper:'#f6edd1',sand:'#d2af7a',wood:'#957448',metal:'#91a69e',glass:'#a0c9b6',dark:'#273d36',gold:'#dcae5c',white:'#fbf7e9',road:'#a2ab96'};
  const presets={}; const mat=(key)=>presets[key]??=(new T.MeshStandardMaterial({color:colors[key]||key,roughness:.82}));
  const mesh=(g,c,p,x,y,z)=>{const m=new T.Mesh(g,mat(c)); m.position.set(x,y,z);p.add(m);return m;};
  const box=(p,c,x,y,z,w,h,d)=>mesh(new T.BoxGeometry(w,h,d),c,p,x,y,z);
  const cyl=(p,c,x,y,z,r,h,n=16)=>mesh(new T.CylinderGeometry(r,r,h,n),c,p,x,y,z);
  const orb=(p,c,x,y,z,rx,ry,rz)=>{const m=mesh(new T.SphereGeometry(1,12,8),c,p,x,y,z);m.scale.set(rx,ry,rz);return m;};
  const padMat=Array.from({length:4},()=>new T.MeshStandardMaterial({color:'#b4c3a7',roughness:.88}));
  const pickables=[],stations=[],rings=[];
  const positions=[-6,-2,2,6];
  box(stage,'road',0,-.15,0,16.8,.25,3.6);
  for(let i=0;i<16;i++) box(stage,'paper',-7.5+i,-.005,1.53,.48,.012,.04);
  for(let i=0;i<3;i++) {
    const x=positions[i]+2;
    box(stage,'green',x,.035,.97,.44,.04,.08);
    const tip=cyl(stage,'green',x+.27,.042,.97,.13,.04,3); tip.rotation.y=-Math.PI/6;
  }
  const floor=new T.GridHelper(88,44,'#a7ba9f','#c6d5bc');floor.position.y=-.29;scene.add(floor);
  positions.forEach((x,i)=>{
    const base=box(stage,'paper',x,.08,-.08,3.48,.27,2.83);base.material=padMat[i];
    const stripe=box(stage,'lime',x,.226,1.25,3.1,.032,.11);rings.push(stripe);
    const g=new T.Group();g.position.set(x,.22,-.12);g.userData.stage=i;stage.add(g);stations.push(g);pickables.push(g);
    const target=box(g,'paper',0,.55,0,3.1,1.25,2.5);
    target.material=new T.MeshBasicMaterial({visible:false});
  });
  function crate(p,x,y,z) {
    box(p,'wood',x,y+.16,z,.87,.32,.68);
    box(p,'sand',x,y+.34,z,.88,.065,.7);
    for(const side of [-1,1]) for(const dx of [-.32,.32])box(p,'sand',x+dx,y+.16,z+side*.346,.09,.32,.027);
    box(p,'paper',x,y+.22,z+.353,.25,.09,.014);
  }
  function rack(p,x,y,z) {
    for(const dx of [-.56,.56])for(const dz of [-.39,.39])box(p,'green',x+dx,y+.58,z+dz,.05,1.16,.05);
    for(let k=0;k<4;k++){box(p,'metal',x,y+.12+k*.28,z,1.18,.055,.84);for(const dx of [-.28,.28])box(p,k%2?'sand':'lime',x+dx,y+.195+k*.28,z,.48,.105,.63);}
  }
  function bag(p,x,y,z,scale=1) {
    const g=new T.Group(); g.position.set(x,y,z);g.scale.setScalar(scale);p.add(g);
    orb(g,'paper',0,.34,0,.244,.32,.107);
    box(g,'paper',0,.605,0,.44,.08,.13);
    box(g,'green',0,.34,.103,.27,.24,.03);
    box(g,'lime',0,.37,.125,.17,.04,.021);
    box(g,'gold',0,.29,.125,.09,.022,.021);
  }
  const launch=new T.Group(),future=new T.Group();stations[0].add(launch,future);
  box(launch,'wood',-.4,.055,.18,1.9,.11,1.34);
  for(const x of [-.92,.05])for(const z of [-.23,.51])crate(launch,x,.11,z);
  crate(launch,-.92,.49,.51);
  box(launch,'green',.95,.51,-.45,.75,1.02,.73);
  box(launch,'lime',.95,.88,-.075,.42,.08,.02);
  box(launch,'paper',.95,.49,-.075,.4,.36,.02);
  rack(future,-.54,0,.24);
  box(future,'paper',.51,.72,-.28,1.58,1.44,.97);
  const roof=box(future,'green',.51,1.48,-.28,1.69,.17,1.08);roof.rotation.z=-.065;
  box(future,'glass',.53,.92,.214,1.22,.43,.035);
  box(future,'dark',.86,.39,.221,.38,.78,.03);
  const qa=stations[1];
  box(qa,'green',-.38,.48,.16,1.83,.86,.85);
  box(qa,'white',-.38,.93,.16,1.95,.12,.94);
  box(qa,'dark',-.86,1.08,.15,.53,.16,.48);
  cyl(qa,'metal',-.86,1.19,.15,.22,.075);
  box(qa,'metal',.2,1.15,-.03,.73,.31,.58);
  box(qa,'green',.2,1.15,.266,.52,.16,.022);
  for(let n=0;n<3;n++)box(qa,'lime',.06+n*.14,1.15,.285,.06,.039,.012);
  for(let n=0;n<7;n++){const a=n*2.39;orb(qa,'gold',-.86+Math.cos(a)*.14,1.25,.15+Math.sin(a)*.14,.052,.025,.032);}
  crate(qa,1.03,0,-.42);
  const pack=stations[2];
  for(const z of [-.36,.41])for(const x of [-1.1,.25])box(pack,'green',x,.28,z,.09,.55,.09);
  box(pack,'metal',-.42,.59,.04,1.85,.14,.88);
  for(let n=0;n<12;n++)box(pack,n%2?'glass':'dark',-1.26+n*.153,.67,.04,.065,.034,.79);
  box(pack,'green',-.67,1,-.35,.14,.67,.15);
  box(pack,'gold',-.46,1.33,.01,.58,.16,.78);
  for(const x of [-.97,-.27,.4])bag(pack,x,.68,.09,.81);
  crate(pack,1.05,0,-.37);
  const dist=stations[3];
  box(dist,'paper',.55,.59,-.47,1.55,1.17,.96);
  box(dist,'green',.55,1.23,-.47,1.67,.15,1.1);
  box(dist,'glass',.77,.7,.021,.73,.49,.045);
  box(dist,'dark',.01,.44,.024,.32,.88,.038);
  for(let i=0;i<6;i++)box(dist,i%2?'paper':'gold',-.09+i*.25,.96,.14,.25,.095,.37);
  const van=new T.Group();dist.add(van);van.position.set(-.43,0,.61);
  box(van,'dark',0,.22,0,1.79,.13,.63);box(van,'green',-.2,.55,0,1.22,.62,.67);box(van,'lime',.62,.44,0,.53,.42,.63);
  box(van,'glass',.59,.57,.321,.3,.2,.02);
  box(van,'paper',-.27,.59,.345,.52,.13,.02);
  for(const x of [-.56,.54])for(const z of [-.325,.325]){const w=cyl(van,'dark',x,.17,z,.17,.10);w.rotation.x=Math.PI/2;const hub=cyl(van,'metal',x,.17,z*1.16,.074,.025);hub.rotation.x=Math.PI/2;}
  let yaw=.28,pitch=.60,zoom=1, width=0,height=0,phase='launch',active=0,pointer=null;
  const home=()=>{yaw=.28;pitch=.60;zoom=1;paint();};
  function paint(){
    const w=view.clientWidth,h=view.clientHeight;
    if(!w||!h)return;
    if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);}
    const aspect=w/h,spread=Math.max(8.7,3.55*aspect)/zoom;
    cam.left=-spread;cam.right=spread;cam.top=spread/aspect;cam.bottom=-spread/aspect;
    cam.updateProjectionMatrix();
    cam.position.set(26*Math.sin(yaw)*Math.cos(pitch),26*Math.sin(pitch),26*Math.cos(yaw)*Math.cos(pitch));
    cam.lookAt(0,.45,0);
    renderer.render(scene,cam);
  }
  function update(i,mode){
    active=i;phase=mode;
    launch.visible=phase==='launch';future.visible=!launch.visible;
    padMat.forEach((m,j)=>m.color.set(j===active?'#86a873':'#b4c3a7'));
    rings.forEach((m,j)=>m.visible=j===active);
    paint();
  }
  const ray=new T.Raycaster();
  canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(pointer?.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.abs(dx)+Math.abs(dy)>4)pointer.moved=true;if(pointer.moved){yaw=pointer.yaw-dx*.008;pitch=T.MathUtils.clamp(pointer.pitch+dy*.006,.29,1.31);paint();}});
  canvas.addEventListener('pointerup',e=>{if(pointer?.id!==e.pointerId)return;const p=pointer;pointer=null;if(p.moved)return;const b=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),cam);for(const hit of ray.intersectObjects(pickables,true)){let node=hit.object;while(node&&node.userData.stage===undefined)node=node.parent;if(node){choose(node.userData.stage);break;}}});
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('webglcontextlost',()=>{view.parentElement.classList.remove('has-3d');});
  canvas.addEventListener('webglcontextrestored',()=>{requestAnimationFrame(()=>{paint();view.parentElement.classList.add('has-3d');});});
  new ResizeObserver(paint).observe(view);
  update(0,'launch');
  return {update,home,zoomBy(n){zoom=T.MathUtils.clamp(zoom*n,1,1.65);paint();}};
}
