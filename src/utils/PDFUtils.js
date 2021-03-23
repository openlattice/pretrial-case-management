/*
 * @flow
 */
/* eslint max-len: 0 */ // --> OFF
import JSPDF from 'jspdf';
import Immutable, { Map, Set, List } from 'immutable';
import { DateTime } from 'luxon';

import { CONTEXT } from './consts/Consts';
import { CASE_CONTEXTS, SETTINGS } from './consts/AppSettingConsts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { getViolentChargeLabels } from './ArrestChargeUtils';
import { getEntityProperties } from './DataUtils';
import { chargeIsMostSerious, historicalChargeIsViolent, getSummaryStats } from './HistoricalChargeUtils';
import { getSentenceToIncarcerationCaseNums, getChargeIdToSentenceDate } from './SentenceUtils';
import { getRecentFTAs, getOldFTAs } from './FTAUtils';
import { sortPeopleByName } from './PeopleUtils';
import { getHeaderText } from './RCMUtils';
import { stepTwoIncrease, stepFourIncrease, rcmSecondaryReleaseDecrease } from './ScoringUtils';
import {
  formatValue,
  formatDate,
  formatDateTime,
  formatDateList
} from './FormattingUtils';
import {
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from './AutofillUtils';

const {
  AGE_AT_CURRENT_ARREST,
  ARREST_DATE,
  ARREST_DATE_TIME,
  CURRENT_VIOLENT_OFFENSE,
  CURRENT_VIOLENT_OFFENSE_AND_YOUNG,
  DOB,
  FILE_DATE,
  FIRST_NAME,
  GENDER,
  LAST_NAME,
  MIDDLE_NAME,
  MOST_SERIOUS_CHARGE_NO,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_CONVICTION,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION,
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

const MAX_Y = 270;
const MEDIUM_FONT_SIZE = 14;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MAX = 200;
const Y_INC = 5;
const Y_INC_SMALL = 4;
const Y_INC_LARGE = 7;
const SCORE_OFFSET = 5;
const BOX_MARGIN = X_MARGIN + 5;
const BOX_HEIGHT = 6;
const BOX_WIDTH = ((X_MAX / 2) - (2 * BOX_MARGIN)) / 10;

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

const thinLine = (doc :Object, y :number, xOffset? :number) :void => {
  doc.setLineWidth(0.1);
  doc.setDrawColor(152);
  const x = xOffset || X_COL_1;
  doc.line(x, y, X_MAX - X_MARGIN, y);
  doc.setFont('helvetica', 'normal');
};

const thickLine = (doc :Object, y :number, gray? :boolean) :void => {
  doc.setLineWidth(0.5);
  if (gray) {
    doc.setDrawColor(152);
  }
  doc.line(X_MARGIN, y, X_MAX - X_MARGIN, y);
  doc.setDrawColor(0);
  doc.setFont('helvetica', 'normal');
};

const newPage = (doc :Object, pageInit :number, name? :string) :number[] => {
  const page = pageInit + 1;
  doc.addPage();
  if (name) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(10, X_COL_1, `${name} - ${page}`);
  }
  doc.setFontSize(10);
  thickLine(doc, 15);
  return [25, page];
};

const tryIncrementPage = (doc :Object, yInit :number, pageInit :number, name :string) => {
  let y = yInit;
  let page = pageInit;
  if (y > MAX_Y) {
    [y, page] = newPage(doc, page, name);
  }
  return [y, page];
};

const getName = (selectedPerson :Map) :string => {
  let name = formatValue(selectedPerson.get(FIRST_NAME, ''));
  const middleName = selectedPerson.get(MIDDLE_NAME, '');
  if (middleName.length) name = name.concat(` ${formatValue(middleName)}`);
  name = name.concat(` ${formatValue(selectedPerson.get(LAST_NAME, ''))}`);
  return name;
};

const getListName = (selectedPerson :Map) :string => {
  const firstName = selectedPerson.get(FIRST_NAME, Immutable.List()).join('/');
  const lastName = selectedPerson.get(LAST_NAME, Immutable.List()).join('/');
  return `${lastName}, ${firstName}`;
};

const getChargeText = (charge :Map) :string => {
  const chargeDescList = formatValue(charge.get(CHARGE_DESCRIPTION, Immutable.List()));
  const chargeDegList = formatValue(charge.get(CHARGE_DEGREE, Immutable.List()));

  let text = '';
  if (chargeDescList.length) {
    text = text.concat(`${chargeDescList}`);
  }
  if (chargeDegList.length) {
    text = text.concat(` (${chargeDegList})`);
  }
  return text.trim();
};

const getPleaText = (charge :Map) :string => {
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

const getDispositionText = (charge :Map) :string => {
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

const header = (doc :Object, yInit :number) :number => {
  let y = yInit;
  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Pretrial Assessment Report');
  y += Y_INC;
  doc.setFont('helvetica', 'normal');
  thickLine(doc, y);
  y += Y_INC_LARGE;
  return y;
};

const person = (
  doc :Object,
  yInit :number,
  selectedPerson :Map,
  selectedPretrialCase :Map,
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
  doc.setFontSize(10);
  doc.text(X_MARGIN, y, name);
  y += Y_INC;
  thickLine(doc, y);
  y += Y_INC;

  /* person details section */

  detailHeaderText(doc, y, X_COL_1, 'DOB');
  detailHeaderText(doc, y, X_COL_2, 'GENDER');
  detailHeaderText(doc, y, X_COL_3, 'SEX');
  y += Y_INC;
  detailValueText(doc, y, X_COL_1, formatDateList(selectedPerson.get(DOB)));
  detailValueText(doc, y, X_COL_2, formatValue(selectedPerson.get(GENDER, 'NA')));
  detailValueText(doc, y, X_COL_3, formatValue(selectedPerson.get(SEX, 'NA')));
  y += Y_INC_LARGE;

  detailHeaderText(doc, y, X_COL_1, 'ARREST DATE');
  detailHeaderText(doc, y, X_COL_3, 'PSA - COMPLETION DATE');
  y += Y_INC;
  detailValueText(doc, y, X_COL_1, formatDateList(selectedPretrialCase.get(ARREST_DATE_TIME, Immutable.List())));
  detailValueText(doc, y, X_COL_3, formatDate(createData.timestamp));
  y += Y_INC_LARGE;

  let createdText = createData.user;
  let editedText = 'NA';
  if (createData.timestamp && DateTime.fromISO(createData.timestamp).isValid) {
    createdText = `${createdText} at ${formatDateTime(createData.timestamp)}`;
  }

  if (updateData) {
    editedText = updateData.user;
    if (updateData.timestamp && DateTime.fromISO(updateData.timestamp).isValid) {
      editedText = `${editedText} at ${formatDateTime(updateData.timestamp)}`;
    }
  }

  detailHeaderText(doc, y, X_COL_1, 'CREATED BY');
  detailHeaderText(doc, y, X_COL_3, 'EDITED BY');
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
    doc.setFont('helvetica', 'bold');
    doc.text(textX, textY, num.toString());
    doc.setFont('helvetica', 'regular');
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
};

const scale = (doc :Object, yInit :number, xOffset :number, value :number) :number => {
  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  let y = yInit;
  for (let i = 1; i <= 6; i += 1) {
    if (i <= value) {
      selectedBox(doc, yInit, xOffset, i, value);
    }
    else {
      unselectedBox(doc, yInit, xOffset, i, value);
    }
  }
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');
  y += Y_INC_LARGE + BOX_HEIGHT;
  return y;
};

const nvcaFlag = (doc :Object, yInit :number, value :string) :number => {
  let y = yInit;
  const flagIsTrue = value === 'Yes';
  const fontType = flagIsTrue ? 'bold' : 'normal';
  doc.setFont('helvetica', fontType);

  doc.setDrawColor(128);
  doc.setFillColor(255);
  doc.setTextColor(0);

  const width = 18;
  const height = 6;

  doc.roundedRect((X_COL_3 + 15), y, width, height, 1, 1, 'FD');
  const textXOffset = flagIsTrue ? 3 : 2;
  const textX = (X_COL_3 + 15) + ((width / 2) - textXOffset);
  const textY = y + ((height / 2) + 1);
  doc.text(textX, textY, value);
  y += height + Y_INC_LARGE;
  doc.setFont('helvetica', 'normal');
  return y;
};

const scoreHeader = (doc, y, xOffset, text) => {
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(xOffset, y, text);
  doc.setFont('helvetica', 'normal');
};

const scores = (doc :Object, yInit :number, scoreValues :Map) :number => {
  let y = yInit;
  scoreHeader(doc, y, (X_COL_1), 'Failure to Appear Scale');
  scoreHeader(doc, y, X_COL_2, 'New Criminal Activity Scale');
  scoreHeader(doc, y, (X_COL_3 + 15), 'New Violent Criminal Activity Flag');
  y += Y_INC_SMALL;
  scale(doc, y, X_COL_1, scoreValues.getIn([PROPERTY_TYPES.FTA_SCALE, 0]));
  scale(doc, y, (X_COL_2), scoreValues.getIn([PROPERTY_TYPES.NCA_SCALE, 0]));
  nvcaFlag(doc, y, getBooleanText(scoreValues.getIn([PROPERTY_TYPES.NVCA_FLAG, 0])));

  y += Y_INC_SMALL;

  return y;
};

const rcm = (
  doc :Object,
  yInit :number,
  rcmValues :Map,
  rcmRiskFactors :Map,
  rcmConditions :List,
  psaRiskFactors :Map,
  psaScores :Map,
  settings :Map
) :number => {
  const includesStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
  const includesSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
  const { [PROPERTY_TYPES.CONTEXT]: psaContext } = getEntityProperties(rcmRiskFactors, [PROPERTY_TYPES.CONTEXT]);
  let y = yInit;
  doc.setFont('helvetica', 'normal');
  if (rcmValues.size) {
    y += Y_INC_LARGE + 2;
    scoreHeader(doc, y, X_COL_1, `Presumptive Pretrial Release Level (${psaContext.trim().split(' ')[0]} PSA)`);
    y += Y_INC_LARGE;

    if (psaContext === CONTEXT.COURT) {
      detailValueText(doc, y, X_COL_1, getHeaderText(rcmValues.toJS()));
      y += Y_INC;
    }

    let modificationText;
    if (includesStepIncreases && stepTwoIncrease(rcmRiskFactors, psaRiskFactors, psaScores)) {
      modificationText = 'Max Level Increase.';
    }
    else if (includesStepIncreases && stepFourIncrease(rcmRiskFactors, psaRiskFactors, psaScores)) {
      modificationText = 'Single Level Increase.';
    }
    else if (
      psaContext === CONTEXT.BOOKING
      && rcmSecondaryReleaseDecrease(rcmRiskFactors, psaScores, settings)
      && includesSecondaryBookingCharges
    ) {
      modificationText = 'Exception release.';
    }

    if (modificationText) {
      doc.setFont('helvetica', 'italic');
      doc.text(X_COL_1 + 5, y, modificationText);
      doc.setFont('helvetica', 'normal');
      y += Y_INC;
    }

    const conditionsText = rcmConditions.join(' - ');
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
      doc.setFont('helvetica', 'regular');
      doc.setTextColor(0);
      y += height + Y_INC;
    }
  }
  return y;
};

const getCaseNumFromCharge = (charge :Map) => {
  const chargeIdStr = charge.getIn([CHARGE_ID, 0], '');
  if (chargeIdStr.length) {
    const chargeIdElements = chargeIdStr.split('|');
    if (chargeIdElements && chargeIdElements.length) {
      return chargeIdElements[0];
    }
  }
  return '';
};

const chargeTags = (
  doc :Object,
  yInit :number,
  charge :List,
  cases :Map,
  violentCourtChargeList :Map,
) => {
  let y = yInit;
  const tags = [];
  if (historicalChargeIsViolent({ charge, violentChargeList: violentCourtChargeList })) {
    tags.push('VIOLENT');
  }
  const caseNum = getCaseNumFromCharge(charge);
  if (caseNum.length) {
    const pretrialCase = cases.get(caseNum);
    if (pretrialCase && chargeIsMostSerious(charge, pretrialCase)) {
      tags.push('MOST SERIOUS');
    }
  }

  if (tags.length) {
    const tagText = tags.join(' - ');
    doc.setFont('helvetica', 'bold');
    doc.text(X_COL_1 + SCORE_OFFSET, y, tagText);
    doc.setFont('helvetica', 'normal');
    y += Y_INC;
  }
  return y;
};

const getCasesByCaseNum = (allCases) => {
  let map = Immutable.Map();
  allCases.forEach((pretrialCase) => {
    map = map.set(pretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], ''), pretrialCase);
  });
  return map;
};

