/*
 * @flow
 */

import JSPDF from 'jspdf';
import Immutable from 'immutable';
import moment from 'moment';

import { formatValue, formatDate, formatDateTime, formatDateList } from './Utils';
import {
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from './AutofillUtils';
import { getAllViolentCharges } from './consts/ArrestChargeConsts';
import { getSentenceToIncarcerationCaseNums } from './consts/SentenceConsts';
import { getRecentFTAs, getOldFTAs } from './FTAUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getHeaderText, getConditionsTextList } from './consts/DMFResultConsts';
import { stepTwoIncrease, stepFourIncrease, dmfSecondaryReleaseDecrease } from './ScoringUtils';

const {
  AGE_AT_CURRENT_ARREST,
  AGE_AT_CURRENT_ARREST_NOTES,
  ARREST_DATE,
  ARREST_DATE_TIME,
  CURRENT_VIOLENT_OFFENSE,
  CURRENT_VIOLENT_OFFENSE_NOTES,
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
  PENDING_CHARGE_NOTES,
  PRIOR_MISDEMEANOR,
  PRIOR_MISDEMEANOR_NOTES,
  PRIOR_FELONY,
  PRIOR_FELONY_NOTES,
  PRIOR_CONVICTION,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_VIOLENT_CONVICTION_NOTES,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_FAILURE_TO_APPEAR_OLD_NOTES,
  PRIOR_SENTENCE_TO_INCARCERATION,
  PRIOR_SENTENCE_TO_INCARCERATION_NOTES,
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
  DISPOSITION_DATE,
  QUALIFIER
} = PROPERTY_TYPES;

const LARGE_FONT_SIZE = 15;
const MEDIUM_FONT_SIZE = 14;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MAX = 200;
const Y_INC = 5;
const Y_INC_SMALL = 4;
const Y_INC_LARGE = 7;
const SCORE_OFFSET = 5;
const RESPONSE_OFFSET = (X_MAX * 2) / 3;
const GENERATED_RISK_FACTOR_OFFSET = X_MARGIN + 5;
const BOX_MARGIN = X_MARGIN + 5;
const BOX_HEIGHT = 8;
const BOX_WIDTH = ((X_MAX / 2) - (2 * BOX_MARGIN)) / 6;

const X_COL_1 = X_MARGIN;
const X_COL_2 = (X_MAX / 2) - 30;
const X_COL_3 = (X_MAX / 2) + 10;

const detailHeaderText = (doc, y, xOffset, text) => {
  doc.setTextColor(155, 155, 155);
  doc.setFontSize(9);
  doc.text(xOffset, y, text);
};

const detailValueText = (doc, y, xOffset, text) => {
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(xOffset, y, text);
};

const newPage = (doc :Object, pageInit :number, name :string) :number[] => {
  const page = pageInit + 1;
  doc.addPage();
  doc.text(10, X_MARGIN, `${name} - ${page}`);
  return [20, page];
};

const tryIncrementPage = (doc :Object, yInit :number, pageInit :number, name :string) => {
  let y = yInit;
  let page = pageInit;
  if (y > 260) {
    [y, page] = newPage(doc, page, name);
  }
  return [y, page];
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
  const chargeDescList = formatValue(charge.get(CHARGE_DESCRIPTION, Immutable.List()));
  const chargeDegList = formatValue(charge.get(CHARGE_DEGREE, Immutable.List()));

  let text = '';
  if (chargeDescList.length) {
    text = text.concat(` ${chargeDescList}`);
  }
  if (chargeDegList.length) {
    text = text.concat(` (${chargeDegList})`);
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
  doc.setDrawColor(152);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
  doc.setFont('helvetica', 'normal');
};

const thickLine = (doc :Object, y :number) :void => {
  doc.setLineWidth(0.5);
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
  doc.setFont('helvetica', 'normal');
};

const header = (doc :Object, yInit :number) :number => {
  let y = yInit;
  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Public Safety Assessment (PSA) Report');
  y += Y_INC;
  doc.setFontType('normal');
  thickLine(doc, y);
  y += Y_INC_LARGE;
  return y;
};

const person = (
  doc :Object,
  yInit :number,
  selectedPerson :Immutable.Map<*, *>,
  selectedPretrialCase :Immutable.Map<*, *>,
  name :string,
  createData :{
    user :string,
    timestamp :string
  },
  updateData :{
    user :string,
    timestamp :string
  }
) :number => {
  /* person name header section */
  let y = yInit;
  detailHeaderText(doc, y, X_MARGIN, 'NAME');
  y += Y_INC;
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(X_MARGIN, y, name);
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC_LARGE;

  /* person details section */

  detailHeaderText(doc, y, X_COL_1, 'DOB');
  detailHeaderText(doc, y, X_COL_2, 'GENDER');
  detailHeaderText(doc, y, X_COL_3, 'PSA - COURT COMPLETION DATE');
  y += Y_INC;
  detailValueText(doc, y, X_COL_1, formatDateList(selectedPerson.get(DOB)));
  detailValueText(doc, y, X_COL_2, formatValue(selectedPerson.get(SEX)));
  detailValueText(doc, y, X_COL_3, formatDate(createData.timestamp));
  y += Y_INC_LARGE;

  detailHeaderText(doc, y, X_COL_1, 'ARREST DATE');
  detailHeaderText(doc, y, X_COL_3, 'RACE');
  y += Y_INC;
  detailValueText(doc, y, X_COL_1, formatDateList(selectedPretrialCase.get(ARREST_DATE_TIME, Immutable.List())));
  detailValueText(doc, y, X_COL_3, formatValue(selectedPerson.get(RACE)));
  y += Y_INC_LARGE;


  let createdText = createData.user;
  let editedText = '';
  if (createData.timestamp && moment(createData.timestamp).isValid()) {
    createdText = `${createdText} at ${formatDateTime(createData.timestamp)}`;
  }

  if (updateData) {
    editedText = updateData.user;
    if (updateData.timestamp && moment(updateData.timestamp).isValid()) {
      editedText = `${editedText} at ${formatDateTime(updateData.timestamp)}`;
    }
  }

  detailHeaderText(doc, y, X_COL_1, 'CREATED BY');
  detailHeaderText(doc, y, X_COL_3, 'EDITED_BY');
  y += Y_INC;
  detailValueText(doc, y, X_COL_1, createdText);
  detailValueText(doc, y, X_COL_3, editedText);
  y += Y_INC;
  return y;
};

const box = (doc :Object, y :number, xOffset :number, num :number, score :number) :void => {
  const x = xOffset + ((num - 1) * BOX_WIDTH);
  doc.rect(x, y, BOX_WIDTH, BOX_HEIGHT, 'FD');
  const textX = x + ((BOX_WIDTH / 2) - 1);
  const textY = y + ((BOX_HEIGHT / 2) + 1);
  if (num === score) {
    doc.setFontType('bold')
    doc.text(textX, textY, num.toString());
    doc.setFontType('regular')
  }
};

const unselectedBox = (doc :Object, y :number, xOffset :number, value :number, score :number) :void => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  doc.setLineWidth(0);
  box(doc, y, xOffset, value, score);
};

const selectedBox = (doc :Object, y :number, xOffset :number, value :number, score :number) :void => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  doc.setLineWidth(0.5);
  box(doc, y, xOffset, value, score);
}

