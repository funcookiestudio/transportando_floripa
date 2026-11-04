// ---- grade de rodovias (norte/sul/leste/oeste): mapa lógico puro, determinístico, sem desenho ----
// Etapa 1. Nada aqui altera o jogo atual: a chave GRID_ON fica desligada até as etapas seguintes.
// Eixos: rodovias L-O (EW) em z ≈ (j+.5)·G e N-S (NS) em x ≈ i·G; cada uma serpenteia suavemente.
// A rodovia NS 0 passa por x=0 em z=0 (ponto de partida); o primeiro cruzamento fica a G/2 à frente (z=-G/2).
var GRID=(function(){
 const G=13000,AMP=120,HW=[11.5,6.3];
 const hs=(a,b,c)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c|0,2147483647);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296};
 const SEED=()=>((window.WSEED&&WSEED.n)|0);
 // deslocamento lateral suave da rodovia (axis 0=EW,1=NS; idx; t = coordenada ao longo da via); zero em t=0 para a rodovia 0 de NS
 const ph=(ax,k,m)=>hs(ax*977+k,m,SEED()+31)*6.2832;
 const wob=(ax,k,t)=>AMP*(.5*Math.sin(t*.0008+ph(ax,k,1))+.3*Math.sin(t*.0021+ph(ax,k,2))+.2*Math.sin(t*.0047+ph(ax,k,3)));
 const dwob=(ax,k,t)=>AMP*(.5*.0008*Math.cos(t*.0008+ph(ax,k,1))+.3*.0021*Math.cos(t*.0021+ph(ax,k,2))+.2*.0047*Math.cos(t*.0047+ph(ax,k,3)));
 const jit=(ax,k)=>(hs(ax*131+k,7,SEED()+5)-.5)*300; // desloca a linha-base de cada rodovia (±150 m)
 // z do eixo da rodovia EW j na posição x ; x do eixo da rodovia NS i na posição z
 // linhas-base irregulares: distância entre trevos sorteada entre 8 e 18 km (por coluna/linha), acumulada sob demanda
 const gapX=i=>8000+hs(i,11,SEED()+77)*10000,gapZ=j=>j===0?8000:8000+hs(j,13,SEED()+79)*10000;
 const XA={p:0,n:0,v:{0:0}},ZA={p:0,n:-1,v:{0:4000,'-1':-4000}};
 let SEEDK=null;const chk=()=>{const k=SEED();if(SEEDK!==k){SEEDK=k;XA.p=0;XA.n=0;XA.v={0:0};ZA.p=0;ZA.n=-1;ZA.v={0:4000,'-1':-4000}}};
 const XL=i=>{chk();const a=XA;if(a.v[i]!==undefined)return a.v[i];if(i>0){while(a.p<i){a.p++;a.v[a.p]=a.v[a.p-1]+gapX(a.p)}}else{while(a.n>i){a.n--;a.v[a.n]=a.v[a.n+1]-gapX(a.n+1)}}return a.v[i]};
 const ZL=j=>{chk();const a=ZA;if(a.v[j]!==undefined)return a.v[j];if(j>0){while(a.p<j){a.p++;a.v[a.p]=a.v[a.p-1]+gapZ(a.p)}}else{while(a.n>j){a.n--;a.v[a.n]=a.v[a.n+1]-gapZ(a.n+1)}}return a.v[j]};
 // índice da coluna/linha imediatamente antes de x/z (XL(i)<=x<XL(i+1))
 const idxX=x=>{let i=Math.floor(x/13000);while(XL(i)>x)i--;while(XL(i+1)<=x)i++;return i},idxZ=z=>{let j=Math.floor(z/13000);while(ZL(j)>z)j--;while(ZL(j+1)<=z)j++;return j};
 const ew=(j,x)=>ZL(j)+jit(0,j)+wob(0,j,x)-wob(0,j,0);
 const ns=(i,z)=>XL(i)+(i===0?0:jit(1,i))+wob(1,i,z)-wob(1,i,0);
 // derivadas (inclinação) para direção
 const dew=(j,x)=>dwob(0,j,x),dns=(i,z)=>dwob(1,i,z);
 const kind=(ax,k)=>(ax===1&&k===0)?0:hs(ax*53+k,3,SEED()+9)<.6?0:1;           // 0 autoestrada, 1 pista simples
 const hw=(ax,k)=>HW[kind(ax,k)];
 // cruzamento (i,j): ponto fixo x=ns(i,z), z=ew(j,x)
 function cross(i,j){let x=XL(i),z=ZL(j);for(let n=0;n<12;n++){x=ns(i,z);z=ew(j,x)}return{i,j,x,z,hEW:Math.atan2(dew(j,x),1),hNS:Math.atan2(dns(i,z),1)}}
 // rodovias a até R metros de (x,z): lateral aproximada d = distância ao eixo na direção perpendicular
 function near(x,z,R){const out=[],i0=idxX(x-R-200),i1=idxX(x+R+200)+1,j0=idxZ(z-R-200),j1=idxZ(z+R+200)+1;
  for(let j=j0;j<=j1;j++){const zc=ew(j,x),a=Math.atan(dew(j,x)),d=(z-zc)*Math.cos(a);if(Math.abs(d)<=R)out.push({ax:0,idx:j,d,t:x,hw:hw(0,j),kind:kind(0,j),h:a})}
  for(let i=i0;i<=i1;i++){const xc=ns(i,z),a=Math.atan(dns(i,z)),d=(x-xc)*Math.cos(a);if(Math.abs(d)<=R)out.push({ax:1,idx:i,d,t:z,hw:hw(1,i),kind:kind(1,i),h:a})}
  return out}
 // cruzamentos a até R metros de (x,z)
 function crossNear(x,z,R){const out=[],i0=idxX(x-R-300),i1=idxX(x+R+300)+1,j0=idxZ(z-R-300),j1=idxZ(z+R+300)+1;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const c=cross(i,j);if(Math.hypot(c.x-x,c.z-z)<=R)out.push(c)}return out}
 return{G,AMP,ew,ns,dew,dns,kind,hw,cross,near,crossNear,hs,XL,ZL,idxX,idxZ}
})();

// ---- Etapas 2 e 3: pista da grade por blocos + viaduto (L-O por cima) com 4 ramais por cruzamento ----
var gridY=(function(){const o=(x,z)=>7*Math.sin(x*.00071+z*.00043+1.3)+4*Math.sin(x*.0017-z*.0013+1)+1.5*Math.sin(x*.0043+z*.0039+.5),y0=o(0,0);return(x,z)=>o(x,z)-y0})();
var GRVIS=new Set();try{if(typeof SAVED!=='undefined'&&SAVED&&Array.isArray(SAVED.vis))for(const k of SAVED.vis)if(typeof k==='number')GRVIS.add(k)}catch(e){}
// início: empresa aleatória perto da origem (a que você nasce já conta como visitada)
var gridStart=function(){const ax=Math.random()<.5?0:1,idx=Math.floor(Math.random()*7)-3,m=Math.floor(Math.random()*7)-3,c=coGet(gridCoKey(ax,idx,m,Math.floor(Math.random()*gridSegN(ax,idx,m)))),q=c.loc(BZ_X,0);
 pos.x=q.x;pos.z=q.z;hd=Math.atan2(c.cr,-c.sr);th=hd;camH=hd;curS=0;autoBoard=true;vel.x=vel.z=0;tcx=1e9;ocx=1e9;gbv=-1;GRVIS.add(c.k)};
