/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import CONTENT_CONSTS from '../utils/consts/ContentConsts';
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
  font-size: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.PROFILE:
        return (
          '12px;'
        );
      default:
        return (
          '11px;'
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
  font-size: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.DMF:
        return (
          '16px;'
        );
      case CONTENT_CONSTS.PROFILE:
        return (
          '18px;'
        );
      default:
        return (
          '14px;'
        );
    }
  }};
`;


const ContentBlock = ({ contentBlock, component } :Props) => {
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

export default ContentBlock;
