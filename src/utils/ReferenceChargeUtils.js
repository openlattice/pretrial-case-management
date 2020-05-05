/*
 * @flow
 */
import Papa from 'papaparse';
import { Map } from 'immutable';

import { getPropertyTypeId } from '../edm/edmUtils';
import { DYNAMIC_TYPED_COLUMNS, PROPERTY_TYPE_MAPPINGS } from './consts/ChargeConsts';


export const getValidRow = (row :Object, edm :Map) => {
  const returnRow = {};

  const hasRequiredFields = row.statute && row.description;

  console.log(row);

  const isValid = Object.keys(row).reduce((acc, column) => {
    if (!acc) {
      return acc;
    }

    const shouldBeBoolean = DYNAMIC_TYPED_COLUMNS[column];
    if (typeof shouldBeBoolean !== 'boolean') {
      return false;
    }

    let cellData = row[column];

    const cellDataType = typeof cellData;


    // set cell data to false if it should be a boolean, but is not.
    if (shouldBeBoolean && (cellDataType !== 'boolean')) {
      if (cellData === null) cellData = false;
      else return false;
    }

    // invalid if non-boolean value is empty string
    if (!shouldBeBoolean && !((cellDataType === 'string') && cellData.length)) return false;

    const propertyType = PROPERTY_TYPE_MAPPINGS[column];
    const ptid = getPropertyTypeId(edm, propertyType);
    console.log(propertyType);
    console.log(ptid);
    returnRow[ptid] = [row[column]];

    return true;
  }, true);

  console.log(returnRow);

  return isValid && hasRequiredFields ? returnRow : null;
};

export async function parseCsvToJson({ file, edm } :Object) {
  console.log(edm.toJS());
  return new Promise((resolve, reject) => {
    // first row in CSV should be header
    let rowNumber = 2;
    const csvToJSON = [];
    const badRows = [];

    Papa.parse(file, {
      complete: () => resolve({
        data: csvToJSON,
        error: badRows.length ? badRows : undefined
      }),
      error: reject,
      header: true,
      dynamicTyping: DYNAMIC_TYPED_COLUMNS,
      step: (results) => {
        const { data } = results;
        const row = getValidRow(data, edm);
        if (row) {
          csvToJSON.push(row);
        }
        else {
          badRows.push(rowNumber);
        }
        rowNumber += 1;
      },
      worker: true
    });
  });
}
