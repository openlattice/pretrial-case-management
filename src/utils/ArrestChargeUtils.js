/*
* @flow
*/
import { List, Map, Set } from 'immutable';
import { getChargeTitle } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getFirstNeighborValue } from './DataUtils';

export const getChargeFields = (charge :Map) => {
  const chargeId = getFirstNeighborValue(charge, PROPERTY_TYPES.CHARGE_ID);
  const description = getFirstNeighborValue(charge, PROPERTY_TYPES.CHARGE_DESCRIPTION);
  const dispositionDate = getFirstNeighborValue(charge, PROPERTY_TYPES.DISPOSITION_DATE, []);
  const statute = getFirstNeighborValue(charge, PROPERTY_TYPES.CHARGE_STATUTE);
  return {
    chargeId,
    description,
    dispositionDate,
    statute
  };
};

export const getViolentChargeLabels = ({ currCharges, violentChargeList } :Object) => {
  let currentViolentCharges = List();

  currCharges.forEach((charge) => {
    const { statute, description } = getChargeFields(charge);

    const isViolent = violentChargeList.get(statute, Set()).includes(description);

    if (isViolent) currentViolentCharges = currentViolentCharges.push(getChargeTitle(charge, true));
  });

  return currentViolentCharges;
};

export const getRCMStepChargeLabels :Object = ({
  currCharges,
  maxLevelIncreaseChargesList,
  singleLevelIncreaseChargesList
} :Object) => {
  let maxLevelIncreaseCharges = List();
  let singleLevelIncreaseCharges = List();

  currCharges.forEach((charge) => {
    let isMaxIncrease = false;
    let isSingleIncrease = false;
    const { statute, description } = getChargeFields(charge);

    if (maxLevelIncreaseChargesList) {
      isMaxIncrease = maxLevelIncreaseChargesList.get(statute, Set()).includes(description);
    }
    if (singleLevelIncreaseChargesList) {
      isSingleIncrease = singleLevelIncreaseChargesList.get(statute, Set()).includes(description);
    }

    if (isMaxIncrease) maxLevelIncreaseCharges = maxLevelIncreaseCharges.push(getChargeTitle(charge, true));
    if (isSingleIncrease) singleLevelIncreaseCharges = singleLevelIncreaseCharges.push(getChargeTitle(charge, true));
  });

  return { maxLevelIncreaseCharges, singleLevelIncreaseCharges };
};

export const getBHEAndBREChargeLabels = ({
  currCharges,
  bookingReleaseExceptionChargeList,
  bookingHoldExceptionChargeList
} :Object) => {
  let currentBHECharges = List();
  let currentNonBHECharges = List();
  let currentBRECharges = List();

  currCharges.forEach((charge) => {
    const { statute, description } = getChargeFields(charge);
    let isBRE = false;
    let isBHE = false;
    if (bookingReleaseExceptionChargeList) {
      isBRE = bookingReleaseExceptionChargeList.get(statute, Set()).includes(description);
    }
    if (bookingHoldExceptionChargeList) {
      isBHE = bookingHoldExceptionChargeList.get(statute, Set()).includes(description);
    }

    if (isBHE) currentBHECharges = currentBHECharges.push(getChargeTitle(charge, true));
    if (!isBHE) currentNonBHECharges = currentNonBHECharges.push(getChargeTitle(charge, true));
    if (isBRE) currentBRECharges = currentBRECharges.push(getChargeTitle(charge, true));
  });

  return { currentBHECharges, currentNonBHECharges, currentBRECharges };
};
