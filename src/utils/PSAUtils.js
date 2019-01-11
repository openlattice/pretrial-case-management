import Immutable from 'immutable';
import moment from 'moment';

import { APP_TYPES_FQNS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_STATUSES } from './consts/Consts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from './consts/FrontEndStateConsts';

let {
  ASSESSED_BY,
  EDITED_BY,
  PEOPLE,
  STAFF
} = APP_TYPES_FQNS;

ASSESSED_BY = ASSESSED_BY.toString();
EDITED_BY = EDITED_BY.toString();
PEOPLE = PEOPLE.toString();
STAFF = STAFF.toString();


export const sortPeopleByName = (p1, p2) => {
  const p1Last = p1.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
  const p2Last = p2.getIn([PROPERTY_TYPES.LAST_NAME, 0], '').toLowerCase();
  if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

  const p1First = p1.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
  const p2First = p2.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '').toLowerCase();
  if (p1First !== p2First) return p1First < p2First ? -1 : 1;

  const p1Dob = moment(p1.getIn([PROPERTY_TYPES.DOB, 0], ''));
  const p2Dob = moment(p2.getIn([PROPERTY_TYPES.DOB, 0], ''));
  if (p1Dob.isValid() && p2Dob.isValid()) return p1Dob.isBefore(p2Dob) ? -1 : 1;

  return 0;
};

export const sortByName = ([id1, neighbor1], [id2, neighbor2]) => {
  const p1 = neighbor1.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const p2 = neighbor2.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());

  return sortPeopleByName(p1, p2);
};

export const sortByDate = ([id1, neighbor1], [id2, neighbor2]) => {
  let latest1;
  let latest2;

  const getDate = (neighborObj, latest) => {
    const associationName = neighborObj.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']);
    const ptFqn = associationName === ASSESSED_BY
      ? PROPERTY_TYPES.COMPLETED_DATE_TIME : PROPERTY_TYPES.DATE_TIME;
    const date = moment(neighborObj.getIn([PSA_ASSOCIATION.DETAILS, ptFqn, 0], ''));
    if (date.isValid()) {
      if (!latest || latest.isBefore(date)) {
        return date;
      }
    }
    return null;
  };

  neighbor1.get(STAFF, Immutable.List()).forEach((neighborObj) => {
    const date = getDate(neighborObj, latest1);
    if (date) latest1 = date;
  });

  neighbor2.get(STAFF, Immutable.List()).forEach((neighborObj) => {
    const date = getDate(neighborObj, latest2);
    if (date) latest2 = date;
  });

  if (latest1 && latest2) {
    return latest1.isAfter(latest2) ? -1 : 1;
  }

  if (latest1 || latest2) {
    return latest1 ? -1 : 1;
  }

  return 0;
};

export const groupByStatus = (scoreSeq) => {
  let statusMap = Immutable.Map();

  scoreSeq.forEach(([scoreId, scores]) => {
    const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    statusMap = statusMap.set(status, statusMap.get(status, Immutable.Map()).set(scoreId, scores));
  });

  return statusMap;
};

export const psaIsClosed = (psa) => {
  const status = psa.getIn([PROPERTY_TYPES.STATUS, 0]);
  return status && status !== PSA_STATUSES.OPEN;
};

export const getLastEditDetails = (neighbors) => {
  let date;
  let user;
  neighbors.get(STAFF, Immutable.List()).forEach((neighbor) => {
    if (neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']) === EDITED_BY) {
      const editUser = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]);
      const editDate = moment(neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
      if (editUser && editDate.isValid() && (!date || editDate.isAfter(date))) {
        date = editDate;
        user = editUser;
      }
    }
  });

  return { date, user };
};
