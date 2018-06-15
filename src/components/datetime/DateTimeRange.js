/*
 * @flow
 */

import React from 'react';
import DateTimePicker from 'react-datetime';
import styled from 'styled-components';

type Props = {
  startDate :?string,
  endDate :?string,
  format24HourClock? :boolean,
  onStartChange :(start :string) => void,
  onEndChange :(end :string) => void
};

const DatePickerTitle = styled.div`
  font-size: 16px;
  margin: 15px 0;
  text-align: center;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatePickerGroupContainer = styled.div`
  max-width: 300px;
  margin: 10px;
`;


const DateTimeRange = ({
  startDate,
  endDate,
  format24HourClock,
  onStartChange,
  onEndChange
} :Props) => {
  const timeFormat = format24HourClock ? 'HH:mm' : 'hh:mm A';
  return (
    <div>
      <DatePickerTitle>Choose a date range.</DatePickerTitle>
      <DateRangeContainer>
        <DatePickerGroupContainer>
          <div>Start Date:</div>
          <DateTimePicker timeFormat={timeFormat} value={startDate} onChange={onStartChange} />
        </DatePickerGroupContainer>
        <DatePickerGroupContainer>
          <div>End Date:</div>
          <DateTimePicker timeFormat={timeFormat} value={endDate} onChange={onEndChange} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    </div>
  );
};

DateTimeRange.defaultProps = {
  format24HourClock: false
};

export default DateTimeRange;
