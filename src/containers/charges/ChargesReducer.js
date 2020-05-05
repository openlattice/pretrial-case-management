/* @flow */
import { RequestStates } from 'redux-reqseq';
import {
  Set,
  Map,
  fromJS
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  CREATE_CHARGE,
  DELETE_CHARGE,
  IMPORT_BULK_CHARGES,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  createCharge,
  deleteCharge,
  importBulkCharges,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
} from './ChargeActions';

import { REDUX } from '../../utils/consts/redux/SharedConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';

const {
  BHE,
  BRE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
} = PROPERTY_TYPES;

const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;

const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [CREATE_CHARGE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [DELETE_CHARGE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [IMPORT_BULK_CHARGES]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_ARRESTING_AGENCIES]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [LOAD_CHARGES]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [UPDATE_CHARGE]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [CREATE_CHARGE]: Map(),
    [DELETE_CHARGE]: Map(),
    [IMPORT_BULK_CHARGES]: Map(),
    [LOAD_ARRESTING_AGENCIES]: Map(),
    [LOAD_CHARGES]: Map(),
    [UPDATE_CHARGE]: Map()
  },
  /* Arrest */
  [CHARGE_DATA.ARREST_CHARGES_BY_ID]: Map(),
  [CHARGE_DATA.ARREST_CHARGES_BY_FLAG]: Map(),
  [CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE]: Map(),
  [CHARGE_DATA.ARREST_PERMISSIONS]: false,
  [CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE]: Map(),
  [CHARGE_DATA.ARREST_VIOLENT]: Map(),
  [CHARGE_DATA.BHE]: Map(),
  [CHARGE_DATA.BRE]: Map(),

  /* Arresting Agencies */
  [CHARGE_DATA.ARRESTING_AGENCIES]: Map(),

  /* Court */
  [CHARGE_DATA.COURT_CHARGES_BY_ID]: Map(),
  [CHARGE_DATA.COURT_CHARGES_BY_FLAG]: Map(),
  [CHARGE_DATA.COURT_PERMISSIONS]: false,
  [CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE]: Map(),
  [CHARGE_DATA.COURT_VIOLENT]: Map()
});

