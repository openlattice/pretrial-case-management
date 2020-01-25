/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import qs from 'query-string';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { fromJS, Map, List } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import { DateTime } from 'luxon';
import { Select } from 'lattice-ui-kit';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';

import BasicButton from '../../components/buttons/BasicButton';
import CaseLoaderError from '../person/CaseLoaderError';
import LogoLoader from '../../components/LogoLoader';
import ConfirmationModal from '../../components/ConfirmationModalView';
import SearchPersonContainer from '../person/SearchPersonContainer';
import SelectArrestContainer from '../pages/arrest/SelectArrestContainer';
import SelectChargesContainer from '../pages/arrest/SelectChargesContainer';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSASubmittedPage from '../../components/psainput/PSASubmittedPage';
import ProgressBar from '../../components/controls/ProgressBar';
import PersonCard from '../../components/person/PersonCard';
import PendingPSAsPersonCard from '../../components/person/PersonCardReview';
import ArrestCard from '../../components/arrest/ArrestCard';
import ChargeTable from '../../components/charges/ChargeTable';
import PSAReviewReportsRowList from '../review/PSAReviewReportsRowList';
import exportPDF from '../../utils/PDFUtils';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { OL } from '../../utils/consts/Colors';
import { getScoresAndRiskFactors, calculateDMF, getDMFRiskFactors } from '../../utils/ScoringUtils';
import { getOpenPSAs } from '../../utils/PSAUtils';
import { tryAutofillFields } from '../../utils/AutofillUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES_TO_PROPERTY_TYPES } from '../../utils/consts/DMFResultConsts';
import { STATUS_OPTIONS_FOR_PENDING_PSAS } from '../../utils/consts/ReviewPSAConsts';
import {
  getNeighborDetails,
  getEntityProperties,
  getFirstNeighborValue,
  getEntityKeyId
} from '../../utils/DataUtils';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  MODULE,
  SETTINGS
} from '../../utils/consts/AppSettingConsts';
import {
  CONTEXT,
  DMF,
  NOTES,
  PSA,
  PSA_STATUSES
} from '../../utils/consts/Consts';
import {
  CHARGES,
  PSA_NEIGHBOR,
  REVIEW,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';
import { StyledFormWrapper, StyledSectionWrapper } from '../../utils/Layout';
import {
  getNextPath,
  getPrevPath,
  getCurrentPage
} from '../../utils/Helpers';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';
import { PSA_FORM_ACTIONS, PSA_FORM_DATA } from '../../utils/consts/redux/PSAFormConsts';
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';

import * as Routes from '../../core/router/Routes';
import { loadPersonDetails, resetPersonAction } from '../person/PersonActions';
import { changePSAStatus, checkPSAPermissions } from '../review/ReviewActions';
import { goToPath, goToRoot } from '../../core/router/RoutingActionFactory';
import { clearSubmit } from '../../utils/submit/SubmitActionFactory';
import {
  addCaseAndCharges,
  clearForm,
  submitPSA,
  selectPerson,
  selectPretrialCase,
  setPSAValues
} from './PSAFormActions';


const { OPENLATTICE_ID_FQN } = Constants;

const {
  DMF_RESULTS,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  SUBSCRIPTION
} = APP_TYPES;

const {
  ENTITY_KEY_ID,
  GENERAL_ID,
  RELEASE_RECOMMENDATION
} = PROPERTY_TYPES;

const PSARowListHeader = styled.div`
  width: 100%;
  background: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
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
  border: 1px solid ${OL.GREY11};
  background-color: ${OL.WHITE};
`;

const LoadingText = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: ${OL.GREY01};
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
    color: ${OL.GREY01};
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
  justify-content: ${(props) => (props.left ? 'flex-start' : 'space-between')};
  align-items: center;
  width: 100%;
  margin-bottom: 20px;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: ${OL.GREY01};
  }

  div {
    display: inline-block;
    height: 25px;
    text-transform: uppercase;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: ${OL.GREY02};
    border-radius: 3px;
    border: solid 1px ${OL.GREY02};
    padding: 5px 7px;
  }

  span {
    margin-left: 10px;
    border-radius: 10px;
    background-color: ${OL.GREY08};
    color: ${OL.GREY02};
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

const INITIAL_PERSON_FORM = fromJS({
  id: '',
  lastName: '',
  firstName: '',
  middleName: '',
  dob: '',
  race: '',
  ethnicity: '',
  sex: ''
});

const INITIAL_STATE = fromJS({
  confirmationModalOpen: false,
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
    addCaseAndCharges :RequestSequence;
    changePSAStatus :RequestSequence;
    checkPSAPermissions :RequestSequence;
    clearForm :() => void;
    goToPath :(path :string) => void;
    goToRoot :() => void;
    loadPersonDetails :RequestSequence;
    selectPerson :RequestSequence;
    selectPretrialCase :(value :{
      selectedPretrialCase :Map<*, *>
    }) => void;
    setPSAValues :(value :{
      newValues :Map<*, *>
    }) => void;
    submitPSA :RequestSequence;
    resetPersonAction :(actionType :string) => void;
  };
  arrestCharges :Map;
  arrestChargesForPerson :List;
  allCasesForPerson :List;
  allChargesForPerson :List;
  allContacts :Map;
  allFTAs :List;
  allHearings :List;
  allSentencesForPerson :List;
  arrestId :string;
  arrestOptions :List;
  bookingHoldExceptionCharges :Map;
  bookingReleaseExceptionCharges :Map;
  courtCharges :Map;
  dmfStep2Charges :Map;
  dmfStep4Charges :Map;
  getPeopleNeighborsReqState :RequestState;
  history :string[];
  loadPersonDetailsReqState :RequestState;
  location :{
    pathname :string;
  };
  numCasesLoaded :number;
  numCasesToLoad :number;
  personNeighbors :Map;
  psaForm :Map;
  readOnlyPermissions :boolean;
  selectedOrganizationId :string;
  selectedPerson :Map;
  selectedPretrialCase :Map;
  selectedPretrialCaseCharges :List;
  selectedOrganizationSettings :Map;
  staffIdsToEntityKeyIds :Map;
  submittedPSA :Map;
  submittedPSANeighbors :Map;
  submitPSAReqState :RequestState;
  updateCasesReqState :RequestState;
  violentCourtCharges :Map;
  violentArrestCharges :Map;
};

type State = {
  state :string,
  personForm :Map<*, *>,
  riskFactors :{},
  dmfRiskFactors :{},
  scores :{},
  dmf :{},
  confirmationModalOpen :boolean,
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
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      actions.checkPSAPermissions();
    }
    this.redirectToFirstPageIfNecessary();
  }

  loadContextParams = () => {
    const { actions, selectedOrganizationSettings } = this.props;
    const hashSplit = window.location.hash.split('?');
    if (hashSplit.length > 1) {
      const params = qs.parse(hashSplit[1]);
      if (params.context) {
        const psaContext = params.context === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
        const caseContext = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, psaContext]);
        console.log(caseContext);
        const newValues = Map()
          .set(DMF.COURT_OR_BOOKING, params.context)
          .set(DMF.CASE_CONTEXT, caseContext);
        console.log(newValues.toJS());
        actions.setPSAValues({ newValues });
        return true;
      }
    }
    return false;
  }

  redirectToFirstPageIfNecessary = () => {
    const {
      psaForm,
      actions,
      selectedPerson
    } = this.props;
    const { scoresWereGenerated } = this.state;
    const loadedContextParams = this.loadContextParams();
    if (loadedContextParams) {
      actions.goToPath(`${Routes.PSA_FORM}/1`);
    }
    else if (!psaForm.get(DMF.COURT_OR_BOOKING)) {
      actions.goToPath(Routes.DASHBOARD);
    }
    else if ((!selectedPerson.size || !scoresWereGenerated) && !window.location.href.endsWith('1')) {
      actions.goToPath(`${Routes.PSA_FORM}/1`);
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedPerson } = prevProps;
    const {
      actions,
      allCasesForPerson,
      allChargesForPerson,
      allFTAs,
      allSentencesForPerson,
      selectedPretrialCaseCharges,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      dmfStep2Charges,
      dmfStep4Charges,
      location,
      psaForm,
      selectedOrganizationId,
      selectedPretrialCase,
      violentCourtCharges,
      violentArrestCharges
    } = this.props;
    const violentArrestChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    const dmfStep2ChargeList = dmfStep2Charges.get(selectedOrganizationId, Map());
    const dmfStep4ChargeList = dmfStep4Charges.get(selectedOrganizationId, Map());
    const bookingReleaseExceptionChargeList = bookingReleaseExceptionCharges.get(selectedOrganizationId, Map());
    const bookingHoldExceptionChargeList = bookingHoldExceptionCharges.get(selectedOrganizationId, Map());
    if (location.pathname.endsWith('4') && !prevProps.location.pathname.endsWith('4')) {
      actions.setPSAValues({
        newValues: tryAutofillFields(
          selectedPretrialCase,
          selectedPretrialCaseCharges,
          allCasesForPerson,
          allChargesForPerson,
          allSentencesForPerson,
          allFTAs,
          selectedPerson,
          psaForm,
          violentArrestChargeList,
          violentCourtChargeList,
          dmfStep2ChargeList,
          dmfStep4ChargeList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )
      });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    this.clear();
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.UPDATE_CASES });
  }

  handleInputChange = (e) => {
    const { actions } = this.props;
    const newValues = fromJS({ [e.target.name]: e.target.value });
    actions.setPSAValues({ newValues });
  }

  getStaffId = () => {
    const staffInfo = AuthUtils.getUserInfo();
    let staffId = staffInfo.id;
    if (staffInfo.email && staffInfo.email.length > 0) {
      staffId = staffInfo.email;
    }
    return staffId;
  }

  submitEntities = (scores, riskFactors, dmf, dmfRiskFactors) => {
    const {
      actions,
      arrestId,
      selectedPretrialCaseCharges,
      psaForm,
      selectedPerson,
      selectedPretrialCase,
      selectedOrganizationSettings,
      staffIdsToEntityKeyIds
    } = this.props;

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const psaNotes = psaForm.get(PSA.NOTES, '');

    const staffId = this.getStaffId();
    const staffEKID = staffIdsToEntityKeyIds.get(staffId, '');
    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(selectedPerson, [ENTITY_KEY_ID]);

    const psaEntity = scores.toJS();
    psaEntity[GENERAL_ID] = [randomUUID()];

    const psaRiskFactorsEntity = riskFactors;
    psaRiskFactorsEntity[GENERAL_ID] = [randomUUID()];

    const psaNotesEntity = {
      [RELEASE_RECOMMENDATION]: psaNotes,
      [GENERAL_ID]: [randomUUID()]
    };

    const dmfResultsEntity = {};
    Object.entries(dmf).forEach(([key, value]) => {
      dmfResultsEntity[RESULT_CATEGORIES_TO_PROPERTY_TYPES[key]] = value;
    });
    dmfResultsEntity[GENERAL_ID] = [randomUUID()];

    const dmfRiskFactorsEntity = dmfRiskFactors;
    dmfRiskFactorsEntity[GENERAL_ID] = [randomUUID()];

    const caseEntity = selectedPretrialCase.toJS();
    const chargeEntities = selectedPretrialCaseCharges.toJS();

    // Get Case Context from settings and pass to config
    const caseContext = psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
    const chargeType = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, caseContext]);
    const manualCourtCasesAndCharges = (chargeType === CASE_CONTEXTS.COURT);

    if ((dmfResultsEntity[DMF.COURT_OR_BOOKING] !== CONTEXT.BOOKING) || !includesPretrialModule) {
      delete dmfResultsEntity[DMF.SECONDARY_RELEASE_CHARGES];
      delete dmfResultsEntity[NOTES[DMF.SECONDARY_RELEASE_CHARGES]];
      delete dmfResultsEntity[DMF.SECONDARY_HOLD_CHARGES];
      delete dmfResultsEntity[NOTES[DMF.SECONDARY_HOLD_CHARGES]];
    }

    actions.submitPSA({
      arrestCaseEKID: arrestId,
      caseEntity,
      chargeEntities,
      dmfResultsEntity,
      dmfRiskFactorsEntity,
      includesPretrialModule,
      manualCourtCasesAndCharges,
      personEKID,
      psaEntity,
      psaNotesEntity,
      psaRiskFactorsEntity,
      staffEKID
    });
  }

  getFqn = (propertyType) => `${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`

  shouldLoadCases = () => {
    const { selectedOrganizationSettings } = this.props;
    return selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
  }

  handleSelectPerson = (selectedPerson, entityKeyId) => {
    const { actions } = this.props;
    const shouldLoadCases = this.shouldLoadCases();
    actions.selectPerson({ selectedPerson });
    actions.loadPersonDetails({ entityKeyId, shouldLoadCases });
  }

  nextPage = () => {
    const { selectedOrganizationSettings } = this.props;
    const skipLoad = !selectedOrganizationSettings.get(SETTINGS.ARRESTS_INTEGRATED, true);
    const nextPage = getNextPath(window.location, numPages, skipLoad);
    if (nextPage) this.handlePageChange(nextPage);
  }

  prevPage = () => {
    const prevPage = getPrevPath(window.location);
    this.handlePageChange(prevPage);
  }

  generateScores = () => {
    const { psaForm, selectedOrganizationSettings } = this.props;
    // import module settings
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    const { riskFactors, scores } = getScoresAndRiskFactors(psaForm);
    // don't calculate dmf if module settings doesn't include pretrial
    const dmf = includesPretrialModule ? calculateDMF(psaForm, scores) : {};
    const dmfRiskFactors = includesPretrialModule ? getDMFRiskFactors(psaForm) : {};
    this.setState({
      riskFactors,
      dmfRiskFactors,
      scores,
      dmf,
      scoresWereGenerated: true,
      confirmationModalOpen: true
    });
    this.submitEntities(
      scores.set(PROPERTY_TYPES.STATUS, List.of(PSA_STATUSES.OPEN)), riskFactors, dmf, dmfRiskFactors
    );
    this.nextPage();
  }

  clear = () => {
    const { actions } = this.props;
    this.setState(INITIAL_STATE.toJS());
    actions.clearForm();
  }

  setMultimapToMap = (setMultimap) => {
    let map = Map();
    Object.keys(setMultimap).forEach((key) => {
      map = map.set(key, setMultimap[key][0]);
    });
    return map;
  };

  renderDiscardButton = () => <DiscardButton onClick={this.handleClose}>Discard</DiscardButton>;

  handleClose = () => {
    this.clear();
    this.handlePageChange(Routes.DASHBOARD);
  }

  handlePageChange = (path :string) => {
    const { actions } = this.props;
    actions.goToPath(path);
  };

  getSearchPeopleSection = () => {
    const { history } = this.props;
    return (
      <SearchPersonContainer
          history={history}
          onSelectPerson={(person, entityKeyId) => {
            this.handleSelectPerson(person, entityKeyId);
            this.nextPage();
          }} />
    );
  }

  closePSA = (scores, status, failureReason) => {
    const { actions } = this.props;
    const scoresId = scores.getIn([OPENLATTICE_ID_FQN, 0]);
    let scoresEntity = scores.remove('id').remove(OPENLATTICE_ID_FQN);
    scoresEntity = scoresEntity.set(PROPERTY_TYPES.STATUS, List.of(status));
    if (failureReason.length) {
      scoresEntity = scoresEntity.set(PROPERTY_TYPES.FAILURE_REASON, fromJS(failureReason));
    }

    actions.changePSAStatus({
      scoresId,
      scoresEntity
    });
  }

  renderPendingPSAsHeader = () => (
    <PSARowListHeader>
      <Header>Close Pending PSAs</Header>
      <BasicButton onClick={() => this.setState({ skipClosePSAs: true })}>Skip</BasicButton>
    </PSARowListHeader>
  )

  renderPendingPSAListContent = () => {
    const { status } = this.state;
    return (
      <PSARowListSubHeader>
        <FilterWrapper>
          <span>PSA Status </span>
          <Select
              placeholder={status}
              options={Object.values(STATUS_OPTIONS_FOR_PENDING_PSAS)}
              onChange={(e) => (this.setState({ status: e.label }))} />
        </FilterWrapper>
      </PSARowListSubHeader>
    );
  }

  renderPendingPSASubContent = () => {
    const { selectedPerson } = this.props;
    return <PendingPSAsPersonCard person={selectedPerson} />;
  }

  getPendingPSAs = () => {
    const { personNeighbors } = this.props;
    const { status } = this.state;
    const allPSAs = personNeighbors.get(PSA_SCORES, List());
    const openPSAs = getOpenPSAs(allPSAs);
    const PSAScores = status === STATUS_OPTIONS_FOR_PENDING_PSAS.OPEN.label
      ? openPSAs.map(getNeighborDetails)
      : allPSAs.map(getNeighborDetails);
    if (!PSAScores.size) return null;
    const scoreSeq = PSAScores.map((scores) => ([getEntityKeyId(scores), scores]));
    return (
      <CenteredListWrapper>
        {this.renderPendingPSAsHeader()}
        <PSAReviewRowListContainer>
          <PSAReviewReportsRowList
              scoreSeq={scoreSeq}
              renderContent={this.renderPendingPSAListContent}
              renderSubContent={this.renderPendingPSASubContent}
              component={CONTENT_CONSTS.PENDING_PSAS} />
        </PSAReviewRowListContainer>
      </CenteredListWrapper>
    );
  }

  renderProgressBar = () => {
    const { numCasesToLoad, numCasesLoaded } = this.props;

    const progress = (numCasesToLoad > 0) ? Math.floor((numCasesLoaded / numCasesToLoad) * 100) : 0;
    const loadingText = numCasesToLoad > 0
      ? `Loading cases (${numCasesLoaded} / ${numCasesToLoad})`
      : 'Loading case history';
    return (
      <LoadingContainer>
        <LoadingText>{loadingText}</LoadingText>
        <ProgressBar progress={progress} />
      </LoadingContainer>
    );
  }

  renderLoader = () => <LogoLoader loadingText="Loading person details..." />;

  getSelectArrestSection = () => {
    const {
      actions,
      arrestChargesForPerson,
      arrestOptions,
      psaForm
    } = this.props;
    const { skipClosePSAs } = this.state;

    const pendingPSAs = (skipClosePSAs || psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING)
      ? null : this.getPendingPSAs();
    return pendingPSAs || (
      <SelectArrestContainer
          caseOptions={arrestOptions}
          nextPage={this.nextPage}
          prevPage={this.prevPage}
          onManualEntry={actions.addCaseAndCharges}
          onSelectCase={(selectedCase) => {
            actions.selectPretrialCase({ selectedPretrialCase: selectedCase, arrestChargesForPerson });
            this.nextPage();
          }} />
    );
  }

  formatCharge = (charge) => (
    `${
      charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '')
    } ${
      charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '')
    }`
  );

  formatChargeOptions = () => {
    const {
      arrestCharges,
      courtCharges,
      psaForm,
      selectedOrganizationSettings,
      selectedOrganizationId
    } = this.props;

    const caseContext = psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
    const chargeType = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, caseContext]);
    const chargesByOrgId = chargeType === CASE_CONTEXTS.COURT ? courtCharges : arrestCharges;

    const orgCharges = chargesByOrgId.get(selectedOrganizationId, Map()).valueSeq();
    let chargeOptions = Map();
    orgCharges.forEach((charge) => {
      chargeOptions = chargeOptions.set(
        this.formatCharge(charge),
        {
          label: this.formatCharge(charge),
          value: charge
        }
      );
    });

    const sortedChargeList = chargeOptions.valueSeq()
      .sortBy((charge) => getFirstNeighborValue(charge.value, PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION))
      .sortBy((charge) => getFirstNeighborValue(charge.value, PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE));

    return {
      chargeOptions: chargeOptions.sortBy((statute, _) => statute),
      chargeList: sortedChargeList
    };
  }

  getSelectChargesSection = () => {
    const {
      actions,
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      psaForm,
      selectedOrganizationSettings,
      selectedPretrialCase,
      selectedPretrialCaseCharges
    } = this.props;
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const caseContext = psaForm.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
    const chargeType = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, caseContext]);
    const { chargeList, chargeOptions } = this.formatChargeOptions();
    if (isLoadingNeighbors || loadingPersonDetails) {
      return <LogoLoader loadingText="Loading Person Details..." />;
    }

    return (
      <SelectChargesContainer
          chargeType={chargeType}
          defaultArrest={selectedPretrialCase}
          defaultCharges={selectedPretrialCaseCharges}
          chargeOptions={chargeOptions}
          chargeList={chargeList}
          nextPage={this.nextPage}
          prevPage={this.prevPage}
          onSubmit={actions.addCaseAndCharges} />
    );
  };

  getPersonIdValue = () => {
    const { selectedPerson } = this.props;
    return selectedPerson.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
  }

  renderSubscriptionInfo = () => {
    const {
      allContacts,
      readOnlyPermissions,
      selectedPerson,
      selectedOrganizationSettings,
      personNeighbors
    } = this.props;
    const subscription = personNeighbors.get(SUBSCRIPTION, Map());
    const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    return courtRemindersEnabled
      ? (
        <SubscriptionInfo
            readOnly={readOnlyPermissions}
            subscription={subscription}
            contactInfo={allContacts}
            person={selectedPerson} />
      ) : null;
  }

  getPsaInputForm = () => {
    const {
      allCasesForPerson,
      allChargesForPerson,
      allFTAs,
      allSentencesForPerson,
      selectedPretrialCaseCharges,
      psaForm,
      selectedPerson,
      selectedPretrialCase,
      selectedOrganizationId,
      violentArrestCharges
    } = this.props;
    const violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
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
              <PersonCard person={selectedPerson} />
            </div>
          </ContextItem>
          <ContextItem>
            <ArrestCard
                arrest={selectedPretrialCase}
                component={CONTENT_CONSTS.FORM_CONTAINER} />
          </ContextItem>
        </ContextRow>
        { this.renderSubscriptionInfo() }
        <PaddedSectionWrapper>
          <HeaderRow left>
            <h1>Charges</h1>
            <span>{selectedPretrialCaseCharges.size}</span>
          </HeaderRow>
          <ChargeTableWrapper>
            <ChargeTable charges={selectedPretrialCaseCharges} violentChargeList={violentChargeList} disabled />
          </ChargeTableWrapper>
        </PaddedSectionWrapper>
        <PSAInputForm
            handleInputChange={this.handleInputChange}
            handleSubmit={this.generateScores}
            input={psaForm}
            currCharges={selectedPretrialCaseCharges}
            currCase={selectedPretrialCase}
            allCharges={allChargesForPerson}
            allSentences={allSentencesForPerson}
            allCases={allCasesForPerson}
            allFTAs={allFTAs}
            handleClose={this.handleClose} />
      </StyledFormWrapper>
    );
  }

  getOnExport = (isCompact) => {
    const {
      selectedPretrialCase,
      selectedPretrialCaseCharges,
      selectedPerson,
      arrestOptions,
      allChargesForPerson,
      allSentencesForPerson,
      allFTAs,
      violentArrestCharges,
      violentCourtCharges,
      psaForm,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const { dmfRiskFactors, riskFactors, scores } = this.state;
    const violentArrestChargeList = violentArrestCharges.get(selectedOrganizationId, List());
    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, List());
    const notes = psaForm.get(PSA.NOTES, '');
    const data = fromJS(this.state)
      .set('notes', notes)
      .set('scores', scores)
      .set('riskFactors', this.setMultimapToMap(riskFactors))
      .set('psaRiskFactors', fromJS(riskFactors))
      .set('dmfRiskFactors', fromJS(dmfRiskFactors));

    exportPDF(
      data,
      selectedPretrialCase,
      List(),
      selectedPretrialCaseCharges,
      selectedPerson,
      arrestOptions,
      allChargesForPerson,
      allSentencesForPerson,
      allFTAs,
      violentArrestChargeList,
      violentCourtChargeList,
      {
        user: this.getStaffId(),
        timestamp: DateTime.local().toISO()
      },
      false,
      isCompact,
      selectedOrganizationSettings
    );
  }

  getPSASubmittedPage = () => {
    const { psaId, scoresWereGenerated } = this.state;
    const {
      actions,
      allCasesForPerson,
      allChargesForPerson,
      allHearings,
      selectedPretrialCaseCharges,
      selectedPerson,
      psaForm,
      submittedPSA,
      submittedPSANeighbors,
      submitPSAReqState
    } = this.props;

    if (!scoresWereGenerated) return null;
    const submittingPSA = requestIsPending(submitPSAReqState);
    const submitPSASuccess = requestIsSuccess(submitPSAReqState);
    const context = psaForm.get('courtOrBooking');

    let chargesByCaseId = Map();
    allChargesForPerson.forEach((charge) => {
      const caseNum = charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0];
      chargesByCaseId = chargesByCaseId.set(caseNum, chargesByCaseId.get(caseNum, List()).push(charge));
    });

    const { [ENTITY_KEY_ID]: psaEKID } = getEntityProperties(submittedPSA, [ENTITY_KEY_ID]);
    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(selectedPerson, [ENTITY_KEY_ID]);
    const psaRiskFactores = submittedPSANeighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const dmfResults = submittedPSANeighbors.getIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map());

    return (
      <PSASubmittedPage
          isSubmitting={submittingPSA}
          scores={submittedPSA}
          riskFactors={psaRiskFactores.toJS()}
          context={context}
          dmf={dmfResults}
          personId={this.getPersonIdValue()}
          personEKID={personEKID}
          psaEKID={psaEKID}
          psaId={psaId}
          submitSuccess={submitPSASuccess}
          onClose={actions.goToRoot}
          charges={selectedPretrialCaseCharges}
          notes={psaForm.get(PSA.NOTES)}
          allCases={allCasesForPerson}
          allCharges={chargesByCaseId}
          allHearings={allHearings}
          getOnExport={this.getOnExport} />
    );
  }

  openConfirmationModal = this.setState({ confirmationModalOpen: true });

  renderPSAResultsModal = () => {
    const { confirmationModalOpen } = this.state;
    const {
      actions,
      submitPSAReqState
    } = this.props;
    const psaSubmissionComplete = requestIsSuccess(submitPSAReqState) || requestIsFailure(submitPSAReqState);
    const submittingPSA = requestIsFailure(submitPSAReqState);
    const currentPage = getCurrentPage(window.location);
    if (!currentPage || Number.isNaN(currentPage)) return null;
    if (currentPage < 4 || (!submittingPSA && !psaSubmissionComplete)) {
      return null;
    }

    return (
      <ConfirmationModal
          open={confirmationModalOpen}
          submissionStatus={submittingPSA || psaSubmissionComplete}
          pageContent={this.getPSASubmittedPage}
          handleModalButtonClick={actions.goToRoot} />
    );
  }

  render() {

    const {
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      updateCasesReqState,
      selectedPerson
    } = this.props;

    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(selectedPerson, [ENTITY_KEY_ID]);
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const updatingCases = requestIsPending(updateCasesReqState);

    if (updatingCases) return this.renderProgressBar();

    if (isLoadingNeighbors || loadingPersonDetails) return this.renderLoader();

    return (
      <div>
        <CaseLoaderError personEKID={personEKID} />
        <Switch>
          <Route path={`${Routes.PSA_FORM}/1`} render={this.getSearchPeopleSection} />
          <Route path={`${Routes.PSA_FORM}/2`} render={this.getSelectArrestSection} />
          <Route path={`${Routes.PSA_FORM}/3`} render={this.getSelectChargesSection} />
          <Route path={`${Routes.PSA_FORM}/4`} render={this.getPsaInputForm} />
          <Route path={`${Routes.PSA_FORM}/5`} render={this.getPSASubmittedPage} />
          <Route path={`${Routes.PSA_FORM}`} render={this.getSearchPeopleSection} />
          <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
        </Switch>
        { this.renderPSAResultsModal() }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const psaForm = state.get(STATE.PSA);
  const submit = state.get(STATE.SUBMIT);
  const charges = state.get(STATE.CHARGES);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const person = state.get(STATE.PERSON);
  const selectedPerson = psaForm.get(PSA_FORM_DATA.SELECT_PERSON);
  const personEKID = getEntityKeyId(selectedPerson, '');
  const personNeighbors = people.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], Map());
  const allCasesForPerson = personNeighbors.get(APP_TYPES.PRETRIAL_CASES, List()).map(getNeighborDetails);
  const allChargesForPerson = personNeighbors.get(APP_TYPES.CHARGES, List()).map(getNeighborDetails);
  const allFTAs = personNeighbors.get(APP_TYPES.FTAS, List()).map(getNeighborDetails);
  const allSentencesForPerson = personNeighbors.get(APP_TYPES.SENTENCES, List()).map(getNeighborDetails);
  const arrestChargesForPerson = personNeighbors.get(APP_TYPES.ARREST_CHARGES, List()).map(getNeighborDetails);

  return {
    allCasesForPerson,
    allChargesForPerson,
    allFTAs,
    allSentencesForPerson,
    arrestChargesForPerson,
    personEKID,
    personNeighbors,

    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.STAFF_IDS_TO_EKIDS]: app.get(APP_DATA.STAFF_IDS_TO_EKIDS),
    [APP_DATA.DATA_MODEL]: app.get(APP_DATA.DATA_MODEL),

    // Charges
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT),
    [CHARGES.DMF_STEP_2]: charges.get(CHARGES.DMF_STEP_2),
    [CHARGES.DMF_STEP_4]: charges.get(CHARGES.DMF_STEP_4),
    [CHARGES.BRE]: charges.get(CHARGES.BRE),
    [CHARGES.BHE]: charges.get(CHARGES.BHE),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),

    // PSA Form
    addCaseToPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.ADD_CASE_TO_PSA),
    editPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.EDIT_PSA),
    submitPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.SUBMIT_PSA),
    submitPSAError: getError(psaForm, PSA_FORM_ACTIONS.SUBMIT_PSA),
    removeCaseFromPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA),
    [PSA_FORM_DATA.ARREST_ID]: psaForm.get(PSA_FORM_DATA.ARREST_ID),
    [PSA_FORM_DATA.ARREST_OPTIONS]: psaForm.get(PSA_FORM_DATA.ARREST_OPTIONS),
    [PSA_FORM_DATA.PSA_FORM]: psaForm.get(PSA_FORM_DATA.PSA_FORM),
    [PSA_FORM_DATA.SELECT_PERSON]: psaForm.get(PSA_FORM_DATA.SELECT_PERSON),
    [PSA_FORM_DATA.SELECT_PRETRIAL_CASE]: psaForm.get(PSA_FORM_DATA.SELECT_PRETRIAL_CASE),
    [PSA_FORM_DATA.SELECT_CASE_CHARGES]: psaForm.get(PSA_FORM_DATA.SELECT_CASE_CHARGES),
    [PSA_FORM_DATA.SUBMITTED_PSA]: psaForm.get(PSA_FORM_DATA.SUBMITTED_PSA),
    [PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS]: psaForm.get(PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS),

    [SUBMIT.UPDATING_ENTITY]: submit.get(SUBMIT.UPDATING_ENTITY),

    // Review
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),

    // Person
    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    [PERSON_DATA.SELECTED_PERSON_ID]: person.get(PERSON_DATA.SELECTED_PERSON_ID),
    [PERSON_DATA.LOADING_PERSON_DETAILS]: person.get(PERSON_DATA.LOADING_PERSON_DETAILS),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    updateCasesError: getError(person, PERSON_ACTIONS.UPDATE_CASES),
    [PERSON_DATA.NUM_CASES_TO_LOAD]: person.get(PERSON_DATA.NUM_CASES_TO_LOAD),
    [PERSON_DATA.NUM_CASES_LOADED]: person.get(PERSON_DATA.NUM_CASES_LOADED),
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Routing Actions
    goToPath,
    goToRoot,
    // Review Actions
    changePSAStatus,
    checkPSAPermissions,
    // Form Actions
    addCaseAndCharges,
    clearForm,
    submitPSA,
    selectPerson,
    selectPretrialCase,
    setPSAValues,
    // Person Actions
    loadPersonDetails,
    resetPersonAction,
    // Submit Actions
    clearSubmit,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
