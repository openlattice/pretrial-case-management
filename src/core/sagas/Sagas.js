/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { fork } from 'redux-saga/effects';

import * as PersonSagas from '../../containers/person/PersonSagas';
import * as PeopleSagas from '../../containers/people/PeopleSagas';
import * as DataSagas from '../../utils/data/DataSagas';
import * as PsaSagas from '../../containers/psa/FormSagas';
import * as ReviewSagas from '../../containers/review/ReviewSagas';
import * as DownloadSagas from '../../containers/download/DownloadSagas';
import SubmitDataSaga from '../../utils/submit/SubmitSaga';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // AuthSagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // DataSagas
    fork(DataSagas.deleteEntity),
    fork(DataSagas.replaceEntity),

    // DownloadSagas
    fork(DownloadSagas.downloadPSAsWatcher),

    // SubmitDataSaga
    fork(SubmitDataSaga),

    // PersonSagas
    fork(PersonSagas.watchLoadPersonDetailsRequest),
    fork(PersonSagas.watchNewPersonSubmitRequest),
    fork(PersonSagas.watchSearchPeopleRequest),
    fork(PersonSagas.watchUpdateCaseRequest),

    // PeopleSagas
    fork(PeopleSagas.getPeopleWatcher),
    fork(PeopleSagas.getPersonDataWatcher),

    // PSA Sagas
    fork(PsaSagas.loadDataModels),
    fork(PsaSagas.searchPeople),
    fork(PsaSagas.loadNeighbors),
    fork(PsaSagas.submitData),
    fork(PsaSagas.updateReleaseRecommendation),

    // Review Sagas
    fork(ReviewSagas.downloadPSAReviewPDFWatcher),
    fork(ReviewSagas.loadPSAsByDateWatcher),
    fork(ReviewSagas.updateScoresAndRiskFactorsWatcher)
  ];
}
