/*
 * @flow
 */
import { Constants } from 'lattice';
import { Map, List, fromJS } from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_MODAL, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { loadPSAModal, CLEAR_PSA_MODAL } from './PSAModalActionFactory';
import { loadHearingNeighbors } from '../court/CourtActionFactory';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActionFactory';
import { updateContactInfo, refreshPersonNeighbors } from '../people/PeopleActionFactory';
import {
  changePSAStatus,
  loadCaseHistory,
  refreshPSANeighbors,
  updateScoresAndRiskFactors
} from '../review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const { ENTITY_KEY_ID } = PROPERTY_TYPES;

const {
  CONTACT_INFORMATION,
  DMF_RISK_FACTORS,
  DMF_RESULTS,
  HEARINGS,
  PEOPLE,
  PSA_RISK_FACTORS,
  PSA_SCORES,
  RELEASE_RECOMMENDATIONS,
  SUBSCRIPTION
} = APP_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [PSA_MODAL.LOADING_PSA_MODAL]: false,
  [PSA_MODAL.SCORES]: Map(),
  [PSA_MODAL.PSA_ID]: '',
  [PSA_MODAL.PSA_NEIGHBORS]: Map(),
  [PSA_MODAL.PSA_PERMISSIONS]: false,
  [PSA_MODAL.HEARINGS]: List(),
  [PSA_MODAL.HEARING_IDS]: List(),
  [PSA_MODAL.LOADING_HEARING_NEIGHBORS]: false,
  [PSA_MODAL.HEARINGS_NEIGHBORS_BY_ID]: Map(),
  [PSA_MODAL.PERSON_ID]: '',
  [PSA_MODAL.LOADING_CASES]: false,
  [PSA_MODAL.CASE_HISTORY]: List(),
  [PSA_MODAL.MANUAL_CASE_HISTORY]: List(),
  [PSA_MODAL.CHARGE_HISTORY]: Map(),
  [PSA_MODAL.MANUAL_CHARGE_HISTORY]: Map(),
  [PSA_MODAL.SENTENCE_HISTORY]: Map(),
  [PSA_MODAL.FTA_HISTORY]: Map(),
  [PSA_MODAL.PERSON_HEARINGS]: Map(),
  [PSA_MODAL.PERSON_NEIGHBORS]: Map(),
});

