/* ===== Honda Civic jogável: modelo do jogador, escolha de veículo na tela inicial e pintura =====
   O Civic reaproveita o modelo GLB do tráfego (CARM). Física própria vem de VP.civic (16-vehicle-powertrain.js). */
var LPDEF=window.LPDEF||{}; /* padrões dos pontos de luz por veículo (editor em 29-light-editor.js); precisa existir antes do civBuild */
var VSEL='truck',CIVP=null,CIVW=[];
const civReady=()=>!!(CARM&&CARBASE);
const civHex=h=>{const r=(h>>16&255)/255,g=(h>>8&255)/255,b=(h&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let hh=d?(mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)*60:0;if(hh<0)hh+=360;return[hh,mx?d/mx:0,Math.min(1.1,mx*1.05)]};
function civPaint(h){if(!CIVP)return;let ci=0;if(h!=null){const k=civHex(h);ci=CARCOL.findIndex(q=>q[0]===k[0]&&q[1]===k[1]&&q[2]===k[2]);if(ci<0){CARCOL.push(k);ci=CARCOL.length-1}}
 CIVP.traverse(n=>{if(!n.userData.body)return;if(!n.userData.m0)n.userData.m0=n.material;n.material=h==null?n.userData.m0:carMat(ci,n.userData.m0)});
 try{localStorage.setItem('fh16paintc',h==null?'':String(h))}catch(e){}}
function paintCab(h){if(VEH.car)civPaint(h);else{cabPaint(TRUCKP,h);paintSave(h)}}
function civBuild(){if(CIVP)return CIVP;if(!civReady())return null;
 const g=CARM.clone(true);CIVW=[];g.traverse(n=>{if(n.userData.wheel)CIVW.push({n,s:n.userData.wheel})});
 g.updateMatrixWorld(true);let zmin=1e9,zmax=-1e9;const bb=new THREE.Box3(),v=new THREE.Vector3();
 for(const q of CIVW){bb.setFromObject(q.n).getCenter(v);zmin=Math.min(zmin,v.z);zmax=Math.max(zmax,v.z)}
 const zm=(zmin+zmax)/2;for(const q of CIVW){bb.setFromObject(q.n).getCenter(v);q.front=v.z<zm;if(q.front){ // roda dianteira: grupo de esterço em volta do eixo vertical
  const par=q.n.parent,sg=new THREE.Group();
  /* centro real do pneu: eixo local y; usa só os vértices da banda de rodagem (raio máximo) em vez do bbox, que inclui disco/pinça e descentraliza o pivô */
  q.n.updateWorldMatrix(true,true);const inv=new THREE.Matrix4().copy(q.n.matrixWorld).invert(),vv=new THREE.Vector3(),pts=[];let rm=0;
  q.n.traverse(m=>{if(!m.isMesh)return;const ps=m.geometry.attributes.position,mm=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld);for(let i=0;i<ps.count;i++){vv.fromBufferAttribute(ps,i).applyMatrix4(mm);const r=Math.hypot(vv.x,vv.z);if(r>rm)rm=r;pts.push(vv.x,vv.y,vv.z)}});
  let lo=1e9,hi=-1e9;for(let i=0;i<pts.length;i+=3){if(Math.hypot(pts[i],pts[i+2])>rm*.93){lo=Math.min(lo,pts[i+1]);hi=Math.max(hi,pts[i+1])}}
  const lc=lo<hi?(lo+hi)/2:0,pw=q.n.localToWorld(new THREE.Vector3(0,lc,0));par.worldToLocal(pw);
  sg.position.copy(pw);par.add(sg);sg.add(q.n);q.n.position.copy(pw).negate().add(q.n.position);q.sg=sg;
  par.updateWorldMatrix(true,false);const qp=new THREE.Quaternion();par.getWorldQuaternion(qp);q.up=new THREE.Vector3(0,1,0).applyQuaternion(qp.invert());
  q.off=0}} /* o GLB traz as rodas dianteiras viradas ~30°: compensa para o repouso ficar reto */ // eixo vertical do mundo no espaço do pai da roda (o pai do GLB vem girado)
 if(zmax-zmin>1){VP.civic.L=zmax-zmin;VP.civic.cabin[2]=-(zmax-zmin)*.45;VP.civic.spot[2]=-(zmax-zmin)-.5;VP.civic.CZ=[.5,-.9,-(zmax-zmin)+.4,-(zmax-zmin)-.8]}
 g.position.z=-zmax; // eixo traseiro na origem do caminhão (pos = eixo traseiro)
 /* o GLB traz as rodas dianteiras viradas 30° no repouso (medido: eixo em 30° da lateral); gira -30° em torno da vertical para ficarem retas como as traseiras */
 for(const q of CIVW)if(q.sg){q.off=-Math.PI/6;q.sg.quaternion.setFromAxisAngle(q.up,q.off)}
 civLightsBuild(g,zmax);
 /* suspensão por roda: guarda a posição de repouso e o vetor "1 m para cima" (espaço do pai da roda); civSusp move cada roda conforme o terreno sob ela */
 g.updateMatrixWorld(true);for(const q of CIVW){const tg=q.sg||q.n,par=tg.parent;q.tg=tg;q.base=tg.position.clone();const w0=par.localToWorld(q.base.clone());q.upv=par.worldToLocal(w0.clone().add(new THREE.Vector3(0,1,0))).sub(q.base);q.lat=w0.x;q.al=-w0.z;q.dy=0}
 const o=new THREE.Group();o.add(g);o.visible=false;pivot.add(o);CIVP=o;
 try{const c=localStorage.getItem('fh16paintc');if(c)civPaint(+c)}catch(e){}
 return o}
