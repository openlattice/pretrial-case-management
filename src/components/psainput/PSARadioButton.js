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
  handleInputChange :(event :SyntheticEvent<HTMLButtonElement>) => void;
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
        height={38}
        label={label}
        name={name}
        onChange={handleInputChange}
        value={`${value}`}
        width={115} />
  </RadioWrapper>
);

export default PSARadioButton;
