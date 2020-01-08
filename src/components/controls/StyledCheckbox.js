/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const Control = styled.label`
  display: block;
  position: relative;
  padding: 0 10px 0 30px;
  margin-bottom: 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: normal;
  color: ${(props) => (props.checked ? OL.GREY15 : OL.GREY02)};
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};

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
  border-radius: 2px;
  background: ${OL.GREY21};
  
  ${Control} input:checked ~ & {
    background: ${OL.PURPLE02};
  }

  ${Control} input:disabled ~ & {
    background: ${OL.GREY21};
    opacity: 0.6;
    pointer-events: none;
  }

  ${Control}:hover input ~ &,
  ${Control} input:focus & {
    background: ${OL.GREY22};
  }

  ${Control}:hover input:not([disabled]):checked ~ &,
  ${Control} input:checked:focus & {
    background: ${OL.PURPLE02};
  }

  &:after {
    content: '';
    position: absolute;
    display: none;
    left: 8px;
    top: 4px;
    width: 3px;
    height: 8px;
    border: solid ${OL.WHITE};
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
      border: solid ${OL.WHITE};
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    ${Control} input:disabled ~ & {
      border-color: ${OL.GREY23};
    }
  }
`;

type Props = {
  checked :boolean;
  dataSection? :?string;
  disabled? :boolean;
  label :string;
  name :string;
  onChange :(event :Object) => void;
  value :string;
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
  <Control disabled={disabled} checked={checked}>
    {label}
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
