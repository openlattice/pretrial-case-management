/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import LogoLoader from '../LogoLoader';
import { OL } from '../../utils/consts/Colors';

const RequiresActionRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${OL.GREY11};
  background: ${(props) => (props.selected ? OL.PURPLE06 : '')};
`;

const CellContent = styled.div`
  overflow: hidden;
  /* stylelint-disable value-no-vendor-prefix */
  display: -webkit-box;
  /* stylelint-disable property-no-vendor-prefix */
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const StyledCell = styled.td`
  padding: 10px 10px;
  text-align: ${(props) => props.align || 'left'};
  word-wrap: break-word;
`;

type Props = {
  data :Map;
  handleSelect :() => void;
  loadingRequiresActionPeople :boolean;
  selectedPersonId :string;
};

const RequiresActionPersonRow = ({
  data,
  handleSelect,
  loadingRequiresActionPeople,
  selectedPersonId
} :Props) => {
  if (loadingRequiresActionPeople) {
    return <LogoLoader loadingText="Loading..." />;
  }
  const selected :boolean = selectedPersonId === data.personEKID;
  return (
    <RequiresActionRowWrapper
        onClick={() => handleSelect(data.personEKID)}
        selected={selected}>
      <StyledCell>
        <CellContent>
          { data.lastName }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.firstName }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.dob }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.oldPSADate }
        </CellContent>
      </StyledCell>
      <StyledCell>
        <CellContent>
          { data.psaCount }
        </CellContent>
      </StyledCell>
    </RequiresActionRowWrapper>
  );
};

export default RequiresActionPersonRow;
