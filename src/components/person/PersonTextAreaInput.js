/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { FormControl } from 'react-bootstrap';

const TextArea = styled(FormControl).attrs({
  componentClass: 'textarea'
})`
  min-height: 150px;
`;

const InputContainer = styled.div`
  text-align: center;
  margin: 0 50px;
`;

const Error = styled.div`
  color: #ff3c5d;
  margin-top: 15px;
`;

type Person = {
  firstName :string,
  lastName :string
}

type Props = {
  onChange :(people :Person[]) => void
}

type State = {
  people :string,
  error :boolean
}

export default class PersonTextAreaInput extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      people: '',
      error: false
    };
  }

  onChange = (e) => {
    const people = e.target.value;
    let error = false;
    const peopleList = [];

    const peopleLines = people.trim().split('\n');
    peopleLines.forEach((personLine) => {
      const personFields = personLine.split(',');
      if (personFields.length !== 2) {
        error = true;
      }
      else {
        peopleList.push({
          lastName: personFields[0].trim().toLowerCase(),
          firstName: personFields[1].trim().toLowerCase()
        });
      }
    });

    this.setState({ people, error });
    if (!error) {
      this.props.onChange(peopleList);
    }
  }

  renderError = () => (this.state.error ? <Error>Improper format.</Error> : null)

  render() {
    return (
      <InputContainer>
        <TextArea placeholder="LastName,FirstName" value={this.state.people} onChange={this.onChange} />
        {this.renderError()}
      </InputContainer>
    );
  }
}
