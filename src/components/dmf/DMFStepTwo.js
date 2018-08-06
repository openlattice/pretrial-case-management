/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import BooleanFlag from '../BooleanFlag';
import { getDMFDecision } from '../../utils/consts/DMFResultConsts';

const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0px 30px 30px;
`;

const StepTwo = ({
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
      label: 'extradition',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={extradited} /></ContentsWrapper>]
    },
    {
      label: 'Listed Charges',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={stepTwoVal} /></ContentsWrapper>]
    },
    // {
    //   label: 'Pretrial FTA',
    //   content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={fta} /></ContentsWrapper>]
    // },
    {
      label: 'NVCA',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={nvca} /></ContentsWrapper>]
    },
    {
      label: 'Violent Offense',
      content: [
        <ContentsWrapper><BooleanFlag dims={flagDims} value={currentViolentOffense} /></ContentsWrapper>
      ]
    }
  ];
  const content = STEP2_VALS.map(item => (
    <ContentBlock
        component="DMF"
        contentBlock={item}
        key={item.label} />
  ));

  const flags = () => (
    <div>
      <hr />
      <ContentSection
          component="DMF"
          header="Step Two" >
        {content}
      </ContentSection>
    </div>
  );

  const StepTwoDecision = extradited || stepTwoVal || (nvca && currentViolentOffense);

  const displayDMF = StepTwoDecision ? (
    <StepWrapper>
      <DMFCell dmf={getDMFDecision(6, 6, context)} selected large />
    </StepWrapper>
  ) : null;

  return (
    <div>
      {flags()}
      {displayDMF}
    </div>
  );
};

export default StepTwo;
