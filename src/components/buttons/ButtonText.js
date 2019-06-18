/*
 * @flow
 */

import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const ButtonText = styled.button`
  background-color: transparent;
  border: none;
  color: ${OL.PURPLE02};
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  outline: none;
  text-align: right;

  &:hover {
    text-decoration: underline;
  }
`;

export default ButtonText;
