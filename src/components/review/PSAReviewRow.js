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
import ChargeList from '../../components/charges/ChargeList';
import PSAScores from './PSAScores';
import DMFCell from '../dmf/DMFCell';
import DMFExplanation from '../dmf/DMFExplanation';
import psaEditedConfig from '../../config/formconfig/PsaEditedConfig';
import { getScoresAndRiskFactors, calculateDMF } from '../../utils/ScoringUtils';
import { CenteredContainer } from '../../utils/Layout';
import { formatValue, formatDateList, toISODateTime } from '../../utils/Utils';
import { PSA, DMF, NOTES, EDIT_FIELDS, ID_FIELDS } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RESULT_CATEGORIES } from '../../utils/consts/DMFResultConsts';
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

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 15px 0;
`;

const InfoItem = styled.div`
  margin: 0 20px;
`;

const InfoHeader = styled.span`
  font-weight: bold;
`;

const ScoresContainer = styled.div`
  display: inline-block;
`;

const CaseHeader = styled.div`
  font-size: 20px;
`;

const SummaryScores = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
`;

const ScoreTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const NoDMFContainer = styled(CenteredContainer)`
  margin: 30px;
  font-size: 18px;
`;

type Props = {
  entityKeyId :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  arrestChargeHistory :Immutable.Map<*, *>,
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
  updateScoresAndRiskFactors? :(
    scoresId :string,
    scoresEntity :Object,
    riskFactorsEntitySetId :string,
    riskFactorsId :string,
    riskFactorsEntity :Object,
    dmfEntitySetId :string,
    dmfId :string,
    dmfEntity :Object,
    dmfRiskFactorsEntitySetId :string,
    dmfRiskFactorsId :string,
    dmfRiskFactorsEntity :Object
  ) => void,
  updateNotes? :(
    notes :string,
    entityId :string,
    entitySetId :string,
    propertyTypes :Immutable.List<*>
  ) => void,
  submitData :(value :{ config :Object, values :Object }) => void
};

type State = {
  open :boolean,
  editing :boolean,
  view :string,
  riskFactors :Immutable.Map<*, *>
};

const VIEWS = {
  SUMMARY: 'SUMMARY',
  PSA: 'PSA',
  DMF: 'DMF',
  HISTORY: 'HISTORY'
};

