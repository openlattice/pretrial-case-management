/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { CloseModalX } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties, getFirstNeighborValue } from '../../utils/DataUtils';

const CardsHolderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const CardWrapper = styled.div`
  box-sizing: border-box;
  display: block;
  margin: 0 10px 10px 0;
`;

const RemoveEntityX = styled(CloseModalX)`
  margin-left: 5px;
  height: 12px;
  width: 12px;

  &:hover svg {
    cursor: pointer;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border-radius: 5px;
  border: 1px solid ${OL.GREY11} !important;
  padding: 5px 10px;
`;

const NoResults = styled.div`
  width: 100%;
  font-size: 16px;
  color: ${OL.GREY01};
`;

type Props = {
  title :string,
  entities :Immutable.List<*>,
  removeEntity :(obj :Object) => void
}

const SimpleCards = ({
  title,
  entities,
  removeEntity
} :Props) => {

  if (!entities.size) return null;

  const entityOptions = entities.sort((entity) => getFirstNeighborValue(entity, PROPERTY_TYPES.DATE_TIME))
    .map((entity) => {
      const {
        [PROPERTY_TYPES.START_DATE]: startDate,
        [PROPERTY_TYPES.ENTITY_KEY_ID]: entityKeyId
      } = getEntityProperties(entity, [PROPERTY_TYPES.START_DATE, PROPERTY_TYPES.ENTITY_KEY_ID]);

      return (
        <CardWrapper key={startDate}>
          <Card>
            { formatDate(startDate) }
            { removeEntity ? <RemoveEntityX onClick={() => removeEntity({ entityKeyId, startDate })} /> : null }
          </Card>
        </CardWrapper>
      );
    });

  return (
    <>
      <h2>{ title }</h2>
      <CardsHolderContainer>
        {
          entityOptions.size
            ? entityOptions
            : <NoResults>No check-in entities found.</NoResults>
        }
      </CardsHolderContainer>
    </>
  );
};

export default SimpleCards;