const scale = (doc :Object, yInit :number, xOffset :number, value :number) :number => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  let y = yInit;
  for (let i = 1; i <= 7; i += 1) {
    if (i <= value) {
      selectedBox(doc, yInit, xOffset, i, value);
    }
    else {
      unselectedBox(doc, yInit, xOffset, i, value);
    }
  }
  doc.setTextColor(0, 0, 0);
  y += Y_INC_LARGE + BOX_HEIGHT;
  return y;
};

const nvcaFlag = (doc :Object, yInit :number, value :string) :number => {
  let y = yInit;
  const flagIsTrue = value === 'Yes';
  const fontType = flagIsTrue ? 'bold' : 'normal';
  doc.setFontType(fontType);

  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);

  const width = 18;
  const height = 7;

  doc.roundedRect(X_COL_1, y, width, height, 1, 1, 'FD');
  const textXOffset = flagIsTrue ? 3 : 2;
  const textX = X_COL_1 + ((width / 2) - textXOffset);
  const textY = y + ((height / 2) + 1);
  doc.text(textX, textY, value);
  y += height + Y_INC_LARGE;
  doc.setFontType('normal');
  return y;
};

const scoreHeader = (doc, y, xOffset, text) => {
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFontType('bold');
  doc.text(xOffset, y, text);
  doc.setFontType('normal');
};

