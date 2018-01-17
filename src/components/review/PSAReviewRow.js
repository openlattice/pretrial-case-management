import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import styled from 'styled-components';

import PersonCard from '../person/PersonCard';
import StyledButton from '../buttons/StyledButton';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/DataModelConsts';

const ScoresTable = styled.table`
  margin: 0 50px;
`;

const ReviewRowContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  &:hover {
    background: #f7f8f9;
  }
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

const colorsByScale = {
  1: '#3494E6',
  2: '#598CDB',
  3: '#7A85D0',
  4: '#A37DC4',
  5: '#CA75B8',
  6: '#EC6EAD'
}

const HEIGHT_MULTIPLIER = 10;

export default class PSAReviewRow extends React.Component {

  static propTypes = {
    entityKeyId: PropTypes.string.isRequired,
    scores: PropTypes.instanceOf(Immutable.Map),
    neighbors: PropTypes.instanceOf(Immutable.Map),
    downloadFn: PropTypes.func.isRequired
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

  getScaleForScore = (score) => {
    return styled(Scale)`
      height: ${HEIGHT_MULTIPLIER * score}px;
      background: ${colorsByScale[score]};
    `;
  }

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
    )
  }

  renderDownloadButton = () => {
    return (
      <DownloadButtonContainer>
        <DownloadButton onClick={this.downloadRow}>Download PDF Report</DownloadButton>
      </DownloadButtonContainer>
    );
  }

  render() {
    return (
      <ReviewRowContainer>
        <ReviewRowWrapper>
          {this.renderPersonCard()}
          {this.renderScores()}
          {this.renderDownloadButton()}
        </ReviewRowWrapper>
      </ReviewRowContainer>
    );
  }
}
