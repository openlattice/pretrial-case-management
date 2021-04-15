/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Banner, Button, Modal } from 'lattice-ui-kit';
import { fromJS, List, Map } from 'immutable';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { Constants } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CaseHistory from '../../components/casehistory/CaseHistory';
import CaseHistoryTimeline from '../../components/casehistory/CaseHistoryTimeline';
import ClosePSAModal from '../../components/review/ClosePSAModal';
import CustomTabs from '../../components/tabs/Tabs';
import LoadPersonCaseHistoryButton from '../person/LoadPersonCaseHistoryButton';
import LogoLoader from '../../components/LogoLoader';
import ModalHeader from './ModalHeader';
import PersonCard from '../../components/person/PersonCardReview';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PSAModalSummary from '../../components/review/PSAModalSummary';
import ReleaseConditionsSummary from '../../components/releaseconditions/ReleaseConditionsSummary';
import RCMExplanation from '../../components/rcm/RCMExplanation';
import SelectHearingsContainer from '../hearings/SelectHearingsContainer';
import { getScoresAndRiskFactors, calculateRCM } from '../../utils/ScoringUtils';
import { CenteredContainer, Title } from '../../utils/Layout';
import { getCasesForPSA } from '../../utils/CaseUtils';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CASE_CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR, PSA_MODAL } from '../../utils/consts/FrontEndStateConsts';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetId,
  getIdOrValue
} from '../../utils/DataUtils';
import {
  CONTEXT,
  NOTES,
  PSA
} from '../../utils/consts/Consts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { PERSON_ACTIONS } from '../../utils/consts/redux/PersonConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

import {
  updateScoresAndRiskFactors,
  UPDATE_SCORES_AND_RISK_FACTORS
} from '../review/ReviewActions';
import {
  addCaseToPSA,
  editPSA,
  removeCaseFromPSA
} from '../psa/PSAFormActions';

const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = RCM_FIELDS;

const {
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RELEASE_RECOMMENDATIONS,
  STAFF
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  CASE_ID,
  CASE_STATUS,
  ENTITY_KEY_ID,
  TYPE
} = PROPERTY_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const DownloadButtonContainer = styled.div`
  align-items: center !important;
  display: flex;
  height: 100%;
  width: 100%;
`;

const ModalWrapper = styled.div`
  width: 100%;
  height: max-content;

  hr {
    border: solid 1px ${OL.GREY28};
    height: 0;
  }
`;

const ContentWrapper = styled.div`
  height: max-content;
  width: 975px;

  > div:first-child {
    border-radius: 3px 3px 0 0;
    margin: 0 -20px 20px;

    button {
      margin-left: 20px;
      min-width: 200px;
    }
  }
`;

const NoRCMContainer = styled(CenteredContainer)`
  font-size: 18px;
  margin: 30px;
`;

const TitleWrapper = styled.div`
  padding: 35px 15px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const EditPSAButton = styled(Button)`
  margin: ${(props :Object) => (props.footer ? '-20px 0 30px' : '0')};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${OL.GREY02};
  width: ${(props :Object) => (props.footer ? '340px' : '142px')};
  height: ${(props :Object) => (props.footer ? '42px' : '40px')};
  border: none;
  border-radius: 3px;
  background-color: ${OL.GREY08};
`;

const PSAFormHeader = styled.div`
  padding: 30px;
  font-size: 18px;
  color: ${OL.GREY01};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px ${OL.GREY11} !important;
