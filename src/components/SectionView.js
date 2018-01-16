/*
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const SectionWrapper = styled.div`
  padding: 40px 0;
  border-bottom: 1px solid lightgray;
`;

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  color: #37454A;
  font-weight: bold;
`;

const SectionView = ({ header, ...props }) => {
  return (
    <SectionWrapper>
      <Header>{header}</Header>
      <div>{props.children}</div>
    </SectionWrapper>
  );
};

SectionView.propTypes = {
	header: PropTypes.string.isRequired
};

export default SectionView;
