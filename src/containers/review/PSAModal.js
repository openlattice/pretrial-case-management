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
import { Modal } from 'react-bootstrap';
import { AuthUtils } from 'lattice-auth';

import CustomTabs from '../../components/tabs/Tabs';
import PSAInputForm from '../../components/psainput/PSAInputForm';
import PersonCard from '../../components/person/PersonCardReview';
import StyledButton from '../../components/buttons/StyledButton';
import DropdownButton from '../../components/buttons/DropdownButton';
import CaseHistory from '../../components/casehistory/CaseHistory';
import CaseHistoryTimeline from '../../components/casehistory/CaseHistoryTimeline';
import DMFExplanation from '../../components/dmf/DMFExplanation';
import SelectHearingsContainer from '../hearings/SelectHearingsContainer';
import PSAModalSummary from '../../components/review/PSAModalSummary';
import ReleaseConditionsSummary from '../../components/releaseconditions/ReleaseConditionsSummary';
import ClosePSAModal from '../../components/review/ClosePSAModal';
import psaEditedConfig from '../../config/formconfig/PsaEditedConfig';
import closeX from '../../assets/svg/close-x-gray.svg';
import { getScoresAndRiskFactors, calculateDMF } from '../../utils/ScoringUtils';
import { getEntityKeyId, getEntitySetId, getIdValue } from '../../utils/DataUtils';
import { CenteredContainer, Title } from '../../utils/Layout';
import { toISODateTime } from '../../utils/FormattingUtils';
import { getCasesForPSA, currentPendingCharges } from '../../utils/CaseUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES } from '../../utils/consts/DMFResultConsts';
import { formatDMFFromEntity } from '../../utils/DMFUtils';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import {
  PSA_NEIGHBOR,
  PSA_ASSOCIATION,
  STATE,
  REVIEW,
  COURT
} from '../../utils/consts/FrontEndStateConsts';
import {
  CONTEXT,
  DMF,
  EDIT_FIELDS,
  NOTES,
  PSA
} from '../../utils/consts/Consts';

import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

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

const NoDMFContainer = styled(CenteredContainer)`
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
const TitleHeader = styled.span`
  margin-right: 15px;
  font-size: 18px;
  font-weight: 600;
  color: ${OL.GREY01};
  span {
    text-transform: uppercase;
  }
`;

const ClosePSAButton = styled(StyledButton)`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${OL.PURPLE02};
  width: 162px;
  height: 40px;
  border: none;
  border-radius: 3px;
  background-color: ${OL.PURPLE06};
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

const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;

  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  caseHistory :List<*>,
  chargeHistory :Map<*, *>,
  entityKeyId :string,
  ftaHistory :Map<*, *>,
  hearings :List<*>,
  hideProfile? :boolean,
  manualCaseHistory :List<*>,
  manualChargeHistory :Map<*, *>,
  neighbors :Map<*, *>,
  onClose :() => {},
  open :boolean,
  personId :string,
  readOnly :boolean,
  refreshingNeighbors :boolean,
  scores :Map<*, *>,
  scoresEntitySetId :string,
  sentenceHistory :Map<*, *>,
  submitting :boolean,
  judgesview :boolean,
  actions :{
    clearSubmit :() => void,
    deleteEntity :(value :{ entitySetId :string, entityKeyId :string }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
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
      dmfEntitySetId :string,
      dmfId :string,
      dmfEntity :Object,
      dmfRiskFactorsEntitySetId :string,
      dmfRiskFactorsId :string,
      dmfRiskFactorsEntity :Object
    }) => void,
    updateOutcomesAndReleaseCondtions :(values :{
      allEntitySetIds :string[]
    }) => void,
    changePSAStatus :(values :{
      scoresId :string,
      scoresEntity :Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void
  }
};

type State = {
  closing :boolean,
  dmf :Object,
  editing :boolean,
  hearingExists :boolean,
  riskFactors :Map<*, *>,
  view :string,
};

