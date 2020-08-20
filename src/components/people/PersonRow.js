/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  font-size: 12px;
  padding: 7px 0;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};
  padding: 7px 30px;
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
    background: ${OL.GREY14};
    cursor: pointer;
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

type Props = {
  data :Object,
  handleSelect :(person :Map, entityKeyId :string, id :string) => void
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
