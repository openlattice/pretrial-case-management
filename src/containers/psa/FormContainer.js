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
import SelectArrestContainer from '../pages/arrest/SelectArrestContainer';
import SelectChargesContainer from '../pages/arrest/SelectChargesContainer';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import SelectedPersonInfo from '../../components/person/SelectedPersonInfo';
import SelectedArrestInfo from '../../components/arrest/SelectedArrestInfo';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSAResults from '../../components/psainput/PSAResults';
import exportPDF from '../../utils/PDFUtils';
import psaConfig from '../../config/formconfig/PsaConfig';

import * as FormActionFactory from './FormActionFactory';
import * as PersonActionFactory from '../person/PersonActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as Routes from '../../core/router/Routes';

import { toISODateTime } from '../../utils/Utils';
import { getScoresAndRiskFactors, calculateDMF, getDMFRiskFactors } from '../../utils/ScoringUtils';
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
import { CONTEXT, DMF, ID_FIELD_NAMES, NOTES, PSA, PSA_STATUSES } from '../../utils/consts/Consts';
import { PROPERTY_TYPES, ENTITY_SETS } from '../../utils/consts/DataModelConsts';

const {
  PEOPLE,
  PRETRIAL_CASES,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS
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
  riskFactors: {},
  dmfRiskFactors: {},
  scores: {
    ftaTotal: 0,
    ncaTotal: 0,
    nvcaTotal: 0,
    [PROPERTY_TYPES.FTA_SCALE]: [0],
    [PROPERTY_TYPES.NCA_SCALE]: [0],
    [PROPERTY_TYPES.NVCA_FLAG]: [false]
  },
  dmf: {},
  scoresWereGenerated: false,
  notes: '',
  notesId: undefined
});

const numPages = 4;

