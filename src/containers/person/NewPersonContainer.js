/*
 * @flow
 */

import React from 'react';

import { List, Map } from 'immutable';
import styled from 'styled-components';
import qs from 'query-string';
import uuid from 'uuid/v4';
import type { Dispatch } from 'redux';
import { DatePicker, Select } from 'lattice-ui-kit';
import { DateTime, Interval } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import SelfieWebCam from '../../components/SelfieWebCam';
import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import Checkbox from '../../components/controls/StyledCheckbox';
import StyledInput from '../../components/controls/StyledInput';
// import DatePicker from '../../components/datetime/DatePicker';
import { GENDERS, SEXES, STATES } from '../../utils/consts/Consts';
import { phoneIsValid, emailIsValid } from '../../utils/ContactInfoUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';

import { newPersonSubmit, resetPersonAction } from './PersonActions';
import { clearForm } from '../psa/PSAFormActions';
import { goToRoot, goToPath } from '../../core/router/RoutingActionFactory';

import * as Routes from '../../core/router/Routes';
import {
  StyledFormWrapper,
  StyledSectionWrapper
} from '../../utils/Layout';
import {
  ButtonGroup,
  HeaderSection,
  FormSection,
  InputRow,
  InputGroup,
  InputLabel,
  PaddedRow,
  UnpaddedRow,
  Header,
  SubHeader
} from '../../components/person/PersonFormTags';

const {
  ADDRESS,
  CITY,
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  GENERAL_ID,
  IS_MOBILE,
  LAST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  PERSON_ID,
  PHONE,
  RACE,
  SEX,
  SSN,
  STATE: STATE_PT,
  ZIP
} = PROPERTY_TYPES;

const ADDRESS_PROPERTIES = [
  ADDRESS,
  CITY,
  STATE_PT,
  ZIP
];

const CONTACT_PROPERTIES = [
  GENERAL_ID,
  EMAIL,
  PHONE,
  IS_MOBILE
];

const PERSON_PROPERTIES = [
  DOB,
  ETHNICITY,
  FIRST_NAME,
  SEX,
  LAST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  RACE,
  SSN,
  PERSON_ID
];

/*
 * styled components
 */

