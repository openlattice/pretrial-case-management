/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DataGrid } from 'lattice-ui-kit';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { formatDate, formatTime } from '../../utils/FormattingUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { ARREST_DATE_TIME, ARRESTING_AGENCY, CASE_ID } = PROPERTY_TYPES;

type Props = {
  arrest :Map;
  component :string;
};

const arrestDateKey = `${ARREST_DATE_TIME}-DATE`;
const arrestTimeKey = `${ARREST_DATE_TIME}-TIME`;

const fullLabelMap = fromJS({
  [CASE_ID]: 'Case Number',
  empty: '',
  [arrestDateKey]: 'Arrest Date',
  [arrestTimeKey]: 'Arrest Time',
  [ARRESTING_AGENCY]: 'Arresting Agency'
});

const partialLabelMap = fromJS({
  [arrestDateKey]: 'Arrest Date',
  [arrestTimeKey]: 'Arrest Time',
  [ARRESTING_AGENCY]: 'Arresting Agency'
});

const ArrestCard = ({ arrest, component } :Props) => {
  const {
    [ARREST_DATE_TIME]: arrestDateTime,
    [ARRESTING_AGENCY]: arrestingAgency,
    [CASE_ID]: caseId
  } = getEntityProperties(
    arrest,
    [CASE_ID, ARREST_DATE_TIME, ARRESTING_AGENCY]
  );
  const arrestDate = formatDate(arrestDateTime);
  const arrestTime = formatTime(arrestDateTime);

  let labelMap = List();

  const data = Map({
    [ARRESTING_AGENCY]: arrestingAgency,
    [arrestDateKey]: arrestDate,
    [arrestTimeKey]: arrestTime,
    [CASE_ID]: caseId,
    empty: ''
  });

  if (component === CONTENT_CONSTS.FORM_CONTAINER) {
    labelMap = fullLabelMap;
  }
  else {
    labelMap = partialLabelMap;
  }

  return (
    <DataGrid
        columns={2}
        data={data}
        labelMap={labelMap}
        truncate />
  );
};

export default ArrestCard;
