// ---- tráfego: poucas carretas na estrada (até 4), com o mesmo modelo do caminhão e da carreta do jogador; cargas variadas ou vazias ----
const TRF=[],TRF_MAX=9;let trfT=2,TRUCKM=null,TRUCKP=null;const trfLat=(o,dir,out)=>dir*o.hw*(o.kd===1?.31:o.kd===2?(out?.568:.189):(out?.574:.191)); // faixa simples: centro; pista dupla: interna (esquerda) ou externa (direita)
// cor aleatória só na casca grande da cabine (material de verniz, índice 5 criado em splitMesh); carreta e demais peças ficam originais
const TRC=[0xd0392e,0x2f6fc0,0x3a9a4a,0xf2f2ee,0xe07a22,0x4a4f55,0x8b4aa5,0xe8c020],TMC=new Map(),pick=a=>a[Math.floor(Math.random()*a.length)];
function trfMat(m,hex,k){const key=m.uuid+'|'+hex+'|'+k;let c=TMC.get(key);if(!c){c=m.clone();c.color.copy(C(hex));if(k)c.color.multiplyScalar(k);TMC.set(key,c)}return c}
function cabPaint(root,hex){root.traverse(n=>{if(!n.isMesh||!Array.isArray(n.material)||!n.material[5])return;if(!n.userData.m0)n.userData.m0=n.material;n.material=hex==null?n.userData.m0:n.userData.m0.map((m,i)=>i===5?trfMat(m,hex,1):m)})}
// materiais da carreta/aros independentes por veículo (a pintura do jogador não altera o tráfego nem os outros jogadores)
const TRLC=new Map(),RIMC=new Map();
function trlMat(m,hex){const i=TRLM.indexOf(m);if(i<0)return m;const k=i+'|'+(hex==null?'d':hex);let c=TRLC.get(k);if(!c){c=m.clone();c.color.copy(C(hex==null?TRLD[i]:hex));if(hex!=null&&i)c.color.multiplyScalar(.88);TRLC.set(k,c)}return c}
function trlSwap(t,hex){t.traverse(o=>{if(!o.isMesh)return;o.material=Array.isArray(o.material)?o.material.map(m=>trlMat(m,hex)):trlMat(o.material,hex)})}
function rimClone(m,hex){const k=m.uuid+'|'+hex;let c=RIMC.get(k);if(!c){c=m.clone();c.color.copy(C(hex));RIMC.set(k,c)}return c}
function trfBuild(po){const g=new THREE.Group();const cab=TRUCKM.clone(true);g.add(cab);const sps=[];
 // o modelo original esconde os pneus (mkWheels os recria à parte): refaz as rodas do cavalo com as mesmas malhas
 for(const w of wh){const gp=new THREE.Group(),sp=new THREE.Group();gp.position.copy(w.c);w.sp.children.forEach(ch=>{let mt=ch.userData.o||ch.material;if(po&&po.rim!=null&&ch.userData.o)mt=ch.material.map(x=>RIMP.includes(x)?rimClone(x,po.rim):x);const me=new THREE.Mesh(ch.geometry,mt);me.castShadow=true;sp.add(me)});gp.add(sp);g.add(gp);sps.push(sp)}
const t=mkTrailer(g,0,0,1,true);t.position.z=6.75;trlSwap(t,po?po.trl:null);cabPaint(cab,po?po.cab:pick(TRC));
 if(!po&&Math.random()<.65){const k=Object.keys(CARGOS),L=CARGOS[k[Math.floor(Math.random()*k.length)]];setTrCargo(t,L[Math.floor(Math.random()*L.length)],10+Math.floor(Math.random()*14))}
 return{g,t,disp:[],sps}}

