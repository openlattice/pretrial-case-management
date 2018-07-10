/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Col, FormControl } from 'react-bootstrap';

import StyledDatePicker from '../controls/StyledDatePicker';
import StyledInput from '../controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import { UnpaddedRow, TitleLabel } from '../../utils/Layout';

const SearchRow = styled(UnpaddedRow)`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 10px;
  width: 100%;
`;

const StyledTitleLabel = styled(TitleLabel)`
  margin-bottom: 20px;
`;

type Props = {
  handleSubmit :(firstName :string, lastName :string, dob :string) => void,
};

type State = {
  firstName :string,
  lastName :string,
  dob :string
}

export default class PersonSearchFields extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      dob: ''
    };
  }

  handleSubmit = () => {
    const { firstName, lastName, dob } = this.state;
    this.props.handleSubmit(firstName, lastName, dob);
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
        <Col lg={3}>
          <StyledTitleLabel>Last name</StyledTitleLabel>
          <StyledInput name="lastName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={lastName} />
        </Col>
        <Col lg={3}>
          <StyledTitleLabel>First name</StyledTitleLabel>
          <StyledInput name="firstName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={firstName} />
        </Col>
        <Col lg={3}>
          <StyledTitleLabel>Date of birth</StyledTitleLabel>
          <StyledDatePicker onKeyPress={this.handleKeyPress} name="dob" onChange={this.onDobChange} value={dob} />
        </Col>
        <InfoButton onClick={this.handleSubmit}>Search</InfoButton>
      </SearchRow>
    );
  }
}
