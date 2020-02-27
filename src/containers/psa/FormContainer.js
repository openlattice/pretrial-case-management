/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { List, Map, fromJS } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { Constants } from 'lattice';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Banner,
  Button,
  Select,
  Stepper,
  Step
} from 'lattice-ui-kit';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';

import ArrestCard from '../../components/arrest/ArrestCard';
import BasicButton from '../../components/buttons/BasicButton';
import CaseLoaderError from '../person/CaseLoaderError';
import ChargeTable from '../../components/charges/ChargeTable';
import LogoLoader from '../../components/LogoLoader';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSAReviewReportsRowList from '../review/PSAReviewReportsRowList';
import PSASubmittedPage from '../../components/psainput/PSASubmittedPage';
import PendingPSAsPersonCard from '../../components/person/PersonCardReview';
import PersonCard from '../../components/person/PersonCard';
import ProgressBar from '../../components/controls/ProgressBar';
import SearchPersonContainer from '../person/SearchPersonContainer';
import SelectArrestContainer from '../pages/arrest/SelectArrestContainer';
import SelectChargesContainer from '../pages/arrest/SelectChargesContainer';
import SubscriptionInfo from '../../components/subscription/SubscriptionInfo';
import exportPDF from '../../utils/PDFUtils';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { InstructionalText, InstructionalSubText } from '../../components/TextStyledComponents';
import { OL } from '../../utils/consts/Colors';
import { getScoresAndRiskFactors, calculateRCM, getRCMRiskFactors } from '../../utils/ScoringUtils';
import { getOpenPSAs } from '../../utils/PSAUtils';
import { tryAutofillFields } from '../../utils/AutofillUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { STATUS_OPTIONS_FOR_PENDING_PSAS } from '../../utils/consts/ReviewPSAConsts';
import { PSA_NEIGHBOR, REVIEW, SUBMIT } from '../../utils/consts/FrontEndStateConsts';
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
  RCM,
  CONTEXT,
  NOTES,
  PSA,
  PSA_STATUSES
} from '../../utils/consts/Consts';
import { StyledFormWrapper, StyledSectionWrapper } from '../../utils/Layout';
import { getNextPath, getPrevPath } from '../../utils/Helpers';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { PERSON_ACTIONS, PERSON_DATA } from '../../utils/consts/redux/PersonConsts';
import { PSA_FORM_ACTIONS, PSA_FORM_DATA } from '../../utils/consts/redux/PSAFormConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
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
  RCM_RISK_FACTORS,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  SUBSCRIPTION
} = APP_TYPES;
const {
  ENTITY_KEY_ID,
  GENERAL_ID,
  RELEASE_RECOMMENDATION,
  TYPE
} = PROPERTY_TYPES;

const PSARowListHeader = styled.div`
  align-items: center;
  background: ${OL.WHITE};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  display: flex;
  flex-direction: row;
  font-size: 14px;
  justify-content: space-between;
  padding: 0 30px;
  text-align: center;
  width: 100%;
`;

const PSARowListSubHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 713px;
  white-space: nowrap;
  width: 100%;
`;

const LoadingContainer = styled(StyledFormWrapper)`
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  padding: 0 30px 30px 30px;
`;

const LoadingText = styled.div`
  color: ${OL.GREY01};
  display: inline-flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  margin: 20px;
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
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const DiscardButton = styled(BasicButton)`
  font-size: 14px;
  font-weight: 600;
  height: 43px;
  padding: 12px 45px;
  width: 141px;
`;

const ContextItem = styled(StyledSectionWrapper)`
  padding: 30px;
  width: 470px;
`;

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: ${(props :Object) => (props.left ? 'flex-start' : 'space-between')};
  margin-bottom: 20px;
  width: 100%;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: ${OL.GREY01};
  }

  div {
    border-radius: 3px;
    border: solid 1px ${OL.GREY02};
    color: ${OL.GREY02};
    display: inline-block;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    height: 25px;
    padding: 5px 7px;
    text-transform: uppercase;
  }

  span {
    background-color: ${OL.GREY08};
    border-radius: 10px;
    color: ${OL.GREY02};
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    margin-left: 10px;
    padding: 2px 12px;
  }
`;

const PSAReviewRowListContainer = styled.div`
  padding: 0;
  width: 960px;
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
  align-items: center;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  width: 25%;

  span {
    margin-top: 10px;
  }
