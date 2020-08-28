/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

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

type Props = {
  includeStepIncreases :boolean;
  includeSecondaryBookingCharges :boolean;
  riskFactors :Map;
  scores :Map;
}

const RCMExplanation = ({
  includeStepIncreases,
  includeSecondaryBookingCharges,
  riskFactors,
  scores
} :Props) => {
  const context = riskFactors.get(COURT_OR_BOOKING);
  const extradited = riskFactors.get(EXTRADITED) === true.toString();
  const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === true.toString();
  const stepTwoCharges = riskFactors.get(STEP_2_CHARGES) === true.toString();
  const stepFourCharges = riskFactors.get(STEP_4_CHARGES) === true.toString();
  const secondaryReleaseVal = riskFactors.get(SECONDARY_RELEASE_CHARGES) === true.toString();
  const secondaryHoldVal = riskFactors.get(SECONDARY_HOLD_CHARGES) === true.toString();

  const { [NVCA_FLAG]: nvcaFlag } = getEntityProperties(scores, [NVCA_FLAG]);

  const stepTwoIncrease = includeStepIncreases && (extradited || stepTwoCharges || (nvcaFlag && currentViolentOffense));
  const stepFourIncrease = includeStepIncreases && (stepFourCharges || (nvcaFlag && !currentViolentOffense));

  return (
    <RCMWrapper>
      {
        includeStepIncreases
          && (
            <StepTwo
                context={context}
                scores={scores}
                riskFactors={riskFactors} />
          )
      }
      <StepThree
          context={context}
          scores={scores}
          shouldRender={!stepTwoIncrease} />
      {
        includeStepIncreases
          && (
            <StepFour
                context={context}
                scores={scores}
                shouldRender={!stepTwoIncrease}
                riskFactors={riskFactors} />
          )
      }
      {
        includeSecondaryBookingCharges
         && (
           <>
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
           </>
         )
      }
    </RCMWrapper>
  );
};

export default RCMExplanation;
