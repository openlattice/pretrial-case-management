/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import PersonRow from './PersonRow';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
  margin-bottom: 15px;
`;

const HeaderRow = styled.tr`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.th`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY02};
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
  small :boolean,
  handleSelect :(person :Immutable.Map, entityKeyId :string, personId :string) => void,
};

const PersonTable = ({
  people,
  handleSelect,
  gray,
  small
} :Props) => (
  <Table>
    <tbody>
      <Headers />
      {people.map((person => (
        <PersonRow
            key={person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '')}
            person={person}
            handleSelect={handleSelect}
            gray={gray}
            small={small} />
      )))}
    </tbody>
  </Table>
);

export default PersonTable;
