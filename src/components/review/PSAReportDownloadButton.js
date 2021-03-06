/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import DropdownButton from '../buttons/DropdownButton';

const DownloadButtonContainer = styled.div`
  width: max-content;
  height: 100%;
  display: flex;
  align-items: center !important;
  justify-content: flex-end;
`;

export default ({
  downloadFn,
  neighbors,
  scores,
  includesPretrialModule
} :props) => {
  const downloadRow = (e, isCompact) => {
    e.stopPropagation();
    downloadFn({ neighbors, scores, isCompact });
  };

  const options = [
    {
      label: 'Export compact version',
      onClick: (e) => downloadRow(e, true)
    }
  ];

  const fullVersionExport = {
    label: 'Export full version',
    onClick: (e) => downloadRow(e, false)
  };

  if (includesPretrialModule) options.push(fullVersionExport);

  return (
    <DownloadButtonContainer>
      <DropdownButton
          title="PDF Report"
          options={options} />
    </DownloadButtonContainer>
  );
};
