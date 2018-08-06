/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import CONTENT_CONSTS from '../utils/consts/ContentConsts';
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
      case CONTENT_CONSTS.DMF:
        return (
          `grid-template-columns: 20% 20% 20% 20% 20%;
           grid-auto-rows: min-content;
           grid-row-gap: 15px;
           margin-bottom: 30px;`
        );
      case CONTENT_CONSTS.PROFILE:
        return (
          `grid-template-columns: 24% 24% 24% 28%;
           grid-auto-rows: min-content;
           grid-row-gap: 20px;`
        );
      default:
        return (
          `grid-template-columns: 50% 50%;
           grid-auto-rows: min-content;
           grid-row-gap: 15px;`
        );
    }
  }};
`;

const StyledSectionHeader = styled.div`
  height: ${props => (props.renderHeader ? 'auto' : '0')};
  visibility: ${props => (props.renderHeader ? 'auto' : 'hidden')};
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  color: #555e6f;
  ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.SUMMARY:
        return (
          `padding: 0 30px 0 30px;
           margin-bottom: -10px;
           font-size: 16px;
          `
        );
      case CONTENT_CONSTS.FORM_CONTAINER:
        return (
          `padding: 10px 30px 30px 0;
           font-size: 18px;
           font-weight: normal;`
        );
      case CONTENT_CONSTS.DMF:
        return (
          `padding: 30px 30px 0 30px;
           font-size: 16px;
           font-weight: 600;`
        );
      case CONTENT_CONSTS.PROFILE:
        return (
          `padding: 30px;
           border-bottom: solid 1px #e1e1eb;
           font-size: 22px;`
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
      case CONTENT_CONSTS.FORM_CONTAINER:
        return (
          `padding: 0;
           justify-content: none;
           img {
             margin-right: 20px;
           }`
        );
      case CONTENT_CONSTS.PROFILE:
        return (
          `padding: 30px;
           img {
             margin-right: 50px;
           }`
        );
      default:
        return (
          `padding: 30px 0 0 30px;
           img {
             margin-right: 20px;
           }`
        );
    }
  }};
`;


const ContentSection = ({
  component,
  header,
  photo,
  firstName,
  middleName,
  lastName,
  ...props
} :Props) => {
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

export default ContentSection;
