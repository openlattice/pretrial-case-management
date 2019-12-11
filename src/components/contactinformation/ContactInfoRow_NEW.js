/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Button, StyleUtils } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

const { getStickyPosition } = StyleUtils;

export const TableCell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  padding: 10px 30px;
  text-align: left;
  vertical-align: middle;
  word-wrap: break-word;
  color: ${OL.GREY15};
  ${props => props.cellStyle};

  :nth-of-type(3) {
    padding-top: 24px;
  }
`;

const StyledTableRow = styled.tr`
  background-color: ${OL.WHITE};
  border-bottom: none;
  color: ${OL.GREY15};
  font-size: 14px;

  :last-of-type {
    border-bottom: none;
  }

  td,
  th {
    ${getStickyPosition}
  }

  ${TableCell}:first-child {
    padding-left: 65px;
  }

  ${TableCell}:last-child {
    padding-right: 30px;
  }
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 0 8px;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
`;

type Props = {
  className ?:string;
  components :Object;
  data :Object;
  headers :Object[];
};

const ContactInfoRow = ({
  className,
  data,
  headers
} :Props) => {
  const { id } = data;
  return (
    <StyledTableRow className={className}>
      <TableCell key={`${id}_cell_${headers[0].key}`}>
        { data[headers[0].key] }
      </TableCell>
      <TableCell key={`${id}_tags_${headers[0].key}`}>
        <ButtonsWrapper>
          <Button size="sm">Mobile</Button>
          <Button size="sm">Preferred</Button>
        </ButtonsWrapper>
      </TableCell>
    </StyledTableRow>
  );
};

ContactInfoRow.defaultProps = {
  className: undefined
};

export default ContactInfoRow;
