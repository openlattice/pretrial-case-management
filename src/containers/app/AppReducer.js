/*
 * @flow
 */

import { Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';
import { RequestStates } from 'redux-reqseq';

import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { APP_ACTIONS, APP_DATA } from '../../utils/consts/redux/AppConsts';
import { getStaffEKIDs } from '../people/PeopleActions';
import {
  loadApp,
  SWITCH_ORGANIZATION
} from './AppActionFactory';

const { FullyQualifiedName } = Models;

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
  [APP_DATA.DATA_MODEL]: Map(),
  [APP_DATA.ENTITY_SETS_BY_ORG]: Map(),
  [APP_DATA.FQN_TO_ID]: Map(),
  [APP_DATA.ORGS]: Map(),
  [APP_DATA.SELECTED_ORG_ID]: '',
  [APP_DATA.SELECTED_ORG_SETTINGS]: Map(),
  [APP_DATA.SELECTED_ORG_TITLE]: '',
  [APP_DATA.SETTINGS_BY_ORG_ID]: Map(),
  [APP_DATA.STAFF_IDS_TO_EKIDS]: Map(),
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
        .set(APP_DATA.SELECTED_ORG_ID, action.org.orgId)
        .set(APP_DATA.SELECTED_ORG_SETTINGS, action.org.settings)
        .set(APP_DATA.SELECTED_ORG_TITLE, action.org.title);
    }

    case loadApp.case(action.type): {
      return loadApp.reducer(state, action, {
        REQUEST: () => state
          .set(APP_DATA.SELECTED_ORG_ID, '')
          .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, APP_ACTIONS.LOAD_APP, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { value } = action;
          const {
            app,
            appConfigs,
            appSettingsByOrgId,
            appTypes,
            edm
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

          appTypes.forEach((appType :Object) => {
            const appTypeFqn :string = FullyQualifiedName.toString(appType.type.namespace, appType.type.name);
            const propertyTypes = getEntityTypePropertyTypes(edm, appType.entityTypeId);
            const primaryKeys = edm.entityTypes[appType.entityTypeId].key;
            newState = newState
              .setIn([appTypeFqn, APP_DATA.PROPERTY_TYPES], fromJS(propertyTypes))
              .setIn([appTypeFqn, APP_DATA.PRIMARY_KEYS], fromJS(primaryKeys));
          });

          const appSettings = appSettingsByOrgId.get(selectedOrganizationId, Map());

          newState = newState
            .set(APP_DATA.APP, app)
            .set(APP_DATA.DATA_MODEL, edm)
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
          let newState = Map();
          Object.values(APP_TYPES_FQNS).forEach((fqn) => {
            const fqnString = fqn.toString();
            newState = newState
              .setIn([fqnString, APP_DATA.ENTITY_SETS_BY_ORG], Map())
              .setIn([fqnString, APP_DATA.PRIMARY_KEYS], List())
              .setIn([fqnString, APP_DATA.PROPERTY_TYPES], Map());
          });
          if (!error) error = { loadApp: '' };
          return newState
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

    default:
      return state;
  }
}
