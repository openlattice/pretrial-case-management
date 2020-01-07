
import Immutable from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';

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

const getMaxFromList = (sentence, field) => {
  let max = 0;
  sentence.get(field, Immutable.List()).forEach((val) => {
    const fieldNum = Number.parseInt(val, 10);
    if (!Number.isNaN(fieldNum) && fieldNum > max) {
      max = fieldNum;
    }
  });
  return max;
};

const getSentenceInfo = (sentence) => {
  const sentenceDays = getMaxFromList(sentence, JAIL_DAYS_SERVED);
  const sentenceDaysSusp = getMaxFromList(sentence, JAIL_DAYS_SUSPENDED);
  const sentenceMonths = getMaxFromList(sentence, JAIL_MONTHS_SERVED);
  const sentenceMonthsSusp = getMaxFromList(sentence, JAIL_MONTHS_SUSPENDED);
  const sentenceYears = getMaxFromList(sentence, JAIL_YEARS_SERVED);
  const sentenceYearsSusp = getMaxFromList(sentence, JAIL_YEARS_SUSPENDED);

  const daysServed = sentenceDays - sentenceDaysSusp;
  const monthsServed = sentenceMonths - sentenceMonthsSusp;
  const yearsServed = sentenceYears - sentenceYearsSusp;
  const concConsec = sentence.getIn([CONCURRENT_CONSECUTIVE, 0], '');
  const startDate = sentence.get(JAIL_START_DATE, Immutable.List()).filter((val) => val.length).get(0, '');

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
    .map((sentence) => getSentenceInfo(sentence))
    .filter((sentenceInfo) => timeWasServed(sentenceInfo));

  if (sentencesServed.size) {
    sentencesServed.forEach((sentence) => {
      if (sentence.monthsServed > 0 || sentence.yearsServed > 0 || sentence.daysServed >= 14) result = true;
    });

    if (!result) {
      let sentencesByStartDate = Immutable.Map();
      sentencesServed.forEach((sentence) => {
        const { daysServed, startDate } = sentence;
        let maxDaysForDate = daysServed;
        const prevValueForDate = sentencesByStartDate.get(startDate, 0);
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
