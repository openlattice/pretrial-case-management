/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import {
  getDMFDecision,
  increaseDMFSeverity
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

const formatTextArr = (textArr) => {
  let text = textArr[0];
  if (textArr.length === 3) {
    text = `${textArr[0]}, ${textArr[1]}, and ${textArr[2]}`;
  }
  else if (textArr.length === 2) {
    text = textArr.join(' and ');
  }

  text = text[0].toUpperCase().concat(text.slice(1, text.length)).concat('.');
  return text;
};

const StepFour = ({
  shouldRender,
  stepFourVal,
  stepFourNotes,
  nca,
  fta,
  nvca,
  currentViolentOffense,
  context
} :Props) => {
  if (!shouldRender) return null;
  const textArr = [];
  let dmfTransformation;

  const stepThreeDmf = getDMFDecision(nca, fta, context);

  const violentRisk = nvca && !currentViolentOffense;
  if (!stepFourVal && !violentRisk) {
    textArr.push('no charges meet the requirements to increase severity');
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={stepThreeDmf} selected large />
      </StepWrapper>
    );
  }
  else {
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={stepThreeDmf} selected />
        <img src={rightArrow} alt="" />
        <DMFCell dmf={increaseDMFSeverity(stepThreeDmf, context)} selected />
      </StepWrapper>
    );
    if (stepFourVal) {
      textArr.push('charges meet the requirements to increase severity');
    }
    if (violentRisk) {
      textArr.push('PSA resulted in NVCA flag and current offense is not violent');
    }
  }

  return (
    <div>
      <hr />
      <StepHeader>Step Four</StepHeader>
      <StepWrapper>{formatTextArr(textArr)}</StepWrapper>
      {dmfTransformation}
    </div>
  );
};

export default StepFour;
