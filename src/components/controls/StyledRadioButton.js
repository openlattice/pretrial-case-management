/*
 * @flow
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  opacity: 0;
  height: 0;
  width: 0;
`;

export const RadioContainer = styled.label`
  display: flex;
  width: 100%;
`;

export const RadioSelection = styled.span`
  padding: 5px;
  width: 100%;
  width: ${props => (props.width ? `${props.width}px` : '100%')};
  height: ${props => (props.height ? `${props.height}px` : '100%')};
  border-radius: 3px;
  background-color: ${OL.GREY10};
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => props.fontSize || 14}px;
  font-weight: normal;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  ${RadioContainer}:hover ${RadioInputContainer}:enabled:not(:checked) ~ & {
    background-color: ${OL.GREY05};
    cursor: pointer;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    background-color: ${OL.PURPLE06};
    color: ${OL.PURPLE02};
    border: solid 1px ${OL.PURPLE13};
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    cursor: default;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled:checked ~ & {
    background-color: ${OL.GREY05};
    color: ${OL.GREY02};
    cursor: default;
    border: none;
  }
`;

type Props ={
  checked :boolean,
  disabled :boolean,
  fontSize :number,
  height :number,
  label :string,
  name :string,
  onChange :() => void,
  value :string,
  width :number
}

const StyledRadioButton = ({
  checked,
  disabled,
  fontSize,
  height,
  label,
  name,
  onChange,
  value,
  width
} :Props) => (
  <RadioContainer>
    <RadioInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection fontSize={fontSize} height={height} width={width}>{label}</RadioSelection>
  </RadioContainer>
);

export default StyledRadioButton;
