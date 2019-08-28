import moment from 'moment';
import { OrderedMap, Map, List } from 'immutable';

import { formatPersonName } from './PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { COURTROOMS, HEARING_CONSTS } from './consts/HearingConsts';
import {
  getDateAndTime,
  getEntityKeyId,
  getEntityProperties,
  getFirstNeighborValue,
  sortByDate
} from './DataUtils';

const { HEARINGS, OUTCOMES } = APP_TYPES;

const {
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  HEARING_TYPE
} = PROPERTY_TYPES;

export const getHearingString = (hearing, includeCaseId) => {
  const {
    [PROPERTY_TYPES.CASE_ID]: hearingCaseId,
    [PROPERTY_TYPES.COURTROOM]: courtroom,
    [PROPERTY_TYPES.DATE_TIME]: hearingDateTime,
    [PROPERTY_TYPES.HEARING_TYPE]: hearingType
  } = getEntityProperties(hearing, [
    PROPERTY_TYPES.CASE_ID,
    PROPERTY_TYPES.COURTROOM,
    PROPERTY_TYPES.DATE_TIME,
    PROPERTY_TYPES.HEARING_TYPE
  ]);

  if (includeCaseId) return `${hearingDateTime}-${courtroom}-${hearingType}-${hearingCaseId}`;
  return `${hearingDateTime}-${courtroom}-${hearingType}`;
};

export const hearingIsCancelled = (hearing) => {
  const {
    [PROPERTY_TYPES.UPDATE_TYPE]: hearingUpdate,
    [PROPERTY_TYPES.HEARING_INACTIVE]: hearingIsInactive,
  } = getEntityProperties(hearing, [
    PROPERTY_TYPES.UPDATE_TYPE,
    PROPERTY_TYPES.HEARING_INACTIVE
  ]);
  const hearingUpdateIsCancelled = hearingUpdate.toLowerCase().trim() === 'cancelled';
  return hearingUpdateIsCancelled || hearingIsInactive;
};

export const formatJudgeName = (judge) => {
  if (judge) {
    const {
      [PROPERTY_TYPES.FIRST_NAME]: firstName,
      [PROPERTY_TYPES.MIDDLE_NAME]: middleName,
      [PROPERTY_TYPES.LAST_NAME]: lastName
    } = getEntityProperties(judge, [
      PROPERTY_TYPES.FIRST_NAME,
      PROPERTY_TYPES.MIDDLE_NAME,
      PROPERTY_TYPES.LAST_NAME
    ]);
    const { lastFirstMid } = formatPersonName(firstName, middleName, lastName);
    if (firstName && lastName) {
      return lastFirstMid;
    }
  }
  return 'NA';
};

export const getCourtroomOptions = () => {
  let courtroomOptions = OrderedMap();
  COURTROOMS.forEach((courtroom) => {
    courtroomOptions = courtroomOptions.set(courtroom, courtroom);
  });
  return courtroomOptions;
};

export const getJudgeOptions = (judgeIdsForCounty, judgesByID, includeOther = false) => {
  console.log(includeOther);
  let judgeOptions = Map();
  judgeIdsForCounty.forEach((judgeEKID) => {
    const judge = judgesByID.get(judgeEKID);
    const fullNameString = formatJudgeName(judge);
    judgeOptions = judgeOptions.set(
      fullNameString,
      judge
        .set(HEARING_CONSTS.FULL_NAME, fullNameString)
        .set(HEARING_CONSTS.FIELD, HEARING_CONSTS.JUDGE)
    );
  });
  if (includeOther) {
    judgeOptions = judgeOptions.set(HEARING_CONSTS.OTHER_JUDGE, Map({
      [HEARING_CONSTS.FULL_NAME]: HEARING_CONSTS.OTHER_JUDGE,
      [HEARING_CONSTS.FIELD]: HEARING_CONSTS.JUDGE
    }));
  }
  return judgeOptions.toOrderedMap().sortBy((k, _) => k);
};

// Get hearings from psa neighbors
export const getHearingsFromNeighbors = psaNeighbors => (
  psaNeighbors.get(HEARINGS) || psaNeighbors || Map()
);

