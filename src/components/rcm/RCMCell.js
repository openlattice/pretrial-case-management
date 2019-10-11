/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS, isImmutable } from 'immutable';

import { getEntityProperties } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { TEXT_COLOR_MAPPINGS, COLOR_RESULTS_MAP } from '../../utils/consts/RCMResultsConsts';

const { COLOR, TYPE } = PROPERTY_TYPES;

type Props = {
  opaque :boolean,
  rcm :Object,
  conditions :Object[],
  large? :boolean,
  table :boolean,
  onClick :() => void
};

const Condition = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: ${(props) => {
    if (props.large) {
      return (
        '14px;'
      );
    }
    if (props.grid) {
      return (
        '12px;'
      );
    }
    return (
      '11px;'
    );
  }}
`;

const Cell = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  word-wrap: normal;
  ${(props) => {
    if (props.large) {
      return (
        `height: 100px;
         width: 165px;`
      );
    }
    if (props.grid) {
      return (
        `height: 77px;
         width: 128px;
         margin: 0;`
      );
    }
    return (
      `height: 70px;
       width: 116px;`
    );
  }}
`;

const StyledCell = styled(Cell)`
  margin: 5px;
  background-color: ${props => props.color};
  color: ${props => TEXT_COLOR_MAPPINGS[props.color]};
  opacity: ${props => (props.opaque ? 1 : 0.5)};
`;

const RCMCell = ({
  rcm,
  conditions,
  large,
  opaque = true,
  table,
  onClick
} :Props) => {
  const cellConditions = isImmutable(conditions) ? conditions : fromJS(conditions);
  const cellRCM = isImmutable(rcm) ? rcm : fromJS(rcm);
  const color = COLOR_RESULTS_MAP[cellRCM.getIn([COLOR, 0], cellRCM.get(COLOR, ''))];
  return (
    <StyledCell
        large={large}
        table={table}
        opaque={opaque}
        color={color}
        onClick={onClick}>
      <Condition
          large={large}
          table={table}>
        {
          cellConditions.map((condition) => {
            const { [TYPE]: conditionType } = getEntityProperties(condition, [TYPE]);
            return conditionType;
          }).join(', ')
        }
      </Condition>
    </StyledCell>
  );
};

RCMCell.defaultProps = {
  large: false
};

export default RCMCell;
