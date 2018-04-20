/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import { Modal, Tab, Tabs } from 'react-bootstrap';

import PSAInputForm from '../psainput/PSAInputForm';
import PersonCard from '../person/PersonCard';
import StyledButton from '../buttons/StyledButton';
import InlineEditableControl from '../controls/InlineEditableControl';
import ChargeList from '../../components/charges/ChargeList';
import { getScoresAndRiskFactors } from '../../utils/ScoringUtils';
import { formatValue, formatDateList } from '../../utils/Utils';
import { PSA } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';

const ScoresTable = styled.table`
  margin: 0 50px;
`;

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

const ScoreHeader = styled.th`
  text-align: center;
  height: 15px;
  transform: scaleY(0.7);
  min-width: 50px;
`;

const ScoreItem = styled.td`
  font-weight: bold;
  font-size: 16px;
  text-align: center;
`;

const Scale = styled.div`
  width: 30px;
  display: inline-block;
  border-radius: 3px 3px 0 0;
  margin-bottom: -5px;
`;

const ScaleRow = styled.tr`
  vertical-align: bottom;
  border-bottom: 1px solid black;
  text-align: center;
`;

const DownloadButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center !important;
`;

const DownloadButton = styled(StyledButton)`
  height: 50px;
`;

const CenteredContainer = styled.div`
  text-align: center;
`;

const MetadataText = styled.div`
  width: 100%;
  font-style: italic;
  font-size: 12px;
  margin-bottom: -15px;
  color: #bbb;
`;

const ImportantMetadataText = styled.span`
  color: black;
`;

const NotesContainer = styled.div`
  text-align: left;
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

const CaseHistoryContainer = styled.div`
  max-height: 750px;
  overflow-y: scroll;
  text-align: center;
`;

const colorsByScale = {
  1: '#3494E6',
  2: '#598CDB',
  3: '#7A85D0',
  4: '#A37DC4',
  5: '#CA75B8',
  6: '#EC6EAD'
};

const HEIGHT_MULTIPLIER = 10;

type Props = {
  entityKeyId :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
  loadCaseHistoryFn :(values :{
    personId :string,
    neighbors :Immutable.Map<*, *>
  }) => void,
  updateScoresAndRiskFactors :(
    scoresId :string,
    scoresEntity :Object,
    riskFactorsEntitySetId :string,
    riskFactorsId :string,
    riskFactorsEntity :Object
  ) => void,
  updateNotes :(
    notes :string,
    entityId :string,
    entitySetId :string,
    propertyTypes :Immutable.List<*>
  ) => void,
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
  HISTORY: 'HISTORY'
};

