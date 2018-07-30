/*
 * @flow
 */
import React from 'react';

type Props = {
  selectedPane :number,
  panes :object,
  onTabChosen :() => void,
  handleKeyDown :() => void,
}

const NavTabs = ({
  selectedPane,
  panes,
  onTabChosen,
  handleKeyDown
} :Props) => {
  const selected = selectedPane;
  const navTabs = panes.map((pane, index) => {
    const { title } = pane;
    const className = index === selected ? 'active' : '';
    return (
      <li
          className={className}
          key={`${pane.title}-${index}`} >
        <a
            alt=""
            className="tab-header"
            onClick={() => onTabChosen(index)} >
          {title}
        </a>
      </li>
    );
  });

  return (
    <ul className="nav-tabs">
      {navTabs}
    </ul>
  );
};

export default NavTabs;
