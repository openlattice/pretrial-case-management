/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { ProgressBar } from 'react-bootstrap';

const Bar = styled(ProgressBar)`
  background: white;
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
