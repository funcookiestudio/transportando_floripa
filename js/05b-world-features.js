// ---- rios, pontes e viadutos: recursos fixos por seed (função pura de s), ativados só perto do jogador ----
const RVM=new Map(),OVM=new Map(),RV_D=5200,OV_D=3300,WATER=new THREE.MeshStandardMaterial({color:0x2f6f8f,roughness:.15,metalness:.15,transparent:true,opacity:.88});
function coS(k){return k===0?0:k*CO_D+(hh(k,1,7)-.5)*500}
function nearCo(s,m){const k=Math.round(s/CO_D);for(let q=k-1;q<=k+1;q++)if(Math.abs(coS(q)-s)<m)return true;return false}
const inCity=(s,m)=>{const ci=Math.round(s/9000);return ci!==0&&Math.abs(s-ci*9000)<m};
function riverGet(j){if(RVM.has(j))return RVM.get(j);let r=null;const s=j*RV_D+(hh(j,2,41)-.5)*1600;
 if(hh(j,1,41)<.62&&Math.abs(s)>1500&&!nearCo(s,380)&&!inCity(s,1000)){const wv=70+hh(j,3,41)*60;r={j,s,wv,D:7+hh(j,4,41)*6,wr:12+hh(j,5,41)*10,sb:wv*.7+8,g:null,pend:false}}
 RVM.set(j,r);return r}
function ovGet(i){if(OVM.has(i))return OVM.get(i);let o=null;const s=i*OV_D+1650+(hh(i,2,43)-.5)*900;
 if(hh(i,1,43)<.9&&Math.abs(s)>1400&&!nearCo(s,420)&&!inCity(s,1000)){let ok=true;for(let q=Math.floor(s/RV_D)-1;q<=Math.floor(s/RV_D)+1;q++){const r=riverGet(q);if(r&&Math.abs(r.s-s)<r.sb+170)ok=false}
  for(let d=-150;d<=150;d+=30)if(kindAt(s+d)!==0)ok=false;for(let q=Math.floor(s/IC_D)-1;q<=Math.floor(s/IC_D)+1;q++){const c=icGet(q);if(c&&Math.abs(c.s-s)<600)ok=false}if(ok)o={i,s,g:null,pend:false,cols:[]}}
 OVM.set(i,o);return o}
function featGeo(f){ensureRoad(f.s-250,f.s+250);const o=samp(Math.round(f.s/RDS));roadPt(f.s,0);f.x0=RPx;f.z0=RPz;f.tx=-Math.sin(o.h);f.tz=-Math.cos(o.h);f.nx=Math.cos(o.h);f.nz=-Math.sin(o.h);f.h=o.h;f.hw=o.hw;f.y0=yR(f.s);if(f.D)f.floor=f.y0-f.D}
const sm=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
// relevo natural -> relevo com vales de rio
function riverH(x,z,h){for(let q=0;q<RIVA.length;q++){const r=RIVA[q],dx=x-r.x0,dz=z-r.z0,a=Math.abs(dx*r.tx+dz*r.tz);if(a>=r.wv)continue;const an=Math.abs(dx*r.nx+dz*r.nz);if(an>=600)continue;
  const b=(a<=r.wr?1:sm((r.wv-a)/(r.wv-r.wr)))*(an<350?1:sm((600-an)/250)),t=r.floor<h?h+(r.floor-h)*b:h;if(t<h)h=t}return h}
