/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  align-items: center;
  color: ${OL.GREY15};
  font-size: 12px;
  height: 40px;
  padding: 5px 10px;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :{
    caseId :string;
    courtroom :string;
    dateTime :string;
    disabled :boolean;
    hearing :Map;
    id :UUID;
    type :string;
  },
  openConfirmationModal :(hearingEntityKeyId :string) => void
};

const HearingRow = ({
  data,
  openConfirmationModal
} :Props) => (
  <Row key={data.id}>
    <Cell>{ data.dateTime }</Cell>
    <Cell>{ data.courtroom }</Cell>
    <Cell>{ data.type }</Cell>
    <Cell>{ data.caseId }</Cell>
    <Cell>
      <Button size="small" onClick={() => openConfirmationModal(data.hearing)} disabled={data.disabled}>
        Cancel
      </Button>
    </Cell>
  </Row>
);

export default HearingRow;
