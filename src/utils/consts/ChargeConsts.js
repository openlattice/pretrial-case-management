/*
 * @flow
 */

import Immutable from 'immutable';

import { PROPERTY_TYPES } from './DataModelConsts';
import { formatValue, formatDateList } from '../Utils';

const {
  CHARGE_NUM_FQN,
  DISPOSITION_DATE
} = PROPERTY_TYPES;

const VIOLENT_CHARGES = [
  '16-10-32',
  '22-41-1',
  '22-4-2',
  '22-4a-1',
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
  '22-18-26',
  '22-18-26.1',
  '22-18-29',
  '22-18-29.1',
  '22-18-31',
  '22-18-37',
  '22-19-1',
  '22-19-1.1',
  '22-19-17',
  '22-19a-1',
  '22-19a-7',
  '22-22-1',
  '22-22-7',
  '22-22-7.2',
  '22-22-7.4',
  '22-22-7.7',
  '22-22-24.3',
  '22-22-28',
  '22-22-29',
  '22-24a-5',
  '22-30-1',
  '22-32-1',
  '22-33-9.1',
  '22-33-10',
  '22-46-2',
  '22-49-1',
  '22-49-2',
  '22-49-3',
  '26-10-1',
  '26-10-30'
];

const GUILTY_DISPOSITIONS = [
  'Convicted at Trial',
  'Convicted at Trial/Punishment Enhanced by Part II Info',
  'Conviction-Death Penalty',
  'Guilty But Mentally Ill',
  'Jail',
  'Judgment on Plea of Guilty',
  'No Formal Action',
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

const stripDegree = (chargeNum :string) :string => chargeNum.trim().split('(')[0];

export const chargeIsViolent = (chargeNum :string) :boolean => VIOLENT_CHARGES.includes(stripDegree(chargeNum));

export const getUnique = (valueList :Immutable.List<string>) :Immutable.List<string> =>
  valueList.filter((val, index) => valueList.indexOf(val) === index);

export const getViolentChargeNums = (chargeFields :Immutable.List<string>) :Immutable.List<string> =>
  getUnique(chargeFields.filter(charge => charge && chargeIsViolent(charge)));

export const chargeFieldIsViolent = (chargeField :Immutable.List<string>) => getViolentChargeNums(chargeField).size > 0;

export const dispositionIsGuilty = (disposition :string) :boolean => GUILTY_DISPOSITIONS.includes(disposition);

export const dispositionFieldIsGuilty = (dispositionField :Immutable.List<string>) :boolean => {
  let guilty = false;
  if (dispositionField.size) {
    dispositionField.forEach((disposition) => {
      if (dispositionIsGuilty(disposition)) guilty = true;
    });
  }
  return guilty;
};

export const degreeFieldIsMisdemeanor = (degreeField :Immutable.List<string>) :boolean => {
  let result = false;
  degreeField.forEach((degree) => {
    if (degree.toLowerCase().startsWith('m')) result = true;
  });
  return result;
};

export const degreeFieldIsFelony = (degreeField :Immutable.List<string>) :boolean => {
  let result = false;
  degreeField.forEach((degree) => {
    if (degree.toLowerCase().startsWith('f')) result = true;
  });
  return result;
};

export const getChargeTitle = (charge :Immutable.Map<*, *>) :string => {
  const degree = formatValue(charge.get(CHARGE_NUM_FQN, Immutable.List()));
  const dispositionDate = formatDateList(charge.get(DISPOSITION_DATE, Immutable.List()));
  let val = `${degree}`;
  if (dispositionDate && dispositionDate.length) val = `${val} (${dispositionDate})`;
  return val;
};

export default VIOLENT_CHARGES;
