// ---- árvores e pedras ----
const MX=900,RTR=[9,12,15][RDL],mk=(g,c)=>{const m=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:C(c),flatShading:true,roughness:1}),MX);m.frustumCulled=false;scene.add(m);return m};
/* pinheiros low poly (modelo "Árvore Conífera"): tronco + 5 camadas de folhagem facetadas numa única malha, 3 variações de forma, escalas variadas */
const PINE_K=1.9;
function pineGeo(variant){const rg=sd=>()=>{sd=(sd*16807)%2147483647;return(sd-1)/2147483646},P=[],CL=[];
 const add=(g,dy)=>{const q=g.index?g.toNonIndexed():g,a=q.attributes.position,c=q.attributes.color;for(let i=0;i<a.count;i++){P.push(a.getX(i),a.getY(i)+dy,a.getZ(i));CL.push(c.getX(i),c.getY(i),c.getZ(i))}};
 {const tg=new THREE.CylinderGeometry(.2,.34,1.2,7,2),r=rg(77+variant*13),p=tg.attributes.position,cs=[],lo=C(0x4a2e18),hi=C(0x8a5a30),t=new THREE.Color();
  for(let i=0;i<p.count;i++){if(Math.abs(p.getY(i))<.59){p.setX(i,p.getX(i)*(.9+r()*.2));p.setZ(i,p.getZ(i)*(.9+r()*.2))}t.copy(lo).lerp(hi,Math.min(1,Math.max(0,.5+p.getX(i)/.7)));cs.push(t.r,t.g,t.b)}
  tg.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));add(tg,.6)}
 const wd=[1,.84,1.12][variant],ht=[1,1.14,.9][variant],cfg=[[1.55,.95,.75,0x1a5a24,0x3f8f35],[1.25,.85,1.3,0x1f6a28,0x479a38],[.98,.78,1.8,0x267a2c,0x52a63e],[.72,.72,2.28,0x2e8832,0x5fb246],[.44,.7,2.72,0x38963a,0x6cc04a]];
 cfg.forEach((c,i)=>{const R=c[0]*wd,h=c[1]*ht,r=rg(101+i*37+variant*211),N=8,M=N*2,ctr=new THREE.Vector3(0,h*.35,0),A=new THREE.Vector3(0,h,0),B=new THREE.Vector3(0,h*.08,0),r1s=[],r2s=[],pos=[],col=[],ca=C(c[3]),cb=C(c[4]),tmp=new THREE.Color();
  for(let k=0;k<M;k++){const a=(k/M)*Math.PI*2+(r()-.5)*.12,tip=k%2===0,q1=R*(.5+r()*.1),y1=h*(.6+r()*.12);r1s.push(new THREE.Vector3(Math.cos(a)*q1,y1,Math.sin(a)*q1));const q2=tip?R*(.92+r()*.2):R*(.66+r()*.1),y2=tip?h*(r()*.14-.05):h*(.18+r()*.14);r2s.push(new THREE.Vector3(Math.cos(a)*q2,y2,Math.sin(a)*q2))}
  const tri=(a,b,c2)=>{const n=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c2,a)),cen=new THREE.Vector3().add(a).add(b).add(c2).multiplyScalar(1/3);if(n.dot(cen.sub(ctr))<0){const t=b;b=c2;c2=t;n.negate()}n.normalize();const k=Math.min(1,Math.max(0,.5+n.y*.6+(r()-.5)*.35));tmp.copy(ca).lerp(cb,k);[a,b,c2].forEach(v=>{pos.push(v.x,v.y,v.z);col.push(tmp.r,tmp.g,tmp.b)})};
  for(let k=0;k<M;k++){const j=(k+1)%M;tri(A,r1s[k],r1s[j]);tri(r1s[k],r2s[k],r2s[j]);tri(r1s[k],r2s[j],r1s[j]);tri(B,r2s[j],r2s[k])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));add(g,c[2]*ht)});
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(CL,3));G.computeVertexNormals();return G}
const pines=[0,1,2].map(v=>{const m=new THREE.InstancedMesh(pineGeo(v),new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}),MX);m.frustumCulled=false;scene.add(m);return m});
const rock=mk(new THREE.DodecahedronGeometry(1.4,0),0x808488);
let obs=[],ocx=1e9,ocz=1e9;const D=new THREE.Object3D();
function updObs(){const ci=Math.floor(pos.x/14),cj=Math.floor(pos.z/14);if(ci==ocx&&cj==ocz)return;ocx=ci;ocz=cj;obs=[];const np=[0,0,0];let nr=0;
 for(let i=ci-RTR;i<=ci+RTR;i++)for(let j=cj-RTR;j<=cj+RTR;j++){if(hh(i,j,1)>.42)continue;const x=(i+hh(i,j,2))*14,z=(j+hh(i,j,3))*14;if(Math.hypot(x,z)<24||Math.hypot(x-tgt.x,z-tgt.z)<14||(roadInfo(x,z)&&RD<15)||padW(x,z)>0||featBlock(x,z))continue;
  const s=.6+hh(i,j,5)*1.5,y=H(x,z);D.rotation.set(0,hh(i,j,6)*6,0);
  if(hh(i,j,4)<.7){const vr=Math.min(2,Math.floor(hh(i,j,8)*3)),w=s*PINE_K*(.9+hh(i,j,9)*.2),ht=s*PINE_K*(.92+hh(i,j,10)*.16);D.scale.set(w,ht,w);D.position.set(x,y-.1,z);D.updateMatrix();pines[vr].setMatrixAt(np[vr]++,D.matrix);obs.push({x,z,r:.75*s,k:0})}
  else{D.scale.set(s*1.2,s,s*1.2);D.rotation.set(hh(i,j,7),hh(i,j,6)*6,0);D.position.set(x,y+.5*s,z);D.updateMatrix();rock.setMatrixAt(nr++,D.matrix);obs.push({x,z,r:1.4*s,k:1})}}
 for(const c of COACT)for(const q of c.cols)obs.push(q);for(const o of OVA)for(const q of o.cols)obs.push(q);for(const o of ICA)for(const q of o.cols)obs.push(q);for(const v of TRF)for(const q of v.cols)obs.push(q);if(window.GRCOLS)for(const q of GRCOLS)if(Math.abs(q.x-pos.x)<260&&Math.abs(q.z-pos.z)<260)obs.push(q);if(typeof NET!=='undefined')for(const p of NET.peers.values())if(p.cols)for(const q of p.cols)obs.push(q);
 pines.forEach((m,v)=>{m.count=np[v];m.instanceMatrix.needsUpdate=true});rock.count=nr;rock.instanceMatrix.needsUpdate=true}

