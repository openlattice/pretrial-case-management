import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { StyledContentItalic } from '../utils/Layout';

const StyledContentBlock = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-bottom: 20px;
`;

const StyledContentLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #8e929b;
`;

const StyledContentWrapper = styled.div`
`;

const StyledContent = styled.div`
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  font-weight: normal;
  color: #2e2e34;
`;


const ContentBlock = ({ contentBlock, vertical }) => {
  if (!contentBlock) {
    return null;
  }

  const { label } = contentBlock;

  const renderContent = () => {
    if (!contentBlock.content.length) {
      return <StyledContentItalic>None</StyledContentItalic>;
    }

    return contentBlock.content.map((line, i) => <StyledContent key={`${line}-${i}`}>{line}</StyledContent>);
  };

  return (
    <StyledContentBlock vertical={vertical}>
      <StyledContentLabel>{label}</StyledContentLabel>
      <StyledContentWrapper>
        { renderContent() }
      </StyledContentWrapper>
    </StyledContentBlock>
  );
};

ContentBlock.defaultProps = {
  vertical: false
};

ContentBlock.propTypes = {
  contentBlock: PropTypes.shape({
    label: PropTypes.string.isRequired,
    content: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    ).isRequired
  }).isRequired,
  vertical: PropTypes.bool
};

export default ContentBlock;
