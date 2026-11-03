/* ===== 11) Madeira serrada (carga seca aberta) · 12) Troncos de madeira (florestal, com cavaletes) ===== */
HEAVY['Madeira serrada']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,BL=Math.max(5,L*f-.3),zc=z0+.1+BL/2,ST=0x23262b;
 deckPlate(b,L,z0,0x4a4f55);for(const s of[-1,1])for(let i=0;i<=6;i++){const z=z0+.2+i*(L-.4)/6;b.box('x',s*1.2,.5,z,.07,.8,.08,0x6b7078)}
 b.box('x',0,1.3,z0+.03,2.4,2.4,.08,0x8c9299);for(const x of[-1.1,-.55,0,.55,1.1])b.box('x',x,1.3,z0+.09,.07,2.4,.06,ST);
 // pacotes de tábuas e caibros: cada pacote = camadas de peças com ripas separadoras e cintas
 const pk=(x,y,z,w,h,len,k)=>{const nL=Math.round(h/.05);for(let l=0;l<nL;l++){const c=jc(l%3?0xc9a36b:0xb98d55,k*30+l,10,.14);b.box('m',x,y+l*.05+.025,z,w,.047,len,c,(hh(k,l,10)-.5)*.004);if(l%4===0)for(let t=0;t<=len/1.2;t++)b.box('m',x,y+l*.05+.052,z-len/2+.1+t*1.2,w-.02,.012,.04,0x9a7b4f)}
  for(const dz of[-len/2+.5,0,len/2-.5])b.box('m',x,y+h/2,z+dz,w+.01,h+.01,.03,0x2a2d33)};
 let n=0;for(let r=0;r<3;r++)for(const s of[-1,1]){const h=r===2?.5:.7;pk(s*.58,.12+r*.75,zc,1.1,h,BL,n++)}
 // caibros finos de cima, ripas e lona enrolada
 for(let i=0;i<8;i++)b.box('m',(i-3.5)*.3,2.1,zc+(hh(i,1,11)-.5)*.2,.1,.08,BL-.4,jc(0xc9a36b,i,11,.18));
 for(const z of[z0+1.4,zc,z0+BL-1.4])chainOver(b,z,2.2,2.35);
 return b.build()};

HEAVY['Troncos de madeira']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,BL=Math.max(5.2,L*f-.3),zc=z0+.1+BL/2,ST=0x23262b,BARK=[0x6b4a2f,0x5e4029,0x7a5638],CUT=0xc9a36b;
 deckPlate(b,L,z0,0x4a4f55);
 // cavaletes florestais (bolsters) com estacas inclinadas e cabeceira de proteção
 for(const z of[z0+1.2,z0+L-1.2]){b.box('x',0,.28,z,2.4,.3,.3,ST);for(const s of[-1,1]){b.box('x',s*1.18,1.3,z,.09,2.4,.14,0x6b7078,0,0,s*.03);b.box('x',s*1.18,2.52,z,.16,.08,.2,ST)}}
 b.box('x',0,1.3,z0+.03,2.4,2.4,.1,0x8c9299);for(const x of[-1.1,-.55,0,.55,1.1])b.box('x',x,1.3,z0+.09,.08,2.4,.06,ST);
 // toras em pirâmide (3 camadas), cada uma com casca, seção cortada em anéis e nós
 const rows=[[-.8,-.27,.27,.8],[-.55,0,.55],[-.27,.27]],ys=[.62,1.28,1.86],RR=.34;let n=0;
 rows.forEach((xs,ri)=>xs.forEach((x,ci)=>{const k=n++,r=RR*(.85+.3*hh(k,3,12)),len=BL-hh(k,4,12)*.8,zz=zc+(hh(k,5,12)-.5)*.5,y=ys[ri]+(r-RR)*.5,c=jc(BARK[k%3],k,12,.16);
  b.cyl('m',x,y,zz,r,len,c,'z',10);for(let t=0;t<4;t++)b.box('m',x+(hh(k,t,13)-.5)*r,y+(hh(k,t+9,13)-.5)*r,zz+(hh(k,t+4,13)-.5)*len*.8,.09,.07,.18,0x3f2a1a,hh(k,t+7,13)); // nós e rugas
  for(const e of[-1,1]){b.cyl('m',x,y,zz+e*(len/2+.004),r*.96,.02,CUT,'z',10);b.cyl('m',x,y,zz+e*(len/2+.012),r*.62,.01,0xb08a55,'z',10);b.cyl('m',x,y,zz+e*(len/2+.018),r*.28,.01,0x8a6338,'z',10)}}));
 for(const z of[z0+1.2,z0+L-1.2])chainOver(b,z,2.25,2.4);
 b.box('p',0,.85,z0+BL+.35,.05,.8,.04,0x6b7078);b.box('p',.16,1.1,z0+BL+.35,.26,.2,.012,0xd9402b);
 return b.build()};