// empresa já visitada mais próxima da posição atual (usada ao reiniciar/guincho)
function gridNearVisited(){let b=null,bd=1e18;for(const k of GRVIS){if(!gridKeyOk(k))continue;const c=coGet(k),d=Math.hypot(c.x-pos.x,c.z-pos.z);if(d<bd){bd=d;b=c}}return b}
var GRSG=null,GRB=null,gbv=-1,gbx=0,gbz=0,GRMS=null,GRAMP=null,GRRAIL=null,GRBR=null,GRCOLS=[];const GRQ=450,GRM=6,GRR=1100,RQ=4800,LIFT=7,LR=380,LS=300,UB=200,DK=4.8;
const XCM=new Map(),gx=(i,j)=>{const k=i+','+j;let c=XCM.get(k);if(!c){if(XCM.size>400)XCM.clear();XCM.set(k,c=GRID.cross(i,j))}return c};
const gsm=t=>t*t*(3-2*t);var RAMP_PUSH=.35;
// elevação do tabuleiro da rodovia L-O j em x (sobe LIFT m ao chegar em cada cruzamento)
function liftEW(j,x){let m=0;const i0=GRID.idxX(x);for(let i=i0-1;i<=i0+2;i++){const u=Math.abs(x-gx(i,j).x);if(u<LR)m=Math.max(m,LIFT*gsm(Math.min(1,(LR-u)/LS)))}return m}
function gridInit(){GRMS=[];const mk=(nq)=>{const idx=[];for(let i=0;i<nq;i++){const a=i*4;idx.push(a,a+1,a+2,a+1,a+3,a+2)}const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nq*12),3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(nq*8),2));
  g.setAttribute('normal',new THREE.BufferAttribute(Float32Array.from({length:nq*12},(_,i)=>i%3==1?1:0),3));g.setIndex(idx);g.setDrawRange(0,0);
  const m=new THREE.Mesh(g,rMat);m.frustumCulled=false;m.receiveShadow=true;m.visible=false;scene.add(m);return m};
 for(let k=0;k<GRM;k++)GRMS.push(mk(GRQ));GRAMP=mk(RQ);
 GRRAIL=new THREE.InstancedMesh(new THREE.BoxGeometry(.4,.9,5.2),new THREE.MeshStandardMaterial({color:C(0xb9bcc0),roughness:.8}),4000);GRRAIL.frustumCulled=false;GRRAIL.count=0;scene.add(GRRAIL);
 GRBR=new THREE.Group();scene.add(GRBR);GRSG=new THREE.Group();scene.add(GRSG);
 roadMesh.visible=false;for(const m of[posts,poles,heads,kmk,bushes,lpool])m.visible=false}
function gridFill(S,k0){for(let k=k0;k<S.length;k++){const a=S[k],b=S[k+1]||S[k-1],d=Math.hypot(b.x-a.x,b.z-a.z)||1;a.dy=(k+1<S.length?(S[k+1].y-a.y):(a.y-S[k-1].y))/d;a.lv=a.lf>1.5?1:0}}
// amostras (5 m em t) de uma rodovia, na ordem de avanço (norte = z decrescente; oeste = x decrescente)
function gridSamples(r,tt){const t1=Math.ceil((tt+GRR)/5)*5,t0=Math.floor((tt-GRR)/5)*5,out=[];
 for(let t=t1;t>=t0;t-=5){let x,z,h,lf=0;if(r.ax===1){z=t;x=GRID.ns(r.idx,z);h=Math.atan(GRID.dns(r.idx,z))}else{x=t;z=GRID.ew(r.idx,x);h=Math.PI/2-Math.atan(GRID.dew(r.idx,x));lf=liftEW(r.idx,x)}
  out.push({x,z,h,s:-t,ax:r.ax,id:r.idx,hw:r.hw,kd:r.kind,lf,y:gridY(x,z)+.13+(r.ax?0:.02)+lf})}
 gridFill(out,0);return out}
// ramal (cotovelo) do quadrante (sN,sE) do cruzamento c: sai da N-S a 460 m e entra na L-O (já elevada) a UB m do cruzamento
const GRRM=new Map();
function gridRamp(c,sN,sE){const k=c.i+','+c.j+','+sN+','+sE;let r=GRRM.get(k);if(!r){if(GRRM.size>120)GRRM.clear();GRRM.set(k,r=gridRampMk(c,sN,sE))}return r}
function gridRampMk(c,sN,sE){const G=GRID,i=c.i,j=c.j,hwN=G.hw(1,i),hwE=G.hw(0,j);
 const zA=c.z+sN*460,xA=G.ns(i,zA),hA=Math.atan(G.dns(i,zA));let nx=Math.cos(hA),nz=-Math.sin(hA);if(nx*sE<0){nx=-nx;nz=-nz}
 const A=[xA+nx*(hwN+DK),zA+nz*(hwN+DK)],TA=[-Math.sin(hA)*sN,-Math.cos(hA)*sN];
 const xB=c.x+sE*UB,zB=G.ew(j,xB),hB=Math.PI/2-Math.atan(G.dew(j,xB));let mx=Math.cos(hB),mz=-Math.sin(hB);if(mz*sN<0){mx=-mx;mz=-mz}
 const B=[xB+mx*(hwE+DK),zB+mz*(hwE+DK)],TB=[sE*Math.sin(hB),sE*Math.cos(hB)];
 const L=Math.hypot(B[0]-A[0],B[1]-A[1]),pa=RAMP_PUSH*L,CP=[A,[A[0]+TA[0]*.2*L,A[1]+TA[1]*.2*L],[A[0]+TA[0]*.4*L+nx*pa,A[1]+TA[1]*.4*L+nz*pa],[B[0]-TB[0]*.4*L+mx*pa,B[1]-TB[1]*.4*L+mz*pa],[B[0]-TB[0]*.2*L,B[1]-TB[1]*.2*L],B];
 // Bézier de grau 5: pontos 0-1 e 4-5 alinhados às tangentes das rodovias (entrada e saída tangentes, sem quina)
 const BN=[1,5,10,10,5,1],bz=(t)=>{const u=1-t;let x=0,z=0;for(let q=0;q<6;q++){const w=BN[q]*Math.pow(u,5-q)*Math.pow(t,q);x+=w*CP[q][0];z+=w*CP[q][1]}return[x,z]};
 let len=0,pp=bz(0);for(let q=1;q<=40;q++){const p=bz(q/40);len+=Math.hypot(p[0]-pp[0],p[1]-pp[1]);pp=p}
 const n=Math.max(8,Math.ceil(len/5)),yA=gridY(A[0],A[1])+.13,yB=gridY(B[0],B[1])+liftEW(j,B[0])+.15,out=[];
 for(let q=0;q<=n;q++){const t=q/n,p=bz(t),p2=bz(Math.min(1,t+.004)),p1=bz(Math.max(0,t-.004)),dx=p2[0]-p1[0],dz=p2[1]-p1[1],y=yA+(yB-yA)*gsm(t);
  out.push({x:p[0],z:p[1],h:Math.atan2(-dx,-dz),s:0,hw:5.2,kd:3,t,y,lf:y-(gridY(p[0],p[1])+.13)})}
 for(let q=0;q<out.length;q++)out[q].s=5*q;
 gridFill(out,0);out.meta={i,j,sN,sE,n,tA:zA,tB:xB,fwd:sN===sE};return out}

