/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const Control = styled.label`
  display: block;
  position: relative;
  padding: 0 10px 0 30px;
  margin-bottom: 15px;
  cursor: pointer;
  font-size: 16px;
  font-weight: normal;

  input {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }
`;

const CheckboxInput = styled.input.attrs({
  type: 'checkbox'
})`
  position: absolute;
  z-index: -1;
  opacity: 0;
`;

const CheckboxIndicator = styled.div`
  position: absolute;
  top: 2px;
  left: 0;
  height: 20px;
  width: 20px;
  background: #E6E6E6;

  ${Control}:hover input ~ &,
  ${Control} input:focus & {
    background: #CCCCCC;
  }

  ${Control} input:checked ~ & {
    background: #2AA1C0;
  }

  ${Control}:hover input:not([disabled]):checked ~ &,
  ${Control} input:checked:focus & {
    background: #0E647D;
  }

  ${Control} input:disabled ~ & {
    background: #E6E6E6;
    opacity: 0.6;
    pointer-events: none;
  }

  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 8px;
    top: 4px;
    width: 3px;
    height: 8px;
    border solid: #FFFFFF;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);

    ${Control} input:checked ~ & {
      display: block;
    }

    ${Control} & {
      left: 8px;
      top: 4px;
      width: 5px;
      height: 10px;
      border: solid #FFFFFF;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    ${Control} input:disabled ~ & {
      border-color: #7B7B7B;
    }
  }
`;

type Props = {
  name :string,
  label :string,
  value :string,
  checked :boolean,
  onChange :(event :Object) => void,
  disabled? :boolean,
  dataSection? :?string
};

const StyledCheckbox = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  dataSection
} :Props) => (
  <Control>{label}
    <CheckboxInput
        data-section={dataSection}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <CheckboxIndicator />
  </Control>
);

StyledCheckbox.defaultProps = {
  disabled: false,
  dataSection: ''
};

export default StyledCheckbox;
