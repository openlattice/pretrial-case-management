/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const Flag = styled.div`
  width: ${props => (`${props.dims.width}px`)};
  height: ${props => (`${props.dims.height}px`)};
  border-radius: 3px;
  border: solid 1px #555e6f;
  font-family: Open Sans;
  font-size: 14px;
  font-weight: 600;
  color: #2e2e34;
  justify-content: center;
`;

const BooleanFlag = ({ value, dims } :Props) => <Flag dims={dims}>{value}</Flag>;

export default BooleanFlag;