const prepareNewChargeState = (state, value, deletingCharge) => {
  const {
    charge,
    chargeEKID,
    chargeType,
    orgId,
  } = value;
  let fieldOfState = CHARGE_DATA.ARREST_CHARGES_BY_ID;
  let chargeByFlagField = CHARGE_DATA.ARREST_CHARGES_BY_FLAG;
  let violentChargeField = CHARGE_DATA.ARREST_VIOLENT;
  let maxLevelIncreaseField = CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE;
  let singleLevelIncreaseField = CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE;
  if (chargeType === CHARGE_TYPES.COURT) {
    fieldOfState = CHARGE_DATA.COURT_CHARGES_BY_ID;
    chargeByFlagField = CHARGE_DATA.COURT_CHARGES_BY_FLAG;
    violentChargeField = CHARGE_DATA.COURT_VIOLENT;
    maxLevelIncreaseField = CHARGE_DATA.COURT_MAX_LEVEL_INCREASE;
    singleLevelIncreaseField = CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE;
  }

  const {
    [BHE]: chargeIsBHE,
    [BRE]: chargeIsBRE,
    [CHARGE_IS_VIOLENT]: chargeIsViolent,
    [CHARGE_RCM_STEP_2]: chargeIsMaxLevelIncrease,
    [CHARGE_RCM_STEP_4]: chargeIsSingleLevelIncrease,
    [REFERENCE_CHARGE_DESCRIPTION]: description,
    [REFERENCE_CHARGE_STATUTE]: statute,
  } = getEntityProperties(charge,
    [
      CHARGE_IS_VIOLENT,
      CHARGE_RCM_STEP_2,
      CHARGE_RCM_STEP_4,
      BHE,
      BRE,
      REFERENCE_CHARGE_STATUTE,
      REFERENCE_CHARGE_DESCRIPTION
    ]);

  let nextState = state;

  const addChargeFromFlagField = (field) => nextState.setIn(
    [chargeByFlagField, orgId, field],
    nextState.getIn([chargeByFlagField, orgId, field], Map()).set(chargeEKID, charge)
  );

  const deleteChargeFromFlagField = (field) => nextState.setIn(
    [chargeByFlagField, orgId, field],
    nextState.getIn([chargeByFlagField, orgId, field], Map()).delete(chargeEKID)
  );

  const removeChargeStatuteInState = (field) => nextState.setIn(
    [field, orgId, statute],
    nextState.getIn([field, orgId, statute], Set()).delete(description)
  );

  const setChargeStatuteInState = (field) => nextState.setIn(
    [field, orgId, statute],
    nextState.getIn([field, orgId, statute], Set()).add(description)
  );

  if (charge.size) {
    if (deletingCharge) {
      nextState = nextState.deleteIn([fieldOfState, orgId, chargeEKID]);
      if (chargeIsViolent) {
        nextState = removeChargeStatuteInState(violentChargeField);
        nextState = deleteChargeFromFlagField(violentChargeField);
      }
      if (chargeIsMaxLevelIncrease) {
        nextState = removeChargeStatuteInState(maxLevelIncreaseField);
        nextState = deleteChargeFromFlagField(maxLevelIncreaseField);
      }
      if (chargeIsSingleLevelIncrease) {
        nextState = removeChargeStatuteInState(singleLevelIncreaseField);
        nextState = deleteChargeFromFlagField(singleLevelIncreaseField);
      }
      if (chargeIsBHE) {
        nextState = removeChargeStatuteInState(CHARGE_DATA.BHE);
        nextState = deleteChargeFromFlagField(CHARGE_DATA.BHE);
      }
      if (chargeIsBRE) {
        nextState = removeChargeStatuteInState(CHARGE_DATA.BRE);
        nextState = deleteChargeFromFlagField(CHARGE_DATA.BRE);
      }
    }
    else {
      nextState = nextState.setIn([fieldOfState, orgId, chargeEKID], charge);
      if (chargeIsViolent) {
        nextState = setChargeStatuteInState(violentChargeField);
        nextState = addChargeFromFlagField(violentChargeField);
      }
      else {
        nextState = removeChargeStatuteInState(violentChargeField);
        nextState = deleteChargeFromFlagField(violentChargeField);
      }
      if (chargeIsMaxLevelIncrease) {
        nextState = setChargeStatuteInState(maxLevelIncreaseField);
        nextState = addChargeFromFlagField(maxLevelIncreaseField);
      }
      else {
        nextState = removeChargeStatuteInState(maxLevelIncreaseField);
        nextState = deleteChargeFromFlagField(maxLevelIncreaseField);
      }
      if (chargeIsSingleLevelIncrease) {
        nextState = setChargeStatuteInState(singleLevelIncreaseField);
        nextState = addChargeFromFlagField(singleLevelIncreaseField);
      }
      else {
        nextState = removeChargeStatuteInState(singleLevelIncreaseField);
        nextState = deleteChargeFromFlagField(singleLevelIncreaseField);
      }
      if (chargeIsBHE) {
        nextState = setChargeStatuteInState(CHARGE_DATA.BHE);
        nextState = addChargeFromFlagField(CHARGE_DATA.BHE);
      }
      else {
        nextState = removeChargeStatuteInState(CHARGE_DATA.BHE);
        nextState = deleteChargeFromFlagField(CHARGE_DATA.BHE);
      }
      if (chargeIsBRE) {
        nextState = setChargeStatuteInState(CHARGE_DATA.BRE);
        nextState = addChargeFromFlagField(CHARGE_DATA.BRE);
      }
      else {
        nextState = removeChargeStatuteInState(CHARGE_DATA.BRE);
        nextState = deleteChargeFromFlagField(CHARGE_DATA.BRE);
      }
    }
  }

  return nextState;
};

