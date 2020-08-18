/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import StyledInput from '../controls/StyledInput';
import { BOND_AMOUNTS, BOND_TYPE_OPTIONS } from '../../utils/consts/ReleaseConditionConsts';
import { RowWrapper, OptionsGrid, Dollar } from './ReleaseConditionsStyledTags';

const AmountHeader = styled.div`
  margin-top: 25px;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
`;

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  handleNumberInputChange :(event :Object) => void,
  cashOnlyAmount :Number;
  cashSuretyAmount :Number;
  bondType :String,
  disabled :boolean
};

const BondTypeSection = ({
  mapOptionsToRadioButtons,
  handleNumberInputChange,
  bondType,
  cashOnlyAmount,
  cashSuretyAmount,
  disabled
} :Props) => (
  <RowWrapper>
    <h1>Bond Type</h1>
    <OptionsGrid numColumns={4}>
      {mapOptionsToRadioButtons(BOND_TYPE_OPTIONS, 'bondType')}
      {
        (bondType === BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY)
          ? (
            <>
              <AmountHeader>Cash Only Amount: </AmountHeader>
              <div>
                <Dollar>$</Dollar>
                <StyledInput
                    disabled={disabled}
                    name={BOND_AMOUNTS.CASH}
                    value={cashOnlyAmount}
                    onChange={handleNumberInputChange} />
              </div>
              <AmountHeader>Cash/Surety Amount: </AmountHeader>
              <div>
                <Dollar>$</Dollar>
                <StyledInput
                    disabled={disabled}
                    name={BOND_AMOUNTS.SURETY}
                    value={cashSuretyAmount}
                    onChange={handleNumberInputChange} />
              </div>
            </>
          ) : null
      }
    </OptionsGrid>
  </RowWrapper>
);

export default BondTypeSection;
