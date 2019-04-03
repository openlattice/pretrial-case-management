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
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties, getDateAndTime } from '../../utils/DataUtils';
import { StyledTooltip } from '../../utils/Layout';

const {
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_TYPE
} = PROPERTY_TYPES;

const CaseId = styled.div`
  display: block;
  overflow: hidden;
  width: 100%;
  font-size: 14px;
  color: ${OL.GREY15};
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: ${OL.GREY15};
  height: 40px;
  position: relative;

  &:hover ${StyledTooltip} {
    visibility: visible;
  }
`;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 110px 70px 130px 190px 100px 95px 200px;
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

const Tooltip = ({ value } :object) => (
  value && value.length ? <StyledTooltip>{value}</StyledTooltip> : null
);

type Props = {
  caseId :string,
  hasOpenPSA :boolean,
  hasOutcome :boolean,
  hearing :Immutable.Map<*, *>,
  cancelFn :(entityKeyId :string) => void,
  isDuplicate :boolean,
  disabled :boolean
};

const HearingRow = ({
  caseId,
  hasOpenPSA,
  hasOutcome,
  hearing,
  cancelFn,
  disabled,
  isDuplicate
} :Props) => {

  const {
    [COURTROOM]: courtroom,
    [DATE_TIME]: hearingDateTime,
    [ENTITY_KEY_ID]: hearingEntityKeyId,
    [HEARING_TYPE]: hearingType
  } = getEntityProperties(hearing,
    [
      COURTROOM,
      DATE_TIME,
      ENTITY_KEY_ID,
      HEARING_TYPE
    ]);

  const { date: hearingDate, time: hearingTime } = getDateAndTime(hearingDateTime);

  const renderBooleanIcon = boolean => (boolean
    ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
    : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>
  );

  const disabledText = hasOutcome ? 'Hearing Has Outcome' : 'Odyssey Hearing';

  const renderCancelButton = (
    <CancelButton onClick={() => cancelFn(hearingEntityKeyId)} disabled={disabled}>
      { disabled ? disabledText : 'Cancel Hearing'}
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
        disabled>
      <Cell>{ hearingDate }</Cell>
      <Cell>{ hearingTime }</Cell>
      <Cell>{ courtroom }</Cell>
      <Cell>
        { hearingType }
        { renderDuplicateTag }
      </Cell>
      <Cell>
        <CaseId>{caseId}</CaseId>
        <Tooltip value={caseId} />
      </Cell>
      <Cell>{renderBooleanIcon(hasOpenPSA)}</Cell>
      <Cell>{renderCancelButton}</Cell>
    </Row>
  );
};


export default HearingRow;
