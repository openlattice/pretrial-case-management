/*
 * @flow
 */

import styled from 'styled-components';
import { OL } from '../../utils/consts/Colors';

export const HeaderSection = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
  width: 100%;
  padding: 5px;

  div {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
`;
