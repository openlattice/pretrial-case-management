/*
 * @flow
 */
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import {
  createCharge,
  deleteCharge,
  loadArrestingAgencies,
  loadCharges,
  updateCharge
} from './ChargesActionFactory';

const {
  BHE,
  BRE,
  CHARGE_IS_VIOLENT,
  CHARGE_DMF_STEP_2,
  CHARGE_DMF_STEP_4,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
} = PROPERTY_TYPES;

const INITIAL_STATE :Map<*, *> = fromJS({
  [CHARGES.ARRESTING_AGENCIES]: Map(),
  [CHARGES.LOADING_AGENCIES]: false,
  [CHARGES.ARREST]: Map(),
  [CHARGES.ARREST_PERMISSIONS]: false,
  [CHARGES.COURT]: Map(),
  [CHARGES.COURT_PERMISSIONS]: false,
  [CHARGES.ARREST_VIOLENT]: Map(),
  [CHARGES.COURT_VIOLENT]: Map(),
  [CHARGES.DMF_STEP_2]: Map(),
  [CHARGES.DMF_STEP_4]: Map(),
  [CHARGES.BRE]: Map(),
  [CHARGES.BHE]: Map(),
  [CHARGES.LOADING]: false,
  [CHARGES.SUBMITTING_CHARGE]: false,
  [CHARGES.UPDATING_CHARGE]: false,
});

