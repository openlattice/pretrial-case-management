/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Constants } from 'lattice';
import Immutable, { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

import CustomTabs from '../../components/tabs/Tabs';
import LogoLoader from '../../components/LogoLoader';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PersonCard from '../../components/person/PersonCardReview';
import StyledButton from '../../components/buttons/StyledButton';
import DropdownButton from '../../components/buttons/DropdownButton';
import CaseHistory from '../../components/casehistory/CaseHistory';
import CaseHistoryTimeline from '../../components/casehistory/CaseHistoryTimeline';
import RCMExplanation from '../../components/rcm/RCMExplanation';
import SelectHearingsContainer from '../hearings/SelectHearingsContainer';
import PSAModalSummary from '../../components/review/PSAModalSummary';
import ModalHeader from './ModalHeader';
import ReleaseConditionsSummary from '../../components/releaseconditions/ReleaseConditionsSummary';
import ClosePSAModal from '../../components/review/ClosePSAModal';
import LoadPersonCaseHistoryButton from '../person/LoadPersonCaseHistoryButton';
import { getScoresAndRiskFactors, calculateRCM } from '../../utils/ScoringUtils';
import { CenteredContainer, Title } from '../../utils/Layout';
import { getCasesForPSA, currentPendingCharges } from '../../utils/CaseUtils';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetId,
  getIdOrValue
} from '../../utils/DataUtils';
import {
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  PSA_MODAL,
  SEARCH
} from '../../utils/consts/FrontEndStateConsts';
import {
  CONTEXT,
  NOTES,
  PSA
} from '../../utils/consts/Consts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';

import * as CourtActionFactory from '../court/CourtActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as HearingsActions from '../hearings/HearingsActions';
import * as PSAModalActionFactory from './PSAModalActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';


const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = RCM_FIELDS;

const {
  RCM_RESULTS,
  RCM_RISK_FACTORS,
  RCM_BOOKING_CONDITIONS,
  RCM_COURT_CONDITIONS,
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  RELEASE_RECOMMENDATIONS,
  STAFF
} = APP_TYPES;

const { ENTITY_KEY_ID, TYPE } = PROPERTY_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const DownloadButtonContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center !important;
`;

const ModalWrapper = styled.div`
  max-height: 100%;
  padding: ${props => (props.withPadding ? '30px' : '0')};
  hr {
    margin: ${props => (props.withPadding ? '30px -30px' : '15px 0')};
    width: ${props => (props.withPadding ? 'calc(100% + 60px)' : '100%')};
  }
`;

const NoRCMContainer = styled(CenteredContainer)`
  margin: 30px;
  font-size: 18px;
`;

const TitleWrapper = styled.div`
  padding: 35px 15px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const EditPSAButton = styled(StyledButton)`
  margin: ${props => (props.footer ? '-20px 0 30px' : '0')};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${OL.GREY02};
  width: ${props => (props.footer ? '340px' : '142px')};
  height: ${props => (props.footer ? '42px' : '40px')};
  border: none;
  border-radius: 3px;
  background-color: ${OL.GREY08};
`;

const PSAFormHeader = styled.div`
  padding: 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: solid 1px ${OL.GREY11} !important;
`;

type Props = {
  caseHistory :List<*>,
  caseLoadsComplete :boolean,
  chargeHistory :Map<*, *>,
  entityKeyId :string,
  ftaHistory :Map<*, *>,
  hearings :List<*>,
  hearingNeighborsById :Map<*, *>,
  hideProfile? :boolean,
  loadingCases :boolean,
  loadingPersonDetails :boolean,
  loadingPSAModal :boolean,
  loadingCaseHistory :boolean,
  manualCaseHistory :List<*>,
  manualChargeHistory :Map<*, *>,
  onClose :() => {},
  open :boolean,
  personDetailsLoaded :boolean,
  personHearings :Map<*, *>,
  personNeighbors :Map<*, *>,
  psaId :Map<*, *>,
  psaNeighbors :Map<*, *>,
  psaPermissions :boolean,
  scores :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  sentenceHistory :Map<*, *>,
  actions :{
    clearSubmit :() => void,
    deleteEntity :(value :{ entitySetId :string, entityKeyId :string }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    submit :(value :{ config :Object, values :Object, callback? :() => void }) => void,
    submitData :(value :{ config :Object, values :Object }) => void,
    updateScoresAndRiskFactors :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Map<*, *>,
      riskFactorsEntitySetId :string,
      riskFactorsId :string,
      riskFactorsEntity :Map<*, *>,
      rcmEntitySetId :string,
      rcmId :string,
      rcmEntity :Object,
      rcmRiskFactorsEntitySetId :string,
      rcmRiskFactorsId :string,
      rcmRiskFactorsEntity :Object
    }) => void,
    updateOutcomesAndReleaseConditions :(values :{
      allEntitySetIds :string[]
    }) => void,
    changePSAStatus :(values :{
      scoresId :string,
      scoresEntity :Map<*, *>
    }) => void
  }
};

