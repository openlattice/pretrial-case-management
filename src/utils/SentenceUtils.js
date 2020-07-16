/*
 * @flow
 */
import { List, Map } from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getEntityProperties } from './DataUtils';

const {
  CONCURRENT_CONSECUTIVE,
  CONCURRENT_CONSECUTIVE_JAIL,
  CONCURRENT_CONSECUTIVE_PEN,
  DAYS_CREDIT_JAIL,
  DAYS_CREDIT_PEN,
  DAYS_JAIL,
  DAYS_PEN,
  DAYS_SUSPENDED_JAIL,
  DAYS_SUSPENDED_PEN,
  GENERAL_ID,
  JAIL_DAYS_SERVED,
  JAIL_MONTHS_SERVED,
  JAIL_YEARS_SERVED,
  JAIL_DAYS_SUSPENDED,
  JAIL_MONTHS_SUSPENDED,
  JAIL_YEARS_SUSPENDED,
  JAIL_START_DATE,
  MONTHS_CREDIT_JAIL,
  MONTHS_CREDIT_PEN,
  MONTHS_JAIL,
  MONTHS_PEN,
  MONTHS_SUSPENDED_JAIL,
  MONTHS_SUSPENDED_PEN,
  SENTENCE_DATE,
  START_DATE_JAIL,
  START_DATE_PEN,
  YEARS_CREDIT_JAIL,
  YEARS_CREDIT_PEN,
  YEARS_JAIL,
  YEARS_PEN,
  YEARS_SUSPENDED_JAIL,
  YEARS_SUSPENDED_PEN,
} = PROPERTY_TYPES;

const timeWasServed = (sentenceInfo) => {
  const {
    daysServed,
    jailDaysServed,
    jailMonthsServed,
    jailYearsServed,
    monthsServed,
    penDaysServed,
    penMonthsServed,
    penYearsServed,
    yearsServed
  } = sentenceInfo;
  return daysServed > 0
  || jailDaysServed > 0
  || jailMonthsServed > 0
  || jailYearsServed > 0
  || monthsServed > 0
  || penDaysServed > 0
  || penMonthsServed > 0
  || penYearsServed > 0
  || yearsServed > 0;
};

