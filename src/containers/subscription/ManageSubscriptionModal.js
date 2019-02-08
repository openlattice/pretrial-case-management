/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map, fromJS } from 'immutable';
import { Constants } from 'lattice';

import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import SubscriptionConfig from '../../config/formconfig/SubscriptionConfig';
import SubscriptionInfo from '../../components/people/SubscriptionInfo';
import ContactInfoTable from '../../components/contactinformation/ContactInfoTable';
import NewContactForm from '../people/NewContactForm';
import { FORM_IDS } from '../../utils/consts/Consts';
import { getEntitySetId } from '../../utils/AppUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
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
  STATE,
  SUBMIT,
  SUBSCRIPTIONS,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as PeopleActionFactory from '../people/PeopleActionFactory';
import * as SubscriptionsActionFactory from './SubscriptionsActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

let {
  SUBSCRIPTION
} = APP_TYPES_FQNS;

SUBSCRIPTION = SUBSCRIPTION.toString();

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
  app :Map<*, *>,
  contactInfo :Map<*, *>,
  fqnToIdMap :Map<*, *>,
  loadingSubscriptionInfo :boolean,
  person :Map<*, *>,
  readOnlyPermissions :boolean,
  refreshingPersonNeighbors :boolean,
  selectedOrganizationId :string,
  subscription :Map<*, *>,
  submitting :boolean,
  updatingEntity :boolean,
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

class ReleaseConditionsModal extends React.Component<Props, State> {
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

  refreshPersonNeighborsCallback = () => {
    const { actions, person } = this.props;
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    actions.refreshPersonNeighbors({ personId });
    this.setState(INITIAL_STATE);
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
    const { updateContactInfo } = actions;
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    const personEntityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0], '');

    if (fromJS(updates).size) {
      updateContactInfo({
        entities: updates,
        personEntityKeyId,
        personId,
        callback: this.uponUpdate
      });
    }
    else {
      this.uponUpdate();
    }
  }

  createSubscription = () => {
    const { actions, app, person } = this.props;
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    const values = {
      [PROPERTY_TYPES.SUBSCRIPTION_ID]: randomUUID(),
      [PROPERTY_TYPES.IS_ACTIVE]: true,
      [PROPERTY_TYPES.DAY_INTERVAL]: true,
      [PROPERTY_TYPES.WEEK_INTERVAL]: true,
      [FORM_IDS.PERSON_ID]: personId,
      [PROPERTY_TYPES.COMPLETED_DATE_TIME]: moment().toISOString(true)
    };
    actions.submit({
      app,
      config: SubscriptionConfig,
      values,
      callback: this.refreshPersonNeighborsCallback
    });
  }

  toggleSubscription = () => {
    const {
      actions,
      app,
      fqnToIdMap,
      subscription,
      selectedOrganizationId
    } = this.props;
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    const entitySetId = getEntitySetId(app, SUBSCRIPTION, selectedOrganizationId);
    const entityKeyId = subscription.getIn([OPENLATTICE_ID_FQN, 0], '');
    const values = {
      [entityKeyId]: {
        [fqnToIdMap.get(PROPERTY_TYPES.IS_ACTIVE)]: [!isSubscribed]
      }
    };
    actions.updateEntity({
      entitySetId,
      entities: values,
      updateType: 'PartialReplace',
      callback: this.refreshPersonNeighborsCallback
    });
  }

  renderSubscribeButton = () => {
    const { modifyingContactInformation } = this.state;
    const {
      contactInfo,
      loadingSubscriptionInfo,
      subscription,
      submitting,
      refreshingPersonNeighbors,
      updatingEntity
    } = this.props;
    const subscriptionExists = !!subscription.size;
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    let subscribeButtonText = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    if (
      submitting
      || refreshingPersonNeighbors
      || updatingEntity
      || loadingSubscriptionInfo
    ) subscribeButtonText = 'Loading...';
    const editContactInfoText = 'Add Contact Info';
    const subscribeFn = subscriptionExists ? this.toggleSubscription : this.createSubscription;
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
                    disabled={submitting || refreshingPersonNeighbors}
                    onClick={this.updateExistingContacts}>
                  Save
                </SaveButton>
                <CancelEditButton
                    disabled={refreshingPersonNeighbors}
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
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
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
              <NewContactForm personId={personId} editing={modifyingContactInformation} />
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
  const submit = state.get(STATE.SUBMIT);
  const review = state.get(STATE.REVIEW);
  const edm = state.get(STATE.EDM);
  const people = state.get(STATE.PEOPLE);
  const subscription = state.get(STATE.SUBSCRIPTIONS);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    [REVIEW.READ_ONLY]: review.get(REVIEW.READ_ONLY),

    [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: people.get(PEOPLE.REFRESHING_PERSON_NEIGHBORS, false),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false),
    [SUBMIT.UPDATING_ENTITY]: submit.get(SUBMIT.UPDATING_ENTITY, false),

    [SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL]: subscription.get(SUBSCRIPTIONS.LOADING_SUBSCRIPTION_MODAL),
    [SUBSCRIPTIONS.CONTACT_INFO]: subscription.get(SUBSCRIPTIONS.CONTACT_INFO),
    [SUBSCRIPTIONS.PERSON_NEIGHBORS]: subscription.get(SUBSCRIPTIONS.PERSON_NEIGHBORS),
    [SUBSCRIPTIONS.SUBSCRIPTION]: subscription.get(SUBSCRIPTIONS.SUBSCRIPTION)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
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

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsModal);
