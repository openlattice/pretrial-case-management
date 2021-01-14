import Immutable from 'immutable';

import { getEntityKeyId } from '../DataUtils';
import { PROPERTY_TYPES } from './DataModelConsts';

const {
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
  REFERENCE_CHARGE_LEVEL,
  REFERENCE_CHARGE_DEGREE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  BHE,
  BRE,
} = PROPERTY_TYPES;

export const DYNAMIC_TYPED_COLUMNS = {
  statute: false,
  description: false,
  degree: false,
  short: false,
  violent: true,
  maxLevelIncrease: true,
  singleLevelIncrease: true,
  bhe: true,
  bre: true,
};

export const PROPERTY_TYPE_MAPPINGS = {
  statute: REFERENCE_CHARGE_STATUTE,
  description: REFERENCE_CHARGE_DESCRIPTION,
  degree: REFERENCE_CHARGE_LEVEL,
  short: REFERENCE_CHARGE_DEGREE,
  violent: CHARGE_IS_VIOLENT,
  maxLevelIncrease: CHARGE_RCM_STEP_2,
  singleLevelIncrease: CHARGE_RCM_STEP_4,
  bhe: BHE,
  bre: BRE,
};

export const ODYSSEY_VIOLENT_STATUTES = [
  '22-4-1',
  '22-4-2',
  '22-8-12',
  '22-10-1',
  '22-10-5',
  '22-10-5.1',
  '22-10-6',
  '22-10-6.1',
  '22-11a-2',
  '22-14-20',
  '22-14a-5',
  '22-14a-6',
  '22-14a-11',
  '22-14a-19',
  '22-14a-20',
  '22-16-1',
  '22-16-1.1',
  '22-16-4',
  '22-16-5',
  '22-16-7',
  '22-16-15',
  '22-16-20',
  '22-16-41',
  '22-17-6',
  '22-18-1',
  '22-18-1.05',
  '22-18-1.1',
  '22-18-1.2',
  '22-18-1.3',
  '22-18-1.4',
  '22-18-1.5',
  '22-18-26',
  '22-18-26.1',
  '22-18-29',
  '22-18-29.1',
  '22-18-31',
  '22-18-37',
  '22-19-1.1',
  '22-19-1',
  '22-19a-1',
  '22-19a-7',
  '22-19-17',
  '22-22-1',
  '22-22-24.3',
  '22-22-28',
  '22-22-29',
  '22-22-7.2',
  '22-22-7.4',
  '22-22-7',
  '22-22-7.7',
  '22-24a-5',
  '22-30-1',
  '22-30-6',
  '22-30-7',
  '22-32-1',
  '22-33-10',
  '22-33-9.1',
  '22-46-2',
  '22-49-1',
  '22-49-2',
  '22-49-3',
  '22-4a-1',
  '26-10-1',
  '26-10-30',
  '26-10-32',
];

export const ODYSSEY_EXCEPTION_DESCRIPTIONS = {
  '22-46-2': ['Emotional or psychological abuse of Disabled Adult']
};

export const GUILTY_DISPOSITIONS = [
  'Convicted at Trial',
  'Convicted at Trial/Punishment Enhanced by Part II Info',
  'Conviction-Death Penalty',
  'Deferred Imposition of Sentence',
  'Guilty But Mentally Ill',
  'Jail',
  'Judgment on Plea of Guilty',
  'Punishment Enhanced by Part II Information',
  'Restitution',
  'Stipulate to Facts-Found Guilty',
  'Suspended Execution of Sentence',
  'Suspended Execution of Sentence Revoked and Released',
  'Suspended Execution Revocation to Jail',
  'Suspended Execution Revocation to Penitentiary',
  'Suspended Execution Revocation/Continued on Probation',
  'Stipulate to Facts-Found Guilty',
  'Suspended Execution of Sentence',
  'Suspended Execution of Sentence Revoked and Released',
  'Suspended Imposition of Sentence',
  'Suspended Imposition Revocation to Jail',
  'Suspended Imposition Revocation to Penitentiary',
  'Suspended Imposition Revocation/Continued on Probation',
  'Suspended Imposition Revoked/Released'
];

export const MISDEMEANOR_CHARGE_LEVEL_CODES :Set<string> = Immutable.Set([
  'M1',
  'M2'
]);

export const CHARGE_TYPES = {
  ARREST: 'arrest',
  COURT: 'court'
};

export const CHARGE_HEADERS = {
  STATUTE: 'Statute',
  DESCRIPTION: 'Description',
  DEGREE: 'Degree',
  DEGREE_SHORT: '(short)',
  VIOLENT: 'Violent',
  STEP_2: 'Max Increase',
  STEP_4: 'Single Increase',
  BHE: 'BHE',
  BRE: 'BRE'
};

export const getChargeConsts = (charge) => {
  const degree = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, 0], '');
  const degreeShort = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, 0], '');
  const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
  const entityKeyId = getEntityKeyId(charge);
  const isViolent = charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false);
  const isStep2 = charge.getIn([PROPERTY_TYPES.CHARGE_RCM_STEP_2, 0], false);
  const isStep4 = charge.getIn([PROPERTY_TYPES.CHARGE_RCM_STEP_4, 0], false);
  const isBRE = charge.getIn([PROPERTY_TYPES.BRE, 0], false);
  const isBHE = charge.getIn([PROPERTY_TYPES.BHE, 0], false);
  const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
  return {
    degree,
    degreeShort,
    description,
    entityKeyId,
    isViolent,
    isStep2,
    isStep4,
    isBRE,
    isBHE,
    statute
  };
};
