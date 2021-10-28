/*
 * @flow
 */
import { List, Map, Seq } from 'immutable';
import { DateTime } from 'luxon';

import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_STATUSES } from './consts/Consts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from './consts/FrontEndStateConsts';
import { sortPeopleByName } from './PeopleUtils';
import { getFirstNeighborValue, getEntityProperties } from './DataUtils';

const {
  EDITED_BY,
  PEOPLE,
  STAFF
} = APP_TYPES;

const { ENTITY_KEY_ID, DATE_TIME, STATUS } = PROPERTY_TYPES;

export const getPSAFields = (scores :Map) => {
  const failureReason = getFirstNeighborValue(scores, PROPERTY_TYPES.FAILURE_REASON);
  const ftaScale = getFirstNeighborValue(scores, PROPERTY_TYPES.FTA_SCALE);
  const ncaScale = getFirstNeighborValue(scores, PROPERTY_TYPES.NCA_SCALE);
  const nvcaFlag = getFirstNeighborValue(scores, PROPERTY_TYPES.NVCA_FLAG);
  const status = getFirstNeighborValue(scores, PROPERTY_TYPES.STATUS);
  const statusNotes = getFirstNeighborValue(scores, PROPERTY_TYPES.STATUS_NOTES);
  const timeStamp = getFirstNeighborValue(scores, PROPERTY_TYPES.TIMESTAMP);

  return {
    failureReason,
    ftaScale,
    ncaScale,
    nvcaFlag,
    status,
    statusNotes,
    timeStamp
  };
};

export const sortByName = (neighbor1 :Map, neighbor2 :Map) => {
  const p1 = neighbor1.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
  const p2 = neighbor2.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());

  return sortPeopleByName(p1, p2);
};

export const sortByDate = (scores1 :Map, scores2 :Map) => {
  const { [DATE_TIME]: scores1CreationDate } = getEntityProperties(scores1, [DATE_TIME]);
  const { [DATE_TIME]: scores2CreationDate } = getEntityProperties(scores2, [DATE_TIME]);

  return DateTime.fromISO(scores1CreationDate).valueOf() > DateTime.fromISO(scores2CreationDate).valueOf() ? -1 : 1;
};

export const groupByStatus = (scoreSeq :Seq) => {
  let statusMap = Map();

  scoreSeq.forEach(([scoreId, scores]) => {
    const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    statusMap = statusMap.set(status, statusMap.get(status, Map()).set(scoreId, scores));
  });

  return statusMap;
};

export const psaIsClosed = (psa :Map) => {
  const { [STATUS]: psaStatus } = getEntityProperties(psa, [STATUS]);
  return psaStatus && (psaStatus !== PSA_STATUSES.OPEN);
};

export const psaIsOpen = (psa :Map) => {
  const { [STATUS]: psaStatus } = getEntityProperties(psa, [STATUS]);
  return psaStatus && (psaStatus === PSA_STATUSES.OPEN);
};

export const getLastEditDetails = (neighbors :Map) => {
  let date;
  let user;
  neighbors.get(STAFF, List()).forEach((neighbor) => {
    if (neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']) === EDITED_BY) {
      const editUser = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
      const editDate = DateTime.fromISO(neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
      if (editUser && editDate.isValid && (!date || editDate.valueOf() > date.valueOf())) {
        date = editDate;
        user = editUser;
      }
    }
  });

  return { date, user };
};

export const getOpenPSAs = (psas :List<Map>) => psas.filter(psaIsOpen);

export const getMostRecentPSA = (psas :Object[]) => {
  let mostRecentPSAEKID = null;
  let mostRecentPSA = Map();
  let mostRecentPSADateTime;
  psas.forEach((psa) => {
    const {
      [ENTITY_KEY_ID]: psaEKID,
      [DATE_TIME]: psaDateTime
    } = getEntityProperties(psa, [ENTITY_KEY_ID, DATE_TIME]);
    const psaDT = DateTime.fromISO(psaDateTime);
    if (!mostRecentPSADateTime || mostRecentPSADateTime.valueOf() < psaDT.valueOf()) {
      mostRecentPSAEKID = psaEKID;
      mostRecentPSADateTime = psaDT;
      mostRecentPSA = psa;
    }
  });
  return { mostRecentPSAEKID, mostRecentPSA };
};
