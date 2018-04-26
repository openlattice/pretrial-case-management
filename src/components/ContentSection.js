import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { StyledContentItalic } from '../utils/Layout';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-bottom: 20px;
  margin-right: 40px;
`;

const StyledContentBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSectionHeaderWrapper = styled.div`
  color: #727272;
  display: flex;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  text-transform: uppercase;
`;


const ContentSection = ({ title, width, ...props }) => {
  const renderContent = () => {
    if (props.children) {
      return props.children;
    }

    return <StyledContentItalic>Information not available</StyledContentItalic>;
  };

  return (
    <StyledSection width={width}>
      <StyledSectionHeaderWrapper>{title}</StyledSectionHeaderWrapper>
      <StyledContentBlockWrapper>
        { renderContent() }
      </StyledContentBlockWrapper>
    </StyledSection>
  );
};

ContentSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default ContentSection;
