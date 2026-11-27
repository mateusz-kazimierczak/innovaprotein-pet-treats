import * as T from './vendor/three-r170.mjs';

const palette = {
  porcelain: '#fff5dc', ivory: '#e8ddbd', chalk: '#f2f0e5', green: '#15574b',
  forest: '#143b35', mint: '#94beb0', pistachio: '#c5cf81', brass: '#cd9951',
  honey: '#f5b661', orange: '#d87748', clay: '#b35b40', wood: '#bb8653',
  woodDark: '#826044', carton: '#bf925c', tape: '#e2c18c', steel: '#9eaea7',
  chrome: '#bcc9c2', ink: '#233f44', rubber: '#293737', glass: '#73a6a1',
  screen: '#243f3c', aqua: '#a8d7c8', leaf: '#587a48', sage: '#8caa65',
  earth: '#805b39', sand: '#d1a876', foil: '#17472c', road: '#637673'
};
const materials = new Map(), geometries = new Map();
export function mat(color) {
  if (typeof color !== 'string') return color;
  if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({
    color: palette[color] || color, roughness: ['chrome','steel','brass','foil'].includes(color) ? .48 : .79,
    metalness: ['chrome','steel','brass'].includes(color) ? .24 : .015
  }));
  return materials.get(color);
}
export function group(parent, x=0, y=0, z=0) {
  const g = new T.Group(); g.position.set(x,y,z); parent.add(g); return g;
}
function geo(key, build) {
  if (!geometries.has(key)) geometries.set(key,build());
  return geometries.get(key);
}
export function mesh(p, g, color, x=0, y=0, z=0) {
  const m = new T.Mesh(g,mat(color)); m.position.set(x,y,z); p.add(m);
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function box(p,c,x,y,z,w,h,d,r=0) {
  r = Math.min(r,w*.48,h*.48,d*.48);
  const g = geo(['b',w,h,d,r].join(),()=>r ? new T.RoundedBoxGeometry(w,h,d,1,r) : new T.BoxGeometry(w,h,d));
  return mesh(p,g,c,x,y,z);
}
export function cyl(p,c,x,y,z,top,h,bottom=top,n=24) {
  const g=geo(['c',top,h,bottom,n].join(),()=>new T.CylinderGeometry(top,bottom,h,n));
  return mesh(p,g,c,x,y,z);
}
export function oval(p,c,x,y,z,a,b,d) {
  const o=mesh(p,geo('sphere',()=>new T.SphereGeometry(1,16,12)),c,x,y,z);
  o.scale.set(a,b,d); return o;
}
export function bar(p,c,from,to,r=.024) {
  const v=new T.Vector3(...to).sub(new T.Vector3(...from));
  const b=cyl(p,c,(from[0]+to[0])/2,(from[1]+to[1])/2,(from[2]+to[2])/2,r,v.length(),r,10);
  b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()); return b;
}
export function textureMaterial(canvas) {
  const map=new T.CanvasTexture(canvas); map.colorSpace=T.SRGBColorSpace; map.anisotropy=4;
  return new T.MeshStandardMaterial({map,roughness:.79,side:T.DoubleSide});
}
export function graphics(w,h,draw) {
  const cv=document.createElement('canvas'); cv.width=w;cv.height=h;
  draw(cv.getContext('2d'),w,h); return textureMaterial(cv);
}
export function decal(p,m,x,y,z,w,h) {
  const face=mesh(p,geo(['f',w,h].join(),()=>new T.PlaneGeometry(w,h)),m,x,y,z);
  face.castShadow=false;return face;
}
const stickers=new Map();
export function sign(p,text,x,y,z,w,h,{bg='#20574f',fg='#fff4d9',size=.53}={}) {
  const key=[text,bg,fg,w/h,size].join('|');
  if(!stickers.has(key))stickers.set(key,graphics(768,Math.max(65,Math.round(768*h/w)),(ctx,W,H)=>{
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.fillStyle=fg;ctx.font='700 '+Math.round(H*size)+'px system-ui';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,W/2,H*.5,W*.91);
  }));
  return decal(p,stickers.get(key),x,y,z,w,h);
}
let label;
export function carton(p,x,y,z,w=.72,h=.46,d=.52) {
  const g=group(p,x,y,z);
  box(g,'carton',0,h*.5,0,w,h,d,.025);
  box(g,'tape',0,h+.003,0,w*.2,.012,d*.99);
  box(g,'tape',0,h*.88,d*.5,w*.2,h*.23,.009);
  if(!label)label=graphics(280,150,(c,W,H)=>{
    c.fillStyle='#f1e7c9';c.fillRect(0,0,W,H);c.fillStyle='#33433d';
    c.font='bold 24px sans-serif';c.fillText('LOT · PY',13,32);
    for(let i=0,x=14;x<205;i++){const w=2+(i*7%5);c.fillRect(x,49,w,59);x+=w+3;}
    c.fillRect(219,48,29,29);c.fillRect(220,89,16,16);
  });
  decal(g,label,-w*.19,h*.5,d*.5+.005,w*.35,h*.38);return g;
}
export function pallet(p,x,y,z,w=1.7,d=1.05) {
  for(const a of [-.4,0,.4])box(p,'woodDark',x+a*w,y+.06,z,w*.12,.12,d,.012);
  for(let i=0;i<6;i++)box(p,'wood',x,y+.145,z+d*(i/6-.415),w,.06,d*.14,.015);
}
export function shelf(p,x,y,z,w,h,d,levels) {
  for(const dx of [-1,1])for(const dz of [-1,1]){
    box(p,'green',x+dx*(w/2-.045),y+h/2,z+dz*(d/2-.035),.075,h,.075,.014);
    box(p,'ink',x+dx*(w/2-.045),y+.034,z+dz*(d/2-.035),.14,.068,.14,.02);
  }
  for(const level of levels){
    box(p,'steel',x,y+level,z,w,.09,d,.028);
    box(p,'brass',x,y+level-.01,z+d/2,.95*w,.035,.013);
  }
  bar(p,'steel',[x-w*.43,y+.1,z-d*.46],[x+w*.43,y+h*.9,z-d*.46],.022);
}
export function plant(p,x,y,z,scale=1) {
  const g=group(p,x,y,z);g.scale.setScalar(scale);
  cyl(g,'clay',0,.21,0,.28,.42,.2);cyl(g,'earth',0,.425,0,.244,.012);
  for(let j=0;j<8;j++){
    const a=j*2.4;const tip=[Math.sin(a)*(.19+j%3*.055),.75+(j%3)*.09,Math.cos(a)*.24];
    bar(g,'green',[0,.39,0],tip,.013);
    const leaf=oval(g,j%2?'leaf':'sage',...tip,.092,.24,.052);
    leaf.rotation.z=-Math.sin(a)*.65;leaf.rotation.x=Math.cos(a)*.65;leaf.rotation.y=a;
  }
}
// Batch static geometry by material. Keep independently animated groups as siblings.
export function batch(root) {
  root.updateWorldMatrix(true,true);
  const local=new T.Matrix4().copy(root.matrixWorld).invert(),sets=new Map();
  root.traverse(obj=>{
    if(!obj.isMesh)return;
    const g=obj.geometry.index?obj.geometry.toNonIndexed():obj.geometry.clone();
    g.applyMatrix4(new T.Matrix4().multiplyMatrices(local,obj.matrixWorld));
    const key=obj.material.uuid+obj.castShadow+obj.receiveShadow;
    if(!sets.has(key))sets.set(key,{m:obj.material,cast:obj.castShadow,receive:obj.receiveShadow,parts:[]});
    sets.get(key).parts.push(g);
  });
  root.clear();
  for(const {m,cast,receive,parts} of sets.values()){
    const merged=T.mergeGeometries(parts);parts.forEach(g=>g.dispose());
    const item=mesh(root,merged,m);item.castShadow=cast;item.receiveShadow=receive;
  }
}
export function plinth(p,accent) {
  box(p,'forest',0,-.15,0,4.86,.21,3.78,.10);
  box(p,accent,0,-.045,0,4.88,.09,3.8,.04);
  box(p,'porcelain',0,.015,0,4.86,.11,3.77,.045);
  for(const x of [-2.15,2.15])for(const z of [-1.62,1.62])cyl(p,'brass',x,.077,z,.035,.013,.035,12);
}
