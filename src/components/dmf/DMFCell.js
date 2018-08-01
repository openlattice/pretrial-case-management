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
  font-size: ${props => (props.large ? '14px' : '12px')};
  font-weight: 600;
`;

const Cell = styled.div`
  text-align: center;
  padding: 10px;
  height: ${props => (props.large ? '100px' : '70px')};
  width: ${props => (props.large ? '165px' : '116px')};
  margin: 3px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-evenly;
  border-radius: 2px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
`;

const DMFCell = ({ selected, dmf, large }) :Props => {

  const StyledCell = styled(Cell)`
    background-color: ${COLOR_MAPPINGS[dmf[RESULT_CATEGORIES.COLOR]]};
    color: ${TEXT_COLOR_MAPPINGS[dmf[RESULT_CATEGORIES.COLOR]]};
    opacity: ${selected ? 1 : 0.5};
  `;

  const conditions = getConditionsTextList(dmf);

  return (
    <StyledCell large={large}>
      {conditions.map(condition => <Condition large={large} key={condition}>{condition}</Condition>)}
    </StyledCell>
  );
};

DMFCell.defaultProps = {
  large: false
};

export default DMFCell;
