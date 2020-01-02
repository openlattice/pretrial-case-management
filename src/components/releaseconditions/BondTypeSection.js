/*
 * @flow
 */
import React from 'react';

import StyledInput from '../controls/StyledInput';
import { BOND_TYPES } from '../../utils/consts/ReleaseConditionConsts';
import {
  RowWrapper,
  OptionsGrid,
  Row,
  Dollar
} from './ReleaseConditionsStyledTags';

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  handleNumberInputChange :(event :Object) => void,
  bondAmount :Number,
  bondType :String,
  disabled :boolean
};

const BondTypeSection = ({
  mapOptionsToRadioButtons,
  handleNumberInputChange,
  bondType,
  bondAmount,
  disabled
} :Props) => (
  <RowWrapper>
    <h1>Bond Type</h1>
    <OptionsGrid numColumns={5}>
      {mapOptionsToRadioButtons(BOND_TYPES, 'bondType')}
    </OptionsGrid>
    {
      (bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY)
        ? (
          <Row type={bondType}>
            <h3>Amount: </h3>
            <Dollar>$</Dollar>
            <StyledInput
                disabled={disabled}
                name="bondAmount"
                value={bondAmount}
                onChange={handleNumberInputChange} />
          </Row>
        )
        : null
    }
  </RowWrapper>
);

export default BondTypeSection;
