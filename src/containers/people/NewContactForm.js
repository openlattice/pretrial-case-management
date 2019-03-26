/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import addPersonContactInfoConfig from '../../config/formconfig/PersonAddContactInfoConfig';
import StyledInput from '../../components/controls/StyledInput';
import InfoButton from '../../components/buttons/InfoButton';
import CheckboxButton from '../../components/controls/StyledCheckboxButton';
import { FORM_IDS } from '../../utils/consts/Consts';
import { phoneIsValid, emailIsValid, formatPhoneNumber } from '../../utils/ContactInfoUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { InputGroup } from '../../components/person/PersonFormTags';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import {
  APP,
  STATE,
  PEOPLE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as PeopleActionFactory from './PeopleActionFactory';


/*
 * styled components
 */

const FormContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 40% 18% 18% 18% 10%;
  align-items: flex-end;
  padding: 20px 30px;
  justify-content: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  margin-bottom: 30px;
`;

const StyledInputWithErrors = styled(StyledInput)`
  border: ${props => (props.invalid ? `1px solid ${OL.RED01}` : 'auto')};
  margin-bottom: 5px;
`;

const InputLabel = styled.div`
color: ${OL.GREY02};
font-weight: 600;
text-transform: uppercase;
margin-bottom: 0px;
font-size: 12px;
`;

const InputLabelWithWarning = styled(InputLabel)`
  color: ${props => (props.invalid ? OL.RED01 : OL.GREY02)};
`;

const TypeDisplay = styled.div`
  padding: 9px 22px;
  width: 100%;
  height: 38px;
  border-radius: 3px;
  background-color: ${OL.GREY10};
  font-size: 14px;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  margin-bottom: 5px;
`;

const AddContactButton = styled(InfoButton)`
  height: 38px;
  width: 80%;
  margin-bottom: 5px;
