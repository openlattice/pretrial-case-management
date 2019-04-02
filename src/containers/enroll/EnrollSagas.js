/*
 * @flow
 */
import axios from 'axios';
import randomUUID from 'uuid/v4';
import moment from 'moment';
import { Map } from 'immutable';
import { AuthUtils } from 'lattice-auth';
import {
  DataApi,
  DataIntegrationApi,
  EntityDataModelApi,
  SearchApi
} from 'lattice';
import {
  call,
  put,
  take,
  all,
  select
} from '@redux-saga/core/effects';

import * as ActionTypes from './EnrollActionTypes';
import {
  enrollVoiceSuccess,
  enrollVoiceFailure,
  getProfileSuccess,
  getProfileFailure
} from './EnrollActionFactory';

import { toISODateTime } from '../../utils/FormattingUtils';
import { getFqnObj } from '../../utils/DataUtils';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { STATE } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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

export function* getOrCreateProfile() :Generator<*, *, *> {
  while (true) {
    const { personId, personEntityKeyId } = yield take(ActionTypes.GET_PROFILE_REQUEST);

    try {
      const app = yield select(state => state.get(STATE.APP, Map()));
      const personEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.PEOPLE);
      const voiceEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);
      const registeredForEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.REGISTERED_FOR);

      const neighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);

      const idsToTry = {};
      if (neighbors) {
        neighbors.forEach((neighborObj) => {
          const entitySet = neighborObj.neighborEntitySet;
          if (entitySet && entitySet.id === voiceEntitySetId) {
            const ids = neighborObj.neighborDetails[PROPERTY_TYPES.GENERAL_ID];
            if (ids && ids.length) {
              const id = ids[0];
              const pins = neighborObj.neighborDetails[PROPERTY_TYPES.PIN];
              const pin = pins ? pins[0] : undefined;
              idsToTry[id] = pin;
            }
          }
        });
      }

      let profile;
      let pin;

      if (Object.keys(idsToTry).length) {
        const idList = (idsToTry.length > 3) ? Object.keys(idsToTry).splice(0, 3) : Object.keys(idsToTry);
        const requests = idList.map(id => call(tryLoadProfile, id));
        const profiles = yield all(requests);
        const successfulProfiles = profiles.filter(p => p);
        if (successfulProfiles.length) {
          [profile] = successfulProfiles;
          pin = idsToTry[profile.data.verificationProfileId];
        }
      }

      if (!profile || !profile.data || !profile.data.verificationProfileId) {
        const createProfileRequest = {
          method: 'post',
          url: `${CHECKINS_BASE_URL}/profile/create`,
          headers: getHeaders()
        };

        const createProfileResponse = yield call(axios, createProfileRequest);
        const speakerVerificationId = createProfileResponse.data;
        const newPin = yield call(getPin, speakerVerificationId);

        const [subjectId, generalId, timestampId, pinId] = yield all([
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PERSON_ID)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.GENERAL_ID)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.COMPLETED_DATE_TIME)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PIN))
        ]);

        const personDetails = {
          [subjectId]: [personId]
        };

        const voiceDetails = {
          [generalId]: [speakerVerificationId],
          [pinId]: [`${newPin}`]
        };

        const registeredForDetails = {
          [timestampId]: [toISODateTime(moment())]
        };

        const personEntityKey = {
          entitySetId: personEntitySetId,
          entityId: getEntityId(personDetails, [subjectId])
        };

        const voiceEntityKey = {
          entitySetId: voiceEntitySetId,
          entityId: speakerVerificationId
        };

        const registeredForEntityKey = {
          entitySetId: registeredForEntitySetId,
          entityId: getEntityId(registeredForDetails, [timestampId])
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
        yield put(getProfileSuccess(speakerVerificationId, `${newPin}`, 0));
      }
      else {
        if (!pin) pin = yield call(getPin, profile.data.verificationProfileId);
        yield put(getProfileSuccess(profile.data.verificationProfileId, `${pin}`, profile.data.enrollmentsCount));
      }
    }
    catch (error) {
      console.error(error)
      yield put(getProfileFailure(`Unable to load or create profile for user with id ${personId}.`));
    }
  }
}

export function* enrollVoiceProfile() :Generator<*, *, *> {
  while (true) {
    const {
      profileId,
      audio
    } = yield take(ActionTypes.ENROLL_VOICE_REQUEST);

    try {
      const app = yield select(state => state.get(STATE.APP, Map()));
      const entitySetId = getEntitySetIdFromApp(app, APP_TYPES.SPEAKER_RECOGNITION_PROFILES);

      const [generalId, audioId] = yield all([
        call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.GENERAL_ID)),
        call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.AUDIO_SAMPLE))
      ]);

      const voiceDetails = {
        [generalId]: [profileId],
        [audioId]: [{
          'content-type': 'audio/wav',
          data: window.btoa(String.fromCharCode(...new Uint8Array(audio)))
        }]
      };


      const enrollRequest = {
        method: 'post',
        url: `${CHECKINS_BASE_URL}/profile/${profileId}`,
        headers: Object.assign({}, getHeaders(), { 'Content-Type': 'multipart/form-data' }),
        data: audio
      };
      yield call(axios, enrollRequest);

      yield call(DataApi.createOrMergeEntityData, entitySetId, [voiceDetails]);

      const profile = yield call(tryLoadProfile, profileId);
      yield put(enrollVoiceSuccess(profile.data.enrollmentsCount));

    }
    catch (error) {
      yield put(enrollVoiceFailure('Audio submission was not successful. Please re-record and try again.'));
    }
  }
}
