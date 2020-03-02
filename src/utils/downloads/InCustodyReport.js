/*
 * @flow
 */
import Papa from 'papaparse';
import { DateTime } from 'luxon';
import { List, Map, Set } from 'immutable';

import FileSaver from '../FileSaver';
import { APP_TYPES, PROPERTY_TYPES } from '../consts/DataModelConsts';
import { getEntityProperties, getEntityKeyId } from '../DataUtils';
import { formatDateTime, formatDate } from '../FormattingUtils';
import { getChargesByCaseNumber, getCasesForPSA } from '../CaseUtils';
import { getMostRecentPSA } from '../PSAUtils';

import { PSA_NEIGHBOR } from '../consts/FrontEndStateConsts';


const {
  CHARGES,
  ARREST_BONDS,
  JAIL_STAYS,
  PEOPLE,
  MANUAL_PRETRIAL_CASES,
  PRETRIAL_CASES,
  PSA_SCORES
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  BOND_AMOUNT,
  BOND_TYPE,
  CHARGE_DESCRIPTION,
  CHARGE_STATUTE,
  COMPLETED_DATE_TIME,
  DATE_TIME,
  DISPOSITION_DATE,
  DOB,
  FIRST_NAME,
  FTA_SCALE,
  ID,
  LAST_NAME,
  MIDDLE_NAME,
  NCA_SCALE,
  NVCA_FLAG,
  START_DATE_TIME,
  SURETY_AMOUNT,
  TIMESTAMP,
} = PROPERTY_TYPES;


const DATETIME_FQNS = [
  TIMESTAMP,
  COMPLETED_DATE_TIME,
  DATE_TIME,
  ARREST_DATE_TIME
];

const HEADERS :Object = {
  LAST_NAME: `${LAST_NAME}|${PEOPLE}`,
  FIRST_NAME: `${FIRST_NAME}|${PEOPLE}`,
  MIDDLE_NAME: `${MIDDLE_NAME}|${PEOPLE}`,
  DOB: `${DOB}|${PEOPLE}`,
  INMATE_NO: `${ID}|${JAIL_STAYS}`,
  DAYS_IN_CUSTODY: `${START_DATE_TIME}|${JAIL_STAYS}`,
  NVCA_FLAG: `${NVCA_FLAG}|${PSA_SCORES}`,
  FTA_SCALE: `${FTA_SCALE}|${PSA_SCORES}`,
  NCA_SCALE: `${NCA_SCALE}|${PSA_SCORES}`,
  COMPLETE_CHARGES: `complete|${CHARGES}`,
  PENDING_CHARGES: `pending|${CHARGES}`,
  ARREST_BONDS,
  BOND_TOTAL: `${BOND_AMOUNT}|${ARREST_BONDS}`
};

const HEADERS_OBJ :Object = {
  [HEADERS.LAST_NAME]: 'LAST',
  [HEADERS.FIRST_NAME]: 'FIRST',
  [HEADERS.MIDDLE_NAME]: 'MIDDLE',
  [HEADERS.DOB]: 'DOB',
  [HEADERS.INMATE_NO]: 'INMATE ID',
  [HEADERS.DAYS_IN_CUSTODY]: 'DAYS IN CUSTODY',
  [HEADERS.NVCA_FLAG]: 'NCVA FLAG',
  [HEADERS.FTA_SCALE]: 'FTA',
  [HEADERS.NCA_SCALE]: 'NCA',
  [HEADERS.BOND_TOTAL]: 'BOND TOTAL',
  [HEADERS.COMPLETE_CHARGES]: 'COMPLETE CHARGES',
  [HEADERS.PENDING_CHARGES]: 'PENDING CHARGES',
  [HEADERS.ARREST_BONDS]: 'ARREST BONDS'
};

const POSITIONS = Object.values(HEADERS_OBJ);


const FIFTEEN_DAYS_AGO :string = DateTime.local().minus({ days: 15 });


