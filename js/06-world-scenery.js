// ---- árvores e pedras ----
const MX=600,mk=(g,c)=>{const m=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:C(c),flatShading:true,roughness:1}),MX);m.frustumCulled=false;scene.add(m);return m};
const trunk=mk(new THREE.CylinderGeometry(.35,.5,3,6),0x6b4a2b),leaf=mk(new THREE.ConeGeometry(2.2,6,7),0x2f6b34),rock=mk(new THREE.DodecahedronGeometry(1.4,0),0x808488);
let obs=[],ocx=1e9,ocz=1e9;const D=new THREE.Object3D();
function updObs(){const ci=Math.floor(pos.x/14),cj=Math.floor(pos.z/14);if(ci==ocx&&cj==ocz)return;ocx=ci;ocz=cj;obs=[];let nt=0,nr=0;
 for(let i=ci-9;i<=ci+9;i++)for(let j=cj-9;j<=cj+9;j++){if(hh(i,j,1)>.42)continue;const x=(i+hh(i,j,2))*14,z=(j+hh(i,j,3))*14;if(Math.hypot(x,z)<24||Math.hypot(x-tgt.x,z-tgt.z)<14||(roadInfo(x,z)&&RD<15)||padW(x,z)>0)continue;
  const s=.8+hh(i,j,5)*.9,y=H(x,z);D.rotation.set(0,hh(i,j,6)*6,0);
  if(hh(i,j,4)<.7){D.scale.set(s,s,s);D.position.set(x,y+1.5*s,z);D.updateMatrix();trunk.setMatrixAt(nt,D.matrix);D.position.set(x,y+5*s,z);D.updateMatrix();leaf.setMatrixAt(nt++,D.matrix);obs.push({x,z,r:.7*s,k:0})}
  else{D.scale.set(s*1.2,s,s*1.2);D.rotation.set(hh(i,j,7),hh(i,j,6)*6,0);D.position.set(x,y+.5*s,z);D.updateMatrix();rock.setMatrixAt(nr++,D.matrix);obs.push({x,z,r:1.4*s,k:1})}}
 for(const c of COACT)for(const q of c.cols)obs.push(q);
 trunk.count=leaf.count=nt;rock.count=nr;[trunk,leaf,rock].forEach(m=>m.instanceMatrix.needsUpdate=true)}

// ---- cones ----
const NC=90,cones=[],coneM=new THREE.InstancedMesh(new THREE.ConeGeometry(.35,.8,8),new THREE.MeshStandardMaterial({color:C(0xff6a00),roughness:.7}),NC);coneM.frustumCulled=false;scene.add(coneM);
for(let i=0;i<NC;i++)cones.push({x:0,z:0,y:-500,vx:0,vy:0,vz:0,rx:0,rz:0,ry:hh(i,3)*6,w:0,aw:false,hit:false});
// cones ficam nas entradas das empresas ativas (coordenadas locais: lx<0 = lado da pista)
const CONE_L=[[-33,-6],[-29,-6],[-25,-6],[-33,6],[-29,6],[-25,6],[-33,-9.5],[-33,9.5]];
function placeCones(){let n=0;for(const c of COACT)for(const[lx,lz]of CONE_L){if(n>=NC)break;const q=c.loc(lx,lz),o=cones[n++];o.x=q.x;o.z=q.z;o.y=H(q.x,q.z)+.4;o.vx=o.vy=o.vz=o.rx=o.rz=o.w=0;o.aw=false;o.hit=false;setCone(n-1)}
 for(;n<NC;n++){const o=cones[n];o.x=o.z=0;o.y=-500;o.aw=false;setCone(n)}coneM.instanceMatrix.needsUpdate=true}
function setCone(i){const c=cones[i];D.scale.set(1,1,1);D.position.set(c.x,c.y,c.z);D.rotation.set(c.rx,c.ry,c.rz);D.updateMatrix();coneM.setMatrixAt(i,D.matrix)}
cones.forEach((_,i)=>setCone(i));coneM.instanceMatrix.needsUpdate=true;

