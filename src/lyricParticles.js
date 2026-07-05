/* 意境成字方式 — 每种 style 提供:
   stagger: 粒子错峰起步(dl)   flight: 飞行段 GLSL, 需写出
     p    飞行位置(落定前)     fcol 飞行时粒子颜色
     glow 飞行时亮度系数       psz  飞行时附加点径
   可用: position(字位) from(上一句散点) dir(随机方向) aSeed fp(0→1成形进度) b1=sin(fp·π) uT cv(唱到落定) */
const STYLES = {
  firefly: {   // 萤火盘旋 — 萤群自四方游来 绕句心公转 唱到才落定
    stagger: 'aSeed.y*.55',
    flight: `
    vec3 wait=position+dir*(1.1+2.0*aSeed.z)+vec3(0.,.6+.9*aSeed.y,0.); // 等待位:字位上方散开悬浮
    float lead=step(.85,aSeed.z);                         // ~15% 领头萤火虫 大而亮
    float th=uT*(1.0+.8*aSeed.z)+aSeed.x*1.2;             // 群体旋涡:速度微差→星系剪切
    float cs=cos(th),sn=sin(th);
    vec3 wp=wait;
    wp.xy=mat2(cs,-sn,sn,cs)*wp.xy;                       // 等待点绕句心公转
    p=mix(from,wp,fp);                                    // 萤火飞向旋涡
    p+=vec3(sin(fp*6.283*(.35+.6*aSeed.x)+aSeed.x*40.),
            sin(fp*6.283*(.3+.5*aSeed.y)+aSeed.y*40.)*.85,
            cos(fp*6.283*(.35+.6*aSeed.z)+aSeed.z*40.))
       *b1*(1.6+2.2*aSeed.y)*(1.+lead*.8);                // 萤火游曳大弧线
    float blink=pow(.5+.5*sin(uT*(1.6+2.6*aSeed.x)+aSeed.z*40.),3.); // 萤火明灭
    fcol=vec3(.82,1.,.38)*(.8+.9*blink);                  // 黄绿萤光
    glow=(.05+.45*blink)*fp*mix(.3,2.2,lead);             // 领头萤明亮 余者作萤尘
    psz=.3+.7*blink+lead*(1.2+1.2*blink);`
  },
  rain: {      // 雨落成字 — 雨丝自高天坠落 每滴落进自己的笔画 触地溅起微光
    stagger: 'aSeed.y*.72',
    flight: `
    float fall=fp*fp;                                     // 重力加速
    vec3 sky=position+vec3((aSeed.x-.5)*1.6,4.5+7.5*aSeed.y,(aSeed.z-.5)*.8);
    vec3 dp=mix(sky,position,fall);
    dp.x+=sin(uT*.7+aSeed.z*9.)*.22*(1.-fall);            // 风中微斜
    p=mix(from,dp,smoothstep(0.,.22,fp));                 // 自上一句散点汇入雨幕
    float land=smoothstep(.92,1.,fp);                     // 落地瞬间
    p.y+=land*sin(min((fp-.92)*12.5,1.)*3.1415926)*.18;   // 触地轻弹
    fcol=mix(vec3(.62,.78,1.),vec3(.9,.97,1.),aSeed.z);   // 雨光青白
    glow=(.25+.55*fp)*(1.+land*1.6);                      // 落定时溅亮
    psz=.25+.5*aSeed.y+land*1.4;`
  },
  thunder: {   // 雷落成字 — 电弧在字位上空聚成折线 骤然劈下 电痕明灭至唱到凝定
    stagger: 'aSeed.y*.3',
    flight: `
    float wv=floor(aSeed.y*4.);                           // 四道先后劈落的雷
    float snap=smoothstep(.5+wv*.1,.62+wv*.1,fp);         // 各波骤落
    vec3 arc=position+vec3(0.,(3.5+5.*aSeed.y)*(1.-snap),0.);
    arc.x+=sin(arc.y*3.1+aSeed.x*20.)*.35*(1.-snap);      // 电弧折线
    arc.x+=(step(.5,fract(uT*16.+aSeed.z*7.))-.5)*.3*(1.-snap); // 电弧高频抖动
    p=mix(from,arc,smoothstep(0.,.3,fp));
    float flash=pow(.5+.5*sin(uT*22.+aSeed.x*30.),4.);    // 电闪明灭
    fcol=mix(vec3(.72,.55,1.),vec3(1.05,1.,1.25),flash);  // 紫电白芯
    glow=(.15+.85*flash)*fp*(1.+snap*1.2);
    psz=.3+.9*flash+snap*.8;`
  },
  mist: {      // 雾凝成字 — 一团弥散的雾气氤氲漂移 缓缓收拢 字自雾中显形
    stagger: 'aSeed.y*.25',
    flight: `
    vec3 fog=position+dir*(2.5+3.5*aSeed.y)*(1.-fp*fp);   // 大团雾缓慢收拢
    fog+=vec3(sin(uT*.5+aSeed.x*17.),sin(uT*.4+aSeed.y*15.)*.7,sin(uT*.6+aSeed.z*13.))
         *.45*(1.-fp*.7);                                 // 雾气氤氲漂移
    p=mix(from,fog,smoothstep(0.,.4,fp));
    fcol=mix(vec3(.62,.86,.74),vec3(.85,1.,.92),aSeed.x); // 雾青
    glow=.18+.5*fp;                                       // 由淡入浓
    psz=1.6*(1.-fp)+.3;`                                  // 雾大而虚 凝时收小
  },
  water: {     // 水中浮起 — 粒子似沉在水底 随流摇曳上浮 荡着水光停在字位
    stagger: 'aSeed.y*.5',
    flight: `
    vec3 sink=position+vec3(0.,-(2.5+4.*aSeed.y)*(1.-fp),0.);
    sink.x+=sin(uT*1.1+position.y*1.5+aSeed.x*8.)*.3*(1.-fp*.5); // 水流左右荡
    sink.y+=sin(uT*1.6+aSeed.z*11.)*.15*(1.-fp*.6);       // 上下浮沉
    p=mix(from,sink,smoothstep(0.,.3,fp));
    float shimmer=.5+.5*sin(uT*2.2+position.x*3.+aSeed.y*9.); // 水光潋滟
    fcol=mix(vec3(.3,.5,.95),vec3(.6,.85,1.),shimmer);
    glow=(.2+.4*fp)*(.6+.6*shimmer);
    psz=.3+.6*shimmer;`
  },
  ember: {     // 火星灼烙 — 灼热的星火自下方翻卷升腾 烙进笔画 余温明灭
    stagger: 'aSeed.y*.6',
    flight: `
    vec3 rise=position+vec3(sin(uT*2.5+aSeed.x*25.)*.4*(1.-fp),
                            -(3.+5.*aSeed.y)*(1.-fp)*(1.-fp),0.);
    rise.x+=sin(fp*9.+aSeed.z*20.)*.3*b1;                 // 上升途中翻卷
    p=mix(from,rise,smoothstep(0.,.25,fp));
    float hot=pow(.5+.5*sin(uT*7.+aSeed.x*33.),2.);       // 火星明灭
    fcol=mix(vec3(1.,.32,.1),vec3(1.1,.85,.4),hot);       // 炭红→金白
    glow=(.3+.7*hot)*fp;
    psz=.35+.8*hot;`
  },
  wind: {      // 风拂成字 — 粒子如叶絮自两侧乘风掠入 打着旋落定
    stagger: 'aSeed.x*.55',
    flight: `
    float side=step(.5,aSeed.z)*2.-1.;                    // 两侧来风
    vec3 gust=position+vec3(side*(5.+6.*aSeed.y)*(1.-fp),
          sin(fp*6.283+aSeed.x*12.)*(1.-fp)*(1.2+aSeed.z),
          (aSeed.z-.5)*2.*(1.-fp));
    gust.y+=sin(uT*1.3+aSeed.y*10.)*.2*(1.-fp*.7);        // 风中起伏
    p=mix(from,gust,smoothstep(0.,.2,fp));
    fcol=mix(vec3(.75,.95,.8),vec3(.95,1.,.9),aSeed.y);   // 叶絮青白
    glow=.2+.5*fp+.3*b1;
    psz=.3+.5*aSeed.x+.6*b1;`
  }
};

