/* ===== 13) Telhas (sider) · 14) Tubos de PVC (carga seca aberta) · 15) Estruturas pré-moldadas (prancha) ===== */
HEAVY['Telhas']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,rows=Math.max(3,Math.floor((L*f-.2)/1.04));
 deckPlate(b,L,z0);siderFrame(b,L,z0,'o','o',0x7a3b8c);
 for(let r=0;r<rows;r++)for(const s of[-1,1])for(let l=0;l<2;l++){const x=s*.6,z=z0+.7+r*1.04,k=r*4+(s>0?2:0)+l,y=.08+l*1.15;palletAt(b,x,y,z,k);const y0=y+.15,col=jc(0xc4613a,k,14,.14);
  b.box('m',x,y0+.46,z,1.06,.92,.96,col);
  for(let i=1;i<8;i++)b.box('m',x,y0+i*.115,z,1.08,.01,.98,0x8a3f22); // fiadas de telhas
  for(let i=0;i<9;i++)b.cyl('m',x+(i-4)*.12,y0+.94,z,.07,.94,jc(0xd0703f,k*9+i,14,.1),'z',6); // capas curvas no topo
  for(const dz of[-.3,.3])b.box('m',x,y0+.46,z+dz,1.1,.93,.03,0x15181c);b.box('m',x,y0+.3,z+.485,.7,.4,.01,0xf2f2ee)} // cintas e etiqueta
 return b.build()};

HEAVY['Tubos de PVC']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,secs=f>.9?2:1,PL=secs===2?5.7:Math.max(4.8,L*f/1.2),ST=0x23262b,CL=[0xe8e8e0,0x8b5a2b,0x2f6fb5,0xe8e8e0];flatbed(b,L,z0,2,1.6);let n=0;
 for(let q=0;q<secs;q++){const zc=z0+.2+PL/2+q*(PL+.3);
  for(const s of[-1,1]){const x=s*.58,col=CL[n++%4];
   for(const dz of[-PL/2+.4,0,PL/2-.4])b.box('m',x,.2,zc+dz,1.12,.1,.12,0x9a7b4f); // berços de madeira
   for(let ro=0;ro<8;ro++){const cnt=ro%2?8:9;for(let c=0;c<cnt;c++){const px=x+(c-(cnt-1)/2)*.12,py=.35+ro*.104,k=n*100+ro*10+c;
     b.cyl('m',px,py,zc,.056,PL,jc(col,k,15,.03),'z',8);b.cyl('m',px,py,zc-PL/2+.07,.066,.14,jc(col,k,16,.03),'z',8)}} // tubo + bolsa
   for(const dz of[-PL/2+1.2,0,PL/2-1.2])b.box('m',x,.76,zc+dz,1.16,.96,.03,0x2a2d33);
   b.box('p',x,.76,zc+PL/2+.01,.5,.16,.01,0xf2f2ee);b.box('p',x,.9,zc-PL/2+.35,.6,.06,.012,0x1c4a8c)}}
 for(let q=0;q<secs;q++)chainOver(b,z0+.2+PL/2+q*(PL+.3),1.3,2.35);
 return b.build()};

HEAVY['Estruturas pré-moldadas']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,BL=Math.max(5,L*f-.5),zc=z0+.2+BL/2,CC=0xb4b6b8,LY=f>.9?3:f>.7?2:1;flatbed(b,L,z0,.3,1.2);
 const loop=(x,y,z)=>b.tor('x',x,y,z,.07,.012,0xd9822b,'x'); let n=0,y=.1;
 for(let ly=0;ly<LY;ly++){for(const z of[zc-BL/2+.8,zc+BL/2-.8])b.box('m',0,y+.04,z,2.4,.08,.12,0x9a7b4f); y+=.08;
  for(const s of[-1,1]){const x=s*.6,k=n++;b.box('m',x,y+.11,zc,1.18,.22,BL,jc(CC,k,17,.08),0,0,0); // laje alveolar
   for(const e of[-1,1])for(let c=0;c<5;c++)b.cyl('m',x+(c-2)*.2,y+.11,zc+e*(BL/2+.004),.07,.012,0x5a5c5e,'z',8); // alvéolos nas pontas
   for(const dz of[-BL/2+.9,BL/2-.9])loop(x,y+.23,zc+dz)}
  y+=.22}
 // vigas I protendidas e pilar com consolo no topo
 {const h=.55,yb=y+.08;for(const s of[-1,1]){const x=s*.6,k=n++;for(const dz of[-BL/2+.9,BL/2-.9])b.box('m',x,y+.04,zc+dz,.6,.08,.12,0x9a7b4f);
  b.box('m',x,yb+h/2,zc,.1,h,BL-.1,jc(CC,k,18,.06));b.box('m',x,yb+.07,zc,.46,.14,BL-.1,jc(CC,k,19,.06));b.box('m',x,yb+h-.06,zc,.34,.12,BL-.1,jc(CC,k,20,.06));
  for(const dz of[-BL/2+1.3,BL/2-1.3])loop(x,yb+h+.02,zc+dz)}
  y=yb+h; // pilar quadrado com consolo deitado sobre as duas vigas
  for(const dz of[-BL/2+1.4,BL/2-1.4])b.box('m',0,y+.04,zc+dz,1.4,.08,.12,0x9a7b4f);
  b.box('m',0,y+.28,zc,.4,.4,BL-.8,jc(CC,n,21,.06));b.box('m',0,y+.3,zc-BL/2+.9,.6,.3,.4,jc(CC,n,22,.06));y+=.5}
 for(const z of[zc-BL/2+1,zc,zc+BL/2-1])chainOver(b,z,y+.1,2.35);
 b.box('p',0,.5,zc+BL/2+.4,.05,.7,.04,0x6b7078);b.box('p',.16,.75,zc+BL/2+.4,.26,.2,.012,0xd9402b);
 return b.build()};
