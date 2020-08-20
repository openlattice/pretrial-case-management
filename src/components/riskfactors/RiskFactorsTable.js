/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import RiskFactorRow from './RiskFactorRow';
import { OL } from '../../utils/consts/Colors';

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
  color: ${OL.GREY02};
  text-transform: uppercase;
  padding: 12px 30px;
`;

const Headers = () => (
  <HeaderRow>
    <HeaderElement>#</HeaderElement>
    <HeaderElement>RISK FACTORS</HeaderElement>
    <HeaderElement>RESPONSES</HeaderElement>
  </HeaderRow>
);

type Props = {
  disabled :boolean;
  handleSelect :() => void;
  rows :Object[];
}

const RiskFactorsTable = ({ rows, handleSelect, disabled } :Props) => (
  <Table>
    <tbody>
      <Headers />
      {rows.map(((row) => (
        <RiskFactorRow
            key={row.get('number')}
            row={row}
            handleSelect={handleSelect}
            disabled={disabled} />
      )))}
    </tbody>
  </Table>
);

export default RiskFactorsTable;