`;

const BannerContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const BannerButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 10px 30px;
  margin-top: 20px;
  width: 350px;
`;

const StepperWrapper = styled.div`
  width: 100%;
  background: ${OL.WHITE};
  border-radius: 3px;
  border: solid 1px ${OL.GREY11};
  padding: 20px 30px;
  margin-bottom: 20px;
`;


const STEPS = [
  { title: 'Person Information' },
  { title: 'Current Charges' },
  { title: 'PSA' },
  { title: 'Release Conditions Matrix' }
];

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
  incomplete: false,
  personForm: INITIAL_PERSON_FORM,
  psaId: undefined,
  psaIdClosing: undefined,
  riskFactors: {},
  rcmRiskFactors: {},
  scores: {
    ftaTotal: 0,
    ncaTotal: 0,
    nvcaTotal: 0,
    [PROPERTY_TYPES.FTA_SCALE]: [0],
    [PROPERTY_TYPES.NCA_SCALE]: [0],
    [PROPERTY_TYPES.NVCA_FLAG]: [false]
  },
  rcm: {},
  scoresWereGenerated: false,
  skipClosePSAs: false,
  status: STATUS_OPTIONS_FOR_PENDING_PSAS.OPEN.value,
});

const numPages = 4;

type Props = {
  actions :{
    addCaseAndCharges :(value :{
      pretrialCase :Map,
      charges :List<Map>
    }) => void;
    changePSAStatus :RequestSequence;
    checkPSAPermissions :RequestSequence;
    clearForm :() => void;
    clearSubmit :RequestSequence;
    goToPath :(value :string) => void;
    goToRoot :() => void;
    loadNeighbors :RequestSequence;
    loadPersonDetails :(value :{entityKeyId :string, shouldLoadCases :boolean}) => void;
    resetPersonAction :({ actionType :string }) => void;
    selectPerson :(value :{
      selectedPerson :Map
    }) => void;
    selectPretrialCase :(value :{
      selectedPretrialCase :Map
    }) => void;
    setPSAValues :(value :{
      newValues :Map
    }) => void;
    submit :({ config :Object, values :Object }) => void;
    submitPSA :RequestSequence;
  };
  arrestChargesById :Map;
  arrestChargesForPerson :List;
  allCasesForPerson :List;
  allChargesForPerson :List;
  allContacts :Map;
  allFTAs :List;
  allSentencesForPerson :List;
  arrestChargesForPerson :List;
  arrestId :string;
  arrestMaxLevelIncreaseCharges :Map;
  arrestOptions :List;
  arrestSingleLevelIncreaseCharges :Map;
  bookingHoldExceptionCharges :Map;
  bookingReleaseExceptionCharges :Map;
  courtChargesById :Map;
  courtMaxLevelIncreaseCharges :Map;
  courtSingleLevelIncreaseCharges :Map;
  getPeopleNeighborsReqState :RequestState;
  history :string[];
  loadPersonDetailsReqState :RequestState;
  location :{
    pathname :string;
  };
  match :{
    url :string;
    params :{
      context :string;
    };
  };
  numCasesLoaded :number;
  numCasesToLoad :number;
  personNeighbors :Map;
  psaForm :Map;
  readOnlyPermissions :boolean;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  selectedPerson :Map;
  selectedPretrialCase :Map;
  selectedPretrialCaseCharges :List;
  settings :Map;
  staffIdsToEntityKeyIds :Map;
  submitPSAReqState :RequestState;
  submittedPSA :Map;
  submittedPSANeighbors :Map;
  updateCasesReqState :RequestState;
  violentArrestCharges :Map;
  violentChargeList :Map;
  violentCourtCharges :Map;
};

