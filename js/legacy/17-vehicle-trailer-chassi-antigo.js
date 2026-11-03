/* DESABILITADO: chassi antigo (esqueleto amarelo). Não é carregado pelo index.html; o chassi base agora vive em js/17-vehicle-trailer.js */
/* ===== Semirreboque articulado (quinta roda no eixo traseiro) ===== */
const TLEN=10.2,trl=new THREE.Group(),tW=[];scene.add(trl);
const TAX=[8.8,10.2,11.6],tS=[];
{const M=(c,r,m)=>new THREE.MeshStandardMaterial({color:C(c),roughness:r,metalness:m||0}),
 bx=(w,h,l,mat,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.castShadow=m.receiveShadow=true;trl.add(m);return m},
 bm=(x1,z1,x2,z2,y,w,h,mat)=>bx(w,h,Math.hypot(x2-x1,z2-z1),mat,(x1+x2)/2,y,(z1+z2)/2,Math.atan2(x2-x1,z2-z1)),
 cyl=(r,len,mat,x,y,z,ax)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),mat);m.position.set(x,y,z);if(ax==='x')m.rotation.z=Math.PI/2;m.castShadow=true;trl.add(m);return m};
 /* Chassi esqueleto porta-contêiner 40' (3 eixos, rodado duplo) */
 const mY=M(0xe8a317,.55,.25),mYd=M(0xc98710,.6,.3),mK=M(0x15181c,.8,.2),mG=M(0x8a949e,.5,.6),mW=M(0xcfd4d9,.4,.5),mA=M(0xffa500,.5),RY=1.48,NY=1.36,ZR=13.5;
 // pescoço + pino-rei
 bx(1.3,.2,2.4,mK,0,1.15,.2);cyl(.06,.22,mG,0,1.0,.1);
 for(const s of[-1,1]){bm(s*.62,-.7,s*1,1,NY,.14,.36,mY);bx(.12,.5,.12,mK,s*.62,1.0,-.65)}
 bx(1.4,.16,.14,mY,0,NY,-.7);bx(1.78,.14,.12,mY,0,NY,.5);bx(2.44,.18,.16,mY,0,RY,1);
 // longarinas principais (perfil I) + internas
 for(const s of[-1,1]){bx(.14,.38,ZR-1,mY,s*1,RY,(ZR+1)/2);bx(.28,.05,ZR-1,mYd,s*1,RY+.215,(ZR+1)/2);bx(.28,.05,ZR-1,mYd,s*1,RY-.215,(ZR+1)/2);bx(.1,.22,ZR-3,mY,s*.5,RY-.1,(ZR+3)/2)}
 // travessas
 for(let z=2;z<13;z+=1.1)bx(2,.1,.14,mY,0,RY-.03,z);
 // traseira: travessa, para-choque, lanternas
 bx(2.44,.3,.16,mY,0,RY,ZR);bx(2.4,.08,.08,TL,0,RY,ZR+.12);
 for(const s of[-1,1])bx(.1,.5,.1,mK,s*.9,1.2,ZR-.05);
 bx(2,.12,.1,mK,0,.9,ZR-.05);
 // cantoneiras + pinos twist-lock (40')
 for(const z of[1,13.2])for(const s of[-1,1]){bx(.24,.18,.26,mK,s*1.12,1.81,z);cyl(.04,.12,mG,s*1.12,1.96,z)}
 // pé de apoio (recolhido)
 for(const s of[-1,1]){bx(.12,.67,.12,mY,s*.9,.9,3.9);bx(.4,.05,.3,mK,s*.9,.56,3.9)}
 bx(1.8,.08,.08,mY,0,1.07,3.9);
 // reservatórios de ar
 cyl(.14,.9,mW,0,1.1,5.2,'x');cyl(.14,.9,mW,0,1.1,6.4,'x');
 // luzes laterais
 for(const s of[-1,1])for(const z of[3,7,11])bx(.04,.06,.16,mA,s*1.09,RY,z);
 // suspensão, eixos e paralamas
 for(const z of TAX)for(const s of[-1,1])bx(.12,.3,.3,mK,s*.5,1.12,z-.75);
 for(const s of[-1,1])bx(.8,.04,4.1,mK,s*.93,1.2,10.2);
 var TRLM=[mY,mYd];}

