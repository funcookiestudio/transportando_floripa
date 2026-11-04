/* ===== Multiplayer P2P (WebRTC via Trystero, sem servidor; BroadcastChannel para abas do mesmo navegador) =====
   Mundo determinístico: todos veem a mesma estrada/empresas. Sincroniza só os jogadores (~15 Hz); tráfego e fretes são locais. */
const NETV=1,NETMAX=16,NET={on:false,code:'',host:false,name:'',id:Math.random().toString(36).slice(2,8),peers:new Map(),bc:null,sendT:null,room:null,msg:'Offline',x0:null,moved:false,hr:false,timers:[]};
try{NET.name=localStorage.getItem('fh16name')||''}catch(e){}
const nWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* temporizador em Web Worker: abas em segundo plano não são desaceleradas (senão o jogador some para os outros) */
function nTick(fn,ms){try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),'+ms+')'])));w.onmessage=()=>fn();return w}catch(e){return setInterval(fn,ms)}}
function nSend(o){o.id=NET.id;if(NET.bc)try{NET.bc.postMessage(o)}catch(e){}if(NET.sendT)try{const r=NET.sendT(o);if(r&&r.catch)r.catch(()=>{})}catch(e){}}
function nPaint(){let cab=null;try{const v=localStorage.getItem('fh16paint');if(v)cab=+v}catch(e){}return{cab,trl:HPS.t==null?null:HPS.t,rim:HPS.r==null?null:HPS.r}}
function nHello(){const p=nPaint();nSend({t:'h',v:NETV,n:NET.name||'Motorista',cab:p.cab,trl:p.trl,rim:p.rim,cg:(hitched&&typeof job!=='undefined'&&job&&job.name)||null,ct:(typeof job!=='undefined'&&job&&job.tons)||0,host:NET.host?1:0,hr:NET.host?hourT:null})}
function nState(){if(!ready)return;if(!NET.x0)NET.x0={x:pos.x,z:pos.z};if(Math.hypot(pos.x-NET.x0.x,pos.z-NET.x0.z)>12)NET.moved=true;
 nSend({t:'s',x:+pos.x.toFixed(2),z:+pos.z.toFixed(2),a:+hd.toFixed(3),b:+th.toFixed(3),p:hitched?1:0,v:+Math.hypot(vel.x,vel.z).toFixed(1),m:NET.moved?1:0})}
function nRecv(o){if(!o||o.id===NET.id||!NET.on)return;const now=performance.now();
 if(o.t==='f'){if(o.to===NET.id){netLeave();netStatus('Sala cheia (máx. '+NETMAX+')')}return}
 let p=NET.peers.get(o.id);
 if(o.t==='h'){if(o.v!==NETV)return;
  if(!p){if(NET.peers.size>=NETMAX-1){nSend({t:'f',to:o.id});return}p=nNew(o.id);nHello();if(!window.HOME)netToast((o.n||'Motorista')+' entrou')}
  p.name=String(o.n||'Motorista').slice(0,14);const ch=p.cab!=o.cab||p.trl!=o.trl||p.rim!=o.rim;p.cab=o.cab;p.trl=o.trl;p.rim=o.rim;p.cg=o.cg||null;p.ct=+o.ct||0;if(ch&&p.av)nKillAv(p);
  if(o.host&&o.hr!=null&&!NET.host&&!NET.hr){NET.hr=true;try{hourT=o.hr}catch(e){}}
  p.last=now;netUI();return}
 if(!p){if(o.t!=='s'||NET.peers.size>=NETMAX-1)return;p=nNew(o.id);nHello()}p.last=now;
 if(o.t==='s'){p.sp=o.v;p.hitched=o.p;p.moved=!!o.m;p.buf.push({t:now,x:o.x,z:o.z,a:o.a,b:o.b});if(p.buf.length>12)p.buf.shift()}}
function nNew(id){const p={id,name:'Motorista',cab:null,trl:null,rim:null,buf:[],last:performance.now(),sp:0,hitched:0,moved:false,av:null,cols:[],spin:0,x:0,z:0};
 for(let i=0;i<8;i++)p.cols.push({x:1e5,z:1e5,r:1.4,k:1,off:true});NET.peers.set(id,p);return p}
