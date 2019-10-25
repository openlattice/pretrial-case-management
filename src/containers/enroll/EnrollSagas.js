/*
 * @flow
 */
import axios from 'axios';
import { DateTime } from 'luxon';
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

function* createVoiceProfile(personEntityKeyId) {
  const response = yield call(axios, {
    method: 'get',
    url: `${CHECKINS_BASE_URL}/profile?personEntityKeyId=${personEntityKeyId}`,
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
  const registeredForEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.REGISTERED_FOR);

  const generalIdPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.GENERAL_ID);
  const pinPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.PIN);
  const completedDateTimePropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.COMPLETED_DATE_TIME);

  try {

    /* Step 1: attempt to load an existing voice profile from the person's neighbors. */

    const peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [enrollVoiceEntitySetId],
      destinationEntitySetIds: []
    });
    const personNeighbors = fromJS(Object.values(peopleNeighborsById)[0] || []);

    let existingVoiceProfile;

    if (personNeighbors.size) {

      personNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === APP_TYPES.SPEAKER_RECOGNITION_PROFILES) {

          const profileEntityKeyId = neighborObj.getIn([PROPERTY_TYPES.ENTITY_KEY_ID, 0], '');
          const pin = neighborObj.getIn([PROPERTY_TYPES.PIN, 0], undefined);
          const numSubmissions = neighborObj.get(PROPERTY_TYPES.AUDIO_SAMPLE, Set()).size;

          existingVoiceProfile = { profileEntityKeyId, pin, numSubmissions };
        }
      });
    }

    if (existingVoiceProfile) {
      return existingVoiceProfile;
    }

    /* Step 2: if there is no existing voice profile, create a new one. */

    const { pin, profileId } = yield call(createVoiceProfile, personEntityKeyId);

    const newProfileEntity = {
      [generalIdPropertyId]: [profileId],
      [pinPropertyId]: [`${pin}`]
    };

    const { entityKeyIds } = yield call(DataApi.createEntityAndAssociationData, {
      entities: { [enrollVoiceEntitySetId]: [newProfileEntity] },
      associations: {
        [registeredForEntitySetId]: [{
          srcEntitySetId: enrollVoiceEntitySetId,
          srcEntityIndex: 0,
          dstEntitySetId: peopleEntitySetId,
          dstEntityKeyId: personEntityKeyId,
          data: { [completedDateTimePropertyId]: [DateTime.local().toISO()] }
        }]
      }
    });

    const [profileEntityKeyId] = entityKeyIds[enrollVoiceEntitySetId];

    return {
      profileEntityKeyId,
      pin,
      numSubmissions: 0
    };

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

    const voiceProfile = yield call(getOrCreateProfileEntity, personEntityKeyId);

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

    const audioAsBase64 = window.btoa(bufferToString(audio));

    const profileEntity = {
      [profileEntityKeyId]: {
        [audioPropertyId]: [
          {
            'content-type': 'audio/wav',
            data: audioAsBase64
          }
        ]
      }
    };


    const enrollRequest = {
      method: 'post',
      url: `${CHECKINS_BASE_URL}/profile/${profileEntityKeyId}`,
      headers: Object.assign({}, getHeaders(), { 'Content-Type': 'multipart/form-data' }),
      data: audioAsBase64
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
