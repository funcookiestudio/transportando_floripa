// ---- caminhão ----
const L=3.98,pos={x:0,z:0},vel={x:0,z:0};let yrP=0,yvP=0,hz=0;const sv={p:0,r:0,h:0};let hd=0,steer=0,pitch=0,roll=0,xp=0,xr=0,prevVf=0,acc=0,shake=0,camH=0,camMode=0,lightsOn=false,night=false,muted=false,ready=false;
const pivot=new THREE.Group();scene.add(pivot);let wF,wR;
const spots=[-.8,.8].map(x=>{const s=new THREE.SpotLight(0xfff2d0,0,90,.55,.5);s.position.set(x,1.3,-5.6);const t=new THREE.Object3D();t.position.set(x*.5,.5,-40);pivot.add(s,t);s.target=t;return s});
const GL=new THREE.MeshStandardMaterial({color:C(0x0b1218),roughness:.04,metalness:.6,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide}),
HL=new THREE.MeshStandardMaterial({color:C(0xffffff),emissive:C(0xfff0c8),emissiveIntensity:.25,roughness:.2}),
TL=new THREE.MeshStandardMaterial({color:C(0x550000),emissive:C(0xff1408),emissiveIntensity:.4,roughness:.3}),
AM=new THREE.MeshStandardMaterial({color:C(0x663300),emissive:C(0xff8000),emissiveIntensity:.5,roughness:.3});
function splitMesh(mesh){const g=mesh.geometry,uv=g.attributes.uv,ps=g.attributes.position,ix=g.index;if(!uv||!ix)return;const b=mesh.material,a=ix.array,cl=[[],[],[],[],[],[]];
 for(let i=0;i<a.length;i+=3){let u=0,v=0,z=0;for(let k=0;k<3;k++){u+=uv.getX(a[i+k]);v+=uv.getY(a[i+k]);z+=ps.getZ(a[i+k])}u/=3;v/=3;z=z/3+mesh.position.z;
  const cell=Math.floor(v*8)*8+Math.floor(u*8);let c=0;
  if(cell==11)c=1;else if(cell==3&&z<-8.3&&/^Cube012/.test(mesh.name))c=2;else if(cell==19)c=3;else if(cell==21)c=4;else if(cell==59)c=5;
  cl[c].push(a[i],a[i+1],a[i+2])}
 const PM=new THREE.MeshPhysicalMaterial({map:b.map,roughness:.32,metalness:.3,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide}),mm=[b,GL,HL,TL,AM,PM],out=[];let s=0;g.clearGroups();
 cl.forEach((arr,k)=>{if(!arr.length)return;g.addGroup(s,arr.length,k);s+=arr.length;for(const q of arr)out.push(q)});
 g.setIndex(new THREE.BufferAttribute(new a.constructor(out),1));mesh.material=mm}
let fw=[];const V2=new THREE.Vector3();
function mkSteer(node){const thr=-node.position.x/node.scale.x,meshes=[];node.traverse(n=>{if(n.isMesh&&n!==node)meshes.push(n)});if(!meshes.length)return[];const res=[];
 for(const side of[-1,1]){const sg=new THREE.Group(),sp=new THREE.Group();sg.add(sp);const mn=new THREE.Vector3(1e9,1e9,1e9),mx=new THREE.Vector3(-1e9,-1e9,-1e9),parts=[];
  for(const m of meshes){const g=m.geometry,a=g.index.array,ps=g.attributes.position,gr=g.groups.length?g.groups:[{start:0,count:a.length,materialIndex:0}],out=[],ng=[];
   for(const G of gr){const st=out.length;for(let i=G.start;i<G.start+G.count;i+=3){const x=(ps.getX(a[i])+ps.getX(a[i+1])+ps.getX(a[i+2]))/3;if((x<thr?-1:1)!==side)continue;
     for(let k=0;k<3;k++){const j=a[i+k];out.push(j);V2.set(ps.getX(j),ps.getY(j),ps.getZ(j));mn.min(V2);mx.max(V2)}}
    if(out.length>st)ng.push([st,out.length-st,G.materialIndex])}
   const g2=new THREE.BufferGeometry();g2.setAttribute('position',ps);g2.setAttribute('normal',g.attributes.normal);g2.setAttribute('uv',g.attributes.uv);g2.setIndex(new THREE.BufferAttribute(new a.constructor(out),1));ng.forEach(q=>g2.addGroup(q[0],q[1],q[2]));
   const nm=new THREE.Mesh(g2,m.material);nm.castShadow=true;parts.push(nm)}
  const c=mn.clone().add(mx).multiplyScalar(.5);sg.position.copy(c);parts.forEach(p=>{p.position.copy(c).negate();sp.add(p)});node.add(sg);res.push({sg,sp})}
 meshes.forEach(m=>m.visible=false);return res}
