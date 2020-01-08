import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const SecondaryButton = styled.button`
  border-radius: 3px;
  background-color: ${OL.PURPLE06};
  color: ${OL.PURPLE02};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  width: 100%;
  border: none;

  &:hover {
    background-color: ${OL.PURPLE05};
  }

  &:active {
    background-color: ${OL.PURPLE04};
  }
`;

export default SecondaryButton;
