// ---- poeira e fumaça ----
const NP=300,PD={pos:new Float32Array(NP*3),a:new Float32Array(NP),s:new Float32Array(NP),c:new Float32Array(NP*3)},pq=[];
for(let i=0;i<NP;i++)pq.push({l:1,m:1,vx:0,vy:0,vz:0,s0:1,a0:1,g:1});
const pgm=new THREE.BufferGeometry();pgm.setAttribute('position',new THREE.BufferAttribute(PD.pos,3));pgm.setAttribute('a',new THREE.BufferAttribute(PD.a,1));pgm.setAttribute('s',new THREE.BufferAttribute(PD.s,1));pgm.setAttribute('col',new THREE.BufferAttribute(PD.c,3));
const pmat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pr:{value:R.getPixelRatio()}},
 vertexShader:`attribute float a;attribute float s;attribute vec3 col;uniform float pr;varying float vA;varying vec3 vC;void main(){vA=a;vC=col;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(s*(260./-mv.z)*pr,160.);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);float al=smoothstep(.5,.08,d)*vA;if(al<.01)discard;gl_FragColor=vec4(vC,al);}`});
const pts=new THREE.Points(pgm,pmat);pts.frustumCulled=false;scene.add(pts);let pIdx=0,eAcc=0;const PW=new THREE.Vector3();
function emit(p,vx,vy,vz,life,size,a0,r,g,b,grow){const i=pIdx++%NP,q=pq[i];q.l=0;q.m=life;q.vx=vx;q.vy=vy;q.vz=vz;q.s0=size;q.a0=a0;q.g=grow;PD.pos[i*3]=p.x;PD.pos[i*3+1]=p.y;PD.pos[i*3+2]=p.z;PD.c[i*3]=r;PD.c[i*3+1]=g;PD.c[i*3+2]=b}
function fxUpd(dt,vf,vl,thr){const sp=Math.abs(vf);eAcc+=dt*(onRoad?.12:1)*(sp>2.5?6+sp*1.1+Math.abs(vl)*5+(K.hb?20:0):0);
 while(eAcc>1){eAcc--;PW.set((Math.random()<.5?-1:1)*1.0,.1,Math.random()<.25?-3.98:.3);pivot.localToWorld(PW);
  emit(PW,vel.x*.3+(Math.random()-.5)*1.5,.6+Math.random()*1.2,vel.z*.3+(Math.random()-.5)*1.5,1.1+Math.random()*.8,.9+Math.random()*.7,.2+Math.min(.25,sp*.01),.55,.47,.36,2.2)}
 if(Math.random()<dt*(10+thr*40)){PW.set(-1.03,4.3,-3.5);pivot.localToWorld(PW);emit(PW,vel.x*.5+(Math.random()-.5)*.3,1.4+thr*1.5,vel.z*.5+(Math.random()-.5)*.3,1.6,.45,.14+thr*.25,.25,.25,.27,3)}
 for(let i=0;i<NP;i++){const q=pq[i];if(q.l>=q.m){PD.a[i]=0;PD.s[i]=0;continue}q.l+=dt;const t=q.l/q.m;PD.pos[i*3]+=q.vx*dt;PD.pos[i*3+1]+=q.vy*dt;PD.pos[i*3+2]+=q.vz*dt;q.vx*=.98;q.vz*=.98;q.vy*=.985;PD.a[i]=q.a0*(1-t);PD.s[i]=q.s0*(1+t*q.g)}
 for(const k of['position','a','s','col'])pgm.attributes[k].needsUpdate=true}
