// The push-in transform tree — ported 1:1 from Lua.dc.html's <script> block.
// One transform on both moon and aperture, sharing transform-origin 60.3%/35.2%
// (the window's real off-centre position in the photograph).

export const M = 210, WX = 0.6034, WY = 0.3521, WR = 0.1691;
export const CX = 201, CY = 452;
export const WPX = CX - M / 2 + WX * M;
export const WPY = CY - M / 2 + WY * M;
export const TARGET_X = 201, TARGET_Y = 398;
export const AP_R = WR * M;
export const K = 526 / AP_R;

export const EASE_IN = 'cubic-bezier(.52,0,.2,1)';
export const EASE_OUT = 'cubic-bezier(.28,1,.34,1)';

export const REVEAL_MS = 1500;

export type Phase = 'idle' | 'agitate' | 'anticipate' | 'reveal' | 'settled' | 'dismiss';

export interface PhaseSpec {
  k: number; tx: number; ty: number;
  occ: number; ap: number; sw: number; vig: number; txt: number; chrome: number; calm: number;
  dur: number;
}

export const PHASES: Record<Phase, PhaseSpec> = {
  idle:       { k: 1,    tx: 0, ty: 0, occ: 0,   ap: 0, sw: 0,  vig: 0,   txt: 0, chrome: 1,   calm: 0, dur: 780 },
  agitate:    { k: 1.03, tx: 0, ty: 0, occ: 0,   ap: 0, sw: 1,  vig: 0,   txt: 0, chrome: .5,  calm: 0, dur: 380 },
  anticipate: { k: .958, tx: 0, ty: 0, occ: .1,  ap: 0, sw: .9, vig: .1,  txt: 0, chrome: .18, calm: 0, dur: 820 },
  reveal:     { k: K,    tx: TARGET_X - WPX, ty: TARGET_Y - WPY, occ: 1, ap: 1, sw: 1, vig: 1, txt: 1, chrome: 0, calm: 0, dur: REVEAL_MS },
  settled:    { k: K,    tx: TARGET_X - WPX, ty: TARGET_Y - WPY, occ: 1, ap: 1, sw: 1, vig: 1, txt: 1, chrome: 0, calm: 1, dur: 1600 },
  dismiss:    { k: 1,    tx: 0, ty: 0, occ: 0,   ap: 0, sw: 0,  vig: 0,   txt: 0, chrome: 1,   calm: 0, dur: 1020 },
};
