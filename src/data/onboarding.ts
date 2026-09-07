// Ported from the "Lua Onboarding Paper" design (Newsreader + Source Sans 3,
// hand-drawn paper aesthetic). Screen three is the astronaut's helmet: the
// visor's own painted swirl is replaced with the app's real glass-swirl
// texture (see the comment above the helmet's visor overlay in
// Onboarding.tsx), so the push into it ends on the same object Home reveals
// rather than a colour that could drift from it.

export type OnboardScreen = 1 | 2 | 3;

// The screens' words are not here — they are chrome, and chrome lives in
// lib/strings beside every other line the app says, in both languages. What
// stays is the geometry, which is the same in either.

// The push-in on screen three is one transform on the helmet artwork, pivoted
// on the visor's measured centre — a saturation scan of the source (the
// swirl is the only saturated region in an otherwise graphite drawing) put it
// at 50.36%/41.93% of the image. Scaling about that point holds the visor
// still while everything else leaves the frame. Both figures are percentages
// of the artwork's own box, so they hold regardless of what height the box
// renders at; CAM_FULL's translate does not (it was measured in px against
// the artwork at its native 812×443 design size) and is scaled by that box's
// actual height each render — see camFull() in Onboarding.tsx.
export const VISOR_ORIGIN = '50.36% 41.93%';
export const CAM_REST = 'translate(0px,0px) scale(1)';
export const CAM_FULL_AT_443 = { x: -2.9, y: 240.3, scale: 7.2 };

// The visor's own bounding box, from the same scan, as a box within the
// artwork rather than a point: centre 50.36%/41.93%, half-width 9.5% of the
// artwork's width, half-height 16.5% of its height. This is where the live
// swirl sits instead of the photo's own painted one.
export const VISOR_BOX = { left: 40.86, top: 25.43, width: 19, height: 33 };
