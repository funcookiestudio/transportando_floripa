// ---- autoestrada infinita ----
const RDS=5,RWD=11.5,RF=[{x:0,z:0,h:0,s:0}],RB=[],RC=new Map();let RS=0,RD=1e9,RL=0,RW=0,RPx=0,RPz=0,curS=0,onRoad=true,rbI=1e9;
const kap=s=>.0018*(.5*Math.sin(s*.00083+.7)+.32*Math.sin(s*.00219+1.9)+.22*Math.sin(s*.00457+.3)+.12*Math.sin(s*.0091+2.2)),yR=s=>10*Math.sin(s*.0009)+5*(Math.sin(s*.0027+1)-.84147)+2.2*(Math.sin(s*.0061+.5)-.47943)+.05*Math.sin(s*.31);
const samp=i=>i>=0?RF[i]:RB[-i-1];
function addS(o){const k=Math.floor(o.x/52)*70001+Math.floor(o.z/52);let a=RC.get(k);if(!a)RC.set(k,a=[]);a.push(o)}addS(RF[0]);
function ensureRoad(sa,sb){while((RF.length-1)*RDS<sb){const p=RF[RF.length-1],k=kap(p.s+2.5),hm=p.h+k*2.5,n={x:p.x-Math.sin(hm)*RDS,z:p.z-Math.cos(hm)*RDS,h:p.h+k*RDS,s:p.s+RDS};RF.push(n);addS(n)}
 while(-RB.length*RDS>sa){const p=RB.length?RB[RB.length-1]:RF[0],k=kap(p.s-2.5),hm=p.h-k*2.5,n={x:p.x+Math.sin(hm)*RDS,z:p.z+Math.cos(hm)*RDS,h:p.h-k*RDS,s:p.s-RDS};RB.push(n);addS(n)}}
function roadPt(s,lat){const o=samp(Math.round(s/RDS)),ds=s-o.s;RPx=o.x-Math.sin(o.h)*ds+Math.cos(o.h)*lat;RPz=o.z-Math.cos(o.h)*ds-Math.sin(o.h)*lat}
function roadInfo(x,z){const cx=Math.floor(x/52),cz=Math.floor(z/52);let best=null,bd=1e18;
 for(let i=cx-1;i<=cx+1;i++)for(let j=cz-1;j<=cz+1;j++){const a=RC.get(i*70001+j);if(!a)continue;for(let q=0;q<a.length;q++){const o=a[q],dx=x-o.x,dz=z-o.z,d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=o}}}
 if(!best){RW=0;RD=1e9;return false}
 const dx=x-best.x,dz=z-best.z,al=dx*-Math.sin(best.h)+dz*-Math.cos(best.h),cl=Math.max(-2.6,Math.min(2.6,al));RS=best.s+cl;RL=dx*Math.cos(best.h)-dz*Math.sin(best.h);RD=Math.hypot(RL,al-cl);return true}
const COACT=[],PR1=34,PR2=58;let PADW=0,PADY=0;
const APR1=13,APR2=19;
// pátio circular + acesso (apron) retangular ligando o pátio ao asfalto, sem faixa de terra no meio
function padW(x,z){PADW=0;for(let i=0;i<COACT.length;i++){const c=COACT[i],dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);let w=0;
 if(d<PR2){const f=d<=PR1?1:1-(d-PR1)/(PR2-PR1);w=f*f*(3-2*f)}
 if(d<75){const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;if(lx>-44&&lx<-12){const a=Math.abs(lz),fz=a<=APR1?1:a>=APR2?0:1-(a-APR1)/(APR2-APR1),fx=lx<-42?(lx+44)/2:lx>-16?(-12-lx)/4:1,w2=Math.max(0,Math.min(fz,fx));const s2=w2*w2*(3-2*w2);if(s2>w)w=s2}}
 if(w>PADW){PADW=w;PADY=c.y}}return PADW}
// true se (x,z) cai na entrada de alguma empresa ativa (sem postes/mourões)
function inEntry(x,z,m){for(const c of COACT){const dx=x-c.x,dz=z-c.z;if(Math.abs(dx)>80||Math.abs(dz)>80)continue;const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;if(lx>-52&&lx<-20&&Math.abs(lz)<m)return true}return false}
let RIN=false;const H=(x,z)=>{const b=Hb(x,z);let r=b;RIN=roadInfo(x,z);if(RIN){let w=1;if(RD>15){const f=Math.max(0,(50-RD)/35);w=f*f*(3-2*f)}RW=w;r=b+(yR(RS)+.1-b)*w}if(COACT.length&&padW(x,z)>0)r+=(PADY-r)*PADW;return r};
const cvs=document.createElement('canvas');cvs.width=cvs.height=256;{const g=cvs.getContext('2d');g.fillStyle='#3a3c40';g.fillRect(0,0,256,256);
 for(let i=0;i<2500;i++){const v=40+Math.random()*30;g.fillStyle='rgb('+v+','+v+','+(v+4)+')';g.fillRect(Math.random()*256,Math.random()*256,2,2)}
 g.fillStyle='#e8e8e8';g.fillRect(9,0,5,256);g.fillRect(242,0,5,256);g.fillRect(62,0,4,64);g.fillRect(190,0,4,64);g.fillStyle='#e6b800';g.fillRect(121,0,4,256);g.fillRect(131,0,4,256)}
