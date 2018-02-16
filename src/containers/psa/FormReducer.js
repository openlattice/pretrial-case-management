/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import * as FormActionTypes from './FormActionTypes';
import { SEARCH_PEOPLE_REQUEST } from '../person/PersonActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA } from '../../utils/consts/Consts'

const {
  PRETRIAL_CASES,
  CHARGES
} = ENTITY_SETS;

const {
  CHARGE_ID_FQN,
  CASE_ID_FQN,
  ARREST_DATE_FQN
} = PROPERTY_TYPES;

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

const INITIAL_PSA_FORM = Immutable.fromJS({
  [AGE_AT_CURRENT_ARREST]: null,
  [CURRENT_VIOLENT_OFFENSE]: null,
  [PENDING_CHARGE]: null,
  [PRIOR_MISDEMEANOR]: null,
  [PRIOR_FELONY]: null,
  [PRIOR_VIOLENT_CONVICTION]: null,
  [PRIOR_FAILURE_TO_APPEAR_RECENT]: null,
  [PRIOR_FAILURE_TO_APPEAR_OLD]: null,
  [PRIOR_SENTENCE_TO_INCARCERATION]: null
});


const EMPTY_DATA_MODEL = {
  entitySet: {},
  syncId: '',
  entityType: {},
  propertyTypes: []
};

const INITIAL_STATE :Map<> = Immutable.fromJS({
  personDataModel: EMPTY_DATA_MODEL,
  pretrialCaseDataModel: EMPTY_DATA_MODEL,
  riskFactorsDataModel: EMPTY_DATA_MODEL,
  psaDataModel: EMPTY_DATA_MODEL,
  releaseRecommendationDataModel: EMPTY_DATA_MODEL,
  staffDataModel: EMPTY_DATA_MODEL,
  calculatedForDataModel: EMPTY_DATA_MODEL,
  assessedByDataModel: EMPTY_DATA_MODEL,
  peopleOptions: [],
  pretrialCaseOptions: [],
  allChargesForPerson: [],
  charges: [],
  selectedPerson: {},
  selectedPretrialCase: {},
  psa: INITIAL_PSA_FORM
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

    case FormActionTypes.LOAD_STAFF_DATA_MODEL_SUCCESS:
      return state.set('staffDataModel', action.dataModel);

    case FormActionTypes.LOAD_CALCULATED_FOR_DATA_MODEL_SUCCESS:
      return state.set('calculatedForDataModel', action.dataModel);

    case FormActionTypes.LOAD_ASSESSED_BY_DATA_MODEL_SUCCESS:
      return state.set('assessedByDataModel', action.dataModel);

    case SEARCH_PEOPLE_REQUEST:
      return state.set('peopleOptions', []).set('pretrialCaseOptions', []);

    case FormActionTypes.SEARCH_PEOPLE_SUCCESS:
      return state.set('peopleOptions', action.people);

    case FormActionTypes.LOAD_NEIGHBORS_SUCCESS: {
      const pretrialCaseOptionsWithDate = [];
      const pretrialCaseOptionsWithoutDate = [];
      const allChargesForPerson = []
      const neighbors = action.neighbors || [];
      neighbors.forEach((neighbor) => {
        const entitySet = neighbor.neighborEntitySet;
        if (entitySet && entitySet.name === PRETRIAL_CASES) {
          const caseObj = Object.assign({}, neighbor.neighborDetails, { id: neighbor.neighborId });
          const arrList = caseObj[ARREST_DATE_FQN];
          if (arrList && arrList.length) {
            pretrialCaseOptionsWithDate.push(caseObj);
          }
          else {
            pretrialCaseOptionsWithoutDate.push(caseObj);
          }
        }
        else if (entitySet && entitySet.name === CHARGES) {
          allChargesForPerson.push(Object.assign({}, neighbor.neighborDetails, { id: neighbor.neighborId }));
        }
      });

      pretrialCaseOptionsWithDate.sort((case1, case2) => {
        const arr1 = moment(case1[ARREST_DATE_FQN][0]);
        const arr2 = moment(case2[ARREST_DATE_FQN][0]);
        if (arr1.isValid && arr2.isValid) {
          if (arr1.isBefore(arr2)) return 1;
          if (arr1.isAfter(arr2)) return -1;
          return 0;
        }
      });
      return state
        .set('pretrialCaseOptions', pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate))
        .set('allChargesForPerson', allChargesForPerson);
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

    case FormActionTypes.SET_PSA_VALUES: {
      let psa = state.get('psa').merge(action.values);
      if (psa.get(PRIOR_MISDEMEANOR) === 'false' && psa.get(PRIOR_FELONY) === 'false') {
        psa = psa.set(PRIOR_VIOLENT_CONVICTION, '0').set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
      }
      return state.set('psa', psa);
    }

    case FormActionTypes.CLEAR_FORM:
      return state
        .set('peopleOptions', [])
        .set('pretrialCaseOptions', [])
        .set('allChargesForPerson', [])
        .set('selectedPerson', {})
        .set('selectedPretrialCase', {})
        .set('charges', [])
        .set('psa', INITIAL_PSA_FORM);

    default:
      return state;
  }
}

export default formReducer;
