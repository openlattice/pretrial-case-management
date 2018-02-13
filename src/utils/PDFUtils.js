import JSPDF from 'jspdf';
import moment from 'moment';

import { formatValue, formatDate, formatDateList } from './Utils';
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

const newPage = (doc) => {
  doc.addPage();
  return 20;
};

const getName = (selectedPerson) => {
  let name = formatValue(selectedPerson[FIRST_NAME]);
  const middleName = selectedPerson[MIDDLE_NAME];
  if (middleName && middleName.length) name = name.concat(` ${formatValue(middleName)}`);
  name = name.concat(` ${formatValue(selectedPerson[LAST_NAME])}`);
  return name;
};

const getMostSevChargeText = (pretrialInfo) => {
  if (!pretrialInfo[MOST_SERIOUS_CHARGE_NO] || !pretrialInfo[MOST_SERIOUS_CHARGE_NO].length) return '';
  let text = formatValue(pretrialInfo[MOST_SERIOUS_CHARGE_NO]);
  if (pretrialInfo[MOST_SERIOUS_CHARGE_DESC] && pretrialInfo[MOST_SERIOUS_CHARGE_DESC].length) {
    text = text.concat(` ${formatValue(pretrialInfo[MOST_SERIOUS_CHARGE_DESC])}`);
  }
  if (pretrialInfo[MOST_SERIOUS_CHARGE_DEG] && pretrialInfo[MOST_SERIOUS_CHARGE_DEG].length) {
    text = text.concat(` (${formatValue(pretrialInfo[MOST_SERIOUS_CHARGE_DEG])})`);
  }
  return text;
};

const getChargeText = (charge) => {
  if (!charge[CHARGE_NUM_FQN] || !charge[CHARGE_NUM_FQN].length) return '';

  let text = formatValue(charge[CHARGE_NUM_FQN]);
  if (charge[CHARGE_DESCRIPTION_FQN] && charge[CHARGE_DESCRIPTION_FQN].length) {
    text = text.concat(` ${formatValue(charge[CHARGE_DESCRIPTION_FQN])}`);
  }
  if (charge[CHARGE_DEGREE_FQN] && charge[CHARGE_DEGREE_FQN].length) {
    text = text.concat(` (${formatValue(charge[CHARGE_DEGREE_FQN])})`);
  }
  return text;
};

const getPleaText = (charge) => {
  let text = formatDateList(charge[PLEA_DATE]);

  if (charge[PLEA] && charge[PLEA].length) {
    if (text.length) {
      text = `${text} -`;
    }
    text = `${text} ${formatValue(charge[PLEA])}`;
  }

  if (text.length) {
    text = `Plea: ${text}`;
  }

  return text;
};

const getDispositionText = (charge) => {
  let text = formatDateList(charge[DISPOSITION_DATE]);

  if (charge[DISPOSITION] && charge[DISPOSITION].length) {
    if (text.length) {
      text = `${text} -`;
    }
    text = `${text} ${formatValue(charge[DISPOSITION])}`;
  }

  if (text.length) {
    text = `Disposition: ${text}`;
  }

  return text;
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
  doc.text(X_MAX / 2, y, `PID: ${formatValue(selectedPerson[PERSON_ID])}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `DOB: ${formatDateList(selectedPerson[DOB])}`);
  doc.text(X_MAX / 2, y, `Race: ${formatValue(selectedPerson[RACE])}`);
  doc.text(X_MAX - 50, y, `Gender: ${formatValue(selectedPerson[SEX])}`);
  y += Y_INC;
  doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(selectedPretrialCase[ARREST_DATE_FQN])}`);
  doc.text(X_MAX / 2, y, `PSA - Court Completion Date: ${formatDate(new Date().toISOString())}`);
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
  doc.text(X_MARGIN + SCORE_OFFSET + SCORE_OFFSET, y, getBooleanText(scoreValues.nvcaFlag));
  y += Y_INC;
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'New Criminal Activity Scale');
  y += Y_INC;
  y = scale(doc, y, scoreValues.ncaScale);
  // TODO: draw the boxes
  y += Y_INC;
  doc.text(X_MARGIN + SCORE_OFFSET, y, 'Failure to Appear Flag');
  y += Y_INC;
  y = scale(doc, y, scoreValues.ftaScale);
  y += Y_INC;
  return y;
};

