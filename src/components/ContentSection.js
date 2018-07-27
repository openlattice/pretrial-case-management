import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { StyledContentItalic } from '../utils/Layout';

const StyledSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
`;

const StyledContentBlockWrapper = styled.div`
  width: 100%;
  display: grid;
  ${(props) => {
    switch (props.component) {
      case 'summary':
        return (
          `grid-template-columns: 50% 50%;
           grid-auto-rows: min-content;
           grid-row-gap: 15px;`
        );
      case 'FormContainer':
        return (
          `grid-template-columns: 50% 50%;
           grid-auto-rows: min-content;
           grid-row-gap: 15px;`
        );
      default:
        return (
          `grid-template-columns: 24% 24% 24% 28%;
           grid-auto-rows: min-content;
           grid-row-gap: 20px;`
        );
    }
  }};
`;

const StyledSectionHeader = styled.div`
  height: ${props => (props.renderHeader ? 'auto' : '0px')};
  visibility: ${props => (props.renderHeader ? 'auto' : 'hidden')};
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  color: #555e6f;
  ${(props) => {
    switch (props.component) {
      case 'summary':
        return (
          `padding: 0px 30px 0px 30px;
           margin-bottom: -10px;
           font-size: 16px;
          `
        );
      case 'FormContainer':
        return (
          `padding: 10px 30px 30px 0px;
           font-size: 18px;
           font-weight: normal;`
        );
      default:
        return (
          `padding: 30px;
           border-bottom: solid 1px #e1e1eb;
           font-size: 22px;`
        );
    }
  }};
`;
const StyledSectionBottomBarWrapper = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  color: #727272;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  ${(props) => {
    switch (props.component) {
      case 'summary':
        return (
          'padding: 30px 0px 0px 30px;'
        );
      case 'FormContainer':
        return (
          `padding: 0px;
           justify-content: none;`
        );
      default:
        return (
          'padding: 30px;'
        );
    }
  }};

  img {
    margin-right: 50px;
  }
`;


const ContentSection = ({
  component,
  header,
  photo,
  firstName,
  middleName,
  lastName,
  ...props
}) => {
  const renderContent = () => {
    if (props.children) {
      return props.children;
    }

    return <StyledContentItalic>Information not available</StyledContentItalic>;
  };

  const renderPhoto = photo ? <img src={photo} alt="presentation" /> : null;
  const renderHeader = header || null;

  return (
    <StyledSection>
      <StyledSectionHeader renderHeader component={component}>{renderHeader}</StyledSectionHeader>
      <StyledSectionBottomBarWrapper component={component}>
        {renderPhoto}
        <StyledContentBlockWrapper component={component}>
          { renderContent() }
        </StyledContentBlockWrapper>
      </StyledSectionBottomBarWrapper>
    </StyledSection>
  );
};

ContentSection.propTypes = {
  children: PropTypes.node.isRequired
};

export default ContentSection;
