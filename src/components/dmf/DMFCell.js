/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { RESULT_CATEGORIES, COLORS, CONDITION_TYPES } from '../../utils/consts/DMFResultConsts';

type Props = {
  selected :boolean,
  dmf :{
    [RESULT_CATEGORIES.COLOR] :string,
    [RESULT_CATEGORIES.RELEASE_TYPE] :string,
    [RESULT_CATEGORIES.CONDITIONS_LEVEL] :?string,
    [RESULT_CATEGORIES.CONDITION_1] :?string,
    [RESULT_CATEGORIES.CONDITION_2] :?string,
    [RESULT_CATEGORIES.CONDITION_3] :?string
  }
};

const COLOR_MAPPINGS = {
  [COLORS.DARK_GREEN]: '#4f8901',
  [COLORS.LIGHT_GREEN]: '#ccff66',
  [COLORS.YELLOW]: '#ffff00',
  [COLORS.ORANGE]: '#ff9900',
  [COLORS.RED]: '#e5302d'
};

const CONDITION_MAPPINGS = {
  [CONDITION_TYPES.PR]: 'PR',
  [CONDITION_TYPES.PR_RELEASE]: 'PR - Release',
  [CONDITION_TYPES.EM_OR_BOND]: 'EM or $ Bond',
  [CONDITION_TYPES.EM_AND_BOND]: 'EM and $ Bond',
  [CONDITION_TYPES.CHECKIN_WEEKLY]: 'Weekly check-in',
  [CONDITION_TYPES.CHECKIN_WEEKLY_AT_LEAST]: 'At least weekly check-in',
  [CONDITION_TYPES.CHECKIN_MONTHLY]: '1/month check-in',
  [CONDITION_TYPES.CHECKIN_TWICE_MONTHLY]: '2/month check-in',
  [CONDITION_TYPES.IF_APPLICABLE_247]: '24/7, if applicable',
  [CONDITION_TYPES.HOLD_PENDING_JUDICIAL_REVIEW]: 'Hold pending judicial review'
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

  const c1 = dmf[RESULT_CATEGORIES.CONDITION_1] ? CONDITION_MAPPINGS[dmf[RESULT_CATEGORIES.CONDITION_1]] : null;
  const c2 = dmf[RESULT_CATEGORIES.CONDITION_2] ? CONDITION_MAPPINGS[dmf[RESULT_CATEGORIES.CONDITION_2]] : null;
  const c3 = dmf[RESULT_CATEGORIES.CONDITION_3] ? CONDITION_MAPPINGS[dmf[RESULT_CATEGORIES.CONDITION_3]] : null;

  return (
    <StyledCell>
      {c1 ? <Condition>{c1}</Condition> : null}
      {c2 ? <Condition>{c2}</Condition> : null}
      {c3 ? <Condition>{c3}</Condition> : null}
    </StyledCell>
  );
};

export default DMFCell;
