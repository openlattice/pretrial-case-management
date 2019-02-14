/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import InfoButton from '../buttons/InfoButton';
import { OL } from '../../utils/consts/Colors';
import { getHearingFields } from '../../utils/consts/HearingConsts';
import { isUUID } from '../../utils/DataUtils';

const Cell = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: ${OL.GREY15};
  height: 40px;
`;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 120px 74px 145px 250px 92px 216px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    background: ${props => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:active {
    background-color: ${OL.GREY08};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DeleteButton = styled(InfoButton)`
  height: 30px;
  width: 100%;
  padding: 5px 10px;
  border-radius: 5px;
`;

const DuplicateText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 12px;
  color: ${OL.RED01};
`;

const CancelButton = styled(DeleteButton)`
  background: ${OL.GREY02};
  &:hover {
    background: ${OL.GREY03};
  }
`;

const StatusIconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 5px;
`;

type Props = {
  hasPSA :boolean,
  row :Immutable.Map<*, *>,
  cancelFn :(entityKeyId :string) => void,
  isDuplicate :boolean,
  disabled :boolean
};

const HearingRow = ({
  hasPSA,
  row,
  cancelFn,
  disabled,
  isDuplicate
} :Props) => {
  const {
    courtroom,
    hearingDate,
    hearingEntityKeyId,
    hearingTime,
    hearingType
  } = getHearingFields(row);

  const renderBooleanIcon = boolean => (boolean
    ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
    : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>
  );

  const renderCancelButton = (
    <CancelButton onClick={() => cancelFn(hearingEntityKeyId)} disabled={disabled}>
      { disabled ? 'Hearing Has Outcomes' : 'Cancel Hearing'}
    </CancelButton>
  );

  const renderDuplicateTag = isDuplicate
    ? (
      <DuplicateText>
        <StatusIconContainer><FontAwesomeIcon color="red" icon={faExclamationTriangle} /></StatusIconContainer>
        Duplicate
      </DuplicateText>
    ) : null;

  return (
    <Row
        disabled={disabled}>
      <Cell>{ hearingDate }</Cell>
      <Cell>{ hearingTime }</Cell>
      <Cell>{ courtroom }</Cell>
      <Cell>
        { hearingType }
        { renderDuplicateTag }
      </Cell>
      <Cell>{renderBooleanIcon(hasPSA)}</Cell>
      <Cell>{renderCancelButton}</Cell>
    </Row>
  );
};


export default HearingRow;
