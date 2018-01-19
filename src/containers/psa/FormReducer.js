/*
 * @flow
 */

import Immutable from 'immutable';

import * as FormActionTypes from './FormActionTypes';
import { SEARCH_PEOPLE_REQUEST } from '../person/PersonActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  PRETRIAL_CASES,
  CHARGES
} = ENTITY_SETS;

const {
  CHARGE_ID_FQN,
  CASE_ID_FQN
} = PROPERTY_TYPES;

const EMPTY_DATA_MODEL = {
  entitySet: {},
  syncId: '',
  entityType: {},
  propertyTypes: []
};

const INITIAL_STATE :Map<> = Immutable.Map().withMutations((map :Map<>) => {
  map.set('personDataModel', EMPTY_DATA_MODEL);
  map.set('pretrialCaseDataModel', EMPTY_DATA_MODEL);
  map.set('riskFactorsDataModel', EMPTY_DATA_MODEL);
  map.set('psaDataModel', EMPTY_DATA_MODEL);
  map.set('releaseRecommendationDataModel', EMPTY_DATA_MODEL);
  map.set('calculatedForDataModel', EMPTY_DATA_MODEL);
  map.set('peopleOptions', []);
  map.set('pretrialCaseOptions', []);
  map.set('allChargesForPerson', []);
  map.set('charges', []);
  map.set('selectedPerson', {});
  map.set('selectedPretrialCase', {});
});

function formReducer(state :Map<> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case FormActionTypes.LOAD_PERSON_DATA_MODEL_SUCCESS:
      return state.set('personDataModel', action.dataModel);

    case FormActionTypes.LOAD_PRETRIAL_DATA_MODEL_SUCCESS:
      return state.set('pretrialCaseDataModel', action.dataModel);

    case FormActionTypes.LOAD_RISK_FACTORS_DATA_MODEL_SUCCESS:
      return state.set('riskFactorsDataModel', action.dataModel);

    case FormActionTypes.LOAD_PSA_DATA_MODEL_SUCCESS:
      return state.set('psaDataModel', action.dataModel);

    case FormActionTypes.LOAD_RELEASE_RECOMMENDATION_DATA_MODEL_SUCCESS:
      return state.set('releaseRecommendationDataModel', action.dataModel);

    case FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_SUCCESS:
      return state.set('calculatedForDataModel', action.dataModel);

    case SEARCH_PEOPLE_REQUEST:
      return state.set('peopleOptions', []).set('pretrialCaseOptions', []);

    case FormActionTypes.SEARCH_PEOPLE_SUCCESS:
      return state.set('peopleOptions', action.people);

    case FormActionTypes.LOAD_NEIGHBORS_SUCCESS: {
      const pretrialCaseOptions = [];
      const allChargesForPerson = []
      const neighbors = action.neighbors || [];
      neighbors.forEach((neighbor) => {
        const entitySet = neighbor.neighborEntitySet;
        if (entitySet && entitySet.name === PRETRIAL_CASES) {
          pretrialCaseOptions.push(Object.assign({}, neighbor.neighborDetails, { id: neighbor.neighborId }));
        }
        else if (entitySet && entitySet.name === CHARGES) {
          allChargesForPerson.push(Object.assign({}, neighbor.neighborDetails, { id: neighbor.neighborId }));
        }
      });
      return state.set('pretrialCaseOptions', pretrialCaseOptions).set('allChargesForPerson', allChargesForPerson);
    }

    case FormActionTypes.SELECT_PERSON:
      return state.set('selectedPerson', action.selectedPerson);

    case FormActionTypes.SELECT_PRETRIAL: {
      const getCaseAndChargeNum :Function = (charge) => {
        if (!charge || !charge[CHARGE_ID_FQN] || !charge[CHARGE_ID_FQN].length) return [];
        return charge[CHARGE_ID_FQN][0].split('|');
      };
      const selectedCaseIdArr = action.selectedPretrialCase[CASE_ID_FQN] || [];
      const charges = state.get('allChargesForPerson')
        .filter(charge => getCaseAndChargeNum(charge)[0] === selectedCaseIdArr[0])
        .sort((c1, c2) => getCaseAndChargeNum(c1)[1] > getCaseAndChargeNum(c2)[1]);
      return state
        .set('selectedPretrialCase', action.selectedPretrialCase)
        .set('charges', charges);
    }

    case FormActionTypes.CLEAR_FORM: {
      return state
        .set('peopleOptions', [])
        .set('pretrialCaseOptions', [])
        .set('allChargesForPerson', [])
        .set('selectedPerson', {})
        .set('selectedPretrialCase', {})
        .set('charges', []);
    }

    default:
      return state;
  }
}

export default formReducer;