// ---- Etapa 4: placas de saída antes de cada trevo (verdes, duas por aproximação) ----
const GRSM=new Map(),GRSGEO=new THREE.PlaneGeometry(13,3.2),GRPGEO=new THREE.CylinderGeometry(.17,.17,1,6),GRPMAT=new THREE.MeshStandardMaterial({color:C(0x7a7f85),roughness:.6,metalness:.4});
function gridSignMat(l1,l2,l3){const k=l1+'|'+l2+'|'+l3;let m=GRSM.get(k);if(m)return m;if(GRSM.size>150)GRSM.clear();
 const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const g=cv.getContext('2d');g.fillStyle='#0b6b3a';g.fillRect(0,0,1024,256);g.strokeStyle='#f2f2ee';g.lineWidth=8;g.strokeRect(10,10,1004,236);
 g.fillStyle='#f2f2ee';g.textAlign='center';g.font='700 56px Barlow Condensed,Arial Narrow,Arial,sans-serif';g.fillText(l1,512,78);g.font='700 100px Barlow Condensed,Arial Narrow,Arial,sans-serif';g.fillText(l2,512,176);g.font='600 42px Barlow,Arial,sans-serif';g.fillText(l3,512,228);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;m=new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});GRSM.set(k,m);return m}
// placa à direita da pista, voltada para quem chega: road r (ax,idx), distância d antes do trevo c, sentido fwdDec (true = param decrescente: norte/oeste)
function gridSign(r,c,d,fwdDec,l1,l2,l3){const G=GRID,tc=r.ax===1?c.z:c.x,t=tc+(fwdDec?d:-d);let x,z,h,lf=0;
 if(r.ax===1){z=t;x=G.ns(r.idx,z);h=Math.atan(G.dns(r.idx,z))}else{x=t;z=G.ew(r.idx,x);h=Math.PI/2-Math.atan(G.dew(r.idx,x));lf=liftEW(r.idx,x)}
 if(!fwdDec)h+=Math.PI;const hw=G.hw(r.ax,r.idx),off=hw+3.2,y=gridY(x,z)+.13+lf,rx=Math.cos(h)*off,rz=-Math.sin(h)*off;
 const m=new THREE.Mesh(GRSGEO,gridSignMat(l1,l2,l3));m.position.set(x+rx,y+5.4,z+rz);m.rotation.y=h;GRSG.add(m);
 const pl=new THREE.Mesh(GRPGEO,GRPMAT);pl.scale.set(1,3.8,1);pl.position.set(x+rx,y+1.9,z+rz);GRSG.add(pl)}
function gridSigns(cs){for(const g of[...GRSG.children])GRSG.remove(g);
 for(const c of cs){const i=c.i,j=c.j,rN={ax:1,idx:i},rE={ax:0,idx:j};
  // N-S: rampas começam a 460 m do trevo; sinaliza a 960 e 520 m. Quem vai ao norte (param decrescente) vem do sul
  for(const[dec,L,R]of[[true,'Oeste','Leste'],[false,'Leste','Oeste']])for(const d of[960,520]){const ex=d-460;gridSign(rN,c,d,dec,'SAÍDA · '+ex+' m','◄ '+L+'   '+R+' ►','Rod. L-O '+j)}
  // L-O: rampas a 200 m do trevo; sinaliza a 700 e 260 m. Rumo leste (param crescente) vem do oeste
  for(const[dec,L,R]of[[false,'Norte','Sul'],[true,'Sul','Norte']])for(const d of[700,260]){const ex=d-200;gridSign(rE,c,d,dec,'SAÍDA · '+ex+' m','◄ '+L+'   '+R+' ►','Rod. N-S '+i)}}}
