// ---- HUD leve: só escreve no DOM quando o valor muda; painéis atualizados em taxas reduzidas ----
const HUD={v:{},e:{},c:{},tS:0,tP:0,tA:0},hel=id=>HUD.e[id]||(HUD.e[id]=document.getElementById(id));
function hset(id,v){if(HUD.v[id]===v)return;HUD.v[id]=v;hel(id).textContent=v}
function hcls(id,c,on){const k=id+c;on=!!on;if(HUD.c[k]===on)return;HUD.c[k]=on;hel(id).classList.toggle(c,on)}
function hbar(id,f){const q=Math.round(Math.max(0,Math.min(1,f))*100);if(HUD.v[id]===q)return;HUD.v[id]=q;hel(id).style.transform='scaleX('+q/100+')'}
function hgauge(f){const q=Math.min(60,Math.round(Math.max(0,Math.min(1,f))*60));if(HUD.v.gv===q)return;HUD.v.gv=q;hel('gv').style.strokeDashoffset=157*(1-q/60)}
function harrow(a){const q=Math.round(a*57.3/2)*2;if(HUD.v.arr===q)return;HUD.v.arr=q;hel('arr').style.transform='rotate('+q+'deg)'}
document.getElementById('mis').addEventListener('click',function(){this.classList.toggle('open')});
document.getElementById('spd').addEventListener('click',function(){HUD.sx=this.classList.toggle('open')});
