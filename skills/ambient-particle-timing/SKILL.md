---
name: ambient-particle-timing
description: Tune ambient particle timing and density in vj3d_split, especially opening mist dispersal speed, underwater bubble rise speed, bubble count, bubble density, and bubble visibility.
---

# Ambient Particle Timing

Use this skill when adjusting opening mist dispersal or underwater bubble motion in `vj3d_split`.

## Opening Mist Dispersal

Edit `vj3d_split/index.html`:

```js
mistU.uLow.value=live?env(ts,0,.15,5.6,7.3):0;
```

`env(ts, startRise, fullRise, startDisperse, fullyDispersed)` controls the low-mist envelope.

- `5.6 -> 7.3` is the current dispersal window, so mist lifts away over `1.7s`.
- To disperse more slowly while still clearing before the first lyric at `7.36s`, start earlier but keep the end near `7.3`:

```js
mistU.uLow.value=live?env(ts,0,.15,4.5,7.3):0;
```

The physical lift is driven by `uLow` in `src/weatherMaterials.js`, so usually only change this envelope.

## Bubble Rise Speed

Edit the bubble shader in `vj3d_split/index.html`:

```glsl
float rise=mod(aS.y*9.+uT*(.5+aS.z*.85),9.);
```

`.5+aS.z*.85` is the per-bubble rise speed range, about `0.5` to `1.35` meters per second.

For slower deep-sea bubbles:

```glsl
float rise=mod(aS.y*9.+uT*(.25+aS.z*.45),9.);
```

The two `9.` values are the vertical loop height and usually should stay unchanged.

## Bubble Count

Edit:

```js
const NB2=90,sd=new Float32Array(NB2*3);
```

Change only `90`; the array size follows automatically.

## Bubble Density

Edit:

```glsl
vec3 w=uCam+vec3((aS.x-.5)*17.+sin(...)*.5,
  rise-1.5,-2.5-aS.z*16.);
```

- `17.` controls horizontal spread. Smaller is denser, larger is wider/sparser.
- `16.` controls forward depth spread. Smaller is denser, larger is deeper/sparser.
- `-2.5` is nearest distance from camera. Moving it closer makes bubbles more in the face.

## Bubble Visibility

Edit:

```js
bubU.uT.value=now;bubU.uA.value=seaV*.8;
```

`.8` is the overall bubble brightness/presence.

## Presets

Sparse slow deep-sea bubbles:

- `NB2`: `90 -> 50`
- speed: `.5+aS.z*.85 -> .25+aS.z*.45`
- horizontal spread: `17. -> 22.`

Dense fine bubble curtain:

- `NB2`: `90 -> 160`
- size: `.10+.22*aS.y -> .06+.12*aS.y`

## Validation

For number-only edits in `index.html`, visual testing is usually enough. For broader shader edits, extract the module script to a temporary `.mjs` and run `node --check`.
