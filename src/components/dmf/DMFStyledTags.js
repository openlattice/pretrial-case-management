/*
 * @flow
 */
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';
import { FullWidthContainer } from '../../utils/Layout';

/* Primary Components */
export const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

export const DMFIncreaseCell = styled.div`
  display: flex;
  flex-direction: row;

  img {
    margin: 3px;
  }
`;

export const DMFIncreaseText = styled.div`
  color: black;
  display: flex;
  flex-direction: column;
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
  text-transform: uppercase;
  width: 100%;

  span {
    font-size: 12px;
  }
`;

export const StepHeader = styled.div`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 30px 30px;
  width: 100%;
`;

export const StepWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0 30px 30px;

  img {
    margin: 24.5px;
  }
`;

export const StyledSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 30px;
  width: 40%;
`;

export const StyledContent = styled.div`
  align-items: center;
  color: ${OL.GREY15};
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: normal;
`;

export const StyledContentLabel = styled.div`
  align-items: center;
  color: ${OL.GREY02};
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  width: 66%;
`;

/* Secondary Components */

export const Flags = styled(StyledSection)`
  align-content: center;
  border-right: solid 1px ${OL.GREY28};
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40px 40px 40px;
  padding: 0;
  width: 59%;
`;

export const StepIncreaseWrapper = styled(FullWidthContainer)`
  padding: 10px 30px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-top: solid 1px ${OL.GREY28};
`;

export const StyledContentBlock = styled(FullWidthContainer)`
  align-items: center;
  flex-direction: row;
`;