const scores = (doc :Object, yInit :number, scoreValues :Immutable.Map<*, *>) :number => {
  let y = yInit;
  scoreHeader(doc, y, X_COL_1, 'New Violent Criminal Activity Flag');
  y += Y_INC_SMALL;
  y = nvcaFlag(doc, y, getBooleanText(scoreValues.getIn([PROPERTY_TYPES.NVCA_FLAG, 0])));

  scoreHeader(doc, y, X_COL_1, 'New Criminal Activity Scale');
  scoreHeader(doc, y, X_COL_3, 'Failure to Appear Scale');
  y += Y_INC_SMALL;
  scale(doc, y, X_COL_1, scoreValues.getIn([PROPERTY_TYPES.NCA_SCALE, 0]));
  y = scale(doc, y, X_COL_3, scoreValues.getIn([PROPERTY_TYPES.FTA_SCALE, 0]));

  return y;
};

const dmf = (
  doc :Object,
  yInit :number,
  dmfValues :Immutable.Map<*, *>,
  dmfRiskFactors :Immutable.Map<*, *>,
  psaRiskFactors :Immutable.Map<*, *>,
  scores :Immutable.Map<*, *>
) :number => {
  let y = yInit;
  doc.setFont('helvetica', 'normal');
  if (dmfValues.size) {
    scoreHeader(doc, y, X_COL_1, 'DMF Result');
    y += Y_INC_LARGE;
    detailValueText(doc, y, X_COL_1, getHeaderText(dmfValues.toJS()));
    y += Y_INC;

    let modificationText;
    if (stepTwoIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
      modificationText = 'Step two increase.';
    }
    else if (stepFourIncrease(dmfRiskFactors, psaRiskFactors, scores)) {
      modificationText = 'Step four increase.';
    }
    else if (dmfSecondaryReleaseDecrease(dmfRiskFactors, scores)) {
      modificationText = 'Exception release.';
    }

    if (modificationText) {
      doc.setFontType('italic');
      doc.text(X_COL_1 + 5, y, modificationText);
      doc.setFontType('normal');
      y += Y_INC;
    }

    const conditionsText = getConditionsTextList(dmfValues.toJS()).join(' - ');
    if (conditionsText.length) {
      doc.setDrawColor(152);
      doc.setFillColor(255);
      doc.setTextColor(122);
      doc.setFontSize(10);
      const textPadding = 5;
      const width = (doc.getTextWidth(conditionsText) + (2 * textPadding));
      const height = 8;

      doc.rect(X_COL_1, y, width, height, 'FD');
      const textX = X_COL_1 + textPadding;
      const textY = y + ((height / 2) + 1);
      doc.text(textX, textY, conditionsText);
      doc.setFontType('regular');
      doc.setTextColor(0);
      y += height + Y_INC;
    }
  }
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
  scoreHeader(doc, y, X_COL_1, 'Charges');
  y += Y_INC_LARGE;
  doc.setFontSize(10);
  selectedCharges.forEach((charge) => {
    if (y > 260) {
      [y, page] = newPage(doc, page, name);
    }
    const CHARGE_OFFSET = 20;

    doc.text(X_COL_1, y, formatValue(charge.get(CHARGE_STATUTE, Immutable.List())));
    const chargeLines = doc.splitTextToSize(getChargeText(charge), X_MAX - CHARGE_OFFSET);
    doc.text(X_COL_1 + CHARGE_OFFSET, y, chargeLines);
    y += chargeLines.length * Y_INC;
    if (showDetails) {
      const pleaLines = doc.splitTextToSize(getPleaText(charge), X_MAX - (2 * X_MARGIN));
      doc.text(X_MARGIN + SCORE_OFFSET, y, pleaLines);
      y += pleaLines.length * Y_INC;
      const dispositionLines = doc.splitTextToSize(getDispositionText(charge), X_MAX - (2 * X_MARGIN));
      doc.text(X_MARGIN + SCORE_OFFSET, y, dispositionLines);
      y += dispositionLines.length * Y_INC_SMALL;
    }
  });
  return [y, page];
};

