/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { CardSegment } from 'lattice-ui-kit';
import type { Element } from 'react';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  ResultHeader,
  ScaleBlock,
  SelectedScaleBlock,
  ScaleWrapper
} from '../../utils/Layout';

const MAX_SCORE = 6;

const PSAScaleWrapper = styled(ScaleWrapper)`
  height: auto;
`;

const createScale = (scaleValue :number) :Element<*> => {
  const scale = [];
  for (let i = 1; i <= MAX_SCORE; i += 1) {
    const block = (i <= scaleValue)
      ? <SelectedScaleBlock key={i} isScore={i === scaleValue}>{i}</SelectedScaleBlock>
      : <ScaleBlock key={i}>{i}</ScaleBlock>;
    scale.push(block);
  }
  return <PSAScaleWrapper>{scale}</PSAScaleWrapper>;
};

const Flag = styled.span`
  border-radius: 3px;
  border: solid 1px ${OL.GREY01};
  color: ${OL.GREY01};
  font-size: 16px;
  font-weight: 600;
  height: 32px;
  padding: 5px 30px;
  width: 86px;
`;

const InlineScores = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 30px;

  div {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
`;

type Props = {
  scores :Map;
};

const PSAScores = ({ scores } :Props) => {

  const nvcaFlag :string = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]) ? 'Yes' : 'No';
  const ncaScaleValue :number = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const ftaScaleValue :number = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  return (
    <CardSegment padding="md" vertical>
      <InlineScores>
        <div>
          <ResultHeader>Failure to Appear Scale</ResultHeader>
          { createScale(ftaScaleValue) }
        </div>
        <div>
          <ResultHeader>New Criminal Activity Scale</ResultHeader>
          { createScale(ncaScaleValue) }
        </div>
      </InlineScores>
      <div>
        <ResultHeader>New Violent Criminal Activity Flag</ResultHeader>
        <Flag>{ nvcaFlag }</Flag>
      </div>
    </CardSegment>
  );
};

export default PSAScores;
