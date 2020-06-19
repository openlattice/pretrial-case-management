/*
 * @flow
 */

import { Map, List } from 'immutable';
import { DateTime, Interval } from 'luxon';

import { PSA_STATUSES } from './consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { getChargeFields } from './ArrestChargeUtils';
import { getEntityProperties, getFirstNeighborValue } from './DataUtils';

const { CHARGES, PRETRIAL_CASES } = APP_TYPES;

const {
  CHARGE_ID,
  DISPOSITION_DATE,
  STATUS,
  TIMESTAMP
} = PROPERTY_TYPES;

export const getMapByCaseId = (list, fqn) => {
  let objMap = Map();
  list.forEach((obj) => {
    const objIdArr = obj.getIn([fqn, 0], '').split('|');
    if (objIdArr.length > 1) {
      const caseId = objIdArr[0];
      objMap = objMap.set(caseId, objMap.get(caseId, List()).push(obj));
    }
  });
  return objMap;
};

export const getChargeHistory = (neighbors) => {
  let chargeHistory = Map();
  neighbors.get(CHARGES, List())
    .forEach((chargeNeighbor) => {
      const { chargeId } = getChargeFields(chargeNeighbor);
      const chargeIdArr = chargeId.split('|');
      if (chargeIdArr.length) {
        const caseId = chargeIdArr[0];
        chargeHistory = chargeHistory.set(
          caseId,
          chargeHistory.get(caseId, List()).push(chargeNeighbor.get(
            PSA_NEIGHBOR.DETAILS,
            chargeNeighbor
          ))
        );
      }
    });
  return chargeHistory;
};

export const getChargesByCaseNumber = (charges :List) => Map().withMutations((mutableMap) => {
  charges.forEach((charge) => {
    const { [CHARGE_ID]: chargeId } = getEntityProperties(charge, [CHARGE_ID]);
    const caseNumber = chargeId.split('|')[0];
    mutableMap.set(caseNumber, mutableMap.get(caseNumber, List()).push(charge));
  });
});

export const getCaseHistory = (neighbors) => {
  const caseHistory = neighbors.get(PRETRIAL_CASES, List())
    .map((neighborObj) => neighborObj.get(
      PSA_NEIGHBOR.DETAILS,
      neighborObj
    ));
  return caseHistory;
};


export const getPendingCharges = (caseNum, chargeHistory, arrestDate, psaClosureDate) => {
  let pendingCharges = Map();
  if (chargeHistory.get(caseNum)) {
    pendingCharges = chargeHistory.get(caseNum)
      .filter((charge) => {
        let { [DISPOSITION_DATE]: dispositionDate } = getEntityProperties(charge, [DISPOSITION_DATE]);
        dispositionDate = DateTime.fromISO(dispositionDate);
        if (!dispositionDate.isValid) dispositionDate = DateTime.local();
        return Interval.fromDateTimes(arrestDate, psaClosureDate).contains(dispositionDate);
      });
  }
  return pendingCharges;
};

const getNonPendingCharges = (caseNum, chargeHistory, arrestDate, psaClosureDate) => {
  let nonPendingCharges = Map();
  if (chargeHistory.get(caseNum)) {
    nonPendingCharges = chargeHistory.get(caseNum)
      .filter((charge) => {
        let { [DISPOSITION_DATE]: dispositionDate } = getEntityProperties(charge, [DISPOSITION_DATE]);
        dispositionDate = DateTime.fromISO(dispositionDate);
        if (!dispositionDate.isValid) dispositionDate = DateTime.local();
        return !Interval.fromDateTimes(arrestDate, psaClosureDate).contains(dispositionDate);
      });
  }
  return nonPendingCharges;
};

export const currentPendingCharges = (charges) => {
  let pendingCharges = List();
  charges.forEach((caseObj) => caseObj.forEach((charge) => {
    const { [DISPOSITION_DATE]: dispositionDate } = getEntityProperties(charge, [DISPOSITION_DATE]);
    const chargeHasDisposition = !!dispositionDate;
    if (!chargeHasDisposition) pendingCharges = pendingCharges.push(charge);
  }));
  return pendingCharges;
};

export const getCasesForPSA = (
  caseHistory,
  chargeHistory,
  scores,
  arrestDate,
  lastEditDateForPSA
) => {
  let caseHistoryForMostRecentPSA = List();
  let chargeHistoryForMostRecentPSA = Map();
  let caseHistoryNotForMostRecentPSA = List();
  let chargeHistoryNotForMostRecentPSA = Map();
  const {
    [STATUS]: status,
    [TIMESTAMP]: psaDateTime
  } = getEntityProperties(scores, [STATUS, TIMESTAMP]);
  const psaIsClosed = status !== PSA_STATUSES.OPEN;

  const psaArrestDateTime = DateTime.fromISO(arrestDate || psaDateTime);
  const psaClosureDate = psaIsClosed ? DateTime.fromISO(lastEditDateForPSA) : DateTime.local().plus({ days: 1 });

  if (psaArrestDateTime.isValid) {
    caseHistory.forEach((caseObj) => {
      const caseNum = getFirstNeighborValue(caseObj, PROPERTY_TYPES.CASE_ID);
      const pendingCharges = getPendingCharges(caseNum, chargeHistory, psaArrestDateTime, psaClosureDate);
      const nonPendingCharges = getNonPendingCharges(caseNum, chargeHistory, psaArrestDateTime, psaClosureDate);
      const isPending = !!pendingCharges.size;

      if (isPending) {
        caseHistoryForMostRecentPSA = caseHistoryForMostRecentPSA.push(caseObj);
        chargeHistoryForMostRecentPSA = chargeHistoryForMostRecentPSA.set(caseNum, pendingCharges);
        if (nonPendingCharges.size) {
          caseHistoryNotForMostRecentPSA = caseHistoryNotForMostRecentPSA.push(caseObj);
          chargeHistoryNotForMostRecentPSA = chargeHistoryNotForMostRecentPSA
            .set(caseNum, nonPendingCharges);
        }
      }
      else {
        caseHistoryNotForMostRecentPSA = caseHistoryNotForMostRecentPSA.push(caseObj);
        chargeHistoryNotForMostRecentPSA = chargeHistoryNotForMostRecentPSA.set(caseNum, nonPendingCharges);
      }
    });
  }

  return {
    caseHistoryForMostRecentPSA,
    chargeHistoryForMostRecentPSA,
    caseHistoryNotForMostRecentPSA,
    chargeHistoryNotForMostRecentPSA
  };
};
