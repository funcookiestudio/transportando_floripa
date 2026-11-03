// ---- autoestrada infinita ----
const RDS=5,RWD=11.5,RF=[{x:REG.ox,z:REG.oz,h:REG.oh,s:0,hw:11.5,kd:0}],RB=[],RC=new Map();let RHW=11.5,RS=0,RD=1e9,RL=0,RW=0,RPx=0,RPz=0,curS=0,onRoad=true,rbI=1e9;
let yK1=0,yK2=0,yK3=0;const yKset=()=>{yK1=Math.sin(PH(14));yK2=Math.sin(1+PH(15));yK3=Math.sin(.5+PH(16))};yKset();
const kap=s=>.0018*(.5*Math.sin(s*.00083+.7+PH(10))+.32*Math.sin(s*.00219+1.9+PH(11))+.22*Math.sin(s*.00457+.3+PH(12))+.12*Math.sin(s*.0091+2.2+PH(13))),
 yR=s=>10*(Math.sin(s*.0009+PH(14))-yK1)+5*(Math.sin(s*.0027+1+PH(15))-yK2)+2.2*(Math.sin(s*.0061+.5+PH(16))-yK3)+.05*Math.sin(s*.31)+REG.y;
// ---- tipos de via por trecho (determinístico por seed): 0 autoestrada, 1 pista simples, 2 avenida urbana ----
const KHW=[11.5,6.3,9.5]; // meia largura da malha por tipo
function kindAt(s){if(Math.abs(s)<900)return 0;const ci=Math.round(s/9000);if(ci!==0&&Math.abs(s-ci*9000)<800)return 2;const sg=Math.floor((s+2300)/3400);return hh(sg,5,91)<.55?0:1}
function hwAt(s){let a=0;for(let o=-70;o<=70;o+=10)a+=KHW[kindAt(s+o)];return a/15} // afunila ao longo de ~140 m
const samp=i=>i>=0?RF[i]:RB[-i-1];
function addS(o){const k=Math.floor(o.x/52)*70001+Math.floor(o.z/52);let a=RC.get(k);if(!a)RC.set(k,a=[]);a.push(o)}addS(RF[0]);
function ensureRoad(sa,sb){while((RF.length-1)*RDS<sb){const p=RF[RF.length-1],k=kap(p.s+2.5),hm=p.h+k*2.5,n={x:p.x-Math.sin(hm)*RDS,z:p.z-Math.cos(hm)*RDS,h:p.h+k*RDS,s:p.s+RDS};n.hw=hwAt(n.s);n.kd=kindAt(n.s);RF.push(n);addS(n)}
 while(-RB.length*RDS>sa){const p=RB.length?RB[RB.length-1]:RF[0],k=kap(p.s-2.5),hm=p.h-k*2.5,n={x:p.x+Math.sin(hm)*RDS,z:p.z+Math.cos(hm)*RDS,h:p.h-k*RDS,s:p.s-RDS};n.hw=hwAt(n.s);n.kd=kindAt(n.s);RB.push(n);addS(n)}}
function roadPt(s,lat){const o=samp(Math.round(s/RDS)),ds=s-o.s;RPx=o.x-Math.sin(o.h)*ds+Math.cos(o.h)*lat;RPz=o.z-Math.cos(o.h)*ds-Math.sin(o.h)*lat}
function roadInfo(x,z){const cx=Math.floor(x/52),cz=Math.floor(z/52);let best=null,bd=1e18;
 for(let i=cx-1;i<=cx+1;i++)for(let j=cz-1;j<=cz+1;j++){const a=RC.get(i*70001+j);if(!a)continue;for(let q=0;q<a.length;q++){const o=a[q],dx=x-o.x,dz=z-o.z,d2=dx*dx+dz*dz;if(d2<bd){bd=d2;best=o}}}
 if(!best){RW=0;RD=1e9;return false}
 const dx=x-best.x,dz=z-best.z,al=dx*-Math.sin(best.h)+dz*-Math.cos(best.h),cl=Math.max(-2.6,Math.min(2.6,al));RS=best.s+cl;RL=dx*Math.cos(best.h)-dz*Math.sin(best.h);{const lat=Math.hypot(RL,al-cl),hw=best.hw;RHW=hw;RD=lat<=hw?lat*(11.5/hw):11.5+lat-hw}return true}
