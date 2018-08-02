/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import {
  getDMFDecision,
  shouldCheckForSecondaryRelease
} from '../../utils/consts/DMFResultConsts';


const StepHeader = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 30px 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 30px 30px 30px;
`;

const StepFive = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context,
  secondaryReleaseVal,
  secondaryReleaseNotes
} :Props) => {
  if (!shouldRender || !shouldCheckForSecondaryRelease(context, nca, fta)) return null;

  const text = secondaryReleaseVal
    ? 'Charges qualify for a secondary release option'
    : 'Charges do not qualify for a secondary release option.';

  const dmfTransformation = secondaryReleaseVal
    ? (
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected />
        <img src={rightArrow} alt="" />
        <DMFCell dmf={dmf} selected />
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

export default StepFive;