const getMaxFromList = (sentence, field) => {
  let max = 0;
  sentence.get(field, List()).forEach((val) => {
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

  const sentenceDate = sentence.get(SENTENCE_DATE, List()).filter((val) => val.length).get(0, '');

  const jailStartDate = sentence.get(START_DATE_JAIL, List()).filter((val) => val.length).get(0, '');
  const jailSentenceDays = getMaxFromList(sentence, DAYS_JAIL);
  const jailSentenceDaysSusp = getMaxFromList(sentence, DAYS_SUSPENDED_JAIL);
  const jailSentenceDaysCredit = getMaxFromList(sentence, DAYS_CREDIT_JAIL);
  const jailSentenceMonths = getMaxFromList(sentence, MONTHS_JAIL);
  const jailSentenceMonthsSusp = getMaxFromList(sentence, MONTHS_SUSPENDED_JAIL);
  const jailSentenceMonthsCredit = getMaxFromList(sentence, MONTHS_CREDIT_JAIL);
  const jailSentenceYears = getMaxFromList(sentence, YEARS_JAIL);
  const jailSentenceYearsSusp = getMaxFromList(sentence, YEARS_SUSPENDED_JAIL);
  const jailSentenceYearsCredit = getMaxFromList(sentence, YEARS_CREDIT_JAIL);
  const jailConcConsec = sentence.getIn([CONCURRENT_CONSECUTIVE_JAIL, 0], '');

  const penStartDate = sentence.get(START_DATE_PEN, List()).filter((val) => val.length).get(0, '');
  const penSentenceDays = getMaxFromList(sentence, DAYS_PEN);
  const penSentenceDaysSusp = getMaxFromList(sentence, DAYS_SUSPENDED_PEN);
  const penSentenceDaysCredit = getMaxFromList(sentence, DAYS_CREDIT_PEN);
  const penSentenceMonths = getMaxFromList(sentence, MONTHS_PEN);
  const penSentenceMonthsSusp = getMaxFromList(sentence, MONTHS_SUSPENDED_PEN);
  const penSentenceMonthsCredit = getMaxFromList(sentence, MONTHS_CREDIT_PEN);
  const penSentenceYears = getMaxFromList(sentence, YEARS_PEN);
  const penSentenceYearsSusp = getMaxFromList(sentence, YEARS_SUSPENDED_PEN);
  const penSentenceYearsCredit = getMaxFromList(sentence, YEARS_CREDIT_PEN);
  const penConcConsec = sentence.getIn([CONCURRENT_CONSECUTIVE_PEN, 0], '');

  const daysServed = sentenceDays - sentenceDaysSusp;
  const monthsServed = sentenceMonths - sentenceMonthsSusp;
  const yearsServed = sentenceYears - sentenceYearsSusp;
  const jailDaysServed = Math.max((jailSentenceDays - jailSentenceDaysSusp), jailSentenceDaysCredit);
  const jailMonthsServed = Math.max((jailSentenceMonths - jailSentenceMonthsSusp), jailSentenceMonthsCredit);
  const jailYearsServed = Math.max((jailSentenceYears - jailSentenceYearsSusp), jailSentenceYearsCredit);
  const penDaysServed = Math.max((penSentenceDays - penSentenceDaysSusp), penSentenceDaysCredit);
  const penMonthsServed = Math.max((penSentenceMonths - penSentenceMonthsSusp), penSentenceMonthsCredit);
  const penYearsServed = Math.max((penSentenceYears - penSentenceYearsSusp), penSentenceYearsCredit);

  const concConsec = sentence.getIn([CONCURRENT_CONSECUTIVE, 0], '');
  const startDate = sentence.get(JAIL_START_DATE, List()).filter((val) => val.length).get(0, '');

  return {
    concConsec,
    daysServed,
    jailConcConsec,
    jailDaysServed,
    jailMonthsServed,
    jailStartDate,
    jailYearsServed,
    monthsServed,
    penConcConsec,
    penDaysServed,
    penMonthsServed,
    penStartDate,
    penYearsServed,
    sentenceDate,
    startDate,
    yearsServed
  };
};

export const caseLedToIncarceration = (sentences :List) => {
  let result = false;
  const sentencesServed = sentences
    .map((sentence) => getSentenceInfo(sentence))
    .filter((sentenceInfo) => timeWasServed(sentenceInfo));

  if (sentencesServed.size) {
    sentencesServed.forEach((sentence) => {
      if (
        sentence.monthsServed > 0
        || sentence.yearsServed > 0
        || sentence.daysServed >= 14
        || sentence.jailMonthsServed > 0
        || sentence.jailYearsServed > 0
        || sentence.jailDaysServed >= 14
        || sentence.penMonthsServed > 0
        || sentence.penYearsServed > 0
        || sentence.penDaysServed >= 14
      ) result = true;
    });

    if (!result) {
      const sentenceTypes = ['Legacy', 'Jail', 'Pen'];
      const sentencesByTypeAndStartDate = Map().withMutations((mutableMap) => {

        const getMaxDaysForDate = (type, daysServed, startDate) => {
          let maxDaysServed = daysServed;
          const prevMaxDaysServed = mutableMap.getIn([type, startDate], 0);
          if (prevMaxDaysServed && prevMaxDaysServed > daysServed) maxDaysServed = prevMaxDaysServed;
          if (startDate.length) mutableMap.setIn([type, startDate], maxDaysServed);
        };
        sentencesServed.forEach((sentence) => {
          const {
            daysServed,
            jailDaysServed,
            jailStartDate,
            penDaysServed,
            penStartDate,
            startDate
          } = sentence;
          getMaxDaysForDate(sentenceTypes[0], daysServed, startDate);
          getMaxDaysForDate(sentenceTypes[1], jailDaysServed, jailStartDate);
          getMaxDaysForDate(sentenceTypes[2], penDaysServed, penStartDate);
        });
      });

      let totalDays = 0;

      const datesToDaysLegacy = sentencesByTypeAndStartDate.get(sentenceTypes[0], Map());
      const datesToDaysJail = sentencesByTypeAndStartDate.get(sentenceTypes[1], Map());
      const datesToDaysPen = sentencesByTypeAndStartDate.get(sentenceTypes[2], Map());

      if (datesToDaysJail.size || datesToDaysPen.size) {
        datesToDaysJail.valueSeq().forEach((numDays) => {
          totalDays += numDays;
        });
        datesToDaysPen.valueSeq().forEach((numDays) => {
          totalDays += numDays;
        });
      }
      else {
        datesToDaysLegacy.valueSeq().forEach((numDays) => {
          totalDays += numDays;
        });
      }
      result = totalDays >= 14;
    }
  }

  return result;
};

export const getChargeIdToSentenceDate = (allSentences :List) => Map().withMutations((mutableMap) => {
  allSentences.forEach((sentence) => {
    const {
      [GENERAL_ID]: chargeId,
      [SENTENCE_DATE]: sentenceDate
    } = getEntityProperties(sentence, [GENERAL_ID, SENTENCE_DATE]);
    if (sentenceDate && sentenceDate.length) mutableMap.set(chargeId, sentenceDate);
  });
});

export const getSentenceToIncarcerationCaseNums = (allSentences :List) => {
  const sentencesByCase = Map().withMutations((mutableMap) => {
    allSentences.forEach((sentence) => {
      const sentenceIdSplit = sentence.getIn([GENERAL_ID, 0], '').split('|');
      if (sentenceIdSplit.length > 1) {
        const caseNum = sentenceIdSplit[0];
        mutableMap.set(caseNum, mutableMap.get(caseNum, List()).push(sentence));
      }
    });
  });

  const incarcerations = List().withMutations((mutableList) => {
    sentencesByCase.keySeq().forEach((caseNum) => {
      if (caseLedToIncarceration(sentencesByCase.get(caseNum))) {
        mutableList.push(caseNum);
      }
    });
  });

  return incarcerations;
};
