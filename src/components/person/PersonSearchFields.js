/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Col } from 'react-bootstrap';

import DatePicker from '../datetime/DatePicker';
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
  firstName :string,
  lastName :string,
  dob :string,
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
    const { handleSubmit } = this.props;
    const { firstName, lastName, dob } = this.state;
    handleSubmit({ firstName, lastName, dob });
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
          <DatePicker
              onKeyPress={this.handleKeyPress}
              name="dob"
              onChange={this.onDobChange}
              value={dob} />
        </Col>
        <Col lg={3}>
          <InfoButton onClick={this.handleSubmit}>Search</InfoButton>
        </Col>
      </SearchRow>
    );
  }
}
