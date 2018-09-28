/*
 * @flow
 */

import React from 'react';

import DMFCell from './DMFCell';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import {
  StepHeader,
  StepWrapper,
  DMFIncreaseText
} from './DMFStyledTags';
import {
  getDMFDecision,
  shouldCheckForSecondaryHold,
  updateDMFSecondaryHold
} from '../../utils/DMFUtils';

const StepFiveHold = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context,
  secondaryHoldVal
} :Props) => {
  if (!shouldRender || !shouldCheckForSecondaryHold(context, nca, fta)) return null;

  const text = secondaryHoldVal
    ? <DMFIncreaseText>Charges qualify for a secondary hold option</DMFIncreaseText>
    : <DMFIncreaseText>Charges do not qualify for a secondary hold option</DMFIncreaseText>;

  const dmfTransformation = secondaryHoldVal
    ? (
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected large />
        <img src={rightArrow} alt="" />
        <DMFCell dmf={updateDMFSecondaryHold(dmf)} selected large />
      </StepWrapper>
    ) : (
      <StepWrapper>
        <DMFCell dmf={dmf} selected large />
      </StepWrapper>
    );

  return (
    <div>
      <hr />
      <StepHeader>Step Five:</StepHeader>
      <StepWrapper>{text}</StepWrapper>
      {dmfTransformation}
    </div>
  );
};

export default StepFiveHold;
