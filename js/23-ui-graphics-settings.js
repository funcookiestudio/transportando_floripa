/* ===== Ajustes gráficos (painel) ===== */
const PRE=[
 {pr:.75,sh:0,spot:false,post:false,bloom:false,msaa:false,grade:false,motion:false,reflex:false,beams:false,lamps:false,pool:0,trees:true,bushes:true,parts:true,view:1,tone:true},
 {pr:1,sh:1024,spot:false,post:true,bloom:true,msaa:true,grade:true,motion:true,reflex:true,beams:true,lamps:true,pool:2,trees:true,bushes:true,parts:true,view:1,tone:true},
 {pr:1.5,sh:2048,spot:true,post:true,bloom:true,msaa:true,grade:true,motion:true,reflex:true,beams:true,lamps:true,pool:4,trees:true,bushes:true,parts:true,view:1,tone:true}];
const GS=Object.assign({auto:true,fps:false,preset:1},PRE[1]);
let gfxOpen=false,gfxEl=null,fpsEl=null,fpsRun=false;
function setQ(i){setQBase(i);Object.assign(GS,PRE[i],{preset:i});GS.auto=qAuto;applyGfx()}
function gfxMatch(){for(let i=0;i<PRE.length;i++){let ok=true;for(const k in PRE[i])if(GS[k]!==PRE[i][k]){ok=false;break}if(ok)return i}return -1}
function gfxSave(){try{localStorage.setItem('fh16gfx',JSON.stringify(GS))}catch(e){}}
function applyGfx(){
 R.setPixelRatio(Math.min(GS.pr,devicePixelRatio));resize();
 sun.castShadow=GS.sh>0;if(GS.sh>0&&sun.shadow.mapSize.x!==GS.sh){if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}sun.shadow.mapSize.set(GS.sh,GS.sh)}
 spots.forEach(l=>l.castShadow=GS.spot);
 poolL.forEach((l,k)=>l.visible=GS.pool>k);tailL.visible=fogS.visible=GS.lamps;
 if(bloom)bloom.enabled=GS.bloom;
 if(comp)for(const rt of[comp.renderTarget1,comp.renderTarget2])if(rt&&rt.isWebGLMultisampleRenderTarget){const sm=GS.msaa?4:0;if(rt.samples!==sm){rt.samples=sm;rt.dispose()}}
 envOff=!GS.reflex;if(envOff&&envTex)scene.environment=envTex;
 trunk.visible=leaf.visible=rock.visible=GS.trees;bushes.visible=GS.bushes;pts.visible=GS.parts;
 const tm=GS.tone?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;if(R.toneMapping!==tm){R.toneMapping=tm;scene.traverse(o=>{const m=o.material;if(m)(Array.isArray(m)?m:[m]).forEach(x=>{x.needsUpdate=true})})}
 applyTOD();qAuto=GS.auto;
 if(GS.fps||gfxOpen){fpsStart();if(fpsEl)fpsEl.style.display=GS.fps?'block':'none'}else if(fpsEl)fpsEl.style.display='none'}
function gfxInit(){try{const sv=JSON.parse(localStorage.getItem('fh16gfx')||'null');if(sv&&typeof sv==='object'){if(typeof sv.preset==='number'&&sv.preset>=0&&sv.preset!==qi)setQBase(sv.preset);Object.assign(GS,sv)}}catch(e){}applyGfx()}
function fpsStart(){if(fpsRun)return;if(!fpsEl){fpsEl=document.createElement('div');fpsEl.id='fpsb';document.body.appendChild(fpsEl)}fpsRun=true;let t0=performance.now(),n=0;
 (function L(t){n++;if(t-t0>=500){const f=n*1000/(t-t0);n=0;t0=t;const x='FPS '+Math.round(f)+' · '+(1000/f).toFixed(1)+' ms';fpsEl.textContent=x;if(gfxEl){const h=gfxEl.querySelector('.gf');if(h)h.textContent=x}}if(GS.fps||gfxOpen)requestAnimationFrame(L);else fpsRun=false})(t0)}
