import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 55px;
`;

const StyledHeader = styled.div`
  font-size: 24px;
  margin-bottom: 18px;
`;

const DashboardMainSection = props => (
  <StyledSectionWrapper>
    <StyledHeader>{props.header}</StyledHeader>
    {props.children}
  </StyledSectionWrapper>
);

DashboardMainSection.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.string.isRequired
};

export default DashboardMainSection;
