/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map } from 'immutable';
import { Constants } from 'lattice';

import BasicButton from '../../components/buttons/BasicButton';
import SubscriptionConfig from '../../config/formconfig/SubscriptionConfig';
import SubscriptionInfo from '../../components/people/SubscriptionInfo';
import ContactInfoTable from '../../components/contactinformation/ContactInfoTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FORM_IDS } from '../../utils/consts/Consts';
import { getEntitySetId } from '../../utils/AppUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  Wrapper,
  PaddedStyledColumnRow,
  TitleWrapper,
  CloseModalX
} from '../../utils/Layout';
import {
  APP,
  REVIEW,
  STATE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

let {
  CONTACT_INFORMATION,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
SUBSCRIPTION = SUBSCRIPTION.toString();

const LoadingWrapper = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContactText = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin: 10px 30px;
`;

const ButtonRow = styled.div`
  width: 100%;
  margin: 0 30px 30px;
`;

const SubscribeButton = styled(BasicButton)`
  width: 180px;
  color: ${OL.WHITE};
  margin-right: 10px;
  background: ${props => (props.isSubscribed ? OL.RED01 : OL.GREEN02)};
`;

const EditContactButton = styled(BasicButton)`
  width: 180px;
`;

const ColumnRow = styled(PaddedStyledColumnRow)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

type Props = {
  app :Map<*, *>,
  contactInfo :Map<*, *>,
  person :Map<*, *>,
  personId :string,
  selectedOrganizationId :string,
  subscription :Map<*, *>,
  submitting :boolean,
  checkPSAPermissions :boolean,
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
    this.state = {
      selectingFromExistingContacts: false,
      creatingNewContact: false
    };
  }

  refreshPersonNeighborsCallback = () => {
    const { personId } = this.props;
    const { actions } = this.props;
    actions.refreshPSANeighbors({ personId });
  }

  selectFromExistingContacts = () => this.setState({
    selectingFromExistingContacts: true,
    creatingNewContact: false
  });

  createNewContact = () => this.setState({
    selectingFromExistingContacts: false,
    creatingNewContact: true
  });

  createSubscription = () => {
    const { actions, app, person } = this.props;
    const personId = person.get(PROPERTY_TYPES.PERSON_ID, '');
    const values = {
      [PROPERTY_TYPES.SUBSCRIPTION_ID]: randomUUID(),
      [PROPERTY_TYPES.IS_ACTIVE]: true,
      [PROPERTY_TYPES.DAY_INTERVAL]: true,
      [PROPERTY_TYPES.WEEK_INTERVAL]: true,
      [FORM_IDS.PERSON_ID]: personId
    };
    actions.props({
      app,
      config: SubscriptionConfig,
      values
    });
  }

  toggleSubscription = () => {
    const {
      actions,
      app,
      subscription,
      selectedOrganizationId
    } = this.props;
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    const entitySetId = getEntitySetId(app, SUBSCRIPTION, selectedOrganizationId);
    const entityKeyId = subscription.get(OPENLATTICE_ID_FQN, '');
    const values = {
      [PROPERTY_TYPES.IS_ACTIVE]: !isSubscribed
    };
    actions.replaceEntity({
      entitySetId,
      entityKeyId,
      values
    });
  }

  renderSubscribeButton = () => {
    const { subscription } = this.props;
    const isSubscribed = subscription.getIn([PROPERTY_TYPES.IS_ACTIVE, 0], false);
    const subscribeButtonText = isSubscribed ? 'Unsubscribe' : 'Subscribe';
    return (
      <ButtonRow>
        <SubscribeButton
            isSubscribed={isSubscribed}>
          { subscribeButtonText }
        </SubscribeButton>
        <EditContactButton>
          Edit Contact Info
        </EditContactButton>
      </ButtonRow>
    );
  }

  render() {
    const {
      contactInfo,
      open,
      onClose,
      person,
      submitting,
      readOnlyPermissions,
      subscription
    } = this.props;
    const { selectingFromExistingContacts, creatingNewContact } = this.state;

    return (
      <Wrapper>
        <ModalTransition>
          {
            open
            && (
              <Modal
                  scrollBehavior="outside"
                  onClose={() => onClose()}
                  width={MODAL_WIDTH}
                  height={MODAL_HEIGHT}
                  max-height={MODAL_HEIGHT}
                  shouldCloseOnOverlayClick
                  stackIndex={2}>
                <TitleWrapper>
                  <h2>Manage Subscription</h2>
                  <div>
                    <CloseModalX onClick={onClose} />
                  </div>
                </TitleWrapper>
                <ColumnRow>
                  <SubscriptionInfo
                      modal
                      subscription={subscription}
                      person={person} />
                  <ContactText>
                    {'All methods of contact that are marked "preferred" will recieve court notifications.'}
                  </ContactText>
                  <ContactInfoTable
                      contactInfo={contactInfo}
                      editing={selectingFromExistingContacts}
                      hasPermission={readOnlyPermissions}
                      noResults={!contactInfo.size} />
                  { this.renderSubscribeButton() }
                  {
                    selectingFromExistingContacts
                      ? (
                        <div />
                      )
                      : null
                  }
                  {
                    creatingNewContact
                      ? (
                        <div />
                      )
                      : null
                  }
                </ColumnRow>
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
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsModal);
