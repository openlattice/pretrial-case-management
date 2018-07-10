import React from 'react';
import styled from 'styled-components';

import RiskFactorRow from './RiskFactorRow';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
  min-width: 960px;
`;

const HeaderRow = styled.tr`
  background-color: #f0f0f7;
  border: 1px solid #f0f0f7;
`;

const HeaderElement = styled.th`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: #8e929b;
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

const RiskFactorsTable = ({ rows, handleSelect, disabled }) => {

  return (
    <Table>
      <tbody>
        <Headers />
        {rows.map((row => (
          <RiskFactorRow
              key={row.get('number')}
              row={row}
              handleSelect={handleSelect}
              disabled={disabled} />
        )))}
      </tbody>
    </Table>
  );
};

export default RiskFactorsTable;
