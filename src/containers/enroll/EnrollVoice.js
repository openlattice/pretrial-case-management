import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
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
import {
  CloseX,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';

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

const QuoteLeft = styled(FontAwesome).attrs({
  name: 'quote-left'
})`
  margin: 0 6px 0 -20px;
  color: #36454f;
`;

const QuoteRight = styled(FontAwesome).attrs({
  name: 'quote-right'
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
    this.props.history.push(Routes.DASHBOARD);
  }

  getSearchPeopleSection = () => {
    return (
      <SearchPersonContainer onSelectPerson={(person, personEntityKeyId, personId) => {
        this.setState({ personEntityKeyId, personId });
        this.props.actions.getProfileRequest(personId, personEntityKeyId);
      }} />
    );
  };

  submitAudio = () => {
    const { profileId } = this.props;
    const { blobObject } = this.state;
    this.setState({ blobObject: null });
    this.props.actions.enrollVoiceRequest(profileId, blobObject);
  }

  renderSubmit = () => {
    const { submittingAudio, numSubmissions } = this.props;
    const attemptNum = numSubmissions + 1;
    if (submittingAudio) {
      return (
        <div>
          <LoadingSpinner />
          <LoadingProfileText>{`Submitting audip clip ${attemptNum}/3`}</LoadingProfileText>
        </div>
      );
    }

    if (!this.state.blobObject) return null;
    return (
      <SubmitButton onClick={this.submitAudio}>{`Submit Clip ${attemptNum}`}</SubmitButton>
    );
  }

  renderError = () => <ErrorMessage>{this.props.errorMessage}</ErrorMessage>

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
    if (!this.state.personId) return this.getSearchPeopleSection();
    if (this.props.numSubmissions >= 3) return this.enrollmentSuccess();
    return this.getRecordAudioSection();
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Enroll Voice Profile</div>
            <CloseX name="close" onClick={this.handleClose} />
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
  const enroll = state.get('enroll');

  return {
    loadingProfile: enroll.get('loadingProfile'),
    profileId: enroll.get('profileId'),
    pin: enroll.get('pin'),
    submittingAudio: enroll.get('submittingAudio'),
    numSubmissions: enroll.get('numSubmissions'),
    errorMessage: enroll.get('errorMessage')
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
