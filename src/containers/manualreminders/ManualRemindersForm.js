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
import { filterContactsByType, getContactInfoFields } from '../../utils/ContactInfoUtils';
import { getEntityKeyId, getFirstNeighborValue } from '../../utils/DataUtils';
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
  app :Map<*, *>,
  loadingManualReminderForm :boolean,
  personId :string,
  person :Map<*, *>,
  peopleNeighborsForManualReminder :Map<*, *>,
  submitting :boolean,
  submitted :boolean,
  submitCallback :() => void,
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
  contactMethod: '',
  notified: null,
  notes: '',
  editing: false
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
    const { personId } = formatPeopleInfo(person);
    const { hearing } = selectedHearing;

    const staffId = this.getStaffId();

    const hearingId = getFirstNeighborValue(hearing, PROPERTY_TYPES.CASE_ID, null);

    const contactInformationId = getFirstNeighborValue(contact, PROPERTY_TYPES.GENERAL_ID, null);

    const submissionValues = {
      [PROPERTY_TYPES.DATE_TIME]: [moment().toISOString(true)],

      // Reminder
      [PROPERTY_TYPES.CONTACT_METHOD]: [contactMethod],
      [PROPERTY_TYPES.NOTIFIED]: [notified],
      [PROPERTY_TYPES.REMINDER_ID]: [randomUUID()],
      [PROPERTY_TYPES.REMINDER_NOTES]: [notes],
      [PROPERTY_TYPES.REMINDER_TYPE]: [REMINDER_TYPES.HEARING],

      // Person
      [FORM_IDS.PERSON_ID]: [personId],

      // Hearing
      [FORM_IDS.HEARING_ID]: [hearingId],

      // Hearing
      [FORM_IDS.CONTACT_INFO_ID]: [contactInformationId],

      // staff
      [FORM_IDS.STAFF_ID]: [staffId],
    };
    return submissionValues;
  }

  submitCallback = () => {
    const { submitCallback } = this.props;
    if (submitCallback) submitCallback();
  }

  submitManualReminder = () => {
    const { actions, app } = this.props;
    const { submit } = actions;
    const values = this.getSubmissionValues();
    submit({
      app,
      values,
      config: ManualReminderConfig,
      callback: this.submitCallBack
    });
  }

  renderSubmitButton = () => {
    const { submitting, submitted } = this.props;
    return submitted
      ? <SuccessBanner>Reminder Has Been Submitted</SuccessBanner>
      : (
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
    const { name, value } = e.target;

    if (name === 'notified') this.setState({ [name]: value === 'true' });
    else this.setState({ [name]: value });
  }

  onContactListRadioChange = contact => this.setState({ contact });

  renderContactMethod = () => {
    const { submitted } = this.props;
    const { contactMethod } = this.state;
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    return (
      <>
        <InputLabel>How were they contacted?</InputLabel>
        <FormContainer>
          <StyledRadio
              disabled={submitted}
              label={CONTACT_METHODS.PHONE}
              name="contactMethod"
              value={CONTACT_METHODS.PHONE}
              onChange={this.handleInputChange}
              checked={isPhone} />
          <StyledRadio
              disabled={submitted}
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
    const { peopleNeighborsForManualReminder, submitted } = this.props;
    const { contactEntityKeyId } = getContactInfoFields(contact);
    let contacts = filterContactsByType(
      peopleNeighborsForManualReminder.get(CONTACT_INFORMATION, List()),
      contactMethod
    );
    if (submitted) {
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
          { !addingNewContact && !submitted ? this.renderAddContactButton() : null }
          { addingNewContact && !submitted ? this.renderContactForm() : null }
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
    const { submitted } = this.props;
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
                disabled={submitted}
                label="Yes"
                name="notified"
                value
                onChange={this.handleInputChange}
                checked={notified === true} />
            <StyledRadio
                disabled={submitted}
                label="No"
                name="notified"
                value={false}
                onChange={this.handleInputChange}
                checked={notified === false} />
          </FormContainer>
          { notified ? this.renderContactMethod() : null }
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
    const { submitted } = this.props;
    const { notes } = this.state;
    return (
      <>
        <InputLabel>Notes</InputLabel>
        <FlexContainer>
          {
            submitted
              ? notes
              : (
                <NotesInput
                    disabled={submitted}
                    onChange={this.handleInputChange}
                    name="notes" />
              )
          }
        </FlexContainer>
      </>
    );
  }

  render() {
    const { loadingManualReminderForm, submitting } = this.props;
    if (loadingManualReminderForm || submitting) return <LogoLoader />;
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

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING),
    [SUBMIT.SUBMITTED]: submit.get(SUBMIT.SUBMITTED)
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
