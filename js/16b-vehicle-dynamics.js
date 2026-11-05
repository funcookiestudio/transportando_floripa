/* ===== Dinâmica veicular 2D · suspensão dinâmica (Fase 2) =====
   Modelo híbrido arcade-simulação: o chassi é um corpo suspenso com 3 graus de liberdade (altura zA, arfagem p, rolagem r),
   apoiado em 4 molas+amortecedores (cantos FL FR RL RR) e barras estabilizadoras. O terreno entra pelas rodas: H(x,z) é amostrado
   nos 4 cantos a cada passo de 120 Hz. A aceleração longitudinal/lateral e a inclinação da pista geram a transferência de peso;
   as cargas verticais por canto (DYN.fz) alimentam a aderência por eixo (gF/gR) e a tração (mR) em 19-physics-step e 16-powertrain.
   - p e r são inclinações (≈ rad); o chassi visual usa atan(p), atan(r). Convenção: p>0 = nariz para cima, r>0 = lado direito para cima.
   - VP.truck.phys liga o modelo; VP.civic.phys = null mantém o Civic na física anterior (sem herdar nada do caminhão).
   - Sem alocação no laço: tudo em Float64Array pré-alocados. dynGuard/dynVisGuard: proteção anti-NaN/Infinity. */
const DYN={
 on:false,                 // true quando o modelo está ativo (caminhão) e já foi inicializado
 snap:true,                // pede reinício do estado (teleporte, troca de veículo, valor inválido)
 fz:new Float64Array(4),   // carga vertical por canto FL FR RL RR (N); 0 = roda sem contato
 W:new Float64Array(4),k:new Float64Array(4),cC:new Float64Array(4),cR:new Float64Array(4), // estática (N), mola (N/m), amortecimento compressão/expansão (N·s/m)
 d:new Float64Array(4),y:new Float64Array(4),g:new Float64Array(4),gP:new Float64Array(4),c:new Float64Array(4),cv:new Float64Array(4),F:new Float64Array(4),
 z:0,zd:0,p:0,pd:0,r:0,rd:0,  // estado do chassi: altura absoluta do CG (m), arfagem, rolagem e velocidades
 zdd:0,pdd:0,rdd:0,           // acelerações filtradas (entrada da cabine)
 ax:0,ay:0,vf0:0,px:0,pz:0,   // aceleração longitudinal e lateral filtradas (m/s²), velocidade anterior, última posição
 gF:1,gR:1,mR:6500,xcg:1.6,xCab:2.3, // aderência relativa dos eixos (1 = estática), massa no eixo trator (kg), posição do CG e da cabine (m)
 yO:0,pB:0,rB:0,           // pose do chassi para o desenho: altura na origem, arfagem e rolagem (rad)
 good:{x:0,z:0,hd:0,th:0,set:false}, // última pose válida (recuperação de NaN)
 surf:0,mu:.85,muT:.75,wet:0, // piso atual (0 asfalto · 1 pátio · 2 grama · 3 terra/areia), μ lateral/frenagem e μ de tração suavizados, umidade (reservada: 0 até existir clima)
 gradeLong:0,gradeLat:0,rough:0, // inclinações locais e irregularidade residual estimadas pelos quatro pontos de apoio (m/m, m)
 uF:0,uR:0,uTr:0,sF:0,sR:0,   // memória de deslizamento (0–1) dianteira/traseira, uso da tração do eixo motriz (0–1), uso de aderência lateral (1 = no limite)
 nanHits:0
};
/* Perfil físico do caminhão (Fase 2). Valores de massa/peso no eixo seguem os já usados em tracCap/trailerStep:
   m0 = VEH.m0 (11 t, cavalo), 4,5 t no eixo dianteiro (6,5 t no trator, como em tracCap), 30% do peso da carreta (7 t + carga) na quinta roda. */
