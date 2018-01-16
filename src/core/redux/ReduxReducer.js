/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import psaReducer from '../../containers/psa/FormReducer';
import peopleReducer from '../../containers/people/PeopleReducer';
import searchReducer from '../../containers/person/SearchReducer';
import submitReducer from '../../utils/submit/SubmitReducer';

export default function reduxReducer() {

  return combineReducers({
    auth: AuthReducer,
    psa: psaReducer,
    people: peopleReducer,
    search: searchReducer,
    submit: submitReducer
  });
}
