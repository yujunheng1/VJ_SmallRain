export const EYE_FULL=`
vec3 eyeFull(float n1,float n2,float seed,float uTm,float uTbk,float uBt,float uBg,
 out vec3 eCol,out float szf,out float inr,out float eAv){
 float tb=uTbk*1.05;                             // 眨眼锁歌曲时间 — 泪落恰闭眼
 float bl=1.-.985*pow(.5+.5*sin(tb+.35*cos(tb)),10.);
 float itv=floor(uTm*.42),fitv=fract(uTm*.42);
 vec2 g0=vec2(hsh(itv*7.3)-.5,(hsh(itv*13.1)-.5)*.5)*2.2;
 vec2 g1=vec2(hsh((itv+1.)*7.3)-.5,(hsh((itv+1.)*13.1)-.5)*.5)*2.2;
 vec2 gaze=mix(g0,g1,smoothstep(.80,.90,fitv));
 float pcon=1.-.16*min(uBg,1.2);
 float m1=hsh(seed*31.+n1*17.);
 vec3 ep=vec3(0.);eCol=vec3(1.);szf=1.;inr=0.;eAv=1.;
 float gz=0.,ex2,h2x;
 if(n1<.16){                                    // 上睑：加厚配额的双层睑缘
  ex2=n2*2.-1.;
  h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4*(1.02-.14*ex2);
  float sub=fract(n1*171.);
  float sp2=fract(n1*313.)*2.-1.;
  float th=sign(sp2)*pow(abs(sp2),1.7)*1.7*(1.-.35*abs(ex2)); // 羽化厚描边：中密边稀
  float ln2=step(.62,sub);                      // 第二道睑缘线
  ep=vec3(ex2*12.2,mix(-.5*h2x,h2x,bl)+th+ln2*.55,0.);
  ep.z+=.45*(1.-abs(ex2));                      // 睑缘弧面前包
  eCol=vec3(1.05,.22,.12)*(.75+.5*fract(n1*57.))*mix(1.,.45,ln2)
      *exp(-abs(sp2)*1.5)*.8;                   // 配额↑亮度↓，总能量守恒
 }else if(n1<.21){                              // 双眼皮褶
  ex2=n2*2.-1.;
  h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4;
  ep=vec3(ex2*11.6,mix(-.42*h2x,h2x*1.28+.55,bl)
    +(fract(n1*211.)-.5)*.25,0.);
  ep.z+=.3*(1.-abs(ex2));
  eCol=vec3(.55,.12,.07)*(.7+.6*fract(n1*97.))*.9;
 }else if(n1<.31){                              // 下睑：睑缘线+泪光+卧蚕
  ex2=n2*2.-1.;
  h2x=pow(max(1.-ex2*ex2,0.),.7)*4.6*(.98+.10*ex2);
  float sub=fract(n1*131.);
  float sp2=fract(n1*313.)*2.-1.;
  float th=sign(sp2)*pow(abs(sp2),1.7)*1.35;    // 羽化厚描边
  if(sub<.60){
   ep=vec3(ex2*12.,mix(-.52*h2x,-h2x,bl)+th,0.);
   float wl=step(.80,fract(n1*91.))*step(abs(sp2),.3); // 泪光仍是贴线细亮点
   eCol=mix(vec3(.9,.2,.12)*(.8+.4*fract(n1*57.))*exp(-abs(sp2)*1.5),
            vec3(1.35,.85,.8),wl)*.85;
  }else{                                        // 卧蚕 — 下睑下方柔光带
   ep=vec3(ex2*11.4,mix(-.52*h2x,-h2x,bl)-.55-fract(n1*211.)*.5,0.);
   eCol=vec3(.5,.12,.08)*(.6+.5*fract(n1*97.));
  }
  ep.z+=.4*(1.-abs(ex2));
 }else if(n1<.40){                              // 睫毛：沿睑弧扇开、外长内短、梢部卷曲
  float up=step(.22,fract(n1*7.77));
  float cl=floor(fract(n1*57.3)*26.)/26.;
  ex2=(cl+fract(n1*401.)*.025)*2.-1.;
  ex2=sign(ex2)*pow(abs(ex2),.72);
  h2x=pow(max(1.-ex2*ex2,0.),.62)*5.4;
  float lt=fract(n2*13.7);
  float lenP=.35+1.05*smoothstep(.12,.72,abs(ex2))
            *(1.-.55*smoothstep(.9,1.,abs(ex2)));       // 外三分之一最长，角部收短
  float ll=(up>.5?1.:.45)*lenP*(.7+.6*hsh(cl*77.));
  float lidY=up>.5?mix(-.5*h2x,h2x*(1.02-.14*ex2),bl):mix(-.52*h2x,-h2x,bl);
  vec2 dirL=normalize(vec2(ex2*.85,(up>.5?1.:-1.)*(1.25-.5*abs(ex2)))); // 角部横斜中段竖立
  float splay=(fract(n1*173.)-.5)*.30;
  vec2 tip=vec2(ex2*12.2,lidY)+dirL*lt*ll
          +vec2((splay+ex2*.45)*lt*lt*ll,(up>.5?.22:-.08)*lt*lt*ll);   // 梢部卷曲
  ep=vec3(tip,0.);
  ep.z+=.35*(1.-abs(ex2));
  eCol=vec3(.85,.16,.09)*(1.-lt*.55)*.8;        // 梢部变暗
  szf=.4;                                       // 细毛，不再成光刺
 }else if(n1<.56){
  float bnd=floor(n2*38.);
  float bh=hsh(bnd*13.7+seed);
  float ia=(bnd+.5)/38.*6.283+(fract(n1*397.)-.5)*.14;
  float t2=pow(fract(n1*29.7),.62);              // 外偏采样：纤维密度补到外圈
  float re=(11.4*5.)/max(length(vec2(5.*cos(ia),11.4*sin(ia))),.001);
  float reach=re*mix(.62,1.,hsh(bnd*7.1));       // 纤维一直探到睑缘
  float ir=mix(2.55,reach,t2)*(1.-.03*uBt);
  ia+=t2*t2*.5*(bh-.5)+t2*.12*sin(bnd*3.7);
  ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
  float crypt=step(.72,bh);
  float cry=smoothstep(.45,.95,sin(ia*5.+seed*20.)*sin(ia*3.-seed*13.))
           *exp(-pow((ir-2.9)/.9,2.));
  eCol=mix(vec3(1.,.26,.10),vec3(1.3,.6,.22),t2*.7)
      *mix(1.,.25,crypt)*(1.-.75*cry)*(.7+.6*fract(n1*211.));
  eCol*=1.-.35*smoothstep(.2,.9,sin(ia));
  eCol*=5.;                                     // 面密度配平：纤维区配额略降，增益补偿
  inr=1.;gz=1.;szf=.34;
 }else if(n1<.655){
  float ia=n2*6.283+(fract(n1*397.)-.5)*.2;
  float t2=pow(fract(n1*47.3),1.3);
  float ir=mix(1.15*pcon,2.9,t2);
  ia+=t2*.5*(fract(n1*89.)-.5);
  ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
  eCol=mix(vec3(1.12,.72,.52),vec3(1.3,.45,.2),t2)*2.6;   // 羽冠密，小幅提
  inr=1.;gz=1.;szf=.28;
 }else if(n1<.70){
  float ia=n2*6.283;
  float ir=2.7+.34*sin(ia*9.+seed*40.)+.2*sin(ia*17.+seed*9.)+fract(n1*61.)*.2;
  ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
  eCol=vec3(1.4,.62,.22)*3.;inr=1.;gz=1.;szf=.3;
 }else if(n1<.77){
  float ia=n2*6.283;
  float ir=1.55+.18*sin(ia*7.+seed*30.)+.12*sin(ia*13.+seed*11.)
          +.08*sin(ia*23.+seed*51.)+(fract(n1*151.)-.5)*.3;
  ep=vec3(cos(ia)*ir*pcon,sin(ia)*ir*pcon,0.);
  float brt=step(.6,fract(n1*77.7));
  eCol=mix(vec3(.4,.05,.03),vec3(1.12,.68,.45),brt)*2.;   // 瞳缘最密，少提
  inr=1.;gz=1.;szf=.28;
 }else if(n1<.81){
  float ia=n2*6.283;
  float re=(11.4*5.)/max(length(vec2(5.*cos(ia),11.4*sin(ia))),.001);
  float sub2=fract(n1*61.3);
  float ir=sub2<.55?mix(2.4,re*.96,fract(n1*43.7))   // 全域余烬尘
                   :mix(re*.72,re*.985,fract(n1*43.7)); // 睑内缘填充带：贴着眼睑铺一圈
  ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
  float cry=smoothstep(.45,.95,sin(ia*5.+seed*20.)*sin(ia*3.-seed*13.))
           *exp(-pow((ir-2.9)/.9,2.));
  eCol=mix(vec3(.42,.09,.05),vec3(.62,.17,.09),step(.55,sub2))
      *(1.-.35*smoothstep(.1,.9,sin(ia)))*(1.-.7*cry)*(.6+.8*fract(n1*211.));
  eCol*=6.;
  inr=1.;gz=1.;szf=.36;
 }else if(n1<.845){
  float ring=floor(fract(n1*7.77)*4.);
  float ia=n2*6.283;
  float rr0=mix(3.3,5.1,ring/3.)+.10*sin(ia*13.+ring*9.+seed*30.)
           +(fract(n1*171.)-.5)*.12;              // 收缩沟外移，覆盖过渡带
  ep=vec3(cos(ia)*rr0,sin(ia)*rr0,0.);
  eCol=vec3(.55,.10,.05)*(.55+.5*fract(n1*211.))*4.;
  inr=1.;gz=1.;szf=.3;
 }else if(n1<.87){
  float lft=step(.5,fract(n1*53.));
  float t2=pow(fract(n1*67.),1.4);
  vec2 cc=lft>.5?vec2(-12.1,-.35):vec2(12.1,.35);
  vec2 dir2=lft>.5?vec2(-1.,-.30):vec2(1.,.30);
  float ln=6.+fract(n1*29.)*8.;
  ep=vec3(cc+dir2*t2*ln+vec2(0.,t2*t2*(lft>.5?-.8:.8)),0.);
  ep.y+=(fract(n1*171.)-.5)*.22*(1.-t2);
  eCol=vec3(1.15,.4,.3)*(1.-t2*.85);
  szf=.3;
 }else if(n1<.915){
  float which=fract(n1*83.);
  vec2 hc;float hr;vec3 hcol;
  if(which<.5){hc=vec2(-1.9,1.9);hr=.5;hcol=vec3(1.18,1.1,1.05);}
  else if(which<.8){hc=vec2(2.3,-1.5);hr=.75;hcol=vec3(1.05,.95,1.);}
  else{float ba=-1.5708+(n2-.5)*1.5;hc=vec2(cos(ba),sin(ba))*3.9;hr=.28;
   hcol=vec3(1.45,.75,.35);}
  float ia=n2*6.283;
  ep=vec3(hc+vec2(cos(ia),sin(ia))*sqrt(fract(n1*97.))*hr,0.);
  eCol=hcol*.8;inr=1.;gz=.3;szf=.3;             // 高光最密，压到守恒
 }else if(n1<.955){
  float dr=fract(n1*131.);
  if(dr>.82){
   ep=vec3((fract(n1*37.)-.5)*1.6,
           .75-mod(fract(n1*53.)*2.4+uTm*.2,1.7),0.);
   eCol=vec3(.85,.5,.45)*2.;szf=.32;            // 瞳中雨丝
  }else{
   float ia=n2*6.283+uTm*.12*(fract(n1*71.)>.5?1.:-1.);
   float ir=1.38*pcon*sqrt(fract(n1*97.3));
   ep=vec3(cos(ia)*ir,sin(ia)*ir,0.);
   float glowB=smoothstep(-.2,-1.1,ep.y);
   eCol=mix(vec3(.14,.02,.03),vec3(.5,.12,.06),glowB)
       *(.75+.5*fract(n1*211.))*3.;             // 瞳孔涡旋可辨
   szf=.4;
  }
  inr=1.;gz=1.;
 }else{
  float ia=n2*6.283,ir=7.+fract(n1*23.7)*4.2;
  ep=vec3(cos(ia)*ir*1.7,sin(ia)*ir*.75,0.);
  eCol=vec3(.9,.2,.1)*1.5;szf=.5;               // 外围光晕
 }
 ep.xy+=gaze*gz;
 ep.xy+=vec2(sin(uTm*13.+n1*41.),cos(uTm*11.+n2*37.))*.02*(1.+uBt*2.);
 ep.z=(m1-.5)*.6+inr*(1.-min(dot(ep.xy,ep.xy)/30.25,1.))*1.5;
 eCol*=mix(1.,clamp(length(ep.xy)*.30,.45,1.),inr);  // 径向能量归一：半径越小叠加越多，按 1/r 压暗抗糊
 float hxP=pow(max(1.-pow(ep.x/12.2,2.),0.),.62)*5.4*(1.02-.14*ep.x/12.2);
 float upE=mix(-.5*hxP,hxP,bl);                      // 此刻上睑扫到的高度
 float loE=mix(-.52*hxP,-hxP,bl);
 eAv=mix(1.,smoothstep(upE-.05,upE-1.,ep.y)
        *smoothstep(loE+.05,loE+.85,ep.y),inr);      // 睑缘扫过之后才露出，瞳随睑同步
 return ep+vec3(0.,sin(uTm*.7)*.35,0.);
}`;