function gridBuild(px,pz){if(!GRMS)gridInit();RC.clear();const roads=GRID.near(px,pz,GRR).slice(0,GRM),Dm=new THREE.Object3D();let nr=0;GRCOLS=[];
 const rail=(o,sd,hwR,lfMin,spc)=>{if(nr>=4000)return;const cs=Math.cos(o.h),sn=Math.sin(o.h),lat=sd*(hwR+.45);Dm.position.set(o.x+cs*lat,o.y+.5,o.z-sn*lat);Dm.rotation.set(0,o.h,0);Dm.updateMatrix();GRRAIL.setMatrixAt(nr++,Dm.matrix);
  if(spc)GRCOLS.push({x:o.x+cs*lat,z:o.z-sn*lat,r:.7,k:1,y:o.y})};
 GRMS.forEach((m,k)=>{const r=roads[k];if(!r){m.visible=false;return}
  const S=gridSamples(r,r.t),P=m.geometry.attributes.position,U=m.geometry.attributes.uv,nq=Math.min(GRQ,S.length-1);
  for(const o of S)addS(o);
  for(let q=0;q<nq;q++){const a=S[q],b=S[q+1],ca=Math.cos(a.h),sa=Math.sin(a.h),cb=Math.cos(b.h),sb=Math.sin(b.h),uL=(a.kd*512+1)/2048,uR=((a.kd+1)*512-1)/2048,v0=a.s/24,v1=b.s/24,w=q*4;
   P.setXYZ(w,a.x-ca*a.hw,a.y,a.z+sa*a.hw);P.setXYZ(w+1,a.x+ca*a.hw,a.y,a.z-sa*a.hw);P.setXYZ(w+2,b.x-cb*b.hw,b.y,b.z+sb*b.hw);P.setXYZ(w+3,b.x+cb*b.hw,b.y,b.z-sb*b.hw);
   U.setXY(w,uL,v0);U.setXY(w+1,uR,v0);U.setXY(w+2,uL,v1);U.setXY(w+3,uR,v1)}
  // guarda-corpo da L-O elevada (só perto do cruzamento, para não fechar a entrada dos ramais)
  if(r.ax===0)for(let q=0;q<nq;q++){const o=S[q];if(o.lf<6.2)continue;for(const sd of[-1,1])rail(o,sd,o.hw,0,1)}
  m.geometry.setDrawRange(0,nq*6);P.needsUpdate=U.needsUpdate=true;m.visible=true});
 // ramais e viaduto dos cruzamentos próximos
 for(const g of[...GRBR.children])GRBR.remove(g);
 const P=GRAMP.geometry.attributes.position,U=GRAMP.geometry.attributes.uv;let qn=0;const cs=GRID.crossNear(px,pz,1500).slice(0,6),conc=new THREE.MeshStandardMaterial({color:C(0x9a9ca0),roughness:.9});
 for(const c of cs){
  for(const sN of[-1,1])for(const sE of[-1,1]){const S=gridRamp(c,sN,sE);for(const o of S)addS(o);
   for(let q=0;q<S.length-1&&qn<RQ;q++){const a=S[q],b=S[q+1],ca=Math.cos(a.h),sa=Math.sin(a.h),cb=Math.cos(b.h),sb=Math.sin(b.h),uL=(3*512+1)/2048,uR=(4*512-1)/2048,v0=a.s/24,v1=b.s/24,w=qn*4;qn++;
    P.setXYZ(w,a.x-ca*a.hw,a.y,a.z+sa*a.hw);P.setXYZ(w+1,a.x+ca*a.hw,a.y,a.z-sa*a.hw);P.setXYZ(w+2,b.x-cb*b.hw,b.y,b.z+sb*b.hw);P.setXYZ(w+3,b.x+cb*b.hw,b.y,b.z-sb*b.hw);
    U.setXY(w,uL,v0);U.setXY(w+1,uR,v0);U.setXY(w+2,uL,v1);U.setXY(w+3,uR,v1);
    if(a.t>.08&&a.t<.82&&a.lf>1.5)for(const sd of[-1,1])rail(a,sd,a.hw,0,1)}}
  // estrutura sob o tabuleiro: laje + paredes de contenção dos dois lados da pista que passa por baixo
  const hwN=GRID.hw(1,c.i),hwE=GRID.hw(0,c.j),hE=Math.PI/2-Math.atan(GRID.dew(c.j,c.x)),y0=gridY(c.x,c.z)+.13,yT=y0+LIFT+.02,span=2*hwE+3,half=hwN+3,box=(w,h,l,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),conc);m.position.set(x,y,z);m.rotation.y=hE;m.castShadow=m.receiveShadow=true;GRBR.add(m)};
  const ca=Math.cos(hE),sa=Math.sin(hE);// eixo local z = ao longo da L-O (sentido -avanço)
  box(span,1.1,2*half+1,c.x,yT-.62,c.z);
  for(const sd of[-1,1]){const ux=sa*sd*half,uz=ca*sd*half;box(span,yT-1.2-(y0-.6),1.2,c.x+ux,(yT-1.2+y0-.6)/2,c.z+uz);
   for(let l=-span/2+1;l<=span/2-1;l+=3){GRCOLS.push({x:c.x+ux+ca*l,z:c.z+uz-sa*l,r:1.6,k:1,y:y0})}}}
 gridSigns(cs);GRAMP.geometry.setDrawRange(0,qn*6);GRAMP.visible=qn>0;P.needsUpdate=U.needsUpdate=true;
 GRRAIL.count=nr;GRRAIL.instanceMatrix.needsUpdate=true;gbv=1;tcx=1e9;ocx=1e9}
// consulta da pista em (x,z): separa amostras de nível baixo (lv 0) e elevadas (lv 1); o nível vem da altura atual do caminhão (HREF)
var gl_c=0,gl_r=0,gl_l=0;
function gridLat(o,x,z){const dx=x-o.x,dz=z-o.z,al=dx*-Math.sin(o.h)+dz*-Math.cos(o.h);gl_c=Math.max(-2.6,Math.min(2.6,al));gl_r=dx*Math.cos(o.h)-dz*Math.sin(o.h);gl_l=Math.hypot(gl_r,al-gl_c)}
function gridRoadInfo(x,z){const cx=Math.floor(x/52),cz=Math.floor(z/52);let b0=null,b1=null,d0=1e18,d1=1e18;
 for(let i=cx-1;i<=cx+1;i++)for(let j=cz-1;j<=cz+1;j++){const a=RC.get(i*70001+j);if(!a)continue;for(let q=0;q<a.length;q++){const o=a[q],dx=x-o.x,dz=z-o.z,d2=dx*dx+dz*dz;if(o.lv){if(d2<d1){d1=d2;b1=o}}else if(d2<d0){d0=d2;b0=o}}}
 if(!b0&&!b1){RW=0;RD=1e9;return false}
 let l0=1e9,l1=1e9,c0=0,c1=0,r0=0,r1=0;if(b0){gridLat(b0,x,z);l0=gl_l;c0=gl_c;r0=gl_r}if(b1){gridLat(b1,x,z);l1=gl_l;c1=gl_c;r1=gl_r}
 const e0=b0&&l0<=b0.hw+3,e1=b1&&l1<=b1.hw+3;let u1;
 if(e0&&e1){const dyv=Math.abs((b1.y+b1.dy*c1)-(b0.y+b0.dy*c0));u1=dyv<2.5?l1<l0:((RPH||GRTY!==null)?(GRTY!==null?GRTY:HREF)>b1.y+b1.dy*c1-2.5:false)}
 else if(e1)u1=true;else if(e0)u1=false;else u1=!!b1&&(!b0||d1<d0);
 const b=u1?b1:b0,l=u1?l1:l0,cl=u1?c1:c0;GRB=b;
 RS=b.s+cl;RL=u1?r1:r0;RHW=b.hw;RYb=b.y+b.dy*cl;if(!(RYb===RYb))RYb=gridY(x,z)+.13;RD=l<=b.hw?l*(11.5/b.hw):11.5+l-b.hw;return true}
// ---- Etapa 5: tráfego em todas as rodovias e ramais; cada veículo tem a sua via (rd) ----
function gridPt(r,t){let x,z,h,lf=0;if(r.ax===1){z=t;x=GRID.ns(r.idx,z);h=Math.atan(GRID.dns(r.idx,z))}else{x=t;z=GRID.ew(r.idx,x);h=Math.PI/2-Math.atan(GRID.dew(r.idx,x));lf=liftEW(r.idx,x)}
 return{x,z,h,hw:GRID.hw(r.ax,r.idx),kd:GRID.kind(r.ax,r.idx),lf,y:gridY(x,z)+.13+(r.ax?0:.02)+lf,dy:0}}
