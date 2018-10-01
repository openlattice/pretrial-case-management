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
    ? <DMFIncreaseText>Charges qualify for a secondary release option</DMFIncreaseText>
    : <DMFIncreaseText>Charges do not qualify for a secondary release option</DMFIncreaseText>;

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
      <StepHeader>Bookings Exception</StepHeader>
      <StepWrapper>{text}</StepWrapper>
      {dmfTransformation}
    </div>
  );
};

export default StepFiveRelease;