// ---- cones ----
const NC=90,cones=[],coneM=new THREE.InstancedMesh(new THREE.ConeGeometry(.35,.8,8),new THREE.MeshStandardMaterial({color:C(0xff6a00),roughness:.7}),NC);coneM.frustumCulled=false;scene.add(coneM);
for(let i=0;i<NC;i++)cones.push({x:0,z:0,y:-500,vx:0,vy:0,vz:0,rx:0,rz:0,ry:hh(i,3)*6,w:0,aw:false,hit:false});
// cones ficam nas entradas das empresas ativas (coordenadas locais: lx<0 = lado da pista)
const CONE_L=[[-33,-6],[-29,-6],[-25,-6],[-33,6],[-29,6],[-25,6],[-33,-9.5],[-33,9.5]];
function placeCones(){let n=0;for(const c of COACT)for(const[lx,lz]of CONE_L){if(n>=NC)break;const q=c.loc(lx,lz),o=cones[n++];o.x=q.x;o.z=q.z;o.y=H(q.x,q.z)+.4;o.vx=o.vy=o.vz=o.rx=o.rz=o.w=0;o.aw=false;o.hit=false;setCone(n-1)}
 for(;n<NC;n++){const o=cones[n];o.x=o.z=0;o.y=-500;o.aw=false;setCone(n)}coneM.instanceMatrix.needsUpdate=true}
function setCone(i){const c=cones[i];D.scale.set(1,1,1);D.position.set(c.x,c.y,c.z);D.rotation.set(c.rx,c.ry,c.rz);D.updateMatrix();coneM.setMatrixAt(i,D.matrix)}
cones.forEach((_,i)=>setCone(i));coneM.instanceMatrix.needsUpdate=true;

