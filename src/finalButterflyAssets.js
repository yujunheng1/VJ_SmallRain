export function createFinalButterflyAssets(THREE, scene, {EYE_FULL}) {
function rotJ(x,y,a){const c=Math.cos(a),s=Math.sin(a);return[c*x-s*y,s*x+c*y];}
function wingDJ(ax,ay){
 const[ux,uy]=rotJ(ax-.34,ay-.15,-.55);const du=Math.hypot(ux/.42,uy/.23)-1;
 const[lx,ly]=rotJ(ax-.23,ay+.16,.45);const dl=Math.hypot(lx/.30,ly/.21)-1;
 const ds=Math.hypot((ax-.15)/.045,(ay+.36)/.17)-1;
 return Math.min(du,dl,ds);
}
/* ============================================================
   红雨巨蝶 — the red rain weaves itself into one giant red
   butterfly; the small cyan one flies to its heart 点睛之笔
============================================================ */
const ghostU={uT:{value:0},uGrow:{value:0},uBeat:{value:0},uPx:{value:1},
 uDrop:{value:0},uSeal:{value:0},uEye:{value:0},uGT:{value:0},uBoltG:{value:0},
 uDevR:{value:0},uDevC:{value:new THREE.Vector2(0,-7.4)},   // 感染波半径·蝶①眼面局部圆心
 uDevC2:{value:new THREE.Vector2(0,-7.4)},uBurst:{value:0},uReform:{value:0}, // 蝶②感染源·炸开·复蝶进度
 uTb:{value:0},                                             // 眨眼时钟(锁歌曲时间:143.5s泪落恰闭眼)
 uAsc:{value:0},                                            // 双星入河: 两只领头蝶攀向星河的进度
 uMirA:{value:1},                                           // 倒影门控 — 有水才有倒影
 uCtr:{value:new THREE.Vector3(0,22,-205)}};
const ghostObjs=[];   // legacy 管线对象（?gpu 时隐藏，由 GPGPU 接管）
{
 const pts=[],info=[];   // position=蝶面局部坐标; info:[grow order h, seed, kind, size]
 const R=Math.random;
 const PB=(ox,oy,kind,sz)=>{
  if(pts.length>=240000)return;
  pts.push(ox,oy,(R()-.5)*.05);
  const h=(kind>1.5?0:Math.min(Math.abs(ox)/.92,1)*.8)+R()*.06;  // 身体先成形→翅尖
  info.push(h,R(),kind,sz);
 };
 let mem=0,edg=0,guard=0;
 while((mem<22000||edg<14000)&&guard++<9000000){
  const ax=R()*.92,ay=R()*1.15-.62;
  const d=wingDJ(ax,ay),sx=(R()<.5?-1:1)*ax;
  if(Math.abs(d)<.015&&edg<14000){PB(sx,ay,1,.5+R()*.25);edg++;}       // 翅缘
  else if(d<-.02&&mem<22000&&R()<.5){PB(sx,ay,0,.35+R()*.2);mem++;}    // 翅膜
 }
 for(let s=-1;s<=1;s+=2)for(let v=0;v<9;v++){                          // 翅脉
  const a=-1.05+v*.28+(R()-.5)*.05,dx=Math.cos(a),dy=Math.sin(a);
  for(let tt=.05;tt<.95;tt+=.004){
   const ax=.05+dx*tt,ay=.02+dy*tt;
   if(wingDJ(ax,ay)<-.012)PB(s*(ax+(R()-.5)*.004),ay+(R()-.5)*.004,1,.42+R()*.15);
  }
 }
 for(let i=0;i<3200;i++)PB((R()-.5)*.06,-.18+R()*.32,2,.7+R()*.3);     // 身体
 for(let i=0;i<400;i++){const a2=R()*6.283,r2=.034*Math.sqrt(R());
  PB(Math.cos(a2)*r2,.14+Math.sin(a2)*r2,2,.6+R()*.25);}               // 头
 for(let s=-1;s<=1;s+=2)for(let i=0;i<150;i++){const tt=i/149;         // 触须
  PB(s*(.012+.085*tt)+(R()-.5)*.006,.16+.15*tt+(R()-.5)*.006,2,.5);}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));
 g.setAttribute('aInfo',new THREE.BufferAttribute(new Float32Array(info),4));
 const mkGhost=(core,mirror)=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  depthTest:!mirror,                    // 倒影不被河床遮挡
  blending:THREE.AdditiveBlending,uniforms:ghostU,
  vertexShader:`
  attribute vec4 aInfo;
  uniform float uT,uGrow,uBeat,uPx,uDrop,uSeal,uEye,uGT,uBoltG,uDevR,uBurst,uReform,uTb,uMirA,uAsc;
  uniform vec2 uDevC,uDevC2;
  uniform vec3 uCtr;
  varying float vA; varying float vB; varying float vE;
  varying float vES; varying vec3 vECol; varying float vFl;
  float hsh(float n){return fract(sin(n)*43758.5453);}
  // 龙卷风 — 被感染的眼粒卷入绕眼轴上升的漩涡柱（与 GPU 端同源）
  vec3 tornadoPt(float n1,float n2,float seed,vec3 ep,float age,float uTm){
   float r0=length(ep.xy)+.001;
   float a0=atan(ep.y,ep.x);
   float t=clamp(age,0.,7.);
   float conv=smoothstep(0.,2.4,t)*.6;
   float hcol=(fract(seed*91.7)-.5)*28.;
   float y=mix(ep.y,hcol,conv)+t*2.2;
   float funnel=mix(5.,12.,smoothstep(-14.,14.,hcol));
   float rad=mix(r0,funnel,conv)*(1.+.16*sin(y*.5+uTm*3.+seed*20.));
   float ang=a0+t*(1.3+t*.32)+hcol*.10;
   vec3 p=vec3(cos(ang)*rad,y,sin(ang)*rad*.85);
   p+=conv*1.1*vec3(sin(uTm*2.4+seed*33.),cos(uTm*1.6+n1*20.)*.5,cos(uTm*2.0+seed*22.));
   return p;
  }
  void main(){
   float h=aInfo.x,seed=aInfo.y,kind=aInfo.z;
   float isE=step(.5,kind)-step(1.5,kind),isB=step(1.5,kind);
   vec3 o=position;
   // assembled pose: fronto-parallel giant, breathing flap 巨蝶振翅
   float flap=sin(uT*1.9)*(.22+.5*uSeal)+.10;         // 点睛之后振翅变深
   float wx=abs(o.x);
   vec3 lp;
   lp.x=sign(o.x)*wx*cos(flap);
   lp.z=wx*sin(flap)*.75+o.z;
   lp.y=o.y;                                          // head up 头朝上
   lp+=.015*vec3(sin(uT*(1.5+seed*4.)+seed*40.),
     cos(uT*(1.3+seed*5.)+seed*20.),sin(uT*2.+seed*30.));
   vec3 w=uCtr+lp*26.;                                // ~50m wingspan
   w.y+=sin(uT*.7)*1.2;                               // hover 悬浮呼吸
   float n1=hsh(dot(o.xy,vec2(12.9,78.2))+seed*7.);
   float n2=hsh(dot(o.xy,vec2(39.3,11.1))+seed*3.);
   // formation 红雨滴(先飘落)→缠绕→直接汇成巨眼
   float p=clamp((uGrow-h*.55-n1*.10)*2.8,0.,1.);
   float e=p*p*(3.-2.*p);
   vec3 rp=vec3(uCtr.x+(n1-.5)*90., mod(n2*50.-uT*3.5,50.), uCtr.z+(n2-.5)*60.);
   rp.x+=sin(uT*.4+n2*25.)*2.5;                       // gentle drift while falling
   rp.z+=cos(uT*.33+n1*20.)*1.8;
   vec3 base=mix(rp,w,e);
   float ang=(1.-e)*(3.5+n1*3.);                      // 缠绕: spiral in around the axis
   float ca=cos(ang),sa=sin(ang);
   vec2 rel=base.xz-uCtr.xz;
   base.xz=uCtr.xz+mat2(ca,-sa,sa,ca)*rel;
   // 所有的思念变成眼睛 — the rain weaves straight into a living eye
   float m1=hsh(seed*31.+n1*17.);
   float es=1.;                       // 红雨直达眼形，不经蝶形

   vec3 eCol=vec3(1.);
   float eAv=1.,szf=1.,inner=0.,dv=0.,reb=0.,flare=0.,duoF=0.;
   float rfm=smoothstep(.32,1.,uReform);rfm=rfm*rfm*(3.-2.*rfm); // 聚拢进度: 散落四方后缓缓归蝶
   if(es>0.){
    float tb=uTb*1.05;                                  // 眨眼锁歌曲时间 — 泪落恰闭眼
    float bl=1.-.985*pow(.5+.5*sin(tb+.35*cos(tb)),10.); // 闭快睁慢 asymmetric blink
    float itv=floor(uT*.42),fitv=fract(uT*.42);
    vec2 g0=vec2(hsh(itv*7.3)-.5,(hsh(itv*13.1)-.5)*.5)*2.2;
    vec2 g1=vec2(hsh((itv+1.)*7.3)-.5,(hsh((itv+1.)*13.1)-.5)*.5)*2.2;
    vec2 gaze=mix(g0,g1,smoothstep(.80,.90,fitv));      // 扫视-驻留 dart & fixate
    vec3 ep=vec3(0.);
    float gz=0.,ex2,h2x;
    float pcon=1.-.16*min(uBoltG,1.2);                  // 瞳孔对光反射 light reflex
    if(n1<.13){                                         // 上睑线 — 饱满的眼线笔触
     ex2=n2*2.-1.;
     h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4*(1.02-.14*ex2);
     float th=(fract(n1*171.)-.5)*(.7-.35*abs(ex2));    // 中段最厚，两端收笔
     ep=vec3(ex2*12.2,mix(-.5*h2x,h2x,bl)+th,0.);
     eCol=vec3(1.05,.22,.12)*(.75+.5*fract(n1*57.));
    }else if(n1<.175){                                  // 双眼皮褶 crease
     ex2=n2*2.-1.;
     h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4;
     ep=vec3(ex2*11.6,mix(-.42*h2x,h2x*1.28+.55,bl),0.);
     eCol=vec3(.55,.12,.07);
    }else if(n1<.26){                                   // 下睑+泪光线 — 加厚
     ex2=n2*2.-1.;
     h2x=pow(max(1.-ex2*ex2,0.),.7)*4.6*(.98+.10*ex2);
     float th=(fract(n1*171.)-.5)*(.45-.2*abs(ex2));
     ep=vec3(ex2*12.,mix(-.52*h2x,-h2x,bl)+th,0.);
     float wl=step(.88,fract(n1*91.));
     eCol=mix(vec3(.9,.2,.12)*(.8+.4*fract(n1*57.)),vec3(1.35,.85,.8),wl);
    }else if(n1<.35){                                   // 睫毛 lashes (outer-dense, curved)
     float up=step(.22,fract(n1*7.77));
     ex2=fract(n1*57.3)*2.-1.;
     ex2=sign(ex2)*pow(abs(ex2),.72);
     h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4;
     float lt=fract(n2*13.7);
     float ll=up>.5?1.+fract(n1*23.)*1.7:.45+fract(n1*23.)*.5;
     float lidY=up>.5?mix(-.5*h2x,h2x*(1.02-.14*ex2),bl):mix(-.52*h2x,-h2x,bl);
     ep=vec3(ex2*12.2+lt*ll*ex2*.30,
       lidY+(up>.5?1.:-1.)*lt*ll*(.72+.28*bl)+lt*lt*ll*.20*up,0.);
     eCol=vec3(.85,.16,.09)*(1.-lt*.4);
    }else if(n1<.56){                                   // 外层虹膜纤维束 — 羽状成绺，铺满眼眶
     float bnd=floor(n2*38.);
     float bh=hsh(bnd*13.7+seed);
     float ia=(bnd+.5)/38.*6.283+(fract(n1*397.)-.5)*.14;
     float t2=pow(fract(n1*29.7),.9);
     float re=(11.4*5.)/max(length(vec2(5.*cos(ia),11.4*sin(ia))),.001);
     float reach=re*mix(.5,.95,hsh(bnd*7.1));           // 各束长短不一，伸向眼角
     float ir=mix(2.55,reach,t2)*(1.-.03*uBeat);
     ia+=t2*t2*.5*(bh-.5)+t2*.12*sin(bnd*3.7);          // 纤维向外扇散 fanning
     ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
     float crypt=step(.72,bh);                          // 部分束压暗 → 放射状裂隙
     float cry=smoothstep(.45,.95,sin(ia*5.+seed*20.)*sin(ia*3.-seed*13.))
              *exp(-pow((ir-2.9)/.9,2.));               // Fuchs 隐窝 oval crypts
     eCol=mix(vec3(1.,.26,.10),vec3(1.3,.6,.22),t2*.7)
         *mix(1.,.25,crypt)*(1.-.75*cry)*(.7+.6*fract(n1*211.));
     eCol*=1.-.35*smoothstep(.2,.9,sin(ia));            // 上睑投影
     inner=1.;gz=1.;szf=.34;
    }else if(n1<.655){                                  // 瞳周羽冠 — 白热细羽侵入瞳缘
     float ia=n2*6.283+(fract(n1*397.)-.5)*.2;
     float t2=pow(fract(n1*47.3),1.3);
     float ir=mix(1.15*pcon,2.9,t2);                    // 随瞳孔收缩
     ia+=t2*.5*(fract(n1*89.)-.5);
     ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
     eCol=mix(vec3(1.12,.72,.52),vec3(1.3,.45,.2),t2);  // 近瞳白热 → 外橙红
     inner=1.;gz=1.;szf=.28;
    }else if(n1<.70){                                   // 卷缩轮 collarette (jagged)
     float ia=n2*6.283;
     float ir=2.7+.34*sin(ia*9.+seed*40.)+.2*sin(ia*17.+seed*9.)+fract(n1*61.)*.2;
     ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
     eCol=vec3(1.4,.62,.22);inner=1.;gz=1.;szf=.3;
    }else if(n1<.77){                                   // 瞳缘 — 破碎有机的锯齿边
     float ia=n2*6.283;
     float ir=1.55+.18*sin(ia*7.+seed*30.)+.12*sin(ia*13.+seed*11.)
             +.08*sin(ia*23.+seed*51.)+(fract(n1*151.)-.5)*.3;
     ep=vec3(cos(ia)*ir*pcon,sin(ia)*ir*pcon,0.);       // 随光反射收缩
     float brt=step(.6,fract(n1*77.7));                 // 明暗颗粒交错
     eCol=mix(vec3(.4,.05,.03),vec3(1.12,.68,.45),brt);
     inner=1.;gz=1.;szf=.28;
    }else if(n1<.81){                                   // 纤维间暗隙 — 体积与深度
     float ia=n2*6.283;
     float re=(11.4*5.)/max(length(vec2(5.*cos(ia),11.4*sin(ia))),.001);
     float ir=mix(2.4,re*.9,fract(n1*43.7));
     ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
     float cry=smoothstep(.45,.95,sin(ia*5.+seed*20.)*sin(ia*3.-seed*13.))
              *exp(-pow((ir-2.9)/.9,2.));
     eCol=vec3(.32,.05,.04)*(1.-.4*smoothstep(.1,.9,sin(ia)))*(1.-.7*cry);
     inner=1.;gz=1.;szf=.32;
    }else if(n1<.845){                                  // 收缩沟 contraction furrows 同心环纹
     float ring=floor(fract(n1*7.77)*4.);
     float ia=n2*6.283;
     float rr0=mix(3.15,4.55,ring/3.)+.10*sin(ia*13.+ring*9.+seed*30.)
              +(fract(n1*171.)-.5)*.12;
     ep=vec3(cos(ia)*rr0,sin(ia)*rr0,0.);
     eCol=vec3(.55,.10,.05)*(.55+.5*fract(n1*211.));
     inner=1.;gz=1.;szf=.3;
    }else if(n1<.87){                                   // 眼角光丝 corner streamers
     float lft=step(.5,fract(n1*53.));
     float t2=pow(fract(n1*67.),1.4);
     vec2 cc=lft>.5?vec2(-12.1,-.35):vec2(12.1,.35);
     vec2 dir2=lft>.5?vec2(-1.,-.30):vec2(1.,.30);
     float ln=6.+fract(n1*29.)*8.;
     ep=vec3(cc+dir2*t2*ln+vec2(0.,t2*t2*(lft>.5?-.8:.8)),0.);
     ep.y+=(fract(n1*171.)-.5)*.22*(1.-t2);
     eCol=vec3(1.15,.4,.3)*(1.-t2*.85);                 // 越远越淡的长尾
     szf=.3;
    }else if(n1<.915){                                  // 高光 catchlights — the life
     float which=fract(n1*83.);
     vec2 hc;float hr;vec3 hcol;
     if(which<.5){hc=vec2(-1.9,1.9);hr=.5;hcol=vec3(1.18,1.1,1.05);}      // 主高光
     else if(which<.8){hc=vec2(2.3,-1.5);hr=.75;hcol=vec3(1.05,.95,1.);} // 副高光
     else{float ba=-1.5708+(n2-.5)*1.5;hc=vec2(cos(ba),sin(ba))*3.9;hr=.28;
      hcol=vec3(1.45,.75,.35);}                          // 底部透光弧
     float ia=n2*6.283;
     ep=vec3(hc+vec2(cos(ia),sin(ia))*sqrt(fract(n1*97.))*hr,0.);
     eCol=hcol;inner=1.;gz=.3;szf=.3;                    // 高光近乎不随眼神动
    }else if(n1<.955){                                  // 瞳孔深潭 pupil depths
     float dr=fract(n1*131.);
     if(dr>.82){                                        // 瞳中落雨 — rain inside the pupil
      ep=vec3((fract(n1*37.)-.5)*1.6,
              .75-mod(fract(n1*53.)*2.4+uT*.2,1.7),0.);
      eCol=vec3(.85,.5,.45)*.8;szf=.32;
     }else{                                             // 幽暗涡旋 slow dark vortex
      float ia=n2*6.283+uT*.12*(fract(n1*71.)>.5?1.:-1.);
      float ir=1.38*pcon*sqrt(fract(n1*97.3));          // 随光反射收缩
      ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
      float glowB=smoothstep(-.2,-1.1,ep.y);            // 瞳底透光 transmitted warmth
      eCol=mix(vec3(.14,.02,.03),vec3(.5,.12,.06),glowB)
          *(.75+.5*fract(n1*211.));
      szf=.4;
     }
     inner=1.;gz=1.;
    }else{                                              // 外围光晕 soft rays
     float ia=n2*6.283,ir=7.+fract(n1*23.7)*4.2;
     ep=vec3(cos(ia)*ir*1.7,sin(ia)*ir*.75,0.);
     eCol=vec3(.9,.2,.1)*.5;
    }
    ep.xy+=gaze*gz;
    ep.xy+=vec2(sin(uT*13.+n1*41.),cos(uT*11.+n2*37.))*.02*(1.+uBeat*2.); // 鼓点微颤
    ep.z=(m1-.5)*.6+inner*(1.-min(dot(ep.xy,ep.xy)/30.25,1.))*1.5;  // 角膜穹面 cornea dome
    eCol*=mix(1.,clamp(length(ep.xy)*.32,.45,1.),inner); // 径向能量归一，中心抗糊
    float hxP=pow(max(1.-pow(ep.x/12.2,2.),0.),.62)*5.4*(1.02-.14*ep.x/12.2);
    float upE=mix(-.5*hxP,hxP,bl),loE=mix(-.52*hxP,-hxP,bl);
    eAv=mix(1.,smoothstep(upE-.05,upE-1.,ep.y)
           *smoothstep(loE+.05,loE+.85,ep.y),inner);    // 睑缘扫过之后才露出
    // 双蝶感染 — 感染波从两只蝴蝶各自荡开，眼粒卷入龙卷风漩涡，感染满后炸开
    float dInf=min(length(ep.xy-uDevC),length(ep.xy-uDevC2))+(fract(n1*777.7)-.5)*2.4;
    float uu2=clamp((uDevR-dInf)/2.8,0.,1.)*step(1e-4,uDevR);
    dv=uu2*uu2*(3.-2.*uu2);                             // 感染系数
    reb=smoothstep(.4,1.,uu2);                          // 卷入进度（尺寸/睑遮解除）
    flare=exp(-abs(uDevR-dInf)*.9)*step(1e-4,uDevR);    // 白热感染波前
    float age=max((uDevR-dInf)/5.,0.);                  // 感染后经过的秒数
    vec3 tp=uCtr+tornadoPt(n1,n2,seed,ep,age,uT);       // 漩涡落位
    // 炸开 — 感染满后向四方散落悬漂(各自远近不同 不聚不叠) 再被 rfmP 一粒粒缓缓收回
    float rfmP=smoothstep(.32+fract(seed*53.9)*.22,1.,uReform); // 错峰归蝶 免同时挤成一团过曝
    rfmP=rfmP*rfmP*(3.-2.*rfmP);
    float sc=smoothstep(0.,.32,uReform);                // 散落窗口
    vec3 dirB=normalize(tp-uCtr+vec3(1e-4,1e-4,0.));
    tp+=(dirB*(14.+26.*fract(seed*91.7))
       +vec3(sin(seed*33.+uT*.6),cos(seed*22.+uT*.5),sin(n1*20.+uT*.7))*(4.+4.*n2))
       *sc*(1.-rfmP);                                   // 散开后随风缓漂 聚拢时收回
    // 炸开后复用蝶形（青蝶×泪蝶群），粒子数不变，仅重新归属
    float bfk=floor(fract(n1*57.77)*48.);
    float hk1=hsh(bfk*7.13),hk2=hsh(bfk*13.7),hk3=hsh(bfk*29.3);
    float orbR=4.+hk1*26.;
    float orbA=hk2*6.283+uT*(.10+hk3*.14)*(hk2>.5?1.:-1.);
    vec3 ctrK=uCtr+vec3(cos(orbA)*orbR,
      (hk3-.55)*24.+sin(uT*(.5+hk1)+bfk)*1.5,sin(orbA)*orbR*.5+2.);
    float flapK=abs(sin(uT*(3.2+hk1*2.5)+bfk*1.7))*1.15+.10;
    float wxs=abs(o.x);
    vec3 lps=vec3(sign(o.x)*wxs*cos(flapK),wxs*sin(flapK)*.9,-o.y);  // 复用巨蝶翅坐标
    lps*=1.+hk2*1.2;
    float cyk=cos(hk1*6.283+uT*(.2+hk3*.3)),syk=sin(hk1*6.283+uT*(.2+hk3*.3));
    lps.xz=mat2(cyk,-syk,syk,cyk)*lps.xz;
    tp=mix(tp,ctrK+lps,rfmP);                           // 散落星火→缓缓合为蝴蝶
    duoF=(1.-step(1.5,bfk))*rfmP;                       // 头两只 = 青蝶×泪蝶的化身
    float ascE=uAsc*uAsc*(3.-2.*uAsc);
    vec3 tgt=uCtr+vec3((bfk*2.-1.)*7.,165.,-135.);      // 攀向天幕银河的方向
    tgt.x+=sin(uAsc*9.+bfk*3.)*3.*(1.-ascE);            // 途中微螺旋
    tp=mix(tp,tgt,duoF*ascE);                           // 双星入河: 蝶影升天
    base=mix(base,tp,es*dv);
    vec3 eyeColL=eCol;                                  // 保存眼睛配色
    eCol=mix(eCol,mix(vec3(.95,.28,.14),vec3(1.15,.62,.32),          // 深红→炽金漩涡流光（降亮）
      .5+.5*sin(age*3.+seed*6.)),dv);
    eCol=mix(eCol,vec3(1.35,1.18,1.02),min(uBurst,1.)*.55*dv);       // 闪光→收敛白
    eCol=mix(eCol,eyeColL,rfm*dv);                                  // 化蝶后回到眼睛配色
   }
   float flb=e*(1.-e);                                  // 飞行途中：类卷曲湍流
   base+=flb*vec3(sin(base.y*.55+uT*1.7+n1*9.),
     sin(base.z*.5+uT*1.3+n2*7.)*.6,
     sin(base.x*.6+uT*1.5+n2*11.))*2.2;
   float tArr=20.*(h*.55+n1*.10+.357);                  // 该粒子的到位时刻
   float uu=uGT-tArr;
   if(uu>0.&&uu<1.4){                                   // 到位瞬间弹簧回振 spring landing
    vec2 rad=normalize(base.xz-uCtr.xz+vec2(1e-4,0.));
    float osc=sin(uu*16.+n2*6.)*exp(-uu*3.4)*.45;
    base.xz+=rad*osc;base.y+=osc*.3;
   }
   ${mirror?`base.y=-.70-base.y;                    // 潭中倒影
   base.x+=sin(uT*2.4+base.z*1.7)*.10;`:''}
   vec4 mv=viewMatrix*vec4(base,1.);
   float d=-mv.z;
   float sz=aInfo.w*(.8+.4*fract(seed*7.3+h*13.));
   sz=mix(.16+.10*n2,sz,e)*mix(1.,szf,e*(1.-reb));    // raindrops are small; 化蝶后回蝶粒尺寸
   sz*=1.+rfm*(1.-isE-isB)*.55;                       // 化蝶群翅膜粒放大 软光铺满翅面
   sz*=1.+flare*.8;
   gl_PointSize=${core?'clamp(sz*.55*uPx/max(d,1.),1.35,26.)'
                      :'min(sz*1.6*uPx/max(d,1.),80.)'};   // 亮核保底1.35px，粒粒可见
   float tw=.72+.28*sin(uT*(1.2+seed*3.)+h*30.+o.y*4.);
   float flow=pow(.5+.5*sin(length(o.xy)*9.-uT*2.2+seed*3.),3.); // 灵动: wing energy bands
   float wK=.34+.30*isE+.34*isB;                      // 平时: 轮廓/身体提亮
   wK=mix(wK,.52-.07*isE+.16*isB,rfm);                // 化蝶群: 翅膜提到与轮廓相当→翅面不空心
   float aliveA=(wK+.12*uBeat)*tw*(.75+.85*flow);
   aliveA*=mix(.35,1.15,step(.42,fract(n1*777.7)));   // 双态明暗抖动 stipple grain
   aliveA*=1.+uSeal*(.45+.45*sin(uT*3.5-length(o.xy)*10.))*(1.-uEye*.7); // 化眼后脉动收敛
   float dropA=.22*(.4+.6*n2)*uDrop;                  // drops fade in early 提前飘落
   vA=mix(dropA,aliveA*${core?'3.0':'(.12*(1.-.85*inner*(1.-reb)))'},e)+e*(1.-e)*1.2; // 眼内几乎纯锐点
   vA*=1.+reb*.22*(1.-rfm);                          // 漩涡微亮，不过曝；复蝶后回落
   vA*=mix(1.,.6,rfm);                               // 化蝶后压暗防过曝
   vA*=1.-duoF*smoothstep(.5,.9,uAsc)*.92;           // 化星交接: 蝶影渐隐 星辰接棒
   vA+=flare*e*${core?'1.2':'.4'};
   vA*=smoothstep(200.,60.,d)${mirror?'*smoothstep(5.4,4.5,abs(base.x))*.35*uMirA':''};
   vA*=mix(1.,eAv,es*e*(1.-reb));                     // blink hides the inner eye
   vES=es*e;vECol=eCol;vFl=min(flare,1.5)*e;          // 化蝶后 eCol 已混入青×泪白
   vE=e;vB=isE*.5+isB;
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA; varying float vB; varying float vE;
  varying float vES; varying vec3 vECol; varying float vFl;
  void main(){
   vec2 q=gl_PointCoord-.5;
   float dd=length(q);
   float m=exp(-dd*dd*${core?'22.':'7.'})*smoothstep(${core?'.42':'.5'},${core?'.26':'.34'},dd);
   vec3 drop=${core?'vec3(1.25,.35,.25)':'vec3(1.,.16,.10)'};      // 红雨滴
   vec3 bf=${core?'mix(vec3(1.25,.42,.28),vec3(1.35,.8,.55),vB)'
                 :'mix(vec3(1.,.24,.12),vec3(1.,.5,.3),vB)'};      // hot core / deep halo
   vec3 col=mix(drop,bf,vE);
   col=mix(col,vECol*${core?'1.3':'.75'},vES);                     // 化眼后的部位配色
   col=mix(col,vec3(1.35,1.12,.9),min(vFl,1.)*.8);                 // 吞灭波前白热
   gl_FragColor=vec4(col*m*vA,1.);
  }`});
 for(const[core,mirror]of[[false,true],[false,false],[true,false]]){ // 倒影→光晕→亮核
  const gh=new THREE.Points(g,mkGhost(core,mirror));
  gh.frustumCulled=false; scene.add(gh);ghostObjs.push(gh);
 }
}