const MODAL_WIDTH = '975px';
const MODAL_HEIGHT = 'max-content';

type State = {
  closingPSAModalOpen :boolean,
  rcm :Object,
  editing :boolean,
  hearingExists :boolean,
  riskFactors :Map<*, *>,
  view :string,
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

  componentWillReceiveProps(nextProps :Props) {
    this.setState({
      riskFactors: this.getRiskFactors(nextProps.psaNeighbors)
    });
  }

  openClosePSAModal = () => this.setState({ closingPSAModalOpen: true });

  exitEdit = () => {
    this.setState({ editing: false });
  }

  onClose = () => {
    const { onClose } = this.props;
    this.exitEdit();
    onClose();
  }

  getNotesFromNeighbors = neighbors => neighbors.getIn([
    RELEASE_RECOMMENDATIONS,
    PSA_NEIGHBOR.DETAILS,
    PROPERTY_TYPES.RELEASE_RECOMMENDATION,
    0
  ], '');

  getRiskFactors = (neighbors :Map<*, *>) => {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
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

    if (includesPretrialModule) {
      newRiskFactors = Object.assign({}, newRiskFactors, {
        [EXTRADITED]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED, 0])}`,
        [STEP_2_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_2_CHARGES, 0])}`,
        [STEP_4_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_4_CHARGES, 0])}`,
        [COURT_OR_BOOKING]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.CONTEXT, 0])}`,
        [SECONDARY_RELEASE_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES, 0])}`,
        [SECONDARY_HOLD_CHARGES]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES, 0])}`,
        [NOTES[EXTRADITED]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED_NOTES, 0], '')}`,
        [NOTES[STEP_2_CHARGES]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_2_CHARGES_NOTES, 0], '')}`,
        [NOTES[STEP_4_CHARGES]]: `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_STEP_4_CHARGES_NOTES, 0], '')}`,
        [NOTES[SECONDARY_RELEASE_CHARGES]]:
          `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_RELEASE_CHARGES_NOTES, 0], '')}`,
        [NOTES[SECONDARY_HOLD_CHARGES]]:
          `${rcmRiskFactors.getIn([PROPERTY_TYPES.RCM_SECONDARY_HOLD_CHARGES_NOTES, 0], '')}`
      });
    }
    return Immutable.fromJS(newRiskFactors);
  }

  getRCM = (neighbors :Map<*, *>) => {
    const { selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    return includesPretrialModule
      ? neighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map())
      : Map();
  };

  downloadRow = (e, isCompact) => {
    e.stopPropagation();
    const { actions, psaNeighbors, scores } = this.props;
    actions.downloadPSAReviewPDF({ neighbors: psaNeighbors, scores, isCompact });
  }

  renderPersonCard = () => {
    const { psaNeighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return <PersonCard person={personDetails} />;
  }

  renderDownloadButton = () => (
    <DownloadButtonContainer>
      <DropdownButton
          title="PDF Report"
          options={[{
            label: 'Export compact version',
            onClick: e => this.downloadRow(e, true)
          }, {
            label: 'Export full version',
            onClick: e => this.downloadRow(e, false)
          }]} />
    </DownloadButtonContainer>
  )

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

  getRCMRiskFactorsEntity = (riskFactors, rcmRiskFactorsId) => {
    const result = {
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

  getNotesEntity = (riskFactors, notesId) => ({
    [PROPERTY_TYPES.GENERAL_ID]: [notesId],
    [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: [riskFactors.get(PSA.NOTES)]
  });

  getEntitySetId = (name) :string => {
    const { psaNeighbors } = this.props;
    return getEntitySetId(psaNeighbors, name);
  };

  getEntityKeyId = (name) :string => {
    const { psaNeighbors } = this.props;
    return getEntityKeyId(psaNeighbors, name);
  };

  getIdOrValue = (name, optionalFQN) :string => {
    const { psaNeighbors } = this.props;
    return getIdOrValue(psaNeighbors, name, optionalFQN);
  };

  getBookingConditionsEdit = (newBookingCondition) => {
    const { psaNeighbors } = this.props;
    const existingBookingCondition = psaNeighbors.getIn([RCM_BOOKING_CONDITIONS, 0], Map());
    const existingBookingConditionType = existingBookingCondition.getIn([PSA_NEIGHBOR.DETAILS, TYPE, 0], '');
    const ekid = getEntityKeyId(existingBookingCondition);
    return (existingBookingConditionType !== newBookingCondition[TYPE]) ? { ekid, newBookingCondition } : null;
  }

  getCourtConditionsEdit = (newCourtConditions) => {
    const { psaNeighbors } = this.props;
    const existingCourtConditions = psaNeighbors.get(RCM_COURT_CONDITIONS, List());
    const existingConditionTypes = existingCourtConditions.map(condition => condition.getIn([TYPE, 0]));
    const newConditionTypes = newCourtConditions.map(condition => condition[TYPE]);

    const entitiesToCreate = newCourtConditions.filter((condition) => {
      const conditionType = condition[TYPE];
      return !existingConditionTypes.includes(conditionType);
    });
    const deleteEKIDs = existingCourtConditions.filter((condition) => {
      const { [TYPE]: conditionType } = getEntityProperties(condition, [TYPE]);
      return !newConditionTypes.includes(conditionType);
    }).map(getEntityKeyId);

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

    let rcmEKID;
    let rcmRiskFactorsIdValue;
    let rcmRiskFactorsEKID;
    let rcmRiskFactorsEntity;
    let bookingConditionsEntity;
    let bookingConditionsEKID;
    let courtConditionsEntities;
    let deleteConditionEKIDS;

    const { riskFactors } = this.state;
    // import module settings
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const scoresAndRiskFactors = getScoresAndRiskFactors(riskFactors);
    const riskFactorsEntity = Object.assign({}, scoresAndRiskFactors.riskFactors);
    const { rcm: rcmEntity, courtConditions, bookingConditions } = includesPretrialModule
      ? calculateRCM(riskFactors, scoresAndRiskFactors.scores, selectedOrganizationSettings) : {};

    const scoreId = scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0]);
    const riskFactorsIdValue = this.getIdOrValue(PSA_RISK_FACTORS);
    if (includesPretrialModule) {
      rcmEKID = this.getEntityKeyId(RCM_RESULTS);

      const { entitiesToCreate, deleteEKIDs } = this.getCourtConditionsEdit(courtConditions);
      const { ekid, newBookingCondition } = this.getBookingConditionsEdit(bookingConditions[0]);
      bookingConditionsEntity = newBookingCondition;
      bookingConditionsEKID = ekid;
      courtConditionsEntities = entitiesToCreate;
      deleteConditionEKIDS = deleteEKIDs;

      rcmRiskFactorsIdValue = this.getIdOrValue(RCM_RISK_FACTORS);
      rcmRiskFactorsEKID = this.getEntityKeyId(RCM_RISK_FACTORS);
      rcmRiskFactorsEntity = this.getRCMRiskFactorsEntity(riskFactors, rcmRiskFactorsIdValue);
    }


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
      psaNeighbors,
      scores,
      manualCaseHistory,
      chargeHistory,
      caseHistory,
      manualChargeHistory,
      psaPermissions,
      actions,
      selectedOrganizationSettings
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

    const psaContext = psaNeighbors.getIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0], '');
    const caseContext = psaContext === CONTEXT.BOOKING ? CONTEXTS.BOOKING : CONTEXTS.COURT;
    // Get Case Context from settings and pass to config
    let chargeType = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, caseContext], '');
    chargeType = chargeType.slice(0, 1).toUpperCase() + chargeType.slice(1);

    const pendingCharges = currentPendingCharges(chargeHistoryForMostRecentPSA);

    return (
      <PSAModalSummary
          chargeType={chargeType}
          caseNumbersToAssociationId={caseNumbersToAssociationId}
          chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
          caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
          addCaseToPSA={this.addCaseToPSA}
          removeCaseFromPSA={this.removeCaseFromPSA}
          downloadFn={actions.downloadPSAReviewPDF}
          scores={scores}
          neighbors={psaNeighbors}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          notes={riskFactors.get(PSA.NOTES)}
          pendingCharges={pendingCharges}
          psaPermissions={psaPermissions} />
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
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
      .get(0, Map());
    const currCharges = manualChargeHistory.get(caseNum, List());
    const allCharges = chargeHistory.toList().flatMap(list => list);
    const allSentences = sentenceHistory.toList().flatMap(list => list);
    return (
      <ModalWrapper>
        {editHeader}
        <PSAInputForm
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
    const { scores, psaNeighbors } = this.props;
    const { riskFactors } = this.state;
    if (!psaNeighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map()).size) {
      return <NoRCMContainer>A RCM was not calculated for this PSA.</NoRCMContainer>;
    }

    return (
      <ModalWrapper>
        <RCMExplanation scores={scores} riskFactors={riskFactors} />
      </ModalWrapper>
    );
  }

  addCaseToPSA = (caseEKID) => {
    const { actions, scores } = this.props;
    const { addCaseToPSA } = actions;
    const psaEKID = getEntityKeyId(scores);
    addCaseToPSA({ psaEKID, caseEKID });
  }

  removeCaseFromPSA = (associationEKID) => {
    const { actions, scores } = this.props;
    const { removeCaseFromPSA } = actions;
    const psaEKID = getEntityKeyId(scores);
    removeCaseFromPSA({ associationEKID, psaEKID });
  }

  renderCaseHistory = () => {
    const {
      caseHistory,
      caseLoadsComplete,
      chargeHistory,
      scores,
      loadingCases,
      loadingCaseHistory,
      loadingPersonDetails,
      personDetailsLoaded,
      psaNeighbors,
      psaPermissions
    } = this.props;
    const arrestDate = psaNeighbors.getIn(
      [MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      ''
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
    const isBetweenLoadingCycles = caseLoadsComplete && personDetailsLoaded && !loadingCaseHistory;

    return (
      <ModalWrapper withPadding>
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
          (loadingCaseHistory || loadingPersonDetails || isBetweenLoadingCycles || loadingCases)
            ? (
              <LogoLoader loadingText="Refreshing Case History" />
            )
            : (
              <CaseHistory
                  modal
                  addCaseToPSA={this.addCaseToPSA}
                  caseNumbersToAssociationId={caseNumbersToAssociationId}
                  removeCaseFromPSA={this.removeCaseFromPSA}
                  caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
                  chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
                  caseHistoryNotForMostRecentPSA={caseHistoryNotForMostRecentPSA}
                  chargeHistoryNotForMostRecentPSA={chargeHistoryNotForMostRecentPSA}
                  chargeHistory={chargeHistory}
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
    }).sort((h1, h2) => (moment(h1.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''))
      .isBefore(h2.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')) ? 1 : -1));

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
      <ModalWrapper withPadding>
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
      psaNeighbors,
      psaPermissions,
      psaId,
      selectedOrganizationSettings
    } = this.props;
    const person = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());

    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');

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
      tabs = tabs.slice(0, 2);
    }

    return (
      <ModalTransition>
        { open && (
          <Modal
              scrollBehavior="outside"
              onClose={() => this.onClose()}
              width={MODAL_WIDTH}
              height={MODAL_HEIGHT}
              max-height={MODAL_HEIGHT}
              shouldCloseOnOverlayClick
              stackIndex={1}>
            { psaPermissions && modalHasLoaded
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
                  <>
                    <ModalHeader
                        person={person}
                        onClose={this.onClose}
                        closePSAFn={() => this.setState({ closingPSAModalOpen: true })} />
                    <CustomTabs panes={tabs} />
                  </>
                )
            }
          </Modal>
        )}
      </ModalTransition>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const psaModal = state.get(STATE.PSA_MODAL);
  const search = state.get(STATE.SEARCH);
  return {
    app,
    [APP_DATA.FQN_TO_ID]: app.get(APP_DATA.FQN_TO_ID),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

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

    [SEARCH.LOADING_PERSON_DETAILS]: search.get(SEARCH.LOADING_PERSON_DETAILS),
    [SEARCH.LOADING_CASES]: search.get(SEARCH.LOADING_CASES),
    [SEARCH.PERSON_DETAILS_LOADED]: search.get(SEARCH.PERSON_DETAILS_LOADED),
    [SEARCH.CASE_LOADS_COMPLETE]: search.get(SEARCH.CASE_LOADS_COMPLETE)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(HearingsActions).forEach((action :string) => {
    actions[action] = HearingsActions[action];
  });

  Object.keys(PSAModalActionFactory).forEach((action :string) => {
    actions[action] = PSAModalActionFactory[action];
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

export default connect(mapStateToProps, mapDispatchToProps)(PSAModal);
