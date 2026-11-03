// ---- tráfego: poucas carretas na estrada (até 4), com o mesmo modelo do caminhão e da carreta do jogador; cargas variadas ou vazias ----
const TRF=[],TRF_MAX=4;let trfT=2,TRUCKM=null,TRUCKP=null;const trfLat=(o,dir)=>dir*o.hw*(o.kd===0?.574:o.kd===1?.31:.568); // centro da faixa externa, conforme as marcações pintadas no atlas
// cor aleatória só na casca grande da cabine (material de verniz, índice 5 criado em splitMesh); carreta e demais peças ficam originais
const TRC=[0xd0392e,0x2f6fc0,0x3a9a4a,0xf2f2ee,0xe07a22,0x4a4f55,0x8b4aa5,0xe8c020],TMC=new Map(),pick=a=>a[Math.floor(Math.random()*a.length)];
function trfMat(m,hex,k){const key=m.uuid+'|'+hex+'|'+k;let c=TMC.get(key);if(!c){c=m.clone();c.color.copy(C(hex));if(k)c.color.multiplyScalar(k);TMC.set(key,c)}return c}
function cabPaint(root,hex){root.traverse(n=>{if(!n.isMesh||!Array.isArray(n.material)||!n.material[5])return;if(!n.userData.m0)n.userData.m0=n.material;n.material=hex==null?n.userData.m0:n.userData.m0.map((m,i)=>i===5?trfMat(m,hex,1):m)})}
function trfBuild(){const g=new THREE.Group();const cab=TRUCKM.clone(true);g.add(cab);const sps=[];
 // o modelo original esconde os pneus (mkWheels os recria à parte): refaz as rodas do cavalo com as mesmas malhas
 for(const w of wh){const gp=new THREE.Group(),sp=new THREE.Group();gp.position.copy(w.c);w.sp.children.forEach(ch=>{const me=new THREE.Mesh(ch.geometry,ch.material);me.castShadow=true;sp.add(me)});gp.add(sp);g.add(gp);sps.push(sp)}
const t=mkTrailer(g,0,0,1);t.position.z=6.75;cabPaint(cab,pick(TRC));
 if(Math.random()<.65){const k=Object.keys(CARGOS),L=CARGOS[k[Math.floor(Math.random()*k.length)]];setTrCargo(t,L[Math.floor(Math.random()*L.length)],10+Math.floor(Math.random()*14))}
 return{g,t,disp:[],sps}}
function trfSpawn(){const same=TRF.filter(v=>v.dir===coDir).length,go=same<=TRF.length-same,dir=go?coDir:-coDir,s=curS+coDir*(go?180+Math.random()*320:300+Math.random()*350);ensureRoad(s-60,s+60);
 for(const v of TRF)if(Math.abs(v.s-s)<120)return;
 const o=samp(Math.round(s/RDS)),lat=trfLat(o,dir),m=trfBuild();scene.add(m.g);
 const v={s,dir,lat,sp:14+Math.random()*7,g:m.g,t:m.t,sps:m.sps,disp:m.disp,cols:[0,1,2,3,4].map(()=>({x:1e5,z:1e5,r:2.3,k:1}))};TRF.push(v);ocx=1e9}
// som posicional: motor (serra + quadrada filtradas) e rolagem dos pneus, com pan, atenuação por distância e efeito Doppler; passa pelo volume geral (mudo)
function trfSndMk(){const g=AC.createGain(),lp=AC.createBiquadFilter(),o1=AC.createOscillator(),o2=AC.createOscillator(),g2=AC.createGain(),ns=AC.createBufferSource(),nf=AC.createBiquadFilter(),ng=AC.createGain(),pn=AC.createStereoPanner?AC.createStereoPanner():null;
 g.gain.value=0;lp.type='lowpass';lp.frequency.value=380;o1.type='sawtooth';o2.type='square';g2.gain.value=.45;nf.type='bandpass';nf.frequency.value=420;nf.Q.value=.7;ng.gain.value=0;
 o1.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);ns.buffer=A.nb;ns.loop=true;ns.connect(nf);nf.connect(ng);ng.connect(g);
 if(pn){g.connect(pn);pn.connect(A.m)}else g.connect(A.m);o1.start();o2.start();ns.start(0,Math.random()*1.5);return{o1,o2,g,ng,pn,lp}}
function trfSnd(v,dt){if(!AC||!A.m)return;if(!v.snd)v.snd=trfSndMk();const n=v.snd,t=AC.currentTime,rx=v.x-pos.x,rz=v.z-pos.z,d=Math.hypot(rx,rz)||1,
 vx=v.vx,vz=v.vz,vc=((vx-vel.x)*rx+(vz-vel.z)*rz)/d,dop=343/(343+vc),f0=(34+v.sp*1.5)*dop,
 att=Math.pow(Math.max(0,1-d/230),2),pan=Math.max(-1,Math.min(1,(rx*Math.cos(hd)-rz*Math.sin(hd))/45));
 n.o1.frequency.setTargetAtTime(f0,t,.08);n.o2.frequency.setTargetAtTime(f0*2.01,t,.08);n.g.gain.setTargetAtTime(muted?0:att*.22,t,.08);n.ng.gain.setTargetAtTime(Math.min(1,v.sp/20)*.5,t,.1);if(n.pn)n.pn.pan.setTargetAtTime(pan,t,.05)}
function trfSndOff(v){const n=v.snd;if(!n)return;try{n.o1.stop();n.o2.stop();n.g.disconnect()}catch(e){}v.snd=null}
function trfKill(i){const v=TRF[i];trfSndOff(v);scene.remove(v.g);if(v.t.userData.cg)v.t.userData.cg.userData.dispose();for(const d of v.disp)d.dispose();TRF.splice(i,1);ocx=1e9}
function trfUpd(dt){if(!ready)return;
 for(let i=TRF.length-1;i>=0;i--){const v=TRF[i];if(Math.abs(v.s-curS)>950){trfKill(i);continue}
  v.s+=v.dir*v.sp*dt;ensureRoad(v.s-30,v.s+30);v.lat+=(trfLat(samp(Math.round(v.s/RDS)),v.dir)-v.lat)*Math.min(1,dt*1.5);roadPt(v.s,v.lat);const x=RPx,z=RPz;roadPt(v.s+v.dir*6,v.lat);const dx=RPx-x,dz=RPz-z;
  v.g.position.set(x,H(x,z),z);v.x=x;v.z=z;v.g.rotation.y=Math.atan2(-dx,-dz);const l=Math.hypot(dx,dz)||1,fx=dx/l,fz=dz/l;for(const q of v.sps)q.rotation.x-=v.sp*dt/.55;v.vx=fx*v.sp;v.vz=fz*v.sp;trfSnd(v,dt);
  [4,.5,-4,-8.5,-13].forEach((d,k)=>{const c=v.cols[k];c.x=x+fx*d;c.z=z+fz*d})}
 trfT-=dt;if(trfT<=0){trfT=2.5+Math.random()*3;if(TRF.length<TRF_MAX)trfSpawn()}}
