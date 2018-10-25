/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

type Props = {
  selectedOption :number,
  options :object,
  onSelect :() => void
}

const ToggleButtonGroup = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0;
  justify-content: space-between;
  height: 100%;
  width: max-content;
  border-radius: 4px;
  border: solid 1px #ceced9;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #8e929b;
  li:first-child {
    border: none;
    border-radius: 4px 0 0 4px;
  }
  li:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const ToggleButton = styled.li`
  cursor: pointer;
  display: block;
  justify-content: center;
  align-items: center;
  border-left: solid 1px #ceced9;
  padding: 10px;
  height: 100%;
  ${(props) => {
    if (props.active) {
      return (
        `
          color: #ffffff
          background-color: #6124e2;
        `
      );
    }
  }};
`;

const ToggleButtonsGroup = ({
  selectedOption,
  options,
  onSelect
} :Props) => {
  const selected = selectedOption;
  const navTabs = options.map((option) => {
    const { label, value } = option;
    const active = value === selected;
    return (
      <ToggleButton
          active={active}
          key={`${option.value}`}
          value={value}
          onClick={() => onSelect(value)}>
        {label}
      </ToggleButton>
    );
  });

  return (
    <ToggleButtonGroup>
      {navTabs}
    </ToggleButtonGroup>
  );
};

export default ToggleButtonsGroup;
