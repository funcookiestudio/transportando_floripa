/* ===== Showroom da tela inicial: salão fechado (piso espelhado, plataforma giratória, paredes com faixas de luz) suspenso acima do mundo ===== */
/* o veículo é erguido SRY metros acima do terreno; H() devolve SRY enquanto o showroom está ativo, então rodas e suspensão assentam no piso do salão */
let SR=null,srSaved=null;const SR_LIFT=400;
function srTex(stops,w,h){const c=document.createElement('canvas');c.width=w||8;c.height=h||256;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,c.height);stops.forEach(s=>gr.addColorStop(s[0],s[1]));g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);const t=new THREE.CanvasTexture(c);return t}
function srBuild(){
 SR=new THREE.Group();SR.name='showroom';
 const B=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,fog:false},o||{}));
 /* piso espelhado escuro e plataforma */
 const floor=new THREE.Mesh(new THREE.CircleGeometry(60,64).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x10161d,roughness:.32,metalness:.55}));floor.position.y=-.24;floor.receiveShadow=true;SR.add(floor);
 const plat=new THREE.Group();SR.add(plat);SR.userData.plat=plat;
 const pd=new THREE.Mesh(new THREE.CylinderGeometry(12.5,12.8,.24,64),new THREE.MeshStandardMaterial({color:0x1b2630,roughness:.28,metalness:.65}));pd.position.y=-.12;pd.receiveShadow=true;plat.add(pd);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(12.55,.07,8,96).rotateX(Math.PI/2),B(0xffb400));ring.position.y=.005;plat.add(ring);
 const ring2=new THREE.Mesh(new THREE.TorusGeometry(10.2,.03,6,96).rotateX(Math.PI/2),B(0xdfe8f0,{transparent:true,opacity:.55}));ring2.position.y=.006;plat.add(ring2);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,m=new THREE.Mesh(new THREE.BoxGeometry(.22,.02,1.6),B(0xdfe8f0,{transparent:true,opacity:.35}));m.position.set(Math.sin(a)*11.3,.008,Math.cos(a)*11.3);m.rotation.y=a;plat.add(m)}
 /* paredes em gradiente, teto e faixas de luz */
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(58,58,44,64,1,true),B(0xffffff,{map:srTex([[0,'#0a0f15'],[.45,'#121b25'],[.82,'#2a3d50'],[1,'#3a5268']]),side:THREE.BackSide}));wall.position.y=21.76;SR.add(wall);
 const ceil=new THREE.Mesh(new THREE.CircleGeometry(58,48).rotateX(Math.PI/2),B(0x070a0e));ceil.position.y=43.76;SR.add(ceil);
 const sm=B(0xfff0d0,{transparent:true,opacity:.92});
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2,h=i%2?9:15,m=new THREE.Mesh(new THREE.BoxGeometry(.5,h,.2),sm);m.position.set(Math.sin(a)*57.2,h/2+1.2,Math.cos(a)*57.2);m.rotation.y=a;SR.add(m)}
 const lr=new THREE.Mesh(new THREE.TorusGeometry(40,.3,8,96).rotateX(Math.PI/2),B(0xffffff));lr.position.y=30;SR.add(lr);
 const lr2=new THREE.Mesh(new THREE.TorusGeometry(24,.2,8,96).rotateX(Math.PI/2),B(0xffb400,{transparent:true,opacity:.9}));lr2.position.y=36;SR.add(lr2);
 /* luzes: refletor principal por cima e contraluzes quente/fria */
 const key=new THREE.SpotLight(0xfff0d8,2.6,150,.62,.75,1);key.position.set(6,32,8);key.target.position.set(0,0,0);SR.add(key,key.target);
 const r1=new THREE.PointLight(0xffa040,1.3,80,1);r1.position.set(-24,8,-18);SR.add(r1);
 const r2=new THREE.PointLight(0x5aa0ff,1.1,80,1);r2.position.set(26,7,20);SR.add(r2);
 SR.userData.lights=[key,r1,r2];
 scene.add(SR)}
/* centro do veículo no piso (a carreta é longa: o centro fica 5 m atrás do cavalo; o Civic, 1,4 m à frente do eixo traseiro) */
function srCenter(){const o=VEH.car?-1.4:(typeof hpTrlOnly==='function'&&hpTrlOnly()?6.45:1);return[pos.x+Math.sin(hd)*o,pos.z+Math.cos(hd)*o]}
function srEnter(){if(SR&&SR.visible&&SRY!=null)return;
 if(SRY==null)SRY=Hx(pos.x,pos.z,1)+SR_LIFT;
 if(!SR)srBuild();SR.visible=true;
 if(!srSaved){srSaved={hourT,hour,lightsOn,fn:scene.fog.near,ff:scene.fog.far};hourT=hour=21;lightsOn=true;try{applyTOD()}catch(e){}}}
function srLeave(){if(SR)SR.visible=false;
 if(SRY!=null){SRY=null}
 if(srSaved){hourT=srSaved.hourT;hour=srSaved.hour;lightsOn=srSaved.lightsOn;srSaved=null;try{applyTOD()}catch(e){}}
 tS.forEach(o=>{o.y=o.cy-.1})}
function srFrame(dt){if(!SR||!SR.visible)return;const[cx,cz]=srCenter();SR.position.set(cx,SRY,cz);
 const k=VEH.car?.42:(typeof hpTrlOnly==='function'&&hpTrlOnly()?1:.62),p=SR.userData.plat;p.scale.x+=(k-p.scale.x)*Math.min(1,dt*5);p.scale.z=p.scale.x;
 scene.fog.near=2e4;scene.fog.far=2e4+10; /* sem neblina do mundo dentro do salão */
 /* rodas da carreta (suspensão traseira) assentadas no piso do showroom */
 {const sT=Math.sin(th),cT=Math.cos(th);pitchT=0;tS.forEach(o=>{o.sp.rotation.x=spin/o.cy;susp(o,dt,sT,cT,SRY)})}}
