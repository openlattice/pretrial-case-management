/*
 * @flow
 */
import React from 'react';
import { List, Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';

import PersonRow from './PersonRow';
import { OL } from '../../utils/consts/Colors';
import { PersonPicture, PersonMugshot } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';

const defaultUserIcon = <FontAwesomeIcon color={OL.GREY02} icon={faUser} size="3x" />;

const {
  DOB,
  ENTITY_KEY_ID,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const getPeopleData = (people :List) => {
  const peopleData = [];
  people.forEach((person) => {
    const mugshotString :string = person.getIn([MUGSHOT, 0]) || person.getIn([PICTURE, 0]);
    const mugshot = mugshotString
      ? (
        <PersonMugshot>
          <PersonPicture src={mugshotString} />
        </PersonMugshot>
      )
      : (
        <PersonMugshot>
          { defaultUserIcon }
        </PersonMugshot>
      );

    const firstName = formatValue(person.get(FIRST_NAME, List()));
    const middleName = formatValue(person.get(MIDDLE_NAME, List()));
    const lastName = formatValue(person.get(LAST_NAME, List()));
    const dob = formatDateList(person.get(DOB, List()));
    const personId :string = person.getIn([PERSON_ID, 0], '');
    const displayId = personId.length <= 11 ? personId : `${personId.substr(0, 10)}...`;
    const id :string = person.getIn([ENTITY_KEY_ID, 0], '');

    peopleData.push({
      displayId,
      dob,
      firstName,
      id,
      lastName,
      mugshot,
      middleName,
      person
    });
  });
  return peopleData;
};

export const HEADERS = [
  { key: 'mugshot', label: '', sortable: false },
  { key: 'lastName', label: 'Last Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'middleName', label: 'Middle Name' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'displayId', label: 'Identifier' }
];

const pageOptions = [20, 30, 50];

type Props = {
  people :List<*, *>,
  handleSelect :(person :Map, personEKID :string, personId :string) => void,
};

const PersonTable = ({
  people,
  handleSelect
} :Props) => {

  const components :Object = {
    Row: ({ data } :Object) => (
      <PersonRow data={data} handleSelect={handleSelect} />
    )
  };

  const peopleData = getPeopleData(people);

  return (
    <Table
        components={components}
        data={peopleData}
        headers={HEADERS}
        paginated
        rowsPerPageOptions={pageOptions} />
  );
};

export default PersonTable;
