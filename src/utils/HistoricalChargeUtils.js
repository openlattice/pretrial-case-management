/*
 * @flow
 */

import { DateTime } from 'luxon';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

import { PLEAS_TO_IGNORE } from './consts/PleaConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties } from './DataUtils';
import { formatValue, formatDateList } from './FormattingUtils';
import {
  GUILTY_DISPOSITIONS,
  MISDEMEANOR_CHARGE_LEVEL_CODES,
  ODYSSEY_VIOLENT_STATUTES,
  ODYSSEY_EXCEPTION_DESCRIPTIONS
} from './consts/ChargeConsts';

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

export const getCaseNumFromCharge = (charge :Map) => charge.getIn([CHARGE_ID, 0], '').split('|')[0];

export const getChargeDetails = (charge :Map, ignoreCase? :boolean) :ChargeDetails => {
  const caseNum :string = ignoreCase ? null : getCaseNumFromCharge(charge);
  const statute :string = formatValue(charge.get(CHARGE_STATUTE, List()));
  const description :string = formatValue(charge.get(CHARGE_DESCRIPTION, List()));
  const dispositionDate :string = formatDateList(charge.get(DISPOSITION_DATE, List()));
  return {
    caseNum,
    statute,
    description,
    dispositionDate
  };
};

export const shouldIgnoreCharge = (charge :Map) => {
  const {
    [CHARGE_LEVEL]: severities,
    [PLEA]: pleas,
    [CHARGE_ID]: chargeIds
  } = getEntityProperties(charge, [CHARGE_LEVEL, PLEA, CHARGE_ID], true);
  const poaCaseNums = chargeIds.filter((caseNum) => caseNum.includes('POA'));
  const poaPleas = pleas.filter((plea) => PLEAS_TO_IGNORE.includes(plea));
  return severities.includes('MO')
    || severities.includes('PO')
    || severities.includes('P')
    || poaCaseNums.length > 0
    || poaPleas.length > 0;
};

export const chargeStatuteIsViolent = (chargeNum :string) :boolean => (
  ODYSSEY_VIOLENT_STATUTES.includes(stripDegree(chargeNum.toLowerCase()))
);

export const chargeIsViolent = (charge :Map) :boolean => {
  if (shouldIgnoreCharge(charge)) return false;
  const { statute, description } = getChargeDetails(charge);
  const strippedStatute = stripDegree(statute.toLowerCase());
  const exception = (ODYSSEY_EXCEPTION_DESCRIPTIONS[strippedStatute])
    && ODYSSEY_EXCEPTION_DESCRIPTIONS[strippedStatute].includes(description);

  return !!(
    charge
    && chargeStatuteIsViolent(statute)
    && !exception
  );
};

export const chargeIsMostSerious = (charge :Map, pretrialCase :Map) => {
  let mostSerious = false;

  const {
    [MOST_SERIOUS_CHARGE_NO]: mostSeriousChargeNum
  } = getEntityProperties(pretrialCase, [MOST_SERIOUS_CHARGE_NO]);
  const {
    [CHARGE_STATUTE]: chargeStatute
  } = getEntityProperties(charge, [CHARGE_STATUTE]);
  if (chargeStatute === mostSeriousChargeNum) mostSerious = true;

  return mostSerious;
};

export const getUnique = (valueList :string[]) :string[] => (
  valueList.filter((val, index) => valueList.indexOf(val) === index)
);
export const getViolentChargeNums = (chargeFields :string[]) :string[] => (
  getUnique(chargeFields.filter((charge) => charge && chargeStatuteIsViolent(charge)))
);
export const chargeFieldIsViolent = (chargeField :string[]) => getViolentChargeNums(chargeField).length > 0;

export const dispositionIsGuilty = (disposition :string) :boolean => GUILTY_DISPOSITIONS.includes(disposition);

export const dispositionFieldIsGuilty = (dispositionField :string[]) :boolean => {
  let guilty = false;
  if (dispositionField.length) {
    dispositionField.forEach((disposition) => {
      if (dispositionIsGuilty(disposition)) guilty = true;
    });
  }
  return guilty;
};

export const chargeIsGuilty = (charge :Map) => {
  if (shouldIgnoreCharge(charge)) return false;
  const { [DISPOSITION]: dispositionField } = getEntityProperties(charge, [DISPOSITION], true);
  return dispositionFieldIsGuilty(dispositionField);
};

