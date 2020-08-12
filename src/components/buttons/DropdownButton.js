/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import downArrowIcon from '../../assets/svg/down-arrow.svg';
import selectedDownArrowIcon from '../../assets/svg/down-arrow-white.svg';
import BasicButton from './BasicButton';

type Props = {
  title :string,
  options :{ label :string, onClick :() => void }[],
  openAbove? :boolean
}

type State = {
  open :boolean
}

const DropdownButtonWrapper = styled.div`
  border: none;
  ${(props :Object) => {
    if (props.open) {
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

const BaseButton = styled(BasicButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 600;
  position: relative;

  img {
    margin-left: 10px;
  }

  background-color: ${(props) => (props.open ? OL.GREY02 : OL.GREY08)};
  color: ${(props) => (props.open ? OL.WHITE : OL.GREY02)};

  &:hover {
    background-color: ${(props) => (props.open ? OL.GREY02 : OL.GREY08)} !important;
    color: ${(props) => (props.open ? OL.WHITE : OL.GREY02)} !important;
  }
`;

const MenuContainer = styled.div`
  background-color: ${OL.GREY16};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  position: absolute;
  z-index: 1;
  min-width: max-content;
  max-width: 400px;
  visibility: ${(props :Object) => (props.open ? 'visible' : 'hidden')};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  top: ${(props :Object) => (props.openAbove ? 'auto' : '45px')};
  bottom: ${(props :Object) => (props.openAbove ? '45px' : 'auto')};
  right: ${(props :Object) => (props.openAbove ? 'auto' : '0')};;
  left: ${(props :Object) => (props.openAbove ? '0' : 'auto')};;
  overflow: visible;
  display: flex;
  flex-direction: column;

  button {
    width: 100%;
    padding: 15px 20px;
    text-transform: none;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY01};
    border: none;
    min-width: fit-content !important;

    &:hover {
      background-color: ${OL.GREY06};
    }
  }
`;

export default class DropdownButton extends React.Component<Props, State> {

  static defaultProps = {
    openAbove: false
  };

  constructor(props :Props) {
    super(props);
    this.state = {
      open: false
    };
  }

  openDropdown = (e) => {
    e.stopPropagation();
    this.setState({ open: true });
  };

  closeDropdown = (e) => {
    e.stopPropagation();
    this.setState({ open: false });
  };

  getOptionFn = (optionFn) => (e) => {
    e.stopPropagation();
    optionFn(e);
  }

  handleOnClick = (e) => {
    e.stopPropagation();
    this.setState({ open: false });
  }

  render() {
    const { title, options, openAbove } = this.props;
    const { open } = this.state;
    const imgSrc = open ? selectedDownArrowIcon : downArrowIcon;
    return (
      <DropdownButtonWrapper open={open}>
        <BaseButton open={open} onClick={this.openDropdown} onBlur={this.closeDropdown}>
          {title}
          <img src={imgSrc} alt="presentation" />
        </BaseButton>
        <MenuContainer open={open} openAbove={openAbove}>
          {options.map((option) => (
            <button
                type="button"
                key={option.label}
                onClick={this.handleOnClick}
                onMouseDown={option.onClick}>
              {option.label}
            </button>
          ))}
        </MenuContainer>
      </DropdownButtonWrapper>
    );
  }
}
