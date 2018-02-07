/*
 * @flow
 */

import React from 'react';

import PropTypes from 'prop-types';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import FontAwesome from 'react-fontawesome';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import SearchPersonContainer from '../person/SearchPersonContainer';
import SelectPretrialCaseContainer from '../pages/pretrialcase/SelectPretrialCaseContainer';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import PersonFormView from '../../components/person/PersonFormView';
import SelectedPersonInfo from '../../components/person/SelectedPersonInfo';
import SelectedPretrialCaseInfo from '../../components/pretrial/SelectedPretrialInfo';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSAResults from '../../components/psainput/PSAResults';
import exportPDF from '../../utils/PDFUtils';

import * as FormActionFactory from './FormActionFactory';
import * as PersonActionFactory from '../person/PersonActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as Routes from '../../core/router/Routes';

import { formatDate } from '../../utils/Utils';
import { getScoresAndRiskFactors } from '../../utils/ScoringUtils';
import {
  ButtonWrapper,
  CloseX,
  Divider,
  RecommendationWrapper,
  ResultsContainer,
  SmallHeader,
  Spacer,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer

} from '../../utils/Layout';
import {
  getCurrentPage,
  getNextPath,
  getPrevPath,
  getIsLastPage,
  getProgress
} from '../../utils/Helpers';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { chargeFieldIsViolent } from '../../utils/consts/ChargeConsts';

const {
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  DOB,
  SEX,
  RACE,
  ETHNICITY,
  PERSON_ID,
  TIMESTAMP_FQN,
  ARREST_DATE_FQN,
  NVCA_FLAG_FQN,
  NCA_SCALE_FQN,
  FTA_SCALE_FQN,
  GENERAL_ID_FQN,
  MOST_SERIOUS_CHARGE_NO,
  CHARGE_NUM_FQN,
  CASE_ID_FQN
} = PROPERTY_TYPES;

const CenteredDiv = styled.div`
  text-align: center;
`;

