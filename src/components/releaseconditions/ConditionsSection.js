/*
 * @flow
 */
import moment from 'moment';
import React from 'react';

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

const { OTHER_CONDITION_TEXT } = RELEASE_CONDITIONS;

const renderCheckInSection = mapOptionsToRadioButtons => (
  <SubConditionsWrapper>
    <h2>Check-in frequency</h2>
    <OptionsGrid numColumns={4}>
      {mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency')}
    </OptionsGrid>
    <hr />
  </SubConditionsWrapper>
);

const render247Project = mapOptionsToCheckboxButtons => (
  <SubConditionsWrapper>
    <h2>24/7 Requirements</h2>
    <h3>Must sign 24/7 Project agreement and comply with all terms and conditions.</h3>
    <OptionsGrid numColumns={3}>
      {mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types')}
    </OptionsGrid>
    <hr />
  </SubConditionsWrapper>
);

type Props = {
  mapOptionsToRadioButtons :(options :{}, field :string) => void,
  mapOptionsToCheckboxButtons :(options :{}, field :string) => void,
  handleInputChange :(event :Object) => void,
  renderNoContactPeople :() => void,
  conditions :Object,
  otherCondition :String,
  disabled :boolean
};

const ConditionsSection = ({
  appointmentEntities,
  addAppointmentsToSubmission,
  conditions,
  disabled,
  handleInputChange,
  mapOptionsToRadioButtons,
  mapOptionsToCheckboxButtons,
  otherCondition,
  renderNoContactPeople,
  settingsIncludeVoiceEnroll
} :Props) => {
  const sortedEntities = appointmentEntities.valueSeq().sort((a1, a2) => {
    const a1moment = moment(getFirstNeighborValue(a1, PROPERTY_TYPES.START_DATE));
    const a2moment = moment(getFirstNeighborValue(a2, PROPERTY_TYPES.START_DATE));
    return a1moment.isBefore(a2moment) ? -1 : 1;
  });
  const checkInForm = disabled
    ? (
      <SimpleCards
          title="Appointments"
          entities={sortedEntities} />
    )
    : <CheckInAppointmentForm addAppointmentsToSubmission={addAppointmentsToSubmission} />;
  const checkInSection = settingsIncludeVoiceEnroll
    ? checkInForm
    : renderCheckInSection(mapOptionsToRadioButtons);
  return (
    <RowWrapper>
      <h1>Conditions</h1>
      <OptionsGrid numColumns={4}>
        {mapOptionsToCheckboxButtons(CONDITION_LIST, 'conditions')}
      </OptionsGrid>
      <hr />
      { conditions.includes(CONDITION_LIST.NO_CONTACT) ? renderNoContactPeople() : null }
      { conditions.includes(CONDITION_LIST.CHECKINS) ? checkInSection : null }
      { conditions.includes(CONDITION_LIST.C_247) ? render247Project(mapOptionsToCheckboxButtons) : null }
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
};

export default ConditionsSection;
