/*
 * @flow
 */

import { Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';

import { APP_TYPES, APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import { APP } from '../../utils/consts/FrontEndStateConsts';
import { getStaffEKIDs } from '../people/PeopleActionFactory';
import {
  loadApp,
  SWITCH_ORGANIZATION
} from './AppActionFactory';

const { FullyQualifiedName } = Models;

const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST, APP_SETTINGS } = APP_TYPES;

const APP_CONFIG_INITIAL_STATE :Map<*, *> = fromJS({
  [APP.ENTITY_SETS_BY_ORG]: Map(),
  [APP.PRIMARY_KEYS]: List(),
  [APP.PROPERTY_TYPES]: Map(),
});

const INITIAL_STATE :Map<*, *> = fromJS({
  [ARREST_CHARGE_LIST]: APP_CONFIG_INITIAL_STATE,
  [COURT_CHARGE_LIST]: APP_CONFIG_INITIAL_STATE,
  [APP_SETTINGS]: APP_CONFIG_INITIAL_STATE,
  [APP.ENTITY_SETS_BY_ORG]: Map(),
  [APP.FQN_TO_ID]: Map(),
  [APP.ACTIONS]: {
    [APP.LOAD_APP]: Map(),
  },
  [APP.APP]: Map(),
  [APP.APP_TYPES]: Map(),
  [APP.ERRORS]: {
    [APP.LOAD_APP]: '',
  },
  [APP.LOADING]: true,
  [APP.ORGS]: Map(),
  [APP.SELECTED_ORG_ID]: '',
  [APP.SELECTED_ORG_TITLE]: '',
  [APP.APP_SETTINGS_ID]: '',
  [APP.SETTINGS_BY_ORG_ID]: Map(),
  [APP.SELECTED_ORG_SETTINGS]: Map(),
  [APP.STAFF_IDS_TO_EKIDS]: Map(),
});

const getEntityTypePropertyTypes = (edm :Object, entityTypeId :string) :Object => {
  const propertyTypesMap :Object = {};
  edm.entityTypes[entityTypeId].properties.forEach((propertyTypeId :string) => {
    propertyTypesMap[propertyTypeId] = edm.propertyTypes[propertyTypeId];
  });
  return propertyTypesMap;
};

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return state
        .set(APP.SELECTED_ORG_ID, action.org.orgId)
        .set(APP.SELECTED_ORG_SETTINGS, action.org.settings)
        .set(APP.SELECTED_ORG_TITLE, action.org.title);
    }

    case loadApp.case(action.type): {
      return loadApp.reducer(state, action, {
        REQUEST: () => state
          .set(APP.LOADING, true)
          .set(APP.SELECTED_ORG_ID, '')
          .setIn([APP.ACTIONS, APP.LOAD_APP, action.id], fromJS(action)),
        SUCCESS: () => {
          let entitySetsByOrgId = Map();
          let fqnToIdMap = Map();
          if (!state.hasIn([APP.ACTIONS, APP.LOAD_APP, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          let newState :Map<*, *> = state;
          const {
            app,
            appConfigs,
            appSettingsByOrgId,
            appTypes,
            edm
          } = value;
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
                    [fqnString, APP.ENTITY_SETS_BY_ORG, orgId],
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

          appTypes.forEach((appType :Object) => {
            const appTypeFqn :string = FullyQualifiedName.toString(appType.type.namespace, appType.type.name);
            const propertyTypes = getEntityTypePropertyTypes(edm, appType.entityTypeId);
            const primaryKeys = edm.entityTypes[appType.entityTypeId].key;
            newState = newState
              .setIn([appTypeFqn, APP.PROPERTY_TYPES], fromJS(propertyTypes))
              .setIn([appTypeFqn, APP.PRIMARY_KEYS], fromJS(primaryKeys));
          });

          const appSettings = appSettingsByOrgId.get(selectedOrganizationId, Map());

          return newState
            .set(APP.APP, app)
            .set(APP.ENTITY_SETS_BY_ORG, entitySetsByOrgId)
            .set(APP.FQN_TO_ID, fqnToIdMap)
            .set(APP.ORGS, fromJS(organizations))
            .set(APP.SELECTED_ORG_ID, selectedOrganizationId)
            .set(APP.SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .set(APP.SETTINGS_BY_ORG_ID, appSettingsByOrgId)
            .set(APP.SELECTED_ORG_SETTINGS, appSettings);
        },
        FAILURE: () => {
          let { error } = action.value;
          const { defaultSettings } = action.value;
          let newState = Map();
          Object.values(APP_TYPES_FQNS).forEach((fqn) => {
            const fqnString = fqn.toString();
            newState = newState
              .setIn([fqnString, APP.ENTITY_SETS_BY_ORG], Map())
              .setIn([fqnString, APP.PRIMARY_KEYS], List())
              .setIn([fqnString, APP.PROPERTY_TYPES], Map());
          });
          if (!error) error = { loadApp: '' };
          return newState
            .set(APP.ENTITY_SETS_BY_ORG, Map())
            .set(APP.FQN_TO_ID, Map())
            .setIn([APP.ERRORS, APP.LOAD_APP], fromJS(error))
            .set(APP.ORGS, Map())
            .set(APP.SELECTED_ORG_ID, '')
            .set(APP.SELECTED_ORG_TITLE, '')
            .set(APP.SELECTED_ORG_SETTINGS, fromJS(defaultSettings));
        },
        FINALLY: () => state
          .set(APP.LOADING, false)
          .deleteIn([APP.ACTIONS, APP.LOAD_APP, action.id])
      });
    }

    case getStaffEKIDs.case(action.type): {
      return getStaffEKIDs.reducer(state, action, {
        SUCCESS: () => state.set(APP.STAFF_IDS_TO_EKIDS, action.value)
      });
    }

    default:
      return state;
  }
}
