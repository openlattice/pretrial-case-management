export const CHARGE_IMPORT_1 = {
  statute: 'statute-1',
  description: 'description-1',
  short: 'degree-1',
  degree: 'level-1',
  violent: false,
  maxLevelIncrease: false,
  singleLevelIncrease: false,
  bhe: false,
  bre: false
};

export const CHARGE_IMPORT_1_PTID = {
  reference_statute_ptid: ['statute-1'],
  reference_description_ptid: ['description-1'],
  reference_level_ptid: ['level-1'],
  reference_degree_ptid: ['degree-1'],
  reference_violent_ptid: [false],
  reference_maxLevelIncrease_ptid: [false],
  reference_singleLevelIncrease_ptid: [false],
  reference_bhe_ptid: [false],
  reference_bre_ptid: [false]
};

export const CHARGE_IMPORT_2 = {
  statute: 'statute-2',
  description: 'description-2',
  short: 'degree-2',
  degree: 'level-2',
  violent: true,
  maxLevelIncrease: true,
  singleLevelIncrease: false,
  bhe: false,
  bre: true
};

export const CHARGE_IMPORT_2_PTID = {
  reference_statute_ptid: ['statute-2'],
  reference_description_ptid: ['description-2'],
  reference_level_ptid: ['level-2'],
  reference_degree_ptid: ['degree-2'],
  reference_violent_ptid: [true],
  reference_maxLevelIncrease_ptid: [true],
  reference_singleLevelIncrease_ptid: [false],
  reference_bhe_ptid: [false],
  reference_bre_ptid: [true]
};

export const CHARGE_IMPORT_3 = {
  statute: 'statute-3',
  short: 'level-3',
  degree: 'degree-3',
  violent: true,
  maxLevelIncrease: true,
  singleLevelIncrease: false,
  bhe: false,
  bre: true
};

export const CHARGE_IMPORT_4 = {
  statute: 'statute-4',
  violent: true,
  maxLevelIncrease: true,
  singleLevelIncrease: false,
};

export const CHARGE_IMPORT_5 = {
  statute: 'statute-5',
  description: 'description-5',
  short: 'level-5',
  degree: 'degree-5',
  violent: 'this is a string, not a boolean',
  maxLevelIncrease: true,
  singleLevelIncrease: false,
  bhe: false,
  bre: true
};

export const CHARGE_IMPORT_6 = {
  statute: true,
  description: 'description-6',
  short: 'level-6',
  degree: 'degree-6',
  violent: true,
  maxLevelIncrease: true,
  singleLevelIncrease: false,
  bhe: false,
  bre: true
};
