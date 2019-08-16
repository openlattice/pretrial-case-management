/*
 * @flow
 */
import axios from 'axios';
import moment from 'moment';
import { fromJS, Map, Set } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { DataApi, SearchApi } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_PROFILE,
  ENROLL_VOICE,
  getProfile,
  enrollVoice
} from './EnrollActionFactory';

import { toISODateTime } from '../../utils/FormattingUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP_DATA.SELECTED_ORG_ID], '');

const CHECKINS_BASE_URL = 'https://api.openlattice.com/checkins/voice';

const getHeaders = () => ({
  Authorization: `Bearer ${AuthUtils.getAuthToken()}`
});

function* getPin(id) {
  const response = yield call(axios, {
    method: 'get',
    url: `${CHECKINS_BASE_URL}/pin?profileEntityKeyId=${id}`,
    headers: getHeaders()
  });
  return response.data;
}

function* getOrCreateProfileEntity(personEntityKeyId :string) :Generator<*, *, *> {
  const app = yield select(getApp);
  const edm = yield select(getEDM);
  const orgId = yield select(getOrgId);

  const entitySetIdsToAppType = app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]);
  const peopleEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.PEOPLE);
  const enrollVoiceEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);

  const generalIdPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.GENERAL_ID);
  const pinPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.PIN);

  try {
    const peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [enrollVoiceEntitySetId],
      destinationEntitySetIds: []
    });
    const personNeighbors = fromJS(Object.values(peopleNeighborsById)[0] || []);

    let voiceProfile;
    let isCreating = false;

    if (personNeighbors.size) {

      personNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === APP_TYPES.SPEAKER_RECOGNITION_PROFILES) {

          const profileEntityKeyId = neighborObj.getIn([PROPERTY_TYPES.ENTITY_KEY_ID, 0], '');
          const pin = neighborObj.getIn([PROPERTY_TYPES.PIN, 0], undefined);
          const numSubmissions = neighborObj.get(PROPERTY_TYPES.AUDIO_SAMPLE, Set()).size;

          voiceProfile = { profileEntityKeyId, pin, numSubmissions };
        }
      });
    }

    if (!voiceProfile) {
      isCreating = true;

      const newProfileEntity = { [generalIdPropertyId]: [] };
      const [profileEntityKeyId] = yield call(DataApi.createOrMergeEntityData,
        enrollVoiceEntitySetId,
        [newProfileEntity]);

      voiceProfile = {
        profileEntityKeyId,
        pin: undefined,
        numSubmissions: 0
      };
    }

    const { pin, profileEntityKeyId } = voiceProfile;

    if (!pin) {
      let newPin = yield call(getPin, profileEntityKeyId);
      newPin = `${newPin}`;
      voiceProfile.pin = newPin;
      yield call(DataApi.updateEntityData,
        enrollVoiceEntitySetId,
        { [profileEntityKeyId]: { [pinPropertyId]: [newPin] } },
        'PartialReplace');
    }

    return { voiceProfile, isCreating };
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

export function* getProfileWorker(action :SequenceAction) :Generator<*, *, *> {
  yield put(getProfile.request(action.id));
  const { personId, personEntityKeyId } = action.value;
  try {

    const app = yield select(getApp);
    const edm = yield select(getEDM);

    const peopleEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.PEOPLE);
    const enrollVoiceEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);
    const registeredForEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.REGISTERED_FOR);
    const completedDateTimePropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.COMPLETED_DATE_TIME);

    const { voiceProfile, isCreating } = yield call(getOrCreateProfileEntity, personEntityKeyId);

    /* Create new profile entity with pin */
    if (isCreating) {

      const { profileEntityKeyId } = voiceProfile;

      const getEntityDataKey = (entitySetId, entityKeyId) => ({ entitySetId, entityKeyId });

      yield call(DataApi.createAssociations, {
        [registeredForEntitySetId]: [{
          data: { [completedDateTimePropertyId]: [toISODateTime(moment())] },
          src: getEntityDataKey(enrollVoiceEntitySetId, profileEntityKeyId),
          dst: getEntityDataKey(peopleEntitySetId, personEntityKeyId)
        }]
      });
    }

    yield put(getProfile.success(action.id, voiceProfile));
  }
  catch (error) {
    console.error(error);
    yield put(getProfile.failure(
      action.id,
      { error: `Unable to load or create profile for user with id ${personId}.` }
    ));
  }
  finally {
    yield put(getProfile.finally(action.id));
  }
}

function* getProfileWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PROFILE, getProfileWorker);
}

function bufferToString(arrayBuffer :ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const CHUNK_SZ = 0x8000;
  const c = [];
  for (let i = 0; i < uint8Array.length; i += CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, uint8Array.subarray(i, i + CHUNK_SZ)));
  }
  return c.join('');
}

export function* enrollVoiceWorker(action :SequenceAction) :Generator<*, *, *> {
  yield put(enrollVoice.request(action.id));
  const {
    profileEntityKeyId,
    audio
  } = action.value;

  try {
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const profileEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);
    const audioPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.AUDIO_SAMPLE);

    const profileEntity = {
      [profileEntityKeyId]: {
        [audioPropertyId]: [
          {
            'content-type': 'audio/wav',
            data: window.btoa(bufferToString(audio))
          }
        ]
      }
    };


    const enrollRequest = {
      method: 'post',
      url: `${CHECKINS_BASE_URL}/profile/${profileEntityKeyId}`,
      headers: Object.assign({}, getHeaders(), { 'Content-Type': 'multipart/form-data' }),
      data: audio
    };
    yield call(axios, enrollRequest);

    yield call(DataApi.updateEntityData, profileEntitySetId, profileEntity, 'Merge');

    const profile = yield call(DataApi.getEntityData, profileEntitySetId, profileEntityKeyId);
    const numSubmissions = (profile[PROPERTY_TYPES.AUDIO_SAMPLE] || []).length;

    yield put(enrollVoice.success(action.id, { numSubmissions }));

  }
  catch (error) {
    console.error(error);
    yield put(enrollVoice.failure(
      action.id,
      { error: 'Audio submission was not successful. Please re-record and try again.' }
    ));
  }
  finally {
    yield put(enrollVoice.finally(action.id));
  }
}


function* enrollVoiceWatcher() :Generator<*, *, *> {
  yield takeEvery(ENROLL_VOICE, enrollVoiceWorker);
}

export {
  getProfileWatcher,
  enrollVoiceWatcher
};
