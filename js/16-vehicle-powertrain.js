/* ===== Powertrain: curva de torque por marcha (FH16 750 / I-Shift 12) ===== */
const TQ=[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]];
const tqAt=r=>{if(r<=TQ[0][0])return TQ[0][1];for(let i=1;i<TQ.length;i++)if(r<=TQ[i][0]){const a=TQ[i-1],b=TQ[i];return a[1]+(b[1]-a[1])*(r-a[0])/(b[0]-a[0])}return 0};
const GR=[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD=3.07,WR=.52,JE=3.5,EFF=.9;var MASS=16000,cargo=0;
let fuel=300,FUELMAX=300,gear=0,eRpm=650,shiftT=0,thrS=0,brkP=0,dmg=0,yawKick=0;
function powertrain(v,dt,nit,thr,road){
 const lim=nit?2200:1900,wr=Math.max(0,v)/WR*9.5493,rin=g=>wr*GR[g]*FD;
 if(shiftT>0)shiftT-=dt;
 else{const up=thr>.3?1750:1500,dn=thr>.3?950:700,tg=thr>.3?1250:1000;let ng=gear;
  if(rin(gear)>up||rin(gear)<dn){ng=0;for(let g=11;g>=0;g--)if(rin(g)>=tg){ng=g;break}}
  if(ng!==gear){shiftT=ng>gear?.35:.15;gear=ng}}
 const tgt=Math.min(lim+150,Math.max(rin(gear),650+thr*650));
 eRpm+=(tgt-eRpm)*Math.min(1,dt*8);
 let F=shiftT>0||rin(gear)>lim?0:thr*tqAt(eRpm)*GR[gear]*FD*EFF/WR*(nit?1.5:1)*(1-dmg*.004)*(fuel>0?1:0);
 const meff=MASS+JE*Math.pow(GR[gear]*FD/WR,2);
 if(thr<.1&&v>1&&shiftT<=0)return -Math.min(1.8,1800*Math.min(1,eRpm/1900)*GR[gear]*FD*EFF/WR/meff); // freio motor
 return Math.min(F/meff,(road?2.8:1.6)*(nit?1.3:1)); // teto de tração
}
