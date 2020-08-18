/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map } from 'immutable';

import EnrollStatusBanner from '../enroll/EnrollStatusBanner';
import StyledInput from '../controls/StyledInput';
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
  person :Map<*, *>,
  personVoiceProfile :boolean,
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  mapOptionsToCheckboxButtons :(options :{}, field :string) => void,
  handleInputChange :(event :Object) => void,
  addAppointmentsToSubmission :(event :Object) => void,
  appointmentEntities :List<*>,
  renderNoContactPeople :() => void,
  conditions :Object,
  otherCondition :String,
  disabled :boolean,
  settingsIncludeVoiceEnroll :boolean,
};

class ConditionsSection extends React.Component<Props, State> {

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

  renderFullCheckInSection = () => {
    const { disabled } = this.props;
    return this.renderCheckInAppointmentForm();
  }

  render() {
    const {
      person,
      personVoiceProfile,
      conditions,
      disabled,
      handleInputChange,
      otherCondition,
      renderNoContactPeople,
      settingsIncludeVoiceEnroll
    } = this.props;

    const checkInSection = settingsIncludeVoiceEnroll
      ? (
        <>
          {/* <EnrollStatusBanner person={person} personVoiceProfile={personVoiceProfile} /> */}
          { this.renderFullCheckInSection() }
        </>
      )
      : this.renderSimpleCheckInSection();
    return (
      <RowWrapper>
        <h1>Conditions</h1>
        { this.renderConditionsGrid() }
        <hr />
        { conditions.includes(CONDITION_LIST.NO_CONTACT) ? renderNoContactPeople() : null }
        { conditions.includes(CONDITION_LIST.CHECKINS) ? checkInSection : null }
        { conditions.includes(CONDITION_LIST.C_247) ? this.render247Project() : null }
        { conditions.includes(CONDITION_LIST.OTHER) ? (
          <SubConditionsWrapper>
            <h2>Other Conditions</h2>
            <StyledInput
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