export default function chargesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createCharge.case(action.type): {
      return createCharge.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CREATE_CHARGE, action.id], action)
          .setIn([REDUX.ACTIONS, CREATE_CHARGE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => prepareNewChargeState(state, action.value, false)
          .setIn([REDUX.ACTIONS, CREATE_CHARGE, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CREATE_CHARGE], error)
            .setIn([REDUX.ACTIONS, CREATE_CHARGE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CREATE_CHARGE, action.id])
      });
    }

    case loadArrestingAgencies.case(action.type): {
      return loadArrestingAgencies.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_ARRESTING_AGENCIES, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_ARRESTING_AGENCIES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const { allAgencies } = action.value;
          return state.set(CHARGE_DATA.ARRESTING_AGENCIES, allAgencies)
            .setIn([REDUX.ACTIONS, LOAD_ARRESTING_AGENCIES, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_ARRESTING_AGENCIES], error)
            .setIn([REDUX.ACTIONS, LOAD_ARRESTING_AGENCIES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_ARRESTING_AGENCIES, action.id])
      });
    }

    case deleteCharge.case(action.type): {
      return deleteCharge.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, DELETE_CHARGE, action.id], action)
          .setIn([REDUX.ACTIONS, DELETE_CHARGE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => prepareNewChargeState(state, action.value, true)
          .setIn([REDUX.ACTIONS, DELETE_CHARGE, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, DELETE_CHARGE], error)
            .setIn([REDUX.ACTIONS, DELETE_CHARGE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, DELETE_CHARGE, action.id])
      });
    }

    case importBulkCharges.case(action.type): {
      return importBulkCharges.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, IMPORT_BULK_CHARGES, action.id], action)
          .setIn([REDUX.ACTIONS, IMPORT_BULK_CHARGES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, IMPORT_BULK_CHARGES, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, IMPORT_BULK_CHARGES], error)
            .setIn([REDUX.ACTIONS, IMPORT_BULK_CHARGES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, IMPORT_BULK_CHARGES, action.id])
      });
    }

    case updateCharge.case(action.type): {
      return updateCharge.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, UPDATE_CHARGE, action.id], action)
          .setIn([REDUX.ACTIONS, UPDATE_CHARGE, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => prepareNewChargeState(state, action.value, false)
          .setIn([REDUX.ACTIONS, UPDATE_CHARGE, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, UPDATE_CHARGE], error)
            .setIn([REDUX.ACTIONS, UPDATE_CHARGE, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, UPDATE_CHARGE, action.id])
      });
    }

    case loadCharges.case(action.type): {
      return loadCharges.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, LOAD_CHARGES, action.id], action)
          .setIn([REDUX.ACTIONS, LOAD_CHARGES, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => {
          const {
            arrestChargesById,
            arrestChargesByFlag,
            arrestChargePermissions,
            arrestMaxLevelIncreaseCharges,
            arrestSingleLevelIncreaseCharges,
            bookingHoldExceptionCharges,
            bookingReleaseExceptionCharges,
            courtChargesById,
            courtChargesByFlag,
            courtChargePermissions,
            courtMaxLevelIncreaseCharges,
            courtSingleLevelIncreaseCharges,
            violentArrestCharges,
            violentCourtCharges,
            selectedOrgId
          } = action.value;
          return state
            /* Arrest */
            .set(CHARGE_DATA.ARREST_PERMISSIONS, arrestChargePermissions)
            .setIn([CHARGE_DATA.ARREST_CHARGES_BY_ID, selectedOrgId], arrestChargesById)
            .setIn([CHARGE_DATA.ARREST_CHARGES_BY_FLAG, selectedOrgId], arrestChargesByFlag)
            .setIn([CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE, selectedOrgId], arrestMaxLevelIncreaseCharges)
            .setIn([CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE, selectedOrgId], arrestSingleLevelIncreaseCharges)
            .setIn([CHARGE_DATA.ARREST_VIOLENT, selectedOrgId], violentArrestCharges)
            .setIn([CHARGE_DATA.BHE, selectedOrgId], bookingHoldExceptionCharges)
            .setIn([CHARGE_DATA.BRE, selectedOrgId], bookingReleaseExceptionCharges)
            /* Court */
            .set(CHARGE_DATA.COURT_PERMISSIONS, courtChargePermissions)
            .setIn([CHARGE_DATA.COURT_CHARGES_BY_ID, selectedOrgId], courtChargesById)
            .setIn([CHARGE_DATA.COURT_CHARGES_BY_FLAG, selectedOrgId], courtChargesByFlag)
            .setIn([CHARGE_DATA.COURT_MAX_LEVEL_INCREASE, selectedOrgId], courtMaxLevelIncreaseCharges)
            .setIn([CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE, selectedOrgId], courtSingleLevelIncreaseCharges)
            .setIn([CHARGE_DATA.COURT_VIOLENT, selectedOrgId], violentCourtCharges)
            .setIn([REDUX.ACTIONS, LOAD_CHARGES, REDUX.REQUEST_STATE], SUCCESS);
        },
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, LOAD_CHARGES], error)
            .setIn([REDUX.ACTIONS, LOAD_CHARGES, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, LOAD_CHARGES, action.id])
      });
    }

    default:
      return state;
  }
}