const GSC=[
 ['Qualidade',[{k:'preset',t:'seg',l:'Predefinição',o:[['Baixo',0],['Médio',1],['Alto',2]]},{k:'auto',t:'sw',l:'Qualidade automática',h:'Se o FPS cair, reduz primeiro a resolução e só depois desliga efeitos'}]],
 ['Imagem',[{k:'pr',t:'seg',l:'Resolução da imagem',h:'Limitada pela densidade da tela (DPR '+(Math.round(devicePixelRatio*100)/100)+')',o:[['50%',.5],['75%',.75],['100%',1],['125%',1.25],['150%',1.5],['200%',2]]},{k:'view',t:'seg',l:'Distância de visão',o:[['Curta',.6],['Média',.8],['Longa',1]]},{k:'tone',t:'sw',l:'Cores cinematográficas',h:'Tone mapping ACES'},{k:'grade',t:'sw',l:'Correção de cor e contraste',d:1}]],
 ['Sombras',[{k:'sh',t:'seg',l:'Sombras do sol',o:[['Desligadas',0],['512',512],['1024',1024],['2048',2048]]},{k:'spot',t:'sw',l:'Sombras dos faróis'}]],
 ['Efeitos',[{k:'post',t:'sw',l:'Pós-processamento',h:'Necessário para bloom, suavização, cor e desfoque'},{k:'bloom',t:'sw',l:'Brilho (bloom)',d:1},{k:'msaa',t:'sw',l:'Suavização de bordas (MSAA)',d:1},{k:'motion',t:'sw',l:'Desfoque em alta velocidade',d:1},{k:'reflex',t:'sw',l:'Reflexos dinâmicos',h:'Atualiza o reflexo do cenário na lataria'},{k:'parts',t:'sw',l:'Poeira e fumaça'}]],
 ['Iluminação',[{k:'beams',t:'sw',l:'Feixes e brilho dos faróis'},{k:'lamps',t:'sw',l:'Luzes de freio e de neblina'},{k:'pool',t:'seg',l:'Luzes dos postes',o:[['Nenhuma',0],['2',2],['4',4]]}]],
 ['Cenário',[{k:'trees',t:'sw',l:'Árvores e pedras'},{k:'bushes',t:'sw',l:'Arbustos'}]],
 ['Desempenho',[{k:'fps',t:'sw',l:'Mostrar FPS na tela'}]]];
function gfxRender(){const cur=gfxMatch();let h='';
 for(const[sec,items]of GSC){h+='<h3>'+sec+'</h3>';
  for(const it of items){const dim=it.d&&!GS.post?' dim':'';
   if(it.t==='sw')h+='<div class="gr'+dim+'"><div class="gl">'+it.l+(it.h?'<small>'+it.h+'</small>':'')+'</div><button class="sw2'+(GS[it.k]?' on':'')+'" data-k="'+it.k+'" data-v="'+(!GS[it.k])+'" aria-label="'+it.l+'"></button></div>';
   else{const v=it.k==='preset'?cur:GS[it.k];h+='<div class="gr col"><div class="gl">'+it.l+(it.k==='preset'&&cur<0?' <small style="display:inline">· personalizado</small>':'')+(it.h?'<small>'+it.h+'</small>':'')+'</div><div class="sg">'+it.o.map(o=>'<button data-k="'+it.k+'" data-v="'+o[1]+'"'+(o[1]===v?' class="on"':'')+'>'+o[0]+'</button>').join('')+'</div></div>'}}}
 gfxEl.querySelector('#gb').innerHTML=h}
function gfxSet(k,v){
 if(k==='preset'){qAuto=false;setQ(v)}
 else if(k==='auto'){GS.auto=v;qAuto=v}
 else{GS[k]=v;if(v===true&&(k==='bloom'||k==='msaa'||k==='grade'||k==='motion'))GS.post=true;GS.auto=false;qAuto=false}
 applyGfx();gfxSave();gfxRender()}
function gfxReset(){try{localStorage.removeItem('fh16gfx')}catch(e){}qAuto=true;GS.fps=false;setQ(MOB?1:2);GS.auto=true;gfxRender()}
function gfxBuild(){const el=document.createElement('div');el.id='gfx';el.innerHTML='<div class="gw"><div class="gh"><h2>Ajustes gráficos</h2><span class="gf"></span></div><p class="gn">As mudanças valem na hora e ficam salvas neste aparelho. Ao mudar algo à mão, a qualidade automática é desligada.</p><div id="gb"></div><div class="ga"><button data-g="reset">Restaurar padrão</button><button data-g="close" class="pri">Fechar</button></div></div>';
 document.body.appendChild(el);gfxEl=el;
 el.addEventListener('click',e=>{const b=e.target.closest('[data-g],[data-k]');if(!b)return;if(b.dataset.g==='close')return gfxClose();if(b.dataset.g==='reset')return gfxReset();gfxSet(b.dataset.k,JSON.parse(b.dataset.v))})}
function gfxShow(){if(menuOpen)return;if(!gfxEl)gfxBuild();gfxOpen=true;menuOpen=true;for(const k in K)K[k]=false;gfxRender();gfxEl.style.display='block';fpsStart()}
function gfxClose(){gfxOpen=false;menuOpen=false;if(gfxEl)gfxEl.style.display='none';gfxSave()}
act.gfx=()=>{gfxOpen?gfxClose():gfxShow()};
