/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { OL } from '../utils/consts/Colors';

const StyledInput = styled.input`
  font-size: 12px;
  height: 36px;
  padding: 5px;
  color: ${OL.GREY02};
  width: 260px;
  background: ${OL.GREY09};
  border-style: inset;
  border: 1px solid ${OL.GREY04};
  border-radius: 10px;
  margin: 10px 0;

  :focus {
    outline: none;
    box-shadow: 0 0 10px ${OL.PURPLE05};
  }
`;

type Props = {
  placeholder :string,
  onChange :(event :Object) => void
};

const SearchBar = ({ onChange, placeholder } :Props) => (
  <StyledInput
      onChange={onChange}
      placeholder={placeholder || 'Search...'} />
);

export default SearchBar;
