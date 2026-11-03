/* ===== Construtor de cargas detalhadas: junta centenas de peças em 3 malhas (fosco / metal / pintura) com cor por vértice ===== */
var HEAVY={};
const _E=new THREE.Euler(),_Q=new THREE.Quaternion(),_V=new THREE.Vector3(),_S=new THREE.Vector3(),_M=new THREE.Matrix4(),_N=new THREE.Matrix3(),_c=new THREE.Color(),_GC=new Map();
const fillOf=t=>t>=18?1:t>=12?.72:.42; // fração da carreta ocupada (mesma regra do cargoModel)
function jc(hex,i,j,v){_c.setHex(hex);_c.offsetHSL((hh(i,j,5)-.5)*v*.25,0,(hh(i,j+3,5)-.5)*v);return _c.getHex()}
function cgeo(seg,rt,rb){const k=seg+'|'+rt+'|'+rb;let g=_GC.get(k);if(!g){g=new THREE.CylinderGeometry(rt,rb,1,seg);_GC.set(k,g)}return g}
function MB(){
 const mk=()=>({P:[],N:[],C:[],I:[]}),bk={m:mk(),x:mk(),p:mk()};
 const o={
  g(k,geo,x,y,z,sx,sy,sz,rx,ry,rz,hex){const b=bk[k],pa=geo.attributes.position,na=geo.attributes.normal,ia=geo.index,vo=b.P.length/3;
   _E.set(rx||0,ry||0,rz||0);_Q.setFromEuler(_E);_M.compose(_V.set(x,y,z),_Q,_S.set(sx,sy,sz));_N.getNormalMatrix(_M);_c.setHex(hex).convertSRGBToLinear();const cr=_c.r,cg=_c.g,cb=_c.b;
   for(let i=0;i<pa.count;i++){_V.fromBufferAttribute(pa,i).applyMatrix4(_M);b.P.push(_V.x,_V.y,_V.z);_V.fromBufferAttribute(na,i).applyMatrix3(_N).normalize();b.N.push(_V.x,_V.y,_V.z);b.C.push(cr,cg,cb)}
   for(let i=0;i<ia.count;i++)b.I.push(ia.getX(i)+vo)},
  // caixa centrada em (x,y,z), tamanho w×h×d
  box(k,x,y,z,w,h,d,hex,ry,rx,rz){o.g(k,BXG,x,y,z,w,h,d,rx,ry,rz,hex)},
  // cilindro centrado; eixo 'y' (padrão), 'x' ou 'z'
  cyl(k,x,y,z,r,len,hex,ax,seg){o.tap(k,x,y,z,r,r,len,hex,ax,seg)},
  // tronco de cone: rt = raio no lado + do eixo, rb = raio no lado − do eixo
  tap(k,x,y,z,rt,rb,len,hex,ax,seg){const rx=ax==='z'?Math.PI/2:0,rz=ax==='x'?-Math.PI/2:0;o.g(k,cgeo(seg||12,rt,rb),x,y,z,1,len,1,rx,0,rz,hex)},
  tor(k,x,y,z,R,r,hex,ax){const key='t|'+R+'|'+r;let g=_GC.get(key);if(!g){g=new THREE.TorusGeometry(R,r,6,14);_GC.set(key,g)}o.g(k,g,x,y,z,1,1,1,ax==='y'?Math.PI/2:0,ax==='x'?Math.PI/2:0,0,hex)},
  sph(k,x,y,z,sx,sy,sz,hex){let g=_GC.get('s');if(!g){g=new THREE.SphereGeometry(1,12,8);_GC.set('s',g)}o.g(k,g,x,y,z,sx,sy,sz,0,0,0,hex)},
  build(){const grp=new THREE.Group(),disp=[],MT={m:[.92,0],x:[.42,.8],p:[.55,.2]};
   for(const k of['m','x','p']){const b=bk[k];if(!b.P.length)continue;const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(b.P,3));bg.setAttribute('normal',new THREE.Float32BufferAttribute(b.N,3));bg.setAttribute('color',new THREE.Float32BufferAttribute(b.C,3));bg.setIndex(b.P.length/3>65535?new THREE.Uint32BufferAttribute(b.I,1):new THREE.Uint16BufferAttribute(b.I,1));
    const mt=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:MT[k][0],metalness:MT[k][1],flatShading:true}),me=new THREE.Mesh(bg,mt);me.castShadow=me.receiveShadow=true;me.frustumCulled=false;grp.add(me);disp.push(bg,mt)}
   grp.userData.dispose=()=>disp.forEach(d=>d.dispose());return grp}};
 return o}
// piso de aço (sobre as longarinas do chassi) usado pelas cargas secas
function deckPlate(b,L,z0,hex){b.box('x',0,.05,z0+L/2,2.4,.08,L,hex||0x3a3d42)}
// palete de madeira 1,1 × 1,0 com tábuas e blocos; (x,z) = centro, y = base
function palletAt(b,x,y,z,i){const w=jc(0x9a7b4f,i,1,.1);b.box('m',x,y+.13,z,1.1,.03,1,w);for(const dz of[-.4,0,.4])b.box('m',x,y+.03,z+dz,1.1,.06,.1,w);for(const dx of[-.5,0,.5])for(const dz of[-.4,0,.4])b.box('m',x+dx*1,y+.09,z+dz,.1,.06,.1,w)}
