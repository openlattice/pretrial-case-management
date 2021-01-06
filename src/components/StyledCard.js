/*
 * @flow
 */

import styled from 'styled-components';
import { OL } from '../utils/consts/Colors';

const StyledCard = styled.div`
  width: 270px;
  height: 70px;
  border-radius: 7px;
  background-color: white;
  border: solid 1px ${OL.GREY11};
  margin: 0 30px 20px 0;
  display: flex;
  flex-direction: row;

  &:hover {
    cursor: pointer;
    background: ${OL.GREY14};
  }
`;

export default StyledCard;
