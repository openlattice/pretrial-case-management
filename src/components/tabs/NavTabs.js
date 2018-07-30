/*
 * @flow
 */
import React from 'react';

type Props = {
  selectedPane :number,
  panes :object,
  onTabChosen :() => void,
  onKeyUp :() => void,
  onKeyDown :() => void,
}

const NavTabs = ({
  selectedPane,
  panes,
  onTabChosen,
  onKeyUp,
  onKeyDown
} :Props) => {
  const selected = selectedPane;
  const navTabs = panes.map((pane, index) => {
    const { title } = pane;
    const klass = index === selected ? 'active' : '';
    return (
      <li>
        <a
            key={index}
            className={klass}
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
