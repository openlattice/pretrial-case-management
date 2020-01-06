/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  position: absolute;
  opacity: 0;
`;

export const RadioContainer = styled.label`
  display: inline-flex;
  position: relative;
  padding-left: 30px;
  margin: 10px;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-weight: normal;
`;

export const RadioSelection = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: ${OL.GREY06};
  border-radius: 50%;
  border: 1px solid ${OL.GREY24};
  transform: ${(props) => (props.noLabel ? 'translateY(-10px)' : 'none')};

  ${RadioContainer}:hover ${RadioInputContainer} ~ & {
    background-color: ${OL.GREY22};
    cursor: pointer;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    background-color: ${OL.PURPLE02};
    border: 1px solid ${OL.PURPLE02};
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    background-color: ${OL.WHITE};
    cursor: default;
  }

  &:after {
    content: "";
    position: absolute;
    display: none;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ &:after {
    display: block;
  }

  ${RadioContainer} &:after {
    top: 6px;
    left: 6px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${OL.WHITE};
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ &:after {
    background-color: ${OL.GREY22};
  }
`;

type Props = {
  name :string,
  label :string,
  value :string | boolean,
  checked :boolean,
  onChange :() => void,
  disabled :boolean,
  noLabel :boolean
};

const StyledRadio = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  noLabel
} :Props) => (
  <RadioContainer>
    { noLabel ? null : label}
    <RadioInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection noLabel={noLabel} />
  </RadioContainer>
);

StyledRadio.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false,
  noLabel: false
};

export default StyledRadio;
