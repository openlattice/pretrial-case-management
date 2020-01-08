/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

import { OL } from '../utils/consts/Colors';

const KeyFrames = keyframes`
  0%{;
    opacity: 1;
  }
  
  50% {
    opacity: 1;
  }

  100%{
    opacity: 0;
  }
`;

const Banner = styled.div`
  font-size: 16px;
  color: ${OL.WHITE};
`;

const Container = styled.div`
  opacity: 0;
  bottom: 30px;
  left: 16px;
  padding: 5px 15px;
  text-align: center;
  background: ${OL.PURPLE03};
  position: fixed;
  border-radius: 65px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;

  animation: ${KeyFrames} {
    3s linear 0s 1;
  }
`;

const WelcomeBanner = ({ organization, tool } :Props) => {
  const banner = (organization && tool)
    ? (
      <Container key={`Welcome to ${organization} ${tool}`}>
        <Banner>{`Welcome to ${organization} ${tool}`}</Banner>
      </Container>
    ) : null;
  return banner;
};

export default WelcomeBanner;