`;

type Props = {
  app :Map<*, *>,
  personId :string,
  refreshingPersonNeighbors :boolean,
  submitting :boolean,
  actions :{
    refreshPersonNeighbors :(values :{ personId :string }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    updateContactInfo :(values :{
      entities :Map<*, *>,
      personId :string,
      callback :() => void
    }) => void,
  }
}

const INITIAL_STATE = {
  addingNewContact: false,
  contact: '',
  contactMethod: '',
  [PROPERTY_TYPES.EMAIL]: '',
  [PROPERTY_TYPES.PHONE]: '',
  [PROPERTY_TYPES.IS_MOBILE]: undefined,
  [PROPERTY_TYPES.IS_PREFERRED]: false
};

class NewHearingSection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.editing !== prevState.addingNewContact) {
      return { addingNewContact: nextProps.editing };
    }
    if (!nextProps.editing) {
      return INITIAL_STATE;
    }
    return null;
  }

  submitCallback = () => {
    const { submitCallback } = this.state;
    if (submitCallback) submitCallback();
    this.refreshPersonNeighborsCallback();
  }

  createNewContact = () => {
    const { state } = this;
    const {
      actions,
      app,
      personId
    } = this.props;
    const { submit } = actions;

    const email = state[PROPERTY_TYPES.EMAIL];
    const phone = state[PROPERTY_TYPES.PHONE];
    const isMobile = state[PROPERTY_TYPES.IS_MOBILE];
    const isPreferred = state[PROPERTY_TYPES.IS_PREFERRED];

    let newContactFields;
    if (phone) {
      newContactFields = {
        [PROPERTY_TYPES.PHONE]: [phone],
        [PROPERTY_TYPES.GENERAL_ID]: [phone],
        [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: [phone],
        [PROPERTY_TYPES.IS_MOBILE]: [isMobile],
        [PROPERTY_TYPES.IS_PREFERRED]: [isPreferred]
      };
    }
    else if (email) {
      newContactFields = {
        [PROPERTY_TYPES.EMAIL]: [email],
        [PROPERTY_TYPES.GENERAL_ID]: [email],
        [PROPERTY_TYPES.CONTACT_INFO_GIVEN_ID]: [email],
        [PROPERTY_TYPES.IS_PREFERRED]: [isPreferred]
      };
    }

    if (newContactFields && (email.length || phone.length)) {
      newContactFields = Object.assign({}, newContactFields, {
        [FORM_IDS.PERSON_ID]: personId
      });
      const callback = this.submitCallback;
      submit({
        app,
        config: addPersonContactInfoConfig,
        values: newContactFields,
        callback
      });
    }
  }

  refreshPersonNeighborsCallback = () => {
    const { actions, personId } = this.props;
    actions.refreshPersonNeighbors({ personId });
    this.setState(INITIAL_STATE);
  }

  renderAddContactButton = () => {
    const { submitting } = this.props;
    return (
      <AddContactButton
          disabled={submitting || !this.isReadyToSubmit()}
          onClick={this.createNewContact}>
        Add
      </AddContactButton>
    );
  }

  updateContact = (e) => {
    const { name, value } = e.target;
    if (emailIsValid(value)) {
      this.setState({
        [PROPERTY_TYPES.EMAIL]: value,
        [PROPERTY_TYPES.PHONE]: '',
        contactMethod: CONTACT_METHODS.EMAIL
      });
    }
    else if (phoneIsValid(value)) {
      this.setState({
        [PROPERTY_TYPES.EMAIL]: '',
        [PROPERTY_TYPES.PHONE]: formatPhoneNumber(value),
        contactMethod: CONTACT_METHODS.PHONE
      });
    }
    this.setState({ [name]: value });
  }

  updateCheckbox = (e) => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  }

  isReadyToSubmit = () :boolean => {
    const { state } = this;
    return (state[PROPERTY_TYPES.EMAIL] || state[PROPERTY_TYPES.PHONE]);
  }

  contactIsValid = () => {
    const { state } = this;
    const { contact } = state;
    const phone = state[PROPERTY_TYPES.PHONE];
    const email = state[PROPERTY_TYPES.EMAIL];
    return (contact === '') || phone || email;
  }

  renderContact = () => {
    const { submitting, refreshingPersonNeighbors } = this.props;
    const { contact } = this.state;
    return (
      <StyledInputWithErrors
          disabled={submitting || refreshingPersonNeighbors}
          invalid={!this.contactIsValid()}
          name="contact"
          value={contact}
          onChange={this.updateContact} />
    );
  }

  isMobile = () => {
    const { submitting, refreshingPersonNeighbors } = this.props;
    const { state } = this;
    const { contactMethod } = this.state;
    const isMobile = state[PROPERTY_TYPES.IS_MOBILE];
    return (contactMethod === CONTACT_METHODS.PHONE)
      ? (
        <InputGroup>
          <InputLabel>Mobile</InputLabel>
          <CheckboxButton
              disabled={submitting || refreshingPersonNeighbors}
              name={PROPERTY_TYPES.IS_MOBILE}
              onChange={this.updateCheckbox}
              value={isMobile}
              checked={isMobile}
              label={isMobile ? 'Yes' : 'No'} />
        </InputGroup>
      )
      : (
        <InputGroup>
          <InputLabel>Mobile</InputLabel>
          <CheckboxButton
              onChange={() => null}
              readOnly
              value="NA"
              label="NA" />
        </InputGroup>
      );
  }

  isPreferred = () => {
    const { submitting, refreshingPersonNeighbors } = this.props;
    const { state } = this;
    const isPreferred = state[PROPERTY_TYPES.IS_PREFERRED];
    const { contactMethod } = state;
    const isEmail = contactMethod === CONTACT_METHODS.EMAIL;
    return (
      <InputGroup>
        <InputLabel>Preferred</InputLabel>
        <CheckboxButton
            disabled={submitting || refreshingPersonNeighbors || isEmail}
            name={PROPERTY_TYPES.IS_PREFERRED}
            onChange={this.updateCheckbox}
            value={isPreferred}
            checked={isPreferred}
            label={isPreferred ? 'Yes' : 'No'} />
      </InputGroup>
    );
  }

  render() {
    const { contactMethod } = this.state;
    return (
      <FormContainer>
        <InputGroup>
          <InputLabelWithWarning invalid={!this.contactIsValid()}>Contact</InputLabelWithWarning>
          {this.renderContact()}
        </InputGroup>
        <InputGroup>
          <InputLabel>Type</InputLabel>
          <TypeDisplay>{contactMethod}</TypeDisplay>
        </InputGroup>
        {this.isMobile()}
        {this.isPreferred()}
        {this.renderAddContactButton()}
      </FormContainer>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const submit = state.get(STATE.SUBMIT);
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: people.get(PEOPLE.REFRESHING_PERSON_NEIGHBORS),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewHearingSection);
