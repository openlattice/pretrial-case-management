/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { DateTime } from 'luxon';
import { Colors } from 'lattice-ui-kit';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { psaIsClosed } from '../../utils/PSAUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDateTime } from '../../utils/FormattingUtils';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';

const { NEUTRAL } = Colors;

const {
  ASSESSED_BY,
  EDITED_BY,
  STAFF,
} = APP_TYPES;

const { DATE_TIME } = PROPERTY_TYPES;

const MetadataWrapper = styled.div`
  width: 100%;
`;
const MetadataSubWrapper = styled.div`
  width: 100%;
`;
const MetadataText = styled.div`
  width: 100%;
  font-size: 13px;
  font-weight: 300;
  text-align: ${(props :Object) => (props.left ? 'left' : 'right')};
  margin: 10px 0 -30px -30px;
  margin: ${(props :Object) => (props.left ? '10px 0' : '10px 0 -30px -30px')};
  color: ${NEUTRAL.N600};
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

  renderMetadataText = (actionText :string, dateText :string, user :string) => {
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
    let creator = '';
    let dateEdited;
    let editor = '';
    const { [DATE_TIME]: psaCreationDate } = getEntityProperties(scores, [DATE_TIME]);
    dateCreated = DateTime.fromISO(psaCreationDate);

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
            : null}
        </MetadataSubWrapper>
      </MetadataWrapper>
    );
  }
}
