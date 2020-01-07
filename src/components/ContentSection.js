/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import CONTENT_CONSTS from '../utils/consts/ContentConsts';
import { FullWidthContainer, PersonPicture, PersonMugshot } from '../utils/Layout';
import { OL } from '../utils/consts/Colors';
import {
  getComputedHeaderStyle,
  getComputedTopWrapperStyle,
  getComputedBottomWrapperStyle
} from '../utils/ContentSectionUtils';

const StyledSection = styled(FullWidthContainer)`
  flex-wrap: wrap;
`;

const StyledContentBlockWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-auto-rows: min-content;
  ${getComputedTopWrapperStyle};
`;

const StyledSectionHeader = styled.div`
  height: ${(props) => (props.renderHeader ? 'auto' : '0')};
  visibility: ${(props) => (props.renderHeader ? 'auto' : 'hidden')};
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  color: ${OL.GREY01};
  ${getComputedHeaderStyle};
`;
const StyledSectionBottomBarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  color: ${OL.GREY26};
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  ${getComputedBottomWrapperStyle};
  ${(props) => (props.modifyingHearing ? 'padding-top: 8px;' : '')}
`;

const PersonPhoto = styled.img`
  width: 120px;
  height: auto;
`;


const ContentSection = ({
  component,
  header,
  photo,
  firstName,
  middleName,
  lastName,
  modifyingHearing,
  ...props
} :Props) => {
  const { children } = props;
  const renderContent = () => {
    if (children) {
      return children;
    }

    return <StyledSectionHeader>Information not available</StyledSectionHeader>;
  };

  const renderHeader = header || null;
  let renderPhoto;
  if (!photo) {
    renderPhoto = null;
  }
  else if (component === CONTENT_CONSTS.SUMMARY) {
    renderPhoto = (
      <PersonMugshot>
        <PersonPicture src={photo} alt="" />
      </PersonMugshot>
    );
  }
  else {
    renderPhoto = <PersonPhoto src={photo} alt="" />;
  }

  return (
    <StyledSection>
      {
        renderHeader
          ? <StyledSectionHeader renderHeader component={component}>{renderHeader}</StyledSectionHeader>
          : null
      }
      <StyledSectionBottomBarWrapper component={component} modifyingHearing={modifyingHearing}>
        {renderPhoto}
        <StyledContentBlockWrapper component={component}>
          { renderContent() }
        </StyledContentBlockWrapper>
      </StyledSectionBottomBarWrapper>
    </StyledSection>
  );
};

export default ContentSection;
