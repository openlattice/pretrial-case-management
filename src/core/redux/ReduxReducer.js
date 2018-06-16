/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import dashboardReducer from '../../containers/dashboard/DashboardReducer';
import enrollReducer from '../../containers/enroll/EnrollReducer';
import psaReducer from '../../containers/psa/FormReducer';
import peopleReducer from '../../containers/people/PeopleReducer';
import reviewReducer from '../../containers/review/ReviewReducer';
import searchReducer from '../../containers/person/SearchReducer';
import submitReducer from '../../utils/submit/SubmitReducer';

export default function reduxReducer() {

  return combineReducers({
    auth: AuthReducer,
    dashboard: dashboardReducer,
    enroll: enrollReducer,
    psa: psaReducer,
    people: peopleReducer,
    review: reviewReducer,
    search: searchReducer,
    submit: submitReducer
  });
}
