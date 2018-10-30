/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import { OL } from '../../utils/consts/Colors';
import { formatDateTime } from '../../utils/FormattingUtils';
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
  color: ${OL.GREY15};
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};
  border-left: 1px solid ${OL.GREY11};
  border-right: 1px solid ${OL.GREY11};

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }

  &:active {
    background-color: ${OL.GREY08};
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
