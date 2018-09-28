/*
 * @flow
 */

import React from 'react';

import DMFCell from './DMFCell';
import { StepHeader, StepWrapper } from './DMFStyledTags';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import {
  getDMFDecision,
  shouldCheckForSecondaryRelease
} from '../../utils/DMFUtils';

const StepFiveRelease = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context,
  secondaryReleaseVal
} :Props) => {
  if (!shouldRender || !shouldCheckForSecondaryRelease(context, nca, fta)) return null;

  const text = secondaryReleaseVal
    ? 'Charges qualify for a secondary release option'
    : 'Charges do not qualify for a secondary release option.';

  const dmfTransformation = secondaryReleaseVal
    ? (
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected large />
        <img src={rightArrow} alt="" />
        <DMFCell dmf={dmf} selected large />
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

export default StepFiveRelease;
