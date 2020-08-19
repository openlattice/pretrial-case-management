/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button } from 'lattice-ui-kit';

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

type Props = {
  hearing :Map<*, *>,
  hearingNeighbors :Map<*, *>,
  onClose :() => void,
  setHearing :() => void
};

const Container = styled.div`
  text-align: center;

  div {
    max-width: 520px;
    margin: 0 auto;
  }
`;

const CloseButtonWrapper = styled.div`
  max-width: 100% !important;
  margin: 30px 10px -55px 0 !important;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  button {
    background: none;
    border: none;
  }
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => (props.center ? 'center' : 'space-between')};
  align-items: center;
  padding: 25px 30px;

  h1 {
    font-size: 18px;
    font-weight: 600;
    color: ${OL.GREY01};
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-size: 12px;
    font-weight: 600;
    color: ${OL.GREY02};
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  div {
    font-size: 18px;
    color: ${OL.GREY15};
  }
`;

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
          <Button color="secondary" onClick={onClose}>Close</Button>
          <Button color="primary" onClick={setHearing}>Set Hearing</Button>
        </InfoRow>
      </div>
    </Container>
  );
};
export default SelectedHearingInfo;
