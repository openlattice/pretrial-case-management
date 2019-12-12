/*
 * @flow
 */

import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { CardSegment, Modal } from 'lattice-ui-kit';
import { List, Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestState } from 'redux-reqseq';

import ContactInfoTable from '../../components/contactinformation/ContactInfoTable_NEW';
import NewContactForm from '../contactinformation/NewContactForm_NEW';

import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { EDM, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  clearSubscriptionModal,
  loadSubcriptionModal,
  subscribe,
  unsubscribe
} from './SubscriptionActions';
import { updateContactsBulk } from '../contactinformation/ContactInfoActions';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CONTACT_INFO_ACTIONS } from '../../utils/consts/redux/ContactInformationConsts';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_DATA } from '../../utils/consts/redux/SubscriptionConsts';

const { IS_ACTIVE } = PROPERTY_TYPES;
const message :string = 'All numbers tagged mobile and preferred will receive court reminders.';
const widthValues = css`
  max-width: 672px;
  min-width: 572px;
`;

const ModalHeaderSection = styled.div`
  align-items: center;
  color: ${OL.WHITE};
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  justify-content: space-between;
  min-height: 40px;
  padding: 30px;
  position: relative;
  ${widthValues};
`;

export const ModalBodyWrapper = styled(CardSegment)`
  margin: 0 -30px;
  ${widthValues};
`;

const ModalTitle = styled.h1`
  color: ${OL.GREY01};
  font-size: 22px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  height: 32px;
  margin: 0 0 0 auto;
  padding: 0;
  text-align: center;
  width: 32px;
`;

const SubscriptionWrapper = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  display: flex;
  margin: 0 -30px;
  ${widthValues};
  padding: 0 0 30px 30px;
`;

const TextWrapper = styled.div`
  margin-left: 20px;
