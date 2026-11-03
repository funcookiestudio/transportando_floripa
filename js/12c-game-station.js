// ---- combustível, postos (abastecer, oficina, pintura da cabine) ----
const FPRICE=4.5,PAINT_COST=400,PAINTS=[['Vermelho',0xd0392e],['Azul',0x2f6fc0],['Verde',0x3a9a4a],['Branco',0xf2f2ee],['Laranja',0xe07a22],['Grafite',0x4a4f55],['Roxo',0x8b4aa5],['Amarelo',0xe8c020]];
let stIn=false,fuelDead=0,fuelWarn=0,stHudT=0,stNear='--',stV=new THREE.Vector3();
function paintSave(h){try{localStorage.setItem('fh16paint',h==null?'':String(h))}catch(e){}}
function paintLoad(){try{const v=localStorage.getItem('fh16paint');if(v)cabPaint(TRUCKP,+v)}catch(e){}}
function stMenu(f){const btns=[],need=FUELMAX-fuel;
 if(need>2){for(const l of[100,Math.round(need)]){const q=Math.min(l,need),cost=Math.round(q*FPRICE);if(l===100&&need<=105)continue;btns.push({html:'<b>'+(l===100?'Abastecer 100 L':'Encher o tanque · '+Math.round(q)+' L')+'</b><span>'+money(cost)+'</span><small>R$ '+FPRICE.toFixed(2).replace('.',',')+' por litro</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;fuel=Math.min(FUELMAX,fuel+q);saveG();msg('Abastecido '+Math.round(q)+' L');stMenu(f)}})}}
 else btns.push({html:'<b>Tanque cheio</b><small>'+Math.round(fuel)+' L</small>',fn:()=>stMenu(f)});
 if(dmg>1){const cost=Math.round(dmg*30);btns.push({html:'<b>Oficina</b><span>'+money(cost)+'</span><small>Reparar '+Math.round(dmg)+'% de dano</small>',fn:()=>{if(score<cost){msg('Dinheiro insuficiente');return}score-=cost;dmg=0;saveG();msg('Caminhão reparado');stMenu(f)}})}
 btns.push({html:'<b>Pintar a cabine</b><span>'+money(PAINT_COST)+'</span><small>Escolher a cor</small>',fn:()=>stPaint(f)});
 btns.push({html:'<b>Fechar</b><small>Esc</small>',fn:closeCm});
 cmShow(f.name,'Combustível '+Math.round(fuel)+' / '+FUELMAX+' L · '+money(score),btns,'Toque, clique ou tecle 1–'+btns.length)}
function stPaint(f){const sw=h=>'<span style="display:inline-block;width:1em;height:1em;border-radius:3px;background:#'+h.toString(16).padStart(6,'0')+';border:1px solid #fff8;vertical-align:-.15em;margin-right:.4em"></span>',
 btns=PAINTS.map(([n,h])=>({html:'<b>'+sw(h)+n+'</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;cabPaint(TRUCKP,h);paintSave(h);saveG();msg('Cabine pintada');stMenu(f)}}));
 btns.push({html:'<b>Cor original</b><span>'+money(PAINT_COST)+'</span>',fn:()=>{if(score<PAINT_COST){msg('Dinheiro insuficiente');return}score-=PAINT_COST;cabPaint(TRUCKP,null);paintSave(null);saveG();msg('Cor original');stMenu(f)}},{html:'<b>Voltar</b>',fn:()=>stMenu(f)});
 cmShow('Pintar a cabine',f.name+' · '+money(score),btns,'')}
function stFrame(dt){if(!ready||menuOpen)return;const sp=Math.hypot(vel.x,vel.z);
 fuel=Math.max(0,fuel-dt*(.02+sp*.0011*(1+cargo*.01)+thrS*.05));
 if(fuel<=0){fuelDead=sp<1?fuelDead+dt:0;if(fuelDead>6){fuelDead=0;score=Math.max(0,score-500);fuel=40;saveG();msg('Sem combustível! O guincho trouxe 40 L (-R$ 500)')}}else fuelDead=0;
 if(fuel<45&&fuel>0){fuelWarn-=dt;if(fuelWarn<=0){fuelWarn=40;msg('Combustível baixo — procure um posto')}}
 {const z=stZone(16);if(z){if(!stIn){stIn=true;msg('Pare e aperte G para usar o posto')}}else stIn=false}
 stHudT-=dt;if(stHudT<=0){stHudT=.4;const o=samp(Math.round(curS/RDS));cam.getWorldDirection(stV);const sg=(stV.x*-Math.sin(o.h)+stV.z*-Math.cos(o.h))>=0?1:-1;let b=1e9;
  for(let i=Math.floor(curS/ST_D)-3;i<=Math.floor(curS/ST_D)+3;i++){const f=stGet(i);if(f){const d=(f.s-curS)*sg;if(d>0&&d<b)b=d}}
  stNear=(sg===coDir?'▲ ':'▼ ')+(b<1e8?(b/1000).toFixed(1):'--')}}

// zona do posto mais próxima (pátio de qualquer lado) dentro de r metros
function stZone(r){for(const f of ICA){if(f.kind!=='st'||!f.zones)continue;for(const z of f.zones)if(Math.hypot(pos.x-z.x,pos.z-z.z)<r)return f}return null}
// tecla G / botão 📦: usa o posto se estiver no pátio; devolve true se tratou
function stUse(){const f=stZone(12);if(!f)return false;if(Math.hypot(vel.x,vel.z)>1.5){msg('Pare o caminhão para usar o posto');return true}stMenu(f);return true}
