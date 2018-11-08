/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Constants } from 'lattice';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import { OL } from '../../utils/consts/Colors';
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
  border: 1px solid ${OL.GREY11} !important;
  padding: 15px 60px;
  background-color: ${props => (props.selected ? OL.PURPLE06 : 'transparent')};


  &:hover {
    background-color: ${props => (props.selected ? OL.PURPLE06 : OL.GREY12)};
    cursor: pointer;
  }
`;

const Notification = styled.div`
  height: 20px;
  width: 20px;
  background-color: ${OL.PURPLE02};
  border-radius: 50%;
  position: absolute;
  transform: translateX(-200%) translateY(40%);
`;

const NoHearings = styled.div`
  width: 100%
  font-size: 16px;
  color: ${OL.GREY01};
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
    const selected = selectedHearing && hearingId === selectedHearing.hearingId;
    const needsAttention = hearingsWithOutcomes && !hearingsWithOutcomes.includes(entityKeyId);

    const generalContent = [
      {
        label: 'Date',
        content: [date]
      },
      {
        label: 'Time',
        content: [time]
      },
      {
        label: 'Courtroom',
        content: [courtroom]
      }
    ];

    const content = generalContent.map(item => (
      <ContentBlock
          contentBlock={item}
          key={item.label} />
    ));

    return (
      <Card
          onClick={() => handleSelect(hearing, hearingId, entityKeyId)}
          key={`${dateTime}${courtroom}${entityKeyId}`}
          selected={selected}>
        { needsAttention ? <Notification /> : null }
        <ContentSection component={CONTENT_CONSTS.HEARING_CARD}>
          {content}
        </ContentSection>
      </Card>
    );
  });

  return (
    <CardsHolder>
      { hearingOptions.size ? hearingOptions : <NoHearings>No hearings found.</NoHearings> }
    </CardsHolder>
  );
};

export default HearingCardsHolder;
