import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import { Collapse } from 'react-bootstrap';

import PSAInputForm from '../psainput/PSAInputForm';
import PersonCard from '../person/PersonCard';
import StyledButton from '../buttons/StyledButton';
import { getScoresAndRiskFactors } from '../../utils/ScoringUtils';
import { PSA } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const ScoresTable = styled.table`
  margin: 0 50px;
`;

const ReviewRowContainer = styled.div`
  width: 100%;
  text-align: center;
  &:hover {
    background: #f7f8f9;
  }
`;

const DetailsRowContainer = styled.div`
  display: flex;
  justify-content: center;
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

const EditButton = styled.button`
  display: inline-block;
  background: none;
  text-align: center;
  border: none;
`;

const EditButtonText = styled.div`
  font-size: 16px;
`;

const EditButtonSymbol = styled(FontAwesome).attrs({
  size: '2x'
})`
  margin-top: -15px;
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

export default class PSAReviewRow extends React.Component {

  static propTypes = {
    entityKeyId: PropTypes.string.isRequired,
    scores: PropTypes.instanceOf(Immutable.Map),
    neighbors: PropTypes.instanceOf(Immutable.Map),
    downloadFn: PropTypes.func.isRequired,
    updateScoresAndRiskFactors: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      riskFactors: this.getRiskFactors(props.neighbors)
    };
  }

  getRiskFactors = (neighbors) => {
    const riskFactors = neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborDetails'], Immutable.Map());
    const ageAtCurrentArrestVal = riskFactors.getIn([PROPERTY_TYPES.AGE_AT_CURRENT_ARREST_FQN, 0]);
    let ageAtCurrentArrest = 0;
    if (ageAtCurrentArrestVal === '21 or 22') ageAtCurrentArrest = 1;
    else if (ageAtCurrentArrestVal === '23 or Older') ageAtCurrentArrest = 2;
    const priorViolentConvictionVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION_FQN, 0]);
    const priorViolentConviction = (priorViolentConvictionVal === '3 or more') ? 3 : priorViolentConvictionVal;
    const priorFTAVal = riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT_FQN, 0]);
    const priorFTA = (priorFTAVal === '2 or more') ? 2 : priorFTAVal;

    return {
      [PSA.AGE_AT_CURRENT_ARREST]: `${ageAtCurrentArrest}`,
      [PSA.CURRENT_VIOLENT_OFFENSE]: `${riskFactors.getIn([PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_FQN, 0])}`,
      [PSA.PENDING_CHARGE]: `${riskFactors.getIn([PROPERTY_TYPES.PENDING_CHARGE_FQN, 0])}`,
      [PSA.PRIOR_MISDEMEANOR]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_MISDEMEANOR_FQN, 0])}`,
      [PSA.PRIOR_FELONY]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_FELONY_FQN, 0])}`,
      [PSA.PRIOR_VIOLENT_CONVICTION]: `${priorViolentConviction}`,
      [PSA.PRIOR_FAILURE_TO_APPEAR_RECENT]: `${priorFTA}`,
      [PSA.PRIOR_FAILURE_TO_APPEAR_OLD]: `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD_FQN, 0])}`,
      [PSA.PRIOR_SENTENCE_TO_INCARCERATION]:
        `${riskFactors.getIn([PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION_FQN, 0])}`
    };
  }

  downloadRow = () => {
    const { downloadFn, neighbors, scores } = this.props;
    downloadFn(neighbors, scores);
  }

  renderPersonCard = () => {
    const { neighbors } = this.props;
    const personDetails = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return <PersonCard person={personDetails.set('id', neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId']))} />;
  }

  getScaleForScore = score => styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * score}px;
      background: ${colorsByScale[score]};
    `

  renderScores = () => {
    const scores = this.props.scores;
    const ftaVal = scores.getIn([PROPERTY_TYPES.FTA_SCALE_FQN, 0]);
    const ncaVal = scores.getIn([PROPERTY_TYPES.NCA_SCALE_FQN, 0]);
    const nvcaVal = scores.getIn([PROPERTY_TYPES.NVCA_FLAG_FQN, 0]);
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
            <ScoreHeader>FTA</ScoreHeader>
            <ScoreHeader>NCA</ScoreHeader>
            <ScoreHeader>NVCA</ScoreHeader>
          </tr>
          <ScaleRow>
            <ScoreItem><FtaScale /></ScoreItem>
            <ScoreItem><NcaScale /></ScoreItem>
            <ScoreItem><NvcaScale /></ScoreItem>
          </ScaleRow>
          <tr>
            <ScoreItem>{ftaVal}</ScoreItem>
            <ScoreItem>{ncaVal}</ScoreItem>
            <ScoreItem>{nvcaVal ? 'YES' : 'NO'}</ScoreItem>
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

  handleRiskFactorChange = (e) => {
    const { riskFactors } = this.state;
    riskFactors[e.target.name] = e.target.value;
    this.setState({ riskFactors });
  }

  onRiskFactorEdit = (e) => {
    e.preventDefault();
    const { scores, riskFactors } = getScoresAndRiskFactors(this.state.riskFactors);
    const scoresEntity = {
      [PROPERTY_TYPES.NCA_SCALE_FQN]: [scores.ncaScale],
      [PROPERTY_TYPES.FTA_SCALE_FQN]: [scores.ftaScale],
      [PROPERTY_TYPES.NVCA_FLAG_FQN]: [scores.nvcaFlag]
    };

    const scoresId = this.props.entityKeyId;
    const riskFactorsEntitySetId = this.props.neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborEntitySet', 'id']);
    const riskFactorsId = this.props.neighbors.getIn([ENTITY_SETS.PSA_RISK_FACTORS, 'neighborId']);
    this.props.updateScoresAndRiskFactors(scoresId, scoresEntity, riskFactorsEntitySetId, riskFactorsId, riskFactors);
    this.setState({ open: false });
  }

  renderEdit = () => {
    const { open, riskFactors } = this.state;
    const Symbol = styled(EditButtonSymbol).attrs({
      name: open ? 'angle-up' : 'angle-down'
    })``;
    const buttonContents = open ? (
      <div>
        <Symbol />
        <br />
        <EditButtonText>Close</EditButtonText>
      </div>
    ) : (
      <div>
        <EditButtonText>Edit</EditButtonText>
        <br />
        <Symbol />
      </div>
    );
    return (
      <div>
        <Collapse in={open}>
          <div>
            <PSAInputForm
                section="review"
                input={riskFactors}
                handleSingleSelection={this.handleRiskFactorChange}
                handleSubmit={this.onRiskFactorEdit}
                incompleteError={false} />
          </div>
        </Collapse>
        <EditButton onClick={() => {
          this.setState({ open: !open });
        }}>
          {buttonContents}
        </EditButton>
      </div>
    );
  }

  render() {
    return (
      <ReviewRowContainer>
        <DetailsRowContainer>
          <ReviewRowWrapper>
            {this.renderPersonCard()}
            {this.renderScores()}
            {this.renderDownloadButton()}
          </ReviewRowWrapper>
        </DetailsRowContainer>
        {this.renderEdit()}
      </ReviewRowContainer>
    );
  }
}
