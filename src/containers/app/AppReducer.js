/*
 * @flow
 */

import { Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';

import { APP_TYPES_FQNS } from '../../utils/consts/Consts';
import { APP } from '../../utils/consts/FrontEndStateConsts';
import {
  loadApp,
  SWITCH_ORGANIZATION
} from './AppActionFactory';

const { FullyQualifiedName } = Models;

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST,
  APP_SETTINGS
} = APP_TYPES_FQNS;

const arrestChargeListFqn :string = ARREST_CHARGE_LIST.toString();
const courtChargeListFqn :string = COURT_CHARGE_LIST.toString();
const appSettingsFqn :string = APP_SETTINGS.toString();

const APP_CONFIG_INITIAL_STATE :Map<*, *> = fromJS({
  [APP.ENTITY_SETS_BY_ORG]: Map(),
  [APP.PRIMARY_KEYS]: List(),
  [APP.PROPERTY_TYPES]: Map(),
});

const INITIAL_STATE :Map<*, *> = fromJS({
  [arrestChargeListFqn]: APP_CONFIG_INITIAL_STATE,
  [courtChargeListFqn]: APP_CONFIG_INITIAL_STATE,
  [appSettingsFqn]: APP_CONFIG_INITIAL_STATE,
  [APP.ACTIONS]: {
    [APP.LOAD_APP]: Map(),
  },
  [APP.APP]: Map(),
  [APP.APP_TYPES]: Map(),
  [APP.ERRORS]: {
    [APP.LOAD_APP]: Map(),
  },
  [APP.LOADING]: true,
  [APP.ORGS]: Map(),
  [APP.SELECTED_ORG_ID]: '',
  [APP.SELECTED_ORG_TITLE]: '',
});

const getEntityTypePropertyTypes = (edm :Object, entityTypeId :string) :Object => {
  const propertyTypesMap :Object = {};
  edm.entityTypes[entityTypeId].properties.forEach((propertyTypeId :string) => {
    propertyTypesMap[propertyTypeId] = edm.propertyTypes[propertyTypeId];
  });
  return propertyTypesMap;
};

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {

  switch (action.type) {

    case SWITCH_ORGANIZATION: {
      return state
        .set(APP.SELECTED_ORG_ID, action.org.orgId)
        .set(APP.SELECTED_ORG_TITLE, action.org.title);
    }

    case loadApp.case(action.type): {
      return loadApp.reducer(state, action, {
        REQUEST: () => state
          .set(APP.LOADING, true)
          .set(APP.SELECTED_ORG_ID, '')
          .setIn([APP.ACTIONS, APP.LOAD_APP, action.id], fromJS(action)),
        SUCCESS: () => {

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
            appTypes,
            edm
          } = value;
          const organizations :Object = {};

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const orgId :string = organization.id;
            if (fromJS(appConfig.config).size) {
              organizations[orgId] = organization;
              const arrestChargeListConfig = appConfig.config[arrestChargeListFqn];
              const courtChargeListConfig = appConfig.config[courtChargeListFqn];
              const appSettingsConfig = appConfig.config[appSettingsFqn];
              newState = newState
                .setIn([arrestChargeListFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestChargeListConfig.entitySetId)
                .setIn([courtChargeListFqn, APP.ENTITY_SETS_BY_ORG, orgId], courtChargeListConfig.entitySetId)
                .setIn([appSettingsFqn, APP.ENTITY_SETS_BY_ORG, orgId], appSettingsConfig.entitySetId);
            }
          });

          let selectedOrganizationId :string = '';
          let selectedOrganizationTitle :string = '';
          if (organizations.length && !selectedOrganizationId.length) {
            selectedOrganizationId = organizations[0].organization.id;
            selectedOrganizationTitle = organizations[0].organization.title;
          }
          const storedOrganizationId :?string = AccountUtils.retrieveOrganizationId();
          if (storedOrganizationId) {
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

          return newState
            .set(APP.APP, app)
            .set(APP.ORGS, fromJS(organizations))
            .set(APP.SELECTED_ORG_ID, selectedOrganizationId)
            .set(APP.SELECTED_ORG_TITLE, selectedOrganizationTitle);
        },
        FAILURE: () => {
          const error = {};
          return state
            .setIn([arrestChargeListFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestChargeListFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestChargeListFqn, APP.PROPERTY_TYPES], Map())
            .setIn([courtChargeListFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([courtChargeListFqn, APP.PRIMARY_KEYS], List())
            .setIn([courtChargeListFqn, APP.PROPERTY_TYPES], Map())
            .setIn([appSettingsFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([appSettingsFqn, APP.PRIMARY_KEYS], List())
            .setIn([appSettingsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([APP.ERRORS, APP.LOAD_APP], fromJS(error))
            .set(APP.ORGS, Map())
            .set(APP.SELECTED_ORG_ID, '')
            .set(APP.SELECTED_ORG_TITLE, '');
        },
        FINALLY: () => state
          .set(APP.LOADING, false)
          .deleteIn([APP.ACTIONS, APP.LOAD_APP, action.id])
      });
    }

    default:
      return state;
  }
}
