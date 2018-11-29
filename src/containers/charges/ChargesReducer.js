/*
 * @flow
 */
import { Map, fromJS } from 'immutable';

import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { loadCharges } from './ChargesActionFactory';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CHARGES.ARREST]: Map(),
  [CHARGES.COURT]: Map(),
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
          const { arrestCharges, courtCharges, selectedOrgId } = action.value;
          return state
            .setIn([CHARGES.ARREST, selectedOrgId], arrestCharges)
            .setIn([CHARGES.COURT, selectedOrgId], courtCharges);
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
