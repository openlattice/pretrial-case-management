/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import { EntityDataModelApiSagas } from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as ChargesSagas from '../../containers/charges/ChargesSagas';
import * as CheckInsSagas from '../../containers/checkins/CheckInsSagas';
import * as ContactInfoSagas from '../../containers/contactinformation/ContactInfoSagas';
import * as CourtSagas from '../../containers/court/CourtSagas';
import * as CountiesSagas from '../../containers/counties/CountiesSagas';
import * as PersonSagas from '../../containers/person/PersonSagas';
import * as PeopleSagas from '../../containers/people/PeopleSagas';
import * as DashboardSagas from '../../containers/dashboard/DashboardSagas';
import * as DataSagas from '../../utils/data/DataSagas';
import * as HearingsSagas from '../../containers/hearings/HearingsSagas';
import * as ManualRemindersSagas from '../../containers/manualreminders/ManualRemindersSagas';
import * as PSAModalSagas from '../../containers/psamodal/PSAModalSagas';
import * as PsaSagas from '../../containers/psa/FormSagas';
import * as ReleaseConditionsSagas from '../../containers/releaseconditions/ReleaseConditionsSagas';
import * as RemindersSagas from '../../containers/reminders/RemindersSagas';
import * as ReviewSagas from '../../containers/review/ReviewSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as DownloadSagas from '../../containers/download/DownloadSagas';
import * as EnrollSagas from '../../containers/enroll/EnrollSagas';
import * as SubmitSagas from '../../utils/submit/SubmitSaga';
import * as SubscriptionsSagas from '../../containers/subscription/SubscriptionsSagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // AppSagas
    fork(AppSagas.authExpirationCleanupWatcher),
    fork(AppSagas.authFailureCleanupWatcher),
    fork(AppSagas.logoutCleanupWatcher),
    fork(AppSagas.loadAppWatcher),
    fork(AppSagas.switchOrganizationWatcher),

    // AuthSagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // ChargesSagas
    fork(ChargesSagas.createChargeWatcher),
    fork(ChargesSagas.deleteChargesWatcher),
    fork(ChargesSagas.loadArrestingAgenciesWatcher),
    fork(ChargesSagas.loadChargesWatcher),
    fork(ChargesSagas.updateChargesWatcher),

    // CheckInsSagas
    fork(CheckInsSagas.createCheckinAppointmentsWatcher),
    fork(CheckInsSagas.loadCheckInAppointmentsForDateWatcher),
    fork(CheckInsSagas.loadCheckInNeighborsWatcher),

    // ContactInfoSagas
    fork(ContactInfoSagas.submitContactWatcher),
    fork(ContactInfoSagas.updateContactWatcher),
    fork(ContactInfoSagas.updateContactsBulkWatcher),

    // CourtSagas
    fork(CourtSagas.filterPeopleIdsWithOpenPSAsWatcher),

    // CountiesSagas
    fork(CountiesSagas.loadCountiesWatcher),

    // DashboardSagas
    fork(DashboardSagas.loadDashboardDataWatcher),

    // DataSagas
    fork(DataSagas.deleteEntityWatcher),
    fork(DataSagas.replaceEntityWatcher),
    fork(DataSagas.updateEntityWatcher),

    // DownloadSagas
    fork(DownloadSagas.downloadPSAsWatcher),
    fork(DownloadSagas.downloadPSAsByHearingDateWatcher),
    fork(DownloadSagas.getDownloadFiltersWatcher),

    // "lattice-sagas" sagas
    fork(EntityDataModelApiSagas.getEntityDataModelProjectionWatcher),
    fork(EntityDataModelApiSagas.getAllPropertyTypesWatcher),

    // EnrollSagas
    fork(EnrollSagas.enrollVoiceWatcher),
    fork(EnrollSagas.getProfileWatcher),

    // HearingsSagas
    fork(HearingsSagas.loadHearingsForDateWatcher),
    fork(HearingsSagas.loadHearingNeighborsWatcher),
    fork(HearingsSagas.loadJudgesWatcher),
    fork(HearingsSagas.refreshHearingAndNeighborsWatcher),
    fork(HearingsSagas.submitExistingHearingWatcher),
    fork(HearingsSagas.submitHearingWatcher),
    fork(HearingsSagas.updateHearingWatcher),

    // Manual Reminders
    fork(ManualRemindersSagas.loadManualRemindersFormWatcher),
    fork(ManualRemindersSagas.loadManualRemindersForDateWatcher),
    fork(ManualRemindersSagas.loadManualRemindersNeighborsByIdWatcher),
    fork(ManualRemindersSagas.submitManualReminderWatcher),

    // SubmitDataSaga
    fork(SubmitSagas.createAssociationsWatcher),
    fork(SubmitSagas.replaceAssociationWatcher),
    fork(SubmitSagas.replaceEntityWatcher),
    fork(SubmitSagas.submitWatcher),

    // PersonSagas
    fork(PersonSagas.clearSearchResultsWatcher),
    fork(PersonSagas.loadPersonDetailsWatcher),
    fork(PersonSagas.newPersonSubmitWatcher),
    fork(PersonSagas.searchPeopleWatcher),
    fork(PersonSagas.searchPeopleByPhoneNumberWatcher),
    fork(PersonSagas.updateCasesWatcher),

    // PeopleSagas
    fork(PeopleSagas.getPeopleNeighborsWatcher),
    fork(PeopleSagas.getPersonDataWatcher),
    fork(PeopleSagas.getPersonNeighborsWatcher),
    fork(PeopleSagas.getStaffEKIDsWatcher),
    fork(PeopleSagas.loadRequiresActionPeopleWatcher),

    // PSA Modal Sagas
    fork(PSAModalSagas.loadPSAModalWatcher),

    // PSA Sagas
    fork(PsaSagas.addCaseToPSAWatcher),
    fork(PsaSagas.editPSAWatcher),
    fork(PsaSagas.loadNeighborsWatcher),
    fork(PsaSagas.removeCaseFromPSAWatcher),
    fork(PsaSagas.submitPSAWatcher),

    // Release Conditions Sagas
    fork(ReleaseConditionsSagas.loadReleaseConditionsWatcher),
    fork(ReleaseConditionsSagas.submitReleaseConditionsWatcher),
    fork(ReleaseConditionsSagas.updateOutcomesAndReleaseCondtionsWatcher),

    // Reminder Sagas
    fork(RemindersSagas.bulkDownloadRemindersPDFWatcher),
    fork(RemindersSagas.loadOptOutNeighborsWatcher),
    fork(RemindersSagas.loadRemindersActionListWatcher),
    fork(RemindersSagas.loadOptOutsForDateWatcher),
    fork(RemindersSagas.loadRemindersforDateWatcher),
    fork(RemindersSagas.loadReminderNeighborsByIdWatcher),

    // Review Sagas
    fork(ReviewSagas.bulkDownloadPSAReviewPDFWatcher),
    fork(ReviewSagas.changePSAStatusWatcher),
    fork(ReviewSagas.checkPSAPermissionsWatcher),
    fork(ReviewSagas.downloadPSAReviewPDFWatcher),
    fork(ReviewSagas.loadCaseHistoryWatcher),
    fork(ReviewSagas.loadPSADataWatcher),
    fork(ReviewSagas.loadPSAsByDateWatcher),
    fork(ReviewSagas.updateScoresAndRiskFactorsWatcher),

    // Routing Sagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToPathWatcher),

    // Subscriptions Sagas
    fork(SubscriptionsSagas.loadSubcriptionModalWatcher),
    fork(SubscriptionsSagas.subscribeWatcher),
    fork(SubscriptionsSagas.unsubscribeWatcher)
  ]);
}
