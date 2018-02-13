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
import { AuthUtils } from 'lattice-auth';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import SearchPersonContainer from '../person/SearchPersonContainer';
import SelectPretrialCaseContainer from '../pages/pretrialcase/SelectPretrialCaseContainer';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
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
  Divider,
  RecommendationWrapper,
  ResultsContainer,
  SmallHeader
} from '../../utils/Layout';
import {
  getNextPath,
  getPrevPath
} from '../../utils/Helpers';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA } from '../../utils/consts/Consts';
import {
  chargeFieldIsViolent,
  degreeFieldIsFelony,
  degreeFieldIsMisdemeanor,
  dispositionFieldIsGuilty
} from '../../utils/consts/ChargeConsts';

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
  CASE_ID_FQN,
  CHARGE_ID_FQN,
  CHARGE_DEGREE_FQN,
  DISPOSITION,
  DISPOSITION_DATE,
  COMPLETED_DATE_TIME
} = PROPERTY_TYPES;

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 1300px;
`;

const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const StyledSectionWrapper = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 55px;
  width: 100%;
`;

const CloseX = styled(FontAwesome)`
  cursor: pointer;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
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
  [AGE_AT_CURRENT_ARREST]: null,
  [CURRENT_VIOLENT_OFFENSE]: null,
  [PENDING_CHARGE]: null,
  [PRIOR_MISDEMEANOR]: null,
  [PRIOR_FELONY]: null,
  [PRIOR_VIOLENT_CONVICTION]: null,
  [PRIOR_FAILURE_TO_APPEAR_RECENT]: null,
  [PRIOR_FAILURE_TO_APPEAR_OLD]: null,
  [PRIOR_SENTENCE_TO_INCARCERATION]: null
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
});

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
    staffDataModel: PropTypes.object.isRequired,
    calculatedForDataModel: PropTypes.object.isRequired,
    assessedByDataModel: PropTypes.object.isRequired,
    selectedPerson: PropTypes.object.isRequired,
    selectedPretrialCase: PropTypes.object.isRequired,
    pretrialCaseOptions: PropTypes.array.isRequired,
    charges: PropTypes.array.isRequired,
    peopleOptions: PropTypes.array.isRequired,
    allChargesForPerson: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE.toJS();
  }

  componentDidMount() {
    this.props.actions.loadDataModelElements();
  }

  componentWillReceiveProps(nextProps) {
    const {
      selectedPretrialCase,
      charges,
      pretrialCaseOptions,
      allChargesForPerson
    } = nextProps;
    if (Object.keys(selectedPretrialCase).length
      || charges.length
      || pretrialCaseOptions.length
      || allChargesForPerson.length) {
      this.tryAutofillFields(selectedPretrialCase, charges, pretrialCaseOptions, allChargesForPerson);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  // For text input
  handleTextInput = (e) => {
    const sectionKey = e.target.dataset.section;
    const { name, value } = e.target;
    const sectionState = this.state[sectionKey];
    sectionState[name] = value;
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
      if (e.target.name === PRIOR_MISDEMEANOR || e.target.name === PRIOR_FELONY) {
        if (sectionState[PRIOR_MISDEMEANOR] === 'false' && sectionState[PRIOR_FELONY] === 'false') {
          sectionState[PRIOR_VIOLENT_CONVICTION] = '0';
          sectionState[PRIOR_SENTENCE_TO_INCARCERATION] = 'false';
        }
      }
    }
    this.setState({ [sectionKey]: sectionState });
  }

  tryAutofillFields = (nextCase, nextCharges, allCases, allCharges) => {
    const currCase = this.props.selectedPretrialCase;

    let {
      ageAtCurrentArrest,
      currentViolentOffense,
      pendingCharge,
      priorMisdemeanor,
      priorFelony,
      priorViolentConviction
    } = this.state.psaForm;
    if (ageAtCurrentArrest === null || nextCase[ARREST_DATE_FQN] !== currCase[ARREST_DATE_FQN]) {
      ageAtCurrentArrest = this.tryAutofillAge(nextCase[ARREST_DATE_FQN], ageAtCurrentArrest);
    }
    if (nextCase[MOST_SERIOUS_CHARGE_NO] !== currCase[MOST_SERIOUS_CHARGE_NO] || (nextCharges && nextCharges.length)) {
      currentViolentOffense = this.tryAutofillCurrentViolentCharge(nextCharges, nextCase[MOST_SERIOUS_CHARGE_NO]);
    }
    if (pendingCharge === null || nextCase[ARREST_DATE_FQN] !== currCase[ARREST_DATE_FQN]) {
      pendingCharge = this.tryAutofillPendingCharge(
        nextCase[CASE_ID_FQN],
        nextCase[ARREST_DATE_FQN],
        allCases,
        allCharges,
        pendingCharge
      );
    }
    if (allCharges && allCharges.length) {
      if (priorMisdemeanor === null) {
        priorMisdemeanor = this.tryAutofillPreviousMisdemeanors(allCharges, priorMisdemeanor);
      }
      if (priorFelony === null) {
        priorFelony = this.tryAutofillPreviousFelonies(allCharges, priorFelony);
      }
      if (priorViolentConviction === null) {
        priorViolentConviction = this.tryAutofillPreviousViolentCharge(allCharges, priorViolentConviction);
      }
    }
    this.setState({
      psaForm: Object.assign(
        {},
        this.state.psaForm, {
          ageAtCurrentArrest,
          currentViolentOffense,
          pendingCharge,
          priorMisdemeanor,
          priorFelony,
          priorViolentConviction
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
      if (!Number.isNaN(age)) {
        if (age <= 20) ageAtCurrentArrestValue = '0';
        if (age === 21 || age === 22) ageAtCurrentArrestValue = '1';
        if (age >= 23) ageAtCurrentArrestValue = '2';
      }
    }
    return ageAtCurrentArrestValue;
  }

  tryAutofillPendingCharge = (currCaseNums, dateArrested, allCases, allCharges, defaultValue) => {
    if (!dateArrested || !dateArrested.length || !currCaseNums || !currCaseNums.length) return defaultValue;
    const currCaseNum = currCaseNums[0];
    const arrest = moment.utc(dateArrested[0]);
    const casesWithArrestBefore = [];
    const casesWithDispositionAfter = new Set();
    if (arrest.isValid) {
      let pending = false;
      allCases.forEach((caseDetails) => {
        const prevArrestDates = caseDetails[ARREST_DATE_FQN];
        if (prevArrestDates && prevArrestDates.length) {
          const prevArrestDate = moment.utc(prevArrestDates[0]);
          if (prevArrestDate.isValid && prevArrestDate.isBefore(arrest)) {
            const caseNum = caseDetails[CASE_ID_FQN][0];
            if (caseNum !== currCaseNum) casesWithArrestBefore.push(caseNum);
          }
        }
      });
      allCharges.forEach((chargeDetails) => {
        let caseNum;
        let shouldInclude = false;

        const chargeId = chargeDetails[CHARGE_ID_FQN][0];
        const caseNums = chargeId.split('|');
        if (caseNums && caseNums.length) {
          [caseNum] = caseNums;
        }

        const dispositionDates = chargeDetails[DISPOSITION_DATE];
        if (dispositionDates && dispositionDates.length) {
          const dispositionDate = moment.utc(dispositionDates[0]);
          if (dispositionDate.isValid && dispositionDate.isAfter(arrest)) {
            shouldInclude = true;
          }
        }
        else {
          shouldInclude = true;
        }

        if (shouldInclude && caseNum) {
          casesWithDispositionAfter.add(caseNum);
        }
      });
      if (casesWithArrestBefore.filter(caseNum => casesWithDispositionAfter.has(caseNum)).length) pending = true;
      return `${pending}`;
    }
    return defaultValue;
  }

  tryAutofillPreviousMisdemeanors = (allCharges) => {
    let previousMisdemeanors = false;
    allCharges.forEach((charge) => {
      if (dispositionFieldIsGuilty(charge[DISPOSITION]) && degreeFieldIsMisdemeanor(charge[CHARGE_DEGREE_FQN])) {
        previousMisdemeanors = true;
      }
    });

    return `${previousMisdemeanors}`;
  }

  tryAutofillPreviousFelonies = (allCharges) => {
    let previousFelonies = false;
    allCharges.forEach((charge) => {
      if (dispositionFieldIsGuilty(charge[DISPOSITION]) && degreeFieldIsFelony(charge[CHARGE_DEGREE_FQN])) {
        previousFelonies = true;
      }
    });

    return `${previousFelonies}`;
  }

  tryAutofillPreviousViolentCharge = (allCharges) => {
    let previousViolentCharge = 0;
    allCharges.forEach((charge) => {
      if (dispositionFieldIsGuilty(charge[DISPOSITION])
      && chargeFieldIsViolent(charge[CHARGE_NUM_FQN])
      && previousViolentCharge < 3) {
        previousViolentCharge += 1;
      }
    });

    return `${previousViolentCharge}`;
  }

  getCalculatedForEntityDetails = () => ({ [TIMESTAMP_FQN]: [new Date()] })

  getBlankReleaseRecommendationEntity = () => {
    const propertyType = this.props.releaseRecommendationDataModel.propertyTypes.filter(pt =>
      `${pt.type.namespace}.${pt.type.name}` === GENERAL_ID_FQN)[0];
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

  getAssessedByEntityDetails = () => ({ [COMPLETED_DATE_TIME]: [new Date()] })

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
    const primaryKeys = dataModel.entityType.key.map(id => keyIdToFqn[id]);
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

  getStaffEntityDetails = () => {
    const userInfo = AuthUtils.getUserInfo();
    let { id } = userInfo;
    if (userInfo.email && userInfo.email.length > 0) {
      id = userInfo.email;
    }
    return { [PERSON_ID]: [id] };
  }

  submitEntities = (scores) => {
    const { riskFactors } = getScoresAndRiskFactors(this.state.psaForm);
    const calculatedForEntityDetails = this.getCalculatedForEntityDetails();
    const releaseRecommendationEntity = this.getBlankReleaseRecommendationEntity();
    const assessedByEntityDetails = this.getAssessedByEntityDetails();

    const personEntity = this.getEntity(this.props.selectedPerson, this.props.personDataModel, true);
    const pretrialCaseEntity = this.getEntity(this.props.selectedPretrialCase, this.props.pretrialCaseDataModel, true);
    const riskFactorsEntity = this.getEntity(riskFactors, this.props.riskFactorsDataModel, false, true);
    const psaEntity = this.getEntity(scores, this.props.psaDataModel, false, true);
    const calculatedForEntity = this.getEntity(calculatedForEntityDetails, this.props.calculatedForDataModel);
    const staffEntity = this.getEntity(this.getStaffEntityDetails(), this.props.staffDataModel);
    const assessedByEntity = this.getEntity(assessedByEntityDetails, this.props.assessedByDataModel);

    this.props.actions.submitData(
      personEntity,
      pretrialCaseEntity,
      riskFactorsEntity,
      psaEntity,
      releaseRecommendationEntity,
      staffEntity,
      calculatedForEntity,
      assessedByEntity
    );
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

  renderPersonSection = () => <SelectedPersonInfo personDetails={this.props.selectedPerson} />

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

  renderPSAInputForm = () => (
    <PSAInputForm
        handleSingleSelection={this.handleSingleSelection}
        handleSubmit={this.generateScores}
        section="psaForm"
        input={this.state.psaForm}
        incompleteError={this.state.formIncompleteError} />
  )

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
            }}>Export as PDF
        </Button>
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

  getSearchPeopleSection = () => (
    <SearchPersonContainer onSelectPerson={(person, entityKeyId) => {
      this.handleSelectPerson(person, entityKeyId);
      this.nextPage();
    }} />
  );

  getSelectPretrialCaseSection = () => (
    <SelectPretrialCaseContainer
        caseOptions={Immutable.fromJS(this.props.pretrialCaseOptions)}
        nextPage={this.nextPage}
        prevPage={this.prevPage}
        onSelectCase={(selectedCase) => {
          this.props.actions.selectPretrialCase(selectedCase.toJS());
          this.nextPage();
        }} />
  )

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
    staffDataModel: psaForm.get('staffDataModel'),
    calculatedForDataModel: psaForm.get('calculatedForDataModel'),
    assessedByDataModel: psaForm.get('assessedByDataModel'),
    pretrialCaseOptions: psaForm.get('pretrialCaseOptions'),
    charges: psaForm.get('charges'),
    peopleOptions: psaForm.get('peopleOptions'),
    selectedPerson: psaForm.get('selectedPerson'),
    selectedPretrialCase: psaForm.get('selectedPretrialCase'),
    allChargesForPerson: psaForm.get('allChargesForPerson')
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
        dispatch(FormActionFactory.loadStaffDataModel());
        dispatch(FormActionFactory.loadCalculatedForDataModel());
        dispatch(FormActionFactory.loadAssessedByDataModel());
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
