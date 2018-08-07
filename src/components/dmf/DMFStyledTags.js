/*
 * @flow
 */
import styled from 'styled-components';

export const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

export const StepHeader = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 30px 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

export const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 0 30px 30px;
  img {
    margin: 24.5px;
  }
`;
