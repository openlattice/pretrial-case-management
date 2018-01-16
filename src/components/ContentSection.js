import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ContentBlock from './ContentBlock';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const StyledSectionHeaderWrapper = styled.div`
  color: #727272;
  display: flex;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  text-transform: uppercase;
`;


const ContentSection = ({ title, vertical, content }) => {
  const renderContent = () => {
    return content.map((contentBlock) => {
      return (
        <ContentBlock
            contentBlock={contentBlock}
            vertical={vertical}
            key={contentBlock.label} />
      );
    });
  };

  return (
    <StyledSection>
      <StyledSectionHeaderWrapper>{title}</StyledSectionHeaderWrapper>
      { renderContent() }
    </StyledSection>
  );
};

ContentSection.defaultProps = {
  vertical: false
}

ContentSection.propTypes = {
  title: PropTypes.string.isRequired,
  vertical: PropTypes.bool,
  content: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ContentSection;
