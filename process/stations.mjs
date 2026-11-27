import * as T from './vendor/three-r170.mjs';
import { group, mesh, box, cyl, oval, bar, mat, decal, sign, graphics, carton, pallet, shelf, plant, plinth, batch } from './model-kit.mjs';
import { pouch } from './pouch.mjs';

function sack(p,x,y,z,scale=1) {
  const g=group(p,x,y,z);g.scale.setScalar(scale);
  oval(g,'sand',0,.33,0,.3,.36,.23);
  cyl(g,'tape',0,.62,0,.13,.12,.08,12);cyl(g,'woodDark',0,.583,0,.11,.035,.11,12);
  box(g,'ivory',0,.33,.227,.18,.16,.012,.005);
}
function tote(p,x,y,z,w,d,h) {
  box(p,'mint',x,y+h*.5,z,w,h,d,.035);
  box(p,'forest',x,y+h,z,w*.95,.018,d*.93,.008);
  for(const s of [-1,1]){
    box(p,'aqua',x+s*w*.485,y+h+.016,z,.032,.062,d,.012);
    box(p,'aqua',x,y+h+.016,z+s*d*.48,w,.062,.032,.012);
  }
}
function grains(p,x,y,z,w,d,n) {
  for(let i=0;i<n;i++) {
    const u=((i*73)%101)/101-.5,v=((i*43)%107)/107-.5;
    const b=oval(p,i%4===1?'woodDark':'sand',x+u*w,y+(i%3)*.008,z+v*d,.053,.023,.027);
    b.rotation.y=i*2.38;
  }
}
function sourcing(p) {
  shelf(p,-.58,.075,-.82,2.76,2.30,.99,[.22,1.1,2.05]);
  for(const [level,count] of [[.34,3],[1.22,4]]){
    for(let i=0;i<count;i++)carton(p,-1.47+i*.57,level,-.80,.52,.42+(i%2)*.12,.61);
  }
  sign(p,'LOT  /  Nº',-.59,2.128,-.307,1.32,.21,{bg:'#d7a15c',fg:'#302f24',size:.66});
  pallet(p,.98,.076,-.5,1.30,1.16);
  for(const dx of [-.30,.30])for(const dz of [-.23,.22])sack(p,.99+dx,.25,-.49+dz,.9);
  pallet(p,-.70,.076,.80,1.94,.95);
  tote(p,-.7,.25,.80,1.55,.79,.46);
  grains(p,-.70,.724,.80,1.38,.64,68);
  // The pallet jack's fork runs under the sample pallet.
  const jack=group(p,.89,.09,.98);jack.rotation.y=.14;
  for(const z of [-.19,.19])box(jack,'honey',-.37,.075,z,.98,.105,.11,.025);
  box(jack,'orange',.2,.18,0,.31,.29,.52,.06);
  bar(jack,'ink',[.20,.29,0],[.57,.99,0],.044);
  const handle=mesh(jack,new T.TorusGeometry(.13,.025,8,18),'rubber',.58,1.03,0);handle.scale.x=1.4;
  for(const z of [-.23,.23])cyl(jack,'rubber',.2,.13,z,.112,.075).rotation.x=Math.PI/2;
}
function checks(p,animated) {
  // A tiled splashback, detailed bench, balance and physical batch record.
  box(p,'mint',-.08,1.11,-1.30,3.9,2.08,.14,.055);
  for(let i=0;i<9;i++)box(p,'aqua',-1.85+i*.44,1.09,-1.222,.012,1.95,.01);
  for(let i=0;i<5;i++)box(p,'aqua',-.08,.31+i*.41,-1.222,3.76,.013,.01);
  box(p,'forest',-.08,2.19,-1.30,4,.105,.22,.04);
  box(p,'green',-.23,.55,-.62,3.34,.98,.98,.06);
  for(const x of [-1.30,-.29,.76]){
    box(p,'mint',x,.55,-.101,.93,.78,.046,.022);
    box(p,'chrome',x+.24,.81,-.069,.27,.033,.028,.010);
  }
  box(p,'chalk',-.23,1.11,-.60,3.54,.16,1.15,.06);
  box(p,'ink',-1.04,1.265,-.54,.86,.16,.65,.056);
  cyl(p,'chrome',-1.04,1.38,-.59,.32,.065);
  cyl(p,'ivory',-1.04,1.45,-.59,.31,.095,.22);
  grains(p,-1.04,1.51,-.59,.36,.30,12);
  sign(p,'0.00',-1.03,1.28,-.201,.32,.08,{bg:'#283c38',fg:'#b4efd3',size:.85});
  box(p,'steel',.48,1.32,-.84,.11,.30,.16,.025);
  box(p,'ink',.47,1.59,-.83,.91,.56,.09,.039);
  sign(p,'LOT  /  PY',.47,1.62,-.779,.77,.31,{bg:'#245b50',fg:'#e2efb8'});
  for(let k=0;k<3;k++){
    cyl(p,'aqua',1.10+k*.18,1.39,-.65,.071,.4);
    cyl(p,'brass',1.10+k*.18,1.61,-.65,.075,.055);
  }
  const bench=group(p,.20,.08,.80);
  for(const x of [-.72,.72])for(const z of [-.33,.33])box(bench,'steel',x,.43,z,.067,.86,.067,.015);
  box(bench,'ivory',0,.88,0,1.78,.10,.88,.04);
  const sheet=graphics(420,300,(c,W,H)=>{
    c.fillStyle='#fff6dc';c.fillRect(0,0,W,H);c.fillStyle='#35564a';c.font='bold 40px sans-serif';c.fillText('LOT / Nº',27,54);
    for(let i=0;i<4;i++){c.fillStyle='#94a58b';c.fillRect(30,88+i*41,142,6);c.strokeRect(186,83+i*41,20,18);}
    c.fillStyle='#26382f';for(let x=260,i=0;x<390;i++){const w=2+(i*7%5);c.fillRect(x,84,w,125);x+=w+3;}
  });
  decal(bench,sheet,-.14,.94,.02,.88,.59).rotation.x=-Math.PI/2;
  const scanner=group(bench,.61,.93,-.06);
  box(scanner,'forest',0,.075,0,.22,.15,.30,.045);
  bar(scanner,'green',[0,.12,0],[-.12,.43,0],.06);
  box(scanner,'ink',-.18,.45,0,.31,.15,.20,.045);
  const line=box(animated,'orange',.25,1.025,.8,.16,.008,.26);
  return time=>{line.position.x=.23+.14*Math.sin(time*1.25);};
}
function packaging(p,animated) {
  const belt=group(p,-.71,.08,-.25);
  for(const x of [-1.17,1.17])for(const z of [-.34,.34]){
    box(belt,'green',x,.49,z,.10,.98,.10,.02);
    box(belt,'ink',x,.04,z,.21,.08,.20,.02);
  }
  box(belt,'steel',0,.88,0,2.86,.23,1.04,.095);
  box(belt,'ink',0,1,0,2.76,.12,.90,.05);
  for(let i=0;i<18;i++)box(belt,'steel',-1.31+i*.153,1.065,0,.019,.012,.82);
  for(const z of [-.55,.55])box(belt,'brass',0,.88,z,2.62,.06,.035,.015);
  for(const z of [-.46,.46])box(belt,'mint',-.24,1.48,z,.22,.86,.11,.025);
  box(belt,'green',-.24,2.02,0,.60,.42,1.15,.095);
  box(belt,'brass',-.24,1.78,0,.39,.09,.81,.022);
  cyl(belt,'steel',-.24,2.38,0,.32,.38,.13);
  cyl(belt,'chrome',-.24,2.59,0,.34,.07);
  cyl(belt,'ink',-.24,2.631,0,.27,.012);
  for(let i=0;i<4;i++)box(belt,'ink',-.43+i*.072,2.03,-.583,.033,.17,.018,.006);
  for(const x of [-.47,-.01])cyl(belt,'chrome',x,2.18,.50,.035,.06);
  box(belt,'chalk',-.24,1.68,0,.12,.15,.50,.02);
  sign(belt,'IP',-.24,2.025,.585,.30,.17,{bg:'#235345',size:.78});
  const moving=group(animated,-.71,1.154,-.25);
  const units=[0,1,2].map(i=>{const g=pouch(moving,0,0,0,.63,-.07);batch(g);return g;});
  pallet(p,-1.40,.08,-1.23,1.30,.58);carton(p,-1.43,.25,-1.23,.85,.43,.54);
  const stand=group(p,1.38,.08,.38);
  cyl(stand,'forest',0,.105,0,.77,.21,.79,48);cyl(stand,'brass',0,.22,0,.77,.025,.77,48);
  cyl(stand,'ivory',0,.268,0,.74,.08,.75,48);
  pouch(stand,0,.31,0,1.83,.29);
  return time=>{
    units.forEach((bag,i)=>{
      const u=(time*.078+i/3)%1;bag.position.x=(u-.5)*2.6;
      // The belt receives and releases each pack behind its end rollers.
      const edge=Math.min(1,u/.07,(1-u)/.07);
      bag.scale.setScalar(.63*Math.max(.015,edge));
    });
  };
}
function makeLogo() {
  const mark=document.querySelector('.official-mark'),word=document.querySelector('.official-wordmark');
  return graphics(640,180,(ctx,w,h)=>{
    ctx.fillStyle='#f6eed7';ctx.fillRect(0,0,w,h);
    if(mark?.naturalWidth&&word?.naturalWidth){
      const scale=Math.min(116/mark.naturalWidth,130/mark.naturalHeight);
      const mh=mark.naturalHeight*scale,mw=mark.naturalWidth*scale;
      ctx.drawImage(mark,24,(h-mh)/2,mw,mh);
      const ww=w-65-mw,wh=ww*word.naturalHeight/word.naturalWidth;
      ctx.drawImage(word,43+mw,(h-wh)/2,ww,wh);
    }
  });
}
function truck(p,logo) {
  const g=group(p);
  box(g,'rubber',0,.24,0,1.6,.13,.59,.05);
  box(g,'green',-.26,.72,0,1.13,.79,.66,.075);
  box(g,'mint',-.26,1.13,0,1.12,.055,.66,.026);
  box(g,'honey',.60,.48,0,.59,.43,.64,.09);
  box(g,'honey',.51,.77,0,.44,.34,.61,.075);
  for(const z of [-1,1]){
    box(g,'glass',.51,.78,z*.309,.31,.205,.016,.005);
    box(g,'ink',.60,.60,z*.327,.095,.027,.018);
    const panel=decal(g,logo,-.25,.76,z*.338,.93,.28);if(z<0)panel.rotation.y=Math.PI;
    box(g,'brass',-.26,.43,z*.336,1.07,.055,.025,.01);
    box(g,'chalk',.899,.49,z*.215,.028,.072,.12,.012);
  }
  box(g,'glass',.737,.765,0,.021,.2,.47,.009);
  box(g,'chrome',.909,.32,0,.09,.09,.69,.03);
  const wheels=[];
  for(const x of [-.56,.53])for(const z of [-.32,.32]){
    const w=group(g,x,.221,z);wheels.push(w);
    cyl(w,'rubber',0,0,0,.203,.115).rotation.x=Math.PI/2;
    const side=Math.sign(z);cyl(w,'steel',0,0,side*.065,.106,.024).rotation.x=Math.PI/2;
    box(w,'ink',0,0,side*.081,.026,.115,.012,.005);
  }
  wheels.forEach(batch);
  return {g,wheels};
}
function distribution(p,animated) {
  const logo=makeLogo();
  // The loop passes a dispatch bay and a shopfront. Both are on the same road.
  const pts=[[-1.55,1.24],[0,1.24],[1.56,1.24],[1.91,.86],[1.60,.40],[0,.36],[-1.54,.40],[-1.92,.82]];
  const path=new T.CatmullRomCurve3(pts.map(([x,z])=>new T.Vector3(x,.084,z)),true,'centripetal');
  const road=[],uv=[],index=[];
  for(let i=0;i<=120;i++){
    const t=i/120,a=path.getPointAt(t),v=path.getTangentAt(t);
    for(const side of [-1,1]){road.push(a.x-v.z*.37*side,.082,a.z+v.x*.37*side);uv.push(t,(side+1)/2);}
    if(i<120){const k=i*2;index.push(k,k+1,k+2,k+2,k+1,k+3);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(road,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();
  const surface=mat('road').clone();surface.side=T.DoubleSide;mesh(p,g,surface);
  for(let i=0;i<26;i++){const t=i/26,a=path.getPointAt(t),v=path.getTangentAt(t);box(p,'ivory',a.x,.088,a.z,.13,.008,.029).rotation.y=-Math.atan2(v.z,v.x);}
  const shop=group(p,.89,.076,-.86);
  box(shop,'ivory',0,.84,0,2.02,1.68,.97,.045);
  box(shop,'forest',0,1.78,0,2.12,.18,1.08,.055);
  box(shop,'green',0,1.53,.499,1.94,.33,.045,.012);
  sign(shop,'PET SHOP',0,1.54,.526,1.48,.29,{bg:'#205648',fg:'#fff3d8',size:.80});
  box(shop,'forest',-.54,.58,.502,.47,1.10,.03);
  box(shop,'glass',-.54,.71,.52,.35,.73,.024);
  box(shop,'brass',-.378,.54,.539,.023,.16,.018);
  box(shop,'green',.32,.66,.50,1.06,.86,.035);
  box(shop,'glass',.32,.66,.529,.95,.76,.015);
  box(shop,'aqua',.13,.67,.544,.039,.74,.011);
  for(let i=0;i<3;i++)pouch(shop,.09+.23*i,.34,.557,.28,.03);
  for(let i=0;i<9;i++){
    const x=-.91+i*.227,c=i%2?'porcelain':'orange';
    box(shop,c,x,1.29,.64,.228,.075,.34).rotation.x=.17;
    box(shop,c,x,1.216,.80,.228,.09,.054,.023);
  }
  box(shop,'wood',0,.075,.59,1.96,.15,.31,.028);
  const dock=group(p,-1.25,.076,-.80);
  box(dock,'mint',0,.60,0,1.50,1.20,.96,.045);
  box(dock,'green',0,1.26,0,1.59,.12,1.07,.026);
  box(dock,'ink',0,.60,.49,1.06,.97,.035);
  for(let i=0;i<9;i++)box(dock,'steel',0,.19+i*.10,.52,.99,.081,.028,.009);
  carton(dock,-.60,.08,.6,.40,.33,.34);
  plant(p,2.01,.075,-.37,.66);
  const vehicle=truck(animated,logo);vehicle.g.scale.setScalar(.76);
  return time=>{
    const t=(time*.045+.16)%1,point=path.getPointAt(t),dir=path.getTangentAt(t);
    vehicle.g.position.copy(point);vehicle.g.rotation.y=-Math.atan2(dir.z,dir.x);
    vehicle.wheels.forEach(w=>w.rotation.z=-time*3.5);
  };
}
function rearing(p,animated) {
  shelf(p,-.69,.075,-.94,2.87,2.04,.89,[.22,.81,1.40,2.01]);
  for(const level of [.35,.94,1.53]){
    for(const x of [-1.39,-.02])tote(p,x,level,-.94,1.07,.67,.22);
  }
  plant(p,1.51,.075,-.92,1.02);
  const tray=group(p,.08,.075,.76);
  for(const x of [-1.21,1.21])for(const z of [-.44,.44])box(tray,'green',x,.25,z,.10,.50,.10,.025);
  tote(tray,0,.5,0,2.72,1.18,.25);
  box(tray,'earth',0,.76,0,2.57,.028,1.04,.012);
  grains(tray,0,.78,0,2.47,.97,47);
  // Short, tapered, ringed larvae remain confined to this future-only tray.
  const parts=[],dummy=new T.Object3D(),segments=12,bodies=9;
  const inst=new T.InstancedMesh(new T.SphereGeometry(1,12,8),mat('ivory'),segments*bodies);
  inst.castShadow=true;inst.receiveShadow=true;animated.add(inst);
  for(let n=0;n<bodies;n++){
    const x=-.88+(n%3)*.88,z=.43+Math.floor(n/3)*.31;
    const a=.2+Math.sin(n*2.7)*.65;
    parts.push({x,z,a});
    for(let k=0;k<segments;k++)inst.setColorAt(n*segments+k,new T.Color(k===0||k===11?'#ab8053':k%3===0?'#d5b47b':'#ecd39f'));
  }
  return time=>{
    parts.forEach(({x,z,a},n)=>{
      const phase=time*1.8+n*2.2;
      for(let i=0;i<segments;i++){
        const u=i/(segments-1),length=(u-.5)*(.38+.018*Math.sin(phase));
        const curve=Math.sin(u*3.3+phase)*.035;
        const r=.024+.032*Math.sin(Math.PI*u)**.66;
        dummy.position.set(x+length*Math.cos(a)-curve*Math.sin(a)+.038*Math.sin(phase*.46),.907+r*.42,z+length*Math.sin(a)+curve*Math.cos(a));
        dummy.rotation.set(0,-a,0);dummy.scale.set(.034,r*.76,r);dummy.updateMatrix();
        inst.setMatrixAt(n*segments+i,dummy.matrix);
      }
    });inst.instanceMatrix.needsUpdate=true;
  };
}
function drying(p,animated) {
  const cabinet=group(p,-.69,.08,-.28);
  box(cabinet,'green',0,.23,0,1.82,.44,1.13,.08);
  box(cabinet,'steel',0,1.23,0,1.71,1.68,1.08,.055);
  box(cabinet,'ink',0,1.23,.554,1.48,1.37,.055,.02);
  for(let k=0;k<5;k++){
    box(cabinet,'chrome',0,.69+k*.23,.585,1.35,.065,.08,.018);
    box(cabinet,'sand',0,.74+k*.23,.59,1.23,.036,.042,.012);
  }
  box(cabinet,'ivory',0,2.12,0,1.82,.17,1.16,.045);
  cyl(cabinet,'steel',.34,2.34,-.16,.19,.31);
  cyl(cabinet,'green',.34,2.52,-.16,.235,.08);
  const door=group(cabinet,-.84,.5,.59);door.rotation.y=-1.15;
  box(door,'mint',.64,.68,0,1.28,1.35,.067,.03);
  box(door,'glass',.64,.72,.04,1.08,1.04,.026,.01);
  box(door,'ink',1.19,.70,.071,.045,.34,.055,.015);
  const fan=group(animated,.73,1.52,-.54);
  cyl(p,'ink',.73,1.52,-.59,.46,.20).rotation.x=Math.PI/2;
  for(let i=0;i<5;i++){
    const blade=group(fan);blade.rotation.z=i*2*Math.PI/5;
    const o=oval(blade,'mint',.12,.16,.10,.095,.22,.035);o.rotation.z=-.74;
  }
  cyl(p,'brass',.73,1.52,-.37,.105,.08).rotation.x=Math.PI/2;
  shelf(p,1.36,.075,.57,1.10,1.10,.73,[.18,.75]);
  tote(p,1.36,.88,.57,1.01,.66,.13);grains(p,1.36,1.04,.57,.94,.55,28);
  batch(fan);return time=>{fan.rotation.z=-time*1.35;};
}
export const stationDefinitions={
  source:{accent:'honey',build:sourcing},checks:{accent:'mint',build:checks},
  pack:{accent:'pistachio',build:packaging},retail:{accent:'orange',build:distribution},
  rear:{accent:'sage',build:rearing},dry:{accent:'brass',build:drying}
};
export function buildStation(root,id){
  const pivot=group(root),fixed=group(pivot),moving=group(pivot);
  plinth(fixed,stationDefinitions[id].accent);
  const animate=stationDefinitions[id].build(fixed,moving);
  batch(fixed);animate?.(0);
  return {pivot,animate};
}
