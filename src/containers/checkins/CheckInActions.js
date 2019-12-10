/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SET_CHECK_IN_DATE :'SET_CHECK_IN_DATE' = 'SET_CHECK_IN_DATE';
const setCheckInDate = value => ({
  type: SET_CHECK_IN_DATE,
  value
});

const CREATE_CHECK_IN_APPOINTMENTS :string = 'CREATE_CHECK_IN_APPOINTMENTS';
const createCheckinAppointments :RequestSequence = newRequestSequence(CREATE_CHECK_IN_APPOINTMENTS);

const CREATE_MANUAL_CHECK_IN :string = 'CREATE_MANUAL_CHECK_IN';
const createManualCheckIn :RequestSequence = newRequestSequence(CREATE_MANUAL_CHECK_IN);

const LOAD_CHECKIN_APPOINTMENTS_FOR_DATE :string = 'LOAD_CHECKIN_APPOINTMENTS_FOR_DATE';
const loadCheckInAppointmentsForDate :RequestSequence = newRequestSequence(LOAD_CHECKIN_APPOINTMENTS_FOR_DATE);

const LOAD_CHECK_IN_NEIGHBORS :string = 'LOAD_CHECK_IN_NEIGHBORS';
const loadCheckInNeighbors :RequestSequence = newRequestSequence(LOAD_CHECK_IN_NEIGHBORS);

export {
  CREATE_CHECK_IN_APPOINTMENTS,
  CREATE_MANUAL_CHECK_IN,
  LOAD_CHECKIN_APPOINTMENTS_FOR_DATE,
  LOAD_CHECK_IN_NEIGHBORS,
  SET_CHECK_IN_DATE,
  createCheckinAppointments,
  createManualCheckIn,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors,
  setCheckInDate
};
