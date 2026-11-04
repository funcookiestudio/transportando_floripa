const $=id=>document.getElementById(id);
/* ===== Seed do mundo =====
   Tudo (empresas, cidades, relevo, curvas e altimetria da estrada) é função pura de (seed, posição). Seed vazia = mundo clássico (idêntico ao original). */
const WSEED=(()=>{let t='';try{const q=new URLSearchParams(location.search).get('seed');if(q!==null){t=q;try{localStorage.setItem('fh16seed',q)}catch(e){}}else t=localStorage.getItem('fh16seed')||''}catch(e){}
 t=String(t).trim().slice(0,40);let n=0;if(t&&t.toLowerCase()!=='classico'&&t!=='0'){n=2166136261;for(let i=0;i<t.length;i++){n^=t.charCodeAt(i);n=Math.imul(n,16777619)}n>>>=0;if(!n)n=1}return{txt:n?t:'',n}})();
const SAVEKEY=WSEED.n?'fh16save:'+WSEED.n:'fh16save';
// hash inteiro (idêntico em qualquer navegador, sem Math.sin); o mundo clássico mantém a fórmula original para continuar igual
function ihash(a,b,c,s){let h=(s^0x9e3779b9)|0;h=Math.imul(h^a,0x85ebca6b);h^=h>>>13;h=Math.imul(h^b,0xc2b2ae35);h^=h>>>16;h=Math.imul(h^c,0x27d4eb2f);h^=h>>>15;h=Math.imul(h,0x165667b1);h^=h>>>13;return(h>>>0)/4294967296}
// região: ao passar pelo fim da rodovia que cruza um trevo, a estrada principal passa a ser outra (id novo) e é reancorada na posição do caminhão
const REG=(()=>{let r=null;try{r=JSON.parse(localStorage.getItem('fh16reg:'+(WSEED.n||0))||'null')}catch(e){}return r&&typeof r==='object'&&isFinite(r.id+r.ox+r.oz+r.oh+r.y)?r:{id:0,ox:0,oz:0,oh:0,y:0,hist:[],arr:0}})();
const HSALT={7:1,31:1,41:1,43:1,47:1,53:1,61:1,91:1}; // canais de hash da estrutura do mundo (empresas, rios, viadutos, trevos, postos, tipo de via); o relevo e as árvores não mudam
const rsalt=()=>WSEED.n^Math.imul(REG.id,0x9e3779b1);
const hh=(a,b,c=0)=>{const r=REG.id&&HSALT[c]?1:0;if(WSEED.n)return ihash(Math.round(a*16),Math.round(b*16),Math.round(c*16),r?rsalt():WSEED.n);const h=Math.sin(a*127.1+b*311.7+c*74.7+(r?REG.id*19.19:0))*43758.5453;return h-Math.floor(h)};
const PH=i=>{const r=i>=10&&REG.id;if(WSEED.n)return ihash(i,77,19,r?rsalt():WSEED.n)*6.2832;return r?ihash(i,77,19,REG.id*7919)*6.2832:0}; // fases do relevo (1-9) e da estrada (10-16)
var SRY=null; /* altura do showroom da tela inicial (null = jogo normal) */
const Hb=(x,z)=>{const d=Math.hypot(x,z),f=Math.min(1,Math.max(0,(d-30)/70)),s=f*f*(3-2*f);
 return s*(Math.sin(x*.021+PH(1))*Math.cos(z*.017+PH(2))*3.2+Math.sin(x*.047+z*.031+PH(3))*1.1+Math.sin(z*.05-x*.023+PH(4))*.9+Math.sin(x*.009+1+PH(5))*Math.sin(z*.011+PH(6))*6)};
const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a};
const R=new THREE.WebGLRenderer({antialias:!(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.hardwareConcurrency||8)<=4),powerPreference:"high-performance"});R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
document.body.prepend(R.domElement);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(62,1,.1,900);
const DAY={bg:0x9ed0f0,hemi:.5,sun:1.0},NIGHT={bg:0x070b18,hemi:.1,sun:.12};
const C=h=>new THREE.Color(h).convertSRGBToLinear();scene.fog=new THREE.Fog(C(0x9ed0f0),90,260);scene.background=C(0x9ed0f0);
const hemi=new THREE.HemisphereLight(0xffffff,0x4a5a3a,.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4e0,1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,near:1,far:260});sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
let comp=null,bloom=null,grade=null;
function resize(){R.setSize(innerWidth,innerHeight);if(comp){comp.setPixelRatio(R.getPixelRatio());comp.setSize(innerWidth,innerHeight)}cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let envTex;(()=>{const es=new THREE.Scene(),eg=new THREE.SphereGeometry(50,24,16),ep=eg.attributes.position,ec=new Float32Array(ep.count*3),c1=new THREE.Color();
 for(let i=0;i<ep.count;i++){const y=ep.getY(i)/50;if(y>0)c1.setRGB(.5+.4*(1-y),.65+.25*(1-y),.85+.15*(1-y));else c1.setRGB(.2,.22,.16);ec[i*3]=c1.r;ec[i*3+1]=c1.g;ec[i*3+2]=c1.b}
 eg.setAttribute('color',new THREE.BufferAttribute(ec,3));es.add(new THREE.Mesh(eg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 const sm=new THREE.Mesh(new THREE.SphereGeometry(5,8,8),new THREE.MeshBasicMaterial({color:0xfff6dd}));sm.position.set(25,28,18);es.add(sm);
 envTex=new THREE.PMREMGenerator(R).fromScene(es,.03).texture;scene.environment=envTex})();

