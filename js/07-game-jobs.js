// ---- entrega ----
const tgt={x:0,z:-200,y:0};let tLeft=0,score=0,nHit=0;
const beacon=new THREE.Mesh(new THREE.CylinderGeometry(6,6,90,24,1,true),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
const ring=new THREE.Mesh(new THREE.TorusGeometry(8,.4,8,32),new THREE.MeshBasicMaterial({color:0xffc400}));ring.rotation.x=Math.PI/2;scene.add(beacon,ring);
function newTarget(){ocx=1e9;cancelJob(true);setHitched(false)}
let mt=0;function msg(t){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(mt);mt=setTimeout(()=>m.style.opacity=0,2200)}

// ---- fretes ----
const CARGOS={agro:['Soja','Milho','Fertilizante','Farelo de trigo'],log:['Eletrônicos','Cargas diversas','Paletes','Bebidas'],aco:['Bobinas de aço','Vergalhões','Chapas de aço','Tubos'],comb:['Lubrificantes','Aditivos','Solventes','Parafina'],var:['Eletrodomésticos','Móveis','Alimentos','Roupas'],cons:['Cimento','Tijolos','Madeira','Cerâmica']};
var cargoCol=null,hitched=false,autoBoard=false;let job=null,deliveries=0,dd=0,dockT=0,promptCo=null,boardKeys=null;
const money=n=>'R$ '+Math.round(n).toLocaleString('pt-BR'),fmtT=t=>Math.floor(t/60)+' min '+String(Math.round(t%60)).padStart(2,'0')+' s';
score=2000;try{const sv=JSON.parse(localStorage.getItem('fh16save')||'null');if(sv){if(typeof sv.money==='number')score=sv.money;deliveries=sv.deliveries|0}}catch(e){}
let SAVED=null;try{SAVED=JSON.parse(localStorage.getItem('fh16save')||'null')}catch(e){}
function saveG(){if(typeof ready==='undefined'||!ready)return;try{const d={money:score,deliveries,dmg,x:pos.x,z:pos.z,hd,th,s:curS,hitched,cargo,tl:tLeft};
 if(job){const j={};for(const k in job)if(k!=='from'&&k!=='to'&&typeof job[k]!=='object')j[k]=job[k];j.fk=job.from.k;j.tk=job.to.k;j.nonce=job.from.nonce||0;d.job=j}
 localStorage.setItem('fh16save',JSON.stringify(d))}catch(e){}}
// restaura posição, carreta, frete e dano salvos (chamado após reset() no boot)
function restoreG(){const sv=SAVED;if(!sv||typeof sv.x!=='number'||typeof sv.z!=='number'||!isFinite(sv.x+sv.z+sv.hd+sv.th))return;
 try{pos.x=sv.x;pos.z=sv.z;hd=sv.hd;th=sv.th;camH=hd;vel.x=vel.z=0;curS=+sv.s||0;autoBoard=false;dmg=Math.max(0,+sv.dmg||0);tcx=1e9;ocx=1e9;
  const j=sv.job;if(j&&coGet(j.fk)&&coGet(j.tk)){const f=coGet(j.fk),t=coGet(j.tk);f.nonce=j.nonce|0;job=Object.assign({},j,{from:f,to:t});delete job.fk;delete job.tk;delete job.nonce;
   if(job.phase==='pickup'){f.spawn={slot:job.slot,name:job.name,tons:job.tons};setTargetP(f.slotK[job.slot],f.y)}
   else{setHitched(true);setTrailerCargo(job.name,job.tons);loadCargo(job.tons);tLeft=+sv.tl||job.limit;if(job.mode==='park')setPark(t,job.toBay);else{job.mode='';job.asked=false;setTargetP(t.board,t.y)}}}
  else if(sv.hitched){setHitched(false)}}catch(e){}}
setInterval(saveG,4000);addEventListener('pagehide',saveG);addEventListener('beforeunload',saveG);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveG()});
beacon.visible=ring.visible=false;
function loadCargo(t){cargo=t;MASS=hitched?16000+t*1000:11000;setCont()}
function setHitched(v){hitched=v;trl.visible=v;if(!v){th=hd;wT=0;cargo=0;setTrailerCargo(null)}MASS=v?16000+cargo*1000:11000;setCont()}
function placeStart(){const c=coGet(0),q=c.loc(BZ_X,0);pos.x=q.x;pos.z=q.z;hd=Math.atan2(-Math.cos(c.rot),Math.sin(c.rot));th=hd;camH=hd;curS=0;autoBoard=true}
function setTargetP(q,y){tgt.x=q.x;tgt.z=q.z;tgt.y=y;beacon.position.set(q.x,y+45,q.z);ring.position.set(q.x,y+.6,q.z);beacon.visible=ring.visible=true;ocx=1e9}
function setTarget(c,bi){if(!c){beacon.visible=ring.visible=false;return}const q=c.loc(10,c.bays[bi].lz);tgt.x=q.x;tgt.z=q.z;tgt.y=c.y;beacon.position.set(q.x,c.y+45,q.z);ring.position.set(q.x,c.y+.6,q.z);beacon.visible=ring.visible=true;ocx=1e9}
// ---- destaque da vaga de estacionamento na doca (tamanho real da carreta) ----
const PBW=13.6,PBH=2.6,PREAR=11.5,PCEN=PREAR-PBW/2+.1;
const pbox=new THREE.Group(),pbFill=new THREE.Mesh(new THREE.PlaneGeometry(PBW,PBH),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
const pbShape=new THREE.Shape(),pbHole=new THREE.Path(),bw=PBW/2+.18,bh=PBH/2+.18,iw=PBW/2-.04,ih=PBH/2-.04;
pbShape.moveTo(-bw,-bh);pbShape.lineTo(bw,-bh);pbShape.lineTo(bw,bh);pbShape.lineTo(-bw,bh);pbShape.closePath();pbHole.moveTo(-iw,-ih);pbHole.lineTo(-iw,ih);pbHole.lineTo(iw,ih);pbHole.lineTo(iw,-ih);pbHole.closePath();pbShape.holes.push(pbHole);
const pbEdge=new THREE.Mesh(new THREE.ShapeGeometry(pbShape),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.95,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
pbFill.rotation.x=pbEdge.rotation.x=-Math.PI/2;pbEdge.position.y=.01;pbox.add(pbFill,pbEdge);pbox.visible=false;scene.add(pbox);
function endPark(){pbox.visible=false}
function setPark(c,bi){const q=c.loc(PCEN,c.bays[bi].lz);tgt.x=q.x;tgt.z=q.z;tgt.y=c.y;beacon.position.set(q.x,c.y+45,q.z);beacon.visible=true;ring.visible=false;
 pbox.position.set(q.x,c.y+.12,q.z);pbox.rotation.y=c.rot;pbox.visible=true;ocx=1e9}
function dockErr(c,bi){const rx=pos.x+14.2*Math.sin(th),rz=pos.z+14.2*Math.cos(th),dx=rx-c.x,dz=rz-c.z,cr=Math.cos(c.rot),sr=Math.sin(c.rot),lx=dx*cr-dz*sr,lz=dx*sr+dz*cr,tt=Math.atan2(cr,-sr);
 return{ex:Math.abs(lx-PREAR),el:Math.abs(lz-c.bays[bi].lz),ea:Math.abs(wrap(th-tt))}}
function offersFor(c){const n=c.nonce||0,offs=[-3,-2,-1,1,2,3,4],st=Math.floor(hh(c.k,n,21)*7),list=[],cl=CARGOS[c.t.id];
 for(let i=0;i<4;i++){const to=coGet(c.k+offs[(st+i*2)%7]),name=cl[Math.floor(hh(c.k,n*4+i,22)*cl.length)],tons=[6,12,18][Math.floor(hh(c.k,n*4+i,23)*3)],dm=Math.abs(to.s-c.s),km=dm/1000;
  list.push({from:c,to,name,tons,dist:dm,reward:Math.round((600+km*(300+tons*45))/10)*10,limit:dm/15+70,slot:i,col:slotCol(c,i),toBay:(i+1)%3})}
 return list}
function cmShow(t,p,btns,foot){$('cmt').textContent=t;$('cmp').textContent=p;const g=$('cmg');g.innerHTML='';
 btns.forEach(b=>{const e=document.createElement('button');e.innerHTML=b.html;e.addEventListener('pointerdown',ev=>{audio();ev.preventDefault();b.fn()});g.appendChild(e)});
 boardKeys=btns.map(b=>b.fn);$('cmf').textContent=foot||'';menuOpen=true;for(const k in K)K[k]=false;$('cm').style.display='flex'}
function closeCm(){menuOpen=false;boardKeys=null;$('cm').style.display='none'}
function boardKey(i){if(boardKeys&&boardKeys[i])boardKeys[i]()}
function yardCo(){let b=null,bd=1e9;for(const c of COACT){const d=Math.hypot(pos.x-c.board.x,pos.z-c.board.z);if(d<6.5&&d<bd){bd=d;b=c}}return b}
function openBoard(){if(Math.hypot(vel.x,vel.z)>1){msg('Pare o caminhão');return}
 const c=yardCo();if(!c){msg('Pare no ponto amarelo entre os cones');return}
 if(job&&job.phase==='deliver'&&job.mode!=='park'&&c===job.to){deliverMenu();return}
 if(job){cmShow('Frete em andamento',job.name+' · '+job.tons+' t · '+job.from.name+' → '+job.to.name,[{html:'<b>Continuar</b>',fn:closeCm},{html:'<b>Cancelar frete</b><span>-R$ 300</span><small>Perde a carga</small>',fn:()=>cancelJob(false)}],'');return}
 const btns=offersFor(c).map(o=>({html:'<b>'+o.name+' · '+o.tons+' t</b><span>'+money(o.reward)+'</span><small>→ '+o.to.name+' ('+o.to.city+') · '+(o.dist/1000).toFixed(1)+' km · prazo '+fmtT(o.limit)+'</small>',fn:()=>acceptJob(o)}));
 if(dmg>1){const cost=Math.round(dmg*30);btns.push({html:'<b>Oficina</b><span>'+money(cost)+'</span><small>Reparar '+Math.round(dmg)+'% de dano</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;dmg=0;saveG();closeCm();msg('Caminhão reparado')}})}
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(c.name,c.t.label+' · '+c.city+' · '+money(score),btns,'Toque, clique ou tecle 1–'+btns.length)}
function acceptJob(o){job=Object.assign({phase:'pickup'},o);o.from.nonce=(o.from.nonce||0)+1;dockT=0;o.from.spawn={slot:o.slot,name:o.name,tons:o.tons};{const gp=COG.get(o.from.k);if(gp){const t=gp.userData.slots[o.slot];t.visible=true;setTrCargo(t,o.name,o.tons)}}setTargetP(o.from.slotK[o.slot],o.from.y);ocx=1e9;closeCm();msg('Frete aceito · dê ré até o anel, cabine virada para fora da carreta')}
function cancelJob(free){if(!job)return;if(job.phase==='pickup'){const f=job.from;f.spawn=null;const gp=COG.get(f.k);if(gp)gp.userData.slots[job.slot].visible=false}else setHitched(false);endPark();job=null;loadCargo(0);setTarget(null);if(!free)score=Math.max(0,score-300);saveG();closeCm();msg(free?'Frete cancelado':'Frete cancelado · -R$ 300')}
function jobLabel(){return job?(job.phase==='pickup'?'Engatar '+job.name+' · '+job.from.name:'Entregar '+job.tons+' t · '+job.to.name):'Sem frete · vá a uma empresa'}
function hitchOk(c,sl){const K=c.slotK[sl],bd=Math.sign(SLOT_Z[sl]),b=[bd*Math.sin(c.rot),bd*Math.cos(c.rot)];return Math.hypot(pos.x-K.x,pos.z-K.z)<3.5&&Math.hypot(vel.x,vel.z)<1.2&&(-Math.sin(hd)*b[0]-Math.cos(hd)*b[1])<-.82}
function dockOk(c,bi){const rx=pos.x+14.2*Math.sin(th),rz=pos.z+14.2*Math.cos(th),dx=rx-c.x,dz=rz-c.z,cr=Math.cos(c.rot),sr=Math.sin(c.rot),lx=dx*cr-dz*sr,lz=dx*sr+dz*cr,tt=Math.atan2(cr,-sr);
 return lx>9&&lx<14&&Math.abs(lz-c.bays[bi].lz)<1.7&&Math.abs(wrap(th-tt))<.14&&Math.hypot(vel.x,vel.z)<1.2}
function completeDock(){dockT=0;const j=job;
 if(j.phase==='pickup'){j.from.spawn=null;const gp=COG.get(j.from.k);if(gp)gp.userData.slots[j.slot].visible=false;setHitched(true);setTrailerCargo(j.name,j.tons);loadCargo(j.tons);j.phase='deliver';j.mode='';j.asked=false;tLeft=j.limit;j.dmg0=dmg;setTargetP(j.to.board,j.to.y);msg('Carga a bordo · siga até o ponto amarelo de '+j.to.name);return}
 finishDeliver(false)}
function leaveTrailerBay(c,bi){const gp=COG.get(c.k);if(!gp)return;const t=mkTrailer(gp,PCEN,c.bays[bi].lz,1);t.rotation.y=Math.atan2(c.cr,-c.sr)-c.rot}
function finishDeliver(fast){dockT=0;const j=job,c=j.to,e=dockErr(c,j.toBay);endPark();
 const inc=Math.max(0,dmg-j.dmg0),pen=Math.min(.6,inc*.012),late=tLeft<0;
 let r=j.reward*(1-pen);if(late)r*=Math.max(.5,1+tLeft/300);let bonus=0,pb=0,acc=0;
 if(fast)r*=.8;else{if(!late&&tLeft>j.limit*.4)bonus=Math.round(j.reward*.1);acc=Math.max(0,1-(.4*e.el/1.7+.3*e.ea/.14+.3*e.ex/2.5));pb=Math.round(j.reward*.15*acc/10)*10}
 r=Math.round(r);score+=r+bonus+pb;deliveries++;saveG();
 if(fast)leaveTrailerBay(c,j.toBay);else leaveTrailer(c);job=null;setHitched(false);loadCargo(0);setTarget(null);
 cmShow('Entrega concluída',c.name+' · '+j.name+' · '+j.tons+' t',[{html:'<b>Pagamento</b><span>'+money(r+bonus+pb)+'</span><small>Base '+money(j.reward)+(fast?' · entrega rápida 80%':'')+(inc>0?' · dano -'+Math.round(pen*100)+'%':'')+(late?' · atraso':'')+(bonus?' · pontualidade '+money(bonus):'')+(pb?' · precisão '+Math.round(acc*100)+'% '+money(pb):'')+'</small>',fn:closeCm},{html:'<b>Continuar</b><small>Saldo '+money(score)+'</small>',fn:closeCm}],'')}
function deliverMenu(){const j=job,fast=Math.round(j.reward*.8);
 cmShow('Entrega · '+j.to.name,j.name+' · '+j.tons+' t',[
  {html:'<b>Entregar agora</b><span>'+money(fast)+'</span><small>A carreta é solta na doca · 80% do valor, sem bônus</small>',fn:()=>{closeCm();finishDeliver(true)}},
  {html:'<b>Manobrar e estacionar</b><span>'+money(j.reward)+' + até '+money(Math.round(j.reward*.15/10)*10)+'</span><small>Ré até o retângulo no chão · bônus de precisão e pontualidade</small>',fn:()=>{j.mode='park';closeCm();setPark(j.to,j.toBay);msg('Dê ré até o retângulo · carreta exatamente dentro dele')}},
  {html:'<b>Continuar</b><small>Esc</small>',fn:closeCm}],'Toque, clique ou tecle 1–3')}
function jobFrame(dt){ring.rotation.z+=dt;
 if(job){const pk=job.phase==='pickup',c=pk?job.from:job.to;
  if(job.phase==='deliver')tLeft-=dt;
  dd=Math.hypot(tgt.x-pos.x,tgt.z-pos.z);const k=Math.min(3,Math.max(.55,dd/70));beacon.scale.set(k,1,k);ring.scale.setScalar(k);
  if(job.phase==='deliver'&&job.mode!=='park'){const yc=yardCo();if(yc!==job.to)job.asked=false;else if(!job.asked&&!menuOpen&&Math.hypot(vel.x,vel.z)<1){job.asked=true;deliverMenu()}dockT=0}
  else{const ok=pk?hitchOk(c,job.slot):dockOk(c,job.toBay);
   if(!pk){const e=dockErr(c,job.toBay),near=e.ex<4.5&&e.el<3.2&&e.ea<.35;pbFill.material.color.setHex(ok?0x38e06a:near?0xffc400:0xff4a3a);pbEdge.material.color.copy(pbFill.material.color);pbFill.material.opacity=.28+.35*Math.min(1,dockT/.9)}
   if(ok){if(dockT===0)msg('Mantenha parado…');dockT+=dt;if(dockT>.9)completeDock()}else dockT=0}}
 else{if(autoBoard&&!menuOpen){const y0=yardCo();if(y0&&Math.hypot(vel.x,vel.z)<1){autoBoard=false;openBoard()}}
  let b=null,bd=1e18;const k0=Math.floor(curS/CO_D);for(let k=k0-1;k<=k0+2;k++){const c=coGet(k),d=Math.abs(c.s-curS);if(d<bd){bd=d;b=c}}
  if(b){const q=b.loc(0,0);tgt.x=q.x;tgt.z=q.z}dd=Math.hypot(tgt.x-pos.x,tgt.z-pos.z);
  const yc=yardCo();if(yc&&Math.hypot(vel.x,vel.z)<.8){if(promptCo!==yc){promptCo=yc;msg('G ou 📦 · quadro de fretes')}}else if(!yc)promptCo=null}}


