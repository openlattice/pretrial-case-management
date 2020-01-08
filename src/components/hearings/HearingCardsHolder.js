/*
 * @flow
 */

import React from 'react';
import { List, Map } from 'immutable';
import styled from 'styled-components';
import { Constants } from 'lattice';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { OPENLATTICE_ID_FQN } = Constants;

const Card = styled.div`
  background-color: ${(props) => (props.selected ? OL.PURPLE06 : 'transparent')};
  border: 1px solid ${OL.GREY11} !important;
  border-radius: 5px;
  display: inline-block;
  justify-content: space-between;
  padding: 15px 20px;
  width: 100%;

  &:hover {
    background-color: ${(props) => (props.selected && !props.readOnly ? OL.PURPLE06 : OL.GREY12)};
    cursor: pointer;
  }
`;

const CardsHolder = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(${(props) => (props.columns ? props.columns : 2)}, 1fr);
  margin-bottom: 30px;
  width: 100%;
`;

const CardWrapper = styled.div`
  display: block;
`;

const NoHearings = styled.div`
  color: ${OL.GREY01};
  font-size: 16px;
  width: 100%;
`;

const Notification = styled.div`
  background-color: ${OL.PURPLE02};
  border-radius: 50%;
  height: 20px;
  position: absolute;
  transform: translateX(-150%) translateY(-115%);
  width: 20px;
`;

type Props = {
  columns :number;
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
    const dateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    const date = formatDate(dateTime);
    const time = formatTime(dateTime);
    const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
    const courtType = hearing.getIn([PROPERTY_TYPES.HEARING_TYPE, 0], '');

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
      },
      {
        label: 'Type',
        content: [courtType]
      }
    ];

    const content = generalContent.map((item) => (
      <ContentBlock
          contentBlock={item}
          key={item.label} />
    ));

    return (
      <CardWrapper key={`${dateTime}${courtroom}${entityKeyId}`}>
        <Card
            onClick={() => handleSelect(hearing, hearingId, entityKeyId)}
            readOnly={readOnly}
            selected={selected}>
          { needsAttention ? <Notification /> : null }
          <ContentSection component={CONTENT_CONSTS.HEARING_CARD}>
            {content}
          </ContentSection>
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
