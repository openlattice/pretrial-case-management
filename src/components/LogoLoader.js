/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

import { OL } from '../utils/consts/Colors';


const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: ${(props) => (props.noPadding ? 'none' : '20%')};
  min-height: ${(props) => (props.size ? (props.size * 1.5) : 75)}px;
  width: 100%;
`;

const KeyFrames = keyframes`
  0% {
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }

  50% {
    transform: scale(1.2) rotate(-45deg);
    opacity: 0.75;
  }

  100% {
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  margin-bottom: 20%;
  margin-top: 30px;
  text-align: center;
  width: 100%;
`;

/* Elispses */

const Ellipse = styled.div`
  animation: ${KeyFrames} 3s ease-in-out 3s infinite;
  animation-delay: 0.3s;
  background: ${OL.PURPLE04};
  border-radius: 500px;
  display: block;
  height: ${(props) => (props.size ? (props.size * 0.5) : 25)}px;
  opacity: 0;
  transform: rotate(-45deg);
  transform-origin: center;
  width: ${(props) => (props.size ? props.size : 50)}px;
`;

const EllipseBottom = styled(Ellipse)`
  animation-delay: 0s;
`;

const EllipseTop = styled(Ellipse)`
  animation-delay: 0.6s;
`;

type Props = {
  loadingText :string;
  noPadding :boolean;
  size :number;
}

const LogoLoader = ({ size, loadingText, noPadding } :Props) => (
  <>
    <Container>
      <EllipseTop size={size} />
      <Ellipse size={size} />
      <EllipseBottom size={size} />
    </Container>
    { loadingText ? <LoadingText size={size} noPadding={noPadding}>{loadingText}</LoadingText> : null }
  </>
);

export default LogoLoader;
