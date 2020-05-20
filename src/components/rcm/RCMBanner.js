/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS } from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { TEXT_COLOR_MAPPINGS, COLOR_RESULTS_MAP } from '../../utils/consts/RCMResultsConsts';

const { COLOR, TYPE } = PROPERTY_TYPES;

type Props = {
  courtConditions :Object[],
  rcm :Object,
};

const Condition = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 11px;
`;

const RCMWrapper = styled.div`
  border-radius: 3px;
  padding: 5px 10px;
  margin: 5px;
  background-color: ${(props :Object) => props.color};
  color: ${(props :Object) => TEXT_COLOR_MAPPINGS[props.color]};
`;

const RCMCell = ({
  rcm,
  courtConditions
} :Props) => {
  const courtCellConditions = fromJS(courtConditions);
  const cellRCM = fromJS(rcm);
  const { [COLOR]: color } = getEntityProperties(cellRCM, [COLOR]);
  const backgroundColor = COLOR_RESULTS_MAP[color];
  const courtString = courtCellConditions.map((condition) => {
    const { [TYPE]: conditionType } = getEntityProperties(condition, [TYPE]);
    return conditionType;
  }).join(', ');
  return (
    courtConditions
      && (
        <RCMWrapper color={backgroundColor}>
          <Condition>
            { courtString }
          </Condition>
        </RCMWrapper>
      )
  );
};

export default RCMCell;
