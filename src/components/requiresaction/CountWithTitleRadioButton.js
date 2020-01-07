/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const percentageToHsl = (count) => {
  let percentage = count / 500;
  if (count > 500) percentage = 1;
  const hue = (percentage * -162) + 162;
  return `hsl(${hue}, 100%, ${28 + percentage * (34)}%)`;
};

const Count = styled.div`
  color: ${(props) => percentageToHsl(props.count)};
  font-size: 25px;
  opacity: ${(props) => (props.checked ? 1 : 0.5)};
`;


export const RadioContainer = styled.label`
  display: flex;
  width: 100%;
`;

export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  height: 0;
  opacity: 0;
  width: 0;
`;

export const RadioSelection = styled.span`
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 3px;
  border: solid 1px ${OL.GREY11};
  color: ${OL.GREY02};
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 13.5px;
  font-weight: normal;
  flex-direction: column;
  justify-content: center;
  min-width: 84px;
  padding: 10px 12px;
  text-align: center;
  width: 100%;

  ${RadioContainer}:hover ${RadioInputContainer}:enabled:not(:checked) ~ & {
    background-color: ${OL.GREY05};
    cursor: pointer;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    border: solid 1px ${OL.GREY03};
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    cursor: default;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled:checked ~ & {
    background-color: ${OL.GREY05};
    border: none;
    color: ${OL.GREY02};
    cursor: default;
  }
`;

const Title = styled.div`
  color: ${(props) => (props.checked ? OL.GREY01 : OL.GREY02)};
  font-size: 13.5px;
`;

type Props = {
  count :number;
  name :string;
  label :string;
  value :string | boolean;
  checked :boolean;
  onChange :func.isRequired;
  disabled :boolean;
  large :boolean;
};

const StyledRadioButton = ({
  name,
  count,
  label,
  value,
  checked,
  onChange,
  disabled,
  large
} :Props) => (
  <RadioContainer>
    <RadioInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection large={large}>
      <Count checked={checked} count={count}>{count}</Count>
      <Title checked={checked}>{label}</Title>
    </RadioSelection>
  </RadioContainer>
);

StyledRadioButton.defaultProps = {
  count: 0,
  disabled: false,
  name: undefined,
  checked: false,
  large: false
};

export default StyledRadioButton;
