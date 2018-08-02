/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import BooleanFlag from '../BooleanFlag';

const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

const StepTwo = ({
  extradited,
  extraditedNotes,
  stepTwoVal,
  stepTwoNotes,
  currentViolentOffense,
  nvca,
  fta,
  context,
  flagDims,
  scaleDims
} :Props) => {

  const STEP2_VALS = [
    {
      label: 'extradition',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={extradited} /></ContentsWrapper>]
    },
    {
      label: 'Listed Charges',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={stepTwoVal} /></ContentsWrapper>]
    },
    {
      label: 'Pretrial FTA',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={fta} /></ContentsWrapper>]
    },
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

  return (
    <div>
      <hr />
      <ContentSection
          component="DMF"
          header="Step Two" >
        {content}
      </ContentSection>
    </div>
  );
  //
  // const violent = currentViolentOffense && nvca;
  // if (!extradited && !stepTwoVal && !violent) {
  //   return (
  //     <div>
  //       <StepHeader>Step Two</StepHeader>
  //       <StepWrapper>
  //         <div>
  //           Defendant was not extradited, no NVCA flag and current violent offense, and
  //           no charges meet the requirements to skip to maximum requirements.
  //         </div>
  //       </StepWrapper>
  //     </div>
  //   );
  // }
  // const textArr = [];
  // if (extradited) {
  //   textArr.push('defendant was extradited');
  // }
  // if (violent) {
  //   textArr.push('PSA resulted in NVCA flag with current violent offense');
  // }
  // if (stepTwoVal) {
  //   textArr.push('current charge severity meets the requirements to skip to maximum requirements');
  // }
  //
  // const text = formatTextArr(textArr);
  //
  // return (
  //   <div>
  //     <StepHeader>Step Two</StepHeader>
  //     <StepWrapper>
  //       <span>{text}</span>
  //     </StepWrapper>
  //     <StepWrapper>
  //       <DMFCell dmf={getDMFDecision(6, 6, context)} selected />
  //     </StepWrapper>
  //   </div>
  // );
};

export default StepTwo;
