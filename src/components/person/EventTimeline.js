/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled, { css } from 'styled-components';
import { DateTime } from 'luxon';
import { Tooltip } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { EVENT_TYPES, EVENT_LABELS } from '../../utils/consts/EventConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate } from '../../utils/FormattingUtils';

const {
  COMPLETED_DATE_TIME,
  DATE_TIME,
  NOTIFIED,
  PERSON_ID,
  HEARING_TYPE,
  START_DATE,
  TYPE
} = PROPERTY_TYPES;

const getTranslateProperty = (props :Object) => (
  props.numIcons > 1
    ? (
      css`
          transform: translateY(${((props.numIcons - 1) * -2) * 10}px);
        `
    ) : ''
);

type Props = {
  entitySetIdsToAppType :Map;
  hearings :List;
  personReminders :Map;
  scores :Map;
  staff :List;
};

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${getTranslateProperty}
`;

const TimelineWrapper = styled.div`
  margin: 85px 0 50px 0;
  padding: 0 30px;
  min-width: 900px;
  display: flex;
  flex-direction: column;
`;

const TimelineBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${OL.GREY11};
  border-radius: 1px;
`;

const TagRow = styled.div`
  position: relative;
  width: 100%;
`;

const TagGroupWrapper = styled.div`
  position: absolute;
  left: ${(props :Object) => props.left}%;
`;

const TagMonthLabel = styled.div`
  position: absolute;
  font-size: 10px;
  font-weight: 500;
  z-index: 1;
  color: ${OL.GREY01};
  text-transform: uppercase;
  transform: translate(5px, 70px) rotate(65deg);
`;

const TagLine = styled.div`
  position: absolute;
  bottom: 0;
  height: 40px;
  width: 1px;
  border-left: 1px solid ${OL.GREY01};
`;

const TagGroup = styled.div`
  position: relative;
  height: ${(props :Object) => (props.tall ? '85px' : '60px')};
  bottom: ${(props :Object) => (props.tall ? '75px' : '50px')};
  display: flex;
  flex-direction: column;
  align-items: center;

  ${TagLine} {
    height: ${(props :Object) => (props.tall ? '65px' : '40px')};
  }
`;

export default class EventTimeline extends React.Component<Props> {

  getEventDate = (event :Map) => (
    event.getIn(
      [DATE_TIME, 0], event.getIn([COMPLETED_DATE_TIME, 0], event.getIn([START_DATE, 0], ''))
    )
  )

  getAllEventsAndRange = () => {
    let events = Map();
    let endDate = DateTime.local().endOf('day');
    const {
      hearings,
      entitySetIdsToAppType,
      personReminders,
      scores,
      staff
    } = this.props;

    let { [DATE_TIME]: startDate } = getEntityProperties(scores, [DATE_TIME]);
    startDate = DateTime.fromISO(startDate);
    const filteredPersonReminders = personReminders.filter((reminder) => {
      const { [DATE_TIME]: reminderTime } = getEntityProperties(reminder, [DATE_TIME]);
      return DateTime.fromISO(reminderTime).valueOf() >= startDate.valueOf();
    });

    staff.forEach((staffer) => {
      let staffObj;
      const neighborDetails = staffer.get(PSA_NEIGHBOR.DETAILS, Map());
      const associationDetails = staffer.get(PSA_ASSOCIATION.DETAILS, Map());
      const associationEntitySetId = staffer.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(associationEntitySetId, '');
      const staffDetails = neighborDetails.merge(associationDetails);
      const staffDate = DateTime.fromISO(this.getEventDate(associationDetails));
      const formattedStaffDate = staffDate.toISO();
      if (endDate.valueOf() < staffDate.valueOf()) endDate = staffDate;
      if (startDate.valueOf() > staffDate.valueOf()) startDate = staffDate;
      if (appTypeFqn === APP_TYPES.EDITED_BY) {
        staffObj = staffDetails.set('type', EVENT_TYPES.PSA_EDITED);
      }
      else if (appTypeFqn === APP_TYPES.ASSESSED_BY) {
        staffObj = staffDetails.set('type', EVENT_TYPES.PSA_CREATED);
      }
      events = events.set(formattedStaffDate, events.get(formattedStaffDate, List()).push(staffObj));
    });
    hearings.forEach((hearing) => {
      let hearingDetails = hearing.get(PSA_NEIGHBOR.DETAILS, hearing);
      hearingDetails = hearingDetails.set('type', EVENT_TYPES.HEARING);
      const hearingDate = DateTime.fromISO(this.getEventDate(hearingDetails));
      const formattedHearingDate = hearingDate.toISO();
      if (endDate.valueOf() < hearingDate.valueOf()) endDate = hearingDate;
      if (startDate.valueOf() > hearingDate.valueOf()) startDate = hearingDate;
      events = events.set(formattedHearingDate, events.get(formattedHearingDate, List()).push(hearingDetails));
    });
    filteredPersonReminders.forEach((reminder) => {
      let reminderDetails = reminder.get(PSA_NEIGHBOR.DETAILS, Map());
      reminderDetails = reminderDetails.set('type', EVENT_TYPES.REMINDER_SENT);
      const reminderDate = DateTime.fromISO(this.getEventDate(reminderDetails));
      const formattedReminderDate = reminderDate.toISO();
      if (endDate.valueOf() < reminderDate.valueOf()) endDate = reminderDate;
      events = events.set(formattedReminderDate, events.get(formattedReminderDate, List()).push(reminderDetails));
    });

    return { events, startDate, endDate };
  }

