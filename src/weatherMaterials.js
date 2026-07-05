export function createWeatherMaterials(THREE, scene, {groundH, chimneys, GLSL_NOISE}) {
/* ============================================================
   夏夜萤火 & 炊烟 — 苗寨段的生命感 (随副歌转场淡出)
============================================================ */
const fireU={uT:{value:0},uPx:{value:1},uAmt:{value:0},uAmt2:{value:0}};
{
 const NF=90,NF2=5;                              // 苗寨萤火 + 入夜竹林萤火(最多5只)
 const ps=new Float32Array((NF+NF2)*3),sd=new Float32Array((NF+NF2)*3),
       zn=new Float32Array(NF+NF2);
 for(let i=0;i<NF+NF2;i++){
  const vg=i<NF;
  const side=Math.random()<.5?-1:1;
  const x=side*(vg?3.8+Math.random()*8:4.2+Math.random()*9);
  const z=vg?24-Math.random()*80:-50-Math.random()*165;
  ps.set([x,groundH(x,z)+.4+Math.random()*(vg?2.2:2.8),z],i*3);
  sd.set([Math.random(),Math.random(),Math.random()],i*3);
  zn[i]=vg?0:1;
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(ps,3));
 g.setAttribute('aS',new THREE.BufferAttribute(sd,3));
 g.setAttribute('aZ',new THREE.BufferAttribute(zn,1));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:fireU,
  vertexShader:`
  attribute vec3 aS;attribute float aZ;
  uniform float uT,uPx,uAmt,uAmt2;
  varying float vA;
  void main(){
   vec3 w=position+vec3(sin(uT*(.30+aS.x*.5)+aS.y*40.)*1.2,
     sin(uT*(.23+aS.y*.4)+aS.z*30.)*.5,
     cos(uT*(.27+aS.z*.5)+aS.x*20.)*1.2);        // 游荡
   vec4 mv=viewMatrix*vec4(w,1.);
   float d=-mv.z;
   gl_PointSize=clamp(.07*uPx/max(d,.5),1.5,7.);
   float fl=pow(.5+.5*sin(uT*(1.1+aS.x*.8)+aS.y*50.),6.);  // 忽明忽暗
   vA=mix(uAmt,uAmt2,aZ)*fl*smoothstep(60.,25.,d)*smoothstep(.5,2.,d);
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA;
  void main(){
   vec2 q=gl_PointCoord-.5;float dd=length(q);
   float m=exp(-dd*dd*11.)*smoothstep(.5,.28,dd);
   gl_FragColor=vec4(vec3(.78,1.,.38)*m*vA,1.);  // 萤绿
  }`});
 const ff=new THREE.Points(g,m);
 ff.frustumCulled=false;scene.add(ff);
}
const smokeU={uT:{value:0},uPx:{value:1},uAmt:{value:0}};
{
 const PER=36,NS=chimneys.length/3*PER;
 const ps=new Float32Array(NS*3),sd=new Float32Array(NS*3);
 for(let c=0;c<chimneys.length/3;c++)for(let k=0;k<PER;k++){
  const i=c*PER+k;
  ps.set([chimneys[c*3],chimneys[c*3+1],chimneys[c*3+2]],i*3);
  sd.set([Math.random(),Math.random(),Math.random()],i*3);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(ps,3));
 g.setAttribute('aS',new THREE.BufferAttribute(sd,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:smokeU,
  vertexShader:`
  attribute vec3 aS;
  uniform float uT,uPx,uAmt;
  varying float vA;
  void main(){
   float t=fract(aS.x+uT*(.045+aS.y*.02));       // 循环上升
   vec3 w=position;
   w.y+=t*6.5;
   w.x+=t*t*2.4+sin(uT*.7+aS.z*20.+t*7.)*.3*t;   // 顺风歪斜+扭动
   w.z+=sin(uT*.5+aS.x*30.+t*5.)*.25*t;
   vec4 mv=viewMatrix*vec4(w,1.);
   float d=-mv.z;
   gl_PointSize=clamp((.25+t*1.2)*uPx/max(d,.5),2.,40.);
   vA=uAmt*(1.-t)*smoothstep(0.,.12,t)*.14*smoothstep(70.,25.,d);
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA;
  void main(){
   vec2 q=gl_PointCoord-.5;float dd=length(q);
   float m=exp(-dd*dd*7.);
   gl_FragColor=vec4(vec3(.38,.44,.52)*m*vA,1.); // 青烟
  }`});
 const sm=new THREE.Points(g,m);
 sm.frustumCulled=false;scene.add(sm);
}

