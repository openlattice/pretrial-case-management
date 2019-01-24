/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { phoneIsValid, emailIsValid } from '../../utils/PeopleUtils';


let {
  CONTACT_INFORMATION
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();

const Cell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const Row = styled.tr`
  padding: 7px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:hover {
    background: ${props => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const BooleanDisplay = styled.div`
  padding: 9px 22px;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background-color: ${props => (props.checked ? OL.GREY05 : OL.GREY10)};
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: normal;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
`;

type Props = {
  contact :Map<*, *>,
  editing :boolean
};

class ChargeRow extends React.Component<Props, State> {

  renderContact = () => {
    const { contact, editing } = this.props;
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    const phone = contact.getIn([PROPERTY_TYPES.PHONE, 0], '');
    return (email || phone);
  }

  contactType = () => {
    const { contact, editing } = this.props;
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    return email ? 'Email' : 'Phone';
  }

  isMobile = () => {
    const { contact, editing } = this.props;
    const isMobile = contact.getIn([PROPERTY_TYPES.IS_MOBILE, 0], '');
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    return email
      ? null
      : <BooleanDisplay checked={isMobile}>{isMobile ? 'Yes' : 'No'}</BooleanDisplay>;
  }

  isPreferred= () => {
    const { contact, editing } = this.props;
    const isPreferred = contact.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], '');
    return <BooleanDisplay checked={isPreferred}>{isPreferred ? 'Yes' : 'No'}</BooleanDisplay>;
  }

  renderRow = () => {
    const { editing } = this.props;
    return (
      <Row disabled={!editing}>
        <Cell>{this.renderContact()}</Cell>
        <Cell>{this.contactType()}</Cell>
        <Cell>{this.isMobile()}</Cell>
        <Cell>{this.isPreferred()}</Cell>
      </Row>
    );
  }

  render() {
    return this.renderRow();
  }
}

export default ChargeRow;