const charges = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  allCases :List,
  selectedCharges :List,
  violentCourtChargeList :Map,
  showDetails :boolean,
  chargeHeader :string
) :number[] => {
  let y :number = yInit;
  let page :number = pageInit;
  const xIndent = showDetails ? X_COL_1 + SCORE_OFFSET : X_COL_1;
  const xWidth = X_MAX - X_MARGIN - xIndent;
  const casesByCaseNum = getCasesByCaseNum(allCases);
  thickLine(doc, y);
  y += Y_INC_LARGE;
  if (!showDetails) {
    scoreHeader(doc, y, X_COL_1, chargeHeader);
    y += Y_INC_LARGE;
  }
  doc.setFontSize(9);
  selectedCharges.forEach((charge, index) => {
    if (y > MAX_Y) {
      [y, page] = newPage(doc, page, name);
    }

    const qualifierText = formatValue(charge.get(QUALIFIER, Immutable.List()));
    const CHARGE_OFFSET = 25;
    y = chargeTags(doc, y, charge, casesByCaseNum, violentCourtChargeList);

    doc.text(xIndent, y, formatValue(charge.get(CHARGE_STATUTE, Immutable.List())));
    let chargeLines = '';
    if (qualifierText) {
      chargeLines = doc.splitTextToSize(`${qualifierText} - ${getChargeText(charge)}`, xWidth);
    }
    else {
      chargeLines = doc.splitTextToSize(getChargeText(charge), xWidth);
    }
    doc.text(xIndent + CHARGE_OFFSET, y, chargeLines);
    y += chargeLines.length * Y_INC;
    if (showDetails) {
      const pleaLines = doc.splitTextToSize(getPleaText(charge), xWidth - SCORE_OFFSET);
      doc.text(xIndent + SCORE_OFFSET, y, pleaLines);
      y += pleaLines.length * Y_INC;
      const dispositionLines = doc.splitTextToSize(getDispositionText(charge), xWidth - SCORE_OFFSET);
      doc.text(xIndent + SCORE_OFFSET, y, dispositionLines);
      y += dispositionLines.length * Y_INC_SMALL;
      if (index !== selectedCharges.size - 1) { /* Skip bottom divider line on last charge */
        thinLine(doc, y, xIndent);
        y += Y_INC;
      }
    }
  });

  doc.setFontSize(FONT_SIZE);
  return [y, page];
};

