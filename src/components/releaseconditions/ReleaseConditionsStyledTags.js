import styled from 'styled-components';

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
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;
