/*
 * @flow
 */

import React from 'react';

import ButtonText from '../buttons/ButtonText';

export default class ExpandableText extends React.Component<Props, State> {

  constructor(props :Props) {
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
      <div>
        {displayText}
        <ButtonText bsStyle="link" onClick={this.switchState}>{controlText}</ButtonText>
      </div>
    );
  }

}
