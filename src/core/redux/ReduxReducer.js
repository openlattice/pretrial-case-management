/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import chargesReducer from '../../containers/charges/ChargesReducer';
import courtReducer from '../../containers/court/CourtReducer';
import dashboardReducer from '../../containers/dashboard/DashboardReducer';
import downloadReducer from '../../containers/download/DownloadReducer';
import edmReducer from '../../edm/EDMReducer';
import enrollReducer from '../../containers/enroll/EnrollReducer';
import psaReducer from '../../containers/psa/FormReducer';
import peopleReducer from '../../containers/people/PeopleReducer';
import reviewReducer from '../../containers/review/ReviewReducer';
import searchReducer from '../../containers/person/SearchReducer';
import submitReducer from '../../utils/submit/SubmitReducer';

import { STATE } from '../../utils/consts/FrontEndStateConsts';

export default function reduxReducer() {

  return combineReducers({
    [STATE.APP]: appReducer,
    [STATE.AUTH]: AuthReducer,
    [STATE.CHARGES]: chargesReducer,
    [STATE.COURT]: courtReducer,
    [STATE.DASHBOARD]: dashboardReducer,
    [STATE.DOWNLOAD]: downloadReducer,
    [STATE.EDM]: edmReducer,
    [STATE.ENROLL]: enrollReducer,
    [STATE.PSA]: psaReducer,
    [STATE.PEOPLE]: peopleReducer,
    [STATE.REVIEW]: reviewReducer,
    [STATE.SEARCH]: searchReducer,
    [STATE.SUBMIT]: submitReducer
  });
}
