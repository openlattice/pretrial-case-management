/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import { getDMFDecision } from '../../utils/consts/DMFResultConsts';


const Table = styled.table`
  border-spacing: 10px;
  border-collapse: separate
`
const HeaderCell = styled.th`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #8e929b;
`;

const BlankCell = styled.td`
  border-radius: 1px;
  background-color: #f9f9fd;
`

type Props = {
  nca :number,
  fta :object,
  context :string
};

const getRowCells = (dmfNca, dmfFta, rowFta, context) => {
  const cells = [];
  cells.push(<HeaderCell key={`fta-${rowFta}-nca-0`}>{`FTA ${rowFta}`}</HeaderCell>)

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

const DMFTable = ({
  nca,
  fta,
  context
}) :Props => {

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
