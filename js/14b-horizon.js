/* ===== Horizonte em camadas (parallax): morros e ilhas além da névoa =====
   3 cilindros abertos com silhueta periódica desenhada em canvas (sem imagens externas). Acompanham a câmera; cada camada gira um pouco
   menos que a anterior (curvas) e desliza devagar com o deslocamento, o que dá a sensação de profundidade. Cor = névoa + tom por hora do dia. */
const HZ={L:[],acc:0,prev:null,trav:0,d:new THREE.Vector3()};
{const TW=2048,TH=128,TAU=Math.PI*2;
 const ridge=(th,F,A,P)=>{let v=0,s=0;for(let j=0;j<F.length;j++){v+=A[j]*Math.sin(F[j]*th+P[j]);s+=A[j]}return(v/s+1)/2};
 const isl=(th,I)=>{let m=0;for(const[c,w,h]of I){let d=Math.abs(((th-c+Math.PI*3)%TAU)-Math.PI);m=Math.max(m,h*Math.exp(-(d/w)*(d/w)))}return m};
 const mk=(fn)=>{const c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');const col=new Float32Array(TW);for(let x=0;x<TW;x++)col[x]=fn(x/TW*TAU);
  for(let x=0;x<TW;x++){const top=TH*(1-col[x]);const gr=g.createLinearGradient(0,top,0,TH);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.55,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x,top,1,TH-top+1)}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return t};
 const CFG=[
  {R:390,h:72,base:-14,k:.00035,yk:.07,tone:0x2f5a58,mix:.78,tex:()=>mk(th=>.12+.78*Math.pow(ridge(th,[3,7,13,29,53],[.5,.3,.16,.08,.04],[.4,1.9,.7,2.6,1.1]),1.4))},
  {R:415,h:92,base:-14,k:.00022,yk:.04,tone:0x3f7078,mix:.56,tex:()=>mk(th=>.1+.8*Math.pow(ridge(th,[2,5,11,23,41],[.55,.3,.18,.09,.05],[2.2,.3,1.4,.9,2.8]),1.6))},
  {R:440,h:60,base:-14,k:.0001,yk:.02,tone:0x5b8ba6,mix:.36,tex:()=>mk(th=>.05+.9*isl(th,[[.6,.22,.55],[1.5,.12,.35],[2.3,.3,.7],[3.4,.16,.4],[4.2,.26,.6],[5.1,.1,.3],[5.8,.2,.45]]))}];
 for(const c of CFG){const m=new THREE.Mesh(new THREE.CylinderGeometry(c.R,c.R,c.h,72,1,true),new THREE.MeshBasicMaterial({map:c.tex(),transparent:true,depthWrite:false,fog:false,side:THREE.BackSide}));
  m.frustumCulled=false;m.renderOrder=-.5;scene.add(m);HZ.L.push({m,c,tone:new THREE.Color(c.tone)})}}
function hzTint(hor,day){for(const o of HZ.L){const t=o.tone.clone().multiplyScalar(.28+.72*day);o.m.material.color.copy(hor).lerp(t,o.c.mix*(.45+.55*day))}}
function hzFrame(dt,speed){const on=typeof GS!=='undefined'&&GS.hz!==false&&camMode!==3;for(const o of HZ.L)o.m.visible=on;if(!on)return;
 const d=HZ.d;cam.getWorldDirection(d);const yaw=Math.atan2(d.x,d.z);if(HZ.prev!==null){let q=yaw-HZ.prev;q=Math.atan2(Math.sin(q),Math.cos(q));HZ.acc+=q}HZ.prev=yaw;HZ.trav+=Math.abs(speed||0)*dt;
 for(const o of HZ.L){const c=o.c;o.m.position.set(cam.position.x,cam.position.y+c.base+c.h/2,cam.position.z);o.m.rotation.y=-HZ.acc*c.yk+HZ.trav*c.k}}
hzTint(dome.material.uniforms.hor.value,dome.material.uniforms.day.value);
