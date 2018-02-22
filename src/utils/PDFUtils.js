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
import { PROPERTY_TYPES } from './consts/DataModelConsts';

const {
  AGE_AT_CURRENT_ARREST_FQN,
  ARREST_DATE_FQN,
  CURRENT_VIOLENT_OFFENSE_FQN,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN,
  DOB,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  MOST_SERIOUS_CHARGE_DESC,
  MOST_SERIOUS_CHARGE_NO,
  MOST_SERIOUS_CHARGE_DEG,
  PENDING_CHARGE_FQN,
  PERSON_ID,
  PRIOR_MISDEMEANOR_FQN,
  PRIOR_FELONY_FQN,
  PRIOR_CONVICTION_FQN,
  PRIOR_VIOLENT_CONVICTION_FQN,
  PRIOR_FAILURE_TO_APPEAR_RECENT_FQN,
  PRIOR_FAILURE_TO_APPEAR_OLD_FQN,
  PRIOR_SENTENCE_TO_INCARCERATION_FQN,
  RACE,
  SEX,
  CHARGE_NUM_FQN,
  CHARGE_DESCRIPTION_FQN,
  CHARGE_DEGREE_FQN,
  CHARGE_ID_FQN,
  CASE_ID_FQN,
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

const newPage = (doc, pageInit, name) => {
  const page = pageInit + 1;
  doc.addPage();
  doc.text(10, X_MARGIN, `${name} - ${page}`);
  return [20, page];
};

const getName = (selectedPerson) => {
  let name = formatValue(selectedPerson.get(FIRST_NAME, ''));
  const middleName = selectedPerson.get(MIDDLE_NAME, '');
  if (middleName.length) name = name.concat(` ${formatValue(middleName)}`);
  name = name.concat(` ${formatValue(selectedPerson.get(LAST_NAME, ''))}`);
  return name;
};

const getMostSevChargeText = (pretrialInfo) => {
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

const getChargeText = (charge) => {
  const chargeNumList = charge.get(CHARGE_NUM_FQN, Immutable.List());
  const chargeDescList = charge.get(CHARGE_DESCRIPTION_FQN, Immutable.List());
  const chargeDegList = charge.get(CHARGE_DEGREE_FQN, Immutable.List());

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

const getPleaText = (charge) => {
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

const getDispositionText = (charge) => {
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

const getPdfName = (name) => {
  const dashedName = name.replace(/\./g, '').replace(/ /g, '-');
  return `PSA-Report-${dashedName}-${moment().format('MM/DD/YYYY')}.pdf`;
};

const getBooleanText = bool => (bool ? 'Yes' : 'No');

const thinLine = (doc, y) => {
  doc.setLineWidth(0.1);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
};

const thickLine = (doc, y) => {
  doc.setLineWidth(0.5);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
};

const header = (doc, yInit) => {
  let y = yInit;
  doc.setFontSize(LARGE_FONT_SIZE);
  doc.text(X_MARGIN, y, 'PRETRIAL SERVICES');
  y += Y_INC * 2;
  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Public Safety Assessment - Court Report');
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC;
  return y;
};

const person = (doc, yInit, selectedPerson, selectedPretrialCase, name) => {
  let y = yInit;
  doc.text(X_MARGIN, y, `Name: ${name}`);
  doc.text(X_MAX / 2, y, `PID: ${formatValue(selectedPerson.get(PERSON_ID))}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `DOB: ${formatDateList(selectedPerson.get(DOB))}`);
  doc.text(X_MAX / 2, y, `Race: ${formatValue(selectedPerson.get(RACE))}`);
  doc.text(X_MAX - 50, y, `Gender: ${formatValue(selectedPerson.get(SEX))}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(selectedPretrialCase.get(ARREST_DATE_FQN, Immutable.List()))}`);
  doc.text(X_MAX / 2, y, `PSA - Court Completion Date: ${formatDate(moment().toISOString())}`);
  y += Y_INC;
  return y;
};

const box = (doc, y, num) => {
  const x = BOX_MARGIN + ((num - 1) * BOX_WIDTH);
  doc.rect(x, y, BOX_WIDTH, BOX_HEIGHT, 'FD');
  const textX = x + ((BOX_WIDTH / 2) - 1);
  const textY = y + ((BOX_HEIGHT / 2) + 1);
  doc.text(textX, textY, num.toString());
};

const unselectedBox = (doc, y, value) => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  box(doc, y, value);
};

const selectedBox = (doc, y, value) => {
  doc.setDrawColor(128);
  doc.setFillColor(0);
  doc.setTextColor(255);
  box(doc, y, value);
};

const scale = (doc, yInit, value) => {
  let y = yInit;
  for (let i = 1; i <= 6; i += 1) {
    if (i <= value) selectedBox(doc, yInit, i);
    else unselectedBox(doc, yInit, i);
  }
  doc.setTextColor(0, 0, 0);
  y += Y_INC + BOX_HEIGHT;
  return y;
};

const scores = (doc, yInit, scoreValues) => {
  let y = yInit;
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'New Violent Criminal Activity Flag');
  y += Y_INC;
  doc.text(X_MARGIN + SCORE_OFFSET + SCORE_OFFSET, y, getBooleanText(scoreValues.get('nvcaFlag')));
  y += Y_INC;
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

const charges = (doc, yInit, pageInit, name, selectedPretrialCase, selectedCharges, showDetails) => {
  let y = yInit;
  let page = pageInit;
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

const chargeReferences = (yInit, doc, referenceCharges) => {
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
  doc,
  yInit,
  pageInit,
  name,
  riskFactorVals,
  currCharges,
  allCharges,
  mostSeriousCharge,
  currCaseNum,
  dateArrested,
  allCases
) => {
  let y = yInit;
  let page = pageInit;
  if (y > 190) {
    [y, page] = newPage(doc, page, name);
  }

  const ageAtCurrentArrest = riskFactorVals.get(AGE_AT_CURRENT_ARREST_FQN);
  const currentViolentOffense = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_FQN);
  const currentViolentOffenseAndYoung = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN);
  const pendingCharge = riskFactorVals.get(PENDING_CHARGE_FQN);
  const priorMisdemeanor = riskFactorVals.get(PRIOR_MISDEMEANOR_FQN);
  const priorFelony = riskFactorVals.get(PRIOR_FELONY_FQN);
  const priorConviction = riskFactorVals.get(PRIOR_CONVICTION_FQN);
  const priorViolentConviction = riskFactorVals.get(PRIOR_VIOLENT_CONVICTION_FQN);
  const priorFailureToAppearRecent = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_RECENT_FQN);
  const priorFailureToAppearOld = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_OLD_FQN);
  const priorSentenceToIncarceration = riskFactorVals.get(PRIOR_SENTENCE_TO_INCARCERATION_FQN);

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
  doc.text(GENERATED_RISK_FACTOR_OFFSET, y, 'a. Current Violent Offense & 20 Years Old or Younger');
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
  doc.text(GENERATED_RISK_FACTOR_OFFSET, y, 'a. Prior Conviction');
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
  return [y, page];
};

const recommendations = (doc, yInit, releaseRecommendation) => {
  let y = yInit;
  doc.text(X_MARGIN, y, 'Recommendations:');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  const recommendationText = `Release recommendation - ${releaseRecommendation}`;
  const recommendationLines = doc.splitTextToSize(recommendationText, X_MAX - (2 * X_MARGIN));
  doc.text(X_MARGIN, y, recommendationLines);
  y += (recommendationLines.length * Y_INC);
  return y;
};

const caseHistoryHeader = (doc, yInit) => {
  let y = yInit;
  doc.setFontSize(LARGE_FONT_SIZE);
  doc.text(X_MARGIN, y, 'CASE HISTORY');
  y += Y_INC * 2;
  doc.setFontSize(FONT_SIZE);
  thickLine(doc, y);
  y += Y_INC;
  return y;
};

const getChargesByCaseNum = (allCharges) => {
  let chargesByCaseNum = Immutable.Map();
  allCharges.forEach((charge) => {
    const chargeIdStr = charge.getIn([CHARGE_ID_FQN, 0], '');
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

const caseHistory = (doc, yInit, pageInit, name, allCases, chargesByCaseNum) => {
  let [y, page] = newPage(doc, pageInit, name);
  y = caseHistoryHeader(doc, y);

  allCases.forEach((c) => {
    y += Y_INC;
    if (y > 260) {
      [y, page] = newPage(doc, page, name);
    }
    thickLine(doc, y);
    y += Y_INC;
    const caseNumArr = c.get(CASE_ID_FQN, Immutable.List());
    const caseNum = (caseNumArr.size) ? formatValue(caseNumArr) : '';
    doc.text(X_MARGIN, y, `Case Number: ${caseNum}`);
    y += Y_INC;
    doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(c.get(ARREST_DATE_FQN, Immutable.List()))}`);
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

const exportPDF = (data, selectedPretrialCase, selectedPerson, allCases, allCharges) => {
  const doc = new JSPDF();
  doc.setFontType('regular');
  let y = 20;
  let page = 1;
  const name = getName(selectedPerson);
  const chargesByCaseNum = getChargesByCaseNum(allCharges);
  const caseIdArr = selectedPretrialCase.get(CASE_ID_FQN, Immutable.List());
  const mostSeriousCharge = selectedPretrialCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');

  const caseNum = (caseIdArr.size) ? formatValue(caseIdArr) : '';
  const currCharges = chargesByCaseNum.get(caseNum, Immutable.List());

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson, selectedPretrialCase, name);
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
    mostSeriousCharge,
    selectedPretrialCase.getIn([CASE_ID_FQN, 0], ''),
    selectedPretrialCase.getIn([ARREST_DATE_FQN, 0], ''),
    allCases
  );
  thickLine(doc, y);
  y += Y_INC;

  // RECOMMENDATION SECTION
  y = recommendations(doc, y, data.get('releaseRecommendation'));

  // CASE HISTORY SECCTION=
  [y, page] = caseHistory(doc, y, page, name, allCases, chargesByCaseNum);

  doc.save(getPdfName(name));
};

export default exportPDF;
