/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import DropdownButton from '../buttons/DropdownButton';

const DownloadButtonContainer = styled.div`
  width: max-content;
  height: 100%;
  display: flex;
  align-items: center !important;
  justify-content: flex-end;
`;

type Props = {
  downloadFn :(args :{}) => void;
  neighbors :Map;
  scores :Map;
  includesPretrialModule :boolean;
};

export default ({
  downloadFn,
  neighbors,
  scores,
  includesPretrialModule
} :Props) => {
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
