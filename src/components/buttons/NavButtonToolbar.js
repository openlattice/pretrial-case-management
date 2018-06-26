import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px
`;

const StyledNavButton = styled(NavLink).attrs({
  activeStyle: {
    'background-color': '#6124e2',
    color: '#ffffff',
    'text-decoration': 'none'
  }
})`
  display: flex;
  justify-content: center;
  border-top: 1px solid #ceced9;
  border-bottom: 1px solid #ceced9;
  border-right: 1px solid #ceced9;
  color: #8e929b;
  text-decoration: none;
  padding: 7px 20px;
  min-width: 130px;

  &:hover {
    color: #6124e2;
    background-color: #e4d8ff;
    text-decoration: none;
  }

  &:first-child {
    border-radius: 4px 0 0 4px;
    border-left: 1px solid #ceced9;
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
    { options.map(option => (
      <StyledNavButton to={option.path} name={option.path} key={option.path}>{option.label}</StyledNavButton>
    )) }
  </ToolbarWrapper>
);

export default NavButtonToolbar;
