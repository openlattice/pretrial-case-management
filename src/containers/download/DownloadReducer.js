/*
 * @flow
 */

import {
  Map,
  List,
  Set,
  fromJS
} from 'immutable';

import {
  downloadChargeLists,
  downloadHearingData,
  downloadPSAsByHearingDate,
  downloadPsaForms,
  downloadReminderData,
  getDownloadFilters
} from './DownloadActions';

import { DOWNLOAD } from '../../utils/consts/FrontEndStateConsts';

const INITIAL_STATE :Map<*, *> = fromJS({
  [DOWNLOAD.NO_RESULTS]: false,
  [DOWNLOAD.DOWNLOADING_REPORTS]: false,
  [DOWNLOAD.COURTROOM_OPTIONS]: Map(),
  [DOWNLOAD.COURTROOM_TIMES]: Map(),
  [DOWNLOAD.LOADING_HEARING_DATA]: false,
  [DOWNLOAD.ERROR]: List(),
  [DOWNLOAD.ALL_HEARING_DATA]: Set()
});

export default function downloadReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case downloadChargeLists.case(action.type): {
      return downloadChargeLists.reducer(state, action, {
        REQUEST: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, true),
        SUCCESS: () => state.set(DOWNLOAD.ERROR, List()),
        FAILURE: () => state.set(DOWNLOAD.ERROR, List([action.value.error])),
        FINALLY: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, false)
      });
    }

    case downloadHearingData.case(action.type): {
      return downloadHearingData.reducer(state, action, {
        REQUEST: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, true),
        SUCCESS: () => state.set(DOWNLOAD.ERROR, List()),
        FAILURE: () => state.set(DOWNLOAD.ERROR, List([action.value.error])),
        FINALLY: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, false)
      });
    }

    case downloadPSAsByHearingDate.case(action.type): {
      return downloadPSAsByHearingDate.reducer(state, action, {
        REQUEST: () => state
          .set(DOWNLOAD.DOWNLOADING_REPORTS, true)
          .set(DOWNLOAD.NO_RESULTS, action.value.noResults),
        SUCCESS: () => state
          .set(DOWNLOAD.ERROR, List())
          .set(DOWNLOAD.NO_RESULTS, action.value.noResults),
        FAILURE: () => state.set(DOWNLOAD.ERROR, List([action.value.error])),
        FINALLY: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, false)
      });
    }

    case downloadPsaForms.case(action.type): {
      return downloadPsaForms.reducer(state, action, {
        REQUEST: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, true),
        SUCCESS: () => state.set(DOWNLOAD.ERROR, List()),
        FAILURE: () => state.set(DOWNLOAD.ERROR, List([action.value.error])),
        FINALLY: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, false)
      });
    }

    case downloadReminderData.case(action.type): {
      return downloadReminderData.reducer(state, action, {
        REQUEST: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, true),
        SUCCESS: () => state.set(DOWNLOAD.ERROR, List()),
        FAILURE: () => state.set(DOWNLOAD.ERROR, List([action.value.error])),
        FINALLY: () => state.set(DOWNLOAD.DOWNLOADING_REPORTS, false)
      });
    }

    case getDownloadFilters.case(action.type): {
      return getDownloadFilters.reducer(state, action, {
        REQUEST: () => state.set(DOWNLOAD.LOADING_HEARING_DATA, true),
        SUCCESS: () => state
          .set(DOWNLOAD.COURTROOM_OPTIONS, action.value.courtrooms)
          .set(DOWNLOAD.ALL_HEARING_DATA, action.value.allHearingData)
          .set(DOWNLOAD.COURTROOM_TIMES, action.value.courtTimeOptions)
          .set(DOWNLOAD.NO_RESULTS, action.value.noResults),
        FAILURE: () => state.set(DOWNLOAD.LOADING_HEARING_DATA, false),
        FINALLY: () => state.set(DOWNLOAD.LOADING_HEARING_DATA, false)
      });
    }

    default:
      return state;
  }
}
