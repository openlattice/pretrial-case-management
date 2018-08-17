/*
 * @flow
 */

import React, { Component } from 'react';
import styled from 'styled-components';

import downArrowIcon from '../assets/svg/down-arrow.svg';
import StyledCheckbox from './controls/StyledCheckbox';

/*
 * styled components
 */

const SearchableSelectWrapper = styled.div`
  border: none;
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
  height: ${props => (props.short ? '39px' : '45px')};
  position: relative;
`;

const SearchIcon = styled.div`
  align-self: center;
  color: #687F96;
  position: absolute;
  margin: 0 20px;
  right: 0
`;


const SearchButton = styled.button`
  font-family: 'Open Sans', sans-serif;
  color: #555e6f;
  flex: 1 0 auto;
  font-size: 14px;
  letter-spacing: 0;
  text-align: left;
  padding: 0 45px 0 20px;
  outline: none;
  border: none;
  background-color: ${props => (props.transparent ? '#f9f9fd' : '#ffffff')};
`;

const DataTableWrapper = styled.div`
  background-color: #fefefe;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  position: absolute;
  z-index: 1;
  width: 100%;
  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  margin: ${props => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${props => (props.openAbove ? '45px' : 'auto')};
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

    toggleDataTable = (e) => {
      e.stopPropagation();

      this.setState({
        isVisibleDataTable: !this.state.isVisibleDataTable
      });
    }

    handleOnSelect = (label :string) => {
      this.props.onSelect(this.props.options.get(label));
    }

  renderTable = () => {
    const tableOptions = this.props.options.map(option => (
      <StyledCheckbox
          onChange={this.props.onChange}
          label={option.label}
          value={option.value}
          checked={this.props.selected.includes(option.value)} />
    ));
    return <SearchOptionContainer>{tableOptions}</SearchOptionContainer>;
  }

  render() {
    const { displayTitle } = this.props;
    return (
      <SearchableSelectWrapper isVisibleDataTable={this.state.isVisibleDataTable} className={this.props.className}>
        <SearchInputWrapper short={this.props.short}>
          <SearchButton
              transparent={this.props.transparent}
              onClick={this.toggleDataTable}>
            {displayTitle}
          </SearchButton>
          <SearchIcon>
            <img src={downArrowIcon} alt="presentation" />
          </SearchIcon>
        </SearchInputWrapper>
        {
          !this.state.isVisibleDataTable
            ? null
            : (
              <DataTableWrapper
                  isVisible={this.state.isVisibleDataTable}
                  openAbove={this.props.openAbove} >
                {this.renderTable()}
              </DataTableWrapper>
            )
        }
      </SearchableSelectWrapper>
    );
  }

}
