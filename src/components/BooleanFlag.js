/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../utils/consts/Colors';

const Flag = styled.div`
  align-items: center;
  background-color: ${(props) => (props.value ? OL.GREY05 : 'transparent')};
  border: solid 1px ${OL.GREY02} !important;
  border-radius: 3px;
  color: ${OL.GREY15};
  display: flex;
  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-weight: 600;
  height: ${(props) => (`${props.dims.height}px`)};
  justify-content: center;
  width: ${(props) => (`${props.dims.width}px`)};
`;

type Props = {
  value :boolean;
  dims :Object;
}

const BooleanFlag = ({ value, dims } :Props) => {
  const displayValue = value ? 'Yes' : 'No';
  return (
    <Flag value={value} dims={dims}>{displayValue}</Flag>
  );
};

export default BooleanFlag;
