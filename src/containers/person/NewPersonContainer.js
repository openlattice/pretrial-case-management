/*
 * @flow
 */

import React from 'react';

import DatePicker from 'react-bootstrap-date-picker';
import Immutable from 'immutable';
import styled from 'styled-components';
import qs from 'query-string';
import uuid from 'uuid/v4';
import moment from 'moment';
import { Button, Col, FormControl } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SelfieWebCam from '../../components/SelfieWebCam';
import Checkbox from '../../components/controls/StyledCheckbox';
import { GENDERS, STATES } from '../../utils/consts/Consts';
import { toISODate } from '../../utils/Utils';
import { PaddedRow, StyledSelect, TitleLabel } from '../../utils/Layout';
import { newPersonSubmitRequest } from './PersonActionFactory';
import { clearForm } from '../psa/FormActionFactory';

import {
  ADDRESS_VALUE,
  CITY_VALUE,
  COUNTRY_VALUE,
  DOB_VALUE,
  ETHNICITY_VALUE,
  FIRST_NAME_VALUE,
  GENDER_VALUE,
  ID_VALUE,
  LAST_NAME_VALUE,
  LIVES_AT_ID_VALUE,
  MIDDLE_NAME_VALUE,
  PICTURE_VALUE,
  RACE_VALUE,
  SSN_VALUE,
  STATE_VALUE,
  ZIP_VALUE,
  newPersonSubmissionConfig
} from './NewPersonSubmissionConfig';
import * as Routes from '../../core/router/Routes';

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

const Instructions = styled.div`
  font-size: 14px;
  font-style: italic;
`;

const SectionHeader = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin: 10px 0;
`;

const RequiredTitleLabel = styled(TitleLabel)`
  font-weight: bold;
`;

const CenteredSubmitButton = styled(Button).attrs({
  type: 'submit'
})`
  align-self: center;
  margin-top: 50px;
`;

const ErrorMessage = styled.div`
  color: #cc0000;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
  text-align: center;
