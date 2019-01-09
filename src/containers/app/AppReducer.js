/*
 * @flow
 */

import { Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';
import { AccountUtils } from 'lattice-auth';

import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import { APP } from '../../utils/consts/FrontEndStateConsts';
import {
  loadApp,
  SWITCH_ORGANIZATION
} from './AppActionFactory';

const { FullyQualifiedName } = Models;

const {
  ARREST_CHARGE_LIST,
  APP_SETTINGS,
  ADDRESSES,
  APPEARS_IN,
  ARREST_APPEARS_IN,
  ARREST_CHARGED_WITH,
  ARREST_CHARGES,
  ARREST_CASES,
  ASSESSED_BY,
  BONDS,
  CALCULATED_FOR,
  CHARGED_WITH,
  CHARGES,
  CONTACT_INFO_GIVEN,
  CONTACT_INFORMATION,
  COURT_CHARGE_LIST,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  EDITED_BY,
  FTAS,
  HEARINGS,
  JUDGES,
  LIVES_AT,
  MANUAL_CHARGES,
  MANUAL_PRETRIAL_CASES,
  OUTCOMES,
  PEOPLE,
  PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  REGISTERED_FOR,
  RELEASE_CONDITIONS,
  RELEASE_RECOMMENDATIONS,
  SENTENCES,
  SPEAKER_RECOGNITION_PROFILES,
  STAFF,
  UJS_EMPLOYEES,
} = APP_TYPES_FQNS;

const arrestChargeListFqn :string = ARREST_CHARGE_LIST.toString();
const courtChargeListFqn :string = COURT_CHARGE_LIST.toString();
const appSettingsFqn :string = APP_SETTINGS.toString();
const addressesFqn :string = ADDRESSES.toString();
const appearsInFqn :string = APPEARS_IN.toString();
const arrestAppearsInFqn :string = ARREST_APPEARS_IN.toString();
const arrestChargedwithFqn :string = ARREST_CHARGED_WITH.toString();
const arrestChargesFqn :string = ARREST_CHARGES.toString();
const arrestCasesFqn :string = ARREST_CASES.toString();
const assessedByFqn :string = ASSESSED_BY.toString();
const bondsFqn :string = BONDS.toString();
const calculatedForFqn :string = CALCULATED_FOR.toString();
const chargedWithFqn :string = CHARGED_WITH.toString();
const chargesFqn :string = CHARGES.toString();
const contactInfoGivenFqn :string = CONTACT_INFO_GIVEN.toString();
const contactInformationFqn :string = CONTACT_INFORMATION.toString();
const dmfResultsFqn :string = DMF_RESULTS.toString();
const dmfRiskFactorsFqn :string = DMF_RISK_FACTORS.toString();
const editedByFqn :string = EDITED_BY.toString();
const ftaFqn :string = FTAS.toString();
const hearingsFqn :string = HEARINGS.toString();
const judgesFqn :string = JUDGES.toString();
const livesAtFqn :string = LIVES_AT.toString();
const manualChargesFqn :string = MANUAL_CHARGES.toString();
const manualPretrialCasesFqn :string = MANUAL_PRETRIAL_CASES.toString();
const outcomesFqn :string = OUTCOMES.toString();
const peopleFqn :string = PEOPLE.toString();
const pretrialCasesFqn :string = PRETRIAL_CASES.toString();
const psaRiskFactorsFqn :string = PSA_RISK_FACTORS.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const registeredForFqn :string = REGISTERED_FOR.toString();
const releaseConditionsFqn :string = RELEASE_CONDITIONS.toString();
const releaseRecommendationsFqn :string = RELEASE_RECOMMENDATIONS.toString();
const sentencesFqn :string = SENTENCES.toString();
const speakerRecognitionFqn :string = SPEAKER_RECOGNITION_PROFILES.toString();
const staffFqn :string = STAFF.toString();
const ujsEmployeesFqn :string = UJS_EMPLOYEES.toString();

const APP_CONFIG_INITIAL_STATE :Map<*, *> = fromJS({
  [APP.ENTITY_SETS_BY_ORG]: Map(),
  [APP.PRIMARY_KEYS]: List(),
  [APP.PROPERTY_TYPES]: Map(),
});

const INITIAL_STATE :Map<*, *> = fromJS({
  [arrestChargeListFqn]: APP_CONFIG_INITIAL_STATE,
  [courtChargeListFqn]: APP_CONFIG_INITIAL_STATE,
  [appSettingsFqn]: APP_CONFIG_INITIAL_STATE,
  [APP.ENTITY_SETS_BY_ORG]: Map(),
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
  [APP.APP_SETTINGS_ID]: '',
  [APP.SETTINGS_BY_ORG_ID]: Map(),
  [APP.SELECTED_ORG_SETTINGS]: Map()
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
              const arrestChargeListConfig = appConfig.config[arrestChargeListFqn];
              const courtChargeListConfig = appConfig.config[courtChargeListFqn];
              const appSettingsConfig = appConfig.config[appSettingsFqn];
              const addressesConfig = appConfig.config[addressesFqn];
              const appearsInConfig = appConfig.config[appearsInFqn];
              const arrestAppearsInConfig = appConfig.config[arrestAppearsInFqn];
              const arrestChargedwithConfig = appConfig.config[arrestChargedwithFqn];
              const arrestChargesConfig = appConfig.config[arrestChargesFqn];
              const arrestCasesConfig = appConfig.config[arrestCasesFqn];
              const assessedByConfig = appConfig.config[assessedByFqn];
              const bondsConfig = appConfig.config[bondsFqn];
              const calculatedForConfig = appConfig.config[calculatedForFqn];
              const chargedWithConfig = appConfig.config[chargedWithFqn];
              const chargesConfig = appConfig.config[chargesFqn];
              const contactInfoGivenConfig = appConfig.config[contactInfoGivenFqn];
              const contactInformationConfig = appConfig.config[contactInformationFqn];
              const dmfResultsConfig = appConfig.config[dmfResultsFqn];
              const dmfRiskFactorsConfig = appConfig.config[dmfRiskFactorsFqn];
              const editedByConfig = appConfig.config[editedByFqn];
              const ftaConfig = appConfig.config[ftaFqn];
              const hearingsConfig = appConfig.config[hearingsFqn];
              const judgesConfig = appConfig.config[judgesFqn];
              const livesAtConfig = appConfig.config[livesAtFqn];
              const manualChargesConfig = appConfig.config[manualChargesFqn];
              const manualPretrialCasesConfig = appConfig.config[manualPretrialCasesFqn];
              const outcomesConfig = appConfig.config[outcomesFqn];
              const peopleConfig = appConfig.config[peopleFqn];
              const pretrialCasesConfig = appConfig.config[pretrialCasesFqn];
              const psaRiskFactorsConfig = appConfig.config[psaRiskFactorsFqn];
              const psaScoresConfig = appConfig.config[psaScoresFqn];
              const registeredForConfig = appConfig.config[registeredForFqn];
              const releaseConditionsConfig = appConfig.config[releaseConditionsFqn];
              const releaseRecommendationsConfig = appConfig.config[releaseRecommendationsFqn];
              const sentencesConfig = appConfig.config[sentencesFqn];
              const speakerRecognitionConfig = appConfig.config[speakerRecognitionFqn];
              const staffConfig = appConfig.config[staffFqn];
              const ujsEmployeesConfig = appConfig.config[ujsEmployeesFqn];

              newState = newState
                .setIn([arrestChargeListFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestChargeListConfig.entitySetId)
                .setIn([courtChargeListFqn, APP.ENTITY_SETS_BY_ORG, orgId], courtChargeListConfig.entitySetId)
                .setIn([appSettingsFqn, APP.ENTITY_SETS_BY_ORG, orgId], appSettingsConfig.entitySetId)
                .setIn([addressesFqn, APP.ENTITY_SETS_BY_ORG, orgId], addressesConfig.entitySetId)
                .setIn([appearsInFqn, APP.ENTITY_SETS_BY_ORG, orgId], appearsInConfig.entitySetId)
                .setIn([arrestAppearsInFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestAppearsInConfig.entitySetId)
                .setIn([arrestChargedwithFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestChargedwithConfig.entitySetId)
                .setIn([arrestChargesFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestChargesConfig.entitySetId)
                .setIn([arrestCasesFqn, APP.ENTITY_SETS_BY_ORG, orgId], arrestCasesConfig.entitySetId)
                .setIn([assessedByFqn, APP.ENTITY_SETS_BY_ORG, orgId], assessedByConfig.entitySetId)
                .setIn([bondsFqn, APP.ENTITY_SETS_BY_ORG, orgId], bondsConfig.entitySetId)
                .setIn([calculatedForFqn, APP.ENTITY_SETS_BY_ORG, orgId], calculatedForConfig.entitySetId)
                .setIn([chargedWithFqn, APP.ENTITY_SETS_BY_ORG, orgId], chargedWithConfig.entitySetId)
                .setIn([chargesFqn, APP.ENTITY_SETS_BY_ORG, orgId], chargesConfig.entitySetId)
                .setIn([contactInfoGivenFqn, APP.ENTITY_SETS_BY_ORG, orgId], contactInfoGivenConfig.entitySetId)
                .setIn([contactInformationFqn, APP.ENTITY_SETS_BY_ORG, orgId], contactInformationConfig.entitySetId)
                .setIn([dmfResultsFqn, APP.ENTITY_SETS_BY_ORG, orgId], dmfResultsConfig.entitySetId)
                .setIn([dmfRiskFactorsFqn, APP.ENTITY_SETS_BY_ORG, orgId], dmfRiskFactorsConfig.entitySetId)
                .setIn([editedByFqn, APP.ENTITY_SETS_BY_ORG, orgId], editedByConfig.entitySetId)
                .setIn([ftaFqn, APP.ENTITY_SETS_BY_ORG, orgId], ftaConfig.entitySetId)
                .setIn([hearingsFqn, APP.ENTITY_SETS_BY_ORG, orgId], hearingsConfig.entitySetId)
                .setIn([judgesFqn, APP.ENTITY_SETS_BY_ORG, orgId], judgesConfig.entitySetId)
                .setIn([livesAtFqn, APP.ENTITY_SETS_BY_ORG, orgId], livesAtConfig.entitySetId)
                .setIn([manualChargesFqn, APP.ENTITY_SETS_BY_ORG, orgId], manualChargesConfig.entitySetId)
                .setIn([manualPretrialCasesFqn, APP.ENTITY_SETS_BY_ORG, orgId], manualPretrialCasesConfig.entitySetId)
                .setIn([outcomesFqn, APP.ENTITY_SETS_BY_ORG, orgId], outcomesConfig.entitySetId)
                .setIn([peopleFqn, APP.ENTITY_SETS_BY_ORG, orgId], peopleConfig.entitySetId)
                .setIn([pretrialCasesFqn, APP.ENTITY_SETS_BY_ORG, orgId], pretrialCasesConfig.entitySetId)
                .setIn([psaRiskFactorsFqn, APP.ENTITY_SETS_BY_ORG, orgId], psaRiskFactorsConfig.entitySetId)
                .setIn([psaScoresFqn, APP.ENTITY_SETS_BY_ORG, orgId], psaScoresConfig.entitySetId)
                .setIn([registeredForFqn, APP.ENTITY_SETS_BY_ORG, orgId], registeredForConfig.entitySetId)
                .setIn([releaseConditionsFqn, APP.ENTITY_SETS_BY_ORG, orgId], releaseConditionsConfig.entitySetId)
                .setIn([releaseRecommendationsFqn, APP.ENTITY_SETS_BY_ORG, orgId], releaseRecommendationsConfig.entitySetId)
                .setIn([sentencesFqn, APP.ENTITY_SETS_BY_ORG, orgId], sentencesConfig.entitySetId)
                .setIn([speakerRecognitionFqn, APP.ENTITY_SETS_BY_ORG, orgId], speakerRecognitionConfig.entitySetId)
                .setIn([staffFqn, APP.ENTITY_SETS_BY_ORG, orgId], staffConfig.entitySetId)
                .setIn([ujsEmployeesFqn, APP.ENTITY_SETS_BY_ORG, orgId], ujsEmployeesConfig.entitySetId);
              entitySetsByOrgId = entitySetsByOrgId.set(
                orgId,
                entitySetsByOrgId.get(orgId, Map())
                  .set(arrestChargeListConfig.entitySetId, arrestChargeListFqn)
                  .set(courtChargeListConfig.entitySetId, courtChargeListFqn)
                  .set(appSettingsConfig.entitySetId, appSettingsFqn)
                  .set(addressesConfig.entitySetId, addressesFqn)
                  .set(appearsInConfig.entitySetId, appearsInFqn)
                  .set(arrestAppearsInConfig.entitySetId, arrestAppearsInFqn)
                  .set(arrestChargedwithConfig.entitySetId, arrestChargedwithFqn)
                  .set(arrestChargesConfig.entitySetId, arrestChargesFqn)
                  .set(arrestCasesConfig.entitySetId, arrestCasesFqn)
                  .set(assessedByConfig.entitySetId, assessedByFqn)
                  .set(bondsConfig.entitySetId, bondsFqn)
                  .set(calculatedForConfig.entitySetId, calculatedForFqn)
                  .set(chargedWithConfig.entitySetId, chargedWithFqn)
                  .set(chargesConfig.entitySetId, chargesFqn)
                  .set(contactInfoGivenConfig.entitySetId, contactInfoGivenFqn)
                  .set(contactInformationConfig.entitySetId, contactInformationFqn)
                  .set(dmfResultsConfig.entitySetId, dmfResultsFqn)
                  .set(dmfRiskFactorsConfig.entitySetId, dmfRiskFactorsFqn)
                  .set(editedByConfig.entitySetId, editedByFqn)
                  .set(ftaConfig.entitySetId, ftaFqn)
                  .set(hearingsConfig.entitySetId, hearingsFqn)
                  .set(judgesConfig.entitySetId, judgesFqn)
                  .set(livesAtConfig.entitySetId, livesAtFqn)
                  .set(manualChargesConfig.entitySetId, manualChargesFqn)
                  .set(manualPretrialCasesConfig.entitySetId, manualPretrialCasesFqn)
                  .set(outcomesConfig.entitySetId, outcomesFqn)
                  .set(peopleConfig.entitySetId, peopleFqn)
                  .set(pretrialCasesConfig.entitySetId, pretrialCasesFqn)
                  .set(psaRiskFactorsConfig.entitySetId, psaRiskFactorsFqn)
                  .set(psaScoresConfig.entitySetId, psaScoresFqn)
                  .set(registeredForConfig.entitySetId, registeredForFqn)
                  .set(releaseConditionsConfig.entitySetId, releaseConditionsFqn)
                  .set(releaseRecommendationsConfig.entitySetId, releaseRecommendationsFqn)
                  .set(sentencesConfig.entitySetId, sentencesFqn)
                  .set(speakerRecognitionConfig.entitySetId, speakerRecognitionFqn)
                  .set(staffConfig.entitySetId, staffFqn)
                  .set(ujsEmployeesConfig.entitySetId, ujsEmployeesFqn)
              );
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
            .set(APP.ORGS, fromJS(organizations))
            .set(APP.SELECTED_ORG_ID, selectedOrganizationId)
            .set(APP.SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .set(APP.SETTINGS_BY_ORG_ID, appSettingsByOrgId)
            .set(APP.SELECTED_ORG_SETTINGS, appSettings);
        },
        FAILURE: () => {
          const error = {};
          return state
            .set(APP.ENTITY_SETS_BY_ORG, Map())
            .setIn([arrestChargeListFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestChargeListFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestChargeListFqn, APP.PROPERTY_TYPES], Map())
            .setIn([courtChargeListFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([courtChargeListFqn, APP.PRIMARY_KEYS], List())
            .setIn([courtChargeListFqn, APP.PROPERTY_TYPES], Map())
            .setIn([addressesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([addressesFqn, APP.PRIMARY_KEYS], List())
            .setIn([addressesFqn, APP.PROPERTY_TYPES], List())
            .setIn([appearsInFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([appearsInFqn, APP.PRIMARY_KEYS], List())
            .setIn([appearsInFqn, APP.PROPERTY_TYPES], List())
            .setIn([arrestAppearsInFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestAppearsInFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestAppearsInFqn, APP.PROPERTY_TYPES], List())
            .setIn([arrestChargedwithFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestChargedwithFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestChargedwithFqn, APP.PROPERTY_TYPES], List())
            .setIn([arrestChargesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestChargesFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestChargesFqn, APP.PROPERTY_TYPES], List())
            .setIn([arrestCasesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([arrestCasesFqn, APP.PRIMARY_KEYS], List())
            .setIn([arrestCasesFqn, APP.PROPERTY_TYPES], List())
            .setIn([assessedByFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([assessedByFqn, APP.PRIMARY_KEYS], List())
            .setIn([assessedByFqn, APP.PROPERTY_TYPES], List())
            .setIn([bondsFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([bondsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([bondsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([calculatedForFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([calculatedForFqn, APP.PRIMARY_KEYS], Map())
            .setIn([calculatedForFqn, APP.PROPERTY_TYPES], Map())
            .setIn([chargedWithFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([chargedWithFqn, APP.PRIMARY_KEYS], List())
            .setIn([chargedWithFqn, APP.PROPERTY_TYPES], List())
            .setIn([chargesFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([chargesFqn, APP.PRIMARY_KEYS], Map())
            .setIn([chargesFqn, APP.PROPERTY_TYPES], Map())
            .setIn([contactInfoGivenFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([contactInfoGivenFqn, APP.PRIMARY_KEYS], Map())
            .setIn([contactInfoGivenFqn, APP.PROPERTY_TYPES], Map())
            .setIn([contactInformationFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([contactInformationFqn, APP.PRIMARY_KEYS], List())
            .setIn([contactInformationFqn, APP.PROPERTY_TYPES], List())
            .setIn([dmfResultsFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([dmfResultsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([dmfResultsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([dmfRiskFactorsFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([dmfRiskFactorsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([dmfRiskFactorsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([editedByFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([editedByFqn, APP.PRIMARY_KEYS], List())
            .setIn([editedByFqn, APP.PROPERTY_TYPES], List())
            .setIn([ftaFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([ftaFqn, APP.PRIMARY_KEYS], Map())
            .setIn([ftaFqn, APP.PROPERTY_TYPES], Map())
            .setIn([hearingsFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([hearingsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([hearingsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([judgesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([judgesFqn, APP.PRIMARY_KEYS], List())
            .setIn([judgesFqn, APP.PROPERTY_TYPES], List())
            .setIn([livesAtFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([livesAtFqn, APP.PRIMARY_KEYS], Map())
            .setIn([livesAtFqn, APP.PROPERTY_TYPES], Map())
            .setIn([manualChargesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([manualChargesFqn, APP.PRIMARY_KEYS], Map())
            .setIn([manualChargesFqn, APP.PROPERTY_TYPES], Map())
            .setIn([manualPretrialCasesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([manualPretrialCasesFqn, APP.PRIMARY_KEYS], List())
            .setIn([manualPretrialCasesFqn, APP.PROPERTY_TYPES], List())
            .setIn([outcomesFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([outcomesFqn, APP.PRIMARY_KEYS], Map())
            .setIn([outcomesFqn, APP.PROPERTY_TYPES], Map())
            .setIn([peopleFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([peopleFqn, APP.PRIMARY_KEYS], Map())
            .setIn([peopleFqn, APP.PROPERTY_TYPES], Map())
            .setIn([pretrialCasesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([pretrialCasesFqn, APP.PRIMARY_KEYS], List())
            .setIn([pretrialCasesFqn, APP.PROPERTY_TYPES], List())
            .setIn([psaRiskFactorsFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([psaRiskFactorsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([psaRiskFactorsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([psaScoresFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([psaScoresFqn, APP.PRIMARY_KEYS], Map())
            .setIn([psaScoresFqn, APP.PROPERTY_TYPES], Map())
            .setIn([registeredForFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([registeredForFqn, APP.PRIMARY_KEYS], List())
            .setIn([registeredForFqn, APP.PROPERTY_TYPES], List())
            .setIn([releaseConditionsFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([releaseConditionsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([releaseConditionsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([releaseRecommendationsFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([releaseRecommendationsFqn, APP.PRIMARY_KEYS], Map())
            .setIn([releaseRecommendationsFqn, APP.PROPERTY_TYPES], Map())
            .setIn([sentencesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([sentencesFqn, APP.PRIMARY_KEYS], List())
            .setIn([sentencesFqn, APP.PROPERTY_TYPES], List())
            .setIn([speakerRecognitionFqn, APP.ENTITY_SETS_BY_ORG], List())
            .setIn([speakerRecognitionFqn, APP.PRIMARY_KEYS], Map())
            .setIn([speakerRecognitionFqn, APP.PROPERTY_TYPES], Map())
            .setIn([staffFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([staffFqn, APP.PRIMARY_KEYS], Map())
            .setIn([staffFqn, APP.PROPERTY_TYPES], Map())
            .setIn([ujsEmployeesFqn, APP.ENTITY_SETS_BY_ORG], Map())
            .setIn([ujsEmployeesFqn, APP.PRIMARY_KEYS], List())
            .setIn([ujsEmployeesFqn, APP.PROPERTY_TYPES], List())
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
