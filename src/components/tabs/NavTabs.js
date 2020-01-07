/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

type Props = {
  onTabChosen :() => void;
  panes :object;
  selectedPane :number;
}

const HeaderText = styled.a`
  border: none;
  color: ${OL.GREY02};

  :hover {
    border: none;
    color: ${OL.PURPLE02};
    cursor: pointer;
    text-decoration: none;
  }

  ${(props) => {
    if (props.active) {
      return (
        `
          background-color: transparent;
          border: none;
          color: ${OL.PURPLE02};
          font-size: 14px;
          font-weight: 600;
          `
      );
    }
    return '';
  }};
`;

const NavTabHeader = styled.li`
  border-bottom: ${(props) => (props.active ? `solid 3px ${OL.PURPLE02}` : 'none')};
  display: inline-block;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  height: 100%;
  margin-right: 40px;
  padding: 16px 0;
  width: max-content;
`;

const NavTabHeaders = styled.ul`
  align-items: center;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  list-style: none;
  margin-bottom: 0;
  padding-left: 30px;
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
