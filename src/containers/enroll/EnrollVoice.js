/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { faQuoteLeft, faQuoteRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import AudioRecorder from '../../components/AudioRecorder';
import SearchPersonContainer from '../person/SearchPersonContainer';
import LogoLoader from '../../components/LogoLoader';
import DotProgressBar from '../../components/DotProgressBar';
import StyledButton from '../../components/buttons/StyledButton';
import VOICE_PROMPT from './Consts';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { STATE, ENROLL } from '../../utils/consts/FrontEndStateConsts';
import {
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';

import { clearEnrollError, enrollVoice, getProfile } from './EnrollActions';

const BodyContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: ${OL.RED03};
  display: inline-block;
  font-size: 16px;
`;

const PromptHeaderText = styled.div`
  font-size: 16px;
`;


const QuoteLeft = styled(FontAwesomeIcon).attrs({
  icon: faQuoteLeft
})`
  color: ${OL.PURPLE03};
  margin: 0 6px 0 -20px;
`;

const QuoteRight = styled(FontAwesomeIcon).attrs({
  icon: faQuoteRight
})`
  color: ${OL.PURPLE03};
  margin: 0 -20px 0 6px;
`;

const SectionWrapper = styled(StyledSectionWrapper)`
  border: none;
`;

const PromptText = styled.div`
  background: #f7f8f9;
  border-radius: 3px;
  display: inline-block;
  font-size: 18px;
  margin: 20px 40px;
  max-height: 300px;
  max-width: 600px;
  padding: 40px;
`;

const Pin = styled.span`
  border: 2px solid black;
  border-radius: 5px;
  font-size: 40px;
  margin: 10px;
  padding: 10px;
`;

const PinText = styled.span`
  font-size: 20px;
  margin-left: -40px;
  width: 40px;
`;

const PinWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 20px;
`;

const ProgressBarWrapper = styled.div`
  display: inline-block;
  max-width: 300px;
`;

const PromptTextWrapper = styled.div`
  text-align: left;
`;


const RememberPinText = styled.div`
  font-size: 16px;
  margin-bottom: 30px;
`;

const SubmitButton = styled(StyledButton)`
  color: white;
  background: #7a52ea;
  border: none;
  margin-top: 30px;

  &:hover {
    background: #8763ec;
  }
`;

const SuccessWrapper = styled.div`
  text-align: center;
`;

const Success = styled.div`
  color: ${OL.GREEN03};
  font-size: 18px;
  font-weight: bold;
`;

type Props = {
  actions :{
    clearEnrollError :() => void;
    enrollVoice :RequestSequence;
    getProfile :RequestSequence;
  };
  errorMessage :string;
  loadingProfile :boolean;
  numSubmissions :number;
  onClose :() => void;
  personEntityKeyId :string,
  personId :string,
  pin :string;
  profileEntityKeyId :string;
  submittingAudio :boolean;
}

class EnrollVoice extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      personEntityKeyId: null,
      personId: null,
      blobObject: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      actions,
      errorMessage,
      profileEntityKeyId,
      loadingProfile,
      personEntityKeyId,
      personId
    } = nextProps;
    const receivedPersonEntityKeyId = !prevState.personEntityKeyId && personEntityKeyId;
    const receivedPersonId = !prevState.personId && personId;
    if (!errorMessage && !loadingProfile) {
      if (receivedPersonEntityKeyId && receivedPersonId) {
        actions.getProfile({ personId, personEntityKeyId });
        return { personEntityKeyId, personId };
      }
      if (!profileEntityKeyId) {
        actions.getProfile({ personId, personEntityKeyId });
      }
    }
    return null;
  }

  onStopRecording = (recordedBlob) => {
    this.setState({
      blobObject: recordedBlob
    });
  }

  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  }

  onSelectPerson = (person, personEntityKeyId) => {
    const { actions, loadingProfile } = this.props;
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    this.setState({ personEntityKeyId, personId });
    if (!loadingProfile) {
      actions.getProfile({ personId, personEntityKeyId });
    }
  }

  getSearchPeopleSection = () => <SearchPersonContainer onSelectPerson={this.onSelectPerson} />;

  submitAudio = () => {
    const { actions, profileEntityKeyId } = this.props;
    const { blobObject } = this.state;
    this.setState({ blobObject: null });
    actions.enrollVoice({ profileEntityKeyId, audio: blobObject });
  }

  renderSubmit = () => {
    const { blobObject } = this.state;
    const { submittingAudio, numSubmissions } = this.props;
    const attemptNum = numSubmissions + 1;
    if (submittingAudio) return <LogoLoader noPadding loadingText={`Submitting audio clip ${attemptNum}/3`} />;

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
          You will be required to enter this pin when calling to check in, so please record it somewhere secure.
        </RememberPinText>
        <StyledButton onClick={this.handleClose}>Close</StyledButton>
      </SuccessWrapper>
    );
  }

  getRecordAudioSection = () => {
    const {
      profileEntityKeyId,
      numSubmissions,
      actions
    } = this.props;

    if (!profileEntityKeyId) return <LogoLoader loadingText="Loading profile..." />;

    return (
      <BodyContainer>
        <PromptHeaderText>
          Please record and submit the following text three times.
        </PromptHeaderText>
        <PromptText>
          <PromptTextWrapper>
            <QuoteLeft />
            {VOICE_PROMPT}
            <QuoteRight />
          </PromptTextWrapper>
        </PromptText>
        <ProgressBarWrapper>
          <DotProgressBar numSteps={3} current={numSubmissions} />
        </ProgressBarWrapper>
        <AudioRecorder onStart={actions.clearEnrollError} onStop={this.onStopRecording} />
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
          <SectionWrapper>
            {this.renderContent()}
            <StyledTopFormNavBuffer />
          </SectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state :Map<>) :Object {
  const enroll = state.get(STATE.ENROLL);

  return {
    [ENROLL.LOADING_PROFILE]: enroll.get(ENROLL.LOADING_PROFILE),
    [ENROLL.ENTITY_KEY_ID]: enroll.get(ENROLL.ENTITY_KEY_ID),
    [ENROLL.PIN]: enroll.get(ENROLL.PIN),
    [ENROLL.SUBMITTING_AUDIO]: enroll.get(ENROLL.SUBMITTING_AUDIO),
    [ENROLL.NUM_SUBMISSIONS]: enroll.get(ENROLL.NUM_SUBMISSIONS),
    [ENROLL.ERROR]: enroll.get(ENROLL.ERROR)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    clearEnrollError,
    enrollVoice,
    getProfile
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EnrollVoice);
