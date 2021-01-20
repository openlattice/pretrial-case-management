/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { EntityDataModelApiActions } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { EDM } from '../utils/consts/FrontEndStateConsts';

const { getAllPropertyTypes } = EntityDataModelApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  [EDM.FQN_TO_ID]: Map(),
  [EDM.IS_FETCHING_PROPERTY_TYPES]: false,
  [EDM.PROPERTY_TYPES_BY_ID]: Map(),
});

export default function edmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getAllPropertyTypes.case(action.type): {
      return getAllPropertyTypes.reducer(state, action, {
        REQUEST: () => state.set(EDM.IS_FETCHING_PROPERTY_TYPES, true),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);
          const propertyTypes :List<Map<*, *>> = fromJS(seqAction.value);
          const propertyTypesById :Map<string, number> = Map().asMutable();
          const fqnToIdMap :Map<string, string> = Map().asMutable();
          propertyTypes.forEach((propertyType :Map<*, *>) => {
            propertyTypesById.set(propertyType.get('id'), propertyType);
            fqnToIdMap.set(`${propertyType.getIn(['type', 'namespace'])}.${propertyType.getIn(['type', 'name'])}`, propertyType.get('id'));
          });
          return state
            .set(EDM.FQN_TO_ID, fqnToIdMap.asImmutable())
            .set(EDM.PROPERTY_TYPES_BY_ID, propertyTypesById.asImmutable());
        },
        FAILURE: () => state
          .set(EDM.FQN_TO_ID, Map())
          .set(EDM.PROPERTY_TYPES_BY_ID, Map()),
        FINALLY: () => state.set(EDM.IS_FETCHING_PROPERTY_TYPES, false)
      });
    }

    default:
      return state;
  }
}