// Get hearing ids from psa neighbors
export const getHearingsIdsFromNeighbors = psaNeighbors => (
  getHearingsFromNeighbors(psaNeighbors)
    .map(hearing => getEntityKeyId(hearing))
    .filter(id => !!id)
    .toJS()
);

// Get future hearings in sequential order from psa neighbors
export const getScheduledHearings = (psaNeighbors) => {
  const todaysDate = moment().startOf('day');
  return (
    getHearingsFromNeighbors(psaNeighbors)
      .filter((hearing) => {
        const {
          [COURTROOM]: courtroom,
          [DATE_TIME]: hearingDateTime,
          [HEARING_TYPE]: hearingType
        } = getEntityProperties(hearing, [COURTROOM, DATE_TIME, HEARING_TYPE]);
        const { date: hearingDate, time: hearingTime } = getDateAndTime(hearingDateTime);
        const hearingCancelled = hearingIsCancelled(hearing);

        if (
          !hearingCancelled
          && hearingDate
          && hearingTime
          && courtroom
          && hearingType
        ) {
          if (todaysDate.isBefore(hearingDateTime)) return true;
        }
        return false;
      })
      .sort((h1, h2) => sortByDate(h1, h2, PROPERTY_TYPES.DATE_TIME))
  );
};

// Get past hearings in sequential order from psa neighbors
export const getPastHearings = (psaNeighbors) => {
  const todaysDate = moment().startOf('day');
  return (
    getHearingsFromNeighbors(psaNeighbors)
      .filter((hearing) => {
        const {
          [COURTROOM]: courtroom,
          [DATE_TIME]: hearingDateTime,
          [HEARING_TYPE]: hearingType
        } = getEntityProperties(hearing, [COURTROOM, DATE_TIME, HEARING_TYPE]);
        const { date: hearingDate, time: hearingTime } = getDateAndTime(hearingDateTime);
        const hearingCancelled = hearingIsCancelled(hearing);
        if (
          !hearingCancelled
          && hearingDate
          && hearingTime
          && courtroom
          && hearingType
        ) {
          return todaysDate.isAfter(hearingDateTime);
        }
        return false;
      })
      .sort((h1, h2) => sortByDate(h1, h2, PROPERTY_TYPES.DATE_TIME))
  );
};

// Get hearings for available hearings - hearings that are of type 'initial appearance', have no outcomes,
// haven't been cancelled, and are in the future.
export const getAvailableHearings = (personHearings, scheduledHearings, hearingNeighborsById) => {
  let scheduledHearingMap = Map();
  scheduledHearings.forEach((scheduledHearing) => {
    const {
      [COURTROOM]: courtroom,
      [DATE_TIME]: hearingDateTime
    } = getEntityProperties(scheduledHearing, [COURTROOM, DATE_TIME]);
    scheduledHearingMap = scheduledHearingMap.set(hearingDateTime, courtroom);
  });

  const unusedHearings = personHearings.filter((hearing) => {
    const {
      [COURTROOM]: hearingCourtroom,
      [DATE_TIME]: hearingDateTime,
      [ENTITY_KEY_ID]: hearingEntityKeyId
    } = getEntityProperties(hearing, [COURTROOM, DATE_TIME, ENTITY_KEY_ID]);
    const hasOutcome = !!hearingNeighborsById.getIn([hearingEntityKeyId, OUTCOMES]);
    const hearingCancelled = hearingIsCancelled(hearing);
    const hearingIsInPast = moment(hearingDateTime).isBefore(moment());
    return !((scheduledHearingMap.get(hearingDateTime) === hearingCourtroom)
    || hasOutcome
    || hearingCancelled
    || hearingIsInPast
    );
  });
  return unusedHearings.sort((h1, h2) => sortByDate(h1, h2, PROPERTY_TYPES.DATE_TIME));
};


export const sortHearingsByDate = (h1, h2) => {
  const h1Date = moment(getFirstNeighborValue(h1, PROPERTY_TYPES.DATE_TIME));
  const h2Date = moment(getFirstNeighborValue(h2, PROPERTY_TYPES.DATE_TIME));
  if (h1Date.isValid() && h2Date.isValid()) return h1Date.isBefore(h2Date) ? -1 : 1;
  return 0;
};