function vehShow(){const car=!!VEH.car;if(TRUCKP)TRUCKP.visible=!car;for(const w of wh){w.W.visible=!car;w.coil.visible=w.dmp.visible=!car}
 if(CIVP)CIVP.visible=car;if(trl)trl.visible=!car&&hitched;
 spots.forEach((s,i)=>{const x=(i?1:-1)*VEH.spot[0];s.position.set(x,VEH.spot[1]-(VEH.car?.2:0),VEH.spot[2]);s.target.position.set(x*.5,.5,-40)});
 beams.forEach((b,i)=>{b.position.set((i?1:-1)*VEH.spot[0],VEH.spot[1]-(VEH.car?.3:.05),VEH.spot[2]-(VEH.car?2.6:.1));b.rotation.x=VEH.car?-.09:0}); /* cone de luz sai dos faróis do veículo atual */
 const hn=document.querySelectorAll('#hpan .ht button');hn.forEach(b=>{b.style.display=car&&b.dataset.t!=='cab'&&b.dataset.t!=='lp'&&b.dataset.t!=='sn'?'none':''});
 $('hv1').classList.toggle('on',!car);$('hv2').classList.toggle('on',car);
 {const I=car?['Honda Civic EK9','Type R · motor B16B',['VTEC 5.900 rpm','5 marchas','Corte 8.400 rpm']]:['Volvo FH16','Cavalo mecânico com carreta',['750 cv','I-Shift 12 marchas','Até 18 t']];const n=$('hvn');if(n){n.textContent=I[0];$('hvs').textContent=I[1];$('hch').innerHTML=I[2].map(x=>'<span>'+x+'</span>').join('')}}}
function vehSwitch(id){if(id===VSEL)return;if(id==='civic'&&!civBuild())return;
 VSEL=id;applyVeh(id);try{localStorage.setItem('fh16veh',id)}catch(e){}
 if(id==='civic'){if(job)cancelJob(true);setHitched(false);placeStart();autoBoard=false;vel.x=vel.z=0;fuel=FUELMAX;dmg=0;hpTab='cab'}
 else{reset();restoreG()}
 vehShow();hpDraw();hpFocusTab()}
/* giro das rodas do Civic do jogador (mesma convenção do tráfego: gira em y local) */
function civStep(dt,vf){if(!VEH.car)return;civFx(dt,vf);civSusp(dt);for(const q of CIVW){q.n.rotation.y+=q.s*(vf+(q.front?wsp*14:0)+(K.hb&&!q.front?-vf*.9:0))*dt/.29;if(q.sg)q.sg.quaternion.setFromAxisAngle(q.up,steer*.9+q.off)}}
$('hv1').onclick=()=>vehSwitch('truck');$('hv2').onclick=()=>{if(!civReady()){msg('Carregando o Civic…');return}vehSwitch('civic')};
/* ao carregar: usa a escolha anterior assim que o modelo do Civic ficar pronto */
(function waitCiv(){if(typeof ready==='undefined'||!ready){setTimeout(waitCiv,300);return}if(civReady())civBuild();else{setTimeout(waitCiv,300);return}
 let want='truck';try{want=localStorage.getItem('fh16veh')||'truck'}catch(e){}vehShow();if(want==='civic')vehSwitch('civic')})();

