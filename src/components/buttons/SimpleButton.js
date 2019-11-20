/*
 * @flow
 */

import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';

export default styled(Button)`
  background: none;
  border: solid 1px ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 11px;
  height: 28px;
  padding: 5px 10px;
  margin-left: 5px;
`;
