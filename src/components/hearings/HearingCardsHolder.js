/*
 * @flow
 */

import React from 'react';
import { fromJS, List, Map } from 'immutable';
import styled from 'styled-components';
import { DataGrid } from 'lattice-ui-kit';

import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  CASE_ID,
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_TYPE,
} = PROPERTY_TYPES;

const CardsHolder = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(${(props :Object) => (props.columns ? props.columns : '2')}, 1fr);
  grid-gap: 20px;
  margin-bottom: 30px;
`;

const CardWrapper = styled.div`
  display: block;
`;

const Card = styled.div`
  background-color: ${(props :Object) => (props.selected ? OL.PURPLE06 : 'transparent')};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11} !important;
  box-sizing: border-box;
  display: inline-block;
  justify-content: space-between;
  padding: 15px 20px;
  width: 100%;

  div {
    font-size: 12px;
    grid-gap: 20px 5px;
  }

  &:hover {
    background-color: ${(props :Object) => (props.selected && !props.readOnly ? OL.PURPLE06 : OL.GREY12)};
    cursor: pointer;
  }
`;

const Notification = styled.div`
  height: 20px;
  width: 20px;
  background-color: ${OL.PURPLE02};
  border-radius: 50%;
  position: absolute;
  transform: translateX(-150%) translateY(-115%);
`;

const NoHearings = styled.div`
  width: 100%;
  font-size: 16px;
  color: ${OL.GREY01};
`;

const hearingDateKey = `${DATE_TIME}-DATE`;
const hearingTimeKey = `${DATE_TIME}-TIME`;

const labelMap = fromJS({
  [hearingDateKey]: 'Date',
  [hearingTimeKey]: 'Time',
  [COURTROOM]: 'Courtroom',
  [HEARING_TYPE]: 'Type'
});

type Props = {
  columns ?:number;
  hearings :List;
  hearingsWithOutcomes :List;
  readOnly :boolean;
  noHearingsMessage :string;
  selectedHearing :Object;
  handleSelect :(row :Map, hearingId :string, entityKeyId :string) => void;
}

const HearingCardsHolder = ({
  columns,
  hearings,
  handleSelect,
  readOnly,
  noHearingsMessage,
  selectedHearing,
  hearingsWithOutcomes
} :Props) => {

  if (!hearings.size) {
    return <NoResults>{noHearingsMessage || 'No hearings found.'}</NoResults>;
  }

  const hearingOptions = hearings.map((hearing) => {
    const {
      [CASE_ID]: hearingId,
      [COURTROOM]: courtroom,
      [DATE_TIME]: dateTime,
      [ENTITY_KEY_ID]: hearingEKID,
      [HEARING_TYPE]: courtType,
    } = getEntityProperties(hearing, [
      CASE_ID,
      COURTROOM,
      DATE_TIME,
      ENTITY_KEY_ID,
      HEARING_TYPE
    ]);

    const hearingDate = formatDate(dateTime);
    const hearingTime = formatTime(dateTime);

    const data = fromJS({
      [hearingDateKey]: hearingDate,
      [hearingTimeKey]: hearingTime,
      [COURTROOM]: courtroom,
      [HEARING_TYPE]: courtType
    });

    const selected = selectedHearing && hearingId === selectedHearing.hearingId;
    const needsAttention = hearingsWithOutcomes && !hearingsWithOutcomes.includes(hearingEKID);

    return (
      <CardWrapper key={hearingEKID}>
        <Card
            onClick={() => handleSelect(hearing, hearingId, hearingEKID)}
            readOnly={readOnly}
            selected={selected}>
          { needsAttention ? <Notification /> : null }
          <DataGrid
              columns={4}
              data={data}
              labelMap={labelMap}
              truncate />
        </Card>
      </CardWrapper>
    );
  });

  return (
    <CardsHolder columns={columns}>
      { hearingOptions.size ? hearingOptions : <NoHearings>No hearings found.</NoHearings> }
    </CardsHolder>
  );
};

export default HearingCardsHolder;
