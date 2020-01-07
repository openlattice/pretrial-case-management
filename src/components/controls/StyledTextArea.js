import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 138px;
  border-radius: 3px;
  background-color: ${OL.GREY10};
  border: solid 1px ${OL.GREY05};
  padding: 10px 20px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;

  &::placeholder {
    color: ${OL.GREY02};
  }

  &:focus {
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
    background-color: ${OL.WHITE};
  }

  &:disabled {
    cursor: default;
    background-color: ${OL.WHITE};
  }
`;

export default StyledTextArea;
