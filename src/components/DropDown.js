import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

class DropDownMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOpen: false,
    }
  }

  handleClickOutside() {
    this.setState({
      listOpen: false,
    })
  }

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render() {
    const { list } = this.props
    const { listOpen } = this.state
    return  (
      
    )
  }

}
