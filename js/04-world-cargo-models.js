/* ===== modelos das cargas reais (instanciados, sobre a carreta) ===== */
const CARGO_KIND={'Soja':['sack',0xcdb878],'Milho':['sack',0xe0b93c],'Fertilizante':['sack',0xe9e9e3],'Farelo de trigo':['sack',0xa88a5a],'Cimento':['sack',0x9c9c97],
 'Eletrônicos':['pal',0xb08a5a,1.5,0],'Cargas diversas':['pal',0xa07c4e,1.7,1],'Paletes':['pal',0xc2a273,1.2,0],'Bebidas':['pal',0x2f6fb5,1.3,2],'Eletrodomésticos':['pal',0xeeeeea,2.1,0],'Móveis':['pal',0x8b5a2b,1.8,0],'Alimentos':['pal',0xc9a368,1.5,1],'Roupas':['pal',0xe3e8f0,1.4,0],'Tijolos':['pal',0xb4553a,1.1,0],'Cerâmica':['pal',0xd9cbb0,1.2,0],'Parafina':['pal',0xf1f1ec,1.1,0],
 'Bobinas de aço':['coil',0xa3acb5],'Vergalhões':['rebar',0x7a4b32],'Chapas de aço':['plate',0x7f8790],'Tubos':['pipe',0x44566b],'Lubrificantes':['drum',0x1f5fa8],'Aditivos':['drum',0xb3261e],'Solventes':['drum',0x6b7078],'Madeira':['wood',0xc19a6b]};
function cargoModel(name,tons){if(typeof HEAVY!=='undefined'&&HEAVY[name])return HEAVY[name](tons);const sp=CARGO_KIND[name]||['pal',0xb08a5a,1.5,0],kind=sp[0],col=sp[1],g=new THREE.Group(),disp=[],L=11.8*(tons>=18?1:tons>=12?.72:.42),z0=-5.9;
 const D=new THREE.Object3D(),cc=new THREE.Color(),hs=(i,k)=>hh(i,k,5);
 const mm=(r,m)=>{const o=new THREE.MeshStandardMaterial({color:0xffffff,roughness:r==null?.8:r,metalness:m||0,flatShading:true});disp.push(o);return o};
 const inst=(geo,m,items,base,vary)=>{const im=new THREE.InstancedMesh(geo,m,items.length);
  items.forEach((it,i)=>{D.position.set(it[0],it[1],it[2]);D.scale.set(it[3],it[4],it[5]);D.rotation.set(it[7]||0,it[6]||0,it[8]||0);D.updateMatrix();im.setMatrixAt(i,D.matrix);
   cc.setHex(base);if(vary)cc.offsetHSL((hs(i,2)-.5)*vary*.3,0,(hs(i,3)-.5)*vary);cc.convertSRGBToLinear();im.setColorAt(i,cc)});
  im.castShadow=im.receiveShadow=true;im.frustumCulled=false;g.add(im);disp.push(im)},R2=Math.PI/2;
 if(kind==='sack'){const n=Math.floor(L/.64),it=[];for(let r=0;r<n;r++)for(let l=0;l<8;l++)for(const s of[-1,1])it.push([s*.59+(hs(r*16+l,s+7)-.5)*.04,.11+l*.22,z0+.34+r*.64+(hs(r,l+9)-.5)*.04,1,.21,.6,(hs(r+l,4)-.5)*.1]);inst(BXG,mm(.95),it,col,.12)}
 else if(kind==='coil'){const n=Math.floor(L/1.32),a=[],h=[];for(let r=0;r<n;r++)for(const s of[-1,1]){const z=z0+.66+r*1.32;a.push([s*.62,.63,z,.58,1.2,.58,0,R2]);h.push([s*.62,.63,z,.26,1.22,.26,0,R2])}inst(CYG,mm(.35,.8),a,col,.05);inst(CYG,mm(.9),h,0x1a1b1e,0)}
 else if(kind==='rebar'){const P=[[-.55,.5],[.55,.5],[0,1.3]],a=P.map(q=>[q[0],q[1],z0+L/2,.5,L,.5,0,R2]),t=[];for(let z=z0+.6;z<z0+L;z+=2.2)for(const q of P)t.push([q[0],q[1],z,.53,.1,.53,0,R2]);inst(CYG,mm(.7,.3),a,col,.06);inst(CYG,mm(.9),t,0x25272b,0)}
 else if(kind==='plate'){const secs=L>6?2:1,sl=Math.min(5.8,L/secs),it=[];for(let q=0;q<secs;q++)for(const s of[-1,1])for(let k=0;k<10;k++)it.push([s*.6,.07+k*.13,z0+sl/2+q*(sl+.2),1.1,.12,sl,0]);inst(BXG,mm(.45,.6),it,col,.05)}
 else if(kind==='pipe'){const it=[];[[-.84,-.28,.28,.84],[-.56,0,.56],[-.28,.28]].forEach((r,ri)=>r.forEach(x=>it.push([x,.28+ri*.48,z0+L/2,.28,L,.28,0,R2])));inst(CYG,mm(.5,.4),it,col,.18)}
 else if(kind==='drum'){const n=Math.floor(L/.6),it=[];for(let r=0;r<n;r++)for(let l=0;l<2;l++)for(let k=0;k<4;k++)it.push([-.9+k*.6,.44+l*.88,z0+.3+r*.6,.29,.88,.29,0]);inst(CYG,mm(.5,.3),it,col,.06)}
 else if(kind==='wood'){const a=[],t=[];for(const s of[-1,1])for(let l=0;l<2;l++){a.push([s*.6,.36+l*.72,z0+L/2,1.1,.7,L,0]);for(let z=z0+.8;z<z0+L;z+=2.6)t.push([s*.6,.36+l*.72,z,1.12,.72,.06,0])}inst(BXG,mm(.9),a,col,.1);inst(BXG,mm(.8),t,0x2a2b2e,0)}
 else{const n=Math.floor(L/1.1),h=sp[2]||1.5,dbl=h<1.1,pal=[],stk=[];for(let r=0;r<n;r++)for(const s of[-1,1]){const z=z0+.55+r*1.1,x=s*.6,k=h*(.9+.1*hs(r,s+3));pal.push([x,.07,z,1.1,.14,1,0]);stk.push([x,.14+k/2,z,1.04,k,.94,0]);if(dbl)stk.push([x,.14+k+k/2,z,1.04,k,.94,0])}
  inst(BXG,mm(.9),pal,0x9a7b4f,.08);inst(BXG,mm(.8),stk,col,sp[3]===1?.35:sp[3]===2?.6:.12)}
 g.userData.dispose=()=>disp.forEach(d=>d.dispose());return g}
