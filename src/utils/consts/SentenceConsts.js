import Immutable from 'immutable';
import moment from 'moment';

import { PROPERTY_TYPES } from './DataModelConsts';

const {
  GENERAL_ID,
  JAIL_DAYS_SERVED,
  JAIL_MONTHS_SERVED,
  JAIL_YEARS_SERVED,
  JAIL_DAYS_SUSPENDED,
  JAIL_MONTHS_SUSPENDED,
  JAIL_YEARS_SUSPENDED,
  JAIL_START_DATE,
  CONCURRENT_CONSECUTIVE
} = PROPERTY_TYPES;

const timeWasServed = (sentenceInfo) => {
  const { daysServed, monthsServed, yearsServed } = sentenceInfo;
  return daysServed > 0 || monthsServed > 0 || yearsServed > 0;
};

const getSentenceInfo = (sentence) => {
  const sentenceDays = Number.parseInt(sentence.getIn([JAIL_DAYS_SERVED, 0], 0), 10) || 0;
  const sentenceDaysSusp = Number.parseInt(sentence.getIn([JAIL_DAYS_SUSPENDED, 0], 0), 10) || 0;
  const sentenceMonths = Number.parseInt(sentence.getIn([JAIL_MONTHS_SERVED, 0], 0), 10) || 0;
  const sentenceMonthsSusp = Number.parseInt(sentence.getIn([JAIL_MONTHS_SUSPENDED, 0], 0), 10) || 0;
  const sentenceYears = Number.parseInt(sentence.getIn([JAIL_YEARS_SERVED, 0], 0), 10) || 0;
  const sentenceYearsSusp = Number.parseInt(sentence.getIn([JAIL_YEARS_SUSPENDED, 0], 0), 10) || 0;

  const daysServed = sentenceDays - sentenceDaysSusp;
  const monthsServed = sentenceMonths - sentenceMonthsSusp;
  const yearsServed = sentenceYears - sentenceYearsSusp;
  const concConsec = sentence.getIn([CONCURRENT_CONSECUTIVE, 0], '');
  const startDate = sentence.getIn([JAIL_START_DATE, 0], '');

  return {
    daysServed,
    monthsServed,
    yearsServed,
    concConsec,
    startDate
  };
};

export const caseLedToIncarceration = (sentences) => {
  let result = false;
  const sentencesServed = sentences
    .map(sentence => getSentenceInfo(sentence))
    .filter(sentenceInfo => timeWasServed(sentenceInfo));

  if (sentencesServed.size) {
    sentencesServed.forEach((sentence) => {
      if (sentence.monthsServed > 0 || sentence.yearsServed > 0 || sentence.daysServed >= 14) result = true;
    });

    if (!result) {
      let sentencesByStartDate = Immutable.Map();
      sentencesServed.forEach((sentence) => {
        const { daysServed, startDate } = sentence;
        let maxDaysForDate = startDate;
        const prevValueForDate = sentencesByStartDate.get(startDate);
        if (prevValueForDate && prevValueForDate > daysServed) maxDaysForDate = prevValueForDate;
        sentencesByStartDate = sentencesByStartDate.set(startDate, maxDaysForDate);
      });

      let totalDays = 0;
      sentencesByStartDate.valueSeq().forEach((numDays) => {
        totalDays += numDays;
      });
      result = totalDays >= 14;
    }
  }

  return result;
};

export const getSentenceToIncarcerationCaseNums = (allSentences) => {
  let incarcerations = Immutable.List();
  let sentencesByCase = Immutable.Map();
  allSentences.forEach((sentence) => {
    const sentenceIdSplit = sentence.getIn([GENERAL_ID, 0], '').split('|');
    if (sentenceIdSplit.length > 1) {
      const caseNum = sentenceIdSplit[0];
      sentencesByCase = sentencesByCase.set(caseNum, sentencesByCase.get(caseNum, Immutable.List()).push(sentence));
    }
  });

  sentencesByCase.keySeq().forEach((caseNum) => {
    if (caseLedToIncarceration(sentencesByCase.get(caseNum))) {
      incarcerations = incarcerations.push(caseNum);
    }
  });

  return incarcerations;
};