// peso de ponte (1 = sobre o vão, 0 = fora) para a posição s da estrada
function bridgeW(s){let w=0;for(let q=0;q<RIVA.length;q++){const r=RIVA[q],d=Math.abs(s-r.s);if(d<=r.sb)return 1;if(d<r.sb+25)w=Math.max(w,1-sm((d-r.sb)/25))}return w}
// 0..1: margem de areia ao redor do rio (cor do terreno)
function riverBank(x,z){let w=0;for(let q=0;q<RIVA.length;q++){const r=RIVA[q],dx=x-r.x0,dz=z-r.z0,a=Math.abs(dx*r.tx+dz*r.tz);if(a>r.wr+9)continue;const an=Math.abs(dx*r.nx+dz*r.nz);if(an>600)continue;w=Math.max(w,(a<r.wr+3?1:1-sm((a-r.wr-3)/6))*(an<350?1:sm((600-an)/250)))}return w}
// área onde não nascem árvores/pedras/arbustos (vale do rio, pegada do viaduto)
function featBlock(x,z){if(ICA.length&&icBlock(x,z,9))return true;for(const r of RIVA){const dx=x-r.x0,dz=z-r.z0;if(Math.abs(dx*r.tx+dz*r.tz)<r.wv+10&&Math.abs(dx*r.nx+dz*r.nz)<600)return true}
 for(const o of OVA){const dx=x-o.x0,dz=z-o.z0;if(Math.abs(dx*o.tx+dz*o.tz)<16&&Math.abs(dx*o.nx+dz*o.nz)<80)return true}return false}
function buildBridge(r){const g=new THREE.Group(),disp=[];g.userData.batch=[];g.userData.disp=disp;const CON=mat(0x9d9d98),CD=mat(0x7b7c78);
 for(let s=Math.ceil((r.s-r.sb)/RDS)*RDS;s<=r.s+r.sb;s+=RDS){const i=Math.round(s/RDS),o=samp(i),hw=o.hw,yd=yR(o.s)+.1,cs=Math.cos(o.h),sn=Math.sin(o.h);
  put(g,BXG,CON,o.x,yd-.55,o.z,2*hw+1.1,1.1,RDS+.2,0,o.h,0);put(g,BXG,CD,o.x,yd-1.3,o.z,2*hw*.8,.5,RDS+.2,0,o.h,0);
  for(const sd of[-1,1])put(g,BXG,CON,o.x+cs*sd*(hw+.2),yd+.45,o.z-sn*sd*(hw+.2),.45,1,RDS+.2,0,o.h,0);
  if(i%4==0){put(g,BXG,CD,o.x,yd-1.75,o.z,2*hw*.9,.55,1.7,0,o.h,0);for(const sd of[-1,1]){const px=o.x+cs*sd*hw*.55,pz=o.z-sn*sd*hw*.55,gy=Hx(px,pz,0),hh2=yd-2-gy;if(hh2>.4)put(g,CYG,CD,px,gy+hh2/2,pz,1.05,hh2,1.05)}}}
 flushBatch(g,disp);const wm=new THREE.Mesh(new THREE.PlaneGeometry(2*(r.wr+14),1300).rotateX(-Math.PI/2),WATER);wm.position.set(r.x0,r.floor+.85,r.z0);wm.rotation.y=Math.atan2(r.nx,r.nz);wm.receiveShadow=true;g.add(wm);disp.push(wm.geometry);scene.add(g);return g}
function buildOverpass(o){const g=new THREE.Group(),disp=[];g.userData.batch=[];g.userData.disp=disp;const CON=mat(0x9d9d98),CD=mat(0x7b7c78),AS=mat(0x3a3c40),hw=o.hw,top=o.y0+7.4,L=70,W=9;o.cols.length=0;
 for(let u=-L;u<=L;u+=2.5){const x=o.x0+o.nx*u,z=o.z0+o.nz*u,gy=Hx(x,z,0),au=Math.abs(u),t=sm((au-(hw+9))/(L-hw-9)),y=top*(1-t)+(gy+.5)*t;
  put(g,BXG,AS,x,y-.4,z,2.6,.8,W,0,o.h,0);for(const sd of[-1,1])put(g,BXG,CON,x+o.tx*sd*(W/2),y+.45,z+o.tz*sd*(W/2),2.6,.9,.35,0,o.h,0);
  if(au>hw+9&&y-.8-gy>.4)put(g,BXG,CD,x,gy+(y-.8-gy)/2,z,2.6,y-.8-gy,W-.6,0,o.h,0)}
 for(const sd of[-1,1]){const u=sd*(hw+3.4),x=o.x0+o.nx*u,z=o.z0+o.nz*u,gy=Hx(x,z,0),ph=top-.9-gy;if(ph>.4){put(g,CYG,CD,x,gy+ph/2,z,1.1,ph,1.1);put(g,BXG,CD,x,top-1.1,z,2.8,.5,W-.5,0,o.h,0)}o.cols.push({x,z,r:1.4,k:1})}
 flushBatch(g,disp);scene.add(g);return g}
