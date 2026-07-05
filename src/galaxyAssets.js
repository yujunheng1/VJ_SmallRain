/* ============================================================
   银河 galaxy — 终章：巨眼被感染尽、天光消散之后，星尘自眼处
   喷涌升空，旋卷成一座粒子星河（蝶化星河）。
   构建法参考经典螺旋星系粒子生成（Three.js Journey / Bruno Simon）：
     branches 旋臂 + spin 缠绕 + randomnessPower 幂次散布(向臂心聚拢) +
     inside→outside 颜色插值(暖金核 → 蓝旋臂)。
   在此之上分层种群：
     · 盘/旋臂 90 万粒（恒星色温抖动：红巨星/蓝白年轻星/黄矮星）
     · 核球 16 万粒高斯椭球（暖白金，最先凝聚点亮）
     · 星晕 4 万粒球状稀疏冷星（给星系厚度）
     · 星云 HII 区/OB 星团 —— 沿臂大号软光斑
     · 核心辉光 billboard（冒充中心泛光）
     · 潭面倒影通道（与蝶/眼同一套 y=-0.70 镜像 + 水带裁剪）
   形成动画（uForm 0→1）——云散渐显：
     · 星河早已在天幕就位，被云层遮蔽；
     · uForm 推进 = 云层消散：云薄处的星先透出，云厚处最后；
     · 初透薄云时微泛青白柔光，散尽后现出本色；
     · 全程无飞行/自旋成形，双星(蝶化)最后显现与蝶影升天交接。
   素材库模块：index.html 调 createGalaxyAssets 装配，主循环驱动
   galaxyU.uT / uApp / uForm / uMirA / uPx。
============================================================ */
export function createGalaxyAssets(THREE, scene, {
  center = new THREE.Vector3(0, 320, -480),  // 挂在天幕(跟随镜头)上：远退成夜空背景的一部分
  radius = 190,                              // 距离~577 → 视直径~37°，是天空里的星河而非扑面星系
  countDisk = 900000,                        // 盘/旋臂 海量星点
  countBulge = 160000,                       // 核球
  countHalo = 40000,                         // 星晕
  countNeb = 4500,                           // 星云光斑
  branches = 4,
  spinTurns = 1.15,                          // 旋臂缠绕圈数
  randomness = 0.24,
  randomnessPower = 2.6,                      // 幂次越高越贴臂(2.6→臂更宽 臂间有散星)
  insideColor = 0xffb060,                    // 暖金核
  outsideColor = 0x2f8fff,                   // 青蓝旋臂(偏青 避免中段全紫)
  tiltX = 1.28, tiltZ = 0.22,                // 盘面倾斜，朝终章仰视镜头
} = {}) {
  const galaxyU = {
    uT: { value: 0 }, uApp: { value: 0 }, uPx: { value: 1 }, uSize: { value: 1 },
    uForm: { value: 0 },                             // 云散进度 0→1
    uMirA: { value: 0 },                             // 有水才有倒影
  };

  const N = countDisk + countBulge + countHalo + 2;  // +2 = 双星入河(青蝶×泪蝶化作的并肩亮星)
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);   // 已乘入亮度
  const aSize = new Float32Array(N);
  const aRnd = new Float32Array(N);
  const aSpk = new Float32Array(N);         // 亮星星芒标记

  const cIn = new THREE.Color(insideColor), cOut = new THREE.Color(outsideColor);
  const col = new THREE.Color();
  const R = Math.random;
  const g3 = () => (R() + R() + R() - 1.5) / 1.5;    // 近似高斯 σ≈0.33
  const spin = spinTurns * Math.PI * 2 / radius;     // spinAngle = r * spin

  let i = 0;
  /* —— 盘/旋臂 —— */
  for (let n = 0; n < countDisk; n++, i++) {
    const r = Math.pow(R(), 0.5) * radius;          // sqrt → 面密度更均、核心不过挤
    const branchAngle = (i % branches) / branches * Math.PI * 2 + (R() - .5) * .22; // 臂角微扰 破完美对称
    const spinAngle = r * spin;

    const rx = Math.pow(R(), randomnessPower) * (R() < .5 ? 1 : -1) * randomness * r;
    const ry = Math.pow(R(), randomnessPower) * (R() < .5 ? 1 : -1) * randomness * r * 0.32; // 薄盘
    const rz = Math.pow(R(), randomnessPower) * (R() < .5 ? 1 : -1) * randomness * r;

    positions[i * 3]     = Math.cos(branchAngle + spinAngle) * r + rx;
    positions[i * 3 + 1] = ry;
    positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

    const t = r / radius;
    col.copy(cIn).lerp(cOut, t);
    // 恒星色温抖动：少量红巨星 / 臂上蓝白年轻星 / 偏黄矮星
    const tp = R();
    let szMul = 1, brMul = 1;
    if (tp < .05) { col.setRGB(1, .42 + R() * .15, .18 + R() * .1); szMul = 1.8; brMul = 1.5; }
    else if (tp < .22 && t > .3) col.lerp(new THREE.Color(.62, .74, 1), .55);
    else if (tp < .30) col.lerp(new THREE.Color(1, .9, .66), .4);
    // 能量：核心增益压平(1.4) + 整体压暗 —— 背景星河 臂蓝核金不过曝
    let bright = (Math.pow(1 - t, 1.6) * 1.4 + 0.22) * (0.5 + R() * 1.1) * 0.1 * brMul;
    aSize[i] = (0.12 + Math.pow(1 - t, 2.2) * 0.5) * (0.6 + R() * 1.0) * szMul;
    if (R() < .005) {                                // ~0.5% 亮星：放大+星芒
      aSpk[i] = 1; aSize[i] = 1.8 + R() * 1.6; bright = Math.max(bright, .3) * 1.1;
    }
    colors[i * 3] = col.r * bright; colors[i * 3 + 1] = col.g * bright; colors[i * 3 + 2] = col.b * bright;
    aRnd[i] = R();
  }
  /* —— 核球：高斯椭球 暖白金 —— */
  for (let n = 0; n < countBulge; n++, i++) {
    positions[i * 3]     = g3() * radius * 0.17;
    positions[i * 3 + 1] = g3() * radius * 0.075;
    positions[i * 3 + 2] = g3() * radius * 0.17;
    col.setRGB(1, .78 + R() * .16, .5 + R() * .22);
    let bright = (1.2 + R() * 1.6) * 0.07;           // 核球压暗 免与核辉光叠成白洞
    aSize[i] = 0.16 + R() * 0.5;
    if (R() < .004) { aSpk[i] = 1; aSize[i] = 1.8 + R() * 1.6; bright = Math.max(bright, .3) * 1.1; }
    colors[i * 3] = col.r * bright; colors[i * 3 + 1] = col.g * bright; colors[i * 3 + 2] = col.b * bright;
    aRnd[i] = R();
  }
  /* —— 星晕：稀疏球状冷星 给厚度 —— */
  for (let n = 0; n < countHalo; n++, i++) {
    const rr = Math.pow(R(), 1.8) * radius * 1.25 + radius * 0.08;
    const u = R() * 2 - 1, ph = R() * 6.283, s = Math.sqrt(Math.max(1 - u * u, 0));
    positions[i * 3]     = Math.cos(ph) * s * rr;
    positions[i * 3 + 1] = u * rr * 0.8;             // 略扁
    positions[i * 3 + 2] = Math.sin(ph) * s * rr;
    col.setRGB(.68 + R() * .12, .78 + R() * .1, 1);
    const bright = 0.06 + R() * 0.16;
    colors[i * 3] = col.r * bright; colors[i * 3 + 1] = col.g * bright; colors[i * 3 + 2] = col.b * bright;
    aSize[i] = 0.1 + R() * 0.24;
    aRnd[i] = R();
  }
  /* —— 双星入河：两只主角蝶化作内臂上并肩的两颗星芒亮星 ——
     aRnd≈1 → 云散末段(约165s后)才透出，与蝶影升天交接 */
  const duo = [[.5, .98, .92, 2.2], [1.15, .95, 1.05, 2.0]];  // 青蝶 × 泪蝶(冰白微粉)
  for (let n = 0; n < 2; n++, i++) {
    const rD = radius * 0.42, aD = 1.1 + rD * spin;
    positions[i * 3]     = Math.cos(aD) * rD + n * 5.8;
    positions[i * 3 + 1] = 1.1;
    positions[i * 3 + 2] = Math.sin(aD) * rD + n * 2.4;
    colors[i * 3] = duo[n][0] * duo[n][3]; colors[i * 3 + 1] = duo[n][1] * duo[n][3];
    colors[i * 3 + 2] = duo[n][2] * duo[n][3];
    aSize[i] = 4.6; aSpk[i] = 1;
    aRnd[i] = 0.94 + n * 0.05;                       // 相位最晚: 云散尽时双星并肩显现
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aCol', new THREE.BufferAttribute(colors, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  g.setAttribute('aRnd', new THREE.BufferAttribute(aRnd, 1));
  g.setAttribute('aSpk', new THREE.BufferAttribute(aSpk, 1));

  /* 恒星材质 —— mirror=true 为潭面倒影通道（y=-0.70 镜像 + 水带裁剪） */
  const mkStar = mirror => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: mirror, fog: false,
    blending: THREE.AdditiveBlending, uniforms: galaxyU,
    vertexShader: `
    attribute vec3 aCol; attribute float aSize; attribute float aRnd;
    attribute float aSpk;
    uniform float uT, uApp, uPx, uSize, uForm, uMirA;
    varying vec3 vC; varying float vB; varying float vSpk;
    void main(){
     vec3 pos=position;
     float r=length(pos.xz);
     float a=atan(pos.z,pos.x)+uT*(0.016+0.5/(r+14.));      // 差速缓转：内快外慢
     pos.xz=vec2(cos(a),sin(a))*r;
     vec3 p=(modelMatrix*vec4(pos,1.)).xyz;                 // 星河早已就位（世界系）
     ${mirror ? 'p.y=-0.70-p.y;' : ''}
     // 云散渐显 — 大尺度云斑厚度场：云薄处星先透出 云厚处最后（用未旋的本位取样 保持云斑稳定）
     float cloud=sin(position.x*.041+1.7)*sin(position.z*.047+.6)
                +sin((position.x+position.z)*.021+3.1)
                +sin(position.x*.012-position.z*.016+5.);   // ≈[-3,3] 平滑云层厚度
     float ph=clamp(cloud*.13+.38,0.,.62)+aRnd*.08;         // 每星显现相位 ≤.70
     float fe=smoothstep(ph,ph+.3,uForm);                   // 云隙一片片扩开 星徐徐透出
     vec4 mv=viewMatrix*vec4(p,1.);
     float d=max(-mv.z,1.);
     float tw=0.72+0.28*sin(uT*2.3+aRnd*51.);               // 星点微闪
     gl_PointSize=clamp(aSize*uSize*uPx/d,1.0,mix(6.,15.,aSpk));
     vC=aCol;
     vC=mix(vC*vec3(.85,.92,1.15),vC,fe);                   // 初透薄云时微泛青白 散尽现本色
     vB=uApp*tw*fe;
     vSpk=aSpk;
     ${mirror ? 'vB*=smoothstep(5.4,4.5,abs(p.x))*.35*uMirA;' : ''}
     gl_Position=projectionMatrix*mv;
    }`,
    fragmentShader: `
    varying vec3 vC; varying float vB; varying float vSpk;
    void main(){
     vec2 q=gl_PointCoord-.5; float dd=length(q);
     float m=exp(-dd*dd*10.)*smoothstep(.5,.16,dd);
     float cr=(exp(-abs(q.x)*26.)+exp(-abs(q.y)*26.))*exp(-dd*4.)*vSpk; // 四芒衍射星芒
     gl_FragColor=vec4(vC*(m+cr*.85)*vB,1.);
    }`,
  });

  /* —— 星云：沿臂大号软光斑（粉 HII 区 + 臂缘蓝白 OB 星团 + 青绿反射云） —— */
  const nPos = new Float32Array(countNeb * 3);
  const nCol = new Float32Array(countNeb * 3);
  const nSize = new Float32Array(countNeb);
  const nRnd = new Float32Array(countNeb);
  for (let n = 0; n < countNeb; n++) {
    const r = (0.22 + 0.72 * R()) * radius;
    const branchAngle = (n % branches) / branches * Math.PI * 2;
    const spinAngle = r * spin;
    nPos[n * 3]     = Math.cos(branchAngle + spinAngle) * r + g3() * randomness * r * 0.5;
    nPos[n * 3 + 1] = g3() * randomness * r * 0.14;
    nPos[n * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + g3() * randomness * r * 0.5;
    const tp = R(), t = r / radius;
    if (tp < .45)      col.setRGB(1, .32 + R() * .12, .5 + R() * .12);   // 粉 HII
    else if (tp < .8)  col.setRGB(.4 + R() * .1, .6 + R() * .12, 1);     // 蓝白 OB
    else               col.setRGB(.4, .85 + R() * .1, .8 + R() * .1);    // 青绿
    const bright = 0.055 + R() * 0.045;                                  // 低亮叠加成气 略提让粉/蓝气斑可读
    nCol[n * 3] = col.r * bright; nCol[n * 3 + 1] = col.g * bright; nCol[n * 3 + 2] = col.b * bright;
    nSize[n] = 7 + R() * 16;
    nRnd[n] = R();
  }
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  ng.setAttribute('aCol', new THREE.BufferAttribute(nCol, 3));
  ng.setAttribute('aSize', new THREE.BufferAttribute(nSize, 1));
  ng.setAttribute('aRnd', new THREE.BufferAttribute(nRnd, 1));
  const nm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, fog: false,
    blending: THREE.AdditiveBlending, uniforms: galaxyU,
    vertexShader: `
    attribute vec3 aCol; attribute float aSize; attribute float aRnd;
    uniform float uT, uApp, uPx, uSize, uForm;
    varying vec3 vC; varying float vB;
    void main(){
     vec3 pos=position;
     float r=length(pos.xz);
     float a=atan(pos.z,pos.x)+uT*(0.016+0.5/(r+14.));
     pos.xz=vec2(cos(a),sin(a))*r;
     vec3 p=(modelMatrix*vec4(pos,1.)).xyz;
     // 云散渐显 — 与恒星同一云斑场 相位略晚(气斑在星后浮现)
     float cloud=sin(position.x*.041+1.7)*sin(position.z*.047+.6)
                +sin((position.x+position.z)*.021+3.1)
                +sin(position.x*.012-position.z*.016+5.);
     float ph=clamp(cloud*.13+.44,0.,.66)+aRnd*.06;
     float fe=smoothstep(ph,ph+.3,uForm);
     vec4 mv=viewMatrix*vec4(p,1.);
     float d=max(-mv.z,1.);
     float tw=0.8+0.2*sin(uT*.7+aRnd*23.);                  // 气云慢脉动
     gl_PointSize=clamp(aSize*uSize*uPx/d,2.0,110.0);
     vC=aCol; vB=uApp*tw*fe;
     gl_Position=projectionMatrix*mv;
    }`,
    fragmentShader: `
    varying vec3 vC; varying float vB;
    void main(){
     vec2 q=gl_PointCoord-.5; float dd=length(q);
     float m=exp(-dd*dd*6.)*smoothstep(.5,.02,dd);
     gl_FragColor=vec4(vC*m*vB,1.);
    }`,
  });

  /* —— 核心辉光：相机朝向 billboard 冒充中心泛光 —— */
  const gm = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, fog: false,
    blending: THREE.AdditiveBlending, uniforms: galaxyU,
    vertexShader: `
    uniform float uPx;
    varying vec2 vQ;
    void main(){
     vQ=position.xy*2.;
     vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.);            // 只取核心点 面片贴屏
     mv.xy+=position.xy*95.;
     gl_Position=projectionMatrix*mv;
    }`,
    fragmentShader: `
    uniform float uT, uApp, uForm;
    varying vec2 vQ;
    void main(){
     float d=length(vQ);
     float g=exp(-d*d*4.5)*.12+exp(-d*d*1.4)*.022;          // 核辉光压暗 暖金核不烧白
     float k=smoothstep(.3,.75,uForm)*uApp*(.85+.15*sin(uT*1.7)); // 核辉光随云散中段浮现
     gl_FragColor=vec4(vec3(1.,.8,.55)*g*k,1.);
    }`,
  });

  const galaxy = new THREE.Group();
  galaxy.position.copy(center);
  galaxy.rotation.set(tiltX, 0, tiltZ);   // 盘面倾斜面向镜头
  galaxy.visible = false;                  // 终章前不进渲染

  const stars = new THREE.Points(g, mkStar(false));
  stars.renderOrder = 1; stars.frustumCulled = false;      // 天幕背景层
  galaxy.add(stars);
  const starsMir = new THREE.Points(g, mkStar(true));      // 潭中星河
  starsMir.renderOrder = 7; starsMir.frustumCulled = false;
  galaxy.add(starsMir);
  const neb = new THREE.Points(ng, nm);
  neb.renderOrder = 1; neb.frustumCulled = false;
  galaxy.add(neb);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), gm);
  glow.renderOrder = 1; glow.frustumCulled = false;
  galaxy.add(glow);

  scene.add(galaxy);

  return { galaxyU, galaxy };
}
