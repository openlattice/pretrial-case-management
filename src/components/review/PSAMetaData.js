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
import { formateDTtoDateTimeString } from '../../utils/FormattingUtils';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';

const { NEUTRAL } = Colors;

const {
  ASSESSED_BY,
  EDITED_BY,
  RCM_RISK_FACTORS,
  STAFF,
} = APP_TYPES;

const { DATE_TIME, CONTEXT } = PROPERTY_TYPES;

const MetadataWrapper = styled.div`
  width: 100%;
`;
const MetadataSubWrapper = styled.div`
  width: 100%;
`;
const MetadataText = styled.div`
  color: ${NEUTRAL.N600};
  font-size: 13px;
  font-weight: 300;
  text-align: right;
  width: 100%;
`;

const ImportantMetadataText = styled.span`
  color: ${OL.GREY15};
`;

const MetadataItem = styled.div`
  display: block;
  padding-bottom: 3px;
`;

type Props = {
  entitySetIdsToAppType :Map<*, *>,
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
    const text = [actionText];

    if (dateText && dateText.length) {
      text.push(' on ');
      text.push(<ImportantMetadataText key={`${actionText}-${dateText}`}>{dateText}</ImportantMetadataText>);
    }
    if (user && user.length) {
      text.push(' by ');
      text.push(<ImportantMetadataText key={`${actionText}-${user}`}>{user}</ImportantMetadataText>);
    }
    return <MetadataText>{text}</MetadataText>;
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
    const rcmRiskFactors = psaNeighbors.get(RCM_RISK_FACTORS, Map());
    const { [DATE_TIME]: psaCreationDate } = getEntityProperties(scores, [DATE_TIME]);
    const { [CONTEXT]: caseContext } = getEntityProperties(rcmRiskFactors, [CONTEXT]);
    dateCreated = DateTime.fromISO(psaCreationDate);

    const trimmedCaseContext = caseContext.trim().split(' ')[0];

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
          if (!dateEdited || dateEdited.valueOf() < maybeDate.valueOf()) {
            dateEdited = maybeDate;
            editor = personId;
          }
        }
      }
    });

    const isClosed = psaIsClosed(scores);
    const editLabel = isClosed ? 'Closed' : 'Edited';
    if (!(dateCreated || dateEdited) && !(creator || editor)) return null;

    const dateCreatedText = dateCreated ? formateDTtoDateTimeString(dateCreated) : '';
    const dateEditedText = dateEdited ? formateDTtoDateTimeString(dateEdited) : '';

    return (
      <MetadataWrapper>
        <MetadataSubWrapper>
          <MetadataItem>
            {this.renderMetadataText(`${trimmedCaseContext} PSA Created`, dateCreatedText, creator)}
          </MetadataItem>
          { (dateEdited || editor)
            ? <MetadataItem>{this.renderMetadataText(editLabel, dateEditedText, editor)}</MetadataItem>
            : null}
        </MetadataSubWrapper>
      </MetadataWrapper>
    );
  }
}
