/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import RCMCell from './RCMCell';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import {
  IncreaseArrow,
  RCMIncreaseText,
  StepHeader,
  StepWrapper
} from './RCMStyledTags';
import {
  getRCMDecision,
  shouldCheckForSecondaryHold,
  updateRCMSecondaryHold
} from '../../utils/RCMUtils';


import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { NCA_SCALE, FTA_SCALE } = PROPERTY_TYPES;

type Props = {
  riskFactors :Map<*, *>,
  scores :Map<*, *>,
  settings :Map<*, *>,
  shouldRender :boolean
};

class BookingHold extends React.Component<Props, *> {

  renderText = () => {
    const { riskFactors } = this.props;
    const secondaryHoldVal :boolean = riskFactors.get(RCM_FIELDS.SECONDARY_HOLD_CHARGES) === `${true}`;
    return secondaryHoldVal
      ? <RCMIncreaseText>Charges qualify for a secondary hold option</RCMIncreaseText>
      : <RCMIncreaseText>Charges do not qualify for a secondary hold option</RCMIncreaseText>;
  }

  render() {
    const {
      shouldRender,
      scores,
      riskFactors,
      settings,
    } = this.props;
    const {
      [NCA_SCALE]: ncaScore,
      [FTA_SCALE]: ftaScore
    } = getEntityProperties(scores, [NCA_SCALE, FTA_SCALE]);
    const rcmResult :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const level :number = rcmResult.rcm[PROPERTY_TYPES.CONDITIONS_LEVEL];
    if (!shouldRender || !shouldCheckForSecondaryHold(level, settings)) return null;

    const { rcm: updatedRCM, bookingConditions: updatedConditions } = updateRCMSecondaryHold(rcmResult);

    const secondaryHoldVal :boolean = riskFactors.get(RCM_FIELDS.SECONDARY_HOLD_CHARGES) === `${true}`;
    const rcmTransformation = secondaryHoldVal
      ? (
        <StepWrapper>
          <RCMCell rcm={rcmResult.rcm} conditions={rcmResult.bookingConditions} large />
          <IncreaseArrow />
          <RCMCell rcm={updatedRCM} conditions={updatedConditions} large />
        </StepWrapper>
      ) : (
        <StepWrapper>
          <RCMCell rcm={rcmResult.rcm} conditions={rcmResult.bookingConditions} large />
        </StepWrapper>
      );

    return (
      <div>
        <hr />
        <StepHeader>Bookings Exception</StepHeader>
        <StepWrapper>{ this.renderText() }</StepWrapper>
        { rcmTransformation }
      </div>
    );
  }
}

function mapStateToProps(state) {
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}
// #$FlowFixMe
export default connect(mapStateToProps, null)(BookingHold);
