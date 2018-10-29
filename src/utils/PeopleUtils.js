import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { formatDOB } from './Helpers';


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
