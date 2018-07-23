/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DateTimePicker from '../controls/StyledDateTimePicker';

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
  color: #555e6f;
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
  color: #555e6f;
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
  const timeFormat = format24HourClock ? 'HH:mm' : 'hh:mm A';
  return (
    <WideWrapper>
      <DatePickerTitle>{label}</DatePickerTitle>
      <DateRangeContainer>
        <DatePickerGroupContainer>
          <DatePickerLabel>Start Date</DatePickerLabel>
          <DateTimePicker timeFormat={timeFormat} value={startDate} onChange={onStartChange} />
        </DatePickerGroupContainer>
        <DatePickerGroupContainer>
          <DatePickerLabel>End Date</DatePickerLabel>
          <DateTimePicker timeFormat={timeFormat} value={endDate} onChange={onEndChange} />
        </DatePickerGroupContainer>
      </DateRangeContainer>
    </WideWrapper>
  );
};

DateTimeRange.defaultProps = {
  format24HourClock: false,
  label: 'Choose a date range.'
};

export default DateTimeRange;
