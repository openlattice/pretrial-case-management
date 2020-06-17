/*
 * @flow
 */
import React from 'react';
import { Table } from 'lattice-ui-kit';

import AgencyRow from './AgencyRow';

export const HEADERS = [
  { key: 'name', label: 'Name' },
  { key: 'abbreviation', label: 'Abbreviation' },
  { key: 'delete', label: '', cellStyle: { width: '100px' } }
];

const rowsPerPageOptions = [5, 10, 15];

type Props = {
  agencies :Object[];
  deleteFn :(agencyEKID :UUID) => void;
  editing :boolean;
  loading :boolean;
};

const RemindersTable = ({
  agencies,
  deleteFn,
  editing,
  loading
} :Props) => {

  const components :Object = {
    Row: ({ data } :Object) => (
      <AgencyRow data={data} deleteFn={deleteFn} editing={editing} />
    )
  };

  return (
    <Table
        components={components}
        isLoading={loading}
        headers={HEADERS}
        paginated
        rowsPerPageOptions={rowsPerPageOptions}
        data={agencies} />
  );
};

export default RemindersTable;
