/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import courtReducer from '../../containers/court/CourtReducer';
import dashboardReducer from '../../containers/dashboard/DashboardReducer';
import downloadReducer from '../../containers/download/DownloadReducer';
import enrollReducer from '../../containers/enroll/EnrollReducer';
import psaReducer from '../../containers/psa/FormReducer';
import peopleReducer from '../../containers/people/PeopleReducer';
import reviewReducer from '../../containers/review/ReviewReducer';
import searchReducer from '../../containers/person/SearchReducer';
import submitReducer from '../../utils/submit/SubmitReducer';

import { STATE } from '../../utils/consts/FrontEndStateConsts';

export default function reduxReducer() {

  return combineReducers({
    [STATE.AUTH]: AuthReducer,
    [STATE.COURT]: courtReducer,
    [STATE.DASHBOARD]: dashboardReducer,
    [STATE.DOWNLOAD]: downloadReducer,
    [STATE.ENROLL]: enrollReducer,
    [STATE.PSA]: psaReducer,
    [STATE.PEOPLE]: peopleReducer,
    [STATE.REVIEW]: reviewReducer,
    [STATE.SEARCH]: searchReducer,
    [STATE.SUBMIT]: submitReducer
  });
}
