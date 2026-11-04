// ---- empresas e cidades ----
const CT=[
 {id:'agro',label:'Agro',col:0x3f8f3a,acc:0xe8c547,n:['Cooperativa Vale Verde','Agro Campo Azul','Grãos do Planalto','Fazenda Boa Safra','Silos Terra Fértil']},
 {id:'log',label:'Logística',col:0x2d5da8,acc:0xf08a1c,n:['TransBrasil Logística','Cargo Express','Porto Seco Operador','LogMax Centro de Distribuição','Rota Sul Armazéns']},
 {id:'aco',label:'Siderúrgica',col:0x6b7078,acc:0xd9402b,n:['Aços Serra Dourada','Siderúrgica Pedra Branca','Metalúrgica União','Ferro & Forja Brasil']},
 {id:'comb',label:'Combustíveis',col:0xc7352b,acc:0xf2f2f2,n:['Petro Rodovia','Distribuidora Rio Claro','Combustíveis Monte Real','Terminal Energia Sul']},
 {id:'var',label:'Varejo',col:0x1f7fbf,acc:0xffd23a,n:['Mega Atacado Bom Preço','Casa & Cia Centro de Distribuição','SuperMais Atacadista','Rede Compre Bem']},
 {id:'cons',label:'Construção',col:0xd49a1f,acc:0x30343a,n:['Cimentos Nova Esperança','Madeireira Três Lagoas','Pedreira Bela Vista','Materiais São Bento']}];
const CITY=['Vila Nova','São Bento','Porto Seco','Campo Alto','Rio Claro','Santa Aurora','Monte Real','Três Lagoas','Bela Vista','Serra Dourada','Pedra Branca','Nova Esperança'];
const cityIdx=s=>Math.floor((s+4500)/9000),cityName=s=>{const i=cityIdx(s);return CITY[((i*7+3+((WSEED.n+REG.id*7)%CITY.length))%CITY.length+CITY.length)%CITY.length]};
const CO_D=2000,COM=new Map(),COG=new Map();let coSig='',lastCity=null;
const BXG=new THREE.BoxGeometry(1,1,1),CYG=new THREE.CylinderGeometry(1,1,1,12),CNG=new THREE.ConeGeometry(1,1,12),MC=new Map();
const mat=hex=>{let m=MC.get(hex);if(!m){m=new THREE.MeshStandardMaterial({color:C(hex),roughness:.85,flatShading:true});MC.set(hex,m)}return m};
const put=(g,geo,m,x,y,z,sx,sy,sz,rx,ry,rz)=>{if(g.userData.batch){g.userData.batch.push({geo,m,x,y,z,sx,sy,sz,rx,ry,rz});return null}const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=sy>2.5;o.receiveShadow=true;g.add(o);return o};
function flushBatch(g,disp){const b=g.userData.batch;g.userData.batch=null;if(!b||!b.length)return;const by=new Map();for(const it of b){let a=by.get(it.m);if(!a)by.set(it.m,a=[]);a.push(it)}
 const E=new THREE.Euler(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),S=new THREE.Vector3(),Mx=new THREE.Matrix4(),N=new THREE.Matrix3();
 for(const[m,list]of by){let nv=0,ni=0;for(const it of list){nv+=it.geo.attributes.position.count;ni+=it.geo.index.count}
  const P=new Float32Array(nv*3),Nn=new Float32Array(nv*3),I=new Uint32Array(ni);let vo=0,io=0;
  for(const it of list){E.set(it.rx||0,it.ry||0,it.rz||0);Q.setFromEuler(E);V.set(it.x,it.y,it.z);S.set(it.sx,it.sy,it.sz);Mx.compose(V,Q,S);N.getNormalMatrix(Mx);
   const pa=it.geo.attributes.position,na=it.geo.attributes.normal,ia=it.geo.index,cnt=pa.count;
   for(let k=0;k<cnt;k++){V.fromBufferAttribute(pa,k).applyMatrix4(Mx);P[(vo+k)*3]=V.x;P[(vo+k)*3+1]=V.y;P[(vo+k)*3+2]=V.z;V.fromBufferAttribute(na,k).applyMatrix3(N).normalize();Nn[(vo+k)*3]=V.x;Nn[(vo+k)*3+1]=V.y;Nn[(vo+k)*3+2]=V.z}
   for(let k=0;k<ia.count;k++)I[io+k]=ia.getX(k)+vo;vo+=cnt;io+=ia.count}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(Nn,3));bg.setIndex(new THREE.BufferAttribute(I,1));
  const o=new THREE.Mesh(bg,m);o.castShadow=o.receiveShadow=true;g.add(o);if(disp)disp.push(bg)}}