const NoResultsText = styled.div`
  text-align: center;
  width: 100%;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const INITIAL_PERSON_FORM = Immutable.fromJS({
  id: '',
  lastName: '',
  firstName: '',
  middleName: '',
  dob: '',
  race: '',
  ethnicity: '',
  sex: ''
});

const INITIAL_PSA_FORM = Immutable.fromJS({
  ageAtCurrentArrest: null,
  currentViolentOffense: null,
  pendingCharge: null,
  priorMisdemeanor: null,
  priorFelony: null,
  priorViolentConviction: null,
  priorFailureToAppearRecent: null,
  priorFailureToAppearOld: null,
  priorSentenceToIncarceration: null
});

const INITIAL_STATE = Immutable.fromJS({
  personForm: INITIAL_PERSON_FORM,
  psaForm: INITIAL_PSA_FORM,
  formIncompleteError: false,
  scores: {
    ftaTotal: 0,
    ncaTotal: 0,
    nvcaTotal: 0,
    ftaScale: 0,
    ncaScale: 0,
    nvcaFlag: false
  },
  scoresWereGenerated: false,
  releaseRecommendation: '',
  releaseRecommendationId: undefined
})

const numPages = 4;

class Form extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      loadDataModelElements: PropTypes.func.isRequired,
      searchPeople: PropTypes.func.isRequired,
      loadNeighbors: PropTypes.func.isRequired,
      clearForm: PropTypes.func.isRequired,
      submitData: PropTypes.func.isRequired,
      selectPerson: PropTypes.func.isRequired,
      selectPretrialCase: PropTypes.func.isRequired,
      updateRecommendation: PropTypes.func.isRequired,
      loadPersonDetailsRequest: PropTypes.func.isRequired
    }).isRequired,
    personDataModel: PropTypes.object.isRequired,
    pretrialCaseDataModel: PropTypes.object.isRequired,
    riskFactorsDataModel: PropTypes.object.isRequired,
    psaDataModel: PropTypes.object.isRequired,
    releaseRecommendationDataModel: PropTypes.object.isRequired,
    calculatedForDataModel: PropTypes.object.isRequired,
    selectedPerson: PropTypes.object.isRequired,
    selectedPretrialCase: PropTypes.object.isRequired,
    pretrialCaseOptions: PropTypes.array.isRequired,
    charges: PropTypes.array.isRequired,
    peopleOptions: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE.toJS()
  }

  componentDidMount() {
    this.props.actions.loadDataModelElements();
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.selectedPretrialCase).length || nextProps.charges.length) {
      this.tryAutofillFields(nextProps.selectedPretrialCase, nextProps.charges);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  // For text input
  handleTextInput = (e) => {
    const sectionKey = e.target.dataset.section;
    const name = e.target.name;
    const input = e.target.value;
    const sectionState = this.state[sectionKey];
    sectionState[name] = input;
    this.setState({ [sectionKey]: sectionState });
  }

  handleDateInput = (e, section, name) => {
    const input = e;
    const sectionState = this.state[section];
    sectionState[name] = input;
    this.setState({ [section]: sectionState });
  }

  // For radio or select input
  handleSingleSelection = (e) => {
    const sectionKey = e.target.dataset.section;
    const sectionState = this.state[sectionKey];
    sectionState[e.target.name] = e.target.value;
    if (sectionKey === 'psaForm') {
      if (e.target.name === 'priorMisdemeanor' || e.target.name === 'priorFelony') {
        if (sectionState.priorMisdemeanor === 'false' && sectionState.priorFelony === 'false') {
          sectionState.priorViolentConviction = '0';
          sectionState.priorSentenceToIncarceration = 'false';
        }
      }
    }
    this.setState({ [sectionKey]: sectionState });
  }

  tryAutofillFields = (nextCase, nextCharges) => {
    const currCase = this.props.selectedPretrialCase;

    let ageAtCurrentArrest = this.state.psaForm.ageAtCurrentArrest;
    let currentViolentOffense = this.state.psaForm.currentViolentOffense;
    if (ageAtCurrentArrest === null || nextCase[ARREST_DATE_FQN] !== currCase[ARREST_DATE_FQN]) {
      ageAtCurrentArrest = this.tryAutofillAge(nextCase[ARREST_DATE_FQN], ageAtCurrentArrest);
    }
    if (nextCase[MOST_SERIOUS_CHARGE_NO] !== currCase[MOST_SERIOUS_CHARGE_NO] || (nextCharges && nextCharges.length)) {
      currentViolentOffense = this.tryAutofillCurrentViolentCharge(nextCharges, nextCase[MOST_SERIOUS_CHARGE_NO]);
    }
    this.setState({
      psaForm: Object.assign(
        {},
        this.state.psaForm, {
          ageAtCurrentArrest,
          currentViolentOffense
        }
      )
    });
  }

  tryAutofillCurrentViolentCharge = (charges, mostSeriousCharge) => {
    let violent = this.state.psaForm.currentViolentOffense;

    if (!charges || !charges.length) {
      if (chargeFieldIsViolent(mostSeriousCharge)) violent = true;
    }
    else {
      violent = false;
      charges.forEach((charge) => {
        if (chargeFieldIsViolent(charge[CHARGE_NUM_FQN])) violent = true;
      });
    }
    return `${violent}`;
  }

  tryAutofillAge = (dateArrested, defaultValue) => {
    const dob = moment.utc(this.props.selectedPerson[DOB]);
    const arrest = moment.utc(dateArrested);
    let ageAtCurrentArrestValue = defaultValue;
    if (dob.isValid && arrest.isValid) {
      const age = Math.floor(moment.duration(arrest.diff(dob)).asYears());
      if (!isNaN(age)) {
        if (age <= 20) ageAtCurrentArrestValue = '0';
        if (age === 21 || age === 22) ageAtCurrentArrestValue = '1';
        if (age >= 23) ageAtCurrentArrestValue = '2';
      }
    }
    return ageAtCurrentArrestValue;
  }

  getCalculatedForEntityDetails = () => {
    return { [TIMESTAMP_FQN]: [new Date()] };
  }

  getBlankReleaseRecommendationEntity = () => {
    const propertyType = this.props.releaseRecommendationDataModel.propertyTypes.filter((propertyType) => {
      return `${propertyType.type.namespace}.${propertyType.type.name}` === GENERAL_ID_FQN;
    })[0];
    if (!propertyType) return {};
    const id = randomUUID();

    return {
      details: { [propertyType.id]: [id] },
      key: {
        entityId: id,
        entitySetId: this.props.releaseRecommendationDataModel.entitySet.id
      }
    };
  }

  getEntityId = (entity, primaryKeyIds) => {
    const pKeyVals = [];
    primaryKeyIds.forEach((pKey) => {
      if (entity[pKey]) {
        const keyValues = [];
        entity[pKey].forEach((value) => {
          keyValues.push(btoa(value));
        });
        pKeyVals.push(btoa(encodeURI(keyValues.join(','))));
      }
    });
    return pKeyVals.length ? pKeyVals.join(',') : randomUUID();
  }

  getEntityWithUuids = (details, fqnsToInclude, fqnToId) => {
    const basicEntity = {};
    fqnsToInclude.forEach((fqn) => {
      if (details[fqn]) Object.assign(basicEntity, { [fqnToId[fqn]]: details[fqn] });
    });
    return basicEntity;
  }

  getEntity = (entityDetails, dataModel, isExistingEntity, useRandomId) => {
    const fqnToId = {};
    const keyIdToFqn = {};
    dataModel.propertyTypes.forEach((propertyType) => {
      const fqn = `${propertyType.type.namespace}.${propertyType.type.name}`;
      fqnToId[fqn] = propertyType.id;
      if (dataModel.entityType.key.includes(propertyType.id)) {
        keyIdToFqn[propertyType.id] = fqn;
      }
    });
    const primaryKeys = dataModel.entityType.key.map((id) => {
      return keyIdToFqn[id];
    });
    const details = (isExistingEntity) ? this.getEntityWithUuids(entityDetails, primaryKeys, fqnToId)
      : this.getEntityWithUuids(entityDetails, Object.keys(entityDetails), fqnToId);

    const entityId = useRandomId ? randomUUID() : this.getEntityId(details, dataModel.entityType.key);
    return {
      details,
      key: {
        entitySetId: dataModel.entitySet.id,
        entityId
      }
    };
  }

  submitEntities = (scores) => {
    const { riskFactors } = getScoresAndRiskFactors(this.state.psaForm);
    const calculatedForEntityDetails = this.getCalculatedForEntityDetails();
    const releaseRecommendationEntity = this.getBlankReleaseRecommendationEntity();

    const personEntity = this.getEntity(this.props.selectedPerson, this.props.personDataModel, true);
    const pretrialCaseEntity = this.getEntity(this.props.selectedPretrialCase, this.props.pretrialCaseDataModel, true);
    const riskFactorsEntity = this.getEntity(riskFactors, this.props.riskFactorsDataModel, false, true);
    const psaEntity = this.getEntity(scores, this.props.psaDataModel, false, true);
    const calculatedForEntity = this.getEntity(calculatedForEntityDetails, this.props.calculatedForDataModel);

    this.props.actions.submitData(
      personEntity,
      pretrialCaseEntity,
      riskFactorsEntity,
      psaEntity,
      releaseRecommendationEntity,
      calculatedForEntity);
    this.setState({ releaseRecommendationId: releaseRecommendationEntity.key.entityId });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const searchOptions = {
      searchFields: this.getSearchDetails(),
      start: 0,
      maxHits: 50
    };
    this.props.actions.searchPeople(this.props.personDataModel.entitySet.id, searchOptions);
  }

  getFqn = (propertyType) => {
    return `${propertyType.type.namespace}.${propertyType.type.name}`;
  }

  updateSearchDetails = (searchDetails, property, value, shouldFormatDate) => {
    const searchTerm = (shouldFormatDate) ? formatDate(value) : value;
    if (searchTerm && searchTerm.length) {
      searchDetails.push({
        searchTerm,
        property,
        exact: true
      });
    }
    return searchDetails;
  }

  getSearchDetails = () => {
    const { firstName, middleName, lastName, dob, sex, race, ethnicity, id } = this.state.personForm;
    let searchDetails = [];
    this.props.personDataModel.propertyTypes.forEach((propertyType) => {
      const fqn = this.getFqn(propertyType);
      switch (fqn) {
        case FIRST_NAME:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, firstName);
          break;

        case MIDDLE_NAME:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, middleName);
          break;

        case LAST_NAME:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, lastName);
          break;

        case SEX:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, sex);
          break;

        case RACE:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, race);
          break;

        case ETHNICITY:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, ethnicity);
          break;

        case DOB:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, dob, true);
          break;

        case PERSON_ID:
          searchDetails = this.updateSearchDetails(searchDetails, propertyType.id, id);
          break;

        default:
          break;
      }
    });
    return searchDetails;
  }

  handleSelectPerson = (person, entityKeyId) => {
    this.props.actions.selectPerson(person.toJS());
    this.props.actions.loadNeighbors(
      this.props.personDataModel.entitySet.id,
      person.get('id', Immutable.List()).get(0)
    );

    this.props.actions.loadPersonDetailsRequest(entityKeyId);
  }

  nextPage = () => {
    const nextPage = getNextPath(window.location, numPages);
    this.handlePageChange(nextPage);
  }

  prevPage = () => {
    const prevPage = getPrevPath(window.location, numPages);
    this.handlePageChange(prevPage);
  }

  generateScores = (e) => {
    e.preventDefault();

    if (Object.values(this.state.psaForm).filter((value) => {
      return !value;
    }).length) {
      this.setState({ formIncompleteError: true });
    }
    else {
      const { riskFactors, scores } = getScoresAndRiskFactors(this.state.psaForm);
      this.setState({
        formIncompleteError: false,
        riskFactors,
        scores,
        scoresWereGenerated: true
      });
      const formattedScores = {
        [NVCA_FLAG_FQN]: [scores.nvcaFlag],
        [NCA_SCALE_FQN]: [scores.ncaScale],
        [FTA_SCALE_FQN]: [scores.ftaScale]
      };
      this.submitEntities(formattedScores);
      this.nextPage();
    }
  }

  clear = () => {
    this.setState(INITIAL_STATE.toJS());
    this.props.actions.clearForm();
  }

  renderPersonSection = () => {
    return <SelectedPersonInfo personDetails={this.props.selectedPerson} />;
  }

  renderPretrialCaseSection = () => {
    const { selectedPretrialCase, pretrialCaseDataModel, charges } = this.props;
    if (!selectedPretrialCase || !Object.keys(selectedPretrialCase).length) return null;
    return (
      <div>
        <Divider />
        <SelectedPretrialCaseInfo
            pretrialCaseDetails={selectedPretrialCase}
            charges={charges}
            propertyTypes={pretrialCaseDataModel.propertyTypes} />
      </div>
    );
  }

  renderPSAInputForm = () => {
    return (
      <PSAInputForm
          handleSingleSelection={this.handleSingleSelection}
          handleSubmit={this.generateScores}
          section="psaForm"
          input={this.state.psaForm}
          incompleteError={this.state.formIncompleteError} />
    );
  }

  renderPSASection = () => {
    if (!this.state.scoresWereGenerated) return this.renderPSAInputForm();
    return <PSAResults scores={this.state.scores} formValues={this.state.psaForm} />;
  }

  renderRecommendationSection = () => {
    if (!this.state.scoresWereGenerated) return null;
    return (
      <ResultsContainer>
        <RecommendationWrapper>
          <SmallHeader>Release recommendation:</SmallHeader>
          <InlineEditableControl
              type="text"
              value={this.state.releaseRecommendation}
              onChange={(releaseRecommendation) => {
                this.props.actions.updateRecommendation(
                  releaseRecommendation,
                  this.state.releaseRecommendationId,
                  this.props.releaseRecommendationDataModel);
                this.setState({ releaseRecommendation });
              }}
              size="medium_small" />
        </RecommendationWrapper>
      </ResultsContainer>
    );
  }

  renderExportButton = () => {
    if (!this.state.scoresWereGenerated) return null;
    return (
      <ButtonWrapper>
        <Button
            bsStyle="info"
            onClick={() => {
              exportPDF(this.state, this.props.selectedPretrialCase, this.props.selectedPerson, this.props.charges);
            }}>Export as PDF</Button>
      </ButtonWrapper>
    );
  }

  renderClearButton = () => {
    if (!this.state.scoresWereGenerated) return null;
    return (
      <ButtonWrapper>
        <Button bsStyle="primary" bsSize="small" onClick={this.clear}>Restart</Button>
      </ButtonWrapper>
    );
  }

  handleClose = () => {
    this.clear();
    this.handlePageChange(Routes.DASHBOARD);
  }

  handlePageChange = (path) => {
    this.props.history.push(path);
  };

  getSearchPeopleSection = () => {
    return (
      <SearchPersonContainer onSelectPerson={(person, entityKeyId) => {
        this.handleSelectPerson(person, entityKeyId);
        this.nextPage();
      }} />
    );
  };

  getSelectPretrialCaseSection = () => {
    return (
      <SelectPretrialCaseContainer
        caseOptions={Immutable.fromJS(this.props.pretrialCaseOptions)}
        nextPage={this.nextPage}
        prevPage={this.prevPage}
        onSelectCase={(selectedCase) => {
          this.props.actions.selectPretrialCase(selectedCase.toJS());
          this.nextPage();
        }} />
    );
  }

  getPsaInputForm = () => {
    const personId = this.props.selectedPerson.id;
    if (!personId || !personId.length) {
      this.props.history.push(`${Routes.PSA_FORM}/1`);
      return null;
    }
    return (
      <div>
        {this.renderPersonSection()}
        {this.renderPretrialCaseSection()}
        {this.renderPSAInputForm()}
      </div>
    );
  }

  getPsaResults = () => {
    const personId = this.props.selectedPerson.id;
    if (!personId || !personId.length || !this.state.scoresWereGenerated) {
      this.props.history.push(`${Routes.PSA_FORM}/1`);
      return null;
    }
    return (
      <div>
        <PSAResults scores={this.state.scores} formValues={this.state.psaForm} />
        {this.renderRecommendationSection()}
        {this.renderExportButton()}
      </div>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Public Safety Assessment</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            <StyledTopFormNavBuffer />
            <Switch>
              <Route path={`${Routes.PSA_FORM}/1`} render={this.getSearchPeopleSection} />;
              <Route path={`${Routes.PSA_FORM}/2`} render={this.getSelectPretrialCaseSection} />;
              <Route path={`${Routes.PSA_FORM}/3`} render={this.getPsaInputForm} />;
              <Route path={`${Routes.PSA_FORM}/4`} render={this.getPsaResults} />;
              <Redirect from={Routes.PSA_FORM} to={`${Routes.PSA_FORM}/1`} />
              <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
              </Switch>
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state :Map<>) :Object {
  const psaForm = state.get('psa');

  return {
    personDataModel: psaForm.get('personDataModel'),
    pretrialCaseDataModel: psaForm.get('pretrialCaseDataModel'),
    riskFactorsDataModel: psaForm.get('riskFactorsDataModel'),
    psaDataModel: psaForm.get('psaDataModel'),
    releaseRecommendationDataModel: psaForm.get('releaseRecommendationDataModel'),
    calculatedForDataModel: psaForm.get('calculatedForDataModel'),
    pretrialCaseOptions: psaForm.get('pretrialCaseOptions'),
    charges: psaForm.get('charges'),
    peopleOptions: psaForm.get('peopleOptions'),
    selectedPerson: psaForm.get('selectedPerson'),
    selectedPretrialCase: psaForm.get('selectedPretrialCase')
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });
  Object.keys(PersonActionFactory).forEach((action :string) => {
    actions[action] = PersonActionFactory[action];
  });
  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch),
      loadDataModelElements: () => {
        dispatch(FormActionFactory.loadPersonDataModel());
        dispatch(FormActionFactory.loadPretrialCaseDataModel());
        dispatch(FormActionFactory.loadRiskFactorsDataModel());
        dispatch(FormActionFactory.loadPsaDataModel());
        dispatch(FormActionFactory.loadReleaseRecommendationDataModel());
        dispatch(FormActionFactory.loadCalculatedForDataModel());
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
