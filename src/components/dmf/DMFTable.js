/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import { OL } from '../../utils/consts/Colors';
import { getDMFDecision } from '../../utils/DMFUtils';

const BlankCell = styled.td`
  background-color: ${OL.GREY10};
  border-radius: 1px;
`;

const HeaderCell = styled.th`
  color: ${OL.GREY02};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 10px;
`;

type Props = {
  context :string;
  fta :object;
  nca :number;
};

const getRowCells = (dmfNca, dmfFta, rowFta, context) => {
  const cells = [];
  cells.push(<HeaderCell key={`fta-${rowFta}-nca-0`}>{`FTA ${rowFta}`}</HeaderCell>);

  for (let rowNca = 1; rowNca <= 6; rowNca += 1) {
    const selected = dmfFta === rowFta && dmfNca === rowNca;
    const cellDMF = getDMFDecision(rowNca, rowFta, context);
    const key = `fta-${rowFta}-nca-${rowNca}`;
    if (!cellDMF) {
      cells.push(<BlankCell key={key} />);
    }
    else {
      cells.push(
        <td key={key}>
          <DMFCell dmf={cellDMF} selected={selected} table />
        </td>
      );
    }
  }

  return cells;
};

const DMFTable = ({ nca, fta, context } :Props) => {
  const rows = [];
  for (let ftaScore = 1; ftaScore <= 6; ftaScore += 1) {
    rows.push(
      <tr key={`fta-${ftaScore}`}>
        {getRowCells(nca, fta, ftaScore, context)}
      </tr>
    );
  }

  return (
    <Table>
      <tbody>
        <tr>
          <HeaderCell />
          <HeaderCell>NCA 1</HeaderCell>
          <HeaderCell>NCA 2</HeaderCell>
          <HeaderCell>NCA 3</HeaderCell>
          <HeaderCell>NCA 4</HeaderCell>
          <HeaderCell>NCA 5</HeaderCell>
          <HeaderCell>NCA 6</HeaderCell>
        </tr>
        {rows}
      </tbody>
    </Table>
  );
};

export default DMFTable;
