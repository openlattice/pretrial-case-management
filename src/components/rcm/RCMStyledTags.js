/*
 * @flow
 */
/* stylelint-disable value-no-vendor-prefix */
/* stylelint-disable value-no-vendor-property */
/* stylelint-disable property-no-vendor-prefix */
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/pro-light-svg-icons';

import { OL } from '../../utils/consts/Colors';
import { FullWidthContainer } from '../../utils/Layout';

export const FLAG_DIMS = { height: 32, width: 156 };
export const SCALE_DIMS = { height: 28, width: 136 };

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
  color: ${OL.GREY01};
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
  border-top: solid 1px ${OL.GREY28};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 30px 30px;
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
  border-right: solid 1px ${OL.GREY28};
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
  color: ${OL.GREY02};
  font-size: 12px;
`;

export const StyledContent = styled.div`
  display: flex;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: ${OL.GREY15};
  font-size: 16px;
`;

export const RCMIncreaseText = styled.div`
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

export const CellContent = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const StyledCell = styled.td`
  padding: 5px 5px;
  text-align: ${(props :Object) => props.align || 'left'};
  word-wrap: break-word;
`;

export const IncreaseArrow = styled(FontAwesomeIcon).attrs({
  icon: faAngleRight,
  size: '3x'
})`
  color: ${OL.GREY02};
`;
