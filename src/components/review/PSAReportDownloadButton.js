/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';


import DropdownButton from '../buttons/DropdownButton';

const DownloadButtonContainer = styled.div`
  width: min-content;
  height: 100%;
  display: flex;
  align-items: center !important;
  justify-content: flex-end;
`;

export default ({ downloadFn, neighbors, scores } :props) => {
  const downloadRow = (e, isCompact) => {
    e.stopPropagation();
    downloadFn({ neighbors, scores, isCompact });
  };

  return (
    <DownloadButtonContainer>
      <DropdownButton
          title="PDF Report"
          options={[{
            label: 'Export compact version',
            onClick: e => downloadRow(e, true)
          }, {
            label: 'Export full version',
            onClick: e => downloadRow(e, false)
          }]} />
    </DownloadButtonContainer>
  );
};
