import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { StyledContentItalic } from '../utils/Layout';

const StyledContentBlock = styled.div`
  display: flex;
  flex-direction: ${props => (props.vertical ? 'column' : 'row')};
  margin-bottom: ${props => (props.vertical ? '20px' : '6px')};
`;

const StyledContentLabel = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
  margin-right: 6px;
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const StyledContent = styled.div`
  display: flex;
  font-size: 16px;
  margin-right: 40px;
`;


const ContentBlock = ({ contentBlock, vertical }) => {
  if (!contentBlock) {
    return null;
  }

  const label = vertical ? contentBlock.label : `${contentBlock.label}:`;

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
