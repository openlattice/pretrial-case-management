import styled from 'styled-components';
import { OL } from '../../utils/consts/Colors';


const BasicButton = styled.button`
  border: none;
  border-radius: 3px;
  background-color: ${OL.GREY08};
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  padding: 12px 35px;
  font-size: 14px;

  &:active {
    background-color: ${OL.GREY03};
    color: ${OL.WHITE};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    color: ${OL.GREY03};
  }

  &:hover:enabled {
    background-color: ${OL.GREY05};
    cursor: pointer;
  }
`;

export default BasicButton;