const COACT=[],PR1=34,PR2=58;let PADW=0,PADY=0;
const APR1=13,APR2=19;
// pátio circular + acesso (apron) retangular ligando o pátio ao asfalto, sem faixa de terra no meio
function padW(x,z){PADW=0;for(let i=0;i<COACT.length;i++){const c=COACT[i],dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);let w=0;
 if(d<PR2){const f=d<=PR1?1:1-(d-PR1)/(PR2-PR1);w=f*f*(3-2*f)}
 if(d<75){const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;if(lx>-44&&lx<-12){const a=Math.abs(lz),fz=a<=APR1?1:a>=APR2?0:1-(a-APR1)/(APR2-APR1),fx=lx<-42?(lx+44)/2:lx>-16?(-12-lx)/4:1,w2=Math.max(0,Math.min(fz,fx));const s2=w2*w2*(3-2*w2);if(s2>w)w=s2}}
 if(w>PADW){PADW=w;PADY=c.y}}return PADW}
// true se (x,z) cai na entrada de alguma empresa ativa (sem postes/mourões)
function inEntry(x,z,m){for(const c of COACT){const dx=x-c.x,dz=z-c.z;if(Math.abs(dx)>80||Math.abs(dz)>80)continue;const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;if(lx>-52&&lx<-20&&Math.abs(lz)<m)return true}return false}
const RIVA=[],OVA=[],ICA=[];let RIN=false;
// phys=1: altura de rodagem (sobre o tabuleiro das pontes); phys=0: malha do terreno (vale natural sob a ponte)
const Hx=(x,z,phys)=>{let b=Hb(x,z);if(RIVA.length)b=riverH(x,z,b);let r=b;RIN=roadInfo(x,z);if(RIN){let w=1;if(RD>15){const f=Math.max(0,(50-RD)/35);w=f*f*(3-2*f)}RW=w;let wb=1,Yr=yR(RS)+.1;if(RIVA.length){wb=1-bridgeW(RS);Yr=brTarget(Yr)}r=b+(Yr-b)*w;if(phys&&wb<1&&RD<=11.6)r=r*wb+(yR(RS)+.1)*(1-wb)}if(ICA.length)r=icPull(x,z,r,phys);if(COACT.length&&padW(x,z)>0)r+=(PADY-r)*PADW;return r},
 H=(x,z)=>Hx(x,z,1);
// atlas da pista: 4 faixas de 512 px (0 autoestrada, 1 pista simples, 2 avenida, 3 reserva), cada uma cobrindo a largura total da malha do tipo
const RK=[{hw:11.5,A:9.4,gw:1.3,tr:[-6.6,-2.2,2.2,6.6],edge:[-8.8,8.8],edgeW:.27,dash:[-4.4,4.4],ctr:[-.3,.3],side:false},
 {hw:6.3,A:4.7,gw:.95,tr:[-1.9,1.9],edge:[-4.05,4.05],edgeW:.16,dash:[],ctr:[-.2,.2],side:false},
 {hw:9.5,A:8.1,gw:0,tr:[-5.4,-1.8,1.8,5.4],edge:[-7.5,7.5],edgeW:.2,dash:[-3.6,3.6],ctr:[-.3,.3],side:true},
 {hw:5.2,A:4.4,gw:.8,tr:[-1.6,1.6],edge:[-3.9,3.9],edgeW:.16,dash:[],ctr:[],side:false}]; // 3 = ramais e pátios: só linhas de borda
