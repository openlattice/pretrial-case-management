/*
 * @flow
 */
import React from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { Input } from 'lattice-ui-kit';

import { Dollar, OptionsGrid, RowWrapper } from './ReleaseConditionsStyledTags';

import { BOND_AMOUNTS, BOND_TYPE_OPTIONS } from '../../utils/consts/ReleaseConditionConsts';

const AmountHeader = styled.div`
  margin-top: 25px;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
`;

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string, parentState :Object) => Element<*>[];
  handleNumberInputChange :(event :Object) => void;
  cashOnlyAmount :number;
  cashSuretyAmount :number;
  bondType :?string;
  disabled :boolean;
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
                <Input
                    disabled={disabled}
                    name={BOND_AMOUNTS.CASH}
                    value={cashOnlyAmount}
                    onChange={handleNumberInputChange} />
              </div>
              <AmountHeader>Cash/Surety Amount: </AmountHeader>
              <div>
                <Dollar>$</Dollar>
                <Input
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
