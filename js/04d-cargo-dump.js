/* ===== 3) Areia · 4) Brita · 5) Terra e cascalho — caçamba basculante sobre o chassi base ===== */
function dumpLoad(tons,c){const b=MB(),f=fillOf(tons),L=9.6,z0=-4.8,FL=.4,WH=1.55,W=2.4,BC=c.body,DK=0x23262b;
 // subchassi, dobradiça traseira, cilindro hidráulico telescópico e para-choque
 b.box('x',0,.12,0,2.2,.16,11.2,DK);for(const s of[-1,1])b.box('x',s*.9,.28,0,.14,.2,10.4,0x30343a);
 for(let i=0;i<3;i++)b.cyl('x',0,.55+i*.35,-3.2,.15-i*.035,.38,i?0xb8bec6:0x7c828a,'y',12);b.box('x',0,.3,-3.2,.5,.12,.4,DK);
 b.cyl('x',0,FL-.02,L/2+.05,.07,2.3,0x6b7078,'x',8);b.box('x',0,.34,5.5,2.2,.12,.14,0xc8ccd0);for(const x of[-.8,0,.8])b.box('x',x,.2,5.5,.1,.3,.08,0xb3261e);
 // piso, laterais com nervuras, cabeceira alta com viseira e tampa traseira com travas
 b.box('p',0,FL,0,W,.1,L,BC);
 for(const s of[-1,1]){b.box('p',s*(W/2),FL+WH/2,0,.08,WH,L,BC);b.box('x',s*(W/2),FL+WH,0,.16,.1,L+.1,0x30343a);b.box('x',s*(W/2),FL+.06,0,.14,.1,L,0x30343a);
  for(let i=0;i<=10;i++)b.box('x',s*(W/2+.05),FL+WH/2,z0+.2+i*(L-.4)/10,.05,WH-.1,.09,0x30343a)}
 b.box('p',0,FL+WH/2+.15,z0,W,WH+.3,.1,BC);b.box('p',0,FL+WH+.55,z0-.35,W,.07,.8,BC,0,.5);for(const x of[-.8,0,.8])b.box('x',x,FL+WH/2+.15,z0-.07,.1,WH+.2,.06,0x30343a);
 b.box('p',0,FL+WH/2-.05,z0+L,W-.1,WH-.1,.08,jc(BC,3,3,.04));for(const s of[-1,1]){b.cyl('x',s*1.18,FL+WH-.1,L/2+.1,.07,.2,0x6b7078,'y',8);b.cyl('x',s*1.18,FL+.6,L/2+.18,.04,.5,0xc8ccd0,'y',6)}b.box('x',0,FL+WH-.1,L/2+.08,2.3,.1,.1,0x30343a);
 b.box('p',0,FL+WH*.5,z0+.1,W-.2,.28,.02,c.stripe); // faixa de identificação
 // monte de material: grade de colunas de altura variável (+ pedras soltas)
 const T=FL+.35+.8*f,cell=.3,nx=7,nz=Math.floor((L-.3)/cell),top=FL+WH+.42;
 for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=(ix-(nx-1)/2)*cell,z=z0+.25+iz*cell,u=iz/(nz-1),dome=Math.sin(Math.PI*u)*(.5+.5*Math.cos(x*1.3)),
   h=Math.min(top,T+(dome*.4+hh(ix,iz,c.seed)*c.rough)*(.4+.6*f)),y0=FL+.05;
  b.box('m',x,(y0+h)/2,z,cell+.02,h-y0,cell+.02,jc(c.col,ix*40+iz,c.seed,c.vary),0,0,0)}
 for(let i=0;i<c.rocks*f;i++){const x=(hh(i,1,c.seed)-.5)*2,z=z0+.5+hh(i,2,c.seed)*(L-1),s=.14+hh(i,3,c.seed)*.2;b.box('m',x,T+.3+hh(i,4,c.seed)*.2,z,s*1.3,s,s*1.1,jc(c.rock,i,c.seed,.3),hh(i,5,c.seed)*3,hh(i,6,c.seed),hh(i,7,c.seed))}
 return b.build()}
HEAVY['Areia']=t=>dumpLoad(t,{body:0xd98a1e,stripe:0x23262b,col:0xd9b878,rock:0xc4a468,vary:.1,rough:.05,rocks:0,seed:11});
HEAVY['Brita']=t=>dumpLoad(t,{body:0x4a5560,stripe:0xe8c020,col:0x8f9094,rock:0x74767a,vary:.3,rough:.18,rocks:70,seed:12});
HEAVY['Terra e cascalho']=t=>dumpLoad(t,{body:0xb3261e,stripe:0xf2f2ee,col:0x7a5638,rock:0xb09878,vary:.22,rough:.14,rocks:34,seed:13});
