/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import { formatTime } from '../../utils/FormattingUtils';

const DateTimePickerWrapper = styled.div`
  position: relative;
  height: 39px;
  width: 100%;
  min-width: 140px;
`;

type Props = {
  value :?string,
  onChange :(date :string) => void,
};

const StyledStyledDateTimePicker = ({
  value,
  onChange
} :Props) => {
  const dateFormat = 'MM/DD/YYYY';
  const timeFormat = 'HH:mm';
  return (
    <DateTimePickerWrapper>
      <DateTimePicker
          dateFormat={dateFormat}
          timeFormat={timeFormat}
          value={value}
          onChange={(time) => {
            const submitTime = (time).replace(/['pm','am'].*$/g, '');
            onChange(submitTime);
          }}
          hideIcon
          timeIsEditable
          placeholder={dateFormat}
          times={[formatTime(DateTime.local().toISO())]}
          datePickerSelectProps={{
            placeholder: dateFormat,
          }} />
    </DateTimePickerWrapper>
  );
};

export default StyledStyledDateTimePicker;
