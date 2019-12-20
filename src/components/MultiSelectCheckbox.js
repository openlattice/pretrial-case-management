/*
 * @flow
 */

import React, { Component } from 'react';
import styled from 'styled-components';

import downArrowIcon from '../assets/svg/down-arrow.svg';
import StyledCheckbox from './controls/StyledCheckbox';
import { OL } from '../utils/consts/Colors';

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
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

const SearchIcon = styled.div`
  align-self: center;
  color: ${OL.GREY20};
  position: absolute;
  margin: 0 20px;
  right: 0;
`;


const SearchButton = styled.button`
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY01};
  flex: 1 0 auto;
  font-size: 14px;
  letter-spacing: 0;
  text-align: left;
  padding: 0 45px 0 20px;
  outline: none;
  border: none;
  background-color: ${(props) => (props.transparent ? OL.GREY10 : OL.WHITE)};
`;

const DataTableWrapper = styled.div`
  background-color: ${OL.GREY16};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  position: absolute;
  z-index: 1;
  width: 100%;
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  margin: ${(props) => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${(props) => (props.openAbove ? '45px' : 'auto')};
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;
  padding: 20px;
  text-align: left;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export default class MultiSelectCheckbox extends Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      isVisibleDataTable: false
    };
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.closeDataTable, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeDataTable, false);
  }

  closeDataTable = (e) => {
    if (this.node.contains(e.target)) {
      return;
    }
    this.setState({ isVisibleDataTable: false });
  }

  toggleDataTable = (e) => {
    const { isVisibleDataTable } = this.state;
    e.stopPropagation();

    this.setState({
      isVisibleDataTable: !isVisibleDataTable
    });
  }

  handleOnSelect = (label :string) => {
    const { onSelect, options } = this.props;
    onSelect(options.get(label));
  }

  renderTable = () => {
    const { onChange, options, selected } = this.props;
    const tableOptions = options.map((option) => (
      <StyledCheckbox
          onChange={onChange}
          label={option.label}
          value={option.value}
          checked={selected.includes(option.value)} />
    ));
    return <SearchOptionContainer>{tableOptions}</SearchOptionContainer>;
  }

  render() {
    const {
      displayTitle,
      className,
      short,
      transparent,
      openAbove
    } = this.props;
    const { isVisibleDataTable } = this.state;
    return (
      <div ref={(node) => (this.node = node)}>
        <SearchableSelectWrapper
            isVisibleDataTable={isVisibleDataTable}
            className={className}>
          <SearchInputWrapper short={short}>
            <SearchButton
                transparent={transparent}
                onClick={this.toggleDataTable}>
              {displayTitle}
            </SearchButton>
            <SearchIcon>
              <img src={downArrowIcon} alt="" />
            </SearchIcon>
          </SearchInputWrapper>
          {
            !isVisibleDataTable
              ? null
              : (
                <DataTableWrapper
                    isVisible={isVisibleDataTable}
                    openAbove={openAbove}>
                  {this.renderTable()}
                </DataTableWrapper>
              )
          }
        </SearchableSelectWrapper>
      </div>
    );
  }

}
