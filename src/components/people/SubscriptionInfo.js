/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCog, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import { formatPeopleInfo } from '../../utils/PeopleUtils';
import ManageSubscriptionModal from '../../containers/people/ManageSubscriptionModal';
import StyledButton from '../buttons/StyledButton';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  FormSection,
  InputRow,
  PaddedRow,
  SubHeader
} from '../person/PersonFormTags';

const Status = styled(InputRow)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0;
`;

const StatusText = styled.div`
  font-size: 16px;
  font-weight: 600;
  padding: 5px 10px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const StyledFormSection = styled(FormSection)`
  border-bottom: ${props => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
  margin-bottom: 0 !important;
`;

type Props = {
  contactInfo :List<*, *>,
  person :Map<*, *>,
  subscription :Map<*, *>,
  readOnlyPermissions :boolean,
  modal :boolean
}

class SubscriptionInfo extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manageSubscriptionModalOpen: false
    };
  }

  openManageSubscriptionModal = () => this.setState({ manageSubscriptionModalOpen: true });
  onClose = () => this.setState({ manageSubscriptionModalOpen: false });

  renderManageSubscriptionButton = () => {
    const subscriptionText = ' Manage Subscription';
    return (
      <StyledButton
          onClick={this.openManageSubscriptionModal}>
        <FontAwesomeIcon icon={faCog} />
        {subscriptionText}
      </StyledButton>
    );
  }

  renderManageSubscriptionModal = () => {
    const { manageSubscriptionModalOpen } = this.state;
    const { contactInfo, person, subscription } = this.props;
    return (
      <ManageSubscriptionModal
          person={person}
          subscription={subscription}
          contactInfo={contactInfo}
          open={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  renderHeader = () => {
    const { modal } = this.props;
    return modal
      ? null
      : (
        <PaddedRow>
          <SubHeader>Court Notifications</SubHeader>
        </PaddedRow>
      );
  }

  getName = () => {
    const { person } = this.props;
    const { firstName, middleName, lastName } = formatPeopleInfo(person);
    const midName = middleName ? ` ${middleName}` : '';
    return `${firstName}${midName} ${lastName}`;
  }

  renderSubscriptionStatus = () => {
    const { readOnlyPermissions, subscription, modal } = this.props;
    const name = this.getName();
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    const subscriptionIcon = isSubscribed
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>;
    const isSubscribedText = isSubscribed
      ? 'is subscribed to court notifications'
      : 'is not subscribed to court notifications';
    return (
      <Status>
        <Status>
          { subscriptionIcon }
          <StatusText>{`${name} ${isSubscribedText}`}</StatusText>
        </Status>
        <Status>
          { (modal || readOnlyPermissions) ? null : this.renderManageSubscriptionButton() }
        </Status>
      </Status>
    );
  }

  render() {
    const {
      modal
    } = this.props;
    return (
      <StyledFormSection modal={modal}>
        { this.renderSubscriptionStatus() }
        { this.renderManageSubscriptionModal() }
      </StyledFormSection>
    );
  }
}

export default SubscriptionInfo;
