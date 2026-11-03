/* ===== Powertrain: curva de torque por marcha (FH16 750 / I-Shift 12) ===== */
var TQ=[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]];
var TQK=1,boost=0,FFr=.5; // TQK: fator de torque (turbo) · boost: pressão do turbo 0–1 · FFr: fração do peso sobre o eixo dianteiro
const tq0=r=>{if(r<=TQ[0][0])return TQ[0][1];for(let i=1;i<TQ.length;i++)if(r<=TQ[i][0]){const a=TQ[i-1],b=TQ[i];return a[1]+(b[1]-a[1])*(r-a[0])/(b[0]-a[0])}return 0},tqAt=r=>tq0(r)*TQK;
var GR=[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD=3.07,WR=.52,JE=2.2,GRV=5.57;const EFF=.9;var MASS=15000,cargo=0;
/* ---- perfis de veículo: carreta (Volvo FH16) e Honda Civic. applyVeh() troca motor, câmbio, massa, colisão e câmera ---- */
const VP={
 truck:{id:'truck',car:0,L:3.98,m0:11000,mh:15000,fuel:300,fc:1,TQ:[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]],GR:[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD:3.07,WR:.52,JE:2.2,GRV:5.57,
  idle:650,rv:650,lim:1900,limN:2200,up:[1500,1750],dn:[700,950],minR:1150,revLim:1650,revRv:600,span:1400,vgov:27.8,eb:1800,tqMax:3550,gref:9,cda:[4.6,6.2],CZ:[.3,-1.9,-3.9,-5.3],CR:1.4,cam:1,turbo:0,st:.62,stv:9,sr:6,vch2:1e9,bp:{k:70,c:11,pc:.0012,pm:.015,tq:.006},br:{k:80,c:10,rc:.003,rm:.07},bh:{k:90,c:8,m:.15},cabin:[-.45,2.92,-3.95],spot:[.8,1.3,-5.6],camY:2},
 civic:{id:'civic',car:1,L:2.7,m0:1450,mh:1450,fuel:50,fc:.17,TQ:[[700,120],[1000,190],[1500,240],[1700,250],[4500,250],[5500,215],[6200,170],[6700,0]],GR:[3.64,2.08,1.36,1.03,.82,.68],FD:4.1,WR:.32,JE:.22,GRV:3.4,
  idle:800,rv:900,lim:6500,limN:6800,up:[3200,5800],dn:[1500,2300],minR:1900,revLim:3500,revRv:800,span:4500,vgov:52,eb:140,tqMax:250,gref:3.6,cda:[.65,.65],CZ:[.4,-.95,-2.3,-3.55],CR:1.0,cam:.5,turbo:1,st:.6,stv:15,sr:9,vch2:1300,bp:{k:150,c:17,pc:.0042,pm:.045,tq:.004},br:{k:170,c:19,rc:.0072,rm:.085},bh:{k:150,c:15,m:.08},cabin:[-.4,1.15,-1.2],spot:[.6,.75,-3.2],camY:1.2}};
var VEH=VP.truck;
function applyVeh(id){const v=VP[id]||VP.truck;VEH=v;TQ=v.TQ;GR=v.GR;FD=v.FD;WR=v.WR;JE=v.JE;GRV=v.GRV;L=v.L;FUELMAX=v.fuel;CZ=v.CZ;CR=v.CR;MASS=v.m0;cargo=0;gear=0;eRpm=v.idle;fuel=Math.min(fuel,FUELMAX);boost=0;TQK=1;FFr=v.car?.6:.5;manual=false;mReq=0}
var hiB=false; /* farol alto (H) */
var manual=false,mReq=0; /* câmbio manual do Civic: B alterna, X sobe, Z desce */
var wsp=0,absOn=0,absT=0,hbL=false,slipS=0; /* patinagem, ABS ativo, freio de mão, derrapagem lateral */
var fuel=300,FUELMAX=300;let gear=0,eRpm=650,shiftT=0,thrS=0,brkP=0,dmg=0,yawKick=0;
var engineOn=true,engCrank=0,inRev=false,torRamp=1,trqCab=0,shiftKick=0,trqS=0; // torRamp: retomada do torque após a troca · trqCab: torque no chassi (0–1) · shiftKick: tranco de troca p/ a cabine
// resistência (m/s²): rolamento ∝ massa + arrasto aerodinâmico (força fixa, dividida pela massa)
function dragA(v,road){const v2=v*v,cda=(typeof hitched!=='undefined'&&hitched)?VEH.cda[1]:VEH.cda[0];return (road?.0075+.00006*v:.06)*9.8+.5*1.2*cda*v2/MASS}
// freio de ar: capacidade fixa em N; carga pesada = frenagem mais longa (limitada também pelo atrito)
function brakeCap(road){return Math.min(6.8,(road?.85:.55)*9.8*.92,200000/MASS)}
// peso sobre o eixo trator: limita a arrancada (carga pesa mais no cavalo mecânico)
function tracCap(road,v){const Mt=(typeof hitched!=='undefined'&&hitched)?7000+cargo*1000:0,Wd=VEH.car?MASS*FFr:6500+.3*Mt;return (road?.75:.45)*9.8*Math.min(1,Wd/MASS)*(.75+.25*Math.min(1,Math.max(0,v)/4))}
function powertrain(v,dt,nit,thr,road){
 if(!engineOn||engCrank>0){ // motor desligado ou na partida: sem torque, sem freio-motor; a rotação cai a zero ou sobe até a marcha lenta
  if(engCrank>0){engCrank-=dt;eRpm+=(650-eRpm)*Math.min(1,dt*2.2)}else eRpm+=(0-eRpm)*Math.min(1,dt*2.5);
  trqCab=0;torRamp=0;inRev=false;return 0}
 if(VEH.turbo){const bt=Math.max(0,Math.min(1,(eRpm-1300)/700))*Math.min(1,thr*1.2);boost+=(bt-boost)*Math.min(1,dt*(bt>boost?2.2:5));TQK=.62+.38*boost}else TQK=1; // turbo: sem pressão em baixa rotação/sem acelerar (lag ~0,5 s)
 const hv=(typeof hitched!=='undefined'&&hitched)?1:0,lim=nit?VEH.limN:VEH.lim,wr=Math.max(0,v)/WR*9.5493,rin=g=>wr*GR[g]*FD,Fav=(g,r)=>tqAt(r)*GR[g]*FD*EFF/WR;
 inRev=false;
 if(shiftT>0){shiftT-=dt;torRamp=0;if(shiftT<=0)shiftKick+=.07+Math.min(.05,cargo*.002*hv)} // embreagem fecha: torque volta e a cabine dá a "cabeçada"
 else{torRamp=Math.min(1,torRamp+dt/.14);const up=thr>.3?VEH.up[1]:VEH.up[0],dn=(thr>.3?VEH.dn[1]:VEH.dn[0])+Math.min(250,cargo*9*hv);let ng=gear;
  const need=MASS*(dragA(v,road)+9.8*Math.max(0,Math.sin(pitch))*.8+.12);
  if(rin(gear)>up&&gear<GR.length-1){ // sobe (pula até 3) só se a marcha seguinte ainda sustenta a carga/rampa
   for(let g=gear+1;g<=Math.min(GR.length-1,gear+3);g++)if(rin(g)>=VEH.minR&&(thr<.3||Fav(g,rin(g))*Math.max(.35,thr)>need))ng=g}
  else if(rin(gear)<dn&&gear>0){ng=gear-1;while(ng>0&&rin(ng)<dn)ng--}
  else if(thr>.85&&gear>0&&rin(gear-1)<(VEH.car?VEH.up[1]-700:lim-150)&&Fav(gear-1,rin(gear-1))>Fav(gear,rin(gear))*1.18)ng=gear-1; // kickdown
  if(VEH.car&&manual){ng=Math.max(0,Math.min(GR.length-1,gear+mReq));if(ng<gear&&rin(ng)>lim+300)ng=gear;mReq=0} /* manual: só troca quando você pede; não deixa reduzir para estourar o motor */
  if(ng!==gear){shiftKick-=(.04+Math.min(.03,cargo*.0012*hv))*(ng>gear?1:.6);shiftT=ng>gear?.22+Math.min(.45,cargo*.022*hv):.18;gear=ng}}
 const tgt=Math.min(lim+150,Math.max(rin(gear),VEH.idle+thr*VEH.rv));
 eRpm+=(tgt-eRpm)*Math.min(1,dt*(VEH.car?(tgt>eRpm?5.5:3.4):8)); /* inércia do volante do motor: o carro sobe/cai de giro mais devagar */
 const vgov=(VEH.vgov-.1*cargo*hv)*(nit?1.12:1); // limitador: carga pesada derruba a velocidade máxima
 let F=shiftT>0||rin(gear)>lim?0:thr*tqAt(eRpm)*GR[gear]*FD*EFF/WR*(nit?1.5:1)*(1-dmg*.004)*(fuel>0?1:0)*Math.max(0,Math.min(1,(vgov-v)/1.5))*torRamp;
 trqCab=shiftT>0?0:thr*tqAt(eRpm)/VEH.tqMax*torRamp*(.35+.65*Math.min(1,GR[gear]/VEH.gref));
 const meff=MASS+JE*Math.pow(GR[gear]*FD/WR,2);
 if(thr<.1&&v>1&&shiftT<=0)return -Math.min(1.8,VEH.eb*Math.min(1,eRpm/VEH.lim)*GR[gear]*FD*EFF/WR/meff); // freio motor
 const cap=tracCap(road,v)*(nit?1.3:1),want=F/meff;wsp=VEH.car&&thr>.3&&shiftT<=0?Math.max(0,Math.min(1,(want/cap-.9)*2.2)):0;if(wsp>0)eRpm=Math.min(lim,eRpm+wsp*900*dt); /* rodas patinam quando o torque pedido passa do limite de tração */
 return Math.min(want,cap*(1-.12*wsp)); // teto de tração (peso no eixo trator)
}
// ré: marcha de ré dedicada (relação curta), força limitada por tração e velocidade máxima ~19 km/h
function revAccel(vr,dt,thr,road){
 inRev=true;const r=vr/WR*9.5493*GRV*FD;
 const tgt=Math.max(r,VEH.idle+thr*VEH.revRv);eRpm+=(tgt-eRpm)*Math.min(1,dt*8);
 const F=r>VEH.revLim?0:thr*tqAt(eRpm)*GRV*FD*EFF/WR*(1-dmg*.004)*(fuel>0?1:0)*.85,meff=MASS+JE*Math.pow(GRV*FD/WR,2);
 return Math.min(F/meff,tracCap(road,Math.max(vr,1.5))*.7)
}