function featDispose(f){if(!f.g)return;scene.remove(f.g);for(const d of f.g.userData.disp)d.dispose();f.g=null}
function icFrame(lo,hi,allowBuild){let ch=false;const w=[];for(let i=Math.floor((lo-250)/IC_D)-1;i<=Math.ceil((hi+250)/IC_D)+1;i++){const f=icGet(i);if(f&&f.s>lo-250&&f.s<hi+250)w.push(f)}
 for(let i=ICA.length-1;i>=0;i--)if(!w.includes(ICA[i])){featDispose(ICA[i]);ICA[i].rb=null;ICA.splice(i,1);ch=true}
 for(let i=Math.floor((lo-250)/ST_D)-1;i<=Math.ceil((hi+250)/ST_D)+1;i++){const f=stGet(i);if(f&&f.s>lo-250&&f.s<hi+250)w.push(f)}
 for(const f of w)if(!ICA.includes(f)){featGeo(f);f.rb=f.kind==='st'?stRibbons(f):icRibbons(f);f.pend=true;ICA.push(f);ch=true}
 if(allowBuild)for(const f of ICA)if(f.pend&&!f.g){f.pend=false;f.g=buildIC(f);ocx=1e9;tcx=1e9;rbI=1e9;return true}
 return ch}
// mantém as listas de recursos ativos e constrói no máx. 1 por quadro; devolve true se o conjunto ativo mudou
function featFrame(lo,hi,allowBuild){let ch=false;
 const wr=[];for(let j=Math.floor((lo-300)/RV_D)-1;j<=Math.ceil((hi+300)/RV_D)+1;j++){const r=riverGet(j);if(r&&r.s>lo-300&&r.s<hi+300)wr.push(r)}
 for(let i=RIVA.length-1;i>=0;i--)if(!wr.includes(RIVA[i])){featDispose(RIVA[i]);RIVA.splice(i,1);ch=true}
 for(const r of wr)if(!RIVA.includes(r)){featGeo(r);RIVA.push(r);r.pend=true;ch=true}
 const wo=[];for(let i=Math.floor((lo-200)/OV_D)-1;i<=Math.ceil((hi+200)/OV_D)+1;i++){const o=ovGet(i);if(o&&o.s>lo-200&&o.s<hi+200)wo.push(o)}
 for(let i=OVA.length-1;i>=0;i--)if(!wo.includes(OVA[i])){featDispose(OVA[i]);OVA.splice(i,1)}
 for(const o of wo)if(!OVA.includes(o)){featGeo(o);OVA.push(o);o.pend=true}
 if(icFrame(lo,hi,allowBuild))ch=true;
 if(allowBuild){for(const r of RIVA)if(r.pend&&!r.g){r.pend=false;r.g=buildBridge(r);return ch}
  for(const o of OVA)if(o.pend&&!o.g){o.pend=false;o.g=buildOverpass(o);ocx=1e9;return ch}}
 return ch}
// ---- trevo completo (cloverleaf): rodovia secundária em viaduto + 4 alças de 270° + 4 ramais diagonais ----
const ICM=new Map(),IC_D=6500,IC_R=62,IC_P=300,IC_H=7.4;let HREF=-1e9,ICd=0,ICy=0,ICh=0,ICb=false;
function icGet(i){if(ICM.has(i))return ICM.get(i);let f=null;const s=i*IC_D+2900+(hh(i,2,47)-.5)*1200;
 if(hh(i,1,47)<.85&&Math.abs(s)>2500&&!nearCo(s,600)&&!inCity(s,1400)){let ok=true;
  for(let q=Math.floor(s/RV_D)-1;q<=Math.floor(s/RV_D)+1&&ok;q++){const r=riverGet(q);if(r&&Math.abs(r.s-s)<r.sb+430)ok=false}
  if(ok){ensureRoad(s-450,s+450);for(let d=-400;d<=400;d+=40)if(kindAt(s+d)!==0)ok=false;
   if(ok&&Math.abs(samp(Math.round((s+350)/RDS)).h-samp(Math.round((s-350)/RDS)).h)>.1)ok=false}
  if(ok)f={i,s,g:null,pend:false,cols:[],rb:null}}
 ICM.set(i,f);return f}
