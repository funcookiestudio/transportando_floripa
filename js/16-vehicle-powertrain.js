/* ===== Powertrain: curva de torque por marcha (FH16 750 / I-Shift 12) ===== */
var TQ=[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]];
var TQK=1,boost=0,FFr=.5; // TQK: fator de torque (turbo) · boost: pressão do turbo 0–1 · FFr: fração do peso sobre o eixo dianteiro
const tq0=r=>{if(r<=TQ[0][0])return TQ[0][1];for(let i=1;i<TQ.length;i++)if(r<=TQ[i][0]){const a=TQ[i-1],b=TQ[i];return a[1]+(b[1]-a[1])*(r-a[0])/(b[0]-a[0])}return 0},tqAt=r=>tq0(r)*TQK;
var GR=[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD=3.07,WR=.52,JE=2.2,GRV=5.57;const EFF=.9;var MASS=15000,cargo=0;
/* ---- perfis de veículo: carreta (Volvo FH16) e Honda Civic. applyVeh() troca motor, câmbio, massa, colisão e câmera ---- */
const VP={
 truck:{id:'truck',car:0,L:3.98,m0:11000,mh:15000,fuel:300,fc:1,TQ:[[500,1500],[700,2400],[1000,3350],[1100,3550],[1450,3550],[1700,3000],[1900,2500],[2100,1700],[2400,0]],GR:[14.94,11.73,9.21,7.09,5.57,4.35,3.44,2.70,2.14,1.65,1.30,1.00],FD:3.07,WR:.52,JE:2.2,GRV:5.57,
  idle:650,rv:650,lim:1900,limN:2200,up:[1500,1750],dn:[700,950],minR:1150,revLim:1650,revRv:600,span:1400,vgov:27.8,eb:1800,tqMax:3550,gref:9,cda:[4.6,6.2],CZ:[.3,-1.9,-3.9,-5.3],CR:1.4,cam:1,cy:2,cl:2.2,ca:3.2,cla:5,cmin:2,ctop:70,turbo:0,st:.62,stv:9,sr:6,vch2:1600,bp:{k:70,c:11,pc:.0012,pm:.015,tq:.006},br:{k:80,c:10,rc:.003,rm:.07},bh:{k:90,c:8,m:.15},cabin:[-.45,2.92,-3.95],spot:[.8,1.3,-5.6],camY:2},
 civic:{id:'civic',car:1,L:2.7,m0:1060,mh:1060,fuel:50,fc:.17,TQ:[[500,0],[800,62],[1000,76],[2000,100],[3000,112],[4000,121],[5000,129],[5700,134],[5900,131],[6000,146],[7000,158],[7500,160],[8000,152],[8400,138],[8600,0]],GR:[3.23,2.105,1.458,1.107,.848],FD:4.4,WR:.29,JE:.22,GRV:3.4,
  idle:850,rv:2800,lim:8400,limN:8700,up:[4800,8100],dn:[2200,3800],minR:2900,revLim:3500,revRv:800,span:7600,vgov:62,eb:150,tqMax:160,gref:3.6,cda:[.65,.65],CZ:[.4,-.95,-2.3,-3.55],CR:1.0,cam:.27,cy:.9,cl:.95,ca:1.5,cla:3.2,cmin:1,ctop:34,turbo:0,vtec:5900,st:.6,stv:15,sr:9,vch2:2400,bp:{k:150,c:25,pc:.0034,pm:.035,tq:.0015},br:{k:170,c:28,rc:.0048,rm:.06},bh:{k:150,c:25,m:.05},cabin:[-.4,1.15,-1.2],spot:[.6,.75,-3.2],camY:1.2}};
var VEH=VP.truck;
function applyVeh(id){const v=VP[id]||VP.truck;VEH=v;TQ=v.TQ;GR=v.GR;FD=v.FD;WR=v.WR;JE=v.JE;GRV=v.GRV;L=v.L;FUELMAX=v.fuel;CZ=v.CZ;CR=v.CR;MASS=v.m0;cargo=0;gear=0;eRpm=v.idle;fuel=Math.min(fuel,FUELMAX);boost=0;TQK=1;FFr=v.car?.6:.5;manual=false;mReq=0;clutchEng=v.car?1:0;if(typeof dynReset==='function')dynReset()}
var hiB=false; /* farol alto (H) */
var manual=false,mReq=0; /* câmbio manual do Civic: B alterna, X sobe, Z desce */
var wsp=0,absOn=0,absT=0,hbL=false,slipS=0; /* patinagem, ABS ativo, freio de mão, derrapagem lateral */
var fuel=300,FUELMAX=300;let gear=0,eRpm=650,shiftT=0,thrS=0,brkP=0,dmg=0,yawKick=0;
var engineOn=true,engCrank=0,inRev=false,torRamp=1,clutchEng=0,trqCab=0,shiftKick=0,trqS=0; // clutchEng: acoplamento simplificado da embreagem (0–1); Civic mantém acoplamento direto
// Massa dinâmica usada nos cálculos longitudinais. MASS continua como massa de gameplay/UI;
// quando engatado, soma cavalo + semirreboque + carga (sem duplicar a carga na quinta roda).
function powertrainMass(){return VEH.car?MASS:(VEH.m0+((typeof hitched!=='undefined'&&hitched)?7000+cargo*1000:0))}
// Resistência (m/s²): o arrasto aerodinâmico é força dividida pela massa física total.
function dragA(v,road){const v2=v*v,cda=(typeof hitched!=='undefined'&&hitched)?VEH.cda[1]:VEH.cda[0];return (road?.0075+.00006*v:.06)*9.8+.5*1.2*cda*v2/powertrainMass()}
// freio de ar: capacidade fixa em N; carga pesada = frenagem mais longa (limitada também pelo atrito)
function brakeCap(road){const mt=powertrainMass();return VEH.car?(road?9.2:5.5):Math.min(6.8,(VEH.phys&&DYN.on?DYN.mu*dynTerrainGrip():(road?.85:.55))*9.8*.92,200000/mt)}
// peso sobre o eixo trator: limita a arrancada (carga pesa mais no cavalo mecânico)
function tracCap(road,v){const Mt=(typeof hitched!=='undefined'&&hitched)?7000+cargo*1000:0,Wd=VEH.car?MASS*FFr:(VEH.phys&&DYN.on?DYN.mR:6500+.3*Mt); /* com a suspensão ativa, o peso no eixo trator vem das cargas por canto (transferência de peso) */return (VEH.car?(road?.95:.6):(VEH.phys&&DYN.on?DYN.muT*dynTerrainGrip():(road?.75:.45)))*9.8*Math.min(1,Wd/powertrainMass())*(.75+.25*Math.min(1,Math.max(0,v)/4))}
function powertrain(v,dt,nit,thr,road){DYN.uTr=0; /* uso da tração do eixo motriz neste passo (0–1), lido pela aderência lateral traseira */
 if(!engineOn||engCrank>0){ // motor desligado ou na partida: sem torque, sem freio-motor; a rotação cai a zero ou sobe até a marcha lenta
  if(engCrank>0){engCrank-=dt;eRpm+=(650-eRpm)*Math.min(1,dt*2.2)}else eRpm+=(0-eRpm)*Math.min(1,dt*2.5);
  trqCab=0;torRamp=0;if(!VEH.car)clutchEng=0;inRev=false;return 0}
 if(VEH.turbo){const bt=Math.max(0,Math.min(1,(eRpm-1300)/700))*Math.min(1,thr*1.2);boost+=(bt-boost)*Math.min(1,dt*(bt>boost?2.2:5));TQK=.62+.38*boost}else TQK=1; // turbo: sem pressão em baixa rotação/sem acelerar (lag ~0,5 s)
 const hv=(typeof hitched!=='undefined'&&hitched)?1:0,lim=nit?VEH.limN:VEH.lim,wr=Math.max(0,v)/WR*9.5493,rin=g=>wr*GR[g]*FD,Fav=(g,r)=>tqAt(r)*GR[g]*FD*EFF/WR;
 inRev=false;
 if(shiftT>0){shiftT-=dt;torRamp=0;if(shiftT<=0)shiftKick+=.07+Math.min(.05,cargo*.002*hv)} // embreagem fecha: torque volta e a cabine dá a "cabeçada"
 else{torRamp=Math.min(1,torRamp+dt/.14);const up=thr>.3?VEH.up[1]:VEH.up[0],dn=(thr>.3?VEH.dn[1]:VEH.dn[0])+Math.min(250,cargo*9*hv);let ng=gear;
  const need=powertrainMass()*(dragA(v,road)+9.8*Math.max(0,Math.sin(pitch))*.8+.12);
  if(rin(gear)>up&&gear<GR.length-1){ // sobe (pula até 3) só se a marcha seguinte ainda sustenta a carga/rampa
   for(let g=gear+1;g<=Math.min(GR.length-1,gear+(VEH.car?1:3));g++)if(rin(g)>=VEH.minR&&(thr<.3||Fav(g,rin(g))*Math.max(.35,thr)>need))ng=g}
  else if(rin(gear)<dn&&gear>0){ng=gear-1;while(ng>0&&rin(ng)<dn)ng--}
  else if(thr>.85&&gear>0&&rin(gear-1)<(VEH.car?VEH.up[1]-700:lim-150)&&Fav(gear-1,rin(gear-1))>Fav(gear,rin(gear))*1.18)ng=gear-1; // kickdown
  if(VEH.car&&manual){ng=Math.max(0,Math.min(GR.length-1,gear+mReq));if(ng<gear&&rin(ng)>lim+300)ng=gear;mReq=0} /* manual: só troca quando você pede; não deixa reduzir para estourar o motor */
  if(ng!==gear){shiftKick-=(.04+Math.min(.03,cargo*.0012*hv))*(ng>gear?1:.6);shiftT=ng>gear?(VEH.car?.15:.22)+Math.min(.45,cargo*.022*hv):(VEH.car?.12:.18);gear=ng}}
 // Embreagem simplificada do caminhão: desacopla durante a troca e patina progressivamente na arrancada.
 // O Civic permanece no modelo anterior (acoplamento direto), sem alteração de comportamento.
 if(!VEH.car){const cTarget=shiftT>0?0:Math.max(.12,Math.min(1,(Math.abs(v)+.35)/2.8));
  clutchEng+=(cTarget-clutchEng)*Math.min(1,dt*(cTarget>clutchEng?3.8:18));}
 else clutchEng=1;
 const wheelRpm=rin(gear),freeRpm=VEH.idle+thr*VEH.rv,
  tgt=Math.min(lim+150,Math.max(VEH.idle,wheelRpm*clutchEng+freeRpm*(1-clutchEng)));
 eRpm+=(tgt-eRpm)*Math.min(1,dt*(VEH.car?(tgt>eRpm?5.5:3.4):8)); /* inércia do volante do motor */
 const vgov=(VEH.vgov-.1*cargo*hv)*(nit?1.12:1); // limitador: carga pesada derruba a velocidade máxima
 let F=shiftT>0||wheelRpm>lim?0:thr*tqAt(eRpm)*GR[gear]*FD*EFF/WR*(nit?1.5:1)*(1-dmg*.004)*(fuel>0?1:0)*Math.max(0,Math.min(1,(vgov-v)/1.5))*torRamp*(VEH.car?1:clutchEng);
 trqCab=shiftT>0?0:thr*tqAt(eRpm)/VEH.tqMax*torRamp*(.35+.65*Math.min(1,GR[gear]/VEH.gref))*(VEH.car?1:clutchEng);
 const meff=powertrainMass()+JE*Math.pow(GR[gear]*FD/WR,2);
 if(thr<.1&&v>1&&shiftT<=0)return -Math.min(1.8,VEH.eb*Math.min(1,eRpm/VEH.lim)*GR[gear]*FD*EFF/WR/meff)*(VEH.car?1:clutchEng); // freio motor
 const cap=tracCap(road,v)*(nit?1.3:1),want=F/meff;wsp=(VEH.car||(VEH.phys&&DYN.on))&&thr>.3&&shiftT<=0?Math.max(0,Math.min(1,(want/cap-.9)*2.2)):0;if(wsp>0)eRpm=Math.min(lim,eRpm+wsp*900*dt); /* rodas patinam quando o torque pedido passa do limite de tração */
 if(!VEH.car&&VEH.phys&&DYN.on){const ach=cap*tyreF(want/cap);DYN.uTr=Math.min(1,ach/cap);return Math.min(want,ach)} // caminhão: a força de tração satura de forma progressiva (curva do pneu) e consome aderência lateral do eixo motriz
 return Math.min(want,cap*(1-.12*wsp)); // teto de tração (peso no eixo trator)
}
// ré: marcha de ré dedicada (relação curta), força limitada por tração e velocidade máxima ~19 km/h
function revAccel(vr,dt,thr,road){
 inRev=true;const r=vr/WR*9.5493*GRV*FD;
 const revFree=VEH.idle+thr*VEH.revRv,tgt=Math.max(VEH.idle,r*clutchEng+revFree*(1-clutchEng));eRpm+=(tgt-eRpm)*Math.min(1,dt*8);
 const F=r>VEH.revLim?0:thr*tqAt(eRpm)*GRV*FD*EFF/WR*(1-dmg*.004)*(fuel>0?1:0)*.85*(VEH.car?1:clutchEng),meff=powertrainMass()+JE*Math.pow(GRV*FD/WR,2);
 return Math.min(F/meff,tracCap(road,Math.max(vr,1.5))*.7)
}
