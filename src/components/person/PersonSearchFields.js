/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import DatePicker from 'react-bootstrap-date-picker';
import { Col, FormControl } from 'react-bootstrap';

import StyledButton from '../buttons/StyledButton';
import { PaddedRow, TitleLabel } from '../../utils/Layout';

const SearchRow = styled(PaddedRow)`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 10px;
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
      <div>
        <SearchRow>
          <Col lg={3}>
            <TitleLabel>Last Name</TitleLabel>
            <FormControl name="lastName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={lastName} />
          </Col>
          <Col lg={3}>
            <TitleLabel>First Name</TitleLabel>
            <FormControl name="firstName" onKeyPress={this.handleKeyPress} onChange={this.onChange} value={firstName} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Date of Birth</TitleLabel>
            <DatePicker name="dob" onChange={this.onDobChange} value={dob} />
          </Col>
          <StyledButton onClick={this.handleSubmit}>Filter</StyledButton>
        </SearchRow>
      </div>
    );
  }
}
