/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';

const Wrapper = styled.div`
  margin-left: 36px;
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
  align-items: center;
  width: 100%;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: lighter;
    color: #8e929b;
    text-transform: uppercase;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    display: flex;
    font-size: 14px;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;

    span {
      color: #2e2e34;
      font-weight: 600;
    }
  }

  div:first-child {
    font-family: 'Open Sans', sans-serif;
    font-weight: normal;
    font-size: 13px;
    display: flex;
    text-transform: uppercase;
    justify-content: center;
  }
`;

const Scale = styled.div`
  width: 96px;
  height: 20px;
  background: #dcdce7;
  display: inline-block;
  border-radius: 2px;
  margin-left: 10px;
`;

const StatusTag = styled.div`
  width: 86px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: white;
  border-radius: 3px;
  align-self: center;
  padding: 2px 5px;
  background: ${(props) => {
    switch (props.status) {
      case PSA_STATUSES.OPEN:
        return '#8b66db';
      case PSA_STATUSES.SUCCESS:
        return '#00be84';
      case PSA_STATUSES.FAILURE:
        return '#ff3c5d';
      case PSA_STATUSES.CANCELLED:
        return '#b6bbc7';
      case PSA_STATUSES.DECLINED:
        return '#555e6f';
      case PSA_STATUSES.DISMISSED:
        return '#555e6f';
      default:
        return 'transparent';
    }
  }};
`;

const NvcaFlag = styled.div`
  width: 74px;
  height: 28px;
  border-radius: 3px;
  border: solid 1px #555e6f;
  font-family: Open Sans;
  font-size: 14px;
  font-weight: 600;
  color: #2e2e34;
  justify-content: center;
}
`


const colorsByScale = {
  1: '#8b66db',
  2: '#a069d7',
  3: '#b36cd2',
  4: '#c86fce',
  5: '#dd72ca',
  6: '#ff77c2'
};

const WIDTH_MULTIPLIER = 96;

type Props = {
  scores :Immutable.Map<*, *>
};

const PSAStats = ({ scores, downloadButton } :Props) => {
  const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
  const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
  const nvcaDisplay = nvcaVal ? 'Yes' : 'No';


  const FtaScaleLeft = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (ftaVal / 6)}px;
    background: ${colorsByScale[ftaVal]};
    border-radius: 2px;
  `;
  const FtaScaleRight = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (1 - (ftaVal / 6))}px;
    border-radius: 0px 2px 2px 0px;
    margin-left: 0px;
  `;
  const NcaScaleLeft = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (ncaVal / 6)}px;
    background: ${colorsByScale[ncaVal]};
    border-radius: 2px;
  `;
  const NcaScaleRight = styled(Scale)`
    width: ${WIDTH_MULTIPLIER * (1 - (ncaVal / 6))}px;
    border-radius: 0px 2px 2px 0px;
    margin-left: 0px;
  `;

  return (
    <Wrapper>
      <DetailsWrapper>
        <DetailRow>
          <DetailItem>
            <h1>PSA Status</h1>
            <div><StatusTag status={status}>{status}</StatusTag></div>
          </DetailItem>
          <DetailItem>
            <h1>NVCA</h1>
            <NvcaFlag>{nvcaDisplay}</NvcaFlag>
          </DetailItem>
          <DetailItem>
            <h1>NCA</h1>
            <div>
              <span>{ncaVal}</span>
              <NcaScaleLeft />
              <NcaScaleRight />
            </div>
          </DetailItem>
          <DetailItem>
            <h1>FTA</h1>
            <div>
              <span>{ftaVal}</span>
              <FtaScaleLeft />
              <FtaScaleRight />
            </div>
          </DetailItem>
          <DetailItem>
            <div>{downloadButton()}</div>
          </DetailItem>
        </DetailRow>
      </DetailsWrapper>
    </Wrapper>
  );
};

export default PSAStats;
