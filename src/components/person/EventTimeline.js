/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Tooltip } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { EVENT_TYPES, EVENT_LABELS } from '../../utils/consts/EventConsts';
import { FILTERS } from '../../utils/consts/CheckInConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate } from '../../utils/FormattingUtils';

const {
  COMPLETED_DATE_TIME,
  DATE_TIME,
  END_DATE,
  ENTITY_KEY_ID,
  NOTIFIED,
  PERSON_ID,
  HEARING_TYPE,
  START_DATE,
  TYPE
} = PROPERTY_TYPES;

type Props = {
  checkInAppointments :List;
  checkInStatusById :Map;
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
  transform: ${(props :Object) => {
    const { numIcons } = props;
    if (numIcons > 1) {
      const yDistance = ((numIcons - 1) * -2) * 10;
      return `translateY(${yDistance}px)`;
    }
    return '';
  }};
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
  font-family: 'Open Sans', sans-serif;
  font-size: 10px;
  font-weight: 500;
  z-index: 1;
  color: ${OL.GREY01};
  text-transform: uppercase;
  transform: translate(5px,70px) rotate(65deg);
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
    height: ${(props :Object) => (props.tall ? '65px' : '40px')}
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
      checkInAppointments,
      hearings,
      entitySetIdsToAppType,
      personReminders,
      scores,
      staff
    } = this.props;

    let { [DATE_TIME]: startDate } = getEntityProperties(scores, [DATE_TIME]);
    startDate = DateTime.fromISO(startDate);
    const filteredCheckIns = checkInAppointments.filter((checkInAppointment) => {
      const { [END_DATE]: checkInTime } = getEntityProperties(checkInAppointment, [END_DATE]);
      return DateTime.fromISO(checkInTime) >= startDate;
    });
    const filteredPersonReminders = personReminders.filter((reminder) => {
      const { [DATE_TIME]: reminderTime } = getEntityProperties(reminder, [DATE_TIME]);
      return DateTime.fromISO(reminderTime) >= startDate;
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
      if (endDate < staffDate) endDate = staffDate;
      if (startDate > staffDate) startDate = staffDate;
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
      if (endDate < hearingDate) endDate = hearingDate;
      if (startDate > hearingDate) startDate = hearingDate;
      events = events.set(formattedHearingDate, events.get(formattedHearingDate, List()).push(hearingDetails));
    });
    filteredCheckIns.forEach((checkInAppointment) => {
      let checkInDetails = checkInAppointment.get(PSA_NEIGHBOR.DETAILS, Map());
      checkInDetails = checkInDetails.set('type', EVENT_TYPES.CHECKIN_APPOINTMENTS);
      const checkInDate = DateTime.fromISO(this.getEventDate(checkInDetails));
      const formattedCheckInDate = checkInDate.toISO();
      if (endDate < checkInDate) endDate = checkInDate;
      events = events.set(formattedCheckInDate, events.get(formattedCheckInDate, List()).push(checkInDetails));
    });
    filteredPersonReminders.forEach((reminder) => {
      let reminderDetails = reminder.get(PSA_NEIGHBOR.DETAILS, Map());
      reminderDetails = reminderDetails.set('type', EVENT_TYPES.REMINDER_SENT);
      const reminderDate = DateTime.fromISO(this.getEventDate(reminderDetails));
      const formattedReminderDate = reminderDate.toISO();
      if (endDate < reminderDate) endDate = reminderDate;
      events = events.set(formattedReminderDate, events.get(formattedReminderDate, List()).push(reminderDetails));
    });

    return { events, startDate, endDate };
  }

  renderTag = (leftOffset :number, dateLabel :string, iconGroup :List, dateTime :string) => (
    <TagGroupWrapper key={`${dateTime}-${leftOffset}`} left={leftOffset}>
      <TagGroup>
        { iconGroup }
        <TagLine />
        <TagMonthLabel>{dateLabel}</TagMonthLabel>
      </TagGroup>
    </TagGroupWrapper>
  );

  getIcons = (event :Map) => {
    const { checkInStatusById } = this.props;
    let color = OL.PURPLE02;
    const eventType = event.get('type', '');
    const { icon } = EVENT_LABELS[eventType];
    let { label } = EVENT_LABELS[eventType];
    const eventEKID = event.getIn([ENTITY_KEY_ID, 0], '');
    if (eventType === EVENT_TYPES.CHECKIN_APPOINTMENTS) {
      const checkInAppointmentsStatus = checkInStatusById.get(eventEKID, List());
      if (checkInAppointmentsStatus.size) {
        const status = checkInAppointmentsStatus.get('checkInStatus');
        switch (status) {
          case FILTERS.SUCCESSFUL:
            label = `${label} (${FILTERS.SUCCESSFUL})`;
            color = OL.GREEN01;
            break;
          case FILTERS.FAILED:
            label = `${label} (${FILTERS.FAILED})`;
            color = OL.ORANGE01;
            break;
          case FILTERS.PENDING:
            label = `${label} (${FILTERS.PENDING})`;
            color = OL.PURPLE05;
            break;
          default:
            break;
        }
      }
    }
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
