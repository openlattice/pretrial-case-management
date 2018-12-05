/*
* @flow
*/
import Immutable, { Map, Set, List } from 'immutable';
import { getChargeDetails, getChargeTitle } from './HistoricalChargeUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { CHARGE } from './consts/Consts';
import { PENN_BOOKING_HOLD_EXCEPTIONS, PENN_BOOKING_RELEASE_EXCEPTIONS } from './consts/DMFExceptionsList';
import {
  BHE_LABELS,
  BRE_LABELS,
  CHARGE_TYPES,
  CHARGE_VALUES
} from './consts/ArrestChargeConsts';

const {
  STATUTE,
  DESCRIPTION
} = CHARGE;

export const getCombinedChargeList = (chargeList) => {
  let result = [];
  chargeList.forEach((chargeType) => {
    result = [...result, ...CHARGE_VALUES[chargeType]];
  });
  return result;
};

const violentCharges = CHARGE_VALUES[CHARGE_TYPES.ALL_VIOLENT];
const dmfStepTwoCharges = CHARGE_VALUES[CHARGE_TYPES.STEP_TWO];
const dmfStepFourCharges = CHARGE_VALUES[CHARGE_TYPES.STEP_FOUR];

export const chargeIsInList = (chargesToMatch, statuteNum, description) => {
  if (!statuteNum || !statuteNum.length || !description || !description.length) return false;
  let result = false;
  chargesToMatch.forEach((charge) => {
    if (charge[STATUTE] === statuteNum.trim() && charge[DESCRIPTION] === description.trim()) {
      result = true;
    }
  });
  return result;
};

const filterChargeList = (charges, chargesToMatch, negated) => (
  charges.filter((charge) => {
    const statuteNum = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');
    const present = chargeIsInList(chargesToMatch, statuteNum, description);
    return negated ? !present : present;
  })
);

export const getAllViolentChargeLabels = chargeList => (
  filterChargeList(chargeList, violentCharges).map(charge => getChargeTitle(charge, true))
);

export const getAllViolentCharges = chargeList => (
  filterChargeList(chargeList, violentCharges).map(charge => getChargeDetails(charge, true))
);

export const getAllStepTwoChargeLabels = chargeList => (
  filterChargeList(chargeList, dmfStepTwoCharges).map(charge => getChargeTitle(charge, true))
);

export const getAllStepTwoCharges = chargeList => (
  filterChargeList(chargeList, dmfStepTwoCharges).map(charge => getChargeDetails(charge, true))
);

export const getAllStepFourChargeLabels = chargeList => (
  filterChargeList(chargeList, dmfStepFourCharges).map(charge => getChargeTitle(charge, true))
);

export const getAllStepFourCharges = chargeList => (
  filterChargeList(chargeList, dmfStepFourCharges).map(charge => getChargeDetails(charge, true))
);

export const getAllSecondaryReleaseChargeLabels = chargeList => (
  filterChargeList(chargeList, PENN_BOOKING_HOLD_EXCEPTIONS).map(charge => getChargeTitle(charge, true))
);

export const getAllSecondaryReleaseCharges = chargeList => (
  filterChargeList(chargeList, PENN_BOOKING_HOLD_EXCEPTIONS).map(charge => getChargeDetails(charge, true))
);

export const getSecondaryReleaseChargeJustification = (chargeList) => {
  const secondaryReleaseCharges = filterChargeList(chargeList, PENN_BOOKING_HOLD_EXCEPTIONS)
    .map(charge => getChargeTitle(charge, true));
  if (secondaryReleaseCharges.size === chargeList.size) {
    return [secondaryReleaseCharges, BHE_LABELS.RELEASE];
  }

  return [
    filterChargeList(chargeList, PENN_BOOKING_HOLD_EXCEPTIONS, true).map(charge => getChargeTitle(charge, true)),
    BHE_LABELS.HOLD
  ];
};

export const getAllSecondaryHoldChargeLabels = chargeList => (
  filterChargeList(chargeList, PENN_BOOKING_RELEASE_EXCEPTIONS).map(charge => getChargeTitle(charge, true))
);

export const getAllSecondaryHoldCharges = chargeList => (
  filterChargeList(chargeList, PENN_BOOKING_RELEASE_EXCEPTIONS).map(charge => getChargeDetails(charge, true))
);

export const getSecondaryHoldChargeJustification = (chargeList) => {
  const secondaryHoldCharges = filterChargeList(chargeList, PENN_BOOKING_RELEASE_EXCEPTIONS)
    .map(charge => getChargeTitle(charge, true));
  if (secondaryHoldCharges.size) {
    return [secondaryHoldCharges, BRE_LABELS.LABEL];
  }

  return [Immutable.List(), BRE_LABELS.LABEL];
};

// Get Charge Labels with Charge Lists as arguments.

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
    const statute = charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '');

    const isStep2 = dmfStep2ChargeList.get(statute, Set()).includes(description);
    const isStep4 = dmfStep4ChargeList.get(statute, Set()).includes(description);

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

    const isBRE = bookingReleaseExceptionChargeList.get(statute, Set()).includes(description);
    const isBHE = bookingHoldExceptionChargeList.get(statute, Set()).includes(description);

    if (isBHE) currentBHECharges = currentBHECharges.push(getChargeTitle(charge, true));
    if (!isBHE) currentNonBHECharges = currentNonBHECharges.push(getChargeTitle(charge, true));
    if (isBRE) currentBRECharges = currentBRECharges.push(getChargeTitle(charge, true));
  });

  return { currentBHECharges, currentNonBHECharges, currentBRECharges };
};
