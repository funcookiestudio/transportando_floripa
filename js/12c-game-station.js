// ---- combustível, postos (abastecer, oficina, pintura da cabine) ----
const FPRICE=4.5,PAINT_COST=400,PAINTS=[['Vermelho',0xd0392e],['Azul',0x2f6fc0],['Verde',0x3a9a4a],['Branco',0xf2f2ee],['Laranja',0xe07a22],['Grafite',0x4a4f55],['Roxo',0x8b4aa5],['Amarelo',0xe8c020]];
let stIn=false,fuelDead=0,fuelWarn=0,stHudT=0,stNear='--',stV=new THREE.Vector3();
function paintSave(h){try{localStorage.setItem('fh16paint',h==null?'':String(h))}catch(e){}}
function paintLoad(){try{const v=localStorage.getItem('fh16paint');if(v)cabPaint(TRUCKP,+v)}catch(e){}}
function stMenu(f,mode){const btns=[],need=FUELMAX-fuel,shop=mode==='shop';
 if(shop){}else if(need>2){for(const l of[100,Math.round(need)]){const q=Math.min(l,need),cost=Math.round(q*FPRICE);if(l===100&&need<=105)continue;btns.push({html:'<b>'+(l===100?'Abastecer 100 L':'Encher o tanque · '+Math.round(q)+' L')+'</b><span>'+money(cost)+'</span><small>R$ '+FPRICE.toFixed(2).replace('.',',')+' por litro</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;fuel=Math.min(FUELMAX,fuel+q);saveG();msg('Abastecido '+Math.round(q)+' L');stMenu(f)}})}}
 else btns.push({html:'<b>Tanque cheio</b><small>'+Math.round(fuel)+' L</small>',fn:()=>stMenu(f,mode)});
 if(shop&&dmg>1){const cost=Math.round(dmg*30);btns.push({html:'<b>Oficina</b><span>'+money(cost)+'</span><small>Reparar '+Math.round(dmg)+'% de dano</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;dmg=0;saveG();msg('Caminhão reparado');stMenu(f,mode)}})}
 else if(shop)btns.push({html:'<b>Sem avarias</b><small>Caminhão em bom estado</small>',fn:()=>stMenu(f,mode)});
 if(shop)btns.push({html:'<b>Pintar a cabine</b><span>'+money(PAINT_COST)+'</span><small>Escolher a cor</small>',fn:()=>stPaint(f)});
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(f.name+(shop?' · oficina':' · bomba'),'Combustível '+Math.round(fuel)+' / '+FUELMAX+' L · '+money(score),btns,'Toque, clique ou tecle 1–'+btns.length)}
function stPaint(f){const sw=h=>'<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:#'+h.toString(16).padStart(6,'0')+';border:1px solid #fff8;vertical-align:-.15em;margin-right:.4em"></span>',
 btns=PAINTS.map(([n,h])=>({html:'<b>'+sw(h)+n+'</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;paintCab(h);saveG();msg('Cabine pintada');stMenu(f,'shop')}}));
 btns.push({html:'<b>Cor original</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;paintCab(null);saveG();msg('Cor original');stMenu(f,'shop')}},{html:'<b>Voltar</b>',fn:()=>stMenu(f,'shop')});
 cmShow('Pintar a cabine',f.name+' · '+money(score),btns,'')}
// bomba das empresas: vaga amarela no canto do pátio; combustível mais caro (CPRICE) que nos postos
const CPRICE=FPRICE*1.6;
function coFuelZone(){for(const c of COACT){const dx=pos.x-c.x,dz=pos.z-c.z;if(Math.abs(dx)>60||Math.abs(dz)>60)continue;const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;
  if(Math.abs(lx-PUMP.x)<PUMP.L/2+.8&&Math.abs(lz-PUMP.z)<PUMP.W/2+.5){const a=Math.abs(wrap(hd-Math.atan2(c.cr,-c.sr)));if(a<.6||a>Math.PI-.6)return c}}return null}
function coFuelMenu(c){const btns=[],need=FUELMAX-fuel,pr=CPRICE.toFixed(2).replace('.',',');
 if(need>2){for(const l of[100,Math.round(need)]){const q=Math.min(l,need),cost=Math.round(q*CPRICE);if(l===100&&need<=105)continue;btns.push({html:'<b>'+(l===100?'Abastecer 100 L':'Encher o tanque · '+Math.round(q)+' L')+'</b><span>'+money(cost)+'</span><small>R$ '+pr+' por litro (mais caro que no posto)</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;fuel=Math.min(FUELMAX,fuel+q);saveG();msg('Abastecido '+Math.round(q)+' L');coFuelMenu(c)}})}}
 else btns.push({html:'<b>Tanque cheio</b><small>'+Math.round(fuel)+' L</small>',fn:()=>coFuelMenu(c)});
 /* reparo rápido na bomba da empresa: conserta só metade do dano (o reparo completo é na oficina dos postos) */
 if(dmg>1){const rep=Math.max(1,Math.round(dmg/2)),cost=Math.round(rep*30*1.6);btns.push({html:'<b>Reparo rápido</b><span>'+money(cost)+'</span><small>Repara '+rep+'% do dano ('+Math.round(dmg)+'% → '+Math.round(dmg-rep)+'%) · só metade</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;dmg=Math.max(0,dmg-rep);saveG();msg('Reparo rápido feito');coFuelMenu(c)}})}
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(c.name+' · bomba','Combustível '+Math.round(fuel)+' / '+FUELMAX+' L · '+money(score),btns,'Toque, clique ou tecle 1–'+btns.length)}
let coPIn=false;
// consumo, pane seca, aviso e autonomia (roda também no modo grade, onde stFrame não roda)
let fuelKm=0,fuelLpk=0;
function fuelFrame(dt,sp){if(!ready||menuOpen)return;if(sp===undefined)sp=Math.hypot(vel.x,vel.z);const f0=fuel;
 if(engineOn)fuel=Math.max(0,fuel-VEH.fc*dt*(.02+sp*.0011*(1+cargo*.01)+thrS*.05*(1+(VEH.car?boost*.7+wsp*.5:0)))*(VEH.car&&thrS<.05&&sp>5?.35:1));
 if(fuel<=0){fuelDead=sp<1?fuelDead+dt:0;if(fuelDead>6){fuelDead=0;score=Math.max(0,score-500);fuel=40;saveG();msg('Sem combustível! O guincho trouxe 40 L (-R$ 500)')}}else fuelDead=0;
 if(fuel<45&&fuel>0){fuelWarn-=dt;if(fuelWarn<=0){fuelWarn=40;msg('Combustível baixo — procure um posto')}}
 fuelKm=Math.min(9999,fuel/((VEH.car?.45:2.6)*(1+cargo*.01)));
 if(window.GRID_ON){const cz=coFuelZone();if(cz){if(!coPIn){coPIn=true;msg('Pare e aperte G para abastecer (R$ '+CPRICE.toFixed(2).replace('.',',')+'/L)')}}else coPIn=false}}
function stFrame(dt){if(!ready||menuOpen)return;const sp=Math.hypot(vel.x,vel.z);
 fuelFrame(dt,sp);
 {const z=stBay();if(z){if(z!==stIn){stIn=z;msg(z.k==='shop'?'Pare e aperte G para a oficina':'Pare e aperte G para abastecer')}}else stIn=false}
 {const g=icGate();if(g)regGo(g);else if(REG.hist&&REG.hist.length&&curS<REG.arr-40&&RD<14)regBack()}
 {const cz=coFuelZone();if(cz){if(!coPIn){coPIn=true;msg('Pare e aperte G para abastecer (R$ '+CPRICE.toFixed(2).replace('.',',')+'/L)')}}else coPIn=false}
 stHudT-=dt;if(stHudT<=0){stHudT=.4;const o=samp(Math.round(curS/RDS));cam.getWorldDirection(stV);const sg=(stV.x*-Math.sin(o.h)+stV.z*-Math.cos(o.h))>=0?1:-1;let b=1e9;
  for(let i=Math.floor(curS/ST_D)-3;i<=Math.floor(curS/ST_D)+3;i++){const f=stGet(i);if(f){const d=(f.s-curS)*sg;if(d>0&&d<b)b=d}}
  stNear=(sg===coDir?'▲ ':'▼ ')+(b<1e8?(b/1000).toFixed(1):'--')}}

// zona do posto mais próxima (pátio de qualquer lado) dentro de r metros
function stZone(r){for(const f of ICA){if(f.kind!=='st'||!f.zones)continue;for(const z of f.zones)if(Math.hypot(pos.x-z.x,pos.z-z.z)<r)return f}return null}
// tecla G / botão 📦: usa o posto se estiver no pátio; devolve true se tratou
// vaga amarela (bomba ou oficina) em que o caminhão está, alinhado com a pista
function stBay(){for(const f of ICA){if(f.kind!=='st'||!f.bays)continue;if(Math.abs(pos.x-f.x0)>200||Math.abs(pos.z-f.z0)>200)continue;
 for(const b of f.bays){const dx=pos.x-b.x,dz=pos.z-b.z,al=dx*f.tx+dz*f.tz,la=dx*f.nx+dz*f.nz;if(Math.abs(al)<b.L/2+.8&&Math.abs(la)<b.W/2+.5&&Math.abs(-Math.sin(hd)*f.tx-Math.cos(hd)*f.tz)>.82){b.f=f;return b}}}return null}
function stUse(){const bay=stBay();const f=bay&&bay.f;if(!f){const cz=coFuelZone();if(!cz)return false;if(Math.hypot(vel.x,vel.z)>1.5){msg('Pare o caminhão para abastecer');return true}coFuelMenu(cz);return true}if(Math.hypot(vel.x,vel.z)>1.5){msg('Pare o caminhão para usar o posto');return true}stMenu(f,bay.k);return true}

// ---- saídas do trevo: a rodovia que cruza continua e vira a estrada principal de uma NOVA REGIÃO, sem recarregar ----
let regBusy=false;
function regSave(){try{localStorage.setItem('fh16reg:'+(WSEED.n||0),JSON.stringify(REG))}catch(e){}}
function icGate(){for(const f of ICA){if(f.kind==='st'||!f.rb)continue;const dx=pos.x-f.x0,dz=pos.z-f.z0;if(Math.abs(dx)>700||Math.abs(dz)>700)continue;const q=dx*f.nx+dz*f.nz,t=dx*f.tx+dz*f.tz;
  if(Math.abs(q)>490&&Math.abs(t)<14){const sd=q>0?1:-1;if(-Math.sin(hd)*f.nx*sd-Math.cos(hd)*f.nz*sd>.5)return{f,sd}}}return null}
// descarta tudo que depende da estrada/semente atual (empresas, rios, viadutos, trevos, postos, tráfego) e recria a estrada a partir da origem de REG
function regWipe(){if(job)cancelJob(true);setTarget(null);
 for(let i=TRF.length-1;i>=0;i--)trfKill(i);
 for(const[k,gp]of COG){scene.remove(gp);disposeCo(gp)}COG.clear();COM.clear();COACT.length=0;coPend=false;lastCity=null;
 for(const a of[RIVA,OVA,ICA]){for(const f of a){featDispose(f);f.rb=null}a.length=0}RVM.clear();OVM.clear();ICM.clear();STM.clear();featFull=false;TDIRTY.length=0;
 RF.length=0;RB.length=0;RC.clear();RF.push({x:REG.ox,z:REG.oz,h:REG.oh,s:0,hw:11.5,kd:0});addS(RF[0]);yKset()}
function regGo(g){if(regBusy||(window.NET&&NET.on)){if(window.NET&&NET.on)msg('Saia da sala multiplayer para mudar de região');return}regBusy=true;
 const f=g.f,sd=g.sd,q=(pos.x-f.x0)*f.nx+(pos.z-f.z0)*f.nz,ax=f.x0+f.nx*q,az=f.z0+f.nz*q,hw=Math.atan2(-sd*f.nx,-sd*f.nz),gy=H(pos.x,pos.z);
 const nid=((Math.imul(REG.id+1,2654435761)^Math.imul(f.i*2+(sd>0?1:0)+17,40503))>>>0)%900000+1000;
 const hist=(REG.hist||[]).concat([{id:REG.id,ox:REG.ox,oz:REG.oz,oh:REG.oh,y:REG.y,s:f.s,arr:REG.arr||0}]).slice(-12);
 Object.assign(REG,{id:nid,ox:0,oz:0,oh:0,y:0,hist,arr:0});regWipe();
 // acha um trecho (antes do ponto de partida) de autoestrada sem empresa, cidade ou rio, por onde a nova estrada passa sob o caminhão
 let S=1500;for(;S<4000;S+=100){const s=-S;if(nearCo(s,350)||inCity(s,1100))continue;let ok=true;for(let d=-300;d<=300;d+=50)if(kindAt(s+d)!==0)ok=false;
  for(let r=Math.floor(s/RV_D)-1;r<=Math.floor(s/RV_D)+1&&ok;r++){const rv=riverGet(r);if(rv&&Math.abs(rv.s-s)<rv.sb+300)ok=false}if(ok)break}
 REG.arr=-S;ensureRoad(-S-50,50);const o=samp(Math.round(-S/RDS)),th0=hw-o.h,c=Math.cos(th0),sn=Math.sin(th0);
 REG.ox=ax-(c*o.x+sn*o.z);REG.oz=az-(-sn*o.x+c*o.z);REG.oh=th0;regWipe();ensureRoad(-S-1200,1200);
 REG.y=gy-.1-yR(-S);curS=-S;
 // terreno: só perto do caminhão (da frente para trás), em lotes pequenos por quadro
 const fx=-Math.sin(hd),fz=-Math.cos(hd);for(const k of[0,90,180,270,360,-90,-180])terrMark(pos.x+fx*k,pos.z+fz*k,80);
 rbI=1e9;ocx=1e9;placeCones();regSave();saveG();msg('📍 Nova região');regBusy=false}
// retorno: voltando pela estrada para antes do ponto de chegada, a região anterior reaparece no mesmo lugar (sem teleporte), no fim da rodovia do trevo
function regBack(){if(regBusy||(window.NET&&NET.on))return;regBusy=true;const e=REG.hist[REG.hist.length-1],hist=REG.hist.slice(0,-1);
 Object.assign(REG,{id:e.id,ox:e.ox,oz:e.oz,oh:e.oh,y:e.y,hist,arr:e.arr||0});regWipe();curS=e.s;ensureRoad(e.s-1200,e.s+1200);
 const fx=-Math.sin(hd),fz=-Math.cos(hd);for(const k of[0,90,180,-90])terrMark(pos.x+fx*k,pos.z+fz*k,80);
 rbI=1e9;ocx=1e9;placeCones();regSave();saveG();msg('📍 Região anterior');regBusy=false}
function applyXfer(){}