let wh=[];const VA=new THREE.Vector3(),VB=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
const SPR=(()=>{const pts=[];for(let i=0;i<=100;i++){const t=i/100,a=t*5*6.2832;pts.push(new THREE.Vector3(Math.cos(a)*.15,t-.5,Math.sin(a)*.15))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),200,.03,5,false)})(),DMP=new THREE.CylinderGeometry(.05,.05,1,8),
MS=new THREE.MeshStandardMaterial({color:C(0xe08a00),roughness:.4,metalness:.5}),MD=new THREE.MeshStandardMaterial({color:C(0x202226),roughness:.35,metalness:.8});
// aro pintável: faces próximas do eixo (raio < 56% do pneu) ganham material próprio (clone), pintado pela tela inicial; pneus ficam intactos
const RIMP=[],RIMM=new Map();
function rimSplit(g,mat){const ps=g.attributes.position,a=g.index.array,gr=g.groups.length?g.groups:[{start:0,count:a.length,materialIndex:0}];let R=0;for(let i=0;i<ps.count;i++)R=Math.max(R,Math.hypot(ps.getY(i),ps.getZ(i)));
 const ms=Array.isArray(mat)?mat:[mat],n=ms.length,out=[],ng=[];
 for(const G of gr)for(const rim of[0,1]){const st=out.length;for(let i=G.start;i<G.start+G.count;i+=3){let r=0;for(let k=0;k<3;k++){const j=a[i+k];r+=Math.hypot(ps.getY(j),ps.getZ(j))}r/=3;if((r<R*.56)!==!!rim)continue;out.push(a[i],a[i+1],a[i+2])}if(out.length>st)ng.push([st,out.length-st,G.materialIndex+rim*n])}
 g.setIndex(new THREE.BufferAttribute(new a.constructor(out),1));g.clearGroups();ng.forEach(q=>g.addGroup(q[0],q[1],q[2]));
 const rm=ms.map(m=>{if(!(m.map&&m.roughness>.9))return m;let c=RIMM.get(m.uuid);if(!c){c=m.clone();RIMM.set(m.uuid,c);RIMP.push(c)}return c});
 return[ms.concat(rm),ms.concat(ms)]}