export const BFLY_PT=`
// 巨蝶采样 — 眼被吞灭后粒子按 (n1,n2,seed) 直接落位翅形（与 wingDJ 同组椭圆）
vec2 rotI(vec2 q,float a){float c=cos(a),s=sin(a);return vec2(c*q.x-s*q.y,s*q.x+c*q.y);}
float wingD2(vec2 p){
 vec2 u=rotI(p-vec2(.34,.15),-.55);float du=length(vec2(u.x/.42,u.y/.23))-1.;
 vec2 l=rotI(p-vec2(.23,-.16),.45);float dl=length(vec2(l.x/.30,l.y/.21))-1.;
 float ds=length(vec2((p.x-.15)/.045,(p.y+.36)/.17))-1.;
 return min(du,min(dl,ds));
}
vec3 bflyPt(float n1,float n2,float seed,float uTm,out float bk,out float bnd){
 float pk=fract(n1*17.31);
 float a=n2*6.283,r=sqrt(fract(seed*57.3));
 float edge=step(.90,fract(n1*997.));            // 翅缘占比22%→10%: 小蝶翅面不空心 与主蝶疏密一致
 vec2 o;bk=0.;
 if(pk<.40){                                     // 前翅
  r=mix(r,1.,edge);bk=edge;
  o=rotI(vec2(cos(a)*.42,sin(a)*.23)*r,.55)+vec2(.34,.15);
 }else if(pk<.70){                               // 后翅
  r=mix(r,1.,edge);bk=edge;
  o=rotI(vec2(cos(a)*.30,sin(a)*.21)*r,-.45)+vec2(.23,-.16);
 }else if(pk<.76){                               // 尾突
  o=vec2(cos(a)*.045,sin(a)*.17)*r+vec2(.15,-.36);bk=edge;
 }else if(pk<.87){                               // 翅脉
  float v=floor(fract(n1*7.77)*9.);
  float va=-1.05+v*.28;
  float tt=.05+fract(n2*13.7)*.88;
  o=vec2(.05+cos(va)*tt,.02+sin(va)*tt);bk=1.;
  o=mix(o,vec2(.05,.02)+(o-vec2(.05,.02))*.72,step(-.015,wingD2(o))); // 越界收回翅内
 }else if(pk<.96){                               // 蝶身
  o=vec2((fract(n2*7.7)-.5)*.05,-.18+fract(seed*11.3)*.32);bk=2.;
 }else{                                          // 触须
  float tt=fract(n2*5.3);
  o=vec2(.012+.085*tt+(fract(seed*31.7)-.5)*.01,.16+.15*tt);bk=2.;
 }
 o.x*=sign(fract(n1*313.7)-.5);                  // 左右对称
 bnd=length(o);                                  // 翅纹坐标（双蝶同款流光带）
 // 小蝶群 — 第 k 只的中心/朝向/振翅（粒子总数不变，仅重新归属）
 float bfk=floor(fract(n1*57.77)*180.);           // 90 只 — 单只粒子更少，防过曝
 float hk1=hsh(bfk*7.13),hk2=hsh(bfk*13.7),hk3=hsh(bfk*29.3);
 float orbR=4.+hk1*26.;
 float orbA=hk2*6.283+uTm*(.10+hk3*.14)*(hk2>.5?1.:-1.);
 vec3 ctrK=vec3(cos(orbA)*orbR,
   (hk3-.55)*24.+sin(uTm*(.5+hk1)+bfk)*1.5,sin(orbA)*orbR*.5+2.);  // 绕眼位盘旋漫飞
 float flapK=abs(sin(uTm*(3.2+hk1*2.5)+bfk*1.7))*1.15+.10;         // 各自快拍振翅
 float wx=abs(o.x);
 vec3 lp=vec3(sign(o.x)*wx*cos(flapK),wx*sin(flapK)*.9,-o.y);      // 平飞蝶姿
 lp+=.02*vec3(sin(uTm*(2.+seed*6.)+seed*40.),
   cos(uTm*(1.7+seed*5.)+n2*40.),sin(uTm*(2.3+n2*5.)+seed*30.));
 lp*=1.+hk2*1.2;                                 // 各只大小不一
 float ca=cos(hk1*6.283+uTm*(.2+hk3*.3)),sa=sin(hk1*6.283+uTm*(.2+hk3*.3));
 lp.xz=mat2(ca,-sa,sa,ca)*lp.xz;                 // 各自朝向缓转
 return ctrK+lp;
}`;