const CHARGE_PT_PAIRS = {
  [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: CHARGES.DMF_STEP_2,
  [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: CHARGES.DMF_STEP_4,
  [PROPERTY_TYPES.BRE]: CHARGES.BRE,
  [PROPERTY_TYPES.BHE]: CHARGES.BHE
};

export default function chargesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createCharge.case(action.type): {
      return createCharge.reducer(state, action, {
        REQUEST: () => state.set(CHARGES.SUBMITTING_CHARGE, true),
        SUCCESS: () => {
          const {
            charge,
            chargeEKID,
            chargeType,
            orgId
          } = action.value;
          const fieldOfState = chargeType === CHARGE_TYPES.COURT ? CHARGES.COURT : CHARGES.ARREST;

          const {
            [BHE]: chargeIsBHE,
            [BRE]: chargeIsBRE,
            [CHARGE_IS_VIOLENT]: chargeIsViolent,
            [CHARGE_DMF_STEP_2]: chargeIsStep2,
            [CHARGE_DMF_STEP_4]: chargeIsStep4,
            [REFERENCE_CHARGE_DESCRIPTION]: description,
            [REFERENCE_CHARGE_STATUTE]: statute
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

          const setChargeInState = field => nextState.setIn(
            [field, orgId, statute],
            nextState.getIn([field, orgId, statute], List()).push(description)
          );

          if (charge.size) {
            nextState = nextState.setIn([fieldOfState, orgId, chargeEKID], charge);

            if (chargeIsViolent) {
              nextState = chargeType === CHARGE_TYPES.COURT
                ? setChargeInState(CHARGES.COURT_VIOLENT)
                : setChargeInState(CHARGES.ARREST_VIOLENT);
            }
            if (chargeIsStep2) nextState = setChargeInState(CHARGES.DMF_STEP_2);
            if (chargeIsStep4) nextState = setChargeInState(CHARGES.DMF_STEP_4);
            if (chargeIsBHE) nextState = setChargeInState(CHARGES.BHE);
            if (chargeIsBRE) nextState = setChargeInState(CHARGES.BRE);
          }

          return nextState;
        },
        FINALLY: () => state.set(CHARGES.SUBMITTING_CHARGE, false)
      });
    }

    case loadArrestingAgencies.case(action.type): {
      return loadArrestingAgencies.reducer(state, action, {
        REQUEST: () => state.set(CHARGES.LOADING_AGENCIES, true),
        SUCCESS: () => {
          const { allAgencies } = action.value;
          return state.set(CHARGES.ARRESTING_AGENCIES, allAgencies);
        },
        FINALLY: () => state.set(CHARGES.LOADING_AGENCIES, false)
      });
    }

    case deleteCharge.case(action.type): {
      return deleteCharge.reducer(state, action, {
        SUCCESS: () => {
          const { entityKeyId, selectedOrganizationId, chargePropertyType } = action.value;
          return state.deleteIn([chargePropertyType, selectedOrganizationId, entityKeyId]);
        }
      });
    }

    case updateCharge.case(action.type): {
      return updateCharge.reducer(state, action, {
        SUCCESS: () => {
          const {
            entity,
            entityKeyId,
            selectedOrganizationId,
            chargePropertyType
          } = action.value;
          const charge = fromJS(entity);

          const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
          const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');

          let newState = state.setIn([chargePropertyType, selectedOrganizationId, entityKeyId], charge);

          if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
            const chargeField = chargePropertyType === CHARGES.ARREST ? CHARGES.ARREST_VIOLENT : CHARGES.COURT_VIOLENT;
            newState = newState.setIn(
              [chargeField, selectedOrganizationId, statute],
              newState.getIn([chargeField, selectedOrganizationId, statute], Set()).add(description)
            );
          }

          Object.entries(CHARGE_PT_PAIRS).forEach(([propertyType, chargeField]) => {
            let descriptions = newState.getIn([chargeField, selectedOrganizationId, statute], Set());
            if (charge.getIn([propertyType, 0], false)) {
              descriptions = descriptions.add(description);
            }
            else if (newState.getIn([chargeField, selectedOrganizationId, statute])) {
              descriptions = descriptions.delete(description);
            }
            newState = newState.setIn([chargeField, selectedOrganizationId, statute], descriptions);
          });
          return newState;
        }
      });
    }

    case loadCharges.case(action.type): {
      return loadCharges.reducer(state, action, {
        REQUEST: () => {
          const updating = !!state.get(CHARGES.ARREST).size && !!state.get(CHARGES.COURT).size;
          if (updating) return state;
          return state
            .set(CHARGES.ARREST, Map())
            .set(CHARGES.COURT, Map())
            .set(CHARGES.LOADING, true);
        },

        SUCCESS: () => {
          const {
            arrestChargesByEntityKeyId,
            arrestChargePermissions,
            bookingHoldExceptionCharges,
            bookingReleaseExceptionCharges,
            courtChargesByEntityKeyId,
            courtChargePermissions,
            dmfStep2Charges,
            dmfStep4Charges,
            selectedOrgId,
            violentArrestCharges,
            violentCourtCharges
          } = action.value;
          return state
            .setIn([CHARGES.ARREST, selectedOrgId], arrestChargesByEntityKeyId)
            .set(CHARGES.ARREST_PERMISSIONS, arrestChargePermissions)
            .setIn([CHARGES.BHE, selectedOrgId], bookingHoldExceptionCharges)
            .setIn([CHARGES.BRE, selectedOrgId], bookingReleaseExceptionCharges)
            .setIn([CHARGES.COURT, selectedOrgId], courtChargesByEntityKeyId)
            .set(CHARGES.COURT_PERMISSIONS, courtChargePermissions)
            .setIn([CHARGES.DMF_STEP_2, selectedOrgId], dmfStep2Charges)
            .setIn([CHARGES.DMF_STEP_4, selectedOrgId], dmfStep4Charges)
            .setIn([CHARGES.ARREST_VIOLENT, selectedOrgId], violentArrestCharges)
            .setIn([CHARGES.COURT_VIOLENT, selectedOrgId], violentCourtCharges);
        },
        FAILURE: () => state
          .set(CHARGES.ARREST, Map())
          .set(CHARGES.COURT, Map())
          .set(CHARGES.LOADING, false),
        FINALLY: () => state.set(CHARGES.LOADING, false)
      });
    }

    default:
      return state;
  }
}
