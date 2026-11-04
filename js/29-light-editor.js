/* ===== editor de pontos de luz e escapamento (aba "Luzes" do menu de pintura) =====
   Cada ponto: x,y,z em metros (x = lado direito; o esquerdo é espelhado), p = inclinação, w = ângulo (giro), r = rotação (graus), s = tamanho, m = espelhar.
   Referência: eixo traseiro na origem, frente = -z, +x direita, +y para cima. Ângulo 0 = apontando para a frente, 180 = para trás. */
const LPG=[['headBeam','Feixe do farol'],['headGlow','Lâmpada do farol'],['brake','Freio'],['rev','Ré'],['sigF','Seta diant.'],['sigR','Seta tras.'],['exh','Escapamento']];
const LPK=[['x','X lateral',-6,6,.01],['y','Y altura',0,5,.01],['z','Z frente(−) / trás(+)',-9,3,.01],['p','Inclinação °',-90,90,.5],['w','Ângulo °',-180,180,.5],['r','Rotação °',-180,180,.5],['s','Tamanho',.05,3,.01]];
const LPD=Math.PI/180;
LPDEF.truck={"headBeam":{"x":1.11,"y":0.97,"z":-5.44,"p":-1.5,"w":0,"r":0,"s":1,"m":1},"headGlow":{"x":1.11,"y":0.93,"z":-5.44,"p":0,"w":0,"r":0,"s":0.9,"m":1},"brake":{"x":0.89,"y":0.93,"z":0.94,"p":0,"w":180,"r":0,"s":0.7,"m":1},"rev":{"x":0.83,"y":0.88,"z":0.89,"p":0,"w":180,"r":0,"s":0.4,"m":1},"sigF":{"x":1.17,"y":0.76,"z":-5.44,"p":0,"w":0,"r":0,"s":0.42,"m":1},"sigR":{"x":1.17,"y":0.88,"z":0.83,"p":0,"w":180,"r":0,"s":0.42,"m":1},"exh":{"x":1.28,"y":0.21,"z":-1.17,"p":-27.5,"w":-113.5,"r":-110,"s":0.45,"m":0}};
var LPU={},lpAll=false,lpSel='headBeam',lpShownV=null,LPSP={truck:null,civic:null};
try{LPU=JSON.parse(localStorage.getItem('fh16lp'))||{}}catch(e){LPU={}}
const lpSave=()=>{try{localStorage.setItem('fh16lp',JSON.stringify(LPU))}catch(e){}};
const lpV=()=>VEH.car?'civic':'truck';
function lpCur(v,g){const d=LPDEF[v]&&LPDEF[v][g];if(!d)return null;return Object.assign({},d,(LPU[v]||{})[g]||{})}
function lpSet(v,g,k,val){const o=LPU[v]=LPU[v]||{};o[g]=Object.assign(o[g]||{},{[k]:val});lpSave()}
function lpBuild(v){if(LPSP[v]||!LPDEF[v])return;const tex=civGlowTex(),S={axes:{}};
 const mk=(col,nb)=>{const m=new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:0,depthWrite:false,blending:nb?THREE.NormalBlending:THREE.AdditiveBlending,fog:false}),sp=new THREE.Sprite(m);sp.renderOrder=5;sp.visible=false;pivot.add(sp);return sp},two=(c,nb)=>[mk(c,nb),mk(c,nb)];
 S.headGlow=two(0xfff2d0);S.brake=two(0xff2010);S.rev=two(0xffffff,1);S.sigF=two(0xff9a10,1);S.sigR=two(0xff9a10,1);
 LPG.forEach(([g])=>{const a=[new THREE.AxesHelper(.3),new THREE.AxesHelper(.3)];a.forEach(x=>{x.material.depthTest=false;x.renderOrder=99;x.visible=false;pivot.add(x)});S.axes[g]=a});
 LPSP[v]=S}
/* mira do holofote que ilumina o chão: usa a lâmpada (headGlow) e a inclinação do feixe */
function lpAimSpot(s,i){const v=lpV(),c=lpCur(v,'headGlow'),b=lpCur(v,'headBeam');if(!c||!b)return;const sg=i?1:-1,p=(b.p+(hiB?4.5:.8))*LPD,w=(b.m&&!i?-1:1)*b.w*LPD;
 s.position.set(sg*c.x,c.y,c.z);s.target.position.set(s.position.x-Math.sin(w)*Math.cos(p)*40,s.position.y+Math.sin(p)*40,s.position.z-Math.cos(w)*Math.cos(p)*40)}
