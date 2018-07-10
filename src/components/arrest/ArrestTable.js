import React from 'react';
import styled from 'styled-components';

import ArrestRow from './ArrestRow';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
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
    <HeaderElement>CASE NUMBER</HeaderElement>
    <HeaderElement>ARREST DATE</HeaderElement>
    <HeaderElement>ARREST TIME</HeaderElement>
    <HeaderElement>NUMBER OF CHARGES</HeaderElement>
    <HeaderElement>ARRESTING AGENCY</HeaderElement>
  </HeaderRow>
);

const ArrestTable = ({ arrests, handleSelect }) => {

  return (
    <Table>
      <tbody>
        <Headers />
        {arrests.map((arrest => (
          <ArrestRow
              key={arrest.getIn([PROPERTY_TYPES.CASE_ID, 0], '')}
              arrest={arrest}
              handleSelect={handleSelect} />
        )))}
      </tbody>
    </Table>
  );
};

export default ArrestTable;
