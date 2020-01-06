/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';
import {
  Button,
  Card,
  CardSegment,
  Spinner
} from 'lattice-ui-kit';

import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';

import { FormSection } from '../person/PersonFormTags';
import { getEntityProperties, getEntityKeyId } from '../../utils/DataUtils';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SUBSCRIPTION_ACTIONS } from '../../utils/consts/redux/SubscriptionConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

import { loadSubcriptionModal } from '../../containers/subscription/SubscriptionActions';

const { IS_ACTIVE } = PROPERTY_TYPES;

const LoadingWrapper = styled.div`
  height: 100%;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
`;

const SectionTitle = styled.div`
  color: ${OL.GREY01};
  font-size: 20px;
  font-weight: 600;
`;

const StatusWrapper = styled(HeaderWrapper)`
  justify-content: flex-start;
`;

const Status = styled(SectionTitle)`
  font-size: 16px;
  font-weight: normal;
`;

const StatusIconContainer = styled.div`
  margin: 5px 20px 5px 0;
`;

const StyledFormSection = styled(FormSection)`
  border-bottom: ${props => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
  margin-bottom: 0 !important;
  padding: 20px 0;
`;

type Props = {
  actions :{
    loadSubcriptionModal :RequestSequence;
  };
  loadSubscriptionModalReqState :RequestState;
  modal :boolean;
  person :Map;
  readOnly :boolean;
  subscribeReqState :RequestState;
  subscription :Map;
  unsubscribeReqState :RequestState;
}

type State = {
  manageSubscriptionModalOpen :boolean;
};

class SubscriptionInfo extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manageSubscriptionModalOpen: false
    };
  }

  openManageSubscriptionModal = () => {
    const { actions, person } = this.props;
    const personEntityKeyId :UUID = getEntityKeyId(person);
    actions.loadSubcriptionModal({ personEntityKeyId });
    this.setState({ manageSubscriptionModalOpen: true });
  };

  onClose = () => this.setState({ manageSubscriptionModalOpen: false })

  renderManageSubscriptionButton = () => {
    const subscriptionText = 'Manage Subscription';
    return (
      <HeaderWrapper>
        <SectionTitle>Court Reminders</SectionTitle>
        <Button
            onClick={this.openManageSubscriptionModal}>
          { subscriptionText }
        </Button>
      </HeaderWrapper>
    );
  }

  renderManageSubscriptionModal = () => {
    const { manageSubscriptionModalOpen } = this.state;
    const { person } = this.props;
    return (
      <ManageSubscriptionModal
          isOpen={manageSubscriptionModalOpen}
          onClose={this.onClose}
          person={person} />
    );
  }

  renderSubscriptionStatus = () => {
    const {
      loadSubscriptionModalReqState,
      modal,
      readOnly,
      subscribeReqState,
      subscription,
      unsubscribeReqState
    } = this.props;
    const loadingSubscriptionInfo = requestIsPending(loadSubscriptionModalReqState);
    const subscribingPerson = requestIsPending(subscribeReqState);
    const unsubscribingPerson = requestIsPending(unsubscribeReqState);
    const updatingSubscription = subscribingPerson || unsubscribingPerson;
    let subscriptionIcon;
    if (updatingSubscription || loadingSubscriptionInfo) {
      subscriptionIcon = (
        <StatusIconContainer>
          <LoadingWrapper>
            <Spinner size="1em" />
          </LoadingWrapper>
        </StatusIconContainer>
      );
    }
    const { [IS_ACTIVE]: isSubscribed } = getEntityProperties(subscription, [IS_ACTIVE]);
    subscriptionIcon = isSubscribed
      ? <StatusIconContainer><FontAwesomeIcon color={OL.GREEN02} icon={faCheckCircle} size="lg" /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color={OL.GREY01} icon={faTimesCircle} size="lg" /></StatusIconContainer>;
    const isSubscribedText :string = isSubscribed ? 'Subscribed' : 'Not subscribed';
    return (
      <Card>
        <CardSegment padding="md" vertical>
          { (modal || readOnly) ? null : this.renderManageSubscriptionButton() }
          <StatusWrapper>
            { subscriptionIcon }
            <Status>{ isSubscribedText }</Status>
          </StatusWrapper>
        </CardSegment>
      </Card>
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

const mapStateToProps = (state :Map) => {
  const subscriptions = state.get(STATE.SUBSCRIPTIONS);
  return {
    loadSubscriptionModalReqState: getReqState(subscriptions, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL),
    subscribeReqState: getReqState(subscriptions, SUBSCRIPTION_ACTIONS.SUBSCRIBE),
    unsubscribeReqState: getReqState(subscriptions, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE)
  };
};


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Subscription Actions
    loadSubcriptionModal
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionInfo);
