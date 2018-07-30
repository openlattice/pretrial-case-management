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
  }

  selectTab(num) {
    this.setState({ selectedPane: num });
  }

  onKeyUp() {
    const { selectedPane } = this.state;
    if (selectedPane > 0) {
      this.setState({
        selectedPane: (selectedPane - 1)
      });
    }
  }

  onDownUp() {
    const panesCount = this.props.panes.count;
    const { selectedPane } = this.state;
    if (selectedPane < panesCount - 1) {
      this.setState({
        selectedPane: (selectedPane + 1)
      });
    }
  }

  render() {
    const pane = this.props.panes[this.state.selectedPane];
    console.log(this.props.panes);
    return (
      <div>
        <div className='tabs'>
          <NavTabs
              selectedPane={this.state.selectedPane}
              onTabChosen={this.selectTab}
              onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp}
              panes={this.props.panes} />
          <div className='tab-content'>
            <article>
              {pane.content()}
            </article>
          </div>
        </div>
      </div>
    );
  }

};

export default Tabs;
