/*
 * @flow
 */

import React from 'react';
import DateTimePicker from 'react-datetime';
import styled from 'styled-components';

type Props = {
  startDate :?string,
  endDate :?string,
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
  onStartChange,
  onEndChange
} :Props) => (
  <div>
    <DatePickerTitle>Choose a date range.</DatePickerTitle>
    <DateRangeContainer>
      <DatePickerGroupContainer>
        <div>Start Date:</div>
        <DateTimePicker value={startDate} onChange={onStartChange} />
      </DatePickerGroupContainer>
      <DatePickerGroupContainer>
        <div>End Date:</div>
        <DateTimePicker
            value={endDate}
            onChange={onEndChange} />
      </DatePickerGroupContainer>
    </DateRangeContainer>
  </div>
);

export default DateTimeRange;
