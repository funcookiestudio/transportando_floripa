/* ===== Carroceria graneleira (lona recolhida) + 8 cargas a granel: soja, milho, trigo, arroz, açúcar, farelo, fertilizante, ração ===== */
const GRN={
 'Soja':{pnl:0x2c6aa0,g:()=>new THREE.SphereGeometry(1,6,4),sc:[1,.9,.95],sz:.03,c:[0xd9bb6c,0xcfae5e,0xe2c783],base:0xb89a4f,n:3600},
 'Milho':{pnl:0x2f7d46,g:()=>new THREE.CylinderGeometry(.62,.3,1,6),sc:[1,1.1,.55],sz:.034,c:[0xe6b82a,0xd9a720,0xf0c840],base:0xb88a14,n:3600},
 'Trigo':{pnl:0xb3261e,g:()=>new THREE.SphereGeometry(1,5,4),sc:[.5,1.4,.5],sz:.03,c:[0xdcc183,0xcfb06c,0xe6d09a],base:0xb89b5e,n:4000},
 'Arroz em casca':{pnl:0xd9a720,g:()=>new THREE.CylinderGeometry(.3,.3,1.3,6),sc:[1,1,.8],sz:.034,c:[0xd6c27c,0xc7b169,0xe0cf8f],base:0xa8975a,n:3600},
 'Açúcar a granel':{pnl:0xe9e9e3,g:()=>new THREE.BoxGeometry(1,1,1),sc:[1,.8,.9],sz:.028,c:[0xffffff,0xf3f1ea,0xe6e3d8],base:0xd8d5ca,n:4200,seal:1},
 'Farelo de soja':{pnl:0x4a4f55,g:()=>new THREE.IcosahedronGeometry(1,0),sc:[1,.6,.8],sz:.034,c:[0xc9ad74,0xbb9a5e,0xd6bd88],base:0x9d8350,n:4000,seal:1},
 'Fertilizante granulado':{pnl:0x2c6aa0,g:()=>new THREE.SphereGeometry(1,5,4),sc:[1,1,1],sz:.028,c:[0xe8e4d8,0xc9bfa5,0x9d9e9a],base:0x9a9686,n:4000,seal:1},
 'Ração a granel':{pnl:0x8a5a2b,g:()=>new THREE.CylinderGeometry(.5,.5,1,6),sc:[1,1.4,1],sz:.03,c:[0x8a5a2b,0x7a4d24,0x9a6a38],base:0x6a4220,n:3600}
};
function graneleira(name,tons){const c=GRN[name],b=MB(),f=fillOf(tons),FRM=0x23272b,FLR=0x5b6168,PNL=c.pnl,TARP=0x2b3036,ZN=0xb8bec4,
 hw=1.3,sH=1.5,hH=1.9,F=.13,L=11.9,x1=5.95,seed=name.length*977+7;
 /* subquadro e piso */
 for(const s of[-1,1]){b.box('x',s*.45,.029,0,.1,.09,L,FRM);for(let k=0;k<14;k++)b.box('x',s*.45,.084,-(-4.875+k*.75),.2,.02,.12,FRM)}
 b.box('x',0,F-.003,0,2*hw,.006,L,FLR);for(let k=0;k<15;k++){const x=-5.25+k*.75;if(Math.abs(x)<.4)continue;b.box('x',0,F-.031,-x,2*hw-.06,.05,.07,FRM)}
 /* laterais: painéis nervurados, montantes, longarinas */
 const dx=(L-.1)/14;
 for(const s of[-1,1]){
  b.box('x',s*(hw-.03),F+.05,0,.06,.1,L,FRM);b.box('x',s*hw,F+sH-.035,0,.08,.07,L,FRM);b.box('x',s*(hw+.015),F+.75,0,.045,.05,L,FRM);
  for(let i=0;i<14;i++){const xc=-5.95+.05+i*dx+dx/2,pw=dx-.07;b.box('p',s*(hw-.012),F+.1+(sH-.18)/2,-xc,.008,sH-.18,pw,PNL);for(const y of[.4,1.1,1.35])b.box('p',s*(hw-.001),F+y,-xc,.014,.035,pw,PNL)}
  for(let i=0;i<15;i++){const x=-5.95+.05+i*dx;b.box('x',s*(hw+.005),F+sH/2,-x,.05,sH,.07,FRM);b.box('x',s*(hw+.035),F+.12,-x,.012,.14,.1,FRM)}
  b.cyl('x',s*(hw+.065),F+sH-.1,0,.014,L-.1,FRM,'z',8)}
 /* cabeceira frontal */
 b.box('p',0,F+.1+(hH-.18)/2,-(x1-.025),2*hw-.1,hH-.18,.008,PNL);for(let k=-4;k<=4;k++)b.box('p',k*.28,F+.1+(hH-.22)/2,-(x1-.008),.05,hH-.22,.03,PNL);
 b.box('x',0,F+hH-.035,-(x1-.04),2*hw,.07,.08,FRM);b.box('x',0,F+.05,-(x1-.04),2*hw,.1,.08,FRM);b.box('x',0,F+.95,-(x1-.03),2*hw,.05,.06,FRM);
 for(const s of[-1,1]){b.box('x',s*hw,F+hH/2,-(x1-.04),.08,hH,.08,FRM);b.box('x',s*.65,F+hH/2,-(x1-.03),.06,hH-.1,.06,FRM)}
 /* traseira: travessas e portas fechadas com barras de travamento */
 b.box('x',0,F+.05,x1-.06,2*hw,.1,.06,FRM);b.box('x',0,F+sH-.035,x1-.04,2*hw,.07,.08,FRM);
 {const lw=hw-.01,hh=sH-.1;for(const s of[-1,1]){const lc=s*(hw-lw/2);
  b.box('p',lc,F+hh/2,x1,lw-.04,hh-.1,.008,PNL);b.box('x',lc,F+hh-.035,x1+.01,lw,.07,.05,FRM);b.box('x',lc,F+.05,x1+.01,lw,.05+.02,.05,FRM);b.box('x',lc,F+hh/2,x1+.01,lw-.1,.05,.05,FRM);
  for(const t of[.03,lw-.03])b.box('x',s*hw-s*t,F+hh/2,x1+.01,.06,hh,.05,FRM);
  for(const t of[.3,.55,.8])b.box('p',s*hw-s*lw*t,F+hh/2,x1+.012,.035,hh-.2,.02,PNL);
  b.cyl('x',s*(hw-(lw-.14)),F+hh/2,x1+.045,.014,hh+.12,ZN,'y',8);for(const y of[.02,hh-.02])b.box('x',s*(hw-(lw-.14)),F+y,x1+.045,.06,.05,.04,ZN);
  for(const y of[.2,0.7,1.2])b.cyl('x',s*hw,F+y,x1,.02,.12,ZN,'y',8)}}
 if(c.seal)for(const s of[-1,1]){b.box('x',s*(hw-.02),F+sH+.006,0,.012,.012,L,0x0b0b0b)} /* vedação da lona */
 /* arcos e lona recolhida na frente (carga visível) */
 {const R=(hw*hw+.09)/.6,half=Math.asin(hw/R),cy=F+sH+.3-R,arc=new THREE.TorusGeometry(R,.016,6,24,half*2);arc.rotateZ(Math.PI/2-half);
  for(let k=0;k<8;k++){const x=-5.95+.5+k*(L-1)/7;b.g('x',arc,0,cy,-x,1,1,1,0,0,0,FRM);for(const s of[-1,1])b.box('x',s*hw,F+sH+.02,-x,.09,.04,.06,FRM)}
  b.cyl('p',0,F+sH+.2,-(x1-.2),.15,2*hw-.2,TARP,'x',16);for(const x of[-.9,-.3,.3,.9])b.cyl('p',x,F+sH+.2,-(x1-.2),.155,.05,0xd8a21a,'x',16)}
 const grp=b.build(),disp=[grp.userData.dispose];
 /* carga: superfície ondulada (nível sobe com a lotação) + grãos instanciados */
 const h0=.55+.57*f,hx=5.8,hz=1.24,surf=(x,z)=>F+h0+.26*(1-(x/1.25)**2)+.03*Math.sin(z*3.1+x*2.2)+.02*Math.sin(z*7.3-x*4.1);
 const pg=new THREE.PlaneGeometry(2*hz,2*hx,24,90);pg.rotateX(-Math.PI/2);const pp=pg.attributes.position,col=[],cc=new THREE.Color();
 for(let i=0;i<pp.count;i++){pp.setY(i,surf(pp.getX(i),pp.getZ(i))-.02);cc.setHex(c.base).offsetHSL(0,0,(hh(i,7,5)-.5)*.08).convertSRGBToLinear();col.push(cc.r,cc.g,cc.b)}
 pg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));pg.computeVertexNormals();
 const sm=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1,flatShading:true}),sf=new THREE.Mesh(pg,sm);sf.receiveShadow=true;grp.add(sf);
 const im=new THREE.InstancedMesh(c.g(),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.75,flatShading:true}),c.n),D=new THREE.Object3D();im.receiveShadow=true;
 for(let i=0;i<c.n;i++){const x=(hh(i,1,seed)*2-1)*(hz-.03),z=(hh(i,2,seed)*2-1)*(hx-.03),s=c.sz*(.75+hh(i,3,seed)*.5);
  D.position.set(x,surf(x,z)+(hh(i,4,seed)-.5)*.03,z);D.rotation.set(hh(i,5,seed)*6.3,hh(i,6,seed)*6.3,hh(i,8,seed)*6.3);D.scale.set(s*c.sc[0],s*c.sc[1],s*c.sc[2]);D.updateMatrix();im.setMatrixAt(i,D.matrix);
  im.setColorAt(i,cc.setHex(c.c[Math.floor(hh(i,9,seed)*c.c.length)%c.c.length]).offsetHSL(0,0,(hh(i,10,seed)-.5)*.06))}
 im.frustumCulled=false;grp.add(im);disp.push(pg,sm,im.geometry,im.material,im);
 grp.userData.dispose=()=>disp.forEach(d=>d.dispose&&d.dispose());return grp}
for(const n in GRN)HEAVY[n]=tons=>graneleira(n,tons);
