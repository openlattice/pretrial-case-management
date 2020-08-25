/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestSequence } from 'redux-reqseq';
import { Button, Input } from 'lattice-ui-kit';

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill);
  grid-auto-flow: column;
  width: 100%;
  margin-bottom: 20px;
`;

const SubmitButton = styled(Button)`
  height: 36px;
  width: 80px;
`;

const SearchBar = styled(Input)`
  font-size: 12px;
  height: 36px;
  width: 260px;
`;

type Props = {
  handleSubmit :RequestSequence,
};

type State = {
  searchTerm :string
}

export default class PersonSearchFields extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
  }

  handleSubmit = () => {
    const { handleSubmit } = this.props;
    const { searchTerm } = this.state;
    handleSubmit({ searchTerm });
  }

  handleKeyPress = (e :KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  onChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { searchTerm } = this.state;
    return (
      <SearchRow>
        <SearchBar
            placeholder="Search..."
            name="searchTerm"
            onKeyPress={this.handleKeyPress}
            onChange={this.onChange}
            value={searchTerm} />
        <SubmitButton onClick={this.handleSubmit}>Search</SubmitButton>
      </SearchRow>
    );
  }
}
