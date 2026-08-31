// Vertical layout for the home stage.
//
// The ported design is drawn on a 402x874 canvas and every coordinate in it is
// absolute. That works while the canvas keeps its exact aspect ratio, but the
// stage now fills the viewport's width and takes whatever height is left, so
// the height it renders at varies: ~874 with no browser chrome, ~762 in iOS
// Safari once the URL and tab bars take their cut, less again on small phones.
//
// The composition is a fixed band at the top (the streak button), a fixed band
// at the bottom (the filter chrome), and a group in between — title, moon, idle
// line — that has to absorb the difference. These are the reference positions
// measured off the design at its native 874:
//
//   streak     70..116
//   title     246..276
//   moon      347..557   (210 tall, centre 452)
//   idle line 578..594
//   chrome    647..828   (46 clear of the bottom edge)
//
// Slack is handed out the way the design hands it out — 130 above the group to
// 53 below — so at exactly 874 this reproduces the original coordinates, and
// every other height is a proportional relaxation of the same composition.

import { createContext, use } from 'react';

export const DESIGN_H = 874;

const TOP_RESERVE = 116;
const BOTTOM_RESERVE = 227;

// Two lines, not one. The nudge above the moon rotates, and the longest of them
// wraps at 25px on a narrow screen — reserving a single line let it lap over the
// moon once the composition compressed. The gap below it is shortened by the
// same amount, so title top to moon top is unchanged and the reference
// coordinates still come out exactly at the design height.
const TITLE_H = 60;
const GAP_TITLE_MOON = 41;
const MOON_H = 210;
const GAP_MOON_LINE = 21;
const LINE_H = 16;

// The design leaves 53 between the idle line and the chrome. Squeezing the
// group is fine, but it must not squeeze that clearance to nothing, or on a
// short phone the idle line ends up sitting on the filter labels — so hold part
// of it back before the group is laid out at all.
const MIN_CLEARANCE = 20;

const FIXED_H = TITLE_H + MOON_H + LINE_H;
const GAPS_H = GAP_TITLE_MOON + GAP_MOON_LINE;
const GROUP_H = FIXED_H + GAPS_H;

// How far the two gaps may be squeezed before the group simply will not fit.
// Past that the stage stops growing and letterboxes instead — invisibly, since
// the backdrop is painted on the viewport rather than on the canvas.
const MIN_GAP_SCALE = 0.4;

const DESIGN_SLACK = DESIGN_H - TOP_RESERVE - BOTTOM_RESERVE - MIN_CLEARANCE - GROUP_H;
const ABOVE_SHARE = 130 / DESIGN_SLACK;

export const MIN_STAGE_H = TOP_RESERVE + BOTTOM_RESERVE + MIN_CLEARANCE + FIXED_H + GAPS_H * MIN_GAP_SCALE;

// Beyond design size the stage is a phone mock on a large screen; let it grow a
// little past 1:1 for legibility, not without bound.
export const MAX_SCALE = 1.15;

export interface StageLayout {
  /** Canvas height in design units. */
  height: number;
  /** Top of the phase title ("Ready to begin?"). */
  titleY: number;
  /** Centre of the moon. */
  moonCY: number;
  /** Top of the idle line beneath the moon. */
  lineY: number;
  /** Top of the bottom filter chrome. */
  chromeTop: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function layoutFor(height: number): StageLayout {
  const band = height - TOP_RESERVE - BOTTOM_RESERVE - MIN_CLEARANCE;

  const gapScale = band < GROUP_H ? clamp((band - FIXED_H) / GAPS_H, MIN_GAP_SCALE, 1) : 1;
  const gapTitleMoon = GAP_TITLE_MOON * gapScale;
  const gapMoonLine = GAP_MOON_LINE * gapScale;

  const slack = Math.max(0, band - (FIXED_H + gapTitleMoon + gapMoonLine));
  // Share the design's slack the way the design does; anything beyond it is
  // extra room no reference position speaks to, so centre the group in it.
  const shared = Math.min(slack, DESIGN_SLACK);
  const titleY = TOP_RESERVE + shared * ABOVE_SHARE + (slack - shared) / 2;

  const moonTop = titleY + TITLE_H + gapTitleMoon;

  return {
    height,
    titleY,
    moonCY: moonTop + MOON_H / 2,
    lineY: moonTop + MOON_H + gapMoonLine,
    chromeTop: height - BOTTOM_RESERVE,
  };
}

/**
 * Scale and canvas height for a viewport. Width drives the scale so the app is
 * always edge to edge; the height that leaves becomes the canvas height, down
 * to the floor at which the composition stops fitting.
 */
export function stageFit(width: number, height: number) {
  const scale = Math.min(width / 402, MAX_SCALE, height / MIN_STAGE_H);
  return { scale, height: height / scale };
}

const StageLayoutContext = createContext<StageLayout>(layoutFor(DESIGN_H));
export const StageLayoutProvider = StageLayoutContext;

/** The canvas height the stage is rendering at, and the anchors derived from it. */
export const useStageLayout = () => use(StageLayoutContext);
