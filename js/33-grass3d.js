// ===== grama procedural 3D: milhares de lâminas instanciadas, em células de 6 m, com LOD por anel, vento e corte pelo frustum =====
// Baseado no sistema "Grama procedural de rodovia". Adaptado ao jogo: altura do chão pela mesma função do terreno (Hx), sem grama na pista,
// nos pátios das empresas e nas margens de rio; densidade e alcance vêm dos Ajustes gráficos (GS.grass3d: 0 desligada · 1 baixa · 2 média · 3 alta).
(function(){
'use strict';
const CELL=6,SEED=1337,LV=[null,{density:9,maxDist:38},{density:16,maxDist:56},{density:26,maxDist:76}];
const CFG={density:16,maxDist:56,height:.42,width:.05,windStrength:.5,windSpeed:1.4,variation:1,dry:1};
// paleta em torno do verde #657D3E do terreno (convertida para linear, como o resto do jogo)
const PC=h=>new THREE.Color(h).convertSRGBToLinear();
const U={uTime:{value:0},uCam:{value:new THREE.Vector3()},uMaxDist:{value:CFG.maxDist},uH:{value:CFG.height},uW:{value:CFG.width},uWind:{value:CFG.windStrength},uWindSpeed:{value:CFG.windSpeed},
 uVar:{value:CFG.variation},uDry:{value:CFG.dry},uBase:{value:PC(0x5c7438)},uOlive:{value:PC(0x7d8f45)},uLight:{value:PC(0x96a652)},uDryC:{value:PC(0xa89c58)}};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(ix,iz){let h=Math.imul(ix,374761393)+Math.imul(iz,668265263)+SEED|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)},lerp=(a,b,t)=>a+(b-a)*t;
function vnoise(x,z){const ix=Math.floor(x),iz=Math.floor(z);let fx=x-ix,fz=z-iz;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);
 return lerp(lerp(hash2(ix,iz),hash2(ix+1,iz),fx),lerp(hash2(ix,iz+1),hash2(ix+1,iz+1),fx),fz)}
function fbm(x,z){let v=0,a=.5;for(let i=0;i<3;i++){v+=a*vnoise(x,z);x=x*2.03+17.1;z=z*2.03+17.1;a*=.5}return v/.875}
// altura do chão (a mesma do terreno desenhado) e distância à pista, sem deixar rastro nas variáveis globais da estrada
let gY=0,gRD=1e9;
function ground(x,z){const s=[RPH,RIN,RD,RW,RS,RYb,RHW,RL,RPx,RPz];gY=Hx(x,z,0);gRD=RIN?RD:1e9;[RPH,RIN,RD,RW,RS,RYb,RHW,RL,RPx,RPz]=s;return gY}
function density(x,z,rd){const n=fbm(x*.035+5.2,z*.035+9.1);let d=.4+.6*smooth(.25,.7,n);
 d*=smooth(15,21,rd);
 if(COACT.length){padW(x,z);d*=1-smooth(.02,.3,PADW)}
 if(RIVA.length&&typeof riverBank==='function'){d*=1-smooth(.02,.3,riverBank(x,z))}
 return d}
