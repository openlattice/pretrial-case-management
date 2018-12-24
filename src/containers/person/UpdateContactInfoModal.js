/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { Map } from 'immutable';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PersonContactInfo from '../../components/person/PersonContactInfo';
import InfoButton from '../../components/buttons/InfoButton';
import addPersonContactInfoConfig from '../../config/formconfig/PersonAddContactInfoConfig';
import { getEntityKeyId } from '../../utils/DataUtils';
import { phoneIsValid, emailIsValid } from '../../utils/PeopleUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FORM_IDS } from '../../utils/consts/Consts';
import {
  STATE,
  PEOPLE,
  SUBMIT,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';
import {
  Wrapper,
  TitleWrapper,
  CloseModalX
} from '../../utils/Layout';

import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';
import * as PeopleActionFactory from '../people/PeopleActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  margin: 20px 30px;
  padding-left: 0;
  padding-right: 0;
`;
const Body = styled.div`
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  margin: 0 -15px;
  width: calc(100% + 30px);
`;

type Props = {
  app :Map<*, *>,
  contactEntity :Map<*, *>,
  email :string,
  isCreatingPerson :boolean,
  isMobile :boolean,
  open :boolean,
  onClose :() => void,
  personId :string,
  phone :string,
  updatingExisting :boolean,
  actions :{
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPersonNeighbors :(value :{
      personId :string
    }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
  },
}

class NewHearingSection extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      [PROPERTY_TYPES.EMAIL]: '',
      [PROPERTY_TYPES.PHONE]: '',
      [PROPERTY_TYPES.IS_MOBILE]: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { phone, email, isMobile } = this.props;
    const areDifferent = phone !== nextProps.phone
      || email !== nextProps.email
      || isMobile !== nextProps.isMobile;
    if (areDifferent) {
      this.updateState(nextProps.phone, nextProps.email, nextProps.isMobile);
    }
  }

  updateState = (phone, email, isMobile) => {
    this.setState({
      [PROPERTY_TYPES.EMAIL]: email,
      [PROPERTY_TYPES.PHONE]: phone,
      [PROPERTY_TYPES.IS_MOBILE]: isMobile
    });
  }

  refreshPersonNeighborsCallBack = () => {
    const { actions, personId } = this.props;
    actions.refreshPersonNeighbors({ personId });
  }

  updateContact = () => {
    const { state } = this;
    const {
      actions,
      app,
      contactEntity,
      onClose,
      updatingExisting,
      personId
    } = this.props;
    const { replaceEntity, submit } = actions;
    const entityKeyId = getEntityKeyId(contactEntity.get(PSA_NEIGHBOR.DETAILS, Map()));
    const email = state[PROPERTY_TYPES.EMAIL];
    const phone = state[PROPERTY_TYPES.PHONE];
    const isMobile = state[PROPERTY_TYPES.IS_MOBILE];
    let newContactFields = {
      [PROPERTY_TYPES.EMAIL]: [email],
      [PROPERTY_TYPES.PHONE]: [phone],
      [PROPERTY_TYPES.IS_MOBILE]: [isMobile]
    };

    if (updatingExisting) {
      replaceEntity({
        entityKeyId,
        entitySetName: ENTITY_SETS.CONTACT_INFORMATION,
        values: newContactFields,
        callback: this.refreshPersonNeighborsCallBack
      });
    }
    else {
      newContactFields = Object.assign({}, newContactFields, {
        [PROPERTY_TYPES.GENERAL_ID]: randomUUID(),
        [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: randomUUID(),
        [FORM_IDS.PERSON_ID]: personId
      });
      submit({
        app,
        config: addPersonContactInfoConfig,
        values: newContactFields,
        callback: this.refreshPersonNeighborsCallBack
      });
    }
    onClose();
  }


  phoneNumValid = () => {
    const { state } = this;
    const phone = state[PROPERTY_TYPES.PHONE];
    return phoneIsValid(phone);
  }

  emailAddValid = () => {
    const { state } = this;
    const email = state[PROPERTY_TYPES.EMAIL];
    return emailIsValid(email);
  }

  isReadyToSubmit = () :boolean => {
    const { isCreatingPerson } = this.props;
    const phoneFormatIsCorrect = this.phoneNumValid();
    const emailFormatIsCorrect = this.emailAddValid();
    return !isCreatingPerson && phoneFormatIsCorrect && emailFormatIsCorrect;
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleCheckboxChange = (e) => {
    this.setState({
      [PROPERTY_TYPES.IS_MOBILE]: e.target.checked
    });
  }

  renderSubmitButton = () => (
    <CreateButton disabled={!this.isReadyToSubmit()} onClick={this.updateContact}>
      Submit
    </CreateButton>
  );

  render() {
    const { open, onClose } = this.props;
    const { state } = this;
    return (
      <Wrapper>
        <Modal
            show={open}
            onHide={onClose}
            dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
          <Modal.Body>
            <TitleWrapper>
              <h1>Edit Contact Information</h1>
              <div>
                <CloseModalX onClick={onClose} />
              </div>
            </TitleWrapper>
            <Body>
              <PersonContactInfo
                  phone={state[PROPERTY_TYPES.PHONE]}
                  phoneIsValid={this.phoneNumValid()}
                  email={state[PROPERTY_TYPES.EMAIL]}
                  emailIsValid={this.emailAddValid()}
                  isMobile={state[PROPERTY_TYPES.IS_MOBILE]}
                  handleOnChangeInput={this.onInputChange}
                  handleCheckboxChange={this.handleCheckboxChange}
                  modal />
              { this.renderSubmitButton() }
            </Body>
          </Modal.Body>
        </Modal>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  const submit = state.get(STATE.SUBMIT);

  return {
    app,
    [PEOPLE.FETCHING_PERSON_DATA]: people.get(PEOPLE.FETCHING_PERSON_DATA),
    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
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

export default connect(mapStateToProps, mapDispatchToProps)(NewHearingSection);
