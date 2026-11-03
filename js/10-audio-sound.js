// ---- som ----
let AC;const A={};let lBrk=0,lGear=0,lUp=false,lPh=0,lHb=false,creakCd=0;
function audio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();
 const m=AC.createGain(),cab=AC.createBiquadFilter(),cp=AC.createDynamicsCompressor();cab.type='lowpass';cab.frequency.value=9000;m.connect(cab);cab.connect(cp);cp.connect(AC.destination);A.m=m;A.cab=cab;
 const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.nb=nb;
 const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;ns.start();
 const G=(v=0)=>{const g=AC.createGain();g.gain.value=v;g.connect(m);return g},F=(t,f,q)=>{const x=AC.createBiquadFilter();x.type=t;x.frequency.value=f;if(q)x.Q.value=q;return x},
 O=(t,f=50)=>{const o=AC.createOscillator();o.type=t;o.frequency.value=f;o.start();return o},
 chain=(src,...n)=>{let p=src;for(const x of n){p.connect(x);p=x}return p};
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
 A.hg=G();const hf=F('lowpass',2400);hf.connect(A.hg);[233,294,349].forEach(f=>{const o=O('sawtooth',f);o.connect(hf)})
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
function audioStep(dt,now,vf,thr){if(!AC)return;const t=AC.currentTime,S=(p,v,c=.05)=>p.setTargetAtTime(v,t,c),sp=Math.abs(vf),ld=thrS;
 const rpm=eRpm*(1+(Math.random()-.5)*.012)+Math.sin(now*.011)*6,f=rpm/60*3,rn=Math.max(0,Math.min(1,(rpm-600)/1400)),mul=shiftT>0?.4:1;
 S(A.o1.frequency,f);S(A.o2.frequency,f*2.01);S(A.o3.frequency,f*.5);S(A.lf.frequency,f);S(A.lj.frequency,f*1.5);
 S(A.f1.frequency,150+rpm*.25+ld*220);S(A.f2.frequency,350+rpm*.25+ld*300);
 const e0=(.09+.07*rn)*mul;S(A.g1.gain,e0*(.7+.3*ld));S(A.g2.gain,e0*.5*(.4+ld*.6));S(A.g3.gain,e0*.5*(1-ld*.4));
 const lc=(.02+.05*ld+.02*rn)*mul;S(A.gc.gain,lc*.5);S(A.lfg.gain,lc*.5);
 S(A.ot.frequency,1400+rpm*1.7*(.35+ld));S(A.gt.gain,Math.max(0,ld*(rpm-900)/1000)*.016*mul);
 const eb=(ld<.1&&sp>1&&shiftT<=0)?Math.min(1,rpm/1900):0;S(A.gj.gain,eb*.07);S(A.ljg.gain,eb*.05);
 const cabin=camMode==2;S(A.gw.gain,Math.pow(sp/30,2)*.16*(cabin?.4:1));S(A.fw.frequency,300+sp*25);
 S(A.gr.gain,Math.min(1.4,sp/30)*(onRoad?.05:.11));S(A.fr.frequency,onRoad?260+sp*8:700+sp*12);
 S(A.hg.gain,K.horn?.07:0,.03);S(A.m.gain,muted?0:1,.03);S(A.cab.frequency,cabin?1600:9000,.15);
 if(gear!==lGear){if(!muted)clunk();lGear=gear}
 if(lBrk>.3&&brkP<.12&&!muted)psh(.5,.12);lBrk=brkP;                       // freio de ar solta
 if(K.hb!==lHb){if(!muted)psh(.45,.1,1800);lHb=K.hb}
 if(lUp&&!K.up&&ld>.6&&sp>3&&!muted)psh(.35,.06,3500);lUp=K.up;              // blow-off do turbo
 const ph=Math.floor(now/400);if((K.left||K.right)&&ph!==lPh&&!muted)relay(ph%2);lPh=ph; // relé da seta
 creakCd-=dt;if(Math.abs(sv.h)>1.4&&creakCd<=0&&!muted){creak();creakCd=.8}}

