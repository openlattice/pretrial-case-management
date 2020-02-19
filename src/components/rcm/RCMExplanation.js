/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import BookingRelease from './BookingRelease';
import BookingHold from './BookingHold';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { PSA } from '../../utils/consts/Consts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';

const { NVCA_FLAG } = PROPERTY_TYPES;

const {
  COURT_OR_BOOKING,
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = RCM_FIELDS;

const RCMWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const RCMExplanation = ({
  riskFactors,
  scores
} :Props) => {
  const context = riskFactors.get(COURT_OR_BOOKING);
  const extradited = riskFactors.get(EXTRADITED) === `${true}`;
  const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}`;
  const stepTwoCharges = riskFactors.get(STEP_2_CHARGES) === `${true}`;
  const stepFourCharges = riskFactors.get(STEP_4_CHARGES) === `${true}`;
  const secondaryReleaseVal = riskFactors.get(SECONDARY_RELEASE_CHARGES) === `${true}`;
  const secondaryHoldVal = riskFactors.get(SECONDARY_HOLD_CHARGES) === `${true}`;


  const { [NVCA_FLAG]: nvcaFlag } = getEntityProperties(scores, [NVCA_FLAG]);

  const stepTwoIncrease = extradited || stepTwoCharges || (nvcaFlag && currentViolentOffense);
  const stepFourIncrease = stepFourCharges || (nvcaFlag && !currentViolentOffense);

  return (
    <RCMWrapper>
      <StepTwo
          context={context}
          scores={scores}
          riskFactors={riskFactors} />
      <StepThree
          context={context}
          scores={scores}
          shouldRender={!stepTwoIncrease} />
      <StepFour
          context={context}
          scores={scores}
          shouldRender={!stepTwoIncrease}
          riskFactors={riskFactors} />
      <BookingRelease
          context={context}
          scores={scores}
          secondaryReleaseVal={secondaryReleaseVal}
          shouldRender={!stepTwoIncrease && !stepFourIncrease}
          riskFactors={riskFactors} />
      <BookingHold
          scores={scores}
          secondaryHoldVal={secondaryHoldVal}
          shouldRender={!stepTwoIncrease && !stepFourIncrease && !secondaryReleaseVal}
          riskFactors={riskFactors} />
    </RCMWrapper>
  );
};

export default RCMExplanation;
