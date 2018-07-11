/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DetailsWrapper = styled.div`
  margin: 0 20px;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  text-transform: uppercase;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #2e2e34;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
  1: '#8b66db',
  2: '#a069d7',
  3: '#b36cd2',
  4: '#c86fce',
  5: '#dd72ca',
  6: '#dd72ca'
};

const HEIGHT_MULTIPLIER = 96;

type Props = {
  scores :Immutable.Map<*, *>
};

const PSAStats = ({ scores } :Props) => {
  const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '')
  const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  const nvcaDisplay = ncaVal ? 'Yes' : 'No';
  const nvcaScaleVal = nvcaVal ? 6 : 1;

  const FtaScale = styled(Scale)`
    height: 20px;
    width: ${HEIGHT_MULTIPLIER * (ftaVal / 6)}px;
    background: ${colorsByScale[ftaVal]};
  `;
  const NcaScale = styled(Scale)`
    height: 20px;
    width: ${HEIGHT_MULTIPLIER * (ncaVal / 6)}px;
    background: ${colorsByScale[ncaVal]};
  `;
  const NvcaScale = styled(Scale)`
    height: ${HEIGHT_MULTIPLIER * nvcaScaleVal}px;
    background: ${colorsByScale[nvcaScaleVal]};
  `;
  return (
    <Wrapper>
     <DetailsWrapper>
       <DetailRow>
       <DetailItem>
         <h1>PSA Status</h1>
         <div>{nvcaDisplay}</div>
       </DetailItem>
       <DetailItem>
         <h1>NVCA</h1>
         <div>{nvcaDisplay}</div>
       </DetailItem>
       <DetailItem>
         <h1>NCA</h1>
         <div>{ncaVal}<NcaScale/></div>
       </DetailItem>
       <DetailItem>
         <h1>FTA</h1>
         <div>{ftaVal}<FtaScale/></div>
       </DetailItem>
       </DetailRow>
     </DetailsWrapper>
    </Wrapper>
  );
};

export default PSAStats;
