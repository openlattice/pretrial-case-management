/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Radio } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/pro-light-svg-icons';

import { getEntityKeyId } from '../../utils/DataUtils';
import { getContactInfoFields } from '../../utils/ContactInfoUtils';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';

const Cell = styled.td`
  font-size: 12px;
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
    background: ${(props :Object) => (props.disabled ? OL.WHITE : OL.GREY14)};
  }

  &:last-child {
    border-bottom: none;
  }
`;

type Props = {
  contact :Map;
  editing :boolean;
  selectedContactEntityKeyId :string;
  onCheckBoxChange :(checkboxSelection :Object) => void;
};

const INITIAL_STATE = {
  [PROPERTY_TYPES.IS_MOBILE]: false,
  [PROPERTY_TYPES.IS_PREFERRED]: false
};

type State = {
  'contact.cellphone' :boolean;
  'ol.preferred' :boolean;
};

class SelectContactInfoRow extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  static getDerivedStateFromProps(nextProps :Props) {
    const { contact, editing } = nextProps;
    const isMobile = contact.getIn([PROPERTY_TYPES.IS_MOBILE, 0], false);
    const isPreferred = contact.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], false);
    if (!editing) {
      return {
        [PROPERTY_TYPES.IS_MOBILE]: isMobile,
        [PROPERTY_TYPES.IS_PREFERRED]: isPreferred
      };
    }
    return null;
  }

  renderContact = () => {
    const { contact } = this.props;
    const { email, phone } = getContactInfoFields(contact);
    return (email || phone);
  }

  contactType = () => {
    const { contact } = this.props;
    const { email } = getContactInfoFields(contact);
    return email ? CONTACT_METHODS.EMAIL : CONTACT_METHODS.PHONE;
  }

  renderRadioSelect = () => {
    const { contact, onCheckBoxChange, selectedContactEntityKeyId } = this.props;
    const contactEntityKeyId = getEntityKeyId(contact);
    const isSelected = contactEntityKeyId === selectedContactEntityKeyId;
    return (
      <Radio
          label=""
          name="contact"
          value={contact}
          onChange={() => onCheckBoxChange(contact)}
          checked={isSelected} />
    );
  }

  isMobile = () => {
    const { state } = this;
    const isMobile = state[PROPERTY_TYPES.IS_MOBILE];
    return isMobile
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
      : null;
  }

  isPreferred= () => {
    const { state } = this;
    const isPreferred = state[PROPERTY_TYPES.IS_PREFERRED];
    return isPreferred
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
      : null;
  }

  renderRow = () => (
    <Row>
      <Cell>{this.renderContact()}</Cell>
      <Cell>{this.contactType()}</Cell>
      <Cell>{this.isMobile()}</Cell>
      <Cell>{this.isPreferred()}</Cell>
      <Cell>{this.renderRadioSelect()}</Cell>
    </Row>
  );

  render() {
    return this.renderRow();
  }
}

export default SelectContactInfoRow;
