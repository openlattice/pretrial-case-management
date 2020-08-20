/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import ArrestRow from './ArrestRow';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Table = styled.table`
  width: 100%;
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
    <HeaderElement>CASE NUMBER</HeaderElement>
    <HeaderElement>ARREST DATE</HeaderElement>
    <HeaderElement>ARREST TIME</HeaderElement>
    <HeaderElement>NUMBER OF CHARGES</HeaderElement>
    <HeaderElement>ARRESTING AGENCY</HeaderElement>
  </HeaderRow>
);

const ArrestTable = ({ arrests, handleSelect } :Props) => (
  <Table>
    <tbody>
      <Headers />
      {arrests.map(((arrest) => (
        <ArrestRow
            key={arrest.getIn([PROPERTY_TYPES.CASE_ID, 0], '')}
            arrest={arrest}
            handleSelect={handleSelect} />
      )))}
    </tbody>
  </Table>
);

export default ArrestTable;