var lpT=0;
function lpFrame(dt,vf){if(typeof scene==='undefined'||typeof pivot==='undefined')return;const v=lpV();lpBuild('truck');lpBuild('civic');
 for(const k of ['truck','civic']){const S=LPSP[k];if(S&&k!==v){for(const g in S){if(g==='axes'){for(const q in S.axes)S.axes[q].forEach(a=>a.visible=false)}else S[g].forEach(sp=>sp.visible=false)}}}
 const S=LPSP[v];if(!CFX&&typeof civFxInit==='function')civFxInit();if(!S){civFxPool(dt);return}
 const F=!!(window.HOME&&$('hpan').style.display==='block'&&hpTab==='lp'),bl=Math.floor(performance.now()/400)%2,brk=(K.down&&vf>.5)||K.hb,rev=K.down&&vf<=.5&&engineOn,on=typeof lightsOn!=='undefined'&&lightsOn,sL=!!(bl&&sigL),sR=!!(bl&&sigR);
 if(F&&lpShownV!==v){lpShownV=v;lpUI()}
 if(F&&lpSaved&&Math.abs(hour-18.4)>.02){hourT=hour=18.4;lightsOn=true;try{applyTOD()}catch(e){}}
 const lv={headGlow:on?(hiB?1:.65):0,brake:brk?.9:(on?.35:0),rev:rev?.9:0};
 for(const [g] of LPG){const c=lpCur(v,g);if(!c)continue;const sps=S[g];
  if(sps)for(let i=0;i<2;i++){const sp=sps[i];let o=lv[g]||0;if(g==='sigF'||g==='sigR')o=(i?sR:sL)?.9:0;if(v==='civic'&&g==='headGlow'&&i===1&&dmg>35)o=0;if(F)o=(lpAll||g===lpSel)?.9:0;
   const show=(c.m||i===1)&&o>.01;sp.visible=show;if(show){sp.position.set((c.m?(i?1:-1):1)*c.x,c.y,c.z);sp.scale.set(c.s,c.s,1);sp.material.opacity=o}}
  const ax=S.axes[g];for(let i=0;i<2;i++){const a=ax[i],show=F&&g===lpSel&&(c.m||i===1);a.visible=show;if(show){const sg=c.m?(i?1:-1):1;a.position.set(sg*c.x,c.y,c.z);a.rotation.set(c.p*LPD,(sg<0?-c.w:c.w)*LPD,c.r*LPD,'YXZ');if(g!=='headBeam'&&g!=='exh'&&0)a.scale.setScalar(1)}}}
 /* cone de luz (feixe) */
 const hb=lpCur(v,'headBeam');if(hb){const bOn=!F||lpAll||lpSel==='headBeam';if(F)bm.uniforms.k.value=bOn?.9:0;beams.forEach((b,i)=>{b.position.set((hb.m?(i?1:-1):1)*hb.x,hb.y,hb.z);{const mi=hb.m&&!i?-1:1;b.rotation.set(hb.p*LPD,mi*hb.w*LPD,mi*hb.r*LPD,'YXZ')};b.scale.set(hb.s,hb.s,hiB?1:.55);if(F)b.visible=bOn;else if(!hb.m&&i===0)b.visible=false})}
 /* fumaça do escapamento */
 const ex=lpCur(v,'exh');
 if(ex&&(engineOn||F)&&(!F||lpAll||lpSel==='exh')){lpT+=dt;const thr=typeof thrS==='number'?thrS:0,per=F?.05:(.12-.08*thr);
  if(lpT>per){lpT=0;const fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd),p=ex.p*LPD,w=ex.w*LPD,dx=-Math.sin(w)*Math.cos(p),dy=Math.sin(p),dz=-Math.cos(w)*Math.cos(p),sp=(.9+thr*2.6)*(F?1:1),
   col=v==='truck'?(thr>.35?0x2a2a2a:0x8a8a8a):0xcfcfcf,al=v==='truck'?.25+.4*thr:.1+.18*thr,y0=H(pos.x,pos.z);
   for(let i=0;i<(ex.m?2:1);i++){const sg=ex.m?(i?1:-1):1,lx=sg*ex.x,wx=pos.x+rx*lx+fx*(-ex.z),wz=pos.z+rz*lx+fz*(-ex.z),ddx=sg*dx,
    vx=rx*ddx*sp+fx*(-dz)*sp,vz=rz*ddx*sp+fz*(-dz)*sp;civFxSmoke(wx,y0+ex.y,wz,al,col,vx,dy*sp,vz,.25*ex.s+.15)}}}
 civFxPool(dt)}
