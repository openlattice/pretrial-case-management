import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 32px;
  position: relative;
`;

const Bar = styled.div`
  width: 100%;
  height: 100%;
  background-color: #dcdce7;
  position: absolute;
`;

const Fill = styled.div`
  background-color: #8045ff;
  color: #ffffff;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  height: 100%;
  left: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.progress}%;
  -webkit-transition: width 1s ease;
  -moz-transition: width 1s ease;
  -o-transition: width 1s ease;
  transition: width 1s ease;
`;

const ProgressBar = ({ progress }) => {
  const label = !progress ? '' : `${progress}%`;

  return (
    <Wrapper>
      <Bar />
      <Fill progress={progress}>{label}</Fill>
    </Wrapper>
  );
};

export default ProgressBar;
