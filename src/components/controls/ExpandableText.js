/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import { OL } from '../../utils/consts/Colors';

const ExpandButton = styled(Button)`
  padding: 0;
  border: 0;
  margin: -4px 0 0 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: ${OL.PURPLE02};

  &:hover {
    text-decoration: underline;
    color: ${OL.PURPLE02};
  }

  &:focus {
    text-decoration: none;
    color: ${OL.PURPLE02};
    outline: none;
  }

  &:focus:active {
    outline: none;
  }
`;

type Props = {
  text :string,
  maxLength :number
};

type State = {
  isOpen :boolean
};

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
        <ExpandButton bsStyle="link" onClick={this.switchState}>{controlText}</ExpandButton>
      </div>
    );
  }

}