const getUpdatedEntity = (combinedEntityInit, appTypeFqn, details) => {
  const entityDetails = details.get(PSA_NEIGHBOR.DETAILS, details);
  let combinedEntity = combinedEntityInit;
  switch (appTypeFqn) {
    case CHARGES: {
      let description = '';
      let statute = '';
      const { [DISPOSITION_DATE]: dispositionDate } = getEntityProperties(entityDetails, [DISPOSITION_DATE]);
      const keyString = dispositionDate
        ? `complete|${CHARGES}`
        : `pending|${CHARGES}`;
      const headerString = HEADERS_OBJ[keyString];
      let newArrayValues = combinedEntity.get(headerString, List());
      entityDetails.entrySeq().forEach(([fqn, values]) => {
        values.forEach((value) => {
          if (fqn === CHARGE_STATUTE) statute = value;
          if (fqn === CHARGE_DESCRIPTION) description = value;
        });
      });
      if (statute && description) {
        const chargeString = `${statute} | ${description}`;
        newArrayValues = newArrayValues.push(chargeString);
        combinedEntity = combinedEntity.set(headerString, newArrayValues);
      }
      break;
    }
    case ARREST_BONDS: {
      let bondType = '';
      let bondAmount = '';
      const keyString = `${BOND_AMOUNT}|${ARREST_BONDS}`;
      const headerString = HEADERS_OBJ[appTypeFqn];
      let newArrayValues = combinedEntity.get(headerString, List());
      entityDetails.entrySeq().forEach(([fqn, values]) => {
        values.forEach((value) => {
          if (fqn === BOND_TYPE) bondType = value;
          if (fqn === BOND_AMOUNT || fqn === SURETY_AMOUNT) bondAmount = value;
        });
      });
      if (bondType || bondAmount) {
        let bondString = bondType;
        if (bondAmount) {
          bondString = `${bondType} | ${bondAmount}`;
          const bondTotalHeader = HEADERS_OBJ[keyString];
          const existingBondTotal = Number.parseInt(combinedEntity.get(bondTotalHeader, 0), 10);
          const newBondTotal = existingBondTotal + Number.parseInt(bondAmount, 10);
          combinedEntity = combinedEntity.set(HEADERS_OBJ[keyString], [newBondTotal]);
        }
        newArrayValues = newArrayValues.push(bondString);
        combinedEntity = combinedEntity.set(headerString, newArrayValues);
      }
      break;
    }
    default: {
      entityDetails.entrySeq().forEach(([fqn, values]) => {
        const keyString = `${fqn}|${appTypeFqn}`;
        const headerString = HEADERS_OBJ[keyString];
        let newArrayValues = combinedEntity.get(headerString, List());
        if (headerString) {
          values.forEach((value) => {
            let newVal = value;
            if (fqn === DOB) newVal = formatDate(value);
            else if (DATETIME_FQNS.includes(fqn)) formatDateTime(value);
            else if (fqn === START_DATE_TIME) {
              const start = DateTime.fromISO(value);
              const end = DateTime.local();
              newVal = Math.round(end.diff(start, 'days').days);
            }
            if (!newArrayValues.includes(newVal)) {
              newArrayValues = newArrayValues.push(newVal);
            }
          });
          combinedEntity = combinedEntity.set(headerString, newArrayValues);
        }
      });
      break;
    }
  }
  return combinedEntity;
};

const downloadInCustodyReport = ({
  jailStaysById,
  jailStayNeighborsById,
  peopleNeighborsById,
  psaNeighborsById
}) => {
  let jsonResults = List();
  let allHeaders = Set();

  if (jailStaysById.size) {
    jailStaysById.entrySeq().forEach(([jailStayEKID, jailStay]) => {
      const { [START_DATE_TIME]: jailStayStartDateTime } = getEntityProperties(jailStay, [START_DATE_TIME]);
      const jailStayNeighbors :Map = jailStayNeighborsById.get(jailStayEKID, Map());
      const jailStayStartDT = DateTime.fromISO(jailStayStartDateTime);
      if (jailStayStartDT < FIFTEEN_DAYS_AGO) {
        let combinedEntity = getUpdatedEntity(
          Map(),
          JAIL_STAYS,
          jailStay
        );
        const arrestBonds = jailStayNeighbors.get(ARREST_BONDS, List());
        arrestBonds.forEach((bond) => {
          combinedEntity = getUpdatedEntity(
            combinedEntity,
            ARREST_BONDS,
            bond
          );
        });
        const person :Map = jailStayNeighbors.get(PEOPLE, Map());
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          PEOPLE,
          person
        );
        const personEKID :EKID = getEntityKeyId(person);
        const personNeighbors :Map = peopleNeighborsById.get(personEKID, Map());
        const personPSAs :List = personNeighbors.get(PSA_SCORES, List());
        const { mostRecentPSA, mostRecentPSAEKID } = getMostRecentPSA(personPSAs);
        combinedEntity = getUpdatedEntity(
          combinedEntity,
          PSA_SCORES,
          mostRecentPSA
        );
        const personCharges :List = personNeighbors.get(CHARGES, List());
        const personPretrialCases :List = personNeighbors.get(PRETRIAL_CASES, List());
        const psaNeighbors :Map = psaNeighborsById.get(mostRecentPSAEKID, Map());
        const arrestCase :Map = psaNeighbors.get(MANUAL_PRETRIAL_CASES, Map());
        const chargeHistory = getChargesByCaseNumber(personCharges);
        const { [ARREST_DATE_TIME]: arrestDateTime } = getEntityProperties(arrestCase, [ARREST_DATE_TIME]);
        const { chargeHistoryForMostRecentPSA } = getCasesForPSA(
          personPretrialCases,
          chargeHistory,
          mostRecentPSA,
          arrestDateTime
        );
        const chargeList = chargeHistoryForMostRecentPSA.valueSeq().flatten(1);
        chargeList.forEach((charge) => {
          combinedEntity = getUpdatedEntity(
            combinedEntity,
            CHARGES,
            charge
          );
        });
        allHeaders = allHeaders.union(combinedEntity.keys())
          .sort((header1, header2) => (POSITIONS.indexOf(header1) >= POSITIONS.indexOf(header2) ? 1 : -1));
        if (
          combinedEntity.get('FIRST')
          || combinedEntity.get('MIDDLE')
          || combinedEntity.get('LAST')
        ) {
          jsonResults = jsonResults.push(combinedEntity);
        }
      }
    });
    jsonResults = jsonResults.sortBy((psa) => psa.get('FIRST')).sortBy((psa) => psa.get('LAST'));

    const fields = allHeaders.toJS();
    const csv = Papa.unparse({
      fields,
      data: jsonResults.toJS()
    });

    const name = `in_custody_report_${DateTime.local().toISODate()}`;

    FileSaver.saveFile(csv, name, 'csv');
  }
};

export default downloadInCustodyReport;
