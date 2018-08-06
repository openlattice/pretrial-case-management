import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  opacity: 0;
  height: 0;
  width: 0;
`;

export const RadioContainer = styled.label`
  display: inline-flex;
`;

export const RadioSelection = styled.span`
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

  ${RadioContainer}:hover ${RadioInputContainer}:enabled:not(:checked) ~ & {
    background-color: #dcdce7;
    cursor: pointer;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    background-color: #e4d8ff;
    color: #6124e2;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    cursor: default;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled:checked ~ & {
    background-color: #dcdce7;
    color: #8e929b;
    cursor: default;
  }
`;

const StyledRadioButton = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled
}) => (
  <RadioContainer>
    <RadioInputContainer
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection>{label}</RadioSelection>
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
  disabled: PropTypes.bool
};

StyledRadioButton.defaultProps = {
  disabled: false,
  name: undefined,
  checked: false
};

export default StyledRadioButton;