const cBx=(g,m,x,y,z,w,h,d)=>put(g,BXG,m,x,y+h/2,z,w,h,d),cCy=(g,m,x,y,z,r,h)=>put(g,CYG,m,x,y+h/2,z,r,h,r),cCn=(g,m,x,y,z,r,h)=>put(g,CNG,m,x,y+h/2,z,r,h,r);
const hexCss=h=>'#'+h.toString(16).padStart(6,'0');
function signTex(name,bg,fg){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const g=cv.getContext('2d');g.fillStyle=hexCss(bg);g.fillRect(0,0,512,128);g.fillStyle=hexCss(fg);g.fillRect(0,0,512,8);g.fillRect(0,120,512,8);
 let fs=54;g.font='bold '+fs+'px system-ui,sans-serif';while(g.measureText(name).width>470&&fs>18){fs-=2;g.font='bold '+fs+'px system-ui,sans-serif'}g.textAlign='center';g.textBaseline='middle';g.fillText(name,256,66);
 const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
const PUMP={x:-20,z:19.5,L:11,W:5.4},BZ_X=-29,PBW=13.6,PBH=2.6,PREAR=11.5,PCEN=PREAR-PBW/2+.1,PCOL=[0x1f5fa8,0xb3261e,0x2e7d32,0xd9822b,0x4a5560,0x7a3b8c,0xc9b037],DECOR=[[29.5,-8,1],[29.5,8,0]];
const slotCol=(c,i)=>Math.floor(hh(c.k,(c.nonce||0)*4+i,24)*PCOL.length);
function coGet(k){let c=COM.get(k);if(c)return c;
 if(window.GRID_ON&&window.gridCoBase)c=gridCoBase(k);else{const s=k===0?0:k*CO_D+(hh(k,1,7)-.5)*500,side=k===0?1:hh(k,2,7)<.5?-1:1,t=CT[Math.floor(hh(k,3,7)*CT.length)];
 ensureRoad(s-60,s+60);const hwc=hwAt(s);roadPt(s,side*(34.5+hwc));const o=samp(Math.round(s/RDS));
 c={k,s,side,t,name:t.n[Math.floor(hh(k,4,7)*t.n.length)],x:RPx,z:RPz,h:o.h,y:yR(s)+.1,rot:o.h+(side<0?Math.PI:0),ann:false,cols:[],bays:[],city:cityName(s)}}
 const t=c.t;// coordenadas locais: +x = para longe da pista, z = ao longo da pista
 const cr=Math.cos(c.rot),sr=Math.sin(c.rot);c.cr=cr;c.sr=sr;c.loc=(lx,lz)=>({x:c.x+lx*cr+lz*sr,z:c.z-lx*sr+lz*cr});
 c.board=c.loc(BZ_X,0);for(const lz of[-13,-6.5,0,6.5,13]){const q=c.loc(19.5,lz);c.cols.push({x:q.x,z:q.z,r:6.4,k:1})}
 for(const lz of[-10,0,10]){const q=c.loc(12,lz);c.bays.push({x:q.x,z:q.z,lz})}
 {const q=c.loc(PUMP.x,PUMP.z+PUMP.W/2+1.5);c.cols.push({x:q.x,z:q.z,r:1.1,k:1})}
 c.slotK=[];c.slotCols=[];c.taken={};
 // cargas ficam nas vagas das docas (3 baias), com a ponta (pino) voltada para a pista
 for(let i=0;i<3;i++){const lz=c.bays[i].lz,Kx=PCEN-6.75,cl=[];c.slotK.push(c.loc(Kx,lz));
  for(const o of[3,6,9,12]){const q=c.loc(Kx+o,lz),e={x:q.x,z:q.z,r:1.5,k:1,off:true};cl.push(e);c.cols.push(e)}c.slotCols.push(cl)}
 for(const[dx,dz]of DECOR)for(const o of[-5,0,5]){const q=c.loc(dx,dz+o);c.cols.push({x:q.x,z:q.z,r:1.5,k:1})}
 if(t.id==='agro'||t.id==='comb')for(const lz of[-23,23]){const q=c.loc(17.5,lz);c.cols.push({x:q.x,z:q.z,r:t.id==='agro'?3:4.3,k:1})}
 COM.set(k,c);return c}
function buildCo(c){const g=new THREE.Group(),T=c.t,W=mat(T.col),A=mat(T.acc),DK=mat(0x2a2d33),CO=mat(0x8d9096),WH=mat(0xe9e9e4),YL=mat(0xf2c200),disp=[];
 g.position.set(c.x,c.y,c.z);g.rotation.y=c.rot;g.userData.batch=[];g.userData.disp=disp;
 const dep=WSEED.n?12+hh(c.k,3,61)*7:14,BH=WSEED.n?8.6+hh(c.k,4,61)*4.4:9,bcx=12.5+dep/2;cBx(g,W,bcx,0,0,dep,BH,30);cBx(g,CO,bcx,BH,0,dep+.6,.5,30.6);cBx(g,A,12.3,5,0,.3,.5,30.2);
 cBx(g,CO,22,BH+.5,-7,3,1.4,3);cBx(g,CO,22,BH+.5,8,3,1.4,3);
  if(WSEED.n){const v=hh(c.k,5,61);if(v<.5)cBx(g,W,bcx+dep/2+4,0,v<.25?-9:9,8,BH*.55,12);if(hh(c.k,6,61)<.6)for(let q=0;q<2;q++)cBx(g,DK,bcx-2+q*5,BH+.5,q?9:-9,3.6,1.2,3.6)}
 for(const z of[-10,0,10]){cBx(g,DK,12.3,0,z,.4,4.4,5);cBx(g,CO,11.2,4.6,z,2.6,.3,6.2);cBx(g,mat(0x15171a),12.1,.5,z-2.2,.3,1.6,.5);cBx(g,mat(0x15171a),12.1,.5,z+2.2,.3,1.6,.5);
  cBx(g,YL,-3,.02,z-2.9,30,.04,.25);cBx(g,YL,-3,.02,z+2.9,30,.04,.25);cBx(g,YL,11.4,.02,z,.6,.04,5.8)}
 // placas
 const tex=signTex(c.name,T.col,T.acc===0x30343a?0xffffff:T.acc),sm=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});disp.push(tex,sm);
 const wallS=new THREE.Mesh(new THREE.PlaneGeometry(14,3.5),sm);wallS.position.set(12.1,7.3,0);wallS.rotation.y=-Math.PI/2;g.add(wallS);
 cCy(g,CO,-31,0,-17,.3,7.5);cBx(g,DK,-31,6.6,-17,9.4,3,.5);
 for(const f of[1,-1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(9,2.25),sm);p.position.set(-31,8.1,-17+f*.3);if(f<0)p.rotation.y=Math.PI;g.add(p)}
 // extras por setor
 const ex=T.id;
 if(ex==='agro')for(const z of[-23,23]){cCy(g,mat(0xc9ccd0),17.5,0,z,2.8,15);cCn(g,mat(0x9aa0a6),17.5,15,z,2.9,2.2);cBx(g,CO,17.5,0,z>0?z-6:z+6,1.2,1.2,8)}
 else if(ex==='log'){const cc=[0x1f5fa8,0xb3261e,0x2e7d32,0xd9822b,0x4a5560,0x7a3b8c];let n=0;for(const z of[-22,-24.6,22,24.6])for(const x of[-2,10])for(const y of[0,2.6])cBx(g,mat(cc[(n++)%cc.length]),x,y,z,12,2.6,2.4)}
 else if(ex==='aco'){for(const z of[-8,8]){cCy(g,mat(0x7b7f86),24,9.5,z,1.4,18);cCy(g,mat(0xd9402b),24,24,z,1.5,2)}for(const z of[-23,23])for(const x of[0,6,12])cBx(g,mat(0x6a5a4a),x,0,z,5,2,2.2)}
 else if(ex==='comb')for(const z of[-23,23]){cCy(g,WH,17.5,0,z,4.2,7);cCy(g,A,17.5,3,z,4.25,1.2);cCy(g,mat(0xb8bcc2),17.5,7,z,3.4,.5)}
 else if(ex==='var'){const cc=[0xc9c9c9,0x2a3b5c,0xa83232,0x2d2d2d,0xe3e3e3];for(let i=0;i<10;i++){const z=(i%2?1:-1)*(22+(i>>1)%2*3),x=-6+Math.floor(i/2)*4;cBx(g,mat(cc[i%cc.length]),x,.3,z,4.2,1.4,1.8)}}
 else for(const z of[-23,23]){cCn(g,mat(0xc2a878),16,0,z,5.5,4);cCn(g,mat(0x8a8d90),22,0,z,4,3);cBx(g,mat(0xb4553a),8,0,z,3,1.6,2.2);cBx(g,mat(0xb4553a),4,0,z,3,1.6,2.2)}
 // ponto de fretes (seletor de cargas) entre os cones: moldura amarela no chão
 for(const[bx0,bz0,bw,bd]of[[BZ_X,-4.4,9,.5],[BZ_X,4.4,9,.5],[BZ_X-4.4,0,.5,9],[BZ_X+4.4,0,.5,9],[BZ_X,0,.5,6],[BZ_X,0,6,.5]])cBx(g,YL,bx0,0,bz0,bw,.07,bd);
