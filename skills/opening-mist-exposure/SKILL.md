---
name: opening-mist-exposure
description: Tune opening low-hanging mist exposure in vj3d_split, especially when the intro cloud/fog is overexposed, too white, too blurry, or additive mist layers stack too brightly near the camera.
---

# Opening Mist Exposure

Use this skill when adjusting the opening low-hanging mist in `vj3d_split`.

## Cause

The opening mist uses additive blending. When `uLow` pushes fog clusters down toward camera height, many large mist particles overlap in screen space and their brightness adds together. Overexposure is usually from stacked low mist, not global scene exposure.

## Main Brightness Boost

Edit `vj3d_split/src/weatherMaterials.js`:

```glsl
vA*=1.+uLow*aKind*2.2;
```

`2.2` is the opening low-mist alpha boost.

- Lower to `0.8` - `1.2` to reduce overexposure.
- This only affects the opening low-mist window through `uLow`.

## Mist Size Boost

Edit:

```glsl
float sz=mix(.09,3.8,aKind)*(0.6+aSeed.z*.8)*(1.+uLow*aKind*1.2);
```

The final `1.2` enlarges mist clusters while low.

- Lower toward `0.5` to reduce overlap, blur, and additive brightness.
- Keep this higher if the mist should stay soft and heavy.

## Low-Press Strength

Edit:

```glsl
w.y-=uLow*aKind*max(w.y-uCam.y+2.2,0.)*.6;
```

- `.6` is the strength that presses mist down toward camera height. Lower to `.4` to spread mist vertically and reduce overlap.
- `2.2` is the target height offset above camera. Increase it to keep the mist higher and less in the face.

## Total Amount And Window

Edit `vj3d_split/index.html`:

```js
mistU.uLow.value=live?env(ts,0,.15,5.6,7.3):0;
```

- Multiply by a scalar for an easy global reduction:

```js
mistU.uLow.value=(live?env(ts,0,.15,5.6,7.3):0)*.7;
```

- `5.6,7.3` are the lift-away start/end seconds.

## Avoid

Do not tune the base mist brightness first:

```glsl
vA=mix(.5*tw,.045,aKind)*...
```

The `.045` value affects mist across the whole song, not only the opening low-hanging cloud.

## Validation

After editing:

```powershell
node --check vj3d_split\src\weatherMaterials.js
```
