import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { faTimes, faQuoteLeft, faQuoteRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AudioRecorder from '../../components/AudioRecorder';
import SearchPersonContainer from '../person/SearchPersonContainer';
import LoadingSpinner from '../../components/LoadingSpinner';
import DotProgressBar from '../../components/DotProgressBar';
import StyledButton from '../../components/buttons/StyledButton';
import VOICE_PROMPT from './Consts';
import * as ActionFactory from './EnrollActionFactory';
import * as Routes from '../../core/router/Routes';
import { STATE, ENROLL } from '../../utils/consts/FrontEndStateConsts';
import {
  CloseX,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const BodyContainer = styled.div`
  text-align: center;
`;

const LoadingProfileText = styled.div`
  font-size: 18px;
  margin: 20px;
`;

const PromptHeaderText = styled.div`
  font-size: 16px;
`;

const QuoteLeft = styled(FontAwesomeIcon).attrs({
  icon: faQuoteLeft
})`
  margin: 0 6px 0 -20px;
  color: #36454f;
`;

const QuoteRight = styled(FontAwesomeIcon).attrs({
  icon: faQuoteRight
})`
  margin: 0 -20px 0 6px;
  color: #36454f;
`;

const PromptText = styled.div`
  font-size: 18px;
  margin: 20px 40px;
  background: #f7f8f9;
  padding: 40px;
  max-width: 600px;
  max-height: 300px;
  display: inline-block;
  overflow-y: scroll;
  border-radius: 3px;
`;

const PromptTextWrapper = styled.div`
  text-align: left;
`;

const SubmitButton = styled(StyledButton)`
  margin-top: 30px;
  background: #7a52ea;
  color: white;
  border: none;
  &:hover {
    background: #8763ec
  }
`;

const ProgressBarWrapper = styled.div`
  max-width: 300px;
  display: inline-block;
`;

const ErrorMessage = styled.div`
  display: inline-block;
  font-size: 16px;
  color: #cc0000;
`;

const SuccessWrapper = styled.div`
  text-align: center;
`;

const Success = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #4BB543;
`;

const PinWrapper = styled.div`
  margin: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PinText = styled.span`
  font-size: 20px;
  width: 40px;
  margin-left: -40px;
`;

const Pin = styled.span`
  margin: 10px;
  font-size: 40px;
  padding: 10px;
  border: 2px solid black;
  border-radius: 5px;
`;

const RememberPinText = styled.div`
  font-size: 16px;
  margin-bottom: 30px;
`;

class EnrollVoice extends React.Component {

  static propTypes = {
    loadingProfile: PropTypes.bool.isRequired,
    profileId: PropTypes.string.isRequired,
    pin: PropTypes.string.isRequired,
    submittingAudio: PropTypes.bool.isRequired,
    numSubmissions: PropTypes.number.isRequired,
    errorMessage: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      getProfileRequest: PropTypes.func.isRequired,
      enrollVoiceRequest: PropTypes.func.isRequired,
      clearError: PropTypes.func.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      personEntityKeyId: null,
      personId: null,
      blobObject: null
    };
  }

  onStopRecording = (recordedBlob) => {
    this.setState({
      blobObject: recordedBlob
    });
  }

  handleClose = () => {
    const { history } = this.props;
    history.push(Routes.DASHBOARD);
  }

  getSearchPeopleSection = () => {
    const { actions } = this.props;
    return (
      <SearchPersonContainer onSelectPerson={(person, personEntityKeyId) => {
        const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
        this.setState({ personEntityKeyId, personId });
        actions.getProfileRequest(personId, personEntityKeyId);
      }} />
    );
  };

  submitAudio = () => {
    const { actions, profileId } = this.props;
    const { blobObject } = this.state;
    this.setState({ blobObject: null });
    actions.enrollVoiceRequest(profileId, blobObject);
  }

  renderSubmit = () => {
    const { blobObject } = this.state;
    const { submittingAudio, numSubmissions } = this.props;
    const attemptNum = numSubmissions + 1;
    if (submittingAudio) {
      return (
        <div>
          <LoadingSpinner />
          <LoadingProfileText>{`Submitting audio clip ${attemptNum}/3`}</LoadingProfileText>
        </div>
      );
    }

    if (!blobObject) return null;
    return (
      <SubmitButton onClick={this.submitAudio}>{`Submit Clip ${attemptNum}`}</SubmitButton>
    );
  }

  renderError = () => {
    const { errorMessage } = this.props;
    return <ErrorMessage>{errorMessage}</ErrorMessage>;
  }

  enrollmentSuccess = () => {
    const { pin } = this.props;
    return (
      <SuccessWrapper>
        <Success>Success! Your voice has been enrolled.</Success>
        <PinWrapper>
          <PinText>PIN: </PinText>
          <Pin>{pin}</Pin>
        </PinWrapper>
        <RememberPinText>
          {'You will be required to enter this pin when calling to check in, so please record it somewhere secure.'}
        </RememberPinText>
        <StyledButton onClick={this.handleClose}>Close</StyledButton>
      </SuccessWrapper>
    );
  }

  getRecordAudioSection = () => {
    const { loadingProfile, numSubmissions, actions } = this.props;

    if (loadingProfile) {
      return (
        <div>
          <LoadingSpinner />
          <LoadingProfileText>Loading profile...</LoadingProfileText>
        </div>
      );
    }

    return (
      <BodyContainer>
        <PromptHeaderText>
          {'Please record and submit the following text three times.'}
        </PromptHeaderText>
        <PromptText>
          <PromptTextWrapper>
            <QuoteLeft />
            {VOICE_PROMPT}
            <QuoteRight />
          </PromptTextWrapper>
        </PromptText>
        <AudioRecorder onStart={actions.clearError} onStop={this.onStopRecording} />
        <ProgressBarWrapper>
          <DotProgressBar numSteps={3} current={numSubmissions} />
        </ProgressBarWrapper>
        <br />
        {this.renderSubmit()}
        {this.renderError()}
      </BodyContainer>
    );
  }

  renderContent = () => {
    const { personId } = this.state;
    const { numSubmissions } = this.props;

    if (!personId) return this.getSearchPeopleSection();
    if (numSubmissions >= 3) return this.enrollmentSuccess();
    return this.getRecordAudioSection();
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Enroll Voice Profile</div>
            <CloseX icon={faTimes} onClick={this.handleClose} />
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderContent()}
            <StyledTopFormNavBuffer />
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state :Map<>) :Object {
  const enroll = state.get(STATE.ENROLL);

  return {
    [ENROLL.LOADING_PROFILE]: enroll.get(ENROLL.LOADING_PROFILE),
    [ENROLL.PROFILE_ID]: enroll.get(ENROLL.PROFILE_ID),
    [ENROLL.PIN]: enroll.get(ENROLL.PIN),
    [ENROLL.SUBMITTING_AUDIO]: enroll.get(ENROLL.SUBMITTING_AUDIO),
    [ENROLL.NUM_SUBMISSIONS]: enroll.get(ENROLL.NUM_SUBMISSIONS),
    [ENROLL.ERROR]: enroll.get(ENROLL.ERROR)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ActionFactory).forEach((action :string) => {
    actions[action] = ActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EnrollVoice);
