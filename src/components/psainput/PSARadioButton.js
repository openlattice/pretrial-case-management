/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import StyledRadioButton from '../controls/StyledRadioButton';

const RadioWrapper = styled.div`
  margin-right: 20px;
`;

type Props = {
  disabledField :boolean;
  handleInputChange :(event :Object) => void;
  input :Map;
  label :string;
  name :string;
  value :string;
  viewOnly :boolean;
};

const PSARadioButton = ({
  disabledField,
  handleInputChange,
  input,
  label,
  name,
  value,
  viewOnly,
} :Props) => (
  <RadioWrapper key={`${name}-${value}`}>
    <StyledRadioButton
        checked={input.get(name) === `${value}`}
        disabled={viewOnly || (disabledField && disabledField !== undefined)}
        label={label}
        large
        name={name}
        onChange={handleInputChange}
        value={`${value}`} />
  </RadioWrapper>
);

export default PSARadioButton;
