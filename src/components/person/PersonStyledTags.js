import styled from 'styled-components';

export const Wrapper = styled.div`
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

export const StyledTooltip = styled.div`
  visibility: hidden;
  position: absolute;
  z-index: 1;
  bottom: -40px;
  left: 15%;
  border-radius: 5px;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  background-color: #f9f9fd;
  border: solid 1px #dcdce7;
  max-width: 320px;
  width: max-content;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #2e2e34;
  padding: 8px 15px;
  white-space: normal !important;
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  position: relative;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #2e2e34;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover ${StyledTooltip} {
    visibility: visible;
  }
`;
