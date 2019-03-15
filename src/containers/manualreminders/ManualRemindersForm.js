/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StyledRadio from '../../components/controls/StyledRadio';
import NewContactForm from '../people/NewContactForm';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import {
  APP,
  STATE,
  MANUAL_REMINDERS,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ManualRemindersActionFactory from './ManualRemindersActionFactory';

let { HEARINGS } = APP_TYPES_FQNS;

HEARINGS = HEARINGS.toString();

/*
 * styled components
 */

const FormWrapper = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const FormContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: column;
  align-items: flex-end;
  padding: 20px;
  margin-bottom: 30px;
`;

const FlexContainer = styled(FormContainer)`
  padding: 20px 0;
  display: flex;
  justify-content: center;
`;

const InputLabel = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0px;
  font-size: 12px;
`;

const NotesInput = styled.textarea`
  width: 100%;
  min-height: 90px;
  height: max-content;
`;

type Props = {
  personId :string,
  person :Map<*, *>,
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
  selectedHearing: null,
  hearingEntityKeyId: '',
  contact: null,
  contactMethod: '',
  notified: '',
  [PROPERTY_TYPES.REMINDER_NOTES]: '',
};

class NewHearingSection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  refreshPersonNeighborsCallback = () => {
    const { actions, personId } = this.props;
    actions.refreshPersonNeighbors({ personId });
    this.setState(INITIAL_STATE);
  }

  isReadyToSubmit = () :boolean => {
    const { state } = this;
    return (state.contactMethod);
  }

  handleInputChange = (e) => {
    const { contact } = this.state;
    const { name, value } = e.target;

    if (name === 'notified' && !contact && value === 'No') {
      this.setState({ contactMethod: '' });
    }
    this.setState({ [name]: value });
  }

  addPhoneNumberToState = contact => this.setState({ contact })

  radioIsDisabled = () => {
    const { submitting, refreshingPersonNeighbors } = this.props;
    const { contact } = this.state;
    return submitting || refreshingPersonNeighbors || contact;
  }

  renderContactMethod = () => {
    const { contactMethod } = this.state;
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    const isOther = (contactMethod === CONTACT_METHODS.OTHER);
    return (
      <>
        <InputLabel>How were they contacted?</InputLabel>
        <FormContainer>
          <StyledRadio
              disabled={this.radioIsDisabled()}
              label={CONTACT_METHODS.PHONE}
              name="contactMethod"
              value={CONTACT_METHODS.PHONE}
              onChange={this.handleInputChange}
              checked={isPhone} />
          <StyledRadio
              disabled={this.radioIsDisabled()}
              label={CONTACT_METHODS.EMAIL}
              name="contactMethod"
              value={CONTACT_METHODS.EMAIL}
              onChange={this.handleInputChange}
              checked={isEmail} />
          <StyledRadio
              disabled={this.radioIsDisabled()}
              label={CONTACT_METHODS.OTHER}
              name="contactMethod"
              value={CONTACT_METHODS.OTHER}
              onChange={this.handleInputChange}
              checked={isOther} />
        </FormContainer>
      </>
    );
  }

  renderContactForm = () => {
    const { person } = this.props;
    const { identification } = formatPeopleInfo(person);
    const { contact } = this.state;
    const contactDisplay = contact
      || (
        <>
          <InputLabel>Add Contact</InputLabel>
          <NewContactForm
              personId={identification}
              editing={!contact}
              addPhoneToParentState={this.addPhoneNumberToState} />
        </>
      );
    return contactDisplay;
  }

  getSubjectsName = () => {
    const { person } = this.props;
    const { firstName, lastName } = formatPeopleInfo(person);
    return `${firstName} ${lastName}`;
  }

  renderContactSection = () => {
    const { contactMethod, hearingEntityKeyId, notified } = this.state;

    const wasNotified = notified === 'Yes';
    const wasNotNotified = notified === 'No';
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    return hearingEntityKeyId
      ? (
        <>
          <InputLabel>{`Was ${this.getSubjectsName()} succesfully contacted?`}</InputLabel>
          <FormContainer>
            <StyledRadio
                disabled={this.radioIsDisabled()}
                label="Yes"
                name="notified"
                value="Yes"
                onChange={this.handleInputChange}
                checked={wasNotified} />
            <StyledRadio
                disabled={this.radioIsDisabled()}
                label="No"
                name="notified"
                value="No"
                onChange={this.handleInputChange}
                checked={wasNotNotified} />
          </FormContainer>
          { wasNotified ? this.renderContactMethod() : null }
          { (isPhone || isEmail) ? this.renderContactForm() : null }
        </>
      ) : null;
  }

  selectHearing = (hearing, hearingId, entityKeyId) => {
    this.setState({
      selectedHearing: { hearing, hearingId, entityKeyId },
      hearingEntityKeyId: entityKeyId
    })
  }

  renderHearingSelection = () => {
    const { selectedHearing } = this.state;
    const { peopleNeighborsForManualReminder } = this.props;
    console.log(this.state);
    const hearings = peopleNeighborsForManualReminder.get(HEARINGS, List());

    return (
      <>
        <InputLabel>{`Which of ${this.getSubjectsName()}'s hearings are you reimind them of?`}</InputLabel>
        <FlexContainer>
          <HearingCardsHolder
              columns={1}
              hearings={hearings}
              handleSelect={this.selectHearing}
              noHearingsMessage="No Scheduled Hearings"
              selectedHearing={selectedHearing} />
        </FlexContainer>
      </>
    );
  }

  renderNotesSection = () => (
    <>
      <InputLabel>Notes</InputLabel>
      <FlexContainer>
        <NotesInput
            onChange={this.handleInputChange}
            name={PROPERTY_TYPES.REMINDER_NOTES} />
      </FlexContainer>
    </>
  )

  render() {
    return (
      <FormWrapper>
        {this.renderHearingSelection()}
        {this.renderContactSection()}
        {this.renderNotesSection()}
      </FormWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const submit = state.get(STATE.SUBMIT);
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    [MANUAL_REMINDERS.LOADING_MODAL]: manualReminders.get(MANUAL_REMINDERS.LOADING_MODAL),
    [MANUAL_REMINDERS.PEOPLE_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS.PEOPLE_NEIGHBORS),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(ManualRemindersActionFactory).forEach((action :string) => {
    actions[action] = ManualRemindersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewHearingSection);
