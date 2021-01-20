/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL, SCALE } from '../utils/consts/Colors';

const Scale = styled.div`
  background: ${OL.GREY05};
  display: inline-block;
  border-radius: 2px;
  margin-left: 10px;
`;

const ScaleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type Props = {
  score :number;
  dims ?:Object;
};

const SCALE_DIMS = { height: 20, width: 96 };

const ScoreScale = ({ score, dims = SCALE_DIMS } :Props) => {

  const ScaleLeft = styled(Scale)`
    width: ${dims.width * (score / 6)}px;
    height: ${dims.height}px;
    background: ${SCALE[score]};
    border-radius: 2px;
  `;
  const ScaleRight = styled(Scale)`
    width: ${dims.width * (1 - (score / 6))}px;
    height: ${dims.height}px;
    border-radius: 0 2px 2px 0;
    margin-left: 0;
  `;

  return (
    <ScaleWrapper>
      <ScaleLeft />
      <ScaleRight />
    </ScaleWrapper>
  );
};

export default ScoreScale;