const courtCharges = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  allCases :List,
  selectedCharges :List,
  violentCourtChargeList :Map,
  showDetails :boolean,
  chargeHeader :string
) :number[] => {
  let y :number = yInit;
  let page :number = pageInit;
  const xIndent = showDetails ? X_COL_1 + SCORE_OFFSET : X_COL_1;
  const xWidth = X_MAX - X_MARGIN - xIndent;
  let caseNums = Set();
  selectedCharges.forEach((charge) => {
    caseNums = caseNums.add(charge.getIn([PROPERTY_TYPES.CHARGE_ID, 0], '').split('|')[0]);
  });

  if (!showDetails) {
    scoreHeader(doc, y, X_COL_1, `${chargeHeader} - ${caseNums.toJS()}`);
    y += Y_INC_LARGE;
  }
  doc.setFontSize(9);
  selectedCharges.forEach((charge, index) => {
    if (y > MAX_Y) {
      [y, page] = newPage(doc, page, name);
    }

    const qualifierText = formatValue(charge.get(QUALIFIER, Immutable.List()));
    const CHARGE_OFFSET = 25;
    // y = chargeTags(doc, y, charge, casesByCaseNum, violentCourtChargeList);

    doc.text(xIndent, y, formatValue(charge.get(CHARGE_STATUTE, Immutable.List())));
    let chargeLines = '';
    if (qualifierText) {
      chargeLines = doc.splitTextToSize(`${qualifierText} - ${getChargeText(charge)}`, xWidth);
    }
    else {
      chargeLines = doc.splitTextToSize(getChargeText(charge), xWidth);
    }
    doc.text(xIndent + CHARGE_OFFSET, y, chargeLines);
    y += chargeLines.length * Y_INC;
    if (showDetails) {
      const pleaLines = doc.splitTextToSize(getPleaText(charge), xWidth - SCORE_OFFSET);
      doc.text(xIndent + SCORE_OFFSET, y, pleaLines);
      y += pleaLines.length * Y_INC;
      const dispositionLines = doc.splitTextToSize(getDispositionText(charge), xWidth - SCORE_OFFSET);
      doc.text(xIndent + SCORE_OFFSET, y, dispositionLines);
      y += dispositionLines.length * Y_INC_SMALL;
      if (index !== selectedCharges.size - 1) { /* Skip bottom divider line on last charge */
        thinLine(doc, y, xIndent);
        y += Y_INC;
      }
    }
  });
  doc.setFontSize(FONT_SIZE);
  return [y, page];
};

