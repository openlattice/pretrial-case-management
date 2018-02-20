/*
 * @flow
 */

import React from 'react';

import PropTypes from 'prop-types';
import Immutable from 'immutable';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import FontAwesome from 'react-fontawesome';
import { AuthUtils } from 'lattice-auth';
import { Button, ProgressBar } from 'react-bootstrap';
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
import { tryAutofillFields } from '../../utils/AutofillUtils';
import { PROPERTY_TYPES, ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const {
  PERSON_ID,
  TIMESTAMP_FQN,
  NVCA_FLAG_FQN,
  NCA_SCALE_FQN,
  FTA_SCALE_FQN,
  GENERAL_ID_FQN,
  COMPLETED_DATE_TIME,
  RELEASE_RECOMMENDATION_FQN
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

const LoadingContainer = styled.div`
  text-align: center;
`;

const LoadingText = styled.div`
  font-size: 20px;
  margin: 20px;
  display: inline-flex;
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
      loadPersonDetailsRequest: PropTypes.func.isRequired,
      setPSAValues: PropTypes.func.isRequired
    }).isRequired,
    dataModel: PropTypes.instanceOf(Immutable.Map).isRequired,
    entitySetLookup: PropTypes.instanceOf(Immutable.Map).isRequired,
    selectedPerson: PropTypes.object.isRequired,
    selectedPretrialCase: PropTypes.object.isRequired,
    pretrialCaseOptions: PropTypes.instanceOf(Immutable.List).isRequired,
    charges: PropTypes.instanceOf(Immutable.List).isRequired,
    peopleOptions: PropTypes.array.isRequired,
    allChargesForPerson: PropTypes.instanceOf(Immutable.List).isRequired,
    selectedPersonId: PropTypes.string.isRequired,
    isLoadingCases: PropTypes.bool.isRequired,
    numCasesToLoad: PropTypes.number.isRequired,
    numCasesLoaded: PropTypes.number.isRequired,
    psaForm: PropTypes.instanceOf(Immutable.Map).isRequired
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
      allChargesForPerson,
      psaForm,
      actions
    } = nextProps;
    if (Object.keys(selectedPretrialCase).size
      || charges.size
      || pretrialCaseOptions.size
      || allChargesForPerson.size) {
      actions.setPSAValues(Immutable.fromJS(tryAutofillFields(
        selectedPretrialCase,
        charges,
        pretrialCaseOptions,
        allChargesForPerson,
        this.props.selectedPretrialCase,
        this.props.selectedPerson,
        psaForm
      )));
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  handleSingleSelection = (e) => {
    this.props.actions.setPSAValues(Immutable.fromJS({ [e.target.name]: e.target.value }));
  }

  getCalculatedForEntityDetails = () => ({ [TIMESTAMP_FQN]: [new Date()] })

  getBlankReleaseRecommendationEntity = () => {
    let generalId;
    let notesId;
    this.getPropertyTypes(RELEASE_RECOMMENDATIONS).forEach((pt) => {
      const fqn = this.getFqn(pt);
      const ptId = pt.get('id');
      if (fqn === GENERAL_ID_FQN) generalId = ptId;
      else if (fqn === RELEASE_RECOMMENDATION_FQN) notesId = ptId;
    });
    if (!generalId || !notesId) return {};
    const id = randomUUID();

    return {
      details: {
        [generalId]: [id],
        [notesId]: [this.state.releaseRecommendation]
      },
      key: {
        entityId: id,
        entitySetId: this.props.entitySetLookup.get(RELEASE_RECOMMENDATIONS)
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
      if (details[fqn]) Object.assign(basicEntity, { [fqnToId.get(fqn)]: details[fqn] });
    });
    return basicEntity;
  }

  getEntity = (entityDetails, entitySetName, isExistingEntity, useRandomId) => {
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

    const details = (isExistingEntity)
      ? this.getEntityWithUuids(entityDetails, primaryKeys, fqnToId)
      : this.getEntityWithUuids(entityDetails, Object.keys(entityDetails), fqnToId);

    const entityId = useRandomId ? randomUUID() : this.getEntityId(details, entityType.get('key'));
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
    const { riskFactors } = getScoresAndRiskFactors(this.props.psaForm.toJS());
    const calculatedForEntityDetails = this.getCalculatedForEntityDetails();
    const releaseRecommendationEntity = this.getBlankReleaseRecommendationEntity();
    const assessedByEntityDetails = this.getAssessedByEntityDetails();

    const personEntity = this.getEntity(this.props.selectedPerson, PEOPLE, true);
    const pretrialCaseEntity = this.getEntity(this.props.selectedPretrialCase, PRETRIAL_CASES, true);
    const riskFactorsEntity = this.getEntity(riskFactors, PSA_RISK_FACTORS, false, true);
    const psaEntity = this.getEntity(scores, PSA_SCORES, false, true);
    const calculatedForEntity = this.getEntity(calculatedForEntityDetails, CALCULATED_FOR);
    const staffEntity = this.getEntity(this.getStaffEntityDetails(), STAFF);
    const assessedByEntity = this.getEntity(assessedByEntityDetails, ASSESSED_BY);

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

  getFqn = propertyType => `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`

  handleSelectPerson = (person, entityKeyId) => {
    this.props.actions.selectPerson(person.toJS());
    this.props.actions.loadPersonDetailsRequest(entityKeyId, true);
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

    if (this.props.psaForm.valueSeq().filter(value => value === null).size) {
      this.setState({ formIncompleteError: true });
    }
    else {
      const { riskFactors, scores } = getScoresAndRiskFactors(this.props.psaForm.toJS());
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
    const { selectedPretrialCase, charges } = this.props;
    if (!selectedPretrialCase || !Object.keys(selectedPretrialCase).length) return null;
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
        incompleteError={this.state.formIncompleteError} />
  )

  renderPSASection = () => {
    if (!this.state.scoresWereGenerated) return this.renderPSAInputForm();
    return <PSAResults scores={this.state.scores} riskFactors={this.state.riskFactors} />;
  }

  handleReleaseRecommendationUpdate = (releaseRecommendation) => {
    if (this.state.scoresWereGenerated) {
      this.props.actions.updateRecommendation(
        releaseRecommendation,
        this.state.releaseRecommendationId,
        this.props.entitySetLookup.get(RELEASE_RECOMMENDATIONS),
        this.getPropertyTypes(RELEASE_RECOMMENDATIONS));
    }
    this.setState({ releaseRecommendation });
  }

  renderRecommendationSection = () => (
    <ResultsContainer>
      <RecommendationWrapper>
        <SmallHeader>Release notes:</SmallHeader>
        <InlineEditableControl
            type="text"
            value={this.state.releaseRecommendation}
            onChange={this.handleReleaseRecommendationUpdate}
            size="medium_small" />
      </RecommendationWrapper>
    </ResultsContainer>
  )

  setMultimapToMap = (setMultimap) => {
    const map = {};
    Object.keys(setMultimap).forEach((key) => {
      map[key] = setMultimap[key][0];
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
              exportPDF(
                Object.assign({}, this.state, { riskFactors: this.setMultimapToMap(this.state.riskFactors) }),
                selectedPretrialCase,
                selectedPerson,
                pretrialCaseOptions.toJS(),
                allChargesForPerson.toJS()
              );
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
        actions.loadNeighbors(entitySetLookup.get(PEOPLE), selectedPersonId);
      }
      const progress = Math.floor((numCasesLoaded / numCasesToLoad) * 100);
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
            actions.selectPretrialCase(selectedCase.toJS());
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
        {this.renderRecommendationSection()}
      </div>
    );
  }

  getPsaResults = () => {
    const { scoresWereGenerated, scores, riskFactors } = this.state;
    const personId = this.props.selectedPerson.id;
    if (!personId || !personId.length || !scoresWereGenerated) {
      this.props.history.push(`${Routes.PSA_FORM}/1`);
      return null;
    }
    return (
      <div>
        <PSAResults scores={scores} riskFactors={riskFactors} />
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
  const search = state.get('search');

  return {
    dataModel: psaForm.get('dataModel'),
    entitySetLookup: psaForm.get('entitySetLookup'),
    pretrialCaseOptions: psaForm.get('pretrialCaseOptions'),
    charges: psaForm.get('charges'),
    peopleOptions: psaForm.get('peopleOptions'),
    selectedPerson: psaForm.get('selectedPerson'),
    selectedPretrialCase: psaForm.get('selectedPretrialCase'),
    allChargesForPerson: psaForm.get('allChargesForPerson'),
    psaForm: psaForm.get('psa'),

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
      ...bindActionCreators(actions, dispatch),
      loadDataModelElements: () => {
        dispatch(FormActionFactory.loadDataModelRequest());
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
