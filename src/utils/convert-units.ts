import configureMeasurements, { volume, VolumeSystems, VolumeUnits, mass, MassSystems, MassUnits } from 'convert-units';

type Measures = 'volume' | 'mass';
// type Systems = VolumeSystems | MassSystems;
type Systems = 'metric';
type Units = VolumeUnits | MassUnits;

export default configureMeasurements<Measures, Systems, Units>({ volume, mass });