const GRRD=new Map();
// rodovia: amostra i = ponto a t=-5i (s cresce para norte/oeste), infinita nos dois sentidos
function hwRd(ax,idx){const k='h'+ax+':'+idx;let r=GRRD.get(k);if(!r){if(GRRD.size>60)GRRD.clear();r={key:k,ax,idx,ramp:false,cache:new Map(),pt(i){let o=this.cache.get(i);if(!o){if(this.cache.size>3000)this.cache.clear();o=gridPt(this,-5*i);o.s=5*i;this.cache.set(i,o)}return o}};GRRD.set(k,r)}return r}
// ramal: amostras uniformes de 5 m (virtuais), s de 0 (lado da N-S) a 5n (lado da L-O)
function rampRd(S){const m=S.meta,k='r'+m.i+','+m.j+','+m.sN+','+m.sE;let r=GRRD.get(k);if(!r){r={key:k,ramp:true,S,m,n:m.n,pt(i){return S[Math.max(0,Math.min(S.length-1,i))]}};GRRD.set(k,r)}return r}
function gridCrossAt(i,j){return gx(i,j)}
// próximo trevo à frente (saída à direita) para o veículo v na rodovia rd; devolve {k,take,tp,ramp,rev} ou null
function gridPlan(v){const rd=v.rd,G=GRID.G,id=rd.idx;let t=-v.s;const out=[];
 if(rd.ax===1){const nb=v.dir>0,j0=GRID.idxZ(t);let best=null;
  for(let j=j0-2;j<=j0+2;j++){const c=gx(id,j),sN=nb?1:-1,tA=c.z+sN*460;if(nb?tA<t-1:tA>t+1){if(!best||(nb?c.z>best.c.z:c.z<best.c.z))best={c,j,sN,tA}}}
  if(!best)return null;const sE=nb?1:-1;return{key:'n'+id+':'+best.j,tp:best.tA,ramp:gridRamp(best.c,best.sN,sE),c:best.c}}
 else{const eb=v.dir<0,i0=GRID.idxX(t);let best=null;
  for(let i=i0-2;i<=i0+2;i++){const c=gx(i,id),sE=eb?-1:1,tB=c.x+sE*UB;if(eb?tB>t+1:tB<t-1){if(!best||(eb?c.x<best.c.x:c.x>best.c.x))best={c,i,sE,tB}}}
  if(!best)return null;const sN=eb?1:-1;return{key:'e'+id+':'+best.i,tp:best.tB,ramp:gridRamp(best.c,sN,eb?-1:1),c:best.c}}}
function gridTake(v,key){let h=0;const q=key+'|'+(v.hid||0);for(let k=0;k<q.length;k++)h=Math.imul(h^q.charCodeAt(k),16777619);return((h>>>0)%1000)/1000<.32}
function gridJoin(v,rd,s,dir){const ox=v.x,oz=v.z;GRCX=rd;v.rd=rd;v.s=s;v.dir=dir;v.plan=null;v.exiting=false;if(!rd.ramp&&v.car){v.lane=1;v.hold=150;v.ot=0}else v.lane=0;roadPt(v.s,trfLat(samp(Math.round(s/RDS)),dir,!v.car));v.jx=ox-RPx;v.jz=oz-RPz;v.lat=trfLat(samp(Math.round(s/RDS)),dir,!v.car)}
function gridTrfStep(v,dt){const rd=v.rd;
 if(rd.ramp){const m=rd.m,L=rd.n*5;
  if(m.fwd&&v.dir>0&&v.s>=L-2)gridJoin(v,hwRd(0,m.j),-m.tB,m.sE>0?-1:1);        // desemboca na L-O, afastando-se do trevo
  else if(!m.fwd&&v.dir<0&&v.s<=2)gridJoin(v,hwRd(1,m.i),-m.tA,m.sN>0?-1:1);      // desemboca na N-S
  return}
 if(v.hold>0)v.hold-=v.sp*dt;  // saiu de um ramal: carro segue 150 m na pista da direita antes de ir para a esquerda
 if(!v.plan||v.plan.done){v.plan=gridPlan(v);if(v.plan){v.plan.take=gridTake(v,v.plan.key);if(v.car&&Math.abs(-v.s-v.plan.tp)<200)v.plan.take=false}}  // sem tempo de ir para a direita: não sai
 const pl=v.plan;v.exiting=!!(pl&&pl.take&&Math.abs(-v.s-pl.tp)<400);  // vai sair: pista da direita desde 400 m antes (>= 150 m)
 if(!pl||!pl.take)return;const t=-v.s,m=pl.ramp.meta,passed=rd.ax===1?(v.dir>0?t<=pl.tp:t>=pl.tp):(v.dir<0?t>=pl.tp:t<=pl.tp);
 if(passed&&Math.abs(t-pl.tp)<40){const R=rampRd(pl.ramp);gridJoin(v,R,m.fwd?0:m.n*5,m.fwd?1:-1)}
 else if(passed)pl.done=true}
function trfSpawnG(){const rs=GRID.near(pos.x,pos.z,1100);if(!rs.length)return;const r=rs[Math.floor(Math.random()*rs.length)],rd=hwRd(r.ax,r.idx),tp=r.ax===1?pos.z:pos.x,off=(300+Math.random()*350)*(Math.random()<.5?-1:1),s=-(Math.round((tp+off)/5)*5),dir=Math.random()<.5?1:-1;
 GRCX=rd;const o=samp(Math.round(s/RDS));if(Math.hypot(o.x-pos.x,o.z-pos.z)<240){GRCX=null;return}
 for(const q of TRF)if(Math.hypot(q.x-o.x,q.z-o.z)<70){GRCX=null;return}
 const lat=trfLat(o,dir),pk=trfPick();if(!pk){GRCX=null;return}const isCar=pk==='car',m=isCar?trfBuildCar():trfBuild();scene.add(m.g);
 const co=isCar?[1.5,0,-1.5]:[4,.5,-4,-8.5,-13],v={s,dir,rd,hid:Math.floor(Math.random()*1e6),x:o.x,z:o.z,lat:trfLat(o,dir,!isCar),lane:0,lt:Math.random(),ot:0,ld:1e9,lv:0,sp:isCar?18+Math.random()*8:14+Math.random()*7,g:m.g,t:m.t,sps:m.sps,disp:m.disp,car:isCar?1:0,co,fr:isCar?2.9:5.5,cols:co.map(()=>({x:1e5,z:1e5,r:isCar?1.45:2.3,k:1}))};TRF.push(v);ocx=1e9;GRCX=null}
function gridEnsure(){}
function gridTraffic(){}
// minimapa (GPS): rumo para cima, rodovias próximas, trevos, rodovia atual em destaque, N indica o norte
var gmT=0,gmR=1500,gmOn=true;try{gmOn=localStorage.getItem('fh16gps')!=='0'}catch(e){}
(function(){const h=document.getElementById('gpsh'),cv=document.getElementById('gmap');if(!h||!cv)return;
 h.addEventListener('click',e=>{e.stopPropagation();gmOn=!gmOn;try{localStorage.setItem('fh16gps',gmOn?'1':'0')}catch(e){}gmT=0});
 cv.addEventListener('click',e=>{e.stopPropagation();{const Z=[700,1500,3000,6000,12000];gmR=Z[(Z.indexOf(gmR)+1)%Z.length]}gmT=0})})();

