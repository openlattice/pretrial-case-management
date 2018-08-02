/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';

const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

const StepOne = ({
  nca,
  fta,
  nvca,
  context,
  scaleDims,
  flagDims
} :Props) => {

  const STATS = [
    {
      label: 'NVCA',
      content: [<ContentsWrapper><BooleanFlag dims={flagDims} value={nvca} /></ContentsWrapper>]
    },
    {
      label: 'NCA',
      content: [<ContentsWrapper>{nca}<ScoreScale dims={scaleDims} score={nca} /></ContentsWrapper>]
    },
    {
      label: 'FTA',
      content: [<ContentsWrapper>{fta}<ScoreScale dims={scaleDims} score={fta} /></ContentsWrapper>]
    },
    {
      label: 'Time of PSA',
      content: [<ContentsWrapper>{context}</ContentsWrapper>]
    }
  ];

  const content = STATS.map(item => (
    <ContentBlock
        component="DMF"
        contentBlock={item}
        key={item.label} />
  ));

  return (
    <div>
      <ContentSection
          component="DMF"
          header="Step One" >
        {content}
      </ContentSection>
    </div>
  );
};

export default StepOne;