/* ============================================================
   竹叶飘落 — 风起叶动 两侧竹冠簌簌而下 (随windV增密)
============================================================ */
const leafU={uT:{value:0},uPx:{value:1},uWind:{value:0},uAmt:{value:0},
 uCam:{value:new THREE.Vector3()}};
{
 const N=10,pp=new Float32Array(N*3),ap=new Float32Array(N*2),as=new Float32Array(N*4);
 for(let i=0;i<N;i++){
  const side=Math.random()<.5?-1:1;
  ap[i*2]=side*(2.2+Math.random()*6.0);            // 距路心横向
  ap[i*2+1]=Math.random()*80;                      // wrap-box z 相位
  as[i*4]=Math.random();as[i*4+1]=Math.random();   // 随机 / 下落相位
  as[i*4+2]=Math.random();as[i*4+3]=Math.random(); // 自旋 / 周期
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pp,3));
 g.setAttribute('aP',new THREE.BufferAttribute(ap,2));
 g.setAttribute('aS',new THREE.BufferAttribute(as,4));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:leafU,
  vertexShader:`
  attribute vec2 aP;attribute vec4 aS;
  uniform float uT,uPx,uWind,uAmt;uniform vec3 uCam;
  varying float vA;varying float vRot;
  void main(){
   float cyc=5.5+aS.w*4.;                          // 每片叶的下落周期
   float t=fract(uT/cyc+aS.y);
   float rz=mod(aP.y-uCam.z,80.);
   float z=uCam.z+10.-rz;                          // wrap-box 跟随相机
   float px=3.1+sin(z*.03)*1.3+sin(z*.011)*1.8;    // pathX — 贴着路两侧
   float x=px+aP.x
     +sin(uT*(1.2+aS.x)+aS.y*40.)*(.5+uWind*1.1)   // 摇曳
     +t*uWind*(1.5+2.5*aS.x);                      // 顺风斜飘
   float y=(7.5+aS.x*3.5)*(1.-t)-.3
     +sin(uT*(2.+aS.z*2.)+aS.x*30.)*.25;           // 荡着落
   vec4 mv=viewMatrix*vec4(x,y,z+sin(uT*.9+aS.z*20.)*.4*uWind,1.);
   float d=-mv.z;
   vRot=uT*(1.5+aS.z*2.5)+aS.y*40.;                // 叶片自旋
   gl_PointSize=clamp((.16+.10*aS.x)*uPx/max(d,.5),1.5,15.);
   vA=uAmt*smoothstep(0.,.10,t)*smoothstep(1.,.86,t)
     *smoothstep(55.,22.,d)*smoothstep(1.2,3.,d);
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA;varying float vRot;
  void main(){
   vec2 q=gl_PointCoord-.5;
   float c=cos(vRot),s=sin(vRot);
   q=mat2(c,-s,s,c)*q;                             // 旋转的细长叶形
   float m2=exp(-(q.x*q.x*6.+q.y*q.y*46.))*smoothstep(.5,.3,length(q));
   gl_FragColor=vec4(vec3(.34,.66,.32)*m2*vA,1.);  // 竹叶淡绿微光
  }`});
 const lf=new THREE.Points(g,m);
 lf.renderOrder=5;lf.frustumCulled=false;scene.add(lf);
}

