/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import { DMFIncreaseText, StepWrapper } from './DMFStyledTags';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  getDMFDecision,
  increaseDMFSeverity,
  formatDMFFromEntity,
  updateDMFSecondaryRelease,
  updateDMFSecondaryHold
} from '../../utils/DMFUtils';
import {
  stepTwoIncrease,
  stepFourIncrease,
  dmfSecondaryReleaseDecrease,
  dmfSecondaryHoldIncrease
} from '../../utils/ScoringUtils';

const { DMF_RESULTS, DMF_RISK_FACTORS, PSA_RISK_FACTORS } = APP_TYPES;

const ScoreContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px 30px 0;
  width: 100%;
`;

const StyledStepWrapper = styled(StepWrapper)`
  margin: 0;

  img {
    margin: 3px;
  }
`;

const SummaryDMFDetails = ({ neighbors, scores } :Props) => {
  const dmfRiskFactors = neighbors.getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const context = dmfRiskFactors.getIn([PROPERTY_TYPES.CONTEXT, 0]);
  const psaRiskFactors = neighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const dmfEntity = neighbors.getIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Immutable.Map());
  const dmf = formatDMFFromEntity(dmfEntity);
  const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const dmfDecision = getDMFDecision(nca, fta, context);
  let dmfCell = null;
  if (dmfDecision) {
    if (stepTwoIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
      dmfCell = (
        <ScoreContent>
          <DMFIncreaseText>Step two increase</DMFIncreaseText>
          <DMFCell dmf={dmfDecision} selected />
          <img src={rightArrow} alt="" />
          <DMFCell dmf={getDMFDecision(6, 6, context)} selected />
        </ScoreContent>
      );
    }
    else if (stepFourIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
      dmfCell = (
        <ScoreContent>
          <DMFIncreaseText>Step four increase</DMFIncreaseText>
          <StyledStepWrapper>
            <DMFCell dmf={dmfDecision} selected />
            <img src={rightArrow} alt="" />
            <DMFCell dmf={increaseDMFSeverity(dmfDecision, context)} selected />
          </StyledStepWrapper>
        </ScoreContent>
      );
    }
    else if (dmfSecondaryReleaseDecrease(dmfRiskFactors, scores)) {
      dmfCell = (
        <ScoreContent>
          <DMFIncreaseText>Hold Exception Applies</DMFIncreaseText>
          <StyledStepWrapper>
            <DMFCell dmf={dmfDecision} selected />
            <img src={rightArrow} alt="" />
            <DMFCell dmf={updateDMFSecondaryRelease(dmf)} selected />
          </StyledStepWrapper>
        </ScoreContent>
      );
    }
    else if (dmfSecondaryHoldIncrease(dmfRiskFactors, scores)) {
      dmfCell = (
        <ScoreContent>
          <DMFIncreaseText>Release Exception Applies</DMFIncreaseText>
          <StyledStepWrapper>
            <DMFCell dmf={dmfDecision} selected />
            <img src={rightArrow} alt="" />
            <DMFCell dmf={updateDMFSecondaryHold(dmf)} selected />
          </StyledStepWrapper>
        </ScoreContent>
      );
    }
    else {
      dmfCell = (
        <ScoreContent>
          <DMFCell dmf={dmfDecision} selected large />
        </ScoreContent>
      );
    }
  }
  return dmfCell;
};

export default SummaryDMFDetails;
