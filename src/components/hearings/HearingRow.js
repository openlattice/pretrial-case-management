/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button, Tooltip } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

const CaseId = styled.div`
  color: ${OL.GREY15};
  display: block;
  font-size: 14px;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const Cell = styled.td`
  align-items: center;
  color: ${OL.GREY15};
  font-size: 12px;
  height: 40px;
  padding: 5px 10px;
`;

const Row = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    cursor: ${(props :Object) => (props.disabled ? 'default' : 'pointer')};
    background: ${(props :Object) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:active {
    background-color: ${OL.GREY08};
  }

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
  <Row
      disabled>
    <Cell>{ data.dateTime }</Cell>
    <Cell>{ data.courtroom }</Cell>
    <Cell>{ data.type }</Cell>
    <Cell>
      <Tooltip arrow placement="top" title={data.caseId}>
        <div>{data.caseId}</div>
      </Tooltip>
    </Cell>
    <Cell>
      <Button size="small" onClick={() => openConfirmationModal(data.hearing)} disabled={data.disabled}>
        Cancel
      </Button>
    </Cell>
  </Row>
);

export default HearingRow;
