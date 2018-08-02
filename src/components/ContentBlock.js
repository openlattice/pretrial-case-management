import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { StyledContentItalic } from '../utils/Layout';

const StyledContentBlock = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const StyledContentLabel = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  text-transform: uppercase;
  color: #8e929b;
  ${(props) => {
    switch (props.component) {
      case 'summary':
        return (
          'font-size: 11px;'
        );
      case 'FormContainer':
        return (
          'font-size: 11px;'
        );
      case 'DMF-STEP1':
        return (
          'font-size: 11px;'
        );
      default:
        return (
          'font-size: 12px;'
        );
    }
  }};
`;

const StyledContentWrapper = styled.div`
`;

const StyledContent = styled.div`
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: #2e2e34;
  ${(props) => {
    switch (props.component) {
      case 'summary':
        return (
          'font-size: 14px;'
        );
      case 'FormContainer':
        return (
          'font-size: 14px;'
        );
      case 'DMF-STEP1':
        return (
          'font-size: 16px;'
        );
      default:
        return (
          'font-size: 18px;'
        );
    }
  }};
`;


const ContentBlock = ({ contentBlock, component }) => {
  if (!contentBlock) {
    return null;
  }

  const { label } = contentBlock;

  const renderContent = () => {
    if (!contentBlock.content.length) {
      return <StyledContentItalic>None</StyledContentItalic>;
    }

    return (
      contentBlock.content.map((line, i) => (
        <StyledContent
            key={`${line}-${i}`}
            component={component} >
          {line}
        </StyledContent>
      ))
    );
  };

  return (
    <StyledContentBlock>
      <StyledContentLabel
          component={component}>
        {label}
      </StyledContentLabel>
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
