/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { OL } from '../../utils/consts/Colors';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARRESTING_AGENCY,
  CASE_ID,
  CASE_NUMBER,
  ARREST_DATE_TIME,
  NUMBER_OF_CHARGES
} = PROPERTY_TYPES;

const Cell = styled.td`
  padding: 15px 30px;
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
  arrest :Map<*, *>,
  handleSelect? :(arrest :Map<*, *>, entityKeyId :string) => void
};

const ArrestRow = ({ arrest, handleSelect } :Props) => {

  const {
    [ARRESTING_AGENCY]: arrestingAgency,
    [ARREST_DATE_TIME]: arrestDateTime,
    [CASE_ID]: caseId,
    [CASE_NUMBER]: caseNumber,
    [NUMBER_OF_CHARGES]: numberOfCharges
  } = getEntityProperties(arrest, [
    ARRESTING_AGENCY,
    ARREST_DATE_TIME,
    CASE_ID,
    CASE_NUMBER,
    NUMBER_OF_CHARGES
  ]);
  const caseNum = caseNumber || caseId;
  const arrestDate = formatDate(arrestDateTime);
  const arrestTime = formatTime(arrestDateTime);

  const caseEntityKeyId :string = getEntityKeyId(arrest);

  return (
    <Row onClick={() => {
      if (handleSelect) {
        handleSelect(arrest, caseEntityKeyId);
      }
    }}>
      <Cell>{ caseNum }</Cell>
      <Cell>{ arrestDate }</Cell>
      <Cell>{ arrestTime }</Cell>
      <Cell>{ numberOfCharges }</Cell>
      <Cell>{ arrestingAgency }</Cell>
    </Row>
  );
};

ArrestRow.defaultProps = {
  handleSelect: () => {}
};

export default ArrestRow;
