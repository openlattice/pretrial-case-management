/*
 * @flow
 */
import React from 'react';
import styled, { css } from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const getBorder :any = (props :Object) => (props.active
  ? (
    css`
      border-bottom: solid 3px ${OL.PURPLE02};
    `
  ) : ''
);

const getHeaderStyles :any = (props :Object) => (props.active
  ? (
    css`
      color: ${OL.PURPLE02};
      border: none;
      background-color: transparent;
      font-size: 14px;
      font-weight: 600;
      `
  )
  : ''
);

type Props = {
  onTabChosen :(index :number) => void;
  panes :Object;
  selectedPane :number;
}

const NavTabHeaders = styled.ul`
  align-items: center;
  background: white;
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  list-style: none;
  margin-bottom: 0;
  padding-left: 30px;
`;

const NavTabHeader = styled.li`
  display: inline-block;
  font-size: 14px;
  height: 100%;
  margin-right: 40px;
  padding: 16px 0;
  width: max-content;

  ${getBorder};
`;

const HeaderText = styled.a`
  color: ${OL.GREY02};

  :hover {
    border: none;
    color: ${OL.PURPLE02};
    cursor: pointer;
    text-decoration: none;
  }

  ${getHeaderStyles};
`;

const NavTabs = ({
  onTabChosen,
  panes,
  selectedPane
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
