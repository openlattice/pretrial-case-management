/*
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import RCMCell from './RCMCell';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import {
  IncreaseArrow,
  RCMIncreaseText,
  StepHeader,
  StepWrapper,
} from './RCMStyledTags';
import {
  getRCMDecision,
  shouldCheckForSecondaryRelease,
  updateRCMSecondaryRelease
} from '../../utils/RCMUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { NCA_SCALE, FTA_SCALE } = PROPERTY_TYPES;

type Props = {
  settings :Map<*, *>,
  scores :Map<*, *>,
  riskFactors :Map<*, *>,
  shouldRender :boolean
};

class BookingRelease extends React.Component<Props, *> {

  renderText = () => {
    const { riskFactors } = this.props;
    const secondaryReleaseVal = riskFactors.get(RCM_FIELDS.SECONDARY_RELEASE_CHARGES) === `${true}`;
    return secondaryReleaseVal
      ? <RCMIncreaseText>Charges qualify for a secondary release option</RCMIncreaseText>
      : <RCMIncreaseText>Charges do not qualify for a secondary release option</RCMIncreaseText>;
  }

  render() {
    const {
      shouldRender,
      scores,
      settings,
      riskFactors
    } = this.props;
    const {
      [NCA_SCALE]: ncaScore,
      [FTA_SCALE]: ftaScore
    } = getEntityProperties(scores, [NCA_SCALE, FTA_SCALE]);
    const rcmResult :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const level :number = rcmResult.rcm[PROPERTY_TYPES.CONDITIONS_LEVEL];
    if (!shouldRender || !shouldCheckForSecondaryRelease(level, settings)) return null;
    const secondaryReleaseVal = riskFactors.get(RCM_FIELDS.SECONDARY_RELEASE_CHARGES) === `${true}`;

    const { rcm: updatedRCM, bookingConditions: updatedConditions } = updateRCMSecondaryRelease(rcmResult);

    const rcmTransformation = secondaryReleaseVal
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

export default connect(mapStateToProps, null)(BookingRelease);
