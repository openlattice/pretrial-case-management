import React from 'react';
import styled from 'styled-components';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';


const StyledWrapper = styled.div`
  margin-bottom: 18px;
  width: 100%;
`;

const SearchBar = ({ handleInput, query, onSearchSubmit }) => {
  return (
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
};

SearchBar.propTypes = {
  handleInput: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  onSearchSubmit: PropTypes.func.isRequired
};

export default SearchBar;