const rMat=new THREE.MeshStandardMaterial({roughness:.85,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,alphaTest:.5});
function mkRoadAtlas(clean){const AW=2048,SW=512,Hh=1024,cv=document.createElement('canvas');cv.width=AW;cv.height=Hh;const g=cv.getContext('2d'),rnd=(a,b)=>a+Math.random()*(b-a),
 wob=(y,ph,A)=>{let v=0;[3,7,13,29].forEach((k,i)=>{v+=Math.sin(6.2832*k*y/Hh+ph*(i+1.3))*A/(i+1.4)});return v};
 RK.forEach((K,ki)=>{const x0=ki*SW,PX=SW/(2*K.hw),cx=x0+SW/2;g.save();g.beginPath();g.rect(x0,0,SW,Hh);g.clip();g.globalCompositeOperation='source-over';
  for(let y=0;y<Hh;y++){const aL=K.A*PX+(clean?0:wob(y,1.1,9*PX/22.26)),aR=K.A*PX+(clean?0:wob(y,4.7,9*PX/22.26));
   if(K.side){g.fillStyle='#8d8f8a';g.fillRect(cx-K.hw*PX,y,2*K.hw*PX,1);g.fillStyle='#55575a';g.fillRect(cx-aL-3,y,aL+aR+6,1);g.fillStyle='#3b3d41';g.fillRect(cx-aL,y,aL+aR,1)}
   else{const gL=clean?aL:aL+PX*(K.gw+(K.gw>1?.9:.35)*Math.sin(6.2832*5*y/Hh+2)),gR=clean?aR:aR+PX*(K.gw+(K.gw>1?.9:.35)*Math.sin(6.2832*6*y/Hh+5));g.fillStyle='#6b6253';g.fillRect(cx-gL,y,gL+gR,1);g.fillStyle='#3b3d41';g.fillRect(cx-aL,y,aL+aR,1)}}
  if(!K.side)for(let i=0;i<(clean?0:2200*(K.hw/11.5)+300);i++){const sd=Math.random()<.5?-1:1,s=rnd(2,4);g.fillStyle='rgb('+(90+Math.random()*50|0)+','+(82+Math.random()*44|0)+','+(66+Math.random()*34|0)+')';g.fillRect(cx+sd*rnd(K.A+.8,K.A+1.1+K.gw)*PX,rnd(0,Hh),s,s)}
  else{g.strokeStyle='rgba(60,60,60,.35)';g.lineWidth=1;for(let y=0;y<Hh;y+=40){g.beginPath();g.moveTo(cx-K.hw*PX,y);g.lineTo(cx-(K.A+.3)*PX,y);g.moveTo(cx+(K.A+.3)*PX,y);g.lineTo(cx+K.hw*PX,y);g.stroke()}}
  g.globalCompositeOperation='source-atop';
  for(let i=0;i<9000*(K.hw/11.5)+1500;i++){const v=rnd(25,80)|0;g.fillStyle='rgba('+v+','+v+','+(v+4)+','+rnd(.1,.4)+')';g.fillRect(rnd(x0,x0+SW),rnd(0,Hh),rnd(1,3),rnd(1,3))}
  for(const xc of K.tr)for(const o of[-.9,.9]){const x=cx+(xc+o*(K.hw<8?.8:1))*PX,w=.55*PX,gr=g.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(0,0,0,.14)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-w,0,2*w,Hh)}
  for(let i=0;i<(clean?0:7);i++){const w=rnd(.8,3)*PX*(K.A/9.4)**.5,h=rnd(40,260),x=cx+rnd(-K.A+1,K.A-1)*PX,y=rnd(0,Hh-h);g.fillStyle=Math.random()<.6?'rgba(18,18,20,.2)':'rgba(80,82,86,.14)';g.fillRect(x,y,w,h);g.strokeStyle='rgba(8,8,8,.2)';g.strokeRect(x,y,w,h)}
  for(let i=0;i<(clean?0:10);i++){let x=cx+rnd(-K.A,K.A)*PX,y=rnd(0,Hh-200);g.strokeStyle='rgba(10,10,10,.45)';g.lineWidth=rnd(.7,1.3);g.beginPath();g.moveTo(x,y);const n=rnd(6,14);for(let k=0;k<n;k++){x+=rnd(-8,8);y+=rnd(5,18);g.lineTo(x,y)}g.stroke()}
  for(let i=0;i<(clean?0:3);i++){g.fillStyle='rgba(8,8,10,.14)';g.beginPath();g.ellipse(cx+rnd(-K.A+1,K.A-1)*PX,rnd(60,Hh-60),rnd(6,16),rnd(20,60),0,0,6.2832);g.fill()}
  const Ln=(x,w,y0,y1)=>{g.fillRect(cx+x*PX-w/2,y0,w,y1-y0)};g.fillStyle='rgba(232,232,226,.92)';for(const x of K.edge)Ln(x,K.edgeW*PX,0,Hh);for(const y0 of[0,512])for(const x of K.dash)Ln(x,.22*PX,y0,y0+128);
  g.fillStyle='rgba(230,184,0,.92)';for(const x of K.ctr)Ln(x,.18*PX,0,Hh);
  g.fillStyle='rgba(58,60,64,.7)';const xs=K.edge.concat(K.dash,K.ctr);for(let i=0;i<120;i++)g.fillRect(cx+xs[i%xs.length]*PX-4+rnd(-2,2),rnd(0,Hh),rnd(3,8),rnd(4,26));
  g.restore()});
 const t=new THREE.CanvasTexture(cv);t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t}
