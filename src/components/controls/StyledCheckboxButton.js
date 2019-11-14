import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

export const CheckboxInputContainer = styled.input.attrs({
  type: 'checkbox'
})`
  position: absolute;
  opacity: 0;
`;

export const CheckboxContainer = styled.label`
  display: flex;
  width: 100%;
`;

export const CheckboxSelection = styled.span`
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
  position: relative;

  ${CheckboxContainer}:hover ${CheckboxInputContainer}:enabled:not(:checked) ~ & {
    background-color: ${OL.GREY10};
    cursor: pointer;
  }

  ${CheckboxContainer}:hover ${CheckboxInputContainer}:enabled:checked ~ & {
    background-color: ${OL.PURPLE06};
    cursor: pointer;
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:checked ~ & {
    background-color: ${OL.PURPLE06};
    color: ${OL.PURPLE02};
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:disabled ~ & {
    cursor: default;
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:disabled:checked ~ & {
    background-color: ${OL.GREY05};
    color: ${OL.GREY02};
    cursor: default;
    border: none;
  }
`;

const StyledCheckboxButton = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  large,
  small
}) => (
  <CheckboxContainer>
    <CheckboxInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <CheckboxSelection large={large} small={small}>{label}</CheckboxSelection>
  </CheckboxContainer>
);

StyledCheckboxButton.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool
};

StyledCheckboxButton.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false,
  large: false,
  small: false
};

export default StyledCheckboxButton;
