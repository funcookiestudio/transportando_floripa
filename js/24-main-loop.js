function frame(now){requestAnimationFrame(frame);const raw=now-last,dt=Math.min(.05,raw/1000),dtP=Math.min(.1,raw/1000);last=now; /* dt: passo visual (molas da cabine, câmera, áudio) · dtP: tempo real entregue à física, até 100 ms (12 passos de 120 Hz): sem câmera lenta até ~10 FPS */const pvOn=typeof PV!=='undefined'&&PV.on;todStep(dt);if(!pvOn)qStep(raw);if(window.netFrame)netFrame(dt,now);if(!ready||menuOpen||window.HOME){if(ready&&window.HOME)homeFrame(dt,now);if(!pvOn)draw();return} // painel de fretes em tela cheia cobre o mundo: não renderiza o jogo por trás
 accT=Math.min(.1,accT+dtP);for(let n=0;n<12&&accT>=SDT;n++){phys(SDT);accT-=SDT}dynVisGuard();
 const thr=K.up?1:0;
 let fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd);
 let vf=vel.x*fx+vel.z*fz,vl=vel.x*rx+vel.z*rz;
 fx=-Math.sin(hd);fz=-Math.cos(hd);rx=Math.cos(hd);rz=-Math.sin(hd);vf=vel.x*fx+vel.z*fz;
 acc+=((vf-prevVf)/Math.max(dt,.001)-acc)*Math.min(1,dt*5);prevVf=vf;
 if(RESTY){HREF=RESTY.y;RESTY.t-=dt}const yr=H(pos.x,pos.z);if(RESTY&&(Math.abs(yr-RESTY.y)<1.2||RESTY.t<=0))RESTY=null;HREF=RESTY?RESTY.y:yr;const yf=H(pos.x+fx*L,pos.z+fz*L),mx=pos.x+fx*2,mz=pos.z+fz*2,hr=H(mx+rx*1.1,mz+rz*1.1),hl=H(mx-rx*1.1,mz-rz*1.1);
 pitch+=(Math.atan2(yf-yr,L)-pitch)*Math.min(1,dt*10);roll+=(Math.atan2(hr-hl,2.2)-roll)*Math.min(1,dt*10);
 const lat=yawS*vf,dyn=!!VEH.phys&&DYN.on;{const trqP=trqS;trqS+=(trqCab-trqS)*Math.min(1,dt*9);const trqD=(trqS-trqP)/Math.max(dt,.001); // torque do motor: cabine senta (pitch) e balança de lado ao pisar/aliviar
 if(shiftKick){sv.p+=shiftKick;sv.r+=shiftKick*(VEH.car?0:.35)*(gear&1?1:-1);shiftKick=0}trqCab*=Math.exp(-dt*6);
 const BP=VEH.bp,BR=VEH.br,BH=VEH.bh,tp=Math.max(-BP.pm*1.3,Math.min(BP.pm*1.3,acc*BP.pc+trqS*BP.tq-(dyn?DYN.pdd*.008:0))),tr=Math.max(-BR.rm,Math.min(BR.rm,-lat*BR.rc-(dyn?DYN.rdd*.008:0)+(VEH.car?0:Math.max(-.01,Math.min(.01,trqD*.0012)))));
 const yv=(yr-yrP)/Math.max(dt,.001),ya=dyn?DYN.zdd+DYN.xCab*DYN.pdd:(yv-yvP)/Math.max(dt,.001);yrP=yr;yvP=yv; /* cabine: com a suspensão ativa, reage à aceleração vertical do chassi no ponto da cabine */
 sv.p+=((tp-xp)*BP.k-sv.p*BP.c)*dt;xp+=sv.p*dt;sv.r+=((tr-xr)*BR.k-sv.r*BR.c)*dt;xr+=sv.r*dt;
 sv.h+=(-hz*BH.k-sv.h*BH.c-Math.max(-60,Math.min(60,ya))*.5)*dt;hz+=sv.h*dt;hz=Math.max(-BH.m,Math.min(BH.m,hz))}
 const bob=hz-xp*2+(VEH.car?0:Math.sin(now*.02)*.01*Math.min(1,Math.abs(vf)/10));
 pivot.position.set(pos.x,(dyn?DYN.yO:yr)+bob,pos.z);pivot.rotation.set((dyn?DYN.pB:pitch)+xp,hd,(dyn?DYN.rB:roll)+xr+tipSg*tipS*.28,'YXZ'); /* dyn: o chassi desenhado é o corpo suspenso (altura, arfagem e rolagem da suspensão) */
 spin-=vf*dt;updWheels();civStep(dt,vf);
 {const sT=Math.sin(th),cT=Math.cos(th),ax=pos.x+TLEN*sT,az=pos.z+TLEN*cT,yk=H(pos.x,pos.z);let tx=pos.x,tz=pos.z;if(hb){hb.t+=dt*2.2;const k=Math.min(1,hb.t),e=k*k*(3-2*k);tx=hb.x+(pos.x-hb.x)*e;tz=hb.z+(pos.z-hb.z)*e;if(hb.t>=1)hb=null}trl.position.set(tx,yk+.1,tz);
  pitchT+=(Math.atan2(yk-H(ax,az),TLEN)-pitchT)*Math.min(1,dt*8);trl.rotation.set(pitchT,th,tipSg*tipS*.28+rollT,'YXZ');gearStep(dt);tS.forEach(o=>{o.sp.rotation.x=spin/o.cy;susp(o,dt,sT,cT,yk)})}
 spots.forEach((s,i)=>{const v=lightsOn&&i<QL[qi].sp;if(s.visible!==v)s.visible=v;s.intensity=v?(hiB?3.6:1.9):0;s.distance=hiB?95:44;lpAimSpot(s,i)});beamStep();lpFrame(dt,vf);HL.emissiveIntensity=lightsOn?2.2:.25;TL.emissiveIntensity=(K.down||K.hb)?2.4:(lightsOn?1.1:.4);{const bl=Math.floor(now/400)%2; // setas: < esquerda · > direita (desligam sozinhas depois da curva)
 if(sigL){if(steer>.22)sigTL=1;else if(sigTL&&steer<.05){sigL=false;sigTL=0}}if(sigR){if(steer<-.22)sigTR=1;else if(sigTR&&steer>-.05){sigR=false;sigTR=0}}
 AM.emissiveIntensity=bl&&sigL?2.2:.4;AR.emissiveIntensity=bl&&sigR?2.2:.4}
 roadFrame();trfUpd(dt);if(window.GRID_ON)fuelFrame(dt);else stFrame(dt);updTerrain();if(window.g3Frame)g3Frame(dt);updObs();upCones(dt);fxUpd(dt,vf,vl,thr);
 jobFrame(dt);
 // câmera
 camH+=wrap(hd-camH)*Math.min(1,dt*3.5);const cfx=-Math.sin(camH+(camMode<2?orbYaw:0)),cfz=-Math.cos(camH+(camMode<2?orbYaw:0)),cx=pos.x+fx*VEH.ca,cz=pos.z+fz*VEH.ca,cy=yr+VEH.cy;
 cam.fov+=((camMode==2?GS.fov:GS.fov-9+Math.abs(vf)*.35)-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix();
 if(camMode==2){V.set(VEH.cabin[0],VEH.cabin[1],VEH.cabin[2]);pivot.localToWorld(V);cam.position.copy(V);cam.quaternion.copy(pivot.quaternion).multiply(QO.setFromEuler(EO.set(-Math.max(-.8,Math.min(.8,orbPitch)),orbYaw,0,'YXZ')))}
 else{let P=camMode==0?.38:.43,P2=Math.max(.04,Math.min(1.45,P+orbPitch)),d=(camMode==0?27+Math.abs(vf)*.08:camMode==1?48:1)*zoom*(camMode<2?VEH.cam:1),h=camMode==3?VEH.ctop:d*Math.sin(P2);if(camMode<2)d*=Math.cos(P2);
  const tx=cx-cfx*d+(camMode==3?0:0),tz=cz-cfz*d;cam.position.set(tx,Math.max(cy+h,H(tx,tz)+VEH.cmin),tz);
  if(camMode==3)cam.position.set(cx,cy+VEH.ctop,cz+.01);cam.lookAt(cx+cfx*(camMode==3?0:VEH.cla),cy+(camMode==3?0:VEH.cl),cz+cfz*(camMode==3?0:VEH.cla))}
 if(shake>0){cam.position.x+=(Math.random()-.5)*shake;cam.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*1.5)}
 if(window.hzFrame)hzFrame(dt,vf);
 sunFollow();
 // áudio
 const g=gear,rpm=Math.max(0,Math.min(1,(eRpm-VEH.idle)/(VEH.lim-VEH.idle)));
 audioStep(dt,now,vf,thr);
 // HUD
 HUD.tS+=dt;HUD.tP+=dt;HUD.tA+=dt;
 if(HUD.tS>=.066){HUD.tS=0;const kmh=Math.round(Math.abs(vf)*3.6);hset('kmh',kmh);{const rf=engineOn?eRpm/VEH.lim:0;hgauge(rf);hcls('gauge','hot',rf>.88)}hset('gr',vf<-.5?'R':g+1);hcls('gb2','rev',vf<-.5);
  hcls('hbi','on',K.hb);hcls('pa','on',cruiseS>0);if(cruiseS)hset('pa',cruiseS===2?'PA '+Math.round(cruiseV*3.6):'PA…')}
 if(HUD.tP>=.1){HUD.tP=0;{const sb=stBay(),k=yardCo()?'📦':sb?(sb.k==='shop'?'🔧':'⛽'):coFuelZone()?'⛽':'',on=!menuOpen&&!HOME&&!!k;if(on!==HUD.cmb||k!==HUD.cmk){HUD.cmb=on;HUD.cmk=k;const e=document.getElementById('cmb');e.style.display=on?'':'none';if(k)e.textContent=k}}hcls('wf','on',fuel<FUELMAX*.15);hcls('wd','on',dmg>=60);
  if(HUD.sx){hset('fl',Math.round(fuel));hset('fkm',String(Math.round(fuelKm)).padStart(4,'0'));hbar('fb',fuel/FUELMAX);hcls('fbw','low',fuel<FUELMAX*.15);hset('dm',Math.round(dmg));hbar('db',dmg/100);hset('cg',cargo);const ag=Math.round(Math.abs(th-hd)*57.3);hcls('agw','on',hitched&&ag>10);hset('ag',ag)}
  
  hset('mk',job?(dd>=1000?(dd/1000).toFixed(1)+' km':Math.round(dd)+' m'):'Vá a uma empresa');hset('jn',job?(job.phase==='pickup'?job.from.name:job.to.name):'Sem frete');
  hset('tm',job&&job.phase==='deliver'?Math.ceil(tLeft):'--');hset('sc',score);hset('cn',deliveries);hset('ps',stNear)}
 if(HUD.tA>=.2){HUD.tA=0;let t='';if(job){let inC=false;for(const a of COACT)if(Math.hypot(pos.x-a.x,pos.z-a.z)<70){inC=true;break}
  if(inC){const nw=navPoint(),tx2=nw.x-pos.x,tz2=nw.z-pos.z,an=Math.atan2(tx2*rx+tz2*rz,tx2*fx+tz2*fz);const aa=Math.abs(an);if(HUD.dOn){if(aa<.5)HUD.dOn=false}else if(aa>1)HUD.dOn=true;if(HUD.dOn){if(!HUD.dS||(aa>.5&&aa<2.6&&Math.sign(an)!==HUD.dS&&aa>.9))HUD.dS=Math.sign(an);t=HUD.dS>0?'▶':'◀'}else HUD.dS=0}}
  hset('dir',t);hcls('dir','on',!!t)}
 updLights();updEnv();draw()}
applyTOD();initFX();setQ(qi);gfxInit();
requestAnimationFrame(frame);
