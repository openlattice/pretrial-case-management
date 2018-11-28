/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import CONTENT_CONSTS from '../utils/consts/ContentConsts';
import { FullWidthContainer, PersonPicture, PersonMugshot } from '../utils/Layout';
import { OL } from '../utils/consts/Colors';

const StyledSection = styled(FullWidthContainer)`
  flex-wrap: wrap;
`;

const StyledContentBlockWrapper = styled.div`
  width: 100%;
  display: grid;
  ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.SUMMARY:
        return (
          `grid-template-columns: 25% 25% 25% 25%;
           grid-auto-rows: min-content;
          `
        );
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
      case CONTENT_CONSTS.HEARINGS:
        return (
          `grid-template-columns: 32% 32% 32%;
           grid-auto-rows: min-content;
           grid-column-gap: 2%;
           grid-row-gap: 20px;
           :nth-last-child(4) {
             justify-content: flex-end;
           }`
        );
      case CONTENT_CONSTS.CREATING_HEARING:
        return (
          `grid-template-columns: 32% 32% 32%;
           grid-auto-rows: min-content;
           grid-column-gap: 2%;
           grid-row-gap: 20px;
           :nth-last-child(4) {
             justify-content: flex-end;
           }`
        );
      case CONTENT_CONSTS.HEARING_CARD:
        return (
          `grid-template-columns: repeat(3, 1fr);
           grid-auto-rows: min-content;
           grid-column-gap: 2%;
           grid-row-gap: 20px;
           :nth-last-child(4) {
             justify-content: flex-end;
           }`
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
  color: ${OL.GREY01};
  ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.SUMMARY:
        return (
          `padding: 0 30px 0 30px;
           margin-bottom: -10px;
           font-size: 16px;
          `
        );
      case CONTENT_CONSTS.ARREST:
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
           border-bottom: solid 1px ${OL.GREY11};
           font-size: 22px;`
        );
      case CONTENT_CONSTS.HEARINGS:
        return (
          `padding: 30px 0 0 50px;
           font-size: 16px;`
        );
      case CONTENT_CONSTS.CREATING_HEARING:
        return (
          `padding-left: 15px;
           font-size: 16px;`
        );
      case `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}`:
        return (
          `padding: 0 0 30px 30px;
           margin-bottom: -10px;
           font-size: 16px;
          `
        );
      default:
        return (
          `padding: 30px;
           font-size: 22px;`
        );
    }
  }};
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
      case CONTENT_CONSTS.SUMMARY:
        return (
          'padding: 30px 0 0 30px;'
        );
      case CONTENT_CONSTS.PROFILE:
        return (
          `padding: 30px;
           img {
             margin-right: 50px;
           }`
        );
      case CONTENT_CONSTS.HEARINGS:
        return (
          'padding: 30px 50px 0 50px;'
        );
      case CONTENT_CONSTS.CREATING_HEARING:
        return (
          'padding: 30px 50px 0 15px;'
        );
      case `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}`:
        return (
          'padding: 0 30px 0 30px;'
        );
      case CONTENT_CONSTS.HEARING_CARD:
        return (
          `padding: 0;
           margin-bottom: 0;`
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
  ${props => (props.modifyingHearing ? 'padding-top: 8px;' : '')}
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
