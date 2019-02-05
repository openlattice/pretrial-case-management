
import { List } from 'immutable';
import { Constants } from 'lattice';


import { APP_TYPES_FQNS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { formatDOB } from './Helpers';

const { OPENLATTICE_ID_FQN } = Constants;

let { PSA_SCORES } = APP_TYPES_FQNS;

PSA_SCORES = PSA_SCORES.toString();

export const formatPeopleInfo = (person) => {
  const formattedDOB = formatDOB(person.getIn([PROPERTY_TYPES.DOB, 0]));
  const identification = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
  const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]);
  const middleName = person.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]);
  const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0]);
  const dob = formattedDOB;
  const photo = person.getIn([PROPERTY_TYPES.PICTURE, 0]) || person.getIn([PROPERTY_TYPES.MUGSHOT, 0]);
  const midName = middleName ? ` ${middleName}` : '';
  const lastFirstMid = `${lastName}, ${firstName}${midName}`;
  return {
    identification,
    firstName,
    middleName,
    lastName,
    dob,
    photo,
    lastFirstMid
  };
};

export const getFormattedPeople = peopleList => (
  peopleList.map(person => formatPeopleInfo(person))
);

// Get PSA Ids from person Neighbors
export const getPSAIdsFromNeighbors = peopleNeighbors => (
  peopleNeighbors.get(PSA_SCORES, List())
    .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
    .filter(id => !!id)
    .toJS()
);


export const phoneIsValid = phone => (
  phone ? phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/) : true
);

export const emailIsValid = email => (
  email ? email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/) : true
);
