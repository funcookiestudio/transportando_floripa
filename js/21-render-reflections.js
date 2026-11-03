/* ===== Reflexos dinâmicos: CubeCamera em baixa frequência + PMREM ===== */
let cubeRT=null,cubeCam=null,pm=null,envRT=null,envCur=null,envN=0,envOff=false;
function updEnv(){if(envOff||!ready||++envN<(qi==2?20:45))return;envN=0;
 try{if(!cubeRT){cubeRT=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:false,minFilter:THREE.LinearFilter});cubeCam=new THREE.CubeCamera(.5,600,cubeRT);pm=new THREE.PMREMGenerator(R)}
  const vis=[pivot];wh.forEach(w=>vis.push(w.W,w.coil,w.dmp));const old=vis.map(o=>o.visible);vis.forEach(o=>o.visible=false);
  const tm=R.toneMapping,au=R.shadowMap.autoUpdate;R.toneMapping=THREE.NoToneMapping;R.shadowMap.autoUpdate=false;
  try{cubeCam.position.set(pos.x,H(pos.x,pos.z)+2.4,pos.z);cubeCam.update(R,scene)}
  finally{R.toneMapping=tm;R.shadowMap.autoUpdate=au;vis.forEach((o,i)=>o.visible=old[i])}
  const rt=pm.fromCubemap(cubeRT.texture);if(envRT)envRT.dispose();envRT=rt;envCur=rt.texture;if(scene.environment)scene.environment=envCur}
 catch(e){envOff=true;envCur=null}}