const ErrorMessage = styled.div`
  color: ${OL.RED03};
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
    clearForm :() => void;
    goToPath :() => void;
    goToRoot :() => void;
    newPersonSubmit :RequestSequence;
    resetPersonAction :() => void;
  };
  createPersonError :boolean;
  isCreatingPerson :boolean;
  location :{
    search :string;
  };
  newPersonSubmitReqState :RequestState;
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
  'Hispanic or Latino',
  'Not Hispanic or Latino'
];

const RACES = [
  'White',
  'Black or African American',
  'Asian',
  'American Indian and Alaska Native',
  'Native Hawaiian and Other Pacific Islander',
  'Some other race'
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
      [ADDRESS]: '',
      [CITY]: '',
      [DOB]: dob,
      [ETHNICITY]: '',
      [FIRST_NAME]: firstName,
      [SEX]: '',
      [LAST_NAME]: lastName,
      [MIDDLE_NAME]: '',
      [MUGSHOT]: '',
      [RACE]: '',
      [SSN]: '',
      [STATE_PT]: '',
      [ZIP]: '',
      [EMAIL]: '',
      [PHONE]: '',
      [IS_MOBILE]: false,
      showSelfieWebCam: false
    };
  }
  componentDidMount() {
    const { actions } = this.props;
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.NEW_PERSON_SUBMIT });
  }

  componentDidUpdate() {
    const { actions, newPersonSubmitReqState } = this.props;
    if (requestIsSuccess(newPersonSubmitReqState)) {
      actions.goToPath(Routes.ROOT);
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearForm();
  }

  hasInvalidDOB = () => {
    const { state } = this;
    const dob = state[DOB];
    const dobDT = DateTime.fromISO(dob);
    const maxAge = DateTime.local().minus({ years: 150 });
    const minAge = DateTime.local().minus({ years: 18 });
    const dobIsValid = Interval.fromDateTimes(maxAge, minAge).contains(dobDT);
    if (dob) return !dobIsValid;
    return undefined;
  }

  isReadyToSubmit = () :boolean => {
    const { isCreatingPerson } = this.props;
    const { state } = this;
    const dob = state[DOB];
    const hasDOB = dob && !this.hasInvalidDOB();
    const hasName = !!state[FIRST_NAME] && !!state[LAST_NAME];
    const phoneFormatIsCorrect = this.phoneNumValid();
    const emailFormatIsCorrect = this.emailAddValid();
    return !isCreatingPerson && hasDOB && hasName && phoneFormatIsCorrect && emailFormatIsCorrect;
  }

  handleOnChangeDateOfBirth = (dob :?string) => {
    const dobValue = DateTime.fromISO(dob).toISODate();
    this.setState({
      [DOB]: dobValue
    });
  }

  phoneNumValid = () => {
    const { state } = this;
    const phone = state[PROPERTY_TYPES.PHONE];
    return phoneIsValid(phone);
  }

  emailAddValid = () => {
    const { state } = this;
    const email = state[PROPERTY_TYPES.EMAIL];
    return emailIsValid(email);
  }

  handleOnChangeInput = (event :SyntheticInputEvent<*>) => {
    this.setState({
      [event.target.name]: event.target.value || ''
    });
  }

  handleOnSelectChange = (option) => {
    this.setState({ [option.field]: option.value });
  }

  handleCheckboxChange = (e) => {
    this.setState({
      [PROPERTY_TYPES.IS_MOBILE]: e.target.checked
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
      [MUGSHOT]: selfieDataAsBase64 || ''
    });
  }

  getAddressEntity = () => {
    const { state } = this;
    const addressEntity = {};
    ADDRESS_PROPERTIES.forEach((property) => {
      if (state[property]) addressEntity[property] = state[property];
    });
    return addressEntity;
  }

  getContactEntity = () => {
    const { state } = this;
    const contactEntity = {};
    CONTACT_PROPERTIES.forEach((property) => {
      if (state[property]) contactEntity[property] = state[property];
    });
    return contactEntity;
  }


  submitNewPerson = () => {
    const { actions } = this.props;
    const { state } = this;

    if (this.selfieWebCam) {
      this.selfieWebCam.closeMediaStream();
    }

    const firstName = state[FIRST_NAME] ? state[FIRST_NAME].toUpperCase() : null;
    const middleName = state[MIDDLE_NAME] ? state[MIDDLE_NAME].toUpperCase() : null;
    const lastName = state[LAST_NAME] ? state[LAST_NAME].toUpperCase() : null;

    const picture = state[MUGSHOT] ? { 'content-type': 'image/png', data: state[MUGSHOT] } : null;
    const addressEntity = this.getAddressEntity();
    const contactEntity = this.getContactEntity();
    const newPersonEntity = {};
    PERSON_PROPERTIES.forEach((property) => {
      if (state[property]) newPersonEntity[property] = state[property];
    });

    newPersonEntity[FIRST_NAME] = firstName;
    newPersonEntity[LAST_NAME] = lastName;
    newPersonEntity[MIDDLE_NAME] = middleName;
    newPersonEntity[PERSON_ID] = uuid();
    if (picture) newPersonEntity[MUGSHOT] = picture;
    actions.newPersonSubmit({
      addressEntity,
      contactEntity,
      newPersonEntity
    });
  }

  getOptionsMap = (valueList) => valueList.map((value) => <option key={value} value={value}>{value}</option>);

  getOptions = (valueList, field) => List().withMutations((mutableList) => {
    valueList.forEach((option) => mutableList.push({ value: option, label: option, field }));
  });

  getSelect = (field, options) => (
    <Select
        placeholder="Select"
        onChange={this.handleOnSelectChange}
        options={this.getOptions(options, field)} />
  );

  renderInput = (field) => {
    const { state } = this;
    return (
      <StyledInput
          name={field}
          value={state[field]}
          onChange={this.handleOnChangeInput} />
    );
  }

  render() {
    const { actions, createPersonError } = this.props;
    const { state } = this;
    return (
      <StyledFormWrapper>
        <StyledSectionWrapper>
          <HeaderSection>
            <UnpaddedRow>
              <Header>Enter New Person Information</Header>
              <ButtonGroup>
                <BasicButton onClick={actions.goToRoot}>Discard</BasicButton>
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

            <InputRow numColumns={3}>
              <InputGroup>
                <InputLabel>Last name*</InputLabel>
                {this.renderInput(LAST_NAME)}
              </InputGroup>
              <InputGroup>
                <InputLabel>First name*</InputLabel>
                {this.renderInput(FIRST_NAME)}
              </InputGroup>
              <InputGroup>
                <InputLabel>Middle name</InputLabel>
                {this.renderInput(MIDDLE_NAME)}
              </InputGroup>
            </InputRow>

            <InputRow numColumns={3}>
              <InputGroup>
                <InputLabel>Date of birth*</InputLabel>
                <DatePicker
                    value={state[DOB]}
                    onChange={this.handleOnChangeDateOfBirth} />
              </InputGroup>
              <InputGroup>
                <InputLabel>Gender</InputLabel>
                {this.getSelect(GENDER, GENDERS)}
              </InputGroup>
              <InputGroup>
                <InputLabel>Sex</InputLabel>
                {this.getSelect(SEX, SEXES)}
              </InputGroup>
            </InputRow>

            <InputRow numColumns={3}>
              <InputGroup>
                <InputLabel>Social Security #</InputLabel>
                {this.renderInput(SSN)}
              </InputGroup>
              <InputGroup>
                <InputLabel>Race</InputLabel>
                {this.getSelect(RACE, RACES)}
              </InputGroup>
              <InputGroup>
                <InputLabel>Ethnicity</InputLabel>
                {this.getSelect(ETHNICITY, ETHNICITIES)}
              </InputGroup>
            </InputRow>
          </FormSection>
          <FormSection>
            <PaddedRow>
              <SubHeader>Mailing address</SubHeader>
            </PaddedRow>

            <InputRow other="66% 33%">
              <InputGroup>
                <InputLabel>Address</InputLabel>
                {this.renderInput(ADDRESS)}
              </InputGroup>
              <InputGroup>
                <InputLabel>City</InputLabel>
                {this.renderInput(CITY)}
              </InputGroup>
            </InputRow>

            <InputRow numColumns={2}>
              <InputGroup>
                <InputLabel>State</InputLabel>
                {this.getSelect(STATE_PT, STATES)}
              </InputGroup>
              <InputGroup>
                <InputLabel>ZIP code</InputLabel>
                {this.renderInput(ZIP)}
              </InputGroup>
            </InputRow>
          </FormSection>

          <FormSection>
            <PaddedRow>
              <SubHeader>Picture</SubHeader>
            </PaddedRow>

            <UnpaddedRow>
              <InputGroup width="100%">
                <Checkbox
                    id="selfie"
                    label="Take a picture with your webcam"
                    checked={state.showSelfieWebCam}
                    onChange={this.handleOnChangeTakePicture} />
                {
                  !state.showSelfieWebCam
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
            createPersonError
              ? <ErrorMessage>An error occurred: unable to create new person.</ErrorMessage>
              : null
          }
        </StyledSectionWrapper>
      </StyledFormWrapper>
    );
  }
}

function mapStateToProps(state :Map) :Object {
  const person = state.get(STATE.PERSON);

  return {
    newPersonSubmitReqState: getReqState(person, PERSON_ACTIONS.NEW_PERSON_SUBMIT),
    [PERSON_DATA.SUBMITTED_PERSON]: person.get(PERSON_DATA.SUBMITTED_PERSON),
    [PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS]: person.get(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    newPersonSubmit,
    resetPersonAction,
    clearForm,
    goToRoot,
    goToPath
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(NewPersonContainer);
