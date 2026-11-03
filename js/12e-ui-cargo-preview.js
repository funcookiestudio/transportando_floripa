/* ===== Prévia 3D da carga sobre o chassi: painel de fretes em tela cheia (renderizador próprio, só roda com o painel aberto) ===== */
const PV={on:false,list:[],i:-1,R:null,sc:null,cam:null,tr:null,yaw:.9,pitch:.26,drag:null,raf:0,last:0,w:0,h:0},PVT=new THREE.Vector3(0,1.7,.3);
function pvInit(){if(PV.R)return true;
 try{const cv=$('cmc'),R2=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R2.setPixelRatio(Math.min(devicePixelRatio,1.5));R2.shadowMap.enabled=true;R2.shadowMap.type=THREE.PCFSoftShadowMap;R2.outputEncoding=THREE.sRGBEncoding;R2.toneMapping=THREE.ACESFilmicToneMapping;R2.toneMappingExposure=1.05;
  const sc=new THREE.Scene(),cm=new THREE.PerspectiveCamera(36,1,.5,200);
  {const es=new THREE.Scene(),eg=new THREE.SphereGeometry(50,24,16),ep=eg.attributes.position,ec=new Float32Array(ep.count*3),c1=new THREE.Color();
   for(let i=0;i<ep.count;i++){const y=ep.getY(i)/50;if(y>0)c1.setRGB(.5+.4*(1-y),.65+.25*(1-y),.85+.15*(1-y));else c1.setRGB(.2,.22,.16);ec[i*3]=c1.r;ec[i*3+1]=c1.g;ec[i*3+2]=c1.b}
   eg.setAttribute('color',new THREE.BufferAttribute(ec,3));es.add(new THREE.Mesh(eg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
   const sm=new THREE.Mesh(new THREE.SphereGeometry(5,8,8),new THREE.MeshBasicMaterial({color:0xfff6dd}));sm.position.set(25,28,18);es.add(sm);
   const pm=new THREE.PMREMGenerator(R2);sc.environment=pm.fromScene(es,.03).texture;pm.dispose()}
  sc.add(new THREE.HemisphereLight(0xffffff,0x4a5a3a,.55));
  const sn=new THREE.DirectionalLight(0xfff4e0,1.1);sn.position.set(14,22,16);sn.castShadow=true;sn.shadow.mapSize.set(1024,1024);Object.assign(sn.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:80});sn.shadow.bias=-.0005;sn.shadow.normalBias=.04;sc.add(sn);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.ShadowMaterial({opacity:.45}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;sc.add(gr);
  const gd=new THREE.GridHelper(48,48,0x34404b,0x1d252d);gd.position.y=.003;sc.add(gd);
  const root=new THREE.Group();sc.add(root);PV.tr=mkTrailer(root,0,0,1); // mesmo modelo das carretas estacionadas (chassi novo + rodas)
  cv.addEventListener('pointerdown',e=>{PV.drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);e.preventDefault()});
  cv.addEventListener('pointermove',e=>{if(!PV.drag)return;PV.yaw-=(e.clientX-PV.drag.x)*.008;PV.pitch=Math.max(.06,Math.min(1.1,PV.pitch+(e.clientY-PV.drag.y)*.006));PV.drag.x=e.clientX;PV.drag.y=e.clientY});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>{PV.drag=null}));
  PV.R=R2;PV.sc=sc;PV.cam=cm;return true}catch(e){PV.R=null;console.warn('prévia da carga',e);return false}}
function pvSet(i){const o=PV.list[i];if(!o||!PV.tr)return;PV.i=i;setTrCargo(PV.tr,o.name,o.tons);
 $('cmi').innerHTML='<b></b><small></small>';$('cmi').firstChild.textContent=o.name+' · '+o.tons+' t';$('cmi').lastChild.textContent=o.sub||'';
 [...$('cmg').children].forEach((b,k)=>b.classList.toggle('sel',k===i))}
function pvFrame(now){if(!PV.on)return;PV.raf=requestAnimationFrame(pvFrame);const dt=Math.min(.05,(now-PV.last)/1000||0);PV.last=now;
 const cv=$('cmc'),w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
 if(w!==PV.w||h!==PV.h){PV.w=w;PV.h=h;PV.R.setSize(w,h,false);PV.cam.aspect=w/h;PV.cam.updateProjectionMatrix()}
 if(!PV.drag)PV.yaw+=dt*.32;
 const d=Math.min(42,19*Math.max(1,1.35/(w/h))),cp=Math.cos(PV.pitch);
 PV.cam.position.set(PVT.x+Math.sin(PV.yaw)*cp*d,PVT.y+Math.sin(PV.pitch)*d,PVT.z+Math.cos(PV.yaw)*cp*d);PV.cam.lookAt(PVT);PV.R.render(PV.sc,PV.cam)}
function pvOpen(list){if(!pvInit())return false;PV.list=list;PV.on=true;PV.w=PV.h=0;pvSet(0);PV.last=performance.now();cancelAnimationFrame(PV.raf);PV.raf=requestAnimationFrame(pvFrame);return true}
function pvClose(){if(!PV.on)return;PV.on=false;cancelAnimationFrame(PV.raf);PV.drag=null;PV.i=-1;if(PV.tr)setTrCargo(PV.tr,null)} // libera a carga da prévia
