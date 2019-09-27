/*
 * @flow
 */
import { PSA, DMF, CONTEXT } from '../Consts';
import { PROPERTY_TYPES } from '../DataModelConsts';
import { RCM, SETTINGS } from '../AppSettingConsts';
import {
  BOOKING_CONDITIONS,
  COLORS,
  DEFAULT_CONDITIONS,
  defaultConditions,
  defaultLevels,
  defaultMatrix,
  RELEASE_TYPES,
  RESULTS
} from '../RCMResultsConsts';


export const defaultSettigns = {
  [SETTINGS.STEP_INCREASES]: false,
  [SETTINGS.SECONDARY_BOOKING_CHARGES]: false,
  [SETTINGS.RCM]: {
    [RCM.CONDITIONS]: defaultConditions,
    [RCM.MATRIX]: defaultMatrix,
    [RCM.LEVELS]: defaultLevels
  }
};

export const settingsWithStepIncreases = {
  [SETTINGS.STEP_INCREASES]: true,
  [SETTINGS.SECONDARY_BOOKING_CHARGES]: false,
  [SETTINGS.RCM]: {
    [RCM.CONDITIONS]: defaultConditions,
    [RCM.MATRIX]: defaultMatrix,
    [RCM.LEVELS]: defaultLevels
  }
};

export const settingsWithSecondaryHoldCharges = {
  [SETTINGS.STEP_INCREASES]: false,
  [SETTINGS.SECONDARY_BOOKING_CHARGES]: true,
  [SETTINGS.RCM]: {
    [RCM.CONDITIONS]: defaultConditions,
    [RCM.MATRIX]: defaultMatrix,
    [RCM.LEVELS]: defaultLevels
  }
};

export const settingsWithStepIncreasesAndWithSecondaryHoldCharges = {
  [SETTINGS.STEP_INCREASES]: true,
  [SETTINGS.SECONDARY_BOOKING_CHARGES]: true,
  [SETTINGS.RCM]: {
    [RCM.CONDITIONS]: defaultConditions,
    [RCM.MATRIX]: defaultMatrix,
    [RCM.LEVELS]: defaultLevels
  }
};

export const BOOKING_RCM_2_5 = {
  [PROPERTY_TYPES.COLOR]: COLORS.DARK_GREEN,
  [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
  [PROPERTY_TYPES.CONDITIONS_LEVEL]: 2
};

export const COURT_RCM_1_1 = {
  [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
  [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
  [PROPERTY_TYPES.CONDITIONS_LEVEL]: 1
};

export const COURT_RCM_3_3 = {
  [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
  [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
  [PROPERTY_TYPES.CONDITIONS_LEVEL]: 1
};

export const COURT_RCM_4_5 = {
  [PROPERTY_TYPES.COLOR]: COLORS.ORANGE,
  [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
  [PROPERTY_TYPES.CONDITIONS_LEVEL]: 2
};

export const COURT_RCM_6_6 = {
  [PROPERTY_TYPES.COLOR]: COLORS.RED,
  [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS
};

const scenarios = [
  // STEP 2 DMFs
  {
    settings: settingsWithStepIncreases,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
      [DMF.EXTRADITED]: 'true',
      [DMF.STEP_2_CHARGES]: 'true',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [true],
      [PROPERTY_TYPES.NCA_SCALE]: [6],
      [PROPERTY_TYPES.FTA_SCALE]: [6]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreases,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [true],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [3]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreases,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'true',
      [DMF.EXTRADITED]: 'true',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [3]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreases,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'true',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [true],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [3]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },

  // STEP 4 DMFs
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [3]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.LIGHT_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [true],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [3]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.LIGHT_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [1],
      [PROPERTY_TYPES.FTA_SCALE]: [1]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.DARK_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 2
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_2 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [2],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.YELLOW,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 4
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_4 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [5],
      [PROPERTY_TYPES.FTA_SCALE]: [2]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'true',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [6],
      [PROPERTY_TYPES.FTA_SCALE]: [6]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },

  // BOOKING EXCEPTION DMFs
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [1],
      [PROPERTY_TYPES.FTA_SCALE]: [1]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 1
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_1 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [2],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.LIGHT_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [4]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.DARK_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 2
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_2 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [4],
      [PROPERTY_TYPES.FTA_SCALE]: [4]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.YELLOW,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 4
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_4 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [4],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.ORANGE,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 5
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_5 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: settingsWithStepIncreasesAndWithSecondaryHoldCharges,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'true'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.LIGHT_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },

  // REGULAR DMFs
  {
    settings: defaultSettigns,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [1],
      [PROPERTY_TYPES.FTA_SCALE]: [1]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.BLUE,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 1
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_1 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.RELEASE }
      ]
    }
  },
  {
    settings: defaultSettigns,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [3],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.LIGHT_GREEN,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 3
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_3 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: defaultSettigns,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [4],
      [PROPERTY_TYPES.FTA_SCALE]: [5]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.ORANGE,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.RELEASE_WITH_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 5
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_5 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: defaultSettigns,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [4],
      [PROPERTY_TYPES.FTA_SCALE]: [6]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  },
  {
    settings: defaultSettigns,
    inputData: {
      [PSA.CURRENT_VIOLENT_OFFENSE]: 'false',
      [DMF.EXTRADITED]: 'false',
      [DMF.STEP_2_CHARGES]: 'false',
      [DMF.STEP_4_CHARGES]: 'false',
      [DMF.SECONDARY_RELEASE_CHARGES]: 'false'
    },
    scores: {
      [PROPERTY_TYPES.NVCA_FLAG]: [false],
      [PROPERTY_TYPES.NCA_SCALE]: [6],
      [PROPERTY_TYPES.FTA_SCALE]: [6]
    },
    expected: {
      [RESULTS.RCM]: {
        [PROPERTY_TYPES.COLOR]: COLORS.RED,
        [PROPERTY_TYPES.RELEASE_TYPE]: RELEASE_TYPES.MAXIMUM_CONDITIONS,
        [PROPERTY_TYPES.CONDITIONS_LEVEL]: 6
      },
      [RESULTS.COURT_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: DEFAULT_CONDITIONS.CONDITION_6 }
      ],
      [RESULTS.BOOKING_CONDITIONS]: [
        { [PROPERTY_TYPES.TYPE]: BOOKING_CONDITIONS.HOLD }
      ]
    }
  }
];

export default scenarios;
