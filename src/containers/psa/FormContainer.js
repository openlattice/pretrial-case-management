/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import moment from 'moment';
import qs from 'query-string';
import { AuthUtils } from 'lattice-auth';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';

import BasicButton from '../../components/buttons/BasicButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModalView';
import SearchPersonContainer from '../person/SearchPersonContainer';
import SelectArrestContainer from '../pages/arrest/SelectArrestContainer';
import SelectChargesContainer from '../pages/arrest/SelectChargesContainer';
import StyledSelect from '../../components/StyledSelect';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSASubmittedPage from '../../components/psainput/PSASubmittedPage';
import ProgressBar from '../../components/controls/ProgressBar';
import PersonCard from '../../components/person/PersonCard';
import PendingPSAsPersonCard from '../../components/person/PersonCardReview';
import ArrestCard from '../../components/arrest/ArrestCard';
import ChargeTable from '../../components/charges/ChargeTable';
import PSAReviewReportsRowList from '../review/PSAReviewReportsRowList';
import exportPDF from '../../utils/PDFUtils';
import psaConfig from '../../config/formconfig/PsaConfig';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { STATE, PSA_FORM, SUBMIT, SEARCH } from '../../utils/consts/FrontEndStateConsts';

import * as FormActionFactory from './FormActionFactory';
import * as PersonActionFactory from '../person/PersonActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as Routes from '../../core/router/Routes';

