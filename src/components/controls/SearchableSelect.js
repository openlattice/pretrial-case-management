/*
 * @flow
 */

import React from 'react';

import FontAwesome from 'react-fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Immutable from 'immutable';
import styled, { css } from 'styled-components';
import { faSearch } from '@fortawesome/fontawesome-pro-regular';

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
  ${(props) => {
    if (props.isVisibleDataTable) {
      return css`
        box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.15);
      `;
    }
    return '';
  }}
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  height: ${props => (props.short ? '34px' : '45px')};
  position: relative;
`;

const SearchInput = styled.input`
  border: 1px solid #dcdce7;
  border-radius: 3px;
  color: #135;
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 24px;
  outline: none;
  padding: 0 20px 0 45px;
  background-color: ${props => (props.transparent ? '#f9f9fd' : '#ffffff')};
  &:focus {
    border-color: #6124e2;
  }
  &::placeholder {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #8e929b;
  }
`;

const SearchIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  margin: 0 20px;
`;

const CloseIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  right: 13px;

  &:hover {
    cursor: pointer;
  }
`;

const DataTableWrapper = styled.div`
  background-color: #fefefe;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  position: relative;
  width: 100%;
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
`;

const SearchOption = styled.div`
  padding: 10px;

  &:hover {
    background-color: #f0f0f7;
    cursor: pointer;
  }

  &:active {
    background-color: #e4d8ff;
  }
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;
`;

/*
 * types
 */

type Props = {
  options :Map<*, *>,
  className :string,
  maxHeight :number,
  searchPlaceholder :string,
  onSelect :Function,
  short :?boolean,
  value :?string,
  onClear? :?() => void,
  transparent? :boolean
}

type State = {
  filteredTypes :List<string>,
  isVisibleDataTable :boolean,
  searchQuery :string
}

class SearchableSelect extends React.Component<Props, State> {

  static defaultProps = {
    options: Immutable.List(),
    className: '',
    maxHeight: -1,
    searchPlaceholder: 'Search...',
    onSelect: () => {},
    short: false,
    value: '',
    transparent: false
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      filteredTypes: props.options.keySeq(),
      isVisibleDataTable: false,
      searchQuery: ''
    };
  }

  componentWillReceiveProps(nextProps :Props) {

    this.setState({
      filteredTypes: nextProps.options.keySeq(),
      searchQuery: ''
    });
  }

  hideDataTable = () => {

    this.setState({
      isVisibleDataTable: false,
      searchQuery: ''
    });
  }

  showDataTable = () => {

    this.setState({
      isVisibleDataTable: true,
      searchQuery: ''
    });
  }

  handleOnSelect = (label :string) => {

    this.props.onSelect(this.props.options.get(label));
    this.setState({
      searchQuery: ''
    });
  }

  filterResults = (value :string) =>
    this.props.options.filter((obj, label) => label.toLowerCase().includes(value.toLowerCase()))

  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {

    this.setState({
      filteredTypes: this.filterResults(event.target.value).keySeq(),
      searchQuery: event.target.value
    });
  }

  renderTable = () => {
    const options = this.state.filteredTypes.map(type => (
      <SearchOption
          key={type}
          onMouseDown={() => this.handleOnSelect(type)}>
        {type}
      </SearchOption>
    ));
    return <SearchOptionContainer>{options}</SearchOptionContainer>;
  }

  render() {
    const value = this.state.isVisibleDataTable ? this.state.searchQuery : this.props.value;

    return (
      <SearchableSelectWrapper isVisibleDataTable={this.state.isVisibleDataTable} className={this.props.className}>
        <SearchInputWrapper short={this.props.short}>
          <SearchIcon>
            <FontAwesomeIcon icon={faSearch} transform={{ size: 13 }} />
          </SearchIcon>
          <SearchInput
              type="text"
              placeholder={this.props.searchPlaceholder}
              transparent={this.props.transparent}
              value={value}
              onBlur={this.hideDataTable}
              onChange={this.handleOnChangeSearchQuery}
              onFocus={this.showDataTable} />
          {
            !this.props.onClear
              ? null
              : (
                <CloseIcon onClick={this.props.onClear}>
                  <FontAwesome name="close" />
                </CloseIcon>
              )
          }
        </SearchInputWrapper>
        {
          !this.state.isVisibleDataTable
            ? null
            : (
              <DataTableWrapper isVisible={this.state.isVisibleDataTable}>
                {this.renderTable()}
              </DataTableWrapper>
            )
        }
      </SearchableSelectWrapper>
    );
  }
}

export default SearchableSelect;
