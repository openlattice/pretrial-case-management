/*
 * @flow
 */

import JSPDF from 'jspdf';
import Immutable from 'immutable';
import moment from 'moment';

import { formatValue, formatDate, formatDateList } from './Utils';
import {
  getViolentCharges,
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from './AutofillUtils';
import { getSentenceToIncarcerationCaseNums } from './consts/SentenceConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';

const {
  AGE_AT_CURRENT_ARREST,
  ARREST_DATE,
  CURRENT_VIOLENT_OFFENSE,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG,
  DOB,
  FILE_DATE,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  MOST_SERIOUS_CHARGE_DESC,
  MOST_SERIOUS_CHARGE_NO,
  MOST_SERIOUS_CHARGE_DEG,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_CONVICTION,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION,
  RACE,
  SEX,
  CHARGE_STATUTE,
  CHARGE_DESCRIPTION,
  CHARGE_DEGREE,
  CHARGE_ID,
  CASE_ID,
  PLEA,
  PLEA_DATE,
  DISPOSITION,
  DISPOSITION_DATE
} = PROPERTY_TYPES;

const LARGE_FONT_SIZE = 15;
const MEDIUM_FONT_SIZE = 13;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MAX = 200;
const Y_INC = 5;
const Y_INC_SMALL = 4;
const SCORE_OFFSET = 5;
const RESPONSE_OFFSET = (X_MAX * 2) / 3;
const GENERATED_RISK_FACTOR_OFFSET = X_MARGIN + 5;
const BOX_MARGIN = X_MARGIN + 5;
const BOX_HEIGHT = 10;
const BOX_WIDTH = (X_MAX - (2 * BOX_MARGIN)) / 6;

const newPage = (doc :Object, pageInit :number, name :string) :number[] => {
  const page = pageInit + 1;
  doc.addPage();
  doc.text(10, X_MARGIN, `${name} - ${page}`);
  return [20, page];
};

const getName = (selectedPerson :Immutable.Map<*, *>) :string => {
  let name = formatValue(selectedPerson.get(FIRST_NAME, ''));
  const middleName = selectedPerson.get(MIDDLE_NAME, '');
  if (middleName.length) name = name.concat(` ${formatValue(middleName)}`);
  name = name.concat(` ${formatValue(selectedPerson.get(LAST_NAME, ''))}`);
  return name;
};

const getMostSevChargeText = (pretrialInfo :Immutable.Map<*, *>) :string => {
  const mostSeriousChargeNoList = pretrialInfo.get(MOST_SERIOUS_CHARGE_NO, Immutable.List());
  const mostSeriousChargeDescList = pretrialInfo.get(MOST_SERIOUS_CHARGE_DESC, Immutable.List());
  const mostSeriousChargeDegList = pretrialInfo.get(MOST_SERIOUS_CHARGE_DEG, Immutable.List());

  if (!mostSeriousChargeNoList.size) return '';
  let text = formatValue(mostSeriousChargeNoList);
  if (mostSeriousChargeDescList.size) {
    text = text.concat(` ${formatValue(mostSeriousChargeDescList)}`);
  }
  if (mostSeriousChargeDegList.size) {
    text = text.concat(` (${formatValue(mostSeriousChargeDegList)})`);
  }
  return text;
};

const getChargeText = (charge :Immutable.Map<*, *>) :string => {
  const chargeNumList = charge.get(CHARGE_STATUTE, Immutable.List());
  const chargeDescList = charge.get(CHARGE_DESCRIPTION, Immutable.List());
  const chargeDegList = charge.get(CHARGE_DEGREE, Immutable.List());

  if (!chargeNumList.size) return '';

  let text = formatValue(chargeNumList);
  if (chargeDescList.size) {
    text = text.concat(` ${formatValue(chargeDescList)}`);
  }
  if (chargeDegList.size) {
    text = text.concat(` (${formatValue(chargeDegList)})`);
  }
  return text;
};

const getPleaText = (charge :Immutable.Map<*, *>) :string => {
  const pleaDateList = charge.get(PLEA_DATE, Immutable.List());
  const pleaList = charge.get(PLEA, Immutable.List());

  let text = formatDateList(pleaDateList);
  if (pleaList.size) {
    if (text.length) {
      text = `${text} -`;
    }
    text = `${text} ${formatValue(pleaList)}`;
  }

  return `Plea: ${text}`;
};

const getDispositionText = (charge :Immutable.Map<*, *>) :string => {
  const dispositionDateList = charge.get(DISPOSITION_DATE, Immutable.List());
  const dispositionList = charge.get(DISPOSITION, Immutable.List());

  let text = formatDateList(dispositionDateList);
  if (dispositionList.size) {
    if (text.length) {
      text = `${text} -`;
    }
    text = `${text} ${formatValue(dispositionList)}`;
  }

  return `Disposition: ${text}`;
};

const getPdfName = (name :string, dateSubmitted :string) :string => {
  const dashedName = name.replace(/\./g, '').replace(/ /g, '-');
  return `PSA-Report-${dashedName}-${formatDate(dateSubmitted)}.pdf`;
};

const getBooleanText = (bool :boolean) :string => (bool ? 'Yes' : 'No');

const thinLine = (doc :Object, y :number) :void => {
  doc.setLineWidth(0.1);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
};

const thickLine = (doc :Object, y :number) :void => {
  doc.setLineWidth(0.5);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
};

const header = (doc :Object, yInit :number) :number => {
  let y = yInit;
  doc.setFontSize(LARGE_FONT_SIZE);
  doc.text(X_MARGIN, y, 'PRETRIAL SERVICES');
  y += Y_INC * 2;
  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Public Safety Assessment (PSA) Report');
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC;
  return y;
};

const person = (
  doc :Object,
  yInit :number,
  selectedPerson :Immutable.Map<*, *>,
  selectedPretrialCase :Immutable.Map<*, *>,
  name :string,
  dateSubmitted :string
) :number => {
  let y = yInit;
  doc.text(X_MARGIN, y, `Name: ${name}`);
  doc.text(X_MAX / 2, y, `PSA - Court Completion Date: ${formatDate(dateSubmitted)}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `DOB: ${formatDateList(selectedPerson.get(DOB))}`);
  doc.text(X_MAX / 2, y, `Race: ${formatValue(selectedPerson.get(RACE))}`);
  doc.text(X_MAX - 50, y, `Gender: ${formatValue(selectedPerson.get(SEX))}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(selectedPretrialCase.get(ARREST_DATE, Immutable.List()))}`);
  doc.text(X_MAX / 2, y, `Case #: ${formatValue(selectedPretrialCase.get(CASE_ID, Immutable.List()))}`);
  y += Y_INC;
  return y;
};

const box = (doc :Object, y :number, num :number) :void => {
  const x = BOX_MARGIN + ((num - 1) * BOX_WIDTH);
  doc.rect(x, y, BOX_WIDTH, BOX_HEIGHT, 'FD');
  const textX = x + ((BOX_WIDTH / 2) - 1);
  const textY = y + ((BOX_HEIGHT / 2) + 1);
  doc.text(textX, textY, num.toString());
};

const unselectedBox = (doc :Object, y :number, value :number) :void => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  box(doc, y, value);
};

