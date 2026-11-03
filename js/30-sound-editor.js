/* ===== Aba "Som" do menu de pintura: ajuste do motor do Civic EK9 (VTEC) com pré-escuta ===== */
var snT=null,snSave=null,snRpm=3000,snThr=true;
const SND0={vtec:5900,bright:1,roar:1,dist:1,vol:1,pops:1};
const SNDEF=[['vtec','VTEC (rpm)',4500,7500,50],['bright','Brilho',0,2,.05],['roar','Ronco admissão',0,3,.05],['dist','Distorção escape',0,3,.05],['vol','Volume motor',0,2,.05],['pops','Estouros',0,2,.05]];
function snStore(){try{localStorage.setItem('fh16snd',JSON.stringify(SND))}catch(e){}}
function snStop(){if(snT){clearInterval(snT);snT=null}if(snSave){eRpm=snSave.r;thrS=snSave.t;snSave=null}}
function snPlay(){audio();if(!AC)return;try{AC.resume()}catch(e){}if(snT)return;snSave={r:eRpm,t:thrS};let l=performance.now();
 snT=setInterval(()=>{const n=performance.now(),dt=Math.min(.1,(n-l)/1000);l=n;eRpm=snRpm;thrS=snThr?1:0;audioStep(dt,n,0,thrS)},30)}
function snLeave(){snStop()}
function snUI(){const box=$('lpe');if(!box)return;box.innerHTML='';
 const h=document.createElement('div');h.className='lph';h.innerHTML='<button id="snb">Voltar</button><b>Som do motor (Civic EK9 Type R)</b>';box.appendChild(h);
 $('snb').onclick=()=>{snStop();hpTab='cab';hpDraw();hpFocusTab()};
 const g=document.createElement('div');g.className='lpgrid';box.appendChild(g);
 const row=(lab,min,max,step,val,fn)=>{const r=document.createElement('div');r.className='lpr';const s=document.createElement('input');s.type='range';s.min=min;s.max=max;s.step=step;s.value=val;const n=document.createElement('input');n.type='number';n.min=min;n.max=max;n.step=step;n.value=val;
  const set=v=>{v=Math.max(min,Math.min(max,+v||0));s.value=n.value=v;fn(v)};s.oninput=()=>set(s.value);n.onchange=()=>set(n.value);
  const l=document.createElement('span');l.textContent=lab;r.append(l,s,n);g.appendChild(r)};
 const code=document.createElement('textarea');code.rows=3;
 const upd=()=>{code.value=JSON.stringify(SND)};
 SNDEF.forEach(([k,lab,mn,mx,st])=>row(lab,mn,mx,st,SND[k],v=>{SND[k]=v;snStore();upd()}));
 const t=document.createElement('div');t.className='lpt';t.textContent='Pré-escuta';box.appendChild(t);
 const g2=document.createElement('div');g2.className='lpgrid';box.appendChild(g2);
 {const r=document.createElement('div');r.className='lpr';const s=document.createElement('input');s.type='range';s.min=800;s.max=8600;s.step=50;s.value=snRpm;const n=document.createElement('input');n.type='number';n.min=800;n.max=8600;n.step=50;n.value=snRpm;
  const set=v=>{snRpm=Math.max(800,Math.min(8600,+v||800));s.value=n.value=snRpm};s.oninput=()=>set(s.value);n.onchange=()=>set(n.value);const l=document.createElement('span');l.textContent='Rotação (rpm)';r.append(l,s,n);g2.appendChild(r)}
 const m=document.createElement('label');m.className='lpm';const ck=document.createElement('input');ck.type='checkbox';ck.checked=snThr;ck.onchange=()=>{snThr=ck.checked};m.append(ck,' Pé no acelerador');box.appendChild(m);
 const b=document.createElement('div');b.className='lpb';box.appendChild(b);
 const btn=(txt,fn)=>{const x=document.createElement('button');x.textContent=txt;x.onclick=()=>fn(x);b.appendChild(x);return x};
 btn(snT?'Parar motor':'Tocar motor',x=>{if(snT){snStop();x.textContent='Tocar motor'}else{snPlay();x.textContent='Parar motor'}});
 box.appendChild(code);upd();
 const b2=document.createElement('div');b2.className='lpb';box.appendChild(b2);
 const btn2=(txt,fn)=>{const x=document.createElement('button');x.textContent=txt;x.onclick=fn;b2.appendChild(x)};
 btn2('Copiar',()=>{upd();code.select();try{navigator.clipboard.writeText(code.value)}catch(e){try{document.execCommand('copy')}catch(_){}}});
 btn2('Aplicar',()=>{try{Object.assign(SND,JSON.parse(code.value));snStore();snUI()}catch(e){msg('Código inválido')}});
 btn2('Resetar',()=>{Object.assign(SND,SND0);snStore();snUI()})}