// ---- carros: Honda Civic Type R (modelo do jogador) com cores aleatórias; a pintura amarela da textura é recolorida por matiz ----
let CARM=null,CARW=[],CARBASE=null;const CARCOL=[[0,.85,1],[215,.8,.85],[130,.65,.7],[0,0,1.05],[0,0,.16],[0,0,.7],[25,.9,1],[280,.55,.75],[52,.9,1],[225,.7,.5],[350,.7,.65],[170,.6,.8]],CARMC=new Map();
function trfCarLoad(){try{const bin=atob(CIVIC),buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);
 const _cib=window.createImageBitmap;window.createImageBitmap=undefined;setTimeout(()=>{window.createImageBitmap=_cib},0);
 new THREE.GLTFLoader().parse(glbNoBlob(buf.buffer),'',g=>{const m=g.scene;m.updateMatrixWorld(true);
  m.traverse(n=>{if(!n.isMesh)return;n.castShadow=true;n.receiveShadow=false;const mt=n.material;if(mt.map){mt.map.anisotropy=4;mt.map.needsUpdate=true}
   if(/CHASSIS/.test(mt.name)){n.userData.body=1;CARBASE=mt.map.image;mt.roughness=.45;mt.metalness=.25}else if(/WHEEL/.test(mt.name)){mt.roughness=.9;mt.metalness=0}
   if(/WHEEL/.test(mt.name)){const w=n.parent,ax=new THREE.Vector3(0,1,0).transformDirection(n.matrixWorld);n.userData.wheel=ax.x>=0?1:-1;CARW.push(n)}});
  m.scale.setScalar(1.5);m.position.y=.62;const w=new THREE.Group();w.add(m);m.rotation.y=Math.PI;CARM=w}
 ,e=>console.warn('civic',e))}catch(e){console.warn('civic',e)}}
function carMat(ci,base){let c=CARMC.get(ci);if(c)return c;const[h,s,v]=CARCOL[ci],im=CARBASE,W=im.width,H2=im.height,cv=document.createElement('canvas');cv.width=W;cv.height=H2;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H2),a=d.data;
 for(let i=0;i<a.length;i+=4){const r=a[i]/255,g=a[i+1]/255,b=a[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn;if(df<.35||mx<.55)continue;let hh=mx===r?((g-b)/df)%6:mx===g?(b-r)/df+2:(r-g)/df+4;hh*=60;if(hh<0)hh+=360;if(hh<38||hh>72)continue;
  const sat=df/mx,ns=Math.min(1,s*sat*1.05),nv=Math.min(1,mx*v),hp=((h%360)+360)%360/60,ch=nv*ns,xx=ch*(1-Math.abs(hp%2-1)),m0=nv-ch;let rr,gg,bb;
  if(hp<1){rr=ch;gg=xx;bb=0}else if(hp<2){rr=xx;gg=ch;bb=0}else if(hp<3){rr=0;gg=ch;bb=xx}else if(hp<4){rr=0;gg=xx;bb=ch}else if(hp<5){rr=xx;gg=0;bb=ch}else{rr=ch;gg=0;bb=xx}
  a[i]=(rr+m0)*255;a[i+1]=(gg+m0)*255;a[i+2]=(bb+m0)*255}
 x.putImageData(d,0,0);const t=new THREE.CanvasTexture(cv);t.flipY=false;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;t.wrapS=t.wrapT=THREE.RepeatWrapping;c=base.clone();c.map=t;CARMC.set(ci,c);return c}