/* ao editar as luzes, o mundo fica no entardecer (18:24) com os faróis acesos; ao sair, volta a hora e o estado anteriores */
var lpSaved=null;
function lpEnter(){if(lpSaved)return;lpSaved={hourT,hour,lightsOn};hourT=hour=18.4;lightsOn=true;try{applyTOD()}catch(e){}}
function lpLeave(){if(!lpSaved)return;hourT=lpSaved.hourT;hour=lpSaved.hour;lightsOn=lpSaved.lightsOn;lpSaved=null;try{applyTOD()}catch(e){}}
['hback','hplay'].forEach(i=>{const b=$(i);if(b)b.addEventListener('click',lpLeave)});
/* ---------- interface ---------- */
const lpR=n=>+(+n).toFixed(3);
function lpCode(){const o={};for(const v of ['truck','civic']){if(!LPDEF[v])continue;o[v]={};for(const [g] of LPG){const c=lpCur(v,g);o[v][g]={};for(const k in c)o[v][g][k]=lpR(c[k])}}return JSON.stringify(o)}
function lpUI(){const box=$('lpe');if(!box)return;const v=lpV(),c=lpCur(v,lpSel);box.innerHTML='';
 const hd0=document.createElement('div');hd0.className='lph';const bk=document.createElement('button');bk.textContent='← Voltar';bk.onclick=()=>$('hback').click();const tt=document.createElement('b');tt.textContent='Editor de luzes · '+(v==='civic'?'Civic':'Caminhão');const al=document.createElement('button');al.textContent=lpAll?'Só o selecionado':'Ligar todas';al.className=lpAll?'on':'';al.onclick=()=>{lpAll=!lpAll;lpUI()};hd0.append(bk,tt,al);box.appendChild(hd0);
 const row=document.createElement('div');row.className='lpg';LPG.forEach(([g,n])=>{const b=document.createElement('button');b.textContent=n;b.className=g===lpSel?'on':'';b.onclick=()=>{lpSel=g;lpUI()};row.appendChild(b)});box.appendChild(row);
 const t=document.createElement('div');t.className='lpt';t.textContent=LPG.find(x=>x[0]===lpSel)[1];box.appendChild(t);
 const grid=document.createElement('div');grid.className='lpgrid';
 LPK.forEach(([k,n,mn,mx,st])=>{const r=document.createElement('label');r.className='lpr';const sp=document.createElement('span');sp.textContent=n;const rg=document.createElement('input');rg.type='range';rg.min=mn;rg.max=mx;rg.step=st;rg.value=c[k];const nm=document.createElement('input');nm.type='number';nm.min=mn;nm.max=mx;nm.step=st;nm.value=lpR(c[k]);
  const set=val=>{if(!isFinite(val))return;lpSet(v,lpSel,k,val);rg.value=val;nm.value=lpR(val);cd.value=lpCode()};rg.oninput=()=>set(+rg.value);nm.onchange=()=>set(+nm.value);r.append(sp,rg,nm);grid.appendChild(r)});
 box.appendChild(grid);
 const mr=document.createElement('label');mr.className='lpm';const ck=document.createElement('input');ck.type='checkbox';ck.checked=!!c.m;ck.onchange=()=>{lpSet(v,lpSel,'m',ck.checked?1:0);cd.value=lpCode()};mr.append(ck,document.createTextNode(' Espelhar (par esquerdo/direito)'));box.appendChild(mr);
 const cd=document.createElement('textarea');cd.id='lpcode';cd.rows=3;cd.value=lpCode();cd.spellcheck=false;
 const bt=document.createElement('div');bt.className='lpb';
 const btn=(txt,fn)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=fn;bt.appendChild(b);return b};
 btn('Copiar código',()=>{cd.value=lpCode();const ok=()=>{if(typeof msg==='function')msg('Código copiado')};try{navigator.clipboard.writeText(cd.value).then(ok,()=>{cd.select();document.execCommand('copy');ok()})}catch(e){cd.select();try{document.execCommand('copy')}catch(e2){}ok()}});
 btn('Aplicar código',()=>{try{const o=JSON.parse(cd.value);for(const vv of ['truck','civic'])if(o[vv]&&LPDEF[vv])for(const g in o[vv])if(LPDEF[vv][g])for(const k in o[vv][g])if(isFinite(o[vv][g][k])){(LPU[vv]=LPU[vv]||{});(LPU[vv][g]=LPU[vv][g]||{})[k]=+o[vv][g][k]}lpSave();lpUI();if(typeof msg==='function')msg('Código aplicado')}catch(e){if(typeof msg==='function')msg('Código inválido')}});
 btn('Resetar ponto',()=>{if(LPU[v])delete LPU[v][lpSel];lpSave();lpUI()});btn('Resetar veículo',()=>{delete LPU[v];lpSave();lpUI()});
 box.append(cd,bt)}
