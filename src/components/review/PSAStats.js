/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';
import StatusTag from '../StatusTag';

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  h1 {
    color: ${OL.GREY02};
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }

  div {
    align-items: center;
    display: flex;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;

    span {
      color: ${OL.GREY15};
      font-weight: 600;
    }
  }

  div:first-child {
    display: flex;
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    justify-content: center;
    text-transform: uppercase;
  }
`;

const DetailRow = styled.div`
  align-items: center;
  column-gap: ${(props) => (props.hideProfile ? '4%' : '2%')};
  display: grid;
  width: 100%;
  ${(props) => (
    props.hideProfile
      ? (
        `grid-auto-columns: 1fr;
         grid-auto-flow: column;`
      ) : 'grid-template-columns: 5% 17% 17% 17% 17% 17%;'
  )}

  div:last-child {
    margin-right: ${(props) => (props.downloadVisible ? '0' : '0')};
  }
`;

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 20px 0 0;
  width: 100%;
`;

const SCALE_DIMS = { height: 20, width: 96 };
const FLAG_DIMS = { height: 28, width: 74 };

type Props = {
  hideProfile :boolean,
  scores :Immutable.Map<*, *>,
  downloadButton :() => void
};

const PSAStats = ({
  hideProfile,
  scores,
  downloadButton
} :Props) => {
  const status = scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
  const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);

  let renderDownloadButton;
  let downloadVisible;
  if (downloadButton) {
    renderDownloadButton = <DetailItem>{downloadButton()}</DetailItem>;
    downloadVisible = true;
  }
  else {
    renderDownloadButton = null;
    downloadVisible = false;
  }

  return (
    <DetailsWrapper>
      <DetailRow downloadVisible={downloadVisible} hideProfile={hideProfile}>
        { hideProfile ? null : <DetailItem /> }
        <DetailItem>
          <h1>PSA Status</h1>
          <div><StatusTag status={status}>{status}</StatusTag></div>
        </DetailItem>
        <DetailItem>
          <h1>NVCA</h1>
          <BooleanFlag dims={FLAG_DIMS} value={nvcaVal} />
        </DetailItem>
        <DetailItem>
          <h1>NCA</h1>
          <div>
            <span>{ncaVal}</span>
            <ScoreScale dims={SCALE_DIMS} score={ncaVal} />
          </div>
        </DetailItem>
        <DetailItem>
          <h1>FTA</h1>
          <div>
            <span>{ftaVal}</span>
            <ScoreScale dims={SCALE_DIMS} score={ftaVal} />
          </div>
        </DetailItem>
        {renderDownloadButton}
      </DetailRow>
    </DetailsWrapper>
  );
};

export default PSAStats;