export const TORNADO_PT=`
// 龙卷风 — 被两只蝴蝶感染的眼粒脱离眼面，卷入绕眼轴上升的漩涡柱
//   ep : 眼面局部坐标（相对 uCtr）
//   age: 该粒子被感染后经过的秒数（感染波前扫过越久，卷得越深、转得越快）
//   返回：相对 uCtr 的漩涡偏移
vec3 tornadoPt(float n1,float n2,float seed,vec3 ep,float age,float uTm){
 float r0=length(ep.xy)+.001;                       // 眼面上的原始半径
 float a0=atan(ep.y,ep.x);                          // 原始方位角
 float t=clamp(age,0.,7.);
 float conv=smoothstep(0.,2.4,t)*.6;                // 只部分卷入，保留原始铺展，不过度聚集
 float hcol=(fract(seed*91.7)-.5)*28.;              // 沿漩涡柱的高度分布更开
 float y=mix(ep.y,hcol,conv)+t*2.2;                 // 卷入后整柱缓缓抬升
 float funnel=mix(5.,12.,smoothstep(-14.,14.,hcol));// 更宽的漏斗轮廓（松散不聚团）
 float rad=mix(r0,funnel,conv)*(1.+.16*sin(y*.5+uTm*3.+seed*20.));
 float ang=a0+t*(1.3+t*.32)+hcol*.10;               // 越转越快 + 沿高度扭转
 vec3 p=vec3(cos(ang)*rad,y,sin(ang)*rad*.85);      // z 向略压扁，朝镜头面铺开
 p+=conv*1.1*vec3(sin(uTm*2.4+seed*33.),cos(uTm*1.6+n1*20.)*.5,cos(uTm*2.0+seed*22.));
 return p;
}`;