const rtex=new THREE.CanvasTexture(cvs);rtex.wrapT=THREE.RepeatWrapping;rtex.encoding=THREE.sRGBEncoding;rtex.anisotropy=8;
const NS=161,rg=new THREE.BufferGeometry(),rIdx=[];rg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NS*6),3));rg.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(NS*4),2));
rg.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from({length:NS*6},(_,i)=>i%3==1?1:0),3));
for(let i=0;i<NS-1;i++){const a=i*2;rIdx.push(a,a+1,a+2,a+1,a+3,a+2)}rg.setIndex(rIdx);
const roadMesh=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({map:rtex,roughness:.85,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));roadMesh.frustumCulled=false;roadMesh.receiveShadow=true;scene.add(roadMesh);
{const W=512,Hh=1024,PX=W/23,cx=W/2,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const g=cv.getContext('2d'),rnd=(a,b)=>a+Math.random()*(b-a),
 wob=(y,ph,A)=>{let v=0;[3,7,13,29].forEach((k,i)=>{v+=Math.sin(6.2832*k*y/Hh+ph*(i+1.3))*A/(i+1.4)});return v};
 for(let y=0;y<Hh;y++){const aL=9.4*PX+wob(y,1.1,9),aR=9.4*PX+wob(y,4.7,9),gL=aL+PX*(1.3+.9*Math.sin(6.2832*5*y/Hh+2)),gR=aR+PX*(1.3+.9*Math.sin(6.2832*6*y/Hh+5));
  g.fillStyle='#6b6253';g.fillRect(cx-gL,y,gL+gR,1);g.fillStyle='#3b3d41';g.fillRect(cx-aL,y,aL+aR,1)}
 for(let i=0;i<2200;i++){const sd=Math.random()<.5?-1:1,s=rnd(2,4);g.fillStyle='rgb('+(90+Math.random()*50|0)+','+(82+Math.random()*44|0)+','+(66+Math.random()*34|0)+')';g.fillRect(cx+sd*rnd(10.2,12.4)*PX,rnd(0,Hh),s,s)}
 g.globalCompositeOperation='source-atop';
 for(let i=0;i<14000;i++){const v=rnd(25,80)|0;g.fillStyle='rgba('+v+','+v+','+(v+4)+','+rnd(.15,.6)+')';g.fillRect(rnd(0,W),rnd(0,Hh),rnd(1,3),rnd(1,3))}
 for(const xc of[-6.6,-2.2,2.2,6.6])for(const o of[-.9,.9]){const x=cx+(xc+o)*PX,w=.55*PX,gr=g.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(0,0,0,.2)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-w,0,2*w,Hh)}
 for(let i=0;i<16;i++){const w=rnd(.8,3)*PX,h=rnd(40,260),x=cx+rnd(-8,8)*PX,y=rnd(0,Hh-h);g.fillStyle=Math.random()<.6?'rgba(18,18,20,.32)':'rgba(80,82,86,.22)';g.fillRect(x,y,w,h);g.strokeStyle='rgba(8,8,8,.35)';g.strokeRect(x,y,w,h)}
 for(let i=0;i<26;i++){let x=cx+rnd(-8.5,8.5)*PX,y=rnd(0,Hh-200);g.strokeStyle='rgba(10,10,10,.65)';g.lineWidth=rnd(.8,1.6);g.beginPath();g.moveTo(x,y);const n=rnd(6,14);for(let k=0;k<n;k++){x+=rnd(-8,8);y+=rnd(5,18);g.lineTo(x,y)}g.stroke()}
 for(let i=0;i<7;i++){g.fillStyle='rgba(8,8,10,.22)';g.beginPath();g.ellipse(cx+rnd(-7,7)*PX,rnd(60,Hh-60),rnd(6,16),rnd(20,60),0,0,6.2832);g.fill()}
 const Ln=(x,w,y0,y1)=>{g.fillRect(cx+x*PX-w/2,y0,w,y1-y0)};g.fillStyle='rgba(232,232,226,.92)';Ln(-8.8,6,0,Hh);Ln(8.8,6,0,Hh);for(const y0 of[0,512]){Ln(-4.4,5,y0,y0+128);Ln(4.4,5,y0,y0+128)}
 g.fillStyle='rgba(230,184,0,.92)';Ln(-.3,4,0,Hh);Ln(.3,4,0,Hh);
 g.fillStyle='rgba(58,60,64,.7)';const xs=[-8.8,8.8,-4.4,4.4,-.3,.3];for(let i=0;i<260;i++)g.fillRect(cx+xs[i%6]*PX-4+rnd(-2,2),rnd(0,Hh),rnd(3,8),rnd(4,26));
 g.globalCompositeOperation='source-over';
 const t=new THREE.CanvasTexture(cv);t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;roadMesh.material.map=t;roadMesh.material.alphaTest=.5;roadMesh.material.needsUpdate=true}
