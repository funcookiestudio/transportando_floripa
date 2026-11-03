/* ===== Semirreboque articulado (quinta roda no eixo traseiro) · chassi porta-contêiner base (carreta_chassi_3d) ===== */
const TLEN=10.2,trl=new THREE.Group(),tW=[];scene.add(trl);
const TAX=[8.8,10.2,11.6],tS=[];
/* O chassi é desenhado em coordenadas do modelo original (x = comprimento, y = altura, z = lateral) e girado 90° ao entrar na carreta
   (eixo da carreta = z, pino-rei em z=0). Rodas e pneus NÃO são do modelo: são os traseiros do caminhão, criados em 25-boot nos eixos TAX. */
{const P={L:12.2,RS:.9,railH:.34,railY:1.25,flange:.12,tf:.02,tw:.012,crossCount:13,crossX0:-5.8,crossX1:5.8,outZ:1.2,
  axles:[-4.5,-3.1,-1.7],tireR:.52,fenderR:.665,gearX:3.867,gearZ:.95,locks:[-5.9925,-.14,.14,5.9925],lockZ:1.1295,kx:7.1},
 TOP_Y=P.railY+P.railH/2,OUT_Y=TOP_Y-.04,CH_Z=7.1,CH_Y=-.033; // CH_Z: centro do chassi na carreta · CH_Y: alinha o centro do eixo ao centro da roda do jogo
 const MM=(c,r,m,o)=>new THREE.MeshStandardMaterial(Object.assign({color:C(c),roughness:r,metalness:m},o||{})),
  M={steel:MM(0x353b41,.5,.8),steel2:MM(0x40474e,.45,.8),plate:MM(0x4a525a,.55,.7),plate2:MM(0x3d444b,.6,.7),rubber:MM(0x111111,.95,0),rim:MM(0xaab2ba,.35,.9),zinc:MM(0xb8bec4,.3,.9),
   fender:MM(0x58616a,.4,.75,{side:THREE.DoubleSide}),spring:MM(0x2b2f33,.5,.85),light:TL},
  ch=new THREE.Group(),pend=[],V3=THREE.Vector3,dummy=new THREE.Object3D();
 const sub=(parent,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g},
  mk=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m},
  bx=(w,h,d,mat,p,x,y,z)=>mk(new THREE.BoxGeometry(w,h,d),mat,p,x,y,z),
  cyl=(r,h,mat,p,x,y,z,ax='y',seg=18)=>{const m=mk(new THREE.CylinderGeometry(r,r,h,seg),mat,p,x,y,z);if(ax==='z')m.rotation.x=Math.PI/2;if(ax==='x')m.rotation.z=Math.PI/2;return m},
  beam=(a,b,w,h,mat,p)=>{const A=new V3(...a),B=new V3(...b),m=mk(new THREE.BoxGeometry(w,h,A.distanceTo(B)),mat,p);m.position.copy(A).add(B).multiplyScalar(.5);m.lookAt(B);return m},
  mat4=(x,y,z,ry=0,rx=0,rz=0)=>{dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();return dummy.matrix.clone()},
  inst=(geo,mat,mats)=>pend.push({geo,mat,mats}); // parafusos: fundidos na malha final (sem InstancedMesh, para as carretas estacionadas)
 const crossXs=[...Array(P.crossCount)].map((_,i)=>P.crossX0+i*(P.crossX1-P.crossX0)/(P.crossCount-1));
 /* ---- estrutura principal ---- */
 {const g=sub(ch),rh=P.railH,f=P.flange,tf=P.tf,tw=P.tw,w=P.RS-tw,EX=1.4; // EX: extensão dianteira (pescoço) até o pino-rei em z=0
  [-1,1].forEach(s=>{const z=s*P.RS/2,zo=z+s*(tw/2+.005);
   bx(P.L,rh-2*tf,tw,M.steel,g,0,P.railY,z);bx(P.L,tf,f,M.steel2,g,0,P.railY+rh/2-tf/2,z);bx(P.L,tf,f,M.steel2,g,0,P.railY-rh/2+tf/2,z);
   bx(EX,rh-2*tf,tw,M.steel,g,P.L/2+EX/2,P.railY,z);bx(EX,tf,f,M.steel2,g,P.L/2+EX/2,P.railY+rh/2-tf/2,z);bx(EX,tf,f,M.steel2,g,P.L/2+EX/2,P.railY-rh/2+tf/2,z);bx(EX,rh-2*tf-.02,.01,M.plate,g,P.L/2+EX/2,P.railY,zo);
   bx(4.4,rh-2*tf-.02,.01,M.plate,g,-3.3,P.railY,zo);bx(1.6,rh-2*tf-.02,.01,M.plate2,g,5.3,P.railY,zo);bx(.9,rh-2*tf-.02,.01,M.plate,g,P.gearX,P.railY,zo)});
  bx(.02,.3,P.RS,M.plate,g,P.L/2+EX,P.railY,0);bx(.08,.06,1.1,M.steel2,g,P.L/2+EX-.05,TOP_Y-.03,0);
  /* travessas em C + balanços laterais com escoras */
  crossXs.forEach(x=>{bx(.01,.2,w,M.steel,g,x,P.railY,0);bx(.06,.01,w,M.steel2,g,x+.03,P.railY+.095,0);bx(.06,.01,w,M.steel2,g,x+.03,P.railY-.095,0);
   [-1,1].forEach(s=>{bx(.1,.16,.01,M.plate,g,x+.02,P.railY,s*(P.RS/2-.012));
    beam([x,OUT_Y,s*(P.RS/2+f/2-.04)],[x,OUT_Y,s*P.outZ],.12,.06,M.steel2,g);beam([x,P.railY-rh/2+.02,s*(P.RS/2+.01)],[x,OUT_Y-.03,s*(P.outZ-.15)],.05,.05,M.steel,g);bx(.12,.02,.1,M.plate,g,x,OUT_Y-.04,s*(P.outZ-.05))})});
  [2,5,8].forEach(i=>{const x1=crossXs[i],x2=crossXs[i+1],y=P.railY-.06,z=P.RS/2-.02;beam([x1+.03,y,-z],[x2,y,z],.05,.012,M.steel,g);beam([x1+.03,y,z],[x2,y,-z],.05,.012,M.steel,g)});
  /* placa e pino-rei (2") deslocados para z=0 da carreta */
  const kx=P.kx,ky=P.railY-rh/2-.03,k=sub(ch);bx(.95,.03,P.RS+.3,M.plate,k,kx-.15,P.railY-rh/2-.015,0);[-1,1].forEach(s=>bx(.9,.14,.01,M.plate2,k,kx-.15,P.railY-rh/2-.1,s*.3));
  bx(.5,.02,.5,M.plate2,k,kx,ky+.045,0);cyl(.11,.02,M.steel2,k,kx,ky-.01,0,'y',32);cyl(.06,.05,M.zinc,k,kx,ky-.045,0,'y',24);cyl(.0254,.05,M.zinc,k,kx,ky-.095,0,'y',20);cyl(.0445,.03,M.zinc,k,kx,ky-.135,0,'y',24);
  const kb=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;kb.push(mat4(kx+Math.cos(a)*.085,ky-.025,Math.sin(a)*.085,0))}inst(new THREE.CylinderGeometry(.01,.01,.015,6),M.zinc,kb);
  [-1,1].forEach(s=>{bx(.3,.1,.01,M.plate,k,kx,ky-.045,s*.15);bx(.01,.1,.3,M.plate,k,kx+s*.15,ky-.045,0)});
  /* travessa traseira, para-choque e lanternas */
  const rr=sub(ch);bx(.02,.3,P.RS,M.plate,rr,-P.L/2,P.railY,0);bx(.09,.12,2.3,M.steel,rr,-P.L/2+.05,.62,0);
  [-1,1].forEach(s=>{bx(.06,.48,.06,M.steel2,rr,-P.L/2+.05,.86,s*.4);beam([-P.L/2+.05,.62,s*.9],[-P.L/2+.05,1.1,s*.45],.05,.05,M.steel,rr);bx(.07,.12,.22,M.light,rr,-P.L/2-.02,1.18,s*1.12);
   beam([-P.L/2-.01,1.18,s*.45],[-P.L/2-.01,1.18,s*1.12],.05,.06,M.steel2,rr);beam([-P.L/2+.3,P.railY-rh/2+.02,s*.48],[-P.L/2-.01,1.18,s*.95],.04,.04,M.steel,rr);bx(.09,.14,.03,M.plate2,rr,-P.L/2-.02,1.18,s*.5)});
  [-1,1].forEach(s=>bx(3.95,.05,.05,M.steel,sub(ch),(P.axles[0]+P.axles[2])/2,1.325,s*.78)); // viga de apoio dos para-lamas
 }
 /* ---- fixações do contêiner (twist-lock) ---- */
 {const g=sub(ch);P.locks.forEach((lx,i)=>[-1,1].forEach(s=>{const z=s*P.lockZ;
  beam([lx,OUT_Y,s*.5],[lx,OUT_Y,z],.09,.06,M.steel2,g);bx(.4,.05,.2,M.steel,g,lx,OUT_Y,z);bx(.16,.025,.2,M.plate,g,lx,OUT_Y+.0375,z);cyl(.032,.05,M.zinc,g,lx,OUT_Y+.075,z);
  const head=bx(.1,.03,.05,M.zinc,g,lx,OUT_Y+.115,z);head.rotation.y=Math.PI/2*(i%2?1:0);cyl(.008,.14,M.zinc,g,lx+.07,OUT_Y+.06,z+s*.02,'z',8);cyl(.014,.03,M.rim,g,lx+.07,OUT_Y+.06,z+s*.1,'z',10)}))}
 /* ---- eixos e suspensão (feixe de molas) ---- */
 {const g=sub(ch),rb=P.railY-P.railH/2;
  P.axles.forEach(ax=>{cyl(.065,2.3,M.steel,g,ax,P.tireR,0,'z',20);[-1,1].forEach(s=>cyl(.1,.1,M.steel2,g,ax,P.tireR,s*1,'z',20));bx(.12,.1,.8,M.steel2,g,ax,P.tireR+.02,0);
   [-1,1].forEach(sd=>{const z=sd*P.RS/2;
    for(let k=0;k<6;k++)bx(1.3-k*.14,.02,.09,M.spring,g,ax,.64+k*.022,z);bx(.3,.05,.14,M.steel2,g,ax,.6,z);bx(.3,.04,.14,M.steel2,g,ax,.79,z);
    [-.07,.07].forEach(dx=>{cyl(.011,.3,M.zinc,g,ax+dx,.66,z+.07,'y',8);cyl(.011,.3,M.zinc,g,ax+dx,.66,z-.07,'y',8);[.07,-.07].forEach(dz=>cyl(.02,.02,M.zinc,g,ax+dx,.82,z+dz,'y',6))});
    [-1,1].forEach(e=>{bx(.05,rb-.8,.14,M.plate,g,ax+e*.62,(rb+.8)/2,z);bx(.1,.03,.16,M.plate2,g,ax+e*.62,.79,z)});bx(.14,.03,.16,M.plate2,g,ax,rb-.015,z);
    beam([ax+.2,.55,sd*.32],[ax+.3,rb-.03,sd*.32],.07,.07,M.steel,g);beam([ax+.2,.55,sd*.32],[ax+.25,.8,sd*.32],.035,.035,M.zinc,g)});
   beam([ax-.35,P.tireR+.02,0],[ax-.5,rb-.02,0],.07,.07,M.steel,g)})}
 /* ---- para-lamas (raio ajustado ao pneu traseiro do caminhão) ---- */
 {const g=sub(ch),R1=P.fenderR,R2=R1+.015,a0=THREE.MathUtils.degToRad(8),a1=THREE.MathUtils.degToRad(172),depth=.72,sh=new THREE.Shape();
  sh.moveTo(R2*Math.cos(a0),R2*Math.sin(a0));sh.absarc(0,0,R2,a0,a1,false);sh.lineTo(R1*Math.cos(a1),R1*Math.sin(a1));sh.absarc(0,0,R1,a1,a0,true);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:14}),lipG=new THREE.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:false,curveSegments:14});
  P.axles.forEach((ax,i)=>[-1,1].forEach(s=>{const z0=s>0?.6:-.6-depth;mk(geo,M.fender,g,ax,P.tireR,z0);
   const lip=mk(lipG,M.fender,g,ax,P.tireR,s>0?.6+depth-.02:-.6-depth);lip.scale.set(1.04,1.04,1);[.33,.66].forEach(t=>{const rib=mk(lipG,M.fender,g,ax,P.tireR,z0+depth*t);rib.scale.set(1.03,1.03,1)});
   [-.35,.35].forEach(dx=>{const y=P.tireR+Math.sqrt(R2*R2-dx*dx);beam([ax+dx,y,s*.8],[ax+dx,1.32,s*.78],.04,.04,M.steel,g);bx(.07,.015,.08,M.plate2,g,ax+dx,y+.005,s*.8)});
   if(i===0){const fx=ax-R2-.015;bx(.03,.03,depth,M.steel,g,fx,P.tireR+.1,s*.96);bx(.012,.46,depth-.04,M.rubber,g,fx-.012,P.tireR+.1-.245,s*.96);bx(.02,.03,depth-.04,M.steel2,g,fx-.012,P.tireR+.1-.01,s*.96)}}))}
 /* ---- pés de apoio (SEM a travessa de pé / base) ---- */
 {const g=sub(ch),gx=P.gearX;[-1,1].forEach(s=>{const z=s*P.gearZ;
  bx(.16,.55,.16,M.steel,g,gx,1.075,z);bx(.2,.03,.2,M.plate,g,gx,1.36,z);bx(.11,.74,.11,M.steel2,g,gx,.45,z);bx(.2,.03,.2,M.plate2,g,gx,.065,z);bx(.14,.14,.12,M.plate,g,gx+.12,1,z);cyl(.02,.2,M.zinc,g,gx,1,z,'z',10);
  beam([gx-.5,1.3,z],[gx,.95,z],.05,.05,M.steel,g);beam([gx+.5,1.3,z],[gx,.95,z],.05,.05,M.steel,g);beam([gx,1.32,s*.5],[gx,1.1,z],.05,.05,M.steel,g)});
  cyl(.022,2*P.gearZ,M.zinc,g,gx+.12,1,0,'z',10);cyl(.012,.3,M.zinc,g,gx+.12,1,P.gearZ+.12,'z',8);beam([gx+.12,1,P.gearZ+.26],[gx+.12,.8,P.gearZ+.26],.02,.02,M.zinc,g);cyl(.03,.1,M.rubber,g,gx+.12,.76,P.gearZ+.26,'z',10)}
 /* ---- parafusos ---- */
 {const hex=[],nut=[],web=[],hang=[],inPlate=x=>(x>-5.5&&x<-1.1)||(x>4.5&&x<6.1)||Math.abs(x-3.867)<.45;
  crossXs.forEach(x=>[-1,1].forEach(s=>[-1,1].forEach(d=>hex.push(mat4(x+d*.06,TOP_Y+.006,s*(P.RS/2),0)))));
  P.locks.forEach(lx=>[-1,1].forEach(s=>[[-.14,-.07],[.14,-.07],[-.14,.07],[.14,.07]].forEach(([dx,dz])=>hex.push(mat4(lx+dx,OUT_Y+.028,s*P.lockZ+dz,0)))));
  P.axles.forEach(ax=>[-1,1].forEach(s=>[-1,1].forEach(e=>nut.push(mat4(ax+e*.62,P.railY-P.railH/2-.02,s*P.RS/2,0)))));
  crossXs.forEach(x=>[-1,1].forEach(s=>[-.05,.05].forEach(dy=>web.push(mat4(x+.02,P.railY+dy,s*(P.RS/2+(inPlate(x)?.023:.012)),0,Math.PI/2)))));
  P.axles.forEach(ax=>[-1,1].forEach(s=>[-1,1].forEach(e=>[.86,1].forEach(y=>hang.push(mat4(ax+e*.62,y,s*(P.RS/2+.07),0,Math.PI/2))))));
  inst(new THREE.CylinderGeometry(.014,.014,.012,6),M.zinc,web);inst(new THREE.CylinderGeometry(.018,.018,.014,6),M.zinc,hang);const hg=new THREE.CylinderGeometry(.016,.016,.012,6);inst(hg,M.zinc,hex);inst(hg,M.zinc,nut)}
 /* ---- funde tudo em 1 malha por material (gira o chassi para o eixo da carreta e já aplica a posição) ---- */
 ch.rotation.y=Math.PI/2;ch.position.set(0,CH_Y,CH_Z);ch.updateMatrixWorld(true);
 {const by=new Map(),add=(m,e)=>{let a=by.get(m);if(!a)by.set(m,a=[]);a.push(e)};
  ch.traverse(o=>{if(o.isMesh)add(o.material,{g:o.geometry,mx:o.matrixWorld})});
  for(const p of pend)for(const m of p.mats)add(p.mat,{g:p.geo,mx:new THREE.Matrix4().multiplyMatrices(ch.matrixWorld,m)});
  const v=new THREE.Vector3(),nm=new THREE.Matrix3();
  for(const[m,list]of by){let nv=0,ni=0;for(const e of list){nv+=e.g.attributes.position.count;ni+=e.g.index?e.g.index.count:e.g.attributes.position.count}
   const Pp=new Float32Array(nv*3),N=new Float32Array(nv*3),I=new Uint32Array(ni);let vo=0,io=0;
   for(const e of list){const g=e.g,pa=g.attributes.position,na=g.attributes.normal,ix=g.index,cnt=pa.count,flip=e.mx.determinant()<0;nm.getNormalMatrix(e.mx);
    for(let k=0;k<cnt;k++){v.fromBufferAttribute(pa,k).applyMatrix4(e.mx);Pp[(vo+k)*3]=v.x;Pp[(vo+k)*3+1]=v.y;Pp[(vo+k)*3+2]=v.z;v.fromBufferAttribute(na,k).applyMatrix3(nm).normalize();N[(vo+k)*3]=v.x;N[(vo+k)*3+1]=v.y;N[(vo+k)*3+2]=v.z}
    const n=ix?ix.count:cnt;for(let k=0;k<n;k+=3){const a=ix?ix.getX(k):k,b=ix?ix.getX(k+1):k+1,c=ix?ix.getX(k+2):k+2;I[io+k]=a+vo;I[io+k+1]=(flip?c:b)+vo;I[io+k+2]=(flip?b:c)+vo}io+=n;vo+=cnt}
   const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(Pp,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.setIndex(new THREE.BufferAttribute(I,1));
   const me=new THREE.Mesh(bg,m);me.castShadow=me.receiveShadow=true;trl.add(me)}
  ch.traverse(o=>{if(o.isMesh)o.geometry.dispose()})}
 var TRLM=[M.steel,M.steel2],TRLD=[0x353b41,0x40474e]; // materiais pintáveis da carreta e cores originais
}