`;

type Props = {
  actions :{
    addCaseToPSA :RequestSequence;
    changePSAStatus :RequestSequence;
    editPSA :RequestSequence;
    removeCaseFromPSA :RequestSequence;
    updateScoresAndRiskFactors :RequestSequence;
    updateOutcomesAndReleaseCondtions :RequestSequence;
  };
  caseHistory :List;
  chargeHistory :Map;
  entityKeyId :string;
  ftaHistory :Map;
  getPeopleNeighborsReqState :RequestState;
  hearings :List;
  hearingNeighborsById :Map;
  hideProfile? :boolean;
  loadingPSAModal :boolean;
  loadingCaseHistory :boolean;
  loadPersonDetailsReqState :RequestState;
  manualCaseHistory :List;
  manualChargeHistory :Map;
  peopleNeighborsById :Map;
  updateCasesReqState :RequestState;
  updateScoresAndRiskFactorsRS :RequestState;
  onClose :() => {};
  open :boolean;
  personHearings :Map;
  personNeighbors :Map;
  psaId :Map;
  psaNeighbors :Map;
  psaPermissions :boolean;
  scores :Map;
  selectedOrganizationSettings :Map;
  sentenceHistory :Map;
  settings :Map;
};

type State = {
  closingPSAModalOpen :boolean;
  editing :boolean;
  riskFactors :Map;
};

class PSAModal extends React.Component<Props, State> {

  static defaultProps = {
    hideProfile: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      editing: false,
      closingPSAModalOpen: false,
      riskFactors: this.getRiskFactors(props.psaNeighbors),
    };
  }

  componentDidUpdate(prevProps :Props, prevState :State) {
    const { psaNeighbors, loadingPSAModal, updateScoresAndRiskFactorsRS } = this.props;
    const { updateScoresAndRiskFactorsRS: prevUpdateScoresAndRiskFactorsRS } = prevProps;
    const { editing } = this.state;
    const udpateWasPending = requestIsPending(prevUpdateScoresAndRiskFactorsRS);
    const udpateIsSuccess = requestIsSuccess(updateScoresAndRiskFactorsRS);
    if (
      (psaNeighbors.size && prevProps.loadingPSAModal && !loadingPSAModal)
        || (prevState.editing && !editing)
        || (udpateWasPending && udpateIsSuccess)
    ) {
      this.setState({
        riskFactors: this.getRiskFactors(psaNeighbors)
      });
    }
  }

  openClosePSAModal = () => this.setState({ closingPSAModalOpen: true });

  exitEdit = () => {
    const { psaNeighbors } = this.props;
    this.setState({
      editing: false,
      riskFactors: this.getRiskFactors(psaNeighbors)
    });
  }

  onClose = () => {
    const { onClose } = this.props;
    this.exitEdit();
    onClose();
  }

  getNotesFromNeighbors = (neighbors) => neighbors.getIn([
    RELEASE_RECOMMENDATIONS,
    PSA_NEIGHBOR.DETAILS,
    PROPERTY_TYPES.RELEASE_RECOMMENDATION,
    0
  ], '');

  getRiskFactors = (neighbors :Map) => {
    const { settings } = this.props;
    const riskFactors = neighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const rcmRiskFactors = neighbors.getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const ageAtCurrentArrestVal = riskFactors.getIn([PROPERTY_TYPES.AGE_AT_CURRENT_ARREST, 0]);
    let ageAtCurrentArrest = 0;
    if (ageAtCurrentArrestVal === '21 or 22') ageAtCurrentArrest = 1;
    else if (ageAtCurrentArrestVal === '23 or Older') ageAtCurrentArrest = 2;
    const priorViolentConvictionVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION, 0]);
    const priorViolentConviction = (priorViolentConvictionVal === '3 or more') ? 3 : priorViolentConvictionVal;
    const priorFTAVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT, 0]);
    const priorFTA = (priorFTAVal === '2 or more') ? 2 : priorFTAVal;

    let newRiskFactors = {
      [PSA.NOTES]: this.getNotesFromNeighbors(neighbors),
      [PSA.AGE_AT_CURRENT_ARREST]: `${ageAtCurrentArrest}`,
      [PSA.CURRENT_VIOLENT_OFFENSE]: `${riskFactors.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE, 0])}`,
      [PSA.PENDING_CHARGE]: `${riskFactors.getIn([PROPERTY_TYPES.PENDING_CHARGE, 0])}`,
      [PSA.PRIOR_MISDEMEANOR]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_MISDEMEANOR, 0])}`,
      [PSA.PRIOR_FELONY]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_FELONY, 0])}`,
      [PSA.PRIOR_VIOLENT_CONVICTION]: `${priorViolentConviction}`,
      [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: `${priorFTA}`,
      [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD, 0])}`,
      [PSA.PRIOR_SENTENCE_TO_INCARCERATION]:
      `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION, 0])}`,
      [NOTES[PSA.AGE_AT_CURRENT_ARREST]]: riskFactors.getIn([PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_NOTES, 0], ''),
      [NOTES[PSA.CURRENT_VIOLENT_OFFENSE]]: riskFactors.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_NOTES, 0], ''),
      [NOTES[PSA.PENDING_CHARGE]]: riskFactors.getIn([PROPERTY_TYPES.PENDING_CHARGE_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_MISDEMEANOR]]: riskFactors.getIn([PROPERTY_TYPES.PRIOR_MISDEMEANOR_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_FELONY]]: riskFactors.getIn([PROPERTY_TYPES.PRIOR_FELONY_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_VIOLENT_CONVICTION]]: riskFactors.getIn([PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]]:
      riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_FAILURE_TO_APPEAR_OLD]]:
      riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_NOTES, 0], ''),
      [NOTES[PSA.PRIOR_SENTENCE_TO_INCARCERATION]]:
      riskFactors.getIn([PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_NOTES, 0], ''),
    };
    const includesStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const includesSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);

    if (includesStepIncreases) {
      newRiskFactors = {
        ...newRiskFactors,
        [EXTRADITED]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED, 0])}`,
        [STEP_2_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_2_CHARGES, 0])}`,
        [STEP_4_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_4_CHARGES, 0])}`,
        [COURT_OR_BOOKING]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.CONTEXT, 0])}`,
        [NOTES[EXTRADITED]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED_NOTES, 0], '')}`,
        [NOTES[STEP_2_CHARGES]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_2_CHARGES_NOTES, 0], '')}`,
        [NOTES[STEP_4_CHARGES]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_4_CHARGES_NOTES, 0], '')}`
      };
    }
    if (includesSecondaryBookingCharges) {
      newRiskFactors = {
        ...newRiskFactors,
        [SECONDARY_RELEASE_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES, 0])}`,
        [SECONDARY_HOLD_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES, 0])}`,
        [NOTES[SECONDARY_RELEASE_CHARGES]]:
        `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES_NOTES, 0], '')}`,
        [NOTES[SECONDARY_HOLD_CHARGES]]:
        `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES_NOTES, 0], '')}`
      };
    }
    return fromJS(newRiskFactors);
  }

  getRCM = (neighbors :Map<*, *>) => neighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map());

  renderPersonCard = () => {
    const { psaNeighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return <PersonCard person={personDetails} />;
  }

  handleRiskFactorChange = (e :Object) => {
    const {
      PRIOR_MISDEMEANOR,
      PRIOR_FELONY,
      PRIOR_VIOLENT_CONVICTION,
      PRIOR_SENTENCE_TO_INCARCERATION
    } = PSA;
    let { riskFactors } = this.state;
    riskFactors = riskFactors.set(e.target.name, e.target.value);
    if (riskFactors.get(PRIOR_MISDEMEANOR) === 'false' && riskFactors.get(PRIOR_FELONY) === 'false') {
      riskFactors = riskFactors.set(PRIOR_VIOLENT_CONVICTION, '0').set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
    }
    this.setState({ riskFactors });
  }

  getRCMRiskFactorsEntity = (riskFactors :Map, rcmRiskFactorsId :string) => {
    const result :Object = {
      [PROPERTY_TYPES.GENERAL_ID]: [rcmRiskFactorsId],
      [PROPERTY_TYPES.EXTRADITED]: [riskFactors.get(EXTRADITED)],
      [PROPERTY_TYPES.RCM_STEP_2_CHARGES]: [riskFactors.get(STEP_2_CHARGES)],
      [PROPERTY_TYPES.RCM_STEP_4_CHARGES]: [riskFactors.get(STEP_4_CHARGES)],
      [PROPERTY_TYPES.CONTEXT]: [riskFactors.get(COURT_OR_BOOKING)],
      [PROPERTY_TYPES.EXTRADITED_NOTES]: [riskFactors.get(NOTES[EXTRADITED])],
      [PROPERTY_TYPES.RCM_STEP_2_CHARGES_NOTES]: [riskFactors.get(NOTES[STEP_2_CHARGES])],
      [PROPERTY_TYPES.RCM_STEP_4_CHARGES_NOTES]: [riskFactors.get(NOTES[STEP_4_CHARGES])]
    };
    if (riskFactors.get(COURT_OR_BOOKING) === CONTEXT.BOOKING) {
      result[PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES] = [riskFactors.get(SECONDARY_RELEASE_CHARGES)];
      result[PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES_NOTES] = [
        riskFactors.get(NOTES[SECONDARY_RELEASE_CHARGES])
      ];
      result[PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES] = [riskFactors.get(SECONDARY_HOLD_CHARGES)];
      result[PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES_NOTES] = [riskFactors.get(NOTES[SECONDARY_HOLD_CHARGES])];
    }
    return result;
  };

  getNotesEntity = (riskFactors :Map, notesId :string) => ({
    [PROPERTY_TYPES.GENERAL_ID]: [notesId],
    [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: [riskFactors.get(PSA.NOTES)]
  });

  getEntitySetId = (name :string) :string => {
    const { psaNeighbors } = this.props;
    return getEntitySetId(psaNeighbors, name);
  };

  getEntityKeyId = (name :string) :string => {
    const { psaNeighbors } = this.props;
    return getEntityKeyId(psaNeighbors, name);
  };

  getIdOrValue = (name :string, optionalFQN :string) :string => {
    const { psaNeighbors } = this.props;
    return getIdOrValue(psaNeighbors, name, optionalFQN);
  };

  getBookingConditionsEdit = (newBookingCondition :Object) => {
    const { psaNeighbors } = this.props;
    const existingBookingCondition = psaNeighbors.getIn([RCM_BOOKING_CONDITIONS, 0], Map());
    const existingBookingConditionType = existingBookingCondition.getIn([PSA_NEIGHBOR.DETAILS, TYPE, 0], '');
    const ekid = getEntityKeyId(existingBookingCondition);
    return (existingBookingConditionType !== newBookingCondition[TYPE])
      ? { ekid, newBookingCondition } : { ekid: '', newBookingCondition: {} };
  }

  getCourtConditionsEdit = (newCourtConditions :Object[]) => {
    const { psaNeighbors } = this.props;
    const existingCourtConditions = psaNeighbors.get(RCM_COURT_CONDITIONS, List());
    const existingConditionTypes = existingCourtConditions.map((condition) => (
      condition.getIn([PSA_NEIGHBOR.DETAILS, TYPE, 0])));
    const newConditionTypes = newCourtConditions.map((condition) => condition[TYPE]);

    const entitiesToCreate = newCourtConditions.filter((condition :Object) => {
      const conditionType = condition[TYPE];
      return !existingConditionTypes.includes(conditionType);
    });

    const deleteEKIDs = existingCourtConditions.filter((condition) => {
      const { [TYPE]: conditionType } = getEntityProperties(condition, [TYPE]);
      return !newConditionTypes.includes(conditionType);
    }).map((condition) => {
      const { [ENTITY_KEY_ID]: conditionEKID } = getEntityProperties(condition, [ENTITY_KEY_ID]);
      return conditionEKID;
    });

    return { entitiesToCreate, deleteEKIDs };
  }

  onRiskFactorEdit = (e :Object) => {
    e.preventDefault();
    const {
      actions,
      entityKeyId,
      psaNeighbors,
      scores,
      selectedOrganizationSettings
    } = this.props;

    const person = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(person, [ENTITY_KEY_ID]);

    const { riskFactors } = this.state;
    // import module settings
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const scoresAndRiskFactors :Object = getScoresAndRiskFactors(riskFactors);
    const riskFactorsEntity = { ...scoresAndRiskFactors.riskFactors };
    const { rcm: rcmEntity, courtConditions, bookingConditions } = calculateRCM(
      riskFactors,
      scoresAndRiskFactors.scores,
      selectedOrganizationSettings
    );

    const scoreId = scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0]);
    const riskFactorsIdValue = this.getIdOrValue(PSA_RISK_FACTORS);
    const rcmEKID = this.getEntityKeyId(RCM_RESULTS);

    const { entitiesToCreate, deleteEKIDs } = this.getCourtConditionsEdit(courtConditions);
    const { ekid, newBookingCondition } = this.getBookingConditionsEdit(bookingConditions[0]);
    const bookingConditionsEntity = newBookingCondition;
    const bookingConditionsEKID = ekid;
    const courtConditionsEntities = entitiesToCreate;
    const deleteConditionEKIDS = deleteEKIDs;

    const rcmRiskFactorsIdValue = this.getIdOrValue(RCM_RISK_FACTORS);
    const rcmRiskFactorsEKID = this.getEntityKeyId(RCM_RISK_FACTORS);
    const rcmRiskFactorsEntity = this.getRCMRiskFactorsEntity(riskFactors, rcmRiskFactorsIdValue);

    const newScores = scoresAndRiskFactors.scores;
    const scoresEntity = scores
      .set(PROPERTY_TYPES.FTA_SCALE, newScores.get(PROPERTY_TYPES.FTA_SCALE))
      .set(PROPERTY_TYPES.NCA_SCALE, newScores.get(PROPERTY_TYPES.NCA_SCALE))
      .set(PROPERTY_TYPES.NVCA_FLAG, newScores.get(PROPERTY_TYPES.NVCA_FLAG))
      .delete(PROPERTY_TYPES.GENERAL_ID)
      .delete(PROPERTY_TYPES.ENTITY_KEY_ID)
      .toJS();

    if (riskFactorsIdValue) riskFactorsEntity[PROPERTY_TYPES.GENERAL_ID] = [riskFactorsIdValue];

    const scoresEKID = entityKeyId;
    const riskFactorsEKID = this.getEntityKeyId(PSA_RISK_FACTORS);

    let notesIdValue = this.getIdOrValue(RELEASE_RECOMMENDATIONS);
    const notesEKID = this.getEntityKeyId(RELEASE_RECOMMENDATIONS);
    if (this.getNotesFromNeighbors(psaNeighbors) !== notesIdValue) {
      notesIdValue = riskFactors.get(PSA.NOTES);
    }
    const notesEntity = this.getNotesEntity(riskFactors, notesEKID);

    actions.updateScoresAndRiskFactors({
      bookingConditionsEKID,
      bookingConditionsEntity,
      courtConditionsEntities,
      deleteConditionEKIDS,
      personEKID,
      scoresEKID,
      scoresEntity,
      riskFactorsEKID,
      riskFactorsEntity,
      rcmEKID,
      rcmEntity,
      rcmRiskFactorsEKID,
      rcmRiskFactorsEntity,
      notesEKID,
      notesEntity
    });

    const psaRiskFactors = psaNeighbors.get(PSA_RISK_FACTORS, Map());

    const psaEKID = getEntityKeyId(scores);
    const psaRiskFactorsEKID = getEntityKeyId(psaRiskFactors);

    if (scoreId) {
      actions.editPSA({
        includesPretrialModule,
        psaEKID,
        psaRiskFactorsEKID,
        rcmEKID,
        rcmRiskFactorsEKID
      });
    }

    this.setState({ editing: false });
  }

  handleStatusChange = () => {
    this.setState({ editing: false });
  }

  renderSummary = () => {
    const {
      caseHistory,
      chargeHistory,
      manualCaseHistory,
      manualChargeHistory,
      peopleNeighborsById,
      psaNeighbors,
      psaPermissions,
      scores
    } = this.props;
    const { riskFactors } = this.state;
    let caseNumbersToAssociationId = Map();
    psaNeighbors.get(PRETRIAL_CASES, List()).forEach((pretrialCase) => {
      const caseNum = pretrialCase.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
      const associationEntityKeyId = pretrialCase.getIn([PSA_ASSOCIATION.DETAILS, OPENLATTICE_ID_FQN, 0]);
      caseNumbersToAssociationId = caseNumbersToAssociationId.set(caseNum, associationEntityKeyId);
    });

    const arrestDate = psaNeighbors.getIn(
      [MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      ''
    );
    const lastEditDateForPSA = psaNeighbors.getIn(
      [STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
      scores.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')
    );
    const {
      chargeHistoryForMostRecentPSA,
      caseHistoryForMostRecentPSA,
    } = getCasesForPSA(
      caseHistory,
      chargeHistory,
      scores,
      arrestDate,
      lastEditDateForPSA
    );
    const personEntityKeyId = getIdOrValue(psaNeighbors, PEOPLE, OPENLATTICE_ID_FQN);
    const personNeighbors = peopleNeighborsById.get(personEntityKeyId, Map());

    // Get Case Context from type property on rcm risk factors
    const caseContext = psaNeighbors
      .getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.TYPE, 0], CASE_CONTEXTS.ARREST);

    return (
      <PSAModalSummary
          addCaseToPSA={this.addCaseToPSA}
          caseContext={caseContext}
          caseNumbersToAssociationId={caseNumbersToAssociationId}
          chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
          caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
          manualCaseHistory={manualCaseHistory}
          manualChargeHistory={manualChargeHistory}
          neighbors={psaNeighbors}
          notes={riskFactors.get(PSA.NOTES)}
          personNeighbors={personNeighbors}
          psaPermissions={psaPermissions}
          removeCaseFromPSA={this.removeCaseFromPSA} />
    );
  }

  renderPSADetails = () => {
    const {
      caseHistory,
      manualCaseHistory,
      chargeHistory,
      manualChargeHistory,
      sentenceHistory,
      ftaHistory,
      psaNeighbors,
      scores,
      psaPermissions
    } = this.props;
    const psaDate = scores.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    const { editing, riskFactors } = this.state;
    const editHeader = (editing || !psaPermissions || psaIsClosed(scores)) ? null : (
      <CenteredContainer>
        <PSAFormHeader>
          Public Safety Assessment
          <EditPSAButton onClick={() => {
            this.setState({ editing: true });
          }}>
            Edit PSA
          </EditPSAButton>
        </PSAFormHeader>
      </CenteredContainer>
    );
    const editButton = (editing || !psaPermissions || psaIsClosed(scores)) ? null : (
      <CenteredContainer>
        <EditPSAButton
            footer
            onClick={() => {
              this.setState({ editing: true });
            }}>
          Edit PSA
        </EditPSAButton>
      </CenteredContainer>
    );

    const caseNum = psaNeighbors.getIn(
      [PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0],
      psaNeighbors.getIn(
        [MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0],
        ''
      )
    );
    const currCase = manualCaseHistory
      .filter((caseObj) => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
      .get(0, Map());
    const currCharges = manualChargeHistory.get(caseNum, List());
    const allCharges = chargeHistory.toList().flatMap((list) => list);
    const allSentences = sentenceHistory.toList().flatMap((list) => list);
    // Get Case Context from type property on rcm risk factors
    const caseContext = psaNeighbors
      .getIn([RCM_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0], CASE_CONTEXTS.ARREST);
    return (
      <ModalWrapper>
        {editHeader}
        <PSAInputForm
            caseContext={caseContext}
            section="review"
            input={riskFactors}
            handleInputChange={this.handleRiskFactorChange}
            handleSubmit={this.onRiskFactorEdit}
            currCase={currCase}
            currCharges={currCharges}
            allCharges={allCharges}
            allCases={caseHistory}
            allSentences={allSentences}
            allFTAs={ftaHistory}
            viewOnly={!editing || psaIsClosed(scores)}
            exitEdit={this.exitEdit}
            modal
            psaDate={psaDate} />
        {editButton}
      </ModalWrapper>
    );
  }

  renderRCMExplanation = () => {
    const { scores, psaNeighbors, settings } = this.props;
    const { riskFactors } = this.state;
    const includeStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const includeSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
    if (!psaNeighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map()).size) {
      return <NoRCMContainer>A RCM was not calculated for this PSA.</NoRCMContainer>;
    }

    return (
      <ModalWrapper>
        <RCMExplanation
            includeStepIncreases={includeStepIncreases}
            includeSecondaryBookingCharges={includeSecondaryBookingCharges}
            scores={scores}
            riskFactors={riskFactors} />
      </ModalWrapper>
    );
  }

  addCaseToPSA = (caseEKID :string) => {
    const { actions, scores } = this.props;
    const psaEKID = getEntityKeyId(scores);
    actions.addCaseToPSA({ psaEKID, caseEKID });
  }

  removeCaseFromPSA = (associationEKID :string) => {
    const { actions, scores } = this.props;
    const psaEKID = getEntityKeyId(scores);
    actions.removeCaseFromPSA({ associationEKID, psaEKID });
  }

  renderCaseHistory = () => {
    const {
      caseHistory,
      chargeHistory,
      getPeopleNeighborsReqState,
      loadPersonDetailsReqState,
      updateCasesReqState,
      peopleNeighborsById,
      psaNeighbors,
      psaPermissions,
      scores,
    } = this.props;
    const isLoadingNeighbors = requestIsPending(getPeopleNeighborsReqState);
    const loadingPersonDetails = requestIsPending(loadPersonDetailsReqState);
    const loadingCases = requestIsPending(updateCasesReqState);
    const arrest = psaNeighbors.getIn([MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS], Map());
    const {
      [ARREST_DATE_TIME]: arrestDate,
      [CASE_ID]: caseId
    } = getEntityProperties(
      arrest,
      [CASE_ID, ARREST_DATE_TIME]
    );
    const lastEditDateForPSA = psaNeighbors.getIn(
      [STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
      scores.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')
    );
    const {
      caseHistoryForMostRecentPSA,
      chargeHistoryForMostRecentPSA,
      caseHistoryNotForMostRecentPSA,
      chargeHistoryNotForMostRecentPSA
    } = getCasesForPSA(
      caseHistory,
      chargeHistory,
      scores,
      arrestDate,
      lastEditDateForPSA
    );
    let caseNumbersToAssociationId = Map();
    psaNeighbors.get(PRETRIAL_CASES, List()).forEach((pretrialCase) => {
      const caseNum = pretrialCase.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0]);
      const associationEntityKeyId = pretrialCase.getIn([PSA_ASSOCIATION.DETAILS, OPENLATTICE_ID_FQN, 0]);
      caseNumbersToAssociationId = caseNumbersToAssociationId.set(caseNum, associationEntityKeyId);
    });
    const personEntityKeyId = getIdOrValue(psaNeighbors, PEOPLE, OPENLATTICE_ID_FQN);
    const personNeighbors = peopleNeighborsById.get(personEntityKeyId, Map());

    return (
      <ModalWrapper>
        <TitleWrapper>
          <Title withSubtitle>
            <span>Timeline</span>
            <span>Convictions in past two years</span>
          </Title>
          <LoadPersonCaseHistoryButton personEntityKeyId={personEntityKeyId} psaNeighbors={psaNeighbors} />
        </TitleWrapper>
        <CaseHistoryTimeline caseHistory={caseHistory} chargeHistory={chargeHistory} />
        <hr />
        {
          (isLoadingNeighbors || loadingPersonDetails || loadingCases)
            ? (
              <LogoLoader loadingText="Refreshing Case History" />
            )
            : (
              <CaseHistory
                  modal
                  addCaseToPSA={this.addCaseToPSA}
                  arrestDate={arrestDate}
                  caseId={caseId}
                  caseNumbersToAssociationId={caseNumbersToAssociationId}
                  removeCaseFromPSA={this.removeCaseFromPSA}
                  caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
                  chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
                  caseHistoryNotForMostRecentPSA={caseHistoryNotForMostRecentPSA}
                  chargeHistoryNotForMostRecentPSA={chargeHistoryNotForMostRecentPSA}
                  chargeHistory={chargeHistory}
                  personNeighbors={personNeighbors}
                  psaNeighbors={psaNeighbors}
                  psaPermissions={psaPermissions} />
            )
        }
      </ModalWrapper>
    );
  };

  renderReleaseConditionsSummary = () => {
    const { psaNeighbors, hearingNeighborsById } = this.props;
    const psaHearings = psaNeighbors.get(APP_TYPES.HEARINGS, List());
    const hearingsWithOutcomes = psaHearings.filter((hearing) => {
      const entityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
      return !!hearingNeighborsById.getIn([entityKeyId, OUTCOMES]);
    }).sort((h1, h2) => (DateTime.fromISO(h1.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''))
      < DateTime.fromISO(h2.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')) ? 1 : -1));

    return (
      <ReleaseConditionsSummary
          completedHearings={hearingsWithOutcomes}
          hearingNeighborsById={hearingNeighborsById} />
    );
  }

  renderHearings = () => {
    const {
      hearings,
      psaNeighbors,
      entityKeyId,
      personHearings,
      personNeighbors,
      psaPermissions
    } = this.props;

    const person = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(person, [ENTITY_KEY_ID]);
    return (
      <ModalWrapper>
        <SelectHearingsContainer
            neighbors={psaNeighbors}
            openClosePSAModal={this.openClosePSAModal}
            personEKID={personEKID}
            personHearings={personHearings}
            personNeighbors={personNeighbors}
            psaEntityKeyId={entityKeyId}
            psaHearings={hearings}
            psaNeighbors={psaNeighbors}
            readOnly={!psaPermissions} />
      </ModalWrapper>
    );
  }

  render() {
    const {
      loadingPSAModal,
      loadingCaseHistory,
      scores,
      open,
      personNeighbors,
      psaNeighbors,
      psaPermissions,
      psaId,
      selectedOrganizationSettings
    } = this.props;
    const person = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const personEKID = getEntityKeyId(person);

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');

    const personCases = personNeighbors.get(PRETRIAL_CASES, List());

    const casesNeedToBeUpdated :boolean = personCases.size && personCases.some((pretrialCase) => {
      const { [CASE_STATUS]: caseStatus } = getEntityProperties(pretrialCase, [CASE_STATUS]);
      return !caseStatus.length;
    });

    const { closingPSAModalOpen } = this.state;

    if (!scores) return null;

    const modalHasLoaded = !loadingPSAModal && !loadingCaseHistory;

    let tabs = [
      {
        title: 'Summary',
        content: this.renderSummary
      },
      {
        title: 'PSA',
        content: this.renderPSADetails
      },
      {
        title: 'RCM',
        content: this.renderRCMExplanation
      },
      {
        title: 'Case History',
        content: this.renderCaseHistory
      },
      {
        title: 'Release Conditions',
        content: this.renderReleaseConditionsSummary
      }
    ];

    const hearingTab = {
      title: 'Hearings',
      content: this.renderHearings
    };

    if (!psaIsClosed(scores)) {
      tabs.splice(4, 0, hearingTab);
    }

    if (!includesPretrialModule) {
      tabs = tabs.slice(0, 3);
    }

    return (
      <Modal
          isVisible={open}
          onClose={this.onClose}
          shouldCloseOnOutsideClick
          viewportScrolling>
        {
          psaPermissions && modalHasLoaded
            ? (
              <ClosePSAModal
                  open={closingPSAModalOpen}
                  defaultStatus={scores.getIn([PROPERTY_TYPES.STATUS, 0], '')}
                  defaultStatusNotes={scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0], '')}
                  defaultFailureReasons={scores.get(PROPERTY_TYPES.FAILURE_REASON, List()).toJS()}
                  onClose={() => this.setState({ closingPSAModalOpen: false })}
                  onSubmit={this.handleStatusChange}
                  scores={scores}
                  entityKeyId={psaId} />
            )
            : null
        }
        {
          (loadingPSAModal)
            ? <LogoLoader loadingText="Loading person details..." />
            : (
              <ContentWrapper>
                <Banner isOpen={casesNeedToBeUpdated} mode="danger">
                  {
                    "Legacy case information has been detected. Click 'Load Case History'"
                    + ' button to refresh for ths person.'
                  }
                  <LoadPersonCaseHistoryButton buttonText="Load Case History" personEntityKeyId={personEKID} />
                </Banner>
                <ModalHeader
                    person={person}
                    closePSAFn={() => this.setState({ closingPSAModalOpen: true })} />
                <CustomTabs panes={tabs} />
              </ContentWrapper>
            )
        }
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const psaModal = state.get(STATE.PSA_MODAL);
  const person = state.get(STATE.PERSON);
  const people = state.get(STATE.PEOPLE);
  const review = state.get(STATE.REVIEW);
  const settings = state.get(STATE.SETTINGS);
  return {
    app,
    [APP_DATA.FQN_TO_ID]: app.get(APP_DATA.FQN_TO_ID),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),

    [PSA_MODAL.SCORES]: psaModal.get(PSA_MODAL.SCORES),
    [PSA_MODAL.PSA_ID]: psaModal.get(PSA_MODAL.PSA_ID),
    [PSA_MODAL.LOADING_PSA_MODAL]: psaModal.get(PSA_MODAL.LOADING_PSA_MODAL),
    [PSA_MODAL.PSA_NEIGHBORS]: psaModal.get(PSA_MODAL.PSA_NEIGHBORS),
    [PSA_MODAL.PSA_PERMISSIONS]: psaModal.get(PSA_MODAL.PSA_PERMISSIONS),
    [PSA_MODAL.HEARINGS]: psaModal.get(PSA_MODAL.HEARINGS),
    [PSA_MODAL.HEARING_IDS]: psaModal.get(PSA_MODAL.HEARING_IDS),
    [PSA_MODAL.LOADING_HEARING_NEIGHBORS]: psaModal.get(PSA_MODAL.LOADING_HEARING_NEIGHBORS),
    [PSA_MODAL.PERSON_HEARINGS]: psaModal.get(PSA_MODAL.PERSON_HEARINGS),
    [PSA_MODAL.PERSON_NEIGHBORS]: psaModal.get(PSA_MODAL.PERSON_NEIGHBORS),
    [PSA_MODAL.PERSON_ID]: psaModal.get(PSA_MODAL.PERSON_ID),
    [PSA_MODAL.LOADING_CASES]: psaModal.get(PSA_MODAL.LOADING_CASES),
    [PSA_MODAL.CASE_HISTORY]: psaModal.get(PSA_MODAL.CASE_HISTORY),
    [PSA_MODAL.MANUAL_CASE_HISTORY]: psaModal.get(PSA_MODAL.MANUAL_CASE_HISTORY),
    [PSA_MODAL.CHARGE_HISTORY]: psaModal.get(PSA_MODAL.CHARGE_HISTORY),
    [PSA_MODAL.MANUAL_CHARGE_HISTORY]: psaModal.get(PSA_MODAL.MANUAL_CHARGE_HISTORY),
    [PSA_MODAL.SENTENCE_HISTORY]: psaModal.get(PSA_MODAL.SENTENCE_HISTORY),
    [PSA_MODAL.FTA_HISTORY]: psaModal.get(PSA_MODAL.FTA_HISTORY),

    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),

    updateScoresAndRiskFactorsRS: getReqState(review, UPDATE_SCORES_AND_RISK_FACTORS),

    /* Settings */
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS, Map())
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review Actions
    updateScoresAndRiskFactors,
    // Form Actions
    addCaseToPSA,
    editPSA,
    removeCaseFromPSA
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PSAModal);
