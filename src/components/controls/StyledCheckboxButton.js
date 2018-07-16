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
  display: inline-flex;
`;

export const CheckboxSelection = styled.span`
  padding: 10px 12px;
  min-width: 84px;
  height: 38px;
  border-radius: 3px;
  background-color: #f9f9fd;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #8e929b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  }
`;

const StyledCheckboxButton = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled
}) => (
  <CheckboxContainer>
    <CheckboxInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <CheckboxSelection>{label}</CheckboxSelection>
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
  disabled: PropTypes.bool
};

StyledCheckboxButton.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false
};

export default StyledCheckboxButton;
