/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { RESULT_CATEGORIES, COLORS, getConditionsTextList } from '../../utils/consts/DMFResultConsts';

type Props = {
  selected :boolean,
  dmf :Object,
  large? :boolean
};

const COLOR_MAPPINGS = {
  [COLORS.DARK_GREEN]: '#018856',
  [COLORS.LIGHT_GREEN]: '#60d050',
  [COLORS.YELLOW]: '#fff566',
  [COLORS.ORANGE]: '#ffa748',
  [COLORS.RED]: '#d02924'
};

const TEXT_COLOR_MAPPINGS = {
  [COLORS.DARK_GREEN]: '#ffffff',
  [COLORS.LIGHT_GREEN]: '#2e2e34',
  [COLORS.YELLOW]: '#2e2e34',
  [COLORS.ORANGE]: '#2e2e34',
  [COLORS.RED]: '#ffffff'
};

const Condition = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  ${(props) => {
    if (props.large) {
      return (
        'font-size: 14px;'
      );
    }
  }}
`;

const Cell = styled.div`
  text-align: center;
  padding: 10px;
  height: 70px;
  width: 116px;
  margin: 3px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-evenly;
  border-radius: 2px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  ${(props) => {
    if (props.large) {
      return (
        `height: 100px;
         width: 165px;`
      );
    }
    else if (props.table) {
      return (
        `height: 77px;
         width: 128px;
         margin: 0;`
      );
    }
  }}
`;

const DMFCell = ({ selected, dmf, large, table }) :Props => {

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
      {conditions.map(condition => (
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
  large: false
};

export default DMFCell;
