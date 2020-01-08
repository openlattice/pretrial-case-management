/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import InfoButton from '../buttons/InfoButton';
import closeX from '../../assets/svg/close-x-gray.svg';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatJudgeName } from '../../utils/HearingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate, formatTime } from '../../utils/FormattingUtils';

const { JUDGES } = APP_TYPES;

const {
  COURTROOM,
  DATE_TIME,
} = PROPERTY_TYPES;

const CloseButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 30px 10px -55px 0 !important;
  max-width: 100% !important;

  button {
    background: none;
    border: none;
  }
`;

const Container = styled.div`
  text-align: center;

  div {
    max-width: 520px;
    margin: 0 auto;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  span {
    color: ${OL.GREY02};
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 5px;
    text-transform: uppercase;
  }

  div {
    color: ${OL.GREY15};
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
  }
`;

const InfoRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => (props.center ? 'center' : 'space-between')};
  padding: 25px 30px;

  h1 {
    color: ${OL.GREY01};
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: 600;
  }
`;


type Props = {
  hearing :Map;
  hearingNeighbors :Map;
  onClose :() => void;
  setHearing :() => void;
};

const SelectedHearingInfo = ({
  hearing,
  hearingNeighbors,
  setHearing,
  onClose
} :Props) => {
  const {
    [DATE_TIME]: hearingDateTime,
    [COURTROOM]: hearingCourtroom,
  } = getEntityProperties(hearing, [DATE_TIME, COURTROOM]);
  const judge = hearingNeighbors.get(JUDGES, Map());
  const judgeName = formatJudgeName(judge);
  return (
    <Container>
      <CloseButtonWrapper>
        <button type="button" aria-label="Close" onClick={onClose}><img src={closeX} alt="" /></button>
      </CloseButtonWrapper>
      <div>
        <InfoRow center>
          <h1>Hearing schedule has been set.</h1>
        </InfoRow>

        <InfoRow>
          <InfoItem>
            <span>Date</span>
            <div>{formatDate(hearingDateTime)}</div>
          </InfoItem>
          <InfoItem>
            <span>Time</span>
            <div>{formatTime(hearingDateTime)}</div>
          </InfoItem>
          <InfoItem>
            <span>Courtroom</span>
            <div>{hearingCourtroom}</div>
          </InfoItem>
          <InfoItem>
            <span>Judge</span>
            <div>{judgeName}</div>
          </InfoItem>
        </InfoRow>

        <InfoRow center>
          <InfoButton onClick={onClose}>Close</InfoButton>
          <InfoButton onClick={setHearing}>Set Hearing</InfoButton>
        </InfoRow>
      </div>
    </Container>
  );
};
export default SelectedHearingInfo;
