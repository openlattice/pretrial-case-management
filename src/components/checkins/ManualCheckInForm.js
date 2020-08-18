/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import {
  DateTimePicker,
  Radio,
  TextArea
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

import LogoLoader from '../LogoLoader';
import { OL } from '../../utils/consts/Colors';
import { CHECKIN_TYPE } from '../../utils/consts/CheckInConsts';

/*
 * styled components
 */

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 575px;
  min-height: 432px;
`;

const Row = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 10px;
`;

const Header = styled.div`
  font-size: 14px;
  line-height: 19px;
  margin-bottom: 30px;
  color: ${OL.GREY15};
`;

const ErrorWrapper = styled.div`
  font-size: 12px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  color: ${OL.RED01};

  svg {
    margin: 2px;
  }
`;

type Props = {
  contactMethod :string,
  dateTime :string,
  error :string,
  handleInputChange :() => void,
  loading :boolean,
  setDateTime :(date :DateTime) => void,
  notes :string,
}

const ManualCheckInForm = ({
  contactMethod,
  dateTime,
  error,
  handleInputChange,
  loading,
  notes,
  setDateTime
} :Props) => {

  if (loading) return <FormContainer><LogoLoader size={30} /></FormContainer>;

  return (
    <FormContainer>
      {
        error.length
          ? (
            <ErrorWrapper>
              <FontAwesomeIcon color={OL.RED01} icon={faExclamationTriangle} />
            Something went wrong. If this problem continues, contact support.
            </ErrorWrapper>
          ) : null
      }
      <Row>
        <Header>Check-In DateTime</Header>
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      </Row>
      <Row>
        <Header>Check-In Type</Header>
        <ButtonRow>
          <Radio
              checked={contactMethod === CHECKIN_TYPE.PHONE}
              mode="button"
              name="contactMethod"
              onChange={handleInputChange}
              label={CHECKIN_TYPE.PHONE}
              value={CHECKIN_TYPE.PHONE} />
          <Radio
              checked={contactMethod === CHECKIN_TYPE.IN_PERSON}
              mode="button"
              name="contactMethod"
              onChange={handleInputChange}
              label={CHECKIN_TYPE.IN_PERSON}
              value={CHECKIN_TYPE.IN_PERSON} />
        </ButtonRow>
      </Row>
      <Row>
        <Header>Notes</Header>
        <TextArea name="notes" onChange={handleInputChange} value={notes} />
      </Row>
    </FormContainer>
  );
};

export default ManualCheckInForm;
