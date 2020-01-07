import styled from 'styled-components';

import { BOND_TYPES } from '../../utils/consts/ReleaseConditionConsts';
import { OL } from '../../utils/consts/Colors';


export const Dollar = styled.div`
  color: ${OL.GREY02};
  transform: translateX(100%) translateY(50%);
  width: fit-content;
  z-index: 1;
`;

export const NoContactRow = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 1fr 2fr 1fr;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: ${(props) => (`repeat(${props.numColumns}, 1fr)`)};
  margin-top: 20px;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 0 10px;
  /* stylelint-disable-next-line declaration-colon-newline-after */
  ${(props) => {
    switch (props.type) {
      case BOND_TYPES.CASH_ONLY:
        return (
          `margin-left: 25%;
           margin-bottom: -15px;
           width: 25%;
           input {
             transform: translateY(-50%);
             }`
        );
      case BOND_TYPES.CASH_SURETY:
        return (
          `margin-left: 50%;
           margin-bottom: -15px;
           width: 25%;
           input {
             transform: translateY(-50%);
             }`
        );
      default:
        return (
          'width: 100%'
        );
    }
  }};
`;

export const RowWrapper = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  display: flex;
  flex-direction: column;
  padding: 30px 30px;
`;

export const SubConditionsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  hr {
    margin: 20px 0 20px;
  }
`;
