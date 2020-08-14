/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Radio } from 'lattice-ui-kit';

import LogoLoader from '../../components/LogoLoader';
import SelectContactInfoTable from '../../components/contactinformation/SelectContactInfoTable';
import NewContactForm from '../contactinformation/NewContactForm';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { filterContactsByType, getContactInfoFields } from '../../utils/ContactInfoUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { REMINDER_TYPES } from '../../utils/RemindersUtils';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CONTACT_INFO_ACTIONS } from '../../utils/consts/redux/ContactInformationConsts';
import { MANUAL_REMINDERS_DATA } from '../../utils/consts/redux/ManualRemindersConsts';
import {
  getError,
  getReqState,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';

import {
  clearManualRemindersForm,
  LOAD_MANUAL_REMINDERS_FORM,
  SUBMIT_MANUAL_REMINDER,
  submitManualReminder
} from './ManualRemindersActions';

const { CONTACT_INFORMATION, HEARINGS } = APP_TYPES;
const {
  DATE_TIME,
  CONTACT_METHOD,
  NOTIFIED,
  REMINDER_ID,
  NOTES,
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
  font-size: 12px;
`;

const NotesInput = styled.textarea`
  width: 100%;
  min-height: 90px;
  height: max-content;
`;

type Props = {
  actions :{
    clearSubmittedContact :() => void;
    submitManualReminder :RequestSequence;
  };
  loadManualRemindersFormRS :RequestState;
  submitManualReminderRS :RequestState;
  person :Map;
  peopleNeighborsForManualReminder :Map;
  submitContactReqState :RequestState;
  submittedManualReminder :Map;
}

const INITIAL_STATE = {
  addingNewContact: false,
  contact: Map(),
  contactMethod: CONTACT_METHODS.EMAIL,
  editing: false,
  notes: '',
  notified: true,
  selectedHearing: { hearing: Map(), hearingId: '', entityKeyId: '' },
};

type State = {
  addingNewContact :boolean;
  contact :Map;
  contactMethod :string;
  editing :boolean;
  notes :string;
  notified :boolean;
  selectedHearing :Object;
};

class ManualRemindersForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  static getDerivedStateFromProps(nextProps :Props, prevState :State) {
    const { addingNewContact } = prevState;
    const { submitContactReqState } = nextProps;
    const contactInfoSubmissionComplete = requestIsSuccess(submitContactReqState);
    if (contactInfoSubmissionComplete && addingNewContact) {
      return { addingNewContact: false };
    }
    return null;
  }

  isReadyToSubmit = () :boolean => {
    const { contactMethod, notified } = this.state;
    if (notified) return !!contactMethod;
    return true;
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
      [NOTES]: [notes],
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
    const submission = this.getSubmissionValues();
    actions.submitManualReminder(submission);
  }

  renderSubmitButton = () => {
    const { submitManualReminderRS, submittedManualReminder } = this.props;
    const submissionIsPending = requestIsPending(submitManualReminderRS);
    return submittedManualReminder.size
      ? <SuccessBanner>Reminder Has Been Submitted</SuccessBanner>
      : (
        <FlexContainer>
          <Button
              color="secondary"
              disabled={submissionIsPending || !this.isReadyToSubmit()}
              onClick={this.submitManualReminder}>
            Submit
          </Button>
        </FlexContainer>
      );
  }

  handleInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'notified') {
      const wasNotified = value === 'true';
      const stateObject :Object = { [name]: wasNotified };
      if (!wasNotified) {
        stateObject.contactMethod = undefined;
      }
      this.setState(stateObject);
    }
    else this.setState({ [name]: value });
  }

  onContactListRadioChange = (contact :Map) => this.setState({ contact });

  renderContactMethod = () => {
    const { submittedManualReminder } = this.props;
    const { contactMethod, notified } = this.state;
    const isPhone = (contactMethod === CONTACT_METHODS.PHONE);
    const isEmail = (contactMethod === CONTACT_METHODS.EMAIL);
    return notified
      ? (
        <>
          <InputLabel>How were they contacted?</InputLabel>
          <FormContainer>
            <Radio
                disabled={!!submittedManualReminder.size}
                label={CONTACT_METHODS.PHONE}
                name="contactMethod"
                value={CONTACT_METHODS.PHONE}
                onChange={this.handleInputChange}
                checked={isPhone} />
            <Radio
                disabled={!!submittedManualReminder.size}
                label={CONTACT_METHODS.EMAIL}
                name="contactMethod"
                value={CONTACT_METHODS.EMAIL}
                onChange={this.handleInputChange}
                checked={isEmail} />
          </FormContainer>
        </>
      )
      : null;
  }

  addingContactInformation = () => this.setState({ addingNewContact: true });

  renderAddContactButton = () => (
    <FlexContainer>
      <Button onClick={this.addingContactInformation}>Add Contact</Button>
    </FlexContainer>
  )

  renderContactForm = () => {
    const { person } = this.props;
    const { addingNewContact } = this.state;
    const personEKID = getEntityKeyId(person);
    return (
      <>
        <InputLabel>Add Contact</InputLabel>
        <NewContactForm
            personEKID={personEKID}
            editing={!!addingNewContact} />
      </>
    );
  }

  contactInfoInput = () => {
    const { addingNewContact } = this.state;
    return addingNewContact
      ? this.renderContactForm()
      : this.renderAddContactButton();
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
          { submittedManualReminder.size ? this.contactInfoInput() : null }
        </>
      );
    }
    return (
      <>
        { !addingNewContact && !submittedManualReminder.size ? this.renderAddContactButton() : null }
        {
          (addingNewContact && !submittedManualReminder.size)
            ? this.renderContactForm()
            : null
        }
      </>
    );
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
            <Radio
                disabled={!!submittedManualReminder.size}
                label="Yes"
                name="notified"
                value
                onChange={this.handleInputChange}
                checked={notified === true} />
            <Radio
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

  selectHearing = (hearing :Map, hearingId :sting, entityKeyId :string) => {
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
    const { [NOTES]: notes } = getEntityProperties(submittedManualReminder, [NOTES]);
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
    const { loadManualRemindersFormRS, submitManualReminderRS } = this.props;
    if (
      requestIsPending(loadManualRemindersFormRS)
       || requestIsPending(submitManualReminderRS)
    ) return <LogoLoader />;

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
  const contactInfo = state.get(STATE.CONTACT_INFO);
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    submitContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT),

    loadManualRemindersFormRS: getReqState(manualReminders, LOAD_MANUAL_REMINDERS_FORM),
    submitManualReminderRS: getReqState(manualReminders, SUBMIT_MANUAL_REMINDER),
    submitManualReminderFormError: getError(manualReminders, SUBMIT_MANUAL_REMINDER),
    [MANUAL_REMINDERS_DATA.PEOPLE_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS_DATA.PEOPLE_NEIGHBORS),
    [MANUAL_REMINDERS_DATA.SUBMITTED_MANUAL_REMINDER]: manualReminders
      .get(MANUAL_REMINDERS_DATA.SUBMITTED_MANUAL_REMINDER),
    [MANUAL_REMINDERS_DATA.SUBMITTED_MANUAL_REMINDER_NEIGHBORS]: manualReminders
      .get(MANUAL_REMINDERS_DATA.SUBMITTED_MANUAL_REMINDER_NEIGHBORS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    clearManualRemindersForm,
    submitManualReminder
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ManualRemindersForm);