const selectedBox = (doc :Object, y :number, value :number) :void => {
  doc.setDrawColor(128);
  doc.setFillColor(0);
  doc.setTextColor(255);
  box(doc, y, value);
};

const scale = (doc :Object, yInit :number, value :number) :number => {
  let y = yInit;
  for (let i = 1; i <= 6; i += 1) {
    if (i <= value) selectedBox(doc, yInit, i);
    else unselectedBox(doc, yInit, i);
  }
  doc.setTextColor(0, 0, 0);
  y += Y_INC + BOX_HEIGHT;
  return y;
};

const nvcaFlag = (doc :Object, yInit :number, value :string) :number => {
  const flagIsTrue = value === 'Yes';
  let y = yInit;
  if (flagIsTrue) {
    doc.setFontSize(LARGE_FONT_SIZE);
    doc.setFontType('bold')
  }

  doc.text(X_MARGIN + SCORE_OFFSET + SCORE_OFFSET, y, value);
  if (flagIsTrue) {
    doc.setFontSize(FONT_SIZE);
    doc.setFontType('regular')
    y += Y_INC;
  }
  else {
    y += Y_INC;
  }
  return y;

}

const scores = (doc :Object, yInit :number, scoreValues :Immutable.Map<*, *>) :number => {
  let y = yInit;
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'New Violent Criminal Activity Flag');
  y += Y_INC;
  y = nvcaFlag(doc, y, getBooleanText(scoreValues.get('nvcaFlag')));
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'New Criminal Activity Scale');
  y += Y_INC;
  y = scale(doc, y, scoreValues.get('ncaScale'));
  y += Y_INC;
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'Failure to Appear Flag');
  y += Y_INC;
  y = scale(doc, y, scoreValues.get('ftaScale'));
  y += Y_INC;
  return y;
};

