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
import PersonCard from '../person/PersonCard';
import StyledButton from '../buttons/StyledButton';
import InlineEditableControl from '../controls/InlineEditableControl';
import CaseHistory from '../../components/review/CaseHistory';
import PSAScores from './PSAScores';
import PSASummary from './PSASummary';
import DMFExplanation from '../dmf/DMFExplanation';
import ClosePSAModal from './ClosePSAModal';
import psaEditedConfig from '../../config/formconfig/PsaEditedConfig';
import { getScoresAndRiskFactors, calculateDMF } from '../../utils/ScoringUtils';
import { CenteredContainer } from '../../utils/Layout';
import { toISODateTime } from '../../utils/Utils';
import { CONTEXT, DMF, EDIT_FIELDS, ID_FIELDS, NOTES, PSA, PSA_STATUSES } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES, formatDMFFromEntity } from '../../utils/consts/DMFResultConsts';
import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';

const ReviewRowContainer = styled.div`
  width: 100%;
  text-align: center;
  &:hover {
    background: #f7f8f9;
  }
  padding: 20px;
`;

const DetailsRowContainer = styled.div`
  display: flex;
  justify-content: center;
  cursor: pointer;
`;

const ReviewRowWrapper = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: flex-end;
  margin: 20px 0;
  justify-content: center;
`;

const DownloadButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center !important;
`;

const DownloadButton = styled(StyledButton)`
  height: 50px;
`;

const MetadataText = styled.div`
  width: 100%;
  font-style: italic;
  font-size: 12px;
  margin: 20px 0 -15px 0;
  color: #bbb;
`;

const ImportantMetadataText = styled.span`
  color: black;
`;

