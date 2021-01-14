import JSPDF from 'jspdf';
import Immutable, { Set } from 'immutable';

import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { sortPeopleByName } from './PeopleUtils';
import { getEntityProperties } from './DataUtils';
import { getHearingString } from './HearingUtils';
import {
  formatValue,
  formatDateTime
} from './FormattingUtils';

const {
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
} = PROPERTY_TYPES;

const MAX_Y = 270;
const MEDIUM_FONT_SIZE = 14;
const FONT_SIZE = 10;
const X_MARGIN = 10;
const X_MAX = 200;
const Y_INC = 5;
const Y_INC_SMALL = 4;
const Y_INC_LARGE = 7;

const X_COL_1 = X_MARGIN;
const X_COL_2 = (X_MAX / 2) - 45;
const X_COL_3 = (X_MAX / 2);

const getListName = (selectedPerson :Immutable.Map<*, *>) :string => {
  const firstName = selectedPerson.get(FIRST_NAME, Immutable.List()).join('/');
  const lastName = selectedPerson.get(LAST_NAME, Immutable.List()).join('/');
  return `${lastName}, ${firstName}`;
};

const detailHeaderText = (doc, y, xOffset, text) => {
  doc.setTextColor(155, 155, 155);
  doc.setFontSize(9);
  doc.text(xOffset, y, text);
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
    doc.setFontType('normal');
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

const getName = (selectedPerson :Immutable.Map<*, *>) :string => {
  let name = formatValue(selectedPerson.get(LAST_NAME, ''));
  name = name.concat(`, ${formatValue(selectedPerson.get(FIRST_NAME, ''))}`);
  const middleName = selectedPerson.get(MIDDLE_NAME, '');
  if (middleName.length) name = name.concat(` ${formatValue(middleName)}`);
  return name;
};

const header = (doc :Object, yInit :number) :number => {
  let y = yInit;
  doc.setFontSize(MEDIUM_FONT_SIZE);
  doc.text(X_MARGIN, y, 'Notification to Appear in Court');
  y += Y_INC;
  doc.setFontType('normal');
  thickLine(doc, y);
  y += Y_INC_LARGE;
  return y;
};

const person = (
  doc :Object,
  yInit :number,
  selectedPerson :Immutable.Map<*, *>
) :number => {
  /* person name header section */
  let y = yInit;
  detailHeaderText(doc, y, X_MARGIN, 'NAME');
  y += Y_INC;
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(X_MARGIN, y, getName(selectedPerson));
  y += Y_INC_LARGE;
  return y;
};

const hearingHeader = (doc, y, xOffset, text) => {
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFontType('bold');
  doc.text(xOffset, y, text);
  doc.setFontType('normal');
};

const hearing = (
  doc :Object,
  yInit :number,
  pageInit :number,
  selectedHearing :Immutable.List<*, *>,
) :number[] => {
  let y :number = yInit;
  let page :number = pageInit;
  let hearingList = Set();
  hearingHeader(doc, y, X_COL_1, 'Address');
  y += Y_INC_SMALL;
  doc.text(X_COL_1, y, '315 St Joseph St, Rapid City, SD 57701');
  y += Y_INC_LARGE;
  hearingHeader(doc, y, X_COL_1, 'Hearing Date');
  hearingHeader(doc, y, X_COL_2, 'Hearing Type');
  hearingHeader(doc, y, X_COL_3, 'Courtroom');
  selectedHearing.forEach((hearingObj) => {
    const {
      [PROPERTY_TYPES.COURTROOM]: courtroom,
      [PROPERTY_TYPES.DATE_TIME]: hearingDateTime,
      [PROPERTY_TYPES.HEARING_TYPE]: hearingType
    } = getEntityProperties(hearingObj, [
      PROPERTY_TYPES.COURTROOM,
      PROPERTY_TYPES.DATE_TIME,
      PROPERTY_TYPES.HEARING_TYPE
    ]);
    const hearingCourtStringNoCaseId = getHearingString(hearingObj);
    if (!hearingList.includes(hearingCourtStringNoCaseId)) {
      y += Y_INC_SMALL;
      doc.text(X_COL_1, y, formatDateTime(hearingDateTime));
      doc.text(X_COL_2, y, hearingType);
      doc.text(X_COL_3, y, courtroom);
      hearingList = hearingList.add(hearingCourtStringNoCaseId);
    }
  });
  y += 2 * Y_INC_LARGE;
  doc.text(X_COL_1, y,
    'This is a Friendly Court Reminder for your Upcoming Court Date according to your RELEASE PAPERWORK at Booking.');
  y += Y_INC_SMALL;
  doc.text(X_COL_1, y,
    'If you need to reschedule and you have no Attorney assigned or retained, please call the Clerk of Courts at 605-394-2575.');
  y += Y_INC_LARGE;
  y += Y_INC_SMALL;
  doc.text(X_COL_1, y, 'If you’ve already rescheduled, please attend your New Court Date and discard this notice.');
  y += Y_INC_LARGE;
  y += Y_INC_SMALL;
  doc.text(X_COL_1, y, 'Pre-Trial Release Department');

  y += Y_INC_SMALL;
  page = pageInit + 1;
  return [y, page];
};

const getPDFContents = (
  doc :Object,
  selectedPerson :Immutable.Map<*, *>,
  selectedHearing :Immutable.Map<*, *>,
) :string => {
  doc.setFont('helvetica', 'normal');
  let y = 15;
  let page = 1;

  // PAGE HEADER
  y = header(doc, y);

  doc.setFontSize(FONT_SIZE);
  // PERSON SECTION
  y = person(doc, y, selectedPerson);
  y += Y_INC_LARGE;

  // HEARING SECTION
  [y, page] = hearing(doc, y, page, selectedHearing);

  return [y, page];
};

const coverPage = (doc :Object, selectedPeople :Immutable.Map<*, *>[]) => {
  let y = 15;
  let page = 1;
  doc.setFontType('bold');
  doc.setFontSize(12);
  doc.text(X_COL_1, y, 'People Included');
  doc.setFontType('normal');
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

const exportPDFList = (fileName :string, pages :{
  selectedPerson :Immutable.Map<*, *>,
  selectedHearing :Immutable.Map<*, *>,
}[]) :void => {
  const doc = new JSPDF();
  let sortedPages = pages;
  sortedPages = sortedPages.sort((page1, page2) => sortPeopleByName(page1.selectedPerson, page2.selectedPerson));

  coverPage(doc, sortedPages.map((page) => page.selectedPerson));

  sortedPages.forEach((page) => {
    const { selectedPerson, selectedHearing } = page;

    doc.addPage();
    getPDFContents(
      doc,
      selectedPerson,
      selectedHearing
    );
  });
  doc.save(`${fileName}.pdf`);
};

export default exportPDFList;
