// ---- som ----
let AC;const A={};var lLd=0,blipV=0,popCd=0,lCr=false,vtOn=0,vtS=0,SND={vtec:5900,bright:1,roar:1,dist:1,vol:1,pops:1};try{const _s=JSON.parse(localStorage.getItem('fh16snd')||'null');if(_s)Object.assign(SND,_s)}catch(e){}
let lBrk=0,lGear=0,lUp=false,lPh=0,lHb=false,creakCd=0;
function audio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();
 const m=AC.createGain(),cab=AC.createBiquadFilter(),cp=AC.createDynamicsCompressor();cab.type='lowpass';cab.frequency.value=9000;m.connect(cab);cab.connect(cp);cp.connect(AC.destination);A.m=m;A.cab=cab;
 const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.nb=nb;
 const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;ns.start();
 const G=(v=0)=>{const g=AC.createGain();g.gain.value=v;g.connect(m);return g},F=(t,f,q)=>{const x=AC.createBiquadFilter();x.type=t;x.frequency.value=f;if(q)x.Q.value=q;return x},
 O=(t,f=50)=>{const o=AC.createOscillator();o.type=t;o.frequency.value=f;o.start();return o},
 chain=(src,...n)=>{let p=src;for(const x of n){p.connect(x);p=x}return p};
 // turbo (apito) e pneus (patinagem/ABS/derrapagem)
 A.tw=O('sine',2400);A.twg=G();chain(A.tw,A.twg);A.sq=O('sawtooth',900);A.sqf=F('bandpass',1500,4);A.sqg=G();chain(A.sq,A.sqf,A.sqg);
 // motor diesel: fundamental + harmônico + sub + chacoalhar das injeções
 A.o1=O('sawtooth');A.f1=F('lowpass',300);A.g1=G();chain(A.o1,A.f1,A.g1);
 A.o2=O('sawtooth');A.f2=F('lowpass',650);A.g2=G();chain(A.o2,A.f2,A.g2);
 A.o3=O('square');A.f3=F('lowpass',170);A.g3=G();chain(A.o3,A.f3,A.g3);
 A.gc=G();chain(ns,F('bandpass',1400,1.1),A.gc);A.lf=O('square');A.lfg=AC.createGain();A.lfg.gain.value=0;chain(A.lf,A.lfg);A.lfg.connect(A.gc.gain);
 // turbo, freio motor, vento, rodagem, buzina
 A.ot=O('sine',1800);A.gt=G();chain(A.ot,A.gt);
 A.gj=G();chain(ns,F('bandpass',650,3),A.gj);A.lj=O('square');A.ljg=AC.createGain();A.ljg.gain.value=0;chain(A.lj,A.ljg);A.ljg.connect(A.gj.gain);
 A.gw=G();A.fw=F('lowpass',400);chain(ns,A.fw,A.gw);
 A.gr=G();A.fr=F('bandpass',500,.8);chain(ns,A.fr,A.gr);
 A.hg=G();const hf=F('lowpass',2400);hf.connect(A.hg);[233,294,349].forEach(f=>{const o=O('sawtooth',f);o.connect(hf)});
 civAudioBuild(G,F,O,chain,ns,m)
 }catch(e){}}
