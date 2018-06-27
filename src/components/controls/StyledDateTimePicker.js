import React from 'react';
import styled from 'styled-components';
import DateTimePicker from 'react-datetime';

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

const StyledDateTimePickerInput = styled(DateTimePicker)`
  height: 39px;
  border-radius: 3px;
  border: 1px solid #dcdce7;
  box-shadow: none;
  position: absolute;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  width: 100%;

  input {
    height: 100%;
    border-radius: 3px;
    background-color: #f9f9fd;
    box-shadow: none;
    border: none
  }

  input::placeholder {
    color: #8e929b;
  }

  input:focus {
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
  }
`;

const onKeyPress = (e, props) => {
  if (props.onKeyPress) {
    props.onKeyPress(e);
  }
};

const StyledDatePicker = props => (
  <DatePickerWrapper onKeyPress={e => onKeyPress(e, props)}>
    <StyledDateTimePickerInput inputProps={{ placeholder: 'MM/DD/YYYY HH:mm' }} showClearButton={false} {...props} />
    <IconWrapper>
      <img src={calendarIcon} role="presentation" />
    </IconWrapper>
  </DatePickerWrapper>
);

export default StyledDatePicker;
