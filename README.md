# VJ_小雨

一个基于 Three.js、WebGL Shader 和 Web Audio API 的 3D 音乐可视化/VJ 项目。

项目围绕歌曲《小雨 - 黄龄》制作，通过音频播放时间、频谱分析和手写 GLSL shader 驱动场景变化，包含雨、雾、风、夜色、歌词粒子、蝴蝶、巨眼、银河等视觉段落。

## 技术栈

- HTML / CSS / JavaScript ES Modules
- Three.js
- WebGL / GLSL Shader
- Web Audio API
- Canvas 2D 文本粒子生成
- 静态资源部署，无需前端构建工具

## 目录结构

```text
.
├── index.html                  # 主入口，负责场景装配、音频启动、主循环和模块调度
├── kugeci.html                 # 歌词相关辅助页面
├── assets/                     # 音频等静态资源
├── src/
│   ├── styles.css              # 页面样式、启动遮罩、HUD
│   ├── timeline.js             # 音乐时间轴、段落曲线和叙事状态
│   ├── lyricParticles.js       # 歌词粒子生成、颜色和飞散聚合效果
│   ├── weatherMaterials.js     # 天气材质：雨、雾、水花、竹叶、萤火、炊烟等
│   ├── finalButterflyAssets.js # 终章蝴蝶与巨眼相关资源
│   ├── galaxyAssets.js         # 银河粒子与星空资源
│   └── shaderChunks.js         # 复用 GLSL 代码片段
├── vendor/
│   └── three.module.js         # 本地 Three.js 依赖
└── skills/                     # 项目调参和维护说明
```

## 本地运行

因为浏览器对 ES Modules 和音频资源有本地文件访问限制，请使用静态服务器运行：

```bash
python -m http.server 8173
```

然后在浏览器打开：

```text
http://127.0.0.1:8173/
```

或直接访问：

```text
http://127.0.0.1:8173/index.html
```

## 操作说明

- 点击启动遮罩后开始播放音乐和渲染画面
- 按空格键可以暂停或继续播放
- 画面效果会跟随歌曲时间轴、频谱和节拍自动变化

## 说明

这是从原始 `vj3d.html` 拆分整理出的版本，保留静态运行方式，便于直接部署到 GitHub Pages 或任意静态文件服务器。
