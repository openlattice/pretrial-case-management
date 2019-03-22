/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import moment from 'moment';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthUtils } from 'lattice-auth';

import ManualReminderConfig from '../../config/formconfig/ManualReminderConfig';
import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import LogoLoader from '../../components/LogoLoader';
import SelectContactInfoTable from '../../components/contactinformation/SelectContactInfoTable';
import StyledRadio from '../../components/controls/StyledRadio';
import NewContactForm from '../people/NewContactForm';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { FORM_IDS } from '../../utils/consts/Consts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { REMINDER_TYPES } from '../../utils/RemindersUtils';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import {
  APP,
  STATE,
  MANUAL_REMINDERS,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ManualRemindersActionFactory from './ManualRemindersActionFactory';

let { CONTACT_INFORMATION, HEARINGS } = APP_TYPES_FQNS;

CONTACT_INFORMATION = CONTACT_INFORMATION.toString();
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
  margin-bottom: 15px;
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
  app :Map<*, *>,
  loadingManualReminderForm :boolean,
  personId :string,
  person :Map<*, *>,
  peopleNeighborsForManualReminder :Map<*, *>,
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
  selectedHearing: {},
  addingNewContact: false,
  hearingEntityKeyId: '',
  contact: Map(),
  contactMethod: '',
  notified: '',
  notes: '',
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

  getStaffId = () => {
    const staffInfo = AuthUtils.getUserInfo();
    let staffId = staffInfo.id;
    if (staffInfo.email && staffInfo.email.length > 0) {
      staffId = staffInfo.email;
    }
    return staffId;
  }

  isReadyToSubmit = () :boolean => {
    const { contact, contactMethod } = this.state;
    let contactSelected = true;
    if (contactMethod === CONTACT_METHODS.PHONE || contactMethod === CONTACT_METHODS.EMAIL) {
      contactSelected = !!contact.size;
    }
    return contactMethod && contactSelected;
  }

  getSubmissionValues = () => {
    const {
      contact,
      contactMethod,
      notes,
      notified,
      selectedHearing,
    } = this.state;
    const { person } = this.props;
    const { identification } = formatPeopleInfo(person);

    const staffId = this.getStaffId();

    const { hearingId } = selectedHearing;

    const contactInformationId = contact.getIn([PROPERTY_TYPES.GENERAL_ID, 0], null);

    const submissionValues = {
      [PROPERTY_TYPES.DATE_TIME]: [moment().toISOString(true)],

      // Reminder
      [PROPERTY_TYPES.CONTACT_METHOD]: [contactMethod],
      [PROPERTY_TYPES.NOTIFIED]: [notified],
      [PROPERTY_TYPES.REMINDER_ID]: [randomUUID()],
      [PROPERTY_TYPES.REMINDER_NOTES]: [notes],
      [PROPERTY_TYPES.REMINDER_TYPE]: [REMINDER_TYPES.HEARING],

      // Person
      [FORM_IDS.PERSON_ID]: [identification],

      // Hearing
      [FORM_IDS.HEARING_ID]: [hearingId],

      // Hearing
      [FORM_IDS.CONTACT_INFO_ID]: [contactInformationId],

      // staff
      [FORM_IDS.STAFF_ID]: [staffId],
    };
    return submissionValues;
  }

  submitManualReminder = () => {
    const { actions, app } = this.props;
    const { submit } = actions;
    const values = this.getSubmissionValues();
    submit({ app, values, config: ManualReminderConfig });
  }

  renderSubmitButton = () => {
    const { submitting } = this.props;
    return (
      <FlexContainer>
        <InfoButton
            disabled={submitting || !this.isReadyToSubmit()}
            onClick={this.submitManualReminder}>
          Submit
        </InfoButton>
      </FlexContainer>
    );
  }

  handleInputChange = (e) => {
    const { contact } = this.state;
    const { name, value } = e.target;

    if (name === 'notified' && !contact.size && value === 'No') {
      this.setState({ contactMethod: '' });
    }
    this.setState({ [name]: value });
  }

  onContactListRadioChange = contact => this.setState({ contact })

  radioIsDisabled = () => {
    const { submitting, refreshingPersonNeighbors } = this.props;
    const { contact } = this.state;
    return submitting || refreshingPersonNeighbors || contact.size;
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

  addingContactInformation = () => this.setState({ addingNewContact: true });
  notAddingContactInformation = () => this.setState({ addingNewContact: false });

  renderAddContactButton = () => (
    <FlexContainer>
      <BasicButton onClick={this.addingContactInformation}>Add Contact</BasicButton>
    </FlexContainer>
  )

  renderContactForm = () => {
    const { person } = this.props;
    const { identification } = formatPeopleInfo(person);
    const { contact } = this.state;
    const contactDisplay = contact.size
      ? contact
      : (
        <>
          <InputLabel>Add Contact</InputLabel>
          <NewContactForm
              personId={identification}
              editing={!contact}
              submitCallback={this.notAddingContactInformation} />
        </>
      );
    return contactDisplay;
  }

  renderContactTableAndForm = () => {
    const { addingNewContact, contact } = this.state;
    const { peopleNeighborsForManualReminder } = this.props;
    const contacts = peopleNeighborsForManualReminder.get(CONTACT_INFORMATION, List());
    const contactEntityKeyId = getEntityKeyId(contact);
    if (contacts.size) {
      return (
        <>
          <SelectContactInfoTable
              contactInfo={contacts}
              onCheckBoxChange={this.onContactListRadioChange}
              selectedContactEntityKeyId={contactEntityKeyId}
              noResults={!contacts.size} />
          { !addingNewContact ? this.renderAddContactButton() : null }
          { addingNewContact ? this.renderContactForm() : null }
        </>
      );
    }
    return this.renderContactForm();
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
          { (isPhone || isEmail) ? this.renderContactTableAndForm() : null }
        </>
      ) : null;
  }

  selectHearing = (hearing, hearingId, entityKeyId) => {
    this.setState({
      selectedHearing: { hearing, hearingId, entityKeyId },
      hearingEntityKeyId: entityKeyId
    });
  }

  renderHearingSelection = () => {
    const { selectedHearing } = this.state;
    const { peopleNeighborsForManualReminder } = this.props;
    console.log(this.state);
    const hearings = peopleNeighborsForManualReminder.get(HEARINGS, List());

    return (
      <>
        <InputLabel>{`Which of ${this.getSubjectsName()}'s hearings is this reminder for?`}</InputLabel>
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
            name="notes" />
      </FlexContainer>
    </>
  )

  render() {
    const { loadingManualReminderForm } = this.props;
    if (loadingManualReminderForm) return <LogoLoader />
    return (
      <FormWrapper>
        {this.renderHearingSelection()}
        {this.renderContactSection()}
        {this.renderNotesSection()}
        {this.renderSubmitButton()}
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

    [MANUAL_REMINDERS.LOADING_FORM]: manualReminders.get(MANUAL_REMINDERS.LOADING_FORM),
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