function icRibbons(f){const W=(p,q)=>[f.x0+f.tx*p+f.nx*q,f.z0+f.tz*p+f.nz*q],yb=yR(f.s)+.1,hwR=5.2,hwC=7.5,off=f.hw+hwR-1.5,off2=hwC+hwR-1.5,rb=[],sg=Math.PI*1.5;
 const crossY=q=>{const a=Math.abs(q),lift=IC_H*(1-sm((a-85)/115)),m=sm((a-190)/190),w=W(0,q),yg=yb*(1-m)+(Hb(w[0],w[1])+.15)*m;return yg+lift};
 const mk=(hw,fn,n,ki)=>{const p=new Float32Array(n*5);for(let j=0;j<n;j++){const t=j/(n-1),v=fn(t);p[j*5]=v[0];p[j*5+1]=v[1];p[j*5+2]=v[2];p[j*5+3]=v[3]?1:0;p[j*5+4]=v[4]===undefined?1:v[4]}rb.push({hw,p,n,ki:ki||1})};
 // rodovia secundária
 const Lc=520,nc=Math.round(2*Lc/6)+1;mk(hwC,t=>{const q=-Lc+t*2*Lc,w=W(0,q);return[w[0],w[1],crossY(q),Math.abs(q)<f.hw+15]},nc);
 for(const sp of[-1,1])for(const sq of[-1,1]){
  // alça: faixa de saída que se afasta suavemente da rodovia, laço de 270° e faixa de entrada que se funde à borda da pista elevada
  const hwC2=hwC,offA=f.hw+6.2,offC=hwC2+6.2,a0=sq>0?-Math.PI/2:Math.PI/2,dr=sp*sq,C0=[sp*(offC+IC_R),sq*(offA+IC_R)],N1=16,Na=Math.ceil(sg*IC_R/4.5)+1,N3=11,Nt=N1+Na+N3;
  mk(hwR,t=>{const j=Math.round(t*(Nt-1));let p,q,y,wd=1;
   if(j<N1){const u=j/(N1-1);p=sp*(offC+IC_R-70+70*u);wd=sm(Math.min(1,u*1.5));q=sq*(f.hw+hwR*wd+(offA-f.hw-hwR)*sm(u));y=yR(f.s+p)+.1}
   else if(j<N1+Na){const u=(j-N1)/(Na-1),al=a0+dr*sg*u;p=C0[0]+IC_R*Math.cos(al);q=C0[1]+IC_R*Math.sin(al);y=yR(f.s+p)+.1+IC_H*sm(u)}
   else{const u=(j-N1-Na+1)/N3;q=sq*(offA+IC_R-45*u);wd=sm(Math.min(1,(1-u)*1.5));p=sp*(hwC2+hwR*wd+(offC-hwC2-hwR)*sm(1-u));y=yb+IC_H}
   const w=W(p,q);return[w[0],w[1],y,false,wd]},Nt,3);
  // ramal diagonal (Hermite) por fora da alça, afinando nas duas pontas até a borda de cada rodovia
  const M=90,P0=[sp*IC_P,sq*(f.hw+hwR)],P1=[sp*(hwC+hwR),sq*IC_P],T0=[-sp*M,0],T1=[0,sq*M],y0=yR(f.s+sp*IC_P)+.1,y1=crossY(sq*IC_P);
  mk(hwR,t=>{const t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2,wS=sm(t/.15),wE=sm((1-t)/.15);let p=h1*P0[0]+h2*P1[0]+h3*T0[0]+h4*T1[0],q=h1*P0[1]+h2*P1[1]+h3*T0[1]+h4*T1[1];
   q=sq*(Math.abs(q)-hwR*(1-wS));p=sp*(Math.abs(p)-hwR*(1-wE));const w=W(p,q);return[w[0],w[1],y0+(y1-y0)*sm(t),false,wS*wE]},72,3)}
 return rb}
