import React from 'react';
import styled from 'styled-components';

const SecondaryButton = styled.button`
  border-radius: 3px;
  background-color: #e4d8ff;
  color: #6124e2;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  width: 100%;
  border: none;

  &:hover {
    background-color: #d0bbff;
  }

  &:active {
    background-color: #b898ff;
  }

`;

export default SecondaryButton;
