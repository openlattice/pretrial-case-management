import React from 'react';
import styled from 'styled-components';

import HearingRow from './HearingRow';
import { OL } from '../../utils/consts/Colors';
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
    <HeaderElement>DATE</HeaderElement>
    <HeaderElement>TIME</HeaderElement>
    <HeaderElement>COURTROOM</HeaderElement>
    <HeaderElement />
  </HeaderRow>
);

const HearingsTable = ({ rows, handleSelect, disabled }) => {

  return (
    <Table>
      <tbody>
        <Headers />
        {rows.map((row => (
          <HearingRow
              key={row.getIn([PROPERTY_TYPES.CASE_ID, 0], '')}
              row={row}
              handleSelect={handleSelect}
              disabled={disabled} />
        )))}
      </tbody>
    </Table>
  );
};

export default HearingsTable;
