/*
 * @flow
 */
/* stylelint-disable declaration-colon-newline-after */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

type Props = {
  onTabChosen :() => void;
  panes :object;
  selectedPane :number;
}

const NavTabHeaders = styled.ul`
  border: none;
  margin-bottom: 0;
  padding-left: 30px;
  list-style: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const NavTabHeader = styled.li`
  display: inline-block;
  width: max-content;
  height: 100%;
  margin-right: 40px;
  padding: 16px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  border-bottom: ${(props) => (props.active
    ? `solid 3px ${OL.PURPLE02}`
    : 'none')};
`;

const HeaderText = styled.a`
  color: ${OL.GREY02};
  border: none;
  :hover {
    text-decoration: none;
    border: none;
    cursor: pointer;
    color: ${OL.PURPLE02}
  }
  ${(props) => {
    if (props.active) {
      return (
        `color: ${OL.PURPLE02};
        border: none;
        background-color: transparent;
        font-size: 14px;
        font-weight: 600;`
      );
    }
    return '';
  }};
`;

const NavTabs = ({
  selectedPane,
  panes,
  onTabChosen
} :Props) => {
  const selected = selectedPane;
  const navTabs = panes.map((pane, index) => {
    const { title } = pane;
    const active = index === selected;
    return (
      <NavTabHeader
          active={active}
          key={pane.title}>
        <HeaderText
            active={active}
            onClick={() => onTabChosen(index)}>
          {title}
        </HeaderText>
      </NavTabHeader>
    );
  });

  return (
    <NavTabHeaders>
      {navTabs}
    </NavTabHeaders>
  );
};

export default NavTabs;
