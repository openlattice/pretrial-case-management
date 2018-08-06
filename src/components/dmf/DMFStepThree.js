/*
 * @flow
 */

import React from 'react';

import DMFTable from './DMFTable';
import { StepHeader, StepWrapper } from './DMFStyledTags';

const StepThree = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context
} :Props) => {
  if (!shouldRender) return null;
  return (
    <div>
      <hr />
      <StepHeader>Step Three</StepHeader>
      <StepWrapper>
        <DMFTable dmf={dmf} nca={nca} fta={fta} context={context} />
      </StepWrapper>
    </div>
  );
};

export default StepThree;
