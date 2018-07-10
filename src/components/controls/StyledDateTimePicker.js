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
    border: none;
  }

  input::placeholder {
    color: #8e929b;
  }

  input:focus {
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
    background-color: #ffffff;
  }

  div {
    padding: 20px;
    background-color: #ffffff;
    border: solid 1px #e1e1eb !important;
    box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1) !important;
    min-width: 300px;

    div {
      padding: 0;
      border: none !important;
      box-shadow: none !important;
      min-width: 270px;

      table {

        thead {
          tr:first-child {
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            font-weight: bold;
            color: #555e6f;

            th {
              span {
                transform: scaleY(1.5);
                font-weight: 300;
                font-size: 12px;
                min-width: 36px;
                height: 14px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding: 10px 12px;

                &:hover {
                  background-color: #f0f0f7;
                }
              }
            }
          }

          tr:last-child {
            text-transform: uppercase;
            font-family: 'Open Sans', sans-serif;
            font-size: 11px;
            font-weight: bold;
            color: #8e929b;
          }
        }

        tbody {
          tr {
            td {
              width: 36px;
              height: 27px;
              font-family: 'Open Sans', sans-serif;
              font-size: 12px;
              font-weight: 600;
              text-align: center;
              color: #555e6f;
              border-radius: 2px !important;

              div {
                min-width: auto !important;
                width: auto !important;
              }
            }
          }
        }
      }
    }

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
