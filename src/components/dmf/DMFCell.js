/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import { RESULT_CATEGORIES, COLORS } from '../../utils/consts/DMFResultConsts';
import { getConditionsTextList } from '../../utils/DMFUtils';

const COLOR_MAPPINGS :Object = {
  [COLORS.DARK_GREEN]: OL.GREEN04,
  [COLORS.LIGHT_GREEN]: OL.GREEN05,
  [COLORS.YELLOW]: OL.YELLOW03,
  [COLORS.ORANGE]: OL.ORANGE02,
  [COLORS.RED]: OL.RED02,
};

const TEXT_COLOR_MAPPINGS :Object = {
  [COLORS.DARK_GREEN]: OL.WHITE,
  [COLORS.LIGHT_GREEN]: OL.GREY15,
  [COLORS.YELLOW]: OL.GREY15,
  [COLORS.ORANGE]: OL.GREY15,
  [COLORS.RED]: OL.WHITE
};

type Props = {
  selected ?:boolean;
  dmf ?:Object;
  large ?:boolean;
  table ?:boolean;
}


const Condition = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: ${(props :Object) => {
    if (props.large) {
      return (
        '14px;'
      );
    }
    if (props.table) {
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
  text-align: center;
  padding: 10px;
  margin: 3px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-evenly;
  border-radius: 2px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  ${(props :Object) => {
    if (props.large) {
      return (
        `height: 100px;
         width: 165px;`
      );
    }
    if (props.table) {
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

const DMFCell = ({
  selected,
  dmf,
  large,
  table
} :Props) => {

  const StyledCell = styled(Cell)`
    background-color: ${COLOR_MAPPINGS[dmf[RESULT_CATEGORIES.COLOR]]};
    color: ${TEXT_COLOR_MAPPINGS[dmf[RESULT_CATEGORIES.COLOR]]};
    opacity: ${selected ? 1 : 0.5};
  `;

  const conditions = getConditionsTextList(dmf);

  return (
    <StyledCell
        large={large}
        table={table}>
      {conditions.map((condition) => (
        <Condition
            large={large}
            table={table}
            key={condition}>
          {condition}
        </Condition>
      ))}
    </StyledCell>
  );
};

DMFCell.defaultProps = {
  selected: false,
  dmf: {},
  large: false,
  table: false
};

export default DMFCell;
