/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import PSAModal from '../../containers/psamodal/PSAModal';
import PSAMetaData from './PSAMetaData';
import ClosePSAModal from './ClosePSAModal';
import PersonCard from '../person/PersonCardReview';
import PSAReportDownloadButton from './PSAReportDownloadButton';
import PSAStats from './PSAStats';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const { PEOPLE } = APP_TYPES;

const ReviewRowContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 58px;
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
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};

  &:hover {
    background: ${OL.GREY12};
  }

  hr {
    border: solid 1px ${OL.GREY28};
    height: 0;
    margin: -20px -30px -20px -30px;
    margin-top: 13px;
    margin-bottom: 13px;
    width: 100%;
  }
`;

const PersonCardWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const StatsForReview = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
`;

const StatsForProfile = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
`;

type Props = {
  entityKeyId :string,
  entitySetIdsToAppType :Map<*, *>,
  scores :Map<*, *>,
  psaNeighbors :Map<*, *>,
  hideProfile? :boolean,
  includesPretrialModule :boolean,
  component :string,
  downloadFn :(values :{
    neighbors :Map<*, *>,
    scores :Map<*, *>
  }) => void,
  loadCaseHistoryFn :(values :{
    personEKID :UUID,
    neighbors :Map
  }) => void,
  loadPSAModal :() => void
};

type State = {
  open :boolean,
  closing :boolean,
  closePSAButtonActive :boolean
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
    const { psaNeighbors, hideProfile, includesPretrialModule } = this.props;
    if (hideProfile) return null;

    const personDetails = psaNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    if (!personDetails.size) return <div>Person details unknown.</div>;
    return (
      <PersonCardWrapper>
        <PersonCard person={personDetails} includesPretrialModule={includesPretrialModule} />
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
        <Button
            color="secondary"
            onClick={() => this.setState({ closePSAButtonActive: true, closing: true })}>
          Close PSA
        </Button>
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
