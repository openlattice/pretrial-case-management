/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const colorsByScale = {
  1: '#8b66db',
  2: '#a069d7',
  3: '#b36cd2',
  4: '#c86fce',
  5: '#dd72ca',
  6: '#ff77c2'
};

const Scale = styled.div`
  height: 20px;
  background: #dcdce7;
  display: inline-block;
  border-radius: 2px;
  margin-left: 10px;
`;


const ScoreScale = ({ score, width } :Props) => {

  const WIDTH_MULTIPLIER = width;

  const ScaleLeft = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (score / 6)}px;
    background: ${colorsByScale[score]};
    border-radius: 2px;
  `;
  const ScaleRight = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (1 - (score / 6))}px;
    border-radius: 0 2px 2px 0;
    margin-left: 0;
  `;

  return (
    <div>
      <ScaleLeft />
      <ScaleRight />
    </div>
  );
};

export default ScoreScale;
