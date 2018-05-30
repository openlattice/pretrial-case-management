/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { RESULT_CATEGORIES, COLORS, getConditionsTextList } from '../../utils/consts/DMFResultConsts';

type Props = {
  selected :boolean,
  dmf :Object
};

const COLOR_MAPPINGS = {
  [COLORS.DARK_GREEN]: '#4f8901',
  [COLORS.LIGHT_GREEN]: '#ccff66',
  [COLORS.YELLOW]: '#ffff00',
  [COLORS.ORANGE]: '#ff9900',
  [COLORS.RED]: '#e5302d'
};

const Condition = styled.div`
  font-weight: bold;
`;

const Cell = styled.div`
  text-align: center;
  padding: 10px;
  height: 90px;
  width: 150px;
  margin: 3px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const DMFCell = ({ selected, dmf }) :Props => {

  const StyledCell = styled(Cell)`
    background: ${COLOR_MAPPINGS[dmf[RESULT_CATEGORIES.COLOR]]};
    opacity: ${selected ? 1 : 0.5};
  `;

  const conditions = getConditionsTextList(dmf);

  return (
    <StyledCell>
      {conditions.map(condition => <Condition key={condition}>{condition}</Condition>)}
    </StyledCell>
  );
};

export default DMFCell;
