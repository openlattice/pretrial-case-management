/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { RequestSequence } from 'redux-reqseq';

import StyledInput from './controls/StyledInput';
import InfoButton from './buttons/InfoButton';
import { OL } from '../utils/consts/Colors';

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill);
  grid-auto-flow: column;
  width: 100%;
`;

const SubmitButton = styled(InfoButton)`
  height: 36px;
  width: 80px;
  padding: 0 10px;
`;

const SearchBar = styled(StyledInput)`
  font-size: 12px;
  height: 36px;
  padding: 0 10px;
  color: ${OL.GREY02};
  width: 260px;
  background: ${OL.GREY09};
  border-style: inset;
  border: 1px solid ${OL.GREY04};
  margin: 0;

  :focus {
    outline: none;
    box-shadow: 0 0 10px ${OL.PURPLE05};
  }
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
