/*
 * @flow
 */

import React from 'react';

import DatePicker from 'react-bootstrap-date-picker';
import styled from 'styled-components';
import uuid from 'uuid/v4';
import { Button, Col, FormControl } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SelfieWebCam from '../../components/SelfieWebCam';
import Checkbox from '../../components/controls/StyledCheckbox';
import { GENDERS, STATES } from '../../utils/consts/Consts';
import { PaddedRow, TitleLabel } from '../../utils/Layout';
import { newPersonSubmitRequest } from './PersonActionFactory';

import {
  ADDRESS_VALUE,
  AGE_VALUE,
  CITY_VALUE,
  COUNTRY_VALUE,
  DOB_VALUE,
  FIRST_NAME_VALUE,
  GENDER_VALUE,
  ID_VALUE,
  LAST_NAME_VALUE,
  LIVES_AT_ID_VALUE,
  MIDDLE_NAME_VALUE,
  PICTURE_VALUE,
  SSN_VALUE,
  STATE_VALUE,
  ZIP_VALUE,
  newPersonSubmissionConfig
} from './NewPersonSubmissionConfig';

/*
 * styled components
 */

const ContainerOuterWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const ContainerInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 50px;
  width: 980px;
`;

const FormWrapper = styled.div`
  background-color: #fefefe;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 50px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  margin: 20px 0;
`;

const SectionHeader = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin: 10px 0;
`;

const CenteredSubmitButton = styled(Button).attrs({
  type: 'submit'
})`
  align-self: center;
  margin-top: 50px;
`;

/*
 * types
 */

type Props = {
  actions :{
    newPersonSubmitRequest :Function
  }
}

type State = {
  addressValue :?string,
  ageValue :?string,
  cityValue :?string,
  countryValue :?string,
  dobValue :?string,
  firstNameValue :?string,
  genderValue :?string,
  isSubmitting :boolean,
  lastNameValue :?string,
  middleNameValue :?string,
  pictureValue :?string,
  showSelfieWebCam :boolean,
  ssnValue :?string,
  stateValue :?string,
  zipValue :?string
}

class NewPersonContainer extends React.Component<Props, State> {

  selfieWebCam :?SelfieWebCam;

  constructor(props :Props) {

    super(props);

    this.state = {
      [ADDRESS_VALUE]: '',
      [AGE_VALUE]: '',
      [CITY_VALUE]: '',
      [COUNTRY_VALUE]: '',
      [DOB_VALUE]: '',
      [FIRST_NAME_VALUE]: '',
      [GENDER_VALUE]: '',
      [LAST_NAME_VALUE]: '',
      [MIDDLE_NAME_VALUE]: '',
      [PICTURE_VALUE]: '',
      [SSN_VALUE]: '',
      [STATE_VALUE]: '',
      [ZIP_VALUE]: '',
      isSubmitting: false,
      showSelfieWebCam: false
    };
  }

  isReadyToSubmit = () :boolean => !!this.state[ADDRESS_VALUE]
        && !!this.state[CITY_VALUE]
        && !!this.state[COUNTRY_VALUE]
        && !!this.state[DOB_VALUE]
        && !!this.state[FIRST_NAME_VALUE]
        && !!this.state[GENDER_VALUE]
        && !!this.state[LAST_NAME_VALUE]
        && !!this.state[STATE_VALUE]
        && !!this.state[ZIP_VALUE]

  handleOnChangeDateOfBirth = (dob :?string) => {

    this.setState({
      [DOB_VALUE]: dob || ''
    });
  }

  handleOnChangeInput = (event :SyntheticInputEvent<*>) => {

    this.setState({
      [event.target.name]: event.target.value || ''
    });
  }

  handleOnChangeTakePicture = (event :SyntheticInputEvent<*>) => {

    this.setState({
      showSelfieWebCam: event.target.checked || false
    });

    if (this.selfieWebCam) {
      this.selfieWebCam.closeMediaStream();
    }
  }


  handleOnSelfieCapture = (selfieDataAsBase64 :?string) => {

    this.setState({
      [PICTURE_VALUE]: selfieDataAsBase64 || ''
    });
  }

  submitNewPerson = () => {

    this.setState({
      isSubmitting: true
    });

    if (this.selfieWebCam) {
      this.selfieWebCam.closeMediaStream();
    }

    const values = {
      [ADDRESS_VALUE]: this.state[ADDRESS_VALUE] || null,
      [AGE_VALUE]: this.state[AGE_VALUE] || null,
      [CITY_VALUE]: this.state[CITY_VALUE],
      [COUNTRY_VALUE]: this.state[COUNTRY_VALUE] || null,
      [DOB_VALUE]: this.state[DOB_VALUE] || null,
      [FIRST_NAME_VALUE]: this.state[FIRST_NAME_VALUE] || null,
      [GENDER_VALUE]: this.state[GENDER_VALUE] || null,
      [LAST_NAME_VALUE]: this.state[LAST_NAME_VALUE] || null,
      [MIDDLE_NAME_VALUE]: this.state[MIDDLE_NAME_VALUE] || null,
      [PICTURE_VALUE]: this.state[PICTURE_VALUE] || null,
      [SSN_VALUE]: this.state[SSN_VALUE] || null,
      [STATE_VALUE]: this.state[STATE_VALUE] || null,
      [ZIP_VALUE]: this.state[ZIP_VALUE] || null,
      [ID_VALUE]: uuid(),
      [LIVES_AT_ID_VALUE]: uuid()
    };

    // TODO: need to handle failed submissions
    this.props.actions.newPersonSubmitRequest(newPersonSubmissionConfig, values);
  }

