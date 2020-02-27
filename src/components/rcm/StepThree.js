/*
 * @flow
 */

import React from 'react';

import RCMMatrix from './RCMMatrix';
import { StepHeader } from './RCMStyledTags';

const StepThree = ({
  shouldRender,
  scores,
  context
} :Props) => {
  if (!shouldRender) return null;
  return (
    <div>
      <hr />
      <StepHeader>RELEASE CONDITIONS MATRIX</StepHeader>
      <RCMMatrix scores={scores} context={context} />
    </div>
  );
};

export default StepThree;
