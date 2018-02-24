/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

import { InlineCheckbox } from '../../utils/Layout';

type Props = {
  value :string,
  show :boolean,
  onChange :(event :Object) => void,
  checked :boolean,
  disabled :boolean
};

const ConditionalCheckbox = ({
  value,
  show,
  onChange,
  checked,
  disabled
} :Props) => {
  if (!show) return null;
  return (
    <InlineCheckbox
        name={value}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}>
      {value}
    </InlineCheckbox>
  );
};

export default ConditionalCheckbox;
