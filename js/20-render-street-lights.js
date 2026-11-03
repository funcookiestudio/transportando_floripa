/* ===== Luzes reais: postes, lanternas traseiras e faróis de neblina ===== */
var darkK=0;let fogOn=false,lampN=0;
const poolL=[0,1,2,3].map(()=>{const l=new THREE.PointLight(0xffc88a,0,30,1.5);l.visible=false;scene.add(l);return l}),
 tailL=new THREE.PointLight(0xff2010,0,16,2),fogS=new THREE.SpotLight(0xfff0c0,0,34,1,.9,1.2),fogT=new THREE.Object3D();
tailL.position.set(0,1.6,14.2);trl.add(tailL);fogS.position.set(0,.5,-7.8);fogT.position.set(0,-.4,-20);pivot.add(fogS,fogT);fogS.target=fogT;tailL.visible=fogS.visible=false;
act.fog=()=>{fogOn=!fogOn;msg('Faróis de neblina '+(fogOn?'ligados':'desligados'))};
function updLights(){const n=poolL.filter(l=>l.visible).length;
 if(n&&darkK>.02&&(++lampN%4==0)){const a=heads.instanceMatrix.array,c=heads.count,best=[];
  for(let i=0;i<c;i++){const x=a[i*16+12],z=a[i*16+14],d=(x-pos.x)*(x-pos.x)+(z-pos.z)*(z-pos.z);if(d>6400)continue;best.push([d,i])}
  best.sort((p,q)=>p[0]-q[0]);for(let k=0;k<n;k++){const b=best[k],l=poolL[k];if(b){const i=b[1];l.position.set(a[i*16+12],a[i*16+13]+7.6,a[i*16+14]);l.userData.on=1}else l.userData.on=0}}
 poolL.forEach(l=>l.intensity=l.visible&&l.userData.on?2.4*darkK:0);
 tailL.intensity=((brkP>.15||K.hb)?3.2:(lightsOn?.7:0));fogS.intensity=fogOn?1.5:0}
