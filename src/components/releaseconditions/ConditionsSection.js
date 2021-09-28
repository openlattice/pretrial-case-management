/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { List, Map } from 'immutable';
import { Input } from 'lattice-ui-kit';

import CheckInAppointmentForm from '../../containers/checkins/CheckInAppointmentForm';
import SimpleCards from '../cards/SimpleCards';
import { RowWrapper, OptionsGrid, SubConditionsWrapper } from './ReleaseConditionsStyledTags';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import { getFirstNeighborValue } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

const { START_DATE } = PROPERTY_TYPES;

const { CONDITIONS, OTHER_CONDITION_TEXT } = RELEASE_CONDITIONS;

const ConditionsOptionsGrid = styled(OptionsGrid)`
  div:nth-child(9) {
    grid-column-start: 1;
    grid-column-end: 3;
  }

  div:nth-child(10) {
    grid-column-start: 3;
    grid-column-end: 5;
  }
`;

type Props = {
  parentState :Object,
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  mapOptionsToCheckboxButtons :(options :{}, field :string) => void,
  handleInputChange :(event :Object) => void,
  addAppointmentsToSubmission :(event :Object) => void,
  appointmentEntities :List<*>,
  renderNoContactPeople :() => void,
  conditions :Object,
  otherCondition :String,
  disabled :boolean,
};

class ConditionsSection extends React.Component<Props> {

  renderSimpleCheckInSection = () => {
    const { parentState, mapOptionsToRadioButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>Check-in frequency</h2>
        <OptionsGrid numColumns={3}>
          {mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency', parentState)}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  };

  render247Project = () => {
    const { parentState, mapOptionsToCheckboxButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>24/7 Requirements</h2>
        <h3>Must sign 24/7 Project agreement and comply with all terms and conditions.</h3>
        <OptionsGrid numColumns={3}>
          {mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types', parentState)}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  }

  renderDisabledAppointmentsDisplay = () => {
    const { appointmentEntities } = this.props;
    let appointmentsByDate = Map();
    const sortedEntities = appointmentEntities.sort((a1, a2) => {
      const a1StartDate = getFirstNeighborValue(a1, START_DATE);
      const a2StartDate = getFirstNeighborValue(a2, START_DATE);
      const a1DT = DateTime.fromISO(a1StartDate);
      const a2DT = DateTime.fromISO(a2StartDate);
      return a1DT < a2DT ? -1 : 1;
    });
    sortedEntities.forEach((appointment) => {
      const startDate = getFirstNeighborValue(appointment, START_DATE);
      appointmentsByDate = appointmentsByDate.set(startDate, appointment);
    });
    return (
      <SimpleCards
          title="Scheduled Check-ins"
          entities={appointmentsByDate.valueSeq()} />
    );
  }

  renderCheckInAppointmentForm = () => {
    const { addAppointmentsToSubmission, appointmentEntities } = this.props;
    return (
      <CheckInAppointmentForm
          addAppointmentsToSubmission={addAppointmentsToSubmission}
          existingAppointments={appointmentEntities} />
    );
  }

  renderConditionsGrid = () => {
    const { parentState, mapOptionsToCheckboxButtons } = this.props;
    return (
      <ConditionsOptionsGrid numColumns={4}>
        {mapOptionsToCheckboxButtons(CONDITION_LIST, CONDITIONS, parentState)}
      </ConditionsOptionsGrid>
    );
  }

  render() {
    const {
      conditions,
      disabled,
      handleInputChange,
      otherCondition,
      renderNoContactPeople
    } = this.props;

    return (
      <RowWrapper>
        <h1>Conditions</h1>
        { this.renderConditionsGrid() }
        <hr />
        { conditions.includes(CONDITION_LIST.NO_CONTACT) ? renderNoContactPeople() : null }
        { conditions.includes(CONDITION_LIST.CHECKINS) ? this.renderSimpleCheckInSection() : null }
        { conditions.includes(CONDITION_LIST.C_247) ? this.render247Project() : null }
        { conditions.includes(CONDITION_LIST.OTHER) ? (
          <SubConditionsWrapper>
            <h2>Other Conditions</h2>
            <Input
                name={OTHER_CONDITION_TEXT}
                value={otherCondition}
                onChange={handleInputChange}
                disabled={disabled} />
          </SubConditionsWrapper>
        ) : null }
      </RowWrapper>
    );
  }
}

export default ConditionsSection;
