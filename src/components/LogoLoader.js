/*
 * @flow
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

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

const Ellipse = styled.div`
  animation: ${KeyFrames} 3s ease-in-out 3s infinite;
  animation-delay: 0.3s;
  background: #b898ff;
  border-radius: 500px;
  display: block;
  height: ${(props :Object) => (`${props.size ? (props.size * 0.5) : 25}`)}px;
  opacity: 0;
  transform: rotate(-45deg);
  transform-origin: center;
  width: ${(props :Object) => (`${props.size ? props.size : 50}`)}px;
`;

const EllipseTop = styled(Ellipse)`
  animation-delay: 0.6s;
`;

const EllipseBottom = styled(Ellipse)`
  animation-delay: 0s;
`;

const LoadingText = styled.div`
  font-size: 16px;
  margin-bottom: 20%;
  margin-top: 30px;
  text-align: center;
  width: 100%;
`;

const Container = styled.div`
  width: 100%;
  min-height: ${(props :Object) => (`${props.size ? (props.size * 1.5) : 75}`)}px;
  margin-top: ${(props :Object) => (props.noPadding ? 'none' : '20%')};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type Props = {
  loadingText :string,
  size ?:number,
  noPadding ?:boolean
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

LogoLoader.defaultProps = {
  loadingText: '',
  noPadding: false,
  size: undefined
};

export default LogoLoader;
