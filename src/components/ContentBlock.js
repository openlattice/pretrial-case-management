/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import CONTENT_CONSTS from '../utils/consts/ContentConsts';
import { FullWidthContainer } from '../utils/Layout';
import { OL } from '../utils/consts/Colors';

const StyledContentBlock = styled(FullWidthContainer)`
  display: flex;
  flex-direction: column;
`;

const StyledContentLabel = styled.div`
  color: ${OL.GREY02};
  font-family: 'Open Sans', sans-serif;
  font-stretch: normal;
  font-style: normal;
  font-weight: 600;
  letter-spacing: normal;
  line-height: normal;
  text-transform: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.CREATING_HEARING:
        return 'none';
      default:
        return 'uppercase';
    }
  }};
  margin-bottom: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.CREATING_HEARING:
        return 5;
      default:
        return 0;
    }
  }}px;
  font-size: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.PROFILE:
        return 12;
      case CONTENT_CONSTS.HEARINGS:
        return 12;
      case CONTENT_CONSTS.CREATING_HEARING:
        return 14;
      default:
        return 11;
    }
  }}px;
`;

const StyledContent = styled.div`
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: ${OL.GREY15};
  font-size: ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.DMF:
        return 16;
      case CONTENT_CONSTS.PROFILE:
        return 18;
      case CONTENT_CONSTS.HEARINGS:
        return 18;
      case CONTENT_CONSTS.CREATING_HEARING:
        return 18;
      default:
        return 14;
    }
  }}px;
`;


const ContentBlock = ({ contentBlock, component } :Props) => {
  if (!contentBlock) {
    return null;
  }

  const { label } = contentBlock;

  const renderContent = () => {
    if (!contentBlock.content.length) {
      return <StyledContent>None</StyledContent>;
    }

    return (
      contentBlock.content.map((line, i) => (
        <StyledContent
            key={`${line}-${i}`}
            component={component}>
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
      <div>
        { renderContent() }
      </div>
    </StyledContentBlock>
  );
};

export default ContentBlock;
