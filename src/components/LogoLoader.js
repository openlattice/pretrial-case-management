/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const KeyFrames = keyframes`
  0%{
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-45deg);
    opacity: 0.75;
  }
  100%{
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }
`;

const Ellipse = styled.div`
  display: block;
  border-radius: 50%;
  transform-origin: center;
  transform: rotate(-45deg);
  width: ${props => (props.size ? props.size : 50)}px;
  height: ${props => (props.size ? (props.size * 0.5) : 25)}px;
  border-radius: 500px;
  background: #b898ff;
  opacity: 0;

  animation: ${KeyFrames} 3s ease-in-out 3s infinite;
  animation-delay: 0.3s;
`;

const EllipseTop = styled(Ellipse)`
  animation-delay: 0.6s;
`;

const EllipseBottom = styled(Ellipse)`
  animation-delay: 0s;
`;


const LoadingText = styled.div`
  margin-top: 30px;
  width: 100%;
  font-size: 16px;
  text-align: center;
  width: 100%;
  margin-bottom: 20%;
`;

const Container = styled.div`
  width: 100%;
  min-height: ${props => (props.size ? (props.size * 1.5) : 75)}px;
  margin-top: 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type Props = {
  loadingText :string,
  size :number
}

const LogoLoader = ({ size, loadingText } :Props) => (
  <>
    <Container>
      <EllipseTop size={size} />
      <Ellipse size={size} />
      <EllipseBottom size={size} />
    </Container>
    { loadingText ? <LoadingText size={size}>{loadingText}</LoadingText> : null }
  </>
);

export default LogoLoader;