/* ============================================================
   rain 雨 — line segments falling in a wrap-box around camera
============================================================ */
const RN=6000;
const rainU={uT:{value:0},uCam:{value:new THREE.Vector3()},uAmt:{value:.3},
 uWind:{value:.3},uNight:{value:0},uSpd:{value:1}};
{
 const seeds=new Float32Array(RN*2*3), ends=new Float32Array(RN*2);
 for(let i=0;i<RN;i++){
  const s=[Math.random(),Math.random(),Math.random()];
  for(let e=0;e<2;e++){
   seeds.set(s,(i*2+e)*3); ends[i*2+e]=e;
  }
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(RN*2*3),3));
 g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,3));
 g.setAttribute('aEnd',new THREE.BufferAttribute(ends,1));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:rainU,
  vertexShader:`
  attribute vec3 aSeed; attribute float aEnd;
  uniform float uT,uAmt,uWind,uSpd;
  uniform vec3 uCam;
  varying float vA;
  void main(){
   vec3 box=vec3(46.,20.,46.);
   vA=step(aSeed.z,uAmt)*(.10+.25*aSeed.x);
   vec3 base=aSeed*box;
   base.y=mod(base.y-uT*uSpd*(9.+aSeed.x*7.),box.y);
   vec3 rel=fract((base-uCam)/box)*box-box*.5;
   vec3 w=uCam+rel;
   float len=.35+aSeed.y*.35;
   if(aEnd>.5) w+=vec3(uWind*.8,-1.,0.)*len;
   float d=length(w-uCam);
   vA*=smoothstep(44.,20.,d);
   gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);
  }`,
  fragmentShader:`
  varying float vA;
  uniform float uNight;
  void main(){
   vec3 c=mix(vec3(.75,.85,.75),vec3(.62,.74,.78),uNight);
   gl_FragColor=vec4(c*vA,1.);
  }`});
 const rainObj=new THREE.LineSegments(g,m);
 rainObj.frustumCulled=false; scene.add(rainObj);
}

/* ============================================================
   splashes 溅雨 — droplets bouncing off the ground & river
============================================================ */
const SPN=2600;
const splashU={uT:{value:0},uCam:{value:new THREE.Vector3()},uAmt:{value:.3},
 uNight:{value:0},uPx:{value:1}};
{
 const seeds=new Float32Array(SPN*3);
 for(let i=0;i<SPN;i++)seeds.set([Math.random(),Math.random(),Math.random()],i*3);
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(SPN*3),3));
 g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:splashU,
  vertexShader:GLSL_NOISE+`
  attribute vec3 aSeed;
  uniform float uT,uAmt,uPx;
  uniform vec3 uCam;
  varying float vA;
  float gH(vec2 xz){                       // exact JS groundH replica
   float n=noiseg(xz*.15)*1.4+noiseg(xz*.05)*3.2;
   float valley=pow(abs(xz.x)/15.,2.)*7.;
   float river=-1.7*exp(-(xz.x*xz.x)/6.5);
   return n*.55+valley+river;
  }
  void main(){
   float B=34.;
   vec2 base=aSeed.xy*B;
   vec2 rel=fract((base-uCam.xz)/B)*B-B*.5;
   vec2 xz=uCam.xz+rel;
   float y0=max(gH(xz),-0.37);             // river surface caps the bed
   float rate=1.1+aSeed.z*1.5;
   float ph=fract(uT*rate+aSeed.z*13.7+aSeed.x*7.3);
   float hgt=.10+aSeed.y*.24;
   float y=y0+hgt*4.*ph*(1.-ph);           // ballistic hop 跳起
   xz+=vec2(aSeed.z-.5,aSeed.x-.5)*ph*.22; // kicks slightly sideways
   vec3 w=vec3(xz.x,y,xz.y);
   vec4 mv=viewMatrix*vec4(w,1.);
   float d=-mv.z;
   float gate=step(fract(aSeed.z*7.13+aSeed.y*3.71),uAmt);
   vA=gate*(1.-ph)*.85*smoothstep(24.,9.,d)*smoothstep(.4,1.5,d);
   gl_PointSize=min((.035+aSeed.y*.03)*(1.-ph*.5)*uPx/max(d,.5),14.);
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA;
  uniform float uNight;
  void main(){
   vec2 q=gl_PointCoord-.5;
   float m=exp(-dot(q,q)*14.)*smoothstep(.5,.3,length(q));
   vec3 c=mix(vec3(.8,.9,.82),vec3(.65,.8,.82),uNight);
   gl_FragColor=vec4(c*m*vA,1.);
  }`});
 const sp=new THREE.Points(g,m);
 sp.frustumCulled=false; scene.add(sp);
}

