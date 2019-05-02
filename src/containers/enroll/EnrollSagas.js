/*
 * @flow
 */
import axios from 'axios';
import randomUUID from 'uuid/v4';
import moment from 'moment';
import { fromJS, Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import { DataApi, DataIntegrationApi, SearchApi } from 'lattice';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';

import {
  GET_PROFILE,
  ENROLL_VOICE,
  getProfile,
  enrollVoice
} from './EnrollActionFactory';

import { toISODateTime } from '../../utils/FormattingUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getPropertyTypeId } from '../../edm/edmUtils';
import { APP, STATE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const getApp = state => state.get(STATE.APP, Map());
const getEDM = state => state.get(STATE.EDM, Map());
const getOrgId = state => state.getIn([STATE.APP, APP.SELECTED_ORG_ID], '');

const CHECKINS_BASE_URL = 'https://api.openlattice.com/checkins/voice';

const getEntityId = (entity, primaryKeyIds) => {
  const pKeyVals = [];
  primaryKeyIds.forEach((pKey) => {
    if (entity[pKey]) {
      const keyValues = [];
      entity[pKey].forEach((value) => {
        keyValues.push(btoa(value));
      });
      pKeyVals.push(btoa(encodeURI(keyValues.join(','))));
    }
  });
  return pKeyVals.length ? pKeyVals.join(',') : randomUUID();
};

const getHeaders = () => ({
  Authorization: `Bearer ${AuthUtils.getAuthToken()}`
});

function* tryLoadProfile(id) {
  try {
    return yield call(axios, {
      method: 'get',
      url: `${CHECKINS_BASE_URL}/profile/${id}`,
      headers: getHeaders()
    });
  }
  catch (error) {
    return null;
  }
}

function* getPin(id) {
  const response = yield call(axios, {
    method: 'get',
    url: `${CHECKINS_BASE_URL}/pin?profileId=${id}`,
    headers: getHeaders()
  });
  return response.data;
}

export function* getProfileWorker(action :SequenceAction) :Generator<*, *, *> {
  yield put(getProfile.request(action.id));
  const { personId, personEntityKeyId } = action.value;
  try {

    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const orgId = yield select(getOrgId);

    const entitySetIdsToAppType = app.getIn([APP.ENTITY_SETS_BY_ORG, orgId]);
    const peopleEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.PEOPLE);
    const enrollVoiceEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);
    const registeredForEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.REGISTERED_FOR);
    const personIdPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.PERSON_ID);
    const generalIdPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.GENERAL_ID);
    const completedDateTimePropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.COMPLETED_DATE_TIME);
    const pinPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.PIN);

    const peopleNeighborsById = yield call(SearchApi.searchEntityNeighborsWithFilter, peopleEntitySetId, {
      entityKeyIds: [personEntityKeyId],
      sourceEntitySetIds: [enrollVoiceEntitySetId],
      destinationEntitySetIds: []
    });
    const personNeighbors = fromJS(Object.values(peopleNeighborsById)[0] || []);
    let voiceProfileRequest;
    let voiceProfileEntityKeyId;
    let voiceProfileId;
    let voiceProfile;
    let pin;
    if (personNeighbors.size) {
      personNeighbors.forEach((neighbor) => {
        const entitySetId = neighbor.getIn([PSA_NEIGHBOR.ENTITY_SET, 'id'], '');
        const neighborObj = neighbor.get(PSA_NEIGHBOR.DETAILS, Map());
        const appTypeFqn = entitySetIdsToAppType.get(entitySetId, '');
        if (appTypeFqn === APP_TYPES.SPEAKER_RECOGNITION_PROFILES) {
          pin = neighborObj.getIn([PROPERTY_TYPES.PIN, 0], undefined);
          voiceProfileEntityKeyId = neighborObj.getIn([PROPERTY_TYPES.ENTITY_KEY_ID, 0], '');
          voiceProfileId = neighborObj.getIn([PROPERTY_TYPES.GENERAL_ID, 0], '');
        }
      });
      if (voiceProfileId) {
        voiceProfileRequest = yield call(tryLoadProfile, voiceProfileId);
        voiceProfile = voiceProfileRequest;
      }
    }

    if (!voiceProfile || !voiceProfile.data || !voiceProfile.data.verificationProfileId) {
      const createProfileRequest = {
        method: 'post',
        url: `${CHECKINS_BASE_URL}/profile/create`,
        headers: getHeaders()
      };

      const createProfileResponse = yield call(axios, createProfileRequest);
      const speakerVerificationId = createProfileResponse.data;
      const newPin = yield call(getPin, speakerVerificationId);

      const personDetails = {
        [personIdPropertyId]: [personId]
      };

      const voiceDetails = {
        [generalIdPropertyId]: [speakerVerificationId],
        [pinPropertyId]: [`${newPin}`]
      };

      const registeredForDetails = {
        [completedDateTimePropertyId]: [toISODateTime(moment())]
      };

      const personEntityKey = {
        entitySetId: peopleEntitySetId,
        entityId: getEntityId(personDetails, [personIdPropertyId])
      };

      const voiceEntityKey = {
        entitySetId: enrollVoiceEntitySetId,
        entityId: speakerVerificationId
      };

      const registeredForEntityKey = {
        entitySetId: registeredForEntitySetId,
        entityId: getEntityId(registeredForDetails, [completedDateTimePropertyId])
      };

      const entities = [{
        key: personEntityKey,
        details: personDetails
      }, {
        key: voiceEntityKey,
        details: voiceDetails
      }];
      const associations = [{
        key: registeredForEntityKey,
        src: voiceEntityKey,
        dst: personEntityKey,
        details: registeredForDetails
      }];

      yield call(DataIntegrationApi.createEntityAndAssociationData, { entities, associations });
      yield put(getProfile.success(action.id, {
        profileId: speakerVerificationId,
        pin: newPin,
        numSubmissions: 0,
        profileEntityKeyId: ''
      }));
    }
    else {
      if (!pin) pin = yield call(getPin, voiceProfile.data.verificationProfileId);
      yield put(getProfile.success(action.id, {
        profileId: voiceProfile.data.verificationProfileId,
        pin,
        numSubmissions: voiceProfile.data.enrollmentsCount,
        profileEntityKeyId: voiceProfileEntityKeyId
      }));
    }
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

export function* enrollVoiceWorker(action :SequenceAction) :Generator<*, *, *> {
  yield put(enrollVoice.request(action.id));
  const {
    profileId,
    profileEntityKeyId,
    audio
  } = action.value;

  try {
    const app = yield select(getApp);
    const edm = yield select(getEDM);
    const profileEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);
    const audioPropertyId = getPropertyTypeId(edm, PROPERTY_TYPES.AUDIO_SAMPLE);

    const uint8array = new TextEncoder('utf-8').encode(audio);
    const ui8string = new TextDecoder('utf-8').decode(uint8array);

    const profileEntity = {
      [profileEntityKeyId]: {
        [audioPropertyId]: [
          {
            'content-type': 'audio/wav',
            data: window.btoa(ui8string)
          }
        ]
      }
    };


    const enrollRequest = {
      method: 'post',
      url: `${CHECKINS_BASE_URL}/profile/${profileId}`,
      headers: Object.assign({}, getHeaders(), { 'Content-Type': 'multipart/form-data' }),
      data: audio
    };
    yield call(axios, enrollRequest);

    yield call(DataApi.updateEntityData, profileEntitySetId, profileEntity, 'Merge');

    const profile = yield call(tryLoadProfile, profileId);
    const { enrollmentsCount: numSubmissions } = profile.data;
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