VP.truck.phys={
 mF:4500,        // kg no eixo dianteiro (cavalo vazio)
 trl0:7000,fifth:.30, // massa da carreta vazia (kg) e fração do peso dela sobre o eixo trator
 trk:[2.04,1.85],     // bitola dianteira/traseira (m)
 hcg:1.05,hcgF:1.55,  // altura do CG do cavalo e da carga na quinta roda (m)
 f:[1.3,1.2],         // frequência natural da suspensão dianteira/traseira (Hz): suspensão pneumática de caminhão
 ls:.5,               // sensibilidade à carga: 0 = frequência constante (mola proporcional à carga) · 1 = mola fixa
 zc:.28,zr:.45,       // razão de amortecimento em compressão e em expansão
 arb:[7e5,5e5],       // barras estabilizadoras dianteira/traseira (N·m/rad)
 cMax:.12,kb:8,fMax:3,// curso de compressão (m), rigidez do batente (× mola), força máx. por canto (× peso estático)
 rg:[1.9,.95],        // raios de giração: arfagem e rolagem (m)
 tls:.3,              // perda de aderência do pneu com a carga (sensibilidade de μ à carga vertical)
 surf:[[.85,.75],[.80,.70],[.55,.45],[.50,.40]], // [μ lateral/frenagem, μ de tração] por piso: asfalto, pátio, grama, terra/areia (asfalto e grama = valores que o jogo já usava)
 wetK:.35             // perda de μ com piso molhado (usada só quando DYN.wet > 0; o jogo ainda não tem chuva nem lama)
};
VP.civic.phys=null;
/* Curva de aderência do pneu (compartilhada): s = demanda / capacidade. Até 80% do limite o pneu entrega o que é pedido; depois a força
   satura suavemente, passa por um pico em s = 1,2 e cai até ~88% (atrito de deslizamento). Sem corte abrupto. */
const TYRE={mem:.10}; // mem: perda extra de aderência enquanto o eixo está deslizando (recupera em ~0,5 s)
function tyreF(s){if(s<=.8)return s;if(s<=1.2){const t=s-.8;return s-t*t/.8}const q=(s-1.2)*1.4;return .88+.12/(1+q*q)}
/* Ajuste de terreno sem uma segunda malha: ajusta um plano aos quatro pontos já amostrados pela suspensão.
   O resíduo representa torção/irregularidade local que não pode ser explicada por uma rampa uniforme. */
function dynTerrainFit(g,d,y,Lw,tF,tR,D,dt,snap){
 const front=(g[0]+g[1])*.5,rear=(g[2]+g[3])*.5,left=(g[0]+g[2])*.5,right=(g[1]+g[3])*.5,
  gl=Math.max(-.35,Math.min(.35,(front-rear)/Math.max(.1,Lw))),
  gt=Math.max(-.5,Math.min(.5,(right-left)/Math.max(.1,tF+tR))),mid=(front+rear)*.5;
 let rr=0;for(let i=0;i<4;i++){const pred=mid+(d[i]-Lw*.5)*gl+y[i]*gt,e=g[i]-pred;rr+=e*e}
 const rough=Math.min(.25,Math.sqrt(rr*.25)),a=1-Math.exp(-dt*12);
 if(snap){D.gradeLong=gl;D.gradeLat=gt;D.rough=rough}else{D.gradeLong+=(gl-D.gradeLong)*a;D.gradeLat+=(gt-D.gradeLat)*a;D.rough+=(rough-D.rough)*a}
}
function dynTerrainGrip(){return Math.max(.72,1-Math.min(.28,DYN.rough*1.5))}
/* Direção: o eixo dianteiro entrega a guinada pedida até perto do limite de aderência e depois cede de forma progressiva (subesterço).
   yd = guinada pedida (rad/s), ym = guinada máxima do limite de aderência atual. */
function dynYaw(yd,vf,ym){const D=DYN,av=Math.max(Math.abs(vf),1),cap=Math.max(.5,ym*av*(1-TYRE.mem*D.uF)),s=Math.abs(yd*vf)/cap;
 D.sF=s;D.uF+=((s>.9?Math.min(1,(s-.9)*2.5):0)-D.uF)*(1-Math.exp(-SDT*(s>.9?10:2.2)));
 return s>1e-4?yd*tyreF(s)/s:yd}
/* Verdadeiro se todos os valores forem finitos: x-x é 0 para número finito e NaN para NaN/±Infinity */
function dynFinite(){const s=pos.x+pos.z+vel.x+vel.z+hd+th+steer+yawKick+wT+eRpm+tipS+brkP+thrS+slipS;return s-s===0}
function dynVisFinite(){const s=pitch+roll+xp+xr+hz+sv.p+sv.r+sv.h+pitchT+rollT;return s-s===0}
/* Chamada ao fim de cada passo de física (120 Hz) */
function dynGuard(){const G=DYN.good;
 if(dynFinite()){G.x=pos.x;G.z=pos.z;G.hd=hd;G.th=th;G.set=true;return}
 DYN.nanHits++;DYN.snap=true;
 if(G.set){pos.x=G.x;pos.z=G.z;hd=G.hd;th=G.th}else{pos.x=pos.z=0;hd=th=0}
 vel.x=vel.z=0;steer=yawKick=wT=tipS=brkP=thrS=slipS=0;eRpm=VEH.idle;vTp=decS=trailerBrakeP=0;
 if(DYN.nanHits<4)console.warn('Física: valor inválido detectado e recuperado ('+DYN.nanHits+')')}
