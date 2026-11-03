// ---- colisão ----
const CZ=[.3,-1.9,-3.9,-5.3],TZ=[3.5,7,10.5,13],CR=1.4;let pitchT=0,th=0,tipS=0,tipSg=1,jkMsg=0,skMsg=0,wT=0,rollT=0,vTp=0,decS=0;
function collide(){let hit=0;const pts=[];
 for(const zl of CZ)pts.push([pos.x+zl*Math.sin(hd),pos.z+zl*Math.cos(hd),zl,0]);
 if(hitched)for(const d of TZ)pts.push([pos.x+d*Math.sin(th),pos.z+d*Math.cos(th),d,1]); // semirreboque
 for(const[cx,cz,zl,tr]of pts){
  for(const o of obs){if(o.off)continue;const dx=cx-o.x,dz=cz-o.z,rr=CR+o.r,d2=dx*dx+dz*dz;if(d2<rr*rr&&d2>1e-6){const d=Math.sqrt(d2),nx=dx/d,nz=dz/d,pen=rr-d;pos.x+=nx*pen;pos.z+=nz*pen;const vn=vel.x*nx+vel.z*nz;if(vn<0){const e=o.k?.05:.15,sp=-vn; // quase inelástico: o impacto mata a velocidade normal
   vel.x-=vn*nx*(1+e);vel.z-=vn*nz*(1+e);
   const vn2=vel.x*nx+vel.z*nz,tx=vel.x-vn2*nx,tz=vel.z-vn2*nz;vel.x-=tx*.2;vel.z-=tz*.2; // atrito de raspão
   if(!tr)yawKick=Math.max(-1.5,Math.min(1.5,yawKick+zl*(-vn*(1+e))*(nx*Math.cos(hd)-nz*Math.sin(hd))/7)); // impacto fora do centro gira o caminhão
   if(sp>2.5)dmg=Math.min(100,dmg+sp*sp*(o.k?.22:.12));hit=Math.max(hit,sp)}}}
  if(!tr)cones.forEach((c,i)=>{const dx=c.x-cx,dz=c.z-cz;if(Math.abs(dx)>3||Math.abs(dz)>3)return;const d=Math.hypot(dx,dz);if(d<CR+.4&&c.y-H(c.x,c.z)<1){const sp=Math.hypot(vel.x,vel.z);c.vx=vel.x*1.1+dx/d*3;c.vz=vel.z*1.1+dz/d*3;c.vy=3+sp*.25+Math.random()*3;c.w=(Math.random()-.5)*14;c.aw=true;if(!c.hit){c.hit=true;nHit++;score+=5}}})}
 if(hit>3){shake=Math.min(.6,hit*.04);thud(hit)}}
function upCones(dt){let ch=false;cones.forEach((c,i)=>{if(!c.aw)return;c.vy-=22*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;c.rx+=c.w*dt;c.rz+=c.w*.7*dt;const g=H(c.x,c.z)+.4;
 if(c.y<g){c.y=g;c.vy=-c.vy*.3;c.vx*=.7;c.vz*=.7;c.w*=.6;if(Math.abs(c.vy)<1.2&&Math.hypot(c.vx,c.vz)<.6)c.aw=false}setCone(i);ch=true});if(ch)coneM.instanceMatrix.needsUpdate=true}

