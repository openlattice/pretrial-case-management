/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import RequiresActionPersonRow from '../../containers/people/RequiresActionPersonRow';

type Props = {
  selectedPersonId :string,
  handleSelect :() => void;
  people :Map<*, *>
};

const HEADERS = [
  { key: 'lastName', label: 'Last Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'oldPSADate', label: 'PSA Date (oldest)' },
];

const ReleaseConditionsTable = ({
  handleSelect,
  people,
  selectedPersonId,
} :Props) => {

  const components :Object = {
    Row: ({ data } :any) => (
      <RequiresActionPersonRow
          selectedPersonId={selectedPersonId}
          handleSelect={handleSelect}
          data={data} />
    )
  };

  return (
    <Table
        components={components}
        headers={HEADERS}
        data={people}
        paginated
        rowsPerPageOptions={[10, 15, 20]} />
  );
};

export default ReleaseConditionsTable;
