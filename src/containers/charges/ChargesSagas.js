/*
 * @flow
 */
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { call, put, takeEvery } from 'redux-saga/effects';

import { LOAD_CHARGES, loadCharges } from './ChargesActionFactory';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

/*
 * loadCharges()
 */

function* loadChargesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const { arrestChargesEntitySetId, courtChargesEntitySetId, selectedOrgId } = value;
  if (value === null || value === undefined) {
    yield put(loadCharges.failure(id, 'ERR_ACTION_VALUE_NOT_DEFINED'));
    return;
  }

  try {
    yield put(loadCharges.request(action.id));

    let arrestCharges = yield call(
      getEntitySetDataWorker,
      getEntitySetData({ entitySetId: arrestChargesEntitySetId })
    );
    let courtCharges = yield call(
      getEntitySetDataWorker,
      getEntitySetData({ entitySetId: courtChargesEntitySetId })
    );
    const chargeError = arrestCharges.error || courtCharges.error;
    if (chargeError) throw chargeError;

    // reset values to data
    arrestCharges = arrestCharges.data;
    courtCharges = courtCharges.data;
    yield put(loadCharges.success(action.id, { selectedOrgId, arrestCharges, courtCharges }));
  }
  catch (error) {
    yield put(loadCharges.failure(action.id, error));
  }
  finally {
    yield put(loadCharges.finally(action.id));
  }
}

function* loadChargesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_CHARGES, loadChargesWorker);
}

export {
  loadChargesWatcher
};
