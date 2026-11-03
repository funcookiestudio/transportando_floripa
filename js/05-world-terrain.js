// ---- terreno ----
const SEG=100,STEP=3,tg=new THREE.PlaneGeometry(SEG*STEP,SEG*STEP,SEG,SEG);tg.rotateX(-Math.PI/2);
const tp=tg.attributes.position,bx=Float32Array.from(tp.array.filter((_,i)=>i%3==0)),bz=Float32Array.from(tp.array.filter((_,i)=>i%3==2));
const tc=new Float32Array(tp.count*3);tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
// textura procedural de grama (tileável): lâminas + manchas, aplicada em coordenadas de mundo sobre a cor por vértice
const grassTex=(()=>{const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,N,N);
 let sd=12345;const rnd=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;
 const wrap9=f=>{for(const ox of[-N,0,N])for(const oy of[-N,0,N]){g.save();g.translate(ox,oy);f();g.restore()}};
 for(let i=0;i<46;i++){const x=rnd()*N,y=rnd()*N,r=18+rnd()*46,l=rnd()<.5?20:235,a=.07+rnd()*.08;wrap9(()=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+l+','+l+','+l+','+a+')');gr.addColorStop(1,'rgba('+l+','+l+','+l+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)})}
 g.lineCap='round';for(let i=0;i<5200;i++){const x=rnd()*N,y=rnd()*N,len=3+rnd()*7,an=-1.57+(rnd()-.5)*1.1,v=rnd(),c=v<.5?Math.floor(40+rnd()*70):Math.floor(150+rnd()*95);
  wrap9(()=>{g.strokeStyle='rgba('+c+','+c+','+c+','+(.35+rnd()*.35)+')';g.lineWidth=.7+rnd()*1.1;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(an)*len,y+Math.sin(an)*len);g.stroke()})}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t})();
const terrMat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1});
terrMat.onBeforeCompile=sh=>{sh.uniforms.gmap={value:grassTex};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vWP;uniform sampler2D gmap;').replace('#include <color_fragment>','#include <color_fragment>\n{float fd=smoothstep(40.,150.,length(vViewPosition));float a1=texture2D(gmap,vWP*.42).r,a2=texture2D(gmap,vWP*.057+vec2(.31,.67)).r,a3=texture2D(gmap,vWP*1.9).r;a1=mix(a1,.5,fd);a3=mix(a3,.5,smoothstep(14.,55.,length(vViewPosition)));float gs=smoothstep(.005,.05,vColor.g-vColor.r*.9);float k=mix(.68,1.2,a1)*mix(.84,1.14,a2)*mix(.9,1.1,a3);diffuseColor.rgb*=mix(mix(1.,k,.3),k,gs);diffuseColor.rgb+=gs*vec3(-.01,.012,-.01)*(a2-.5);}')};
const tm=new THREE.Mesh(tg,terrMat);tm.receiveShadow=true;tm.frustumCulled=false;scene.add(tm);
let tcx=1e9,tcz=1e9;const col=new THREE.Color();
function updTerrain(){const cx=Math.round(pos.x/STEP)*STEP,cz=Math.round(pos.z/STEP)*STEP;if(cx==tcx&&cz==tcz)return;tcx=cx;tcz=cz;tm.position.set(cx,0,cz);
 for(let i=0;i<tp.count;i++){const x=cx+bx[i],z=cz+bz[i];let y=H(x,z);if(RIN&&RD<=11.8){const lim=yR(RS)-.06;if(y>lim)y=lim}tp.setY(i,y);const n=hh(x,z,9),t=Math.min(1,Math.max(0,y/7));
  col.setHSL(.27-.1*t-.03*n,.45-.1*t,.3+.07*n+.06*t);if(Math.hypot(x,z)<28)col.setHSL(.1,.25,.42+.05*n);{const nn=.5+.5*Math.sin(x*.13+Math.sin(z*.09)*2.5)*Math.cos(z*.11+Math.sin(x*.07)*2);if(RD<10.8+3.5*nn)col.setHSL(.09,.12,.34+.06*n);else if(RD<22)col.offsetHSL(.015*nn,-.1*nn,.04*nn-.02)}if(padW(x,z)>.04){const u=Math.min(1,Math.max(0,(PADW-.25)/.5)),k=u*u*(3-2*u);if(k>0){const a=col.r,b2=col.g,c2=col.b;col.setHSL(.1,.05,.52+.05*n);col.r=a+(col.r-a)*k;col.g=b2+(col.g-b2)*k;col.b=c2+(col.b-c2)*k}}col.convertSRGBToLinear();tc[i*3]=col.r;tc[i*3+1]=col.g;tc[i*3+2]=col.b}
 tp.needsUpdate=true;tg.attributes.color.needsUpdate=true}