/* rodas dianteiras do GLB vêm viradas ~30°: mesma correção do Civic do jogador (grupo em volta do centro do pneu, -30° na vertical) */
function trfFixWheels(g,sps){g.updateMatrixWorld(true);const bb=new THREE.Box3(),v=new THREE.Vector3();let zmin=1e9,zmax=-1e9;
 for(const q of sps){bb.setFromObject(q.n).getCenter(v);zmin=Math.min(zmin,v.z);zmax=Math.max(zmax,v.z)}const zm=(zmin+zmax)/2;
 for(const q of sps){bb.setFromObject(q.n).getCenter(v);if(!(v.z<zm))continue;const par=q.n.parent,sg=new THREE.Group();
  q.n.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(q.n.matrixWorld).invert(),vv=new THREE.Vector3(),pts=[];let rm=0;
  q.n.traverse(m=>{if(!m.isMesh)return;const ps=m.geometry.attributes.position,mm=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld);for(let i=0;i<ps.count;i++){vv.fromBufferAttribute(ps,i).applyMatrix4(mm);const r=Math.hypot(vv.x,vv.z);if(r>rm)rm=r;pts.push(vv.x,vv.y,vv.z)}});
  let lo=1e9,hi=-1e9;for(let i=0;i<pts.length;i+=3)if(Math.hypot(pts[i],pts[i+2])>rm*.93){lo=Math.min(lo,pts[i+1]);hi=Math.max(hi,pts[i+1])}
  const lc=lo<hi?(lo+hi)/2:0,pw=q.n.localToWorld(new THREE.Vector3(0,lc,0));par.worldToLocal(pw);
  sg.position.copy(pw);par.add(sg);sg.add(q.n);q.n.position.copy(pw).negate().add(q.n.position);
  par.updateWorldMatrix(true,false);const qp=new THREE.Quaternion();par.getWorldQuaternion(qp);sg.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0).applyQuaternion(qp.invert()),-Math.PI/6)}}
function trfBuildCar(){const g=CARM.clone(true),ci=Math.floor(Math.random()*CARCOL.length),sps=[];g.traverse(n=>{if(n.userData.body)n.material=carMat(ci,n.material);if(n.userData.wheel)sps.push({n,s:n.userData.wheel})});trfFixWheels(g,sps);return{g,t:null,disp:[],sps,car:1}}
function trfSpawn(){const same=TRF.filter(v=>v.dir===coDir).length,go=same<=TRF.length-same,dir=go?coDir:-coDir,s=curS+coDir*(go?180+Math.random()*320:300+Math.random()*350);ensureRoad(s-60,s+60);
 for(const v of TRF)if(Math.abs(v.s-s)<120)return;
 const o=samp(Math.round(s/RDS)),lat=trfLat(o,dir),nTr=TRF.filter(q=>!q.car).length,isCar=CARM&&CARBASE&&(nTr>=4||Math.random()<.6),m=isCar?trfBuildCar():trfBuild();scene.add(m.g);
 const co=isCar?[1.5,0,-1.5]:[4,.5,-4,-8.5,-13],v={s,dir,lat:trfLat(o,dir,!isCar),lane:0,lt:Math.random(),ot:0,ld:1e9,lv:0,sp:isCar?18+Math.random()*8:14+Math.random()*7,g:m.g,t:m.t,sps:m.sps,disp:m.disp,car:isCar?1:0,co,fr:isCar?2.9:5.5,cols:co.map(()=>({x:1e5,z:1e5,r:isCar?1.45:2.3,k:1}))};TRF.push(v);ocx=1e9}
// som posicional: motor (serra + quadrada filtradas) e rolagem dos pneus, com pan, atenuação por distância e efeito Doppler; passa pelo volume geral (mudo)
function trfSndMk(){const g=AC.createGain(),lp=AC.createBiquadFilter(),o1=AC.createOscillator(),o2=AC.createOscillator(),g2=AC.createGain(),ns=AC.createBufferSource(),nf=AC.createBiquadFilter(),ng=AC.createGain(),pn=AC.createStereoPanner?AC.createStereoPanner():null;
 g.gain.value=0;lp.type='lowpass';lp.frequency.value=380;o1.type='sawtooth';o2.type='square';g2.gain.value=.45;nf.type='bandpass';nf.frequency.value=420;nf.Q.value=.7;ng.gain.value=0;
 o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);ns.buffer=A.nb;ns.loop=true;ns.connect(nf);nf.connect(ng);ng.connect(g);
 if(pn){g.connect(pn);pn.connect(A.m)}else g.connect(A.m);o1.start();o2.start();ns.start(0,Math.random()*1.5);return{o1,o2,g,ng,pn,lp}}
