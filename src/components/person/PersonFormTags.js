/*
 * @flow
 */

import styled from 'styled-components';
import InfoButton from '../buttons/InfoButton';

import { OL } from '../../utils/consts/Colors';

export const ButtonGroup = styled.div`
  display: inline-flex;
  justify-content: space-between;
  width: 300px;

  button {
    width: 140px;
  }

  ${InfoButton} {
    padding: 0;
  }
`;

export const FormSection = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 20px 30px;
  width: 100%;

  &:last-child {
    border-bottom: none;
    margin-bottom: -30px;
  }
`;

export const Header = styled.div`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
`;

export const HeaderSection = styled(FormSection)`
  margin-top: -10px;
  margin-bottom: 15px;
  padding-top: 0;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 15px;
  width: ${(props) => props.width};

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
`;

export const InputLabel = styled.span`
  color: ${OL.GREY01};
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  margin-bottom: 10px;
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.numColumns ? `repeat(${props.numColumns}, 1fr)` : props.other)};
  grid-gap: 15px;
  margin-top: 20px;
`;

export const PaddedRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 30px;
`;

export const SubHeader = styled(Header)`
  font-size: 16px;
  margin-top: 15px;
`;

export const SubRow = styled(PaddedRow)`
  align-items: flex-end;
  justify-content: flex-start;
  margin: 0;
`;

export const UnpaddedRow = styled(PaddedRow)`
  margin: 0;
`;
