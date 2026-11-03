// ---- céu, hora do dia e qualidade adaptativa ----
const dome=new THREE.Mesh(new THREE.SphereGeometry(450,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
 uniforms:{top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sd:{value:new THREE.Vector3(0,1,0)},sc:{value:new THREE.Color()},day:{value:1}},
 vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,hor,sd,sc;uniform float day;varying vec3 p;void main(){float h=p.y;vec3 c=h>0.?mix(hor,top,pow(h,.55)):mix(hor,hor*.55,pow(-h,.4));float s=max(dot(normalize(p),sd),0.);c+=sc*(pow(s,700.)*2.5+pow(s,10.)*.22);vec3 q=floor(p*170.);float r=fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);c+=vec3(step(.9978,r)*smoothstep(.05,.4,h)*(1.-day));gl_FragColor=vec4(c,1.);}'}));
dome.renderOrder=-1;dome.frustumCulled=false;scene.add(dome);
const PAL={top:[0x040712,0x34467a,0x3f86d6].map(h=>new THREE.Color(h)),hor:[0x101a30,0xf2a266,0xb9d8ee].map(h=>new THREE.Color(h))};
const sstep=THREE.MathUtils.smoothstep,sunOff=new THREE.Vector3(60,90,40),HOURS=[9,13,16.3,18.4,23],_r=new THREE.Vector3(),_u=new THREE.Vector3(),_t=new THREE.Vector3(),_l=new THREE.Vector3();
let hourT=16.3,hour=16.3,hi=2;
function applyTOD(){const ang=(hour-6)/12*Math.PI,e=Math.sin(ang),a=sstep(e,-.25,.12),b=sstep(e,.1,.55),U=dome.material.uniforms,night=e<.03;
 const mix=A=>A[0].clone().lerp(A[1],a).lerp(A[2],b),top=mix(PAL.top),hor=mix(PAL.hor);
 U.top.value.copy(top);U.hor.value.copy(hor);U.day.value=b;scene.fog.color.copy(hor);scene.background.copy(hor);scene.fog.near=(45+45*b)*GS.view;scene.fog.far=(170+90*b)*GS.view;
 sunOff.set(-Math.cos(ang)*100,night?60:Math.max(e*100,14),night?-40:40);U.sd.value.copy(sunOff).normalize();U.sc.value.setHex(night?0x9fb4e0:0xffdca8).multiplyScalar(night?.3:1);
 if(night){sun.color.setHex(0x7f9bd8);sun.intensity=.14}else{sun.color.setHex(0xff9a55).lerp(new THREE.Color(0xfff4e0),b);sun.intensity=.1+1.4*sstep(e,.02,.4)}
 hemi.color.copy(top).lerp(new THREE.Color(0xffffff),.4);hemi.groundColor.setHex(0x4a5a3a).multiplyScalar(.35+.65*b);hemi.intensity=.12+.3*b;
 R.toneMappingExposure=night?1.15:1.05;scene.environment=e>.06?(envCur||envTex):null;
 const eI=.1+.6*sstep(e,.06,.5);scene.traverse(o=>{const m=o.material;if(m&&m.isMeshStandardMaterial)m.envMapIntensity=eI});
 LM.emissiveIntensity=.2+3.3*(1-b);lpool.material.opacity=.55*(1-b);lpool.visible=b<.95;darkK=1-b;roadMesh.material.roughness=.85-.2*(1-b)}
function todStep(dt){if(hour!==hourT){const d=hourT-hour;hour+=Math.sign(d)*Math.min(Math.abs(d),dt*4);applyTOD()}}
const bc=document.createElement('canvas');bc.width=bc.height=64;{const g=bc.getContext('2d'),r=g.createRadialGradient(32,32,3,32,32,32);r.addColorStop(0,'rgba(0,0,0,.7)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}
const blob=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(bc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
blob.scale.set(3.6,1,8.2);blob.position.set(0,.12,-2.2);blob.visible=false;pivot.add(blob);
const MOB=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(navigator.hardwareConcurrency||8)<=4;
const QL=[{n:'Baixo',pr:.75,sh:0,sp:1,pl:0},{n:'Médio',pr:1,sh:1024,sp:2,pl:2},{n:'Alto',pr:1.5,sh:2048,sp:2,pl:4}];
let qi=MOB?1:2,qAuto=true,qAcc=0,qN=0,qCool=3;
function setQBase(i){qi=i;const q=QL[i];poolL.forEach((l,k)=>l.visible=q.pl>k);tailL.visible=fogS.visible=i>0;R.setPixelRatio(Math.min(q.pr,devicePixelRatio));resize();sun.castShadow=q.sh>0;
 if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}if(q.sh)sun.shadow.mapSize.set(q.sh,q.sh);
 const sc=i==2?22:18;Object.assign(sun.shadow.camera,{left:-sc,right:sc,top:sc,bottom:-sc});sun.shadow.camera.updateProjectionMatrix();blob.visible=true;blob.material.opacity=q.sh?.5:1;spots[0].castShadow=spots[1].castShadow=i==2;R.domElement.style.filter=(i==2&&!comp)?"contrast(1.06) saturate(1.1)":""}
function qStep(ms){if(!qAuto||ms>250)return;qAcc+=ms;if(++qN<60)return;const m=qAcc/qN;qAcc=qN=0;
 if(qCool>0){qCool--;return}if(m>25){if(GS.pr>.76){GS.pr=Math.max(.75,Math.round((GS.pr-.15)*100)/100);applyGfx();qCool=2;msg('Resolução ajustada automaticamente')}else if(qi>0){setQ(qi-1);qCool=3;msg('Qualidade: '+QL[qi].n+' (automático)')}}}
