/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import NavTabs from './NavTabs';
import { OL } from '../../utils/consts/Colors';


const UP_KEY = 38;
const DOWN_KEY = 40;

const NavTabsWrapper = styled.div`
  margin: 0 -15px;

  hr {
    width: 100%;
    height: 0;
    border: solid 1px ${OL.GREY28};
  }
`;

type Props = {
  panes :object
}


class Tabs extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedPane: 0
    };
  }

  selectTab = (num) => {
    this.setState({ selectedPane: num });
  }

  handleKeyDown = (e) => {
    const { selectedPane } = this.state;
    const { panes } = this.props;

    // arrow up/down button should select next/previous list element
    if (e.keyCode === UP_KEY && selectedPane > 0) {
      this.setState((prevState) => ({
        selectedPane: prevState.selectedPane - 1
      }));
    }
    else if (e.keyCode === DOWN_KEY && selectedPane < panes.length - 1) {
      this.setState((prevState) => ({
        selectedPane: prevState.selectedPane + 1
      }));
    }
  }

  render() {
    const { panes } = this.props;
    const { selectedPane } = this.state;
    const pane = panes[selectedPane];

    return (
      <NavTabsWrapper>
        <NavTabs
            selectedPane={selectedPane}
            onTabChosen={this.selectTab}
            panes={panes}
            handleKeyDown={this.handleKeyDown} />
        <hr />
        <div>
          <article>
            {pane.content()}
          </article>
        </div>
      </NavTabsWrapper>
    );
  }

}

export default Tabs;