// ---- rota até o destino: pela rodovia atual até um trevo, e dali pela rodovia da empresa (com rodovia de ligação se forem paralelas) ----
var gmRd=null,gmRt=null,gmRtT=0;
function gridRPts(ax,idx,t0,t1,step){const o=[],n=Math.max(1,Math.ceil(Math.abs(t1-t0)/step));for(let i=0;i<=n;i++){const p=gridPt({ax,idx},t0+(t1-t0)*i/n);o.push([p.x,p.z])}return o}
function gridRoute(c){const cur=gmRd,td=c.ax?c.z:c.x;
 if(!cur)return{pts:[[pos.x,pos.z],[c.x,c.z]],dist:Math.hypot(c.x-pos.x,c.z-pos.z),cx:null};
 const tp=cur.ax?pos.z:pos.x;let roads=[cur],crs=[];
 if(cur.ax===c.ax&&cur.idx===c.idx){}
 else if(cur.ax!==c.ax){roads.push({ax:c.ax,idx:c.idx});crs.push(cur.ax?gx(cur.idx,c.idx):gx(c.idx,cur.idx))}
 else{const mid=(tp+td)/2;
  if(cur.ax===0){let i=GRID.idxX(mid);if(Math.abs(GRID.XL(i+1)-mid)<Math.abs(GRID.XL(i)-mid))i++;roads.push({ax:1,idx:i},{ax:0,idx:c.idx});crs.push(gx(i,cur.idx),gx(i,c.idx))}
  else{let j=GRID.idxZ(mid);if(Math.abs(GRID.ZL(j+1)-mid)<Math.abs(GRID.ZL(j)-mid))j++;roads.push({ax:0,idx:j},{ax:1,idx:c.idx});crs.push(gx(cur.idx,j),gx(c.idx,j))}}
 // sequência: trecho de rodovia até o ramal, ramal (com o sentido de saída pela direita) e continua na rodovia seguinte
 let pts=[],t=tp,from=roads[0],first=null;
 for(let k=0;k<crs.length;k++){const cr=crs[k],fa=from.ax,sg=Math.sign(t-(fa?cr.z:cr.x))||1;let sN,sE,S;
  if(fa===1){sN=sg;sE=sg;S=gridRamp(cr,sN,sE)}else{sE=sg;sN=-sg;S=gridRamp(cr,sN,sE).slice().reverse()}
  const entry=fa?cr.z+sN*460:cr.x+sE*UB,exit=fa?cr.x+sE*UB:cr.z+sN*460;
  pts=pts.concat(gridRPts(fa,from.idx,t,entry,300));
  if(!first)first={x:S[0].x,z:S[0].z,dir:fa?(sE>0?'Leste':'Oeste'):(sN>0?'Sul':'Norte')};
  for(const o of S)pts.push([o.x,o.z]);t=exit;from=roads[k+1]}
 pts=pts.concat(gridRPts(from.ax,from.idx,t,td,300));
 let dist=0;for(let i=1;i<pts.length;i++)dist+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
 let tx=null;if(first){tx={km:Math.hypot(first.x-pos.x,first.z-pos.z),dir:first.dir,ahead:((first.x-pos.x)*-Math.sin(hd)+(first.z-pos.z)*-Math.cos(hd))>0}}
 return{pts,dist,cx:tx}}
var gmB=-1,gmReg=null;
function gridMap(dt){gmT-=dt;if(gmT>0)return;gmT=.2;{if(GRB&&(GRB.ax===0||GRB.ax===1))gmRd={ax:GRB.ax,idx:GRB.id};const rg=gridReg(pos.x,pos.z),sp=document.querySelector('#gpsh span');if(sp){const tx='🧭 GPS · '+rg.name;if(sp.textContent!==tx)sp.textContent=tx}gmRt=job?gridRoute(job.phase==='pickup'?job.from:job.to):null}
 {const m=document.getElementById('mis');if(m){const b=Math.round(m.getBoundingClientRect().bottom);if(b!==gmB){gmB=b;document.documentElement.style.setProperty('--mb',b+'px')}}}const cv=document.getElementById('gmap'),hd0=document.getElementById('gpsh');if(!cv||!hd0)return;
 hd0.style.display='';const gh=document.getElementById('gmh');cv.style.display=gmOn?'block':'none';gh.style.display=gmOn?'block':'none';document.getElementById('gpsc').textContent=gmOn?'▾':'▸';if(!gmOn)return;
 const g=cv.getContext('2d'),W=cv.width,H=cv.height,CX=W/2,CY=H*.72,SC=(W/2)/(gmR*1.15),QR=gmR*1.7,ch=Math.cos(hd),sh=Math.sin(hd);
 const T=(x,z)=>{const dx=x-pos.x,dz=z-pos.z;return[CX+(dx*ch-dz*sh)*SC,CY+(dx*sh+dz*ch)*SC]};
 g.clearRect(0,0,W,H);g.save();g.beginPath();if(g.roundRect)g.roundRect(1,1,W-2,H-2,16);else g.rect(1,1,W-2,H-2);g.clip();g.fillStyle='rgba(18,26,34,.82)';g.fillRect(0,0,W,H);
 g.lineCap='round';g.lineJoin='round';const step=gmR>8000?500:gmR>4000?300:gmR>2000?150:60;
 for(const r of GRID.near(pos.x,pos.z,QR)){const cur=GRB&&GRB.ax===r.ax&&GRB.id===r.idx;g.beginPath();const t0=Math.round((r.t-QR)/step)*step;let first=true;
  for(let t=t0;t<=r.t+QR;t+=step){const x=r.ax===1?GRID.ns(r.idx,t):t,z=r.ax===1?t:GRID.ew(r.idx,t),p=T(x,z);if(first){g.moveTo(p[0],p[1]);first=false}else g.lineTo(p[0],p[1])}
  g.strokeStyle=cur?'#ffb400':(r.kind?'#7d8b99':'#c4d0dc');g.lineWidth=(cur?4.5:3.2)*(r.kind?.7:1);g.stroke()}
 // ramais dos trevos (só nos zooms próximos)
 g.lineWidth=2.4;if(gmR<=3500)for(const c of GRID.crossNear(pos.x,pos.z,QR))for(const sN of[-1,1])for(const sE of[-1,1]){const S=gridRamp(c,sN,sE);g.beginPath();for(let q=0;q<S.length;q+=3){const p=T(S[q].x,S[q].z);if(q)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])}
  const e=T(S[S.length-1].x,S[S.length-1].z);g.lineTo(e[0],e[1]);const onR=GRB&&S.indexOf(GRB)>=0;g.strokeStyle=onR?'#ffb400':'#9fb0c0';g.stroke()}
 // rota até o destino
 if(gmRt&&gmRt.pts.length>1){g.beginPath();gmRt.pts.forEach((q,i)=>{const p=T(q[0],q[1]);if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1])});g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=8;g.stroke();g.strokeStyle=job&&job.phase==='deliver'?'#2f9bff':'#ffb400';g.lineWidth=4.5;g.stroke()}
 // empresas e destino do frete
 for(const c of COACT){const p=T(c.x,c.z);g.fillStyle=job&&(c===job.from||c===job.to)?'#ffb400':'#7ee08a';g.fillRect(p[0]-4,p[1]-4,8,8)}
 if(job){const c=job.phase==='pickup'?job.from:job.to;let p=T(c.x,c.z);const ux=p[0]-CX,uy=p[1]-CY,kx=ux?(ux>0?W-14-CX:14-CX)/ux:1e9,ky=uy?(uy>0?H-14-CY:14-CY)/uy:1e9,k=Math.min(1,kx,ky);p=[CX+ux*k,CY+uy*k];g.fillStyle='#ffb400';g.beginPath();g.arc(p[0],p[1],7,0,6.2832);g.fill();g.strokeStyle='#000';g.lineWidth=2;g.stroke()}
 g.restore();
 g.fillStyle='#ff5a3c';g.beginPath();g.moveTo(CX,CY-13);g.lineTo(CX+9,CY+10);g.lineTo(CX,CY+5);g.lineTo(CX-9,CY+10);g.closePath();g.fill();g.strokeStyle='#000';g.lineWidth=1.5;g.stroke();
 {const bx=W-26,by=26;g.fillStyle='rgba(18,26,34,.8)';g.beginPath();g.arc(bx,by,18,0,6.2832);g.fill();const nx=bx+(sh)*12,ny=by-ch*12;g.fillStyle='#ffb400';g.font='700 16px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('N',nx,ny)}
 const dg=((-hd*57.2958)%360+360)%360,pts=['N','NE','L','SE','S','SO','O','NO'];const rt=gmRt&&job?('<b style="color:#ffb400">Destino '+(gmRt.dist/1000).toFixed(1).replace('.',',')+' km</b>'+(gmRt.cx?' · '+(gmRt.cx.ahead?'trevo em '+(gmRt.cx.km/1000).toFixed(1).replace('.',',')+' km → '+gmRt.cx.dir:'trevo atrás · retorne no próximo'):'')+'<br>'):'';
 gh.innerHTML=rt+'Rumo '+String(Math.round(dg)%360).padStart(3,'0')+'° '+pts[Math.round(dg/45)%8]+' · toque no mapa: zoom'}
