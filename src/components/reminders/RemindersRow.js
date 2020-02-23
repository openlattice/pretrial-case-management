/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Tag } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';
import { formatDateTime } from '../../utils/FormattingUtils';

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
  padding: 5px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${(props :Props) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  data :Object;
  isOptOut :boolean;
};

class ReminderRow extends React.Component<Props> {

  renderbooleanIcon = (boolean :boolean) => (
    boolean
      ? <Tag mode="success">Delivered</Tag>
      : <Tag>Not Delivered</Tag>
  );

  renderRow = () => {
    const { data, isOptOut } = this.props;

    if (isOptOut) {
      return (
        <Row>
          <Cell>{ formatDateTime(data.dateTime) }</Cell>
          <Cell>
            <StyledLink to={`${Routes.PERSON_DETAILS_ROOT}/${data.personEKID}${Routes.OVERVIEW}`}>
              { data.personName }
            </StyledLink>
          </Cell>
          <Cell>{ data.contact }</Cell>
          <Cell>{ data.reason }</Cell>
        </Row>
      );
    }

    return (
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
            { this.renderbooleanIcon(data.wasNotified) }
          </StatusIconContainer>
        </Cell>
      </Row>
    );
  }

  render() {
    return this.renderRow();
  }
}

export default ReminderRow;