function nKillAv(p){if(p.av){scene.remove(p.av.g);p.av=null;ocx=1e9}}
function nTag(name){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(14,17,22,.7)';g.fillRect(0,8,256,48);g.font='bold 28px system-ui,sans-serif';g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(name,128,33);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(5,1.25,1);s.position.set(0,5.6,0);return s}
function nMake(p){const m=trfBuild({cab:p.cab,trl:p.trl,rim:p.rim}),P=new THREE.Group();m.g.remove(m.t);P.add(m.t);m.g.add(P);m.g.add(nTag(p.name));m.g.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(m.g);p.av={g:m.g,P,sps:m.sps,t:m.t,cgk:null};ocx=1e9}
function nSample(p,t){const b=p.buf;if(!b.length)return null;const T=t-120;let i=b.length-1;if(T>=b[i].t){const q=b[i],dt=Math.min(.25,(T-q.t)/1000);return{x:q.x-Math.sin(q.a)*p.sp*dt,z:q.z-Math.cos(q.a)*p.sp*dt,a:q.a,b:q.b}}
 while(i>0&&b[i-1].t>T)i--;if(i===0)return b[0];const A=b[i-1],B=b[i],k=Math.max(0,Math.min(1,(T-A.t)/Math.max(1,B.t-A.t)));return{x:A.x+(B.x-A.x)*k,z:A.z+(B.z-A.z)*k,a:A.a+nWrap(B.a-A.a)*k,b:A.b+nWrap(B.b-A.b)*k}}
let nLst=0;
function netFrame(dt,now){if(!NET.on)return;const t=performance.now();
 for(const[id,p]of NET.peers){if(t-p.last>12000){nKillAv(p);NET.peers.delete(id);ocx=1e9;netUI();if(!window.HOME)netToast(p.name+' saiu');continue}
  if(!ready||!TRUCKM)continue;const s=nSample(p,t);if(!s)continue;if(!p.av){nMake(p)}const g=p.av.g,yr=H(s.x,s.z);
  {const k=(p.cg||'')+'|'+p.ct;if(p.av.cgk!==k){p.av.cgk=k;try{setTrCargo(p.av.t,p.cg,p.ct)}catch(e){}}}g.visible=!window.HOME;g.position.set(s.x,yr,s.z);g.rotation.y=s.a;p.av.P.visible=!!p.hitched;p.av.P.rotation.y=nWrap(s.b-s.a);p.spin-=p.sp*dt/.55;for(const q of p.av.sps)q.rotation.x=p.spin;
  const arm=p.moved&&NET.moved&&!window.HOME,sa=Math.sin(s.a),ca=Math.cos(s.a),sb=Math.sin(s.b),cb=Math.cos(s.b),Z=[.3,-1.9,-3.9,-5.3],TZ=[3.5,7,10.5,13];
  p.cols.forEach((c,i)=>{if(i<4){c.x=s.x+Z[i]*sa;c.z=s.z+Z[i]*ca}else{const d=TZ[i-4]||3.5;c.x=s.x+d*sb;c.z=s.z+d*cb}c.off=!arm||(i>=4&&!p.hitched)});p.x=s.x;p.z=s.z}
 if(!window.HOME&&now-nLst>=500){nLst=now;nList()}nMarks(now)}
function nList(){const el=document.getElementById('nl');if(!el)return;if(!NET.on){if(HUD.v.nl){HUD.v.nl='';el.innerHTML=''}return}
 let h='<div class="nh2">🌐 '+NET.code+' · '+(NET.peers.size+1)+'/'+NETMAX+'</div>';for(const p of NET.peers.values()){const d=p.av?Math.round(Math.hypot(p.x-pos.x,p.z-pos.z)):null;h+='<div>● '+p.name.replace(/[<>&]/g,'')+' <b>'+(d==null?'--':d>=1000?(d/1000).toFixed(1)+' km':d+' m')+'</b></div>'}
 if(HUD.v.nl!==h){HUD.v.nl=h;el.innerHTML=h}}
// marcadores nas bordas da tela para jogadores fora de vista (nome + distância)
const nMk=[],nV=new THREE.Vector3();let nMt=0;
function nMarks(now){if(now-nMt<120)return;nMt=now;const host=document.getElementById('nm')||(()=>{const d=document.createElement('div');d.id='nm';document.body.appendChild(d);return d})();
 let i=0;const W=innerWidth,Hh=innerHeight;if(NET.on&&!window.HOME)for(const p of NET.peers.values()){if(!p.av||i>=8)continue;let el=nMk[i];if(!el){el=nMk[i]=document.createElement('div');host.appendChild(el)}
  nV.set(p.x,H(p.x,p.z)+5,p.z).project(cam);let x=nV.x,y=nV.y;const back=nV.z>1;if(back){x=-x;y=-y}
  if(!back&&Math.abs(x)<.92&&Math.abs(y)<.9){el.classList.remove('on');i++;continue}
  const m=Math.max(Math.abs(x),Math.abs(y),1e-3);x/=m;y/=m;const px=(x*.5+.5)*(W-110)+55,py=(-y*.5+.5)*(Hh-90)+45,d=Math.round(Math.hypot(p.x-pos.x,p.z-pos.z)),
  dt2=d>=1000?(d/1000).toFixed(1)+' km':d+' m',key=p.name+dt2+'|'+Math.round(px/4)+'|'+Math.round(py/4);
  if(el._k!==key){el._k=key;el.innerHTML='● '+p.name.replace(/[<>&]/g,'')+' <b>'+dt2+'</b>';el.style.transform='translate('+Math.round(px-45)+'px,'+Math.round(py-10)+'px)'}el.classList.add('on');i++}
 for(;i<nMk.length;i++)nMk[i].classList.remove('on')}
function netStatus(s){NET.msg=s;netUI()}
function netUI(){const st=document.getElementById('hns');if(!st)return;const on=NET.on;
 st.textContent=on?(NET.code?(NET.peers.size+1)+'/'+NETMAX+' jogadores'+(NET.msg&&NET.msg!=='Offline'?' · '+NET.msg:''):NET.msg):(NET.msg==='Offline'?'Offline':NET.msg);st.className='chip'+(on?(NET.peers.size?' ok':' wait'):'');
 document.getElementById('hnoff').style.display=on?'none':'block';document.getElementById('hnon').style.display=on?'block':'none';document.getElementById('hncode').textContent=NET.code||'----';
 const col=h=>h==null?'#8a9099':'#'+h.toString(16).padStart(6,'0'),pl=(n,c,t)=>'<div class="pl"><i style="background:'+col(c)+'"></i>'+n.replace(/[<>&]/g,'')+(t?'<small>'+t+'</small>':'')+'</div>';
 let h=pl(NET.name||'Você',nPaint().cab,'você'+(NET.host?' · 👑':''));for(const p of NET.peers.values())h+=pl(p.name,p.cab,'');document.getElementById('hnl').innerHTML=on?h:'';
 {const dt=document.getElementById('hdot');if(dt)dt.className=on?(NET.peers.size?'ok':'wait'):''}
 document.body.classList.toggle('hnetopen',document.getElementById('hnet').style.display==='block')}
async function netStart(code,create){if(NET.on)return;NET.on=true;NET.code=code;NET.host=!!create;NET.peers=new Map();NET.moved=false;NET.x0=null;NET.hr=false;NET.msg='Conectando…';
 try{NET.bc=new BroadcastChannel('fh16-'+code+(window.GRID_ON?'g':''));NET.bc.onmessage=e=>nRecv(e.data)}catch(e){NET.bc=null}
 NET.timers=[nTick(()=>{if(ready)nState()},66),nTick(nHello,3000)];netUI();nHello();
 try{const mod=await import('https://cdn.jsdelivr.net/npm/trystero@0.26.0/+esm');if(!NET.on||NET.code!==code)return;
  const room=mod.joinRoom({appId:'transportando-floripa-v1'},'fh16-'+code+(window.GRID_ON?'g':'')),act=room.makeAction('fh16');let send;
  if(Array.isArray(act)){send=act[0];act[1](d=>nRecv(d))}else{send=d=>act.send(d);act.onMessage=d=>nRecv(d)} // API antiga (lista) e nova (objeto, 0.26)
  const pj=()=>{nHello();netUI()};if(Array.isArray(act))room.onPeerJoin(pj);else room.onPeerJoin=pj;
  NET.room=room;NET.sendT=send;NET.msg='procurando jogadores…';netUI();setTimeout(()=>{if(NET.on&&NET.code===code&&!NET.peers.size){NET.msg='aguardando outros jogadores';netUI()}},8000)}
 catch(e){console.warn('p2p',e);if(NET.on){NET.msg='sem rede P2P ('+String(e&&e.message||e).slice(0,60)+'): só abas deste navegador';netUI()}}}
function netLeave(){if(!NET.on)return;NET.on=false;NET.timers.forEach(t=>{if(t&&t.terminate)t.terminate();else clearInterval(t)});NET.timers=[];try{NET.room&&NET.room.leave()}catch(e){}try{NET.bc&&NET.bc.close()}catch(e){}NET.room=null;NET.sendT=null;NET.bc=null;NET.code='';for(const p of NET.peers.values())nKillAv(p);NET.peers.clear();ocx=1e9;NET.msg="Offline";nMk.forEach(e=>e.classList.remove("on"));netUI();nList()}
// ---- UI do lobby ----
{const $$=id=>document.getElementById(id),nm=()=>{NET.name=($$('hname').value||'').trim().slice(0,14);try{localStorage.setItem('fh16name',NET.name)}catch(e){}};$$('hname').value=NET.name;
 const link=()=>location.origin+location.pathname+'?sala='+NET.code;
 $$('hmp').onclick=()=>{$$('hmain').style.display='none';$$('hnet').style.display='block';netUI()};
 $$('hnback').onclick=()=>{$$('hnet').style.display='none';$$('hmain').style.display='flex';netUI()};
 $$('hcreate').onclick=()=>{nm();const L='ABCDEFGHJKLMNPQRSTUVWXYZ',c=Array.from({length:4},()=>L[Math.floor(Math.random()*L.length)]).join('');netStart(c,true);try{navigator.clipboard.writeText(location.origin+location.pathname+'?sala='+c).catch(()=>{})}catch(e){}$$('hplay').click();setTimeout(()=>netToast('Sala '+c+' criada · link copiado'),400)};
 $$('hjoin').onclick=()=>{nm();const c=($$('hcode').value||'').toUpperCase().replace(/[^A-Z]/g,'');if(c.length!==4){netStatus('Digite o código de 4 letras');return}netStart(c,false);$$('hplay').click()};
 $$('hcode').oninput=e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,'')};
 $$('hshare').onclick=async()=>{const u=link(),tx='Entre na minha sala do Volvo FH16 · código '+NET.code;try{if(navigator.share){await navigator.share({title:'Volvo FH16',text:tx,url:u});return}}catch(e){if(e&&e.name==='AbortError')return}try{await navigator.clipboard.writeText(u);netToast('Link copiado')}catch(e){netToast(u)}};
 $$('hcopy').onclick=async()=>{try{await navigator.clipboard.writeText(NET.code);netToast('Código copiado')}catch(e){netToast('Código: '+NET.code)}};
 $$('hnplay').onclick=()=>$$('hplay').click();$$('hnleave').onclick=netLeave;$$('hname').onchange=nm;netUI();
 try{const q=(new URLSearchParams(location.search).get('sala')||'').toUpperCase().replace(/[^A-Z]/g,'');if(q.length===4){$$('hmain').style.display='none';$$('hnet').style.display='block';$$('hcode').value=q;netStart(q,false)}}catch(e){}}
function netToast(s){try{msg(s)}catch(e){}const st=document.getElementById('hns');if(st&&window.HOME){st.textContent=s;setTimeout(netUI,1500)}}
