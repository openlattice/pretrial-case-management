/*
 * @flow
 */

import React from 'react';
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

type Props = {
  title :string,
  vertical? :boolean,
  content :{
    label :string,
    content :{
      line :string
    }[]
  }[]
};

const ContentSection = ({ title, vertical, content } :Props) => {
  const renderContent = () => content.map(contentBlock => (
    <ContentBlock
        contentBlock={contentBlock}
        vertical={vertical}
        key={contentBlock.label} />
  ));

  return (
    <StyledSection>
      <StyledSectionHeaderWrapper>{title}</StyledSectionHeaderWrapper>
      { renderContent() }
    </StyledSection>
  );
};

ContentSection.defaultProps = {
  vertical: false
};

export default ContentSection;
