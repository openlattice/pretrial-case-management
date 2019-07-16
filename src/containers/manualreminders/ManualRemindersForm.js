/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { DateTime } from 'luxon';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import LogoLoader from '../../components/LogoLoader';
import SelectContactInfoTable from '../../components/contactinformation/SelectContactInfoTable';
import StyledRadio from '../../components/controls/StyledRadio';
import NewContactForm from '../people/NewContactForm';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { filterContactsByType, getContactInfoFields } from '../../utils/ContactInfoUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { REMINDER_TYPES } from '../../utils/RemindersUtils';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';
import {
  APP,
  STATE,
  MANUAL_REMINDERS
} from '../../utils/consts/FrontEndStateConsts';

import * as ManualRemindersActionFactory from './ManualRemindersActionFactory';
import * as RemindersActionFactory from '../reminders/RemindersActionFactory';

const { CONTACT_INFORMATION, HEARINGS } = APP_TYPES;
const {
  DATE_TIME,
  CONTACT_METHOD,
  NOTIFIED,
  REMINDER_ID,
  REMINDER_NOTES,
  TYPE
} = PROPERTY_TYPES;


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

const SuccessBanner = styled(FormContainer)`
  background: ${OL.GREEN01};
  color: ${OL.WHITE};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
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
  loadingManualReminderForm :boolean,
  personId :string,
  person :Map<*, *>,
  peopleNeighborsForManualReminder :Map<*, *>,
  submittedManualReminder :Map<*, *>,
  submittingManualReminder :boolean,
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
  selectedHearing: { hearing: Map(), hearingId: '', entityKeyId: '' },
  addingNewContact: false,
  contact: Map(),
  contactMethod: CONTACT_METHODS.EMAIL,
  notified: true,
  notes: '',
  editing: false
};

class ManualRemindersForm extends React.Component<Props, State> {

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
    const { contactMethod } = this.state;
    return !!contactMethod;
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
    const { hearing } = selectedHearing;

    const contactInformationEKID = getEntityKeyId(contact);
    const hearingEKID = getEntityKeyId(hearing);
    const personEKID = getEntityKeyId(person);

    const manualReminderEntity = {
      [DATE_TIME]: [DateTime.local().toISO()],
      [CONTACT_METHOD]: [contactMethod],
      [NOTIFIED]: [notified],
      [REMINDER_ID]: [randomUUID()],
      [REMINDER_NOTES]: [notes],
      [TYPE]: [REMINDER_TYPES.HEARING]
    };
    return {
      contactInformationEKID,
      hearingEKID,
      manualReminderEntity,
      personEKID
    };
  }

  submitManualReminder = () => {
    const { actions } = this.props;
    const { submitManualReminder } = actions;
    const submission = this.getSubmissionValues();
    submitManualReminder(submission);
  }

  renderSubmitButton = () => {
    const { submittingManualReminder, submittedManualReminder } = this.props;
    return submittedManualReminder.size
      ? <SuccessBanner>Reminder Has Been Submitted</SuccessBanner>
      : (
        <FlexContainer>
          <InfoButton
              disabled={submittingManualReminder || !this.isReadyToSubmit()}
              onClick={this.submitManualReminder}>
            Submit
          </InfoButton>
        </FlexContainer>
      );
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'notified') this.setState({ [name]: value === 'true' });
    else this.setState({ [name]: value });
  }

  onContactListRadioChange = contact => this.setState({ contact });

  renderContactMethod = () => {
    const { submittedManualReminder } = this.props;
    const { contactMethod } = this.state;
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    return (
      <>
        <InputLabel>How were they contacted?</InputLabel>
        <FormContainer>
          <StyledRadio
              disabled={!!submittedManualReminder.size}
              label={CONTACT_METHODS.PHONE}
              name="contactMethod"
              value={CONTACT_METHODS.PHONE}
              onChange={this.handleInputChange}
              checked={isPhone} />
          <StyledRadio
              disabled={!!submittedManualReminder.size}
              label={CONTACT_METHODS.EMAIL}
              name="contactMethod"
              value={CONTACT_METHODS.EMAIL}
              onChange={this.handleInputChange}
              checked={isEmail} />
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
    const { personId } = formatPeopleInfo(person);
    const { addingNewContact } = this.state;
    return (
      <>
        <InputLabel>Add Contact</InputLabel>
        <NewContactForm
            personId={personId}
            editing={!!addingNewContact}
            submitCallback={this.notAddingContactInformation} />
      </>
    );
  }

  renderContactTableAndForm = () => {
    const { addingNewContact, contact, contactMethod } = this.state;
    const { peopleNeighborsForManualReminder, submittedManualReminder } = this.props;
    const { contactEntityKeyId } = getContactInfoFields(contact);
    let contacts = filterContactsByType(
      peopleNeighborsForManualReminder.get(CONTACT_INFORMATION, List()),
      contactMethod
    );
    if (submittedManualReminder.size) {
      contacts = contacts.filter((contactObj) => {
        const entityKeyId = getEntityKeyId(contactObj);
        return entityKeyId === contactEntityKeyId;
      });
    }
    if (contacts.size) {
      return (
        <>
          <SelectContactInfoTable
              contactInfo={contacts}
              onCheckBoxChange={this.onContactListRadioChange}
              selectedContactEntityKeyId={contactEntityKeyId}
              noResults={!contacts.size} />
          { !addingNewContact && !submittedManualReminder.size ? this.renderAddContactButton() : null }
          {
            (contactMethod === CONTACT_METHODS.PHONE && addingNewContact && !submittedManualReminder.size)
              ? this.renderContactForm()
              : null
          }
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
    const { submittedManualReminder } = this.props;
    const { contactMethod, selectedHearing, notified } = this.state;

    const { hearing } = selectedHearing;
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    return hearing.size
      ? (
        <>
          <InputLabel>{`Was ${this.getSubjectsName()} succesfully contacted?`}</InputLabel>
          <FormContainer>
            <StyledRadio
                disabled={!!submittedManualReminder.size}
                label="Yes"
                name="notified"
                value
                onChange={this.handleInputChange}
                checked={notified === true} />
            <StyledRadio
                disabled={!!submittedManualReminder.size}
                label="No"
                name="notified"
                value={false}
                onChange={this.handleInputChange}
                checked={notified === false} />
          </FormContainer>
          { this.renderContactMethod() }
          { (isPhone || isEmail) ? this.renderContactTableAndForm() : null }
        </>
      ) : null;
  }

  selectHearing = (hearing, hearingId, entityKeyId) => {
    this.setState({
      selectedHearing: { hearing, hearingId, entityKeyId }
    });
  }

  renderHearingSelection = () => {
    const { selectedHearing } = this.state;
    const { peopleNeighborsForManualReminder } = this.props;
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

  renderNotesSection = () => {
    const { submittedManualReminder } = this.props;
    const { [REMINDER_NOTES]: notes } = getEntityProperties(submittedManualReminder, [REMINDER_NOTES]);
    return (
      <>
        <InputLabel>Notes</InputLabel>
        <FlexContainer>
          {
            submittedManualReminder.size
              ? notes
              : (
                <NotesInput
                    disabled={submittedManualReminder.size}
                    onChange={this.handleInputChange}
                    name="notes" />
              )
          }
        </FlexContainer>
      </>
    );
  }

  render() {
    const { loadingManualReminderForm, submittingManualReminder } = this.props;
    if (loadingManualReminderForm || submittingManualReminder) return <LogoLoader />;
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
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    [MANUAL_REMINDERS.LOADING_FORM]: manualReminders.get(MANUAL_REMINDERS.LOADING_FORM),
    [MANUAL_REMINDERS.PEOPLE_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS.PEOPLE_NEIGHBORS),
    [MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER]: manualReminders.get(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER),
    [MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER_NEIGHBORS]: manualReminders
      .get(MANUAL_REMINDERS.SUBMITTED_MANUAL_REMINDER_NEIGHBORS),
    [MANUAL_REMINDERS.SUBMITTING_MANUAL_REMINDER]: manualReminders.get(MANUAL_REMINDERS.SUBMITTING_MANUAL_REMINDER),
    [MANUAL_REMINDERS.SUBMISSION_ERROR]: manualReminders.get(MANUAL_REMINDERS.SUBMISSION_ERROR),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ManualRemindersActionFactory).forEach((action :string) => {
    actions[action] = ManualRemindersActionFactory[action];
  });

  Object.keys(RemindersActionFactory).forEach((action :string) => {
    actions[action] = RemindersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManualRemindersForm);
