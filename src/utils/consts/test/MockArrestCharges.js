import Immutable from 'immutable';

import { CHARGE } from '../Consts';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const CHARGE_TYPES = {
  STEP_TWO: 'STEP_TWO',
  STEP_FOUR: 'STEP_FOUR',
  ALL_VIOLENT: 'ALL_VIOLENT'
};

export const MOCK_VIOLENT_CHARGE_1 = Immutable.fromJS({
  [STATUTE]: ['26-10-1'],
  [DESCRIPTION]: ['Abuse or Cruelty to a Minor Age 7+ (F4) (Minor Injuries)']
});

export const MOCK_VIOLENT_CHARGE_2 = Immutable.fromJS({
  [STATUTE]: ['22-49-2'],
  [DESCRIPTION]: ['Human Trafficking(F2)']
});

export const MOCK_STEP_2_CHARGE_V_1 = Immutable.fromJS({
  [STATUTE]: ['22-19-1'],
  [DESCRIPTION]: ['Kidnapping 1st Degree(FC)']
});

export const MOCK_STEP_2_CHARGE_V_2 = Immutable.fromJS({
  [STATUTE]: ['22-16-5'],
  [DESCRIPTION]: ['Premeditated Design to Effect the Death Defined']
});

export const MOCK_STEP_4_CHARGE_NV = Immutable.fromJS({
  [STATUTE]: ['22-14-8'],
  [DESCRIPTION]: ['Concealment of a weapon with intent to commit felony']
});

export const MOCK_STEP_4_CHARGE_V = Immutable.fromJS({
  [STATUTE]: ['22-18-1.1'],
  [DESCRIPTION]: ['Aggravated Assault (F3)']
});

export const MOCK_BHE_CHARGE_1 = Immutable.fromJS({
  [STATUTE]: ['4.12'],
  [DESCRIPTION]: ['County - Animal Care and Treatment (M2)']
});

export const MOCK_BHE_CHARGE_2 = Immutable.fromJS({
  [STATUTE]: ['41:05:05:03'],
  [DESCRIPTION]: ['Boating - Fire Extinguisher Required (M2)']
});

export const MOCK_BRE_CHARGE_1 = Immutable.fromJS({
  [STATUTE]: ['22-42-7'],
  [DESCRIPTION]: ['Possession with Intent to Distribute Marijuana 1/2 lb to 1 lb (F4)']
});

export const MOCK_BRE_CHARGE_2 = Immutable.fromJS({
  [STATUTE]: ['22-14-5'],
  [DESCRIPTION]: ['Possession of Firearm with Altered Serial Number(F6)']
});

export const CHARGE_VALUES = {
  [CHARGE_TYPES.STEP_TWO]: [
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Kidnapping 1st Degree(FC)'
    },
    {
      [STATUTE]: ['22-16-5'],
      [DESCRIPTION]: ['Premeditated Design to Effect the Death Defined']
    }
  ],

  [CHARGE_TYPES.STEP_FOUR]: [
    {
      [STATUTE]: '22-10-5',
      [DESCRIPTION]: 'Aggravated Riot (Carrying Dangerous Weapon) (F3)'
    },
    {
      [STATUTE]: '25-10-13(M1)',
      [DESCRIPTION]: 'Violation of Protection or No Contact Order'
    },
    {
      [STATUTE]: ['22-14-8'],
      [DESCRIPTION]: ['Concealment of a weapon with intent to commit felony']
    },
    {
      [STATUTE]: ['22-18-1.1'],
      [DESCRIPTION]: ['Aggravated Assault (F3)']
    }
  ],

  [CHARGE_TYPES.ALL_VIOLENT]: [
    {
      [STATUTE]: '22-19-1',
      [DESCRIPTION]: 'Kidnapping 1st Degree(FC)'
    },
    {
      [STATUTE]: '26-10-1',
      [DESCRIPTION]: 'Abuse or Cruelty to a Minor Age 7+ (F4) (Minor Injuries)'
    },
    {
      [STATUTE]: '22-49-2',
      [DESCRIPTION]: 'Human Trafficking(F2)'
    },
    {
      [STATUTE]: ['22-16-5'],
      [DESCRIPTION]: ['Premeditated Design to Effect the Death Defined']
    },
    {
      [STATUTE]: ['22-18-1.1'],
      [DESCRIPTION]: ['Aggravated Assault (F3)']
    }
  ]
};

export const PENN_BOOKING_HOLD_EXCEPTIONS = [
  {
    [STATUTE]: ['4.12'],
    [DESCRIPTION]: ['County - Animal Care and Treatment (M2)']
  },
  {
    [STATUTE]: ['41:05:05:03'],
    [DESCRIPTION]: ['Boating - Fire Extinguisher Required (M2)']
  }
];

export const PENN_BOOKING_RELEASE_EXCEPTIONS = [
  {
    [STATUTE]: ['22-42-7'],
    [DESCRIPTION]: ['Possession with Intent to Distribute Marijuana 1/2 lb to 1 lb (F4)']
  },
  {
    [STATUTE]: ['22-14-5'],
    [DESCRIPTION]: ['Possession of Firearm with Altered Serial Number(F6)']
  }
];