  renderTag = (leftOffset :number, dateLabel :string, iconGroup :List, dateTime :DateTime) => (
    <TagGroupWrapper key={`${dateTime.valueOf()}-${leftOffset}`} left={leftOffset}>
      <TagGroup>
        { iconGroup }
        <TagLine />
        <TagMonthLabel>{dateLabel}</TagMonthLabel>
      </TagGroup>
    </TagGroupWrapper>
  );

  getIcons = (event :Map) => {
    let color = OL.PURPLE02;
    const eventType = event.get('type', '');
    const { icon } = EVENT_LABELS[eventType];
    let { label } = EVENT_LABELS[eventType];
    if (eventType === EVENT_TYPES.PSA_CREATED) {
      color = OL.GREEN01;
      const staffMember = event.getIn([PERSON_ID, 0], '');
      if (staffMember) label = `${label} by ${staffMember}`;
    }
    if (eventType === EVENT_TYPES.PSA_EDITED) {
      const staffMember = event.getIn([PERSON_ID, 0], '');
      if (staffMember) label = `${label} by ${staffMember}`;
    }
    if (eventType === EVENT_TYPES.HEARING) {
      const hearingType = event.getIn([HEARING_TYPE, 0], '');
      if (hearingType) label = `${label} (${hearingType})`;
    }
    if (eventType === EVENT_TYPES.REMINDER_SENT) {
      const {
        [NOTIFIED]: wasNotified,
        [TYPE]: reminderType
      } = getEntityProperties(event, [NOTIFIED, TYPE]);
      if (reminderType) label = `${label} (${reminderType})`;
      color = wasNotified ? OL.GREEN01 : OL.RED01;
    }

    return (
      <Tooltip arrow placement="top" title={label}>
        <div key={label}>
          <FontAwesomeIcon color={color} icon={icon} />
        </div>
      </Tooltip>
    );
  }

  renderTags = () => {
    const { events, startDate, endDate } = this.getAllEventsAndRange();
    const duration = Math.floor(startDate.diff(endDate.plus({ hours: 12 }), 'days').days);
    if (events.size) {
      return (
        <TagRow>
          {
            events.entrySeq().map(([date, eventList]) => {
              const dateTime = DateTime.fromISO(date);
              const positionRatio = Math.ceil((startDate.diff(dateTime, 'days').days / duration) * 100);
              const dateLabel = formatDate(date);
              const leftOffset = positionRatio;
              const iconGroup = (
                <IconWrapper key={`${date}${positionRatio}`} numIcons={eventList.size}>
                  {
                    eventList.map((event) => this.getIcons(event))
                  }
                </IconWrapper>
              );

              return this.renderTag(leftOffset, dateLabel, iconGroup, dateTime);
            })
          }
        </TagRow>
      );
    }
    return null;
  }

  render() {
    return (
      <TimelineWrapper>
        {this.renderTags()}
        <TimelineBar />
      </TimelineWrapper>
    );
  }
}
