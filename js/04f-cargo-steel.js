/* ===== 8) Vergalhões de aço · 9) Vigas metálicas · 10) Chapas de aço — prancha/extensiva com cabeceira, estacas e correntes ===== */
function flatbed(b,L,z0,stakeH,headH){const ST=0x23262b;deckPlate(b,L,z0,0x4a4f55);
 for(const s of[-1,1])for(let i=0;i<=6;i++){const z=z0+.2+i*(L-.4)/6;b.box('x',s*1.2,stakeH/2+.1,z,.07,stakeH,.08,0x6b7078);b.box('x',s*1.2,.12,z,.1,.1,.14,ST)}
 if(headH){b.box('x',0,headH/2+.1,z0+.03,2.4,headH,.08,0x8c9299);for(const x of[-1.1,-.55,0,.55,1.1])b.box('x',x,headH/2+.1,z0+.09,.07,headH,.06,ST);b.box('x',0,headH+.1,z0+.03,2.46,.08,.12,ST)}}
// corrente de amarração com catraca sobre a carga (altura yy, largura lw)
function chainOver(b,z,yy,lw){b.box('x',0,yy,z,lw,.03,.05,0x2a2d33);for(const s of[-1,1]){b.box('x',s*lw/2,yy/2+.05,z,.03,yy-.1,.05,0x2a2d33);b.box('p',s*(lw/2+.05),yy/2,z,.05,.16,.14,0xd9822b)}}

HEAVY['Vergalhões de aço']=HEAVY['Vergalhões']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,BL=Math.max(5,L*f-.4),zc=z0+.1+BL/2;flatbed(b,L,z0,1.3,1.9);
 const RC=[0x9a5a34,0x8a5030,0x7a4b32],TIE=0xc8ccd0,PAINT=[0xd9402b,0xe8c020,0x2f6fb5,0xf2f2ee],pk=[[0,0]];for(let a=0;a<6;a++)pk.push([Math.cos(a*1.0472)*.09,Math.sin(a*1.0472)*.09]);for(let a=0;a<6;a++){pk.push([Math.cos(a*1.0472)*.18,Math.sin(a*1.0472)*.18]);pk.push([Math.cos(a*1.0472+.5236)*.156,Math.sin(a*1.0472+.5236)*.156])}
 const rowsN=[5,4,3,2,1];let n=0;
 rowsN.forEach((cnt,ri)=>{for(let c=0;c<cnt;c++){const bx=(c-(cnt-1)/2)*.46,by=.35+ri*.4,k=n++,col=RC[k%3];
  for(let q=0;q<pk.length;q++)b.cyl('x',bx+pk[q][0],by+pk[q][1],zc,.046,BL,jc(col,k*20+q,6,.14),'z',6);
  for(let t=0;t<=BL/1.9;t++)b.cyl('m',bx,by,z0+.4+t*1.9<z0+BL?z0+.4+t*1.9:zc,.236,.035,TIE,'z',10);
  b.cyl('p',bx,by,zc+BL/2+.004,.23,.015,PAINT[k%4],'z',10);b.cyl('p',bx,by,zc-BL/2-.004,.23,.015,PAINT[k%4],'z',10)}});
 for(const z of[z0+1.2,zc,z0+BL-1.2])chainOver(b,z,1.55,2.3);
 b.box('p',0,.9,z0+BL+.3,.06,.55,.04,0x6b7078);b.box('p',.17,.98,z0+BL+.3,.28,.2,.015,0xd9402b); // bandeira de carga excedente
 return b.build()};

HEAVY['Vigas metálicas']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,BL=Math.max(5.5,L*f-.4),zc=z0+.1+BL/2,PC=[0xc8502a,0x8f9aa3,0x2f5f9a];flatbed(b,L,z0,.35,0);
 for(let ly=0;ly<3;ly++){const y=.14+ly*.46,n=8-(ly===2?2:0),h=ly===1?.34:.3,fw=.16,col=PC[ly];
  for(const z of[z0+.5,zc,z0+BL-.5])b.box('m',0,y-.02,z,2.3,.08,.1,0x9a7b4f); // calços de madeira
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*.29,k=ly*20+i,c=jc(col,k,7,.1);
   b.box('x',x,y+h/2+.05,zc,.018,h-.04,BL,c);b.box('x',x,y+.07,zc,fw,.025,BL,c);b.box('x',x,y+h+.03,zc,fw,.025,BL,c);
   b.box('p',x,y+h/2+.05,zc+BL/2+.003,fw,h,.012,0xe8c020);b.box('p',x,y+h/2+.05,zc-BL/2-.003,fw,h,.012,0xe8c020)}}
 for(const z of[z0+1.2,zc,z0+BL-1.2])chainOver(b,z,1.62,2.35);
 for(const z of[zc-1.5,zc+1.5])b.box('m',0,1.55,z,2.3,.04,.16,0x9a7b4f);
 return b.build()};

HEAVY['Chapas de aço']=tons=>{const b=MB(),f=fillOf(tons),L=11.8,z0=-5.9,PL=Math.min(5.8,L*f/(f>.9?2:1)-.2),secs=f>.9?2:1;flatbed(b,L,z0,.3,1.1);
 for(let q=0;q<secs;q++){const zc=z0+.2+PL/2+q*(PL+.2);
  for(const s of[-1,1]){const x=s*.58,w=1.1;
   for(const dz of[-PL/2+.3,-PL/6,PL/6,PL/2-.3])b.box('m',x,.16,zc+dz,w+.1,.1,.1,0x9a7b4f); // calços
   for(let k=0;k<10;k++){const y=.28+k*.1,kk=q*40+(s>0?20:0)+k;b.box('x',x+(hh(kk,1,9)-.5)*.04,y,zc+(hh(kk,2,9)-.5)*.06,w,.09,PL,jc(k%3?0x7f8790:0x6a727b,kk,8,.1))}
   b.box('x',x,1.34,zc,w+.02,.03,PL,0x8d969f);
   for(const dz of[-PL/2+.5,0,PL/2-.5]){b.box('m',x,.82,zc+dz,w+.05,1.08,.035,0x2a2d33);b.box('x',x,1.3,zc+dz,.1,.05,.07,0xd9822b)} // fitas de aço com lacres
   b.box('p',x,.82,zc+PL/2+.003,.5,.18,.01,0xf2f2ee)}} // etiqueta do lote
 for(let q=0;q<secs;q++)chainOver(b,z0+.2+PL/2+q*(PL+.2),1.45,2.35);
 return b.build()};
