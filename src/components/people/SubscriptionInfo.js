/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCog, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import StyledButton from '../buttons/StyledButton';
import LoadingSpinner from '../LoadingSpinner';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { FormSection, InputRow } from '../person/PersonFormTags';

import * as SubscriptionsActionFactory from '../../containers/subscription/SubscriptionsActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const LoadingWrapper = styled.div`
  height: 100%;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;
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
  padding: 20px 0;
`;

type Props = {
  person :Map<*, *>,
  subscription :Map<*, *>,
  readOnly :boolean,
  refreshingPersonNeighbors :boolean,
  modal :boolean,
  updatingEntity :boolean,
  actions :{
    loadSubcriptionModal :(values :{ personId :string }) => void,
  }
}

class SubscriptionInfo extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manageSubscriptionModalOpen: false
    };
  }

  openManageSubscriptionModal = () => {
    const { actions, person } = this.props;
    const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
    actions.loadSubcriptionModal({ personId });
    this.setState({ manageSubscriptionModalOpen: true });
  };
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
    const { person } = this.props;
    return (
      <ManageSubscriptionModal
          person={person}
          open={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  getName = () => {
    const { person } = this.props;
    const { firstName, middleName, lastName } = formatPeopleInfo(person);
    const midName = middleName ? ` ${middleName}` : '';
    return `${firstName}${midName} ${lastName}`;
  }

  renderSubscriptionStatus = () => {
    const {
      modal,
      readOnly,
      refreshingPersonNeighbors,
      subscription,
      updatingEntity,
    } = this.props;
    const name = this.getName();
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    let subscriptionIcon = isSubscribed
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>;
    if (updatingEntity || refreshingPersonNeighbors) {
      subscriptionIcon = (
        <StatusIconContainer>
          <LoadingWrapper>
            <LoadingSpinner size="1em" />
          </LoadingWrapper>
        </StatusIconContainer>
      );
    }
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
          { (modal || readOnly) ? null : this.renderManageSubscriptionButton() }
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

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubscriptionsActionFactory).forEach((action :string) => {
    actions[action] = SubscriptionsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(SubscriptionInfo);