rMat.map=mkRoadAtlas(false);rMat.needsUpdate=true;var rMatClean=null;
// malha da pista: 4 vértices por trecho de 5 m (cada trecho usa a faixa do atlas do seu tipo; largura varia nos vértices)
const NS=161,NQ=NS-1,rg=new THREE.BufferGeometry(),rIdx=[];rg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NQ*12),3));rg.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(NQ*8),2));
rg.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from({length:NQ*12},(_,i)=>i%3==1?1:0),3));
for(let i=0;i<NQ;i++){const a=i*4;rIdx.push(a,a+1,a+2,a+1,a+3,a+2)}rg.setIndex(rIdx);
const roadMesh=new THREE.Mesh(rg,rMat);roadMesh.frustumCulled=false;roadMesh.receiveShadow=true;scene.add(roadMesh);
const LM=new THREE.MeshStandardMaterial({color:C(0xffffff),emissive:C(0xffe2a0),emissiveIntensity:.2}),
kmk=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,1.5,.12),new THREE.MeshStandardMaterial({color:C(0x1f7a3a),roughness:.6}),12),
posts=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.8,.12),new THREE.MeshStandardMaterial({color:C(0xf0f0f0),roughness:.6}),200),
poles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.16,9,6),new THREE.MeshStandardMaterial({color:C(0x7a7f85),roughness:.6,metalness:.4}),80),
heads=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,.18,.5),LM,80);[posts,poles,heads,kmk].forEach(m=>{m.frustumCulled=false;scene.add(m)});poles.castShadow=true;
const bushes=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),400);bushes.frustumCulled=false;scene.add(bushes);const BC=new THREE.Color(),lpC=document.createElement('canvas');lpC.width=lpC.height=64;
{const g=lpC.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(.5,'rgba(255,190,110,.35)');r.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}
const lpool=new THREE.InstancedMesh(new THREE.PlaneGeometry(13,13).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lpC),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),80);
lpool.frustumCulled=false;lpool.visible=false;scene.add(lpool);
function buildRoad(ci){const P=rg.attributes.position,U=rg.attributes.uv,Dm=new THREE.Object3D();let np=0,nl=0;const SL=[];
 for(let k=0;k<NS;k++){const i=ci-80+k,o=samp(i),cs=Math.cos(o.h),sn=Math.sin(o.h),y=yR(o.s)+.13,hw=o.hw;SL.push({x:o.x,z:o.z,y,cs,sn,hw,s:o.s,kd:o.kd});
  for(const sd of[-1,1]){const lp=hw-.7,blk=inEntry(o.x+cs*sd*lp,o.z-sn*sd*lp,22),kd=o.kd;
   if(kd!==2&&i%(kd===1?4:5)==0&&np<200&&!blk){Dm.rotation.set(0,o.h,0);Dm.position.set(o.x+cs*sd*(hw-1.4),y+.3,o.z-sn*sd*(hw-1.4));Dm.updateMatrix();posts.setMatrixAt(np++,Dm.matrix)}
   if(kd!==1&&i%(kd===2?6:12)==0&&nl<80&&!blk&&nearCo(o.s,100)){Dm.rotation.set(0,o.h,0);Dm.position.set(o.x+cs*sd*(hw-.1),y+4.4,o.z-sn*sd*(hw-.1));Dm.updateMatrix();poles.setMatrixAt(nl,Dm.matrix);
    Dm.position.set(o.x+cs*sd*(hw-.9),y+8.9,o.z-sn*sd*(hw-.9));Dm.updateMatrix();heads.setMatrixAt(nl,Dm.matrix);Dm.position.set(o.x+cs*sd*(hw-4.3),y+.04,o.z-sn*sd*(hw-4.3));Dm.updateMatrix();lpool.setMatrixAt(nl++,Dm.matrix)}}}
 for(let q=0;q<NQ;q++){const a=SL[q],b=SL[q+1],ki=a.kd,uL=(ki*512+1)/2048,uR=((ki+1)*512-1)/2048,v0=a.s/24,v1=b.s/24,w=q*4;
  P.setXYZ(w,a.x-a.cs*a.hw,a.y,a.z+a.sn*a.hw);P.setXYZ(w+1,a.x+a.cs*a.hw,a.y,a.z-a.sn*a.hw);P.setXYZ(w+2,b.x-b.cs*b.hw,b.y,b.z+b.sn*b.hw);P.setXYZ(w+3,b.x+b.cs*b.hw,b.y,b.z-b.sn*b.hw);
  U.setXY(w,uL,v0);U.setXY(w+1,uR,v0);U.setXY(w+2,uL,v1);U.setXY(w+3,uR,v1)}
 let nb=0;for(let i=ci-80;i<=ci+80&&nb<400;i++){const o=samp(i);for(const sd of[-1,1]){const r1=hh(i,sd,11);if(r1>.55)continue;const lat=sd*(o.hw+.3+hh(i,sd,12)*7+(r1<.15?3:0)),sc=.5+hh(i,sd,13)*1.1,cs=Math.cos(o.h),sn=Math.sin(o.h),ds=(hh(i,sd,14)-.5)*RDS,x=o.x+cs*lat-sn*ds,z=o.z-sn*lat-cs*ds;if(padW(x,z)>0||featBlock(x,z))continue;
 Dm.rotation.set(hh(i,sd,15)*3,hh(i,sd,16)*6,0);Dm.scale.set(sc*1.3,sc*.8,sc*1.3);Dm.position.set(x,H(x,z)+sc*.3,z);Dm.updateMatrix();bushes.setMatrixAt(nb,Dm.matrix);BC.setHSL(.24+hh(i,sd,17)*.08-(r1<.15?.12:0),.4,.2+hh(i,sd,18)*.1).convertSRGBToLinear();bushes.setColorAt(nb++,BC)}}
 bushes.count=nb;bushes.instanceMatrix.needsUpdate=true;if(bushes.instanceColor)bushes.instanceColor.needsUpdate=true;
  {let nk=0;for(let k=0;k<NS&&nk<12;k++){const o=SL[k];if(o.kd===2)continue;const lx=o.x+o.cs*(o.hw+2.5),lz=o.z-o.sn*(o.hw+2.5);if(Math.abs(o.s%1000)<RDS/2&&Math.abs(o.s)>10&&!inEntry(lx,lz,30)&&!featBlock(lx,lz)){Dm.rotation.set(0,Math.atan2(o.cs,-o.sn),0);Dm.position.set(lx,o.y+.75,lz);Dm.updateMatrix();kmk.setMatrixAt(nk++,Dm.matrix)}}kmk.count=nk;kmk.instanceMatrix.needsUpdate=true}
 posts.count=np;poles.count=heads.count=lpool.count=nl;[posts,poles,heads,lpool].forEach(m=>m.instanceMatrix.needsUpdate=true);P.needsUpdate=U.needsUpdate=true}
function roadFrame(){if(roadInfo(pos.x,pos.z)){curS=RS;onRoad=RD<10.4}else onRoad=false;ensureRoad(curS-1100,curS+1100);coFrame();const k=Math.round(curS/40);if(k!==rbI){rbI=k;buildRoad(Math.round(curS/RDS))}}
ensureRoad(-700,700);

