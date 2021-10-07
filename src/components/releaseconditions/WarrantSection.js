/*
 * @flow
 */
import React from 'react';
import type { Element } from 'react';

import { RowWrapper, OptionsGrid } from './ReleaseConditionsStyledTags';
import { WARRANTS } from '../../utils/consts/ReleaseConditionConsts';

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string, parentState :Object) => Element<*>[];
};

const WarrantSection = ({ mapOptionsToRadioButtons } :Props) => (
  <RowWrapper>
    <h1>Warrant</h1>
    <OptionsGrid numColumns={2}>
      {mapOptionsToRadioButtons(WARRANTS, 'warrant')}
    </OptionsGrid>
  </RowWrapper>
);

export default WarrantSection;
