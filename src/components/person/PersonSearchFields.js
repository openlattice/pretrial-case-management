/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Button, DatePicker, Input } from 'lattice-ui-kit';

import { TitleLabel } from '../../utils/Layout';

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const SearchRow = styled.div`
  display: grid;
  box-sizing: border-box;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  grid-gap: 30px;
  width: 100%;
`;

const StyledTitleLabel = styled(TitleLabel)`
  margin-bottom: 20px;
`;

type Props = {
  dob :string,
  firstName :string,
  handleSubmit :(value :{firstName :string, lastName :string, dob :string}) => void,
  includePSAInfo :boolean,
  lastName :string
};

type State = {
  dob :string,
  firstName :string,
  lastName :string
}

export default class PersonSearchFields extends React.Component<Props, State> {

  constructor(props :Props) {
    const dob = props.dob ? props.dob : '';
    const firstName = props.firstName ? props.firstName : '';
    const lastName = props.lastName ? props.lastName : '';
    super(props);
    this.state = {
      dob,
      firstName,
      lastName
    };
  }

  handleSubmit = () => {
    const { handleSubmit, includePSAInfo } = this.props;
    const { firstName, lastName, dob } = this.state;
    handleSubmit({
      dob,
      firstName,
      includePSAInfo,
      lastName
    });
  }

  handleKeyPress = (e :KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  onChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
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
          <Input name="lastName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={lastName} />
        </GridItem>
        <GridItem>
          <StyledTitleLabel>First name</StyledTitleLabel>
          <Input name="firstName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={firstName} />
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
          <Button color="primary" onClick={this.handleSubmit}>Search</Button>
        </GridItem>
      </SearchRow>
    );
  }
}
