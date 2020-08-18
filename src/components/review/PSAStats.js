/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';
import StatusTag from '../StatusTag';

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin: 0 20px 0 0;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: ${OL.GREY02};
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
      color: ${OL.GREY15};
      font-weight: 600;
    }
  }

  div:first-child {
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    display: flex;
    text-transform: uppercase;
    justify-content: center;
  }
`;

const DetailRow = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  ${
    (props :Object) => (
    props.hideProfile
      ? (
        `grid-auto-columns: 1fr;
         grid-auto-flow: column;`
      )
      : 'grid-template-columns: 5% 17% 17% 17% 17% 17%;'
  )}

  column-gap: ${(props :Object) => (props.hideProfile ? '4%' : '2%')};

  div:last-child {
    margin-right: ${(props :Object) => (props.downloadVisible ? '0' : '0')};
  }
`;

const SCALE_DIMS = { height: 20, width: 96 };
const FLAG_DIMS = { height: 28, width: 74 };

type Props = {
  hideProfile :boolean;
  scores :Map;
  downloadButton :?() => void;
  includesPretrialModule :?boolean;
};

const PSAStats = ({
  downloadButton,
  hideProfile,
  includesPretrialModule,
  scores
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
        {
          includesPretrialModule
            ? (
              <DetailItem>
                <h1>PSA Status</h1>
                <div><StatusTag status={status}>{status}</StatusTag></div>
              </DetailItem>
            )
            : null
        }
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
        <DetailItem>
          <h1>NVCA</h1>
          <BooleanFlag dims={FLAG_DIMS} value={nvcaVal} />
        </DetailItem>
        {renderDownloadButton}
      </DetailRow>
    </DetailsWrapper>
  );
};

PSAStats.defaultProps = {
  downloadButton: null,
  includesPretrialModule: false
};

export default PSAStats;