export const GLSL_SIM_NOISE=`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
 const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
 vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
 vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
 i=mod289(i);
 vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))
   +i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
 float n_=1./7.;vec3 ns=n_*D.wyz-D.xzx;
 vec4 j=p-49.*floor(p*ns.z*ns.z);
 vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
 vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
 vec4 h=1.-abs(x)-abs(y);
 vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
 vec4 sh=-step(h,vec4(0.));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);
 vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
 vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
 m=m*m;
 return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float snoise4(vec4 q){                        // 4D: 时间维驱动的双相 simplex
 float a=snoise(q.xyz+vec3(0.,q.w*1.7,q.w*.9));
 float b=snoise(q.xyz*1.31+vec3(-q.w*1.1,17.3,q.w*.7));
 return mix(a,b,.5+.35*sin(q.w*.53));
}
vec3 curlN(vec3 p,float t){                   // curl 由偏导数差分构造
 float e=.35;
 float dy=snoise4(vec4(p+vec3(0.,e,0.),t))-snoise4(vec4(p-vec3(0.,e,0.),t));
 float dz=snoise4(vec4(p+vec3(0.,0.,e),t+11.))-snoise4(vec4(p-vec3(0.,0.,e),t+11.));
 float dx=snoise4(vec4(p+vec3(e,0.,0.),t+23.))-snoise4(vec4(p-vec3(e,0.,0.),t+23.));
 return vec3(dy-dz,dz-dx,dx-dy)/(2.*e);
}
vec3 vf(float id,vec3 q,float t){             // 30 种非线性矢量场
 vec3 p=q*.06;float s=sin(t*.3),c=cos(t*.3);
 if(id<.5)return vec3(sin(p.y+t),sin(p.z+t*.8),sin(p.x+t*.6));
 if(id<1.5)return vec3(-p.z,0.,p.x);
 if(id<2.5)return vec3(p.y,-p.x,sin(t))*.8;
 if(id<3.5)return vec3(sin(p.z*3.+t),cos(p.x*3.-t),sin(p.y*3.));
 if(id<4.5)return normalize(vec3(-p.x,-p.y,-p.z)+1e-4)*sin(t*.7)*2.;
 if(id<5.5)return vec3(p.x-p.y*p.z,p.y-p.x,p.z*.5-p.x*p.y)*.4;
 if(id<6.5)return vec3(sin(p.y*5.),sin(p.z*5.),sin(p.x*5.))*.9;
 if(id<7.5)return vec3(c*p.x-s*p.z,.3*sin(t+p.x),s*p.x+c*p.z)*.5;
 if(id<8.5)return vec3(0.,sin(p.x*4.+t*1.3),0.)*1.4;
 if(id<9.5)return vec3(sin(p.y+p.z+t),sin(p.z+p.x+t),sin(p.x+p.y+t));
 if(id<10.5)return vec3(-p.y,p.x,sin(p.z*4.+t))*.7;
 if(id<11.5)return vec3(sin(2.*p.y)*cos(p.z),sin(2.*p.z)*cos(p.x),sin(2.*p.x)*cos(p.y));
 if(id<12.5)return vec3(p.z*p.y,p.x*p.z,-2.*p.x*p.y)*.3;
 if(id<13.5)return vec3(sin(p.x*7.+t*2.),0.,cos(p.x*7.-t*2.))*.8;
 if(id<14.5)return vec3(1.,sin(t+p.z*3.),0.)*.9;
 if(id<15.5)return vec3(10.*(p.y-p.x),p.x*(2.8-p.z)-p.y,p.x*p.y-2.6*p.z)*.05;
 if(id<16.5)return vec3(-(p.y+p.z),p.x+.2*p.y,.2+p.z*(p.x-3.));
 if(id<17.5)return vec3(sin(p.y*9.),cos(p.x*9.),sin(t))*.6;
 if(id<18.5)return cross(vec3(0.,1.,0.),p)*.8+vec3(0.,sin(t),0.)*.4;
 if(id<19.5)return vec3(sin(p.z+5.*t*.2),sin(p.x),sin(p.y))*1.1;
 if(id<20.5)return vec3(p.y*p.z,-p.x*p.z,0.)*.5;
 if(id<21.5)return vec3(sin(3.*p.y+t),-sin(3.*p.x),cos(3.*p.z-t))*.85;
 if(id<22.5)return normalize(cross(p,vec3(1.,.5,.2))+1e-4)*.9;
 if(id<23.5)return vec3(sin(p.x+p.y*2.),sin(p.y+p.z*2.),sin(p.z+p.x*2.));
 if(id<24.5)return vec3(cos(p.y*6.)*s,sin(p.x*6.)*c,sin((p.x+p.y)*3.))*.7;
 if(id<25.5)return vec3(-p.x*.4+sin(p.z*2.),p.y*.2,-p.z*.4+cos(p.x*2.))*.8;
 if(id<26.5)return vec3(sin(p.y*4.)*cos(p.z*4.),0.,sin(p.x*4.))*1.;
 if(id<27.5)return vec3(p.z,-p.y*.3+sin(t),-p.x)*.7;
 if(id<28.5)return vec3(sin(p.x*2.+t*.9)*p.y,cos(p.y*2.)*p.z,sin(p.z*2.)*p.x)*.35;
 return vec3(sin(p.y-p.z+t*1.2),sin(p.z-p.x+t),sin(p.x-p.y+t*.8));
}
vec3 vfBlend(vec3 p,float t,float f1,float f2,float fm){
 return mix(vf(f1,p,t),vf(f2,p,t),fm);
}`;