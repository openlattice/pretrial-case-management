/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import LoadingSpinner from '../LoadingSpinner';
import { getEntityKeyId } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { STATE, SUBSCRIPTIONS } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { FormSection, InputRow } from '../person/PersonFormTags';

import * as SubscriptionsActionFactory from '../../containers/subscription/SubscriptionsActionFactory';

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
  align-items: center;
  margin: 0;
`;

const UnderlinedTextButton = styled.div`
  display: block;
  color: ${OL.PURPLE02};
  text-decoration: 'underline';
  :hover {
    cursor: pointer;
  }
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
  padding: 10px 0;
`;

type Props = {
  loadingSubscriptionInfo :boolean,
  modal :boolean,
  person :Map<*, *>,
  readOnly :boolean,
  refreshingPersonNeighbors :boolean,
  subscription :Map<*, *>,
  updatingEntity :boolean,
  actions :{
    clearSubscriptionModal :() => void,
    loadSubcriptionModal :(values :{ personEntityKeyId :string }) => void,
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
    const personEntityKeyId = getEntityKeyId(person);
    actions.loadSubcriptionModal({ personEntityKeyId });
    this.setState({ manageSubscriptionModalOpen: true });
  };

  onClose = () => this.setState({ manageSubscriptionModalOpen: false })

  renderManageSubscriptionButton = () => {
    const subscriptionText = ' Manage Subscription';
    return (
      <UnderlinedTextButton
          onClick={this.openManageSubscriptionModal}>
        {subscriptionText}
      </UnderlinedTextButton>
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
      loadingSubscriptionInfo,
      subscription,
      updatingEntity,
    } = this.props;
    let subscriptionIcon;
    if (updatingEntity || refreshingPersonNeighbors || loadingSubscriptionInfo) {
      subscriptionIcon = (
        <StatusIconContainer>
          <LoadingWrapper>
            <LoadingSpinner size="1em" />
          </LoadingWrapper>
        </StatusIconContainer>
      );
    }
    const name = this.getName();
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    subscriptionIcon = isSubscribed
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

function mapStateToProps(state) {
  const subscriptions = state.get(STATE.SUBSCRIPTIONS);

  return {
    [SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL]: subscriptions.get(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL)
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionInfo);
