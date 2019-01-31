/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';

import CheckboxButton from '../controls/StyledCheckboxButton';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';

const { OPENLATTICE_ID_FQN } = Constants;

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
  editing :boolean,
  disabled :boolean,
  handleCheckboxUpdates :() => void,
};

class ChargeRow extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    const { contact } = props;
    const isMobile = contact.getIn([PROPERTY_TYPES.IS_MOBILE, 0], '');
    const isPreferred = contact.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], '');
    this.state = {
      [PROPERTY_TYPES.IS_MOBILE]: isMobile,
      [PROPERTY_TYPES.IS_PREFERRED]: isPreferred
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { contact, editing } = nextProps;
    const isMobile = contact.getIn([PROPERTY_TYPES.IS_MOBILE, 0], '');
    const isPreferred = contact.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], '');
    const isMobileFromState = prevState[PROPERTY_TYPES.IS_MOBILE];
    const isPreferredFromState = prevState[PROPERTY_TYPES.IS_PREFERRED];
    const nextState = {};
    if (!editing) {
      if (isMobile !== isMobileFromState) {
        nextState[PROPERTY_TYPES.IS_MOBILE] = isMobile;
      }
      if (isPreferred !== isPreferredFromState) {
        nextState[PROPERTY_TYPES.IS_PREFERRED] = isPreferred;
      }
      return nextState;
    }
    return null;
  }

  renderContact = () => {
    const { contact } = this.props;
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    const phone = contact.getIn([PROPERTY_TYPES.PHONE, 0], '');
    return (email || phone);
  }

  contactType = () => {
    const { contact } = this.props;
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    return email ? 'Email' : 'Phone';
  }

  getEntityKeyId = () => {
    const { contact } = this.props;
    return contact.getIn([OPENLATTICE_ID_FQN, 0], '');
  }

  handleCheckboxChange = (e) => {
    const { handleCheckboxUpdates } = this.props;
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
    handleCheckboxUpdates(e);
  }

  isMobile = () => {
    const { state } = this;
    const { contact, editing, disabled } = this.props;
    const isMobile = state[PROPERTY_TYPES.IS_MOBILE];
    const entityKeyId = this.getEntityKeyId();
    const email = contact.getIn([PROPERTY_TYPES.EMAIL, 0], '');
    const input = editing
      ? (
        <CheckboxButton
            name={PROPERTY_TYPES.IS_MOBILE}
            onChange={this.handleCheckboxChange}
            checked={isMobile}
            value={entityKeyId}
            disabled={!editing || disabled}
            label={isMobile ? 'Yes' : 'No'} />
      )
      : (
        <BooleanDisplay>
          {isMobile ? 'Yes' : 'No'}
        </BooleanDisplay>
      );
    return email
      ? null
      : input;
  }

  isPreferred= () => {
    const { state } = this;
    const { editing, disabled } = this.props;
    const entityKeyId = this.getEntityKeyId();
    const isPreferred = state[PROPERTY_TYPES.IS_PREFERRED];
    const input = editing
      ? (
        <CheckboxButton
            name={PROPERTY_TYPES.IS_PREFERRED}
            onChange={this.handleCheckboxChange}
            value={entityKeyId}
            checked={isPreferred}
            disabled={!editing || disabled}
            label={isPreferred ? 'Yes' : 'No'} />
      )
      : (
        <BooleanDisplay>
          {isPreferred ? 'Yes' : 'No'}
        </BooleanDisplay>
      );
    return input;
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
