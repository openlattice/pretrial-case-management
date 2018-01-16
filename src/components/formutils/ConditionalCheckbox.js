import React from 'react';
import styled from 'styled-components';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { InlineCheckbox } from '../../utils/Layout';


const ConditionalCheckbox = ({ value, show, onChange, checked, disabled }) => {
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

ConditionalCheckbox.propTypes = {
  value: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default ConditionalCheckbox;