`;

/*
 * types
 */

type Props = {
  actions :{
    newPersonSubmitRequest :Function,
    clearForm :Function
  },
  location :{
    search :string
  },
  isCreatingPerson :boolean,
  createPersonError :boolean
}

type State = {
  addressValue :?string,
  cityValue :?string,
  countryValue :?string,
  dobValue :?string,
  ethnicityValue :?string,
  firstNameValue :?string,
  genderValue :?string,
  lastNameValue :?string,
  middleNameValue :?string,
  pictureValue :?string,
  raceValue :?string,
  showSelfieWebCam :boolean,
  ssnValue :?string,
  stateValue :?string,
  zipValue :?string
}

const ETHNICITIES = [
  'Unknown',
  'Not Hispanic',
  'Hispanic'
]

const RACES = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Other Pacific Islander',
  'Unknown',
  'White'
];

class NewPersonContainer extends React.Component<Props, State> {

  selfieWebCam :?SelfieWebCam;

  constructor(props :Props) {

    super(props);

    const optionalParams = qs.parse(props.location.search);

    const firstName = optionalParams[Routes.FIRST_NAME] || '';
    const lastName = optionalParams[Routes.LAST_NAME] || '';
    const dob = optionalParams[Routes.DOB] || '';

    this.state = {
      [ADDRESS_VALUE]: '',
      [CITY_VALUE]: '',
      [COUNTRY_VALUE]: '',
      [DOB_VALUE]: dob,
      [ETHNICITY_VALUE]: '',
      [FIRST_NAME_VALUE]: firstName,
      [GENDER_VALUE]: '',
      [LAST_NAME_VALUE]: lastName,
      [MIDDLE_NAME_VALUE]: '',
      [PICTURE_VALUE]: '',
      [RACE_VALUE]: '',
      [SSN_VALUE]: '',
      [STATE_VALUE]: '',
      [ZIP_VALUE]: '',
      showSelfieWebCam: false
    };
  }

  componentWillUnmount() {
    this.props.actions.clearForm();
  }

  isReadyToSubmit = () :boolean => !!this.state[DOB_VALUE]
        && !!this.state[FIRST_NAME_VALUE]
        && !!this.state[LAST_NAME_VALUE]
        && !this.props.isCreatingPerson

  handleOnChangeDateOfBirth = (dob :?string) => {
    const dobMoment = dob ? moment(dob) : null;
    const dobValue = toISODate(dobMoment) || '';

    this.setState({
      [DOB_VALUE]: dobValue
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

    if (this.selfieWebCam) {
      this.selfieWebCam.closeMediaStream();
    }

    const values = {
      [ADDRESS_VALUE]: this.state[ADDRESS_VALUE] || null,
      [CITY_VALUE]: this.state[CITY_VALUE],
      [COUNTRY_VALUE]: this.state[COUNTRY_VALUE] || null,
      [DOB_VALUE]: this.state[DOB_VALUE] || null,
      [ETHNICITY_VALUE]: this.state[ETHNICITY_VALUE] || null,
      [FIRST_NAME_VALUE]: this.state[FIRST_NAME_VALUE] || null,
      [GENDER_VALUE]: this.state[GENDER_VALUE] || null,
      [LAST_NAME_VALUE]: this.state[LAST_NAME_VALUE] || null,
      [MIDDLE_NAME_VALUE]: this.state[MIDDLE_NAME_VALUE] || null,
      [PICTURE_VALUE]: this.state[PICTURE_VALUE] || null,
      [RACE_VALUE]: this.state[RACE_VALUE] || null,
      [SSN_VALUE]: this.state[SSN_VALUE] || null,
      [STATE_VALUE]: this.state[STATE_VALUE] || null,
      [ZIP_VALUE]: this.state[ZIP_VALUE] || null,
      [ID_VALUE]: uuid(),
      [LIVES_AT_ID_VALUE]: uuid()
    };

    this.props.actions.newPersonSubmitRequest(newPersonSubmissionConfig, values);
  }

  getOptionsMap = valueList => valueList.map(value => <option key={value} value={value}>{value}</option>);

  render() {


    const stateOptions = STATES.map(state => (
      <option key={state} value={state}>{state}</option>
    ));

    return (
      <ContainerOuterWrapper>
        <ContainerInnerWrapper>
          <Title>Enter New Person Information</Title>
          <Instructions>* = required field</Instructions>
          <FormWrapper>
            <div>
              <SectionHeader>Personal Information</SectionHeader>
              <PaddedRow>
                <Col lg={4}>
                  <RequiredTitleLabel>*Last Name</RequiredTitleLabel>
                  <FormControl
                      name={LAST_NAME_VALUE}
                      value={this.state[LAST_NAME_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
                <Col lg={4}>
                  <RequiredTitleLabel>*First Name</RequiredTitleLabel>
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
              </PaddedRow>
              <PaddedRow>
                <Col lg={4}>
                  <RequiredTitleLabel>*Date of Birth</RequiredTitleLabel>
                  <DatePicker
                      value={this.state[DOB_VALUE]}
                      onChange={this.handleOnChangeDateOfBirth} />
                </Col>
                <Col lg={4}>
                  <TitleLabel>Gender</TitleLabel>
                  <StyledSelect
                      name={GENDER_VALUE}
                      value={this.state[GENDER_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { this.getOptionsMap(GENDERS) }
                  </StyledSelect>
                </Col>
                <Col lg={4}>
                  <TitleLabel>Social Security Number</TitleLabel>
                  <FormControl
                      name={SSN_VALUE}
                      value={this.state[SSN_VALUE]}
                      onChange={this.handleOnChangeInput} />
                </Col>
              </PaddedRow>
              <PaddedRow>
                <Col lg={6}>
                  <TitleLabel>Race</TitleLabel>
                  <StyledSelect
                      name={RACE_VALUE}
                      value={this.state[RACE_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { this.getOptionsMap(RACES) }
                  </StyledSelect>
                </Col>
                <Col lg={6}>
                  <TitleLabel>Ethnicity</TitleLabel>
                  <StyledSelect
                      name={ETHNICITY_VALUE}
                      value={this.state[ETHNICITY_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { this.getOptionsMap(ETHNICITIES) }
                  </StyledSelect>
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
                  <StyledSelect
                      name={STATE_VALUE}
                      value={this.state[STATE_VALUE]}
                      onChange={this.handleOnChangeInput}>
                    <option value="">Select</option>
                    { this.getOptionsMap(STATES) }
                  </StyledSelect>
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
              this.isReadyToSubmit()
                ? (
                  <CenteredSubmitButton onClick={this.submitNewPerson}>Submit</CenteredSubmitButton>
                )
                : (
                  <CenteredSubmitButton disabled>Submit</CenteredSubmitButton>
                )
            }
            {
              this.props.createPersonError
                ? <ErrorMessage>An error occurred: unable to create new person.</ErrorMessage>
                : null
            }
          </FormWrapper>
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {

  return {
    isCreatingPerson: state.getIn(['search', 'isCreatingPerson']),
    createPersonError: state.getIn(['search', 'createPersonError'])
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ newPersonSubmitRequest, clearForm }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewPersonContainer);
