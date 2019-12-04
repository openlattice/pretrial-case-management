/*
 * @flow
 */
import { DateTime } from 'luxon';
import { RequestStates } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map
} from 'immutable';

import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA, DMF } from '../../utils/consts/Consts';
import { getEntityKeyId, getEntityProperties, getNeighborDetails } from '../../utils/DataUtils';
import { getPeopleNeighbors } from '../people/PeopleActions';
import {
  ADD_CASE_AND_CHARGES,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  addCaseToPSA,
  removeCaseFromPSA,
  submitPSA
} from './PSAFormActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { actionValueIsInvalid } from '../../utils/consts/redux/ReduxUtils';
import { INITIAL_PSA_FORM, PSA_FORM_ACTIONS, PSA_FORM_DATA } from '../../utils/consts/redux/PSAFormConsts';

const {
  ARREST_DATE_TIME,
  CHARGE_ID,
  CASE_ID,
  ENTITY_KEY_ID
} = PROPERTY_TYPES;


const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const {
  CURRENT_VIOLENT_OFFENSE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

const {
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = DMF;

const { ARREST_CASES } = APP_TYPES;

const INITIAL_STATE :Map<> = fromJS({
  [REDUX.ACTIONS]: {
    [PSA_FORM_ACTIONS.ADD_CASE_TO_PSA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PSA_FORM_ACTIONS.EDIT_PSA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PSA_FORM_ACTIONS.SUBMIT_PSA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [PSA_FORM_ACTIONS.ADD_CASE_TO_PSA]: Map(),
    [PSA_FORM_ACTIONS.EDIT_PSA]: Map(),
    [PSA_FORM_ACTIONS.SUBMIT_PSA]: Map(),
    [PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA]: Map()
  },

  [PSA_FORM_DATA.ARREST_ID]: '',
  [PSA_FORM_DATA.ARREST_OPTIONS]: List(),
  [PSA_FORM_DATA.PSA_FORM]: INITIAL_PSA_FORM,
  [PSA_FORM_DATA.SELECT_PERSON]: Map(),
  [PSA_FORM_DATA.SELECT_PRETRIAL_CASE]: List(),
  [PSA_FORM_DATA.SELECT_CASE_CHARGES]: List(),
  [PSA_FORM_DATA.SUBMITTED_PSA]: Map(),
  [PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS]: Map(),
});

const ARREST_CHARGE_AUTOFILLS = [
  CURRENT_VIOLENT_OFFENSE,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
];

function formReducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case addCaseToPSA.case(action.type): {
      return addCaseToPSA.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA], error)
            .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.ADDING_CASE_TO_PSA, action.id])
      });
    }

    case getPeopleNeighbors.case(action.type): {
      return getPeopleNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const selectedPerson = state.get(PSA_FORM_DATA.SELECT_PERSON, Map());
          const personEKID = getEntityKeyId(selectedPerson);
          const { peopleNeighborsById } = action.value;
          const personNeighbors = peopleNeighborsById.get(personEKID);

          let arrestOptionsWithDate = List();
          let arrestOptionsWithoutDate = List();
          personNeighbors.get(ARREST_CASES, List()).forEach((arrestCase) => {
            const { [ARREST_DATE_TIME]: arrestDateTime } = getEntityProperties(arrestCase, [ARREST_DATE_TIME]);
            if (arrestDateTime) {
              arrestOptionsWithDate = arrestOptionsWithDate.push(arrestCase);
            }
            else {
              arrestOptionsWithoutDate = arrestOptionsWithoutDate.push(arrestCase);
            }
          });

          arrestOptionsWithDate = arrestOptionsWithDate.sort((case1, case2) => {
            const { [ARREST_DATE_TIME]: arrestDateTime1 } = getEntityProperties(case1, [ARREST_DATE_TIME]);
            const { [ARREST_DATE_TIME]: arrestDateTime2 } = getEntityProperties(case2, [ARREST_DATE_TIME]);
            const arr1 = DateTime.fromISO(arrestDateTime1);
            const arr2 = DateTime.fromISO(arrestDateTime2);
            if (arr1.isValid && arr2.isValid) {
              return (arr1 < arr2) ? 1 : -1;
            }
            return 0;
          });

          return state
            .set(PSA_FORM_DATA.ARREST_OPTIONS, arrestOptionsWithDate.concat(arrestOptionsWithoutDate));
        }
      });
    }

    case ADD_CASE_AND_CHARGES: {
      const { charges, pretrialCase } = action.value;
      return state
        .set(PSA_FORM_DATA.SELECT_PRETRIAL_CASE, pretrialCase)
        .set(PSA_FORM_DATA.SELECT_CASE_CHARGES, charges);
    }

    case SELECT_PERSON:
      return state.set(PSA_FORM_DATA.SELECT_PERSON, action.value.selectedPerson);

    case SELECT_PRETRIAL_CASE: {
      const getCaseAndChargeNum :Function = (charge) => {
        const { [CHARGE_ID]: chargeVal } = getEntityProperties(charge, [CHARGE_ID]);
        return chargeVal.length ? chargeVal.split('|') : [];
      };

      const { selectedPretrialCase, arrestChargesForPerson } = action.value;

      const { [ENTITY_KEY_ID]: arrestCaseEKID } = getEntityProperties(selectedPretrialCase, [ENTITY_KEY_ID]);
      const { [CASE_ID]: selectedCaseId } = getEntityProperties(selectedPretrialCase, [CASE_ID]);
      const charges = arrestChargesForPerson.map(getNeighborDetails)
        .filter(charge => getCaseAndChargeNum(charge)[0] === selectedCaseId)
        .sort((c1, c2) => getCaseAndChargeNum(c1)[1] > getCaseAndChargeNum(c2)[1]);
      return state
        .set(PSA_FORM_DATA.SELECT_PRETRIAL_CASE, selectedPretrialCase)
        .set(PSA_FORM_DATA.SELECT_CASE_CHARGES, charges)
        .set(PSA_FORM_DATA.ARREST_ID, arrestCaseEKID);
    }

    case SET_PSA_VALUES: {
      let psa = state.get(PSA_FORM_DATA.PSA_FORM);
      const { newValues } = action.value;

      // when calling setPSAValues with 'tryAutofillFields', the newValue map will have a size greater than 1
      if (newValues.size > 1) {
        action.value.newValues.entrySeq().forEach(([field, newValue]) => {
          const oldValue = psa.get(field);
          const isAnArrestAutofill = ARREST_CHARGE_AUTOFILLS.includes(field);
          const newValueIncreased = (oldValue === 'false' && newValue === 'true');
          const priorViolentIncrease = (field === PRIOR_VIOLENT_CONVICTION && newValue > oldValue);
          const failureToAppearIncrease = (field === PRIOR_FAILURE_TO_APPEAR_RECENT && newValue > oldValue);
          if (
            oldValue === null
            || isAnArrestAutofill
            || newValueIncreased
            || priorViolentIncrease
            || failureToAppearIncrease
          ) {
            psa = psa.set(field, newValue);
          }
          else {
            psa = psa.set(field, oldValue);
          }
        });
      }
      // when changing values manually, on the actualy form, setPSAValues is valled with a map of size 1
      else {
        psa = psa.merge(newValues);
      }

      if (psa.get(PRIOR_MISDEMEANOR) === 'false' && psa.get(PRIOR_FELONY) === 'false') {
        psa = psa.set(PRIOR_VIOLENT_CONVICTION, '0').set(PRIOR_SENTENCE_TO_INCARCERATION, 'false');
      }
      return state.set(PSA_FORM_DATA.PSA_FORM, psa);
    }

    case CLEAR_FORM: {
      return INITIAL_STATE;
    }


    case removeCaseFromPSA.case(action.type): {
      return removeCaseFromPSA.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA], error)
            .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.REMOVE_CASE_FROM_PSA, action.id])
      });
    }

    case submitPSA.case(action.type): {
      return submitPSA.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.SUBMIT_PSA, action.id], fromJS(action))
          .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.SUBMIT_PSA, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { psaScoresEntity, psaNeighborsByAppTypeFqn } = action.value;
          return state
            .set(PSA_FORM_DATA.SUBMITTED_PSA, psaScoresEntity)
            .set(PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS, psaNeighborsByAppTypeFqn)
            .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.SUBMIT_PSA, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          if (actionValueIsInvalid(action.value)) {
            return state;
          }
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, PSA_FORM_ACTIONS.SUBMIT_PSA], error)
            .setIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.SUBMIT_PSA, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, PSA_FORM_ACTIONS.SUBMIT_PSA, action.id])
      });
    }

    default:
      return state;
  }
}

export default formReducer;