// mais próximo ponto das fitas ativas; devolve true e preenche ICd/ICy/ICh/ICb
function icNear(x,z){let best=1e9,found=false;for(let k=0;k<ICA.length;k++){const f=ICA[k];if(!f.rb)continue;const dx=x-f.x0,dz=z-f.z0;if(dx*dx+dz*dz>560*560)continue;
 for(const r of f.rb){const P=r.p,n=r.n;let bd=1e9,bj=0;for(let j=0;j<n;j++){const a=P[j*5]-x,b=P[j*5+1]-z,d=a*a+b*b;if(d<bd){bd=d;bj=j}}
  const lim=r.hw+60;if(bd>lim*lim)continue;
  for(let j=Math.max(0,bj-1);j<Math.min(n-1,bj+1);j++){const o=j*5,ax=P[o],az=P[o+1],ex=P[o+5]-ax,ez=P[o+6]-az,l2=ex*ex+ez*ez||1;let t=((x-ax)*ex+(z-az)*ez)/l2;t=t<0?0:t>1?1:t;const px=ax+ex*t-x,pz=az+ez*t-z,d=Math.sqrt(px*px+pz*pz),hj=r.hw*(P[o+4]+(P[o+9]-P[o+4])*t),sc=d-hj;
   if(sc<best){best=sc;ICd=d;ICy=P[o+2]+(P[o+7]-P[o+2])*t;ICh=hj;ICb=P[o+3]>0;found=true}}}}
 return found}
