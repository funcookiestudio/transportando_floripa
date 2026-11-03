/* ===== 1) Cimento ensacado (sider) · 2) Cimento a granel (silo) ===== */
HEAVY['Cimento ensacado']=HEAVY['Cimento']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,rows=Math.max(3,Math.floor((L*f-.2)/1.02)),BL=0x2a5fa8,ST=0x23262b;
 deckPlate(b,L,z0);
 // estrutura sider: cabeceira, colunas, longarinas e travessa traseira
 b.box('x',0,1.3,z0+.03,2.4,2.6,.08,0x8c9299);for(const x of[-.8,0,.8])b.box('x',x,1.3,z0+.09,.08,2.5,.06,ST);b.box('x',0,2.62,z0+.03,2.46,.1,.14,ST);
 for(const s of[-1,1]){b.box('x',s*1.2,2.5,z0+L/2,.07,.08,L,ST);b.box('x',s*1.2,.14,z0+L/2,.08,.14,L,ST);
  for(let i=0;i<=6;i++)b.box('x',s*1.2,1.32,z0+.12+i*(L-.24)/6,.07,2.36,.07,ST)}
 b.box('x',0,2.5,z0+L-.05,2.4,.1,.1,ST);for(const s of[-1,1])b.box('x',s*1.15,1.3,z0+L-.03,.1,2.5,.1,ST);b.box('x',0,.3,z0+L-.03,2.3,.12,.06,0xb3261e);
 // cortina fechada (lado −x) com tiras e fivelas; lado +x aberto, cortina recolhida na frente
 b.box('p',-1.215,1.32,z0+L/2,.03,2.3,L-.2,BL);for(let i=0;i<14;i++){b.box('p',-1.235,1.32,z0+.5+i*(L-1)/13,.02,2.3,.05,0x1c4a8c);b.box('x',-1.245,.28,z0+.5+i*(L-1)/13,.02,.07,.07,0xc8ccd0)}
 b.box('p',-1.235,2.42,z0+L/2,.02,.08,L-.2,0xf2f2ee);
 b.box('p',1.215,1.32,z0+.7,.03,2.3,1.2,BL);for(let i=0;i<5;i++)b.box('p',1.23,1.32,z0+.25+i*.22,.03,2.3,.03,0x1c4a8c);
 // pilhas de sacos (50 kg) em paletes, camadas cruzadas
 for(let r=0;r<rows;r++)for(const s of[-1,1]){const x=s*.57,z=z0+.7+r*1.02,k=r*2+(s>0?1:0);palletAt(b,x,.08,z,k);
  for(let l=0;l<9;l++){const y=.3+l*.14;
   if(l%2===0)for(const d of[-1,1])b.box('m',x+(hh(k,l,8)-.5)*.03,y,z+d*.25,1.08,.13,.48,jc(0xb9b4a6,k*13+l,d+2,.12),(hh(k,l,9)-.5)*.06);
   else for(const d of[-1,1])b.box('m',x+d*.27,y,z+(hh(k,l,8)-.5)*.03,.52,.13,.98,jc(0xb9b4a6,k*13+l,d+4,.12),(hh(k,l,9)-.5)*.06)}
  b.box('p',x,.3+9*.14-.06,z,.7,.012,.2,0x1f5fa8,0);b.box('p',x,.3+9*.14-.055,z+.001,.4,.013,.12,0xe8c020,0)}
 return b.build()};

HEAVY['Cimento a granel']=tons=>{const b=MB(),WH=0xe9ebee,GR=0x9aa1a8,Y=1.3,R0=1.08,RD=0x7a1d1d;
 // berços, longarinas de apoio e tanque (cilindro + cones + calotas)
 b.box('x',0,.1,0,2.2,.12,11.6,0x30343a);for(const z of[-3.6,0,3.6])b.box('x',0,.28,z,2.3,.4,.3,0x30343a);
 b.cyl('p',0,Y,0,R0,7.6,WH,'z',24);b.tap('p',0,Y,-4.9,.34,R0,2.2,WH,'z',24);b.tap('p',0,Y,4.9,R0,.34,2.2,WH,'z',24);
 b.sph('p',0,Y,-6.05,.34,.34,.3,GR);b.sph('p',0,Y,6.05,.34,.34,.3,GR);
 for(const z of[-3.8,-1.9,0,1.9,3.8])b.cyl('x',0,Y,z,R0+.025,.08,GR,'z',24);
 for(const z of[-3,3])b.cyl('p',0,Y,z,R0+.03,.5,RD,'z',24);
 // passarela superior com bocas de visita, válvula de alívio e corrimão baixo
 b.box('x',0,Y+R0+.03,-.2,.55,.04,7.4,0xc4c9ce);for(const s of[-1,1])b.box('x',s*.27,Y+R0+.12,-.2,.025,.16,7.4,GR);
 for(const z of[-2.8,0,2.8]){b.cyl('x',0,Y+R0+.1,z,.3,.14,GR,'y',16);b.cyl('x',0,Y+R0+.2,z,.24,.06,0x6b7078,'y',16);for(let a=0;a<6;a++)b.cyl('x',Math.cos(a*1.047)*.27,Y+R0+.19,z+Math.sin(a*1.047)*.27,.025,.06,0x30343a,'y',6)}
 b.cyl('x',.3,Y+R0+.22,3.5,.07,.28,0xd9822b,'y',8);
 // escada traseira, caixa de ar e tubulações de descarga
 for(const x of[-.22,.22])b.box('x',x,1.1,6.3,.04,2.2,.04,GR);for(let i=0;i<9;i++)b.box('x',0,.25+i*.24,6.3,.44,.03,.04,GR);
 b.box('p',-.75,.55,-5.2,.8,.8,.7,0xd9822b);b.cyl('x',-.75,.98,-5.2,.1,.1,0x30343a,'y',8);
 b.cyl('x',0,.55,5.7,.1,2.2,GR,'x',10);for(const x of[-.7,.7]){b.cyl('x',x,.55,5.7,.15,.12,0xd9402b,'y',10);b.box('x',x,.82,5.7,.3,.05,.06,0x30343a)}
 b.cyl('x',0,.4,-3,.07,2,GR,'x',8);for(let i=0;i<4;i++)b.tor('m',.95,.55+i*.1,-4.2,.3,.06,0x1a1b1e,'x');
 for(const z of[-1.5,1.5])b.cyl('x',1.17,.4,z,.2,.18,0x30343a,'x',10); // reservatórios laterais de ar
 return b.build()};