const riskFactors = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  riskFactorVals :Map,
  currCharges :List,
  allCharges :List,
  allSentences :List,
  mostSeriousCharge :string,
  currCaseNum :string,
  dateArrested :string,
  allCases :List,
  allFTAs :List,
  withReferences :boolean,
  violentArrestChargeList :Map,
  violentCourtChargeList :Map,
  chargeIdsToSentenceDates :Map
) :number[] => {
  let [y, page] = withReferences ? newPage(doc, pageInit, name) : tryIncrementPage(doc, yInit, pageInit, name);

  const ageAtCurrentArrest = riskFactorVals.get(AGE_AT_CURRENT_ARREST, '');
  const currentViolentOffense = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE, '');
  const currentViolentOffenseAndYoung = riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_AND_YOUNG, '');
  const pendingCharge = riskFactorVals.get(PENDING_CHARGE, '');
  const priorMisdemeanor = riskFactorVals.get(PRIOR_MISDEMEANOR, '');
  const priorFelony = riskFactorVals.get(PRIOR_FELONY, '');
  const priorConviction = riskFactorVals.get(PRIOR_CONVICTION, '');
  const priorViolentConviction = riskFactorVals.get(PRIOR_VIOLENT_CONVICTION, '');
  const priorFailureToAppearRecent = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_RECENT, '');
  const priorFailureToAppearOld = riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_OLD, '');
  const priorSentenceToIncarceration = riskFactorVals.get(PRIOR_SENTENCE_TO_INCARCERATION, '');

  const xCol2 = X_COL_1 + 5;

  const headerText = withReferences ? 'PSA Factors - Case history references' : 'PSA Factors';
  scoreHeader(doc, y, X_COL_1, headerText);
  detailHeaderText(doc, y, X_COL_3, 'RESPONSE');
  y += Y_INC;
  thinLine(doc, y);
  y += Y_INC;
  doc.setTextColor(0);

  const renderLine = (col1Val, col2Val, col3Val, references? :List, noFormatting? :boolean) => {
    doc.text(X_COL_1, y, col1Val);
    doc.text(xCol2, y, col2Val);
    doc.text(X_COL_3, y, col3Val);

    if (withReferences) {

      /* Render case history references if any exist. */
      if (references && references.size) {
        y += Y_INC_SMALL;
        thinLine(doc, y, xCol2);
        y += Y_INC;
        doc.setFont('helvetica', 'italic');
        doc.text(xCol2, y, 'Case history references:');
        y += Y_INC;

        const indent1 = xCol2 + 5;
        const indent2 = indent1 + 5;
        if (noFormatting) {
          const lines = doc.splitTextToSize(references.join(', '), X_MAX - (X_MARGIN + indent1));
          if (y + (lines.length * Y_INC) > 300) {
            const maxLine = Math.floor((MAX_Y - y) / Y_INC);
            const group1 = lines.slice(0, maxLine);
            const group2 = lines.slice(maxLine);

            doc.text(indent1, y, group1);
            [y, page] = newPage(doc, page, name);
            doc.setFont('helvetica', 'italic');
            doc.text(indent1, y, group2);
            y += (group2.length * Y_INC);
          }
          else {
            doc.text(indent1, y, lines);
            y += (lines.length * Y_INC);
          }
          [y, page] = tryIncrementPage(doc, y, page, name);
          doc.setFont('helvetica', 'italic');
        }
        else {
          references.forEach((charge) => {
            const {
              caseNum,
              statute,
              description,
              dispositionDate
            } = charge;
            const chargeText = `${statute} ${description}`;

            if (caseNum) {
              const caseText = caseNum + (dispositionDate ? ` (${dispositionDate})` : '');
              const caseLines = doc.splitTextToSize(caseText, X_MAX - (X_MARGIN + indent1));
              doc.text(indent1, y, caseText);
              y += (caseLines.length + Y_INC);

              const chargeLines = doc.splitTextToSize(chargeText, X_MAX - (X_MARGIN + indent2));
              doc.text(indent2, y, chargeLines);
              y += (chargeLines.length + Y_INC);
            }
            else {
              const chargeLines = doc.splitTextToSize(chargeText, X_MAX - (X_MARGIN + indent1));
              doc.text(indent1, y, chargeLines);
              y += (chargeLines.length + Y_INC);
            }

            [y, page] = tryIncrementPage(doc, y, page, name);
            doc.setFont('helvetica', 'italic');
          });
        }
      }
      else {
        y += Y_INC_SMALL;
      }

      thinLine(doc, y);
      doc.setFont('helvetica', 'normal');
    }
    [y, page] = tryIncrementPage(doc, y, page, name);
    y += Y_INC;
  };

  renderLine('1', 'Age at Current Arrest', ageAtCurrentArrest);
  // y = riskFactorNotes(y, doc, riskFactorVals.get(AGE_AT_CURRENT_ARREST_NOTES));

  renderLine(
    '2',
    'Current Violent Offense',
    getBooleanText(currentViolentOffense),
    getViolentChargeLabels({ currCharges, violentChargeList: violentArrestChargeList }),
    true
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(CURRENT_VIOLENT_OFFENSE_NOTES));

  renderLine('2a', 'Current Violent Offense & 20 Years Old or Younger', getBooleanText(currentViolentOffenseAndYoung));

  renderLine(
    '3',
    'Pending Charge at the Time of the Arrest',
    getBooleanText(pendingCharge),
    getPendingCharges(currCaseNum, dateArrested, allCases, allCharges, allSentences)
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PENDING_CHARGE_NOTES));

  renderLine(
    '4',
    'Prior Misdemeanor Conviction',
    getBooleanText(priorMisdemeanor),
    getPreviousMisdemeanors(dateArrested, allCharges, chargeIdsToSentenceDates)
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_MISDEMEANOR_NOTES));

  renderLine('5', 'Prior Felony Conviction', getBooleanText(priorFelony), getPreviousFelonies(dateArrested, allCharges, chargeIdsToSentenceDates));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FELONY_NOTES));

  renderLine('5a', 'Prior Conviction', getBooleanText(priorConviction));

  renderLine('6', 'Prior Violent Conviction', priorViolentConviction, getPreviousViolentCharges(dateArrested, allCharges, violentCourtChargeList, chargeIdsToSentenceDates));
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_VIOLENT_CONVICTION_NOTES));

  renderLine(
    '7',
    'Prior Pretrial Failure to Appear in the Last 2 Years',
    priorFailureToAppearRecent,
    getRecentFTAs(allFTAs, allCharges, chargeIdsToSentenceDates),
    true
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_RECENT_NOTES));

  renderLine(
    '8',
    'Prior Pretrial Failure to Appear Older than 2 Years',
    getBooleanText(priorFailureToAppearOld),
    getOldFTAs(allFTAs, allCharges, chargeIdsToSentenceDates),
    true
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_FAILURE_TO_APPEAR_OLD_NOTES));

  renderLine(
    '9',
    'Prior Sentences to Incarceration',
    getBooleanText(priorSentenceToIncarceration),
    getSentenceToIncarcerationCaseNums(allSentences),
    true
  );
  // y = riskFactorNotes(y, doc, riskFactorVals.get(PRIOR_SENTENCE_TO_INCARCERATION_NOTES));

  return [y, page];
};

