/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled, { css } from 'styled-components';
import { faTimes } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';
import downArrowIcon from '../../assets/svg/down-arrow.svg';

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
  height: ${(props) => (props.short ? '39px' : '45px')};
  position: relative;
`;

const inputStyle = `
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.BLUE03};
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  outline: none;
  padding: 0 45px 0 20px;
  &:focus {
    border-color: ${OL.PURPLE02};
  }
  &::placeholder {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY02};
  }
`;

const SearchInput = styled.input.attrs({
  type: 'text'
})`
  ${inputStyle}
  background-color: ${(props) => (props.transparent ? OL.GREY10 : OL.WHITE)};
`;

const SearchIcon = styled.div`
  align-self: center;
  color: ${OL.GREY20};
  position: absolute;
  margin: 0 20px;
  right: 0;
`;


const SearchButton = styled.button`
  ${inputStyle}
  text-align: left;
  background-color: ${(props) => (props.transparent ? OL.GREY10 : OL.WHITE)};
`;

const CloseIcon = styled.div`
  align-self: center;
  color: ${OL.GREY20};
  position: absolute;
  right: 20px;

  &:hover {
    cursor: pointer;
  }
`;

const DataTableWrapper = styled.div`
  background-color: ${OL.GREY16};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  position: absolute;
  z-index: 1;
  width: 100%;
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  margin: ${(props) => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${(props) => (props.openAbove ? '45px' : 'auto')};
`;

const SearchOption = styled.div`
  padding: 10px 20px;

  &:hover {
    background-color: ${OL.GREY08};
    cursor: pointer;
  }

  &:active {
    background-color: ${OL.PURPLE06};
  }
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => (props.scrollVisible ? OL.GREY03 : 'transparent')};
    border-radius: ${(props) => (props.scrollVisible ? 3 : 0)}px;
  }

  &::-webkit-scrollbar {
    width: ${(props) => (props.scrollVisible ? 10 : 0)}px;
    display: ${(props) => (props.scrollVisible ? 'initial' : 'none')};
  }
`;

/*
 * types
 */

type Props = {
  options :Map<*, *>,
  className? :string,
  searchPlaceholder :string,
  onSelect :Function,
  short :?boolean,
  value :?string,
  onClear :() => void,
  transparent? :boolean,
  openAbove? :boolean,
  selectOnly? :boolean,
  scrollVisible? :boolean,
  disabled? :boolean
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
    searchPlaceholder: 'Search...',
    onSelect: () => {},
    short: false,
    value: '',
    transparent: false,
    openAbove: false,
    selectOnly: false,
    scrollVisible: false,
    disabled: false,
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      filteredTypes: props.options.keySeq(),
      isVisibleDataTable: false,
      searchQuery: ''
    };
  }

  componentDidUpdate() {
    const { options } = this.props;
    this.setState({
      filteredTypes: options.keySeq(),
      searchQuery: ''
    });
  }

  hideDataTable = () => {
    const { options } = this.props;

    this.setState({
      filteredTypes: options.keySeq(),
      isVisibleDataTable: false,
      searchQuery: ''
    });
  }

  showDataTable = (e) => {
    e.stopPropagation();

    this.setState({
      isVisibleDataTable: true,
      searchQuery: ''
    });
  }

  handleOnSelect = (label :string) => {
    const { onSelect, options } = this.props;
    onSelect(options.get(label));
    this.setState({
      searchQuery: ''
    });
  }

  filterResults = (value :string) => {
    const { options } = this.props;
    return options.filter((obj, label) => label.toLowerCase().includes(value.toLowerCase()));
  }
  handleOnChangeSearchQuery = (event :SyntheticInputEvent<*>) => {

    this.setState({
      filteredTypes: this.filterResults(event.target.value).keySeq(),
      searchQuery: event.target.value
    });
  }

  renderTable = () => {
    const { scrollVisible } = this.props;
    const { filteredTypes } = this.state;
    const options = filteredTypes.map((type) => (
      <SearchOption
          key={type}
          onMouseDown={() => this.handleOnSelect(type)}>
        {type}
      </SearchOption>
    ));
    return <SearchOptionContainer scrollVisible={scrollVisible}>{options}</SearchOptionContainer>;
  }

  render() {
    const { isVisibleDataTable, searchQuery } = this.state;
    let { value } = this.props;
    const {
      className,
      disabled,
      onClear,
      openAbove,
      searchPlaceholder,
      selectOnly,
      short,
      transparent
    } = this.props;
    value = isVisibleDataTable ? searchQuery : value;

    return (
      <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} className={className}>
        <SearchInputWrapper short={short}>
          {
            selectOnly ? (
              <SearchButton
                  disabled={disabled}
                  transparent={transparent}
                  onBlur={this.hideDataTable}
                  onChange={this.handleOnChangeSearchQuery}
                  onClick={this.showDataTable}>
                {value || searchPlaceholder}
              </SearchButton>
            ) : (
              <SearchInput
                  placeholder={searchPlaceholder}
                  disabled={disabled}
                  transparent={transparent}
                  value={value}
                  onBlur={this.hideDataTable}
                  onFocus={this.showDataTable}
                  onChange={this.handleOnChangeSearchQuery}
                  onClick={this.showDataTable} />
            )
          }
          {
            (onClear && value) ? null : (
              <SearchIcon floatRight={selectOnly}>
                <img src={downArrowIcon} alt="" />
              </SearchIcon>
            )
          }
          {
            !onClear || !value
              ? null
              : (
                <CloseIcon onClick={onClear}>
                  <FontAwesomeIcon icon={faTimes} />
                </CloseIcon>
              )
          }
        </SearchInputWrapper>
        {
          !isVisibleDataTable
            ? null
            : (
              <DataTableWrapper isVisible={isVisibleDataTable} openAbove={openAbove}>
                {this.renderTable()}
              </DataTableWrapper>
            )
        }
      </SearchableSelectWrapper>
    );
  }
}

export default SearchableSelect;
