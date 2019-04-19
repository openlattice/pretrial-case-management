/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { EVENT_TYPES, EVENT_LABELS } from '../../utils/consts/EventConsts';
import { FILTERS } from '../../utils/consts/CheckInConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { StyledTooltip } from './PersonStyledTags';

const {
  COMPLETED_DATE_TIME,
  DATE_TIME,
  END_DATE,
  ENTITY_KEY_ID,
  PERSON_ID,
  HEARING_TYPE,
  START_DATE
} = PROPERTY_TYPES;

type Props = {
  scores :Map<*, *>,
  staff :List<*>,
  hearings :List<*>,
  checkInAppointments :List<*>,
  entitySetIdsToAppType :Map<*, *>,
  checkInStatusById :Map<*, *>,
};

const LabelToolTip = styled(StyledTooltip)`
  bottom: 50px;
  left: 20px;
  z-index: 100;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: ${(props) => {
    const { numIcons } = props;
    if (numIcons > 1) {
      return `translateY(${-numIcons * 10}px)`;
    }
    return '';
  }};
`;

const IconContainer = styled.div`
  &:hover ${StyledTooltip} {
    visibility: visible;
  }
`;
const TimelineWrapper = styled.div`
  margin: 85px 0 50px 0;
  padding: 0 30px;
  width: 100%;
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
  left: ${props => props.left}%;
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
  height: ${props => (props.tall ? '85px' : '60px')};
  bottom: ${props => (props.tall ? '75px' : '50px')};
  display: flex;
  flex-direction: column;
  align-items: center;

  ${TagLine} {
    height: ${props => (props.tall ? '65px' : '40px')}
  }
`;

const Tooltip = ({ value }) => (
  value && value.length ? <LabelToolTip>{value}</LabelToolTip> : null
);

const DATE_FORMAT = 'MM/DD';

export default class EventTimeline extends React.Component<Props> {

  getEventDate = (event :Immutable.Map<*, *>) => (
    moment.utc(event.getIn(
      [DATE_TIME, 0], event.getIn([COMPLETED_DATE_TIME, 0], event.getIn([START_DATE, 0], ''))
    ))
  )

  getAllEventsAndRange = () => {
    let events = Map();
    let endDate = moment().endOf('day');
    const {
      scores,
      staff,
      hearings,
      checkInAppointments,
      entitySetIdsToAppType
    } = this.props;

    let { [DATE_TIME]: startDate } = getEntityProperties(scores, [DATE_TIME]);
    startDate = moment(startDate);
    const filteredCheckIns = checkInAppointments.filter((checkInAppointment) => {
      const { [END_DATE]: checkInTime } = getEntityProperties(checkInAppointment, [END_DATE]);
      return moment(checkInTime).isSameOrAfter(startDate);
    });

    staff.forEach((staffer) => {
      let staffObj;
      const neighborDetails = staffer.get(PSA_NEIGHBOR.DETAILS, Map());
      const associationDetails = staffer.get(PSA_ASSOCIATION.DETAILS, Map());
      const associationEntitySetId = staffer.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
      const appTypeFqn = entitySetIdsToAppType.get(associationEntitySetId, '');
      const staffDetails = neighborDetails.merge(associationDetails);
      const staffDate = moment(this.getEventDate(associationDetails)).format('MM/DD/YYYY');
      if (endDate.isBefore(staffDate)) endDate = moment(staffDate);
      if (startDate.isAfter(staffDate)) startDate = moment(staffDate);
      if (appTypeFqn === APP_TYPES.EDITED_BY) {
        staffObj = staffDetails.set('type', EVENT_TYPES.PSA_EDITED);
      }
      else if (appTypeFqn === APP_TYPES.ASSESSED_BY) {
        staffObj = staffDetails.set('type', EVENT_TYPES.PSA_CREATED);
      }
      events = events.set(staffDate, events.get(staffDate, List()).push(staffObj));
    });
    hearings.forEach((hearing) => {
      let hearinDetails = hearing.get(PSA_NEIGHBOR.DETAILS);
      hearinDetails = hearinDetails.set('type', EVENT_TYPES.HEARING);
      const hearingDate = moment(this.getEventDate(hearinDetails)).format('MM/DD/YYYY');
      if (endDate.isBefore(hearingDate)) endDate = moment(hearingDate);
      if (startDate.isAfter(hearingDate)) startDate = moment(hearingDate);
      events = events.set(hearingDate, events.get(hearingDate, List()).push(hearinDetails));
    });
    filteredCheckIns.forEach((checkInAppointment) => {
      let checkInDetails = checkInAppointment.get(PSA_NEIGHBOR.DETAILS);
      checkInDetails = checkInDetails.set('type', EVENT_TYPES.CHECKIN_APPOINTMENTS);
      const checkInDate = moment(this.getEventDate(checkInDetails)).format('MM/DD/YYYY');
      if (endDate.isBefore(checkInDate)) endDate = moment(checkInDate);
      events = events.set(checkInDate, events.get(checkInDate, List()).push(checkInDetails));
    });

    return { events, startDate, endDate };
  }

  renderTag = (leftOffset, dateLabel, iconGroup, dateTime) => (
    <TagGroupWrapper key={`${dateTime}-${leftOffset}`} left={leftOffset}>
      <TagGroup>
        { iconGroup }
        <TagLine />
        <TagMonthLabel>{dateLabel}</TagMonthLabel>
      </TagGroup>
    </TagGroupWrapper>
  );

  getIcons = (event) => {
    const { checkInStatusById } = this.props;
    let color = OL.PURPLE02;
    const eventType = event.get('type', '');
    const { icon } = EVENT_LABELS[eventType];
    let { label } = EVENT_LABELS[eventType];
    if (eventType === EVENT_TYPES.CHECKIN_APPOINTMENTS) {
      const checkInId = event.getIn([ENTITY_KEY_ID, 0], '');
      const checkInAppointmentsStatus = checkInStatusById.get(checkInId, List());
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

    return (
      <IconContainer>
        <FontAwesomeIcon color={color} icon={icon} />
        <Tooltip value={label} />
      </IconContainer>
    );
  }

  renderTags = () => {
    const { events, startDate, endDate } = this.getAllEventsAndRange();
    const duration = moment.duration(startDate.diff(endDate.add(12, 'h'))).as('days');
    if (events.size) {
      return (
        <TagRow>
          {
            events.entrySeq().map(([date, eventList]) => {
              const iconGroup = (
                <IconWrapper numIcons={eventList.size}>
                  {
                    eventList.map(event => this.getIcons(event))
                  }
                </IconWrapper>
              );
              const dateTime = moment(date);
              const positionRatio = Math.floor(moment.duration(startDate.diff(dateTime)).as('days') / duration * 100);
              const dateLabel = dateTime.format(DATE_FORMAT);
              const leftOffset = positionRatio;

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