function icPull(x,z,r,phys){if(!icNear(x,z))return r;if(ICb&&!(phys&&HREF>ICy-2.5))return r;const bl=10+2.2*Math.abs(ICy-r),e=ICd-ICh-1;if(e>=bl)return r;const w=e<=0?1:sm(1-e/bl);return r+(ICy-r)*w}
function icBlock(x,z,m){return icNear(x,z)&&ICd<ICh+m}
function buildIC(f){const g=new THREE.Group(),disp=[];g.userData.batch=[];g.userData.disp=disp;const CON=mat(0x9d9d98),CD=mat(0x7b7c78),RM=rMat.clone();RM.map=rMat.map;RM.side=THREE.DoubleSide;f.cols.length=0;
 for(const r of f.rb){const n=r.n,P=r.p,pos=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[],uL=r.gore?0:(r.ki*512+1)/2048,uR=r.gore?1:((r.ki+1)*512-1)/2048,vs=r.gore?9:24;let acc=0;
  for(let j=0;j<n;j++){const a=Math.max(0,j-1),b=Math.min(n-1,j+1);let dx=P[b*5]-P[a*5],dz=P[b*5+1]-P[a*5+1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
   if(j)acc+=Math.hypot(P[j*5]-P[j*5-5],P[j*5+1]-P[j*5-4]);const lx=-dz,lz=dx,y=P[j*5+2]+.03;
   const hj=r.hw*P[j*5+4];pos.set([P[j*5]-lx*hj,y,P[j*5+1]-lz*hj,P[j*5]+lx*hj,y,P[j*5+1]+lz*hj],j*6);uv.set([uL,acc/vs,uR,acc/vs],j*4);
   // guarda-corpo em trechos altos; laje em trechos sobre a rodovia
   const gy=Hb(P[j*5],P[j*5+1]),h=P[j*5+2]-gy,th=Math.atan2(dx,dz);
   if(f.kind!=='st'&&j%2==0&&h>1.5&&j<n-1&&P[j*5+4]>.95)for(const sd of[-1,1])put(g,BXG,CON,P[j*5]+lx*sd*(r.hw+.25),P[j*5+2]+.45,P[j*5+1]+lz*sd*(r.hw+.25),.4,.9,5.2,0,th,0);
   if(P[j*5+3]>0){put(g,BXG,CON,P[j*5],P[j*5+2]-.55,P[j*5+1],2*r.hw+1.1,1.1,6.4,0,th,0);put(g,BXG,CD,P[j*5],P[j*5+2]-1.3,P[j*5+1],2*r.hw*.8,.5,6.4,0,th,0)}}
  for(let j=0;j<n-1;j++){const a=j*2,b=j*2+1,c=j*2+2,d=j*2+3;idx.push(a,b,c,b,d,c)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  if(ge.attributes.normal.getY(0)<0){for(let k=0;k<idx.length;k+=3){const t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t}ge.setIndex(idx);ge.computeVertexNormals()}
  const m=new THREE.Mesh(ge,r.gore?goreMat(r.gore):RM);m.receiveShadow=true;m.frustumCulled=false;g.add(m);disp.push(ge)}
 if(f.kind==='st'){stDeco(f,g,disp);flushBatch(g,disp);scene.add(g);return g}
 // pilares ao lado da rodovia principal sob a pista secundária
 for(const sd of[-1,1]){const q=sd*(f.hw+3.4),x=f.x0+f.nx*q,z=f.z0+f.nz*q,top=f.y0+IC_H,ph=top-1-f.y0;put(g,CYG,CD,x,f.y0+ph/2,z,1.1,ph,1.1);put(g,BXG,CD,x,top-1.1,z,2.8,.5,2*7.5,0,f.h,0);f.cols.push({x,z,r:1.4,k:1})}
 flushBatch(g,disp);scene.add(g);return g}
// triângulo de separação (gore): asfalto com hachura amarela diagonal e linhas amarelas contínuas nas bordas
let GOREM={};function goreMat(k){if(GOREM[k])return GOREM[k];const W=128,H=256,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.fillStyle=k==2?'#303237':'#3b3d41';g.fillRect(0,0,W,H);
 for(let i=0;i<1800;i++){const v=25+Math.random()*50|0;g.fillStyle='rgba('+v+','+v+','+(v+4)+','+(.15+Math.random()*.35)+')';g.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1+Math.random()*2)}
 if(k==3){g.clearRect(0,0,W,H);g.fillStyle='#f2f2f2';g.fillRect(0,0,W,H*.34)}
 if(k==1){g.fillStyle='rgba(236,186,0,.95)';g.save();g.beginPath();g.rect(8,0,W-16,H);g.clip();for(let y=-W;y<H+W;y+=44){g.beginPath();g.moveTo(0,y+W);g.lineTo(0,y+W+14);g.lineTo(W,y+14);g.lineTo(W,y);g.closePath();g.fill()}g.restore();
 g.fillRect(2,0,7,H);g.fillRect(W-9,0,7,H)}
 const t=new THREE.CanvasTexture(cv);t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
 GOREM[k]=new THREE.MeshStandardMaterial({map:t,roughness:.85,transparent:k==3,depthWrite:k!=3,polygonOffset:true,polygonOffsetFactor:[0,-6,-3,-8][k],polygonOffsetUnits:[0,-6,-3,-8][k],side:THREE.DoubleSide});return GOREM[k]}
// ---- postos de combustível: acostamento largo + pista de acesso (fitas), cobertura, bombas, loja e totem ----
const STM=new Map(),ST_D=3000,STN=['Posto Estrela','Auto Posto Beira Rio','Posto Rodovia 24h','Posto Pé na Estrada','Posto Bom Caminho','Posto Sol Nascente'],STP=[[0xc7352b,0xf2f2f2],[0x2b7a3b,0xf2c200],[0x1f5fa8,0xf2f2f2],[0x222831,0xf08a1c]];
function stOk(s){if(Math.abs(s)<1200||nearCo(s,420)||inCity(s,900))return false;
 for(let q=Math.floor(s/RV_D)-1;q<=Math.floor(s/RV_D)+1;q++){const r=riverGet(q);if(r&&Math.abs(r.s-s)<r.sb+300)return false}
 for(let q=Math.floor(s/IC_D)-1;q<=Math.floor(s/IC_D)+1;q++){const c=icGet(q);if(c&&Math.abs(c.s-s)<550)return false}
 for(let q=Math.floor(s/OV_D)-1;q<=Math.floor(s/OV_D)+1;q++){const o=ovGet(q);if(o&&Math.abs(o.s-s)<400)return false}
 ensureRoad(s-200,s+200);for(let d=-150;d<=150;d+=30)if(kindAt(s+d)===2)return false;
 return Math.abs(samp(Math.round((s+150)/RDS)).h-samp(Math.round((s-150)/RDS)).h)<.22}
function stGet(i){if(STM.has(i))return STM.get(i);let f=null;const s0=i*ST_D+1500+(hh(i,2,53)-.5)*800;
 if(hh(i,1,53)<.9)for(let k=0;k<13;k++){const s=s0+(k%2?1:-1)*Math.ceil(k/2)*100;if(stOk(s)){f={i,s,kind:'st',sd:hh(i,3,53)<.5?-1:1,name:STN[Math.floor(hh(i,4,53)*STN.length)],pal:STP[Math.floor(hh(i,5,53)*STP.length)],g:null,pend:false,cols:[],rb:null};break}}
 STM.set(i,f);return f}
function stRibbons(f){const W=(p,q)=>{roadPt(f.s+p,q);return[RPx,RPz]},hw=f.hw,kk=RK[samp(Math.round(f.s/RDS)).kd||0],aw=hw*kk.A/kk.hw,rb=[],ya=p=>yR(f.s+p)+.1,herm=(P0,T0,P1,T1,t)=>{const t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2;return[h1*P0[0]+h2*P1[0]+h3*T0[0]+h4*T1[0],h1*P0[1]+h2*P1[1]+h3*T0[1]+h4*T1[1]]};
 f.zones=[];
 const mk=(w,fn,n)=>{const p=new Float32Array(n*5);for(let j=0;j<n;j++){const v=fn(j/(n-1));p[j*5]=v[0];p[j*5+1]=v[1];p[j*5+2]=v[2];p[j*5+3]=0;p[j*5+4]=v[3]}rb.push({hw:w,p,n,ki:3})};
 // um recuo completo em CADA lado da rodovia: quem vem pelo sentido oposto entra no seu próprio posto, sem cruzar a pista
 for(const s2 of[f.sd,-f.sd]){const dp=s2,cq=s2*(hw+19),e0=s2*(hw-4),z=W(0,cq);const zs=W(0,cq-s2*1.5);f.zones.push({x:zs[0],z:zs[1]});
  // pátio (2 faixas) com as pontas afinando
  mk(9,t=>{const p=-50+100*t,w=W(p,cq);return[w[0],w[1],ya(p),1]},21);
  // a borda interna começa EXATAMENTE na borda da rodovia (sem sobrepor as faixas dela); a faixa alarga até a largura do pátio ao chegar nele
  const wf=u=>sm(u/.4)*(1+.73*sm((u-.55)/.45)),KG=hw+19-aw-.846*5.2*1.73,lat=u=>aw+.846*5.2*wf(u)+KG*sm(u),gap=u=>KG*sm(u),u1=(()=>{let u=0;while(gap(u)<13&&u<1)u+=.01;return u})();
  mk(5.2,t=>{const p=-dp*135+dp*85*t,w=W(p,s2*lat(t));return[w[0],w[1],ya(p),wf(t)]},34);
  mk(5.2,t=>{const u=1-t,p=dp*50+dp*85*t,w=W(p,s2*lat(u));return[w[0],w[1],ya(p),wf(u)]},34);
  // triângulos hachurados no ponto onde a pista de acesso se separa da rodovia
  const L=4.6,u0=(()=>{let u=0;while(gap(u)<L&&u<1)u+=.01;return u})();
  const gm=(kind,ua,ub,fn)=>{const n=12;for(const ex of[0,1]){const p=new Float32Array(n*5);for(let j=0;j<n;j++){const t=j/(n-1),u=ua+(ub-ua)*(ex?1-t:t),q=ex?dp*50+dp*85*(1-u):-dp*135+dp*85*u,v=fn(u),w=W(q,s2*v[0]);p[j*5]=w[0];p[j*5+1]=w[1];p[j*5+2]=ya(q);p[j*5+3]=0;p[j*5+4]=v[1]/10}rb.push({hw:5,p,n,ki:3,gore:kind})}};
  // asfalto da pista de acesso (uma pista de largura junto à principal), cunha só depois dela, faixa pontilhada na borda da principal
  gm(2,0,u1,u=>{const g=gap(u),k=sm(u/.1);return[aw-1.4*k+(g+2.4*k)/2,g+2.4*k]});
  gm(1,u0,u1,u=>{const k=sm((u-u0)/.08),g=gap(u)-L+k;return[aw+L-.5*k+(g+k)/2,g+k]});
  gm(3,.03,u1,u=>[aw,.4])}
 return rb}
function stDeco(f,g,disp){const hw=f.hw,W=(p,q)=>{roadPt(f.s+p,q);return[RPx,RPz]},ya=p=>yR(f.s+p)+.1,
 R=mat(f.pal[0]),A=mat(f.pal[1]),WH=mat(0xe9e9e4),DK=mat(0x2a2d33),CO=mat(0x8d9096),GL=mat(0x1a2a36),YL=mat(0xf2c200),LT=new THREE.MeshBasicMaterial({color:0xfff2cc});disp.push(LT);
 const B=(p,q,y,sx,sy,sz,m)=>{const w=W(p,q);put(g,BXG,m,w[0],ya(p)+y,w[1],sx,sy,sz,0,f.h,0)},Cy=(p,q,y,r,h,m)=>{const w=W(p,q);put(g,CYG,m,w[0],ya(p)+y,w[1],r,h,r)},col=(p,q,r)=>{const w=W(p,q);f.cols.push({x:w[0],z:w[1],r,k:1})};
 for(const s2 of[f.sd,-f.sd]){const main=s2===f.sd,dp=s2,cq=s2*(hw+19),qc=cq+s2*4.8;
  // cobertura em balanço sobre as ilhas (a pista dos caminhões fica livre)
  B(0,qc,5.6,8.4,.6,26,WH);B(0,qc,5.15,8.6,.35,26.2,R);B(0,qc,4.95,8,.08,25.6,LT);
  for(const p of[-10,-3.3,3.3,10]){Cy(p,cq+s2*8.6,2.8,.45,5.6,CO);col(p,cq+s2*8.6,.6)}
  // duas ilhas com bombas de frente para a faixa de abastecimento + faixa amarela no chão
  for(const p of[-6,6]){B(p,qc,.15,1.6,.3,6,CO);B(p,qc,1.05,.8,1.5,1.0,R);B(p,qc,1.9,.84,.3,1.04,A);col(p,qc,1.4)}
  B(0,cq+s2*1,.03,.25,.04,22,YL);
  // loja (lado principal) ou quiosque (lado oposto)
  if(main){const qs=cq+s2*22;B(0,qs,2.1,9,4.2,22,WH);B(0,qs,4.4,9.6,.4,22.6,R);B(0,qs-s2*4.55,1.9,.1,1.7,16,GL);B(0,qs-s2*4.55,.05,.12,.1,22,A);for(const p of[-9,-4.5,0,4.5,9])col(p,qs,4.4)}
  else{const qs=cq+s2*18;B(0,qs,1.6,6,3.2,10,WH);B(0,qs,3.3,6.6,.35,10.6,R);col(0,qs,3.2)}
  // totem voltado para quem chega
  const tp=-dp*34,tq=s2*(hw+6),tw=W(tp,tq),ty=ya(tp);Cy(tp,tq,5.6,.22,11.2,CO);col(tp,tq,.6);
  const tex=signTex(f.name,f.pal[0],f.pal[1]),sm2=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});disp.push(tex,sm2);
  const pg=new THREE.PlaneGeometry(6,1.5),m=new THREE.Mesh(pg,sm2);m.position.set(tw[0],ty+11.8,tw[1]);m.rotation.y=f.h;g.add(m);disp.push(pg)}}
