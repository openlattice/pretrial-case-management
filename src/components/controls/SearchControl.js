/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

/*
 * styled components
 */

const SearchControlWrapper = styled.div`
  display: flex;
  position: relative;
`;

/*
 * types
 */

type Props = {
  className :string,
  placeholder :string,
  withButton :boolean,
  onChange :Function,
  onSubmit :Function
}

type State = {
  searchQuery :string
}

class SearchControl extends React.Component<Props, State> {

  static defaultProps = {
    className: '',
    placeholder: 'Search...',
    withButton: false,
    onChange: () => {},
    onSubmit: () => {}
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      searchQuery: ''
    };
  }

  handleOnChange = (event :SyntheticInputEvent<*>) => {

    this.setState({
      searchQuery: event.target.value
    });

    if (this.props.onChange) {
      this.props.onChange(event.target.value);
    }
  }

  handleOnClickSearch = () => {

    if (this.state.searchQuery) {
      this.props.onSubmit(this.state.searchQuery);
    }
  }

  handleOnKeyDown = (event :SyntheticKeyboardEvent<*>) => {

    switch (event.keyCode) {
      case 13: // 'Enter' key code
        if (this.state.searchQuery) {
          this.props.onSubmit(this.state.searchQuery);
        }
        break;
      default:
        break;
    }
  }

  render() {

    return (
      <SearchControlWrapper className={this.props.className}>
        {
          this.props.withButton
            ? (
              <InputGroup>
                <FormControl
                    type="text"
                    placeholder={this.props.placeholder}
                    value={this.state.searchQuery}
                    onChange={this.handleOnChange}
                    onKeyDown={this.handleOnKeyDown} />
                <InputGroup.Button>
                  <Button type="submit" onClick={this.handleOnClickSearch}>Search</Button>
                </InputGroup.Button>
              </InputGroup>
            )
            : (
              <FormControl
                  type="text"
                  placeholder={this.props.placeholder}
                  value={this.state.searchQuery}
                  onChange={this.handleOnChange}
                  onKeyDown={this.handleOnKeyDown} />
            )
        }
      </SearchControlWrapper>
    );
  }
}

export default SearchControl;