import { toISODateTime } from '../../utils/FormattingUtils';
import { getScoresAndRiskFactors, calculateDMF, getDMFRiskFactors } from '../../utils/ScoringUtils';
import {
  ButtonWrapper,
  StyledFormWrapper,
  StyledSectionWrapper
} from '../../utils/Layout';
import {
  getNextPath,
  getPrevPath,
  getCurrentPage
} from '../../utils/Helpers';
import { tryAutofillFields } from '../../utils/AutofillUtils';
import { CONTEXT, DMF, ID_FIELD_NAMES, NOTES, PSA, PSA_STATUSES } from '../../utils/consts/Consts';
import { PROPERTY_TYPES, ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { STATUS_OPTIONS_FOR_PENDING_PSAS } from '../../utils/consts/ReviewPSAConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';

const { OPENLATTICE_ID_FQN } = Constants;

const { PEOPLE } = ENTITY_SETS;

const PSARowListHeader = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
  padding: 0 30px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PSARowListSubHeader = styled.div`
  width: 100%;
  max-width: 713px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
`;

const LoadingContainer = styled(StyledFormWrapper)`
  align-items: center;
  padding: 0 30px 30px 30px;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  background-color: #ffffff;
`;

const LoadingText = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  margin: 20px;
  display: inline-flex;
`;

const Header = styled.h1`
  font-size: 18px;
  margin: 30px 0;
`;

const PaddedSectionWrapper = styled(StyledSectionWrapper)`
  margin-bottom: 20px;
  padding: 30px;
`;

const PSAFormTitle = styled(PaddedSectionWrapper)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: #555e6f;
  }
`;

const CenteredListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DiscardButton = styled(BasicButton)`
  padding: 12px 45px;
  font-size: 14px;
  font-weight: 600;
  width: 141px;
  height: 43px;
`;

const ContextItem = styled(StyledSectionWrapper)`
  width: 470px;
  padding: 30px;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${props => (props.left ? 'flex-start' : 'space-between')};
  align-items: center;
  width: 100%;
  margin-bottom: 20px;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: #555e6f;
  }

  div {
    display: inline-block;
    height: 25px;
    text-transform: uppercase;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    border-radius: 3px;
    border: solid 1px #8e929b;
    padding: 5px 7px;
  }

  span {
    margin-left: 10px;
    border-radius: 10px;
    background-color: #f0f0f7;
    color: #8e929b;
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    padding: 2px 12px;
    font-weight: 600;
  }
`;

const PSAReviewRowListContainer = styled.div`
  width: 960px;
  padding: 0;
  ${BasicButton} {
    margin-bottom: 10px;
  }
`;

const ContextRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ChargeTableWrapper = styled.div`
  margin-bottom: -20px;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  width: 25%;
  span {
    margin-top: 10px;
  }
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
  status: STATUS_OPTIONS_FOR_PENDING_PSAS.OPEN.value,
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
  psaIdClosing: undefined,
  skipClosePSAs: false,
  psaId: undefined
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
    loadPersonDetailsRequest :(personId :string, shouldFetchCases :boolean) => void,
    setPSAValues :(value :{
      newValues :Immutable.Map<*, *>
    }) => void,
    submit :({ config :Object, values :Object }) => void,
    clearSubmit :() => void,
    changePSAStatus :(values :{
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>,
      callback? :() => void
    }) => void
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
  openPSAs :Immutable.Map<*, *>,
  allPSAs :Immutable.List<*>,
  allHearings :Immutable.List<*>,
  selectedPersonId :string,
  isLoadingNeighbors :boolean,
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
  state :string,
  personForm :Immutable.Map<*, *>,
  riskFactors :{},
  dmfRiskFactors :{},
  scores :{},
  dmf :{},
  scoresWereGenerated :boolean,
  psaIdClosing :?string,
  skipClosePSAs :boolean
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

  loadContextParams = () => {
    const hashSplit = window.location.hash.split('?');
    if (hashSplit.length > 1) {
      const params = qs.parse(hashSplit[1]);
      if (params.context) {
        const newValues = Immutable.Map().set(DMF.COURT_OR_BOOKING, params.context);
        this.props.actions.setPSAValues({ newValues });
        return true;
      }
    }
    return false;
  }

  redirectToFirstPageIfNecessary = () => {
    const { psaForm, history } = this.props;
    const { scoresWereGenerated } = this.state;
    const loadedContextParams = this.loadContextParams();
    if (loadedContextParams) {
      history.push(`${Routes.PSA_FORM}/1`);
    }
    else if (!psaForm.get(DMF.COURT_OR_BOOKING)) {
      history.push(Routes.DASHBOARD);
    }
    else if ((!this.props.selectedPerson.size || !scoresWereGenerated) && !window.location.href.endsWith('1')) {
      history.push(`${Routes.PSA_FORM}/1`);
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

    const psaId = randomUUID();

    values[ID_FIELD_NAMES.PSA_ID] = [psaId];
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
    this.setState({ psaId });
  }

  getFqn = propertyType => `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`

  handleSelectPerson = (selectedPerson, entityKeyId) => {
    this.props.actions.selectPerson({ selectedPerson });
    this.props.actions.loadPersonDetailsRequest(entityKeyId, true);
    this.props.actions.loadNeighbors({
      entitySetId: this.props.entitySetLookup.get(PEOPLE),
      entityKeyId
    });
  }

  nextPage = () => {
    const nextPage = getNextPath(window.location, numPages);
    this.handlePageChange(nextPage);
  }

  prevPage = () => {
    const prevPage = getPrevPath(window.location);
    this.handlePageChange(prevPage);
  }

  generateScores = () => {
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

  renderDiscardButton = () => <DiscardButton onClick={this.handleClose}>Discard</DiscardButton>;

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

  handlePageChange = (path :string) => {
    this.props.actions.clearSubmit();
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

  closePSA = (scores, status, failureReason) => {
    const { actions, selectedPersonId, entitySetLookup } = this.props;
    const scoresId = scores.getIn([OPENLATTICE_ID_FQN, 0]);
    let scoresEntity = scores.remove('id').remove(OPENLATTICE_ID_FQN);
    scoresEntity = scoresEntity.set(PROPERTY_TYPES.STATUS, Immutable.List.of(status));
    if (failureReason.length) {
      scoresEntity = scoresEntity.set(PROPERTY_TYPES.FAILURE_REASON, Immutable.fromJS(failureReason));
    }

    const callback = () => {
      actions.loadNeighbors({
        entitySetId: entitySetLookup.get(PEOPLE),
        entityKeyId: selectedPersonId
      });
    };

    actions.changePSAStatus({
      scoresId,
      scoresEntity,
      callback
    });
  }

  renderPendingPSAsHeader = () => (
    <PSARowListHeader>
      <Header>Close Pending PSAs</Header>
      <BasicButton onClick={() => this.setState({ skipClosePSAs: true })}>Skip</BasicButton>
    </PSARowListHeader>
  )

  renderPendingPSAListContent = () => (
    <PSARowListSubHeader>
      <FilterWrapper>
        <span>PSA Status </span>
        <StyledSelect
            placeholder={this.state.status}
            classNamePrefix="lattice-select"
            options={Object.values(STATUS_OPTIONS_FOR_PENDING_PSAS)}
            onChange={
              e => (this.setState({ status: e.label }))
            } />
      </FilterWrapper>
    </PSARowListSubHeader>
  )

  renderPendingPSASubContent = () => (
    <PendingPSAsPersonCard person={this.props.selectedPerson} />
  )

  getPendingPSAs = () => {
    const {
      actions,
      entitySetLookup,
      selectedPersonId,
      allPSAs,
      openPSAs
    } = this.props;
    const { status } = this.state;
    const PSAScores = status === STATUS_OPTIONS_FOR_PENDING_PSAS.OPEN.label ?
      allPSAs.filter(scores => openPSAs.has(scores.getIn([OPENLATTICE_ID_FQN, 0]))) :
      this.props.allPSAs;
    if (!PSAScores.size) return null;
    const scoreSeq = PSAScores.map(obj => ([obj.getIn([OPENLATTICE_ID_FQN, 0]), obj]));
    return (
      <CenteredListWrapper>
        {this.renderPendingPSAsHeader()}
        <PSAReviewRowListContainer>
          <PSAReviewReportsRowList
              scoreSeq={scoreSeq}
              renderContent={this.renderPendingPSAListContent}
              renderSubContent={this.renderPendingPSASubContent}
              component={CONTENT_CONSTS.PENDING_PSAS}
              onStatusChangeCallback={() => {
                actions.loadNeighbors({
                  entitySetId: entitySetLookup.get(PEOPLE),
                  entityKeyId: selectedPersonId
                });
                actions.clearSubmit();
              }} />
        </PSAReviewRowListContainer>
      </CenteredListWrapper>
    );
  }

  getSelectArrestSection = () => {
    const {
      selectedPersonId,
      isLoadingCases,
      isLoadingNeighbors,
      numCasesToLoad,
      numCasesLoaded,
      entitySetLookup,
      arrestOptions,
      psaForm,
      actions
    } = this.props;
    if (isLoadingCases && !isLoadingNeighbors) {
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
          <ProgressBar progress={progress} />
        </LoadingContainer>);
    }

    if (isLoadingNeighbors) {
      return <LoadingSpinner />;
    }

    const pendingPSAs = (this.state.skipClosePSAs || psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING)
      ? null : this.getPendingPSAs();
    return pendingPSAs || (
      <SelectArrestContainer
          clearSubmit={this.props.actions.clearSubmit}
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

  getSelectChargesSection = () => (
    <SelectChargesContainer
        defaultArrest={this.props.selectedPretrialCase}
        defaultCharges={this.props.charges}
        nextPage={this.nextPage}
        prevPage={this.prevPage}
        onSubmit={this.props.actions.addCaseAndCharges}
        county={this.props.psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.COURT_MINN
          ? DOMAIN.MINNEHAHA : DOMAIN.PENNINGTON} />
  );

  getPersonIdValue = () => this.props.selectedPerson.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');

  getPsaInputForm = () => {
    const { selectedPretrialCase, charges } = this.props;
    const personId = this.getPersonIdValue();
    const hasHistory = Number.parseInt(personId, 10).toString() === personId;
    return (
      <StyledFormWrapper>
        <PSAFormTitle>
          <h1>Public Safety Assessment</h1>
          {this.renderDiscardButton()}
        </PSAFormTitle>
        <ContextRow>
          <ContextItem>
            <HeaderRow>
              <h1>Person</h1>
              <div>{hasHistory ? 'Case history loaded from Odyssey' : 'No Odyssey case history'}</div>
            </HeaderRow>
            <div>
              <PersonCard person={this.props.selectedPerson} />
            </div>
          </ContextItem>
          <ContextItem>
            <ArrestCard
                arrest={selectedPretrialCase}
                component={CONTENT_CONSTS.FORM_CONTAINER} />
          </ContextItem>
        </ContextRow>
        <PaddedSectionWrapper>
          <HeaderRow left>
            <h1>Charges</h1>
            <span>{charges.size}</span>
          </HeaderRow>
          <ChargeTableWrapper><ChargeTable charges={charges} disabled /></ChargeTableWrapper>
        </PaddedSectionWrapper>
        <PSAInputForm
            handleInputChange={this.handleInputChange}
            handleSubmit={this.generateScores}
            input={this.props.psaForm}
            currCharges={this.props.charges}
            currCase={this.props.selectedPretrialCase}
            allCharges={this.props.allChargesForPerson}
            allSentences={this.props.allSentencesForPerson}
            allCases={this.props.allCasesForPerson}
            allFTAs={this.props.allFTAs}
            handleClose={this.handleClose} />
      </StyledFormWrapper>
    );
  }

  getOnExport = (isCompact) => {
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
      },
      false,
      isCompact);
  }

  getPsaResults = () => {
    const { isSubmitting, submitError } = this.props;
    const {
      scoresWereGenerated,
      scores,
      riskFactors,
      dmf,
      psaId
    } = this.state;

    const {
      allCasesForPerson,
      allChargesForPerson,
      allHearings,
      psaForm
    } = this.props;

    if (!scoresWereGenerated) return null;

    let chargesByCaseId = Immutable.Map();
    allChargesForPerson.forEach((charge) => {
      const caseNum = charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0];
      chargesByCaseId = chargesByCaseId.set(caseNum, chargesByCaseId.get(caseNum, Immutable.List()).push(charge));
    });

    return (
      <PSASubmittedPage
          isSubmitting={isSubmitting}
          scores={scores}
          riskFactors={riskFactors}
          dmf={dmf}
          personId={this.getPersonIdValue()}
          psaId={psaId}
          submitSuccess={!submitError}
          onClose={this.props.actions.hardRestart}
          charges={this.props.charges}
          notes={psaForm.get(PSA.NOTES)}
          allCases={allCasesForPerson}
          allCharges={chargesByCaseId}
          allHearings={allHearings}
          getOnExport={this.getOnExport} />
    );
  }

  renderPSAResultsModal = () => {
    const { isSubmitting, isSubmitted } = this.props;
    const currentPage = getCurrentPage(window.location);
    if (!currentPage || Number.isNaN(currentPage)) return null;
    if (currentPage < 4 || (!isSubmitting && !isSubmitted)) {
      return null;
    }

    return (
      <ConfirmationModal
          submissionStatus={isSubmitting || isSubmitted}
          pageContent={this.getPsaResults}
          handleModalButtonClick={this.props.actions.hardRestart} />
    );
  }

  render() {
    return (
      <div>
        <Switch>
          <Route path={`${Routes.PSA_FORM}/1`} render={this.getSearchPeopleSection} />;
          <Route path={`${Routes.PSA_FORM}/2`} render={this.getSelectArrestSection} />;
          <Route path={`${Routes.PSA_FORM}/3`} render={this.getSelectChargesSection} />;
          <Route path={`${Routes.PSA_FORM}/4`} render={this.getPsaInputForm} />;
          <Route path={`${Routes.PSA_FORM}`} render={this.getSearchPeopleSection} />;
          <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
        </Switch>
        { this.renderPSAResultsModal() }
      </div>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const psaForm = state.get(STATE.PSA);
  const search = state.get(STATE.SEARCH);
  const submit = state.get(STATE.SUBMIT);
  // TODO: review these state names so that consts can be used in all cases (psaForm & isLoadingCases)
  return {
    [PSA_FORM.ARREST_OPTIONS]: psaForm.get(PSA_FORM.ARREST_OPTIONS),
    [PSA_FORM.ALL_CASES]: psaForm.get(PSA_FORM.ALL_CASES),
    [PSA_FORM.ALL_CHARGES]: psaForm.get(PSA_FORM.ALL_CHARGES),
    [PSA_FORM.ALL_SENTENCES]: psaForm.get(PSA_FORM.ALL_SENTENCES),
    [PSA_FORM.ALL_FTAS]: psaForm.get(PSA_FORM.ALL_FTAS),
    [PSA_FORM.ALL_PSAS]: psaForm.get(PSA_FORM.ALL_PSAS),
    [PSA_FORM.ALL_HEARINGS]: psaForm.get(PSA_FORM.ALL_HEARINGS),
    [PSA_FORM.CHARGES]: psaForm.get(PSA_FORM.CHARGES),
    [PSA_FORM.SELECT_PERSON]: psaForm.get(PSA_FORM.SELECT_PERSON),
    [PSA_FORM.OPEN_PSAS]: psaForm.get(PSA_FORM.OPEN_PSAS),
    [PSA_FORM.ARREST_ID]: psaForm.get(PSA_FORM.ARREST_ID),
    [PSA_FORM.SELECT_PRETRIAL_CASE]: psaForm.get(PSA_FORM.SELECT_PRETRIAL_CASE),
    psaForm: psaForm.get(PSA_FORM.PSA),
    [PSA_FORM.DATA_MODEL]: psaForm.get(PSA_FORM.DATA_MODEL),
    [PSA_FORM.ENTITY_SET_LOOKUP]: psaForm.get(PSA_FORM.ENTITY_SET_LOOKUP),
    [PSA_FORM.LOADING_NEIGHBORS]: psaForm.get(PSA_FORM.LOADING_NEIGHBORS),

    [PSA_FORM.SUBMITTED]: submit.get(SUBMIT.SUBMITTED),
    [PSA_FORM.SUBMITTING]: submit.get(SUBMIT.SUBMITTING),
    [PSA_FORM.ERROR]: submit.get(SUBMIT.ERROR),

    [SEARCH.SELECTED_PERSON_ID]: search.get(SEARCH.SELECTED_PERSON_ID),
    isLoadingCases: search.get(SEARCH.LOADING_CASES),
    [SEARCH.NUM_CASES_TO_LOAD]: search.get(SEARCH.NUM_CASES_TO_LOAD),
    [SEARCH.NUM_CASES_LOADED]: search.get(SEARCH.NUM_CASES_LOADED)
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
  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
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
