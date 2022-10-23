import configureMeasurements, { volume, VolumeUnits, mass, MassUnits, pieces, PiecesSystems, PiecesUnits } from 'convert-units';

type Measures = 'volume' | 'mass' | 'pieces' | 'custom';
type Systems = 'metric' | PiecesSystems | 'customSystem';
type Units = VolumeUnits | MassUnits | PiecesUnits | 'customUnit';

const custom = {
  systems: {
    customSystem: {
      customUnit: {
        name: {
          singular: 'a',
          plural: 'as',
        },
        to_anchor: 1,
      },
    },
  },
};

export default configureMeasurements<Measures, Systems, Units>({ volume, mass, pieces, custom });

// Arbitrary units that I don't like:
export const forbiddenUnits = [
  // mass:
  'mcg',
  // 'mg',
  // 'g',
  // 'kg',
  'oz',
  'lb',
  'mt',
  't',

  // volume:

  'mm3',
  'cm3',
  // "ml",
  // "l",
  'kl',
  'Ml',
  'Gl',
  'm3',
  'km3',
  'cl',
  'dl',
  'krm',
  'tsk',
  'msk',
  'kkp',
  'glas',
  'kanna',
  // "tsp",
  // "Tbs",
  'in3',
  'fl-oz',
  // "cup",
  'pnt',
  'qt',
  'gal',
  'ft3',
  'yd3',

  // pieces:
  //   'pcs',
  'bk-doz',
  'cp',
  'doz-doz',
  //   "doz",
  'gr-gr',
  'gros',
  //   "half-dozen",
  'long-hundred',
  'ream',
  'scores',
  'sm-gr',
  'trio',
];