function trfSnd(v,dt){if(!AC||!A.m)return;if(!v.snd)v.snd=trfSndMk();const n=v.snd,t=AC.currentTime,rx=v.x-pos.x,rz=v.z-pos.z,d=Math.hypot(rx,rz)||1,
 vx=v.vx,vz=v.vz,vc=((vx-vel.x)*rx+(vz-vel.z)*rz)/d,dop=343/(343+vc),f0=(34+v.sp*1.5)*(v.car?1.6:1)*dop,
 att=Math.pow(Math.max(0,1-d/230),2),pan=Math.max(-1,Math.min(1,(rx*Math.cos(hd)-rz*Math.sin(hd))/45));
 if(!isFinite(f0+att+pan+v.sp))return; // valor não finito derrubava o quadro inteiro (AudioParam recusa NaN/Infinity)
 n.o1.frequency.setTargetAtTime(f0,t,.08);n.o2.frequency.setTargetAtTime(f0*2.01,t,.08);n.g.gain.setTargetAtTime(muted?0:att*(v.car?.12:.22),t,.08);n.ng.gain.setTargetAtTime(Math.min(1,v.sp/20)*.5,t,.1);if(n.pn)n.pn.pan.setTargetAtTime(pan,t,.05)}
function trfSndOff(v){const n=v.snd;if(!n)return;try{n.o1.stop();n.o2.stop();n.g.disconnect()}catch(e){}v.snd=null}
function trfKill(i){const v=TRF[i];trfSndOff(v);scene.remove(v.g);if(v.t&&v.t.userData.cg)v.t.userData.cg.userData.dispose();for(const d of v.disp)d.dispose();TRF.splice(i,1);ocx=1e9}
// IA dos motoristas: enxergam o caminhão do jogador (cavalo + carreta/carga) e os outros veículos à frente na própria pista;
// reduzem a velocidade para parar com folga (frenagem confortável) e voltam a acelerar quando a pista libera
function trfBrain(v,dt){if(v.fx===undefined)return;const c0=v.v0||(v.v0=v.sp),fx=v.fx,fz=v.fz;let vt=c0,seen=0,ld=1e9,lv=0;
 const chk=(x,z,vo,hw)=>{const rx=x-v.x,rz=z-v.z,al=rx*fx+rz*fz;if(al<=0||al>90)return;const la=Math.abs(rx*fz-rz*fx);if(la>1.3+hw)return;
  const g=al-v.fr,sf=Math.sqrt(2*3.2*Math.max(0,g-3.5))+Math.max(0,vo);if(sf<vt)vt=sf;seen=1;if(g<ld){ld=g;lv=vo}};
 const sh=Math.sin(hd),ch=Math.cos(hd),vfp=-(vel.x*sh+vel.z*ch),same=Math.abs(HREF-v.g.position.y)<3; // jogador em outro nível (viaduto) não bloqueia
 if(same)for(const d of[4.2,1,-3])chk(pos.x-sh*d,pos.z-ch*d,vfp*(-fx*sh-fz*ch>0?1:-1),1.35);
 if(same&&hitched){const st=Math.sin(th),ct=Math.cos(th);for(let t=2;t<=TLEN+1.5;t+=2.2)chk(pos.x+st*t,pos.z+ct*t,0,1.45)}
 for(const o of TRF){if(o===v||o.dir!==v.dir)continue;for(const k of o.cols)chk(k.x,k.z,o.sp,1.35)}
 if(typeof NET!=='undefined')for(const p of NET.peers.values())if(p.cols)for(const k of p.cols)chk(k.x,k.z,p.sp||0,1.4);
 v.ld=ld;v.lv=lv;
 /* mesma física dos veículos do jogador: tração limitada por potência (cai com a velocidade), freio por tipo, atraso do pedal */
 const car=!!v.car,aMax=car?3.4:1.1,bMax=car?8.5:5.2,vMax=Math.max(c0*1.35,1);
 let ad;if(vt<v.sp)ad=-Math.min(bMax,(v.sp-vt)*2.5+.8);else if(v.sp<c0)ad=Math.max(.25,aMax*(1-v.sp/vMax))*(seen?.6:1);else ad=0;
 v.ac=v.ac||0;v.ac+=Math.max(-dt*(car?22:14),Math.min(dt*(car?10:6),ad-v.ac)); /* variação de aceleração limitada: nada brusco */
 let ns=v.sp+v.ac*dt;ns=vt<v.sp?Math.max(ns,vt):Math.min(ns,Math.max(c0,v.sp));v.sp=Math.max(0,ns)}
