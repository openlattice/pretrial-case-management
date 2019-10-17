/*
 * @flow
 */
import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';

import RCMCell from './RCMCell';
import BooleanFlag from '../BooleanFlag';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { getRCMDecision, increaseRCMSeverity } from '../../utils/RCMUtils';
import { CONTEXT, PSA } from '../../utils/consts/Consts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
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
  context :string,
  riskFactors :Map<*, *>,
  scores :Map<*, *>,
  settings :Map<*, *>,
  shouldRender :boolean
};

class StepFour extends React.Component<Props, *> {

  renderFlags = () => {
    const { scores, riskFactors } = this.props;
    const { [NVCA_FLAG]: nvcaFlag } = getEntityProperties(scores, [NVCA_FLAG]);
    const currentViolentOffense :boolean = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}`;
    const stepFourCharges :boolean = riskFactors.get(RCM_FIELDS.STEP_4_CHARGES) === `${true}`;

    const STEP4_VALS = [
      {
        label: 'Does current charge match listed charges?',
        content: (
          <ContentsWrapper>
            <BooleanFlag dims={FLAG_DIMS} value={stepFourCharges} />
          </ContentsWrapper>
        )
      },
      {
        label: 'Current charge is not violent and PSA resulted in NVCA flag?',
        content: (
          <ContentsWrapper>
            <BooleanFlag dims={FLAG_DIMS} value={nvcaFlag && !currentViolentOffense} />
          </ContentsWrapper>
        )
      },
      {
        label: '',
        content: null
      }
    ];

    return (
      <Flags>
        {
          STEP4_VALS.map(item => (
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
      context
    } = this.props;
    const {
      [NCA_SCALE]: ncaScore,
      [FTA_SCALE]: ftaScore,
      [NVCA_FLAG]: nvcaFlag,
    } = getEntityProperties(scores, [NCA_SCALE, FTA_SCALE, NVCA_FLAG]);
    const stepFourCharges :boolean = riskFactors.get(RCM_FIELDS.STEP_4_CHARGES) === `${true}`;
    const currentViolentOffense :boolean = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}`;
    const secondaryReleaseVal :boolean = riskFactors.get(RCM_FIELDS.SECONDARY_RELEASE_CHARGES) === `${true}`;
    const secondaryHoldVal :boolean = riskFactors.get(RCM_FIELDS.SECONDARY_HOLD_CHARGES) === `${true}`;
    let rcmTransformation;

    const { rcm, courtConditions, bookingConditions } = getRCMDecision(ncaScore, ftaScore, settings);
    const conditions :Object[] = context === CONTEXT.BOOKING ? bookingConditions : courtConditions;

    const shouldDisplayRCMCell :boolean = context !== CONTEXT.BOOKING
      || (secondaryReleaseVal || secondaryHoldVal);

    const violentRisk = nvcaFlag && !currentViolentOffense;
    if (!stepFourCharges && !violentRisk) {
      rcmTransformation = (
        <StyledSection>
          <RCMIncreaseText>
            STEP FOUR INCREASE NOT APPLICABLE
          </RCMIncreaseText>
          { shouldDisplayRCMCell && <RCMCell rcm={rcm} conditions={conditions} large /> }
        </StyledSection>
      );
    }
    else {
      const {
        rcm: rcmS3,
        courtConditions: courtConditionsS3,
        bookingConditions: bookingConditionsS3
      } = increaseRCMSeverity({ rcm, courtConditions, bookingConditions }, settings);
      const conditionsS3 :Object[] = context !== CONTEXT.BOOKING ? bookingConditionsS3 : courtConditionsS3;
      rcmTransformation = (
        <StyledSection>
          <RCMIncreaseText>
            STEP FOUR INCREASE APPLIED
            <span>increased conditions for release</span>
          </RCMIncreaseText>
          <StepWrapper>
            <RCMCell rcm={rcm} conditions={conditions} large />
            <IncreaseArrow />
            <RCMCell rcm={rcmS3} conditions={conditionsS3} large />
          </StepWrapper>
        </StyledSection>
      );
    }
    return rcmTransformation;
  }

  render() {
    const { shouldRender } = this.props;

    if (!shouldRender) return null;

    return (
      <StepIncreaseWrapper>
        <Title withSubtitle><span>Step Four</span></Title>
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

export default connect(mapStateToProps, null)(StepFour);