type State = {
  confirmationModalOpen :boolean;
  courtConditions :[],
  bookingConditions :[],
  incomplete :boolean;
  personForm :Map;
  psaId :string;
  psaIdClosing :?string;
  rcm :{},
  rcmRiskFactors :{},
  riskFactors :Object;
  scores :Object;
  scoresWereGenerated :boolean;
  skipClosePSAs :boolean;
  state :string;
  status :string;
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

  componentDidUpdate(prevProps :Props) {
    const { submitPSAReqState } = this.props;
    const { selectedPerson } = prevProps;
    const {
      actions,
      allCasesForPerson,
      allChargesForPerson,
      allFTAs,
      allSentencesForPerson,
      arrestMaxLevelIncreaseCharges,
      arrestSingleLevelIncreaseCharges,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      courtMaxLevelIncreaseCharges,
      courtSingleLevelIncreaseCharges,
      location,
      psaForm,
      selectedOrganizationId,
      selectedPretrialCaseCharges,
      selectedPretrialCase,
      violentCourtCharges,
      violentArrestCharges
    } = this.props;
    const bookingReleaseExceptionChargeList = bookingReleaseExceptionCharges.get(selectedOrganizationId, List());
    const bookingHoldExceptionChargeList = bookingHoldExceptionCharges.get(selectedOrganizationId, List());
    const caseContextIsCourt = psaForm.get(RCM.CASE_CONTEXT) === CASE_CONTEXTS.COURT;
    const violentArrestChargeList = violentArrestCharges.get(selectedOrganizationId, List());
    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, List());
    let violentChargesList = violentArrestChargeList;
    let maxLevelIncreaseChargesList = arrestMaxLevelIncreaseCharges.get(selectedOrganizationId, List());
    let singleLevelIncreaseChargesList = arrestSingleLevelIncreaseCharges.get(selectedOrganizationId, List());
    if (caseContextIsCourt) {
      violentChargesList = violentCourtChargeList;
      maxLevelIncreaseChargesList = courtMaxLevelIncreaseCharges.get(selectedOrganizationId, List());
      singleLevelIncreaseChargesList = courtSingleLevelIncreaseCharges.get(selectedOrganizationId, List());
    }
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
          violentChargesList,
          violentCourtChargeList,
          maxLevelIncreaseChargesList,
          singleLevelIncreaseChargesList,
          bookingReleaseExceptionChargeList,
          bookingHoldExceptionChargeList
        )
      });
    }
    const caseContext = psaForm.get(RCM.CASE_CONTEXT);
    const wasSubmittingPSA :boolean = requestIsPending(prevProps.submitPSAReqState);
    const submittedPSASuccessfully :boolean = requestIsSuccess(submitPSAReqState);
    const psaSubmissionFailed :boolean = requestIsFailure(submitPSAReqState);
    if (wasSubmittingPSA && submittedPSASuccessfully) {
      this.handlePageChange(Routes.PSA_SUBMISSION_PAGE);
    }
    if (wasSubmittingPSA && psaSubmissionFailed) {
      window.scrollTo(0, 0);
    }
    if (!caseContext) {
      this.handlePageChange(Routes.CREATE_FORMS);
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    this.clear();
    actions.resetPersonAction({ actionType: PERSON_ACTIONS.UPDATE_CASES });
  }

  loadContextParams = () => {
    const { actions, match, selectedOrganizationSettings } = this.props;
    const {
      params: {
        context
      } = {},
    } = match;
    if (context.length > 1) {
      const psaContext = context === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
      const caseContext = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, psaContext]);
      const newValues = Map()
        .set(RCM.COURT_OR_BOOKING, context)
        .set(RCM.CASE_CONTEXT, caseContext);
      actions.setPSAValues({ newValues });
      return true;
    }
    return null;
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
      actions.goToPath(`${Routes.PSA_FORM_BASE}/1`);
    }
    else if (!psaForm.get(RCM.COURT_OR_BOOKING) || !psaForm.get(RCM.COURT_OR_BOOKING)) {
      actions.goToPath(Routes.DASHBOARD);
    }
    else if ((!selectedPerson.size || !scoresWereGenerated) && !window.location.href.endsWith('1')) {
      actions.goToPath(Routes.CREATE_FORMS);
    }
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

  submitEntities = (
    scores,
    riskFactors,
    rcm,
    rcmRiskFactors,
    bookingConditions,
    courtConditions
  ) => {
    const {
      actions,
      arrestId,
      selectedPretrialCaseCharges,
      psaForm,
      selectedPerson,
      selectedPretrialCase,
      settings,
      staffIdsToEntityKeyIds
    } = this.props;

    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
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

    const rcmResultsEntity = rcm;
    rcmResultsEntity[GENERAL_ID] = [randomUUID()];

    const rcmRiskFactorsEntity :Object = rcmRiskFactors;
    rcmRiskFactorsEntity[GENERAL_ID] = [randomUUID()];

    const caseEntity = selectedPretrialCase.toJS();
    const chargeEntities = selectedPretrialCaseCharges.toJS();

    const bookingConditionsWithIds = bookingConditions.map((condition) => {
      const conditionEntity = condition;
      conditionEntity[GENERAL_ID] = [randomUUID()];
      return conditionEntity;
    });
    const courtConditionsWithIds = courtConditions.map((condition) => {
      const conditionEntity = condition;
      conditionEntity[GENERAL_ID] = [randomUUID()];
      return conditionEntity;
    });

    // Get Case Context from psaForm since it's set at the beginning
    const caseContext = psaForm.get(RCM.CASE_CONTEXT);
    const manualCourtCasesAndCharges = (caseContext === CASE_CONTEXTS.COURT);

    const includesStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const includesSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

    if (!includesStepIncreases) {
      delete rcmRiskFactorsEntity[RCM_FIELDS.STEP_2_CHARGES];
      delete rcmRiskFactorsEntity[NOTES[RCM_FIELDS.STEP_2_CHARGES]];
      delete rcmRiskFactorsEntity[RCM_FIELDS.STEP_4_CHARGES];
      delete rcmRiskFactorsEntity[NOTES[RCM_FIELDS.STEP_2_CHARGES]];
    }
    if (!includesSecondaryBookingCharges) {
      delete rcmResultsEntity[RCM_FIELDS.SECONDARY_RELEASE_CHARGES];
      delete rcmResultsEntity[NOTES[RCM_FIELDS.SECONDARY_RELEASE_CHARGES]];
      delete rcmResultsEntity[RCM_FIELDS.SECONDARY_HOLD_CHARGES];
      delete rcmResultsEntity[NOTES[RCM_FIELDS.SECONDARY_HOLD_CHARGES]];
    }
    else if (psaForm.get(RCM.COURT_OR_BOOKING, '').includes(CONTEXT.COURT)) {
      delete rcmResultsEntity[RCM_FIELDS.SECONDARY_RELEASE_CHARGES];
      delete rcmResultsEntity[NOTES[RCM_FIELDS.SECONDARY_RELEASE_CHARGES]];
      delete rcmResultsEntity[RCM_FIELDS.SECONDARY_HOLD_CHARGES];
      delete rcmResultsEntity[NOTES[RCM_FIELDS.SECONDARY_HOLD_CHARGES]];
    }
    actions.submitPSA({
      arrestCaseEKID: arrestId,
      bookingConditionsWithIds,
      caseEntity,
      chargeEntities,
      courtConditionsWithIds,
      rcmResultsEntity,
      rcmRiskFactorsEntity,
      includesPretrialModule,
      manualCourtCasesAndCharges,
      personEKID,
      psaEntity,
      psaNotesEntity,
      psaRiskFactorsEntity,
      staffEKID
    });
  }

  shouldLoadCases = () => {
    const { settings } = this.props;
    return settings.get(SETTINGS.LOAD_CASES, false);
  }

  handleSelectPerson = (selectedPerson, entityKeyId) => {
    const { actions, selectedOrganizationSettings } = this.props;
    const shouldLoadCases :boolean = selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
    actions.selectPerson({ selectedPerson });
    actions.loadPersonDetails({ entityKeyId, shouldLoadCases });
  }

  nextPage = () => {
    const { settings } = this.props;
    const skipLoad = !settings.get(SETTINGS.ARRESTS_INTEGRATED, true);
    const nextPage :string = getNextPath(window.location, numPages, skipLoad);
    if (nextPage) this.handlePageChange(nextPage);
  }

  prevPage = () => {
    const prevPage :string = getPrevPath(window.location);
    this.handlePageChange(prevPage);
  }

  invalidValue = (val :string) => val === null || val === undefined || val === 'null' || val === 'undefined';

  generateScores = () => {
    const { psaForm, settings } = this.props;
    // import module settings
    const { riskFactors, scores } :Object = getScoresAndRiskFactors(psaForm);
    // don't calculate rcm if module settings doesn't include pretrial
    const {
      rcm,
      courtConditions,
      bookingConditions
    } = calculateRCM(psaForm, scores, settings);
    const rcmRiskFactors = getRCMRiskFactors(psaForm);
    this.setState({
      riskFactors,
      rcmRiskFactors,
      scores,
      rcm,
      courtConditions,
      bookingConditions,
      scoresWereGenerated: true,
      confirmationModalOpen: true
    });
    this.submitEntities(
      scores.set(PROPERTY_TYPES.STATUS, List.of(PSA_STATUSES.OPEN)),
      riskFactors,
      rcm,
      rcmRiskFactors,
      bookingConditions,
      courtConditions
    );
  }

  handleSubmit = (e :SyntheticEvent<HTMLElement>) => {
    const { psaForm, settings } = this.props;
    e.preventDefault();
    const includesStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const includesSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

    let requiredFields = psaForm;
    if (!includesStepIncreases) {
      requiredFields = requiredFields
        .remove(RCM.STEP_2_CHARGES)
        .remove(RCM.STEP_4_CHARGES);
    }
    if (!includesSecondaryBookingCharges) {
      requiredFields = requiredFields
        .remove(RCM.SECONDARY_RELEASE_CHARGES)
        .remove(RCM.SECONDARY_HOLD_CHARGES);
    }
    else if (psaForm.get(RCM.COURT_OR_BOOKING, '').includes(CONTEXT.COURT)) {
      requiredFields = requiredFields
        .remove(RCM.SECONDARY_RELEASE_CHARGES)
        .remove(RCM.SECONDARY_HOLD_CHARGES);
    }

    if (requiredFields.valueSeq().filter(this.invalidValue).toList().size) {
      this.setState({ incomplete: true });
    }
    else {
      this.generateScores();
      this.setState({ incomplete: false });
    }
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

  handleClose = () => {
    this.clear();
    this.handlePageChange(Routes.DASHBOARD);
  }

  handlePageChange = (path :string) => {
    const { actions } = this.props;
    actions.goToPath(path);
  }

  getSearchPeopleSection = () => {
    const { history } = this.props;
    return (
      <>
        <InstructionalText>Search person</InstructionalText>
        <InstructionalSubText>
          Enter the persons last name, first name, and dob to get the most accurate results
        </InstructionalSubText>
        <SearchPersonContainer
            history={history}
            onSelectPerson={(person, entityKeyId) => {
              this.handleSelectPerson(person, entityKeyId);
              this.nextPage();
            }} />
      </>
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
    const { personNeighbors, selectedOrganizationSettings } = this.props;
    const { status } = this.state;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const allPSAs = personNeighbors.get(PSA_SCORES, List());
    const openPSAs = getOpenPSAs(allPSAs);
    const PSAScores = status === STATUS_OPTIONS_FOR_PENDING_PSAS.OPEN.label
      ? openPSAs.map(getNeighborDetails)
      : allPSAs.map(getNeighborDetails);
    if (!PSAScores.size || !includesPretrialModule) return null;
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

  getSelectArrestSection = () => {
    const {
      actions,
      arrestChargesForPerson,
      arrestOptions,
      psaForm
    } = this.props;
    const { skipClosePSAs } = this.state;

    const pendingPSAs = (skipClosePSAs || psaForm.get(RCM_FIELDS.COURT_OR_BOOKING) === CONTEXT.BOOKING)
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
      arrestChargesById,
      courtChargesById,
      psaForm,
      selectedOrganizationId
    } = this.props;

    const caseContext = psaForm.get(RCM.CASE_CONTEXT);
    const chargesByOrgId = caseContext === CASE_CONTEXTS.COURT ? courtChargesById : arrestChargesById;

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
      chargeOptions: chargeOptions.sortBy((statute) => statute),
      chargeList: sortedChargeList
    };
  }

  getSelectChargesSection = () => {
    const {
      actions,
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      psaForm,
      selectedPretrialCase,
      selectedPretrialCaseCharges
    } = this.props;
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const caseContext = psaForm.get(RCM.CASE_CONTEXT);
    const { chargeList, chargeOptions } = this.formatChargeOptions();

    if (isLoadingNeighbors || loadingPersonDetails) {
      return (
        <LogoLoader
            loadingText="Loading Person Details..."
            noPadding={false}
            size={50} />
      );
    }

    return (
      <>
        <InstructionalText>Add charges</InstructionalText>
        <InstructionalSubText>
          Add arrest information about the selected person. Add all known arrest charges regarding the
          current case for the most accurate assessment. Click confirm charges to continue.
        </InstructionalSubText>
        <SelectChargesContainer
            caseContext={caseContext}
            defaultArrest={selectedPretrialCase}
            defaultCharges={selectedPretrialCaseCharges}
            chargeOptions={chargeOptions}
            chargeList={chargeList}
            nextPage={this.nextPage}
            prevPage={this.prevPage}
            onSubmit={actions.addCaseAndCharges} />
      </>
    );
  };

  getPersonIdValue = () => {
    const { selectedPerson } = this.props;
    return selectedPerson.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
  }

  getPsaInputForm = () => {
    const {
      allCasesForPerson,
      allChargesForPerson,
      allContacts,
      allFTAs,
      allSentencesForPerson,
      personNeighbors,
      psaForm,
      readOnlyPermissions,
      selectedOrganizationSettings,
      selectedPerson,
      selectedPretrialCase,
      selectedPretrialCaseCharges,
      submitPSAReqState,
      violentChargeList
    } = this.props;
    const personId = this.getPersonIdValue();
    const hasHistory :boolean = Number.parseInt(personId, 10).toString() === personId;
    const courtRemindersEnabled :boolean = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
    const psaSubmissionFailed :boolean = requestIsFailure(submitPSAReqState);
    const isSubmittingPSA :boolean = requestIsPending(submitPSAReqState);
    const caseHistoryText :string = hasHistory ? 'Case history loaded from Odyssey' : 'No Odyssey case history';
    const loadCasesOnTheFly :boolean = selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
    const subscription = personNeighbors.get(SUBSCRIPTION, Map());
    return (
      <>
        <InstructionalText>Complete PSA</InstructionalText>
        <InstructionalSubText>
          Review the person information below and answer all factors to complete PSA. Make sure to manually
          answer any factors without autofill. Click Score & Submit to continue.
        </InstructionalSubText>
        <StyledFormWrapper>
          <Banner
              maxHeight="150px"
              isOpen={psaSubmissionFailed}
              mode="warning">
            <BannerContent>
              <div>An error occurred: unable to submit PSA.</div>
              <BannerButtonsWrapper>
                <Button
                    isLoading={isSubmittingPSA}
                    onClick={this.handleSubmit}>
                  Re-Submit Data
                </Button>
                <Button onClick={() => this.handlePageChange(Routes.DASHBOARD)}>Start Over</Button>
              </BannerButtonsWrapper>
            </BannerContent>
          </Banner>
          <ContextRow>
            <ContextItem>
              <HeaderRow>
                <h1>Person</h1>
                { loadCasesOnTheFly ? <div>{caseHistoryText}</div> : null }
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
          {
            courtRemindersEnabled && (
              <SubscriptionInfo
                  contactInfo={allContacts}
                  person={selectedPerson}
                  readOnly={readOnlyPermissions}
                  subscription={subscription} />
            )
          }
          <PaddedSectionWrapper>
            <HeaderRow left>
              <h1>Charges</h1>
              <span>{selectedPretrialCaseCharges.size}</span>
            </HeaderRow>
            <ChargeTableWrapper>
              <ChargeTable charges={selectedPretrialCaseCharges} violentChargeList={violentChargeList} disabled />
            </ChargeTableWrapper>
          </PaddedSectionWrapper>
          <InstructionalText>Public Safety Assessment</InstructionalText>
          <InstructionalSubText>
            Complete all questions below by confirming autofilled information or by adding new information.
          </InstructionalSubText>
          <PSAInputForm
              allCases={allCasesForPerson}
              allCharges={allChargesForPerson}
              allFTAs={allFTAs}
              allSentences={allSentencesForPerson}
              currCase={selectedPretrialCase}
              currCharges={selectedPretrialCaseCharges}
              handleClose={this.handleClose}
              handleInputChange={this.handleInputChange}
              handleSubmit={this.handleSubmit}
              input={psaForm} />
        </StyledFormWrapper>
      </>
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
      violentCourtCharges,
      violentChargeList,
      psaForm,
      selectedOrganizationId,
      settings
    } = this.props;
    const {
      rcmRiskFactors,
      riskFactors,
      bookingConditions,
      courtConditions,
      scores
    } = this.state;

    const context = psaForm.get('courtOrBooking');
    let conditions = context === CONTEXT.BOOKING ? bookingConditions : courtConditions;
    conditions = conditions.map((condition) => condition[TYPE]);

    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, List());
    const notes = psaForm.get(PSA.NOTES, '');
    const data = fromJS(this.state)
      .set('notes', notes)
      .set('scores', scores)
      .set('riskFactors', this.setMultimapToMap(riskFactors))
      .set('psaRiskFactors', fromJS(riskFactors))
      .set('rcmRiskFactors', fromJS(rcmRiskFactors))
      .set('rcmConditions', fromJS(conditions));

    exportPDF(
      data,
      selectedPretrialCase,
      Map(),
      selectedPretrialCaseCharges,
      selectedPerson,
      arrestOptions,
      allChargesForPerson,
      allSentencesForPerson,
      allFTAs,
      violentChargeList,
      violentCourtChargeList,
      {
        user: this.getStaffId(),
        timestamp: DateTime.local().toISO()
      },
      {
        user: this.getStaffId(),
        timestamp: DateTime.local().toISO()
      },
      isCompact,
      settings
    );
  }

  renderPSAResultsPage = () => {
    const { psaId, scoresWereGenerated } = this.state;
    const {
      allCasesForPerson,
      allChargesForPerson,
      psaForm,
      selectedPerson,
      selectedPretrialCaseCharges,
      submitPSAReqState,
      submittedPSA,
      submittedPSANeighbors
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
    const rcmRiskFactores = submittedPSANeighbors.getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const {
      [PROPERTY_TYPES.CONTEXT]: psaContext,
      [PROPERTY_TYPES.TYPE]: caseContext,
    } = getEntityProperties(rcmRiskFactores, [PROPERTY_TYPES.CONTEXT, PROPERTY_TYPES.TYPE]);

    return (
      <>
        <InstructionalText>Review PSA</InstructionalText>
        <InstructionalSubText>
          Review the PSA Report below and take necessary actions. Clicking Done no the bottoom of the page will
          take you to the Home Page.
        </InstructionalSubText>
        <PSASubmittedPage
            allCases={allCasesForPerson}
            allCharges={chargesByCaseId}
            caseContext={caseContext}
            psaContext={psaContext}
            charges={selectedPretrialCaseCharges}
            context={context}
            getOnExport={this.getOnExport}
            isSubmitting={submittingPSA}
            notes={psaForm.get(PSA.NOTES)}
            personEKID={personEKID}
            personId={this.getPersonIdValue()}
            psaEKID={psaEKID}
            psaId={psaId}
            riskFactors={psaRiskFactores.toJS()}
            scores={submittedPSA}
            submitSuccess={submitPSASuccess}
            submittedPSANeighbors={submittedPSANeighbors} />
      </>
    );
  }

  getCurrentStep = () => {
    const { match } = this.props;
    const { url } = match;
    let currentStep = 0;
    switch (url) {
      case Routes.PSA_FORM_SEARCH:
        currentStep = 0;
        break;
      case Routes.PSA_FORM_ARREST:
        currentStep = 1;
        break;
      case Routes.PSA_FORM_CHARGES:
        currentStep = 1;
        break;
      case Routes.PSA_FORM_INPUT:
        currentStep = 2;
        break;
      case Routes.PSA_SUBMISSION_PAGE:
        currentStep = 3;
        break;
      default:
        break;
    }
    return currentStep;
  }

  setStep = (index :number) => {
    const { actions } = this.props;
    switch (index) {
      case 0:
        actions.goToPath(Routes.PSA_FORM_SEARCH);
        break;
      case 1:
        actions.goToPath(Routes.PSA_FORM_ARREST);
        break;
      case 2:
        actions.goToPath(Routes.PSA_FORM_INPUT);
        break;
      case 3:
        actions.goToPath(Routes.PSA_SUBMISSION_PAGE);
        break;
      default:
        break;
    }
  }

  render() {
    const {
      editPSAReqState,
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      updateCasesReqState,
      selectedPerson,
      submitPSAReqState
    } = this.props;

    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(selectedPerson, [ENTITY_KEY_ID]);
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const updatingCases = requestIsPending(updateCasesReqState);
    const submittingPSA = requestIsPending(submitPSAReqState);
    const edittingPSA = requestIsPending(editPSAReqState);

    if (updatingCases) return this.renderProgressBar();

    return (
      <>
        <StepperWrapper>
          <Stepper activeStep={this.getCurrentStep()} sequential>
            {
              STEPS.map((step, index) => (
                <Step key={step.title} onClick={() => this.setStep(index)}>{step.title}</Step>
              ))
            }
          </Stepper>
        </StepperWrapper>
        <CaseLoaderError personEKID={personEKID} />
        {
          (isLoadingNeighbors || loadingPersonDetails || submittingPSA || edittingPSA)
            ? (
              <LogoLoader
                  loadingText={(submittingPSA || edittingPSA) ? 'Submitting' : 'Loading person details...'}
                  noPadding={false}
                  size={50} />
            )
            : (
              <Switch>
                <Route exact strict path={Routes.PSA_SUBMISSION_PAGE} render={this.renderPSAResultsPage} />
                <Route path={Routes.PSA_FORM_SEARCH} render={this.getSearchPeopleSection} />
                <Route path={Routes.PSA_FORM_ARREST} render={this.getSelectArrestSection} />
                <Route path={Routes.PSA_FORM_CHARGES} render={this.getSelectChargesSection} />
                <Route path={Routes.PSA_FORM_INPUT} render={this.getPsaInputForm} />
                <Route path={Routes.PSA_FORM_SEARCH} render={this.getSearchPeopleSection} />
                <Redirect from={Routes.FORMS} to={Routes.DASHBOARD} />
              </Switch>
            )
        }
      </>
    );
  }
}

