/*
 * @flow
 */
import React from 'react';
import { List, Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import ArrestRow from './ArrestRow';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARREST_DATE_TIME,
  ARRESTING_AGENCY,
  CASE_ID,
  CASE_NUMBER,
  ENTITY_KEY_ID,
  NUMBER_OF_CHARGES
} = PROPERTY_TYPES;

const pageOptions = [5, 10, 15];

const HEADERS = [
  { key: 'caseNum', label: 'Case Number' },
  { key: 'arrestDate', label: 'Arrest Date' },
  { key: 'arrestTime', label: 'Arrest Time' },
  { key: 'numberOfCharges', label: 'Number of Charges' },
  { key: 'arrestingAgency', label: 'Arresting Agency' }
];

const getChargeData = (arrests :List) => arrests.map((arrest) => {
  const {
    [ARRESTING_AGENCY]: arrestingAgency,
    [ARREST_DATE_TIME]: arrestDateTime,
    [CASE_ID]: caseId,
    [CASE_NUMBER]: caseNumber,
    [ENTITY_KEY_ID]: id,
    [NUMBER_OF_CHARGES]: numberOfCharges,
  } = getEntityProperties(arrest, [
    ARRESTING_AGENCY,
    ARREST_DATE_TIME,
    CASE_ID,
    CASE_NUMBER,
    ENTITY_KEY_ID,
    NUMBER_OF_CHARGES
  ]);
  const caseNum = caseNumber || caseId;
  const arrestDate = formatDate(arrestDateTime);
  const arrestTime = formatTime(arrestDateTime);

  return {
    arrest,
    arrestDate,
    arrestingAgency,
    arrestTime,
    caseNum,
    id,
    numberOfCharges
  };
});

type Props = {
  arrests :List;
  handleSelect :(arrest :Map, arrestEKID :UUID) => void;
};

const ArrestTable = ({ arrests, handleSelect } :Props) => {

  const components :Object = {
    Row: ({ data } :Object) => (
      <ArrestRow data={data} handleSelect={handleSelect} />
    )
  };

  const arrestData = getChargeData(arrests);

  return (
    <Table
        components={components}
        headers={HEADERS}
        paginated
        rowsPerPageOptions={pageOptions}
        data={arrestData} />
  );
};

export default ArrestTable;
