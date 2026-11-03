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
 const mk=(hw,fn,n)=>{const p=new Float32Array(n*4);for(let j=0;j<n;j++){const t=j/(n-1),v=fn(t);p[j*4]=v[0];p[j*4+1]=v[1];p[j*4+2]=v[2];p[j*4+3]=v[3]?1:0}rb.push({hw,p,n})};
 // rodovia secundária
 const Lc=520,nc=Math.round(2*Lc/6)+1;mk(hwC,t=>{const q=-Lc+t*2*Lc,w=W(0,q);return[w[0],w[1],crossY(q),Math.abs(q)<f.hw+15]},nc);
 for(const sp of[-1,1])for(const sq of[-1,1]){
  // alça
  const a0=sq>0?-Math.PI/2:Math.PI/2,dr=sp*sq,nl=Math.ceil(sg*IC_R/4.5)+1;
  mk(hwR,t=>{const al=a0+dr*sg*t,p=sp*IC_R+IC_R*Math.cos(al),q=sq*(IC_R+off)+IC_R*Math.sin(al),w=W(p,q);return[w[0],w[1],yR(f.s+p)+.1+IC_H*sm(t),false]},nl);
  // ramal diagonal (Hermite) por fora da alça
  const M=90,P0=[sp*IC_P,sq*off],P1=[sp*off2,sq*IC_P],T0=[-sp*M,0],T1=[0,sq*M],y0=yR(f.s+sp*IC_P)+.1,y1=crossY(sq*IC_P);
  mk(hwR,t=>{const t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2,p=h1*P0[0]+h2*P1[0]+h3*T0[0]+h4*T1[0],q=h1*P0[1]+h2*P1[1]+h3*T0[1]+h4*T1[1],w=W(p,q);return[w[0],w[1],y0+(y1-y0)*sm(t),false]},72)}
 return rb}
// mais próximo ponto das fitas ativas; devolve true e preenche ICd/ICy/ICh/ICb
function icNear(x,z){let best=1e9,found=false;for(let k=0;k<ICA.length;k++){const f=ICA[k];if(!f.rb)continue;const dx=x-f.x0,dz=z-f.z0;if(dx*dx+dz*dz>560*560)continue;
 for(const r of f.rb){const P=r.p,n=r.n;let bd=1e9,bj=0;for(let j=0;j<n;j++){const a=P[j*4]-x,b=P[j*4+1]-z,d=a*a+b*b;if(d<bd){bd=d;bj=j}}
  const lim=r.hw+60;if(bd>lim*lim)continue;
  for(let j=Math.max(0,bj-1);j<Math.min(n-1,bj+1);j++){const ax=P[j*4],az=P[j*4+1],bx=P[j*4+4],bz=P[j*4+5],ex=bx-ax,ez=bz-az,l2=ex*ex+ez*ez||1;let t=((x-ax)*ex+(z-az)*ez)/l2;t=t<0?0:t>1?1:t;const px=ax+ex*t-x,pz=az+ez*t-z,d=Math.sqrt(px*px+pz*pz);
   if(d<best){best=d;ICd=d;ICy=P[j*4+2]+(P[j*4+6]-P[j*4+2])*t;ICh=r.hw;ICb=P[j*4+3]>0;found=true}}}}
 return found}