function gridFrame(){if(gbv<0||Math.hypot(pos.x-gbx,pos.z-gbz)>40){gbx=pos.x;gbz=pos.z;gridBuild(pos.x,pos.z)}
 RPH=1;if(roadInfo(pos.x,pos.z)){onRoad=RD<10.4;curS=0}else onRoad=false;gridCoFrame();gridKm();gridMap(1/60)}
// marco quilométrico: KM 0 no trevo de origem (cruzamento N-S 0 × L-O -1); cada rodovia zera onde cruza esse trevo/linha de trevos, contagem infinita; sentido pela direção do caminhão
function gridKm(){if(!GRB)return;const r=document.getElementById('kmrow');if(r&&r.style.display==='none')r.style.display='';
 const b=GRB,fx=-Math.sin(hd),fz=-Math.cos(hd);let nm,km,dr;
 if(b.ax===1){nm='N-S '+b.id;km=Math.abs(pos.z-gx(b.id,-1).z)/1000;dr=fz<0?'N':'S'}else if(b.ax===0){nm='L-O '+b.id;km=Math.abs(pos.x-gx(0,b.id).x)/1000;dr=fx>0?'L':'O'}else{hset('kmr','Ramal');hset('kmv','');return}
 const k=Math.floor(km*10)/10,s=(k<10?'0':'')+k.toFixed(1).replace('.',',');hset('kmr','Rod. '+nm);hset('kmv','KM '+s+' - '+dr)}
// botão de teste na tela inicial: liga/desliga a grade (recarrega a página)
(function(){const h=document.getElementById('home');if(!h)return;const b=document.createElement('button');b.type='button';
 b.style.cssText='position:absolute;left:12px;bottom:12px;z-index:50;height:36px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(11,17,24,.7);color:#f2f5f8;font:600 12px system-ui,sans-serif;cursor:pointer';
 const on=!!window.GRID_ON;b.textContent='🧪 Rodovias em grade: '+(on?'LIGADA':'desligada')+' (toque para '+(on?'desligar':'ligar')+')';
 b.onclick=()=>{try{localStorage.setItem('fh16grid',on?'0':'1')}catch(e){}location.reload()};h.appendChild(b)})();

// ===== empresas na grade: 1 a 6 por trecho entre dois trevos (sorteio fixo), regiões de 3x3 linhas =====
const gridSegKey=(ax,idx,m)=>(ax*4000+idx+2000)*4000+m+2000,gridCoKey=(ax,idx,m,u)=>gridSegKey(ax,idx,m)*8+u;
const gridSegA=(ax,m)=>ax?GRID.ZL(m):GRID.XL(m),gridSegUse=(ax,m)=>gridSegA(ax,m+1)-gridSegA(ax,m)-3000;
const gridSegN=(ax,idx,m)=>1+Math.floor(hh(gridSegKey(ax,idx,m),41,7)*Math.min(6,gridSegUse(ax,m)/1500));
const gridReg=(x,z)=>{const rx=Math.floor(GRID.idxX(x)/3),rz=Math.floor(GRID.idxZ(z)/3);return gridRegAt(rx,rz)};
const GRRG=new Map();
function gridRegAt(rx,rz){const k=rx+','+rz;let r=GRRG.get(k);if(!r){if(GRRG.size>300)GRRG.clear();r={rx,rz,key:k,name:CITY[Math.floor(hh(rx,rz,9)*CITY.length)%CITY.length],hue:Math.floor(hh(rx,rz,10)*360)};GRRG.set(k,r)}return r}
// chave de empresa válida na numeração atual (descarta chaves de versões antigas)
function gridKeyOk(k){if(!(k>=0)||k!==Math.floor(k))return false;const u=k%8,bs=Math.floor(k/8),m=bs%4000-2000,r=Math.floor(bs/4000),idx=r%4000-2000,ax=Math.floor(r/4000);return ax<2&&Math.abs(idx)<300&&Math.abs(m)<300&&u<gridSegN(ax,idx,m)}
function gridCoBase(k){const u=k%8,bs=Math.floor(k/8),m=bs%4000-2000,r=Math.floor(bs/4000),idx=r%4000-2000,ax=Math.floor(r/4000),n=gridSegN(ax,idx,m);
 const side=hh(k,2,7)<.5?-1:1,t=CT[Math.floor(hh(k,3,7)*CT.length)],us=gridSegUse(ax,m),tc=gridSegA(ax,m)+1500+(u+.5+(hh(k,8,7)-.5)*.5)*(us/n),p=gridPt({ax,idx},tc),
  cs=Math.cos(p.h),sn=Math.sin(p.h),off=side*(34.5+p.hw),x=p.x+cs*off,z=p.z-sn*off;
 return{k,s:0,side,t,name:t.n[Math.floor(hh(k,4,7)*t.n.length)],x,z,h:p.h,y:p.y,rot:p.h+(side<0?Math.PI:0),ann:false,cols:[],bays:[],ax,idx,m,u,reg:gridReg(x,z),city:gridReg(x,z).name}}
