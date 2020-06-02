/*
 * @flow
 */

import { fromJS, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import {
  CREATE_ASSOCIATIONS,
  DELETE_ENTITY,
  createAssociations,
  deleteEntity
} from './DataActions';


import { REDUX } from '../consts/redux/SharedConsts';


const {
  FAILURE,
  PENDING,
  STANDBY,
  SUCCESS
} = RequestStates;


const INITIAL_STATE :Map<*, *> = fromJS({
  [REDUX.ACTIONS]: {
    [CREATE_ASSOCIATIONS]: {
      [REDUX.REQUEST_STATE]: STANDBY
    },
    [DELETE_ENTITY]: {
      [REDUX.REQUEST_STATE]: STANDBY
    }
  },
  [REDUX.ERRORS]: {
    [CREATE_ASSOCIATIONS]: null,
    [DELETE_ENTITY]: null,
  }
});

function submitReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case createAssociations.case(action.type): {
      return createAssociations.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, CREATE_ASSOCIATIONS, action.id], action)
          .setIn([REDUX.ACTIONS, CREATE_ASSOCIATIONS, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, CREATE_ASSOCIATIONS, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, CREATE_ASSOCIATIONS], error)
            .setIn([REDUX.ACTIONS, CREATE_ASSOCIATIONS, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, CREATE_ASSOCIATIONS, action.id])
      });
    }

    case deleteEntity.case(action.type): {
      return deleteEntity.reducer(state, action, {
        REQUEST: () => state
          .setIn([REDUX.ACTIONS, DELETE_ENTITY, action.id], action)
          .setIn([REDUX.ACTIONS, DELETE_ENTITY, REDUX.REQUEST_STATE], PENDING),
        SUCCESS: () => state
          .setIn([REDUX.ACTIONS, DELETE_ENTITY, REDUX.REQUEST_STATE], SUCCESS),
        FAILURE: () => {
          const { error } = action.value;
          return state
            .setIn([REDUX.ERRORS, DELETE_ENTITY], error)
            .setIn([REDUX.ACTIONS, DELETE_ENTITY, REDUX.REQUEST_STATE], FAILURE);
        },
        FINALLY: () => state
          .deleteIn([REDUX.ACTIONS, DELETE_ENTITY, action.id])
      });
    }

    default:
      return state;
  }
}

export default submitReducer;
