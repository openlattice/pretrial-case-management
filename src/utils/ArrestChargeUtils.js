/*
* @flow
*/
import { Set, List } from 'immutable';
import { getChargeTitle } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getFirstNeighborValue } from './DataUtils';

export const getChargeFields = (charge) => {
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

export const getViolentChargeLabels = ({ currCharges, violentChargeList }) => {
  let currentViolentCharges = List();

  currCharges.forEach((charge) => {
    const { statute, description } = getChargeFields(charge);

    const isViolent = violentChargeList.get(statute, Set()).includes(description);

    if (isViolent) currentViolentCharges = currentViolentCharges.push(getChargeTitle(charge, true));
  });

  return currentViolentCharges;
};

export const getRCMStepChargeLabels = ({ currCharges, rcmStep2ChargeList, rcmStep4ChargeList }) => {
  let step2Charges = List();
  let step4Charges = List();

  currCharges.forEach((charge) => {
    let isStep2 = false;
    let isStep4 = false;
    const { statute, description } = getChargeFields(charge);

    if (rcmStep2ChargeList) {
      isStep2 = rcmStep2ChargeList.get(statute, Set()).includes(description);
    }
    if (rcmStep4ChargeList) {
      isStep4 = rcmStep4ChargeList.get(statute, Set()).includes(description);
    }

    if (isStep2) step2Charges = step2Charges.push(getChargeTitle(charge, true));
    if (isStep4) step4Charges = step4Charges.push(getChargeTitle(charge, true));
  });

  return { step2Charges, step4Charges };
};

export const getBHEAndBREChargeLabels = ({
  currCharges,
  bookingReleaseExceptionChargeList,
  bookingHoldExceptionChargeList
}) => {
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
