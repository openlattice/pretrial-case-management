import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  display: flex;
  flex: 0 1 auto;
  width: 100%;
  height: 38px;
  font-size: 14px;
  line-height: 19px;
  border-radius: 3px;
  background-color: #f9f9fd;
  border: solid 1px #dcdce7;
  color: #2e2e34;
  padding: 12px 20px;
  &:focus {
    box-shadow: inset 0 0 0 1px rebeccapurple;
    outline: none;
    background-color: #ffffff;
  }

  &::placeholder {
    color: #8e929b;
  }

  &:disabled {
    border-radius: 3px;
    background-color: #f9f9fd;
    border: solid 1px #dcdce7;
    color: #8e929b;
    font-weight: normal;
    cursor: default;
  }
`;

export default StyledInput;
