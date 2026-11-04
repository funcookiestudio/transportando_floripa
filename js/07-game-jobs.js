// ---- entrega ----
const tgt={x:0,z:-200,y:0};let tLeft=0,score=0,nHit=0;
const beacon=new THREE.Mesh(new THREE.CylinderGeometry(6,6,90,24,1,true),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
const ring=new THREE.Mesh(new THREE.TorusGeometry(8,.4,8,32),new THREE.MeshBasicMaterial({color:0xffc400}));ring.rotation.x=Math.PI/2;scene.add(beacon,ring);
function newTarget(){ocx=1e9;cancelJob(true);setHitched(false)}
let mt=0;function msg(t){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(mt);mt=setTimeout(()=>m.style.opacity=0,2200)}

// ---- fretes ----
const CARGOS={agro:['Soja','Milho','Trigo','Arroz em casca','Açúcar a granel','Farelo de soja','Fertilizante granulado','Ração a granel'],log:['Eletrônicos','Cargas diversas','Paletes','Bebidas'],aco:['Bobinas de aço','Vergalhões de aço','Vigas metálicas','Chapas de aço','Tubos'],comb:['Lubrificantes','Aditivos','Solventes','Parafina'],var:['Eletrodomésticos','Móveis','Alimentos','Roupas'],cons:['Cimento ensacado','Cimento a granel','Areia','Brita','Terra e cascalho','Tijolos','Blocos de concreto','Madeira serrada','Troncos de madeira','Telhas','Tubos de PVC','Estruturas pré-moldadas']};
/* cargas antigas removidas: cada tipo de empresa oferece só cargas com modelo novo (HEAVY); tipos sem modelo usam as de construção */
{const hv=n=>typeof HEAVY!=='undefined'&&HEAVY[n];CARGOS.cons=CARGOS.cons.filter(hv);for(const k in CARGOS)if(k!=='cons'){const l=CARGOS[k].filter(hv);CARGOS[k]=l.length?l:CARGOS.cons.slice()}}
var cargoCol=null,hitched=false,autoBoard=false;let job=null,deliveries=0,dd=0,dockT=0,promptCo=null,boardKeys=null;
const money=n=>'R$ '+Math.round(n).toLocaleString('pt-BR'),fmtT=t=>Math.floor(t/60)+' min '+String(Math.round(t%60)).padStart(2,'0')+' s';
score=2000;try{const sv=JSON.parse(localStorage.getItem(SAVEKEY)||'null');if(sv){if(typeof sv.money==='number')score=sv.money;deliveries=sv.deliveries|0}}catch(e){}
var RESTY=null;let SAVED=null;try{SAVED=JSON.parse(localStorage.getItem(SAVEKEY)||'null')}catch(e){}
function saveG(){if(typeof ready==='undefined'||!ready||VEH.car)return; /* Civic não grava: preserva o jogo da carreta */try{const d={money:score,deliveries,dmg,fuel,x:pos.x,z:pos.z,y:HREF>-1e5&&HREF<1e5?Math.round(HREF*100)/100:undefined,hd,th,s:curS,hitched,cargo,tl:tLeft,vis:window.GRVIS?[...GRVIS].slice(-400):undefined};
 if(job){const j={};for(const k in job)if(k!=='from'&&k!=='to'&&typeof job[k]!=='object')j[k]=job[k];j.fk=job.from.k;j.tk=job.to.k;j.v=2;j.nonce=job.from.nonce||0;d.job=j}
 localStorage.setItem(SAVEKEY,JSON.stringify(d))}catch(e){}}
// reiniciar (R/↺): volta à empresa mais próxima mantendo frete e carreta engatada; sem carga, o menu de fretes abre ali
function respawn(){if(!ready){reset();return}
 let b=null,bd=1e18;
 if(window.GRID_ON){b=gridNearVisited();if(!b){gridStart();msg('Voltou ao início');return}bd=Math.hypot(b.x-pos.x,b.z-pos.z)}
 else{const k0=Math.floor(curS/CO_D);for(let k=k0-2;k<=k0+3;k++){const c=coGet(k),d=Math.abs(c.s-curS);if(d<bd){bd=d;b=c}}}
 const km=bd/1000,cost=bd<60?0:Math.round((200+km*120)/10)*10;
 if(!cost){doRespawn(b,0);return}
 cmShow('Chamar o guincho','Levar o caminhão até '+b.name+' ('+b.city+') · '+km.toFixed(1)+' km',[{html:'<b>Confirmar</b><span>'+money(Math.min(cost,score))+'</span><small>'+(score<cost?'Saldo insuficiente: cobra o que você tem':'Taxa por distância · frete e carreta engatada vão junto')+'</small>',fn:()=>doRespawn(b,cost)},{html:'<b>Cancelar</b><small>Esc</small>',fn:closeCm}],'Taxa: R$ 200 + R$ 120 por km')}
function doRespawn(b,cost){const paid=Math.min(cost,score);score-=paid;
 const q=b.loc(BZ_X,0);pos.x=q.x;pos.z=q.z;hd=Math.atan2(b.cr,-b.sr);camH=hd;curS=b.s;vel.x=vel.z=0;steer=0;wT=0;rollT=0;vTp=0;decS=0;tipS=0;dmg=0;yawKick=0;gear=0;eRpm=650;engineOn=true;engCrank=0;shiftT=0;thrS=0;brkP=0;
 hb=null;th=hd;autoBoard=!job&&!hitched;tcx=1e9;ocx=1e9;closeCm();saveG();msg((job?'Guincho · frete mantido':'Guincho')+(paid?' · -'+money(paid):''))}
// restaura posição, carreta, frete e dano salvos (chamado após reset() no boot)
function restoreG(){if(window.GRID_ON&&!window.gridCoBase){window.__rgPending=true;return}const sv=SAVED;if(!sv||typeof sv.x!=='number'||typeof sv.z!=='number'||!isFinite(sv.x+sv.z+sv.hd+sv.th))return;
 try{pos.x=sv.x;pos.z=sv.z;hd=sv.hd;th=sv.th;camH=hd;vel.x=vel.z=0;curS=+sv.s||0;autoBoard=false;dmg=Math.max(0,+sv.dmg||0);fuel=typeof sv.fuel==='number'?Math.max(0,Math.min(FUELMAX,sv.fuel)):FUELMAX;tcx=1e9;ocx=1e9;if(typeof sv.y==='number'&&isFinite(sv.y)&&sv.y>-1e5&&sv.y<1e5){HREF=sv.y;RESTY={y:sv.y,t:6}}
  const j=window.GRID_ON&&sv.job&&sv.job.v!==2&&!(window.gridKeyOk&&gridKeyOk(sv.job.fk)&&gridKeyOk(sv.job.tk))?null:sv.job;if(j&&coGet(j.fk)&&coGet(j.tk)){const f=coGet(j.fk),t=coGet(j.tk);f.nonce=j.nonce|0;job=Object.assign({},j,{from:f,to:t});delete job.fk;delete job.tk;delete job.nonce;
   if(job.phase==='pickup'){f.spawn={slot:job.slot,name:job.name,tons:job.tons};setTargetP(f.slotK[job.slot],f.y);beacon.visible=false}
   else{setHitched(true);gearSnap(1);setTrailerCargo(job.name,job.tons);loadCargo(job.tons);tLeft=+sv.tl||job.limit;if(job.mode==='park')setPark(t,job.toBay);else{job.mode='';job.asked=false;setTargetP(t.board,t.y)}}}
  else if(sv.hitched){setHitched(false)}}catch(e){}}
setInterval(saveG,4000);addEventListener('pagehide',saveG);addEventListener('beforeunload',saveG);document.addEventListener('visibilitychange',()=>{if(document.hidden)saveG()});
beacon.visible=ring.visible=false;
function loadCargo(t){cargo=t;MASS=hitched?VEH.mh+t*1000:VEH.m0;setCont()}
let hb=null,navCo=null; // acoplamento suave: a carreta mantém a pose parada e só encosta no caminhão aos poucos
function setHitched(v){const was=hitched;hb=null;hitched=v;trl.visible=v;if(v){if(!was)gearHitch(true)}else gearHitch(false);if(!v){th=hd;wT=0;cargo=0;setTrailerCargo(null)}MASS=v?VEH.mh+cargo*1000:VEH.m0;setCont()}
function placeStart(){if(window.GRID_ON){if(window.gridStart)gridStart();return}const c=coGet(0),q=c.loc(BZ_X,0);pos.x=q.x;pos.z=q.z;hd=Math.atan2(c.cr,-c.sr);th=hd;camH=hd;curS=0;autoBoard=true}
function setTargetP(q,y){tgt.x=q.x;tgt.z=q.z;tgt.y=y;beacon.position.set(q.x,y+45,q.z);ring.position.set(q.x,y+.6,q.z);beacon.visible=ring.visible=true;ocx=1e9}
function setTarget(c,bi){if(!c){beacon.visible=ring.visible=false;return}const q=c.loc(10,c.bays[bi].lz);tgt.x=q.x;tgt.z=q.z;tgt.y=c.y;beacon.position.set(q.x,c.y+45,q.z);ring.position.set(q.x,c.y+.6,q.z);beacon.visible=ring.visible=true;ocx=1e9}
// ---- destaque da vaga de estacionamento na doca (tamanho real da carreta) ----
const pbox=new THREE.Group(),pbFill=new THREE.Mesh(new THREE.PlaneGeometry(PBW,PBH),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
const pbShape=new THREE.Shape(),pbHole=new THREE.Path(),bw=PBW/2+.18,bh=PBH/2+.18,iw=PBW/2-.04,ih=PBH/2-.04;
pbShape.moveTo(-bw,-bh);pbShape.lineTo(bw,-bh);pbShape.lineTo(bw,bh);pbShape.lineTo(-bw,bh);pbShape.closePath();pbHole.moveTo(-iw,-ih);pbHole.lineTo(-iw,ih);pbHole.lineTo(iw,ih);pbHole.lineTo(iw,-ih);pbHole.closePath();pbShape.holes.push(pbHole);
const pbEdge=new THREE.Mesh(new THREE.ShapeGeometry(pbShape),new THREE.MeshBasicMaterial({color:0xffc400,transparent:true,opacity:.95,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
pbFill.rotation.x=pbEdge.rotation.x=-Math.PI/2;pbEdge.position.y=.01;pbox.add(pbFill,pbEdge);pbox.visible=false;scene.add(pbox);
// seta na entrada da empresa de destino (some quando o jogador chega ao ponto de fretes)
const arrow=new THREE.Group();{const m=new THREE.MeshBasicMaterial({color:0xffc400}),sh=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,3.2,10),m),hd2=new THREE.Mesh(new THREE.ConeGeometry(1.7,3,10).rotateX(Math.PI),m);sh.position.y=3.1;hd2.position.y=0;arrow.add(sh,hd2);arrow.visible=false;scene.add(arrow)}
function endPark(){pbox.visible=false}
function setPark(c,bi){const q=c.loc(PCEN,c.bays[bi].lz);tgt.x=q.x;tgt.z=q.z;tgt.y=c.y;beacon.position.set(q.x,c.y+45,q.z);beacon.visible=true;ring.visible=false;
 pbox.position.set(q.x,c.y+.12,q.z);pbox.rotation.y=c.rot;pbox.visible=true;ocx=1e9}
function dockErr(c,bi){const rx=pos.x+14.2*Math.sin(th),rz=pos.z+14.2*Math.cos(th),dx=rx-c.x,dz=rz-c.z,cr=Math.cos(c.rot),sr=Math.sin(c.rot),lx=dx*cr-dz*sr,lz=dx*sr+dz*cr,tt=Math.atan2(cr,-sr);
 return{ex:Math.abs(lx-PREAR),el:Math.abs(lz-c.bays[bi].lz),ea:Math.abs(wrap(th-tt))}}
// lado para sair da empresa rumo ao destino: leva em conta para onde o caminhão está virado agora
function exitDir(c,to){const sg=window.GRID_ON?((to.x-c.x)*-Math.sin(c.h)+(to.z-c.z)*-Math.cos(c.h)>0?1:-1):to.s>c.s?1:-1,dx=-Math.sin(c.h)*sg,dz=-Math.cos(c.h)*sg,fx=-Math.sin(hd),fz=-Math.cos(hd),toRoadX=-c.cr,toRoadZ=c.sr,fr=fx*toRoadX+fz*toRoadZ>=0,rt=dx*Math.cos(hd)-dz*Math.sin(hd)>0;
 return(fr?rt:!rt)?'<b style="color:#ffb400">➡ virar à DIREITA</b> ao sair':'<b style="color:#ffb400">⬅ virar à ESQUERDA</b> ao sair'}
function offersFor(c){if(window.GRID_ON)return gridOffers(c);const n=c.nonce||0,offs=[-3,-2,-1,1,2,3,4],st=Math.floor(hh(c.k,n,21)*7),list=[],cl=CARGOS[c.t.id];
 for(let i=0;i<3;i++){const to=coGet(c.k+offs[(st+i*2)%7]),name=cl[Math.floor(hh(c.k,n*4+i,22)*cl.length)],tons=[6,12,18][Math.floor(hh(c.k,n*4+i,23)*3)],dm=window.GRID_ON?Math.hypot(to.x-c.x,to.z-c.z)*1.12:Math.abs(to.s-c.s),km=dm/1000;
  list.push({from:c,to,name,tons,dist:dm,reward:Math.round((600+km*(300+tons*45))/10)*10,limit:dm/15+70,slot:i,col:slotCol(c,i),toBay:(i+1)%3})}
 return list}
// pv (opcional): lista {name,tons,sub} das primeiras N opções; com ela o painel ocupa a tela toda e mostra a carga sobre o chassi (passe o mouse; no toque, 1º toque mostra e 2º aceita)
function cmShow(t,p,btns,foot,pv){$('cmt').textContent=t;$('cmp').textContent=p;const g=$('cmg');g.innerHTML='';const full=!!(pv&&pv.length&&typeof pvOpen==='function');
 btns.forEach((b,i)=>{const e=document.createElement('button');e.innerHTML=b.html;
  e.addEventListener('pointerdown',ev=>{audio();ev.preventDefault();if(full&&PV.on&&i<pv.length){pvSet(i);cmAcc(btns,pv)}else b.fn()});g.appendChild(e)});
 boardKeys=btns.map(b=>b.fn);$('cmf').textContent=foot||'';menuOpen=true;for(const k in K)K[k]=false;$('cm').style.display='flex';
 if(typeof pvClose==='function')pvClose();const on=full&&pvOpen(pv);$('cm').classList.toggle('full',on);if(on)cmAcc(btns,pv);else $('cma').style.display='none'}
/* painel de fretes: clicar na carga só seleciona e mostra a prévia; quem aceita é o botão "Aceitar frete" */
var cmCat=false; /* modo catálogo (tela inicial): o botão só fecha */
function cmAcc(btns,pv){const a=$('cma'),o=pv[PV.i];a.style.display='block';a.textContent=cmCat?'✖ Fechar catálogo':'✔ Aceitar frete · '+o.name+' ('+o.tons+' t)';a.onpointerdown=ev=>{audio();ev.preventDefault();btns[PV.i].fn()}}
function closeCm(){cmCat=false;$('cma').style.display='none';menuOpen=false;boardKeys=null;$('cm').style.display='none';$('cm').classList.remove('full');if(typeof pvClose==='function')pvClose()}
function boardKey(i){if(boardKeys&&boardKeys[i])boardKeys[i]()}
function yardCo(){let b=null,bd=1e9;for(const c of COACT){const d=Math.hypot(pos.x-c.board.x,pos.z-c.board.z);if(d<6.5&&d<bd){bd=d;b=c}}return b}
function openBoard(){if(VEH.car){msg('O Civic não faz fretes · recarregue a página e escolha a carreta');return}if(Math.hypot(vel.x,vel.z)>1){msg('Pare o caminhão');return}
 const c=yardCo();if(!c){msg('Pare no ponto amarelo entre os cones');return}
 if(job&&job.phase==='deliver'&&job.mode!=='park'&&c===job.to){deliverMenu();return}
 if(job){cmShow('Frete em andamento',job.name+' · '+job.tons+' t · '+job.from.name+' → '+job.to.name,[{html:'<b>Continuar</b>',fn:closeCm},{html:'<b>Cancelar frete</b><span>-R$ 300</span><small>Perde a carga</small>',fn:()=>cancelJob(false)}],'');return}
 const offs=offersFor(c),btns=offs.map(o=>({html:'<b>'+o.name+' · '+o.tons+' t</b><span>'+money(o.reward)+'</span><small>'+(o.tag?o.tag+' · ':'')+'→ '+o.to.name+' ('+o.to.city+') · '+(o.dist/1000).toFixed(1)+' km · '+exitDir(o.from,o.to)+' · prazo '+fmtT(o.limit)+'</small>',fn:()=>acceptJob(o)}));
 if(dmg>1){const cost=Math.round(dmg*30);btns.push({html:'<b>Oficina</b><span>'+money(cost)+'</span><small>Reparar '+Math.round(dmg)+'% de dano</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;dmg=0;saveG();closeCm();msg('Caminhão reparado')}})}
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(c.name,c.t.label+' · '+c.city+' · '+money(score),btns,'Clique em uma carga para ver a prévia · depois toque em “Aceitar frete” · ou tecle 1–'+btns.length,offs.map(o=>({name:o.name,tons:o.tons,sub:(o.tag?o.tag+' · ':'')+'→ '+o.to.name+' ('+o.to.city+')'})))}
function acceptJob(o){job=Object.assign({phase:'pickup'},o);{const d=o.from.drop&&o.from.drop[o.slot];if(d){d.visible=false;o.from.drop[o.slot]=null}}o.from.nonce=(o.from.nonce||0)+1;dockT=0;o.from.spawn={slot:o.slot,name:o.name,tons:o.tons};{const gp=COG.get(o.from.k);if(gp){const t=gp.userData.slots[o.slot];t.visible=true;setTrCargo(t,o.name,o.tons)}}setTargetP(o.from.slotK[o.slot],o.from.y);beacon.visible=false;ocx=1e9;closeCm();msg('Frete aceito · dê ré até o anel, cabine virada para fora da carreta')}
function cancelJob(free){if(!job)return;if(job.phase==='pickup'){const f=job.from;f.spawn=null;const gp=COG.get(f.k);if(gp)gp.userData.slots[job.slot].visible=false}else setHitched(false);endPark();job=null;loadCargo(0);setTarget(null);if(!free)score=Math.max(0,score-300);saveG();closeCm();msg(free?'Frete cancelado':'Frete cancelado · -R$ 300')}
function jobLabel(){return job?(job.phase==='pickup'?'Engatar '+job.name+' · '+job.from.name:'Entregar '+job.tons+' t · '+job.to.name):'Sem frete · vá a uma empresa'}
function hitchOk(c,sl){const K=c.slotK[sl];return Math.hypot(pos.x-K.x,pos.z-K.z)<3.5&&Math.hypot(vel.x,vel.z)<1.2&&(Math.sin(hd)*c.cr-Math.cos(hd)*c.sr)>.9}
function dockOk(c,bi){const rx=pos.x+14.2*Math.sin(th),rz=pos.z+14.2*Math.cos(th),dx=rx-c.x,dz=rz-c.z,cr=Math.cos(c.rot),sr=Math.sin(c.rot),lx=dx*cr-dz*sr,lz=dx*sr+dz*cr,tt=Math.atan2(cr,-sr);
 return lx>9&&lx<14&&Math.abs(lz-c.bays[bi].lz)<1.7&&Math.abs(wrap(th-tt))<.14&&Math.hypot(vel.x,vel.z)<1.2}
function completeDock(){dockT=0;const j=job;
 if(j.phase==='pickup'){j.from.spawn=null;const gp=COG.get(j.from.k);if(gp)gp.userData.slots[j.slot].visible=false;{const K=j.from.slotK[j.slot],tt=Math.atan2(j.from.cr,-j.from.sr);setHitched(true);th=tt;hb={x:K.x,z:K.z,t:0}}setTrailerCargo(j.name,j.tons);loadCargo(j.tons);j.phase='deliver';j.mode='';j.asked=false;tLeft=j.limit;j.dmg0=dmg;setTargetP(j.to.board,j.to.y);msg('Carga a bordo · siga até o ponto amarelo de '+j.to.name);return}
 finishDeliver(false)}
function leaveTrailerBay(c,bi){const gp=COG.get(c.k);if(!gp)return;const t=mkTrailer(gp,PCEN,c.bays[bi].lz,1);t.rotation.y=Math.atan2(c.cr,-c.sr)-c.rot;return t}
function finishDeliver(fast){dockT=0;const j=job,c=j.to,e=dockErr(c,j.toBay);endPark();
 const inc=Math.max(0,dmg-j.dmg0),pen=Math.min(.6,inc*.012),late=tLeft<0;
 let r=j.reward*(1-pen);if(late)r*=Math.max(.5,1+tLeft/300);let bonus=0,pb=0,acc=0;
 if(fast)r*=.8;else{if(!late&&tLeft>j.limit*.4)bonus=Math.round(j.reward*.1);acc=Math.max(0,1-(.4*e.el/1.7+.3*e.ea/.14+.3*e.ex/2.5));pb=Math.round(j.reward*.15*acc/10)*10}
 r=Math.round(r);score+=r+bonus+pb;deliveries++;saveG();
 {const t=fast?leaveTrailerBay(c,j.toBay):leaveTrailer(c);if(t){c.drop=c.drop||{};if(c.drop[j.toBay])c.drop[j.toBay].visible=false;c.drop[j.toBay]=t}}job=null;setHitched(false);loadCargo(0);setTarget(null);
 cmShow('Entrega concluída',c.name+' · '+j.name+' · '+j.tons+' t',[{html:'<b>Pagamento</b><span>'+money(r+bonus+pb)+'</span><small>Base '+money(j.reward)+(fast?' · entrega rápida 80%':'')+(inc>0?' · dano -'+Math.round(pen*100)+'%':'')+(late?' · atraso':'')+(bonus?' · pontualidade '+money(bonus):'')+(pb?' · precisão '+Math.round(acc*100)+'% '+money(pb):'')+'</small>',fn:closeCm},{html:'<b>Continuar</b><small>Saldo '+money(score)+'</small>',fn:closeCm}],'')}
function deliverMenu(){const j=job,fast=Math.round(j.reward*.8);
 cmShow('Entrega · '+j.to.name,j.name+' · '+j.tons+' t',[
  {html:'<b>Entregar agora</b><span>'+money(fast)+'</span><small>A carreta é solta na doca · 80% do valor, sem bônus</small>',fn:()=>{closeCm();finishDeliver(true)}},
  {html:'<b>Manobrar e estacionar</b><span>'+money(j.reward)+' + até '+money(Math.round(j.reward*.15/10)*10)+'</span><small>Ré até o retângulo no chão · bônus de precisão e pontualidade</small>',fn:()=>{j.mode='park';closeCm();setPark(j.to,j.toBay);msg('Dê ré até o retângulo · carreta exatamente dentro dele')}},
  {html:'<b>Continuar</b><small>Esc</small>',fn:closeCm}],'Toque, clique ou tecle 1–3')}
function jobFrame(dt){ring.rotation.z+=dt;arrow.visible=false;beacon.visible=false;if(job&&job.phase==='deliver')ring.visible=false;
 if(job){const pk=job.phase==='pickup',c=pk?job.from:job.to;
  navCo=c;if(job.phase==='deliver')tLeft-=dt;
  dd=Math.hypot(tgt.x-pos.x,tgt.z-pos.z);const k=Math.min(3,Math.max(.55,dd/70));beacon.scale.set(k,1,k);ring.scale.setScalar(k);
  if(job.phase==='deliver'&&job.mode!=='park'){const yc=yardCo();{const b=job.to.board;if(Math.hypot(pos.x-b.x,pos.z-b.z)>7){arrow.position.set(b.x,job.to.y+5.2+Math.sin(performance.now()*.004)*.5,b.z);arrow.rotation.y+=dt*1.5;arrow.visible=true}}if(yc!==job.to)job.asked=false;else if(!job.asked&&!menuOpen&&Math.hypot(vel.x,vel.z)<1){job.asked=true;deliverMenu()}dockT=0}
  else{const ok=pk?hitchOk(c,job.slot):dockOk(c,job.toBay);
   if(!pk){const e=dockErr(c,job.toBay),near=e.ex<4.5&&e.el<3.2&&e.ea<.35;pbFill.material.color.setHex(ok?0x38e06a:near?0xffc400:0xff4a3a);pbEdge.material.color.copy(pbFill.material.color);pbFill.material.opacity=.28+.35*Math.min(1,dockT/.9)}
   if(ok){if(dockT===0)msg(pk?'Alinhado · aperte T para engatar':'Posição certa · aperte T para desengatar');dockT=Math.min(.9,dockT+dt)}else dockT=0}}
 else{if(autoBoard&&!menuOpen){const y0=yardCo();if(y0&&Math.hypot(vel.x,vel.z)<1){autoBoard=false;openBoard()}}
  let b=null,bd=1e18;if(window.GRID_ON)b=gridNearCo();else{const k0=Math.floor(curS/CO_D);for(let k=k0-1;k<=k0+2;k++){const c=coGet(k),d=Math.abs(c.s-curS);if(d<bd){bd=d;b=c}}}
  if(b){navCo=b;const q=b.loc(0,0);tgt.x=q.x;tgt.z=q.z}dd=Math.hypot(tgt.x-pos.x,tgt.z-pos.z);
  const yc=yardCo();if(yc&&Math.hypot(vel.x,vel.z)<.8){if(promptCo!==yc){promptCo=yc;msg('G ou 📦 · quadro de fretes')}}else if(!yc)promptCo=null}}



// bússola inteligente: dentro de um pátio aponta para o portão; na pista aponta para o sentido da estrada que leva ao destino
function navPoint(){const r={x:tgt.x,z:tgt.z};const c=navCo;if(!c||dd<70)return r;
 for(const a of COACT){const dx=pos.x-a.x,dz=pos.z-a.z;if(Math.abs(dx)>70||Math.abs(dz)>70)continue;const lx=dx*a.cr-dz*a.sr;
  if(lx>-36&&lx<40&&Math.abs(dx*a.sr+dz*a.cr)<45){if(a===c&&job&&job.phase==='deliver')return r;const q=a.loc(-42,0);r.x=q.x;r.z=q.z;return r}}
 if(window.GRID_ON)return r;
 const ds=c.s-curS;if(Math.abs(ds)<110)return r;
 roadPt(curS,0);if(Math.hypot(pos.x-RPx,pos.z-RPz)>75)return r;
 roadPt(curS+Math.sign(ds)*70,0);r.x=RPx;r.z=RPz;return r}

/* engate/desengate manual (tecla T ou botão 🔗): só vale com a carreta alinhada e o caminhão parado */
function hitchKey(){if(menuOpen||!ready)return;if(VEH.car){msg('O Civic não engata carreta');return}
 if(!job){msg(hitched?'Entregue a carga no destino para desengatar':'Aceite um frete (G) para ter uma carreta para engatar');return}
 if(job.phase==='pickup'){if(hitchOk(job.from,job.slot))completeDock();else msg('Alinhe a cabine com a carreta (a menos de 3,5 m) e pare para engatar');return}
 if(job.mode==='park'){if(dockOk(job.to,job.toBay))completeDock();else msg('Posicione a carreta dentro do retângulo para desengatar');return}
 msg('Leve a carga ao ponto amarelo do destino para desengatar')}
/* motor: E liga/desliga (partida de ~1 s; parado só com o caminhão sem acelerar) */
function engineToggle(){if(menuOpen||!ready)return;
 if(engineOn){engineOn=false;engCrank=0;thrS=0;msg('Motor desligado')}
 else{if(fuel<=0){msg('Sem combustível');return}engineOn=true;engCrank=.9;msg('Motor ligado')}}
