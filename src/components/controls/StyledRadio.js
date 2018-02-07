import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const RadioInputContainer = styled.input.attrs({
  type: 'radio'
})`
  position: absolute;
  opacity: 0;

`;

export const RadioContainer = styled.label`
  display: inline;
  position: relative;
  padding-left: 30px;
  margin: 12px;
  cursor: pointer;
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
  background-color: white;
  border-radius: 50%;
  border: 1px solid #ddd;

  ${RadioContainer}:hover ${RadioInputContainer} ~ & {
    background-color: #ccc;
  }

  ${RadioContainer} ${RadioInputContainer}:checked ~ & {
    background-color: #2AA1C0;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ & {
    background-color: white;
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
    background-color: white;
  }

  ${RadioContainer} ${RadioInputContainer}:disabled ~ &:after {
    background-color: #ccc;
  }
`;

const StyledRadio = ({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  dataSection
}) => (
  <RadioContainer>{label}
    <RadioInputContainer
        data-section={dataSection}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled} />
    <RadioSelection />
  </RadioContainer>
);

StyledRadio.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  dataSection: PropTypes.string
};

StyledRadio.defaultProps = {
  disabled: false,
  dataSection: ''
};

export default StyledRadio;
