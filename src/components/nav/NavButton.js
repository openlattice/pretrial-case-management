/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    color: OL.PURPLE02,
    borderBottom: `3px solid ${OL.PURPLE02}`
  }
})`
  width: auto;
  height: auto;
  padding: 0 10px 10px 0;
  margin-bottom: -13px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: normal;
  color: ${OL.GREY02};
  display: flex;
  align-items: center;


  &:hover {
    color: ${OL.PURPLE02};
    text-decoration: none;

    svg {
      g {
        fill: ${OL.PURPLE02};
      }
    }
  }

  &:active {
    color: ${OL.PURPLE01};

    svg {
      g {
        fill: ${OL.PURPLE01};
      }
    }
  }

  &:focus {
    outline: none;
    text-decoration: none;
    svg {
      g {
        fill: ${OL.PURPLE02};
      }
    }

  }
`;

const StyledIcon = styled.div`
  margin-right: 10px;
  height: 16px;
  width: 16px;
  display: inline-block;
`;

const NavButton = ({
  path,
  defaultIcon,
  selectedIcon,
  label
} :Props) => {
  const url = window.location.hash.includes(path) ? selectedIcon : defaultIcon;
  const ButtonWrapper = styled(StyledNavLink).attrs({
    to: path,
    name: path
  })`
    div {
      background: url("${url}");
    }
    &:hover {
      div {
        background: url("${selectedIcon}");
      }
    }
  `;

  return (
    <ButtonWrapper to={path} name={path}>
      <StyledIcon />
      <span>{label}</span>
    </ButtonWrapper>
  );
};

export default NavButton;