const charges = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  selectedPretrialCase :Immutable.Map<*, *>,
  selectedCharges :Immutable.List<*>,
  showDetails :boolean
) :number[] => {
  let y :number = yInit;
  let page :number = pageInit;
  doc.text(X_MARGIN, y, 'Charge(s):');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  if (!selectedCharges.size) {
    const chargeLines = doc.splitTextToSize(getMostSevChargeText(selectedPretrialCase), X_MAX - (2 * X_MARGIN));
    doc.text(X_MARGIN + SCORE_OFFSET, y, chargeLines);
    y += chargeLines.length * Y_INC_SMALL;
    thinLine(doc, y);
    y += Y_INC;
  }
  else {
    selectedCharges.forEach((charge) => {
      if (y > 260) {
        [y, page] = newPage(doc, page, name);
      }
      const chargeLines = doc.splitTextToSize(getChargeText(charge), X_MAX - (2 * X_MARGIN));
      doc.text(X_MARGIN + SCORE_OFFSET, y, chargeLines);
      y += chargeLines.length * (showDetails ? Y_INC : Y_INC_SMALL);
      if (showDetails) {
        const pleaLines = doc.splitTextToSize(getPleaText(charge), X_MAX - (2 * X_MARGIN));
        doc.text(X_MARGIN + SCORE_OFFSET, y, pleaLines);
        y += pleaLines.length * Y_INC;
        const dispositionLines = doc.splitTextToSize(getDispositionText(charge), X_MAX - (2 * X_MARGIN));
        doc.text(X_MARGIN + SCORE_OFFSET, y, dispositionLines);
        y += dispositionLines.length * Y_INC_SMALL;
      }
      thinLine(doc, y);
      y += Y_INC;
    });
  }
  return [y, page];
};

const chargeReferences = (yInit :number, doc :Object, referenceCharges :Immutable.List<*>) :number => {
  let y = yInit;
  if (referenceCharges.size) {
    const chargeText = referenceCharges.join(', ');
    const chargeLines = doc.splitTextToSize(chargeText, X_MAX - X_MARGIN - GENERATED_RISK_FACTOR_OFFSET);
    doc.setFontType('italic');
    doc.text(GENERATED_RISK_FACTOR_OFFSET, y, chargeLines);
    doc.setFontType('regular');
    y += (Y_INC * chargeLines.length);
  }
  return y;
};