/* carroceria: arfagem (frenagem/aceleração), rolagem (curva) e inclinação do terreno, em molas amortecidas como nos veículos do jogador */
function trfBody(v,dt,hdg,x,z,dx,dz){const car=!!v.car,L=car?2.7:4,l=Math.hypot(dx,dz)||1,nx=dx/l,nz=dz/l;
 if(v.hp===undefined){v.hp=hdg;v.sp0=v.sp;v.pp=v.pv=v.rp=v.rv=0;v.sl=0}
 let dh=hdg-v.hp;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;v.hp=hdg;
 const yr=dt>0?dh/dt:0,acc=dt>0?(v.sp-v.sp0)/dt:0;v.sp0=v.sp;
 const sl=Math.max(-.15,Math.min(.15,Math.atan2(Hx(x+nx*L/2,z+nz*L/2,0)-Hx(x-nx*L/2,z-nz*L/2,0),L)));v.sl+=(sl-v.sl)*Math.min(1,dt*6);
 const k=car?150:90,c=car?25:11,tp=Math.max(-.07,Math.min(.07,acc*(car?.0075:.011))),tr=Math.max(-.12,Math.min(.12,-yr*v.sp*(car?.011:.017)));
 v.pv+=(k*(tp-v.pp)-c*v.pv)*dt;v.pp+=v.pv*dt;v.rv+=(k*(tr-v.rp)-c*v.rv)*dt;v.rp+=v.rv*dt;
 v.g.rotation.order='YXZ';v.g.rotation.x=v.sl+v.pp;v.g.rotation.z=v.rp}
// pista dupla: carros na esquerda (interna), caminhões na direita (externa); se o da frente é bem mais lento, ultrapassa pela outra pista só se estiver livre (a trás, ao lado e à frente) e volta quando livre
function trfOut(v){return v.car?!!v.lane:!v.lane}
function trfFree(v,out,a,b){const o=samp(Math.round(v.s/RDS)),lat=trfLat(o,v.dir,out);
 for(let k=a;k<=b;k+=6){roadPt(v.s+v.dir*k,lat);const px=RPx,pz=RPz;
  for(const q of TRF){if(q===v||q.dir!==v.dir)continue;for(const c of q.cols)if(Math.hypot(c.x-px,c.z-pz)<3.4)return false}
  if(Math.abs(HREF-v.g.position.y)<3){if(Math.hypot(pos.x-px,pos.z-pz)<3.8)return false;if(hitched){const st=Math.sin(th),ct=Math.cos(th);for(let u=3;u<=TLEN+2;u+=3.5)if(Math.hypot(pos.x+st*u-px,pos.z+ct*u-pz)<3.8)return false}}}
 return true}
