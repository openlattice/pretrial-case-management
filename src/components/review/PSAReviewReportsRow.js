/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';

import PSAModal from '../../containers/psamodal/PSAModal';
import PSAMetaData from './PSAMetaData';
import ClosePSAModal from './ClosePSAModal';
import BasicButton from '../buttons/StyledButton';
import PersonCard from '../person/PersonCardReview';
import PSAReportDownloadButton from './PSAReportDownloadButton';
import PSAStats from './PSAStats';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const { PEOPLE } = APP_TYPES;


const ClosePSAButton = styled(BasicButton)`
  background-color: ${OL.GREY08};
  border: none;
  border-radius: 3px;
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  text-align: center;
  width: 162px;
  z-index: 10;
`;

const DetailsRowContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ReviewRowContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 58px;
  width: 100%;
`;

const ReviewRowWrapper = styled.div`
  align-items: flex-end;
  background-color: ${OL.WHITE};
  border: solid 1px ${OL.GREY11};
  border-radius: 5px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 30px;
  width: 100%;

  &:hover {
    background: ${OL.GREY12};
  }

  hr {
    height: 1px;
    margin: -20px -30px -20px -30px;
    margin-bottom: 13px;
    margin-top: 13px;
  }
`;

const PersonCardWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
`;

const StatsForReview = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
`;

const StatsForProfile = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  width: 100%;
`;

type Props = {
  component :string;
  downloadFn :(values :{ neighbors :Map; scores :Map; }) => void;
  entityKeyId :string;
  entitySetIdsToAppType :Map;
  hideProfile? :boolean;
  includesPretrialModule :boolean;
  loadCaseHistoryFn :(values :{ personEKID :string; neighbors :Map; }) => void;
  loadPSAModal :() => void;
  psaNeighbors :Map;
  scores :Map;
};

type State = {
  open :boolean;
  closing :boolean;
  closePSAButtonActive :boolean;
};

export default class PSAReviewReportsRow extends React.Component<Props, State> {

  static defaultProps = {
    hideProfile: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false,
      closing: false,
      closePSAButtonActive: false
    };
  }

  renderPersonCard = () => {
    const { psaNeighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return (
      <PersonCardWrapper>
        <PersonCard person={personDetails} />
        <hr />
      </PersonCardWrapper>
    );
  }

  renderStats = () => {
    const { hideProfile, scores, includesPretrialModule } = this.props;
    const StatsWrapper = hideProfile ? StatsForProfile : StatsForReview;

    return (
      <StatsWrapper>
        <PSAStats
            scores={scores}
            includesPretrialModule={includesPretrialModule}
            downloadButton={this.renderDownloadButton}
            hideProfile={hideProfile} />
      </StatsWrapper>
    );
  }

  handleStatusChange = () => {
    this.setState({ closing: false });
  }

  renderDownloadButton = () => {
    const {
      component,
      includesPretrialModule,
      downloadFn,
      psaNeighbors,
      scores
    } = this.props;

    const button = component === CONTENT_CONSTS.PENDING_PSAS
      ? (
        <ClosePSAButton
            onClick={() => this.setState({ closePSAButtonActive: true, closing: true })}>
          Close PSA
        </ClosePSAButton>
      )
      : (
        <PSAReportDownloadButton
            includesPretrialModule={includesPretrialModule}
            downloadFn={downloadFn}
            neighbors={psaNeighbors}
            scores={scores} />
      );
    return button;
  }

  renderModal = () => {
    const { closePSAButtonActive, closing, open } = this.state;
    const {
      entityKeyId,
      scores
    } = this.props;

    const modal = closePSAButtonActive === true
      ? (
        <ClosePSAModal
            scores={scores}
            entityKeyId={entityKeyId}
            open={closing}
            defaultStatus={scores.getIn([PROPERTY_TYPES.STATUS, 0])}
            defaultStatusNotes={scores.getIn([PROPERTY_TYPES.STATUS_NOTES, 0])}
            defaultFailureReasons={scores.get(PROPERTY_TYPES.FAILURE_REASON, List()).toJS()}
            onClose={() => this.setState({ closePSAButtonActive: false, closing: false, open: false })}
            onSubmit={this.handleStatusChange} />
      )
      : (
        <PSAModal
            open={open}
            openModal={this.openDetailsModal}
            entityKeyId={entityKeyId}
            onClose={() => this.setState({ open: false })} />
      );
    return modal;
  }

  renderMetadata = () => {
    const {
      entitySetIdsToAppType,
      psaNeighbors,
      scores
    } = this.props;
    return (
      <PSAMetaData
          entitySetIdsToAppType={entitySetIdsToAppType}
          psaNeighbors={psaNeighbors}
          scores={scores} />
    );
  }

  openDetailsModal = () => {
    const {
      entityKeyId,
      loadPSAModal,
      loadCaseHistoryFn,
    } = this.props;
    loadPSAModal({ psaId: entityKeyId, callback: loadCaseHistoryFn });
    this.setState({
      open: true
    });
  }

  render() {
    const { scores } = this.props;
    if (!scores) return null;
    return (
      <ReviewRowContainer>
        <DetailsRowContainer onClick={this.openDetailsModal}>
          <ReviewRowWrapper>
            {this.renderPersonCard()}
            {this.renderStats()}
          </ReviewRowWrapper>
        </DetailsRowContainer>
        {this.renderModal()}
        {this.renderMetadata()}
      </ReviewRowContainer>
    );
  }
}