`;

type Props = {
  actions :{
    clearSubscriptionModal :() => void,
    updateContactsBulk :(values :{
      entities :Map,
      personEKID :string
    }) => void,
    subscribe :(values :{
      personEKID :string,
      subscriptionEKID :Map<*, *>
    }) => void,
    unsubscribe :(values :{
      personEKID :string,
      subscriptionEKID :Map<*, *>
    }) => void,
  };
  contactInfo :List;
  fqnToIdMap :Map;
  isOpen :boolean;
  loadingSubscriptionInfo :boolean;
  onClose :() => void;
  person :Map;
  submitContactReqState :RequestState;
  subscribeReqState :RequestState;
  subscription :Map;
  unsubscribeReqState :RequestState;
  updateContactReqState :RequestState;
};

class ManageSubscriptionModal extends Component<Props, State> {

  checkIfIsSubscribed = () => {
    const { subscription } = this.props;
    const { [IS_ACTIVE]: isSubscribed } = getEntityProperties(subscription, [IS_ACTIVE]);
    return isSubscribed || false;
  }

  getName = () => {
    const { person } = this.props;
    const { firstName, middleName, lastName } = formatPeopleInfo(person);
    const midName = middleName ? ` ${middleName}` : '';
    return `${firstName}${midName} ${lastName}`;
  }

  renderStatusIcon = () => {
    const isSubscribed = this.checkIfIsSubscribed();
    const statusIcon = isSubscribed
      ? <FontAwesomeIcon color={OL.GREEN02} icon={faCheckCircle} />
      : <FontAwesomeIcon color={OL.GREY01} icon={faTimesCircle} />;
    return statusIcon;
  }

  getIsSubscribedText = () => {
    const isSubscribed = this.checkIfIsSubscribed();
    const isSubscribedText = isSubscribed
      ? 'is subscribed to Court Reminders.'
      : 'is not subscribed to Court Reminders.';
    return isSubscribedText;
  }

  subscribePerson = () => {
    const { actions, person, subscription } = this.props;
    const personEKID = getEntityKeyId(person);
    const subscriptionEKID = getEntityKeyId(subscription);
    actions.subscribe({ personEKID, subscriptionEKID });
  }

  unsubscribePerson = () => {
    const { actions, person, subscription } = this.props;
    const personEKID = getEntityKeyId(person);
    const subscriptionEKID = getEntityKeyId(subscription);
    actions.unsubscribe({ personEKID, subscriptionEKID });
  }

  findPendingRequest = () => {
    const {
      submitContactReqState,
      subscribeReqState,
      unsubscribeReqState,
      updateContactReqState
    } = this.props;
    const submittingNewContact :boolean = requestIsPending(submitContactReqState);
    const subscribing :boolean = requestIsPending(subscribeReqState);
    const unsubscribing :boolean = requestIsPending(unsubscribeReqState);
    const updatingContactInfo :boolean = requestIsPending(updateContactReqState);
    return submittingNewContact || subscribing || unsubscribing || updatingContactInfo;
  }

  renderContactInformation = () => {
    const {
      contactInfo,
      loadingSubscriptionInfo,
      person
    } = this.props;
    const personEKID = getEntityKeyId(person);
    return (
      <ContactInfoTable
          contactInfo={contactInfo}
          loading={loadingSubscriptionInfo}
          noResults={contactInfo.count() === 0}
          personEKID={personEKID} />
    );
  }

  renderModalHeader = (onClickClose :Function) => {
    const modalTitle :string = `Court Reminders: ${this.getName()}`;
    return (
      <ModalHeaderSection>
        <ModalTitle>{ modalTitle }</ModalTitle>
        <CloseButton onClick={onClickClose}>
          <FontAwesomeIcon color={OL.GREY03} icon={faTimes} size="lg" />
        </CloseButton>
      </ModalHeaderSection>
    );
  }

  render() {
    const {
      contactInfo,
      isOpen,
      onClose,
      person
    } = this.props;
    const isSubscribed = this.checkIfIsSubscribed();
    const subscribeFn = isSubscribed ? this.unsubscribePerson : this.subscribePerson;
    const subscribeButtonText :string = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    const noPreferredContacts :boolean = contactInfo
      .filter(contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false)).count() === 0;
    const pendingRequest :boolean = this.findPendingRequest();
    const personEKID :UUID = getEntityKeyId(person);
    return (
      <Modal
          isDisabledPrimary={noPreferredContacts}
          isPendingPrimary={pendingRequest}
          isVisible={isOpen}
          onClickPrimary={subscribeFn}
          onClose={onClose}
          shouldStretchButtons
          textPrimary={subscribeButtonText}
          viewportScrolling
          withFooter
          withHeader={() => this.renderModalHeader(onClose)}>
        <SubscriptionWrapper>
          <div>{ this.renderStatusIcon() }</div>
          <TextWrapper>
            {`${this.getName()} ${this.getIsSubscribedText()}`}
          </TextWrapper>
        </SubscriptionWrapper>
        <ModalBodyWrapper
            noBleed={false}
            padding="0px"
            vertical>
          { this.renderContactInformation() }
        </ModalBodyWrapper>
        <NewContactForm personEKID={personEKID} />
        <ModalBodyWrapper padding="sm">
          { message }
        </ModalBodyWrapper>
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const contactInfo = state.get(STATE.CONTACT_INFO);
  const edm = state.get(STATE.EDM);
  const subscription = state.get(STATE.SUBSCRIPTIONS);
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
    [SUBSCRIPTION_DATA.CONTACT_INFO]: subscription.get(SUBSCRIPTION_DATA.CONTACT_INFO),
    [SUBSCRIPTION_DATA.PERSON_NEIGHBORS]: subscription.get(SUBSCRIPTION_DATA.PERSON_NEIGHBORS),
    [SUBSCRIPTION_DATA.SUBSCRIPTION]: subscription.get(SUBSCRIPTION_DATA.SUBSCRIPTION),
    app,
    loadSubscriptionModalReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL),
    submitContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT),
    subscribeReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.SUBSCRIBE),
    unsubscribeReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE),
    updateContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.UPDATE_CONTACT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    clearSubscriptionModal,
    loadSubcriptionModal,
    updateContactsBulk,
    subscribe,
    unsubscribe,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ManageSubscriptionModal);
