/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { OL, STATUS } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-right: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  div:last-child {
    margin-right: ${props => (props.downloadVisible ? '0' : '0')};
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
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

const StatusTag = styled.div`
  width: 86px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: bold;
  color: ${OL.WHITE};
  border-radius: 3px;
  align-self: center;
  padding: 2px 5px;
  background: ${(props) => {
    switch (props.status) {
      case PSA_STATUSES.OPEN:
        return STATUS.OPEN;
      case PSA_STATUSES.SUCCESS:
        return STATUS.SUCCESS;
      case PSA_STATUSES.FAILURE:
        return STATUS.FAILURE;
      case PSA_STATUSES.CANCELLED:
        return STATUS.CANCELLED;
      case PSA_STATUSES.DECLINED:
        return STATUS.DECLINED;
      case PSA_STATUSES.DISMISSED:
        return STATUS.DISMISSED;
      default:
        return 'transparent';
    }
  }};
`;

const SCALE_DIMS = { height: 20, width: 96 };
const FLAG_DIMS = { height: 28, width: 74 };

type Props = {
  scores :Immutable.Map<*, *>,
  downloadButton :() => void
};

const PSAStats = ({ scores, downloadButton } :Props) => {
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
    <Wrapper>
      <DetailsWrapper>
        <DetailRow downloadVisible={downloadVisible}>
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
    </Wrapper>
  );
};

export default PSAStats;
