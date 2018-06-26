import React from 'react';
import styled from 'styled-components';
import DatePicker from 'react-bootstrap-date-picker';

import calendarIcon from '../../assets/svg/calendar-icon.svg';

const DatePickerWrapper = styled.div`
  position: relative;
  height: 39px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 20px;
  height: 100%;
  display: flex;
  justify-content: center;
`;

const StyledDatePickerInput = styled(DatePicker)`
  height: 39px;
  border-radius: 3px;
  background-color: #f9f9fd;
  border: 1px solid #dcdce7;
  padding: 0 20px;
  box-shadow: none;
  position: absolute;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;

  &::placeholder {
    color: #8e929b;
  }
`;

const onKeyPress = (e, props) => {
  if (props.onKeyPress) {
    props.onKeyPress(e);
  }
};

const StyledDatePicker = props => (
  <DatePickerWrapper onKeyPress={e => onKeyPress(e, props)}>
    <StyledDatePickerInput showClearButton={false} {...props} />
    <IconWrapper>
      <img src={calendarIcon} role="presentation" />
    </IconWrapper>
  </DatePickerWrapper>
);

export default StyledDatePicker;
