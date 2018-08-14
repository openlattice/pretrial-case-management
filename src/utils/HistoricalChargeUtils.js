/*
 * @flow
 */

import Immutable from 'immutable';

import { GUILTY_DISPOSITIONS, MISDEMEANOR_CHARGE_LEVEL_CODES, VIOLENT_CHARGES } from './consts/ChargeConsts';
import { PLEAS_TO_IGNORE } from './consts/PleaConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { formatValue, formatDateList } from './FormattingUtils';


const {
  CHARGE_ID,
  CHARGE_DESCRIPTION,
  CHARGE_LEVEL,
  CHARGE_STATUTE,
  DISPOSITION,
  DISPOSITION_DATE,
  MOST_SERIOUS_CHARGE_NO,
  PLEA
} = PROPERTY_TYPES;

type ChargeDetails = {
  caseNum :string,
  dispositionDate :string,
  statute :string,
  description :string
};

const stripDegree = (chargeNum :string) :string => chargeNum.split('(')[0].trim();

export const getCaseNumFromCharge = (charge :Immutable.Map<*, *>) =>
  charge.getIn([CHARGE_ID, 0], '').split('|')[0];

export const shouldIgnoreCharge = (charge :Immutable.Map<*, *>) => {
  const severities = charge.get(CHARGE_LEVEL, Immutable.List());
  const pleas = charge.get(PLEA, Immutable.List());
  const poaCaseNums = charge.get(CHARGE_ID, Immutable.List()).filter(caseNum => caseNum.includes('POA'));
  const poaPleas = pleas.filter(plea => PLEAS_TO_IGNORE.includes(plea));
  return severities.includes('MO')
    || severities.includes('PO')
    || severities.includes('P')
    || !!poaCaseNums.size
    || !!poaPleas.size;
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
  return chargeFieldIsViolent(charge.get(CHARGE_STATUTE, Immutable.List()));
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
  if (shouldIgnoreCharge(charge)) return false;
  return dispositionFieldIsGuilty(charge.get(DISPOSITION, Immutable.List()));
};

export const degreeFieldIsMisdemeanor = (degreeField :Immutable.List<string>) :boolean => {

  if (!degreeField || degreeField.isEmpty()) {
    return false;
  }

  return degreeField.filter(val => val).reduce(
    (isMisdemeanor :boolean, degree :string) => (
      MISDEMEANOR_CHARGE_LEVEL_CODES.has(degree.toUpperCase()) || isMisdemeanor
    ),
    false
  );
};

export const chargeIsMisdemeanor = (charge :Immutable.Map<*, *>) => {
  if (shouldIgnoreCharge(charge)) return false;
  return degreeFieldIsMisdemeanor(charge.get(PROPERTY_TYPES.CHARGE_LEVEL, Immutable.List()));
};

export const degreeFieldIsFelony = (degreeField :Immutable.List<string>) :boolean => {
  let result = false;
  degreeField.forEach((degree) => {
    if (degree && degree.toLowerCase().startsWith('f')) result = true;
  });
  return result;
};

export const chargeIsFelony = (charge :Immutable.Map<*, *>) => {
  if (shouldIgnoreCharge(charge)) return false;
  return degreeFieldIsFelony(charge.get(PROPERTY_TYPES.CHARGE_LEVEL, Immutable.List()));
};

export const getChargeDetails = (charge :Immutable.Map<*, *>, ignoreCase? :boolean) :ChargeDetails => {
  const caseNum :string = ignoreCase ? null : getCaseNumFromCharge(charge);
  const statute :string = formatValue(charge.get(CHARGE_STATUTE, Immutable.List()));
  const description :string = formatValue(charge.get(CHARGE_DESCRIPTION, Immutable.List()));
  const dispositionDate :string = formatDateList(charge.get(DISPOSITION_DATE, Immutable.List()));
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
      const degreeField = charge.get(CHARGE_LEVEL, Immutable.List()).filter(val => !!val);
      const chargeField = charge.get(CHARGE_STATUTE, Immutable.List()).filter(val => !!val);
      const convicted = dispositionFieldIsGuilty(
        charge.get(DISPOSITION, Immutable.List()).filter(val => !!val)
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
