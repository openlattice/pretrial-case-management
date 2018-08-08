/*
 * @flow
 */
import React from 'react';

import StyledInput from '../controls/StyledInput';
import { RowWrapper, OptionsGrid, Row } from './ReleaseConditionsStyledTags';
import { BOND_TYPES } from '../../utils/consts/ReleaseConditionConsts';

const BondTypeSection = ({
  mapOptionsToRadioButtons,
  handleNumberInputChange,
  bondType,
  bondAmount,
  disabled
} :Props) => (
  <RowWrapper>
    <h1>Bond Type</h1>
    <OptionsGrid numColumns={4}>
      {mapOptionsToRadioButtons(BOND_TYPES, 'bondType')}
    </OptionsGrid>
    {
      (bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY)
        ? (
          <Row>
            <h3>Amount: </h3>
            <StyledInput
                disabled={disabled}
                name="bondAmount"
                placeholder={`$${bondAmount}`}
                value={bondAmount}
                onChange={handleNumberInputChange} />
          </Row>
        )
        : null
    }
  </RowWrapper>
);

export default BondTypeSection;
