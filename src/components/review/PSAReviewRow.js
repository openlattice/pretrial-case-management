/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import PSAModal from '../../containers/review/PSAModal';
import PersonCard from '../person/PersonCard';
import DropdownButton from '../buttons/DropdownButton';
import PSAScores from './PSAScores';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { psaIsClosed } from '../../utils/PSAUtils';
import { getEntityKeyId } from '../../utils/DataUtils';

const ReviewRowContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

const MetadataItem = styled.div`
  display: block;
`;

const StatusTag = styled.div`
  width: 86px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: white;
  border-radius: 2px;
  align-self: flex-end;
  margin-bottom: -10px;
  padding: 2px 5px;
  background: ${(props) => {
    switch (props.status) {
      case PSA_STATUSES.OPEN:
        return '#8b66db';
      case PSA_STATUSES.SUCCESS:
        return '#00be84';
      case PSA_STATUSES.FAILURE:
        return '#ff3c5d';
      case PSA_STATUSES.CANCELLED:
        return '#b6bbc7';
      case PSA_STATUSES.DECLINED:
        return '#555e6f';
      case PSA_STATUSES.DISMISSED:
        return '#555e6f';
      default:
        return 'transparent';
    }
  }};
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
  hearings :Immutable.List<*>,
  readOnly :boolean,
  personId? :string,
  submitting :boolean,
  refreshingNeighbors :boolean,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
  loadCaseHistoryFn :(values :{
    personId :string,
    neighbors :Immutable.Map<*, *>
  }) => void,
  changePSAStatus? :(values :{
    scoresId :string,
    scoresEntity :Immutable.Map<*, *>
  }) => void
};

type State = {
  open :boolean
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
      open: false
    };
  }

  downloadRow = (e, isCompact) => {
    e.stopPropagation();
    const { downloadFn, neighbors, scores } = this.props;
    downloadFn({ neighbors, scores, isCompact });
  }

  renderPersonCard = () => {
    const { neighbors, hideProfile } = this.props;
    if (hideProfile) return null;

    const personDetails = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails'], Immutable.Map());
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
      <div>
        <MetadataItem>{this.renderMetadataText('Created', dateCreatedText, creator)}</MetadataItem>
        { dateEdited || editor
          ? <MetadataItem>{this.renderMetadataText(editLabel, dateEditedText, editor)}</MetadataItem>
          : null
        }
      </div>
    );
  }

  renderStatus = () => {
    const status = this.props.scores.getIn([PROPERTY_TYPES.STATUS, 0], '');
    return <StatusTag status={status}>{status}</StatusTag>;
  }

  openDetailsModal = () => {
    const { neighbors, loadCaseHistoryFn } = this.props;
    const personId = getEntityKeyId(neighbors, ENTITY_SETS.PEOPLE);
    loadCaseHistoryFn({ personId, neighbors });
    this.setState({ open: true });
  }

  render() {
    if (!this.props.scores) return null;
    return (
      <ReviewRowContainer>
        {this.renderStatus()}
        {this.renderMetadata()}
        <DetailsRowContainer onClick={this.openDetailsModal}>
          <ReviewRowWrapper>
            {this.renderPersonCard()}
            <PSAScores scores={this.props.scores} />
            {this.renderDownloadButton()}
          </ReviewRowWrapper>
        </DetailsRowContainer>
        <PSAModal open={this.state.open} onClose={() => this.setState({ open: false })} {...this.props} />
      </ReviewRowContainer>
    );
  }
}
