/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import moment from 'moment';
import { AuthUtils } from 'lattice-auth';
import { Button, ProgressBar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModalView';
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

import { getScoresAndRiskFactors } from '../../utils/ScoringUtils';
import {
  ButtonWrapper,
  CloseX,
  Divider,
  RecommendationWrapper,
  ResultsContainer,
  SmallHeader,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';
import {
  getNextPath,
  getPrevPath
} from '../../utils/Helpers';
import { tryAutofillFields } from '../../utils/AutofillUtils';
import { PROPERTY_TYPES, ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const {
  PERSON_ID,
  TIMESTAMP,
  NVCA_FLAG,
  NCA_SCALE,
  FTA_SCALE,
  GENERAL_ID,
  COMPLETED_DATE_TIME,
  RELEASE_RECOMMENDATION
} = PROPERTY_TYPES;

const {
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  ASSESSED_BY,
  CALCULATED_FOR
} = ENTITY_SETS;

const LoadingContainer = styled.div`
  text-align: center;
`;

const LoadingText = styled.div`
  font-size: 20px;
  margin: 20px;
  display: inline-flex;
`;

const Status = styled.div`
  width: 100%;
  text-align: center;
  margin: 20px;
  font-size: 20px;
  font-weight: bold;
`;

const Success = styled(Status)`
  color: green;
`;

const Failure = styled(Status)`
  color: red;
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

const INITIAL_STATE = Immutable.fromJS({
  personForm: INITIAL_PERSON_FORM,
  formIncompleteError: false,
  riskFactors: {},
  scores: {
    ftaTotal: 0,
    ncaTotal: 0,
    nvcaTotal: 0,
    ftaScale: 0,
    ncaScale: 0,
    nvcaFlag: false
  },
  scoresWereGenerated: false,
  notes: '',
  notesId: undefined
});

const numPages = 3;

type Entity = {
  key :{
    entitySetId :string,
    entityId :string,
    syncId? :string
  },
  details :{}
};

type Props = {
  actions :{
    hardRestart :() => void;
    loadDataModel :() => void,
    loadNeighbors :(value :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    clearForm :() => void,
    submitData :(values :{
      personEntity :Entity,
      pretrialCaseEntity :Entity,
      riskFactorsEntity :Entity,
      psaEntity :Entity,
      notesEntity :Entity,
      staffEntity :Entity,
      calculatedForEntity :Entity,
      assessedByEntity :Entity
    }) => void,
    selectPerson :(value :{
      selectedPerson :Immutable.Map<*, *>
    }) => void,
    selectPretrialCase :(value :{
      selectedPretrialCase :Immutable.Map<*, *>
    }) => void,
    updateNotes :(value :{
      notes :string,
      entityId :string,
      entitySetId :string,
      propertyTypes :Immutable.List<*>
    }) => void,
    loadPersonDetailsRequest :(personId :string, shouldFetchCases :boolean) => void,
    setPSAValues :(value :{
      newValues :Immutable.Map<*, *>
    }) => void
  },
  isSubmitted :boolean,
  isSubmitting :boolean,
  submitError :boolean,
  dataModel :Immutable.Map<*, *>,
  entitySetLookup :Immutable.Map<*, *>,
  selectedPerson :Immutable.Map<*, *>,
  selectedPretrialCase :Immutable.Map<*, *>,
  pretrialCaseOptions :Immutable.List<*>,
  charges :Immutable.List<*>,
  allChargesForPerson :Immutable.List<*>,
  selectedPersonId :string,
  isLoadingCases :boolean,
  numCasesToLoad :number,
  numCasesLoaded :number,
  psaForm :Immutable.Map<*, *>,
  history :string[],
  location :{
    pathname :string
  }
};

type State = {
  personForm :Immutable.Map<*, *>,
  formIncompleteError :boolean,
  riskFactors :{},
  scores :{},
  scoresWereGenerated :boolean,
  notes :string,
  notesId :string
};

class Form extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE.toJS();
  }

  componentDidMount() {
    this.props.actions.loadDataModel();
    this.redirectToFirstPageIfNecessary();
  }

  redirectToFirstPageIfNecessary = () => {
    const { scoresWereGenerated } = this.state;
    if ((!this.props.selectedPerson.size || !scoresWereGenerated) && !window.location.href.endsWith('1')) {
      this.props.history.push(`${Routes.PSA_FORM}/1`);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      selectedPretrialCase,
      charges,
      pretrialCaseOptions,
      allChargesForPerson,
      psaForm,
      actions,
      location
    } = nextProps;
    if (location.pathname.endsWith('3') && !this.props.location.pathname.endsWith('3')) {
      actions.setPSAValues({
        newValues: tryAutofillFields(
          selectedPretrialCase,
          charges,
          pretrialCaseOptions,
          allChargesForPerson,
          this.props.selectedPerson,
          psaForm
        )
      });
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  handleSingleSelection = (e) => {
    const newValues = Immutable.fromJS({ [e.target.name]: e.target.value });
    this.props.actions.setPSAValues({ newValues });
  }

  getCalculatedForEntityDetails = () => ({ [TIMESTAMP]: [moment().toISOString()] })

  getBlankNotesEntity = () :Entity => {
    let generalId;
    let notesId;
    this.getPropertyTypes(RELEASE_RECOMMENDATIONS).forEach((pt) => {
      const fqn = this.getFqn(pt);
      const ptId = pt.get('id');
      if (fqn === GENERAL_ID) generalId = ptId;
      else if (fqn === RELEASE_RECOMMENDATION) notesId = ptId;
    });
    if (!generalId || !notesId) return {};
    const id = randomUUID();

    return {
      details: {
        [generalId]: [id],
        [notesId]: [this.state.notes]
      },
      key: {
        entityId: id,
        entitySetId: this.props.entitySetLookup.get(RELEASE_RECOMMENDATIONS)
      }
    };
  }

  getAssessedByEntityDetails = () => ({ [COMPLETED_DATE_TIME]: [moment().toISOString()] })

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
      if (details[fqn]) Object.assign(basicEntity, { [fqnToId.get(fqn)]: details[fqn] });
    });
    return basicEntity;
  }

  getEntity = (entityDetails, entitySetName, isExistingEntity, useRandomId) :Entity => {
    const { dataModel, entitySetLookup } = this.props;
    const entitySetId = entitySetLookup.get(entitySetName);
    let fqnToId = Immutable.Map();
    let keyIdToFqn = Immutable.Map();

    const entitySet = dataModel.getIn(['entitySets', entitySetId], Immutable.Map());
    const entityType = dataModel.getIn(['entityTypes', entitySet.get('entityTypeId')], Immutable.Map());

    entityType.get('properties', Immutable.List()).forEach((propertyTypeId) => {
      const propertyType = dataModel.getIn(['propertyTypes', propertyTypeId], Immutable.Map());
      const fqn = this.getFqn(propertyType);
      fqnToId = fqnToId.set(fqn, propertyTypeId);
      if (entityType.get('key').includes(propertyTypeId)) {
        keyIdToFqn = keyIdToFqn.set(propertyTypeId, fqn);
      }
    });

    const primaryKeys = entityType.get('key').map(id => keyIdToFqn.get(id)).toJS();
    const randomId = randomUUID();

    if (useRandomId) entityDetails[GENERAL_ID] = [randomId];
    const details = (isExistingEntity)
      ? this.getEntityWithUuids(entityDetails, primaryKeys, fqnToId)
      : this.getEntityWithUuids(entityDetails, Object.keys(entityDetails), fqnToId);

    const entityId = useRandomId ? randomId : this.getEntityId(details, entityType.get('key'));
    return {
      details,
      key: { entitySetId, entityId }
    };
  }

  getPropertyTypes = (entitySetName) => {
    const { dataModel, entitySetLookup } = this.props;
    const entitySetId = entitySetLookup.get(entitySetName);
    const entitySet = dataModel.getIn(['entitySets', entitySetId], Immutable.Map());
    const entityType = dataModel.getIn(['entityTypes', entitySet.get('entityTypeId')], Immutable.Map());
    return entityType.get('properties', Immutable.List())
      .map(propertyTypeId => dataModel.getIn(['propertyTypes', propertyTypeId]));
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
    const { riskFactors } = getScoresAndRiskFactors(this.props.psaForm);
    const calculatedForEntityDetails = this.getCalculatedForEntityDetails();
    const notesEntity = this.getBlankNotesEntity();
    const assessedByEntityDetails = this.getAssessedByEntityDetails();

    const personEntity = this.getEntity(this.props.selectedPerson.toJS(), PEOPLE, true);
    const pretrialCaseEntity = this.getEntity(this.props.selectedPretrialCase.toJS(), PRETRIAL_CASES, true);
    pretrialCaseEntity.key.entityId = this.props.selectedPretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0]);
    const riskFactorsEntity = this.getEntity(riskFactors, PSA_RISK_FACTORS, false, true);
    const psaEntity = this.getEntity(scores, PSA_SCORES, false, true);
    const calculatedForEntity = this.getEntity(calculatedForEntityDetails, CALCULATED_FOR);
    const staffEntity = this.getEntity(this.getStaffEntityDetails(), STAFF);
    const assessedByEntity = this.getEntity(assessedByEntityDetails, ASSESSED_BY);

    this.props.actions.submitData({
      personEntity,
      pretrialCaseEntity,
      riskFactorsEntity,
      psaEntity,
      notesEntity,
      staffEntity,
      calculatedForEntity,
      assessedByEntity
    });
    this.setState({ notesId: notesEntity.key.entityId });
  }

  getFqn = propertyType => `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`

  handleSelectPerson = (selectedPerson, entityKeyId) => {
    this.props.actions.selectPerson({ selectedPerson });
    this.props.actions.loadPersonDetailsRequest(entityKeyId, true);
  }

  nextPage = () => {
    const nextPage = getNextPath(window.location, numPages);
    this.handlePageChange(nextPage);
  }

  prevPage = () => {
    const prevPage = getPrevPath(window.location);
    this.handlePageChange(prevPage);
  }

  generateScores = (e) => {
    e.preventDefault();

    if (this.props.psaForm.valueSeq().filter(value => value === null).toList().size) {
      this.setState({ formIncompleteError: true });
    }
    else {
      const { riskFactors, scores } = getScoresAndRiskFactors(this.props.psaForm);
      this.setState({
        formIncompleteError: false,
        riskFactors,
        scores,
        scoresWereGenerated: true
      });
      const formattedScores = {
        [NVCA_FLAG]: [scores.nvcaFlag],
        [NCA_SCALE]: [scores.ncaScale],
        [FTA_SCALE]: [scores.ftaScale]
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
    const { selectedPretrialCase, charges } = this.props;
    if (!selectedPretrialCase.size) return null;
    return (
      <div>
        <Divider />
        <SelectedPretrialCaseInfo
            pretrialCaseDetails={selectedPretrialCase}
            charges={charges}
            propertyTypes={this.getPropertyTypes(PRETRIAL_CASES).toJS()} />
      </div>
    );
  }

  renderPSAInputForm = () => (
    <PSAInputForm
        handleSingleSelection={this.handleSingleSelection}
        handleSubmit={this.generateScores}
        input={this.props.psaForm}
        incompleteError={this.state.formIncompleteError}
        currCharges={this.props.charges}
        currCase={this.props.selectedPretrialCase}
        allCharges={this.props.allChargesForPerson}
        allCases={this.props.pretrialCaseOptions} />
  )

  renderPSASection = () => {
    if (!this.state.scoresWereGenerated) return this.renderPSAInputForm();
    return <PSAResults scores={this.state.scores} riskFactors={this.state.riskFactors} />;
  }

  handleNotesUpdate = (notes) => {
    if (this.state.scoresWereGenerated) {
      this.props.actions.updateNotes({
        notes,
        entityId: this.state.notesId,
        entitySetId: this.props.entitySetLookup.get(RELEASE_RECOMMENDATIONS),
        propertyTypes: this.getPropertyTypes(RELEASE_RECOMMENDATIONS)
      });
    }
    this.setState({ notes });
  }

  renderRecommendationSection = () => (
    <ResultsContainer>
      <RecommendationWrapper>
        <SmallHeader>Notes:</SmallHeader>
        <InlineEditableControl
            type="textarea"
            value={this.state.notes}
            onChange={this.handleNotesUpdate}
            size="medium_small" />
      </RecommendationWrapper>
    </ResultsContainer>
  )

  setMultimapToMap = (setMultimap) => {
    let map = Immutable.Map();
    Object.keys(setMultimap).forEach((key) => {
      map = map.set(key, setMultimap[key][0]);
    });
    return map;
  };

  renderExportButton = () => {
    if (!this.state.scoresWereGenerated) return null;
    const {
      selectedPretrialCase,
      selectedPerson,
      pretrialCaseOptions,
      allChargesForPerson
    } = this.props;
    return (
      <ButtonWrapper>
        <Button
            bsStyle="info"
            onClick={() => {
              exportPDF(Immutable.fromJS(this.state).set('riskFactors', this.setMultimapToMap(this.state.riskFactors)),
                selectedPretrialCase,
                selectedPerson,
                pretrialCaseOptions,
                allChargesForPerson,
                moment().toISOString());
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
    <SearchPersonContainer
        history={this.props.history}
        onSelectPerson={(person, entityKeyId) => {
          this.handleSelectPerson(person, entityKeyId);
          this.nextPage();
        }} />
  );

  getSelectPretrialCaseSection = () => {
    const {
      selectedPersonId,
      isLoadingCases,
      numCasesToLoad,
      numCasesLoaded,
      entitySetLookup,
      pretrialCaseOptions,
      actions
    } = this.props;
    if (isLoadingCases) {
      if (numCasesLoaded === numCasesToLoad) {
        actions.loadPersonDetailsRequest(selectedPersonId, false);
        actions.loadNeighbors({
          entitySetId: entitySetLookup.get(PEOPLE),
          entityKeyId: selectedPersonId
        });
      }
      const progress = (numCasesToLoad > 0) ? Math.floor((numCasesLoaded / numCasesToLoad) * 100) : 0;
      let loadingText = 'Loading cases';
      if (numCasesToLoad > 0) loadingText = `${loadingText} (${numCasesLoaded} / ${numCasesToLoad})`;
      return (
        <LoadingContainer>
          <LoadingText>{loadingText}</LoadingText>
          <ProgressBar bsStyle="success" now={progress} label={`${progress}%`} />
        </LoadingContainer>);
    }
    return (
      <SelectPretrialCaseContainer
          caseOptions={pretrialCaseOptions}
          nextPage={this.nextPage}
          prevPage={this.prevPage}
          onSelectCase={(selectedCase) => {
            actions.selectPretrialCase({ selectedPretrialCase: selectedCase });
            this.nextPage();
          }} />
    );
  }

  getPsaInputForm = () => (
    <div>
      {this.renderPersonSection()}
      {this.renderPretrialCaseSection()}
      {this.renderPSAInputForm()}
      {this.renderRecommendationSection()}
    </div>
  )

  getPsaResults = () => {
    const { isSubmitting, submitError } = this.props;
    const { scoresWereGenerated, scores, riskFactors } = this.state;
    if (!scoresWereGenerated) return null;
    let header;
    // if (isSubmitting) header = <Status>Submitting...</Status>;
    if (isSubmitting) {
      header = (
        <div>
          <LoadingText>Submitting...</LoadingText>
          <LoadingSpinner />
        </div>);
    }
    else {
      header = submitError ? (
        <Failure>An error occurred: unable to submit PSA.</Failure>
      ) : (
        <Success>PSA Successfully Submitted!</Success>
      );
    }
    return (
      <div>
        {header}
        <PSAResults scores={scores} riskFactors={riskFactors} />
        {this.renderRecommendationSection()}
        {this.renderExportButton()}
      </div>
    );
  }

  renderModal = () => {
    const { isSubmitting, isSubmitted } = this.props;
    if (!isSubmitting && !isSubmitted) {
      return null;
    }

    return (
      <ConfirmationModal
          submissionStatus={isSubmitting || isSubmitted}
          pageContent={this.getPsaResults}
          // Implement hard reset
          handleModalButtonClick={this.props.actions.hardRestart} />
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
              <Redirect from={Routes.PSA_FORM} to={`${Routes.PSA_FORM}/1`} />
              <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
            </Switch>
            { this.renderModal() }
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const psaForm = state.get('psa');
  const search = state.get('search');

  return {
    dataModel: psaForm.get('dataModel'),
    entitySetLookup: psaForm.get('entitySetLookup'),
    pretrialCaseOptions: psaForm.get('pretrialCaseOptions'),
    charges: psaForm.get('charges'),
    selectedPerson: psaForm.get('selectedPerson'),
    selectedPretrialCase: psaForm.get('selectedPretrialCase'),
    allChargesForPerson: psaForm.get('allChargesForPerson'),
    psaForm: psaForm.get('psa'),
    isSubmitted: psaForm.get('isSubmitted'),
    isSubmitting: psaForm.get('isSubmitting'),
    submitError: psaForm.get('submitError'),

    selectedPersonId: search.get('selectedPersonId'),
    isLoadingCases: search.get('loadingCases'),
    numCasesToLoad: search.get('numCasesToLoad'),
    numCasesLoaded: search.get('numCasesLoaded')
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
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
