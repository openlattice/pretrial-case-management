/*
 * @flow
 */
import { Map, fromJS } from 'immutable';

import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { loadCharges } from './ChargesActionFactory';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CHARGES.ARREST]: Map(),
  [CHARGES.COURT]: Map(),
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

    case loadCharges.case(action.type): {
      return loadCharges.reducer(state, action, {
        REQUEST: () => state
          .set(CHARGES.ARREST, Map())
          .set(CHARGES.COURT, Map())
          .set(CHARGES.LOADING, true),

        SUCCESS: () => {
          const {
            arrestCharges,
            bookingHoldExceptionCharges,
            bookingReleaseExceptionCharges,
            courtCharges,
            dmfStep2Charges,
            dmfStep4Charges,
            selectedOrgId,
            violentArrestCharges,
            violentCourtCharges
          } = action.value;
          return state
            .setIn([CHARGES.ARREST, selectedOrgId], arrestCharges)
            .setIn([CHARGES.BHE, selectedOrgId], bookingHoldExceptionCharges)
            .setIn([CHARGES.BRE, selectedOrgId], bookingReleaseExceptionCharges)
            .setIn([CHARGES.COURT, selectedOrgId], courtCharges)
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
