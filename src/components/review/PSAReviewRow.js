/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import { Modal, Tab, Tabs } from 'react-bootstrap';
import { AuthUtils } from 'lattice-auth';

import PSAInputForm from '../psainput/PSAInputForm';
import PersonCard from './PersonCardReview';
import StyledButton from '../buttons/StyledButton';
import CaseHistory from '../../components/review/CaseHistory';
import PSAScores from './PSAScores';
import PSAStats from './PSAStats';
import PSASummary from './PSASummary';
import DMFExplanation from '../dmf/DMFExplanation';
import SelectReleaseConditions from '../releaseconditions/SelectReleaseConditions';
import ClosePSAModal from './ClosePSAModal';
import psaEditedConfig from '../../config/formconfig/PsaEditedConfig';
import { getScoresAndRiskFactors, calculateDMF } from '../../utils/ScoringUtils';
import { CenteredContainer } from '../../utils/Layout';
import { toISODateTime } from '../../utils/Utils';
import { CONTEXT, DMF, EDIT_FIELDS, NOTES, PSA, PSA_STATUSES } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES, formatDMFFromEntity } from '../../utils/consts/DMFResultConsts';
import { psaIsClosed } from '../../utils/PSAUtils';
import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';

const ReviewRowContainer = styled.div`
  width: 960px;
  background-color: #ffffff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 58px;
  &:hover {
    background: #f7f8f9;
  }
`;

const DetailsRowContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
`;

const ReviewRowWrapper = styled.div`
  width: 100%;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 20px 30px;
  justify-content: center;
  overflow: hidden;
  hr {
    margin-top: 13px;
    margin-bottom: 13px;
    transform: translateX(-25%);
    width: 150%;
  }
`;

const PersonCardWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`

const StatsWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
`

const DownloadButtonContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center !important;
`;

const DownloadButton = styled(StyledButton)`
  width: 100%;
  height: 40px;
  border-radius: 3px;
  border: none;
  background-color: #f0f0f7;
  font-size: 14px;
  text-align: center;
  color: #8e929b;
  position: absolute;
  bottom: 0;
`;

const MetadataWrapper = styled.div`
  width: 100%;
`;
const MetadataText = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 300;
  text-align: right;
  margin: 10px 0 -30px -30px;
  color: #8e929b;
`;

const ImportantMetadataText = styled.span`
  color: #2e2e34;
`;

const MetadataItem = styled.div`
  display: block;
`;

const NoDMFContainer = styled(CenteredContainer)`
  margin: 30px;
  font-size: 18px;
`;

const TitleHeader = styled.span`
  margin-right: 15px;
