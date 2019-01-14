/*
 * @flow
 */
import { Map, Set, fromJS } from 'immutable';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { deleteCharge, loadCharges, updateCharge } from './ChargesActionFactory';

const INITIAL_STATE :Map<*, *> = fromJS({
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
  [CHARGES.LOADING]: false
});

export default function chargesReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) {
  switch (action.type) {

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
          let newState = state
            .setIn([chargePropertyType, selectedOrganizationId, entityKeyId], charge);
          if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
            if (chargePropertyType === CHARGES.ARREST) {
              newState = newState.setIn(
                [CHARGES.ARREST_VIOLENT, selectedOrganizationId, statute],
                newState.getIn([CHARGES.ARREST_VIOLENT, selectedOrganizationId, statute], Set()).add(description)
              );
            }
            else if (chargePropertyType === CHARGES.COURT) {
              newState = newState.setIn(
                [CHARGES.COURT_VIOLENT, selectedOrganizationId, statute],
                newState.getIn([CHARGES.ARREST_VIOLENT, selectedOrganizationId, statute], Set()).add(description)
              );
            }
          }
          if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_2, 0], false)) {
            newState = newState.setIn(
              [CHARGES.DMF_STEP_2, selectedOrganizationId, statute],
              newState.getIn([CHARGES.DMF_STEP_2, selectedOrganizationId, statute], Set()).add(description)
            );
          }
          else if (newState.getIn([CHARGES.DMF_STEP_2, selectedOrganizationId, statute])) {
            newState = newState.setIn(
              [CHARGES.DMF_STEP_2, selectedOrganizationId, statute],
              newState.getIn([CHARGES.DMF_STEP_2, selectedOrganizationId, statute], Set()).delete(description)
            );
          }
          if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_4, 0], false)) {
            newState = newState.setIn(
              [CHARGES.DMF_STEP_4, selectedOrganizationId, statute],
              newState.getIn([CHARGES.DMF_STEP_4, selectedOrganizationId, statute], Set()).add(description)
            );
          }
          else if (newState.getIn([CHARGES.DMF_STEP_4, selectedOrganizationId, statute])) {
            newState = newState.setIn(
              [CHARGES.DMF_STEP_4, selectedOrganizationId, statute],
              newState.getIn([CHARGES.DMF_STEP_4, selectedOrganizationId, statute], Set()).delete(description)
            );
          }
          if (charge.getIn([PROPERTY_TYPES.BRE, 0], false)) {
            newState = newState.setIn(
              [CHARGES.BRE, selectedOrganizationId, statute],
              newState.getIn([CHARGES.BRE, selectedOrganizationId, statute], Set()).add(description)
            );
          }
          else if (newState.getIn([CHARGES.BRE, selectedOrganizationId, statute])) {
            newState = newState.setIn(
              [CHARGES.BRE, selectedOrganizationId, statute],
              newState.getIn([CHARGES.BRE, selectedOrganizationId, statute], Set()).delete(description)
            );
          }
          if (charge.getIn([PROPERTY_TYPES.BHE, 0], false)) {
            newState = newState.setIn(
              [CHARGES.BHE, selectedOrganizationId, statute],
              newState.getIn([CHARGES.BHE, selectedOrganizationId, statute], Set()).add(description)
            );
          }
          else if (newState.getIn([CHARGES.BHE, selectedOrganizationId, statute])) {
            newState = newState.setIn(
              [CHARGES.BHE, selectedOrganizationId, statute],
              newState.getIn([CHARGES.BHE, selectedOrganizationId, statute], Set()).delete(description)
            );
          }
          console.log(newState.toJS());
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
