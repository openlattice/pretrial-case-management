/*
 * @flow
 */

import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

export const InputRow = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: ${(props) => (props.numColumns ? `repeat(${props.numColumns}, 1fr)` : props.other)};
  grid-gap: 15px;
`;

export const FormSection = styled.div`
  width: 100%;
  padding: 20px 30px;
  border-bottom: 1px solid ${OL.GREY11};

  &:last-child {
    margin-bottom: -30px;
    border-bottom: none;
  }
`;

export const HeaderSection = styled(FormSection)`
  padding-top: 0;
  margin-top: -10px;
  margin-bottom: 15px;
`;

export const ButtonGroup = styled.div`
  display: inline-flex;
  width: 300px;
  justify-content: space-between;

  button {
    width: 140px;
  }
`;

export const InputGroup = styled.div`
  width: ${(props) => props.width};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 15px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
`;

export const InputLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: ${OL.GREY01};
  margin-bottom: 10px;
`;

export const PaddedRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

export const UnpaddedRow = styled(PaddedRow)`
  margin: 0;
`;

export const SubRow = styled(PaddedRow)`
  justify-content: flex-start;
  align-items: flex-end;
  margin: 0;
`;

export const Header = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
`;

export const SubHeader = styled(Header)`
  font-size: 16px;
  margin-top: 15px;
`;
