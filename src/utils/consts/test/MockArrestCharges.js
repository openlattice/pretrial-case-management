import Immutable from 'immutable';

export const MOCK_VIOLENT_CHARGE_1 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['26-10-1'],
  'event.OffenseLocalDescription': ['Abuse or Cruelty to a Minor Under Age 7 (F3) (Minor Injuries)']
});

export const MOCK_VIOLENT_CHARGE_2 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['22-49-2'],
  'event.OffenseLocalDescription': ['Human Trafficking(F2)']
});

export const MOCK_STEP_2_CHARGE_V_1 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['22-19-1'],
  'event.OffenseLocalDescription': ['Kidnapping 1st Degree(FC)']
});

export const MOCK_STEP_2_CHARGE_V_2 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['22-16-5'],
  'event.OffenseLocalDescription': ['Premeditated Design to Effect the Death Defined']
});

export const MOCK_STEP_4_CHARGE_NV = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['22-14-8'],
  'event.OffenseLocalDescription': ['Concealment of a weapon with intent to commit felony']
});

export const MOCK_STEP_4_CHARGE_V = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['22-18-1.1'],
  'event.OffenseLocalDescription': ['Aggravated Assault (F3)']
});

export const MOCK_BHE_CHARGE_1 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['4.12'],
  'event.OffenseLocalDescription': ['County - Animal Care and Treatment (M2)']
});

export const MOCK_BHE_CHARGE_2 = Immutable.fromJS({
  'event.OffenseLocalCodeSection': ['41:05:05:03'],
  'event.OffenseLocalDescription': ['Boating - Fire Extinguisher Required (M2)']
});
