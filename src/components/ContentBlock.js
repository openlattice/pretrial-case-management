import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledContentBlock = styled.div`
  display: flex;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  margin-bottom: ${props => props.vertical ? '20px' : '10px'};
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


const ContentBlock = ({ contentBlock, vertical }) => {
  const label = vertical ? contentBlock.label : `${contentBlock.label}:`;

  return (
    <StyledContentBlock vertical={vertical}>
      <StyledContentLabel>{label}</StyledContentLabel>
      {
        contentBlock.content.map((line) => {
          return <StyledContent key={line}>{line}</StyledContent>;
        })
      }
    </StyledContentBlock>
  );
};

ContentBlock.propTypes = {
  contentBlock: PropTypes.shape({
    label: PropTypes.string.isRequired,
    content: PropTypes.arrayOf(PropTypes.string).isRequired
  }),
  vertical: PropTypes.bool.isRequired
}

export default ContentBlock;
