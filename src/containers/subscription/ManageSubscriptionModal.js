/*
 * @flow
 */

import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';
import { List, Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  CardSegment,
  Modal,
  ModalFooter,
  Spinner
} from 'lattice-ui-kit';

import ContactInfoTable from '../../components/contactinformation/ContactInfoTable';
import NewContactForm from '../contactinformation/NewContactForm';

import { formatPeopleInfo, formatPersonName } from '../../utils/PeopleUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { EDM, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CONTACT_INFO_ACTIONS, CONTACT_INFO_DATA } from '../../utils/consts/redux/ContactInformationConsts';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_DATA } from '../../utils/consts/redux/SubscriptionConsts';

import {
  clearSubscriptionModal,
  loadSubcriptionModal,
  subscribe,
  unsubscribe
} from './SubscriptionActions';
import { updateContactsBulk } from '../contactinformation/ContactInfoActions';

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
    clearSubscriptionModal :() => void;
    subscribe :RequestSequence;
    unsubscribe :RequestSequence;
    updateContactsBulk :RequestSequence;
  };
  contactInfo :List;
  isOpen :boolean;
  loadSubscriptionModalReqState :RequestState;
  onClose :() => void;
  person :Map;
  submitContactReqState :RequestState;
  submittedContact :Map;
  subscribeReqState :RequestState;
  subscription :Map;
  unsubscribeReqState :RequestState;
  updateContactReqState :RequestState;
}


class ManageSubscriptionModal extends Component<Props> {

  checkIfIsSubscribed = () => {
    const { subscription } = this.props;
    const { [IS_ACTIVE]: isSubscribed } = getEntityProperties(subscription, [IS_ACTIVE]);
    return isSubscribed || false;
  }

  getName = () => {
    const { person } = this.props;
    const { firstName, middleName, lastName } = formatPeopleInfo(person);
    const { firstMidLast } = formatPersonName(firstName, middleName, lastName);
    return firstMidLast;
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

  getSubscribeButtonTextAndFn = () => {
    const isSubscribed = this.checkIfIsSubscribed();
    const subscribeFn = isSubscribed ? this.unsubscribePerson : this.subscribePerson;
    const subscribeButtonText :string = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    return { subscribeFn, subscribeButtonText };
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

  renderContactInformation = () => {
    const {
      contactInfo,
      loadSubscriptionModalReqState,
      person
    } = this.props;
    const loadingSubscriptionInfo :boolean = requestIsPending(loadSubscriptionModalReqState);
    const personEKID :UUID = getEntityKeyId(person);
    return (
      <ContactInfoTable
          loading={loadingSubscriptionInfo}
          noResults={contactInfo.count() === 0}
          personEKID={personEKID} />
    );
  }

  renderModalHeader = () => {
    const { onClose } = this.props;
    const modalTitle :string = `Court Reminders: ${this.getName()}`;
    return (
      <ModalHeaderSection>
        <ModalTitle>{ modalTitle }</ModalTitle>
        <CloseButton onClick={onClose}>
          <FontAwesomeIcon color={OL.GREY03} icon={faTimes} size="lg" />
        </CloseButton>
      </ModalHeaderSection>
    );
  }

  renderModalFooter = () => {
    const {
      contactInfo,
      subscribeReqState,
      submittedContact,
      unsubscribeReqState,
      submitContactReqState,
      updateContactReqState,
    } = this.props;

    const { subscribeFn, subscribeButtonText } = this.getSubscribeButtonTextAndFn();
    const submittedContactIsPreferred :boolean = !submittedContact.isEmpty()
      && submittedContact.getIn([PROPERTY_TYPES.IS_PREFERRED, 0], false);
    const noPreferredContacts :boolean = contactInfo
      .filter(contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false)).isEmpty()
      && !submittedContactIsPreferred;

    const isSubscribed = this.checkIfIsSubscribed();
    const subscribing :boolean = requestIsPending(subscribeReqState);
    const unsubscribing :boolean = requestIsPending(unsubscribeReqState);
    const submittingNewContact :boolean = requestIsPending(submitContactReqState);
    const updatingContactInfo :boolean = requestIsPending(updateContactReqState);
    const shouldBeDisabled :boolean = submittingNewContact
      || updatingContactInfo
      || (!isSubscribed && noPreferredContacts)
      || contactInfo.isEmpty();

    return (
      <ModalFooter
          isDisabledPrimary={shouldBeDisabled}
          isPendingPrimary={subscribing || unsubscribing}
          onClickPrimary={subscribeFn}
          shouldStretchButtons
          textPrimary={subscribeButtonText} />
    );
  }

  render() {
    const {
      isOpen,
      loadSubscriptionModalReqState,
      onClose,
      person
    } = this.props;
    const personEKID :UUID = getEntityKeyId(person);
    const { subscribeFn, subscribeButtonText } = this.getSubscribeButtonTextAndFn();
    const loadingModal :boolean = requestIsPending(loadSubscriptionModalReqState);
    return (
      <Modal
          isVisible={isOpen}
          onClickPrimary={subscribeFn}
          onClose={onClose}
          textPrimary={subscribeButtonText}
          viewportScrolling
          withFooter={this.renderModalFooter}
          withHeader={this.renderModalHeader}>
        {
          loadingModal
            ? (
              <Spinner />
            )
            : (
              <>
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
              </>
            )
        }
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
    [CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO]: contactInfo.get(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO),
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

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
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
