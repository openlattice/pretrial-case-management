/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

const StyledWrapper = styled.div`
  margin-bottom: 18px;
  width: 100%;
`;

type Props = {
  handleInput :(event :Object) => void,
  query :string,
  onSearchSubmit :(event :Object) => void
};

const SearchBar = ({ handleInput, query, onSearchSubmit } :Props) => (
  <StyledWrapper>
    <InputGroup>
      <FormControl
          value={query}
          type="text"
          onChange={handleInput} />
      <InputGroup.Button>
        <Button type="submit" onClick={onSearchSubmit}>Search</Button>
      </InputGroup.Button>
    </InputGroup>
  </StyledWrapper>
);

export default SearchBar;