const charges = (doc, yInit, selectedPretrialCase, selectedCharges, showDetails) => {
  let y = yInit;
  doc.text(X_MARGIN, y, 'Charge(s):');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  if (!selectedCharges || !selectedCharges.length) {
    const chargeLines = doc.splitTextToSize(getMostSevChargeText(selectedPretrialCase), X_MAX - (2 * X_MARGIN));
    doc.text(X_MARGIN + SCORE_OFFSET, y, chargeLines);
    y += chargeLines.length * Y_INC_SMALL;
    thinLine(doc, y);
    y += Y_INC;
  }
  else {
    selectedCharges.forEach((charge) => {
      if (y > 260) {
        y = newPage(doc);
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
  return y;
};

const riskFactors = (doc, yInit, riskFactorVals) => {
  let y = yInit;
  doc.text(X_MARGIN, y, 'Risk Factors:');
  doc.text(RESPONSE_OFFSET, y, 'Responses:');
  y += Y_INC_SMALL;
  thinLine(doc, y);
  y += Y_INC;
  doc.text(X_MARGIN, y, '1. Age at Current Arrest');
  doc.text(RESPONSE_OFFSET, y, riskFactorVals[AGE_AT_CURRENT_ARREST_FQN]);
  y += Y_INC;
  doc.text(X_MARGIN, y, '2. Current Violent Offense');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[CURRENT_VIOLENT_OFFENSE_FQN]));
  y += Y_INC;
  doc.text(GENERATED_RISK_FACTOR_OFFSET, y, 'a. Current Violent Offense & 20 Years Old or Younger');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[CURRENT_VIOLENT_OFFENSE_AND_YOUNG_FQN]));
  y += Y_INC;
  doc.text(X_MARGIN, y, '3. Pending Charge at the Time of the Offense');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PENDING_CHARGE_FQN]));
  y += Y_INC;
  doc.text(X_MARGIN, y, '4. Prior Misdemeanor Conviction');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PRIOR_MISDEMEANOR_FQN]));
  y += Y_INC;
  doc.text(X_MARGIN, y, '5. Prior Felony Conviction');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PRIOR_FELONY_FQN]));
  y += Y_INC;
  doc.text(GENERATED_RISK_FACTOR_OFFSET, y, 'a. Prior Conviction');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PRIOR_CONVICTION_FQN]));
  y += Y_INC;
  doc.text(X_MARGIN, y, '6. Prior Violent Conviction');
  doc.text(RESPONSE_OFFSET, y, riskFactorVals[PRIOR_VIOLENT_CONVICTION_FQN]);
  y += Y_INC;
  doc.text(X_MARGIN, y, '7. Prior Pre-Trial Failure to Appear in the Last 2 Years');
  doc.text(RESPONSE_OFFSET, y, riskFactorVals[PRIOR_FAILURE_TO_APPEAR_RECENT_FQN]);
  y += Y_INC;
  doc.text(X_MARGIN, y, '8. Prior Pre-Trial Failure to Appear Older than 2 Years');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PRIOR_FAILURE_TO_APPEAR_OLD_FQN]));
  y += Y_INC;
  doc.text(X_MARGIN, y, '9. Prior Sentence to Incarceration');
  doc.text(RESPONSE_OFFSET, y, getBooleanText(riskFactorVals[PRIOR_SENTENCE_TO_INCARCERATION_FQN]));
  y += Y_INC;
  return y;
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
  const chargesByCaseNum = {};
  allCharges.forEach((charge) => {
    const chargeIds = charge[CHARGE_ID_FQN];
    if (chargeIds && chargeIds.length) {
      const chargeIdElements = chargeIds[0].split('|');
      if (chargeIdElements && chargeIdElements.length) {
        const caseNum = chargeIdElements[0];
        if (chargesByCaseNum[caseNum]) {
          chargesByCaseNum[caseNum].push(charge);
        }
        else {
          chargesByCaseNum[caseNum] = [charge];
        }
      }
    }
  });
  return chargesByCaseNum;
}

const caseHistory = (doc, yInit, allCases, chargesByCaseNum) => {
  let y = newPage(doc);
  y = caseHistoryHeader(doc, y);

  allCases.forEach((c) => {
    y += Y_INC;
    if (y > 260) {
      y = newPage(doc);
    }
    thickLine(doc, y);
    y += Y_INC;
    const caseNum = (c[CASE_ID_FQN] && c[CASE_ID_FQN].length) ? formatValue(c[CASE_ID_FQN]) : '';
    doc.text(X_MARGIN, y, `Case Number: ${caseNum}`);
    y += Y_INC;
    doc.text(X_MARGIN, y, `Arrest Date: ${formatDateList(c[ARREST_DATE_FQN])}`);
    y += Y_INC;
    const chargesForCase = chargesByCaseNum[caseNum];
    if (chargesForCase && chargesForCase.length) {
      y = charges(doc, y, null, chargesForCase, true);
    }
    thickLine(doc, y);
    y += Y_INC;
  });
  return y;
};

const exportPDF = (data, selectedPretrialCase, selectedPerson, selectedCharges, allCases, allCharges) => {
  const doc = new JSPDF();
  let y = 20;

  const name = getName(selectedPerson);
  const chargesByCaseNum = getChargesByCaseNum(allCharges);
  const caseNum = (selectedPretrialCase[CASE_ID_FQN] && selectedPretrialCase[CASE_ID_FQN].length)
    ? formatValue(selectedPretrialCase[CASE_ID_FQN]) : '';
  const currCharges = chargesByCaseNum[caseNum];

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson, selectedPretrialCase, name);
  thickLine(doc, y);
  y += Y_INC;

  // SCORES SECTION
  y = scores(doc, y, data.scores);
  thickLine(doc, y);
  y += Y_INC;

  // CHARGES SECTION
  y = charges(doc, y, selectedPretrialCase, currCharges, false);
  thickLine(doc, y);
  y += Y_INC;

  // RISK FACTORS SECTION
  y = riskFactors(doc, y, data.riskFactors);
  thickLine(doc, y);
  y += Y_INC;

  // RECOMMENDATION SECTION
  y = recommendations(doc, y, data.releaseRecommendation);

  // CASE HISTORY SECCTION=
  y = caseHistory(doc, y, allCases, chargesByCaseNum);

  doc.save(getPdfName(name));
};

export default exportPDF;
