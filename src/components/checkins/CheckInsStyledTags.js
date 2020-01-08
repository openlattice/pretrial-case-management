
import styled from 'styled-components';
import { Card } from 'lattice-ui-kit';

import { OL } from '../../utils/consts/Colors';


export const StyledCard = styled(Card)`
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const TableHeader = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  font-size: 20px;
  line-height: 27px;
  padding: 30px;
`;

export const IconContainer = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${OL.GREY02};
  border-top: 1px solid ${OL.GREY05};
  svg {
    padding-bottom: 15px;
  }
`;