export const chargeSentenceWasPendingAtTimeOfArrest = (
  arrestDate :string,
  charge :Map,
  chargeIdsToSentenceDates :Map
) => {
  if (shouldIgnoreCharge(charge)) return false;
  const { [CHARGE_ID]: chargeId } = getEntityProperties(charge, [CHARGE_ID]);
  const sentenceDateTime = DateTime.fromISO(chargeIdsToSentenceDates.get(chargeId, ''));

  return sentenceDateTime.isValid ? sentenceDateTime > DateTime.fromISO(arrestDate) : true;
};

export const convictionAndGuilty = (arrestDate :string, charge :Map, chargeIdsToSentenceDates :Map) => (
  chargeIsGuilty(charge) && !chargeSentenceWasPendingAtTimeOfArrest(arrestDate, charge, chargeIdsToSentenceDates)
);

export const degreeFieldIsMisdemeanor = (degreeField :string[]) :boolean => {
  if (!degreeField || degreeField.length === 0) {
    return false;
  }

  return degreeField.filter((val) => val).reduce(
    (isMisdemeanor :boolean, degree :string) => (
      MISDEMEANOR_CHARGE_LEVEL_CODES.has(degree.toUpperCase()) || isMisdemeanor
    ),
    false
  );
};

export const chargeIsMisdemeanor = (charge :Map) => {
  if (shouldIgnoreCharge(charge)) return false;
  const { [CHARGE_LEVEL]: degreeField } = getEntityProperties(charge, [CHARGE_LEVEL], true);
  return degreeFieldIsMisdemeanor(degreeField);
};

export const degreeFieldIsFelony = (degreeField :string[]) :boolean => {
  let result = false;
  degreeField.forEach((degree) => {
    if (degree && degree.toLowerCase().startsWith('f')) result = true;
  });
  return result;
};

export const chargeIsFelony = (charge :Map) => {
  if (shouldIgnoreCharge(charge)) return false;
  return degreeFieldIsFelony(charge.get(PROPERTY_TYPES.CHARGE_LEVEL, List()));
};

export const getChargeTitle = (charge :Map, hideCase ?:boolean) :string => {
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

export const getSummaryStats = (allCharges :Map, chargeIdsToSentenceDates :Map) => {
  let numMisdemeanorCharges = 0;
  let numMisdemeanorConvictions = 0;
  let numFelonyCharges = 0;
  let numFelonyConvictions = 0;
  let numViolentCharges = 0;
  let numViolentConvictions = 0;

  allCharges.forEach((charge) => {
    const {
      [CHARGE_ID]: chargeIdField,
      [CHARGE_LEVEL]: degreeField,
      [CHARGE_STATUTE]: chargeField,
      [DISPOSITION]: dispositionField,
    } = getEntityProperties(charge, [CHARGE_ID, CHARGE_LEVEL, CHARGE_STATUTE, DISPOSITION], true);
    const convicted = dispositionFieldIsGuilty(dispositionField);
    const chargeHasSentenceDate = chargeIdField.some((chargeId) => {
      const hasSentenceDate = !!chargeIdsToSentenceDates.get(chargeId);
      return hasSentenceDate;
    });

    if (degreeFieldIsMisdemeanor(degreeField)) {
      numMisdemeanorCharges += 1;
      if (chargeHasSentenceDate && convicted) numMisdemeanorConvictions += 1;
    }
    else if (degreeFieldIsFelony(degreeField)) {
      numFelonyCharges += 1;
      if (chargeHasSentenceDate && convicted) numFelonyConvictions += 1;
    }

    if (chargeFieldIsViolent(chargeField)) {
      numViolentCharges += 1;
      if (chargeHasSentenceDate && convicted) numViolentConvictions += 1;
    }
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

export const historicalChargeIsViolent = ({
  charge,
  violentChargeList
} :Object) => {
  const {
    [CHARGE_STATUTE]: statute,
    [CHARGE_DESCRIPTION]: description
  } = getEntityProperties(charge, [CHARGE_DESCRIPTION, CHARGE_STATUTE]);

  const isViolent = violentChargeList.get(statute, Set()).includes(description);

  return isViolent;
};