`;

type Props = {
  entityKeyId :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  hideCaseHistory? :boolean,
  hideProfile? :boolean,
  onStatusChangeCallback? :() => void,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  readOnly :boolean,
  personId? :string,
  submitting :boolean,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
  loadCaseHistoryFn :(values :{
    personId :string,
    neighbors :Immutable.Map<*, *>
  }) => void,
  updateScoresAndRiskFactors? :(values :{
    scoresEntitySetId :string,
    scoresId :string,
    scoresEntity :Immutable.Map<*, *>,
    riskFactorsEntitySetId :string,
    riskFactorsId :string,
    riskFactorsEntity :Immutable.Map<*, *>,
    dmfEntitySetId :string,
    dmfId :string,
    dmfEntity :Object,
    dmfRiskFactorsEntitySetId :string,
    dmfRiskFactorsId :string,
    dmfRiskFactorsEntity :Object
  }) => void,
  changePSAStatus? :(values :{
    scoresId :string,
    scoresEntity :Immutable.Map<*, *>
  }) => void,
  submitData :(value :{ config :Object, values :Object }) => void
};

type State = {
  open :boolean,
  editing :boolean,
  closing :boolean,
  view :string,
  riskFactors :Immutable.Map<*, *>,
  dmf :Object
};

const VIEWS = {
  SUMMARY: 'SUMMARY',
  PSA: 'PSA',
  DMF: 'DMF',
  HISTORY: 'HISTORY',
  INITIAL_APPEARANCE: 'INITIAL_APPEARANCE'
};

export default class PSAReviewRow extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false,
    hideProfile: false,
    onStatusChangeCallback: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      editing: false,
      closing: false,
      riskFactors: this.getRiskFactors(props.neighbors),
      view: VIEWS.SUMMARY,
      dmf: this.getDMF(props.neighbors)
    };
  }

  componentWillReceiveProps(nextProps :Props) {
    this.setState({
      dmf: this.getDMF(nextProps.neighbors),
      riskFactors: this.getRiskFactors(nextProps.neighbors)
    });

  }

  getNotesFromNeighbors = (neighbors) =>
    neighbors.getIn([
      ENTITY_SETS.RELEASE_RECOMMENDATIONS,
      'neighborDetails',
      PROPERTY_TYPES.RELEASE_RECOMMENDATION,
      0
    ], '');

  getRiskFactors = (neighbors :Immutable.Map<*, *>) => {
    const riskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
    const dmfRiskFactors = neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
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
      [NOTES[DMF.EXTRADITED]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_2_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_4_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.SECONDARY_RELEASE_CHARGES]]:
        `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES, 0], '')}`
    });
  }

  getDMF = (neighbors :Immutable.Map<*, *>) =>
    formatDMFFromEntity(neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map()))

  downloadRow = (e) => {
    e.stopPropagation();
    const { downloadFn, neighbors, scores } = this.props;
    downloadFn({ neighbors, scores });
  }

  renderPersonCard = () => {
    const { neighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return <PersonCard person={personDetails.set('id', neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']))} />;
  }

  renderDownloadButton = () => (
    <DownloadButtonContainer>
      <DownloadButton onClick={this.downloadRow}>PDF Report</DownloadButton>
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
      result[PROPERTY_TYPES.DMF_SECONDARY_RELEASE_CHARGES_NOTES]
        = [riskFactors.get(NOTES[DMF.SECONDARY_RELEASE_CHARGES])];
    }
    return result;
  };

  getNotesEntity = (riskFactors, notesId) => ({
    [PROPERTY_TYPES.GENERAL_ID]: [notesId],
    [PROPERTY_TYPES.RELEASE_RECOMMENDATION]: [riskFactors.get(PSA.NOTES)]
  });

  getEntitySetId = (name) :string => this.props.neighbors.getIn([name, 'neighborEntitySet', 'id']);

  getEntityKeyId = (name) :string => this.props.neighbors.getIn([name, 'neighborId']);

  getIdValue = (name, optionalFQN) :string => {
    const fqn = optionalFQN || PROPERTY_TYPES.GENERAL_ID;
    return this.props.neighbors.getIn([name, 'neighborDetails', fqn, 0]);
  }

  onRiskFactorEdit = (e :Object) => {
    e.preventDefault();

    const { scores, riskFactors } = getScoresAndRiskFactors(this.state.riskFactors);
    const riskFactorsEntity = Object.assign({}, riskFactors);
    const dmf = calculateDMF(this.state.riskFactors, scores);

    const scoreId = this.props.scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0]);
    const riskFactorsIdValue = this.getIdValue(ENTITY_SETS.PSA_RISK_FACTORS);

    const dmfIdValue = this.getIdValue(ENTITY_SETS.DMF_RESULTS);
    const dmfId = this.getEntityKeyId(ENTITY_SETS.DMF_RESULTS);
    const dmfEntitySetId = this.getEntitySetId(ENTITY_SETS.DMF_RESULTS);
    const dmfEntity = this.getDMFEntity(dmf, dmfIdValue);

    const dmfRiskFactorsIdValue = this.getIdValue(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsId = this.getEntityKeyId(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsEntitySetId = this.getEntitySetId(ENTITY_SETS.DMF_RISK_FACTORS);
    const dmfRiskFactorsEntity = this.getDMFRiskFactorsEntity(this.state.riskFactors, dmfRiskFactorsIdValue);

    const scoresEntity = scores.toJS();
    if (scoreId) scoresEntity[PROPERTY_TYPES.GENERAL_ID] = [scoreId];
    if (riskFactorsIdValue) riskFactorsEntity[PROPERTY_TYPES.GENERAL_ID] = [riskFactorsIdValue];
    const status = this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0]);
    scoresEntity[PROPERTY_TYPES.STATUS] = status ? [status] : [];

    const scoresId = this.props.entityKeyId;
    const scoresEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_SCORES);
    const riskFactorsEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_RISK_FACTORS);
    const riskFactorsId = this.getEntityKeyId(ENTITY_SETS.PSA_RISK_FACTORS);

    let notesIdValue;
    let notesId;
    let notesEntitySetId;
    let notesEntity;

    const notes = this.state.riskFactors.get(PSA.NOTES);
    if (this.getNotesFromNeighbors(this.props.neighbors) !== notes) {
      notesIdValue = this.getIdValue(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesId = this.getEntityKeyId(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesEntitySetId = this.getEntitySetId(ENTITY_SETS.RELEASE_RECOMMENDATIONS);
      notesEntity = this.getNotesEntity(this.state.riskFactors, notesIdValue);
    }

    this.props.updateScoresAndRiskFactors({
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
      this.props.submitData({
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

  handleStatusChange = (status :string, failureReason :string[], statusNotes :?string) => {
    if (!this.props.changePSAStatus) return;
    const statusNotesList = (statusNotes && statusNotes.length) ? Immutable.List.of(statusNotes) : Immutable.List();

    const scoresEntity = this.props.scores
      .set(PROPERTY_TYPES.STATUS, Immutable.List.of(status))
      .set(PROPERTY_TYPES.FAILURE_REASON, Immutable.fromJS(failureReason))
      .set(PROPERTY_TYPES.STATUS_NOTES, statusNotesList)
      .delete('id');

    const scoresId = this.props.entityKeyId;
    this.props.changePSAStatus({
      scoresId,
      scoresEntity,
      callback: this.props.onStatusChangeCallback
    });

    this.props.submitData({
      config: psaEditedConfig,
      values: {
        [EDIT_FIELDS.PSA_ID]: [scoresEntity.getIn([PROPERTY_TYPES.GENERAL_ID, 0])],
        [EDIT_FIELDS.TIMESTAMP]: [toISODateTime(moment())],
        [EDIT_FIELDS.PERSON_ID]: [AuthUtils.getUserInfo().email]
      }
    });
    this.setState({ editing: false });
  }

  getName = () => {
    const person = this.props.neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '');
    const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0], '');
    return `${firstName} ${lastName}`;
  }

  psaClosed = () => {
    const status = this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    return status && status !== PSA_STATUSES.OPEN;
  }

  onViewSelect = (view :string) => {
    this.setState({ view });
  }

  renderSummary = () => (
    <PSASummary
        scores={this.props.scores}
        neighbors={this.props.neighbors}
        manualCaseHistory={this.props.manualCaseHistory}
        manualChargeHistory={this.props.manualChargeHistory} />
  )

  renderPSADetails = () => {
    const {
      caseHistory,
      manualCaseHistory,
      chargeHistory,
      manualChargeHistory,
      sentenceHistory,
      ftaHistory,
      neighbors
    } = this.props;
    const { editing, riskFactors } = this.state;

    const editButton = (editing || this.props.readOnly || this.psaClosed()) ? null : (
      <CenteredContainer>
        <StyledButton onClick={() => {
          this.setState({ editing: true });
        }}>
          Edit
        </StyledButton>
      </CenteredContainer>
    );

    const caseNum = neighbors.getIn(
      [ENTITY_SETS.PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
      neighbors.getIn(
        [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
        ''
      )
    );
    const currCase = manualCaseHistory
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
      .get(0, Immutable.Map());
    const currCharges = manualChargeHistory.get(caseNum, Immutable.List());
    const allCharges = chargeHistory.toList().flatMap(list => list);
    const allSentences = sentenceHistory.toList().flatMap(list => list);

    return (
      <div>
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
            viewOnly={!editing || this.psaClosed()} />
        {editButton}
      </div>
    );
  }

  renderDMFExplanation = () => {
    const { scores } = this.props;
    const { dmf, riskFactors } = this.state;
    const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
    const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
    const nvca = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
    if (!this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map()).size) {
      return <NoDMFContainer>A DMF was not calculated for this PSA.</NoDMFContainer>;
    }

    return <DMFExplanation dmf={dmf} nca={nca} fta={fta} nvca={nvca} riskFactors={riskFactors} />;
  }

  renderInitialAppearance = () => (
    <SelectReleaseConditions
        submitting={this.props.submitting}
        personId={this.getIdValue(ENTITY_SETS.PEOPLE, PROPERTY_TYPES.PERSON_ID)}
        psaId={this.props.scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0])}
        dmfId={this.getIdValue(ENTITY_SETS.DMF_RESULTS)}
        submit={this.props.submitData}
        defaultDMF={this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map())}
        defaultBond={this.props.neighbors.getIn([ENTITY_SETS.BONDS, 'neighborDetails'], Immutable.Map())}
        defaultConditions={this.props.neighbors.get(ENTITY_SETS.RELEASE_CONDITIONS, Immutable.List())
          .map(neighbor => neighbor.get('neighborDetails', Immutable.Map()))} />
  )

  renderDetails = () => {
    const { open } = this.state;

    const changeStatusText = this.psaClosed() ? 'Change PSA Status' : 'Close PSA';

    return (
      <Modal show={open} onHide={this.closeModal} dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
        <Modal.Header closeButton>
          <Modal.Title>
            <div>
              <TitleHeader>{`PSA Details: ${this.getName()}`}</TitleHeader>
              { this.props.readOnly
                ? null
                : <StyledButton onClick={() => this.setState({ closing: true })}>{changeStatusText}</StyledButton>
              }
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClosePSAModal
              open={this.state.closing}
              defaultStatus={this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0])}
              defaultStatusNotes={this.props.scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0])}
              defaultFailureReasons={this.props.scores.get(PROPERTY_TYPES.FAILURE_REASON, Immutable.List()).toJS()}
              onClose={() => this.setState({ closing: false })}
              onSubmit={this.handleStatusChange} />
          <Tabs id={`details-${this.props.entityKeyId}`} activeKey={this.state.view} onSelect={this.onViewSelect}>
            <Tab eventKey={VIEWS.SUMMARY} title="Summary">{this.renderSummary()}</Tab>
            <Tab eventKey={VIEWS.PSA} title="PSA">{this.renderPSADetails()}</Tab>
            <Tab eventKey={VIEWS.DMF} title="DMF">{this.renderDMFExplanation()}</Tab>
            {
              this.props.hideCaseHistory ? null : (
                <Tab eventKey={VIEWS.HISTORY} title="Case History">
                  <CaseHistory caseHistory={this.props.caseHistory} chargeHistory={this.props.chargeHistory} />
                </Tab>
              )
            }
            <Tab eventKey={VIEWS.INITIAL_APPEARANCE} title="Initial Appearance">{this.renderInitialAppearance()}</Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    );
  }

  renderMetadataText = (actionText, dateText, user) => {
    const text = [actionText];
    if (dateText.length) {
      text.push(' on ');
      text.push(<ImportantMetadataText key={`${actionText}-${dateText}`}>{dateText}</ImportantMetadataText>);
    }
    if (user.length) {
      text.push(' by ');
      text.push(<ImportantMetadataText key={`${actionText}-${user}`}>{user}</ImportantMetadataText>);
    }
    return <MetadataText>{text}</MetadataText>;
  }

  renderMetadata = () => {
    const dateFormat = 'MM/DD/YYYY hh:mm a';
    let dateCreated;
    let creator;
    let dateEdited;
    let editor;

    this.props.neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
      const associationEntitySetName = neighbor.getIn(['associationEntitySet', 'name']);
      const personId = neighbor.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');
      if (associationEntitySetName === ENTITY_SETS.ASSESSED_BY) {
        creator = personId;
        const maybeDate = moment(neighbor.getIn(['associationDetails', PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], ''));
        if (maybeDate.isValid()) dateCreated = maybeDate;
      }
      if (associationEntitySetName === ENTITY_SETS.EDITED_BY) {
        const maybeDate = moment(neighbor.getIn(['associationDetails', PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (maybeDate.isValid()) {
          if (!dateEdited || dateEdited.isBefore(maybeDate)) {
            dateEdited = maybeDate;
            editor = personId;
          }
        }
      }
    });

    const editLabel = psaIsClosed(this.props.scores) ? 'Closed' : 'Edited';

    if (!dateCreated && !creator) return null;

    const dateCreatedText = dateCreated ? dateCreated.format(dateFormat) : '';
    const dateEditedText = dateEdited ? dateEdited.format(dateFormat) : '';

    return (
      <MetadataWrapper>
        <MetadataItem>{this.renderMetadataText('Created', dateCreatedText, creator)}</MetadataItem>
        { dateEdited || editor
          ? <MetadataItem>{this.renderMetadataText(editLabel, dateEditedText, editor)}</MetadataItem>
          : null
        }
      </MetadataWrapper>
    );
  }

  renderStatus = () => {
    const status = this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    return <StatusTag status={status}>{status}</StatusTag>;
  }

  closeModal = () => {
    this.setState({
      open: false,
      editing: false
    });
  }

  openDetailsModal = () => {
    const { neighbors, loadCaseHistoryFn } = this.props;
    const personId = this.props.personId || neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    loadCaseHistoryFn({ personId, neighbors });
    this.setState({
      open: true,
      editing: false
    });
  }

  render() {
    if (!this.props.scores) return null;
    return (
      <ReviewRowContainer>
        <DetailsRowContainer onClick={this.openDetailsModal}>
          <ReviewRowWrapper>
            <PersonCardWrapper>
              {this.renderPersonCard()}
            </PersonCardWrapper>
            <hr/>
            <StatsWrapper>
              <PSAStats scores={this.props.scores} downloadButton={this.renderDownloadButton}/>
            </StatsWrapper>
          </ReviewRowWrapper>
          {this.renderDetails()}
        </DetailsRowContainer>
        {this.renderMetadata()}
      </ReviewRowContainer>
    );
  }
}
