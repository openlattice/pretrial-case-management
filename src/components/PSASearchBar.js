/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../utils/consts/Colors';

const StyledInput = styled.input`
  background: ${OL.GREY09};
  border: 1px solid ${OL.GREY04};
  border-radius: 10px;
  border-style: inset;
  color: ${OL.GREY02};
  font-size: 12px;
  height: 36px;
  margin: 10px 0;
  padding: 5px;
  width: 260px;

  :focus {
    outline: none;
    box-shadow: 0 0 10px ${OL.PURPLE05};
  }
`;

type Props = {
  onChange :(event :Object) => void;
  placeholder :string;
};

const SearchBar = ({ onChange, placeholder } :Props) => (
  <StyledInput
      onChange={onChange}
      placeholder={placeholder || 'Search...'} />
);

export default SearchBar;