/* Estados visuais (cabine/chassi): reinicia se algum virar NaN, para não ficar travado para sempre */
function dynVisGuard(){if(dynVisFinite())return;
 pitch=roll=xp=xr=hz=pitchT=rollT=0;sv.p=sv.r=sv.h=0;yrP=H(pos.x,pos.z);yvP=0;prevVf=0;acc=0;DYN.nanHits++;DYN.snap=true}

/* Reinicializa o estado dinâmico após reset/teleporte/troca de veículo.
   Evita reaproveitar compressão, velocidades e memória de derrapagem de uma pose anterior. */
function dynReset(){
 const D=DYN;
 D.on=false;D.snap=true;
 D.fz.fill(0);D.W.fill(0);D.k.fill(0);D.cC.fill(0);D.cR.fill(0);
 D.d.fill(0);D.y.fill(0);D.g.fill(0);D.gP.fill(0);D.c.fill(0);D.cv.fill(0);D.F.fill(0);
 D.z=D.zd=D.p=D.pd=D.r=D.rd=0;
 D.zdd=D.pdd=D.rdd=D.ax=D.ay=D.vf0=0;
 D.px=pos.x;D.pz=pos.z;
 D.gF=D.gR=1;D.mR=6500;D.gradeLong=D.gradeLat=D.rough=0;
 D.uF=D.uR=D.uTr=D.sF=D.sR=0;
}

/* Passo da suspensão: chamado em phys() depois de mover o veículo. Calcula as cargas por canto e as aderências relativas dos eixos
   usadas no passo seguinte. */