export default class PSAReviewRow extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      editing: false,
      riskFactors: this.getRiskFactors(props.neighbors),
      view: VIEWS.SUMMARY
    };
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
      [NOTES[DMF.EXTRADITED]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.EXTRADITED_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_2_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES, 0], '')}`,
      [NOTES[DMF.STEP_4_CHARGES]]: `${dmfRiskFactors.getIn([PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES, 0], '')}`
    });
  }

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
    this.props.updateNotes(notes, entityId, entitySetId, propertyTypes);

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

  getDMFRiskFactorsEntity = (riskFactors, dmfRiskFactorsId) => ({
    [PROPERTY_TYPES.GENERAL_ID]: [dmfRiskFactorsId],
    [PROPERTY_TYPES.EXTRADITED]: [riskFactors.get(DMF.EXTRADITED)],
    [PROPERTY_TYPES.DMF_STEP_2_CHARGES]: [riskFactors.get(DMF.STEP_2_CHARGES)],
    [PROPERTY_TYPES.DMF_STEP_4_CHARGES]: [riskFactors.get(DMF.STEP_4_CHARGES)],
    [PROPERTY_TYPES.CONTEXT]: [riskFactors.get(DMF.COURT_OR_BOOKING)],
    [PROPERTY_TYPES.EXTRADITED_NOTES]: [riskFactors.get(NOTES[DMF.EXTRADITED])],
    [PROPERTY_TYPES.DMF_STEP_2_CHARGES_NOTES]: [riskFactors.get(NOTES[DMF.STEP_2_CHARGES])],
    [PROPERTY_TYPES.DMF_STEP_4_CHARGES_NOTES]: [riskFactors.get(NOTES[DMF.STEP_4_CHARGES])]
  });

  onRiskFactorEdit = (e :Object) => {
    e.preventDefault();
    const { scores, riskFactors } = getScoresAndRiskFactors(this.state.riskFactors);
    const dmf = calculateDMF(this.state.riskFactors, scores);

    const scoreId = this.props.scores.getIn([PROPERTY_TYPES.GENERAL_ID, 0]);
    const riskFactorsId = this.props.neighbors.getIn(
      [ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails', PROPERTY_TYPES.GENERAL_ID, 0]
    );

    const dmfId = this.props.neighbors.getIn(
      [ENTITY_SETS.DMF_RESULTS, 'neighborDetails', PROPERTY_TYPES.GENERAL_ID, 0]
    );
    const dmfEKId = this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborId']);
    const dmfEntitySetId = this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborEntitySet', 'id']);
    const dmfEntity = this.getDMFEntity(dmf, dmfId);

    const dmfRiskFactorsId = this.props.neighbors.getIn(
      [ENTITY_SETS.DMF_RISK_FACTORS, 'neighborDetails', PROPERTY_TYPES.GENERAL_ID, 0]
    );
    const dmfRiskFactorsEKId = this.props.neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborId']);
    const dmfRiskFactorsEntitySetId =
      this.props.neighbors.getIn([ENTITY_SETS.DMF_RISK_FACTORS, 'neighborEntitySet', 'id']);
    const dmfRiskFactorsEntity = this.getDMFRiskFactorsEntity(this.state.riskFactors, dmfRiskFactorsId);

    const scoresEntity = {
      [PROPERTY_TYPES.NCA_SCALE]: [scores.ncaScale],
      [PROPERTY_TYPES.FTA_SCALE]: [scores.ftaScale],
      [PROPERTY_TYPES.NVCA_FLAG]: [scores.nvcaFlag]
    };
    if (scoreId) scoresEntity[PROPERTY_TYPES.GENERAL_ID] = [scoreId];
    if (riskFactorsId) riskFactors[PROPERTY_TYPES.GENERAL_ID] = [riskFactorsId];

    const scoresEKId = this.props.entityKeyId;
    const riskFactorsEntitySetId = this.props.neighbors.getIn([
      ENTITY_SETS.PSA_RISK_FACTORS,
      'neighborEntitySet',
      'id'
    ]);
    const riskFactorsEKId = this.props.neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborId']);
    this.props.updateScoresAndRiskFactors(
      scoresEKId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsEKId,
      riskFactors,
      dmfEntitySetId,
      dmfEKId,
      dmfEntity,
      dmfRiskFactorsEntitySetId,
      dmfRiskFactorsEKId,
      dmfRiskFactorsEntity
    );

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

  getName = () => {
    const person = this.props.neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '');
    const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0], '');
    return `${firstName} ${lastName}`;
  }

  onViewSelect = (view :string) => {
    this.setState({ view });
  }

  renderPersonInfo = () => {
    const person = this.props.neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const firstName = formatValue(person.get(PROPERTY_TYPES.FIRST_NAME));
    const middleName = formatValue(person.get(PROPERTY_TYPES.MIDDLE_NAME));
    const lastName = formatValue(person.get(PROPERTY_TYPES.LAST_NAME));
    const dob = formatDateList(person.get(PROPERTY_TYPES.DOB));
    const sex = formatValue(person.get(PROPERTY_TYPES.SEX));
    const race = formatValue(person.get(PROPERTY_TYPES.RACE));

    return (
      <div>
        <InfoRow>
          <InfoItem><InfoHeader>First Name: </InfoHeader>{firstName}</InfoItem>
          <InfoItem><InfoHeader>Middle Name: </InfoHeader>{middleName}</InfoItem>
          <InfoItem><InfoHeader>Last Name: </InfoHeader>{lastName}</InfoItem>
        </InfoRow>
        <InfoRow>
          <InfoItem><InfoHeader>Date of Birth: </InfoHeader>{dob}</InfoItem>
          <InfoItem><InfoHeader>Gender: </InfoHeader>{sex}</InfoItem>
          <InfoItem><InfoHeader>Race: </InfoHeader>{race}</InfoItem>
        </InfoRow>
      </div>
    );
  }

  renderCaseInfo = () => {
    const { caseHistory, arrestChargeHistory, neighbors } = this.props;
    const caseNum = neighbors.getIn(
      [ENTITY_SETS.ARREST_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
      neighbors.getIn(
        [ENTITY_SETS.MANUAL_PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
        ''
      )
    );
    const pretrialCase = caseHistory.filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
    const charges = arrestChargeHistory.get(caseNum, Immutable.List());
    const caseNumText = caseNum.length ? `Case #: ${caseNum}` : 'No case information provided.';
    return (
      <CenteredContainer>
        <CaseHeader>{caseNumText}</CaseHeader>
        <ChargeList pretrialCaseDetails={pretrialCase} charges={charges} />
      </CenteredContainer>
    );
  }

  getDMF = () => {
    const dmfNeighbor = this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map());
    return {
      [RESULT_CATEGORIES.COLOR]: dmfNeighbor.getIn([PROPERTY_TYPES.COLOR, 0]),
      [RESULT_CATEGORIES.RELEASE_TYPE]: dmfNeighbor.getIn([PROPERTY_TYPES.RELEASE_TYPE, 0]),
      [RESULT_CATEGORIES.CONDITIONS_LEVEL]: dmfNeighbor.getIn([PROPERTY_TYPES.CONDITIONS_LEVEL, 0]),
      [RESULT_CATEGORIES.CONDITION_1]: dmfNeighbor.getIn([PROPERTY_TYPES.CONDITION_1, 0]),
      [RESULT_CATEGORIES.CONDITION_2]: dmfNeighbor.getIn([PROPERTY_TYPES.CONDITION_2, 0]),
      [RESULT_CATEGORIES.CONDITION_3]: dmfNeighbor.getIn([PROPERTY_TYPES.CONDITION_3, 0])
    };
  }

  renderSummary = () => {
    const dmf = this.getDMF();
    return (
      <div>
        {this.renderPersonInfo()}
        <hr />
        <SummaryScores>
          <ScoresContainer>
            <ScoreTitle>PSA:</ScoreTitle>
            <PSAScores scores={this.props.scores} />
          </ScoresContainer>
          <ScoresContainer>
            <ScoreTitle>DMF:</ScoreTitle>
            <DMFCell dmf={dmf} selected />
          </ScoresContainer>
        </SummaryScores>
        <hr />
        {this.renderCaseInfo()}
      </div>
    );
  }

  renderPSADetails = () => {
    const {
      caseHistory,
      chargeHistory,
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
    const currCase = caseHistory
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
      .get(0, Immutable.Map());
    const currCharges = chargeHistory.get(caseNum, Immutable.List());
    const allCharges = chargeHistory.toList().flatMap(list => list);
    const allSentences = sentenceHistory.toList().flatMap(list => list);

    return (
      <div>
        <PSAInputForm
            section="review"
            input={riskFactors}
            handleInputChange={this.handleRiskFactorChange}
            handleSubmit={this.onRiskFactorEdit}
            incompleteError={false}
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
    const dmf = this.getDMF();
    const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
    const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
    if (!this.props.neighbors.getIn([ENTITY_SETS.DMF_RESULTS, 'neighborDetails'], Immutable.Map()).size) {
      return <NoDMFContainer>A DMF was not calculated for this PSA.</NoDMFContainer>;
    }

    return <DMFExplanation dmf={dmf} nca={nca} fta={fta} riskFactors={this.state.riskFactors} />;
  }

  renderDetails = () => {
    const { open } = this.state;

    return (
      <Modal show={open} onHide={this.closeModal} dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
        <Modal.Header closeButton>
          <Modal.Title>{`PSA Details: ${this.getName()}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id={`details-${this.props.entityKeyId}`} activeKey={this.state.view} onSelect={this.onViewSelect}>
            <Tab eventKey={VIEWS.SUMMARY} title="Summary">{this.renderSummary()}</Tab>
            <Tab eventKey={VIEWS.PSA} title="PSA">{this.renderPSADetails()}</Tab>
            <Tab eventKey={VIEWS.DMF} title="DMF">{this.renderDMFExplanation()}</Tab>
            <Tab eventKey={VIEWS.HISTORY} title="Case History">
              <CaseHistory caseHistory={this.props.caseHistory} chargeHistory={this.props.chargeHistory} />
            </Tab>
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
