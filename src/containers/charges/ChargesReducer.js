/* @flow */
import { RequestStates } from 'redux-reqseq';
import {
  Set,
  Map,
  fromJS
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  CREATE_CHARGE,
  DELETE_CHARGE,
  LOAD_ARRESTING_AGENCIES,
  LOAD_CHARGES,
  UPDATE_CHARGE,
  createCharge,
  deleteCharge,
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
  CHARGE_DMF_STEP_2,
  CHARGE_DMF_STEP_4,
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

// const INITIAL_STATE :Map<*, *> = fromJS({
//   [CHARGES.ARRESTING_AGENCIES]: Map(),
//   [CHARGES.LOADING_AGENCIES]: false,
//   [CHARGES.ARREST]: Map(),
//   [CHARGES.ARREST_PERMISSIONS]: false,
//   [CHARGES.COURT]: Map(),
//   [CHARGES.COURT_PERMISSIONS]: false,
//   [CHARGES.ARREST_VIOLENT]: Map(),
//   [CHARGES.COURT_VIOLENT]: Map(),
//   [CHARGES.DMF_STEP_2]: Map(),
//   [CHARGES.DMF_STEP_4]: Map(),
//   [CHARGES.BRE]: Map(),
//   [CHARGES.BHE]: Map(),
//   [CHARGES.LOADING]: false,
//   [CHARGES.SUBMITTING_CHARGE]: false,
//   [CHARGES.UPDATING_CHARGE]: false,
// });

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
    [CHARGE_DMF_STEP_2]: chargeIsMaxLevelIncrease,
    [CHARGE_DMF_STEP_4]: chargeIsSingleLevelIncrease,
    [REFERENCE_CHARGE_DESCRIPTION]: description,
    [REFERENCE_CHARGE_STATUTE]: statute,
  } = getEntityProperties(charge,
    [
      CHARGE_IS_VIOLENT,
      CHARGE_DMF_STEP_2,
      CHARGE_DMF_STEP_4,
      BHE,
      BRE,
      REFERENCE_CHARGE_STATUTE,
      REFERENCE_CHARGE_DESCRIPTION
    ]);

  let nextState = state;

  const setChargeInState = (field) => nextState.setIn(
    [field, orgId, statute],
    nextState.getIn([field, orgId, statute], Set()).add(description)
  );

  const removeChargeInState = (field) => nextState.setIn(
    [field, orgId, statute],
    nextState.getIn([field, orgId, statute], Set()).delete(description)
  );

  if (charge.size) {
    if (deletingCharge) {
      nextState = nextState.deleteIn([fieldOfState, orgId, chargeEKID]);
      if (chargeIsViolent) {
        nextState = removeChargeInState(violentChargeField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, violentChargeField],
          nextState.getIn([chargeByFlagField, orgId, violentChargeField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsMaxLevelIncrease) {
        nextState = removeChargeInState(maxLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, maxLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, maxLevelIncreaseField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsSingleLevelIncrease) {
        nextState = removeChargeInState(singleLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, singleLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, singleLevelIncreaseField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsBHE) {
        nextState = removeChargeInState(CHARGE_DATA.BHE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BHE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BHE], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsBRE) {
        nextState = removeChargeInState(CHARGE_DATA.BRE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BRE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BRE], Set()).delete(chargeEKID)
        );
      }
    }
    else {
      nextState = nextState.setIn([fieldOfState, orgId, chargeEKID], charge);
      if (chargeIsViolent) {
        nextState = setChargeInState(violentChargeField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, violentChargeField],
          nextState.getIn([chargeByFlagField, orgId, violentChargeField], Set()).add(chargeEKID)
        );
      }
      else {
        nextState = removeChargeInState(violentChargeField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, violentChargeField],
          nextState.getIn([chargeByFlagField, orgId, violentChargeField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsMaxLevelIncrease) {
        nextState = setChargeInState(maxLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, maxLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, maxLevelIncreaseField], Set()).add(chargeEKID)
        );
      }
      else {
        nextState = removeChargeInState(maxLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, maxLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, maxLevelIncreaseField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsSingleLevelIncrease) {
        nextState = setChargeInState(singleLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, singleLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, singleLevelIncreaseField], Set()).add(chargeEKID)
        );
      }
      else {
        nextState = removeChargeInState(singleLevelIncreaseField);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, singleLevelIncreaseField],
          nextState.getIn([chargeByFlagField, orgId, singleLevelIncreaseField], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsBHE) {
        nextState = setChargeInState(CHARGE_DATA.BHE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BHE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BHE], Set()).add(chargeEKID)
        );
      }
      else {
        nextState = removeChargeInState(CHARGE_DATA.BHE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BHE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BHE], Set()).delete(chargeEKID)
        );
      }
      if (chargeIsBRE) {
        nextState = setChargeInState(CHARGE_DATA.BRE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BRE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BRE], Set()).add(chargeEKID)
        );
      }
      else {
        nextState = removeChargeInState(CHARGE_DATA.BRE);
        nextState = nextState.setIn(
          [chargeByFlagField, orgId, CHARGE_DATA.BRE],
          nextState.getIn([chargeByFlagField, orgId, CHARGE_DATA.BRE], Set()).delete(chargeEKID)
        );
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
          return state.set(CHARGES.ARRESTING_AGENCIES, allAgencies)
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
