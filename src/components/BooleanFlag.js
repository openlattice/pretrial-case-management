/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const Flag = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => (`${props.dims.width}px`)};
  height: ${props => (`${props.dims.height}px`)};
  border-radius: 3px;
  border: solid 1px #555e6f !important;
  font-family: Open Sans;
  font-size: 14px;
  font-weight: 600;
  color: #2e2e34;
`;

const BooleanFlag = ({ value, dims } :Props) => {
  const displayValue = value ? 'Yes' : 'No'
  return (
    <Flag dims={dims}>{displayValue}</Flag>
  );
};

export default BooleanFlag;
