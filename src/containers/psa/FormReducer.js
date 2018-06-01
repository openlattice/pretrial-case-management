/*
 * @flow
 */

import Immutable from 'immutable';
import moment from 'moment';

import {
  ADD_CASE_AND_CHARGES,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA, NOTES, DMF } from '../../utils/consts/Consts';

const {
  ARREST_CASES,
  ARREST_CHARGES,
  PRETRIAL_CASES,
  CHARGES,
  SENTENCES,
  FTAS
} = ENTITY_SETS;

const {
  CHARGE_ID,
  CASE_ID,
  FILE_DATE,
  ARREST_DATE_TIME
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

const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES
} = DMF;

const INITIAL_PSA_FORM = Immutable.fromJS({
  [AGE_AT_CURRENT_ARREST]: null,
  [CURRENT_VIOLENT_OFFENSE]: null,
  [PENDING_CHARGE]: null,
  [PRIOR_MISDEMEANOR]: null,
  [PRIOR_FELONY]: null,
  [PRIOR_VIOLENT_CONVICTION]: null,
  [PRIOR_FAILURE_TO_APPEAR_RECENT]: null,
  [PRIOR_FAILURE_TO_APPEAR_OLD]: null,
  [PRIOR_SENTENCE_TO_INCARCERATION]: null,
  [EXTRADITED]: 'false',
  [STEP_2_CHARGES]: null,
  [STEP_4_CHARGES]: null,
  [COURT_OR_BOOKING]: null,
  [SECONDARY_RELEASE_CHARGES]: '',

  [NOTES[AGE_AT_CURRENT_ARREST]]: '',
  [NOTES[CURRENT_VIOLENT_OFFENSE]]: '',
  [NOTES[PENDING_CHARGE]]: '',
  [NOTES[PRIOR_MISDEMEANOR]]: '',
  [NOTES[PRIOR_FELONY]]: '',
  [NOTES[PRIOR_VIOLENT_CONVICTION]]: '',
  [NOTES[PRIOR_FAILURE_TO_APPEAR_RECENT]]: '',
  [NOTES[PRIOR_FAILURE_TO_APPEAR_OLD]]: '',
  [NOTES[PRIOR_SENTENCE_TO_INCARCERATION]]: '',
  [NOTES[EXTRADITED]]: '',
  [NOTES[STEP_2_CHARGES]]: '',
  [NOTES[STEP_4_CHARGES]]: '',
  [NOTES[SECONDARY_RELEASE_CHARGES]]: ''
});

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  pretrialCaseOptions: Immutable.List(),
  allArrests: Immutable.List(),
  allChargesForPerson: Immutable.List(),
  allSentencesForPerson: Immutable.List(),
  allArrestCharges: Immutable.List(),
  allFTAs: Immutable.List(),
  charges: Immutable.List(),
  selectedPerson: Immutable.Map(),
  selectedPretrialCase: Immutable.Map(),
  chargesManuallyEntered: false,
  psa: INITIAL_PSA_FORM,
  dataModel: Immutable.Map(),
  entitySetLookup: Immutable.Map(),
  isSubmitted: false,
  isSubmitting: false,
  submitError: false
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
          let allCasesForPerson = Immutable.List();
          let arrestOptionsWithDate = Immutable.List();
          let arrestOptionsWithoutDate = Immutable.List();
          let allArrestCharges = Immutable.List();
          let allChargesForPerson = Immutable.List();
          let allSentencesForPerson = Immutable.List();
          let allFTAs = Immutable.List();

          const neighbors = Immutable.fromJS(action.value.neighbors) || Immutable.List();
          neighbors.forEach((neighbor) => {
            const entitySetName = neighbor.getIn(['neighborEntitySet', 'name'], '');
            const neighborObj = neighbor
              .get('neighborDetails', Immutable.Map())
              .set('id', neighbor.get('neighborId', ''));

            if (entitySetName === PRETRIAL_CASES) {
              allCasesForPerson = allCasesForPerson.push(neighborObj);
            }
            else if (entitySetName === ARREST_CASES) {
              const arrList = neighborObj.get(ARREST_DATE_TIME, Immutable.List());
              if (arrList.size) {
                arrestOptionsWithDate = arrestOptionsWithDate.push(neighborObj);
              }
              else {
                arrestOptionsWithoutDate = arrestOptionsWithoutDate.push(neighborObj);
              }
            }
            else if (entitySetName === ARREST_CHARGES) {
              allArrestCharges = allArrestCharges.push(neighborObj);
            }
            else if (entitySetName === CHARGES) {
              allChargesForPerson = allChargesForPerson.push(neighborObj);
            }
            else if (entitySetName === SENTENCES) {
              allSentencesForPerson = allSentencesForPerson.push(neighborObj);
            }
            else if (entitySetName === FTAS) {
              allFTAs = allFTAs.push(neighborObj);
            }
          });

          arrestOptionsWithDate = arrestOptionsWithDate.sort((case1, case2) => {
            const arr1 = moment(case1.getIn([FILE_DATE, 0], ''));
            const arr2 = moment(case2.getIn([FILE_DATE, 0], ''));
            if (arr1.isValid() && arr2.isValid()) {
              if (arr1.isBefore(arr2)) return 1;
              if (arr1.isAfter(arr2)) return -1;
            }
            return 0;
          });

          return state
            .set('pretrialCaseOptions', arrestOptionsWithDate.concat(arrestOptionsWithoutDate))
            .set('allCasesForPerson', allCasesForPerson)
            .set('allChargesForPerson', allChargesForPerson)
            .set('allSentencesForPerson', allSentencesForPerson)
            .set('allFTAs', allFTAs)
            .set('allArrestCharges', allArrestCharges);
        }
      });
    }

    case ADD_CASE_AND_CHARGES: {
      let allChargesForPerson = state.get('allChargesForPerson', Immutable.List());
      action.value.charges.forEach((charge) => {
        allChargesForPerson = allChargesForPerson.push(charge);
      });
      return state
        .set('chargesManuallyEntered', true)
        .set('pretrialCaseOptions', state.get('pretrialCaseOptions').unshift(action.value.pretrialCase))
        .set('allChargesForPerson', allChargesForPerson)
        .set('charges', action.value.charges)
        .set('selectedPretrialCase', action.value.pretrialCase);
    }

    case SELECT_PERSON: return state.set('selectedPerson', action.value.selectedPerson);

    case SELECT_PRETRIAL_CASE: {
      const getCaseAndChargeNum :Function = (charge) => {
        const chargeVal = charge.getIn([CHARGE_ID, 0], '');
        return chargeVal.length ? chargeVal.split('|') : [];
      };

      const { selectedPretrialCase } = action.value;

      const selectedCaseIdList = selectedPretrialCase.get(CASE_ID, Immutable.List());
      const charges = state.get('allArrestCharges')
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
        .set('allSentencesForPerson', Immutable.List())
        .set('allFTAs', Immutable.List())
        .set('selectPerson', Immutable.Map())
        .set('selectedPretrialCase', Immutable.Map())
        .set('chargesManuallyEntered', false)
        .set('charges', Immutable.List())
        .set('psa', INITIAL_PSA_FORM)
        .set('isSubmitted', false)
        .set('isSubmitting', false)
        .set('submitError', false);


    default:
      return state;
  }
}

export default formReducer;
