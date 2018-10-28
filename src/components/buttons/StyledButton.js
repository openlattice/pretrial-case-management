/*
 * @flow
 */

import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const StyledButton = styled.button`
  background-color: ${OL.WHITE};
  border-color: ${OL.GREY17};
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  color: ${OL.BLUE03};
  cursor: pointer;
  font-size: 14px;
  line-height: 18px;
  outline: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: ${OL.BLUE04};
  }

  &:disabled {
    border-color: ${OL.BLUE05};
    color: ${OL.BLUE06};
    cursor: not-allowed;
  }
`;

export default StyledButton;
