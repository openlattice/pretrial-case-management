/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { DateTime } from 'luxon';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { formatDateTime } from '../../utils/FormattingUtils';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';

const {
  ASSESSED_BY,
  EDITED_BY,
  STAFF,
} = APP_TYPES;

const MetadataWrapper = styled.div`
  width: 100%;
`;
const MetadataSubWrapper = styled.div`
  width: 100%;
`;
const MetadataText = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 300;
  text-align: ${props => (props.left ? 'left' : 'right')};
  margin: 10px 0 -30px -30px;
  margin: ${props => (props.left ? '10px 0' : '10px 0 -30px -30px')};
  color: ${OL.GREY02};
`;

const ImportantMetadataText = styled.span`
  color: ${OL.GREY15};
`;

const MetadataItem = styled.div`
  height: 10px;
  display: block;
`;

type Props = {
  entitySetIdsToAppType :Map<*, *>,
  left :boolean,
  psaNeighbors :Map<*, *>,
  scores :Map<*, *>,
};

type State = {
  open :boolean,
  closing :boolean,
  closePSAButtonActive :boolean
};

export default class PSAMetaData extends React.Component<Props, State> {

  renderMetadataText = (actionText, dateText, user) => {
    const { left } = this.props;
    const text = [actionText];

    if (dateText && dateText.length) {
      text.push(' on ');
      text.push(<ImportantMetadataText key={`${actionText}-${dateText}`}>{dateText}</ImportantMetadataText>);
    }
    if (user && user.length) {
      text.push(' by ');
      text.push(<ImportantMetadataText key={`${actionText}-${user}`}>{user}</ImportantMetadataText>);
    }
    return <MetadataText left={left}>{text}</MetadataText>;
  }

  render() {
    const {
      entitySetIdsToAppType,
      psaNeighbors,
      scores
    } = this.props;
    let dateCreated;
    let creator;
    let dateEdited;
    let editor;
    dateCreated = DateTime.fromISO(scores.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));

    psaNeighbors.get(STAFF, List()).forEach((neighbor) => {
      const associationEntitySetId = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
      const appTypFqn = entitySetIdsToAppType.get(associationEntitySetId, '');
      const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
      if (appTypFqn === ASSESSED_BY) {
        creator = personId;
        const maybeDate = DateTime.fromISO(
          neighbor.getIn(
            [PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
            neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], dateCreated.toISO())
          )
        );
        if (maybeDate.isValid) dateCreated = maybeDate;
      }
      if (appTypFqn === EDITED_BY) {
        const maybeDate = DateTime.fromISO(neighbor.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], ''));
        if (maybeDate.isValid) {
          if (!dateEdited || dateEdited < maybeDate) {
            dateEdited = maybeDate;
            editor = personId;
          }
        }
      }
    });

    const isClosed = psaIsClosed(scores);
    const editLabel = isClosed ? 'Closed' : 'Edited';
    if (!(dateCreated || dateEdited) && !(creator || editor)) return null;

    const dateCreatedText = dateCreated ? formatDateTime(dateCreated) : '';
    const dateEditedText = dateEdited ? formatDateTime(dateEdited) : '';

    return (
      <MetadataWrapper>
        <MetadataSubWrapper>
          <MetadataItem>{this.renderMetadataText('Created', dateCreatedText, creator)}</MetadataItem>
          { (dateEdited || editor)
            ? <MetadataItem>{this.renderMetadataText(editLabel, dateEditedText, editor)}</MetadataItem>
            : null
          }
        </MetadataSubWrapper>
      </MetadataWrapper>
    );
  }
}
