/*
 * @flow
 */
import styled from 'styled-components';

import { FullWidthContainer } from '../../utils/Layout';

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

export const StepIncreaseWrapper = styled(FullWidthContainer)`
  padding: 10px 30px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-top: solid 1px #eeeeee;
`;

export const StyledSection = styled.div`
  width: 40%;
  padding-left: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Flags = styled(StyledSection)`
  width: 59%;
  padding: 0;
  align-content: center;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40px 40px 40px;
  border-right: solid 1px #eeeeee;
`;

export const StyledContentBlock = styled(FullWidthContainer)`
  flex-direction: row;
  align-items: center;
`;

export const StyledContentLabel = styled.div`
  width: 66%;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  display: flex;
  text-transform: uppercase;
  align-items: center;
  color: #8e929b;
  font-size: 12px;
`;

export const StyledContent = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: #2e2e34;
  font-size: 16px;
`;

export const DMFIncreaseText = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  font-size: 18px;
  color: black;
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  span {
    font-size: 12px;
  }
`;

export const DMFIncreaseCell = styled.div`
  display: flex;
  flex-direction: row;
  img {
    margin: 3px;
  }
`;
