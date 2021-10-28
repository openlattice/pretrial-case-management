/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';

import RCMMatrix from './RCMMatrix';
import { StepHeader } from './RCMStyledTags';

type Props = {
  shouldRender :boolean;
  scores :Map;
  context :string;
};

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
