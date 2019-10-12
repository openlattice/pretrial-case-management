/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';

import RCMCell from './RCMCell';
import rightArrow from '../../assets/svg/rcm-arrow.svg';
import { RCMIncreaseText } from './RCMStyledTags';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  getRCMDecision,
  increaseRCMSeverity,
  updateRCMSecondaryRelease,
  updateRCMSecondaryHold
} from '../../utils/RCMUtils';
import {
  stepTwoIncrease,
  stepFourIncrease,
  rcmSecondaryReleaseDecrease,
  rcmSecondaryHoldIncrease
} from '../../utils/ScoringUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const {
  CONDITION_1,
  CONDITION_2,
  CONDITION_3,
  FTA_SCALE,
  NCA_SCALE,
} = PROPERTY_TYPES;

const {
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  PSA_RISK_FACTORS
} = APP_TYPES;

const conditionProperties = [CONDITION_1, CONDITION_2, CONDITION_3];

const ScoreContent = styled.div`
  padding: 20px 20px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

type Props = {
  settings :Map<*, *>,
  scores :Map<*, *>,
  neighbors :Map<*, *>,
  isBookingContext :boolean
};

class SummaryRCMDetails extends React.Component<Props, *> {

  getScores = () => {
    const { scores } = this.props;
    const {
      [NCA_SCALE]: ncaScore,
      [FTA_SCALE]: ftaScore
    } = getEntityProperties(scores, [NCA_SCALE, FTA_SCALE]);
    return { ftaScore, ncaScore };
  }

  getRCMStep = (rcm1, rcm2) => {
    const { isBookingContext } = this.props;
    return (
      <ScoreContent>
        <RCMIncreaseText>Step two increase</RCMIncreaseText>
        <RCMCell rcm={rcm1.rcm} conditions={isBookingContext ? rcm1.bookingConditions : rcm1.courtConditions} />
        <img src={rightArrow} alt="" />
        <RCMCell rcm={rcm2.rcm} conditions={isBookingContext ? rcm2.bookingConditions : rcm2.courtConditions} />
      </ScoreContent>
    );
  }

  getStepTwoRCM = () => {
    const { settings } = this.props;
    const { ftaScore, ncaScore } = this.getScores();
    const rcm1 :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const rcm2 :Object = getRCMDecision(6, 6, settings);
    return this.getRCMStep(rcm1, rcm2);
  }

  getStepFourRCM = () => {
    const { settings } = this.props;
    const { ftaScore, ncaScore } = this.getScores();
    const rcm1 :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const rcm2 :Object = increaseRCMSeverity(rcm1, settings);
    return this.getRCMStep(rcm1, rcm2);
  }

  getHoldException = () => {
    const { settings } = this.props;
    const { ftaScore, ncaScore } = this.getScores();
    const rcm1 :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const rcm2 = updateRCMSecondaryRelease(rcm1);
    return this.getRCMStep(rcm1, rcm2);
  }

  getReleaseException = () => {
    const { settings } = this.props;
    const { ftaScore, ncaScore } = this.getScores();
    const rcm1 :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const rcm2 = updateRCMSecondaryHold(rcm1);
    return this.getRCMStep(rcm1, rcm2);
  }

  render() {
    const {
      neighbors,
      scores,
      settings,
      isBookingContext
    } = this.props;
    const rcmRiskFactors = neighbors.getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const psaRiskFactors = neighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const rcm = neighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
    const legacyConditions = fromJS(conditionProperties.map((conditionField) => {
      const conditionFromRCM = rcm.getIn([conditionField, 0], '');
      return { [PROPERTY_TYPES.TYPE]: conditionFromRCM };
    }));
    const rcmBookingConditions = neighbors.getIn([RCM_BOOKING_CONDITIONS], legacyConditions);
    const rcmCourtConditions = neighbors.getIn([RCM_COURT_CONDITIONS], legacyConditions);

    const conditions = isBookingContext ? rcmBookingConditions : rcmCourtConditions;

    let rcmCell = null;
    if (rcm) {
      if (stepTwoIncrease(rcmRiskFactors, psaRiskFactors, scores)) {
        rcmCell = this.getStepTwoRCM();
      }
      else if (stepFourIncrease(rcmRiskFactors, psaRiskFactors, scores)) {
        rcmCell = this.getStepFourRCM();
      }
      else if (rcmSecondaryReleaseDecrease(rcm, rcmRiskFactors, settings)) {
        rcmCell = this.getHoldException();
      }
      else if (rcmSecondaryHoldIncrease(rcm, rcmRiskFactors, settings)) {
        rcmCell = this.getReleaseException();
      }
      else {
        rcmCell = (
          <ScoreContent>
            <RCMCell rcm={rcm} conditions={conditions} large />
          </ScoreContent>
        );
      }
    }
    return rcmCell;
  }
}

function mapStateToProps(state) {
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}

export default connect(mapStateToProps, null)(SummaryRCMDetails);
