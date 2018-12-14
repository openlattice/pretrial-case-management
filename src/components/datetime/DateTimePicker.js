/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTimePicker } from '@atlaskit/datetime-picker';

import { MIL_TIME } from '../../utils/consts/DateTimeConsts';

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
          onChange={onChange}
          hideIcon
          times={MIL_TIME}
          datePickerSelectProps={{
            placeholder: dateFormat,
          }} />
    </DateTimePickerWrapper>
  );
};

export default StyledStyledDateTimePicker;
