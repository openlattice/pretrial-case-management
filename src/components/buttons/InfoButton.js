import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const InfoButton = styled.button`
  border-radius: 3px;
  background-color: ${OL.PURPLE02};
  color: ${OL.WHITE};
  font-family: 'Open Sans', sans-serif;
  padding: 10px 0;
  width: 190px;
  margin: 0 auto;

  &:hover {
    background-color: ${OL.PURPLE03};
    cursor: pointer;
  }

  &:active {
    background-color: ${OL.PURPLE01};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: ${OL.GREY08};
    color: ${OL.GREY03};
    border: none;

    &:hover {
      cursor: default;
    }
  }
`;

export default InfoButton;
