---
name: butterfly-fill
description: Tune finale butterfly particle fill in vj3d_split, especially when the small butterfly swarm looks hollow, wing outlines are too bright, wing membranes are too sparse, or reforming butterflies need denser, softer filled wings.
---

# Butterfly Fill

Use this skill when adjusting the finale butterfly swarm fill and brightness in `vj3d_split`.

## Main Symptom

The small butterflies are sampled from the giant-eye butterfly particle set. The geometry was designed for a giant butterfly: many edge particles are packed into a narrow contour, while membrane particles spread across the whole wing. When split into many small butterflies, the outline can look like a bright ring and the inner wing can look hollow.

## Brightness Balance

Edit `vj3d_split/src/finalButterflyAssets.js`:

```glsl
float wK=.34+.30*isE+.34*isB;
wK=mix(wK,.52-.07*isE+.16*isB,uReform);
```

At `uReform = 1`:

- Wing membrane: `0.34 -> 0.52`
- Wing edge: `0.64 -> 0.45`

To make small butterflies look more filled:

- Increase `.52` to brighten membrane fill.
- Make `-.07` more negative to reduce the edge ring.
- Keep body boost `.16*isB` unless the body becomes too dim.

## Membrane Particle Size

Edit:

```glsl
sz*=1.+uReform*(1.-isE-isB)*.55;
```

`(1.-isE-isB)` targets wing membrane particles only.

- Increase `.55` for fuller, softer wing membranes.
- Decrease `.55` if wings become blurry or over-bright.

This is the most direct control for small butterfly fill without changing the base geometry.

## Geometry Allocation

Use this only when shader-side tuning is not enough, because it also changes the giant-eye butterfly density and brightness.

Edit the particle quotas near the top of `vj3d_split/src/finalButterflyAssets.js`:

```js
while((mem<22000||edg<14000)&&guard++<9000000){
  if(Math.abs(d)<.015&&edg<14000){ ... }      // wing edge
  else if(d<-.02&&mem<22000&&R()<.5){ ... }   // wing membrane
}
```

Useful direction:

- Raise `mem` toward `30000` for denser wing interiors.
- Lower `edg` toward `10000` to reduce the outline ring.
- Expect the giant-eye butterfly to become denser/brighter if total particles increase.

## Vein Density

Edit:

```js
for(let tt=.05;tt<.95;tt+=.004)
```

Smaller step values create denser vein lines. This can make wings feel more filled, but too small will make the butterfly line-heavy.

## Validation

After editing:

```powershell
node --check vj3d_split\src\finalButterflyAssets.js
```