// empresas a até R metros (varre as rodovias próximas)
function gridCoNear(R){const out=[];
 for(const r of GRID.near(pos.x,pos.z,R+60)){const t=r.t,m0=r.ax?GRID.idxZ(t-R-200):GRID.idxX(t-R-200),m1=r.ax?GRID.idxZ(t+R+200):GRID.idxX(t+R+200);
  for(let m=m0;m<=m1;m++){const n=gridSegN(r.ax,r.idx,m);for(let u=0;u<n;u++){const c=coGet(gridCoKey(r.ax,r.idx,m,u));if(Math.hypot(c.x-pos.x,c.z-pos.z)<R)out.push(c)}}}
 return out}
let gnT=0,gnC=null,gnX=0,gnZ=0;
function gridNearCo(){const now=performance.now();if(gnC&&now-gnT<600&&Math.hypot(pos.x-gnX,pos.z-gnZ)<60)return gnC;let b=null,bd=1e18;for(const c of gridCoNear(6000)){const d=Math.hypot(c.x-pos.x,c.z-pos.z);if(d<bd){bd=d;b=c}}gnT=now;gnC=b;gnX=pos.x;gnZ=pos.z;return b}
// ---- fretes: local (mesma rodovia), regional (mesma região), entre regiões ----
const GR_TAG=['Local','Regional','Entre regiões'];
function gridCoPick(ax,idx,m,uh){const n=gridSegN(ax,idx,m);return coGet(gridCoKey(ax,idx,m,Math.floor(uh*n)%n))}
function gridDest(c,kind,n,i){const h=a=>hh(c.k,n*8+i,60+a);
 if(kind===0){const m=c.m+(h(1)<.5?-1:1);return gridCoPick(c.ax,c.idx,m,h(2))}
 const R=c.reg,D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]],dd=kind===2?D[Math.floor(h(6)*8)%8]:[0,0],rx=R.rx+dd[0],rz=R.rz+dd[1],ax=h(3)<.5?0:1;
 let best=null,bd=1e18;const K=kind===2?10:4;
 for(let q=0;q<K;q++){const ax2=h(3+q*7)<.5?0:1,idx=3*(ax2?rx:rz)+Math.floor(h(4+q*7)*3),m=3*(ax2?rz:rx)+Math.floor(h(5+q*7)*3),d=gridCoPick(ax2,idx,m,h(7+q*7));
  if(d.k===c.k)continue;const dist=Math.hypot(d.x-c.x,d.z-c.z);if(dist<bd){bd=dist;best=d}}
 return best||gridCoPick(c.ax,c.idx,c.m+1,h(2))}
function gridOffers(c){const n=c.nonce||0,st=Math.floor(hh(c.k,n,21)*3),list=[],cl=CARGOS[c.t.id];
 for(let i=0;i<3;i++){const kind=(i+st)%3;let to=null;for(let q=0;q<5;q++){to=gridDest(c,kind,n+q*13,i);if(!list.some(o=>o.to===to))break}const name=cl[Math.floor(hh(c.k,n*4+i,22)*cl.length)],tons=[6,12,18][Math.floor(hh(c.k,n*4+i,23)*3)],dm=Math.hypot(to.x-c.x,to.z-c.z)*1.15,km=dm/1000,
  far=to.reg.key!==c.reg.key;
  list.push({from:c,to,name,tons,dist:dm,reward:Math.round((600+km*(300+tons*45))*(far?1.3:1)/10)*10,limit:dm/15+90,slot:i,col:slotCol(c,i),toBay:(i+1)%3,tag:far?GR_TAG[2]:kind===0?GR_TAG[0]:GR_TAG[1]})}
 return list}
// versão da grade de coFrame: no máximo 1 empresa construída por quadro, a mais próxima primeiro
function gridCoFrame(){if(!ready)return;
 const want=gridCoNear(900);let changed=false;
 for(const c of COACT){const gp=COG.get(c.k);if(gp&&gp.userData.decor){const v=Math.hypot(c.x-pos.x,c.z-pos.z)<430;for(const t of gp.userData.decor)if(t.visible!==v)t.visible=v}}
 for(const[k,gp]of COG)if(!want.some(c=>c.k===k)){scene.remove(gp);disposeCo(gp);COG.delete(k);changed=true}
 let best=null,bd=1e9;for(const c of want)if(!COG.has(c.k)){const d=Math.hypot(c.x-pos.x,c.z-pos.z);if(d<bd){bd=d;best=c}}
 if(coPend){coPend=false;for(const gp of COG.values())gp.visible=true;changed=true}
 else if(best){const gp=buildCo(best);gp.visible=false;COG.set(best.k,gp);coPend=true}
 if(changed){const prev=new Set(COACT);COACT.length=0;for(const c of want)if(COG.has(c.k))COACT.push(c);rbI=1e9;ocx=1e9;for(const c of COACT)if(!prev.has(c))terrMark(c.x,c.z,70);tcx=1e9;placeCones()}
 {const rg=gridReg(pos.x,pos.z);if(gmReg&&gmReg.key!==rg.key)msg('📍 '+rg.name);gmReg=rg}
 for(const c of COACT)if(!GRVIS.has(c.k)&&Math.hypot(c.x-pos.x,c.z-pos.z)<130)GRVIS.add(c.k);
 for(const c of COACT)if(!c.ann&&Math.hypot(c.x-pos.x,c.z-pos.z)<300){c.ann=true;msg(c.name+' · '+c.t.label)}
 if(++coTick%180==0&&COM.size>60)for(const[k,c]of COM)if(Math.hypot(c.x-pos.x,c.z-pos.z)>4500&&!COG.has(k)&&!coKeep(c))COM.delete(k)}

// botão ⓘ sobre o mapa: expande/recolhe as informações do GPS (rota, KM, frete, tempo e dinheiro)
(function(){const m=document.getElementById('mis');if(!m||document.getElementById('gpsx'))return;const b=document.createElement('button');b.type='button';b.id='gpsx';b.textContent='ⓘ';b.setAttribute('aria-label','Informações do GPS');
 const ov=document.createElement('div');ov.id='gpsinfo';['gmh','kmrow','jn','mk','mx'].forEach(i=>{let e=document.getElementById(i);if(e&&i==='mk')e=e.closest('.mrow')||e;if(e)ov.appendChild(e)});m.appendChild(ov);
 let on=false;try{on=localStorage.getItem('fh16gpsx')==='1'}catch(e){}const ap=()=>{document.body.classList.toggle('gpsx',on);b.textContent=on?'🗺':'ⓘ';gmT=0;gmB=-1};ap();
 const tg=e=>{e.stopPropagation();e.preventDefault();on=!on;try{localStorage.setItem('fh16gpsx',on?'1':'0')}catch(x){}ap()};
 b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',tg);m.insertBefore(b,m.firstChild)})();
if(window.__rgPending){window.__rgPending=false;try{restoreG()}catch(e){console.log(e)}}
if(window.GRID_ON)try{if(!(typeof SAVED!=='undefined'&&SAVED&&typeof SAVED.x==='number'&&isFinite(SAVED.x+SAVED.z)))gridStart();gridBuild(pos.x,pos.z)}catch(e){console.log(e)}