// bomba de combustível: vaga amarela no canto + bomba (combustível mais caro que nos postos)
 {const bx=PUMP.x,bz=PUMP.z,hl=PUMP.L/2,hw=PUMP.W/2,PB=mat(0xd9402b),PW=mat(0xf2f2ee),PD=mat(0x15171a);
  cBx(g,YL,bx,0,bz-hw,PUMP.L,.07,.3);cBx(g,YL,bx,0,bz+hw,PUMP.L,.07,.3);cBx(g,YL,bx-hl,0,bz,.3,.07,PUMP.W);cBx(g,YL,bx+hl,0,bz,.3,.07,PUMP.W);
  const pz=bz+hw+1.5;cBx(g,DK,bx,0,pz,1.8,.25,1.2);cBx(g,PB,bx,.25,pz,1,1.7,.7);cBx(g,PW,bx,1.95,pz,1.1,.3,.8);cBx(g,PD,bx,1.25,pz-.37,.62,.5,.06);cBx(g,PD,bx+.55,.9,pz-.3,.12,.5,.14);cBx(g,YL,bx,2.25,pz,.4,.2,.4)}
 // postes
 for(const[lx,lz]of[[-14,26],[-14,-26],[4,28],[4,-28]]){cCy(g,CO,lx,0,lz,.15,9);cBx(g,LM,lx,9,lz,1.4,.2,.5)}

 const mkTr=(x,zc,sgn)=>mkTrailer(g,x,zc,sgn);
 g.userData.slots=[];
 for(let i=0;i<3;i++){const t=mkTr(PCEN,c.bays[i].lz,1);t.rotation.y=Math.PI/2;t.visible=!!(c.spawn&&c.spawn.slot===i);if(t.visible)setTrCargo(t,c.spawn.name,c.spawn.tons);g.userData.slots.push(t)}
 g.userData.decor=[];
  DECOR.forEach(([dx,dz,full],i)=>{const t=mkTr(dx,dz,1);g.userData.decor.push(t);if(full){const L=CARGOS[T.id];setTrCargo(t,L[Math.floor(hh(c.k,i,31)*L.length)],18)}});
 if(!window.GRID_ON)coLane(c,g,disp);flushBatch(g,disp);scene.add(g);return g}
