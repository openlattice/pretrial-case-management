/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../utils/consts/Colors';

const Flag = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props :Object) => (props.dims ? `${props.dims.width}px` : '100%')};
  height: ${(props :Object) => (props.dims ? `${props.dims.height}px` : '100%')};
  background-color: ${(props :Object) => (props.value ? OL.GREY05 : 'transparent')};
  border-radius: 3px;
  border: solid 1px ${OL.GREY02} !important;
  font-size: 14px;
  font-weight: 600;
  color: ${OL.GREY15};
`;

const BooleanFlag = ({ value, dims } :Props) => {
  const displayValue = value ? 'Yes' : 'No';
  return (
    <Flag value={value} dims={dims}>{displayValue}</Flag>
  );
};

export default BooleanFlag;