function setTrCargo(t,name,tons){if(t.userData.cg){t.remove(t.userData.cg);t.userData.cg.userData.dispose();t.userData.cg=null}if(!name)return;const sg=t.userData.sgn||1,cg=cargoModel(name,tons);cg.position.set(0,1.4,sg*.35);cg.rotation.y=sg>0?0:Math.PI;t.add(cg);t.userData.cg=cg}
function setTrailerCargo(name,tons){if(trl.userData.cg){trl.remove(trl.userData.cg);trl.userData.cg.userData.dispose();trl.userData.cg=null}if(!name)return;const cg=cargoModel(name,tons);cg.position.set(0,1.4,7.1);trl.add(cg);trl.userData.cg=cg}
function leaveTrailer(c){const gp=COG.get(c.k);if(!gp)return;const cx=pos.x+7.4*Math.sin(th),cz=pos.z+7.4*Math.cos(th),dx=cx-c.x,dz=cz-c.z,cr=Math.cos(c.rot),sr=Math.sin(c.rot);const t=mkTrailer(gp,dx*cr-dz*sr,dx*sr+dz*cr,1);t.rotation.y=th-c.rot;return t}
function disposeCo(g){g.traverse(o=>{if(o.userData&&o.userData.dispose)o.userData.dispose()});for(const d of g.userData.disp)d.dispose()}
// janela de empresas assimétrica (mais à frente que atrás) e construção em no máximo 1 empresa por quadro, a mais próxima primeiro
let coDir=1,coTick=0,coPend=false;const coKeep=c=>c.nonce||c.spawn||c.drop||(job&&(c===job.from||c===job.to));
function coFrame(){if(!ready)return;const oo=samp(Math.round(curS/RDS));coDir=Math.cos(hd-oo.h)>=0?1:-1;
 const lo=curS-(coDir>0?450:950),hi=curS+(coDir>0?950:450),k0=Math.floor(lo/CO_D)-1,k1=Math.ceil(hi/CO_D)+1,want=[];
 for(let k=k0;k<=k1;k++){const c=coGet(k);if(c.s>=lo&&c.s<=hi)want.push(c)}
 let changed=false;
 for(const c of COACT){const gp=COG.get(c.k);if(gp&&gp.userData.decor){const v=Math.hypot(c.x-pos.x,c.z-pos.z)<430;for(const t of gp.userData.decor)if(t.visible!==v)t.visible=v}}
 for(const[k,gp]of COG)if(!want.some(c=>c.k===k)){scene.remove(gp);disposeCo(gp);COG.delete(k);changed=true}
 let best=null,bd=1e9;for(const c of want)if(!COG.has(c.k)){const d=Math.abs(c.s-curS);if(d<bd){bd=d;best=c}}
 // dois quadros: 1) constrói o grupo (oculto); 2) revela + atualiza pátio no terreno, cones e cache (evita um pico único)
 if(coPend){coPend=false;for(const gp of COG.values())gp.visible=true;changed=true}
 else if(best){const gp=buildCo(best);gp.visible=false;COG.set(best.k,gp);coPend=true}
 if(featFrame(lo,hi,!coPend&&!best))changed=true;
 if(changed){const prev=new Set(COACT);COACT.length=0;for(const c of want)if(COG.has(c.k))COACT.push(c);rbI=1e9;ocx=1e9;for(const c of COACT)if(!prev.has(c))terrMark(c.x,c.z,70);if(featFull){featFull=false;tcx=1e9}placeCones()}
 for(const c of COACT)if(!c.ann&&Math.abs(c.s-curS)<300){c.ann=true;msg(c.name+' · '+c.t.label)}
 if(++coTick%180==0&&COM.size>48){const kc=curS/CO_D;for(const[k,c]of COM)if(Math.abs(k-kc)>14&&!COG.has(k)&&!coKeep(c))COM.delete(k)}
 const ci=cityIdx(curS);if(lastCity!==null&&ci!==lastCity)msg('📍 '+cityName(curS));lastCity=ci}
