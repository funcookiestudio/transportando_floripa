// ---- terreno ----
const RDL=(()=>{let v=0;try{v=+localStorage.getItem('fh16rd')||0}catch(e){}return v>=0&&v<=2?v:0})(),SEG=100,STEP=[3,4,5][RDL],tg=new THREE.PlaneGeometry(SEG*STEP,SEG*STEP,SEG,SEG);tg.rotateX(-Math.PI/2);
const tp=tg.attributes.position,bx=Float32Array.from(tp.array.filter((_,i)=>i%3==0)),bz=Float32Array.from(tp.array.filter((_,i)=>i%3==2));
const tc=new Float32Array(tp.count*3);tg.setAttribute('color',new THREE.BufferAttribute(tc,3));
// textura procedural de grama (tileável, 512 px, colorida): manchas de cor em duas escalas, sombra entre as folhas, milhares de lâminas
// em tons de verde/amarelo/seco, folhas secas, flores miúdas e pontos de terra; multiplicada sobre a cor do terreno (média normalizada)
const gavg={value:new THREE.Vector3(.5,.5,.5)};
const grassTex=(()=>{const N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');g.fillStyle='rgb(128,128,128)';g.fillRect(0,0,N,N);
 let sd=987654;const rnd=()=>(sd=(sd*1664525+1013904223)>>>0)/4294967296;
 const offs=(v,r)=>{const o=[0];if(v<r)o.push(N);if(v>N-r)o.push(-N);return o};
 const wrap=(x,y,r,f)=>{for(const ox of offs(x,r))for(const oy of offs(y,r)){g.save();g.translate(ox,oy);f();g.restore()}};
 const blob=(n,r0,r1,a0,a1,cols)=>{for(let i=0;i<n;i++){const x=rnd()*N,y=rnd()*N,r=r0+rnd()*(r1-r0),c=cols[Math.floor(rnd()*cols.length)],a=a0+rnd()*(a1-a0);
  wrap(x,y,r,()=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)})}};
 blob(70,50,130,.16,.3,['150,165,70','70,98,42','125,112,60','95,135,55','60,85,40']);
 blob(220,12,34,.14,.26,['150,170,70','60,88,38','110,100,55','100,140,55']);
 g.lineCap='round';
 // sombra entre as folhas (fundo escuro)
 for(let i=0;i<4200;i++){const x=rnd()*N,y=rnd()*N,len=3+rnd()*6,an=rnd()*6.2832;wrap(x,y,len+3,()=>{g.strokeStyle='rgba(28,40,20,'+(.35+rnd()*.3)+')';g.lineWidth=1.6+rnd()*1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(an)*len,y+Math.sin(an)*len);g.stroke()})}
 // lâminas
 const bc=[[58,90,36],[84,120,46],[104,140,52],[132,164,64],[158,176,80],[178,184,92],[150,132,74]],bw=[.16,.2,.22,.2,.12,.06,.04];
 for(let i=0;i<17000;i++){const x=rnd()*N,y=rnd()*N,len=5+rnd()*11,an=rnd()*6.2832,bend=(rnd()-.5)*5;let q=rnd(),k=0;for(;k<bw.length-1;k++){if(q<bw[k])break;q-=bw[k]}
  const c=bc[k],j=(rnd()-.5)*24,col='rgba('+Math.max(0,Math.min(255,c[0]+j))+','+Math.max(0,Math.min(255,c[1]+j))+','+Math.max(0,Math.min(255,c[2]+j*.5))+','+(.5+rnd()*.4)+')';
  const ex=x+Math.cos(an)*len,ey=y+Math.sin(an)*len,mx=(x+ex)/2-Math.sin(an)*bend,my=(y+ey)/2+Math.cos(an)*bend;
  wrap(x,y,len+4,()=>{g.strokeStyle=col;g.lineWidth=.8+rnd()*.9;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(mx,my,ex,ey);g.stroke()})}
 // terra, folhas secas e florzinhas
 for(let i=0;i<260;i++){const x=rnd()*N,y=rnd()*N,r=.8+rnd()*1.8;wrap(x,y,4,()=>{g.fillStyle='rgba(92,72,46,'+(.35+rnd()*.35)+')';g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()})}
 for(let i=0;i<46;i++){const x=rnd()*N,y=rnd()*N,r=.9+rnd()*1.2,c=rnd()<.6?'236,236,214':'226,206,92';wrap(x,y,4,()=>{g.fillStyle='rgba('+c+',.8)';g.beginPath();g.arc(x,y,r,0,6.2832);g.fill()})}
 {const d=g.getImageData(0,0,N,N).data;let r=0,gg=0,b=0;const n=d.length/4;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2]}gavg.value.set(r/n/255,gg/n/255,b/n/255)}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t})();
const terrMat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:false,roughness:1});
terrMat.onBeforeCompile=sh=>{sh.uniforms.gmap={value:grassTex};sh.uniforms.gavg=gavg;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vWP;uniform sampler2D gmap;uniform vec3 gavg;').replace('#include <color_fragment>','#include <color_fragment>\n{float dv=length(vViewPosition);vec3 t1=texture2D(gmap,vWP*.42).rgb/gavg,t2=texture2D(gmap,vWP*.0573+vec2(.31,.67)).rgb/gavg,t3=texture2D(gmap,vWP*1.7).rgb/gavg,t4=texture2D(gmap,vWP*.131+vec2(.5,.2)).rgb/gavg;'
 +'vec3 mac=mix(vec3(1.),t2*t4,.9);vec3 mid=mix(t1,vec3(1.),smoothstep(45.,170.,dv));vec3 fin=mix(t3,vec3(1.),smoothstep(10.,48.,dv));'
 +'float gs=smoothstep(.005,.05,vColor.g-vColor.r*.9);vec3 c=clamp(mac*mid*mix(vec3(1.),fin,.85),.35,1.9);diffuseColor.rgb*=mix(vec3(1.),c,gs);}')};
