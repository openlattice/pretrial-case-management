/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const Wrapper = styled.div`
  width: 100%;
  height: 32px;
  position: relative;
`;

const Bar = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${OL.GREY05};
  position: absolute;
`;

const Fill = styled.div`
  background-color: ${OL.PURPLE03};
  color: ${OL.WHITE};
  font-size: 13px;
  font-weight: 600;
  height: 100%;
  left: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props :Object) => props.progress}%;
  transition: width 0.5s ease;
`;

type Props = {
  progress :number;
}

const ProgressBar = ({ progress } :Props) => {
  const label = !progress ? '' : `${progress}%`;

  return (
    <Wrapper>
      <Bar />
      <Fill progress={progress}>{label}</Fill>
    </Wrapper>
  );
};

export default ProgressBar;