const recommendations = (doc :Object, yInit :number, releaseRecommendation :string) :number => {
  let y = yInit;
  scoreHeader(doc, y, X_COL_1, 'Notes');
  y += Y_INC;
  const recommendationLines = doc.splitTextToSize(releaseRecommendation, X_MAX - (2 * X_COL_1));
  doc.text(X_COL_1, y, recommendationLines);
  y += (recommendationLines.length * Y_INC);
  return y;
};

const caseHistoryHeader = (doc :Object, yInit :number) :number => {
  let y = yInit - Y_INC_SMALL;
  doc.setFontSize(12);
  doc.text(X_MARGIN, y, 'CASE HISTORY');
  y += Y_INC_SMALL;
  doc.setFontSize(FONT_SIZE);
  thickLine(doc, y);
  y += Y_INC;
  return y;
};

const getChargesByCaseNum = (allCharges :List) :Map => {
  let chargesByCaseNum = Immutable.Map();
  allCharges.forEach((charge) => {
    const caseNum = getCaseNumFromCharge(charge);
    chargesByCaseNum = chargesByCaseNum.set(caseNum, chargesByCaseNum.get(caseNum, Immutable.List()).push(charge));
  });
  return chargesByCaseNum;
};

const summaryStats = (doc :Object, yInit :number, allCharges :Map, chargeIdsToSentenceDates :Map) => {
  let y = yInit;
  const {
    numMisdemeanorCharges,
    numMisdemeanorConvictions,
    numFelonyCharges,
    numFelonyConvictions,
    numViolentCharges,
    numViolentConvictions
  } = getSummaryStats(allCharges, chargeIdsToSentenceDates);

  scoreHeader(doc, y, X_COL_1, 'Summary Statistics');
  y += Y_INC;
  const width = X_MAX - (2 * X_COL_1);
  const colWidth = width / 3;
  const qCol1 = X_COL_1;
  const qCol2 = X_COL_1 + colWidth;
  const qCol3 = X_COL_1 + (colWidth * 2);

  const answerOffset = 10;
  const aCol1 = qCol2 - answerOffset;
  const aCol2 = qCol3 - answerOffset;
  const aCol3 = X_MAX - X_COL_1 - answerOffset;

  doc.setFont('helvetica', 'normal');
  doc.text(qCol1, y, '# of misdemeanor charges');
  doc.text(qCol2, y, '# of felony charges');
  doc.text(qCol3, y, '# of violent charges');

  doc.setFont('helvetica', 'bold');
  doc.text(aCol1, y, `${numMisdemeanorCharges}`);
  doc.text(aCol2, y, `${numFelonyCharges}`);
  doc.text(aCol3, y, `${numViolentCharges}`);

  y += Y_INC;

  doc.setFont('helvetica', 'normal');
  doc.text(qCol1, y, '# of misdemeanor convictions');
  doc.text(qCol2, y, '# of felony convictions');
  doc.text(qCol3, y, '# of violent convictions');

  doc.setFont('helvetica', 'bold');
  doc.text(aCol1, y, `${numMisdemeanorConvictions}`);
  doc.text(aCol2, y, `${numFelonyConvictions}`);
  doc.text(aCol3, y, `${numViolentConvictions}`);

  y += Y_INC;

  return y;
};

