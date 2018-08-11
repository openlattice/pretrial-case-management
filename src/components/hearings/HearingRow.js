/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Constants } from 'lattice';

import InfoButton from '../../components/buttons/InfoButton';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateTime } from '../../utils/FormattingUtils';

const { OPENLATTICE_ID_FQN } = Constants;

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
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    background: ${props => (props.disabled ? '#ffffff' : '#f8f8fc')};
  }

  &:active {
    background-color: #f0f0f7;
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  row :Immutable.Map<*, *>,
  handleSelect? :(row :Immutable.Map<*, *>, hearingId :string, entityKeyId :string) => void,
  disabled? :boolean
};

const HearingRow = ({ row, handleSelect, disabled } :Props) => {
  const dateTime = row.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
  const date = formatDateTime(dateTime, 'MM/DD/YYYY');
  const time = formatDateTime(dateTime, 'HH:mm');
  const courtroom = row.getIn([PROPERTY_TYPES.COURTROOM, 0], '');

  const hearingId = row.getIn([PROPERTY_TYPES.CASE_ID, 0]);
  const entityKeyId :string = row.getIn([OPENLATTICE_ID_FQN, 0], '');

  return (
    <Row disabled={disabled} onClick={() => {
      if (handleSelect) {
        handleSelect(row, entityKeyId);
      }
    }}>
      <Cell>{ date }</Cell>
      <Cell>{ time }</Cell>
      <Cell>{ courtroom }</Cell>
      <Cell><InfoButton onClick={() => handleSelect(row, hearingId, entityKeyId)}>Select</InfoButton></Cell>
    </Row>
  );
};

HearingRow.defaultProps = {
  handleSelect: () => {},
  disabled: false
};

export default HearingRow;