/* ============================================================
   相遇波纹 — 双蝶相遇处泛起的粒子涟漪，一圈圈荡开扫向巨眼
============================================================ */
const meetRipU={uT:{value:0},uRT:{value:-1},uPx:{value:1},
 uCtr:{value:new THREE.Vector3(0,14.6,-202.4)}};
{
 const NR=1600,aR=new Float32Array(NR*3);          // [angle, ring, rand]
 for(let i=0;i<NR;i++){aR[i*3]=Math.random()*6.283;aR[i*3+1]=i%4;aR[i*3+2]=Math.random();}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NR*3),3));
 g.setAttribute('aR',new THREE.BufferAttribute(aR,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,
  blending:THREE.AdditiveBlending,uniforms:meetRipU,
  vertexShader:`
  attribute vec3 aR;
  uniform float uT,uRT,uPx;
  uniform vec3 uCtr;
  varying float vA;varying float vW;
  void main(){
   float rt=uRT-aR.y*.5;                          // 四圈涟漪相继荡开
   float rad=max(rt,0.)*5.*(.97+aR.z*.06);        // 与吞灭波前同速
   float a=aR.x+aR.z*.04*rad;                     // 随半径微剪切，波纹不呆板
   vec3 w=uCtr+vec3(cos(a)*rad,sin(a)*rad*.94,
     sin(a*3.+uT*2.5+aR.z*9.)*(.2+rad*.04));
   vec4 mv=viewMatrix*vec4(w,1.);
   float d=-mv.z;
   gl_PointSize=min((.09+.09*aR.z)*(1.+rad*.06)*uPx/max(d,1.),9.);
   vA=step(0.,rt)*smoothstep(0.,.25,rt)
     *(1.-smoothstep(15.,22.,rad))                // 传到眼后散去
     *exp(-rad*.05)
     *(.55+.45*sin(uT*9.+aR.x*7.+aR.z*20.));
   vW=aR.z;
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA;varying float vW;
  void main(){
   vec2 q=gl_PointCoord-.5;float dd=length(q);
   float m2=exp(-dd*dd*14.)*smoothstep(.5,.3,dd);
   vec3 col=mix(vec3(.25,.95,.9),vec3(.92,.97,1.05),vW);  // 青蝶×泪蝶的双色波纹
   gl_FragColor=vec4(col*m2*vA,1.);
  }`});
 const o=new THREE.Points(g,m);
 o.renderOrder=8;o.frustumCulled=false;scene.add(o);
}

 return {ghostU, ghostObjs, meetRipU};
}
