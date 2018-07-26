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
  margin-left: 50px;
  display: grid;
  grid-template-columns: 24% 24% 24% 28%;
  grid-auto-rows: min-content;
  grid-row-gap: 20px;
`;

const StyledSectionHeader = styled.div`
  padding: 30px;
  border-bottom: solid 1px #e1e1eb;
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #555e6f;
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
`;


const ContentSection = ({
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

  return (
    <StyledSection>
      <StyledSectionHeader>{firstName} {middleName} {lastName}</StyledSectionHeader>
      <StyledSectionBottomBarWrapper>
        <img src={photo} alt="presentation" />
        <StyledContentBlockWrapper>
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