class PSAModal extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false,
    hideProfile: false,
    onStatusChangeCallback: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      editing: false,
      closing: false,
      riskFactors: this.getRiskFactors(props.neighbors),
      dmf: this.getDMF(props.neighbors)
    };
  }

  componentWillReceiveProps(nextProps :Props) {
    this.setState({
      dmf: this.getDMF(nextProps.neighbors),
      riskFactors: this.getRiskFactors(nextProps.neighbors)
    });
  }

  getNotesFromNeighbors = neighbors => neighbors.getIn([
    ENTITY_SETS.RELEASE_RECOMMENDATIONS,
    PSA_NEIGHBOR.DETAILS,
    PROPERTY_TYPES.RELEASE_RECOMMENDATION,
    0
  ], '');

  getRiskFactors = (neighbors :Map<*, *>) => {
    const riskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], Map());
    const ageAtCurrentArrestVal = riskFactors.getIn([PROPERTY_TYPES.AGE_AT_CURRENT_ARREST, 0]);
    let ageAtCurrentArrest = 0;
    if (ageAtCurrentArrestVal === '21 or 22') ageAtCurrentArrest = 1;
    else if (ageAtCurrentArrestVal === '23 or Older') ageAtCurrentArrest = 2;
    const priorViolentConvictionVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION, 0]);
    const priorViolentConviction = (priorViolentConvictionVal === '3 or more') ? 3 : priorViolentConvictionVal;
    const priorFTAVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT, 0]);
    const priorFTA = (priorFTAVal === '2 or more') ? 2 : priorFTAVal;

    return Immutable.fromJS({
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

      [DMF.EXTRADITED]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED, 0])}`,
      [DMF.STEP_2_CHARGES]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES, 0])}`,
      [DMF.STEP_4_CHARGES]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES, 0])}`,
      [DMF.COURT_OR_BOOKING]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.CONTEXT, 0])}`,
      [DMF.SECONDARY_RELEASE_CHARGES]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES, 0])}`,
      [DMF.SECONDARY_HOLD_CHARGES]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES, 0])}`,
      [NOTES[DMF.EXTRADITED]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_2_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_4_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.SECONDARY_RELEASE_CHARGES]]:
        `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.SECONDARY_HOLD_CHARGES]]:
        `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES_NOTES, 0], '')}`
    });
  }

  getDMF = (neighbors :Map<*, *>) => (
    formatDMFFromEntity(neighbors.getIn([ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map()))
  );

  downloadRow = (e, isCompact) => {
    e.stopPropagation();
    const { actions, neighbors, scores } = this.props;
    actions.downloadPSAReviewPDF({ neighbors, scores, isCompact });
  }

  renderPersonCard = () => {
    const { neighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
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

  getDMFEntity = (dmf, dmfId) => {
    const result = {
      [PROPERTY_TYPES.GENERAL_ID]: [dmfId],
      [PROPERTY_TYPES.COLOR]: [dmf[RESULT_CATEGORIES.COLOR]],
      [PROPERTY_TYPES.RELEASE_TYPE]: [dmf[RESULT_CATEGORIES.RELEASE_TYPE]]
    };
    if (dmf[RESULT_CATEGORIES.CONDITIONS_LEVEL]) {
      result[PROPERTY_TYPES.CONDITIONS_LEVEL] = [dmf[RESULT_CATEGORIES.CONDITIONS_LEVEL]];
    }
    if (dmf[RESULT_CATEGORIES.CONDITION_1]) {
      result[PROPERTY_TYPES.CONDITION_1] = [dmf[RESULT_CATEGORIES.CONDITION_1]];
    }
    if (dmf[RESULT_CATEGORIES.CONDITION_2]) {
      result[PROPERTY_TYPES.CONDITION_2] = [dmf[RESULT_CATEGORIES.CONDITION_2]];
    }
    if (dmf[RESULT_CATEGORIES.CONDITION_3]) {
      result[PROPERTY_TYPES.CONDITION_3] = [dmf[RESULT_CATEGORIES.CONDITION_3]];
    }
    return result;
  }

  getDMFRiskFactorsEntity = (riskFactors, dmfRiskFactorsId) => {
    const result = {
      [PROPERTY_TYPES.GENERAL_ID]: [dmfRiskFactorsId],
      [PROPERTY_TYPES.EXTRADITED]: [riskFactors.get(DMF.EXTRADITED)],
      [PROPERTY_TYPES.DMF_STEP_2_CHARGES]: [riskFactors.get(DMF.STEP_2_CHARGES)],
      [PROPERTY_TYPES.DMF_STEP_4_CHARGES]: [riskFactors.get(DMF.STEP_4_CHARGES)],
      [PROPERTY_TYPES.CONTEXT]: [riskFactors.get(DMF.COURT_OR_BOOKING)],
      [PROPERTY_TYPES.EXTRADITED_NOTES]: [riskFactors.get(NOTES[DMF.EXTRADITED])],
      [PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES]: [riskFactors.get(NOTES[DMF.STEP_2_CHARGES])],
      [PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES]: [riskFactors.get(NOTES[DMF.STEP_4_CHARGES])]
    };
    if (riskFactors.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING) {
      result[PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES] = [riskFactors.get(DMF.SECONDARY_RELEASE_CHARGES)];
      result[PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES] = [
        riskFactors.get(NOTES[DMF.SECONDARY_RELEASE_CHARGES])
      ];
      result[PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES] = [riskFactors.get(DMF.SECONDARY_HOLD_CHARGES)];
      result[PROPERTY_TYPES.DMF_SECONDARY_HOLD_CHARGES_NOTES] = [riskFactors.get(NOTES[DMF.SECONDARY_HOLD_CHARGES])];
    }
    return result;
  };

  getNotesEntity = (riskFactors, notesId) => ({
    [PROPERTY_TYPES.GENERAL_ID]: [notesId],
    [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: [riskFactors.get(PSA.NOTES)]
  });

  getEntitySetId = (name) :string => {
    const { neighbors } = this.props;
    return getEntitySetId(neighbors, name);
  };

  getEntityKeyId = (name) :string => {
    const { neighbors } = this.props;
    return getEntityKeyId(neighbors, name);
  };

  getIdValue = (name, optionalFQN) :string => {
    const { neighbors } = this.props;
    return getIdValue(neighbors, name, optionalFQN);
  };

  refreshPSANeighborsCallback = () => {
    const { actions, entityKeyId } = this.props;
    actions.refreshPSANeighbors({ id: entityKeyId });
  }

  onRiskFactorEdit = (e :Object) => {
    e.preventDefault();
    const {
      actions,
      entityKeyId,
      neighbors,
      scoresEntitySetId,
      scores
    } = this.props;
    const { riskFactors } = this.state;

    const scoresAndRiskFactors = getScoresAndRiskFactors(riskFactors);
    const riskFactorsEntity = Object.assign({}, scoresAndRiskFactors.riskFactors);
    const dmf = calculateDMF(riskFactors, scoresAndRiskFactors.scores);

    const scoreId = scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0]);
    const riskFactorsIdValue = this.getIdValue(ENTITY_SETS.PSA_RISK_FACTORS);

    const dmfIdValue = this.getIdValue(ENTITY_SETS.DMF_RESULTS);
    const dmfId = this.getEntityKeyId(ENTITY_SETS.DMF_RESULTS);
    const dmfEntitySetId = this.getEntitySetId(ENTITY_SETS.DMF_RESULTS);
    const dmfEntity = this.getDMFEntity(dmf, dmfIdValue);

    const dmfRiskFactorsIdValue = this.getIdValue(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsId = this.getEntityKeyId(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsEntitySetId = this.getEntitySetId(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsEntity = this.getDMFRiskFactorsEntity(riskFactors, dmfRiskFactorsIdValue);

    const newScores = scoresAndRiskFactors.scores;
    const scoresEntity = scores
      .set(PROPERTY_TYPES.FTA_SCALE, newScores.get(PROPERTY_TYPES.FTA_SCALE))
      .set(PROPERTY_TYPES.NCA_SCALE, newScores.get(PROPERTY_TYPES.NCA_SCALE))
      .set(PROPERTY_TYPES.NVCA_FLAG, newScores.get(PROPERTY_TYPES.NVCA_FLAG))
      .toJS();

    if (riskFactorsIdValue) riskFactorsEntity[PROPERTY_TYPES.GENERAL_ID] = [riskFactorsIdValue];

    const scoresId = entityKeyId;
    const riskFactorsEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_RISK_FACTORS);
    const riskFactorsId = this.getEntityKeyId(ENTITY_SETS.PSA_RISK_FACTORS);

    let notesIdValue;
    let notesId;
    let notesEntitySetId;
    let notesEntity;

    const notes = riskFactors.get(PSA.NOTES);
    if (this.getNotesFromNeighbors(neighbors) !== notes) {
      notesIdValue = this.getIdValue(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesId = this.getEntityKeyId(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesEntitySetId = this.getEntitySetId(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesEntity = this.getNotesEntity(riskFactors, notesIdValue);
    }

    actions.updateScoresAndRiskFactors({
      scoresEntitySetId,
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactorsEntity,
      dmfEntitySetId,
      dmfId,
      dmfEntity,
      dmfRiskFactorsEntitySetId,
      dmfRiskFactorsId,
      dmfRiskFactorsEntity,
      notesEntitySetId,
      notesId,
      notesEntity
    });

    if (scoreId) {
      actions.submit({
        config: psaEditedConfig,
        values: {
          [EDIT_FIELDS.PSA_ID]: [scoreId],
          [EDIT_FIELDS.RISK_FACTORS_ID]: [riskFactorsId],
          [EDIT_FIELDS.DMF_ID]: [dmfId],
          [EDIT_FIELDS.DMF_RISK_FACTORS_ID]: [dmfRiskFactorsId],
          [EDIT_FIELDS.NOTES_ID]: [notesId],
          [EDIT_FIELDS.TIMESTAMP]: [toISODateTime(moment())],
          [EDIT_FIELDS.PERSON_ID]: [AuthUtils.getUserInfo().email]
        }
      });
    }

    this.setState({ editing: false });
  }

  handleStatusChange = () => {
    this.setState({ editing: false });
  }

  deleteHearing = () => {
    const { actions, entityKeyId } = this.props;
    actions.deleteEntity({
      entitySetId: this.getEntitySetId(ENTITY_SETS.HEARINGS),
      entityKeyId: this.getEntityKeyId(ENTITY_SETS.HEARINGS)
    });
    actions.refreshPSANeighbors({ id: entityKeyId });
  }

  getName = () => {
    const { neighbors } = this.props;
    const person = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '');
    const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0], '');
    return `${firstName} ${lastName}`;
  }

  renderSummary = () => {
    const {
      neighbors,
      scores,
      manualCaseHistory,
      chargeHistory,
      caseHistory,
      manualChargeHistory,
      actions
    } = this.props;
    const { riskFactors } = this.state;
    const arrestDate = neighbors.getIn(
      [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      ''
    );
    const lastEditDateForPSA = neighbors.getIn(
      [ENTITY_SETS.STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
      ''
    );
    const { chargeHistoryForMostRecentPSA } = getCasesForPSA(
      caseHistory,
      chargeHistory,
      scores,
      arrestDate,
      lastEditDateForPSA
    );

    const pendingCharges = currentPendingCharges(chargeHistoryForMostRecentPSA);
    console.log(pendingCharges);

    return (
      <PSAModalSummary
          downloadFn={actions.downloadPSAReviewPDF}
          scores={scores}
          neighbors={neighbors}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          notes={riskFactors.get(PSA.NOTES)}
          pendingCharges={pendingCharges} />
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
      neighbors,
      scores,
      readOnly
    } = this.props;
    const { editing, riskFactors } = this.state;
    const editHeader = (editing || readOnly || psaIsClosed(scores)) ? null : (
      <CenteredContainer>
        <PSAFormHeader>Public Safety Assessment
          <EditPSAButton onClick={() => {
            this.setState({ editing: true });
          }}>
            Edit PSA
          </EditPSAButton>
        </PSAFormHeader>
      </CenteredContainer>
    );
    const editButton = (editing || readOnly || psaIsClosed(scores)) ? null : (
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

    const caseNum = neighbors.getIn(
      [ENTITY_SETS.PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0],
      neighbors.getIn(
        [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0],
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
            noBorders />
        {editButton}
      </ModalWrapper>
    );
  }

  renderDMFExplanation = () => {
    const { scores, neighbors } = this.props;
    const { dmf, riskFactors } = this.state;
    if (!neighbors.getIn([ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map()).size) {
      return <NoDMFContainer>A DMF was not calculated for this PSA.</NoDMFContainer>;
    }

    return (
      <ModalWrapper>
        <DMFExplanation scores={scores} dmf={dmf} riskFactors={riskFactors} />
      </ModalWrapper>
    );
  }

  renderCaseHistory = () => {
    const {
      caseHistory,
      chargeHistory,
      scores,
      neighbors
    } = this.props;
    const arrestDate = neighbors.getIn(
      [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      ''
    );
    const lastEditDateForPSA = neighbors.getIn(
      [ENTITY_SETS.STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
      ''
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
    return (
      <ModalWrapper withPadding>
        <Title withSubtitle>
          <span>Timeline</span>
          <span>Convictions in past two years</span>
        </Title>
        <CaseHistoryTimeline caseHistory={caseHistory} chargeHistory={chargeHistory} />
        <hr />
        <CaseHistory
            modal
            caseHistoryForMostRecentPSA={caseHistoryForMostRecentPSA}
            chargeHistoryForMostRecentPSA={chargeHistoryForMostRecentPSA}
            caseHistoryNotForMostRecentPSA={caseHistoryNotForMostRecentPSA}
            chargeHistoryNotForMostRecentPSA={chargeHistoryNotForMostRecentPSA}
            chargeHistory={chargeHistory} />
      </ModalWrapper>
    );
  };

  renderReleaseCondtionsSummary = () => {
    const { neighbors, hearingNeighborsById } = this.props;
    const psaHearings = neighbors.get(ENTITY_SETS.HEARINGS, List());
    const hearingsWithOutcomes = psaHearings.filter((hearing) => {
      const entityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
      return !!hearingNeighborsById.getIn([entityKeyId, ENTITY_SETS.OUTCOMES]);
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
      neighbors,
      submitting,
      refreshingNeighbors,
      scores,
      entityKeyId,
      hearings,
      readOnly
    } = this.props;
    return (
      <ModalWrapper withPadding>
        <SelectHearingsContainer
            submitting={submitting}
            refreshingNeighbors={refreshingNeighbors}
            psaId={scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0])}
            dmfId={this.getIdValue(ENTITY_SETS.DMF_RESULTS)}
            psaEntityKeyId={entityKeyId}
            deleteHearing={this.deleteHearing}
            refreshPSANeighborsCallback={this.refreshPSANeighborsCallback}
            hearingId={this.getEntityKeyId(ENTITY_SETS.HEARINGS)}
            hearings={hearings}
            readOnly={readOnly}
            neighbors={neighbors}
            defaultOutcome={neighbors.getIn([ENTITY_SETS.OUTCOMES, PSA_NEIGHBOR.DETAILS], Map())}
            defaultDMF={neighbors.getIn([ENTITY_SETS.DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map())}
            defaultBond={neighbors.getIn([ENTITY_SETS.BONDS, PSA_NEIGHBOR.DETAILS], Map())}
            defaultConditions={neighbors.get(ENTITY_SETS.RELEASE_CONDITIONS, List())
              .map(neighbor => neighbor.get(PSA_NEIGHBOR.DETAILS, Map()))}
            {...this.props} />
      </ModalWrapper>
    );
  }

  render() {
    const {
      scores,
      open,
      onClose,
      entityKeyId,
      readOnly,
      caseHistory,
      chargeHistory,
      neighbors
    } = this.props;

    const { closing } = this.state;

    if (!scores) return null;
    const changeStatusText = psaIsClosed(scores) ? 'Change PSA Status' : 'Close PSA';

    const tabs = [
      {
        title: 'Summary',
        content: this.renderSummary
      },
      {
        title: 'PSA',
        content: this.renderPSADetails
      },
      {
        title: 'DMF',
        content: this.renderDMFExplanation
      },
      {
        title: 'Case History',
        content: this.renderCaseHistory
      },
      {
        title: 'Release Conditions',
        content: this.renderReleaseCondtionsSummary
      }
    ];

    const hearingTab = {
      title: 'Hearings',
      content: this.renderHearings
    };

    if (!psaIsClosed(scores)) {
      tabs.splice(4, 0, hearingTab);
    }

    return (
      <Modal
          show={open}
          onHide={onClose}
          dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
        <Modal.Body>
          <ClosePSAModal
              open={closing}
              defaultStatus={scores.getIn([PROPERTY_TYPES.STATUS, 0])}
              defaultStatusNotes={scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0])}
              defaultFailureReasons={scores.get(PROPERTY_TYPES.FAILURE_REASON, List()).toJS()}
              onClose={() => this.setState({ closing: false })}
              onSubmit={this.handleStatusChange}
              scores={scores}
              entityKeyId={entityKeyId} />
          <TitleWrapper>
            <TitleHeader>PSA Details: <span>{`${this.getName()}`}</span></TitleHeader>
            <div>
              { readOnly
                ? null
                : <ClosePSAButton onClick={() => this.setState({ closing: true })}>{changeStatusText}</ClosePSAButton>
              }
              <CloseModalX onClick={onClose} />
            </div>
          </TitleWrapper>
          <CustomTabs panes={tabs} />
        </Modal.Body>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const court = state.get(STATE.COURT);
  const review = state.get(STATE.REVIEW);
  return {
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [REVIEW.READ_ONLY]: review.get(REVIEW.READ_ONLY)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
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
