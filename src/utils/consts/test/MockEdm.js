/*
 * @flow
 */

import { fromJS } from 'immutable';
import { PROPERTY_TYPES } from '../DataModelConsts';

const {
  BHE,
  BRE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
  REFERENCE_CHARGE_LEVEL,
  REFERENCE_CHARGE_DEGREE
} = PROPERTY_TYPES;

export default fromJS({
  fqnToIdMap: {
    [REFERENCE_CHARGE_STATUTE]: 'reference_statute_ptid',
    [REFERENCE_CHARGE_DESCRIPTION]: 'reference_description_ptid',
    [REFERENCE_CHARGE_LEVEL]: 'reference_level_ptid',
    [REFERENCE_CHARGE_DEGREE]: 'reference_degree_ptid',
    [CHARGE_IS_VIOLENT]: 'reference_violent_ptid',
    [BHE]: 'reference_bhe_ptid',
    [BRE]: 'reference_bre_ptid',
    [CHARGE_RCM_STEP_2]: 'reference_maxLevelIncrease_ptid',
    [CHARGE_RCM_STEP_4]: 'reference_singleLevelIncrease_ptid'
  }
});
