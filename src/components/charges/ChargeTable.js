/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Table } from 'lattice-ui-kit';

import ChargeRow from './ChargeRow';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  CHARGE_DESCRIPTION,
  CHARGE_STATUTE,
  ENTITY_KEY_ID,
  NUMBER_OF_COUNTS,
  QUALIFIER
} = PROPERTY_TYPES;

const StyledTable = styled(Table)`
  tr {
    color: ${OL.GREY02};
  }
`;

const getChargeData = (charges :List, violentChargeList :Map) => charges.map((charge) => {
  const {
    [CHARGE_DESCRIPTION]: chargeDescription,
    [CHARGE_STATUTE]: statute,
    [ENTITY_KEY_ID]: id,
    [NUMBER_OF_COUNTS]: numberOfCounts,
    [QUALIFIER]: qualifier
  } = getEntityProperties(charge, [
    CHARGE_DESCRIPTION,
    CHARGE_STATUTE,
    ENTITY_KEY_ID,
    NUMBER_OF_COUNTS,
    QUALIFIER
  ]);
  const isViolent = violentChargeList.get(statute, Set()).includes(chargeDescription);
  const numCounts = `${numberOfCounts}`;
  return {
    chargeDescription,
    id,
    isViolent,
    numCounts,
    qualifier,
    statute
  };
});

const HEADERS = [
  { key: 'statute', label: 'Statute', sortable: false },
  { key: 'numCounts', label: 'Number of Counts', sortable: false },
  { key: 'qualifier', label: 'Qualifier', sortable: false },
  { key: 'chargeDescription', label: 'Charge', sortable: false }
];

type Props = {
  charges :List;
  violentChargeList :Map;
};

const ChargeTable = ({
  charges,
  violentChargeList
} :Props) => {
  const chargeData = getChargeData(charges, violentChargeList);

  const components :Object = {
    Row: ({ data } :Object) => (
      <ChargeRow data={data} />
    )
  };

  return (
    <StyledTable
        components={components}
        data={chargeData}
        headers={HEADERS} />
  );
};

export default ChargeTable;
