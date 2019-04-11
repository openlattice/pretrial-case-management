/*
 * @flow
 */
import moment from 'moment';
import styled from 'styled-components';
import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { faMicrophoneAlt, faMicrophoneAltSlash } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EnrollVoiceModal from '../enroll/EnrollVoiceModal';
import StyledInput from '../controls/StyledInput';
import CheckInAppointmentForm from '../../containers/checkins/CheckInAppointmentForm';
import SimpleCards from '../cards/SimpleCards';
import { RowWrapper, OptionsGrid, SubConditionsWrapper } from './ReleaseConditionsStyledTags';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties, getFirstNeighborValue } from '../../utils/DataUtils';
import { formatPersonName, formatPeopleInfo } from '../../utils/PeopleUtils';
import { InputRow } from '../person/PersonFormTags';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

import * as EnrollActionFactory from '../../containers/enroll/EnrollActionFactory';

const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  PERSON_ID,
  START_DATE
} = PROPERTY_TYPES;

const { OTHER_CONDITION_TEXT } = RELEASE_CONDITIONS;

const Status = styled(InputRow)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0;
`;

const StatusText = styled.div`
  font-size: 16px;
  font-weight: 600;
  padding: 5px 10px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const UnderlinedTextButton = styled.div`
  display: block;
  color: ${OL.PURPLE02};
  text-decoration: 'underline';
  :hover {
    cursor: pointer;
  }
`;

type Props = {
  person :Map<*, *>,
  personIsEnrolled :boolean,
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
  actions :{
    clearEnrollVoice :() => void
  }
};

class ConditionsSection extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      enrollVoiceModalOpen: false
    };
  }

  openEnrollVoiceModal = () => this.setState({ enrollVoiceModalOpen: true });
  closeEnrollVoiceModal = () => {
    const { actions } = this.props;
    actions.clearEnrollVoice();
    this.setState({ enrollVoiceModalOpen: false });
  };

  renderVoiceEnrollmentModal = () => {
    const { enrollVoiceModalOpen } = this.state;
    const { person } = this.props;
    const {
      [PERSON_ID]: personId,
      [FIRST_NAME]: firstName,
      [MIDDLE_NAME]: middleName,
      [LAST_NAME]: lastName,
      [ENTITY_KEY_ID]: personEntityKeyId,
    } = getEntityProperties(person, [PERSON_ID, ENTITY_KEY_ID]);
    const { firstMidLast } = formatPersonName(firstName, middleName, lastName);
    return (
      <EnrollVoiceModal
          personId={personId}
          personEntityKeyId={personEntityKeyId}
          personName={firstMidLast}
          open={enrollVoiceModalOpen}
          onClose={this.closeEnrollVoiceModal} />
    );
  }

  renderEnrollPersonButton = () => (
    <UnderlinedTextButton onClick={this.openEnrollVoiceModal}>Enroll</UnderlinedTextButton>
  );

  renderSimpleCheckInSection = () => {
    const { mapOptionsToRadioButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>Check-in frequency</h2>
        <OptionsGrid numColumns={3}>
          {mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency')}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  };

  render247Project = () => {
    const { mapOptionsToCheckboxButtons } = this.props;
    return (
      <SubConditionsWrapper>
        <h2>24/7 Requirements</h2>
        <h3>Must sign 24/7 Project agreement and comply with all terms and conditions.</h3>
        <OptionsGrid numColumns={3}>
          {mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types')}
        </OptionsGrid>
        <hr />
      </SubConditionsWrapper>
    );
  }

  renderEnrollmentIcon = () => {
    const { personIsEnrolled } = this.props;
    return personIsEnrolled
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faMicrophoneAlt} /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color="red" icon={faMicrophoneAltSlash} /></StatusIconContainer>;
  }

  renderEnrollmentText = () => {
    const { person, personIsEnrolled } = this.props;
    const { firstMidLast } = formatPeopleInfo(person);
    return personIsEnrolled
      ? `${firstMidLast} is enrolled in check-ins`
      : `${firstMidLast} is not enrolled in check-ins`;
  }

  renderEnrollmentBanner = () => {
    const { personIsEnrolled } = this.props;
    return (
      <>
        <Status>
          { this.renderEnrollmentIcon() }
          <StatusText>{this.renderEnrollmentText()}</StatusText>
          { personIsEnrolled ? null : this.renderEnrollPersonButton() }
        </Status>
        { this.renderVoiceEnrollmentModal() }
      </>
    );
  }
  renderDisabledAppointmentsDisplay = () => {
    const { appointmentEntities } = this.props;
    let appointmentsByDate = Map();
    const sortedEntities = appointmentEntities.sort((a1, a2) => {
      const a1StartDate = getFirstNeighborValue(a1, START_DATE);
      const a2StartDate = getFirstNeighborValue(a2, START_DATE);
      const a1moment = moment(a1StartDate);
      const a2moment = moment(a2StartDate);
      return a1moment.isBefore(a2moment) ? -1 : 1;
    });
    sortedEntities.forEach((appointment) => {
      const startDate = getFirstNeighborValue(appointment, START_DATE);
      appointmentsByDate = appointmentsByDate.set(startDate, appointment);
    });
    return (
      <SimpleCards
          title="Appointments"
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
    const { mapOptionsToCheckboxButtons } = this.props;
    return (
      <OptionsGrid numColumns={4}>
        {mapOptionsToCheckboxButtons(CONDITION_LIST, 'conditions')}
      </OptionsGrid>
    );
  }

  renderFullCheckInSection = () => {
    const { disabled } = this.props;
    return disabled
      ? this.renderDisabledAppointmentsDisplay()
      : this.renderCheckInAppointmentForm();
  }

  render() {
    const {
      personIsEnrolled,
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
          { this.renderEnrollmentBanner() }
          { personIsEnrolled ? this.renderFullCheckInSection() : null }
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

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EnrollActionFactory).forEach((action :string) => {
    actions[action] = EnrollActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(ConditionsSection);
