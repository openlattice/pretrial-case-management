import React from 'react';
import styled from 'styled-components';

import noPersonIcon from '../../assets/svg/no-person-icon.svg';

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  div {
    margin-top: 20px;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #8e929b;
  }
`;

const NoSearchResults = () => (
  <NoResultsContainer>
    <img src={noPersonIcon} role="presentation" />
    <div>No person found.</div>
  </NoResultsContainer>
);

export default NoSearchResults;
