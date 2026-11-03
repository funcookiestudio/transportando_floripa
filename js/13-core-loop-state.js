// ---- loop ----
let last=performance.now(),spin=0,orbYaw=0,orbPitch=0,zoom=1;const QO=new THREE.Quaternion(),EO=new THREE.Euler();
const PT=new Map();let pd=0;const cv=R.domElement;
cv.addEventListener('pointerdown',e=>{audio();if(e.pointerType==='mouse')PT.clear();PT.set(e.pointerId,{x:e.clientX,y:e.clientY});cv.setPointerCapture(e.pointerId);if(PT.size==2){const[a,b]=[...PT.values()];pd=Math.hypot(a.x-b.x,a.y-b.y)}});
cv.addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(PT.size==2){const[a,b]=[...PT.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd)zoom=Math.max(.4,Math.min(3,zoom*pd/d));pd=d}
 else{orbYaw-=dx*.006;orbPitch=Math.max(-.35,Math.min(1.1,orbPitch+dy*.005))}});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>cv.addEventListener(t,e=>{PT.delete(e.pointerId);pd=0}));addEventListener('blur',()=>{PT.clear();pd=0});document.addEventListener('visibilitychange',()=>{PT.clear();pd=0});
cv.addEventListener('wheel',e=>{zoom=Math.max(.4,Math.min(3,zoom*(1+e.deltaY*.001)));e.preventDefault()},{passive:false});const V=new THREE.Vector3();