const mapStateToProps = (state :Map) :Object => {
  const app = state.get(STATE.APP);
  const psaForm = state.get(STATE.PSA);
  const submit = state.get(STATE.SUBMIT);
  const charges = state.get(STATE.CHARGES);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const person = state.get(STATE.PERSON);
  const selectedOrganizationId = app.get(APP_DATA.SELECTED_ORG_ID);

  const selectedPerson = psaForm.get(PSA_FORM_DATA.SELECT_PERSON);
  const personEKID = getEntityKeyId(selectedPerson, '');
  const personNeighbors = people.getIn([PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, personEKID], Map());
  const allCasesForPerson = personNeighbors.get(APP_TYPES.PRETRIAL_CASES, List()).map(getNeighborDetails);
  const allChargesForPerson = personNeighbors.get(APP_TYPES.CHARGES, List()).map(getNeighborDetails);
  const allFTAs = personNeighbors.get(APP_TYPES.FTAS, List()).map(getNeighborDetails);
  const allSentencesForPerson = personNeighbors.get(APP_TYPES.SENTENCES, List()).map(getNeighborDetails);
  const arrestChargesForPerson = personNeighbors.get(APP_TYPES.ARREST_CHARGES, List()).map(getNeighborDetails);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());

  const violentArrestCharges = charges.get(CHARGE_DATA.ARREST_VIOLENT);
  const violentCourtCharges = charges.get(CHARGE_DATA.COURT_VIOLENT);
  const violentArrestChargeList = violentArrestCharges.get(selectedOrganizationId, List());
  const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, List());
  const caseContextIsCourt = psaForm.getIn([PSA_FORM_DATA.PSA_FORM, RCM.CASE_CONTEXT]) === CASE_CONTEXTS.COURT;
  let violentChargeList = violentArrestChargeList;
  if (caseContextIsCourt) {
    violentChargeList = violentCourtChargeList;
  }

  return {
    allCasesForPerson,
    allChargesForPerson,
    allFTAs,
    allSentencesForPerson,
    arrestChargesForPerson,
    personEKID,
    personNeighbors,

    // App
    selectedOrganizationId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.STAFF_IDS_TO_EKIDS]: app.get(APP_DATA.STAFF_IDS_TO_EKIDS),
    [APP_DATA.DATA_MODEL]: app.get(APP_DATA.DATA_MODEL),

    // Charges
    violentArrestCharges,
    violentCourtCharges,
    violentChargeList,
    [CHARGE_DATA.ARREST_CHARGES_BY_ID]: charges.get(CHARGE_DATA.ARREST_CHARGES_BY_ID),
    [CHARGE_DATA.COURT_CHARGES_BY_ID]: charges.get(CHARGE_DATA.COURT_CHARGES_BY_ID),
    [CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE]: charges.get(CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE),
    [CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE]: charges.get(CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE),
    [CHARGE_DATA.COURT_MAX_LEVEL_INCREASE]: charges.get(CHARGE_DATA.COURT_MAX_LEVEL_INCREASE),
    [CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE]: charges.get(CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE),
    [CHARGE_DATA.BRE]: charges.get(CHARGE_DATA.BRE),
    [CHARGE_DATA.BHE]: charges.get(CHARGE_DATA.BHE),

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
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    updateCasesError: getError(person, PERSON_ACTIONS.UPDATE_CASES),
    [PERSON_DATA.NUM_CASES_TO_LOAD]: person.get(PERSON_DATA.NUM_CASES_TO_LOAD),
    [PERSON_DATA.NUM_CASES_LOADED]: person.get(PERSON_DATA.NUM_CASES_LOADED),

    // Settings
    settings
  };
};


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
