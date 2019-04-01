
import moment from 'moment';
import { List } from 'immutable';
import { Constants } from 'lattice';


import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { HAS_OPEN_PSA } from './consts/Consts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { formatDOB } from './Helpers';
import { getFirstNeighborValue } from './DataUtils';

const { OPENLATTICE_ID_FQN } = Constants;

const { PSA_SCORES } = APP_TYPES;

const formatPersonName = (firstName, middleName, lastName) => {
  const midName = middleName ? ` ${middleName}` : '';
  const lastFirstMid = `${lastName}, ${firstName}${midName}`;

  return lastFirstMid;
};

export const formatPeopleInfo = (person) => {
  const personEntityKeyId = getFirstNeighborValue(person, OPENLATTICE_ID_FQN);
  const personId = getFirstNeighborValue(person, PROPERTY_TYPES.PERSON_ID);
  const dob = formatDOB(getFirstNeighborValue(person, PROPERTY_TYPES.DOB));
  const firstName = getFirstNeighborValue(person, PROPERTY_TYPES.FIRST_NAME);
  const middleName = getFirstNeighborValue(person, PROPERTY_TYPES.MIDDLE_NAME);
  const lastName = getFirstNeighborValue(person, PROPERTY_TYPES.LAST_NAME);
  const photo = getFirstNeighborValue(
    person, PROPERTY_TYPES.PICTURE, getFirstNeighborValue(person, PROPERTY_TYPES.MUGSHOT)
  );
  const lastFirstMid = formatPersonName(firstName, middleName, lastName);
  const hasOpenPSA = person.get(HAS_OPEN_PSA, false);
  return {
    personEntityKeyId,
    personId,
    firstName,
    middleName,
    lastName,
    dob,
    photo,
    lastFirstMid,
    hasOpenPSA
  };
};

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

export const getFormattedPeople = peopleList => (
  peopleList.sort(sortPeopleByName).map(person => formatPeopleInfo(person))
);

// Get PSA Ids from person Neighbors
export const getPSAIdsFromNeighbors = peopleNeighbors => (
  peopleNeighbors.get(PSA_SCORES, List())
    .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
    .filter(id => !!id)
    .toJS()
);
