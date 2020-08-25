import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

export const PersonCardWrapper = styled.div`
  width: 410px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const DetailsWrapper = styled.div`
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  width: 300px;
`;

export const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  position: relative;

  h1 {
    font-size: 11px;
    font-weight: 600;
    color: ${OL.GREY02};
    text-transform: uppercase;
  }

  div {
    font-size: 14px;
    color: ${OL.GREY15};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
