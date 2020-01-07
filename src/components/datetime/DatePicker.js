/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DatePicker } from '@atlaskit/datetime-picker';

import { formatDate } from '../../utils/FormattingUtils';

const DatePickerWrapper = styled.div`
  position: relative;
  height: 39px;
  width: 100%;
`;

const onKeyPressFn = (e, onKeyPress) => {
  if (onKeyPress) {
    onKeyPress(e);
  }
};

const StyledDatePicker = ({
  value,
  onChange,
  onKeyPress,
  subtle,
  isInvalid
} :Props) => {
  const dateIsInvalid = (isInvalid === undefined) ? false : isInvalid;
  const dateFormat = 'MM/DD/YYYY';
  const appearance = subtle ? 'subtle' : 'default';

  return (
    <DatePickerWrapper onKeyPress={(e) => onKeyPressFn(e, onKeyPress)}>
      <DatePicker
          isInvalid={dateIsInvalid}
          appearance={appearance}
          hideIcon
          value={value}
          onChange={(date) => onChange(formatDate(date))}
          placeholder={dateFormat}
          dateFormat={dateFormat}
          datePickerSelectProps={{
            placeholder: dateFormat,
          }} />
    </DatePickerWrapper>
  );
};

export default StyledDatePicker;
