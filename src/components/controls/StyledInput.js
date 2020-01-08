import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const StyledInput = styled.input`
  background-color: ${OL.GREY10};
  border: solid 1px ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY15};
  display: flex;
  flex: 0 1 auto;
  font-size: 14px;
  height: 38px;
  line-height: 19px;
  padding: 12px 20px;
  width: 100%;

  &:focus {
    background-color: ${OL.WHITE};
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
  }

  &::placeholder {
    color: ${OL.GREY02};
  }

  &:disabled {
    background-color: ${OL.GREY10};
    border: solid 1px ${OL.GREY05};
    border-radius: 3px;
    color: ${OL.GREY02};
    cursor: default;
    font-weight: normal;
  }
`;

export default StyledInput;