function dynStep(dt){const P=VEH.phys,D=DYN;
 if(!P){D.on=false;D.snap=true;return}
 const sn=Math.sin(hd),cs=Math.cos(hd),fx=-sn,fz=-cs,rx=cs,rz=-sn,Lw=L,vfE=vel.x*fx+vel.z*fz,idt=1/dt,G9=9.81,
  Mt=hitched?P.trl0+cargo*1000:0,mFif=P.fifth*Mt,mF=P.mF,mR=VEH.m0-P.mF+mFif,mS=mF+mR,
  xcg=Lw*mF/mS,hcg=(VEH.m0*P.hcg+mFif*P.hcgF)/(VEH.m0+mFif),tF=P.trk[0]*.5,tR=P.trk[1]*.5,xm=Lw*.5-xcg,
  d=D.d,y=D.y,g=D.g,gP=D.gP,cc=D.c,cv=D.cv,Fk=D.F,W=D.W,k=D.k,cC=D.cC,cR=D.cR;
 D.xcg=xcg;D.xCab=3.95-xcg;
 d[0]=d[1]=Lw;d[2]=d[3]=0;y[0]=-tF;y[1]=tF;y[2]=-tR;y[3]=tR;
 let gm=0;
 for(let i=0;i<4;i++){const gi=H(pos.x+fx*d[i]+rx*y[i],pos.z+fz*d[i]+rz*y[i]);g[i]=gi;gm+=gi}
 gm*=.25;
 const st=D.z+D.zd+D.p+D.pd+D.r+D.rd;
 let snapped=false;
 if(D.snap||st-st!==0||gm-gm!==0||Math.abs(pos.x-D.px)+Math.abs(pos.z-D.pz)>8||Math.abs(D.z-(gm-xm*D.p))>1.2||Math.abs(D.p)>1||Math.abs(D.r)>1){ // (re)inicializa: chassi paralelo ao terreno, em repouso
  if(gm-gm!==0)return;
  D.p=((g[0]+g[1])-(g[2]+g[3]))/(2*Lw);D.r=((g[1]-g[0])*tF+(g[3]-g[2])*tR)/(2*(tF*tF+tR*tR));D.z=gm-xm*D.p;D.zd=D.pd=D.rd=0;
  for(let i=0;i<4;i++)gP[i]=g[i];D.ax=D.ay=D.zdd=D.pdd=D.rdd=0;D.vf0=vfE;D.snap=false;D.uF=D.uR=D.uTr=0;snapped=true}
 dynTerrainFit(g,d,y,Lw,tF,tR,D,dt,snapped);
 D.px=pos.x;D.pz=pos.z;
 // piso sob o veículo (eixo traseiro) e μ suavizado: sem salto ao sair da pista
 {const sf=onRoad?0:(typeof padW==='function'&&padW(pos.x,pos.z)>.6?1:(typeof riverBank==='function'&&riverBank(pos.x,pos.z)>.5?3:2)),T=P.surf[sf],wk=1-P.wetK*D.wet,ks=snapped?1:1-Math.exp(-dt*8);
  D.surf=sf;D.mu+=(T[0]*wk-D.mu)*ks;D.muT+=(T[1]*wk-D.muT)*ks}
 // aceleração longitudinal e lateral do veículo (filtradas, ~60 ms)
 const kf=1-Math.exp(-dt*16);let axr=(vfE-D.vf0)*idt,ayr=yawS*vfE;D.vf0=vfE;
 axr=axr>14?14:axr<-14?-14:axr;ayr=ayr>12?12:ayr<-12?-12:ayr;D.ax+=(axr-D.ax)*kf;D.ay+=(ayr-D.ay)*kf;
 // molas e amortecedores por canto: frequência fixa pelo tipo de suspensão, com sensibilidade parcial à carga
 const wF=P.f[0]*6.2832,wR=P.f[1]*6.2832,mc0F=P.mF*.5,mc0R=(VEH.m0-P.mF)*.5,mcF=mF*.5,mcR=mR*.5,
  kF=wF*wF*(mc0F+P.ls*(mcF-mc0F)),kR=wR*wR*(mc0R+P.ls*(mcR-mc0R));
 for(let i=0;i<4;i++){const f=i<2,mc=f?mcF:mcR,kk=f?kF:kR,ce=2*Math.sqrt(kk*mc);k[i]=kk;W[i]=mc*G9;cC[i]=ce*P.zc;cR[i]=ce*P.zr}
 // forças das molas (desvio em relação ao equilíbrio estático): c = compressão, cv = velocidade de compressão
 for(let i=0;i<4;i++){const xi=d[i]-xcg;let gv=(g[i]-gP[i])*idt;gv=gv>8?8:gv<-8?-8:gv;gP[i]=g[i];
  const c=g[i]-(D.z+xi*D.p+y[i]*D.r),v=gv-(D.zd+xi*D.pd+y[i]*D.rd);cc[i]=c;cv[i]=v;
  let F=k[i]*c+(v>0?cC[i]:cR[i])*v;if(c>P.cMax)F+=k[i]*P.kb*(c-P.cMax);Fk[i]=F}
 {const aF=P.arb[0]*(cc[1]-cc[0])/(4*tF*tF),aR=P.arb[1]*(cc[3]-cc[2])/(4*tR*tR);Fk[0]-=aF;Fk[1]+=aF;Fk[2]-=aR;Fk[3]+=aR} // barras estabilizadoras
 let SF=0,SX=0,SY=0;
 for(let i=0;i<4;i++){let F=Fk[i];const Wi=W[i];if(F<-Wi)F=-Wi;else if(F>P.fMax*Wi)F=P.fMax*Wi; // roda sem contato não puxa o chassi
  D.fz[i]=Wi+F;SF+=F;SX+=(d[i]-xcg)*F;SY+=y[i]*F}
 // equações do corpo: o peso se transfere pela aceleração e pela inclinação da pista (ax+g·sen(p), ay−g·sen(r))
 const pn=D.p/Math.sqrt(1+D.p*D.p),rn=D.r/Math.sqrt(1+D.r*D.r),axE=D.ax+G9*pn,ayE=D.ay-G9*rn,
  Ip=mS*P.rg[0]*P.rg[0],Ir=mS*P.rg[1]*P.rg[1],zdd=SF/mS,pdd=(SX+mS*axE*hcg)/Ip,rdd=(SY-mS*ayE*hcg)/Ir;
 D.zd+=zdd*dt;D.pd+=pdd*dt;D.rd+=rdd*dt;
 D.zd=D.zd>6?6:D.zd<-6?-6:D.zd;D.pd=D.pd>1.5?1.5:D.pd<-1.5?-1.5:D.pd;D.rd=D.rd>2?2:D.rd<-2?-2:D.rd;
 D.z+=D.zd*dt;D.p+=D.pd*dt;D.r+=D.rd*dt;
 const ka=1-Math.exp(-dt*25);D.zdd+=(zdd-D.zdd)*ka;D.pdd+=(pdd-D.pdd)*ka;D.rdd+=(rdd-D.rdd)*ka;
 // aderência relativa por eixo: μ cai com a carga no pneu (sensibilidade à carga) e a soma por eixo cai com a transferência lateral/roda no ar
 const ls=P.tls;let gf=0,gr=0;
 for(let i=0;i<4;i++){const n=D.fz[i]/W[i],fn=n*(1-ls*(n-1));if(i<2)gf+=fn;else gr+=fn}
 gf*=.5;gr*=.5;D.gF=gf<.35?.35:gf>1.25?1.25:gf;D.gR=gr<.35?.35:gr>1.25?1.25:gr;
 D.mR=Math.max(.35*(VEH.m0-P.mF+mFif),(D.fz[2]+D.fz[3])/G9);
 // pose do chassi para o desenho (origem do veículo = eixo traseiro, xcg à frente dela)
 D.yO=D.z-xcg*D.p;D.pB=Math.atan(D.p);D.rB=Math.atan(D.r);D.on=true}