function mkWheels(root){root.updateMatrixWorld(true);const out=[];
 for(const[node,front]of[[wF,true],[wR,false]]){if(!node)continue;const meshes=[];node.traverse(n=>{if(n.isMesh)meshes.push(n)});
  for(const side of[-1,1]){const parts=[],mn=new THREE.Vector3(1e9,1e9,1e9),mx=new THREE.Vector3(-1e9,-1e9,-1e9);
   for(const m of meshes){const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);const a=g.index.array,ps=g.attributes.position,gr=g.groups.length?g.groups.map(q=>({start:q.start,count:q.count,materialIndex:q.materialIndex})):[{start:0,count:a.length,materialIndex:0}],o2=[],ng=[];
    for(const G of gr){const st=o2.length;for(let i=G.start;i<G.start+G.count;i+=3){const x=(ps.getX(a[i])+ps.getX(a[i+1])+ps.getX(a[i+2]))/3;if((x<0?-1:1)!==side)continue;for(let k=0;k<3;k++){const j=a[i+k];o2.push(j);V2.set(ps.getX(j),ps.getY(j),ps.getZ(j));mn.min(V2);mx.max(V2)}}if(o2.length>st)ng.push([st,o2.length-st,G.materialIndex])}
    g.setIndex(new THREE.BufferAttribute(new a.constructor(o2),1));g.clearGroups();ng.forEach(q=>g.addGroup(q[0],q[1],q[2]));parts.push([g,m.material])}
   const c=mn.clone().add(mx).multiplyScalar(.5),W=new THREE.Group(),sg=new THREE.Group(),sp=new THREE.Group();W.rotation.order='YXZ';sg.add(sp);W.add(sg);
   parts.forEach(([g,mat])=>{g.translate(-c.x,-c.y,-c.z);const[m2,m0]=rimSplit(g,mat),me=new THREE.Mesh(g,m2);me.userData.o=m0;me.castShadow=true;sp.add(me)});
   const coil=new THREE.Mesh(SPR,MS),dmp=new THREE.Mesh(DMP,MD);coil.castShadow=dmp.castShadow=true;scene.add(W,coil,dmp);out.push({W,sg,sp,c,front,side,coil,dmp})}
  node.traverse(n=>{if(n.isMesh)n.visible=false})}
 return out}
function updWheels(){pivot.updateMatrixWorld(true);const sn=Math.sin(hd),cs=Math.cos(hd);
 for(const w of wh){const wx=pos.x+w.c.x*cs+w.c.z*sn,wz=pos.z-w.c.x*sn+w.c.z*cs;w.W.position.set(wx,H(wx,wz)+w.c.y,wz);w.W.rotation.set(pitch,hd,0);w.sg.rotation.y=w.front?steer:0;w.sp.rotation.x=spin/w.c.y;
  VA.set(wx-w.side*.6*cs,w.W.position.y+.05,wz+w.side*.6*sn);VB.set(w.side*.6,1.05,w.c.z);pivot.localToWorld(VB);VB.sub(VA);const L2=VB.length()||.01;
  for(const o of[w.coil,w.dmp]){o.position.copy(VA).addScaledVector(VB,.5);o.quaternion.setFromUnitVectors(UP,VB.clone().divideScalar(L2));o.scale.set(1,L2,1)}}}
function reset(){th=0;wT=0;rollT=0;vTp=0;decS=0;tipS=0;dmg=0;fuel=FUELMAX;yawKick=0;gear=0;eRpm=650;shiftT=0;thrS=0;brkP=0;placeStart();vel.x=vel.z=0;steer=0;tcx=1e9;ocx=1e9;newTarget()}
/* troca a textura embutida (bufferView -> blob:) por data: URI; alguns ambientes bloqueiam blob: */
function glbNoBlob(ab){try{const dv=new DataView(ab),jl=dv.getUint32(12,true),J=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,20,jl))),bo=20+jl,bl=dv.getUint32(bo,true),bin=new Uint8Array(ab,bo+8,bl);
 for(const im of J.images||[]){if(im.bufferView==null)continue;const bv=J.bufferViews[im.bufferView],by=bin.subarray(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength);let t='';for(let i=0;i<by.length;i+=8192)t+=String.fromCharCode.apply(null,by.subarray(i,i+8192));im.uri='data:'+(im.mimeType||'image/png')+';base64,'+btoa(t);delete im.bufferView}
 const js=new TextEncoder().encode(JSON.stringify(J)),jp=Math.ceil(js.length/4)*4,tot=12+8+jp+8+bl,out=new ArrayBuffer(tot),o=new DataView(out),u=new Uint8Array(out);
 o.setUint32(0,0x46546C67,true);o.setUint32(4,2,true);o.setUint32(8,tot,true);o.setUint32(12,jp,true);o.setUint32(16,0x4E4F534A,true);u.fill(0x20,20,20+jp);u.set(js,20);
 o.setUint32(20+jp,bl,true);o.setUint32(24+jp,0x004E4942,true);u.set(bin,28+jp);return out}catch(e){return ab}}

