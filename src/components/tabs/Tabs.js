/*
 * @flow
 */
import React from 'react';

import NavTabs from './NavTabs';

type Props = {
  panes :object
}


class Tabs extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedPane: 0
    };
    this.selectTab = this.selectTab.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  selectTab(num) {
    this.setState({ selectedPane: num });
  }

  handleKeyDown(e) {
    const { selectedPane } = this.state;
    const { panes } = this.props;

    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && selectedPane > 0) {
      this.setState(prevState => ({
        selectedPane: prevState.selectedPane - 1
      }));
    }
    else if (e.keyCode === 40 && selectedPane < panes.length - 1) {
      this.setState(prevState => ({
        selectedPane: prevState.selectedPane + 1
      }));
    }
  }

  render() {
    const pane = this.props.panes[this.state.selectedPane];

    return (
      <div>
        <div className="tabs">
          <NavTabs
              selectedPane={this.state.selectedPane}
              onTabChosen={this.selectTab}
              panes={this.props.panes}
              handleKeyDown={this.handleKeyDown} />
          <hr />
          <div className="tab-content">
            <article>
              {pane.content()}
            </article>
          </div>
        </div>
      </div>
    );
  }

}

export default Tabs;
