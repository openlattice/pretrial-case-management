import React from 'react';
import styled from 'styled-components';

import noPersonIcon from '../../assets/svg/no-person-icon.svg';
import { OL } from '../../utils/consts/Colors';

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  div {
    margin-top: 20px;
    font-size: 16px;
    font-weight: 600;
    color: ${OL.GREY02};
  }
`;

const NoSearchResults = () => (
  <NoResultsContainer>
    <img src={noPersonIcon} alt="" />
    <div>No person found.</div>
  </NoResultsContainer>
);

export default NoSearchResults;