/* ============================================================
   mist & dust 雾团银尘
============================================================ */
const MN=2600;
const mistU={uT:{value:0},uCam:{value:new THREE.Vector3()},uNight:{value:0},
 uHigh:{value:0},uPx:{value:1},uDing:{value:0},uLow:{value:0}}; // uLow=开场「夏夜低沉的云雾」
{
 const seeds=new Float32Array(MN*3),kinds=new Float32Array(MN);
 for(let i=0;i<MN;i++){
  seeds.set([Math.random(),Math.random(),Math.random()],i*3);
  kinds[i]=Math.random()<.18?1:0;   // 18% big mist, rest dust
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(MN*3),3));
 g.setAttribute('aSeed',new THREE.BufferAttribute(seeds,3));
 g.setAttribute('aKind',new THREE.BufferAttribute(kinds,1));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
  blending:THREE.AdditiveBlending,uniforms:mistU,
  vertexShader:`
  attribute vec3 aSeed; attribute float aKind;
  uniform float uT,uPx,uLow;
  uniform vec3 uCam;
  varying float vA; varying float vK;
  void main(){
   vK=aKind;
   vec3 box=vec3(55.,22.,55.);
   vec3 base=aSeed*box+vec3(uT*(.15+aSeed.x*.2),sin(uT*.1+aSeed.y*7.)*1.2,0.);
   vec3 rel=fract((base-uCam)/box)*box-box*.5;
   vec3 w=uCam+rel;
   w.y-=uLow*aKind*max(w.y-uCam.y+2.2,0.)*.6;      // 开场: 云雾压低到视线 首句唱出时缓缓抬起
   vec4 mv=viewMatrix*vec4(w,1.);
   float d=-mv.z;
   float sz=mix(.09,3.8,aKind)*(0.6+aSeed.z*.8)*(1.+uLow*aKind*1.2); // world-size: dust ~9cm, mist ~4m
   gl_PointSize=sz*uPx/max(d,.5);
   float tw=.5+.5*sin(uT*(2.+aSeed.x*4.)+aSeed.y*40.);
   vA=mix(.5*tw,.045,aKind)*smoothstep(50.,25.,d)*smoothstep(.4,3.,d);
   vA*=1.+uLow*aKind*1.0;                          // 低垂时云雾更浓
   gl_Position=projectionMatrix*mv;
  }`,
  fragmentShader:`
  varying float vA; varying float vK;
  uniform float uNight,uHigh,uDing;
  void main(){
   vec2 q=gl_PointCoord-.5;
   float m=exp(-dot(q,q)*12.)*smoothstep(.5,.3,length(q));
   vec3 c=mix(vec3(.85,.93,.9),vec3(.55,.75,.65),vK);
   gl_FragColor=vec4(c*m*vA*(vK>.5?1.:(.4+.6*uHigh+uDing*.9)),1.);  // 银尘应和铃声
  }`});
 const mistObj=new THREE.Points(g,m);
 mistObj.frustumCulled=false; scene.add(mistObj);
}

 return {fireU, smokeU, leafU, rainU, splashU, mistU};
}
