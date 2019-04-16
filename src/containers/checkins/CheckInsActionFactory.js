/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_CHECKIN_APPOINTMENTS_FOR_DATE :string = 'LOAD_CHECKIN_APPOINTMENTS_FOR_DATE';
const loadCheckInAppointmentsForDate :RequestSequence = newRequestSequence(LOAD_CHECKIN_APPOINTMENTS_FOR_DATE);

const LOAD_CHECK_IN_NEIGHBORS :string = 'LOAD_CHECK_IN_NEIGHBORS';
const loadCheckInNeighbors :RequestSequence = newRequestSequence(LOAD_CHECK_IN_NEIGHBORS);

export {
  LOAD_CHECKIN_APPOINTMENTS_FOR_DATE,
  LOAD_CHECK_IN_NEIGHBORS,
  loadCheckInAppointmentsForDate,
  loadCheckInNeighbors
};
