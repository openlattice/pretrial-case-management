/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Button, StyleUtils } from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/pro-solid-svg-icons';

import { OL } from '../../utils/consts/Colors';
import {
  checkedBase,
  checkedHover,
  uncheckedBase,
  uncheckedHover
} from './TagStyles';

const { getStickyPosition, getStyleVariation } = StyleUtils;

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

  ${TableCell}:last-child {
    padding-right: 30px;
  }
`;

const TextAndIconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 0 8px;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
`;

const TextWrapper = styled.div`
  margin-left: ${props => props.isMobile ? '20px' : '35px'};
`;

const baseButtonVariation = getStyleVariation('type', {
  default: uncheckedBase,
  checked: checkedBase,
  unchecked: uncheckedBase,
});

const hoverButtonVariation = getStyleVariation('type', {
  default: uncheckedHover,
  checked: checkedHover,
  unchecked: uncheckedHover,
});

const TagButton = styled(Button)`
  ${baseButtonVariation}
  :hover {
    ${hoverButtonVariation}
  }
`;

type Props = {
  className ?:string;
  data :Object;
  headers :Object[];
};

const ContactInfoRow = ({
  className,
  data,
  headers
} :Props) => {
  const { id, isMobile, isPreferred } = data;
  const mobileType :string = isMobile ? 'checked' : 'unchecked';
  const preferredType :string = isPreferred ? 'checked' : 'unchecked';
  return (
    <StyledTableRow className={className}>
      <TableCell key={`${id}_cell_${headers[0].key}`}>
        <TextAndIconWrapper>
          {
            isMobile && (
              <FontAwesomeIcon color={OL.GREY03} icon={faPhone} />
            )
          }
          <TextWrapper isMobile={isMobile}>{ data[headers[0].key] }</TextWrapper>
        </TextAndIconWrapper>
      </TableCell>
      <TableCell key={`${id}_tags_${headers[0].key}`}>
        <ButtonsWrapper>
          <TagButton size="sm" type={mobileType}>Mobile</TagButton>
          <TagButton size="sm" type={preferredType}>Preferred</TagButton>
        </ButtonsWrapper>
      </TableCell>
    </StyledTableRow>
  );
};

ContactInfoRow.defaultProps = {
  className: undefined
};

export default ContactInfoRow;
