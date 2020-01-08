/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';

const StyledIcon = styled.div`
  display: inline-block;
  height: 16px;
  margin-right: 10px;
  width: 16px;
`;

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    color: OL.PURPLE02,
    borderBottom: `3px solid ${OL.PURPLE02}`
  }
})`
  align-items: center;
  color: ${OL.GREY02};
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: normal;
  height: auto;
  margin-bottom: -13px;
  padding: 0 10px 10px 0;
  width: auto;

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
