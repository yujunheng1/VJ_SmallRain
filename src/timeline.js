export const PROFILE=[0.0143,0.068,0.1105,0.1147,0.1169,0.111,0.1104,0.1151,0.1147,0.1063,
 0.2005,0.26,0.2706,0.2566,0.2748,0.2604,0.1195,0.0304,0.0787,0.1159,0.1573,0.1463,
 0.186,0.2018,0.1873,0.2698,0.2619,0.2778,0.2694,0.2675,0.2463,0.0271,0.0028,0.0];
export const PMAX=0.2778;
export const sectionAt=ts=>{const i=ts/5,a=Math.min(Math.floor(i),PROFILE.length-1),
 b=Math.min(a+1,PROFILE.length-1),f=i-Math.floor(i);
 return Math.min((PROFILE[a]*(1-f)+PROFILE[b]*f)/PMAX,1);};
export const env=(ts,a,b,c,d)=>{const up=Math.min(Math.max((ts-a)/Math.max(b-a,.01),0),1),
 dn=1-Math.min(Math.max((ts-c)/Math.max(d-c,.01),0),1);return up*dn;};
export const curve=(arr,ts)=>{if(ts<=arr[0][0])return arr[0][1];
 for(let i=1;i<arr.length;i++)if(ts<arr[i][0]){const[t0,v0]=arr[i-1],[t1,v1]=arr[i];
  return v0+(v1-v0)*(ts-t0)/(t1-t0);}return arr[arr.length-1][1];};
export const DINGS=[[11.52,.8],[20.34,1],[28.24,.8],[52.48,1],[64.34,.8],[68.29,.8],
 [84.10,1.3],[87.84,.8],[107.79,.9],[124.60,1.2],[151.55,1.25,1]];
export const THUNDER=[52.06,124.60];   // 「忽而雷声隐隐」— 全曲最大的巨雷（首声在远方正前）
export const STORM=[[0,0],[36.5,0],[40,.07],[46,.18],[52,.45],[62,.5],[78,.5],[84,.58],[95,.66],
 [110,.74],[122,.8],[126,1],[152,1],[158,.45],[166,.15]]; // 雨始于「一点一滴淅淅沥沥」37.3s
export const WINDC=[[0,.6],[8,.4],[20,.2],[48,.3],[60,.35],[80,.5],[95,.55],[122,.7],
 [126,.85],[150,.75],[160,.3]];
export const NIGHTC=[[0,.26],[44,.26],[54,.12],[76,.12],[82,.4],[88,.7],[95,1],[166,1]]; // 夏夜苗寨(明亮暮色)→微明竹林→入夜
export const narrative=ts=>({
 danger:Math.max(.7*env(ts,80,85,91,97),env(ts,152,158,164,167)),
 figure:env(ts,8,16,149,152),
 summon:Math.max(.85*env(ts,79,86,92,98),env(ts,140,150,162,167))});
export const boltWindow=ts=> ts>82&&ts<97?.55 : ts>124&&ts<158?.42 : ts>97&&ts<124?.24 : 0; // 入夜后雷才多
