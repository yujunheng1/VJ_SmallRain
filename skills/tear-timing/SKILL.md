---
name: tear-timing
description: Tune the tear-drop sequence in vj3d_split, especially tear swell timing, detach/slide duration, free-fall height, splash timing, pond ripple sync, tear-butterfly birth position, and closed-eye lock timing.
---

# Tear Timing

Use this skill when adjusting the tear sequence in `vj3d_split/index.html`.

## Main Constants

Edit the tear comment block:

```js
const TEAR_T0=139.2,TEAR_GROW=1.8,TEAR_SLIDE=.35;
const TEAR_DET=TEAR_GROW+TEAR_SLIDE;
const TEAR_DETACH=TEAR_T0+TEAR_DET;
const TEAR_FALL=Math.sqrt(2*17.65/9.8);
const TEAR_HIT=TEAR_DETACH+TEAR_FALL;
```

- `TEAR_T0`: tear swell start time.
- `TEAR_GROW`: how long the tear gathers at the eye corner.
- `TEAR_SLIDE`: detach micro-drop duration. Current `.35s` cancels the old long cheek slide.
- `17.65`: free-fall height from eye corner to pond.
- `TEAR_HIT`: pond impact time, derived automatically.

## Slide Cancel

The current design does not slide down the cheek. `TEAR_SLIDE=.35` only gives a short surface-tension break.

Edit `slidePath`:

```glsl
vec3 slidePath(float s)
```

The small downward offset is `.22`. This is the eye-corner dip before the whole tear enters free fall.

## Return To Old Music Hit

If the pond impact needs to return to about `145.2s`, increase:

```js
TEAR_GROW=3.7
```

This makes the tear gather longer before detaching, without manually changing derived hit/birth/ripple times.

## Impact Position

The synchronized eye-corner fall point is:

```js
(-2.74, -203.55)
```

It is used by:

- Pond ripple at `TEAR_HIT`.
- Tear-butterfly birth position.
- Splash placement below the eye corner.

Keep these coordinates aligned if moving the tear fall column.

## Auto-Synced Events

These are derived from the tear constants; avoid hard-coding them separately:

- Tear pond impact: `TEAR_HIT`.
- Tear-butterfly birth: `env(ts,TEAR_HIT,TEAR_HIT+1.3,...)`.
- Reflection omen exit: `env(ts,100,106,TEAR_HIT-.7,TEAR_HIT)`.
- Closed-eye lock phase uses `TEAR_T0+TEAR_GROW`.

## Validation

For constant-only edits in `index.html`, visually test the timeline. For broader shader edits, extract the module script to a temporary `.mjs` and run `node --check`.
