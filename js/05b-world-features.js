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
  for(let d=-150;d<=150;d+=30)if(kindAt(s+d)!==0)ok=false;if(ok)o={i,s,g:null,pend:false,cols:[]}}
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
function featBlock(x,z){for(const r of RIVA){const dx=x-r.x0,dz=z-r.z0;if(Math.abs(dx*r.tx+dz*r.tz)<r.wv+10&&Math.abs(dx*r.nx+dz*r.nz)<600)return true}
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
// mantém as listas de recursos ativos e constrói no máx. 1 por quadro; devolve true se o conjunto ativo mudou
function featFrame(lo,hi,allowBuild){let ch=false;
 const wr=[];for(let j=Math.floor((lo-300)/RV_D)-1;j<=Math.ceil((hi+300)/RV_D)+1;j++){const r=riverGet(j);if(r&&r.s>lo-300&&r.s<hi+300)wr.push(r)}
 for(let i=RIVA.length-1;i>=0;i--)if(!wr.includes(RIVA[i])){featDispose(RIVA[i]);RIVA.splice(i,1);ch=true}
 for(const r of wr)if(!RIVA.includes(r)){featGeo(r);RIVA.push(r);r.pend=true;ch=true}
 const wo=[];for(let i=Math.floor((lo-200)/OV_D)-1;i<=Math.ceil((hi+200)/OV_D)+1;i++){const o=ovGet(i);if(o&&o.s>lo-200&&o.s<hi+200)wo.push(o)}
 for(let i=OVA.length-1;i>=0;i--)if(!wo.includes(OVA[i])){featDispose(OVA[i]);OVA.splice(i,1)}
 for(const o of wo)if(!OVA.includes(o)){featGeo(o);OVA.push(o);o.pend=true}
 if(allowBuild){for(const r of RIVA)if(r.pend&&!r.g){r.pend=false;r.g=buildBridge(r);return ch}
  for(const o of OVA)if(o.pend&&!o.g){o.pend=false;o.g=buildOverpass(o);ocx=1e9;return ch}}
 return ch}
