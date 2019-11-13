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
  min-width: ${props => (props.large ? 84 : 60)}px;
  height: ${props => (props.small ? 38 : 56)}px;
  border-radius: 3px;
  background-color: ${OL.GREY10};
  font-family: 'Open Sans', sans-serif;
  font-size: ${props => (props.large ? 14 : 11)}px;
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

const StyledRadioButton = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  large
}) => (
  <RadioContainer>
    <RadioInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection large={large}>{label}</RadioSelection>
  </RadioContainer>
);

StyledRadioButton.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  large: PropTypes.bool
};

StyledRadioButton.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false,
  large: false
};

export default StyledRadioButton;