const caseHistory = (
  doc :Object,
  yInit :number,
  pageInit :number,
  name :string,
  allCases :List,
  chargesByCaseNum :Map,
  violentCourtChargeList :Map,
  title :string,
  allCharges :List,
  chargeIdsToSentenceDates :Map,
) :number[] => {
  let [y, page] = newPage(doc, pageInit, name);
  y = caseHistoryHeader(doc, y);

  y = summaryStats(doc, y, allCharges, chargeIdsToSentenceDates);
  thickLine(doc, y, true);
  y += (Y_INC * 2);
  scoreHeader(doc, y, X_COL_1, title);

  allCases.forEach((c) => {
    y += Y_INC;
    if (y > MAX_Y) {
      [y, page] = newPage(doc, page, name);
    }
    thickLine(doc, y, true);
    y += Y_INC;
    const caseNumArr = c.get(CASE_ID, Immutable.List());
    const caseNum = (caseNumArr.size) ? formatValue(caseNumArr) : '';
    doc.text(X_MARGIN, y, `Case Number: ${caseNum}`);
    doc.text(X_COL_3, y, `File Date: ${formatDateList(c.get(FILE_DATE, Immutable.List()))}`);
    y += Y_INC_SMALL;
    thickLine(doc, y, true);
    y += Y_INC;
    const chargesForCase = chargesByCaseNum.get(caseNum, Immutable.List());
    if (chargesForCase.size) {
      [y, page] = charges(doc, y, page, name, allCases, chargesForCase, violentCourtChargeList, true);
    }
  });
  return [y, page];
};

