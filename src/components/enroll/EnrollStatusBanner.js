import styled from 'styled-components';
import React from 'react';
import type { Dispatch } from 'redux';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { faMicrophoneAlt, faMicrophoneAltSlash } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EnrollVoiceModal from './EnrollVoiceModal';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { InputRow } from '../person/PersonFormTags';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ENROLL } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import { clearEnrollState, getProfile } from '../../containers/enroll/EnrollActions';

const {
  ENTITY_KEY_ID,
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
  actions :{
    getProfile :RequestSequence;
    clearEnrollState :() => void;
  };
  loadingProfile :boolean;
  person :Map;
  personVoiceProfile :Map;
  voiceEnrollmentProgress :number;
};

type State = {
  enrollVoiceModalOpen :boolean;
}

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
    if (!loadingProfile && (personVoiceProfile.size) && personId && personEntityKeyId) {
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
    const { personId, firstMidLast, personEntityKeyId } = formatPeopleInfo(person);
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
    const { personVoiceProfile, voiceEnrollmentProgress } = this.props;
    let enrollmentText = ' is not enrolled in check-ins';
    if (personVoiceProfile) {
      switch (voiceEnrollmentProgress) {
        case 3:
          enrollmentText = ' is enrolled in check-ins';
          break;
        case 2:
        case 1:
        case 0:
          enrollmentText = '\'s check-in enrollment is incomplete';
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
    const { person } = this.props;
    const { firstMidLast } = formatPeopleInfo(person);
    return (
      <>
        { firstMidLast }
        this.renderEnrollmentBanner()
      </>
    );
  }
}

function mapStateToProps(state) {
  const people = state.get(STATE.PEOPLE);
  const enroll = state.get(STATE.ENROLL);

  return {
    [PEOPLE_DATA.VOICE_ENROLLMENT_PROGRESS]: people.get(PEOPLE_DATA.VOICE_ENROLLMENT_PROGRESS),
    [ENROLL.LOADING_PROFILE]: enroll.get(ENROLL.LOADING_PROFILE),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Enrollment Actions
    clearEnrollState,
    getProfile
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EnrollStatusBanner);