// carretas estacionadas usam EXATAMENTE o mesmo modelo da carreta engatada (trl): malhas fundidas por material, geometria compartilhada
const TPLC=[null,null]; // 0 = apoio arriado (estacionada) · 1 = recolhido (engatada)
function trailerTpl(up){const kk=up?1:0;if(TPLC[kk])return TPLC[kk];const e0=GEAR.e;gearSet(kk);const wv=tS.map(q=>q.g.visible);tS.forEach(q=>q.g.visible=true); /* nas telas de pintura as rodas ficam ocultas: sem isto o molde sairia sem pneus */trl.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(trl.matrixWorld).invert(),by=new Map(),skip=trl.userData.cg;
 const add=(m,e)=>{let a=by.get(m);if(!a)by.set(m,a=[]);a.push(e)};
 trl.traverse(o=>{if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;for(let p=o;p&&p!==trl;p=p.parent)if(p===skip||!p.visible)return;const g=o.geometry,tot=g.index?g.index.count:g.attributes.position.count;
  if(Array.isArray(o.material)){for(const gr of g.groups){const m=o.material[gr.materialIndex];if(m)add(m,{o,s:gr.start,n:Math.min(gr.count,tot-gr.start)})}}else add(o.material,{o,s:0,n:tot})});
 const mx=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3(),TPL=[];
 for(const[m,list]of by){let nv=0,ni=0;for(const e of list){nv+=e.o.geometry.attributes.position.count;ni+=e.n}
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
  for(const e of list){const o=e.o,g=o.geometry,pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,cnt=pa.count;mx.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(mx);const flip=mx.determinant()<0,ix=g.index;
   for(let k=0;k<cnt;k++){v.fromBufferAttribute(pa,k).applyMatrix4(mx);P[(vo+k)*3]=v.x;P[(vo+k)*3+1]=v.y;P[(vo+k)*3+2]=v.z;if(na){v.fromBufferAttribute(na,k).applyMatrix3(nm).normalize();N[(vo+k)*3]=v.x;N[(vo+k)*3+1]=v.y;N[(vo+k)*3+2]=v.z}if(ua){U[(vo+k)*2]=ua.getX(k);U[(vo+k)*2+1]=ua.getY(k)}}
   for(let k=0;k<e.n;k+=3){const q=e.s+k,a=ix?ix.getX(q):q,b=ix?ix.getX(q+1):q+1,c=ix?ix.getX(q+2):q+2;I[io+k]=a+vo;I[io+k+1]=(flip?c:b)+vo;I[io+k+2]=(flip?b:c)+vo}io+=e.n;vo+=cnt}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.setAttribute('uv',new THREE.BufferAttribute(U,2));bg.setIndex(new THREE.BufferAttribute(I,1));TPL.push([bg,m])}
 {let mn=1e9;for(const[bg]of TPL){const q=bg.attributes.position.array;for(let i=1;i<q.length;i+=3)if(q[i]<mn)mn=q[i]}if(tS.length&&mn<.25)TPLC[kk]=TPL} /* só guarda o molde se as rodas (que descem até o chão) entraram nele */ /* sem as rodas montadas (boot incompleto) o molde não é guardado: nenhuma carreta fica sem pneus */tS.forEach((q,i)=>q.g.visible=wv[i]);gearSet(e0);trl.updateMatrixWorld(true);return TPL}
function mkTrailer(g,x,zc,sgn,up){const t=new THREE.Group(),inn=new THREE.Group();t.position.set(x,0,zc);t.userData.sgn=sgn;inn.position.set(0,.1,-sgn*6.75);inn.rotation.y=sgn>0?0:Math.PI;
 for(const[bg,m]of trailerTpl(up)){const o=new THREE.Mesh(bg,m);o.receiveShadow=true;inn.add(o)}t.add(inn);g.add(t);return t}
