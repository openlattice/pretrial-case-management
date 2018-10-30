/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import InfoButton from '../buttons/InfoButton';
import closeX from '../../assets/svg/close-x-gray.svg';
import { OL } from '../../utils/consts/Colors';
import { HEARING } from '../../utils/consts/Consts';
import { formatDate, formatDateTime } from '../../utils/FormattingUtils';

type Props = {
  hearing :Object,
  onClose :() => void
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
  justify-content: ${props => (props.center ? 'center' : 'space-between')};
  align-items: center;
  padding: 25px 30px;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: ${OL.GREY01};
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: ${OL.GREY02};
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  div {
    font-family: 'Open Sans';
    font-size: 18px;
    color: ${OL.GREY15};
  }
`;

const SelectedHearingInfo = ({ hearing, onClose } :Props) => (
  <Container>
    <CloseButtonWrapper>
      <button onClick={onClose}><img src={closeX} alt="" /></button>
    </CloseButtonWrapper>
    <div>
      <InfoRow center>
        <h1>Hearing schedule has been set.</h1>
      </InfoRow>

      <InfoRow>
        <InfoItem>
          <span>Date</span>
          <div>{formatDate(hearing[HEARING.DATE_TIME])}</div>
        </InfoItem>
        <InfoItem>
          <span>Time</span>
          <div>{formatDateTime(hearing[HEARING.DATE_TIME], 'hh:mm a')}</div>
        </InfoItem>
        <InfoItem>
          <span>Courtroom</span>
          <div>{hearing[HEARING.COURTROOM]}</div>
        </InfoItem>
        <InfoItem>
          <span>Judge</span>
          <div>{hearing.judgeName}</div>
        </InfoItem>
      </InfoRow>

      <InfoRow center>
        <InfoButton onClick={onClose}>Close</InfoButton>
      </InfoRow>
    </div>
  </Container>
);

export default SelectedHearingInfo;
