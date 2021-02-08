/*
 * @flow
 */
import { Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';
import { RequestStates } from 'redux-reqseq';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { APP_ACTIONS, APP_DATA } from '../../utils/consts/redux/AppConsts';
import { getStaffEKIDs } from '../people/PeopleActions';
import { submitSettings } from '../settings/SettingsActions';
import {
  loadApp,
  SWITCH_ORGANIZATION
} from './AppActionFactory';

const { APP_DETAILS, ENTITY_KEY_ID } = PROPERTY_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [APP_ACTIONS.LOAD_APP]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [APP_ACTIONS.LOAD_APP]: Map(),
  },
  [APP_DATA.APP]: Map(),
  [APP_DATA.ENTITY_SETS_BY_ORG]: Map(),
  [APP_DATA.FQN_TO_ID]: Map(),
  [APP_DATA.ORGS]: Map(),
  [APP_DATA.SELECTED_ORG_ID]: '',
  [APP_DATA.SELECTED_ORG_SETTINGS]: Map(),
  [APP_DATA.SELECTED_ORG_TITLE]: '',
  [APP_DATA.SETTINGS_BY_ORG_ID]: Map(),
  [APP_DATA.STAFF_IDS_TO_EKIDS]: Map(),
});

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return state
        .set(APP_DATA.SELECTED_ORG_ID, action.org.orgId)
        .set(APP_DATA.SELECTED_ORG_SETTINGS, action.org.settings)
        .set(APP_DATA.SELECTED_ORG_TITLE, action.org.title);
    }

    case loadApp.case(action.type): {
      return loadApp.reducer(state, action, {
        REQUEST: () => state
          .set(APP_DATA.SELECTED_ORG_ID, '')
          .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, action.id], action)
          .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { value } = action;
          const {
            app,
            appConfigs,
            appSettingsByOrgId
          } = value;
          let newState :Map<*, *> = state;
          let entitySetsByOrgId :Map<*, *> = Map();
          let fqnToIdMap :Map<*, *> = Map();

          if (!state.hasIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, action.id])) {
            return state;
          }

          if (value === null || value === undefined) {
            return state;
          }

          const organizations :Object = {};

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const orgId :string = organization.id;
            if (fromJS(appConfig.config).size) {
              organizations[orgId] = organization;
              if (fromJS(appConfig.config).size) {
                organizations[orgId] = organization;
                Object.values(APP_TYPES_FQNS).forEach((fqn) => {
                  const fqnString = fqn.toString();
                  newState = newState.setIn(
                    [fqnString, APP_DATA.ENTITY_SETS_BY_ORG, orgId],
                    appConfig.config[fqnString].entitySetId
                  );
                  fqnToIdMap = fqnToIdMap.set(
                    orgId,
                    fqnToIdMap.get(orgId, Map()).set(fqnString, appConfig.config[fqnString].entitySetId)
                  );
                  entitySetsByOrgId = entitySetsByOrgId.set(
                    orgId,
                    entitySetsByOrgId.get(orgId, Map()).set(appConfig.config[fqnString].entitySetId, fqnString)
                  );
                });
              }
            }

          });
          let selectedOrganizationId :string = '';
          let selectedOrganizationTitle :string = '';
          if (fromJS(organizations).size && !selectedOrganizationId.length) {
            selectedOrganizationId = fromJS(organizations).valueSeq().getIn([0, 'id'], '');
            selectedOrganizationTitle = fromJS(organizations).valueSeq().getIn([0, 'title'], '');
          }
          const storedOrganizationId :?string = AccountUtils.retrieveOrganizationId();
          if (storedOrganizationId && organizations[storedOrganizationId]) {
            selectedOrganizationId = storedOrganizationId;
            selectedOrganizationTitle = organizations[selectedOrganizationId].title;
          }

          const appSettings = appSettingsByOrgId.get(selectedOrganizationId, Map());

          newState = newState
            .set(APP_DATA.APP, app)
            .set(APP_DATA.ENTITY_SETS_BY_ORG, entitySetsByOrgId)
            .set(APP_DATA.FQN_TO_ID, fqnToIdMap)
            .set(APP_DATA.ORGS, fromJS(organizations))
            .set(APP_DATA.SELECTED_ORG_ID, selectedOrganizationId)
            .set(APP_DATA.SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .set(APP_DATA.SETTINGS_BY_ORG_ID, appSettingsByOrgId)
            .set(APP_DATA.SELECTED_ORG_SETTINGS, appSettings)
            .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, REDUX.REQUEST_STATE], SUCCESS);
          return newState;
        },
        FAILURE: () => {
          let { error } = action.value;
          const { defaultSettings } = action.value;
          if (!error) error = { loadApp: '' };
          return state
            .set(APP_DATA.ENTITY_SETS_BY_ORG, Map())
            .set(APP_DATA.FQN_TO_ID, Map())
            .set(APP_DATA.ORGS, Map())
            .set(APP_DATA.SELECTED_ORG_ID, '')
            .set(APP_DATA.SELECTED_ORG_TITLE, '')
            .set(APP_DATA.SELECTED_ORG_SETTINGS, fromJS(defaultSettings))
            .setIn([REDUX.ERRORS, APP_ACTIONS.LOAD_APP], error)
            .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, action.id])
      });
    }

    case getStaffEKIDs.case(action.type): {
      return getStaffEKIDs.reducer(state, action, {
        SUCCESS: () => state.set(APP_DATA.STAFF_IDS_TO_EKIDS, action.value)
      });
    }

    case submitSettings.case(action.type): {
      return submitSettings.reducer(state, action, {
        SUCCESS: () => {
          const { orgId, submittedSettings } = action.value;
          const {
            [APP_DETAILS]: unparsedAppSettings,
            [ENTITY_KEY_ID]: settingsEKID
          } = getEntityProperties(submittedSettings, [APP_DETAILS, ENTITY_KEY_ID]);
          let appSettings = fromJS(JSON.parse(unparsedAppSettings));
          appSettings = appSettings.set(ENTITY_KEY_ID, settingsEKID);
          return state
            .setIn([APP_DATA.SETTINGS_BY_ORG_ID, orgId], appSettings)
            .set(APP_DATA.SELECTED_ORG_SETTINGS, appSettings);
        }
      });
    }

    default:
      return state;
  }
}