function icPull(x,z,r,phys){if(!icNear(x,z))return r;if(ICb&&!(phys&&HREF>ICy-2.5))return r;const bl=10+2.2*Math.abs(ICy-r),e=ICd-ICh-1;if(e>=bl)return r;const w=e<=0?1:sm(1-e/bl);return r+(ICy-r)*w}
function icBlock(x,z,m){return icNear(x,z)&&ICd<ICh+m}
function buildIC(f){const g=new THREE.Group(),disp=[];g.userData.batch=[];g.userData.disp=disp;const CON=mat(0x9d9d98),CD=mat(0x7b7c78),RM=rMat.clone();RM.map=rMat.map;RM.side=THREE.DoubleSide;f.cols.length=0;
 for(const r of f.rb){const n=r.n,P=r.p,pos=new Float32Array(n*6),uv=new Float32Array(n*4),idx=[],uL=(1*512+1)/2048,uR=(2*512-1)/2048;let acc=0;
  for(let j=0;j<n;j++){const a=Math.max(0,j-1),b=Math.min(n-1,j+1);let dx=P[b*4]-P[a*4],dz=P[b*4+1]-P[a*4+1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
   if(j)acc+=Math.hypot(P[j*4]-P[j*4-4],P[j*4+1]-P[j*4-3]);const lx=-dz,lz=dx,y=P[j*4+2]+.03;
   pos.set([P[j*4]-lx*r.hw,y,P[j*4+1]-lz*r.hw,P[j*4]+lx*r.hw,y,P[j*4+1]+lz*r.hw],j*6);uv.set([uL,acc/24,uR,acc/24],j*4);
   // guarda-corpo em trechos altos; laje em trechos sobre a rodovia
   const gy=Hb(P[j*4],P[j*4+1]),h=P[j*4+2]-gy,th=Math.atan2(dx,dz);
   if(j%2==0&&h>1.5&&j<n-1)for(const sd of[-1,1])put(g,BXG,CON,P[j*4]+lx*sd*(r.hw+.25),P[j*4+2]+.45,P[j*4+1]+lz*sd*(r.hw+.25),.4,.9,5.2,0,th,0);
   if(P[j*4+3]>0){put(g,BXG,CON,P[j*4],P[j*4+2]-.55,P[j*4+1],2*r.hw+1.1,1.1,6.4,0,th,0);put(g,BXG,CD,P[j*4],P[j*4+2]-1.3,P[j*4+1],2*r.hw*.8,.5,6.4,0,th,0)}}
  for(let j=0;j<n-1;j++){const a=j*2,b=j*2+1,c=j*2+2,d=j*2+3;idx.push(a,b,c,b,d,c)}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));ge.setAttribute('uv',new THREE.BufferAttribute(uv,2));ge.setIndex(idx);ge.computeVertexNormals();
  if(ge.attributes.normal.getY(0)<0){for(let k=0;k<idx.length;k+=3){const t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t}ge.setIndex(idx);ge.computeVertexNormals()}
  const m=new THREE.Mesh(ge,RM);m.receiveShadow=true;m.frustumCulled=false;g.add(m);disp.push(ge)}
 if(f.kind==='st'){stDeco(f,g,disp);flushBatch(g,disp);scene.add(g);return g}
 // pilares ao lado da rodovia principal sob a pista secundária
 for(const sd of[-1,1]){const q=sd*(f.hw+3.4),x=f.x0+f.nx*q,z=f.z0+f.nz*q,top=f.y0+IC_H,ph=top-1-f.y0;put(g,CYG,CD,x,f.y0+ph/2,z,1.1,ph,1.1);put(g,BXG,CD,x,top-1.1,z,2.8,.5,2*7.5,0,f.h,0);f.cols.push({x,z,r:1.4,k:1})}
 flushBatch(g,disp);scene.add(g);return g}
// ---- postos de combustível: acostamento largo + pista de acesso (fitas), cobertura, bombas, loja e totem ----
const STM=new Map(),ST_D=3500,STN=['Posto Estrela','Auto Posto Beira Rio','Posto Rodovia 24h','Posto Pé na Estrada','Posto Bom Caminho','Posto Sol Nascente'],STP=[[0xc7352b,0xf2f2f2],[0x2b7a3b,0xf2c200],[0x1f5fa8,0xf2f2f2],[0x222831,0xf08a1c]];
function stGet(i){if(STM.has(i))return STM.get(i);let f=null;const s=i*ST_D+1750+(hh(i,2,53)-.5)*1000;
 if(hh(i,1,53)<.8&&Math.abs(s)>1200&&!nearCo(s,450)&&!inCity(s,900)){let ok=true;
  for(let q=Math.floor(s/RV_D)-1;q<=Math.floor(s/RV_D)+1&&ok;q++){const r=riverGet(q);if(r&&Math.abs(r.s-s)<r.sb+300)ok=false}
  for(let q=Math.floor(s/IC_D)-1;q<=Math.floor(s/IC_D)+1&&ok;q++){const c=icGet(q);if(c&&Math.abs(c.s-s)<550)ok=false}
  for(let q=Math.floor(s/OV_D)-1;q<=Math.floor(s/OV_D)+1&&ok;q++){const o=ovGet(q);if(o&&Math.abs(o.s-s)<400)ok=false}
  if(ok){ensureRoad(s-200,s+200);for(let d=-150;d<=150;d+=30)if(kindAt(s+d)!==0)ok=false;if(ok&&Math.abs(samp(Math.round((s+150)/RDS)).h-samp(Math.round((s-150)/RDS)).h)>.1)ok=false}
  if(ok)f={i,s,kind:'st',sd:hh(i,3,53)<.5?-1:1,name:STN[Math.floor(hh(i,4,53)*STN.length)],pal:STP[Math.floor(hh(i,5,53)*STP.length)],g:null,pend:false,cols:[],rb:null}}
 STM.set(i,f);return f}
