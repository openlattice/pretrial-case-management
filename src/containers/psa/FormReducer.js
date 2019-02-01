/*
 * @flow
 */
import Immutable from 'immutable';
import moment from 'moment';
import { Constants } from 'lattice';

import {
  ADD_CASE_AND_CHARGES,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  loadDataModel,
  loadNeighbors
} from './FormActionFactory';
import { updateContactInfo, refreshPersonNeighbors } from '../people/PeopleActionFactory';
import { changePSAStatus } from '../review/ReviewActionFactory';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA, NOTES, DMF } from '../../utils/consts/Consts';
import { getMapByCaseId } from '../../utils/CaseUtils';
import { PSA_NEIGHBOR, PSA_FORM } from '../../utils/consts/FrontEndStateConsts';

const {
  ARREST_DATE_TIME,
  CHARGE_ID,
  CASE_ID
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
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = DMF;

const {
  ARREST_CASES,
  ARREST_CHARGES,
  CHARGES,
  CONTACT_INFORMATION,
  FTAS,
  HEARINGS,
  MANUAL_CHARGES,
  MANUAL_PRETRIAL_CASES,
  PRETRIAL_CASES,
  PSA_SCORES,
  SENTENCES,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

const arrestCasesFqn :string = ARREST_CASES.toString();
const arrestChargesFqn :string = ARREST_CHARGES.toString();
const chargesFqn :string = CHARGES.toString();
const contactInformationFqn :string = CONTACT_INFORMATION.toString();
const ftasFqn :string = FTAS.toString();
const hearingsFqn :string = HEARINGS.toString();
const manualChargesFqn :string = MANUAL_CHARGES.toString();
const manualPretialCasesFqn :string = MANUAL_PRETRIAL_CASES.toString();
const pretrialCasesFqn :string = PRETRIAL_CASES.toString();
const psaScoresFqn :string = PSA_SCORES.toString();
const sentencesFqn :string = SENTENCES.toString();
const subscriptionFqn :string = SUBSCRIPTION.toString();


const { OPENLATTICE_ID_FQN } = Constants;

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
  [SECONDARY_RELEASE_CHARGES]: null,
  [SECONDARY_HOLD_CHARGES]: null,
  [PSA.NOTES]: '',

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
  [NOTES[SECONDARY_RELEASE_CHARGES]]: '',
  [NOTES[SECONDARY_HOLD_CHARGES]]: ''
});

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  [PSA_FORM.ARREST_OPTIONS]: Immutable.List(),
  [PSA_FORM.ALL_CASES]: Immutable.List(),
  [PSA_FORM.ALL_CHARGES]: Immutable.List(),
  [PSA_FORM.ALL_SENTENCES]: Immutable.List(),
  [PSA_FORM.ALL_ARREST_CHARGES]: Immutable.List(),
  [PSA_FORM.ALL_FTAS]: Immutable.List(),
  [PSA_FORM.ALL_PSAS]: Immutable.List(),
  [PSA_FORM.SELECT_PERSON]: Immutable.List(),
  [PSA_FORM.SUBSCRIPTION]: Immutable.Map(),
  [PSA_FORM.ALL_MANUAL_CASES]: Immutable.List(),
  [PSA_FORM.ALL_MANUAL_CHARGES]: Immutable.Map(),
  [PSA_FORM.ALL_HEARINGS]: Immutable.List(),
  [PSA_FORM.CHARGES]: Immutable.List(),
  [PSA_FORM.SELECT_PERSON]: Immutable.Map(),
  [PSA_FORM.SELECT_PERSON_NEIGHBORS]: Immutable.Map(),
  [PSA_FORM.OPEN_PSAS]: Immutable.Map(),
  [PSA_FORM.ARREST_ID]: '',
  [PSA_FORM.SELECT_PRETRIAL_CASE]: Immutable.Map(),
  [PSA_FORM.PSA]: INITIAL_PSA_FORM,
  [PSA_FORM.DATA_MODEL]: Immutable.Map(),
  [PSA_FORM.ENTITY_SET_LOOKUP]: Immutable.Map(),
  [PSA_FORM.SUBMITTED]: false,
  [PSA_FORM.SUBMITTING]: false,
  [PSA_FORM.LOADING_NEIGHBORS]: false,
  [PSA_FORM.SUBMIT_ERROR]: false
});

const ARREST_CHARGE_AUTOFILLS = [
  CURRENT_VIOLENT_OFFENSE,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
];

function formReducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const neighbors = state.getIn(['allPSAs'], Immutable.Map());
          const nextNeighbors = Immutable.fromJS(neighbors).filter((neighborObj) => {
            const neighborId = neighborObj.getIn([OPENLATTICE_ID_FQN, 0]);
            if (neighborId === action.value.id) {
              return false;
            }
            return true;
          });
          return state.setIn(['allPSAs'], nextNeighbors);
        }
      });
    }

    case loadDataModel.case(action.type): {
      return loadDataModel.reducer(state, action, {
        SUCCESS: () => {
          const { dataModel } = action.value;
          const entitySetLookup = {};
          Object.values(dataModel.entitySets).forEach((entitySet) => {
            entitySetLookup[entitySet.name] = entitySet.id;
          });
          return state
            .set(PSA_FORM.DATA_MODEL, Immutable.fromJS(dataModel))
            .set(PSA_FORM.ENTITY_SET_LOOKUP, Immutable.fromJS(entitySetLookup));
        }
      });
    }

    case loadNeighbors.case(action.type): {
      return loadNeighbors.reducer(state, action, {
        REQUEST: () => state.set(PSA_FORM.LOADING_NEIGHBORS, true),
        SUCCESS: () => {
          let allCasesForPerson = Immutable.List();
          let arrestOptionsWithDate = Immutable.List();
          let arrestOptionsWithoutDate = Immutable.List();
          let allArrestCharges = Immutable.List();
          let allChargesForPerson = Immutable.List();
          let allSentencesForPerson = Immutable.List();
          let allManualCases = Immutable.List();
          let allManualCharges = Immutable.List();
          let allFTAs = Immutable.List();
          let allPSAs = Immutable.List();
          let allHearings = Immutable.List();
          let allContactInfo = Immutable.List();
          let personSubscription = Immutable.Map();
          let { neighbors } = action.value;
          const { entitySetIdsToAppType, openPSAs } = action.value;

          neighbors = Immutable.fromJS(neighbors) || Immutable.List();
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Immutable.Map());

            if (appTypeFqn === pretrialCasesFqn) {
              allCasesForPerson = allCasesForPerson.push(neighborObj);
            }
            else if (appTypeFqn === arrestCasesFqn) {
              const arrList = neighborObj.get(ARREST_DATE_TIME, Immutable.List());
              if (arrList.size) {
                arrestOptionsWithDate = arrestOptionsWithDate.push(neighborObj);
              }
              else {
                arrestOptionsWithoutDate = arrestOptionsWithoutDate.push(neighborObj);
              }
            }
            else if (appTypeFqn === manualPretialCasesFqn) {
              allManualCases = allManualCases.push(neighborObj);
            }
            else if (appTypeFqn === arrestChargesFqn) {
              allArrestCharges = allArrestCharges.push(neighborObj);
            }
            else if (appTypeFqn === manualChargesFqn) {
              allManualCharges = allManualCharges.push(neighborObj);
            }
            else if (appTypeFqn === chargesFqn) {
              allChargesForPerson = allChargesForPerson.push(neighborObj);
            }
            else if (appTypeFqn === sentencesFqn) {
              allSentencesForPerson = allSentencesForPerson.push(neighborObj);
            }
            else if (appTypeFqn === ftasFqn) {
              allFTAs = allFTAs.push(neighborObj);
            }
            else if (appTypeFqn === psaScoresFqn) {
              allPSAs = allPSAs.push(neighborObj);
            }
            else if (appTypeFqn === hearingsFqn) {
              allHearings = allHearings.push(neighborObj);
            }
            else if (appTypeFqn === contactInformationFqn) {
              allContactInfo = allContactInfo.push(neighbor);
            }
            else if (appTypeFqn === subscriptionFqn) {
              personSubscription = neighborObj;
            }
          });

          arrestOptionsWithDate = arrestOptionsWithDate.sort((case1, case2) => {
            const arr1 = moment(case1.getIn([ARREST_DATE_TIME, 0], ''));
            const arr2 = moment(case2.getIn([ARREST_DATE_TIME, 0], ''));
            if (arr1.isValid() && arr2.isValid()) {
              if (arr1.isBefore(arr2)) return 1;
              if (arr1.isAfter(arr2)) return -1;
            }
            return 0;
          });

          return state
            .set(PSA_FORM.ARREST_OPTIONS, arrestOptionsWithDate.concat(arrestOptionsWithoutDate))
            .set(PSA_FORM.ALL_CASES, allCasesForPerson)
            .set(PSA_FORM.ALL_CHARGES, allChargesForPerson)
            .set(PSA_FORM.ALL_SENTENCES, allSentencesForPerson)
            .set(PSA_FORM.ALL_FTAS, allFTAs)
            .set(PSA_FORM.ALL_PSAS, allPSAs)
            .set(PSA_FORM.ALL_CONTACTS, allContactInfo)
            .set(PSA_FORM.SUBSCRIPTION, personSubscription)
            .set(PSA_FORM.ALL_ARREST_CHARGES, allArrestCharges)
            .set(PSA_FORM.OPEN_PSAS, Immutable.fromJS(openPSAs))
            .set(PSA_FORM.ALL_MANUAL_CASES, allManualCases)
            .set(PSA_FORM.ALL_MANUAL_CHARGES, getMapByCaseId(allManualCharges, CHARGE_ID))
            .set(PSA_FORM.ALL_HEARINGS, allHearings);
        },
        FINALLY: () => state.set(PSA_FORM.LOADING_NEIGHBORS, false)
      });
    }

    case ADD_CASE_AND_CHARGES: {
      const { charges, pretrialCase } = action.value;
      let allChargesForPerson = state.get(PSA_FORM.ALL_CHARGES, Immutable.List());
      charges.forEach((charge) => {
        allChargesForPerson = allChargesForPerson.push(charge);
      });
      return state
        .set(PSA_FORM.ARREST_OPTIONS, state.get(PSA_FORM.ARREST_OPTIONS).unshift(pretrialCase))
        .set(PSA_FORM.ALL_CHARGES, allChargesForPerson)
        .set(PSA_FORM.CHARGES, charges)
        .set(PSA_FORM.SELECT_PRETRIAL_CASE, pretrialCase);
    }

    case SELECT_PERSON:
      return state.set(PSA_FORM.SELECT_PERSON, action.value.selectedPerson);

    case SELECT_PRETRIAL_CASE: {
      const getCaseAndChargeNum :Function = (charge) => {
        const chargeVal = charge.getIn([CHARGE_ID, 0], '');
        return chargeVal.length ? chargeVal.split('|') : [];
      };

      const { selectedPretrialCase } = action.value;

      const selectedCaseIdList = selectedPretrialCase.get(CASE_ID, Immutable.List());
      const charges = state.get(PSA_FORM.ALL_ARREST_CHARGES)
        .filter(charge => getCaseAndChargeNum(charge)[0] === selectedCaseIdList.get(0))
        .sort((c1, c2) => getCaseAndChargeNum(c1)[1] > getCaseAndChargeNum(c2)[1]);
      return state
        .set(PSA_FORM.SELECT_PRETRIAL_CASE, selectedPretrialCase)
        .set(PSA_FORM.CHARGES, charges)
        .set(PSA_FORM.ARREST_ID, selectedCaseIdList.get(0, ''));
    }

    case SET_PSA_VALUES: {
      let psa = state.get(PSA_FORM.PSA);
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
      return state.set(PSA_FORM.PSA, psa);
    }

    case CLEAR_FORM: {
      return state
        .set(PSA_FORM.ARREST_OPTIONS, Immutable.List())
        .set(PSA_FORM.ALL_CASES, Immutable.List())
        .set(PSA_FORM.ALL_CHARGES, Immutable.List())
        .set(PSA_FORM.ALL_SENTENCES, Immutable.List())
        .set(PSA_FORM.ALL_FTAS, Immutable.List())
        .set(PSA_FORM.ALL_PSAS, Immutable.List())
        .set(PSA_FORM.ALL_MANUAL_CASES, Immutable.List())
        .set(PSA_FORM.ALL_MANUAL_CHARGES, Immutable.Map())
        .set(PSA_FORM.ALL_HEARINGS, Immutable.List())
        .set(PSA_FORM.OPEN_PSAS, Immutable.Map())
        .set(PSA_FORM.SELECT_PERSON, Immutable.Map())
        .set(PSA_FORM.ARREST_ID, '')
        .set(PSA_FORM.SELECT_PRETRIAL_CASE, Immutable.Map())
        .set(PSA_FORM.CHARGES, Immutable.List())
        .set(PSA_FORM.PSA, INITIAL_PSA_FORM)
        .set(PSA_FORM.SUBMITTED, false)
        .set(PSA_FORM.SUBMITTING, false)
        .set(PSA_FORM.SUBMIT_ERROR, false);
    }

    case updateContactInfo.case(action.type): {
      return updateContactInfo.reducer(state, action, {
        SUCCESS: () => {
          const { contactInformation } = action.value;
          return state.set(PSA_FORM.ALL_CONTACTS, contactInformation);
        }
      });
    }

    case refreshPersonNeighbors.case(action.type): {
      return refreshPersonNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const subscription = neighbors.getIn([subscriptionFqn, PSA_NEIGHBOR.DETAILS], Immutable.Map());
          const contacts = neighbors.getIn([contactInformationFqn], Immutable.List());
          return state
            .set(PSA_FORM.SUBSCRIPTION, subscription)
            .set(PSA_FORM.ALL_CONTACTS, contacts);
        }
      });
    }

    default:
      return state;
  }
}

export default formReducer;
