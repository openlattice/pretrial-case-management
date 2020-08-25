/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
  background: white;
`;

const StyledNavButton = styled(NavLink).attrs({
  activeStyle: {
    backgroundColor: OL.PURPLE02,
    color: OL.WHITE,
    textDecoration: 'none'
  }
})`
  display: flex;
  justify-content: center;
  border-top: 1px solid ${OL.GREY13};
  border-bottom: 1px solid ${OL.GREY13};
  border-right: 1px solid ${OL.GREY13};
  color: ${OL.GREY02};
  text-decoration: none;
  padding: 7px 20px;
  min-width: 130px;

  &:hover {
    color: ${OL.PURPLE02};
    background-color: ${OL.PURPLE06};
    text-decoration: none;
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
    border-left: 1px solid ${OL.GREY13};
  }

  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

type SearchOption = {
  path :string,
  label :string
};

const NavButtonToolbar = ({ options } :{ options :SearchOption[] }) => (
  <ToolbarWrapper>
    { options.map((option) => (
      <StyledNavButton to={option.path} name={option.path} key={option.path}>{option.label}</StyledNavButton>
    )) }
  </ToolbarWrapper>
);

export default NavButtonToolbar;
