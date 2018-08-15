import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
  padding: 9px 22px;
  width: 100%;
  min-width: 84px;
  height: ${props => (props.large ? '56px' : '38px')};
  border-radius: 3px;
  background-color: #f9f9fd;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: normal;
  color: #8e929b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;

  ${CheckboxContainer}:hover ${CheckboxInputContainer}:enabled:not(:checked) ~ & {
    background-color: #dcdce7;
    cursor: pointer;
  }

  ${CheckboxContainer}:hover ${CheckboxInputContainer}:enabled:checked ~ & {
    background-color: #e4d8ff;
    cursor: pointer;
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:checked ~ & {
    background-color: #e4d8ff;
    color: #6124e2;
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:disabled ~ & {
    cursor: default;
  }

  ${CheckboxContainer} ${CheckboxInputContainer}:disabled:checked ~ & {
    background-color: #dcdce7;
    color: #8e929b;
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
  large
}) => (
  <CheckboxContainer>
    <CheckboxInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <CheckboxSelection large={large} >{label}</CheckboxSelection>
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
  large: PropTypes.bool
};

StyledCheckboxButton.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false,
  large: false
};

export default StyledCheckboxButton;
