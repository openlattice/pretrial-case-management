/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import { Table } from 'lattice-ui-kit';

import RequiresActionPersonRow from '../../containers/people/RequiresActionPersonRow';

type Props = {
  editing :boolean,
  selectedPersonId :string,
  handleSelect :() => void;
  people :Map<*, *>
};

const HEADERS = [
  { key: 'lastName', label: 'Last Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'mostRecentPSA', label: 'PSA Date (latest)' },
  { key: 'oldestPSA', label: 'PSA Date (oldest)' },
];

class ReleaseConditionsTable extends React.Component<Props, State> {

  render() {
    const {
      editing,
      handleSelect,
      people,
      selectedPersonId,
    } = this.props;

    const components :Object = {
      Row: ({ data } :any) => (
        <RequiresActionPersonRow
            selectedPersonId={selectedPersonId}
            editing={editing}
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
  }
}

export default ReleaseConditionsTable;
