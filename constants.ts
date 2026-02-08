import { CableTray, Breaker, Busbar } from './types';

// From Table 1 & Text
export const DC_CABLE_SIZE = 4; // mm2
export const DC_CABLE_OD = 7.54; // mm
export const DC_CABLE_OD_AREA = Math.pow(DC_CABLE_OD / 2, 2) * Math.PI;

// From Table 2
export const TRAY_SIZES: CableTray[] = [
  { width: 50, height: 50, area: 2500, allowableArea: 500 },
  { width: 50, height: 100, area: 5000, allowableArea: 1000 },
  { width: 100, height: 100, area: 10000, allowableArea: 2000 },
  { width: 200, height: 100, area: 20000, allowableArea: 4000 },
  { width: 300, height: 100, area: 30000, allowableArea: 6000 },
  { width: 400, height: 100, area: 40000, allowableArea: 8000 },
  { width: 500, height: 100, area: 50000, allowableArea: 10000 },
];

// From Table 3
export const BREAKERS: Breaker[] = [
  { at: 3, af: 30 }, { at: 5, af: 30 }, { at: 10, af: 30 }, { at: 15, af: 30 },
  { at: 20, af: 30 }, { at: 30, af: 30 }, { at: 40, af: 50 }, { at: 50, af: 50 },
  { at: 60, af: 100 }, { at: 75, af: 100 }, { at: 100, af: 100 }, { at: 125, af: 125 },
  { at: 150, af: 250 }, { at: 175, af: 250 }, { at: 200, af: 250 }, { at: 225, af: 250 },
  { at: 250, af: 250 }, { at: 300, af: 400 }, { at: 350, af: 400 }, { at: 400, af: 400 },
  { at: 500, af: 630 }, { at: 600, af: 630 }, { at: 630, af: 630 }, { at: 700, af: 800 },
  { at: 800, af: 800 }, { at: 1000, af: 1000 }, { at: 1200, af: 1200 }, { at: 1400, af: 1600 },
  { at: 1600, af: 1600 }
];

// From Table 4 (Ampacity)
// Format: [Area, 3 Wires Ampacity, 4 Wires Ampacity]
export const AC_WIRE_TABLE = [
  { size: 14, w3: 74, w4: 67 },
  { size: 22, w3: 93, w4: 84 },
  { size: 38, w3: 130, w4: 117 },
  { size: 50, w3: 155, w4: 140 },
  { size: 60, w3: 176, w4: 159 },
  { size: 80, w3: 208, w4: 187 },
  { size: 100, w3: 242, w4: 218 },
  { size: 125, w3: 277, w4: 249 },
  { size: 150, w3: 309, w4: 278 },
  { size: 200, w3: 359, w4: 323 },
  { size: 250, w3: 412, w4: 371 },
  { size: 325, w3: 469, w4: 422 },
  { size: 400, w3: 530, w4: 0 }, // Table 4 empty for 400/500 4-wire
  { size: 500, w3: 579, w4: 0 },
];

// From Table 6 (Dimensions)
// Format: [Size, SingleCoreOD, 4CoreOD]
export const AC_CABLE_DIMS = [
  { size: 14, single: 8.7, multi: 21 },
  { size: 22, single: 9.8, multi: 24 },
  { size: 30, single: 10.5, multi: 25.7 }, // Note: 30 is in OD table but 38 is in Ampacity. Using 38 for sizing, interpolating or mapping.
  { size: 38, single: 11.9, multi: 29.0 }, 
  { size: 50, single: 13.7, multi: 32.0 },
  { size: 60, single: 14.6, multi: 34.0 },
  { size: 80, single: 16.0, multi: 38.0 },
  { size: 100, single: 17.4, multi: 43.0 },
  { size: 125, single: 20.2, multi: 47.0 },
  { size: 150, single: 21.7, multi: 51.0 },
  { size: 200, single: 23.6, multi: 55.0 },
  { size: 250, single: 25.9, multi: 60.0 },
  { size: 325, single: 29.1, multi: 70.0 },
  { size: 400, single: 32.0, multi: 0 },
  { size: 500, single: 34.5, multi: 0 },
];

// From Table 7 (Busbar)
export const BUSBARS: Busbar[] = [
  { width: 15, thickness: 2, conductors: 1, acAmpacity: 130 },
  { width: 15, thickness: 3, conductors: 1, acAmpacity: 155 },
  { width: 20, thickness: 2, conductors: 1, acAmpacity: 175 },
  { width: 20, thickness: 3, conductors: 1, acAmpacity: 220 },
  { width: 20, thickness: 5, conductors: 1, acAmpacity: 285 },
  { width: 25, thickness: 3, conductors: 1, acAmpacity: 250 },
  { width: 25, thickness: 5, conductors: 1, acAmpacity: 325 },
  { width: 30, thickness: 3, conductors: 1, acAmpacity: 305 },
  { width: 30, thickness: 5, conductors: 1, acAmpacity: 370 },
  { width: 30, thickness: 5, conductors: 2, acAmpacity: 670 },
  { width: 40, thickness: 5, conductors: 1, acAmpacity: 420 },
  { width: 40, thickness: 5, conductors: 2, acAmpacity: 800 },
  { width: 40, thickness: 10, conductors: 1, acAmpacity: 715 },
  { width: 40, thickness: 10, conductors: 2, acAmpacity: 1230 },
  { width: 50, thickness: 5, conductors: 1, acAmpacity: 585 },
  { width: 50, thickness: 5, conductors: 2, acAmpacity: 1030 },
  { width: 50, thickness: 10, conductors: 1, acAmpacity: 875 },
  { width: 50, thickness: 10, conductors: 2, acAmpacity: 1600 },
  { width: 60, thickness: 5, conductors: 1, acAmpacity: 700 },
  { width: 60, thickness: 8, conductors: 1, acAmpacity: 875 },
  { width: 60, thickness: 10, conductors: 1, acAmpacity: 1000 },
];

// From Table 8 (Conduit RSG)
// Maps Wire Size -> [Single Core, 2, 3, 4, 5]
export const CONDUIT_TABLE: Record<number, number[]> = {
  8: [16, 22, 22, 28, 28],
  14: [16, 22, 28, 28, 36],
  22: [16, 28, 28, 36, 42],
  30: [16, 36, 36, 36, 42],
  38: [22, 36, 36, 42, 54],
  50: [22, 36, 42, 54, 54],
  60: [22, 42, 42, 54, 70],
  80: [28, 42, 54, 54, 70],
  100: [28, 54, 54, 70, 70],
  125: [36, 54, 70, 70, 82],
  150: [36, 70, 70, 82, 82],
  200: [36, 70, 70, 82, 92],
  250: [42, 82, 82, 92, 104],
  325: [54, 82, 92, 104, 0],
  400: [54, 92, 92, 0, 0],
  500: [54, 104, 104, 0, 0],
};
