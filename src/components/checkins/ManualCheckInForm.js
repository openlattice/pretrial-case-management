/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import {
  DateTimePicker,
  TextArea
} from 'lattice-ui-kit';

import RadioButton from '../controls/StyledRadioButton';
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

type Props = {
  contactMethod :string,
  setDateTime :(date :DateTime) => void,
  dateTime :string,
  handleInputChange :() => void,
  notes :string,
}

const ManualCheckInForm = ({
  contactMethod,
  setDateTime,
  dateTime,
  handleInputChange,
  notes
} :Props) => {

  return (
    <FormContainer>
      <Row>
        <Header>Check-In DateTime</Header>
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      </Row>
      <Row>
        <Header>Check-In Type</Header>
        <ButtonRow>
          <RadioButton
              height={40}
              name="contactMethod"
              value={CHECKIN_TYPE.PHONE}
              checked={contactMethod === CHECKIN_TYPE.PHONE}
              onChange={handleInputChange}
              label={CHECKIN_TYPE.PHONE} />
          <RadioButton
              height={40}
              name="contactMethod"
              value={CHECKIN_TYPE.IN_PERSON}
              checked={contactMethod === CHECKIN_TYPE.IN_PERSON}
              onChange={handleInputChange}
              label={CHECKIN_TYPE.IN_PERSON} />
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