export function createLyricParticleLine(THREE, {
  line,
  fin = false,
  prevPoints = null,
  density = 2,
  colors = ['#c8deff', '#9db8e8'],   // 字面双色渐变（上→下）
  accent = '#b8d0ff',                // 爆散/微光的意境辉光色
  special = null,                    // {chars,color}: 指定字符用指定颜色
  style = 'firefly'                  // 意境成字方式（见 STYLES）
}) {
  const cols = line.split(' ');
  const maxN = Math.max(...cols.map(s => s.length));
  const CW = 105, CH = 95;
  const cv = document.createElement('canvas');
  cv.width = CW * cols.length;
  cv.height = CH * maxN;

  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const cA = hex(colors[0]), cB = hex(colors[1] || colors[0]);

  const c2 = cv.getContext('2d');
  c2.font = '75px KaiTi,STKaiti,"Noto Serif SC",serif';
  c2.textAlign = 'center';
  c2.textBaseline = 'middle';
  cols.forEach((s, ci) => {
    const x = CW * (cols.length - ci) - CW / 2;
    for (let k = 0; k < s.length; k++) {
      let r, g, b, a;
      if (special && special.chars.includes(s[k])) {
        [r, g, b] = hex(special.color);
        a = 0.88 + Math.random() * 0.12;
      } else {
        const t = Math.min(Math.max(k / Math.max(s.length - 1, 1) + (Math.random() - .5) * .25, 0), 1);
        r = Math.round(cA[0] + (cB[0] - cA[0]) * t);
        g = Math.round(cA[1] + (cB[1] - cA[1]) * t);
        b = Math.round(cA[2] + (cB[2] - cA[2]) * t);
        a = 0.7 + Math.random() * 0.3;
      }
      c2.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
      c2.fillText(s[k], x, CH * k + CH / 2);
    }
  });

  const cw = fin ? 3.0 : 1.7;
  const ch = fin ? 2.7 : 1.5;
  const W = cols.length * cw;
  const H = maxN * ch;
  const img = c2.getImageData(0, 0, cv.width, cv.height).data;
  const charOffsets = [];
  let totalChars = 0;
  cols.forEach(s => {
    charOffsets.push(totalChars);
    totalChars += s.length;
  });
  const REV_JIT = 1.1;   // 逐字落定的随机错乱幅度(单位:字序) 0=严格逐字 越大越无序
  const charJit = [];
  for (let i = 0; i < totalChars; i++) charJit.push((Math.random() - 0.5) * REV_JIT);

  const pts = [], colsA = [], seedA = [], revA = [], spA = [];
  const step = Math.max(1, density | 0);
  for (let py = 2; py < cv.height; py += step) {
    for (let px = 2; px < cv.width; px += step) {
      const id = (py * cv.width + px) * 4;
      const a = img[id + 3];
      if (a > 24) {
        const jx = (Math.random() - 0.5) * step * 0.42;
        const jy = (Math.random() - 0.5) * step * 0.42;
        pts.push(((px + jx) / cv.width - 0.5) * W,
                 (0.5 - (py + jy) / cv.height) * H,
                 (Math.random() - 0.5) * 0.06);
        colsA.push(img[id] / 255, img[id + 1] / 255, img[id + 2] / 255, a / 255);
        seedA.push(Math.random(), Math.random(), Math.random());
        const bucket = Math.min(Math.max(Math.floor(px / CW), 0), cols.length - 1);
        const ci = cols.length - 1 - bucket;
        const charIndex = Math.min(Math.max(Math.floor(py / CH), 0), cols[ci].length - 1);
        const gi = charOffsets[ci] + charIndex;
        const order = totalChars - 1 - gi;
        revA.push((order + charJit[gi] + Math.random() * 0.04) / Math.max(totalChars, 1));
        spA.push(special && special.chars.includes(cols[ci][charIndex]) ? 1 : 0);
      }
    }
  }

  const fromA = [];
  const pc = pts.length / 3;
  const ppc = prevPoints ? prevPoints.length / 3 : 0;
  for (let n = 0; n < pc; n++) {
    if (ppc > 0) {
      const j = ((n * 9973) % ppc | 0) * 3;
      fromA.push(prevPoints[j] + (Math.random() - 0.5) * 2.2,
                 prevPoints[j + 1] + (Math.random() - 0.5) * 2.8,
                 prevPoints[j + 2] + (Math.random() - 0.5) * 1.6);
    } else {
      fromA.push((Math.random() - 0.5) * W * 1.4,
                 (Math.random() - 0.5) * H * 1.4,
                 (Math.random() - 0.5) * 2.2);
    }
  }

  const u = {
    uOp: { value: 0 },
    uRev: { value: 0 },
    uForm: { value: 1 },
    uFromOff: { value: new THREE.Vector3() },
    uT: { value: 0 },
    uBolt: { value: 0 },
    uPx: { value: 1 },
    uAcc: { value: new THREE.Color(accent) }
  };

  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
  pgeo.setAttribute('aFrom', new THREE.BufferAttribute(new Float32Array(fromA), 3));
  pgeo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(colsA), 4));
  pgeo.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seedA), 3));
  pgeo.setAttribute('aRev', new THREE.BufferAttribute(new Float32Array(revA), 1));
  pgeo.setAttribute('aSp', new THREE.BufferAttribute(new Float32Array(spA), 1));

  const S = STYLES[style] || STYLES.firefly;
  const pmat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: u,
    vertexShader: `
    attribute vec4 aCol;attribute vec3 aSeed;attribute vec3 aFrom;attribute float aRev;attribute float aSp;
    uniform float uOp,uRev,uForm,uT,uBolt,uPx;uniform vec3 uFromOff,uAcc;
    varying vec4 vCol;varying float vA;
    void main(){
      float rv=smoothstep(1.-uRev-.6,1.-uRev,aRev)*step(.001,uRev); // 宽过渡带→缓慢落定
      float cv=rv*rv*(3.-2.*rv);                            // 缓动:先靠近 末了才落定
      float dl=${S.stagger};                                // 错峰起步 一粒接一粒
      float f=clamp((uForm-dl)/max(1.-dl,.05),0.,1.);
      float fp=f*f*(3.-2.*f);
      float b1=sin(fp*3.1415926);
      vec3 dir=aSeed*2.-1.;
      vec3 from=aFrom+uFromOff;
      vec3 p;vec3 fcol;float glow;float psz;
      ${S.flight}
      float b2=sin(cv*3.1415926);                           // 唱到哪行 哪行收束闪光
      p=mix(p,position,cv);                                 // 唱到时缓缓落定 铺成整句字
      float outB=smoothstep(.5,.05,uOp)*smoothstep(.55,1.,uForm);
      float ob2=outB*outB;
      p+=dir*ob2*(2.+3.2*aSeed.x);
      p.y+=ob2*(.5+1.5*aSeed.y);
      p.z+=uBolt*.14*sin(aSeed.x*30.+uT*18.);
      vec4 mv=modelViewMatrix*vec4(p,1.);
      float d=max(-mv.z,1.);
      float tw=.78+.22*sin(uT*2.1+aSeed.x*18.);
      gl_PointSize=min((.5+.5*aCol.a+uBolt*1.2
        +(1.-cv)*psz+b2*.9+ob2*1.1)*uPx/d,6.5);
      vCol=aCol;
      vCol.rgb=mix(fcol,vCol.rgb,cv);                       // 飞行/悬停时呈意境态颜色
      vCol.rgb=mix(vCol.rgb,uAcc*1.08,.45*b2+.38*ob2+.24*cv); // 成字后持续染意境色
      vCol.rgb+=uAcc*.14*(.5+.5*sin(uT*2.4+aSeed.z*14.))*cv;
      float lum=dot(vCol.rgb,vec3(.299,.587,.114));
      vCol.rgb=max(mix(vec3(lum),vCol.rgb,0.5),0.);         // 提饱和 抗加色发白
      vCol.rgb=mix(vCol.rgb,vec3(1.55,.13,.06),aSp*cv*.9);  // 特字(红印)落定后灼红 不被意境色稀释
      float g2=mix(glow,1.,cv);
      vA=sqrt(uOp)*tw*g2*(.44+uBolt*.28+.2*b2+.24*outB)*(1.+aSp*cv*.4);
      gl_Position=projectionMatrix*mv;
    }`,
    fragmentShader: `
    varying vec4 vCol;varying float vA;
    void main(){
      vec2 q=gl_PointCoord-.5;
      float d=length(q);
      float m=smoothstep(.47,.34,d);
      float core=smoothstep(.28,.08,d);
      gl_FragColor=vec4(vCol.rgb*(m*.88+core*.42)*vA*1.18,m*vA*.88);
    }`
  });

  const ptsObj = new THREE.Points(pgeo, pmat);
  ptsObj.renderOrder = 9;
  ptsObj.frustumCulled = false;

  const mesh = new THREE.Group();
  mesh.renderOrder = 8;
  mesh.add(ptsObj);

  return { mesh, u, H, W, points: pts.slice() };
}
