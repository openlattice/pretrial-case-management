/*
 * @flow
 */

import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DatePicker from '../../components/datetime/DatePicker';
import StyledInput from '../../components/controls/StyledInput';
import InfoButton from '../../components/buttons/InfoButton';
import StyledRadio from '../../components/controls/StyledRadio';
import RadioButton from '../../components/controls/StyledRadioButton';
import { FORM_IDS } from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { InputGroup } from '../../components/person/PersonFormTags';
import { CHECKIN_FREQUENCIES } from '../../utils/consts/ReleaseConditionConsts';
import { OptionsGrid, SubConditionsWrapper } from '../../components/releaseconditions/ReleaseConditionsStyledTags';
import {
  APP,
  STATE,
  PEOPLE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as PeopleActionFactory from '../people/PeopleActionFactory';


/*
 * styled components
 */

const FormContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
  align-items: flex-end;
  margin-bottom: 30px;
`;

const RadioWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin: 0 3px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
`;

const InputLabel = styled.div`
color: ${OL.GREY02};
font-weight: 600;
text-transform: uppercase;
margin-bottom: 0px;
font-size: 12px;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type Props = {
  app :Map<*, *>,
  personEntityKeyId :string,
  hearingEntityKeyId :string,
  independentSubmission :boolean,
  submitting :boolean,
  actions :{
    refreshPersonNeighbors :(values :{ personId :string }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
  }
}

const APPOINMENT_TYPES = {
  SINGLE: 'single',
  RECURRING: 'recurring'
};

const INITIAL_STATE = {
  editing: false,
  appointmentDates: List(),
  startDate: moment(),
  endDate: null,
  frequency: '',
  appointmentType: APPOINMENT_TYPES.SINGLE
};

class NewHearingSection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  submitCheckInAppointments = () => {

  }

  getFrequencyConversion = () => {
    const { frequency } = this.state;
    let value;
    const increment = 'w';

    switch (frequency) {
      case CHECKIN_FREQUENCIES.ONCE_MONTH:
        value = 4;
        break;

      case CHECKIN_FREQUENCIES.TWICE_MONTH:
        value = 2;
        break;

      case CHECKIN_FREQUENCIES.WEEKLY:
        value = 1;
        break;

      case CHECKIN_FREQUENCIES.AT_LEAST_WEEKLY:
        value = 1;
        break;

      default:
        break;
    }
    return { value, increment };
  }

  addAppointmentDates = () => {
    const {
      appointmentType,
      endDate,
      frequency,
      startDate
    } = this.state;
    let { appointmentDates } = this.state;
    let appointmentDate = startDate;
    const addingRecurringAppointment = (appointmentType === APPOINMENT_TYPES.RECURRING);
    if (addingRecurringAppointment && startDate && endDate && frequency) {
      const end = endDate;
      while (appointmentDate.isBefore(end)) {
        const { value, increment } = this.getFrequencyConversion();
        appointmentDates = appointmentDates.push(appointmentDate.format('MM/DD/YYYY'));
        appointmentDate = moment(appointmentDate).add(value, increment);
      }
    }
    else {
      appointmentDates = appointmentDates.push(appointmentDate.format('MM/DD/YYYY'));
    }
    this.setState({ appointmentDates });
  };

  renderAddAppointmentsButton = () => <InfoButton onClick={this.addAppointmentDates}>Add Appointments</InfoButton>;

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderNewAppointmentCards = () => {

  }

  mapOptionsToRadioButtons = (options :{}) => {
    const { frequency } = this.state;
    return (
      Object.values(options).map(option => (
        <RadioWrapper key={option}>
          <RadioButton
              large
              name="frequency"
              value={option}
              checked={frequency === option}
              onChange={this.handleInputChange}
              label={option} />
        </RadioWrapper>
      ))
    );
  }


  renderFrequencySection = () => {
    const { appointmentType } = this.state;
    return (appointmentType === APPOINMENT_TYPES.RECURRING)
      ? (
        <OptionsGrid numColumns={4}>
          { this.mapOptionsToRadioButtons(CHECKIN_FREQUENCIES) }
        </OptionsGrid>
      ) : null;
  }

  renderAppointmentTypeOptions = () => {
    const { appointmentType } = this.state;
    return (
      <>
        <StyledRadio
            label={APPOINMENT_TYPES.SINGLE}
            name="appointmentType"
            value={APPOINMENT_TYPES.SINGLE}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINMENT_TYPES.SINGLE} />
        <StyledRadio
            label={APPOINMENT_TYPES.RECURRING}
            name="appointmentType"
            value={APPOINMENT_TYPES.RECURRING}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINMENT_TYPES.RECURRING} />
      </>
    );
  }

  onDateChange = ({ start, end }) => {
    if (start) {
      const startDate = moment(start);
      this.setState({ startDate });
    }
    else if (end) {
      const endDate = moment(end);
      this.setState({ endDate });
    }
  }

  renderSingleAppointment = () => {
    const { startDate } = this.state;
    return (
      <>
        <InputGroup>
          <InputLabel>Date</InputLabel>
          <DatePicker
              value={startDate}
              onChange={start => this.onDateChange({ start })} />
        </InputGroup>
        <InputGroup />
      </>
    );
  }

  renderRecurringAppointment = () => {
    const { startDate, endDate } = this.state;
    return (
      <>
        <InputGroup>
          <InputLabel>Start Date</InputLabel>
          <DatePicker
              value={startDate}
              onChange={start => this.onDateChange({ start })} />
        </InputGroup>
        <InputGroup>
          <InputLabel>End Date</InputLabel>
          <DatePicker
              value={endDate}
              onChange={end => this.onDateChange({ end })} />
        </InputGroup>
      </>
    );
  }

  render() {
    const { appointmentType } = this.state;
    return (
      <SubConditionsWrapper>
        <h2>Manage Check-ins</h2>
        <FormContainer>
          { this.renderAppointmentTypeOptions() }
          {
            (appointmentType === APPOINMENT_TYPES.SINGLE)
              ? this.renderSingleAppointment()
              : this.renderRecurringAppointment()
          }
          { this.renderAddAppointmentsButton() }
        </FormContainer>
        { this.renderFrequencySection() }
        <hr />
      </SubConditionsWrapper>
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewHearingSection);
