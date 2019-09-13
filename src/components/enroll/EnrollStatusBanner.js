/*
 * @flow
 */
import styled from 'styled-components';
import React from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { faMicrophoneAlt, faMicrophoneAltSlash } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EnrollVoiceModal from './EnrollVoiceModal';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatPersonName, formatPeopleInfo } from '../../utils/PeopleUtils';
import { InputRow } from '../person/PersonFormTags';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ENROLL, PEOPLE, STATE } from '../../utils/consts/FrontEndStateConsts';

import * as EnrollActionFactory from '../../containers/enroll/EnrollActionFactory';

const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  PERSON_ID
} = PROPERTY_TYPES;

const Status = styled(InputRow)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
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
  personVoiceProfile :boolean,
  loadingProfile :boolean,
  voiceEnrollmentProgress :number,
  actions :{
    clearEnrollState :() => void
  }
};

class EnrollStatusBanner extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      enrollVoiceModalOpen: false
    };
  }

  componentDidMount() {
    const {
      actions,
      loadingProfile,
      person,
      personVoiceProfile
    } = this.props;

    const {
      [PERSON_ID]: personId,
      [ENTITY_KEY_ID]: personEntityKeyId,
    } = getEntityProperties(person, [PERSON_ID, ENTITY_KEY_ID]);
    if (!loadingProfile && personVoiceProfile.size && personId && personEntityKeyId) {
      actions.getProfile({ personId, personEntityKeyId });
    }
  }

  openEnrollVoiceModal = () => {
    this.clearEnrollState();
    this.setState({ enrollVoiceModalOpen: true });
  };

  closeEnrollVoiceModal = () => {
    this.setState({ enrollVoiceModalOpen: false });
    this.clearEnrollState();
  };

  clearEnrollState = () => {
    const { actions } = this.props;
    actions.clearEnrollState();
  }

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

  renderEnrollPersonButton = () => {
    const { personVoiceProfile } = this.props;
    const { [PROPERTY_TYPES.PIN]: pin } = getEntityProperties(personVoiceProfile, [PROPERTY_TYPES.PIN]);
    const enrollmentButtonText = pin ? `PIN: ${pin}` : 'Enroll';
    return (
      <UnderlinedTextButton onClick={this.openEnrollVoiceModal}>{ enrollmentButtonText }</UnderlinedTextButton>
    );
  }

  renderEnrollmentIcon = () => {
    const { personVoiceProfile, voiceEnrollmentProgress } = this.props;
    let enrollmentIcon = <FontAwesomeIcon color={OL.RED01} icon={faMicrophoneAltSlash} />;
    if (personVoiceProfile) {
      switch (voiceEnrollmentProgress) {
        case 3:
          enrollmentIcon = <FontAwesomeIcon color={OL.GREEN01} icon={faMicrophoneAlt} />;
          break;
        case 2:
        case 1:
        case 0:
          enrollmentIcon = <FontAwesomeIcon color={OL.ORANGE01} icon={faMicrophoneAltSlash} />;
          break;
        default:
          break;
      }
    }
    return <StatusIconContainer>{enrollmentIcon}</StatusIconContainer>;
  }

  renderEnrollmentText = () => {
    const { person, personVoiceProfile, voiceEnrollmentProgress } = this.props;
    const { firstMidLast } = formatPeopleInfo(person);
    let enrollmentText = `${firstMidLast} is not enrolled in check-ins`;
    if (personVoiceProfile) {
      switch (voiceEnrollmentProgress) {
        case 3:
          enrollmentText = `${firstMidLast} is enrolled in check-ins`;
          break;
        case 2:
        case 1:
        case 0:
          enrollmentText = `${firstMidLast}'s check-in enrollment is incomplete`;
          break;
        default:
          break;
      }
    }
    return enrollmentText;
  }

  renderEnrollmentBanner = () => (
    <>
      <Status>
        { this.renderEnrollmentIcon() }
        <StatusText>{this.renderEnrollmentText()}</StatusText>
        { this.renderEnrollPersonButton() }
      </Status>
      { this.renderVoiceEnrollmentModal() }
    </>
  );

  render() {
    return this.renderEnrollmentBanner();
  }
}


function mapStateToProps(state) {
  const people = state.get(STATE.PEOPLE);
  const enroll = state.get(STATE.ENROLL);

  return {
    [PEOPLE.VOICE_ENROLLMENT_PROGRESS]: people.get(PEOPLE.VOICE_ENROLLMENT_PROGRESS),
    [ENROLL.LOADING_PROFILE]: enroll.get(ENROLL.LOADING_PROFILE),
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(EnrollStatusBanner);
