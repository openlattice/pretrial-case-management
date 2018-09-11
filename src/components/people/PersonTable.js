/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import PersonRow from './PersonRow';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
`;

const HeaderRow = styled.tr`
  background-color: #f0f0f7;
  border: 1px solid #f0f0f7;
`;

const HeaderElement = styled.th`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: #8e929b;
  text-transform: uppercase;
  padding: 12px 0;
`;

const Headers = () => (
  <HeaderRow>
    <HeaderElement />
    <HeaderElement>LAST NAME</HeaderElement>
    <HeaderElement>FIRST NAME</HeaderElement>
    <HeaderElement>MIDDLE NAME</HeaderElement>
    <HeaderElement>DATE OF BIRTH</HeaderElement>
    <HeaderElement>IDENTIFIER</HeaderElement>
  </HeaderRow>
);

type Props = {
  people :Immutable.List<*, *>,
  gray :boolean,
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void,
};

const PersonTable = ({ people, handleSelect, gray } :Props) => {
  return (
    <Table>
      <tbody>
        <Headers />
        {people.map((person => (
          <PersonRow
              key={person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '')}
              person={person}
              handleSelect={handleSelect}
              gray={gray} />
        )))}
      </tbody>
    </Table>
  );
};

export default PersonTable;
