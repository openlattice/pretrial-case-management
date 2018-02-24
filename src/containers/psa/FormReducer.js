/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import {
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA } from '../../utils/consts/Consts';

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

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  pretrialCaseOptions: Immutable.List(),
  allChargesForPerson: Immutable.List(),
  charges: Immutable.List(),
  selectedPerson: Immutable.Map(),
  selectedPretrialCase: Immutable.Map(),
  psa: INITIAL_PSA_FORM,
  dataModel: Immutable.Map(),
  entitySetLookup: Immutable.Map()
});

function formReducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadDataModel.case(action.type): {
      return loadDataModel.reducer(state, action, {
        SUCCESS: () => {
          const { dataModel } = action.value;
          const entitySetLookup = {};
          Object.values(dataModel.entitySets).forEach((entitySet) => {
            entitySetLookup[entitySet.name] = entitySet.id;
          });
          return state
            .set('dataModel', Immutable.fromJS(dataModel))
            .set('entitySetLookup', Immutable.fromJS(entitySetLookup));
        }
      });
    }

    case loadNeighbors.case(action.type): {
      return loadNeighbors.reducer(state, action, {
        SUCCESS: () => {
          let pretrialCaseOptionsWithDate = Immutable.List();
          let pretrialCaseOptionsWithoutDate = Immutable.List();
          let allChargesForPerson = Immutable.List();

          const neighbors = Immutable.fromJS(action.value.neighbors) || Immutable.List();
          neighbors.forEach((neighbor) => {
            const entitySetName = neighbor.getIn(['neighborEntitySet', 'name'], '');
            const neighborObj = neighbor
              .get('neighborDetails', Immutable.Map())
              .set('id', neighbor.get('neighborId', ''));

            if (entitySetName === PRETRIAL_CASES) {
              const arrList = neighborObj.get(ARREST_DATE_FQN, Immutable.List());
              if (arrList.size) {
                pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.push(neighborObj);
              }
              else {
                pretrialCaseOptionsWithoutDate = pretrialCaseOptionsWithoutDate.push(neighborObj);
              }
            }
            else if (entitySetName === CHARGES) {
              allChargesForPerson = allChargesForPerson.push(neighborObj);
            }
          });

          pretrialCaseOptionsWithDate = pretrialCaseOptionsWithDate.sort((case1, case2) => {
            const arr1 = moment(case1.getIn([ARREST_DATE_FQN, 0], ''));
            const arr2 = moment(case2.getIn([ARREST_DATE_FQN, 0], ''));
            if (arr1.isValid && arr2.isValid) {
              if (arr1.isBefore(arr2)) return 1;
              if (arr1.isAfter(arr2)) return -1;
            }
            return 0;
          });

          return state
            .set('pretrialCaseOptions', pretrialCaseOptionsWithDate.concat(pretrialCaseOptionsWithoutDate))
            .set('allChargesForPerson', allChargesForPerson);
        }
      });
    }

    case SELECT_PERSON: return state.set('selectedPerson', action.value.selectedPerson);

    case SELECT_PRETRIAL_CASE: {
      const getCaseAndChargeNum :Function = (charge) => {
        const chargeVal = charge.getIn([CHARGE_ID_FQN, 0], Immutable.List());
        return chargeVal.size ? chargeVal.split('|') : [];
      };

      const { selectedPretrialCase } = action.value;

      const selectedCaseIdList = selectedPretrialCase.get(CASE_ID_FQN, Immutable.List());
      const charges = state.get('allChargesForPerson')
        .filter(charge => getCaseAndChargeNum(charge)[0] === selectedCaseIdList.get(0))
        .sort((c1, c2) => getCaseAndChargeNum(c1)[1] > getCaseAndChargeNum(c2)[1]);
      return state
        .set('selectedPretrialCase', selectedPretrialCase)
        .set('charges', charges);
    }

    case SET_PSA_VALUES: {
      let psa = state.get('psa').merge(action.value.newValues);
      if (psa.get(PRIOR_MISDEMEANOR) === 'false' && psa.get(PRIOR_FELONY) === 'false') {
        psa = psa.set(PRIOR_VIOLENT_CONVICTION, '0').set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
      }
      return state.set('psa', psa);
    }

    case CLEAR_FORM:
      return state
        .set('pretrialCaseOptions', Immutable.List())
        .set('allChargesForPerson', Immutable.List())
        .set('selectPerson', Immutable.Map())
        .set('selectedPretrialCase', Immutable.Map())
        .set('charges', Immutable.List())
        .set('psa', INITIAL_PSA_FORM);


    default:
      return state;
  }
}

export default formReducer;
