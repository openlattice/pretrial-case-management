/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Tag } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

import * as Routes from '../../core/router/Routes';

const StyledLink = styled(Link)`
  color: ${OL.GREY01};
  :hover {
    color: ${OL.PURPLE02};
  }
`;

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 3px 0 3px 10px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const Row = styled.tr`
  padding: 5px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${(props :Object) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :Object;
};

const renderbooleanIcon = (boolean :boolean) => (
  boolean
    ? <Tag mode="success">Delivered</Tag>
    : <Tag>Not Delivered</Tag>
);

const ReminderRow = ({ data } :Props) => (
  <Row>
    <Cell>{ data.hearingDateTime }</Cell>
    <Cell>{ data.caseNumber }</Cell>
    <Cell>
      <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${data.personEKID}${Routes.OVERVIEW}`}>
        { data.personName }
      </StyledLink>
    </Cell>
    <Cell>{ data.contact }</Cell>
    <Cell>{ data.courtroom }</Cell>
    <Cell><Tag mode="secondary">{ data.reminderType }</Tag></Cell>
    <Cell>
      <StatusIconContainer key={data.contact}>
        { renderbooleanIcon(data.wasNotified) }
      </StatusIconContainer>
    </Cell>
  </Row>
);

export default ReminderRow;
