const $=id=>document.getElementById(id);
const hh=(a,b,c=0)=>{const h=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return h-Math.floor(h)};
const Hb=(x,z)=>{const d=Math.hypot(x,z),f=Math.min(1,Math.max(0,(d-30)/70)),s=f*f*(3-2*f);
 return s*(Math.sin(x*.021)*Math.cos(z*.017)*3.2+Math.sin(x*.047+z*.031)*1.1+Math.sin(z*.05-x*.023)*.9+Math.sin(x*.009+1)*Math.sin(z*.011)*6)};
const wrap=a=>{while(a>Math.PI)a-=6.2832;while(a<-Math.PI)a+=6.2832;return a};
const R=new THREE.WebGLRenderer({antialias:!(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.hardwareConcurrency||8)<=4),powerPreference:"high-performance"});R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
document.body.prepend(R.domElement);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(62,1,.1,600);
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

