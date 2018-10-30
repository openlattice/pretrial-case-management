/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import ChargeRow from './ChargeRow';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
  min-width: 960px;
`;

const HeaderRow = styled.tr`
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.th`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY02};
  text-transform: uppercase;
  padding: 12px 30px;
`;

const Headers = () => (
  <HeaderRow>
    <HeaderElement>STATUTE</HeaderElement>
    <HeaderElement>NUMBER OF COUNTS</HeaderElement>
    <HeaderElement>QUALIFIER</HeaderElement>
    <HeaderElement>CHARGE</HeaderElement>
  </HeaderRow>
);

const ChargeTable = ({ charges, handleSelect, disabled } :Props) => (
  <Table>
    <tbody>
      <Headers />
      {charges.map((charge => (
        <ChargeRow
            key={charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '')}
            charge={charge}
            handleSelect={handleSelect}
            disabled={disabled} />
      )))}
    </tbody>
  </Table>
);

export default ChargeTable;
