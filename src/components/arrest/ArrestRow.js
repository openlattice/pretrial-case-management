/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import { formatDateTime } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  ARRESTING_AGENCY,
  CASE_ID,
  ARREST_DATE,
  ARREST_DATE_TIME,
  NUMBER_OF_CHARGES
} = PROPERTY_TYPES;

const Cell = styled.td`
  padding: 15px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: '#2e2e34';
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid #e1e1eb;
  border-left: 1px solid #e1e1eb;
  border-right: 1px solid #e1e1eb;

  &:hover {
    cursor: pointer;
    background: #f8f8fc;
  }

  &:active {
    background-color: #f0f0f7;
  }
`;

type Props = {
  arrest :Immutable.Map<*, *>,
  handleSelect? :(arrest :Immutable.Map<*, *>, entityKeyId :string) => void
};

const ArrestRow = ({ arrest, handleSelect } :Props) => {


  const caseNum = arrest.getIn([CASE_ID, 0]);
  const arrestDateTime = arrest.getIn([ARREST_DATE_TIME, 0],
    arrest.getIn([ARREST_DATE, 0], ''));
  const arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
  const arrestTime = formatDateTime(arrestDateTime, 'HH:mm');

  const numCharges = arrest.getIn([NUMBER_OF_CHARGES, 0]);
  const arrestAgency = arrest.getIn([ARRESTING_AGENCY, 0]);

  const entityKeyId :string = arrest.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row onClick={() => {
      if (handleSelect) {
        handleSelect(arrest, entityKeyId);
      }
    }}>
      <Cell>{ caseNum }</Cell>
      <Cell>{ arrestDate }</Cell>
      <Cell>{ arrestTime }</Cell>
      <Cell>{ numCharges }</Cell>
      <Cell>{ arrestAgency }</Cell>
    </Row>
  );
};

ArrestRow.defaultProps = {
  handleSelect: () => {}
};

export default ArrestRow;
