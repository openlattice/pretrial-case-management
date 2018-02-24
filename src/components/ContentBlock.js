/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const StyledContentBlock = styled.div`
  display: flex;
  flex-direction: ${props => (props.vertical ? 'column' : 'row')};
  margin-bottom: ${props => (props.vertical ? '20px' : '10px')};
`;

const StyledContentLabel = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
  margin-right: 6px;
`;

const StyledContent = styled.div`
  font-size: 16px;
  word-wrap: break-word;
`;

type Props = {
  contentBlock :{
    label :string,
    content :{
      line :string
    }[]
  },
  vertical? :boolean
};

const ContentBlock = ({ contentBlock, vertical } :Props) => {
  const label = vertical ? contentBlock.label : `${contentBlock.label}:`;

  return (
    <StyledContentBlock vertical={vertical}>
      <StyledContentLabel>{label}</StyledContentLabel>
      { contentBlock.content.map(line => <StyledContent key={line}>{line}</StyledContent>) }
    </StyledContentBlock>
  );
};

ContentBlock.defaultProps = {
  vertical: false
};

export default ContentBlock;
