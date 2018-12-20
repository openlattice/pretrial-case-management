/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import { OL } from '../../utils/consts/Colors';
import { MIL_TIME } from '../../utils/consts/DateTimeConsts';


type Props = {
  startDate :?string,
  endDate :?string,
  format24HourClock? :boolean,
  onStartChange :(start :string) => void,
  onEndChange :(end :string) => void,
  label? :string
};

const WideWrapper = styled.div`
  width: 100%;
`;

const DatePickerTitle = styled.div`
  font-size: 16px;
  margin: 28px 0 20px 0;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY01};
  font-weight: 600;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const DatePickerGroupContainer = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 10px;
`;

const DatePickerLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: ${OL.GREY01};
  margin-bottom: 10px;
`;


const DateTimeRange = ({
  startDate,
  endDate,
  format24HourClock,
  onStartChange,
  onEndChange,
  label
} :Props) => {
  const dateFormat = 'MM/DD/YYYY';
  const timeFormat = format24HourClock ? 'HH:mm' : 'hh:mm A';
  return (
    <WideWrapper>
      { label ? <DatePickerTitle>{label}</DatePickerTitle> : null }
      <DateRangeContainer>
        <DatePickerGroupContainer>
          <DatePickerLabel>Start Date</DatePickerLabel>
          <DateTimePicker
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              value={startDate}
              onChange={onStartChange}
              hideIcon
              times={MIL_TIME}
              timeIsEditable
              datePickerSelectProps={{
                placeholder: dateFormat,
              }} />
        </DatePickerGroupContainer>
        <DatePickerGroupContainer>
          <DatePickerLabel>End Date</DatePickerLabel>
          <DateTimePicker
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              value={endDate}
              onChange={onEndChange}
              hideIcon
              times={MIL_TIME}
              timeIsEditable
              datePickerSelectProps={{
                placeholder: dateFormat,
              }} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    </WideWrapper>
  );
};

DateTimeRange.defaultProps = {
  format24HourClock: false,
  label: ''
};

export default DateTimeRange;