const chargeReferences = (yInit :number, doc :Object, referenceCharges :Immutable.List<*>) :number => {
  let y = yInit;
  if (referenceCharges.size) {
    const chargeText = `Case history references: ${referenceCharges.join(', ')}`;
    const chargeLines = doc.splitTextToSize(chargeText, X_MAX - X_MARGIN - GENERATED_RISK_FACTOR_OFFSET);
    doc.setFontType('italic');
    doc.text(GENERATED_RISK_FACTOR_OFFSET, y, chargeLines);
    doc.setFontType('regular');
    y += (Y_INC * chargeLines.length);
  }
  return y;
};

const riskFactorNotes = (yInit :number, doc :Object, note :string) :number => {
  let y = yInit + Y_INC;
  if (note && note.length) {
    const noteText = `Notes: ${note}`;
    const noteLines = doc.splitTextToSize(noteText, X_MAX - X_MARGIN - GENERATED_RISK_FACTOR_OFFSET);
    doc.text(GENERATED_RISK_FACTOR_OFFSET, y, noteLines);
    y += (Y_INC * noteLines.length);
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
  allCases :Immutable.List<*>,
  allFTAs :Immutable.List<*>
) :number[] => {
  let y = yInit;
  let page = pageInit;
  [y, page] = tryIncrementPage(doc, y, page, name);

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

  const xCol2 = X_COL_1 + 5;

  scoreHeader(doc, y, X_COL_1, 'Risk Factors');
  detailHeaderText(doc, y, X_COL_3, 'RESPONSES');
  y += Y_INC;
  thinLine(doc, y);
  y += Y_INC;
  doc.setTextColor(0);

  doc.text(X_COL_1, y, '1');
  doc.text(xCol2, y, 'Age at Current Arrest');
  doc.text(X_COL_3, y, ageAtCurrentArrest);
  //y = riskFactorNotes(y, doc, riskFactorVals.get(AGE_AT_CURRENT_ARREST_NOTES));
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '2');
  doc.text(xCol2, y, 'Current Violent Offense');
  doc.text(X_COL_3, y, getBooleanText(currentViolentOffense));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_NOTES));
  // if (currentViolentOffense) {
  //   y = chargeReferences(y, doc, getAllViolentCharges(currCharges));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '2a');
  doc.text(xCol2, y, 'Current Violent Offense & 20 Years Old or Younger');
  doc.text(X_COL_3, y, getBooleanText(currentViolentOffenseAndYoung));
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '3');
  doc.text(xCol2, y, 'Pending Charge at the Time of the Offense');
  doc.text(X_COL_3, y, getBooleanText(pendingCharge));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PENDING_CHARGE_NOTES));
  // if (pendingCharge) {
  //   y = chargeReferences(y, doc, getPendingCharges(currCaseNum, dateArrested, allCases, allCharges));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '4');
  doc.text(xCol2, y, 'Prior Misdemeanor Conviction');
  doc.text(X_COL_3, y, getBooleanText(priorMisdemeanor));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_MISDEMEANOR_NOTES));
  // if (priorMisdemeanor) {
  //   y = chargeReferences(y, doc, getPreviousMisdemeanors(allCharges));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '5');
  doc.text(xCol2, y, 'Prior Felony Conviction');
  doc.text(X_COL_3, y, getBooleanText(priorFelony));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FELONY_NOTES));
  // if (priorFelony) {
  //   y = chargeReferences(y, doc, getPreviousFelonies(allCharges));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '5a');
  doc.text(xCol2, y, 'Prior Conviction');
  doc.text(X_COL_3, y, getBooleanText(priorConviction));
  y += Y_INC;

  doc.text(X_COL_1, y, '6');
  doc.text(xCol2, y, 'Prior Violent Conviction');
  doc.text(X_COL_3, y, priorViolentConviction);
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_VIOLENT_CONVICTION_NOTES));
  // if (priorViolentConviction > 0) {
  //   y = chargeReferences(y, doc, getPreviousViolentCharges(allCharges));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '7');
  doc.text(xCol2, y, 'Prior Pretrial Failure to Appear in the Last 2 Years');
  doc.text(X_COL_3, y, priorFailureToAppearRecent);
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES));
  // if (priorFailureToAppearRecent > 0) {
  //   y = chargeReferences(y, doc, getRecentFTAs(allFTAs));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '8');
  doc.text(xCol2, y, 'Prior Pretrial Failure to Appear Older than 2 Years');
  doc.text(X_COL_3, y, getBooleanText(priorFailureToAppearOld));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_OLD_NOTES));
  // if (priorFailureToAppearOld) {
  //   y = chargeReferences(y, doc, getOldFTAs(allFTAs));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
  y += Y_INC;

  doc.text(X_COL_1, y, '9');
  doc.text(xCol2, y, 'Prior Sentence to Incarceration');
  doc.text(X_COL_3, y, getBooleanText(priorSentenceToIncarceration));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_SENTENCE_TO_INCARCERATION_NOTES));
  // if (priorSentenceToIncarceration) {
  //   y = chargeReferences(y, doc, getSentenceToIncarcerationCaseNums(allSentences));
  // }
  [y, page] = tryIncrementPage(doc, y, page, name);
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
  selectedCharges :Immutable.Map<*, *>,
  selectedPerson :Immutable.Map<*, *>,
  allCases :Immutable.List<*>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  allFTAs :Immutable.List<*>,
  createData :{
    user :string,
    timestamp :string
  },
  updateData :{
    user :string,
    timestamp :string
  }
) :void => {
  const doc = new JSPDF();
  doc.setFont('helvetica', 'normal');
  let y = 15;
  let page = 1;
  const name = getName(selectedPerson);
  const chargesByCaseNum = getChargesByCaseNum(allCharges);
  const mostSeriousCharge = selectedPretrialCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson, selectedPretrialCase, name, createData, updateData);
  thinLine(doc, y);
  y += Y_INC_LARGE;

  // SCORES SECTION
  y = scores(doc, y, data.get('scores'));

  // DMF SECTION
  y = dmf(doc, y, data.get('dmf'), data.get('dmfRiskFactors'), data.get('psaRiskFactors'), data.get('scores'));
  thickLine(doc, y);
  y += Y_INC_LARGE;

  // CHARGES SECTION
  [y, page] = charges(doc, y, page, name, selectedPretrialCase, selectedCharges, false);
  thickLine(doc, y);
  y += Y_INC_LARGE;

  // RISK FACTORS SECTION
  [y, page] = riskFactors(
    doc,
    y,
    page,
    name,
    data.get('riskFactors'),
    selectedCharges,
    allCharges,
    allSentences,
    mostSeriousCharge,
    selectedPretrialCase.getIn([CASE_ID, 0], ''),
    selectedPretrialCase.getIn([ARREST_DATE_TIME, 0],
      selectedPretrialCase.getIn([ARREST_DATE, 0],
        selectedPretrialCase.getIn([FILE_DATE, 0], ''))),
    allCases,
    allFTAs
  );
  thickLine(doc, y);
  y += Y_INC;

  // RECOMMENDATION SECTION
//  y = recommendations(doc, y, data.get('notes', data.get('recommendations', ''), ''));

  // CASE HISTORY SECCTION=
  [y, page] = caseHistory(doc, y, page, name, allCases, chargesByCaseNum);

  doc.save(getPdfName(name, createData.timestamp));
};

export default exportPDF;
