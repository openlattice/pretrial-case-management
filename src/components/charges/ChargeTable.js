/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { fromJS } from 'immutable';

import ChargeRow from './ChargeRow';
import { getViolentChargeLabels } from '../../utils/ArrestChargeUtils';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  box-sizing: border-box;
  min-width: 960px;
  width: 100%;
`;

const HeaderRow = styled.tr`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.th`
  box-sizing: border-box;
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 12px 30px;
  text-transform: uppercase;
`;

const Headers = () => (
  <HeaderRow>
    <HeaderElement>STATUTE</HeaderElement>
    <HeaderElement>NUMBER OF COUNTS</HeaderElement>
    <HeaderElement>QUALIFIER</HeaderElement>
    <HeaderElement>CHARGE</HeaderElement>
  </HeaderRow>
);

const ChargeTable = ({
  charges,
  handleSelect,
  violentChargeList,
  disabled
} :Props) => (
  <Table>
    <tbody>
      <Headers />
      {
        charges.map((charge) => {
          const currCharges = fromJS([charge]);
          const isViolent = getViolentChargeLabels({ currCharges, violentChargeList }).size > 0;
          return (
            <ChargeRow
                key={charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '')}
                isViolent={isViolent}
                charge={charge}
                handleSelect={handleSelect}
                disabled={disabled} />
          );
        })
      }
    </tbody>
  </Table>
);

export default ChargeTable;
