/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DatePicker from '../datetime/DatePicker';
import StyledInput from '../controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import { TitleLabel } from '../../utils/Layout';

const SearchRow = styled.div`
  width: 100%;
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  grid-gap: 30px;
  padding: 0 30px;
`;

const GridItem = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
`;

const StyledTitleLabel = styled(TitleLabel)`
  margin-bottom: 20px;
`;

type Props = {
  firstName :string,
  lastName :string,
  dob :string,
  includePSAInfo :boolean,
  handleSubmit :(value :{firstName :string, lastName :string, dob :string}) => void,
};

type State = {
  firstName :string,
  lastName :string,
  dob :string
}

export default class PersonSearchFields extends React.Component<Props, State> {

  constructor(props :Props) {
    const firstName = props.firstName ? props.firstName : '';
    const lastName = props.lastName ? props.lastName : '';
    const dob = props.dob ? props.dob : '';
    super(props);
    this.state = {
      firstName,
      lastName,
      dob
    };
  }

  handleSubmit = () => {
    const { handleSubmit, includePSAInfo } = this.props;
    const { firstName, lastName, dob } = this.state;
    handleSubmit({
      firstName,
      lastName,
      dob,
      includePSAInfo
    });
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  onDobChange = (dob :string) => {
    this.setState({ dob });
  }

  render() {
    const { firstName, lastName, dob } = this.state;
    return (
      <SearchRow>
        <GridItem>
          <StyledTitleLabel>Last name</StyledTitleLabel>
          <StyledInput name="lastName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={lastName} />
        </GridItem>
        <GridItem>
          <StyledTitleLabel>First name</StyledTitleLabel>
          <StyledInput name="firstName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={firstName} />
        </GridItem>
        <GridItem>
          <StyledTitleLabel>Date of birth</StyledTitleLabel>
          <DatePicker
              onKeyPress={this.handleKeyPress}
              name="dob"
              onChange={this.onDobChange}
              value={dob} />
        </GridItem>
        <GridItem>
          <InfoButton onClick={this.handleSubmit}>Search</InfoButton>
        </GridItem>
      </SearchRow>
    );
  }
}
