/*
 * @flow
 */

import React from 'react';

import DMFCell from './DMFCell';
import BooleanFlag from '../BooleanFlag';
import rightArrow from '../../assets/svg/dmf-arrow.svg';
import { getDMFDecision } from '../../utils/DMFUtils';
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

const StepTwo = ({
  nca,
  fta,
  extradited,
  stepTwoVal,
  currentViolentOffense,
  nvca,
  context,
  flagDims
} :Props) => {
  // TODO: Show Pretrial FTA Flag

  const STEP2_VALS = [
    {
      label: 'Extradited for current charge?',
      content: [<ContentsWrapper key={1}><BooleanFlag dims={flagDims} value={extradited} /></ContentsWrapper>]
    },
    {
      label: 'Does current charge match listed charges?',
      content: [<ContentsWrapper key={2}><BooleanFlag dims={flagDims} value={stepTwoVal} /></ContentsWrapper>]
    },
    {
      label: 'Current charge is violent and PSA resulted in NVCA flag?',
      content: [
        <ContentsWrapper key={3}><BooleanFlag dims={flagDims} value={nvca && currentViolentOffense} /></ContentsWrapper>
      ]
    }
  ];

  const flags = () => (
    <Flags>
      {
        STEP2_VALS.map(item => (
          <StyledContentBlock key={`${item.label}`}>
            <StyledContentLabel>{item.label}</StyledContentLabel>
            <StyledContent>{item.content}</StyledContent>
          </StyledContentBlock>
        ))
      }
    </Flags>
  );

  const StepTwoDecision = extradited || stepTwoVal || (nvca && currentViolentOffense);

  const displayDMF = StepTwoDecision ? (
    <StyledSection>
      <DMFIncreaseText>
        STEP TWO INCREASE APPLIED
        <span>maximum conditions for any release</span>
      </DMFIncreaseText>
      <DMFIncreaseCell>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected large />
        <img src={rightArrow} alt="" />
        <DMFCell dmf={getDMFDecision(6, 6, context)} selected large />
      </DMFIncreaseCell>
    </StyledSection>
  ) :
    (
      <StyledSection>
        <DMFIncreaseText>
          STEP TWO INCREASE NOT APPLICABLE
        </DMFIncreaseText>
      </StyledSection>
    );

  return (
    <StepIncreaseWrapper>
      <Title withSubtitle><span>Step Two</span></Title>
      <FullWidthContainer>
        {flags()}
        {displayDMF}
      </FullWidthContainer>
    </StepIncreaseWrapper>
  );
};

export default StepTwo;
