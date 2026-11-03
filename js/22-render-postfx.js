/* ===== Pós-processamento: bloom (faróis, sol, luzes emissivas) ===== */
function initFX(){if(!(THREE.EffectComposer&&THREE.UnrealBloomPass&&THREE.RenderPass&&THREE.ShaderPass&&THREE.CopyShader))return;
 try{const w=innerWidth,h=innerHeight,ms=R.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget;
  const rt=ms?new THREE.WebGLMultisampleRenderTarget(w,h,{format:THREE.RGBAFormat}):new THREE.WebGLRenderTarget(w,h,{format:THREE.RGBAFormat});if(ms)rt.samples=4;
  rt.texture.encoding=THREE.sRGBEncoding; // a cena já sai com tone mapping + sRGB, como antes
  comp=new THREE.EffectComposer(R,rt);comp.addPass(new THREE.RenderPass(scene,cam));
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),.35,.55,.93);comp.addPass(bloom);
  grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},sat:{value:1.1},con:{value:1.06},blur:{value:0},tint:{value:new THREE.Vector3(1,1,1)}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform sampler2D tDiffuse;uniform float sat,con,blur;uniform vec3 tint;varying vec2 vUv;void main(){vec2 d=vUv-.5;vec3 c=texture2D(tDiffuse,vUv).rgb;if(blur>0.){for(int i=1;i<6;i++)c+=texture2D(tDiffuse,vUv-d*blur*float(i)/5.).rgb;c/=6.;}float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);c=(c-.5)*con+.5;gl_FragColor=vec4(c*tint,1.);}'});
  comp.addPass(grade);comp.addPass(new THREE.ShaderPass(THREE.CopyShader));resize()}catch(e){comp=null;bloom=null}}
function draw(){if(comp&&GS.post){const dark=night||hourT>=18.5||hourT<5.5;bloom.strength=dark?(lightsOn?.9:.5):(lightsOn?.45:.3);const h=hourT,w=Math.max(0,1-Math.abs(h-18.3)/1.4,1-Math.abs(h-6.3)/1.2),n=(h>=19.7||h<5)?1:0,u=grade.uniforms;u.tint.value.set(1+.05*w-.06*n,1-.01*w-.02*n,1-.07*w+.06*n);
  u.blur.value=Math.max(0,Math.min(1,(Math.hypot(vel.x,vel.z)-22)/20))*.07; // desfoque radial leve em alta velocidade
  if(!GS.grade){u.sat.value=1;u.con.value=1;u.tint.value.set(1,1,1)}else{u.sat.value=1.1;u.con.value=1.06}if(!GS.motion)u.blur.value=0;
  try{comp.render()}catch(e){comp=null;R.domElement.style.filter=qi==2?"contrast(1.06) saturate(1.1)":"";R.render(scene,cam)}}else R.render(scene,cam)}

