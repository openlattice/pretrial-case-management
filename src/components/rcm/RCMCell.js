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
  conditions :Object[],
  large ?:boolean,
  onClick ?:() => void,
  opaque :boolean,
  rcm :Object,
  table ?:boolean
};

const Condition = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: ${(props :Object) => {
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
  ${(props :Object) => {
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
  background-color: ${(props :Object) => props.color};
  color: ${(props :Object) => TEXT_COLOR_MAPPINGS[props.color]};
  opacity: ${(props :Object) => (props.opaque ? '1' : '0.5')};
`;

const RCMCell = ({
  rcm,
  conditions,
  large,
  opaque,
  table,
  onClick
} :Props) => {
  const cellConditions = fromJS(conditions);
  const cellRCM = fromJS(rcm);
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
  large: false,
  onClick: () => {},
  opaque: true,
  table: false
};

export default RCMCell;
