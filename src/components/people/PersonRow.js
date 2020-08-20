/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  padding: 7px 0;
  font-size: 12px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};
  /* stylelint-disable selector-type-no-unknown */
  ${Cell} {
    color: ${OL.GREY15};
  }

  ${Cell}:first-child {
    padding-left: 30px;
  }

  ${Cell}:last-child {
    padding-right: 30px;
  }

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

type Props = {
  data :Object,
  handleSelect :(person :Immutable.Map<*, *>, entityKeyId :string, id :string) => void
};

const PersonRow = ({ data, handleSelect } :Props) => (
  <Row onClick={() => handleSelect(data.person, data.id, data.displayId)}>
    <Cell>{ data.mugshot }</Cell>
    <Cell>{ data.lastName }</Cell>
    <Cell>{ data.firstName }</Cell>
    <Cell>{ data.middleName }</Cell>
    <Cell>{ data.dob }</Cell>
    <Cell>{ data.displayId }</Cell>
  </Row>
);

export default PersonRow;
