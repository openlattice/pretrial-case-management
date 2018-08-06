import React from 'react';
import styled from 'styled-components';
import DatePicker from 'react-bootstrap-date-picker';

import calendarIcon from '../../assets/svg/calendar-icon.svg';

const DatePickerWrapper = styled.div`
  position: relative;
  height: 39px;
  min-width: 140px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 20px;
  height: ${props => (props.clearButton ? '0' : '100%')};
  display: flex;
  justify-content: center;
  visibility: ${props => (props.clearButton ? 'hidden' : 'visible')};
`;

const StyledDatePickerInput = styled(DatePicker).attrs({

})`
  height: 39px;
  border-radius: 3px;
  background-color: none;
  border: 1px solid #dcdce7;
  padding: 0 8px;
  box-shadow: none;
  position: absolute;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;

  &::placeholder {
    color: #8e929b;
  }

  &:focus {
    background-color: #ffffff;
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
  }

  & ~ div {
    div {

      div {
        min-width: 300px;
        border: solid 1px #e1e1eb;
        box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);

        div {
          border: none;
          box-shadow: none;
          min-width: auto;
        }

        h3 {
          background-color: #ffffff;
          padding: 20px 15px 0 15px;
          border: none;

          div {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            min-width: 270px;

            span {
              font-family: 'Open Sans', sans-serif;
              font-size: 14px;
              font-weight: bold;
              color: #555e6f;
            }

            div {
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

        h3 ~ div {
          min-width: 300px;

          table {
            width: 100%;
            padding: 20px 30px;

            thead {
              tr {
                td {
                  text-transform: uppercase;
                  font-family: 'Open Sans', sans-serif;
                  font-size: 11px;
                  font-weight: bold;
                  color: #8e929b;
                }
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
                  padding: 5px 16px;
                  border-radius: 2px !important;

                  &:hover {
                    background-color: #f0f0f7;
                  }
                }
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
    <StyledDatePickerInput {...props} showClearButton={props.clearButton} />
    <IconWrapper clearButton={props.clearButton} >
      <img src={calendarIcon} role="presentation" />
    </IconWrapper>
  </DatePickerWrapper>
);

export default StyledDatePicker;
