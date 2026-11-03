// ---- tela inicial: só a carreta, com "Jogar" e "Pintar" (cabine, carreta e rodas) ----
window.HOME=true;document.body.classList.add('home');
const HP=[['Vermelho',0xd0392e],['Azul',0x2f6fc0],['Azul escuro',0x15306b],['Verde',0x3a9a4a],['Branco',0xf2f2ee],['Preto',0x16181c],['Grafite',0x4a4f55],['Prata',0xb8bec6],['Laranja',0xe07a22],['Amarelo',0xe8c020],['Roxo',0x8b4aa5],['Rosa',0xe0558a]];
let HPS={};try{HPS=JSON.parse(localStorage.getItem('fh16paint2'))||{}}catch(e){}
function hpSave(){try{localStorage.setItem('fh16paint2',JSON.stringify(HPS))}catch(e){}}
function paintTrl(h){TRLM[0].color.copy(C(h==null?0xe8a317:h));TRLM[1].color.copy(C(h==null?0xc98710:h)).multiplyScalar(h==null?1:.88)}
function paintRim(h){RIMP.forEach(m=>m.color.copy(h==null?C(0xffffff):C(h)))}
function hpApply(tab,h){if(tab==='cab'){cabPaint(TRUCKP,h);paintSave(h)}else if(tab==='trl'){paintTrl(h);HPS.t=h;hpSave()}else{paintRim(h);HPS.r=h;hpSave()}}
let hpTab='cab',hpInit=false,hpS=null,hpA=.6;
const hpCur=()=>{if(hpTab==='cab'){try{const v=localStorage.getItem('fh16paint');return v?+v:null}catch(e){return null}}return hpTab==='trl'?HPS.t:HPS.r};
function hpDraw(){const sw=$('hsw');sw.innerHTML='';const cur=hpCur();HP.forEach(([n,h])=>{const b=document.createElement('button');b.className='sw'+(cur===h?' on':'');b.title=n;b.style.background='#'+h.toString(16).padStart(6,'0');b.onclick=()=>{hpApply(hpTab,h);$('hcol').value=b.style.background&&'#'+h.toString(16).padStart(6,'0');hpDraw()};sw.appendChild(b)});
 document.querySelectorAll('#hpan .ht button').forEach(b=>b.classList.toggle('on',b.dataset.t===hpTab))}
document.querySelectorAll('#hpan .ht button').forEach(b=>b.onclick=()=>{hpTab=b.dataset.t;hpDraw()});
$('hcol').oninput=e=>{hpApply(hpTab,parseInt(e.target.value.slice(1),16));hpDraw()};
$('hrst').onclick=()=>{hpApply(hpTab,null);hpDraw()};
$('hpaint').onclick=()=>{$('hmain').style.display='none';$('hpan').style.display='block';hpDraw()};
$('hback').onclick=()=>{$('hpan').style.display='none';$('hmain').style.display='flex'};
$('hplay').onclick=()=>{try{audio()}catch(e){}window.HOME=false;cam.clearViewOffset();document.body.classList.remove('home');$('home').style.display='none';
 if(hpS){th=hpS.th;trl.visible=hpS.tv;if(cargoBox)cargoBox.visible=hpS.cb}hpS=null;orbYaw=orbPitch=0;zoom=1;accT=0;last=performance.now();camH=hd};
// pose de vitrine: usa a posição atual do caminhão, engata a carreta só visualmente e orbita a câmera
let hpAuto=true,hpF={k:'all',c:new THREE.Vector3(),d:24,P:.2,w:null},hpC=new THREE.Vector3(),hpD=24,hpInit2=false;const hpRC=new THREE.Raycaster(),hpV=new THREE.Vector2(),hpT=new THREE.Vector3();
$('hrot').onclick=()=>{hpAuto=!hpAuto;$('hrot').classList.toggle('on',hpAuto)};
function hpPick(e){hpV.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);hpRC.setFromCamera(hpV,cam);
 const hit=hpRC.intersectObjects([pivot,trl,...wh.map(w=>w.W)],true)[0];if(!hit)return{k:'all'};
 for(let o=hit.object;o;o=o.parent){const w=wh.find(x=>x.W===o);if(w)return{k:'wheel',o:w.W};const t=tS.find(x=>x.g===o);if(t)return{k:'wheel',o:t.g};if(o===trl)return{k:'trl'};if(o===pivot)return{k:'cab'}}return{k:'all'}}
{let d0=null;cv.addEventListener('pointerdown',e=>{if(window.HOME)d0={x:e.clientX,y:e.clientY,t:performance.now()}});
 cv.addEventListener('pointerup',e=>{if(!window.HOME||!d0)return;const m=Math.hypot(e.clientX-d0.x,e.clientY-d0.y),dt=performance.now()-d0.t;d0=null;if(m>6||dt>500)return;const r=hpPick(e);hpF.k=r.k;hpF.w=r.o||null;zoom=1;
  if($('hpan').style.display==='block'&&r.k!=='all'){hpTab=r.k==='cab'?'cab':r.k==='trl'?'trl':'rim';hpDraw()}})}
function hpAim(){const k=hpF.k;if(k==='cab'){pivot.localToWorld(hpT.set(0,1.9,-2.2));return[hpT,10,.22]}
 if(k==='trl'){trl.localToWorld(hpT.set(0,1.5,7));return[hpT,27,.25]}
 if(k==='wheel'&&hpF.w){hpF.w.getWorldPosition(hpT);return[hpT,4.8,.12]}
 hpT.set(pos.x+Math.sin(hd)*5,H(pos.x,pos.z)+1.8,pos.z+Math.cos(hd)*5);return[hpT,24,.2]}
function homeFrame(dt,now){if(!hpInit){hpInit=true;hpS={th,tv:trl.visible,cb:cargoBox?cargoBox.visible:false};if(HPS.t!=null)paintTrl(HPS.t);if(HPS.r!=null)paintRim(HPS.r);if(cargoBox)cargoBox.visible=false;orbYaw=0;orbPitch=0}
 th=hd;trl.visible=true;const yr=H(pos.x,pos.z);pivot.position.set(pos.x,yr,pos.z);pivot.rotation.set(0,hd,0);
 trl.position.set(pos.x,yr+.1,pos.z);trl.rotation.set(0,hd,0);spin=0;pivot.updateMatrixWorld(true);trl.updateMatrixWorld(true);updWheels();
 const[tc,td,tp]=hpAim();if(!hpInit2){hpInit2=true;hpC.copy(tc);hpD=td}const e=Math.min(1,dt*4);hpC.lerp(tc,e);hpD+=(td-hpD)*e;
 if(hpAuto)hpA+=dt*.18;const a=hpA+orbYaw,P=tp+Math.max(-.15,Math.min(.8,orbPitch)),d=hpD*zoom;
 cam.fov=40;{const W=innerWidth,Hh=innerHeight,pn=$('hpan').style.display==='block';if(pn)cam.setViewOffset(W,Hh,W>Hh*1.1?W*.2:0,W>Hh*1.1?0:Hh*.18,W,Hh);else cam.clearViewOffset()}cam.updateProjectionMatrix();
 cam.position.set(hpC.x+Math.sin(a)*d*Math.cos(P),Math.max(hpC.y+d*Math.sin(P),H(hpC.x,hpC.z)+.4),hpC.z+Math.cos(a)*d*Math.cos(P));cam.lookAt(hpC)}