const NotesContainer = styled.div`
  text-align: left;
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
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  readOnly :boolean,
  personId? :string,
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
    scoresEntitySetId :string,
    scoresId :string,
    scoresEntity :Immutable.Map<*, *>
  }) => void,
  updateNotes :(value :{
    notes :string,
    entityId :string,
    entitySetId :string,
    propertyTypes :Immutable.List<*>
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
  HISTORY: 'HISTORY'
};

export default class PSAReviewRow extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false
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
    const { neighbors } = this.props;
    const personDetails = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return <PersonCard person={personDetails.set('id', neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']))} />;
  }

  renderDownloadButton = () => (
    <DownloadButtonContainer>
      <DownloadButton onClick={this.downloadRow}>Download PDF Report</DownloadButton>
    </DownloadButtonContainer>
  )

  handleNotesUpdate = (notes :string) => {
    const neighbor = this.props.neighbors.get(ENTITY_SETS.RELEASE_RECOMMENDATIONS, Immutable.Map());
    const entityId = neighbor.getIn(['neighborDetails', PROPERTY_TYPES.GENERAL_ID, 0]);
    const entitySetId = neighbor.getIn(['neighborEntitySet', 'id']);
    const propertyTypes = neighbor.get('neighborPropertyTypes');
    this.props.updateNotes({
      notes,
      entityId,
      entitySetId,
      propertyTypes
    });

    this.props.submitData({
      config: psaEditedConfig,
      values: {
        [EDIT_FIELDS.PSA_ID]: [this.props.scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0])],
        [EDIT_FIELDS.NOTES_ID]: [entityId],
        [EDIT_FIELDS.TIMESTAMP]: [toISODateTime(moment())],
        [EDIT_FIELDS.PERSON_ID]: [AuthUtils.getUserInfo().email]
      }
    });
  }

  renderNotes = () => {
    const notes = this.props.neighbors.getIn(
      [ENTITY_SETS.RELEASE_RECOMMENDATIONS, 'neighborDetails', PROPERTY_TYPES.RELEASE_RECOMMENDATION, 0],
      ''
    );
    return (
      <NotesContainer>
        <div>Notes:</div>
        <InlineEditableControl
            type="textarea"
            value={notes}
            onChange={this.handleNotesUpdate}
            viewOnly={!this.state.editing}
            size="medium_small" />
      </NotesContainer>
    );
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

  getEntitySetId = (name) :string => this.props.neighbors.getIn([name, 'neighborEntitySet', 'id']);

  getEntityKeyId = (name) :string => this.props.neighbors.getIn([name, 'neighborId']);

  getIdValue = (name) :string =>
    this.props.neighbors.getIn([name, 'neighborDetails', PROPERTY_TYPES.GENERAL_ID, 0]);

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

    const scoresId = this.props.entityKeyId;
    const scoresEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_SCORES);
    const riskFactorsEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_RISK_FACTORS);
    const riskFactorsId = this.getEntityKeyId(ENTITY_SETS.PSA_RISK_FACTORS);

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
      dmfRiskFactorsEntity
    });

    if (scoreId) {
      this.props.submitData({
        config: psaEditedConfig,
        values: {
          [EDIT_FIELDS.PSA_ID]: [scoreId],
          [EDIT_FIELDS.RISK_FACTORS_ID]: [riskFactorsId],
          [EDIT_FIELDS.DMF_ID]: [dmfId],
          [EDIT_FIELDS.DMF_RISK_FACTORS_ID]: [dmfRiskFactorsId],
          [EDIT_FIELDS.TIMESTAMP]: [toISODateTime(moment())],
          [EDIT_FIELDS.PERSON_ID]: [AuthUtils.getUserInfo().email]
        }
      });
    }

    this.setState({ editing: false });
  }

  handleStatusChange = (status :string, failureReason :string[]) => {
    if (!this.props.changePSAStatus) return;

    let scoresEntity = this.props.scores.set(PROPERTY_TYPES.STATUS, Immutable.List.of(status));
    if (failureReason.length) {
      scoresEntity = scoresEntity.set(PROPERTY_TYPES.FAILURE_REASON, Immutable.fromJS(failureReason));
    }
    const scoresId = this.props.entityKeyId;
    const scoresEntitySetId = this.getEntitySetId(ENTITY_SETS.PSA_SCORES);
    this.props.changePSAStatus({
      scoresEntitySetId,
      scoresId,
      scoresEntity
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

    const editButton = (editing || this.props.readOnly) ? null : (
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
            viewOnly={!editing} />
        {this.renderNotes()}
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

  renderDetails = () => {
    const { open } = this.state;
    const status = this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    const psaIsPending = !status || status === PSA_STATUSES.OPEN;

    return (
      <Modal show={open} onHide={this.closeModal} dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
        <Modal.Header closeButton>
          <Modal.Title>
            <div>
              <TitleHeader>{`PSA Details: ${this.getName()}`}</TitleHeader>
              { this.props.readOnly || !psaIsPending
                ? null
                : <StyledButton onClick={() => this.setState({ closing: true })}>Close PSA</StyledButton>
              }
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClosePSAModal
              open={this.state.closing}
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

    if (!dateCreated && !creator) return null;

    const dateCreatedText = dateCreated ? dateCreated.format(dateFormat) : '';
    const dateEditedText = dateEdited ? dateEdited.format(dateFormat) : '';

    return (
      <div>
        <MetadataItem>{this.renderMetadataText('Created', dateCreatedText, creator)}</MetadataItem>
        { dateEdited || editor
          ? <MetadataItem>{this.renderMetadataText('Edited', dateEditedText, editor)}</MetadataItem>
          : null
        }
      </div>
    );
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
        {this.renderMetadata()}
        <DetailsRowContainer onClick={this.openDetailsModal}>
          <ReviewRowWrapper>
            {this.renderPersonCard()}
            <PSAScores scores={this.props.scores} />
            {this.renderDownloadButton()}
          </ReviewRowWrapper>
        </DetailsRowContainer>
        {this.renderDetails()}
      </ReviewRowContainer>
    );
  }
}
