/* ===== Powertrain: curva de torque por marcha (FH16 750 / I-Shift 12) ===== */
const TQ=[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]];
const tqAt=r=>{if(r<=TQ[0][0])return TQ[0][1];for(let i=1;i<TQ.length;i++)if(r<=TQ[i][0]){const a=TQ[i-1],b=TQ[i];return a[1]+(b[1]-a[1])*(r-a[0])/(b[0]-a[0])}return 0};
const GR=[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD=3.07,WR=.52,JE=2.2,EFF=.9;var MASS=15000,cargo=0;
let fuel=300,FUELMAX=300,gear=0,eRpm=650,shiftT=0,thrS=0,brkP=0,dmg=0,yawKick=0;
var inRev=false,torRamp=1,trqCab=0,shiftKick=0,trqS=0; // torRamp: retomada do torque após a troca · trqCab: torque no chassi (0–1) · shiftKick: tranco de troca p/ a cabine
// resistência (m/s²): rolamento ∝ massa + arrasto aerodinâmico (força fixa, dividida pela massa)
function dragA(v,road){const v2=v*v,cda=(typeof hitched!=='undefined'&&hitched)?6.2:4.6;return (road?.0075+.00006*v:.06)*9.8+.5*1.2*cda*v2/MASS}
// freio de ar: capacidade fixa em N; carga pesada = frenagem mais longa (limitada também pelo atrito)
function brakeCap(road){return Math.min(6.8,(road?.85:.55)*9.8*.92,200000/MASS)}
// peso sobre o eixo trator: limita a arrancada (carga pesa mais no cavalo mecânico)
function tracCap(road,v){const Mt=(typeof hitched!=='undefined'&&hitched)?7000+cargo*1000:0,Wd=6500+.3*Mt;return (road?.75:.45)*9.8*Math.min(1,Wd/MASS)*(.75+.25*Math.min(1,Math.max(0,v)/4))}
function powertrain(v,dt,nit,thr,road){
 const hv=(typeof hitched!=='undefined'&&hitched)?1:0,lim=nit?2200:1900,wr=Math.max(0,v)/WR*9.5493,rin=g=>wr*GR[g]*FD,Fav=(g,r)=>tqAt(r)*GR[g]*FD*EFF/WR;
 inRev=false;
 if(shiftT>0){shiftT-=dt;torRamp=0;if(shiftT<=0)shiftKick+=.07+Math.min(.05,cargo*.002*hv)} // embreagem fecha: torque volta e a cabine dá a "cabeçada"
 else{torRamp=Math.min(1,torRamp+dt/.14);const up=thr>.3?1750:1500,dn=(thr>.3?950:700)+Math.min(250,cargo*9*hv);let ng=gear;
  const need=MASS*(dragA(v,road)+9.8*Math.max(0,Math.sin(pitch))*.8+.12);
  if(rin(gear)>up&&gear<11){ // sobe (pula até 3) só se a marcha seguinte ainda sustenta a carga/rampa
   for(let g=gear+1;g<=Math.min(11,gear+3);g++)if(rin(g)>=1150&&(thr<.3||Fav(g,rin(g))*Math.max(.35,thr)>need))ng=g}
  else if(rin(gear)<dn&&gear>0){ng=gear-1;while(ng>0&&rin(ng)<dn)ng--}
  else if(thr>.85&&gear>0&&rin(gear-1)<lim-150&&Fav(gear-1,rin(gear-1))>Fav(gear,rin(gear))*1.18)ng=gear-1; // kickdown
  if(ng!==gear){shiftKick-=(.04+Math.min(.03,cargo*.0012*hv))*(ng>gear?1:.6);shiftT=ng>gear?.22+Math.min(.45,cargo*.022*hv):.18;gear=ng}}
 const tgt=Math.min(lim+150,Math.max(rin(gear),650+thr*650));
 eRpm+=(tgt-eRpm)*Math.min(1,dt*8);
 const vgov=(27.8-.1*cargo*hv)*(nit?1.12:1); // limitador: carga pesada derruba a velocidade máxima
 let F=shiftT>0||rin(gear)>lim?0:thr*tqAt(eRpm)*GR[gear]*FD*EFF/WR*(nit?1.5:1)*(1-dmg*.004)*(fuel>0?1:0)*Math.max(0,Math.min(1,(vgov-v)/1.5))*torRamp;
 trqCab=shiftT>0?0:thr*tqAt(eRpm)/3550*torRamp*(.35+.65*Math.min(1,GR[gear]/9));
 const meff=MASS+JE*Math.pow(GR[gear]*FD/WR,2);
 if(thr<.1&&v>1&&shiftT<=0)return -Math.min(1.8,1800*Math.min(1,eRpm/1900)*GR[gear]*FD*EFF/WR/meff); // freio motor
 return Math.min(F/meff,tracCap(road,v)*(nit?1.3:1)); // teto de tração (peso no eixo trator)
}
// ré: marcha de ré dedicada (relação curta), força limitada por tração e velocidade máxima ~19 km/h
const GRV=5.57;
function revAccel(vr,dt,thr,road){
 inRev=true;const r=vr/WR*9.5493*GRV*FD;
 const tgt=Math.max(r,650+thr*600);eRpm+=(tgt-eRpm)*Math.min(1,dt*8);
 const F=r>1650?0:thr*tqAt(eRpm)*GRV*FD*EFF/WR*(1-dmg*.004)*(fuel>0?1:0)*.85,meff=MASS+JE*Math.pow(GRV*FD/WR,2);
 return Math.min(F/meff,tracCap(road,Math.max(vr,1.5))*.7)
}
