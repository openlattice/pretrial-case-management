/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import qs from 'query-string';
import uuid from 'uuid/v4';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SelfieWebCam from '../../components/SelfieWebCam';
import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import Checkbox from '../../components/controls/StyledCheckbox';
import StyledInput from '../../components/controls/StyledInput';
import StyledDatePicker from '../../components/controls/StyledDatePicker';
import SearchableSelect from '../../components/controls/SearchableSelect';
import { GENDERS, STATES } from '../../utils/consts/Consts';
import { toISODate } from '../../utils/Utils';
import { StyledFormWrapper, StyledSectionWrapper } from '../../utils/Layout';
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

const FormSection = styled.div`
  width: 100%;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e1eb;

  &:last-child {
    margin-bottom: -30px;
    border-bottom: none;
  }
`;

const HeaderSection = styled(FormSection)`
  padding-top: 0;
  margin-top: -10px;
  margin-bottom: 15px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  width: 300px;
  justify-content: space-between;
  button {
    width: 140px;
  }

  ${InfoButton} {
    padding: 0;
  }
`;

const PaddedRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const UnpaddedRow = styled(PaddedRow)`
  margin: 0;
`;

const Header = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: #555e6f;
`;

const SubHeader = styled(Header)`
  font-size: 16px;
  margin-top: 15px;
`;

const InputLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #555e6f;
  margin-bottom: 10px;
`;

const InputGroup = styled.div`
  width: ${props => props.width};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 15px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
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
  createPersonError :boolean,
  history :string[]
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
];

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

  handleOnSelectChange = (field, value) => {
    this.setState({ [field]: value });
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

  getAsMap = (valueList) => {
    let options = Immutable.OrderedMap();
    valueList.forEach((value) => {
      options = options.set(value, value);
    });
    return options;
  }

  getSelect = (field, options, allowSearch) => (
    <SearchableSelect
        value={this.state[field]}
        searchPlaceholder="Select"
        onSelect={value => this.handleOnSelectChange(field, value)}
        options={this.getAsMap(options)}
        selectOnly={!allowSearch}
        transparent
        short />
  )

  renderInput = field => (
    <StyledInput
        name={field}
        value={this.state[field]}
        onChange={this.handleOnChangeInput} />
  )

  render() {
    return (
      <StyledFormWrapper>
        <StyledSectionWrapper>
          <HeaderSection>
            <UnpaddedRow>
              <Header>Enter New Person Information</Header>
              <ButtonGroup>
                <BasicButton onClick={() => this.props.history.push(Routes.CREATE_FORMS)}>Discard</BasicButton>
                <InfoButton onClick={this.submitNewPerson} disabled={!this.isReadyToSubmit()}>Submit</InfoButton>
              </ButtonGroup>
            </UnpaddedRow>
          </HeaderSection>

          <FormSection>
            <PaddedRow>
              <Header>Personal Information</Header>
            </PaddedRow>

            <PaddedRow>
              <SubHeader>Legal Name*</SubHeader>
            </PaddedRow>

            <PaddedRow>
              <InputGroup width="33%">
                <InputLabel>Last name*</InputLabel>
                {this.renderInput(LAST_NAME_VALUE)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>First name*</InputLabel>
                {this.renderInput(FIRST_NAME_VALUE)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>Middle name</InputLabel>
                {this.renderInput(MIDDLE_NAME_VALUE)}
              </InputGroup>
            </PaddedRow>

            <PaddedRow>
              <InputGroup width="33%">
                <InputLabel>Date of birth*</InputLabel>
                <StyledDatePicker
                    value={this.state[DOB_VALUE]}
                    onChange={this.handleOnChangeDateOfBirth} />
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>Gender</InputLabel>
                {this.getSelect(GENDER_VALUE, GENDERS)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>Social Security #</InputLabel>
                {this.renderInput(SSN_VALUE)}
              </InputGroup>
            </PaddedRow>

            <PaddedRow>
              <InputGroup width="50%">
                <InputLabel>Race</InputLabel>
                {this.getSelect(RACE_VALUE, RACES)}
              </InputGroup>
              <InputGroup width="50%">
                <InputLabel>Ethnicity</InputLabel>
                {this.getSelect(ETHNICITY_VALUE, ETHNICITIES)}
              </InputGroup>
            </PaddedRow>
          </FormSection>

          <FormSection>
            <PaddedRow>
              <SubHeader>Mailing address</SubHeader>
            </PaddedRow>

            <PaddedRow>
              <InputGroup width="66%">
                <InputLabel>Address</InputLabel>
                {this.renderInput(ADDRESS_VALUE)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>City</InputLabel>
                {this.renderInput(CITY_VALUE)}
              </InputGroup>
            </PaddedRow>

            <PaddedRow>
              <InputGroup width="33%">
                <InputLabel>State</InputLabel>
                {this.getSelect(STATE_VALUE, STATES, true)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>Country</InputLabel>
                {this.renderInput(COUNTRY_VALUE)}
              </InputGroup>
              <InputGroup width="33%">
                <InputLabel>ZIP code</InputLabel>
                {this.renderInput(ZIP_VALUE)}
              </InputGroup>
            </PaddedRow>
          </FormSection>

          <FormSection>
            <PaddedRow>
              <SubHeader>Picture</SubHeader>
            </PaddedRow>

            <UnpaddedRow>
              <InputGroup width="100%">
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
              </InputGroup>
            </UnpaddedRow>
          </FormSection>
          {
            this.props.createPersonError
              ? <ErrorMessage>An error occurred: unable to create new person.</ErrorMessage>
              : null
          }
        </StyledSectionWrapper>
      </StyledFormWrapper>
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
