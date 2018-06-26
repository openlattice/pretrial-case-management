import React from 'react';
import styled from 'styled-components';

const InfoButton = styled.button`
  border-radius: 3px;
  background-color: #6124e2;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  padding: 10px 75px;

  &:hover {
    background-color: #8045ff;
    cursor: pointer;
  }

  &:active {
    background-color: #361876;
  }
`;

export default InfoButton;
