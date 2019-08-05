/*
 * @flow
 */

import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DatePicker from '../../components/datetime/DatePicker';
import InfoButton from '../../components/buttons/InfoButton';
import StyledRadio from '../../components/controls/StyledRadio';
import RadioButton from '../../components/controls/StyledRadioButton';
import SimpleCards from '../../components/cards/SimpleCards';
import { APPOINTMENT_PATTERN } from '../../utils/consts/AppointmentConsts';
import { toISODate } from '../../utils/FormattingUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getFirstNeighborValue, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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

import { deleteEntity } from '../../utils/data/DataActionFactory';

const { CHECKIN_APPOINTMENTS } = APP_TYPES;

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

type Props = {
  app :Map<*, *>,
  addAppointmentsToSubmission :() => void,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void
  }
}

const INITIAL_STATE = {
  editing: false,
  appointmentEntities: Map(),
  startDate: moment(),
  endDate: moment(),
  frequency: '',
  appointmentType: APPOINTMENT_PATTERN.SINGLE
};

class CheckInsAppointmentForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let { appointmentEntities } = prevState;
    const { existingAppointments } = nextProps;
    if (!appointmentEntities.size && existingAppointments.size) {
      existingAppointments.forEach((appointment) => {
        const details = getNeighborDetailsForEntitySet(appointment);
        const startDate = getFirstNeighborValue(appointment, PROPERTY_TYPES.START_DATE);
        appointmentEntities = appointmentEntities.set(startDate, details);
      });
      return { appointmentEntities };
    }
    return null;
  }

  createCheckInSubmissionValues = (date) => {
    const startDate = date;
    const endDate = toISODate(moment(startDate).add(1, 'd'));
    const appointmentEntity = { [PROPERTY_TYPES.START_DATE]: startDate, [PROPERTY_TYPES.END_DATE]: endDate };
    return fromJS(appointmentEntity);
  }

  getFrequencyConversion = () => {
    const { frequency } = this.state;
    let value;
    const increment = 'weeks';

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

      default:
        break;
    }
    return { value, increment };
  }

  addAppointmentEntities = () => {
    const {
      appointmentType,
      endDate,
      frequency,
      startDate
    } = this.state;
    let { appointmentEntities } = this.state;
    let appointmentDate = startDate;
    const addingRecurringAppointment = (appointmentType === APPOINTMENT_PATTERN.RECURRING);
    if (addingRecurringAppointment && startDate.isValid() && endDate.isValid() && frequency) {
      const end = endDate;
      while (appointmentDate.isBefore(end)) {
        const isoDateTime = toISODate(appointmentDate);
        const { value, increment } = this.getFrequencyConversion();
        const appointmentEntity = this.createCheckInSubmissionValues(isoDateTime);
        if (!appointmentEntities.get(isoDateTime)) {
          appointmentEntities = appointmentEntities.set(isoDateTime, appointmentEntity);
        }
        appointmentDate = moment(appointmentDate).add(value, increment);
      }
    }
    else {
      const isoDateTime = toISODate(appointmentDate);
      const appointmentEntity = this.createCheckInSubmissionValues(isoDateTime);
      if (!appointmentEntities.get(isoDateTime)) {
        appointmentEntities = appointmentEntities.set(isoDateTime, appointmentEntity);
      }
    }
    this.setState({ appointmentEntities });
    this.addNewAndExistingAppointments(appointmentEntities);
  };

  addNewAndExistingAppointments = (appointmentEntities) => {
    const { addAppointmentsToSubmission } = this.props;
    const newCheckInAppointmentEntities = appointmentEntities.valueSeq().filter((appointment) => {
      const appointmentEntityKeyId = getFirstNeighborValue(appointment, PROPERTY_TYPES.ENTITY_KEY_ID);
      return !appointmentEntityKeyId;
    }).toJS();
    addAppointmentsToSubmission({ newCheckInAppointmentEntities });
  }

  removeAppointmentEntity = ({ startDate, entityKeyId }) => {
    const { actions, app } = this.props;
    let { appointmentEntities } = this.state;
    appointmentEntities = appointmentEntities.delete(startDate);
    this.setState({ appointmentEntities });
    this.addNewAndExistingAppointments(appointmentEntities);
    const checkInAppointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    if (entityKeyId) {
      actions.deleteEntity({
        entitySetId: checkInAppointmentEntitySetId,
        entityKeyId
      });
    }
  }

  renderAddAppointmentsButton = () => <InfoButton onClick={this.addAppointmentEntities}>Add Appointments</InfoButton>;

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderAppointmentCards = () => {
    const { appointmentEntities } = this.state;
    const sortedEntities = appointmentEntities.valueSeq().sort((a1, a2) => {
      const a1moment = moment(getFirstNeighborValue(a1, PROPERTY_TYPES.START_DATE));
      const a2moment = moment(getFirstNeighborValue(a2, PROPERTY_TYPES.START_DATE));
      return a1moment.isBefore(a2moment) ? -1 : 1;
    });

    return (
      <SimpleCards
          title="Scheduled Check-ins"
          entities={sortedEntities}
          removeEntity={this.removeAppointmentEntity} />
    );
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
    return (appointmentType === APPOINTMENT_PATTERN.RECURRING)
      ? (
        <OptionsGrid numColumns={3}>
          { this.mapOptionsToRadioButtons(CHECKIN_FREQUENCIES) }
        </OptionsGrid>
      ) : null;
  }

  renderAppointmentTypeOptions = () => {
    const { appointmentType } = this.state;
    return (
      <>
        <StyledRadio
            label={APPOINTMENT_PATTERN.SINGLE}
            name="appointmentType"
            value={APPOINTMENT_PATTERN.SINGLE}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINTMENT_PATTERN.SINGLE} />
        <StyledRadio
            label={APPOINTMENT_PATTERN.RECURRING}
            name="appointmentType"
            value={APPOINTMENT_PATTERN.RECURRING}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINTMENT_PATTERN.RECURRING} />
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
            (appointmentType === APPOINTMENT_PATTERN.SINGLE)
              ? this.renderSingleAppointment()
              : this.renderRecurringAppointment()
          }
          { this.renderAddAppointmentsButton() }
        </FormContainer>
        { this.renderFrequencySection() }
        { this.renderAppointmentCards() }
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

  actions.deleteEntity = deleteEntity;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckInsAppointmentForm);