function env(g,t,a,d,pk){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+d)}
function nz(t,a,d,pk,type,f,q){const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=A.nb;fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;env(g,t,a,d,pk);s.connect(fl);fl.connect(g);g.connect(A.m);s.start(t,Math.random());s.stop(t+a+d+.05)}
function tn(t,type,f0,f1,a,d,pk){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+a+d);env(g,t,a,d,pk);o.connect(g);g.connect(A.m);o.start(t);o.stop(t+a+d+.05)}
const psh=(d,pk,f=2500)=>nz(AC.currentTime,.02,d,pk,'highpass',f);           // chiado de ar
const clunk=()=>{const t=AC.currentTime;tn(t,'sine',120,50,.004,.14,.14);nz(t,.003,.07,.05,'lowpass',500)}; // troca de marcha
const relay=on=>{const t=AC.currentTime;tn(t,'square',on?2100:1500,on?1900:1300,.001,.025,.05)};
const creak=()=>{const t=AC.currentTime,f=110+Math.random()*70;tn(t,'sawtooth',f,f*.7,.03,.22,.03)};
function thud(v){if(!AC||muted)return;const t=AC.currentTime,r=.8+Math.random()*.4;
 nz(t,.002,.35,Math.min(.5,v*.04),'lowpass',250+Math.random()*250);tn(t,'sine',95*r,38,.003,.3,Math.min(.5,v*.045));
 if(v>6){nz(t+.01,.005,.28,Math.min(.25,v*.02),'highpass',1700);tn(t,'square',170*r,120,.004,.12,.05)}}
var civLdP=0;
function audioStep(dt,now,vf,thr){if(!AC)return;const t=AC.currentTime,S=(p,v,c=.05)=>p.setTargetAtTime(v,t,c),sp=Math.abs(vf),ld=thrS;
 const car=VEH.car,tk=car?0:1,lope=car&&eRpm<1300?Math.sin(now*.0041)*16+Math.sin(now*.0173)*9+(Math.random()-.5)*10:0;blipV*=Math.exp(-dt*7);
 const rpm=eRpm*(1+(Math.random()-.5)*.012)+Math.sin(now*.011)*6+lope+blipV,f=rpm/60*(VEH.car?2:3),rn=Math.max(0,Math.min(1,(rpm-VEH.idle+50)/VEH.span)),mul=(shiftT>0?.4:1)*Math.min(1,Math.max(0,(eRpm-80)/450));
 S(A.o1.frequency,f);S(A.o2.frequency,f*2.01);S(A.o3.frequency,f*.5);S(A.lf.frequency,f);S(A.lj.frequency,f*1.5);
 const cb=VEH.car?650:0;S(A.f1.frequency,150+cb+rpm*.25+ld*220);S(A.f2.frequency,350+cb*1.6+rpm*.25+ld*300);
 const lmt=car&&rpm>VEH.lim-120&&ld>.5?(Math.sin(now*.09)>0?.25:1):1,e0=(.09+.07*rn)*mul*lmt*tk; /* corte de giro: o som "pica" no limitador */
 civLdP=ld;S(A.g1.gain,e0*(.7+.3*ld));S(A.g2.gain,e0*.5*(.4+ld*.6));S(A.g3.gain,e0*.5*(1-ld*.4));
 const lc=(.02+.05*ld+.02*rn)*mul*tk;S(A.gc.gain,lc*.5);S(A.lfg.gain,lc*.5);
 S(A.ot.frequency,1400+rpm*1.7*(.35+ld));S(A.gt.gain,Math.max(0,ld*(rpm-900)/1000)*.016*mul*tk);
 const eb=(ld<.1&&sp>1&&shiftT<=0)?Math.min(1,rpm/VEH.lim):0;S(A.gj.gain,eb*.07*tk);S(A.ljg.gain,eb*.05*tk);
 S(A.tw.frequency,2200+boost*3600);S(A.twg.gain,VEH.car&&engineOn?boost*(.2+.8*ld)*.012*Math.min(1,eRpm/2500):0);
 const sqv=VEH.car?Math.max(wsp*.8,absOn*.35,(K.hb&&sp>6?.5:0),Math.min(1,Math.abs(slipS)/4)*.6):0;S(A.sq.frequency,780+sp*9+wsp*200);S(A.sqg.gain,sqv*.02);
 const cabin=camMode==2;S(A.gw.gain,Math.pow(sp/30,2)*.16*(cabin?.4:1)*(VEH.car?1.5:1));S(A.fw.frequency,300+sp*25);
 S(A.gr.gain,Math.min(1.4,sp/30)*(onRoad?.05:.11));S(A.fr.frequency,onRoad?260+sp*8:700+sp*12);
 S(A.hg.gain,K.horn?.07:0,.03);S(A.m.gain,muted?0:1,.03);S(A.cab.frequency,cabin?(car?4200:1600):9000,.15);
 if(car)civAudioStep(dt,now,t,S,rpm,f,ld,sp,rn,mul,lmt,cabin);
 if(gear!==lGear){if(!muted){if(car)civShift(gear>lGear);else clunk()}lGear=gear}
 if(lBrk>.3&&brkP<.12&&!muted)psh(.5,.12);lBrk=brkP;                       // freio de ar solta
 if(K.hb!==lHb){if(!muted)psh(.45,.1,1800);lHb=K.hb}
 if(lUp&&!K.up&&ld>.6&&sp>3&&!muted)psh(.35,.06,3500);lUp=K.up;              // blow-off do turbo
 const ph=Math.floor(now/400);if((sigL||sigR)&&ph!==lPh&&!muted)relay(ph%2);lPh=ph; // relé da seta
 creakCd-=dt;if(Math.abs(sv.h)>1.4&&creakCd<=0&&!muted){creak();creakCd=.8}}