const getPDFContents = (
  doc :Object,
  data :Map,
  selectedCourtCharges :Map,
  selectedPretrialCase :Map,
  selectedCharges :Map,
  selectedPerson :Map,
  allCases :List,
  allCharges :List,
  allSentences :List,
  allFTAs :List,
  violentArrestChargeList :Map,
  violentCourtChargeList :Map,
  createData :{
    user :string,
    timestamp :string
  },
  updateData :{
    user :string,
    timestamp :string
  },
  compact :boolean,
  settings :Map
) :string => {
  doc.setFont('helvetica', 'normal');
  let y = 15;
  let page = 1;
  const name = getName(selectedPerson);
  const chargeIdsToSentenceDates = getChargeIdToSentenceDate(allSentences);
  const chargesByCaseNum = getChargesByCaseNum(allCharges);
  const mostSeriousCharge = selectedPretrialCase.getIn([MOST_SERIOUS_CHARGE_NO, 0], '');
  const psaContext = data.getIn(['psaRiskFactors', PROPERTY_TYPES.CONTEXT, 0], '');
  const caseContext = data.getIn(['rcnRiskFactors', PROPERTY_TYPES.TYPE, 0], CASE_CONTEXTS.ARREST);
  let caseNum = caseContext === CASE_CONTEXTS.COURT
    ? selectedPretrialCase.getIn([PROPERTY_TYPES.CASE_NUMBER, 0], '')
    : '';
  caseNum = caseNum.length ? ` - ${caseNum}` : '';

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson, selectedPretrialCase, name, createData, updateData);
  thinLine(doc, y);
  y += Y_INC_LARGE;

  // SCORES SECTION
  y = scores(doc, y, data.get('scores'));
  y += Y_INC;
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
    allFTAs,
    false,
    violentArrestChargeList,
    violentCourtChargeList,
    chargeIdsToSentenceDates
  );
  thickLine(doc, y);
  y += Y_INC;

  // RCM SECTION
  y = rcm(
    doc,
    y,
    data.get('rcm'),
    data.get('rcmRiskFactors'),
    data.get('rcmConditions'),
    data.get('psaRiskFactors'),
    data.get('scores'),
    settings
  );
  y += Y_INC_LARGE;

  // ARREST OR COURT CHARGES SECTION
  const chargeType = psaContext.slice(0, 1).toUpperCase() + psaContext.slice(1);
  [y, page] = charges(doc, y, page, name, allCases, selectedCharges, violentCourtChargeList, false, `${chargeType} Charges${caseNum}`);
  thinLine(doc, y);
  y += Y_INC_LARGE;
  if (selectedCourtCharges.size) {
    // COURT CHARGES SECTION
    [y, page] = courtCharges(
      doc,
      y,
      page,
      name,
      allCases,
      selectedCourtCharges,
      violentCourtChargeList,
      false,
      'Court Charges'
    );
    thickLine(doc, y);
    y += Y_INC_LARGE;
  }

  // RECOMMENDATION SECTION
  y = recommendations(doc, y, data.get('notes', data.get('recommendations', ''), ''));

  if (!compact) {

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
      allFTAs,
      true,
      violentArrestChargeList,
      violentCourtChargeList,
      chargeIdsToSentenceDates
    );
    thickLine(doc, y, true);
    y += Y_INC;

    // CASE HISTORY SECCTION=
    [y, page] = caseHistory(
      doc,
      y,
      page,
      name,
      allCases,
      chargesByCaseNum,
      violentCourtChargeList,
      'Case History',
      allCharges,
      chargeIdsToSentenceDates
    );
  }

  return getPdfName(name, createData.timestamp);
};

