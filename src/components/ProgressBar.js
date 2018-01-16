import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ProgressBar } from 'react-bootstrap';

const Bar = styled(ProgressBar)`
  background: white;
  width: 100%;
`;

const FormProgressBar = ({ progress }) => {
  return (
    <Bar bsStyle="info" now={progress.num} label={progress.percentage} />
  );
};

FormProgressBar.propTypes = {
  progress: PropTypes.shape({
    num: PropTypes.number.isRequired,
    percentage: PropTypes.string.isRequired
  }).isRequired
};

export default FormProgressBar;
