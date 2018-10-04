/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Constants } from 'lattice';

import { formatDateTime } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const CardsHolder = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
  margin-bottom: 30px
`;

const Card = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #e1e1eb !important;
  padding: 15px 60px;
  background-color: ${props => (props.selected ? '#e4d8ff' : 'transparent')};


  &:hover {
    background-color: ${props => (props.selected ? '#e4d8ff' : '#f7f8f9')};
    cursor: pointer;
  }

  div {
    display: flex;
    flex-direction: column;

    span {
      font-family: 'Open Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: ${props => (props.selected ? '#6124e2' : '#8e929b')};
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    div {
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      color: #2e2e34;
    }
  }
`;

const Notification = styled.div`
  height: 20px;
  width: 20px;
  background-color: #6124e2;
  border-radius: 50%;
  position: absolute;
  transform: translateX(-200%) translateY(40%);
`;

type Props = {
  hearings :Immutable.List<*>,
  hearingsWithOutcomes :Immutable.List<*>,
  selectedHearing :Object,
  handleSelect :(row :Immutable.Map<*, *>, hearingId :string, entityKeyId :string) => void
}

const HearingCardsHolder = ({
  hearings,
  handleSelect,
  selectedHearing,
  hearingsWithOutcomes
} :Props) => {

  if (!hearings.size) {
    return <div>No hearings found.</div>;
  }

  const hearingOptions = hearings.map((hearing) => {
    const dateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    const date = formatDateTime(dateTime, 'MM/DD/YYYY');
    const time = formatDateTime(dateTime, 'HH:mm');
    const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');

    const hearingId = hearing.getIn([PROPERTY_TYPES.CASE_ID, 0]);
    const entityKeyId :string = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
    const selected = selectedHearing ? (hearingId === selectedHearing.hearingId) : false;
    const needsAttention = hearingsWithOutcomes
      ? !hearingsWithOutcomes.includes(entityKeyId)
      : false;

    return (
      <Card
          onClick={() => handleSelect(hearing, hearingId, entityKeyId)}
          key={`${dateTime}${courtroom}${entityKeyId}`}
          selected={selected}>
        { needsAttention ? <Notification /> : null }
        <div>
          <span>Date</span>
          <div>{ date }</div>
        </div>
        <div>
          <span>Time</span>
          <div>{ time }</div>
        </div>
        <div>
          <span>Courtroom</span>
          <div>{ courtroom }</div>
        </div>
      </Card>
    );
  });

  return (
    <CardsHolder>
      {hearingOptions}
    </CardsHolder>
  );
};

export default HearingCardsHolder;
