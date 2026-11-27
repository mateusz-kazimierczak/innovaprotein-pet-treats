import * as T from './vendor/three-r170.mjs';
import { group, mesh, mat } from './model-kit.mjs';

// The original photo's background is removed row by row. Its logo, lettering and illustration
// stay together in the UV map while the gusset and perimeter give the pouch physical depth.
function panel(front) {
  const xs=28,ys=36,positions=[],uv=[],indices=[];
  for(let j=0;j<=ys;j++)for(let i=0;i<=xs;i++){
    const u=i/xs,v=j/ys;
    const topRound=Math.max(0,(v-.969)/.031), bottomRound=Math.max(0,(.05-v)/.05);
    const width=.342+.054*Math.sin(v*1.57)-.026*topRound**2-.012*bottomRound**2;
    const x=(u*2-1)*width;
    const body=Math.pow(Math.sin(Math.PI*u),.65)*Math.pow(Math.sin(Math.PI*v),.5);
    const seal=1-.77*Math.exp(-((v-.875)**2)/.0012);
    const thickness=.010+body*(.103+.032*(1-v))*seal;
    const y=v*.99+.022*(1-Math.sin(Math.PI*u))*Math.exp(-v*16);
    positions.push(x,y,front?thickness:-thickness);
    uv.push(u,v);
    if(i<xs&&j<ys){
      const a=j*(xs+1)+i,b=a+1,c=a+xs+1,d=c+1;
      indices.push(...(front?[a,b,c,b,d,c]:[a,c,b,b,c,d]));
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const front=panel(true),back=panel(false);
const seal=new T.BufferGeometry();
const frontPts=front.getAttribute('position'),backPts=back.getAttribute('position'),pos=[],uv=[];
const border=[...Array.from({length:29},(_,i)=>i),...Array.from({length:36},(_,i)=>(i+1)*29+28),
  ...Array.from({length:28},(_,i)=>36*29+27-i),...Array.from({length:36},(_,i)=>(35-i)*29)];
for(let i=0;i<border.length-1;i++){
  const a=border[i],b=border[i+1];
  for(const [p,k] of [[frontPts,a],[backPts,a],[frontPts,b],[backPts,a],[backPts,b],[frontPts,b]]){
    pos.push(p.getX(k),p.getY(k),p.getZ(k));uv.push(0,0);
  }
}
seal.setAttribute('position',new T.Float32BufferAttribute(pos,3));seal.setAttribute('uv',new T.Float32BufferAttribute(uv,2));seal.computeVertexNormals();
let print;
export async function preparePouch() {
  const map=await new T.TextureLoader().loadAsync(new URL('./pouch-front.webp',import.meta.url).href);
  map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  print=new T.MeshStandardMaterial({map,roughness:.71,metalness:0,alphaTest:.4});
}
export function pouch(p,x,y,z,scale=1,turn=0) {
  const g=group(p,x,y,z);g.scale.setScalar(scale);g.rotation.y=turn;
  mesh(g,front,print);mesh(g,back,mat('foil'));mesh(g,seal,mat('foil'));return g;
}
