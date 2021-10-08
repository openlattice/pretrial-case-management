import React from 'react';
import styled from 'styled-components';

import ButtonText from '../buttons/ButtonText';

const DisplayText = styled.div`
  white-space: ${(props) => (props.isOpen ? 'pre-wrap' : 'normal')};
`;

const ExpandableTextWrapper = styled.div`
  display: ${(props) => (props.isOpen ? 'block' : 'inline-block')};
`;

export default class ExpandableText extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  switchState = () => {
    const { isOpen } = this.state;
    this.setState({ isOpen: !isOpen });
  }

  render() {
    const { text, maxLength } = this.props;
    if (text.length <= maxLength) {
      return (<div>{text}</div>);
    }

    const { isOpen } = this.state;
    let controlText;
    let displayText;
    if (isOpen) {
      controlText = 'Read less';
      displayText = text;
    }
    else {
      controlText = 'Read more';
      displayText = `${text.substring(0, maxLength)}...`;
    }

    return (
      <ExpandableTextWrapper isOpen={isOpen}>
        <DisplayText isOpen={isOpen}>{displayText}</DisplayText>
        <ButtonText onClick={this.switchState}>{controlText}</ButtonText>
      </ExpandableTextWrapper>
    );
  }

}
