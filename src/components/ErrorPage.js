/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartBroken } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../utils/consts/Colors';

const KeyFrames = keyframes`
  0%{
    transform: rotate(-40deg);
  }
  50% {
    transform: rotate(40deg);
  }
  100%{
    transform: rotate(-40deg);
  }
`;

const ErrorWrapper = styled.div`
  margin-top: 10%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  div {
    max-width: 750px;
    text-align: center;
  }
  svg {
    font-size: 150px;
    margin-bottom: 20px;

    animation: ${KeyFrames} 3s ease-in-out 3s infinite;
    animation-delay: 0.1s;
  }
`;

// eslint-disable-next-line max-len
const ERROR_MSG = 'Uh oh! Something went wrong. Contact OpenLattice support if you continue to experience this problem.';

const ErrorPage = () => {
  return (
    <ErrorWrapper>
      <FontAwesomeIcon color={OL.PURPLE05} icon={faHeartBroken} />
      <div>{ERROR_MSG}</div>
    </ErrorWrapper>
  );
};

export default ErrorPage;