const riskFactors = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  riskFactorVals :Immutable.Map<*, *>,
  currCharges :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  mostSeriousCharge :string,
  currCaseNum :string,
  dateArrested :string,
  allCases :Immutable.List<*>
) :number[] => {
  let y = yInit;
  let page = pageInit;
  if (y > 190) {
    [y, page] = newPage(doc, page, name);
  }

  const ageAtCurrentArrest = riskFactorVals.get(AGE_AT_CURRENT_ARREST);
  const currentViolentOffense = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE);
  const currentViolentOffenseAndYoung = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_AND_YOUNG);
  const pendingCharge = riskFactorVals.get(PENDING_CHARGE);
  const priorMisdemeanor = riskFactorVals.get(PRIOR_MISDEMEANOR);
  const priorFelony = riskFactorVals.get(PRIOR_FELONY);
  const priorConviction = riskFactorVals.get(PRIOR_CONVICTION);
  const priorViolentConviction = riskFactorVals.get(PRIOR_VIOLENT_CONVICTION);
  const priorFailureToAppearRecent = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_RECENT);
  const priorFailureToAppearOld = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_OLD);
  const priorSentenceToIncarceration = riskFactorVals.get(PRIOR_SENTENCE_TO_INCARCERATION);

  doc.text(X_MARGIN, y, 'Risk Factors:');
  doc.text(RESPONSE_OFFSET, y, 'Responses:');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  doc.text(X_MARGIN, y, '1. Age at Current Arrest');
  doc.text(RESPONSE_OFFSET, y, ageAtCurrentArrest);
  y += Y_INC;
  doc.text(X_MARGIN, y, '2. Current Violent Offense');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(currentViolentOffense));
  y += Y_INC;
  if (currentViolentOffense) {
    y = chargeReferences(y, doc, getViolentCharges(currCharges, mostSeriousCharge));
  }
  doc.text(X_MARGIN, y, '2a. Current Violent Offense & 20 Years Old or Younger');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(currentViolentOffenseAndYoung));
  y += Y_INC;
  doc.text(X_MARGIN, y, '3. Pending Charge at the Time of the Offense');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(pendingCharge));
  y += Y_INC;
  if (pendingCharge) {
    y = chargeReferences(y, doc, getPendingCharges(currCaseNum, dateArrested, allCases, allCharges));
  }
  doc.text(X_MARGIN, y, '4. Prior Misdemeanor Conviction');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(priorMisdemeanor));
  y += Y_INC;
  if (priorMisdemeanor) {
    y = chargeReferences(y, doc, getPreviousMisdemeanors(allCharges));
  }
  doc.text(X_MARGIN, y, '5. Prior Felony Conviction');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(priorFelony));
  y += Y_INC;
  if (priorFelony) {
    y = chargeReferences(y, doc, getPreviousFelonies(allCharges));
  }
  doc.text(X_MARGIN, y, '5a. Prior Conviction (Prior Felony or Misdemeanor Conviction)');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(priorConviction));
  y += Y_INC;
  doc.text(X_MARGIN, y, '6. Prior Violent Conviction');
  doc.text(RESPONSE_OFFSET, y, priorViolentConviction);
  y += Y_INC;
  if (priorViolentConviction > 0) {
    y = chargeReferences(y, doc, getPreviousViolentCharges(allCharges));
  }
  doc.text(X_MARGIN, y, '7. Prior Pre-Trial Failure to Appear in the Last 2 Years');
  doc.text(RESPONSE_OFFSET, y, priorFailureToAppearRecent);
  y += Y_INC;
  doc.text(X_MARGIN, y, '8. Prior Pre-Trial Failure to Appear Older than 2 Years');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(priorFailureToAppearOld));
  y += Y_INC;
  doc.text(X_MARGIN, y, '9. Prior Sentence to Incarceration');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(priorSentenceToIncarceration));
  y += Y_INC;
  if (priorSentenceToIncarceration) {
    y = chargeReferences(y, doc, getSentenceToIncarcerationCaseNums(allSentences));
  }
  y += Y_INC;
  return [y, page];
};

const recommendations = (doc :Object, yInit :number, releaseRecommendation :string) :number => {
  let y = yInit;
  doc.text(X_MARGIN, y, 'Notes:');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  const recommendationLines = doc.splitTextToSize(releaseRecommendation, X_MAX - (2 * X_MARGIN));
  doc.text(X_MARGIN, y, recommendationLines);
  y += (recommendationLines.length * Y_INC);
  return y;
};

const caseHistoryHeader = (doc :Object, yInit :number) :number => {
  let y = yInit;
  doc.setFontSize(LARGE_FONT_SIZE);
  doc.text(X_MARGIN, y, 'CASE HISTORY');
  y += Y_INC * 2;
  doc.setFontSize(FONT_SIZE);
  thickLine(doc, y);
  y += Y_INC;
  return y;
};