/* aba/janela em segundo plano: o loop de animação para, mas os osciladores continuavam tocando o último som do motor. Suspende o áudio ao esconder e retoma ao voltar */
function audioPause(on){try{if(!AC)return;if(on&&AC.state==='running')AC.suspend();else if(!on&&AC.state==='suspended')AC.resume()}catch(e){}}
document.addEventListener('visibilitychange',()=>audioPause(document.hidden));
addEventListener('pagehide',()=>audioPause(true));addEventListener('pageshow',()=>audioPause(document.hidden));
addEventListener('blur',()=>{if(document.hidden)audioPause(true)});

/* ===== Motor do Civic EK9 Type R (B16B): 4 cilindros aspirado, VTEC ~5900 rpm, 8400 rpm ===== */
function civAudioBuild(G,F,O,chain,ns,m){
 const Gb=(v=0)=>{const g=AC.createGain();g.gain.value=v;g.connect(bus);return g},bus=AC.createGain(),pre=AC.createGain(),sh=AC.createWaveShaper(),wet=AC.createGain(),dry=AC.createGain(),out=AC.createGain(),cf=F('lowpass',11000),ls=F('lowshelf',200);
 const c=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;c[i]=6*x/(1+5*Math.abs(x))} /* distorção suave do escapamento */
 sh.curve=c;pre.gain.value=6;wet.gain.value=.22;ls.gain.value=0;
 bus.connect(dry);bus.connect(pre);pre.connect(sh);sh.connect(wet);dry.connect(out);wet.connect(out);chain(out,cf,ls);ls.connect(m);
 const L=(type,r,ft,ff,q)=>{const o=O(type,100),fl=F(ft,ff,q),g=Gb();chain(o,fl,g);return{o,fl,g,r}};
 /* harmônicas da frequência de ignição (2x a rotação): 1x, 2x, 4x, 6x, 8x */
 A.cl=[L('sawtooth',1,'lowpass',500),L('sawtooth',2.003,'lowpass',1200),L('triangle',4.006,'lowpass',3000),L('sawtooth',6.01,'bandpass',2200,.9),L('sawtooth',8.02,'highpass',1800)];
 A.crg=Gb();A.crf=F('bandpass',600,1.2);chain(ns,A.crf,A.crg); /* ronco da admissão */
 A.cwg=AC.createGain();A.cwg.gain.value=0;A.cwg.connect(out);A.cw=O('sine',400);A.cw.connect(A.cwg); /* ruído da transmissão */
 A.cdry=dry;A.cwet=wet;A.ccf=cf;A.cls=ls}
