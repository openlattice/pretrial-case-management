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

const Count = styled.div`
  font-size: 25px;
  color: ${(props) => percentageToHsl(props.count)};
  opacity: ${(props) => (props.checked ? 1 : 0.5)};
`;

const Title = styled.div`
  font-size: 13.5px;
  color: ${(props) => (props.checked ? OL.GREY01 : OL.GREY02)};
`;

export const RadioSelection = styled.span`
  padding: 10px 12px;
  width: 100%;
  min-width: 84px;
  border-radius: 3px;
  border: solid 1px ${OL.GREY11};
  background-color: ${OL.WHITE};
  font-family: 'Open Sans', sans-serif;
  font-size: 13.5px;
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
    border: solid 1px ${OL.GREY03};
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
