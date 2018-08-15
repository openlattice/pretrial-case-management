import styled from 'styled-components';

import { BOND_TYPES } from '../../utils/consts/ReleaseConditionConsts';

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 30px;
  border-bottom: 1px solid #e1e1eb;
`;

export const OptionsGrid = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: ${props => (`repeat(${props.numColumns}, 1fr)`)};
  grid-gap: 20px;
`;

export const Row = styled.div`
  ${(props) => {
    switch (props.type) {
      case BOND_TYPES.CASH_ONLY:
        return (
          `margin-left: 25%;
           width: 25%;
           input {
             transform: translateY(-50%);
             }`
        );
      case BOND_TYPES.CASH_SURETY:
        return (
          `margin-left: 50%;
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
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

export const Dollar = styled.div`
  color: #8e929b;
  width: fit-content;
  z-index: 1;
  transform: translateX(100%) translateY(50%);
`;