function civPop(t,pk){nz(t,.002,.09,pk,'bandpass',450+Math.random()*500,2);tn(t,'sine',150,60,.002,.08,pk*.5)}
function civShift(up){const t=AC.currentTime;tn(t,'sine',170,70,.003,.09,.05);nz(t,.002,.05,.03,'lowpass',700);
 if(up)nz(t+.05,.01,.18,.03,'highpass',2200); /* respiro da admissão ao subir */
 else blipV=Math.min(1100,eRpm*.25+300)} /* rev-match: o motor dá uma "esticada" ao reduzir */
function civAudioStep(dt,now,t,S,rpm,f,ld,sp,rn,mul,lmt,cab){
 /* VTEC: acima de ~5900 rpm com acelerador aberto troca de comando; histerese de 200 rpm */
 if(engineOn){if(rpm>=SND.vtec&&ld>.3)vtOn=1;else if(rpm<SND.vtec-200)vtOn=0}else vtOn=0;
 const was=vtS;vtS+=(vtOn-vtS)*Math.min(1,dt/.08);
 if(vtOn&&was<.05&&vtS>=.05&&!muted){nz(t,.002,.07,.08,'bandpass',1800,1.5);tn(t,'sine',220,110,.002,.07,.06)} /* "tranco" do VTEC */
 const base=(.1+.06*rn)*mul*lmt*SND.vol*(.5+.5*ld),b=SND.bright,hk=cab?.8:1;
 A.cl.forEach((l,i)=>S(l.o.frequency,f*l.r));
 S(A.cl[0].fl.frequency,450+rpm*.12);S(A.cl[1].fl.frequency,900+rpm*.3*b);S(A.cl[2].fl.frequency,2500+rpm*.2*b);S(A.cl[3].fl.frequency,1500+rpm*.15);
 S(A.cl[0].g.gain,base*(1-.35*vtS)*hk);
 S(A.cl[1].g.gain,base*.5*(.7+.3*ld)*(1-.3*vtS)*hk);
 S(A.cl[2].g.gain,base*.32*(.35+.65*vtS)*hk);
 S(A.cl[3].g.gain,base*.2*vtS*b*(.5+.5*ld)*hk);
 S(A.cl[4].g.gain,base*.14*vtS*b*rn*hk);
 S(A.crf.frequency,350+rpm*.22);S(A.crg.gain,(.012+.05*ld)*Math.pow(rn,.7)*mul*(1+.4*vtS)*SND.roar*(cab?1.7:1)*(engineOn?1:0));
 /* distorção do escape e timbre: dentro do carro mais grave/ronco, fora mais escape */
 S(A.cwet.gain,.22*SND.dist*(cab?.6:1.2));S(A.cls.gain,cab?7:0,.2);S(A.ccf.frequency,cab?3400:11000,.15);
 /* partida: motor de arranque e pegada */
 if(engCrank>0&&!lCr&&!muted){tn(t,'sawtooth',55,95,.05,.85,.06);nz(t,.05,.8,.025,'bandpass',900,3)}
 if(lCr&&engCrank<=0&&engineOn&&!muted){nz(t,.01,.25,.15,'lowpass',400);tn(t,'sine',90,45,.01,.2,.12)}
 lCr=engCrank>0;
 /* estouros ao tirar o pé do acelerador */
 popCd-=dt;
 if(engineOn&&!muted&&SND.pops>0){
  if(lLd>.4&&ld<.05&&rpm>4500){const n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)civPop(t+.04+i*(.05+Math.random()*.09),.07*SND.pops)}
  else if(ld<.05&&sp>3&&rpm>3500&&popCd<=0){if(Math.random()<.4)civPop(t,.035*SND.pops);popCd=.12+Math.random()*.35}}
 /* ruído de engrenagens: sobe com a velocidade, mais audível dentro do carro */
 lLd=ld;
 S(A.cw.frequency,Math.min(2500,sp/WR*GR[Math.max(0,gear)]*FD/6.283*10));S(A.cwg.gain,Math.min(1,sp/35)*(.003+.003*ld)*(cab?2.2:1)*(engineOn?1:0))}
