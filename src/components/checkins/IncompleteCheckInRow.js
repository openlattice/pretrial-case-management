/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';


const Row = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${OL.GREY11};
  background: ${(props) => (props.selected ? OL.PURPLE06 : '')};
`;
const CellContent = styled.div`
  overflow: hidden;
  display: -webkit-box;
  /* stylelint-disable value-no-vendor-prefix */
  -webkit-line-clamp: 2;
  /* stylelint-disable property-no-vendor-prefix */
  -webkit-box-orient: vertical;
`;

const StyledCell = styled.td`
  padding: 10px 0;
  padding-left: 30px;
  text-align: ${(props) => props.align || 'left'};
  word-wrap: break-word;
`;

const StyledButton = styled(Button)`
  padding: 5px;
`;

type Props = {
  data :Map<*, *>,
  openManualCheckInModal :() => void
};

const IncompleteCheckInRow = ({ data, openManualCheckInModal } :Props) => {
  const openModal = () => openManualCheckInModal(data);
  return (
    <Row>
      <StyledCell>
        <CellContent>
          { data.personName }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.checkInNumber || '-' }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.checkInType || '-' }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          <StyledButton color="positive" onClick={openModal}>Check In</StyledButton>
        </CellContent>
      </StyledCell>
    </Row>
  );
};

export default IncompleteCheckInRow;
