
import { List } from 'immutable';
import { Constants } from 'lattice';


import { ENTITY_SETS, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { formatDOB } from './Helpers';

const { OPENLATTICE_ID_FQN } = Constants;


export const formatPeopleInfo = (person) => {
  const formattedDOB = formatDOB(person.getIn([PROPERTY_TYPES.DOB, 0]));
  return {
    identification: person.getIn([PROPERTY_TYPES.PERSON_ID, 0]),
    firstName: person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]),
    middleName: person.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]),
    lastName: person.getIn([PROPERTY_TYPES.LAST_NAME, 0]),
    dob: formattedDOB,
    photo: person.getIn([PROPERTY_TYPES.PICTURE, 0])
  };
};

export const getFormattedPeople = peopleList => (
  peopleList.map(person => formatPeopleInfo(person))
);

// Get PSA Ids from person Neighbors
export const getPSAIdsFromNeighbors = peopleNeighbors => (
  peopleNeighbors.get(ENTITY_SETS.PSA_SCORES, List())
    .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
    .filter(id => !!id)
    .toJS()
);


export const phoneIsValid = phone => (
  phone ? phone.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/) : false
);

export const emailIsValid = email => (
  email ? email.match(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/) : false
);
