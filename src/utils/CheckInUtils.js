import { DateTime, Interval } from 'luxon';
import { fromJS, List, Map } from 'immutable';

import { getEntityKeyId, getEntityProperties } from './DataUtils';
import { formatDate, formatTime } from './FormattingUtils';
import { formatPeopleInfo } from './PeopleUtils';
import { formatPhoneNumber } from './ContactInfoUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { CHECKIN_TYPE, FILTERS, RESULT_TYPE } from './consts/CheckInConsts';

const { PEOPLE, CHECKINS, MANUAL_CHECK_INS } = APP_TYPES;
const {
  COMPLETED_DATE_TIME,
  CONTACT_DATETIME,
  CONTACT_METHOD,
  END_DATE,
  ENTITY_KEY_ID,
  PHONE,
  RESULT,
  START_DATE
} = PROPERTY_TYPES;

export const getCheckInAttempts = (
  checkInAppointment :Map,
  checkIns :List,
  manualCheckIns :List
) => {
  let checkInStatus;
  let displayCheckInTime;
  let displayCheckInNumber;
  let mostRecentFailure;
  let mostRecentSuccess;
  let successfulCheckIns = List();
  let successfulManualCheckIns = List();
  let successfulNumbers = Map();
  let failedCheckIns = List();
  let failedNumbers = Map();
  let numAttempts = 0;
  let mostRecentContactMethod = CHECKIN_TYPE.PHONE;
  const {
    [ENTITY_KEY_ID]: entityKeyId,
    [START_DATE]: startDate,
    [END_DATE]: endDate
  } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID, END_DATE, START_DATE]);
  const startDT = DateTime.fromISO(startDate);
  const endDT = DateTime.fromISO(endDate);
  if (manualCheckIns.size) {
    manualCheckIns.forEach((checkIn) => {
      const {
        [CONTACT_METHOD]: contactMethod,
        [CONTACT_DATETIME]: checkInTime
      } = getEntityProperties(checkIn, [CONTACT_DATETIME, CONTACT_METHOD]);
      const checkInDT = DateTime.fromISO(checkInTime);
      const validCheckInTime = Interval.fromDateTimes(startDT, endDT).contains(checkInDT);
      const isMostRecent = !mostRecentSuccess || checkInDT > mostRecentSuccess;
      if (validCheckInTime) {
        if (isMostRecent) {
          mostRecentSuccess = checkInDT;
          mostRecentContactMethod = contactMethod;
        }
        successfulManualCheckIns = successfulManualCheckIns.push(checkIn);
      }
    });
  }
  if (checkIns.size) {
    checkIns.forEach((checkIn) => {
      const {
        [RESULT]: result,
        [COMPLETED_DATE_TIME]: checkInTime,
        [PHONE]: phone
      } = getEntityProperties(checkIn, [COMPLETED_DATE_TIME, RESULT, PHONE]);
      const checkInDT = DateTime.fromISO(checkInTime);
      const validCheckInTime = Interval.fromDateTimes(startDT, endDT).contains(checkInDT);
      const checkInAccepted = result === RESULT_TYPE.ACCEPT;
      if (validCheckInTime) {
        if (checkInAccepted) {
          const isMostRecent = !mostRecentSuccess || checkInDT > mostRecentSuccess;
          if (isMostRecent) mostRecentSuccess = checkInDT;
          successfulCheckIns = successfulCheckIns.push(checkIn);
          successfulNumbers = successfulNumbers.set(checkInTime, formatPhoneNumber(phone));
        }
        else {
          const isMostRecent = !mostRecentFailure || checkInDT > mostRecentFailure;
          if (isMostRecent) mostRecentFailure = checkInDT;
          failedCheckIns = failedCheckIns.push(checkIn);
          failedNumbers = failedNumbers.set(checkInTime, formatPhoneNumber(phone));
        }
      }
    });
  }
  const stillHasTime = DateTime.local() < endDT;
  numAttempts = successfulCheckIns.size + failedCheckIns.size + successfulManualCheckIns.size;
  const hasSuccessfulCheckIns = successfulCheckIns.size || successfulManualCheckIns.size;
  if (hasSuccessfulCheckIns) {
    checkInStatus = FILTERS.SUCCESSFUL;
    displayCheckInTime = mostRecentSuccess.toISO();
    displayCheckInNumber = successfulNumbers.get(displayCheckInTime);
  }
  else if (stillHasTime) {
    checkInStatus = FILTERS.PENDING;
  }
  else if (!hasSuccessfulCheckIns && failedCheckIns.size) {
    checkInStatus = FILTERS.FAILED;
    displayCheckInTime = mostRecentFailure.toISO();
    displayCheckInNumber = failedNumbers.get(displayCheckInTime);
  }
  else {
    checkInStatus = FILTERS.FAILED;
  }
  const date = formatDate(displayCheckInTime);
  const time = formatTime(displayCheckInTime);
  displayCheckInTime = displayCheckInTime ? `${date} ${time}` : undefined;
  const complete = hasSuccessfulCheckIns;
  return {
    checkInStatus,
    checkInTime: displayCheckInTime,
    checkInNumber: displayCheckInNumber,
    complete,
    entityKeyId,
    numAttempts,
    type: mostRecentContactMethod,
  };
};

export const getStatusForCheckInAppointments = (checkInAppointments, checkIns, manualCheckIns) => {
  let checkInAppointmentStatusMap = Map();
  checkInAppointments.forEach((checkInAppointment) => {
    const {
      entityKeyId,
      checkInStatus,
      checkInTime,
      checkInNumber,
      numAttempts
    } = getCheckInAttempts(checkInAppointment, checkIns, manualCheckIns);
    checkInAppointmentStatusMap = checkInAppointmentStatusMap.set(
      entityKeyId,
      fromJS({
        checkInStatus,
        checkInTime,
        checkInNumber,
        numAttempts
      })
    );
  });
  return checkInAppointmentStatusMap;
};

export const getCheckInsData = (
  checkInAppointments,
  checkInAppointmentNeighborsById,
  peopleNeighborsById
) => {
  let completeCheckInAppointments = List();
  let incompleteCheckInAppointments = List();
  checkInAppointments.forEach((checkInAppointment) => {
    const appointmentEKID = getEntityKeyId(checkInAppointment);
    const appointmentNeighbors = checkInAppointmentNeighborsById.get(appointmentEKID, Map());
    const person = appointmentNeighbors.get(PEOPLE, Map());
    const personEKID = getEntityKeyId(person);
    const checkInNeighbors = peopleNeighborsById.getIn([personEKID, CHECKINS], List());
    const manualCheckInNeighbors = peopleNeighborsById.getIn([personEKID, MANUAL_CHECK_INS], List());
    const { lastFirstMid } = formatPeopleInfo(person);
    const data :Object = getCheckInAttempts(checkInAppointment, checkInNeighbors, manualCheckInNeighbors);
    data.id = appointmentEKID;
    data.personName = lastFirstMid;
    data.personEKID = personEKID;
    if (data.complete && data.personEKID) {
      completeCheckInAppointments = completeCheckInAppointments.push(data);
    }
    else if (data.personEKID) {
      incompleteCheckInAppointments = incompleteCheckInAppointments.push(data);
    }
  });
  return { completeCheckInAppointments, incompleteCheckInAppointments };
};

export default getCheckInAttempts;