export default class PSAReviewRow extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      editing: false,
      riskFactors: this.getRiskFactors(props.neighbors),
      view: VIEWS.PSA
    };
  }

  getRiskFactors = (neighbors :Immutable.Map<*, *>) => {
    const riskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
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
        `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION, 0])}`
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

  getScaleForScore = (score :number) => styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * score}px;
      background: ${colorsByScale[score]};
    `

  renderScores = () => {
    const { scores } = this.props;
    const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
    const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
    const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);
    const nvcaScaleVal = nvcaVal ? 6 : 1;

    const FtaScale = styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * ftaVal}px;
      background: ${colorsByScale[ftaVal]};
    `;
    const NcaScale = styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * ncaVal}px;
      background: ${colorsByScale[ncaVal]};
    `;
    const NvcaScale = styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * nvcaScaleVal}px;
      background: ${colorsByScale[nvcaScaleVal]};
    `;
    return (
      <ScoresTable>
        <tbody>
          <tr>
            <ScoreHeader>NVCA</ScoreHeader>
            <ScoreHeader>NCA</ScoreHeader>
            <ScoreHeader>FTA</ScoreHeader>
          </tr>
          <ScaleRow>
            <ScoreItem><NvcaScale /></ScoreItem>
            <ScoreItem><NcaScale /></ScoreItem>
            <ScoreItem><FtaScale /></ScoreItem>
          </ScaleRow>
          <tr>
            <ScoreItem>{nvcaVal ? 'YES' : 'NO'}</ScoreItem>
            <ScoreItem>{ncaVal}</ScoreItem>
            <ScoreItem>{ftaVal}</ScoreItem>
          </tr>
        </tbody>
      </ScoresTable>
    );
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

  onRiskFactorEdit = (e :Object) => {
    e.preventDefault();
    const { scores, riskFactors } = getScoresAndRiskFactors(this.state.riskFactors);
    const scoresEntity = {
      [PROPERTY_TYPES.NCA_SCALE]: [scores.ncaScale],
      [PROPERTY_TYPES.FTA_SCALE]: [scores.ftaScale],
      [PROPERTY_TYPES.NVCA_FLAG]: [scores.nvcaFlag]
    };

    const scoresId = this.props.entityKeyId;
    const riskFactorsEntitySetId = this.props.neighbors.getIn([
      ENTITY_SETS.PSA_RISK_FACTORS,
      'neighborEntitySet',
      'id'
    ]);
    const riskFactorsId = this.props.neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborId']);
    this.props.updateScoresAndRiskFactors(
      scoresId,
      scoresEntity,
      riskFactorsEntitySetId,
      riskFactorsId,
      riskFactors
    );
    this.setState({ editing: false });
  }

  getName = () => {
    const person = this.props.neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    const firstName = person.getIn([PROPERTY_TYPES.FIRST_NAME, 0], '');
    const lastName = person.getIn([PROPERTY_TYPES.LAST_NAME, 0], '');
    return `${firstName} ${lastName}`;
  }

  onViewSelect = (view) => {
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
    const { caseHistory, chargeHistory, neighbors } = this.props;
    const caseNum = neighbors.getIn(
      [ENTITY_SETS.PRETRIAL_CASES, 'neighborDetails', PROPERTY_TYPES.CASE_ID, 0],
      ''
    );
    const pretrialCase = caseHistory.filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum);
    const charges = chargeHistory.get(caseNum, Immutable.List());
    const caseNumText = caseNum.length ? `Case #: ${caseNum}` : 'No case information provided.';
    return (
      <CenteredContainer>
        <CaseHeader>{caseNumText}</CaseHeader>
        <ChargeList pretrialCaseDetails={pretrialCase} charges={charges} />
      </CenteredContainer>
    );
  }

  renderSummary = () => {
    return (
      <div>
        {this.renderPersonInfo()}
        <hr />
        <CenteredContainer>
          <ScoresContainer>
            {this.renderScores()}
          </ScoresContainer>
        </CenteredContainer>
        <hr />
        {this.renderCaseInfo()}
      </div>
    );
  }

  renderPSADetails = () => {
    const { editing, riskFactors } = this.state;

    const editButton = editing ? null : (
      <CenteredContainer>
        <StyledButton onClick={() => {
          this.setState({ editing: true });
        }}>
          Edit
        </StyledButton>
      </CenteredContainer>
    );

    return (
      <div>
        <PSAInputForm
            section="review"
            input={riskFactors}
            handleSingleSelection={this.handleRiskFactorChange}
            handleSubmit={this.onRiskFactorEdit}
            incompleteError={false}
            viewOnly={!editing}
            isReview />
        {this.renderNotes()}
        {editButton}
      </div>
    );
  }

  renderCaseHistory = () => {
    const { caseHistory, chargeHistory } = this.props;
    const cases = caseHistory
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '').length)
      .map((caseObj) => {
        const caseNum = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
        const charges = chargeHistory.get(caseNum);
        const fileDate = formatDateList(caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List()));
        return (
          <div key={caseNum}>
            <InfoRow>
              <InfoItem><InfoHeader>Case #: </InfoHeader>{caseNum}</InfoItem>
              <InfoItem><InfoHeader>File Date: </InfoHeader>{fileDate}</InfoItem>
            </InfoRow>
            <ChargeList pretrialCaseDetails={caseObj} charges={charges} detailed />
            <hr />
          </div>
        );
      });
    return (
      <CaseHistoryContainer>
        {cases}
      </CaseHistoryContainer>
    );
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
            <Tab eventKey={VIEWS.HISTORY} title="Case History">{this.renderCaseHistory()}</Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    );
  }

  renderMetadata = () => {
    const staff = this.props.neighbors.get(ENTITY_SETS.STAFF, Immutable.Map());
    const dateCreated = moment(staff.getIn(['associationDetails', PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], ''));
    const dateCreatedText = dateCreated.isValid() ? dateCreated.format('MM/DD/YYYY hh:mm a') : '';
    const creator = staff.getIn(['neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');
    if (!dateCreatedText.length && !creator.length) return null;

    const text = ['Created'];
    if (dateCreatedText.length) {
      text.push(' on ');
      text.push(<ImportantMetadataText key={dateCreatedText}>{dateCreatedText}</ImportantMetadataText>);
    }
    if (creator.length) {
      text.push(' by ');
      text.push(<ImportantMetadataText key={creator}>{creator}</ImportantMetadataText>);
    }
    return <MetadataText>{text}</MetadataText>;
  }

  closeModal = () => {
    this.setState({
      open: false,
      editing: false
    });
  }

  openDetailsModal = () => {
    const { neighbors, loadCaseHistoryFn } = this.props;
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
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
            {this.renderScores()}
            {this.renderDownloadButton()}
          </ReviewRowWrapper>
        </DetailsRowContainer>
        {this.renderDetails()}
      </ReviewRowContainer>
    );
  }
}
