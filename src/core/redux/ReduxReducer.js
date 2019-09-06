/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import appReducer from '../../containers/app/AppReducer';
import chargesReducer from '../../containers/charges/ChargesReducer';
import checkInsReducer from '../../containers/checkins/CheckInsReducer';
import contactInfoReducer from '../../containers/contactinformation/ContactInfoReducer';
import courtReducer from '../../containers/court/CourtReducer';
import countiesReducer from '../../containers/counties/CountiesReducer';
import dashboardReducer from '../../containers/dashboard/DashboardReducer';
import downloadReducer from '../../containers/download/DownloadReducer';
import edmReducer from '../../edm/EDMReducer';
import enrollReducer from '../../containers/enroll/EnrollReducer';
import hearingsReducer from '../../containers/hearings/HearingsReducer';
import manualRemindersReducer from '../../containers/manualreminders/ManualRemindersReducer';
import psaModalReducer from '../../containers/psamodal/PSAModalReducer';
import psaReducer from '../../containers/psa/FormReducer';
import personReducer from '../../containers/person/PersonReducer';
import peopleReducer from '../../containers/people/PeopleReducer';
import releaseConditionsReducer from '../../containers/releaseconditions/ReleaseConditionsReducer';
import remindersReducer from '../../containers/reminders/RemindersReducer';
import reviewReducer from '../../containers/review/ReviewReducer';
import searchReducer from '../../containers/person/SearchReducer';
import submitReducer from '../../utils/submit/SubmitReducer';
import subscriptionsReducer from '../../containers/subscription/SubscriptionsReducer';

import { STATE } from '../../utils/consts/redux/SharedConsts';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [STATE.APP]: appReducer,
    [STATE.AUTH]: AuthReducer,
    [STATE.CHARGES]: chargesReducer,
    [STATE.CHECK_INS]: checkInsReducer,
    [STATE.CONTACT_INFO]: contactInfoReducer,
    [STATE.COURT]: courtReducer,
    [STATE.COUNTIES]: countiesReducer,
    [STATE.DASHBOARD]: dashboardReducer,
    [STATE.DOWNLOAD]: downloadReducer,
    [STATE.EDM]: edmReducer,
    [STATE.ENROLL]: enrollReducer,
    [STATE.HEARINGS]: hearingsReducer,
    [STATE.MANUAL_REMINDERS]: manualRemindersReducer,
    [STATE.PSA]: psaReducer,
    [STATE.PSA_MODAL]: psaModalReducer,
    [STATE.PEOPLE]: peopleReducer,
    [STATE.PERSON]: personReducer,
    [STATE.RELEASE_CONDITIONS]: releaseConditionsReducer,
    [STATE.REMINDERS]: remindersReducer,
    [STATE.REVIEW]: reviewReducer,
    [STATE.ROUTER]: connectRouter(routerHistory),
    [STATE.SEARCH]: searchReducer,
    [STATE.SUBMIT]: submitReducer,
    [STATE.SUBSCRIPTIONS]: subscriptionsReducer,
  });
}
