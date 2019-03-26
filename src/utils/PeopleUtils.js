
import moment from 'moment';
import { List } from 'immutable';
import { Constants } from 'lattice';


import { APP_TYPES_FQNS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { HAS_OPEN_PSA } from './consts/Consts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { formatDOB } from './Helpers';

const { OPENLATTICE_ID_FQN } = Constants;

let { PSA_SCORES } = APP_TYPES_FQNS;

PSA_SCORES = PSA_SCORES.toString();

export const formatPeopleInfo = (person) => {
  const entityKeyId = formatDOB(person.getIn([OPENLATTICE_ID_FQN, 0]));
  const formattedDOB = formatDOB(person.getIn([PROPERTY_TYPES.DOB, 0]));
  const identification = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
  const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
  const middleName = person.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]);
  const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0]);
  const dob = formattedDOB;
  const photo = person.getIn([PROPERTY_TYPES.PICTURE, 0]) || person.getIn([PROPERTY_TYPES.MUGSHOT, 0]);
  const midName = middleName ? ` ${middleName}` : '';
  const lastFirstMid = `${lastName}, ${firstName}${midName}`;
  const hasOpenPSA = person.get(HAS_OPEN_PSA, false);
  return {
    entityKeyId,
    identification,
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