function trfLane(v){const o=samp(Math.round(v.s/RDS)),oa=samp(Math.round((v.s+v.dir*140)/RDS));
 if(o.kd===1||oa.kd===1){v.lane=0;return}
 if(!v.lane){if(v.ld<45&&v.lv<(v.v0||v.sp)-1.5&&trfFree(v,!trfOut(v),-26,38)){v.lane=1;v.ot=0}}
 else{v.ot+=.5;if(v.ot>3&&trfFree(v,trfOut(v)?false:true,-16,26)&&v.ld>20)v.lane=0}}
function trfUpd(dt){if(!ready)return;
 for(let i=TRF.length-1;i>=0;i--){const v=TRF[i];if(Math.abs(v.s-curS)>950){trfKill(i);continue}
  v.lt-=dt;if(v.lt<=0){v.lt=.5;ensureRoad(v.s-160,v.s+160);trfLane(v)}trfBrain(v,dt);v.s+=v.dir*v.sp*dt;ensureRoad(v.s-30,v.s+30);v.lat+=(trfLat(samp(Math.round(v.s/RDS)),v.dir,trfOut(v))-v.lat)*Math.min(1,dt*1.5);roadPt(v.s,v.lat);const x=RPx,z=RPz;roadPt(v.s+v.dir*6,v.lat);const dx=RPx-x,dz=RPz-z;
  v.g.position.set(x,Hx(x,z,0),z);v.x=x;v.z=z;{const tg=Math.atan2(-dx,-dz);if(v.hy===undefined)v.hy=tg;let e=tg-v.hy;while(e>Math.PI)e-=2*Math.PI;while(e<-Math.PI)e+=2*Math.PI;v.hy+=e*Math.min(1,dt*9);v.g.rotation.y=v.hy;
   if(v.t){ /* articulação da carreta na quinta roda: mesma dinâmica do jogador, com atraso e amortecimento */
    if(v.th===undefined){v.th=v.hy;v.wT=0}const vk=v.sp*Math.sin(v.th-v.hy),wD=-vk/TLEN;v.wT+=(wD-v.wT)*Math.min(1,dt*9);v.th+=v.wT*dt;
    let f=v.th-v.hy;f=Math.atan2(Math.sin(f),Math.cos(f));f=Math.max(-.9,Math.min(.9,f));v.th=v.hy+f;v.t.rotation.y=f;v.t.position.set(6.75*Math.sin(f),0,6.75*Math.cos(f))}}
  trfBody(v,dt,v.g.rotation.y,x,z,dx,dz);
  if(v.t&&v.th!==undefined){ /* articulação vertical e lateral no engate: a carreta acompanha o terreno e rola por conta própria */
   const rx=x-Math.sin(v.th)*TLEN,rz=z-Math.cos(v.th)*TLEN,st=Math.max(-.15,Math.min(.15,Math.atan2(Hx(x,z,0)-Hx(rx,rz,0),TLEN)));
   v.tp=(v.tp||0)+(st-(v.tp||0))*Math.min(1,dt*6);v.tr=(v.tr||0)+(Math.max(-.1,Math.min(.1,-v.wT*v.sp*.01))-(v.tr||0))*Math.min(1,dt*5);
   v.t.rotation.order='YXZ';v.t.rotation.x=v.tp-v.g.rotation.x;v.t.rotation.z=v.tr-v.g.rotation.z}const l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;v.fx=fx;v.fz=fz;if(v.car){for(const q of v.sps)q.n.rotation.y+=q.s*v.sp*dt/.29}else for(const q of v.sps)q.rotation.x-=v.sp*dt/.55;v.vx=fx*v.sp;v.vz=fz*v.sp;trfSnd(v,dt);
  v.co.forEach((d,k)=>{const c=v.cols[k],tr=v.t&&k>=3&&v.th!==undefined,ux=tr?-Math.sin(v.th):fx,uz=tr?-Math.cos(v.th):fz;c.x=x+ux*d;c.z=z+uz*d;c.y=v.g.position.y})}
 trfT-=dt;if(trfT<=0){trfT=2.5+Math.random()*3;if(TRF.length<TRF_MAX)trfSpawn()}}
