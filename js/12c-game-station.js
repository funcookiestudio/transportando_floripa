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
 btns=PAINTS.map(([n,h])=>({html:'<b>'+sw(h)+n+'</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;cabPaint(TRUCKP,h);paintSave(h);saveG();msg('Cabine pintada');stMenu(f,'shop')}}));
 btns.push({html:'<b>Cor original</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;cabPaint(TRUCKP,null);paintSave(null);saveG();msg('Cor original');stMenu(f,'shop')}},{html:'<b>Voltar</b>',fn:()=>stMenu(f,'shop')});
 cmShow('Pintar a cabine',f.name+' · '+money(score),btns,'')}
// bomba das empresas: vaga amarela no canto do pátio; combustível mais caro (CPRICE) que nos postos
const CPRICE=FPRICE*1.6;
function coFuelZone(){for(const c of COACT){const dx=pos.x-c.x,dz=pos.z-c.z;if(Math.abs(dx)>60||Math.abs(dz)>60)continue;const lx=dx*c.cr-dz*c.sr,lz=dx*c.sr+dz*c.cr;
  if(Math.abs(lx-PUMP.x)<PUMP.L/2+.8&&Math.abs(lz-PUMP.z)<PUMP.W/2+.5){const a=Math.abs(wrap(hd-Math.atan2(c.cr,-c.sr)));if(a<.6||a>Math.PI-.6)return c}}return null}
function coFuelMenu(c){const btns=[],need=FUELMAX-fuel,pr=CPRICE.toFixed(2).replace('.',',');
 if(need>2){for(const l of[100,Math.round(need)]){const q=Math.min(l,need),cost=Math.round(q*CPRICE);if(l===100&&need<=105)continue;btns.push({html:'<b>'+(l===100?'Abastecer 100 L':'Encher o tanque · '+Math.round(q)+' L')+'</b><span>'+money(cost)+'</span><small>R$ '+pr+' por litro (mais caro que no posto)</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;fuel=Math.min(FUELMAX,fuel+q);saveG();msg('Abastecido '+Math.round(q)+' L');coFuelMenu(c)}})}}
 else btns.push({html:'<b>Tanque cheio</b><small>'+Math.round(fuel)+' L</small>',fn:()=>coFuelMenu(c)});
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(c.name+' · bomba','Combustível '+Math.round(fuel)+' / '+FUELMAX+' L · '+money(score),btns,'Toque, clique ou tecle 1–'+btns.length)}
let coPIn=false;
function stFrame(dt){if(!ready||menuOpen)return;const sp=Math.hypot(vel.x,vel.z);
 fuel=Math.max(0,fuel-dt*(.02+sp*.0011*(1+cargo*.01)+thrS*.05));
 if(fuel<=0){fuelDead=sp<1?fuelDead+dt:0;if(fuelDead>6){fuelDead=0;score=Math.max(0,score-500);fuel=40;saveG();msg('Sem combustível! O guincho trouxe 40 L (-R$ 500)')}}else fuelDead=0;
 if(fuel<45&&fuel>0){fuelWarn-=dt;if(fuelWarn<=0){fuelWarn=40;msg('Combustível baixo — procure um posto')}}
 {const z=stBay();if(z){if(z!==stIn){stIn=z;msg(z.k==='shop'?'Pare e aperte G para a oficina':'Pare e aperte G para abastecer')}}else stIn=false}
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
