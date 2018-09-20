/*
 * @flow
 */
import React from 'react';

import DMFCell from './DMFCell';
import BooleanFlag from '../BooleanFlag';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import {
  getDMFDecision,
  increaseDMFSeverity
} from '../../utils/DMFUtils';
import {
  ContentsWrapper,
  StepIncreaseWrapper,
  StyledSection,
  Flags,
  StyledContentBlock,
  StyledContentLabel,
  StyledContent,
  DMFIncreaseText,
  DMFIncreaseCell
} from './DMFStyledTags';
import { Title, FullWidthContainer } from '../../utils/Layout';

const StepFour = ({
  shouldRender,
  stepFourVal,
  nca,
  fta,
  nvca,
  currentViolentOffense,
  context,
  flagDims
} :Props) => {

// TODO: Show Pretrial FTA Flag

  const STEP4_VALS = [
    {
      label: 'Does current charge match listed charges?',
      content: [<ContentsWrapper key={1}><BooleanFlag dims={flagDims} value={stepFourVal} /></ContentsWrapper>]
    },
    {
      label: 'Current charge is violent and PSA resulted in NVCA flag?',
      content: [
        <ContentsWrapper key={2}><BooleanFlag dims={flagDims} value={nvca && currentViolentOffense} /></ContentsWrapper>
      ]
    },
    {
      label: '',
      content: []
    }
  ];

  const flags = () => (
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

  if (!shouldRender) return null;
  let dmfTransformation;

  const stepThreeDmf = getDMFDecision(nca, fta, context);
  const stepFourDmf = increaseDMFSeverity(stepThreeDmf, context);

  const violentRisk = nvca && !currentViolentOffense;
  if (!stepFourVal && !violentRisk) {
    dmfTransformation = (
      <StyledSection>
        <DMFIncreaseText>
          STEP FOUR INCREASE NOT APPLICABLE
        </DMFIncreaseText>
        <DMFCell dmf={stepThreeDmf} selected large />
      </StyledSection>
    );
  }
  else {
    dmfTransformation = (
      <StyledSection>
        <DMFIncreaseText>
          STEP FOUR INCREASE APPLIED
          <span>increased conditions for release</span>
        </DMFIncreaseText>
        <DMFIncreaseCell>
          <DMFCell dmf={stepThreeDmf} selected large />
          <img src={rightArrow} alt="" />
          <DMFCell dmf={stepFourDmf} selected large />
        </DMFIncreaseCell>
      </StyledSection>
    );
  }

  return (
    <StepIncreaseWrapper>
      <Title withSubtitle><span>Step Four</span></Title>
      <FullWidthContainer>
        {flags()}
        {dmfTransformation}
      </FullWidthContainer>
    </StepIncreaseWrapper>
  );
};

export default StepFour;
