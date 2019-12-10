/*
 * @flow
 */

import { DateTime, Interval } from 'luxon';
import { fromJS, List, Map } from 'immutable';

import { getEntityKeyId, getEntityProperties } from './DataUtils';
import { formatDate, formatTime } from './FormattingUtils';
import { formatPersonName } from './PeopleUtils';
import { formatPhoneNumber } from './ContactInfoUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { CHECKIN_TYPE, FILTERS, RESULT_TYPE } from './consts/CheckInConsts';


const { PEOPLE, CHECKINS } = APP_TYPES;
const {
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME,
  ENTITY_KEY_ID,
  COMPLETED_DATE_TIME,
  END_DATE,
  RESULT,
  START_DATE,
  PHONE
} = PROPERTY_TYPES;

export const getCheckInAttempts = (checkInAppointment, checkIns) => {
  let checkInStatus;
  let displayCheckInTime;
  let displayCheckInNumber;
  let mostRecentFailure;
  let mostRecentSuccess;
  let successfulCheckIns = List();
  let successfulNumbers = Map();
  let failedCheckIns = List();
  let failedNumbers = Map();
  let numAttempts = 0;
  const {
    [ENTITY_KEY_ID]: entityKeyId,
    [START_DATE]: startDate,
    [END_DATE]: endDate
  } = getEntityProperties(checkInAppointment, [ENTITY_KEY_ID, END_DATE, START_DATE]);
  const startDT = DateTime.fromISO(startDate);
  const endDT = DateTime.fromISO(endDate);
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
      numAttempts = successfulCheckIns.size + failedCheckIns.size;
      if (successfulCheckIns.size) checkInStatus = FILTERS.SUCCESSFUL;
      else if ((!successfulCheckIns.size && failedCheckIns.size)
      || DateTime.local() > endDT) checkInStatus = FILTERS.FAILED;
      else checkInStatus = FILTERS.PENDING;

      if (checkInStatus === FILTERS.FAILED) {
        displayCheckInTime = mostRecentFailure.toISO();
        displayCheckInNumber = failedNumbers.get(displayCheckInTime);
      }
      else if (checkInStatus === FILTERS.SUCCESSFUL) {
        displayCheckInTime = mostRecentSuccess.toISO();
        displayCheckInNumber = successfulNumbers.get(displayCheckInTime);
      }
      const date = formatDate(displayCheckInTime);
      const time = formatTime(displayCheckInTime);
      displayCheckInTime = displayCheckInTime ? `${date} ${time}` : undefined;
    });
  }
  else {
    const stillHasTime = DateTime.local() < endDT;
    numAttempts = 0;
    if (stillHasTime) {
      checkInStatus = FILTERS.PENDING;
    }
    else {
      checkInStatus = FILTERS.FAILED;
    }
  }
  const complete = !!successfulCheckIns.size;
  return {
    checkInStatus,
    checkInTime: displayCheckInTime,
    checkInNumber: displayCheckInNumber,
    complete,
    entityKeyId,
    numAttempts,
    type: CHECKIN_TYPE.phoneCall,
  };
};


export const getStatusForCheckInAppointments = (checkInAppointments, checkIns) => {
  let checkInAppointmentStatusMap = Map();
  checkInAppointments.forEach((checkInAppointment) => {
    const {
      entityKeyId,
      checkInStatus,
      checkInTime,
      checkInNumber,
      numAttempts
    } = getCheckInAttempts(checkInAppointment, checkIns);
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


export const getCheckInsData = (checkInAppointments, checkInAppointmentNeighborsById) => {
  let completeCheckInAppointments = List();
  let incompleteCheckInAppointments = List();
  checkInAppointments.forEach((checkInAppointment) => {
    const appointmentEKID = getEntityKeyId(checkInAppointment);
    const appointmentNeighbors = checkInAppointmentNeighborsById.get(appointmentEKID, Map());
    const person = appointmentNeighbors.get(PEOPLE, Map());
    const checkInNeighbors = appointmentNeighbors.get(CHECKINS, List());
    const {
      [FIRST_NAME]: firstName,
      [MIDDLE_NAME]: middleName,
      [LAST_NAME]: lastName
    } = getEntityProperties(person, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);
    const { lastFirstMid } = formatPersonName(firstName, middleName, lastName);
    const data = getCheckInAttempts(checkInAppointment, checkInNeighbors);
    data.person = lastFirstMid;
    if (data.complete) {
      completeCheckInAppointments = completeCheckInAppointments.push(data);
    }
    else {
      incompleteCheckInAppointments = incompleteCheckInAppointments.push(data);
    }
  });
  return { completeCheckInAppointments, incompleteCheckInAppointments };
};


export default getCheckInAttempts;