function stRibbons(f){const W=(p,q)=>[f.x0+f.tx*p+f.nx*q,f.z0+f.tz*p+f.nz*q],sd=f.sd,cq=sd*(f.hw+17),e0=sd*(f.hw-2),rb=[],ya=p=>yR(f.s+p)+.1;
 const z=W(0,sd*(f.hw+14.5));f.zx=z[0];f.zz=z[1];
 const mk=(hw,fn,n)=>{const p=new Float32Array(n*4);for(let j=0;j<n;j++){const v=fn(j/(n-1));p[j*4]=v[0];p[j*4+1]=v[1];p[j*4+2]=v[2];p[j*4+3]=0}rb.push({hw,p,n})};
 mk(9,t=>{const p=-45+90*t,w=W(p,cq);return[w[0],w[1],ya(p)]},16);
 for(const sg of[-1,1])mk(5.2,t=>{const P0=[sg*100,e0],P1=[sg*40,cq],T=[-sg*70,0],t2=t*t,t3=t2*t,h1=2*t3-3*t2+1,h2=-2*t3+3*t2,h3=t3-2*t2+t,h4=t3-t2,p=h1*P0[0]+h2*P1[0]+h3*T[0]+h4*T[0],q=h1*P0[1]+h2*P1[1],w=W(p,q);return[w[0],w[1],ya(p)]},26);
 return rb}
function stDeco(f,g,disp){const sd=f.sd,hw=f.hw,cq=sd*(hw+17),W=(p,q)=>[f.x0+f.tx*p+f.nx*q,f.z0+f.tz*p+f.nz*q],ya=p=>yR(f.s+p)+.1,
 R=mat(f.pal[0]),A=mat(f.pal[1]),WH=mat(0xe9e9e4),DK=mat(0x2a2d33),CO=mat(0x8d9096),GL=mat(0x1a2a36),LT=new THREE.MeshBasicMaterial({color:0xfff2cc});disp.push(LT);
 const B=(p,q,y,sx,sy,sz,m)=>{const w=W(p,q);put(g,BXG,m,w[0],ya(p)+y,w[1],sx,sy,sz,0,f.h,0)},Cy=(p,q,y,r,h,m)=>{const w=W(p,q);put(g,CYG,m,w[0],ya(p)+y,w[1],r,h,r)},col=(p,q,r)=>{const w=W(p,q);f.cols.push({x:w[0],z:w[1],r,k:1})};
 const qc=cq+sd*3.5;
 // cobertura (balanço, sem colunas na pista dos caminhões)
 B(0,qc,5.6,10,.6,26,WH);B(0,qc,5.15,10.2,.35,26.2,R);B(0,qc,4.95,9.6,.08,25.6,LT);
 for(const p of[-10,-3.3,3.3,10]){Cy(p,cq+sd*8,2.8,.45,5.6,CO);col(p,cq+sd*8,.6)}
 // ilhas e bombas
 for(const p of[-5,5]){B(p,qc,.15,1.6,.3,6,CO);B(p,qc,1.05,.8,1.5,1.0,R);B(p,qc,1.9,.84,.3,1.04,A);col(p,qc,1.4)}
 // loja
 const qs=cq+sd*20;B(0,qs,2.1,9,4.2,22,WH);B(0,qs,4.4,9.6,.4,22.6,R);B(0,qs-sd*4.55,1.9,.1,1.7,16,GL);B(0,qs-sd*4.55,.05,.12,.1,22,A);
 for(const p of[-9,-4.5,0,4.5,9])col(p,qs,4.4);
 // totem com placa
 const tw=W(-30,sd*(hw+5.5)),ty=ya(-30);Cy(-30,sd*(hw+5.5),5.6,.22,11.2,CO);col(-30,sd*(hw+5.5),.6);
 const tex=signTex(f.name,f.pal[0],f.pal[1]),sm=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});disp.push(tex,sm);
 for(const sg of[0,1]){const pg=new THREE.PlaneGeometry(6,1.5),m=new THREE.Mesh(pg,sm);m.position.set(tw[0]+f.tx*(sg?.25:-.25),ty+11.8,tw[1]+f.tz*(sg?.25:-.25));m.rotation.y=f.h+(sg?Math.PI:0);g.add(m);disp.push(pg)}}