/* ===== luzes do Civic: posicionadas pela superfície real da malha (vértices do chassi) ===== */
function civGlowTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
function civLightsBuild(g,zmax){ /* coordenadas no espaço do veículo (eixo traseiro em z=0, frente = -z); g está deslocado em g.position.z */
 const pts=[],v=new THREE.Vector3();g.updateMatrixWorld(true);
 g.traverse(m=>{if(m.isMesh&&/CHASSIS/.test(m.material&&m.material.name||'')){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);pts.push(v.x,v.y,v.z)}}});
 const surf=(x,y,front)=>{let z=front?1e9:-1e9,n=0;for(let i=0;i<pts.length;i+=3){if(Math.abs(Math.abs(pts[i])-Math.abs(x))<.1&&Math.abs(pts[i+1]-y)<.08){const pz=pts[i+2];if(front?pz<z:pz>z)z=pz;n++}}return n?z:(front?-3.5:.7)},
  oz=g.position.z,tex=civGlowTex();
 /* padrões ajustados à mão pelo Cristiano no editor de luzes (espaço do veículo: eixo traseiro = 0, frente = -z) */
 LPDEF.civic={"headBeam":{"x":0.52,"y":0.58,"z":-3.29,"p":-5.2,"w":0,"r":0,"s":1,"m":1},"headGlow":{"x":0.52,"y":0.6,"z":-3.26,"p":0,"w":0,"r":0,"s":0.9,"m":1},"brake":{"x":0.67,"y":0.77,"z":0.58,"p":0,"w":180,"r":0,"s":0.8,"m":1},"rev":{"x":0.65,"y":0.76,"z":0.55,"p":0,"w":180,"r":0,"s":0.4,"m":1},"sigF":{"x":0.74,"y":0.62,"z":-3.16,"p":0,"w":0,"r":0,"s":0.42,"m":1},"sigR":{"x":0.76,"y":0.77,"z":0.537,"p":0,"w":180,"r":0,"s":0.42,"m":1},"exh":{"x":0.37,"y":0.24,"z":0.65,"p":5,"w":180,"r":0,"s":0.55,"m":0}};
 VP.civic.spot=[.52,.6,-3.26]}
