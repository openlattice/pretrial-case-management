import Immutable from 'immutable';

import { PROPERTY_TYPES } from '../DataModelConsts';

export const CHARGE_TYPES = {
  STEP_TWO: 'STEP_TWO',
  STEP_FOUR: 'STEP_FOUR',
  ALL_VIOLENT: 'ALL_VIOLENT'
};

export const MOCK_VIOLENT_CHARGE_1 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['26-10-1'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Abuse or Cruelty to a Minor Age 7+ (F4) (Minor Injuries)']
});

export const MOCK_VIOLENT_CHARGE_2 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-49-2'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Human Trafficking(F2)']
});

export const MOCK_STEP_2_CHARGE_V_1 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-19-1'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Kidnapping 1st Degree(FC)']
});

export const MOCK_STEP_2_CHARGE_V_2 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-16-5'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Premeditated Design to Effect the Death Defined']
});

export const MOCK_STEP_4_CHARGE_NV = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-14-8'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Concealment of a weapon with intent to commit felony']
});

export const MOCK_STEP_4_CHARGE_V = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-18-1.1'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Aggravated Assault (F3)']
});

export const MOCK_BHE_CHARGE_1 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['4.12'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['County - Animal Care and Treatment (M2)']
});

export const MOCK_BHE_CHARGE_2 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['41:05:05:03'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Boating - Fire Extinguisher Required (M2)']
});

export const MOCK_BRE_CHARGE_1 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-42-7'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Possession with Intent to Distribute Marijuana 1/2 lb to 1 lb (F4)']
});

export const MOCK_BRE_CHARGE_2 = Immutable.fromJS({
  [PROPERTY_TYPES.CHARGE_STATUTE]: ['22-14-5'],
  [PROPERTY_TYPES.CHARGE_DESCRIPTION]: ['Possession of Firearm with Altered Serial Number(F6)']
});

export const CHARGE_VALUES = {
  [CHARGE_TYPES.STEP_TWO]: Immutable.fromJS([
    MOCK_STEP_2_CHARGE_V_1,
    MOCK_STEP_2_CHARGE_V_2
  ]),

  [CHARGE_TYPES.STEP_FOUR]: Immutable.fromJS([
    MOCK_STEP_4_CHARGE_NV,
    MOCK_STEP_4_CHARGE_V
  ]),

  [CHARGE_TYPES.ALL_VIOLENT]: Immutable.fromJS([
    MOCK_VIOLENT_CHARGE_1,
    MOCK_VIOLENT_CHARGE_2,
    MOCK_STEP_2_CHARGE_V_1,
    MOCK_STEP_2_CHARGE_V_2,
    MOCK_STEP_4_CHARGE_V
  ])
};

export const PENN_BOOKING_HOLD_EXCEPTIONS = Immutable.fromJS([
  MOCK_BHE_CHARGE_1,
  MOCK_BHE_CHARGE_2
]);

export const PENN_BOOKING_RELEASE_EXCEPTIONS = Immutable.fromJS([
  MOCK_BRE_CHARGE_1,
  MOCK_BRE_CHARGE_2
]);