const LM=new THREE.MeshStandardMaterial({color:C(0xffffff),emissive:C(0xffe2a0),emissiveIntensity:.2}),
posts=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.8,.12),new THREE.MeshStandardMaterial({color:C(0xf0f0f0),roughness:.6}),200),
poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.16,9,6),new THREE.MeshStandardMaterial({color:C(0x7a7f85),roughness:.6,metalness:.4}),80),
heads=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.18,.5),LM,80);[posts,poles,heads].forEach(m=>{m.frustumCulled=false;scene.add(m)});poles.castShadow=true;
const bushes=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),400);bushes.frustumCulled=false;scene.add(bushes);const BC=new THREE.Color(),lpC=document.createElement('canvas');lpC.width=lpC.height=64;
{const g=lpC.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(.5,'rgba(255,190,110,.35)');r.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}
const lpool=new THREE.InstancedMesh(new THREE.PlaneGeometry(13,13).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lpC),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),80);
lpool.frustumCulled=false;lpool.visible=false;scene.add(lpool);
function buildRoad(ci){const P=rg.attributes.position,U=rg.attributes.uv,Dm=new THREE.Object3D();let np=0,nl=0;
 for(let k=0;k<NS;k++){const i=ci-80+k,o=samp(i),cs=Math.cos(o.h),sn=Math.sin(o.h),y=yR(o.s)+.13,a=k*2;
  P.setXYZ(a,o.x-cs*RWD,y,o.z+sn*RWD);P.setXYZ(a+1,o.x+cs*RWD,y,o.z-sn*RWD);U.setXY(a,0,o.s/24);U.setXY(a+1,1,o.s/24);
  for(const sd of[-1,1]){const px=o.x+cs*sd*10.8,pz=o.z-sn*sd*10.8,blk=inEntry(px,pz,22);if(i%5==0&&np<200&&!blk){Dm.rotation.set(0,o.h,0);Dm.position.set(o.x+cs*sd*10.1,y+.3,o.z-sn*sd*10.1);Dm.updateMatrix();posts.setMatrixAt(np++,Dm.matrix)}
   if(i%12==0&&nl<80&&!blk){Dm.rotation.set(0,o.h,0);Dm.position.set(o.x+cs*sd*11.4,y+4.4,o.z-sn*sd*11.4);Dm.updateMatrix();poles.setMatrixAt(nl,Dm.matrix);
    Dm.position.set(o.x+cs*sd*10.6,y+8.9,o.z-sn*sd*10.6);Dm.updateMatrix();heads.setMatrixAt(nl,Dm.matrix);Dm.position.set(o.x+cs*sd*7.2,y+.04,o.z-sn*sd*7.2);Dm.updateMatrix();lpool.setMatrixAt(nl++,Dm.matrix)}}}
 let nb=0;for(let i=ci-80;i<=ci+80&&nb<400;i++){const o=samp(i);for(const sd of[-1,1]){const r1=hh(i,sd,11);if(r1>.55)continue;const lat=sd*(11.8+hh(i,sd,12)*7+(r1<.15?3:0)),sc=.5+hh(i,sd,13)*1.1,cs=Math.cos(o.h),sn=Math.sin(o.h),ds=(hh(i,sd,14)-.5)*RDS,x=o.x+cs*lat-sn*ds,z=o.z-sn*lat-cs*ds;if(padW(x,z)>0)continue;
 Dm.rotation.set(hh(i,sd,15)*3,hh(i,sd,16)*6,0);Dm.scale.set(sc*1.3,sc*.8,sc*1.3);Dm.position.set(x,H(x,z)+sc*.3,z);Dm.updateMatrix();bushes.setMatrixAt(nb,Dm.matrix);BC.setHSL(.24+hh(i,sd,17)*.08-(r1<.15?.12:0),.4,.2+hh(i,sd,18)*.1).convertSRGBToLinear();bushes.setColorAt(nb++,BC)}}
 bushes.count=nb;bushes.instanceMatrix.needsUpdate=true;if(bushes.instanceColor)bushes.instanceColor.needsUpdate=true;
 posts.count=np;poles.count=heads.count=lpool.count=nl;[posts,poles,heads,lpool].forEach(m=>m.instanceMatrix.needsUpdate=true);P.needsUpdate=U.needsUpdate=true}
function roadFrame(){if(roadInfo(pos.x,pos.z)){curS=RS;onRoad=RD<10.4}else onRoad=false;ensureRoad(curS-700,curS+700);coFrame();const k=Math.round(curS/40);if(k!==rbI){rbI=k;buildRoad(Math.round(curS/RDS))}}
ensureRoad(-700,700);

