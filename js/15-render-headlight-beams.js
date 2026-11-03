// ---- sombras do cenário, feixes e brilho dos faróis ----
[trunk,leaf,rock,coneM,bushes].forEach(m=>{m.castShadow=m.receiveShadow=true});
spots.forEach(sp=>{Object.assign(sp.shadow,{bias:-.001,normalBias:.03});sp.shadow.mapSize.set(1024,1024);sp.shadow.camera.near=1;sp.shadow.camera.far=70});
const bm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{k:{value:0}},
 vertexShader:'varying float t;varying float ed;void main(){t=-position.z/34.;vec3 n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);ed=pow(abs(dot(n,normalize(-mv.xyz))),1.4);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform float k;varying float t;varying float ed;void main(){float a=k*pow(clamp(1.-t,0.,1.),1.6)*.2*ed;gl_FragColor=vec4(1.,.92,.75,a);}'});
const bgm=new THREE.ConeGeometry(4.2,34,24,1,true);bgm.translate(0,-17,0);bgm.rotateX(Math.PI/2);
const beams=[-.8,.8].map(x=>{const m=new THREE.Mesh(bgm,bm);m.position.set(x,1.25,-5.7);m.frustumCulled=false;m.visible=false;pivot.add(m);return m});
const gC=document.createElement('canvas');gC.width=gC.height=64;{const g=gC.getContext('2d'),r=g.createRadialGradient(32,32,1,32,32,32);r.addColorStop(0,'rgba(255,245,220,1)');r.addColorStop(.25,'rgba(255,225,170,.5)');r.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}
const glows=[-.8,.8].map(x=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(gC),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));s.scale.set(2.4,2.4,1);s.position.set(x,1.25,-5.8);s.visible=false;pivot.add(s);return s});
function beamStep(){const d=dome.material.uniforms.day.value,k=lightsOn?1-d:0;bm.uniforms.k.value=k;beams.forEach(b=>{b.visible=k>.02&&GS.beams;b.scale.z=hiB?1:.55});glows.forEach(s=>{s.visible=lightsOn&&GS.beams&&!VEH.car;s.material.opacity=(.35+.65*(1-d))*(hiB?1:.7)})}
function sunFollow(){_l.copy(sunOff).normalize();_r.set(0,1,0).cross(_l).normalize();_u.copy(_l).cross(_r);
 const tx=2*(qi==2?22:18)/(QL[qi].sh||1024);_t.set(pos.x,0,pos.z);const r=_t.dot(_r),u=_t.dot(_u);
 _t.addScaledVector(_r,Math.round(r/tx)*tx-r).addScaledVector(_u,Math.round(u/tx)*tx-u);sun.target.position.copy(_t);sun.position.copy(_t).add(sunOff);dome.position.copy(cam.position)}
