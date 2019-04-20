/*
 * @flow
 */

import moment from 'moment';
import { fromJS, List, Map } from 'immutable';

import { getDateAndTime, getEntityProperties } from './DataUtils';
import { formatPhoneNumber } from './ContactInfoUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { FILTERS, RESULT_TYPE } from './consts/CheckInConsts';

const {
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
  if (checkIns.size) {
    checkIns.forEach((checkIn) => {
      const {
        [RESULT]: result,
        [COMPLETED_DATE_TIME]: checkInTime,
        [PHONE]: phone
      } = getEntityProperties(checkIn, [COMPLETED_DATE_TIME, RESULT, PHONE]);
      const validCheckInTime = moment(checkInTime).isBetween(startDate, endDate);
      const checkInAccepted = result === RESULT_TYPE.ACCEPT;
      if (validCheckInTime) {
        if (checkInAccepted) {
          const isMostRecent = !mostRecentSuccess || moment(checkInTime).isAfter(mostRecentSuccess);
          if (isMostRecent) mostRecentSuccess = checkInTime;
          successfulCheckIns = successfulCheckIns.push(checkIn);
          successfulNumbers = successfulNumbers.set(checkInTime, formatPhoneNumber(phone));
        }
        else {
          const isMostRecent = !mostRecentFailure || moment(checkInTime).isAfter(mostRecentFailure);
          if (isMostRecent) mostRecentFailure = checkInTime;
          failedCheckIns = failedCheckIns.push(checkIn);
          failedNumbers = failedNumbers.set(checkInTime, formatPhoneNumber(phone));
        }
      }
      numAttempts = successfulCheckIns.size + failedCheckIns.size;
      if (successfulCheckIns.size) checkInStatus = FILTERS.SUCCESSFUL;
      else if ((!successfulCheckIns.size && failedCheckIns.size)
      || moment().isAfter(endDate)) checkInStatus = FILTERS.FAILED;
      else checkInStatus = FILTERS.PENDING;

      if (checkInStatus === FILTERS.FAILED) {
        displayCheckInTime = mostRecentFailure;
        displayCheckInNumber = failedNumbers.get(displayCheckInTime);
      }
      else if (checkInStatus === FILTERS.SUCCESSFUL) {
        displayCheckInTime = mostRecentSuccess;
        displayCheckInNumber = successfulNumbers.get(displayCheckInTime);
      }
      const { date, time } = getDateAndTime(displayCheckInTime);
      displayCheckInTime = displayCheckInTime ? `${date} ${time}` : undefined;
    });
  }
  else {
    const stillHasTime = moment().isBefore(endDate);
    numAttempts = 0;
    if (stillHasTime) {
      checkInStatus = FILTERS.PENDING;
    }
    else {
      checkInStatus = FILTERS.FAILED;
    }
  }

  return {
    entityKeyId,
    checkInStatus,
    checkInTime: displayCheckInTime,
    checkInNumber: displayCheckInNumber,
    numAttempts
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

export default getCheckInAttempts;
