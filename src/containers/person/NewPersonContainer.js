/*
 * @flow
 */

import React from 'react';

// $FlowFixMe
import qs from 'query-string';
import { List, Map } from 'immutable';
import {
  Banner,
  Button,
  Checkbox,
  DatePicker,
  Input,
  Select
} from 'lattice-ui-kit';
import { DateTime, Interval } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v4 as uuid } from 'uuid';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { loadPersonDetails, newPersonSubmit, resetPersonAction } from './PersonActions';

import SelfieWebCam from '../../components/SelfieWebCam';
import * as Routes from '../../core/router/Routes';
import {
  ButtonGroup,
  FormSection,
  Header,
  HeaderSection,
  InputGroup,
  InputLabel,
  InputRow,
  PaddedRow,
  SubHeader,
  UnpaddedRow
} from '../../components/person/PersonFormTags';
import { goToPath, goToRoot } from '../../core/router/RoutingActions';
import { getEntityProperties } from '../../utils/DataUtils';
import {
  StyledFormWrapper,
  StyledSectionWrapper
} from '../../utils/Layout';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  GENDERS,
  RCM,
  SEXES,
  STATES
} from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';
import {
  getReqState,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { selectPerson, setPSAValues } from '../psa/PSAFormActions';

const {
  ADDRESS,
  CITY,
  DOB,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  PERSON_ID,
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
 * types
 */

type Props = {
  actions :{
    clearForm :() => void;
    goToPath :(path :string) => void;
    goToRoot :() => void;
    loadPersonDetails :RequestSequence;
    newPersonSubmit :RequestSequence;
    resetPersonAction :(actionObject :Object) => void;
    selectPerson :(person :Map) => void;
    setPSAValues :(newValues :Map) => void;
  };
  isCreatingPerson :boolean;
  location :{
    search :string;
  };
  newPersonSubmitReqState :RequestState;
  settings :Map;
  submittedPerson :Map;
}

type State = {
  'bhr.gender' :?string;
  caseContext :string;
  'location.Address' :?string;
  'location.city' :?string;
  'location.state' :?string;
  'location.zip' :?string;
  'nc.PersonBirthDate' :?string;
  'nc.PersonEthnicity' :?string;
  'nc.PersonGivenName' :?string;
  'nc.PersonMiddleName' :?string;
  'nc.PersonRace' :?string;
  'nc.PersonSurName' :?string;
  'nc.SSN' :?string;
  'publicsafety.mugshot' :?string;
  psaContext :string;
  showSelfieWebCam :boolean;
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

    const caseContext = optionalParams[Routes.caseContext] || '';
    const dob = optionalParams[Routes.DOB] || '';
    const firstName = optionalParams[Routes.FIRST_NAME] || '';
    const lastName = optionalParams[Routes.LAST_NAME] || '';
    const psaContext = optionalParams[Routes.psaContext] || '';

    this.state = {
      [ADDRESS]: '',
      caseContext,
      [CITY]: '',
      [DOB]: dob,
      [ETHNICITY]: '',
      [FIRST_NAME]: firstName,
      [GENDER]: '',
      [SEX]: '',
      [LAST_NAME]: lastName,
      [MIDDLE_NAME]: '',
      [MUGSHOT]: '',
      psaContext,
      [RACE]: '',
      [SSN]: '',
      [STATE_PT]: '',
      [ZIP]: '',
      showSelfieWebCam: false
    };
  }
  componentDidMount() {
    const { actions } = this.props;
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.NEW_PERSON_SUBMIT });
  }

  componentDidUpdate(prevProps :Props) {
    const { newPersonSubmitReqState: prevNewPersonSubmitReqState } = prevProps;
    const { caseContext, psaContext } = this.state;
    const {
      actions,
      newPersonSubmitReqState,
      settings,
      submittedPerson
    } = this.props;
    const shouldLoadCases :boolean = settings.get(SETTINGS.LOAD_CASES, false);
    if (requestIsPending(prevNewPersonSubmitReqState) && requestIsSuccess(newPersonSubmitReqState)) {
      if (caseContext.length && psaContext.length && submittedPerson.size) {
        const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(submittedPerson, [ENTITY_KEY_ID]);
        const newValues = Map()
          .set(RCM.COURT_OR_BOOKING, psaContext)
          .set(RCM.CASE_CONTEXT, caseContext);
        actions.setPSAValues({ newValues });
        actions.selectPerson({ selectedPerson: submittedPerson });
        actions.loadPersonDetails({ entityKeyId: personEKID, shouldLoadCases });
        actions.goToPath(Routes.PSA_FORM_ARREST);
      }
      else {
        actions.goToRoot();
      }
    }
  }

  hasInvalidDOB = () => {
    const { state } = this;
    const dob = state[DOB];
    if (dob) {
      const dobDT = DateTime.fromISO(dob);
      const maxAge = DateTime.local().minus({ years: 150 });
      const minAge = DateTime.local().minus({ years: 18 });
      const dobIsValid = Interval.fromDateTimes(maxAge, minAge).contains(dobDT);
      return !dobIsValid;
    }
    return undefined;
  }

  isReadyToSubmit = () :boolean => {
    const { isCreatingPerson } = this.props;
    const { state } = this;
    const dob = state[DOB];
    const hasDOB = !!dob && !this.hasInvalidDOB();
    const hasName = !!state[FIRST_NAME] && !!state[LAST_NAME];
    return !isCreatingPerson && hasDOB && hasName;
  }

  handleOnChangeDateOfBirth = (dob :?string) => {
    if (dob) {
      const dobValue = DateTime.fromISO(dob).toISODate();
      this.setState({
        [DOB]: dobValue
      });
    }
  }

  handleOnChangeInput = (event :SyntheticInputEvent<*>) => {
    this.setState({
      [event.target.name]: event.target.value || ''
    });
  }

  handleOnSelectChange = (option :Object) => {
    this.setState({ [option.field]: option.value });
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
    const newPersonEntity = {};
    PERSON_PROPERTIES.forEach((property :string) => {
      if (state[property]) newPersonEntity[property] = state[property];
    });

    newPersonEntity[FIRST_NAME] = firstName;
    newPersonEntity[LAST_NAME] = lastName;
    newPersonEntity[MIDDLE_NAME] = middleName;
    newPersonEntity[PERSON_ID] = uuid();
    if (picture) newPersonEntity[MUGSHOT] = picture;
    actions.newPersonSubmit({ addressEntity, newPersonEntity });
  }

  getOptions = (valueList :string[], field :string) => List().withMutations((mutableList) => {
    valueList.forEach((option) => mutableList.push({ value: option, label: option, field }));
  });

  getSelect = (field :string, options :string[]) => (
    <Select
        placeholder="Select"
        onChange={this.handleOnSelectChange}
        options={this.getOptions(options, field)} />
  );

  renderInput = (field :string) => {
    const { state } = this;
    return (
      <Input
          name={field}
          value={state[field]}
          onChange={this.handleOnChangeInput} />
    );
  }

  render() {
    const {
      actions,
      newPersonSubmitReqState
    } = this.props;
    const { state } = this;
    const newPersonSubmitFailed = requestIsFailure(newPersonSubmitReqState);
    const submitIsDisabled = !this.isReadyToSubmit() || requestIsPending(newPersonSubmitReqState);
    return (
      <StyledFormWrapper>
        <Banner isOpen={newPersonSubmitFailed} mode="danger">
          Submission of new person failed. If Problem persists, contact OpenLattice.
        </Banner>
        <StyledSectionWrapper>
          <HeaderSection>
            <UnpaddedRow>
              <Header>Enter New Person Information</Header>
              <ButtonGroup>
                <Button onClick={actions.goToRoot}>Discard</Button>
                <Button color="secondary" onClick={this.submitNewPerson} disabled={submitIsDisabled}>Submit</Button>
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
        </StyledSectionWrapper>
      </StyledFormWrapper>
    );
  }
}

function mapStateToProps(state :Map) :Object {
  const person = state.get(STATE.PERSON);
  const settings = state.getIn([STATE.PERSON, SETTINGS_DATA.APP_SETTINGS], Map());

  return {
    newPersonSubmitReqState: getReqState(person, PERSON_ACTIONS.NEW_PERSON_SUBMIT),
    [PERSON_DATA.SUBMITTED_PERSON]: person.get(PERSON_DATA.SUBMITTED_PERSON),
    [PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS]: person.get(PERSON_DATA.SUBMITTED_PERSON_NEIGHBORS),
    settings
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    goToPath,
    goToRoot,
    loadPersonDetails,
    newPersonSubmit,
    resetPersonAction,
    selectPerson,
    setPSAValues
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(NewPersonContainer);