const getChargesByCaseNum = (allCharges :Immutable.List<*>) :Immutable.Map<*, *> => {
  let chargesByCaseNum = Immutable.Map();
  allCharges.forEach((charge) => {
    const chargeIdStr = charge.getIn([CHARGE_ID, 0], '');
    if (chargeIdStr.length) {
      const chargeIdElements = chargeIdStr.split('|');
      if (chargeIdElements && chargeIdElements.length) {
        const caseNum = chargeIdElements[0];
        chargesByCaseNum = chargesByCaseNum.set(caseNum, chargesByCaseNum.get(caseNum, Immutable.List()).push(charge));
      }
    }
  });
  return chargesByCaseNum;
};

const caseHistory = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  allCases :Immutable.List<*>,
  chargesByCaseNum :Immutable.Map<*, *>
) :number[] => {
  let [y, page] = newPage(doc, pageInit, name);
  y = caseHistoryHeader(doc, y);

  allCases.forEach((c) => {
    y += Y_INC;
    if (y > 260) {
      [y, page] = newPage(doc, page, name);
    }
    thickLine(doc, y);
    y += Y_INC;
    const caseNumArr = c.get(CASE_ID, Immutable.List());
    const caseNum = (caseNumArr.size) ? formatValue(caseNumArr) : '';
    doc.text(X_MARGIN, y, `Case Number: ${caseNum}`);
    y += Y_INC;
    doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(c.get(ARREST_DATE, Immutable.List()))}`);
    y += Y_INC;
    const chargesForCase = chargesByCaseNum.get(caseNum, Immutable.List());
    if (chargesForCase.size) {
      [y, page] = charges(doc, y, page, name, null, chargesForCase, true);
    }
    thickLine(doc, y);
    y += Y_INC;
  });
  return [y, page];
};

const exportPDF = (
  data :Immutable.Map<*, *>,
  selectedPretrialCase :Immutable.Map<*, *>,
  selectedPerson :Immutable.Map<*, *>,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  dateSubmitted :string
) :void => {
  const doc = new JSPDF();
  doc.setFontType('regular');
  let y = 20;
  let page = 1;
  const name = getName(selectedPerson);
  const chargesByCaseNum = getChargesByCaseNum(allCharges);
  const caseIdArr = selectedPretrialCase.get(CASE_ID, Immutable.List());
  const mostSeriousCharge = selectedPretrialCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');

  const caseNum = (caseIdArr.size) ? formatValue(caseIdArr) : '';
  const currCharges = chargesByCaseNum.get(caseNum, Immutable.List());

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson, selectedPretrialCase, name, dateSubmitted);
  thickLine(doc, y);
  y += Y_INC;

  // SCORES SECTION
  y = scores(doc, y, data.get('scores'));
  thickLine(doc, y);
  y += Y_INC;

  // CHARGES SECTION
  [y, page] = charges(doc, y, page, name, selectedPretrialCase, currCharges, false);
  thickLine(doc, y);
  y += Y_INC;

  // RISK FACTORS SECTION
  [y, page] = riskFactors(
    doc,
    y,
    page,
    name,
    data.get('riskFactors'),
    currCharges,
    allCharges,
    allSentences,
    mostSeriousCharge,
    selectedPretrialCase.getIn([CASE_ID, 0], ''),
    selectedPretrialCase.getIn([ARREST_DATE, 0], selectedPretrialCase.getIn([FILE_DATE, 0], '')),
    allCases
  );
  thickLine(doc, y);
  y += Y_INC;

  // RECOMMENDATION SECTION
  y = recommendations(doc, y, data.get('notes', data.get('recommendations', ''), ''));

  // CASE HISTORY SECCTION=
  [y, page] = caseHistory(doc, y, page, name, allCases, chargesByCaseNum);

  doc.save(getPdfName(name, dateSubmitted));
};

export default exportPDF;