type Props = {
  actions :{
    addCaseAndCharges :(value :{
      pretrialCase :Immutable.Map<*, *>,
      charges :Immutable.List<Immutable.Map<*, *>>
    }) => void,

    hardRestart :() => void;
    loadDataModel :() => void,
    loadNeighbors :(value :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    clearForm :() => void,
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
    }) => void,
    submit :({ config :Object, values :Object }) => void
  },
  isSubmitted :boolean,
  isSubmitting :boolean,
  submitError :boolean,
  dataModel :Immutable.Map<*, *>,
  entitySetLookup :Immutable.Map<*, *>,
  selectedPerson :Immutable.Map<*, *>,
  arrestId :string,
  selectedPretrialCase :Immutable.Map<*, *>,
  arrestOptions :Immutable.List<*>,
  charges :Immutable.List<*>,
  allCasesForPerson :Immutable.List<*>,
  allChargesForPerson :Immutable.List<*>,
  allSentencesForPerson :Immutable.List<*>,
  allFTAs :Immutable.List<*>,
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
  riskFactors :{},
  dmfRiskFactors :{},
  scores :{},
  dmf :{},
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
      allCasesForPerson,
      allChargesForPerson,
      allSentencesForPerson,
      allFTAs,
      psaForm,
      actions,
      location
    } = nextProps;
    if (location.pathname.endsWith('4') && !this.props.location.pathname.endsWith('4')) {
      actions.setPSAValues({
        newValues: tryAutofillFields(
          selectedPretrialCase,
          charges,
          allCasesForPerson,
          allChargesForPerson,
          allSentencesForPerson,
          allFTAs,
          this.props.selectedPerson,
          psaForm
        )
      });
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  handleInputChange = (e) => {
    const newValues = Immutable.fromJS({ [e.target.name]: e.target.value });
    this.props.actions.setPSAValues({ newValues });
  }

  getPropertyTypes = (entitySetName) => {
    const { dataModel, entitySetLookup } = this.props;
    const entitySetId = entitySetLookup.get(entitySetName);
    const entitySet = dataModel.getIn(['entitySets', entitySetId], Immutable.Map());
    const entityType = dataModel.getIn(['entityTypes', entitySet.get('entityTypeId')], Immutable.Map());
    return entityType.get('properties', Immutable.List())
      .map(propertyTypeId => dataModel.getIn(['propertyTypes', propertyTypeId]));
  }

  getStaffId = () => {
    const staffInfo = AuthUtils.getUserInfo();
    let staffId = staffInfo.id;
    if (staffInfo.email && staffInfo.email.length > 0) {
      staffId = staffInfo.email;
    }
    return staffId;
  }

  submitEntities = (scores, riskFactors, dmf) => {
    const staffId = this.getStaffId();

    const values = Object.assign(
      {},
      this.props.psaForm.toJS(),
      riskFactors,
      scores.toJS(),
      dmf
    );
    values[PSA.NOTES] = this.state.notes;

    values[ID_FIELD_NAMES.PSA_ID] = [randomUUID()];
    values[ID_FIELD_NAMES.RISK_FACTORS_ID] = [randomUUID()];
    values[ID_FIELD_NAMES.DMF_ID] = [randomUUID()];
    values[ID_FIELD_NAMES.DMF_RISK_FACTORS_ID] = [randomUUID()];
    values[ID_FIELD_NAMES.NOTES_ID] = [randomUUID()];
    values[ID_FIELD_NAMES.PERSON_ID] = [this.props.selectedPerson.getIn([PROPERTY_TYPES.PERSON_ID, 0])];
    values[ID_FIELD_NAMES.STAFF_ID] = [staffId];

    values[ID_FIELD_NAMES.TIMESTAMP] = toISODateTime(moment());

    Object.assign(values, this.props.selectedPretrialCase.toJS());
    values.charges = this.props.charges.toJS();
    if (this.props.arrestId.length) {
      values[ID_FIELD_NAMES.ARREST_ID] = [this.props.arrestId];
    }

    const config = psaConfig;

    if (values[DMF.COURT_OR_BOOKING] !== CONTEXT.BOOKING) {
      delete values[DMF.SECONDARY_RELEASE_CHARGES];
      delete values[NOTES[DMF.SECONDARY_RELEASE_CHARGES]];
    }

    this.props.actions.submit({ values, config });
    this.setState({ notesId: values[ID_FIELD_NAMES.NOTES_ID][0] });
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
    const { riskFactors, scores } = getScoresAndRiskFactors(this.props.psaForm);
    const dmf = calculateDMF(this.props.psaForm, scores);
    const dmfRiskFactors = getDMFRiskFactors(this.props.psaForm);
    this.setState({
      riskFactors,
      dmfRiskFactors,
      scores,
      dmf,
      scoresWereGenerated: true
    });
    this.submitEntities(scores.set(PROPERTY_TYPES.STATUS, Immutable.List.of(PSA_STATUSES.OPEN)), riskFactors, dmf);
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
        <SelectedArrestInfo
            arrest={selectedPretrialCase}
            charges={charges}
            propertyTypes={this.getPropertyTypes(PRETRIAL_CASES).toJS()} />
      </div>
    );
  }

  renderPSAInputForm = () => (
    <PSAInputForm
        handleInputChange={this.handleInputChange}
        handleSubmit={this.generateScores}
        input={this.props.psaForm}
        currCharges={this.props.charges}
        currCase={this.props.selectedPretrialCase}
        allCharges={this.props.allChargesForPerson}
        allSentences={this.props.allSentencesForPerson}
        allCases={this.props.allCasesForPerson}
        allFTAs={this.props.allFTAs} />
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
      charges,
      selectedPerson,
      arrestOptions,
      allChargesForPerson,
      allSentencesForPerson,
      allFTAs
    } = this.props;

    const data = Immutable.fromJS(this.state)
      .set('scores', this.state.scores)
      .set('riskFactors', this.setMultimapToMap(this.state.riskFactors))
      .set('psaRiskFactors', Immutable.fromJS(this.state.riskFactors))
      .set('dmfRiskFactors', Immutable.fromJS(this.state.dmfRiskFactors));

    return (
      <ButtonWrapper>
        <Button
            bsStyle="info"
            onClick={() => {
              exportPDF(data,
                selectedPretrialCase,
                charges,
                selectedPerson,
                arrestOptions,
                allChargesForPerson,
                allSentencesForPerson,
                allFTAs,
                {
                  user: this.getStaffId(),
                  timestamp: toISODateTime(moment())
                });
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

  getSelectArrestSection = () => {
    const {
      selectedPersonId,
      isLoadingCases,
      numCasesToLoad,
      numCasesLoaded,
      entitySetLookup,
      arrestOptions,
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
      const loadingText = numCasesToLoad > 0
        ? `Loading cases (${numCasesLoaded} / ${numCasesToLoad})`
        : 'Loading case history';
      return (
        <LoadingContainer>
          <LoadingText>{loadingText}</LoadingText>
          <ProgressBar bsStyle="success" now={progress} label={`${progress}%`} />
        </LoadingContainer>);
    }
    return (
      <SelectArrestContainer
          caseOptions={arrestOptions}
          nextPage={this.nextPage}
          prevPage={this.prevPage}
          onManualEntry={this.props.actions.addCaseAndCharges}
          onSelectCase={(selectedCase) => {
            actions.selectPretrialCase({ selectedPretrialCase: selectedCase });
            this.nextPage();
          }} />
    );
  }

  getSelectChargesSection = () => {
    return (
      <SelectChargesContainer
          defaultArrest={this.props.selectedPretrialCase}
          defaultCharges={this.props.charges}
          nextPage={this.nextPage}
          prevPage={this.prevPage}
          onSubmit={this.props.actions.addCaseAndCharges} />
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
    const {
      scoresWereGenerated,
      scores,
      riskFactors,
      dmf
    } = this.state;
    if (!scoresWereGenerated) return null;
    let header;

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
        <PSAResults scores={scores} riskFactors={riskFactors} dmf={dmf} />
        {this.renderRecommendationSection()}
        {this.renderExportButton()}
      </div>
    );
  }

  renderPSAResultsModal = () => {
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
              <Route path={`${Routes.PSA_FORM}/2`} render={this.getSelectArrestSection} />;
              <Route path={`${Routes.PSA_FORM}/3`} render={this.getSelectChargesSection} />;
              <Route path={`${Routes.PSA_FORM}/4`} render={this.getPsaInputForm} />;
              <Redirect from={Routes.PSA_FORM} to={`${Routes.PSA_FORM}/1`} />
              <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
            </Switch>
            { this.renderPSAResultsModal() }
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const psaForm = state.get('psa');
  const search = state.get('search');
  const submit = state.get('submit');

  return {
    dataModel: psaForm.get('dataModel'),
    entitySetLookup: psaForm.get('entitySetLookup'),
    arrestOptions: psaForm.get('arrestOptions'),
    charges: psaForm.get('charges'),
    selectedPerson: psaForm.get('selectedPerson'),
    arrestId: psaForm.get('arrestId'),
    selectedPretrialCase: psaForm.get('selectedPretrialCase'),
    allCasesForPerson: psaForm.get('allCasesForPerson'),
    allChargesForPerson: psaForm.get('allChargesForPerson'),
    allSentencesForPerson: psaForm.get('allSentencesForPerson'),
    allFTAs: psaForm.get('allFTAs'),
    psaForm: psaForm.get('psa'),
    isSubmitted: submit.get('submitted'),
    isSubmitting: submit.get('submitting'),
    submitError: submit.get('error'),

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
