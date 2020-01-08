/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

type Props = {
  selectedOption :number,
  options :object,
  onSelect :() => void
}

const ToggleButtonGroup = styled.ul`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
  width: max-content;
  max-width: 900px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: ${OL.GREY02};

  li:first-child {
    border-radius: 4px 0 0 4px;
  }

  li:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const ToggleButton = styled.li`
  margin-bottom: 10px;
  cursor: pointer;
  display: block;
  justify-content: center;
  align-items: center;
  border: solid 1px ${OL.GREY13};
  margin-right: -1px;
  padding: 10px;
  height: 100%;
  ${(props) => {
    if (props.active) {
      return (
        `
          color: ${OL.WHITE};
          background-color: ${OL.PURPLE02};
        `
      );
    }
    return '';
  }};
`;

const ToggleButtonsGroup = ({
  selectedOption,
  options,
  onSelect
} :Props) => {
  const selected = selectedOption;
  const buttons = options.map((option) => {
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
      {buttons}
    </ToggleButtonGroup>
  );
};

export default ToggleButtonsGroup;