const tm=new THREE.Mesh(tg,terrMat);tm.receiveShadow=true;tm.frustumCulled=false;scene.add(tm);
let tcx=1e9,tcz=1e9;const col=new THREE.Color();
// atualização INCREMENTAL: ao andar 1 célula, os vértices existentes são deslocados na memória e só a borda nova é recalculada
const TN=SEG+1,tIdx=new Int32Array(TN*TN),tcol=new Int16Array(tp.count),trow=new Int16Array(tp.count),tyS=new Float32Array(tp.count),tcS=new Float32Array(tp.count*3),tNeed=new Int32Array(tp.count);
for(let i=0;i<tp.count;i++){const c=Math.round((bx[i]+SEG*STEP/2)/STEP),r=Math.round((bz[i]+SEG*STEP/2)/STEP);tcol[i]=c;trow[i]=r;tIdx[r*TN+c]=i}
function tVert(i,cx,cz){const x=cx+bx[i],z=cz+bz[i];let y=Hx(x,z,0);if(RIN&&RD<=11.8){const lim=gYR(x,z)-.06;if(y>lim)y=lim}tp.setY(i,y);const n=hh(x,z,9),t=Math.min(1,Math.max(0,y/7));
  col.setHex(0x657D3E);if(Math.hypot(x,z)<28)col.setHSL(.1,.25,.42+.05*n);{const nn=.5+.5*Math.sin(x*.13+Math.sin(z*.09)*2.5)*Math.cos(z*.11+Math.sin(x*.07)*2);if(RD<10.8+3.5*nn)col.setHSL(.09,.12,.34+.06*n);else if(RD<22)col.offsetHSL(.015*nn,-.1*nn,.04*nn-.02)}if(padW(x,z)>.04){const u=Math.min(1,Math.max(0,(PADW-.25)/.5)),k=u*u*(3-2*u);if(k>0){const a=col.r,b2=col.g,c2=col.b;col.setHSL(.1,.05,.52+.05*n);col.r=a+(col.r-a)*k;col.g=b2+(col.g-b2)*k;col.b=c2+(col.b-c2)*k}}if(RIVA.length){const rb=riverBank(x,z);if(rb>.02){const a=col.r,b2=col.g,c2=col.b;col.setHSL(.11,.3,.5+.05*n);col.r=a+(col.r-a)*rb;col.g=b2+(col.g-b2)*rb;col.b=c2+(col.b-c2)*rb}}col.convertSRGBToLinear();tc[i*3]=col.r;tc[i*3+1]=col.g;tc[i*3+2]=col.b}
// marcações locais: recalcula só os vértices num raio (1 por quadro) em vez do terreno inteiro
const TDIRTY=[];function terrMark(x,z,r){TDIRTY.push([x,z,r,0])}
function terrFlush(){if(!TDIRTY.length)return;if(tcx>1e8){TDIRTY.length=0;return}const d=TDIRTY[0],r2=d[2]*d[2],cx=tcx,cz=tcz,n=tp.count;let k=0,i=d[3];for(;i<n&&k<250;i++){const x=cx+bx[i]-d[0],z=cz+bz[i]-d[1];if(x*x+z*z<=r2){tVert(i,cx,cz);k++}}d[3]=i;if(i>=n)TDIRTY.shift();if(k){tp.needsUpdate=true;tg.attributes.color.needsUpdate=true}}
function updTerrain(){terrFlush();const cx=Math.round(pos.x/STEP)*STEP,cz=Math.round(pos.z/STEP)*STEP;if(cx==tcx&&cz==tcz)return;
 let full=tcx>1e8,dc=0,dr=0;if(!full){dc=(cx-tcx)/STEP;dr=(cz-tcz)/STEP;if(Math.abs(dc)>=TN-2||Math.abs(dr)>=TN-2)full=true}
 tcx=cx;tcz=cz;tm.position.set(cx,0,cz);const ya=tp.array,n=tp.count;
 if(full){TDIRTY.length=0;for(let i=0;i<n;i++)tVert(i,cx,cz)}
 else{for(let i=0;i<n;i++)tyS[i]=ya[i*3+1];tcS.set(tc);let nn=0;
  for(let i=0;i<n;i++){const sc=tcol[i]+dc,sr=trow[i]+dr;if(sc>=0&&sc<TN&&sr>=0&&sr<TN){const j=tIdx[sr*TN+sc];ya[i*3+1]=tyS[j];tc[i*3]=tcS[j*3];tc[i*3+1]=tcS[j*3+1];tc[i*3+2]=tcS[j*3+2]}else tNeed[nn++]=i}
  for(let k=0;k<nn;k++)tVert(tNeed[k],cx,cz)}
 tp.needsUpdate=true;tg.attributes.color.needsUpdate=true}

