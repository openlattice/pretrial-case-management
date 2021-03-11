import { call, put } from '@redux-saga/core/effects';
import { Map } from 'immutable';

import { loadPersonDetails } from './PersonActions';
import { loadCaseHistory, loadPersonDetailsWorker } from './PersonSagas';

import { GET_PEOPLE_NEIGHBORS } from '../people/PeopleActions';

describe('loadPersonDetailsWorker', () => {

  test('should call loadCaseHistory() when shouldLoadCases is true', () => {

    let step;
    const mockAction = loadPersonDetails({ entityKeyId: 'mock-ekid', shouldLoadCases: true });

    const iterator = loadPersonDetailsWorker(mockAction);
    step = iterator.next();
    step = iterator.next(Map());
    expect(step.value).toEqual(
      put({
        id: mockAction.id,
        type: loadPersonDetails.REQUEST,
        value: mockAction.value
      })
    );

    step = iterator.next();
    expect(step.value).toEqual(
      call(loadCaseHistory, mockAction.value.entityKeyId)
    );
  });

  test('should not call loadCaseHistory() when shouldLoadCases is false', () => {

    let step;
    const mockAction = loadPersonDetails({ entityKeyId: 'mock-ekid', shouldLoadCases: false });

    const iterator = loadPersonDetailsWorker(mockAction);
    step = iterator.next();
    step = iterator.next(Map());
    expect(step.value).toEqual(
      put({
        id: mockAction.id,
        type: loadPersonDetails.REQUEST,
        value: mockAction.value
      })
    );

    step = iterator.next();
    expect(step.value).toEqual(
      put({
        id: expect.any(String),
        type: GET_PEOPLE_NEIGHBORS,
        value: { peopleEKIDs: [mockAction.value.entityKeyId] },
      })
    );
  });
});
