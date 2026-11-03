/* ===== Carga: contêiner 40' (aparece quando há carga; cor sorteada a cada entrega) ===== */
var cargoBox=null,cbMats=[];const CBCOL=[0x1f5fa8,0xb3261e,0x2e7d32,0xd9822b,0x4a5560,0x7a3b8c,0xc9b037];
function setCont(){if(!cargoBox)return;cargoBox.visible=false;if(cargo>0){const c=C(CBCOL[cargoCol!=null?cargoCol:Math.floor(Math.random()*CBCOL.length)]);cbMats.forEach(m=>m.color.copy(c))}}
try{const tex=(w,h,fn,rx,ry)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t},
 rib=(rx)=>tex(32,8,(g,w,h)=>{for(let x=0;x<w;x++){const v=Math.round(255*(.8+.2*Math.sin(x/w*6.2832)));g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(x,0,1,h)}},rx,1),
 door=tex(256,256,(g,w,h)=>{g.fillStyle='#d6d6d6';g.fillRect(0,0,w,h);g.fillStyle='#8c8c8c';for(const x of[30,76,180,226])g.fillRect(x-3,10,6,h-20);g.fillRect(0,0,w,10);g.fillRect(0,h-10,w,10);g.fillStyle='#555';g.fillRect(w/2-1.5,0,3,h);for(const x of[60,196])g.fillRect(x,120,18,6)},1,1),
 mk=t=>{const m=new THREE.MeshStandardMaterial({color:C(0x1f5fa8),map:t,roughness:.7,metalness:.3});cbMats.push(m);return m},
 dk=new THREE.MeshStandardMaterial({color:C(0x15181c),roughness:.8,metalness:.3}),side=mk(rib(40)),
 box=new THREE.Mesh(new THREE.BoxGeometry(2.44,2.59,12.2),[side,side,mk(rib(8)),dk,mk(door),mk(rib(8))]);
 cargoBox=new THREE.Group();box.position.set(0,3.195,7.1);box.castShadow=box.receiveShadow=true;cargoBox.add(box);
 for(const x of[-1.1,1.1])for(const z of[1.12,13.08])for(const y of[1.99,4.4]){const f=new THREE.Mesh(new THREE.BoxGeometry(.26,.18,.26),dk);f.position.set(x,y,z);f.castShadow=true;cargoBox.add(f)}
 trl.add(cargoBox);setCont()}catch(e){console.warn('container',e)}
const SA=new THREE.Vector3(),SB=new THREE.Vector3(),SD=new THREE.Vector3(),SZ=new THREE.Vector3(0,0,1);
function suspLink(m,a,b,xz){SD.copy(b).sub(a);const L=SD.length()||.01;m.position.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);SD.multiplyScalar(1/L);m.quaternion.setFromUnitVectors(m.userData.ax,SD);m.scale.set(xz,m.userData.ax.z?1:L,m.userData.ax.z?L:1);if(m.userData.ax.z)m.scale.set(1,1,L);else m.scale.set(xz,L,xz)}
/* suspensão independente por roda: braço oscilante + mola + amortecedor; cada roda segue o terreno sozinha */
function susp(o,dt,sT,cT,yk){const wx=pos.x+o.cx*cT+o.z*sT,wz=pos.z-o.cx*sT+o.z*cT,r=tipSg*tipS*.28+rollT,body=yk+.1+o.cx*Math.sin(r)-o.z*Math.sin(pitchT),nom=o.cy-.1;
 const tg=Math.max(nom-.24,Math.min(nom+.2,H(wx,wz)+o.cy-body));o.y+=(tg-o.y)*Math.min(1,dt*16);o.g.position.y=o.y;
 const s=o.s,P=SA.set(s*.5,.95,o.z-.75),Hb=SB.set(s*.55,o.y,o.z);suspLink(o.arm,P,Hb,1);
 const A=SA.set(s*.4,P.y+(Hb.y-P.y)*.8+.04,o.z-.15),B=SB.set(s*.4,1.25,o.z-.15);suspLink(o.coil,A,B,.8);
 A.z+=.14;B.z+=.14;suspLink(o.dmp,A,B,1)}
function trailerStep(dt){if(!hitched){th=hd;wT=0;rollT=0;vTp=0;decS=0;return}const sT=Math.sin(th),cT=Math.cos(th),vkl=vel.x*cT-vel.z*sT,vkf=-(vel.x*sT+vel.z*cT),r=(7000+cargo*1000)/(23000+cargo*1000);
 // yaw ideal (sem escorregar) x yaw real: limitado pelo atrito do eixo da carreta (freio de mão trava a carreta)
 const wD=-vkl/TLEN,mu=(onRoad?.8:.5)*(K.hb?.4:1)*(1-.3*Math.min(1,tipS)),aM=mu*17.6/TLEN/(1+.02*cargo);
 wT+=Math.max(-aM*dt,Math.min(aM*dt,(wD-wT)*Math.min(1,dt*9/(1+.04*cargo))));th+=wT*dt;
 const lag=wD-wT,slip=Math.abs(lag)*TLEN;
 // reação na quinta roda: a carreta empurra/puxa a traseira do caminhão
 yawKick=Math.max(-1.5,Math.min(1.5,yawKick+lag*r*7*dt));
 const dec=vTp>0&&vkf>.5?Math.max(0,Math.min(9,(vTp-vkf)/dt)):0;vTp=vkf;decS+=(dec-decS)*Math.min(1,dt*8);
 let f=th-hd;f=Math.atan2(Math.sin(f),Math.cos(f));
 yawKick=Math.max(-1.5,Math.min(1.5,yawKick-(7000+cargo*1000)*decS*Math.sin(f)*2.5/85000*dt)); // frenagem: carreta empurra (risco de jackknife)
 if(slip>1.5){const k=Math.exp(-.15*Math.min(slip,4)*dt);vel.x*=k;vel.z*=k;if(skMsg<=0&&Math.abs(vkf)>8){msg('Carreta derrapando!');skMsg=3}}
 rollT+=(-wT*vkf*.008-rollT)*Math.min(1,dt*6);
 if(Math.abs(f)>1.85){th=hd+Math.sign(f)*1.85;wT*=.2;vel.x*=Math.exp(-3*dt);vel.z*=Math.exp(-3*dt);if(jkMsg<=0){msg('Jackknife!');jkMsg=3}}
 if(jkMsg>0)jkMsg-=dt;if(skMsg>0)skMsg-=dt}
function rollover(dt,lat){const aR=9.8*(.77-.017*cargo),ex=(Math.abs(lat)-aR)/aR;
 if(ex>0){tipS+=ex*.5*dt;tipSg=-Math.sign(lat)}else tipS=Math.max(0,tipS-.8*dt);
 if(tipS>.5&&tipS<.52)msg('Risco de tombamento! Reduza a velocidade');
 if(tipS>=1){tipS=0;vel.x=vel.z=0;th=hd;wT=0;dmg=Math.min(100,dmg+20);tLeft-=5;msg('Tombou! -5 s')}}
