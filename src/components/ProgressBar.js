/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
import { OL } from '../utils/consts/Colors';

const Bar = styled(ProgressBar)`
  background: ${OL.WHITE};
  width: 100%;
`;

type Props = {
  progress :{
    num :number,
    percentage :string
  }
};

const FormProgressBar = ({ progress } :Props) => (
  <Bar bsStyle="info" now={progress.num} label={progress.percentage} />
);

export default FormProgressBar;
