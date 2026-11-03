// ---- terreno ----
const SEG=100,STEP=3,tg=new THREE.PlaneGeometry(SEG*STEP,SEG*STEP,SEG,SEG);tg.rotateX(-Math.PI/2);
const tp=tg.attributes.position,bx=Float32Array.from(tp.array.filter((_,i)=>i%3==0)),bz=Float32Array.from(tp.array.filter((_,i)=>i%3==2));
const tc=new Float32Array(tp.count*3);tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
const tm=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));tm.receiveShadow=true;tm.frustumCulled=false;scene.add(tm);
let tcx=1e9,tcz=1e9;const col=new THREE.Color();
function updTerrain(){const cx=Math.round(pos.x/STEP)*STEP,cz=Math.round(pos.z/STEP)*STEP;if(cx==tcx&&cz==tcz)return;tcx=cx;tcz=cz;tm.position.set(cx,0,cz);
 for(let i=0;i<tp.count;i++){const x=cx+bx[i],z=cz+bz[i];let y=H(x,z);if(RIN&&RD<=11.8){const lim=yR(RS)-.06;if(y>lim)y=lim}tp.setY(i,y);const n=hh(x,z,9),t=Math.min(1,Math.max(0,y/7));
  col.setHSL(.27-.1*t-.03*n,.45-.1*t,.3+.07*n+.06*t);if(Math.hypot(x,z)<28)col.setHSL(.1,.25,.42+.05*n);{const nn=.5+.5*Math.sin(x*.13+Math.sin(z*.09)*2.5)*Math.cos(z*.11+Math.sin(x*.07)*2);if(RD<10.8+3.5*nn)col.setHSL(.09,.12,.34+.06*n);else if(RD<22)col.offsetHSL(.015*nn,-.1*nn,.04*nn-.02)}if(padW(x,z)>.04){const u=Math.min(1,Math.max(0,(PADW-.25)/.5)),k=u*u*(3-2*u);if(k>0){const a=col.r,b2=col.g,c2=col.b;col.setHSL(.1,.05,.52+.05*n);col.r=a+(col.r-a)*k;col.g=b2+(col.g-b2)*k;col.b=c2+(col.b-c2)*k}}col.convertSRGBToLinear();tc[i*3]=col.r;tc[i*3+1]=col.g;tc[i*3+2]=col.b}
 tp.needsUpdate=true;tg.attributes.color.needsUpdate=true}

