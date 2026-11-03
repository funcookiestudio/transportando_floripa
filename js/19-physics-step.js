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
 thrS+=((K.up&&vf>=-.5?(K.ta||1):(cruiseS===2?Math.max(0,Math.min(1,(cruiseV-vf)*.5+cruiseI)):0))-thrS)*Math.min(1,dt*3);if(K.up&&vf<-.5)vf+=brakeCap(onRoad)*dt;vf+=powertrain(vf,dt,nit,thrS,onRoad)*dt;
 let brkA=0;const bT=K.down&&vf>.5?(K.ba||1):0;brkP+=(bT-brkP)*Math.min(1,dt*(bT>brkP?5:9)); // freio de ar: pressão sobe/solta com atraso
 if(K.down&&vf<=.5&&engineOn&&engCrank<=0){vf-=revAccel(Math.max(0,-vf),dt,thrR=(K.ba||1),onRoad)*dt;if(vf>-.5)thrS*=.9}
 else if(brkP>.01){brkA=brkP*brakeCap(onRoad);vf-=Math.min(Math.max(0,vf),brkA*dt)} // ABS: limita a 92% do atrito
 const rr=dragA(Math.abs(vf),onRoad)*dt;vf-=Math.sign(vf)*Math.min(Math.abs(vf),rr);
 vf-=9.8*Math.sin(pitch)*dt*.8;
 if(K.hb){vf*=Math.exp(-1.1*dt)}
 const muF=onRoad?.85:.55,aF=muF*9.8*Math.sqrt(Math.max(.15,1-Math.pow(brkA/(muF*9.8),2))),aR=aF*(K.hb?.4:1),dvMax=aR*dt;let dv=-vl*(1-Math.exp(-7*dt));
 if(Math.abs(dv)>dvMax){dv=Math.sign(dv)*dvMax;vf-=Math.sign(vf)*Math.min(Math.abs(vf),.3*dvMax)}vl+=dv;
 vel.x=fx*vf+rx*vl;vel.z=fz*vf+rz*vl;
 const ms=.62/(1+Math.abs(vf)/9),tg2=(typeof K.sa==='number'?K.sa:((K.left?1:0)-(K.right?1:0)))*ms+(dmg>30?(dmg-30)*.0003:0);steer+=(tg2-steer)*Math.min(1,dt*6);
 const yMax=1.15*aF/Math.max(Math.abs(vf),1),yaw=Math.max(-yMax,Math.min(yMax,vf/L*Math.tan(steer)*(K.hb?1.35:1)*(1-.012*cargo)));hd+=(yaw+yawKick)*dt;yawKick*=Math.exp(-4*dt);yawS=yaw;
 pos.x+=vel.x*dt;pos.z+=vel.z*dt;collide();trailerStep(dt);rollover(dt,Math.abs(wT*1.25)>Math.abs(yawS)?wT*1.25*vf:yawS*vf);
}
