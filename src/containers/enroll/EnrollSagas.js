/*
 * @flow
 */
import axios from 'axios';
import randomUUID from 'uuid/v4';
import { DataApi, EntityDataModelApi, SearchApi, SyncApi } from 'lattice';
import { call, put, take, all } from 'redux-saga/effects';

import * as ActionTypes from './EnrollActionTypes';
import {
  enrollVoiceSuccess,
  enrollVoiceFailure,
  getProfileSuccess,
  getProfileFailure
} from './EnrollActionFactory';

import {
  API_TOKEN,
  BASE_URL,
  PROFILES
} from './SpeakerVerificationApiConsts';

import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

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

const getFqnObj = (fqnStr) => {
  const splitStr = fqnStr.split('.');
  return {
    namespace: splitStr[0],
    name: splitStr[1]
  };
};

function* tryLoadProfile(id) {
  try {
    return yield call(axios, {
      method: 'get',
      url: `${BASE_URL}/${PROFILES}/${id}`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': API_TOKEN
      }
    });
  }
  catch (error) {
    return null;
  }
}

function* getPin(id) {
  const response = yield call(axios, {
    method: 'get',
    url: `http://localhost:8081/checkins/voice/pin?profileId=${id}`
  });
  return response.data;
}

export function* getOrCreateProfile() :Generator<> {
  while (true) {
    const { personId, personEntityKeyId } = yield take(ActionTypes.GET_PROFILE_REQUEST);

    try {
      const personEntitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.PEOPLE);
      const neighbors = yield call(SearchApi.searchEntityNeighbors, personEntitySetId, personEntityKeyId);

      const idsToTry = {};
      neighbors.forEach((neighborObj) => {
        const entitySet = neighborObj.neighborEntitySet;
        if (entitySet && entitySet.name === ENTITY_SETS.SPEAKER_RECOGNITION_PROFILES) {
          const ids = neighborObj.neighborDetails[PROPERTY_TYPES.GENERAL_ID_FQN];
          if (ids && ids.length) {
            const id = ids[0];
            const pins = neighborObj.neighborDetails[PROPERTY_TYPES.PIN];
            const pin = pins ? pins[0] : undefined;
            idsToTry[id] = pin;
          }
        }
      });

      console.log('ids to try')
      console.log(idsToTry)
      console.log('url')
      console.log(`${BASE_URL}/${PROFILES}`)

      let profile;
      let pin;

      if (Object.keys(idsToTry).length) {
        const idList = (idsToTry.length > 3) ? Object.keys(idsToTry).splice(0, 3) : Object.keys(idsToTry);
        const requests = idList.map(id => call(tryLoadProfile, id));
        console.log('requests')
        console.log(requests)
        const profiles = yield all(requests);
        console.log('profiles')
        console.log(profiles)
        const successfulProfiles = profiles.filter(p => p);
        if (successfulProfiles.length) {
          [profile] = successfulProfiles;
          pin = idsToTry[profile.data.verificationProfileId];
        }
      }
      console.log('profile')
      console.log(profile)

      if (!profile || !profile.data || !profile.data.verificationProfileId) {
        const createProfileRequest = {
          method: 'post',
          url: `${BASE_URL}/${PROFILES}`,
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': API_TOKEN
          },
          data: {
            locale: 'en-us'
          }
        };

        const createProfileResponse = yield call(axios, createProfileRequest);
        const speakerVerificationId = createProfileResponse.data.verificationProfileId;
        const newPin = yield call(getPin, speakerVerificationId);

        const [subjectId, generalId, timestampId, pinId] = yield all([
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PERSON_ID)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.GENERAL_ID_FQN)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.TIMESTAMP)),
          call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.PIN))
        ]);

        console.log({ subjectId, generalId, timestampId, pinId })

        const [voiceEntitySetId, registeredForEntitySetId] = yield all([
          call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.SPEAKER_RECOGNITION_PROFILES),
          call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.REGISTERED_FOR)
        ]);

        console.log({ voiceEntitySetId, registeredForEntitySetId })


        const [personSyncId, voiceSyncId, registeredForSyncId] = yield all([
          call(SyncApi.getCurrentSyncId, personEntitySetId),
          call(SyncApi.getCurrentSyncId, voiceEntitySetId),
          call(SyncApi.getCurrentSyncId, registeredForEntitySetId)
        ]);

        console.log({ personSyncId, voiceSyncId, registeredForSyncId })


        const personDetails = {
          [subjectId]: [personId]
        };

        const voiceDetails = {
          [generalId]: [speakerVerificationId],
          [pinId]: [newPin]
        };

        const registeredForDetails = {
          [timestampId]: [new Date().toISOString()]
        };

        const personEntityKey = {
          entitySetId: personEntitySetId,
          syncId: personSyncId,
          entityId: getEntityId(personDetails, [subjectId])
        };

        const voiceEntityKey = {
          entitySetId: voiceEntitySetId,
          syncId: voiceSyncId,
          entityId: speakerVerificationId
        };

        const registeredForEntityKey = {
          entitySetId: registeredForEntitySetId,
          syncId: registeredForSyncId,
          entityId: getEntityId(registeredForDetails, [timestampId])
        };

        const syncTickets = yield all([
          call(DataApi.acquireSyncTicket, personEntitySetId, personSyncId),
          call(DataApi.acquireSyncTicket, voiceEntitySetId, voiceSyncId),
          call(DataApi.acquireSyncTicket, registeredForEntitySetId, registeredForSyncId)
        ]);

        console.log({ syncTickets })


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

        console.log({ entities, associations })

        yield call(DataApi.createEntityAndAssociationData, { syncTickets, entities, associations });
        yield put(getProfileSuccess(speakerVerificationId, `${newPin}`, 0));
      }
      else {
        if (!pin) pin = yield call(getPin, profile.data.verificationProfileId);
        console.log('pin is')
        console.log(pin)
        console.log(pin.toString())
        yield put(getProfileSuccess(profile.data.verificationProfileId, `${pin}`, profile.data.enrollmentsCount));
      }
    }
    catch (error) {
      yield put(getProfileFailure(`Unable to load or create profile for user with id ${personId}.`));
    }
  }
}

export function* enrollVoiceProfile() :Generator<> {
  while (true) {
    const {
      profileId,
      audio
    } = yield take(ActionTypes.ENROLL_VOICE_REQUEST);

    try {
      const enrollRequest = {
        method: 'post',
        url: `${BASE_URL}/${PROFILES}/${profileId}/enroll`,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Ocp-Apim-Subscription-Key': API_TOKEN
        },
        data: audio
      };

      yield call(axios, enrollRequest);

      const [generalId, audioId] = yield all([
        call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.GENERAL_ID_FQN)),
        call(EntityDataModelApi.getPropertyTypeId, getFqnObj(PROPERTY_TYPES.AUDIO_SAMPLE))
      ]);

      const entitySetId = yield call(EntityDataModelApi.getEntitySetId, ENTITY_SETS.SPEAKER_RECOGNITION_PROFILES);
      const syncId = yield call(SyncApi.getCurrentSyncId, entitySetId);

      const voiceDetails = {
        [generalId]: [profileId],
        [audioId]: [audio]
      };

      const entities = {
        [getEntityId(voiceDetails, [generalId])]: voiceDetails
      };

      yield call(DataApi.createEntityData, entitySetId, syncId, entities);

      const profile = yield call(tryLoadProfile, profileId);
      yield put(enrollVoiceSuccess(profile.data.enrollmentsCount));

    }
    catch (error) {
      yield put(enrollVoiceFailure('Audio submission was not successful. Please re-record and try again.'));
    }
  }
}
