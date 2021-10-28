/*
 * @flow
 */
import React from 'react';
import type { Element } from 'react';

import { RowWrapper, OptionsGrid } from './ReleaseConditionsStyledTags';
import { RELEASES } from '../../utils/consts/ReleaseConditionConsts';

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string, parentState :Object) => Element<*>[],
};

const DecisionSection = ({ mapOptionsToRadioButtons } :Props) => (
  <RowWrapper>
    <h1>Decision</h1>
    <OptionsGrid numColumns={2}>
      {mapOptionsToRadioButtons(RELEASES, 'release')}
    </OptionsGrid>
  </RowWrapper>
);

export default DecisionSection;