const exportPDF = (
  data :Map,
  selectedPretrialCase :Map,
  selectedCourtCharges :Map,
  selectedCharges :Map,
  selectedPerson :Map,
  allCases :List,
  allCharges :List,
  allSentences :List,
  allFTAs :List,
  violentArrestChargeList :Map,
  violentCourtChargeList :Map,
  createData :{
    user :string,
    timestamp :string
  },
  updateData :{
    user :string,
    timestamp :string
  },
  compact :boolean,
  settings :Map
) :void => {
  const doc = new JSPDF();
  const fileName = getPDFContents(
    doc,
    data,
    selectedCourtCharges,
    selectedPretrialCase,
    selectedCharges,
    selectedPerson,
    allCases,
    allCharges,
    allSentences,
    allFTAs,
    violentArrestChargeList,
    violentCourtChargeList,
    createData,
    updateData,
    compact,
    settings
  );

  doc.save(fileName);
};

const coverPage = (doc :Object, selectedPeople :Map[]) => {
  let y = 15;
  let page = 1;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(X_COL_1, y, 'People Included');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += Y_INC_SMALL;
  thickLine(doc, y);
  y += Y_INC;

  selectedPeople.forEach((selectedPerson) => {
    [y, page] = tryIncrementPage(doc, y, page, '');
    doc.text(X_COL_1, y, getListName(selectedPerson));
    y += Y_INC;
  });
};

export const exportPDFList = (
  fileName :string,
  pages :{
    data :Map,
    selectedCourtCharges :Map,
    selectedPretrialCase :Map,
    selectedCharges :Map,
    selectedPerson :Map,
    createData :{
      user :string,
      timestamp :string
    },
    updateData :{
      user :string,
      timestamp :string
    },
    compact :boolean
  }[],
  settings :Map
) :void => {
  const doc = new JSPDF();
  const sortedPages = pages;
  sortedPages.sort((page1, page2) => sortPeopleByName(page1.selectedPerson, page2.selectedPerson));

  coverPage(doc, sortedPages.map((page) => page.selectedPerson));

  sortedPages.forEach((page) => {
    const {
      data,
      selectedCourtCharges,
      selectedPretrialCase,
      selectedCharges,
      selectedPerson,
      createData,
      updateData
    } = page;

    doc.addPage();
    getPDFContents(
      doc,
      data,
      selectedCourtCharges,
      selectedPretrialCase,
      selectedCharges,
      selectedPerson,
      Immutable.List(),
      Immutable.List(),
      Immutable.List(),
      Immutable.List(),
      Immutable.List(),
      Immutable.List(),
      createData,
      updateData,
      true,
      settings
    );
  });
  doc.save(fileName);
};

export default exportPDF;
