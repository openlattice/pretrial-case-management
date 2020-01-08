/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import StyledInput from './controls/StyledInput';
import InfoButton from './buttons/InfoButton';
import { OL } from '../utils/consts/Colors';

const SearchBar = styled(StyledInput)`
  background: ${OL.GREY09};
  border-style: inset;
  border: 1px solid ${OL.GREY04};
  color: ${OL.GREY02};
  font-size: 12px;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  width: 260px;

  :focus {
    box-shadow: 0 0 10px ${OL.PURPLE05};
    outline: none;
  }
`;


const SearchRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(auto-fill);
  width: 100%;
`;

const SubmitButton = styled(InfoButton)`
  height: 36px;
  padding: 0 10px;
  width: 80px;
`;

type Props = {
  handleSubmit :(value :{firstName :string, lastName :string, dob :string}) => void,
};

type State = {
  searchTerm :string;
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

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  onChange = (e) => {
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
