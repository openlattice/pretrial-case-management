/*
 * @flow
 */
/* eslint-disable import/prefer-default-export */

import styled from 'styled-components';
import { OL } from '../utils/consts/Colors';

export const InstructionalText = styled.div`
  color: ${OL.GREY01};
  font-weight: 600;
  font-size: 26px;
  line-height: 34px;
  margin-bottom: 15px;
  text-align: left;
`;

export const InstructionalSubText = styled.div`
  color: ${OL.GREY40};
  font-size: 16px;
  line-height: 21px;
  margin-bottom: 25px;
  text-align: left;
`;

export const TitleLabel = styled.div`
  color: ${OL.GREY03};
  display: block;
  font-size: 14px;
  font-weight: ${(props :Object) => (props.light ? 'lighter' : 'normal')};
  margin-bottom: 20px;
`;