act.beam=()=>{if(!lightsOn){msg('Ligue os faróis (L) primeiro');return}hiB=!hiB;msg(hiB?'Farol alto':'Farol baixo')};
/* ===== fumaça de pneu e marcas no asfalto (pool de sprites e de faixas) ===== */
var CFX=null;
function civFxInit(){const tex=civGlowTex(),SM=[],MK=[];
 for(let i=0;i<48;i++){const m=new THREE.SpriteMaterial({map:tex,color:0xdddddd,transparent:true,opacity:0,depthWrite:false,fog:true}),sp=new THREE.Sprite(m);sp.visible=false;sp.renderOrder=4;scene.add(sp);SM.push({sp,m,t:0,l:1,vy:0})}
 const gm=new THREE.PlaneGeometry(.24,.75);gm.rotateX(-Math.PI/2);
 for(let i=0;i<260;i++){const m=new THREE.MeshBasicMaterial({color:0x0a0a0a,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),me=new THREE.Mesh(gm,m);me.visible=false;me.renderOrder=3;me.frustumCulled=false;scene.add(me);MK.push({me,m,t:99})}
 CFX={SM,MK,si:0,mi:0,last:[null,null,null,null],acc:0}}
function civFxSmoke(x,y,z,a,c,vx,vy,vz,sz){const s=CFX.SM[CFX.si++%CFX.SM.length],ex=vx!==undefined;s.m.color.setHex(c||0xdddddd);s.t=0;s.l=.9+Math.random()*.7;s.vx=vx||0;s.vz=vz||0;s.vy=ex?vy:.5+Math.random()*.6;s.a=a;s.drift=ex;const j=ex?.04:.25;s.sp.position.set(x+(Math.random()-.5)*j,y+(ex?0:.15),z+(Math.random()-.5)*j);s.sp.visible=true;s.sz=sz||.8}
function civFxMark(x,z,h){const k=CFX.MK[CFX.mi++%CFX.MK.length];k.t=0;k.me.position.set(x,H(x,z)+.035,z);k.me.rotation.y=h;k.me.visible=true}
function civFx(dt,vf){if(!CFX){if(typeof scene==='undefined')return;civFxInit()}
 const fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd),hw=.72;
 const slide=Math.abs(slipS)>2.6&&Math.abs(vf)>5,drift=K.hb&&Math.abs(vf)>4,spin=wsp>.25,abs=absOn&&vf>6;
 const rear=drift||slide||spin?1:0,front=abs||(spin?1:0);
 const W=[[-hw,0],[hw,0],[-hw,L],[hw,L]]; /* [lateral, avanço]: traseiras e dianteiras */
 const on=[rear&&(drift||slide),rear&&(drift||slide),front,front];
 CFX.acc+=dt;
 for(let i=0;i<4;i++){const wx=pos.x+rx*W[i][0]+fx*W[i][1],wz=pos.z+rz*W[i][0]+fz*W[i][1],lw=CFX.last[i];
  if(!on[i]){CFX.last[i]=null;continue}
  if(!lw||Math.hypot(wx-lw[0],wz-lw[1])>.6){civFxMark(wx,wz,hd+(slide?Math.atan2(slipS,Math.max(1,vf))*.6:0));CFX.last[i]=[wx,wz]}
  if(CFX.acc>.04)civFxSmoke(wx,H(wx,wz),wz,.35+.25*Math.max(wsp,drift?1:0,Math.min(1,Math.abs(slipS)/6)))}
 if(CFX.acc>.04)CFX.acc=0;
 if(dmg>25&&Math.random()<dt*(2+dmg*.06)){const hx=pos.x+fx*(L+.5),hz=pos.z+fz*(L+.5);civFxSmoke(hx,H(hx,hz)+.75,hz,.3+Math.min(.3,dmg*.004),dmg>60?0x2a2a2a:0x9a9a9a)} /* capô soltando fumaça com a avaria */
}
function civFxPool(dt){if(!CFX)return; /* atualiza fumaça e marcas (serve ao Civic e ao caminhão) */
 for(const s of CFX.SM){if(!s.sp.visible)continue;s.t+=dt;const u=s.t/s.l;if(u>=1){s.sp.visible=false;continue}
  if(s.drift){const k=Math.max(0,1-dt*1.6);s.vx*=k;s.vz*=k;s.vy+=(.35-s.vy)*Math.min(1,dt*1.6);s.sp.position.x+=s.vx*dt;s.sp.position.z+=s.vz*dt}
  s.sp.position.y+=s.vy*dt;s.sz+=dt*(s.drift?1:1.8);s.sp.scale.set(s.sz,s.sz,1);s.m.opacity=s.a*(1-u)*(u<.1?u*10:1)}
 for(const k of CFX.MK){if(!k.me.visible)continue;k.t+=dt;if(k.t>22){k.me.visible=false;continue}k.m.opacity=.42*(k.t<18?1:(22-k.t)/4)}}

function civSusp(dt){const fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd),yr=H(pos.x,pos.z),yf=H(pos.x+fx*L,pos.z+fz*L),mx=pos.x+fx*2,mz=pos.z+fz*2,sl=(H(mx+rx*1.1,mz+rz*1.1)-H(mx-rx*1.1,mz-rz*1.1))/2.2,k=Math.min(1,dt*16);
 for(const q of CIVW){if(!q.tg)continue;const wx=pos.x+rx*q.lat+fx*q.al,wz=pos.z+rz*q.lat+fz*q.al,pl=yr+(yf-yr)*(q.al/L)+sl*q.lat,t=Math.max(-.1,Math.min(.12,H(wx,wz)-pl));
  q.dy+=(t-q.dy)*k;q.tg.position.copy(q.base).addScaledVector(q.upv,q.dy)}}
