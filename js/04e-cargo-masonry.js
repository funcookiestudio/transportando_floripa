/* ===== 6) Tijolos (sider) · 7) Blocos de concreto (prancha com cintas) ===== */
// estrutura sider reutilizável: cabeceira, colunas, longarinas e cortinas (cl/cr: 'c' fechada · 'o' aberta/recolhida · 'n' sem cortina)
function siderFrame(b,L,z0,cl,cr,col){const ST=0x23262b,BL=col||0x2a5fa8;
 b.box('x',0,1.3,z0+.03,2.4,2.6,.08,0x8c9299);for(const x of[-.8,0,.8])b.box('x',x,1.3,z0+.09,.08,2.5,.06,ST);b.box('x',0,2.62,z0+.03,2.46,.1,.14,ST);
 for(const s of[-1,1]){b.box('x',s*1.2,2.5,z0+L/2,.07,.08,L,ST);b.box('x',s*1.2,.14,z0+L/2,.08,.14,L,ST);for(let i=0;i<=6;i++)b.box('x',s*1.2,1.32,z0+.12+i*(L-.24)/6,.07,2.36,.07,ST);
  const m=s<0?cl:cr;if(m==='c'){b.box('p',s*1.215,1.32,z0+L/2,.03,2.3,L-.2,BL);for(let i=0;i<14;i++){b.box('p',s*1.235,1.32,z0+.5+i*(L-1)/13,.02,2.3,.05,jc(BL,i,2,.1)-0x0a0a0a);b.box('x',s*1.245,.28,z0+.5+i*(L-1)/13,.02,.07,.07,0xc8ccd0)}}
  else if(m==='o'){b.box('p',s*1.215,1.32,z0+.7,.03,2.3,1.2,BL);for(let i=0;i<5;i++)b.box('p',s*1.23,1.32,z0+.25+i*.22,.03,2.3,.03,0x1c4a8c)}}
 b.box('x',0,2.5,z0+L-.05,2.4,.1,.1,ST);for(const s of[-1,1])b.box('x',s*1.15,1.3,z0+L-.03,.1,2.5,.1,ST)}
// cintas de poliéster sobre o topo e as laterais de um pacote
function strapPack(b,x,y,z,w,h,d,hex){for(const dz of[-.28,.28]){b.box('m',x,y+h/2,z+dz,w+.02,h+.01,.04,hex)}}

HEAVY['Tijolos']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,rows=Math.max(3,Math.floor((L*f-.2)/1.04));
 deckPlate(b,L,z0);siderFrame(b,L,z0,'o','o',0x2e6b3a);
 for(let r=0;r<rows;r++)for(const s of[-1,1])for(let l=0;l<2;l++){const x=s*.6,z=z0+.7+r*1.04,k=r*4+(s>0?2:0)+l,y=.08+l*1.18;
  if(!l)palletAt(b,x,y,z,k);else palletAt(b,x,y,z,k);const y0=y+.15,col=jc(0xb4553a,k,4,.18);
  b.box('m',x,y0+.5,z,1.08,1,.98,col);
  for(let i=1;i<6;i++)b.box('m',x,y0+i*.166,z,1.1,.012,1,0x6e3426); // juntas das fiadas
  for(let i=0;i<4;i++)for(let j=0;j<2;j++)b.box('m',x+(i-1.5)*.26,y0+.5+(j-.5)*.5,z+.495,.1,.14,.012,0x3a1b14); // furos do tijolo no topo da face
  b.box('m',x,y0+.5,z-.18,1.12,1.01,.035,0x15181c);b.box('m',x,y0+.5,z+.18,1.12,1.01,.035,0x15181c)} // cintas
 return b.build()};

HEAVY['Blocos de concreto']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,rows=Math.max(3,Math.floor((L*f-.2)/1.04)),ST=0x23262b;
 // prancha: piso, taipais baixos com ganchos para cintas, cabeceira em grade
 deckPlate(b,L,z0,0x4a4f55);
 for(const s of[-1,1]){b.box('x',s*1.2,.3,z0+L/2,.05,.22,L,ST);for(let i=0;i<=8;i++){const z=z0+.15+i*(L-.3)/8;b.box('x',s*1.2,.3,z,.08,.46,.08,0x6b7078);b.box('x',s*1.24,.22,z,.06,.05,.12,0xd9822b)}}
 b.box('x',0,1.3,z0+.03,2.4,.08,.08,ST);b.box('x',0,2.4,z0+.03,2.4,.08,.08,ST);for(const x of[-1.15,-.57,0,.57,1.15])b.box('x',x,1.35,z0+.03,.06,2.2,.08,ST);b.box('x',0,1.8,z0+.03,2.4,.06,.06,ST);
 for(let r=0;r<rows;r++)for(const s of[-1,1])for(let l=0;l<2;l++){const x=s*.6,z=z0+.7+r*1.04,k=r*4+(s>0?2:0)+l,y=.08+l*1.2,y0=y+.15;palletAt(b,x,y,z,k);
  b.box('m',x,y0+.47,z,1.14,.95,1,jc(0x9a9c9e,k,5,.14));
  for(let i=1;i<5;i++)b.box('m',x,y0+i*.19,z,1.16,.014,1.02,0x6d6f72); // fiadas
  for(let i=1;i<3;i++)b.box('m',x+(i-1.5)*.39,y0+.47,z+.505,.012,.95,.01,0x6d6f72);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)b.box('m',x+(i-1)*.39,y0+.95,z+(j-.5)*.5,.12,.01,.08,0x4a4c4f); // furos no topo
  strapPack(b,x,y0,z,1.14,.95,1,0xe8a317)}
 // cintas de amarração sobre a pilha toda, com catracas
 for(let i=0;i<=Math.floor(rows/3);i++){const z=z0+.7+i*3.12;if(z>z0+.7+(rows-1)*1.04)break;b.box('m',0,2.4,z,2.5,.02,.06,0xe8a317);for(const s of[-1,1]){b.box('m',s*1.25,1.3,z,.02,2.2,.06,0xe8a317);b.box('x',s*1.25,.5,z,.06,.12,.1,0xc8ccd0)}}
 return b.build()};
