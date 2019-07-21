/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map, fromJS } from 'immutable';

import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import ContactInfoTable from '../../components/contactinformation/ContactInfoTable';
import NewContactForm from '../contactinformation/NewContactForm';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { CONTACT_INFO_ACTIONS } from '../../utils/consts/redux/ContactInformationConsts';
import { SUBSCRIPTION_ACTIONS, SUBSCRIPTION_DATA } from '../../utils/consts/redux/SubscriptionConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import {
  CloseModalX,
  NoResults,
  PaddedStyledColumnRow,
  TitleWrapper,
  Wrapper,
} from '../../utils/Layout';
import {
  APP,
  EDM,
  REVIEW,
  PEOPLE,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';


import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import { updateContactsBulk } from '../contactinformation/ContactInfoActions';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as PeopleActionFactory from '../people/PeopleActionFactory';
import * as RemindersActionFactory from '../reminders/RemindersActionFactory';
import * as SubscriptionsActionFactory from './SubscriptionsActionFactory';

const { ENTITY_KEY_ID, PERSON_ID, IS_ACTIVE } = PROPERTY_TYPES;

const ContactHeader = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0;
  span {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
  }
`;

const ButtonRow = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

const ModalBody = styled.div`
  width: 100%;
  padding: 0 30px;
`;

const SubscribeButton = styled(BasicButton)`
  width: 180px;
  color: ${OL.WHITE};
  margin-right: 10px;
  background: ${(props) => {
    let backgroundColor = OL.RED01;
    if (!props.isSubscribed) {
      backgroundColor = OL.GREEN02;
    }
    if (props.disabled) {
      backgroundColor = OL.GREY08;
    }
    return backgroundColor;
  }};
`;

const EditContactButton = styled(BasicButton)`
  width: 180px;
`;

const CancelEditButton = styled(BasicButton)`
  width: 90px;
  height: 40px;
  padding: 0;
`;

const ColumnRow = styled(PaddedStyledColumnRow)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const SaveButton = styled(InfoButton)`
  width: 90px;
  height: 100%;
  margin: 0 10px 0 0;
`;

const INITIAL_STATE = {
  modifyingContactInformation: false,
  updates: {}
};

type Props = {
  contactInfo :Map<*, *>,
  fqnToIdMap :Map<*, *>,
  loadingSubscriptionInfo :boolean,
  person :Map<*, *>,
  readOnlyPermissions :boolean,
  refreshingPersonNeighbors :boolean,
  submitContactReqState :RequestState,
  subscription :Map<*, *>,
  submitting :boolean,
  updatingEntity :boolean,
  updateContactsBulkReqState :RequestState,
  open :() => void,
  onClose :() => void,
  actions :{
    refreshPersonNeighbors :(values :{ personId :string }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
  }
}


const MODAL_WIDTH = '750px';
const MODAL_HEIGHT = 'max-content';

class ManageSubscriptionModal extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  handleCheckboxUpdates = (e) => {
    const { fqnToIdMap } = this.props;
    const { updates } = this.state;
    const { value, name, checked } = e.target;
    const currentEntity = updates[value] || {};
    currentEntity[fqnToIdMap.get(name)] = [checked];
    updates[value] = currentEntity;
    this.setState({
      updates
    });
  }

  modifyContactInformation = () => this.setState({
    modifyingContactInformation: true
  });

  notModifyingContactInformation = () => this.setState({
    modifyingContactInformation: false
  });;

  uponUpdate = () => {
    this.setState(INITIAL_STATE);
  }

  updateExistingContacts = () => {
    const { updates } = this.state;
    const { actions, person } = this.props;
    const personEKID = getEntityKeyId(person);

    if (fromJS(updates).size) {
      actions.updateContactsBulk({
        entities: updates,
        personEKID
      });
    }
    else {
      this.uponUpdate();
    }
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

  renderSubscribeButton = () => {
    const { modifyingContactInformation } = this.state;
    const {
      contactInfo,
      loadingSubscriptionInfo,
      subscription,
      submitting,
      submitContactReqState,
      updateContactsBulkReqState,
      refreshingPersonNeighbors,
      updatingEntity
    } = this.props;
    const submittingContactInfo = requestIsPending(submitContactReqState);
    const updatingContactInfo = requestIsPending(updateContactsBulkReqState);
    const { [IS_ACTIVE]: isSubscribed } = getEntityProperties(subscription);
    const subscribeFn = (isSubscribed) ? this.unsubscribePerson : this.subscribePerson;
    let subscribeButtonText = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    if (
      submitting
      || refreshingPersonNeighbors
      || updatingEntity
      || loadingSubscriptionInfo
    ) subscribeButtonText = 'Loading...';
    const editContactInfoText = 'Add Contact Info';
    const noPreferredContacts = !contactInfo
      .filter(contact => contact.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_PREFERRED, 0], false)).size;
    return (
      <ButtonRow>
        <SubscribeButton
            disabled={
              !contactInfo.size
              || modifyingContactInformation
              || refreshingPersonNeighbors
              || updatingEntity
              || noPreferredContacts
              || submittingContactInfo
              || updatingContactInfo
            }
            isSubscribed={isSubscribed}
            onClick={subscribeFn}>
          { subscribeButtonText }
        </SubscribeButton>
        {
          modifyingContactInformation
            ? (
              <>
                <SaveButton
                    disabled={submitting || submittingContactInfo || updatingContactInfo || refreshingPersonNeighbors}
                    onClick={this.updateExistingContacts}>
                  Save
                </SaveButton>
                <CancelEditButton
                    disabled={updatingContactInfo}
                    onClick={this.notModifyingContactInformation}>
                  Cancel
                </CancelEditButton>
              </>
            )
            : (
              <EditContactButton
                  onClick={this.modifyContactInformation}>
                { editContactInfoText }
              </EditContactButton>
            )
        }
      </ButtonRow>
    );
  }

  renderContactInformation = () => {
    const {
      contactInfo,
      loadingSubscriptionInfo,
      person,
      readOnlyPermissions,
      refreshingPersonNeighbors
    } = this.props;
    const { modifyingContactInformation } = this.state;
    const personEKID = getEntityKeyId(person);
    return (
      <>
        <ContactHeader>
          Contact Information
          <span>
            {'All methods of contact that are marked "preferred" will recieve court notifications.'}
          </span>
        </ContactHeader>
        {
          loadingSubscriptionInfo
            ? <NoResults><LoadingSpinner /></NoResults>
            : (
              <ContactInfoTable
                  contactInfo={contactInfo}
                  editing={modifyingContactInformation}
                  hasPermission={readOnlyPermissions}
                  noResults={!contactInfo.size}
                  handleCheckboxUpdates={this.handleCheckboxUpdates}
                  disabled={refreshingPersonNeighbors} />
            )
        }
        {
          modifyingContactInformation
            ? (
              <NewContactForm personEKID={personEKID} editing={modifyingContactInformation} />
            )
            : null
        }
      </>
    );
  }

  onClose = () => {
    const { actions, onClose } = this.props;
    const { clearSubscriptionModal } = actions;
    onClose();
    clearSubscriptionModal();
    this.setState(INITIAL_STATE);
  }

  render() {
    const {
      open,
      person,
      refreshingPersonNeighbors,
      subscription,
      updatingEntity
    } = this.props;
    return (
      <Wrapper>
        <ModalTransition>
          {
            open
            && (
              <Modal
                  scrollBehavior="outside"
                  onClose={this.onClose}
                  width={MODAL_WIDTH}
                  height={MODAL_HEIGHT}
                  max-height={MODAL_HEIGHT}
                  shouldCloseOnOverlayClick
                  stackIndex={20}>
                <ModalBody>
                  <ColumnRow>
                    <TitleWrapper noPadding>
                      <h2>Manage Subscription</h2>
                      <div>
                        <CloseModalX onClick={this.onClose} />
                      </div>
                    </TitleWrapper>
                  </ColumnRow>
                  <ColumnRow>
                    <SubscriptionInfo
                        updatingEntity={updatingEntity}
                        refreshingPersonNeighbors={refreshingPersonNeighbors}
                        modal
                        subscription={subscription}
                        person={person} />
                    { this.renderContactInformation() }
                    { this.renderSubscribeButton() }
                  </ColumnRow>
                </ModalBody>
              </Modal>
            )
          }
        </ModalTransition>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const contactInfo = state.get(STATE.CONTACT_INFO);
  const review = state.get(STATE.REVIEW);
  const edm = state.get(STATE.EDM);
  const people = state.get(STATE.PEOPLE);
  const subscription = state.get(STATE.SUBSCRIPTIONS);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    submitContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT),
    updateContactsBulkReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.UPDATE_CONTACTS_BULK),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    [REVIEW.READ_ONLY]: review.get(REVIEW.READ_ONLY),

    [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: people.get(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false),

    loadSubscriptionModalReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.LOAD_SUBSCRIPTION_MODAL),
    subscribeReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.SUBSCRIBE),
    unsubscribeReqState: getReqState(subscription, SUBSCRIPTION_ACTIONS.UNSUBSCRIBE),
    [SUBSCRIPTION_DATA.CONTACT_INFO]: subscription.get(SUBSCRIPTION_DATA.CONTACT_INFO),
    [SUBSCRIPTION_DATA.PERSON_NEIGHBORS]: subscription.get(SUBSCRIPTION_DATA.PERSON_NEIGHBORS),
    [SUBSCRIPTION_DATA.SUBSCRIPTION]: subscription.get(SUBSCRIPTION_DATA.SUBSCRIPTION),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  actions.updateContactsBulk = updateContactsBulk;

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
  });

  Object.keys(RemindersActionFactory).forEach((action :string) => {
    actions[action] = RemindersActionFactory[action];
  });

  Object.keys(SubscriptionsActionFactory).forEach((action :string) => {
    actions[action] = SubscriptionsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageSubscriptionModal);
