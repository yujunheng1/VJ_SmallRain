---
name: lyric-particle-timing
description: Tune the VJ lyric particle timing in vj3d_split, especially when lyrics form too fast, particles snap into characters, the pre-flight feels abrupt, or the line-by-line/character-by-character reveal needs adjustment.
---

# Lyric Particle Timing

Use this skill when changing the lyric particle timing in `vj3d_split`.

## Primary Control

Edit `vj3d_split/index.html` near the lyric update loop:

```js
const rw=Li.fin?3.2:Math.min(Li.dur*.85,4.5);
Li.u.uRev.value=Math.min(Math.max(el/rw,0),1);
```

`rw` is the seconds used for a lyric line to reveal and settle into characters.

- Increase `Li.fin?3.2` to slow final lyric lines.
- Increase `.85` to use more of each lyric's duration.
- Increase `4.5` to remove the cap that makes long lyrics finish too quickly.

## Pre-Flight Control

Edit the same loop:

```js
Li.u.uForm.value=Math.min(Math.max((el+3)/3,0),1);
```

This is the firefly pre-flight into the waiting position before the lyric starts. If changing `3` to `4` or `5`, also update the matching early visibility windows:

- `if(el>=-3&&el<=Li.dur+3)`
- `env(ts,Li.t0-3,Li.t0-2.4,...)`

Keep these lead times consistent to avoid particles popping in.

## Character Settle Softness

Edit `vj3d_split/src/lyricParticles.js`:

```js
const revFeather = Math.min(0.06, 0.75 / Math.max(totalChars, 1));
```

This softens each character's reveal window. Increase it for a more stretched, softer settle. The whole line duration is still controlled by `rw`.

The shader should match the current positive `aRev` order:

```glsl
float rv=smoothstep(aRev,aRev+${revFeather.toFixed(5)},uRev)*step(.001,uRev);
```

If `aRev` is positive from `0` to `1`, do not use the old reverse form `smoothstep(1.-uRev-.6,1.-uRev,aRev)`.

## Lyric Style Mapping

Use lyric meaning to choose the particle formation style:

| Style | Mood / Keywords | Formation |
| --- | --- | --- |
| `firefly` | 思念 / 心 / 梦 / 回音 | Fireflies orbit and spiral, then settle into characters when sung. This is the original effect. |
| `rain` | 雨 / 淅沥 / 哭泣 / 泪 | Rain streaks fall from high above, accelerate into strokes, and make small glow ripples on impact. |
| `thunder` | 雷声 | Electric arcs gather above character positions, then strike down in four sharp waves with purple-white flicker. |
| `mist` | 云雾 / 竹林 / 透明 | Mist clusters slowly contract; characters appear from fog as particles shift from large/soft to condensed. |
| `water` | 海底 / 浸泡 / 寂寞 / 沉默 | Particles begin below the character positions, sway underwater, then rise with water shimmer. |
| `ember` | 滚烫 / 烙 / 红印 | Hot sparks roll upward from below, flickering coal-red, gold, and white before branding into strokes. |
| `wind` | 微风 / 山谷 / 低语 / 摇曳 | Leaf-like flecks sweep in from both sides, spiral with wind, and land into the glyphs. |

Useful matches in this project:

- `忽而雷声隐隐`: use `thunder`.
- `滴滴答滴滴的雨下起`: use `rain`.
- `浇打我身体 烙上红印`: use `ember`.
- `夏夜低沉的云雾里`: use `mist`.

Style strength parameters belong near the start of each style chunk. Examples: rain fall height such as `4.5+7.5`, mist radius such as `2.5+3.5`. Tune those local constants for intensity before changing the global timeline.

## Red Mark Controls

Use these controls for `红印` redness and burn intensity.

Canvas/base color in `vj3d_split/index.html`:

```js
special:{chars:'红印',color:'#ff1c08'}
```

This affects the source canvas color, the flying stage, and the base glyph gradient for the special characters.

Final burn target color in `vj3d_split/src/lyricParticles.js`:

```glsl
vCol.rgb=mix(vCol.rgb,vec3(1.55,.13,.06),aSp*cv*.9);
```

- `vec3(1.55,.13,.06)` is the red burn target. Values above `1.0` create additive glow/overexposure.
- `.9` is the override strength. `1.0` nearly fully replaces the mood color.

Extra red-mark brightness:

```glsl
vA=...*(1.+aSp*cv*.4);
```

`.4` is the extra brightness added only after the special characters settle.

## Character Reveal Rhythm

Random character-order jitter in `vj3d_split/src/lyricParticles.js`:

```js
const REV_JIT = 1.1;
```

- `0` means strict character order.
- `1.1` allows nearby characters to swap order slightly.
- `2+` starts to feel close to unordered settling.

Whole-line reveal duration in `vj3d_split/index.html`:

```js
const rw=Li.fin?3.2:Math.min(Li.dur*.85,4.5);
```

Increase `rw` to slow the whole lyric line's settle.

Single-character transition band in the lyric vertex shader:

```glsl
float rv=smoothstep(1.-uRev-.6,1.-uRev,aRev)*step(.001,uRev);
```

`.6` is the per-character transition width. Larger is softer and longer; smaller is sharper and more crisp. If the code uses positive `aRev` order, keep the positive-order form documented above instead.

## Style Motion Strength

Each style in `vj3d_split/src/lyricParticles.js` has local formation constants near the start of the `STYLES` table.

- Stagger values such as `aSeed.y*.72`: larger values spread particle start times more.
- Rain fall height such as `4.5+7.5*aSeed.y`: larger values make rain fall from higher.
- Mist radius such as `2.5+3.5`: larger values make fog gather from wider and softer.
- Thunder arc height such as `3.5+5.`: larger values make lightning strike from higher.
- Ember depth such as `3.+5.`: larger values make sparks roll upward from deeper below.
- Wind side distance such as `5.+6.`: larger values make flecks sweep in from farther sideways.

## Validation

After edits, run:

```powershell
node --check vj3d_split\src\lyricParticles.js
```

For `index.html`, extract the module script to a temporary `.mjs` and run `node --check` when the edit is more than a number change.
