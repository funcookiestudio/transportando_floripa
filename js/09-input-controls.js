// ---- entrada ----
const K={},map={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'nitro',ShiftRight:'nitro',KeyH:'horn'};
// freio de mão: um toque trava, outro destrava (K.hb fica fora dos resets de teclas)
var hbLock=false;Object.defineProperty(K,'hb',{get(){return hbLock},set(v){},enumerable:false});
function hbToggle(){hbLock=!hbLock;const b=document.querySelector('[data-k=hb]');if(b)b.classList.toggle('on',hbLock);if(typeof msg==='function')msg(hbLock?'Freio de mão: TRAVADO':'Freio de mão: solto')}
var menuOpen=false,cargoSel=6;
function openCargoMenu(){openBoard();return;menuOpen=true;for(const k in K)K[k]=false;const m=document.getElementById('cm');m.style.display='flex';m.querySelectorAll('button').forEach(b=>b.classList.toggle('sel',+b.dataset.c===cargoSel))}
function pickCargo(c){cargo=c;cargoSel=c;MASS=15000+cargo*1000;setCont();menuOpen=false;document.getElementById('cm').style.display='none';msg('Carga: '+(c?c+' t':'vazio'))}
document.querySelectorAll('#cm button').forEach(b=>b.addEventListener('pointerdown',e=>{audio();pickCargo(+b.dataset.c);e.preventDefault()}));
const act={full(){const d=document.documentElement;if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else(d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d)},cmenu(){if(menuOpen)return;if(stUse())return;openBoard()},cam(){camMode=(camMode+1)%4},lights(){lightsOn=!lightsOn},night(){const d=hourT>=18||hourT<5;hourT=d?16.3:23;hi=d?2:4;lightsOn=!d},time(){hourT+=1;if(hourT>=24){hourT-=24;hour-=24}const h=((hourT%24)+24)%24;lightsOn=h>=18.4||h<5.5},qual(){if(qAuto){qAuto=false;setQ(0)}else if(qi<2)setQ(qi+1);else{qAuto=true;setQ(MOB?1:2)}msg("Qualidade: "+(qAuto?"Auto":QL[qi].n))},mute(){muted=!muted},view(){orbYaw=orbPitch=0;zoom=1},reset:respawn};
addEventListener('keydown',e=>{if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName)&&e.code!=='Escape')return;audio();if(gfxOpen){if(e.target&&e.target.tagName==='INPUT'&&e.code!=='Escape')return;if(e.code==='Escape'||e.code==='KeyO')gfxClose();return}if(menuOpen){const d=/^(Digit|Numpad)([1-9])$/.exec(e.code);if(d)boardKey(+d[2]-1);else if(e.code==='Escape'||e.code==='KeyG'||e.code==='KeyE')closeCm();e.preventDefault();return}if(e.code==='Space'){if(!e.repeat)hbToggle();e.preventDefault();return}if(map[e.code]){K[map[e.code]]=true;e.preventDefault()}
 const a={KeyC:'cam',KeyL:'lights',KeyN:'night',KeyT:'time',KeyQ:'qual',KeyM:'mute',KeyR:'reset',KeyV:'view',KeyF:'fog',KeyG:'cmenu',KeyE:'cmenu',KeyO:'gfx'}[e.code];if(a&&!e.repeat)act[a]()});
addEventListener('keyup',e=>{if(e.target&&/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;if(map[e.code])K[map[e.code]]=false});
document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;if(k==='hb'){b.addEventListener('pointerdown',e=>{audio();hbToggle();e.preventDefault()});return}const on=e=>{audio();K[k]=true;b.classList.add('on');e.preventDefault()},off=()=>{K[k]=false;b.classList.remove('on')};
 b.addEventListener('pointerdown',on);['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,off))});
document.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('pointerdown',e=>{audio();act[b.dataset.a]();e.preventDefault()}));
(function(){const de=document.documentElement,mq=matchMedia('(pointer:coarse)');if(mq.matches||navigator.maxTouchPoints>0)de.classList.add('mob');addEventListener('touchstart',()=>de.classList.add('mob'),{once:true,passive:true});
 const vib=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
 document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.b'))vib(8)});addEventListener('contextmenu',e=>e.preventDefault());
 /* analógico: arrasta o botão; volta ao centro ao soltar; curva exponencial + zona morta */
 const trk=(el,kn,hz,cb)=>{let id=null;const set=e=>{const r=el.getBoundingClientRect(),half=(hz?r.width:r.height)/2-kn.offsetWidth/2-2,d=hz?e.clientX-(r.left+r.width/2):-(e.clientY-(r.top+r.height/2)),v=Math.max(-1,Math.min(1,d/half));kn.style.transform=hz?'translateX('+v*half+'px)':'translateY('+-v*half+'px)';const a=Math.abs(v),q=a<.05?0:(a-.05)/.95;cb(Math.sign(v)*Math.pow(q,hz?1.35:1.15),true)};
  el.addEventListener('pointerdown',e=>{audio();id=e.pointerId;el.setPointerCapture(id);kn.classList.add('d');set(e);e.preventDefault()});
  el.addEventListener('pointermove',e=>{if(e.pointerId===id)set(e)});
  const end=e=>{if(e.pointerId!==id)return;id=null;kn.classList.remove('d');kn.style.transform='';cb(0,false)};
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,end))};
 const $$=i=>document.getElementById(i),sw=$$('sw'),pf=$$('pf');
 trk($$('st'),$$('sk'),true,(v,on)=>{K.sa=on?-v:null;sw.style.transform='rotate('+v*110+'deg)'});
 trk($$('pt'),$$('pk'),false,(v,on)=>{const t=v>.03,b=v<-.03;K.up=t;K.down=b;K.ta=t?v:1;K.ba=b?-v:1;pf.style.cssText=v>0?'top:'+(50-v*50)+'%;bottom:50%;background:rgba(60,200,90,.55)':'top:50%;bottom:'+(50+v*50)+'%;background:rgba(230,70,60,.55)'});
 if(!(document.fullscreenEnabled||document.webkitFullscreenEnabled))document.querySelector('[data-a=full]').style.display='none';
 if(mq.matches&&innerHeight>innerWidth)setTimeout(()=>{if(typeof msg==='function')msg('Gire o celular para paisagem')},2500)})();
