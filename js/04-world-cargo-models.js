/* ===== modelos das cargas reais (instanciados, sobre a carreta) ===== */
/* só os modelos detalhados (HEAVY, js/04b–04h); nome desconhecido usa o cimento ensacado */
function cargoModel(name,tons){const f=HEAVY[name]||HEAVY['Cimento ensacado'];return f(tons)}
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
