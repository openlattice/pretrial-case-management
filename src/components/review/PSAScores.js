/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const ScoresTable = styled.table`
  margin: 0 50px;
`;

const ScoreHeader = styled.th`
  text-align: center;
  height: 15px;
  transform: scaleY(0.7);
  min-width: 50px;
`;

const ScoreItem = styled.td`
  font-weight: bold;
  font-size: 16px;
  text-align: center;
`;

const Scale = styled.div`
  width: 30px;
  display: inline-block;
  border-radius: 3px 3px 0 0;
  margin-bottom: -5px;
`;

const ScaleRow = styled.tr`
  vertical-align: bottom;
  border-bottom: 1px solid black;
  text-align: center;
`;

const colorsByScale = {
  1: '#3494E6',
  2: '#598CDB',
  3: '#7A85D0',
  4: '#A37DC4',
  5: '#CA75B8',
  6: '#EC6EAD'
};

const HEIGHT_MULTIPLIER = 10;

type Props = {
  scores :Immutable.Map<*, *>
};

const PSAScores = ({ scores } :Props) => {

  const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  const nvcaScaleVal = nvcaVal ? 6 : 1;

  const FtaScale = styled(Scale)`
    height: ${HEIGHT_MULTIPLIER * ftaVal}px;
    background: ${colorsByScale[ftaVal]};
  `;
  const NcaScale = styled(Scale)`
    height: ${HEIGHT_MULTIPLIER * ncaVal}px;
    background: ${colorsByScale[ncaVal]};
  `;
  const NvcaScale = styled(Scale)`
    height: ${HEIGHT_MULTIPLIER * nvcaScaleVal}px;
    background: ${colorsByScale[nvcaScaleVal]};
  `;
  return (
    <ScoresTable>
      <tbody>
        <tr>
          <ScoreHeader>NVCA</ScoreHeader>
          <ScoreHeader>NCA</ScoreHeader>
          <ScoreHeader>FTA</ScoreHeader>
        </tr>
        <ScaleRow>
          <ScoreItem><NvcaScale /></ScoreItem>
          <ScoreItem><NcaScale /></ScoreItem>
          <ScoreItem><FtaScale /></ScoreItem>
        </ScaleRow>
        <tr>
          <ScoreItem>{nvcaVal ? 'YES' : 'NO'}</ScoreItem>
          <ScoreItem>{ncaVal}</ScoreItem>
          <ScoreItem>{ftaVal}</ScoreItem>
        </tr>
      </tbody>
    </ScoresTable>
  );
};

export default PSAScores;
