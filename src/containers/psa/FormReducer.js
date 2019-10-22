/*
 * @flow
 */
import moment from 'moment';
import { Constants } from 'lattice';
import {
  fromJS,
  List,
  Map
} from 'immutable';

import { submitContact, updateContactsBulk } from '../contactinformation/ContactInfoActions';
import { changePSAStatus, updateScoresAndRiskFactors } from '../review/ReviewActionFactory';
import { subscribe, unsubscribe } from '../subscription/SubscriptionActions';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA, NOTES } from '../../utils/consts/Consts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { getMapByCaseId } from '../../utils/CaseUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { PSA_NEIGHBOR, PSA_FORM } from '../../utils/consts/FrontEndStateConsts';
import {
  ADD_CASE_AND_CHARGES,
  CLEAR_FORM,
  SELECT_PERSON,
  SELECT_PRETRIAL_CASE,
  SET_PSA_VALUES,
  addCaseToPSA,
  loadNeighbors,
  removeCaseFromPSA,
  submitPSA
} from './FormActionFactory';

const {
  ARREST_DATE_TIME,
  CHARGE_ID,
  CASE_ID,
  ENTITY_KEY_ID
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
} = RCM_FIELDS;

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
} = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const INITIAL_PSA_FORM = fromJS({
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

const INITIAL_STATE :Map<> = fromJS({
  [PSA_FORM.ARREST_OPTIONS]: List(),
  [PSA_FORM.ALL_CASES]: List(),
  [PSA_FORM.ALL_CHARGES]: List(),
  [PSA_FORM.ALL_SENTENCES]: List(),
  [PSA_FORM.ALL_ARREST_CHARGES]: List(),
  [PSA_FORM.ALL_FTAS]: List(),
  [PSA_FORM.ALL_PSAS]: List(),
  [PSA_FORM.SUBSCRIPTION]: Map(),
  [PSA_FORM.ALL_MANUAL_CASES]: List(),
  [PSA_FORM.ALL_MANUAL_CHARGES]: Map(),
  [PSA_FORM.ALL_HEARINGS]: List(),
  [PSA_FORM.CHARGES]: List(),
  [PSA_FORM.SELECT_PERSON]: Map(),
  [PSA_FORM.SELECT_PERSON_NEIGHBORS]: Map(),
  [PSA_FORM.OPEN_PSAS]: Map(),
  [PSA_FORM.ARREST_ID]: '',
  [PSA_FORM.SELECT_PRETRIAL_CASE]: Map(),
  [PSA_FORM.PSA]: INITIAL_PSA_FORM,
  [PSA_FORM.ENTITY_SET_LOOKUP]: Map(),
  [PSA_FORM.LOADING_NEIGHBORS]: false,
  [PSA_FORM.SUBMIT_ERROR]: false,
  // Submit
  [PSA_FORM.SUBMITTING_PSA]: false,
  [PSA_FORM.PSA_SUBMISSION_COMPLETE]: false,
  [PSA_FORM.SUBMITTED_PSA]: Map(),
  [PSA_FORM.SUBMITTED_PSA_NEIGHBORS]: Map(),
  // Adding and Removing Cases
  [PSA_FORM.ADDING_CASE_TO_PSA]: false,
  [PSA_FORM.REMOVING_CASE_FROM_PSA]: false
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
        REQUEST: () => state.set(PSA_FORM.ADDING_CASE_TO_PSA, true),
        FINALLY: () => state.set(PSA_FORM.ADDING_CASE_TO_PSA, false)
      });
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => {
          const neighbors = state.getIn(['allPSAs'], Map());
          const nextNeighbors = fromJS(neighbors).filter((neighborObj) => {
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

    case loadNeighbors.case(action.type): {
      return loadNeighbors.reducer(state, action, {
        REQUEST: () => state.set(PSA_FORM.LOADING_NEIGHBORS, true),
        SUCCESS: () => {
          let allCasesForPerson = List();
          let arrestOptionsWithDate = List();
          let arrestOptionsWithoutDate = List();
          let allArrestCharges = List();
          let allChargesForPerson = List();
          let allSentencesForPerson = List();
          let allManualCases = List();
          let allManualCharges = List();
          let allFTAs = List();
          let allPSAs = List();
          let allHearings = List();
          let allContactInfo = List();
          let personSubscription = Map();
          let { neighbors } = action.value;
          const { entitySetIdsToAppType, openPSAs } = action.value;

          neighbors = fromJS(neighbors) || List();
          neighbors.forEach((neighbor) => {
            const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
            const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
            const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
            switch (appTypeFqn) {
              case PRETRIAL_CASES:
                allCasesForPerson = allCasesForPerson.push(neighborObj);
                break;
              case ARREST_CASES: {
                const arrList = neighborObj.get(ARREST_DATE_TIME, List());
                if (arrList.size) {
                  arrestOptionsWithDate = arrestOptionsWithDate.push(neighborObj);
                }
                else {
                  arrestOptionsWithoutDate = arrestOptionsWithoutDate.push(neighborObj);
                }
                break;
              }
              case MANUAL_PRETRIAL_CASES:
                allManualCases = allManualCases.push(neighborObj);
                break;
              case ARREST_CHARGES:
                allArrestCharges = allArrestCharges.push(neighborObj);
                break;
              case MANUAL_CHARGES:
                allManualCharges = allManualCharges.push(neighborObj);
                break;
              case CHARGES:
                allChargesForPerson = allChargesForPerson.push(neighborObj);
                break;
              case SENTENCES:
                allSentencesForPerson = allSentencesForPerson.push(neighborObj);
                break;
              case FTAS:
                allFTAs = allFTAs.push(neighborObj);
                break;
              case PSA_SCORES:
                allPSAs = allPSAs.push(neighborObj);
                break;
              case HEARINGS:
                allHearings = allHearings.push(neighborObj);
                break;
              case CONTACT_INFORMATION:
                allContactInfo = allContactInfo.push(neighbor);
                break;
              case SUBSCRIPTION:
                personSubscription = neighborObj;
                break;
              default:
                break;
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
            .set(PSA_FORM.OPEN_PSAS, fromJS(openPSAs))
            .set(PSA_FORM.ALL_MANUAL_CASES, allManualCases)
            .set(PSA_FORM.ALL_MANUAL_CHARGES, getMapByCaseId(allManualCharges, CHARGE_ID))
            .set(PSA_FORM.ALL_HEARINGS, allHearings);
        },
        FINALLY: () => state.set(PSA_FORM.LOADING_NEIGHBORS, false)
      });
    }

    case ADD_CASE_AND_CHARGES: {
      const { charges, pretrialCase } = action.value;
      let allChargesForPerson = state.get(PSA_FORM.ALL_CHARGES, List());
      charges.forEach((charge) => {
        allChargesForPerson = allChargesForPerson.push(charge);
      });
      return state
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

      const { [ENTITY_KEY_ID]: arrestCaseEKID } = getEntityProperties(selectedPretrialCase, [ENTITY_KEY_ID]);
      const selectedCaseIdList = selectedPretrialCase.get(CASE_ID, List());
      const charges = state.get(PSA_FORM.ALL_ARREST_CHARGES)
        .filter(charge => getCaseAndChargeNum(charge)[0] === selectedCaseIdList.get(0))
        .sort((c1, c2) => getCaseAndChargeNum(c1)[1] > getCaseAndChargeNum(c2)[1]);
      return state
        .set(PSA_FORM.SELECT_PRETRIAL_CASE, selectedPretrialCase)
        .set(PSA_FORM.CHARGES, charges)
        .set(PSA_FORM.ARREST_ID, arrestCaseEKID);
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
        .set(PSA_FORM.ARREST_OPTIONS, List())
        .set(PSA_FORM.ALL_CASES, List())
        .set(PSA_FORM.ALL_CHARGES, List())
        .set(PSA_FORM.ALL_SENTENCES, List())
        .set(PSA_FORM.ALL_FTAS, List())
        .set(PSA_FORM.ALL_PSAS, List())
        .set(PSA_FORM.ALL_MANUAL_CASES, List())
        .set(PSA_FORM.ALL_MANUAL_CHARGES, Map())
        .set(PSA_FORM.ALL_HEARINGS, List())
        .set(PSA_FORM.OPEN_PSAS, Map())
        .set(PSA_FORM.SELECT_PERSON, Map())
        .set(PSA_FORM.ARREST_ID, '')
        .set(PSA_FORM.SELECT_PRETRIAL_CASE, Map())
        .set(PSA_FORM.CHARGES, List())
        .set(PSA_FORM.PSA, INITIAL_PSA_FORM)
        .set(PSA_FORM.SUBMITTED, false)
        .set(PSA_FORM.SUBMITTING, false)
        .set(PSA_FORM.SUBMIT_ERROR, false);
    }

    case submitContact.case(action.type): {
      return submitContact.reducer(state, action, {
        SUCCESS: () => {
          const { contactInfo } = action.value;
          const newContactInfo = state.get(PSA_FORM.ALL_CONTACTS, List()).push(contactInfo);
          return state.set(PSA_FORM.ALL_CONTACTS, newContactInfo);
        }
      });
    }

    case updateContactsBulk.case(action.type): {
      return updateContactsBulk.reducer(state, action, {
        SUCCESS: () => {
          const { contactInformation } = action.value;
          return state.set(PSA_FORM.ALL_CONTACTS, contactInformation);
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const { scoresId, newScoreEntity } = action.value;

          let allPSAs = state.get(PSA_FORM.ALL_PSAS);
          allPSAs = allPSAs.map((scores) => {
            const scoresEntityKeyId = getEntityKeyId(scores);
            if (scoresId === scoresEntityKeyId) return fromJS(newScoreEntity);
            return scores;
          });
          return state
            .set(PSA_FORM.ALL_PSAS, allPSAs);
        }
      });
    }

    case removeCaseFromPSA.case(action.type): {
      return removeCaseFromPSA.reducer(state, action, {
        REQUEST: () => state.set(PSA_FORM.REMOVING_CASE_FROM_PSA, true),
        FINALLY: () => state.set(PSA_FORM.REMOVING_CASE_FROM_PSA, false)
      });
    }

    case submitPSA.case(action.type): {
      return submitPSA.reducer(state, action, {
        REQUEST: () => state
          .set(PSA_FORM.PSA_SUBMISSION_COMPLETE, false)
          .set(PSA_FORM.SUBMITTING_PSA, true),
        SUCCESS: () => {
          const { psaScoresEntity, psaNeighborsByAppTypeFqn } = action.value;
          return state
            .set(PSA_FORM.SUBMITTED_PSA, psaScoresEntity)
            .set(PSA_FORM.SUBMITTED_PSA_NEIGHBORS, psaNeighborsByAppTypeFqn);
        },
        FAILURE: () => state.set(PSA_FORM.SUBMIT_ERROR, true),
        FINALLY: () => state
          .set(PSA_FORM.PSA_SUBMISSION_COMPLETE, true)
          .set(PSA_FORM.SUBMITTING_PSA, false)
      });
    }

    case subscribe.case(action.type): {
      return subscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          return state.setIn([PSA_FORM.SELECT_PERSON_NEIGHBORS, SUBSCRIPTION], subscription);
        },
      });
    }

    case unsubscribe.case(action.type): {
      return unsubscribe.reducer(state, action, {
        SUCCESS: () => {
          const { subscription } = action.value;
          return state.setIn([PSA_FORM.SELECT_PERSON_NEIGHBORS, SUBSCRIPTION], subscription);
        },
      });
    }

    default:
      return state;
  }
}

export default formReducer;
