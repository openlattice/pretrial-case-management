import React from 'react';
import styled from 'styled-components';
import DatePicker from 'react-bootstrap-date-picker';

import { OL } from '../../utils/consts/Colors';
import calendarIcon from '../../assets/svg/calendar-icon.svg';

const DatePickerWrapper = styled.div`
  position: relative;
  height: 39px;
  width: 100%;
  min-width: 140px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 20px;
  height: ${props => (props.clearButton ? '0' : '100%')};
  display: flex;
  justify-content: center;
  visibility: ${props => (props.clearButton ? 'hidden' : 'visible')};

  img {
    margin-top: ${props => (props.paddingTop ? '20px' : '0')};
  }
`;

const StyledDatePickerInput = styled(DatePicker)`
  height: 39px;
  border-radius: 3px;
  background-color: none;
  border: 1px solid ${OL.GREY05};
  padding: 0 8px;
  box-shadow: none;
  position: absolute;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;

  &::placeholder {
    color: ${OL.GREY02};
  }

  &:focus {
    background-color: ${OL.WHITE};
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
  }

  & ~ div {
    div {

      div {
        min-width: 300px;
        border: solid 1px ${OL.GREY11};
        box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);

        div {
          border: none;
          box-shadow: none;
          min-width: auto;
        }

        h3 {
          background-color: ${OL.WHITE};
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
              color: ${OL.GREY01};
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
                background-color: ${OL.GREY08};
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
                  color: ${OL.GREY02};
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
                  color: ${OL.GREY01};
                  padding: 5px 16px;
                  border-radius: 2px !important;

                  &:hover {
                    background-color: ${OL.GREY08};
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
    <IconWrapper clearButton={props.clearButton} paddingTop={props.paddingTop}>
      <img src={calendarIcon} role="presentation" />
    </IconWrapper>
  </DatePickerWrapper>
);

export default StyledDatePicker;
