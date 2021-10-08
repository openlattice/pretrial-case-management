/*
 * @flow
 */

import React from 'react';
import type { Element } from 'react';
import { Map } from 'immutable';
import styled, { css } from 'styled-components';

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
    font-size: 11px;
    font-weight: 600;
    color: ${OL.GREY02};
    text-transform: uppercase;
  }

  div {
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
    font-size: 13px;
    display: flex;
    text-transform: uppercase;
    justify-content: center;
  }
`;

const DetailRow = styled.div`
  align-items: center;
  column-gap: ${(props :Object) => (props.hideProfile ? '4%' : '2%')};
  display: grid;
  width: 100%;
  ${
  (props :Object) => (
    props.hideProfile
      ? (
        css`
          grid-auto-columns: 1fr;
          grid-auto-flow: column;
        `
      )
      : (
        css`
          grid-template-columns: 5% 17% 17% 17% 17% 17%;
        `
      )
  )}
`;

type Props = {
  hideProfile :boolean;
  scores :Map;
  downloadButton :?() => Element<*>;
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
            <ScoreScale score={ncaVal} />
          </div>
        </DetailItem>
        <DetailItem>
          <h1>FTA</h1>
          <div>
            <span>{ftaVal}</span>
            <ScoreScale score={ftaVal} />
          </div>
        </DetailItem>
        <DetailItem>
          <h1>NVCA</h1>
          <BooleanFlag value={nvcaVal} />
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
