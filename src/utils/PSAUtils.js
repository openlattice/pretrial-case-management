/*
 * @flow
 */
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_STATUSES } from './consts/Consts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from './consts/FrontEndStateConsts';
import { sortPeopleByName } from './PeopleUtils';
import { getFirstNeighborValue, getEntityProperties } from './DataUtils';

const {
  ASSESSED_BY,
  EDITED_BY,
  PEOPLE,
  STAFF
} = APP_TYPES;

const { ENTITY_KEY_ID, DATE_TIME, STATUS } = PROPERTY_TYPES;

export const getPSAFields = (scores) => {
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

export const sortByName = ([id1, neighbor1], [id2, neighbor2]) => {
  const p1 = neighbor1.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
  const p2 = neighbor2.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());

  return sortPeopleByName(p1, p2);
};

export const sortByDate = ([id1, neighbor1], [id2, neighbor2], entitySetsByOrganization) => {
  let latest1;
  let latest2;

  const getDate = (neighborObj, latest) => {
    const associationId = neighborObj.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
    const associationName = entitySetsByOrganization.get(associationId);
    const ptFqn = associationName === ASSESSED_BY
      ? PROPERTY_TYPES.COMPLETED_DATE_TIME : PROPERTY_TYPES.DATE_TIME;
    const date = DateTime.fromISO(neighborObj.getIn([PSA_ASSOCIATION.DETAILS, ptFqn, 0], ''));
    if (date.isValid) {
      if (!latest || latest < date) {
        return date;
      }
    }
    return null;
  };

  neighbor1.get(STAFF, List()).forEach((neighborObj) => {
    const date = getDate(neighborObj, latest1);
    if (date) latest1 = date;
  });

  neighbor2.get(STAFF, List()).forEach((neighborObj) => {
    const date = getDate(neighborObj, latest2);
    if (date) latest2 = date;
  });

  if (latest1 && latest2) {
    return latest1 > latest2 ? -1 : 1;
  }

  if (latest1 || latest2) {
    return latest1 ? -1 : 1;
  }

  return 0;
};

export const groupByStatus = (scoreSeq) => {
  let statusMap = Map();

  scoreSeq.forEach(([scoreId, scores]) => {
    const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    statusMap = statusMap.set(status, statusMap.get(status, Map()).set(scoreId, scores));
  });

  return statusMap;
};

export const psaIsClosed = (psa) => {
  const { [STATUS]: psaStatus } = getEntityProperties(psa, [STATUS]);
  return psaStatus && psaStatus !== PSA_STATUSES.OPEN;
};

export const getLastEditDetails = (neighbors) => {
  let date;
  let user;
  neighbors.get(STAFF, List()).forEach((neighbor) => {
    if (neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']) === EDITED_BY) {
      const editUser = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
      const editDate = DateTime.fromISO(neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
      if (editUser && editDate.isValid && (!date || editDate > date)) {
        date = editDate;
        user = editUser;
      }
    }
  });

  return { date, user };
};

export const getOpenPSAs = (psas :Object[]) => {
  psas.filter(psaIsClosed);
};

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
    if (!mostRecentPSADateTime || mostRecentPSADateTime > psaDT) {
      mostRecentPSAEKID = psaEKID;
      mostRecentPSADateTime = psaDT;
      mostRecentPSA = psa;
    }
  });
  return { mostRecentPSAEKID, mostRecentPSA };
};
