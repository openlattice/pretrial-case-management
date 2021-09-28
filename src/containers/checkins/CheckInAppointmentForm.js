/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { List, Map, fromJS } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, DatePicker, Radio } from 'lattice-ui-kit';

import SimpleCards from '../../components/cards/SimpleCards';
import { APPOINTMENT_PATTERN } from '../../utils/consts/AppointmentConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getFirstNeighborValue, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { InputGroup } from '../../components/person/PersonFormTags';
import { CHECKIN_FREQUENCIES } from '../../utils/consts/ReleaseConditionConsts';
import { OptionsGrid, SubConditionsWrapper } from '../../components/releaseconditions/ReleaseConditionsStyledTags';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import { deleteEntity } from '../../utils/data/DataActions';

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
  width: 100%;

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
  font-size: 12px;
`;

type Props = {
  actions :{
    deleteEntity :RequestSequence;
  };
  addAppointmentsToSubmission :(newAppointment :{}) => void;
  app :Map;
  existingAppointments :List;
}

type State = {
  editing :boolean;
  appointmentEntities :Map;
  startDate :DateTime;
  endDate :DateTime;
  frequency :string;
  appointmentType :string;
}

const INITIAL_STATE = {
  editing: false,
  appointmentEntities: Map(),
  startDate: DateTime.local(),
  endDate: DateTime.local(),
  frequency: '',
  appointmentType: APPOINTMENT_PATTERN.SINGLE
};

class CheckInsAppointmentForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  static getDerivedStateFromProps(nextProps :Props, prevState :State) {
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

  createCheckInSubmissionValues = (date :string) => {
    const startDate = date;
    const endDate = DateTime.fromISO(startDate).plus({ days: 1 }).toISODate();
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
    if (addingRecurringAppointment && startDate.isValid && endDate.isValid && frequency) {
      const end = endDate;
      while (appointmentDate.valueOf() < end.valueOf()) {
        const isoDate = appointmentDate.toISODate();
        const { value, increment } = this.getFrequencyConversion();
        const appointmentEntity = this.createCheckInSubmissionValues(isoDate);
        if (!appointmentEntities.get(isoDate)) {
          appointmentEntities = appointmentEntities.set(isoDate, appointmentEntity);
        }
        appointmentDate = appointmentDate.plus({ [increment]: value });
      }
    }
    else {
      const isoDate = appointmentDate.toISODate();
      const appointmentEntity = this.createCheckInSubmissionValues(isoDate);
      if (!appointmentEntities.get(isoDate)) {
        appointmentEntities = appointmentEntities.set(isoDate, appointmentEntity);
      }
    }
    this.setState({ appointmentEntities });
    this.addNewAndExistingAppointments(appointmentEntities);
  };

  addNewAndExistingAppointments = (appointmentEntities :Map) => {
    const { addAppointmentsToSubmission } = this.props;
    const newCheckInAppointmentEntities = appointmentEntities.valueSeq().filter((appointment) => {
      const appointmentEntityKeyId = getFirstNeighborValue(appointment, PROPERTY_TYPES.ENTITY_KEY_ID);
      return !appointmentEntityKeyId;
    }).toJS();
    addAppointmentsToSubmission({ newCheckInAppointmentEntities });
  }

  removeAppointmentEntity = ({ startDate, entityKeyId } :Object) => {
    const { actions, app } = this.props;
    let { appointmentEntities } = this.state;
    appointmentEntities = appointmentEntities.delete(startDate);
    this.setState({ appointmentEntities });
    this.addNewAndExistingAppointments(appointmentEntities);
    const checkInAppointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    if (entityKeyId) {
      actions.deleteEntity({
        entitySetId: checkInAppointmentEntitySetId,
        entityKeyIds: [entityKeyId]
      });
    }
  }

  renderAddAppointmentsButton = () => <Button onClick={this.addAppointmentEntities}>Add Appointments</Button>;

  handleInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderAppointmentCards = () => {
    const { appointmentEntities } = this.state;
    const sortedEntities = appointmentEntities.valueSeq().sort((a1, a2) => {
      const a1date = getFirstNeighborValue(a1, PROPERTY_TYPES.START_DATE);
      const a2date = getFirstNeighborValue(a2, PROPERTY_TYPES.START_DATE);
      const a1DateTime = DateTime.fromISO(a1date);
      const a2DateTime = DateTime.fromISO(a2date);
      return a1DateTime.valueOf() < a2DateTime.valueOf() ? -1 : 1;
    });

    return (
      <SimpleCards
          title="Scheduled Check-ins"
          entities={sortedEntities}
          removeEntity={this.removeAppointmentEntity} />
    );
  }

  mapOptionsToRadioButtons = (options :string[]) :Object[] => {
    const { frequency } = this.state;
    return (
      Object.values(options).map((option) => (
        // $FlowFixMe
        <RadioWrapper key={option}>
          <Radio
              checked={frequency === option}
              label={option}
              mode="button"
              name="frequency"
              onChange={this.handleInputChange}
              value={option} />
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
        <Radio
            label={APPOINTMENT_PATTERN.SINGLE}
            name="appointmentType"
            value={APPOINTMENT_PATTERN.SINGLE}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINTMENT_PATTERN.SINGLE} />
        <Radio
            label={APPOINTMENT_PATTERN.RECURRING}
            name="appointmentType"
            value={APPOINTMENT_PATTERN.RECURRING}
            onChange={this.handleInputChange}
            checked={appointmentType === APPOINTMENT_PATTERN.RECURRING} />
      </>
    );
  }

  onDateChange = ({ start, end } :Object) => {
    if (start) {
      const startDate = DateTime.fromISO(start);
      this.setState({ startDate });
    }
    else if (end) {
      const endDate = DateTime.fromISO(end);
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
              onChange={(start) => this.onDateChange({ start })} />
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
              onChange={(start) => this.onDateChange({ start })} />
        </InputGroup>
        <InputGroup>
          <InputLabel>End Date</InputLabel>
          <DatePicker
              value={endDate}
              onChange={(end) => this.onDateChange({ end })} />
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
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    deleteEntity
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CheckInsAppointmentForm);
