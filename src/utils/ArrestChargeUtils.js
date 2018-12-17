/*
* @flow
*/
import { Set, List } from 'immutable';
import { getChargeTitle } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

export const getViolentChargeLabels = ({ currCharges, violentChargeList }) => {
  let currentViolentCharges = List();

  currCharges.forEach((charge) => {
    const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');

    const isViolent = violentChargeList.get(statute, Set()).includes(description);

    if (isViolent) currentViolentCharges = currentViolentCharges.push(getChargeTitle(charge, true));
  });

  return currentViolentCharges;
};

export const getDMFStepChargeLabels = ({ currCharges, dmfStep2ChargeList, dmfStep4ChargeList }) => {
  let step2Charges = List();
  let step4Charges = List();

  currCharges.forEach((charge) => {
    let isStep2 = false;
    let isStep4 = false;
    const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');

    if (dmfStep2ChargeList) {
      isStep2 = dmfStep2ChargeList.get(statute, Set()).includes(description);
    }
    if (dmfStep4ChargeList) {
      isStep4 = dmfStep4ChargeList.get(statute, Set()).includes(description);
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
    const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
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