const GLSL=`
uniform vec3 uBase,uOlive,uLight,uDryC; uniform float uVar,uDry;
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p=p*2.03+17.1;a*=.5;}return v/.9375;}
vec3 grassColor(vec2 p){
 float n1=fbm(p*0.045), n2=fbm(p*0.19+31.7), n3=vnoise(p*1.4+7.);
 float olive=smoothstep(.42,.68,n1);
 float light=smoothstep(.58,.82,n2)*smoothstep(.3,.75,n3+.15);
 float dry=smoothstep(.6,.78,fbm(p*0.03+90.)+(n2-.5)*.3);
 vec3 c=uBase;
 c=mix(c,uOlive,olive*.85*uVar);
 c=mix(c,uLight,light*.8*uVar);
 c=mix(c,uDryC,dry*.75*uVar*uDry);
 return c*(0.9+0.2*n3);
}`;
function bladeMat(){const m=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x000000,shininess:1,side:THREE.DoubleSide});
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uTime,uMaxDist,uH,uW,uWind,uWindSpeed;uniform vec3 uCam;varying vec3 vGC;\n'+GLSL)
   .replace('#include <defaultnormal_vertex>','vec3 transformedNormal=normalMatrix*vec3(0.0,1.0,0.0);')
   .replace('#include <project_vertex>',`
    vec3 tr=transformed*vec3(uW,uH,uH);
    vec4 wp=instanceMatrix*vec4(tr,1.0);
    vec3 base=instanceMatrix[3].xyz;
    float t=position.y;
    float fade=1.0-smoothstep(uMaxDist*0.8,uMaxDist,length(base.xz-uCam.xz));
    wp.y=base.y+(wp.y-base.y)*fade;
    float ph=base.x*0.12+base.z*0.08;
    float gust=max(sin(uTime*uWindSpeed+ph)*0.5+sin(uTime*uWindSpeed*2.3+base.x*0.4-base.z*0.25)*0.25+0.6,0.0);
    float hgt=instanceMatrix[1].y*uH*fade;
    wp.xz+=vec2(0.94,0.34)*uWind*gust*hgt*t*t*0.9;
    wp.xz+=vec2(cos(base.z*9.),sin(base.x*7.))*0.015*uWind*hgt*t*sin(uTime*uWindSpeed*3.0+base.x*5.0);
    vec4 mvPosition=viewMatrix*wp;
    gl_Position=projectionMatrix*mvPosition;
    float rnd=fract(sin(dot(base.xz,vec2(12.9898,78.233)))*43758.5453);
    vGC=grassColor(base.xz)*(0.62+0.5*t)*(0.9+0.2*rnd);`);
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <common>','#include <common>\nvarying vec3 vGC;')
   .replace('vec4 diffuseColor = vec4( diffuse, opacity );','vec4 diffuseColor=vec4(vGC,opacity);')
   .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(vNormal);')};
 return m}
function bladeGeo(hi){const g=new THREE.BufferGeometry(),v=hi?[-.5,0,0,.5,0,0,-.38,.5,.04,.38,.5,.04,0,1,.18]:[-.5,0,0,.5,0,0,0,1,.12];
 g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(hi?[0,1,2,1,3,2,2,3,4]:[0,1,2]);return g}
