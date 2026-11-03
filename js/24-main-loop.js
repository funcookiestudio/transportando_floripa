function frame(now){requestAnimationFrame(frame);const raw=now-last,dt=Math.min(.05,raw/1000);last=now;todStep(dt);qStep(raw);if(window.netFrame)netFrame(dt,now);if(!ready||menuOpen||window.HOME){if(ready&&window.HOME)homeFrame(dt,now);draw();return}
 accT=Math.min(.1,accT+dt);for(let n=0;n<12&&accT>=SDT;n++){phys(SDT);accT-=SDT}
 const thr=K.up?1:0;
 let fx=-Math.sin(hd),fz=-Math.cos(hd),rx=Math.cos(hd),rz=-Math.sin(hd);
 let vf=vel.x*fx+vel.z*fz,vl=vel.x*rx+vel.z*rz;
 fx=-Math.sin(hd);fz=-Math.cos(hd);rx=Math.cos(hd);rz=-Math.sin(hd);vf=vel.x*fx+vel.z*fz;
 acc+=((vf-prevVf)/Math.max(dt,.001)-acc)*Math.min(1,dt*5);prevVf=vf;
 const yr=H(pos.x,pos.z);HREF=yr;const yf=H(pos.x+fx*L,pos.z+fz*L),mx=pos.x+fx*2,mz=pos.z+fz*2,hr=H(mx+rx*1.1,mz+rz*1.1),hl=H(mx-rx*1.1,mz-rz*1.1);
 pitch+=(Math.atan2(yf-yr,L)-pitch)*Math.min(1,dt*10);roll+=(Math.atan2(hr-hl,2.2)-roll)*Math.min(1,dt*10);
 const lat=yawS*vf;{const tp=Math.max(-.015,Math.min(.015,acc*.0012)),tr=Math.max(-.07,Math.min(.07,-lat*.003));
 const yv=(yr-yrP)/Math.max(dt,.001),ya=(yv-yvP)/Math.max(dt,.001);yrP=yr;yvP=yv;
 sv.p+=((tp-xp)*70-sv.p*11)*dt;xp+=sv.p*dt;sv.r+=((tr-xr)*80-sv.r*10)*dt;xr+=sv.r*dt;
 sv.h+=(-hz*90-sv.h*8-Math.max(-60,Math.min(60,ya))*.5)*dt;hz+=sv.h*dt;hz=Math.max(-.15,Math.min(.15,hz))}
 const bob=hz-xp*2+Math.sin(now*.02)*.01*Math.min(1,Math.abs(vf)/10);
 pivot.position.set(pos.x,yr+bob,pos.z);pivot.rotation.set(pitch+xp,hd,roll+xr+tipSg*tipS*.28,'YXZ');
 spin-=vf*dt;updWheels();
 {const sT=Math.sin(th),cT=Math.cos(th),ax=pos.x+TLEN*sT,az=pos.z+TLEN*cT,yk=H(pos.x,pos.z);let tx=pos.x,tz=pos.z;if(hb){hb.t+=dt*2.2;const k=Math.min(1,hb.t),e=k*k*(3-2*k);tx=hb.x+(pos.x-hb.x)*e;tz=hb.z+(pos.z-hb.z)*e;if(hb.t>=1)hb=null}trl.position.set(tx,yk+.1,tz);
  pitchT+=(Math.atan2(yk-H(ax,az),TLEN)-pitchT)*Math.min(1,dt*8);trl.rotation.set(pitchT,th,tipSg*tipS*.28+rollT,'YXZ');tS.forEach(o=>{o.sp.rotation.x=spin/o.cy;susp(o,dt,sT,cT,yk)})}
 spots.forEach((s,i)=>{const v=lightsOn&&i<QL[qi].sp;if(s.visible!==v)s.visible=v;s.intensity=v?2.2:0});beamStep();HL.emissiveIntensity=lightsOn?2.2:.25;TL.emissiveIntensity=(K.down||K.hb)?2.4:(lightsOn?1.1:.4);AM.emissiveIntensity=(Math.floor(now/400)%2&&(K.left||K.right))?2.2:.4;
 roadFrame();trfUpd(dt);stFrame(dt);updTerrain();updObs();upCones(dt);fxUpd(dt,vf,vl,thr);
 jobFrame(dt);
 // câmera
 camH+=wrap(hd-camH)*Math.min(1,dt*3.5);const cfx=-Math.sin(camH+(camMode<2?orbYaw:0)),cfz=-Math.cos(camH+(camMode<2?orbYaw:0)),cx=pos.x+fx*3.2,cz=pos.z+fz*3.2,cy=yr+2;
 cam.fov+=((camMode==2?GS.fov:GS.fov-9+Math.abs(vf)*.35)-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix();
 if(camMode==2){V.set(-.45,2.92,-3.95);pivot.localToWorld(V);cam.position.copy(V);cam.quaternion.copy(pivot.quaternion).multiply(QO.setFromEuler(EO.set(-Math.max(-.8,Math.min(.8,orbPitch)),orbYaw,0,'YXZ')))}
 else{let P=camMode==0?.38:.43,P2=Math.max(.04,Math.min(1.45,P+orbPitch)),d=(camMode==0?27+Math.abs(vf)*.08:camMode==1?48:1)*zoom,h=camMode==3?70:d*Math.sin(P2);if(camMode<2)d*=Math.cos(P2);
  const tx=cx-cfx*d+(camMode==3?0:0),tz=cz-cfz*d;cam.position.set(tx,Math.max(cy+h,H(tx,tz)+2),tz);
  if(camMode==3)cam.position.set(cx,cy+70,cz+.01);cam.lookAt(cx+cfx*(camMode==3?0:5),cy+(camMode==3?0:2.2),cz+cfz*(camMode==3?0:5))}
 if(shake>0){cam.position.x+=(Math.random()-.5)*shake;cam.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*1.5)}
 if(window.hzFrame)hzFrame(dt,vf);
 sunFollow();
 // áudio
 const g=gear,rpm=Math.max(0,Math.min(1,(eRpm-650)/1250));
 audioStep(dt,now,vf,thr);
 // HUD
 HUD.tS+=dt;HUD.tP+=dt;HUD.tA+=dt;
 if(HUD.tS>=.066){HUD.tS=0;const kmh=Math.round(Math.abs(vf)*3.6);hset('kmh',kmh);hgauge(kmh);hcls('gauge','hot',kmh>105);hset('gr',vf<-.5?'R':g+1);hcls('gb2','rev',vf<-.5);
  hcls('hbi','on',K.hb);hcls('pa','on',cruiseS>0);if(cruiseS)hset('pa',cruiseS===2?'PA '+Math.round(cruiseV*3.6):'PA…')}
 if(HUD.tP>=.1){HUD.tP=0;{const sb=stBay(),k=yardCo()?'📦':sb?(sb.k==='shop'?'🔧':'⛽'):coFuelZone()?'⛽':'',on=!menuOpen&&!HOME&&!!k;if(on!==HUD.cmb||k!==HUD.cmk){HUD.cmb=on;HUD.cmk=k;const e=document.getElementById('cmb');e.style.display=on?'':'none';if(k)e.textContent=k}}hcls('wf','on',fuel<FUELMAX*.15);hcls('wd','on',dmg>=60);
  if(HUD.sx){hset('fl',Math.round(fuel));hbar('fb',fuel/FUELMAX);hcls('fbw','low',fuel<FUELMAX*.15);hset('dm',Math.round(dmg));hbar('db',dmg/100);hset('cg',cargo);const ag=Math.round(Math.abs(th-hd)*57.3);hcls('agw','on',hitched&&ag>10);hset('ag',ag)}
  
  hset('mk',job?(dd>=1000?(dd/1000).toFixed(1)+' km':Math.round(dd)+' m'):'Vá a uma empresa');hset('jn',job?(job.phase==='pickup'?job.from.name:job.to.name):'Sem frete');
  hset('tm',job&&job.phase==='deliver'?Math.ceil(tLeft):'--');hset('sc',score);hset('cn',deliveries);hset('ps',stNear)}
 if(HUD.tA>=.2){HUD.tA=0;let t='';if(job){let inC=false;for(const a of COACT)if(Math.hypot(pos.x-a.x,pos.z-a.z)<70){inC=true;break}
  if(inC){const nw=navPoint(),tx2=nw.x-pos.x,tz2=nw.z-pos.z,an=Math.atan2(tx2*rx+tz2*rz,tx2*fx+tz2*fz);const aa=Math.abs(an);if(HUD.dOn){if(aa<.5)HUD.dOn=false}else if(aa>1)HUD.dOn=true;if(HUD.dOn){if(!HUD.dS||(aa>.5&&aa<2.6&&Math.sign(an)!==HUD.dS&&aa>.9))HUD.dS=Math.sign(an);t=HUD.dS>0?'▶':'◀'}else HUD.dS=0}}
  hset('dir',t);hcls('dir','on',!!t)}
 updLights();updEnv();draw()}
applyTOD();initFX();setQ(qi);gfxInit();
requestAnimationFrame(frame);
