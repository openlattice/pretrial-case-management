/*
 * @flow
 */

import Immutable from 'immutable';

import { PROPERTY_TYPES } from './DataModelConsts';
import { formatValue, formatDateList } from '../Utils';

const {
  CHARGE_ID,
  CHARGE_STATUTE,
  CHARGE_DESCRIPTION,
  DISPOSITION_DATE,
  MOST_SERIOUS_CHARGE_NO
} = PROPERTY_TYPES;

type ChargeDetails = {
  caseNum :string,
  dispositionDate :string,
  statute :string,
  description :string
};

const VIOLENT_CHARGES = [
  '16-10-32',
  '22-4-1',
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

const MISDEMEANOR_CHARGE_LEVEL_CODES :Set<string> = Immutable.Set([
  'M1',
  'M2'
]);

const stripDegree = (chargeNum :string) :string => chargeNum.split('(')[0].trim();

export const getCaseNumFromCharge = (charge :Immutable.Map<*, *>) =>
  charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0];

export const shouldIgnoreCharge = (charge :Immutable.Map<*, *>) => {
  const severities = charge.get(PROPERTY_TYPES.CHARGE_LEVEL, Immutable.List());
  const poaCaseNums = charge.get(PROPERTY_TYPES.CHARGE_ID, Immutable.List()).filter(caseNum => caseNum.includes('POA'));
  return severities.includes('MO') || severities.includes('PO') || severities.includes('P') || poaCaseNums.size;
};

export const chargeStatuteIsViolent = (chargeNum :string) :boolean =>
  VIOLENT_CHARGES.includes(stripDegree(chargeNum.toLowerCase()));

export const chargeIsMostSerious = (charge :Immutable.Map<*, *>, pretrialCase :Immutable.Map<*, *>) => {
  let mostSerious = false;

  const statuteField = charge.get(CHARGE_STATUTE, Immutable.List());
  const mostSeriousNumField = pretrialCase.get(MOST_SERIOUS_CHARGE_NO, Immutable.List());
  statuteField.forEach((chargeNum) => {
    mostSeriousNumField.forEach((mostSeriousNum) => {
      if (mostSeriousNum === chargeNum) mostSerious = true;
    });
  });

  return mostSerious;
};

export const getUnique = (valueList :Immutable.List<string>) :Immutable.List<string> =>
  valueList.filter((val, index) => valueList.indexOf(val) === index);

export const getViolentChargeNums = (chargeFields :Immutable.List<string>) :Immutable.List<string> =>
  getUnique(chargeFields.filter(charge => charge && chargeStatuteIsViolent(charge)));

export const chargeFieldIsViolent = (chargeField :Immutable.List<string>) => getViolentChargeNums(chargeField).size > 0;

export const chargeIsViolent = (charge :Immutable.Map<*, *>) => {
  if (shouldIgnoreCharge(charge)) return false;
  return chargeFieldIsViolent(charge.get(PROPERTY_TYPES.CHARGE_STATUTE, Immutable.List()));
};

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

export const chargeIsGuilty = (charge :Immutable.Map<*, *>) => {
  return dispositionIsGuilty(charge.get(PROPERTY_TYPES.DISPOSITION, Immutable.List()));
};

export const degreeFieldIsMisdemeanor = (degreeField :Immutable.List<string>) :boolean => {

  if (!degreeField || degreeField.isEmpty()) {
    return false;
  }

  return degreeField.reduce(
    (isMisdemeanor :boolean, degree :string) => (
      MISDEMEANOR_CHARGE_LEVEL_CODES.has(degree.toUpperCase()) || isMisdemeanor
    ),
    false
  );
};

export const chargeIsMisdemeanor = (charge :Immutable.Map<*, *>) => {
  if (shouldIgnoreCharge(charge)) return false;
  return degreeFieldIsMisdemeanor(charge.get(PROPERTY_TYPES.CHARGE_LEVEL));
};

export const degreeFieldIsFelony = (degreeField :Immutable.List<string>) :boolean => {
  let result = false;
  degreeField.forEach((degree) => {
    if (degree.toLowerCase().startsWith('f')) result = true;
  });
  return result;
};

export const chargeIsFelony = (charge :Immutable.Map<*, *>) => {
  if (shouldIgnoreCharge(charge)) return false;
  return degreeFieldIsFelony(charge.get(PROPERTY_TYPES.CHARGE_LEVEL));
};

export const getChargeDetails = (charge :Immutable.Map<*, *>, ignoreCase? :boolean) :ChargeDetails => {
  const caseNum = ignoreCase ? null : getCaseNumFromCharge(charge);
  const statute = formatValue(charge.get(CHARGE_STATUTE, Immutable.List()));
  const description = formatValue(charge.get(CHARGE_DESCRIPTION, Immutable.List()));
  const dispositionDate = formatDateList(charge.get(DISPOSITION_DATE, Immutable.List()));
  return {
    caseNum,
    statute,
    description,
    dispositionDate
  };
};

export const getChargeTitle = (charge :Immutable.Map<*, *>, hideCase :boolean) :string => {
  const {
    caseNum,
    statute,
    description,
    dispositionDate
  } = getChargeDetails(charge);

  let val = '';
  if (!hideCase && caseNum.length) val = `${caseNum} `;
  val = `${val}${statute}`;
  if (description) {
    val = `${val} ${description}`;
  }
  if (dispositionDate && dispositionDate.length) val = `${val} (${dispositionDate})`;
  return val;
};

export const getSummaryStats = (chargesByCaseNum :Immutable.Map<*>) => {
  let numMisdemeanorCharges = 0;
  let numMisdemeanorConvictions = 0;
  let numFelonyCharges = 0;
  let numFelonyConvictions = 0;
  let numViolentCharges = 0;
  let numViolentConvictions = 0;

  chargesByCaseNum.valueSeq().forEach((chargeList) => {
    chargeList.forEach((charge) => {
      const degreeField = charge.get(PROPERTY_TYPES.CHARGE_LEVEL, Immutable.List()).filter(val => !!val);
      const chargeField = charge.get(PROPERTY_TYPES.CHARGE_STATUTE, Immutable.List()).filter(val => !!val);
      const convicted = dispositionFieldIsGuilty(
        charge.get(PROPERTY_TYPES.DISPOSITION, Immutable.List()).filter(val => !!val)
      );
      if (degreeFieldIsMisdemeanor(degreeField)) {
        numMisdemeanorCharges += 1;
        if (convicted) numMisdemeanorConvictions += 1;
      }
      else if (degreeFieldIsFelony(degreeField)) {
        numFelonyCharges += 1;
        if (convicted) numFelonyConvictions += 1;
      }

      if (chargeFieldIsViolent(chargeField)) {
        numViolentCharges += 1;
        if (convicted) numViolentConvictions += 1;
      }
    });
  });

  return {
    numMisdemeanorCharges,
    numMisdemeanorConvictions,
    numFelonyCharges,
    numFelonyConvictions,
    numViolentCharges,
    numViolentConvictions
  };
};

export default VIOLENT_CHARGES;
