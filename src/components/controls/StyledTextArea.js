import React from 'react';
import styled from 'styled-components';

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 138px;
  border-radius: 3px;
  background-color: #f9f9fd;
  border: solid 1px #dcdce7;
  padding: 10px 20px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;

  &::placeholder {
    color: #8e929b;
  }
`;

export default StyledTextArea;