const GA=bladeGeo(true),GB=bladeGeo(false);
const TIERS=[{r:.28,mult:1,wmul:1,geo:GA},{r:.62,mult:.38,wmul:1.5,geo:GB},{r:1,mult:.14,wmul:2.5,geo:GB}];
class Grass{
 constructor(){this.group=new THREE.Group();scene.add(this.group);this.material=bladeMat();this.cells=new Map();this.pool=[];this.queue=[];this.ver=0;this.dirty=true;this.last=new THREE.Vector3(1e9,0,1e9);
  this.frustum=new THREE.Frustum();this.tmp=new THREE.Matrix4();this.box=new THREE.Box3();this.shadow=false}
 invalidate(){this.ver++;this.dirty=true}
 lodFor(d){const f=d/CFG.maxDist;return f<TIERS[0].r?0:f<TIERS[1].r?1:2}
 plan(cp){const R=CFG.maxDist+CELL,need=new Set();this.queue=[];
  for(let cz=Math.floor((cp.z-R)/CELL);cz<=Math.floor((cp.z+R)/CELL);cz++)for(let cx=Math.floor((cp.x-R)/CELL);cx<=Math.floor((cp.x+R)/CELL);cx++){
   const d=Math.hypot((cx+.5)*CELL-cp.x,(cz+.5)*CELL-cp.z);if(d>R)continue;const key=cx+','+cz,lod=this.lodFor(d),c=this.cells.get(key);need.add(key);
   if(!c||c.lod!==lod||c.ver!==this.ver)this.queue.push({key,cx,cz,lod,d})}
  for(const[key,c]of this.cells)if(!need.has(key)){this.release(c);this.cells.delete(key)}
  this.queue.sort((a,b)=>a.d-b.d)}
 acquire(max){for(let i=0;i<this.pool.length;i++){const m=this.pool[i];if(m.userData.cap>=max&&m.userData.cap<=max*3+64){this.pool.splice(i,1);return m}}
  const cap=Math.ceil(max*1.2)+8,m=new THREE.InstancedMesh(GA,this.material,cap);m.userData.cap=cap;m.frustumCulled=false;m.receiveShadow=this.shadow;this.group.add(m);return m}
 release(c){if(!c.mesh)return;c.mesh.visible=false;c.mesh.count=0;this.pool.push(c.mesh);c.mesh=null;
  while(this.pool.length>48){const m=this.pool.shift();this.group.remove(m);if(m.dispose)m.dispose()}}
 build(job){const tier=TIERS[job.lod],max=Math.ceil(CFG.density*tier.mult*CELL*CELL);
  let c=this.cells.get(job.key);if(!c){c={mesh:null,lod:-1,ver:-1,x0:0,z0:0,minY:0,maxY:0};this.cells.set(job.key,c)}
  if(c.mesh&&c.mesh.userData.cap<max)this.release(c);if(!c.mesh)c.mesh=this.acquire(max);
  const mesh=c.mesh,arr=mesh.instanceMatrix.array;mesh.geometry=tier.geo;mesh.receiveShadow=this.shadow;
  const rng=mulberry32(Math.imul(job.cx,73856093)^Math.imul(job.cz,19349663)^SEED),x0=job.cx*CELL,z0=job.cz*CELL;
  let n=0,cx=0,cz=0,cr=.4,minY=1e9,maxY=-1e9,ty=0,sx=0,sz=0,td=0;
  for(let i=0;i<max;i++){
   if(i%10===0){cx=x0+rng()*CELL;cz=z0+rng()*CELL;cr=.25+rng()*.55;
    ty=ground(cx,cz);const rd=gRD;sx=(ground(cx+1,cz)-ty);sz=(ground(cx,cz+1)-ty);td=density(cx,cz,rd)}
   const a=rng()*6.2832,rr=Math.sqrt(rng())*cr,r1=rng(),r2=rng(),r3=rng(),r4=rng(),r5=rng(),r6=rng();
   if(r1>td)continue;
   const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr,y=ty+sx*(x-cx)+sz*(z-cz)-.02;
   const hh=(.55+r2*.95)*(.6+.4*td)*(1.15-.35*rr/cr),w=(.7+r3*.7)*tier.wmul,rot=r4*6.2832,la=r5*6.2832,lm=.04+r6*r6*.5,o=n*16,cs=Math.cos(rot),sn=Math.sin(rot);
   arr[o]=cs*w;arr[o+1]=0;arr[o+2]=-sn*w;arr[o+3]=0;
   arr[o+4]=Math.cos(la)*lm*hh;arr[o+5]=hh;arr[o+6]=Math.sin(la)*lm*hh;arr[o+7]=0;
   arr[o+8]=sn;arr[o+9]=0;arr[o+10]=cs;arr[o+11]=0;
   arr[o+12]=x;arr[o+13]=y;arr[o+14]=z;arr[o+15]=1;
   if(y<minY)minY=y;if(y>maxY)maxY=y;n++}
  mesh.count=n;mesh.instanceMatrix.needsUpdate=true;Object.assign(c,{lod:job.lod,ver:this.ver,x0,z0,minY,maxY});return max}
 update(){const cp=cam.position;
  if(this.dirty||Math.hypot(cp.x-this.last.x,cp.z-this.last.z)>CELL*.25){this.plan(cp);this.last.copy(cp);this.dirty=false}
  for(let spent=0;this.queue.length&&spent<40000;)spent+=this.build(this.queue.shift());
  cam.updateMatrixWorld();this.tmp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.tmp);
  const hmax=CFG.height*2.2;
  for(const c of this.cells.values()){if(!c.mesh)continue;this.box.min.set(c.x0-1,c.minY-.2,c.z0-1);this.box.max.set(c.x0+CELL+1,c.maxY+hmax,c.z0+CELL+1);
   c.mesh.visible=c.mesh.count>0&&this.frustum.intersectsBox(this.box)}}
 clear(){for(const c of this.cells.values())this.release(c);this.cells.clear();this.queue.length=0;this.dirty=true}
}
let G=null,lvOn=-1;
// nível 0 desliga; 1–3 ajusta densidade e alcance
window.g3Level=function(l){l=Math.max(0,Math.min(3,l|0));if(l===lvOn)return;lvOn=l;
 if(!l){if(G){G.group.visible=false;G.clear()}return}
 if(!G)G=new Grass();CFG.density=LV[l].density;CFG.maxDist=LV[l].maxDist;U.uMaxDist.value=CFG.maxDist;G.shadow=l>=3;G.group.visible=true;G.clear();G.invalidate()};
window.g3Frame=function(dt){
 const want=window.HOME?0:(typeof GS!=='undefined'&&GS.grass3d!==undefined?GS.grass3d:2);
 if(!want){if(G&&G.group.visible){G.group.visible=false}lvOn=window.HOME&&lvOn>0?-2:lvOn;return}
 if(want!==lvOn)g3Level(want);if(!G)return;if(!G.group.visible)G.group.visible=true;
 U.uTime.value+=Math.min(dt,.1);U.uCam.value.copy(cam.position);G.update()};
// quando o mundo é recarregado/teletransportado, refaz as células
window.g3Reset=function(){if(G)G.clear()};
})();