export default function psaModalReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadPSAModal.case(action.type): {
      return loadPSAModal.reducer(state, action, {
        REQUEST: () => state.set(PSA_MODAL.LOADING_PSA_MODAL, true),
        SUCCESS: () => {
          const {
            scores,
            psaId,
            neighborsByAppTypeFqn,
            personNeighborsByFqn,
            hearingIds,
            psaPermissions
          } = action.value;
          const personId = neighborsByAppTypeFqn.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
          return state
            .set(PSA_MODAL.SCORES, scores)
            .set(PSA_MODAL.PSA_ID, psaId)
            .set(PSA_MODAL.PERSON_ID, personId)
            .set(PSA_MODAL.PSA_NEIGHBORS, neighborsByAppTypeFqn)
            .set(PSA_MODAL.HEARINGS, neighborsByAppTypeFqn.get(HEARINGS, List()))
            .set(PSA_MODAL.PSA_PERMISSIONS, psaPermissions)
            .set(PSA_MODAL.PERSON_NEIGHBORS, personNeighborsByFqn)
            .set(PSA_MODAL.HEARING_IDS, hearingIds);
        },
        FAILURE: () => state.set(PSA_MODAL.LOADING_PSA_MODAL, false),
        FINALLY: () => state.set(PSA_MODAL.LOADING_PSA_MODAL, false),
      });
    }

    case changePSAStatus.case(action.type): {
      return changePSAStatus.reducer(state, action, {
        SUCCESS: () => state
          .set(PSA_MODAL.SCORES, fromJS(action.value.entity))
          .setIn([PSA_MODAL.PSA_NEIGHBORS, PSA_SCORES], fromJS(action.value.entity))
      });
    }

    case refreshPSANeighbors.case(action.type): {
      return refreshPSANeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const hearings = neighbors.get(HEARINGS, List());
          const hearingIds = hearings.map(hearing => hearing.getIn([OPENLATTICE_ID_FQN, 0], ''));
          return state
            .set(PSA_MODAL.PSA_NEIGHBORS, neighbors)
            .set(PSA_MODAL.HEARINGS, hearings)
            .set(PSA_MODAL.HEARING_IDS, hearingIds);
        }
      });
    }

    case updateScoresAndRiskFactors.case(action.type): {
      return updateScoresAndRiskFactors.reducer(state, action, {
        SUCCESS: () => {
          const {
            newScoreEntity,
            newRiskFactorsEntity,
            newDMFEntity,
            newDMFRiskFactorsEntity,
            newNotesEntity
          } = action.value;

          let neighborsByAppTypeFqn = state.get(PSA_MODAL.PSA_NEIGHBORS);
          neighborsByAppTypeFqn = neighborsByAppTypeFqn
            .setIn([PSA_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], fromJS(newRiskFactorsEntity))
            .setIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], fromJS(newDMFEntity))
            .setIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS], fromJS(newDMFRiskFactorsEntity))
            .setIn([RELEASE_RECOMMENDATIONS, PSA_NEIGHBOR.DETAILS], fromJS(newNotesEntity));
          return state
            .set(PSA_MODAL.SCORES, fromJS(newScoreEntity))
            .set(PSA_MODAL.PSA_NEIGHBORS, neighborsByAppTypeFqn);
        }
      });
    }

    case loadCaseHistory.case(action.type): {
      return loadCaseHistory.reducer(state, action, {
        REQUEST: () => state.set(PSA_MODAL.LOADING_CASES, true),
        SUCCESS: () => {
          const {
            allCases,
            allManualCases,
            chargesByCaseId,
            manualChargesByCaseId,
            sentencesByCaseId,
            allFTAs,
            allHearings
          } = action.value;
          const uniqCases = allCases.toSet().toList();
          return state
            .set(PSA_MODAL.CASE_HISTORY, uniqCases)
            .set(PSA_MODAL.MANUAL_CASE_HISTORY, allManualCases)
            .set(PSA_MODAL.CHARGE_HISTORY, chargesByCaseId)
            .set(PSA_MODAL.MANUAL_CHARGE_HISTORY, manualChargesByCaseId)
            .set(PSA_MODAL.SENTENCE_HISTORY, sentencesByCaseId)
            .set(PSA_MODAL.FTA_HISTORY, allFTAs)
            .set(PSA_MODAL.PERSON_HEARINGS, allHearings);
        },
        FAILURE: () => state.set(PSA_MODAL.LOADING_CASES, false),
        FINALLY: () => state.set(PSA_MODAL.LOADING_CASES, false)
      });
    }

    case loadHearingNeighbors.case(action.type): {
      return loadHearingNeighbors.reducer(state, action, {
        REQUEST: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, true),
        SUCCESS: () => {
          const { hearingNeighborsById } = action.value;
          return state.set(PSA_MODAL.HEARINGS_NEIGHBORS_BY_ID, hearingNeighborsById);
        },
        FAILURE: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, false),
        FINALLY: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, false),
      });
    }

    case refreshHearingAndNeighbors.case(action.type): {
      return refreshHearingAndNeighbors.reducer(state, action, {
        REQUEST: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, true),
        SUCCESS: () => {
          const {
            hearingEntityKeyId,
            hearing,
            hearingNeighborsByAppTypeFqn
          } = action.value;
          /*
          * Get PSA Hearings and Neighbors
          */
          const psaHearings = state.get(PSA_MODAL.HEARINGS, List());
          const psaNeighbors = state.get(PSA_MODAL.PSA_NEIGHBORS, List());
          /*
          * Replace hearings in PSA Hearings List
          */
          const nextPSAHearings = psaHearings.map((psaHearing) => {
            const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(psaHearing, [ENTITY_KEY_ID]);
            if (entityKeyId === hearingEntityKeyId) return hearing;
            return psaHearing;
          });
          /*
          * Replace hearings list in PSA neighbors with updated list
          */
          const nextPSANeighbors = psaNeighbors.set(HEARINGS, nextPSAHearings);
          return state
            .setIn([PSA_MODAL.HEARINGS_NEIGHBORS_BY_ID, hearingEntityKeyId], hearingNeighborsByAppTypeFqn)
            .set(PSA_MODAL.PSA_NEIGHBORS, nextPSANeighbors)
            .set(PSA_MODAL.HEARINGS, nextPSAHearings);
        },
        FAILURE: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, false),
        FINALLY: () => state.set(PSA_MODAL.LOADING_HEARING_NEIGHBORS, false),
      });
    }

    case updateContactInfo.case(action.type): {
      return updateContactInfo.reducer(state, action, {
        SUCCESS: () => {
          const { contactInformation } = action.value;
          return state.setIn([PSA_MODAL.PERSON_NEIGHBORS, CONTACT_INFORMATION], contactInformation);
        }
      });
    }

    case refreshPersonNeighbors.case(action.type): {
      return refreshPersonNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const { neighbors } = action.value;
          const subscription = neighbors.getIn([SUBSCRIPTION], Map());
          const contacts = neighbors.getIn([CONTACT_INFORMATION], List());
          return state
            .setIn([PSA_MODAL.PERSON_NEIGHBORS, SUBSCRIPTION], subscription)
            .setIn([PSA_MODAL.PERSON_NEIGHBORS, CONTACT_INFORMATION], contacts);
        }
      });
    }

    case CLEAR_PSA_MODAL:
      return INITIAL_STATE;

    default:
      return state;
  }
}