  render() {

    const genderOptions = GENDERS.map(gender => (
      <option key={gender} value={gender}>{gender}</option>
    ));

    const stateOptions = STATES.map(state => (
      <option key={state} value={state}>{state}</option>
    ));

    return (
      <ContainerOuterWrapper>
        <ContainerInnerWrapper>
          <Title>Enter New Person Information</Title>
          <FormWrapper>
            <div>
              <SectionHeader>Personal Information</SectionHeader>
              <PaddedRow>
                <Col lg={4}>
                  <TitleLabel>First Name</TitleLabel>
                  <FormControl
                      name={FIRST_NAME_VALUE}
                      value={this.state[FIRST_NAME_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
                <Col lg={4}>
                  <TitleLabel>Middle Name</TitleLabel>
                  <FormControl
                      name={MIDDLE_NAME_VALUE}
                      value={this.state[MIDDLE_NAME_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
                <Col lg={4}>
                  <TitleLabel>Last Name</TitleLabel>
                  <FormControl
                      name={LAST_NAME_VALUE}
                      value={this.state[LAST_NAME_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
              <PaddedRow>
                <Col lg={6}>
                  <TitleLabel>Date of Birth</TitleLabel>
                  <DatePicker
                      value={this.state[DOB_VALUE]}
                      onChange={this.handleOnChangeDateOfBirth} />
                </Col>
                <Col lg={6}>
                  <TitleLabel>Age</TitleLabel>
                  <FormControl
                      name={AGE_VALUE}
                      value={this.state[AGE_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
              <PaddedRow>
                <Col lg={6}>
                  <TitleLabel>Gender</TitleLabel>
                  <FormControl
                      componentClass="select"
                      placeholder="select"
                      name={GENDER_VALUE}
                      value={this.state[GENDER_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { genderOptions }
                  </FormControl>
                </Col>
                <Col lg={6}>
                  <TitleLabel>Social Security Number</TitleLabel>
                  <FormControl
                      name={SSN_VALUE}
                      value={this.state[SSN_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
            </div>
            <div>
              <SectionHeader>Mailing Address</SectionHeader>
              <PaddedRow>
                <Col lg={12}>
                  <TitleLabel>Address</TitleLabel>
                  <FormControl
                      name={ADDRESS_VALUE}
                      value={this.state[ADDRESS_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
              <PaddedRow>
                <Col lg={6}>
                  <TitleLabel>City</TitleLabel>
                  <FormControl
                      name={CITY_VALUE}
                      value={this.state[CITY_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
                <Col lg={6}>
                  <TitleLabel>State</TitleLabel>
                  <FormControl
                      componentClass="select"
                      placeholder="select"
                      name={STATE_VALUE}
                      value={this.state[STATE_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { stateOptions }
                  </FormControl>
                </Col>
              </PaddedRow>
              <PaddedRow>
                <Col lg={6}>
                  <TitleLabel>Zip</TitleLabel>
                  <FormControl
                      name={ZIP_VALUE}
                      value={this.state[ZIP_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
                <Col lg={6}>
                  <TitleLabel>Country</TitleLabel>
                  <FormControl
                      name={COUNTRY_VALUE}
                      value={this.state[COUNTRY_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
            </div>
            <div>
              <SectionHeader>Picture</SectionHeader>
              <Checkbox
                  value=""
                  name="selfie"
                  label="Take a picture with your webcam"
                  checked={this.state.showSelfieWebCam}
                  onChange={this.handleOnChangeTakePicture} />
              {
                !this.state.showSelfieWebCam
                  ? null
                  : (
                    <SelfieWebCam
                        onSelfieCapture={this.handleOnSelfieCapture}
                        ref={(element) => {
                          this.selfieWebCam = element;
                        }} />
                  )
              }
            </div>
            {
              this.isReadyToSubmit() && !this.state.isSubmitting
                ? (
                  <CenteredSubmitButton onClick={this.submitNewPerson}>Submit</CenteredSubmitButton>
                )
                : (
                  <CenteredSubmitButton disabled>Submit</CenteredSubmitButton>
                )
            }
          </FormWrapper>
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ newPersonSubmitRequest }, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(NewPersonContainer);
