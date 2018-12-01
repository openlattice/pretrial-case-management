/*
 * @flow
 */
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import { Map, Set, fromJS } from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { LOAD_CHARGES, loadCharges } from './ChargesActionFactory';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;

/*
 * loadCharges()
 */

function* loadChargesWorker(action :SequenceAction) :Generator<*, *, *> {
  let violentArrestCharges = Map();
  let violentCourtCharges = Map();
  let dmfStep2Charges = Map();
  let dmfStep4Charges = Map();
  let bookingReleaseExceptionCharges = Map();
  let bookingHoldExceptionCharges = Map();
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
    arrestCharges = fromJS(arrestCharges.data);
    courtCharges = fromJS(courtCharges.data);

    // Collect violent, dmf, bhe and bre lists for arrest charges
    arrestCharges.forEach((charge) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
      if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
        violentArrestCharges = violentArrestCharges.set(
          statute,
          violentArrestCharges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_2, 0], false)) {
        dmfStep2Charges = dmfStep2Charges.set(
          statute,
          dmfStep2Charges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.CHARGE_DMF_STEP_4, 0], false)) {
        dmfStep4Charges = dmfStep4Charges.set(
          statute,
          dmfStep4Charges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.BRE, 0], false)) {
        bookingReleaseExceptionCharges = bookingReleaseExceptionCharges.set(
          statute,
          bookingReleaseExceptionCharges.get(statute, Set()).add(description)
        );
      }
      if (charge.getIn([PROPERTY_TYPES.BHE, 0], false)) {
        bookingHoldExceptionCharges = bookingHoldExceptionCharges.set(
          statute,
          bookingHoldExceptionCharges.get(statute, Set()).add(description)
        );
      }
    });

    // Collect violent list for court charges
    courtCharges.forEach((charge) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
      if (charge.getIn([PROPERTY_TYPES.CHARGE_IS_VIOLENT, 0], false)) {
        violentCourtCharges = violentCourtCharges.set(
          statute,
          violentCourtCharges.get(statute, Set()).add(description)
        );
      }
    });

    yield put(loadCharges.success(action.id, {
      arrestCharges,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      courtCharges,
      dmfStep2Charges,
      dmfStep4Charges,
      selectedOrgId,
      violentArrestCharges,
      violentCourtCharges
    }));
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
