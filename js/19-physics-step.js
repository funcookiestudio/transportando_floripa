/* ===== Passo fixo de física (120 Hz com acumulador) ===== */
const SDT=1/120;let accT=0,yawS=0,thrR=0,cruiseS=0,cruiseV=0,cruiseI=0,lastUp=false,lastTap=0;
function phys(dt){
 let fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd);
 let vf=vel.x*fx+vel.z*fz,vl=vel.x*rx+vel.z*rz;
 const nit=K.nitro;
 // piloto automático: 2 toques no acelerador armam; ao soltar trava a velocidade; freio, freio de mão ou 2 toques desligam
 {const now=performance.now(),up=!!K.up;
  if(up&&!lastUp){if(now-lastTap<380){if(cruiseS){cruiseS=0;msg('Piloto automático desligado')}else if(vf>2.5){cruiseS=1;cruiseI=0;msg('Piloto automático: solte o acelerador para travar a velocidade')}lastTap=0}else lastTap=now}
  if(!up&&lastUp&&cruiseS===1){cruiseS=2;cruiseV=Math.max(vf,2.5);msg('Piloto automático travado em '+Math.round(cruiseV*3.6)+' km/h')}
  lastUp=up;if(cruiseS&&(K.down||K.hb||vf<1)){cruiseS=0;msg('Piloto automático desligado')}}
 if(cruiseS===2&&!K.up){cruiseI=Math.max(0,Math.min(.6,cruiseI+(cruiseV-vf)*dt*.25));if(vf>cruiseV+1.5)vf-=Math.min(2,(vf-cruiseV-1)*.8)*dt}
 thrS+=((K.up&&vf>=-.5?(K.ta||1):(cruiseS===2?Math.max(0,Math.min(1,(cruiseV-vf)*.5+cruiseI)):0))-thrS)*Math.min(1,dt*3);if(K.up&&vf<-.5)vf+=brakeCap(onRoad)*dt;FFr=VEH.car?Math.max(.38,Math.min(.8,.6-acc*.0197)):.5;vf+=powertrain(vf,dt,nit,thrS,onRoad)*dt; /* transferência de peso: acelerar tira peso do eixo dianteiro (tração dianteira), frear coloca */
 let brkA=0;const bT=K.down&&vf>.5?(K.ba||1):0;brkP+=(bT-brkP)*Math.min(1,dt*(bT>brkP?5:9)); // freio de ar: pressão sobe/solta com atraso
 if(K.down&&vf<=.5&&engineOn&&engCrank<=0){vf-=revAccel(Math.max(0,-vf),dt,thrR=(K.ba||1),onRoad)*dt;if(vf>-.5)thrS*=.9}
 else if(brkP>.01){brkA=brkP*brakeCap(onRoad);absOn=0;if(VEH.car&&brkP>.9&&vf>4){absOn=1;absT+=dt*16;brkA*=.9+.1*Math.sin(absT)} /* ABS: pedal pulsa perto do limite de aderência */vf-=Math.min(Math.max(0,vf),brkA*dt)}else absOn=0; // ABS: limita a 92% do atrito
 const rr=dragA(Math.abs(vf),onRoad)*dt;vf-=Math.sign(vf)*Math.min(Math.abs(vf),rr);
 vf-=9.8*Math.sin(pitch)*dt*.8;
 if(VEH.car&&K.hb&&!hbL&&vf>8)yawKick+=steer*Math.min(1,vf/22)*1.4; /* puxar o freio de mão em curva joga a traseira */
 hbL=!!K.hb;if(K.hb){vf*=Math.exp((VEH.car?-.55:-1.1)*dt)}
 const dyn=!!VEH.phys&&DYN.on,gFd=dyn?DYN.gF:1,gRd=dyn?DYN.gR:1, /* suspensão (Fase 2): a carga vertical de cada eixo escala a aderência dianteira/traseira */
 muF=VEH.car?(onRoad?1.08:.7):(dyn?DYN.mu:(onRoad?.85:.55)),aF=muF*9.8*Math.sqrt(Math.max(.15,1-Math.pow(brkA/(muF*9.8),2))),aR=(VEH.car?aF*Math.max(.45,Math.min(1.2,(1-FFr)/.4)):aF*gRd)*(K.hb?(VEH.car?.26:.4):1),dvMax=aR*dt;let dv=-vl*(1-Math.exp(-(VEH.car?14:7)*dt));
 if(dyn){ /* Fase 3 · eixo traseiro: a força lateral segue a curva do pneu (satura, cai um pouco ao deslizar e recupera aos poucos); a tração em uso e o deslizamento recente reduzem o limite */
  const cp=Math.max(.5,aR*(1-TYRE.mem*DYN.uR)*Math.sqrt(Math.max(.4,1-.8*DYN.uTr*DYN.uTr))),s=Math.abs(dv)/dt/cp,ach=cp*tyreF(s)*dt;DYN.sR=s;
  DYN.uR+=((s>.9?Math.min(1,(s-.9)*2.5):0)-DYN.uR)*(1-Math.exp(-dt*(s>.9?10:2.2)));
  if(Math.abs(dv)>ach){const k=Math.max(0,Math.min(1,(s-1)*2));vf-=Math.sign(vf)*Math.min(Math.abs(vf),.3*ach*k);dv=Math.sign(dv)*ach}}
 else if(Math.abs(dv)>dvMax){dv=Math.sign(dv)*dvMax;vf-=Math.sign(vf)*Math.min(Math.abs(vf),.3*dvMax)}vl+=dv;slipS=vl;
 vel.x=fx*vf+rx*vl;vel.z=fz*vf+rz*vl;
 const steerInput=(typeof K.sa==='number'?K.sa:((K.left?1:0)-(K.right?1:0))),ms=VEH.st/(1+Math.abs(vf)/VEH.stv),
  /* A direção do caminhão retorna um pouco mais rápido quando o motorista solta o comando.
     O Civic mantém exatamente a resposta original. */
  steerRate=VEH.car?VEH.sr:(Math.abs(steerInput)>.02?VEH.sr:VEH.sr*1.35),
  tg2=steerInput*ms+(dmg>30?(dmg-30)*.0003:0);
 steer+=(tg2-steer)*Math.min(1,dt*steerRate);
 const yMax=(VEH.car?1.02:1.15)*(VEH.car?aF*Math.max(.55,Math.min(1.15,FFr/.6)):aF*gFd)/Math.max(Math.abs(vf),1),yawD=vf/L*Math.tan(steer)/(1+vf*vf/VEH.vch2)*(K.hb?(VEH.car?1.8:1.35):1)*(1-.012*cargo),yaw=dyn?dynYaw(yawD,vf,yMax):Math.max(-yMax,Math.min(yMax,yawD)); /* caminhão com suspensão: guinada limitada pela aderência dianteira de forma progressiva (subesterço) · subesterço: a velocidade característica reduz a curva em alta */ hd+=(yaw+yawKick)*dt;yawKick*=Math.exp(-4*dt);yawS=yaw;
 pos.x+=vel.x*dt;pos.z+=vel.z*dt;collide();trailerStep(dt);rollover(dt,Math.abs(wT*1.25)>Math.abs(yawS)?wT*1.25*vf:yawS*vf);
 dynStep(dt);dynGuard();
}
