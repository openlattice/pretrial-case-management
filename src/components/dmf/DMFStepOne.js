/*
 * @flow
 */

import React from 'react';

import { ContentsWrapper } from './DMFStyledTags';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';

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
      label: 'Type of PSA',
      content: [<ContentsWrapper>{context}</ContentsWrapper>]
    }
  ];

  const content = STATS.map(item => (
    <ContentBlock
        component={CONTENT_CONSTS.DMF}
        contentBlock={item}
        key={item.label} />
  ));

  return (
    <div>
      <ContentSection
          component={CONTENT_CONSTS.DMF}
          header="Step One" >
        {content}
      </ContentSection>
    </div>
  );
};

export default StepOne;
