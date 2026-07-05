---
name: galaxy-timing
description: Tune the finale galaxy and starfield timing in vj3d_split, especially when the galaxy reveals too quickly, the cloud-dissipation reveal feels wrong, star patches appear too uniformly, or the finale sky needs slower pacing.
---

# Galaxy Timing

Use this skill when adjusting the finale galaxy reveal in `vj3d_split`.

Since 2026-07 the galaxy does NOT form by particle flight — it sits in place
on the sky dome and is revealed as the cloud layer dissipates
("云散渐显", see `src/galaxyAssets.js` header comment).

## Primary Control

Edit `vj3d_split/index.html` near the main loop:

```js
galaxyU.uForm.value=live?Math.min(Math.max((ts-159.2)/8,0),1):0;
```

- `159.2` is the reveal start time in seconds.
- `/8` is the total cloud-dissipation duration in seconds. Increase for a slower reveal.

Opacity ramp (independent of reveal pattern):

```js
galaxyU.uApp.value=live?env(ts,159.2,161.2,1000,1001):0;
```

## Reveal Pattern

Edit the star vertex shader in `src/galaxyAssets.js`:

```glsl
float cloud=sin(position.x*.041+1.7)*sin(position.z*.047+.6)
           +sin((position.x+position.z)*.021+3.1)
           +sin(position.x*.012-position.z*.016+5.);
float ph=clamp(cloud*.13+.38,0.,.62)+aRnd*.08;   // 每星显现相位
float fe=smoothstep(ph,ph+.3,uForm);             // 云隙一片片扩开
```

- `.041/.047/.021/.012` — cloud patch spatial frequencies (smaller = bigger patches).
- `cloud*.13` — patch phase spread. Increase toward `.2` for more binary
  patch-by-patch reveal; decrease for a more uniform global fade.
- `+.3` smoothstep width — per-star fade duration as fraction of uForm.
- `aRnd*.08` — per-star jitter inside a patch.
- Nebula uses the same field with a later base phase (`+.44`); the core-glow
  billboard fades in with `smoothstep(.3,.75,uForm)`.
- The two "duo" stars (butterfly handoff) have `aRnd≈0.94-0.99` so they appear
  last (~165 s), timed against `ghostU.uAsc` (butterfly ascension).

## Shader warmup

The galaxy shaders + 1.1M vertices are pre-compiled during page load by a
one-frame warmup render (`index.html`, right after `createGalaxyAssets`).
Do not remove it — without it the show freezes for seconds at 159.2 s.

## Butterfly Scatter Handoff

The finale galaxy reveal is timed with the red butterfly / giant-eye scatter and reform.

Scatter/reform master timing in `vj3d_split/index.html`:

```js
ghostU.uReform.value=live?Math.min(Math.max((ts-159.0)/5.5,0),1):0;
```

- `159.0` is the scatter/reform start time.
- `/5.5` is the total scatter-to-reform duration.
- In the butterfly shader, `.32` is the scatter share of `uReform`; after that, particles begin reforming.

Scatter distance in `vj3d_split/src/finalButterflyAssets.js`:

```glsl
tp+=(dirB*(14.+26.*fract(seed*91.7)) ...);
```

- `14.` is the base scatter radius.
- `26.` is the random extra scatter distance.
- Increase these for wider red-particle dispersal before reform.

Physical scatter impulse in the `vj3d_split/index.html` simulation shader:

```glsl
+dir*bg*110.
```

`110.` is the burst impulse. Increase for a harder explosive scatter; decrease for a softer cloud-like release.

Reform stagger in `vj3d_split/src/finalButterflyAssets.js` and the matching sim shader:

```glsl
smoothstep(.32+fract(seed*53.9)*.22,1.,uReform)
```

- `.32` is the scatter/reform boundary.
- `.22` is the regroup stagger. Increase it so particles reform over a wider time range; decrease it for tighter simultaneous reform.

## Cloud Patch Reveal

Galaxy cloud-dissipation duration in `vj3d_split/index.html`:

```js
galaxyU.uForm.value=live?Math.min(Math.max((ts-159.2)/8,0),1):0;
```

`/8` is the cloud-dissipation reveal duration. Increase it for slower cloud clearing.

Cloud patch size and contrast in `vj3d_split/src/galaxyAssets.js`:

```glsl
float cloud=sin(position.x*.041+1.7)*sin(position.z*.047+.6)
           +sin((position.x+position.z)*.021+3.1)
           +sin(position.x*.012-position.z*.016+5.);
float ph=clamp(cloud*.13+.38,0.,.62)+aRnd*.08;
```

- `.041/.047/.021/.012` control cloud-field spatial frequency. Smaller values make larger cloud patches; larger values make finer broken texture.
- `cloud*.13` controls patch contrast. Increase toward `.2` for a stronger "cloud breaks open in chunks" feeling.
- Keep the nebula channel in sync; it repeats the same cloud field with a later base phase.

## Validation

After editing `galaxyAssets.js`, run:

```powershell
node --check vj3d_split\src\galaxyAssets.js
```
