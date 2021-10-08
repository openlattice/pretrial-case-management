/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import RCMCell from './RCMCell';
import BooleanFlag from '../BooleanFlag';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getRCMDecision } from '../../utils/RCMUtils';
import { PSA } from '../../utils/consts/Consts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  ContentsWrapper,
  FLAG_DIMS,
  Flags,
  IncreaseArrow,
  RCMIncreaseText,
  StepIncreaseWrapper,
  StepWrapper,
  StyledContent,
  StyledContentLabel,
  StyledContentBlock,
  StyledSection
} from './RCMStyledTags';
import { Title, FullWidthContainer } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { NCA_SCALE, FTA_SCALE, NVCA_FLAG } = PROPERTY_TYPES;

type Props = {
  isBookingContext :boolean,
  riskFactors :Map<*, *>,
  scores :Map<*, *>,
  settings :Map<*, *>
};

class StepTwo extends React.Component <Props, *> {

  renderFlags = () => {
    const { scores, riskFactors } = this.props;
    const { [NVCA_FLAG]: nvcaFlag } = getEntityProperties(scores, [NVCA_FLAG]);
    const extradited = riskFactors.get(RCM_FIELDS.EXTRADITED) === 'true';
    const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === 'true';
    const stepTwoCharges = riskFactors.get(RCM_FIELDS.STEP_2_CHARGES) === 'true';
    const STEP2_VALS = [
      {
        label: 'Extradited for current charge?',
        content: (
          <ContentsWrapper>
            <BooleanFlag dims={FLAG_DIMS} value={extradited} />
          </ContentsWrapper>
        )
      },
      {
        label: 'Does current charge match listed charges?',
        content: (
          <ContentsWrapper>
            <BooleanFlag dims={FLAG_DIMS} value={stepTwoCharges} />
          </ContentsWrapper>
        )
      },
      {
        label: 'Current charge is violent and PSA resulted in NVCA flag?',
        content: (
          <ContentsWrapper>
            <BooleanFlag dims={FLAG_DIMS} value={nvcaFlag && currentViolentOffense} />
          </ContentsWrapper>
        )
      }
    ];

    return (
      <Flags>
        {
          STEP2_VALS.map((item) => (
            <StyledContentBlock key={item.label}>
              <StyledContentLabel>{item.label}</StyledContentLabel>
              <StyledContent>{item.content}</StyledContent>
            </StyledContentBlock>
          ))
        }
      </Flags>
    );
  }

  renderRCM = () => {
    const {
      scores,
      settings,
      riskFactors,
      isBookingContext
    } = this.props;
    const {
      [NCA_SCALE]: ncaScore,
      [FTA_SCALE]: ftaScore,
      [NVCA_FLAG]: nvcaFlag,
    } = getEntityProperties(scores, [NCA_SCALE, FTA_SCALE, NVCA_FLAG]);
    const extradited = riskFactors.get(RCM_FIELDS.EXTRADITED) === (true).toString();
    const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === (true).toString();
    const stepTwoCharges = riskFactors.get(RCM_FIELDS.STEP_2_CHARGES) === (true).toString();
    const StepTwoDecision = extradited || stepTwoCharges || (nvcaFlag && currentViolentOffense);

    const { rcm, courtConditions, bookingConditions } :Object = getRCMDecision(ncaScore, ftaScore, settings);
    const {
      rcm: rcmS2,
      courtConditions: courtConditionsS2,
      bookingConditions: bookingConditionsS2
    } :Object = getRCMDecision(6, 6, settings);

    const conditions = isBookingContext ? bookingConditions : courtConditions;
    const conditionsS2 = isBookingContext ? bookingConditionsS2 : courtConditionsS2;

    const rcmDisplay = StepTwoDecision
      ? (
        <StyledSection>
          <RCMIncreaseText>
            MAX INCREASE APPLIED
            <span>maximum conditions for any release</span>
          </RCMIncreaseText>
          <StepWrapper>
            <RCMCell rcm={rcm} conditions={conditions} large />
            <IncreaseArrow />
            <RCMCell rcm={rcmS2} conditions={conditionsS2} large />
          </StepWrapper>
        </StyledSection>
      )
      : (
        <StyledSection>
          <RCMIncreaseText>
            MAX INCREASE NOT APPLICABLE
          </RCMIncreaseText>
        </StyledSection>
      );

    return rcmDisplay;
  }

  render() {
    return (
      <StepIncreaseWrapper>
        <Title withSubtitle><span>Max Level Increase</span></Title>
        <FullWidthContainer>
          { this.renderFlags() }
          { this.renderRCM() }
        </FullWidthContainer>
      </StepIncreaseWrapper>
    );
  }
}

function mapStateToProps(state) {
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  return {
    settings
  };
}
// $FlowFixMe
export default connect(mapStateToProps, null)(StepTwo);
