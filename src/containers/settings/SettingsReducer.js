/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import {
  DELETE_RCM_CONDITION,
  INITIALIZE_SETTINGS,
  submitSettings,
  UPDATE_SETTING
} from './SettingsActions';
import { SWITCH_ORGANIZATION } from '../app/AppActionFactory';
import {
  CASE_CONTEXTS,
  CONTEXTS,
  defaultConditions,
  defaultMatrix,
  defaultLevels,
  MODULE,
  RCM,
  SETTINGS,
} from '../../utils/consts/AppSettingConsts';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { SETTINGS_ACTIONS, SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [SETTINGS_ACTIONS.SUBMIT_SETTINGS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [SETTINGS_ACTIONS.SUBMIT_SETTINGS]: Map()
  },
  [SETTINGS_DATA.APP_SETTINGS]: {
    [SETTINGS.ARRESTS_INTEGRATED]: false,
    [SETTINGS.COURT_CASES_INTEGRATED]: false,
    [SETTINGS.LOAD_CASES]: false,
    [SETTINGS.COURT_REMINDERS]: false,
    [SETTINGS.ENROLL_VOICE]: false,
    [SETTINGS.CASE_CONTEXTS]: {
      [CONTEXTS.BOOKING]: CASE_CONTEXTS.ARREST,
      [CONTEXTS.COURT]: CASE_CONTEXTS.BOOKING
    },
    [SETTINGS.CONTEXTS]: {
      [CONTEXTS.BOOKING]: true,
      [CONTEXTS.COURT]: false
    },
    [SETTINGS.MODULES]: {
      [MODULE.PSA]: true,
      [MODULE.PRETRIAL]: false
    },
    [SETTINGS.PREFERRED_COUNTY]: '',
    [SETTINGS.RCM]: {
      [RCM.CONDITIONS]: defaultConditions,
      [RCM.MATRIX]: defaultMatrix,
      [RCM.LEVELS]: defaultLevels
    }
  }

});

export default function courtReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case DELETE_RCM_CONDITION: {
      const { condition } = action.value;
      return state.deleteIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.RCM, RCM.CONDITIONS, condition]);
    }

    case submitSettings.case(action.type): {
      return submitSettings.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state.setIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, SETTINGS_ACTIONS.SUBMIT_SETTINGS], error)
            .setIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, action.id])
      });
    }

    case INITIALIZE_SETTINGS: {
      const { selectedOrganizationSettings } = action.value;
      const arrestsIntegrated = selectedOrganizationSettings.get(SETTINGS.ARRESTS_INTEGRATED, false);
      const courtCasesIntegrated = selectedOrganizationSettings.get(SETTINGS.COURT_CASES_INTEGRATED, false);
      const caseContexts = selectedOrganizationSettings.get(SETTINGS.CASE_CONTEXTS, Map());
      const contexts = selectedOrganizationSettings.get(SETTINGS.CONTEXTS, Map());
      const courtRemindersEnabled = selectedOrganizationSettings.get(SETTINGS.COURT_REMINDERS, false);
      const enrollVoice = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);
      const loadCasesOnTheFly = selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
      const modules = selectedOrganizationSettings.get(SETTINGS.MODULES, Map());
      const preferredCountyEntityKeyId = selectedOrganizationSettings.get(SETTINGS.PREFERRED_COUNTY, '');
      const rcm = selectedOrganizationSettings.get(SETTINGS.RCM, Map());
      return state
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.ARRESTS_INTEGRATED], arrestsIntegrated)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.COURT_CASES_INTEGRATED], courtCasesIntegrated)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.CASE_CONTEXTS], caseContexts)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.CONTEXTS], contexts)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.COURT_REMINDERS], courtRemindersEnabled)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.ENROLL_VOICE], enrollVoice)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.LOAD_CASES], loadCasesOnTheFly)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.MODULES], modules)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.PREFERRED_COUNTY], preferredCountyEntityKeyId)
        .setIn([SETTINGS_DATA.APP_SETTINGS, SETTINGS.RCM], rcm)
        .setIn([REDUX.ACTIONS, SETTINGS_ACTIONS.SUBMIT_SETTINGS, REDUX.REQUEST_STATE], STANDBY);
    }

    case UPDATE_SETTING: {
      const { path, value } = action.value;
      path.unshift(SETTINGS_DATA.APP_SETTINGS);
      return value ? state.setIn(path, value) : state;
    }

    case SWITCH_ORGANIZATION: {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}
